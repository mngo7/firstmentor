import { getGoogleSheetsClient } from './googleSheets';
import { getAllProfiles, isVisibleProfile, ServerProfile } from './profiles';
import { escapeHtml, hmac, safeEqual } from './security';

// Sending limits. Google Workspace allows ~2,000 emails per day per account, so the
// site-wide limit stays below that; the per-member limit keeps one person from using it all.
export const PER_MEMBER_DAILY_LIMIT = parseInt(process.env.MESSAGE_DAILY_LIMIT_PER_MEMBER || '100', 10);
export const SITE_DAILY_LIMIT = parseInt(process.env.MESSAGE_DAILY_LIMIT_SITE || '1500', 10);
export const MAX_SUBJECT_LENGTH = 150;
export const MAX_BODY_LENGTH = 5000;

const UNSUBSCRIBE_TAB = 'Unsubscribes';
const LOG_TAB = 'Message log';
const DAY_MS = 24 * 60 * 60 * 1000;

export interface RecipientFilters {
  audience: 'listed' | 'members' | 'all';
  programs: string[];      // e.g. ['FLL Challenge', 'FTC']; empty = any
  countries: string[];     // empty = any
  states: string[];        // empty = any
  memberRoles: string[];   // 'mentor' | 'mentee'; only applies to members; empty = any
  teamNumbers: string[];   // empty = any
}

const asStringList = (value: unknown, max = 200) =>
  (Array.isArray(value) ? value : [])
    .filter((v): v is string => typeof v === 'string')
    .map(v => v.trim())
    .filter(Boolean)
    .slice(0, max);

export function parseFilters(input: any): RecipientFilters {
  const audience = ['listed', 'members', 'all'].includes(input?.audience) ? input.audience : 'all';
  return {
    audience,
    programs: asStringList(input?.programs),
    countries: asStringList(input?.countries),
    states: asStringList(input?.states),
    memberRoles: asStringList(input?.memberRoles).filter(r => r === 'mentor' || r === 'mentee'),
    teamNumbers: asStringList(input?.teamNumbers, 500),
  };
}

function matches(profile: ServerProfile, f: RecipientFilters) {
  if (f.audience === 'listed' && !profile.isListedTeam) return false;
  if (f.audience === 'members' && profile.isListedTeam) return false;

  if (f.programs.length) {
    // Accounts can list several programs ("FTC, FRC")
    const programs = profile.program.split(',').map(p => p.trim().toLowerCase());
    if (!f.programs.some(p => programs.includes(p.toLowerCase()))) return false;
  }
  if (f.countries.length && !f.countries.some(c => c.toLowerCase() === profile.country.toLowerCase())) return false;
  if (f.states.length && !f.states.some(s => s.toLowerCase() === profile.state.toLowerCase())) return false;
  if (f.teamNumbers.length && !f.teamNumbers.includes(profile.teamNumber)) return false;

  if (f.memberRoles.length && !profile.isListedTeam) {
    const isMatch = (f.memberRoles.includes('mentor') && profile.isMentor) || (f.memberRoles.includes('mentee') && profile.isMentee);
    if (!isMatch) return false;
  }
  return true;
}

export interface Recipient {
  email: string;
  profiles: ServerProfile[]; // one contact can be listed for several teams
}

// Recipients matching the filters, one per email address, excluding the sender and anyone who unsubscribed
export async function findRecipients(filters: RecipientFilters, senderEmail: string) {
  const [profiles, unsubscribed] = await Promise.all([getAllProfiles(), getUnsubscribed()]);
  const sender = senderEmail.toLowerCase();
  const byEmail = new Map<string, Recipient>();
  let unsubscribedCount = 0;

  for (const profile of profiles) {
    if (!isVisibleProfile(profile) || !profile.email || !matches(profile, filters)) continue;
    const key = profile.email.toLowerCase();
    if (key === sender) continue;
    if (unsubscribed.has(key)) {
      unsubscribedCount++;
      continue;
    }
    const existing = byEmail.get(key);
    if (existing) existing.profiles.push(profile);
    else byEmail.set(key, { email: profile.email, profiles: [profile] });
  }
  return { recipients: Array.from(byEmail.values()), unsubscribedCount };
}

// ---- Unsubscribes ----

async function ensureTab(title: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
  if (!meta.data.sheets?.some(s => s.properties?.title === title)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
  }
}

async function readTab(title: string): Promise<string[][]> {
  const sheets = await getGoogleSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `'${title}'!A:E`,
    });
    return (res.data.values || []) as string[][];
  } catch {
    return []; // tab doesn't exist yet
  }
}

