import crypto from 'crypto';
import { simpleParser } from 'mailparser';
import { createEmailTransporter, sendEmail } from './email';
import { ServerProfile } from './profiles';
import { escapeHtml, getBaseUrl, hmac, safeEqual } from './security';
import { appendToTab, readTab } from './sheetTabs';

// Conversations between members, and between members and listed teams.
//
// Every message is stored in the "Messages" tab and emailed to the recipient. Emails are sent with
// Reply-To set to BOTH the sender's real address (so replies reach them directly) and a capture
// address on the site's own mailbox (hello+r-<thread>-<signature>@firstmentor.org). The site reads
// the capture copies back in (syncInboundReplies) so email replies also appear in the inbox.

const MESSAGES_TAB = 'Messages';
const COLUMNS = 'A:N';

export type MessageKind = 'message' | 'connect-mentor' | 'connect-mentee' | 'reply';

export interface Party {
  email: string;
  name: string;   // person's name, or team label for listed teams
}

export interface StoredMessage {
  id: string;
  threadId: string;
  createdAt: string;
  from: Party;
  to: Party;
  subject: string;
  body: string;
  kind: MessageKind;
  via: 'site' | 'email';
  sourceMessageId: string;
}

function toRow(m: StoredMessage): string[] {
  return [m.id, m.threadId, m.createdAt, m.from.email, m.from.name, m.to.email, m.to.name, m.subject, m.body, m.kind, m.via, m.sourceMessageId];
}

function fromRow(r: string[]): StoredMessage {
  return {
    id: r[0] || '',
    threadId: r[1] || '',
    createdAt: r[2] || '',
    from: { email: r[3] || '', name: r[4] || '' },
    to: { email: r[5] || '', name: r[6] || '' },
    subject: r[7] || '',
    body: r[8] || '',
    kind: (r[9] as MessageKind) || 'message',
    via: r[10] === 'email' ? 'email' : 'site',
    sourceMessageId: r[11] || '',
  };
}

export async function getAllMessages(): Promise<StoredMessage[]> {
  return (await readTab(MESSAGES_TAB, COLUMNS)).map(fromRow).filter(m => m.id && m.threadId);
}

export async function storeMessages(messages: StoredMessage[]) {
  if (messages.length) await appendToTab(MESSAGES_TAB, messages.map(toRow), COLUMNS);
}

const newId = () => crypto.randomBytes(9).toString('base64url');
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function teamLabel(p: Pick<ServerProfile, 'program' | 'teamNumber' | 'teamName'>) {
  return [p.program, p.teamNumber ? `#${p.teamNumber}` : '', p.teamName].filter(Boolean).join(' ');
}

// How a recipient is shown in the inbox: a person's name, or the team(s) for a listed contact
export function partyFor(email: string, profiles: ServerProfile[]): Party {
  const person = profiles.find(p => !p.isListedTeam && (p.name || p.lastName));
  if (person) return { email, name: [person.name, person.lastName].filter(Boolean).join(' ') };
  const labels = profiles.map(teamLabel).filter(Boolean);
  return { email, name: labels.length > 1 ? `${labels[0]} (+${labels.length - 1} more)` : labels[0] || 'First Mentor team' };
}

// ---- Capture address for email replies ----

function captureAddress(threadId: string) {
  const [local, domain] = (process.env.EMAIL_USER || 'hello@firstmentor.org').split('@');
  return `${local}+r-${threadId}-${hmac(`reply:${threadId}`).slice(0, 10)}@${domain}`;
}

function threadIdFromAddress(address: string): string | null {
  const m = /\+r-([A-Za-z0-9_-]+)-([0-9a-f]{10})@/i.exec(address);
  if (!m) return null;
  return safeEqual(m[2].toLowerCase(), hmac(`reply:${m[1]}`).slice(0, 10)) ? m[1] : null;
}

// ---- Sending ----

const baseUrl = () => getBaseUrl() || 'http://localhost:3000';

export function signupUrlFor(profile: Pick<ServerProfile, 'id'>) {
  return `${baseUrl()}/signup?team=${encodeURIComponent(profile.id)}`;
}