async function appendToTab(title: string, rows: string[][]) {
  await ensureTab(title);
  const sheets = await getGoogleSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `'${title}'!A:E`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

export async function getUnsubscribed(): Promise<Set<string>> {
  const rows = await readTab(UNSUBSCRIBE_TAB);
  return new Set(rows.map(r => (r[0] || '').trim().toLowerCase()).filter(e => e.includes('@')));
}

export async function addUnsubscribe(email: string) {
  const key = email.trim().toLowerCase();
  if ((await getUnsubscribed()).has(key)) return;
  await appendToTab(UNSUBSCRIBE_TAB, [[key, new Date().toISOString()]]);
}

export const unsubscribeToken = (email: string) => hmac(`unsubscribe:${email.trim().toLowerCase()}`).slice(0, 32);

export function verifyUnsubscribeToken(email: string, token: string) {
  return safeEqual(token, unsubscribeToken(email));
}

export function unsubscribeUrl(email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

// ---- Sending limits (based on the message log, so they survive restarts) ----

export async function getUsageToday(senderEmail: string) {
  const since = Date.now() - DAY_MS;
  const sender = senderEmail.toLowerCase();
  let mine = 0;
  let site = 0;
  for (const [timestamp, email, count] of await readTab(LOG_TAB)) {
    const time = Date.parse(timestamp || '');
    if (!time || time < since) continue;
    const n = parseInt(count || '0', 10) || 0;
    site += n;
    if ((email || '').toLowerCase() === sender) mine += n;
  }
  return {
    remaining: Math.max(0, Math.min(PER_MEMBER_DAILY_LIMIT - mine, SITE_DAILY_LIMIT - site)),
    perMemberLimit: PER_MEMBER_DAILY_LIMIT,
  };
}

export async function logMessage(senderEmail: string, recipientCount: number, subject: string, filters: RecipientFilters) {
  await appendToTab(LOG_TAB, [[new Date().toISOString(), senderEmail.toLowerCase(), String(recipientCount), subject, JSON.stringify(filters)]]);
}

// ---- Email content ----

export function signupUrlFor(profile: ServerProfile) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/signup?team=${encodeURIComponent(profile.id)}`;
}

export function renderMessageEmail(opts: {
  senderName: string;
  senderDetails: string;
  subject: string;
  body: string;
  recipient: Recipient;
}) {
  const { recipient } = opts;
  const listed = recipient.profiles.filter(p => p.isListedTeam);
  const teamLabel = (p: ServerProfile) => escapeHtml([p.program, p.teamNumber ? `#${p.teamNumber}` : '', p.teamName].filter(Boolean).join(' '));
  const person = recipient.profiles.find(p => p.name);
  const greeting = person
    ? `Hi ${escapeHtml(person.name)},`
    : recipient.profiles.length === 1
      ? `Hello ${teamLabel(recipient.profiles[0])},`
      : 'Hello,';
  const bodyHtml = escapeHtml(opts.body).replace(/\r?\n/g, '<br>');

  const joinBlock = listed.length
    ? `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0 0 8px 0;"><strong>Your team is listed on First Mentor</strong>, a free, volunteer-run site that connects FIRST teams with mentors.</p>
        <p style="margin:0 0 12px 0;">Create a free account to update your team's listing, find mentors, and reply to members directly:</p>
        ${listed.slice(0, 10).map(p => `<p style="margin:4px 0;"><a href="${signupUrlFor(p)}" style="color:#2563eb;">Join as ${teamLabel(p)}</a></p>`).join('')}
      </div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#2563eb;color:#fff;padding:20px 24px;border-radius:10px 10px 0 0;">
        <p style="margin:0;font-size:14px;opacity:.9;">Message via First Mentor</p>
        <h1 style="margin:4px 0 0 0;font-size:20px;">${escapeHtml(opts.subject)}</h1>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
        <p>${greeting}</p>
        <div style="margin:16px 0;">${bodyHtml}</div>
        <p style="margin-top:24px;">— ${escapeHtml(opts.senderName)}${opts.senderDetails ? `<br><span style="color:#6b7280;font-size:14px;">${escapeHtml(opts.senderDetails)}</span>` : ''}</p>
        <p style="color:#6b7280;font-size:14px;">Reply to this email to respond to ${escapeHtml(opts.senderName)} directly.</p>
        ${joinBlock}
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">
        This message was written by a First Mentor member and sent through First Mentor.<br>
        Don't want emails like this? <a href="${unsubscribeUrl(recipient.email)}" style="color:#6b7280;">Unsubscribe</a>
      </p>
    </body>
    </html>`;

  return html;
}