function renderEmail(opts: {
  message: StoredMessage;
  senderDetails: string;
  recipientIsMember: boolean;
  listedTeams: ServerProfile[];
  greeting: string;
}) {
  const { message } = opts;
  const intro =
    message.kind === 'connect-mentor' ? `<p><strong>${escapeHtml(message.from.name)}</strong> would like to mentor you through First Mentor.</p>`
    : message.kind === 'connect-mentee' ? `<p><strong>${escapeHtml(message.from.name)}</strong> is looking for a mentor and would like to connect with you through First Mentor.</p>`
    : '';
  const inboxLink = `${baseUrl()}/inbox?thread=${encodeURIComponent(message.threadId)}`;
  const joinBlock = opts.listedTeams.length
    ? `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0 0 8px 0;">First Mentor is a free, volunteer-run site that connects FIRST teams with mentors. Your team is listed there.</p>
        <p style="margin:0 0 12px 0;">Create a free account to find mentors, update your team's listing, and keep your conversations in one place:</p>
        ${opts.listedTeams.slice(0, 10).map(p => `<p style="margin:4px 0;"><a href="${signupUrlFor(p)}" style="color:#2563eb;">Join as ${escapeHtml(teamLabel(p))}</a></p>`).join('')}
      </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#2563eb;color:#fff;padding:20px 24px;border-radius:10px 10px 0 0;">
        <p style="margin:0;font-size:14px;opacity:.9;">Message via First Mentor</p>
        <h1 style="margin:4px 0 0 0;font-size:20px;">${escapeHtml(message.subject)}</h1>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
        <p>${opts.greeting}</p>
        ${intro}
        <div style="margin:16px 0;">${escapeHtml(message.body).replace(/\r?\n/g, '<br>')}</div>
        <p style="margin-top:24px;">— ${escapeHtml(message.from.name)}${opts.senderDetails ? `<br><span style="color:#6b7280;font-size:14px;">${escapeHtml(opts.senderDetails)}</span>` : ''}</p>
        <p style="color:#6b7280;font-size:14px;">
          Reply to this email to respond to ${escapeHtml(message.from.name)}.
          ${opts.recipientIsMember ? `You can also <a href="${inboxLink}" style="color:#2563eb;">reply in your First Mentor inbox</a>.` : ''}
        </p>
        ${joinBlock}
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">
        This message was written by a First Mentor member and sent through First Mentor.
      </p>
    </body>
    </html>`;
}

export interface OutgoingRecipient {
  email: string;
  profiles: ServerProfile[];
}

// Sends one message (new conversation or reply) and records it.
export async function sendMessage(opts: {
  threadId?: string;
  from: Party;
  senderDetails: string;
  to: OutgoingRecipient;
  subject: string;
  body: string;
  kind: MessageKind;
  deferStore?: boolean; // bulk sends store all messages in one write afterwards
}) {
  const threadId = opts.threadId || newId();
  const message: StoredMessage = {
    id: newId(),
    threadId,
    createdAt: new Date().toISOString(),
    from: opts.from,
    to: partyFor(opts.to.email, opts.to.profiles),
    subject: opts.subject,
    body: opts.body,
    kind: opts.kind,
    via: 'site',
    sourceMessageId: '',
  };

  const person = opts.to.profiles.find(p => !p.isListedTeam && p.name);
  const greeting = person
    ? `Hi ${escapeHtml(person.name)},`
    : opts.to.profiles.length === 1 ? `Hello ${escapeHtml(teamLabel(opts.to.profiles[0]))},` : 'Hello,';
  const recipientIsMember = opts.to.profiles.some(p => !p.isListedTeam);

  await sendEmail({
    to: opts.to.email,
    subject: opts.kind === 'reply' && !/^re:/i.test(opts.subject) ? `Re: ${opts.subject}` : opts.subject,
    fromName: `${opts.from.name} via First Mentor`,
    replyTo: `${opts.from.email}, ${captureAddress(threadId)}`,
    html: renderEmail({
      message,
      senderDetails: opts.senderDetails,
      recipientIsMember,
      listedTeams: recipientIsMember ? [] : opts.to.profiles.filter(p => p.isListedTeam),
      greeting,
    }),
    headers: { 'X-First-Mentor-Thread': threadId },
  });
  if (!opts.deferStore) await storeMessages([message]);
  return message;
}

// ---- Reading ----

export interface ThreadSummary {
  threadId: string;
  subject: string;
  otherParty: string;
  lastMessage: { body: string; createdAt: string; fromMe: boolean };
  messageCount: number;
  startedByMe: boolean;
}

export function threadsFor(all: StoredMessage[], email: string): ThreadSummary[] {
  const byThread = new Map<string, StoredMessage[]>();
  for (const m of all) {
    if (!same(m.from.email, email) && !same(m.to.email, email)) continue;
    const list = byThread.get(m.threadId) || [];
    list.push(m);
    byThread.set(m.threadId, list);
  }
  return Array.from(byThread.entries())
    .map(([threadId, msgs]) => {
      msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const first = msgs[0];
      const last = msgs[msgs.length - 1];
      const other = same(first.from.email, email) ? first.to : first.from;
      return {
        threadId,
        subject: first.subject,
        otherParty: other.name,
        lastMessage: { body: last.body.slice(0, 160), createdAt: last.createdAt, fromMe: same(last.from.email, email) },
        messageCount: msgs.length,
        startedByMe: same(first.from.email, email),
      };
    })
    .sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt));
}

// Messages in a thread, only if the user is part of it
export function threadFor(all: StoredMessage[], threadId: string, email: string) {
  const msgs = all.filter(m => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!msgs.length || !msgs.some(m => same(m.from.email, email) || same(m.to.email, email))) return null;
  const first = msgs[0];
  const me = same(first.from.email, email) ? first.from : first.to;
  const other = same(first.from.email, email) ? first.to : first.from;
  return { messages: msgs, me, other, subject: first.subject };
}

// ---- Inbound email replies ----

// Turns a raw email into the reply text, without the quoted original message
export function extractReplyText(text: string) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] || '';
    if (/^\s*>/.test(line)) break;
    if (/^\s*On .+wrote:\s*$/.test(line) || /^\s*On .+/.test(line) && /wrote:\s*$/.test(next)) break;
    if (/^-{2,}\s*Original Message\s*-{2,}/i.test(line) || /^\s*From: .+/.test(line) && out.length > 0) break;
    out.push(line);
  }
  return out.join('\n').trim();
}

async function recordInboundEmail(raw: Buffer | string, existingSourceIds: Set<string>, all: StoredMessage[]) {
  const mail = await simpleParser(raw);
  const sourceId = mail.messageId || '';
  if (sourceId && existingSourceIds.has(sourceId)) return null;

  const addresses = [mail.to, mail.cc]
    .flatMap(a => (Array.isArray(a) ? a : a ? [a] : []))
    .flatMap(a => a.value.map(v => v.address || ''));
  const deliveredTo = mail.headers.get('delivered-to');
  if (deliveredTo) addresses.push(String(deliveredTo));
  const threadId = addresses.map(threadIdFromAddress).find(Boolean);
  if (!threadId) return null;

  const thread = all.filter(m => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!thread.length) return null;
  const first = thread[0];
  const fromAddress = mail.from?.value[0]?.address || '';

  // Work out which side of the conversation this reply came from. Listed teams sometimes reply
  // from a different address than the one they were contacted at, so anything not from the
  // conversation's starter is treated as coming from the other side.
  const fromStarter = same(fromAddress, first.from.email);
  const from = fromStarter ? first.from : { ...first.to };
  const to = fromStarter ? first.to : first.from;
  const body = extractReplyText(mail.text || '') || '(empty reply)';

  const message: StoredMessage = {
    id: newId(),
    threadId,
    createdAt: (mail.date || new Date()).toISOString(),
    from,
    to,
    subject: first.subject,
    body: body.slice(0, 10000),
    kind: 'reply',
    via: 'email',
    sourceMessageId: sourceId || newId(),
  };
  existingSourceIds.add(message.sourceMessageId);
  return message;
}

async function fetchInboundRawEmails(): Promise<(Buffer | string)[]> {
  const mode = process.env.INBOUND_EMAIL_MODE || (process.env.LOCAL_SHEET_FILE ? 'mailpit' : 'imap');

  if (mode === 'mailpit') {
    // Local testing: read "replies" from Mailpit, the local test inbox
    const api = process.env.MAILPIT_API_URL || 'http://mailpit:8025';
    const list = await fetch(`${api}/api/v1/messages?limit=500`).then(r => r.json());
    const ids: string[] = (list.messages || [])
      .filter((m: any) => (m.To || []).some((t: any) => /\+r-/.test(t.Address || '')))
      .map((m: any) => m.ID);
    return Promise.all(ids.map(id => fetch(`${api}/api/v1/message/${id}/raw`).then(r => r.text())));
  }

  if (mode === 'imap') {
    // Production: read the site's own mailbox (needs IMAP enabled for EMAIL_USER)
    const { ImapFlow } = await import('imapflow');
    const client = new ImapFlow({
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      secure: true,
      auth: { user: process.env.EMAIL_USER || '', pass: process.env.EMAIL_PASSWORD || '' },
      logger: false,
    });
    await client.connect();
    const raws: Buffer[] = [];
    const lock = await client.getMailboxLock('INBOX');
    try {
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const uids = (await client.search({ since }, { uid: true })) || [];
      const matching: number[] = [];
      for await (const msg of client.fetch(uids, { envelope: true }, { uid: true })) {
        const to = [...(msg.envelope?.to || []), ...(msg.envelope?.cc || [])].map(a => a.address || '');
        if (to.some(a => /\+r-/.test(a))) matching.push(msg.uid);
      }
      if (matching.length) {
        for await (const msg of client.fetch(matching, { source: true }, { uid: true })) {
          if (msg.source) raws.push(msg.source);
        }
      }
    } finally {
      lock.release();
      await client.logout();
    }
    return raws;
  }

  return [];
}

let lastSync = 0;
let syncing: Promise<void> | null = null;

// Pull email replies into conversations. Throttled; safe to call on every inbox load.
export async function syncInboundReplies({ force = false } = {}) {
  if (syncing) return syncing;
  if (!force && Date.now() - lastSync < 60_000) return;
  syncing = (async () => {
    try {
      const raws = await fetchInboundRawEmails();
      if (!raws.length) return;
      const all = await getAllMessages();
      const seen = new Set(all.map(m => m.sourceMessageId).filter(Boolean));
      const fresh: StoredMessage[] = [];
      for (const raw of raws) {
        const m = await recordInboundEmail(raw, seen, all);
        if (m) fresh.push(m);
      }
      await storeMessages(fresh);
    } catch (error) {
      console.error('Failed to sync email replies:', error instanceof Error ? error.message : error);
    } finally {
      lastSync = Date.now();
      syncing = null;
    }
  })();
  return syncing;
}

// Local testing only: send an email "reply" from the other side of a conversation to its
// capture address, as if they had replied from their email app.
export async function simulateEmailReply(threadId: string, fromEmail: string, body: string) {
  const transporter = createEmailTransporter(); // refuses anything but the local test server in local mode
  await transporter.sendMail({
    from: fromEmail,
    to: captureAddress(threadId),
    subject: 'Re: (simulated reply)',
    text: `${body}\n\nOn Mon, Jan 1, 2026 at 9:00 AM First Mentor <${process.env.EMAIL_USER}> wrote:\n> original message`,
  });
}

// Sender name and the details shown under their signature, from their account row
export function senderFromAccount(user: {
  email: string; firstName?: string; lastName?: string; teamNumber?: string; teamName?: string;
  universityName?: string; companyName?: string; affiliation?: string; state?: string; country?: string;
}) {
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'A First Mentor member';
  const details = [
    user.teamNumber || user.teamName ? `Team ${[user.teamNumber, user.teamName].filter(Boolean).join(' ')}` : '',
    user.universityName || user.companyName || user.affiliation || '',
    [user.state, user.country].filter((v, i, a) => v && a.indexOf(v) === i).join(', '),
  ].filter(Boolean).join(' · ');
  return { party: { email: user.email, name }, details };
}
