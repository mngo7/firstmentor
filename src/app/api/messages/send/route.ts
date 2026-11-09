import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/googleSheets';
import { sendMessage, senderFromAccount, storeMessages, StoredMessage } from '@/lib/inbox';
import {
  MAX_BODY_LENGTH,
  MAX_SUBJECT_LENGTH,
  findRecipients,
  getUsageToday,
  logMessage,
  parseFilters,
} from '@/lib/messaging';

export const dynamic = 'force-dynamic';

// One bulk send at a time per member, so double-clicks can't send twice
const inProgress = new Set<string>();

// Sends the same message to many recipients. Each recipient gets their own conversation,
// so replies from different teams stay separate in the sender's inbox.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Please sign in to send messages' }, { status: 401 });
  }
  const senderKey = session.email.toLowerCase();
  if (inProgress.has(senderKey)) {
    return NextResponse.json({ error: 'Your previous message is still sending. Please wait.' }, { status: 429 });
  }
  inProgress.add(senderKey);

  try {
    const body = await request.json();
    const filters = parseFilters(body.filters);
    const subject = String(body.subject || '').replace(/[\r\n]+/g, ' ').trim();
    const message = String(body.message || '').trim();

    if (!subject || subject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json({ error: `Please enter a subject (up to ${MAX_SUBJECT_LENGTH} characters)` }, { status: 400 });
    }
    if (!message || message.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: `Please enter a message (up to ${MAX_BODY_LENGTH} characters)` }, { status: 400 });
    }

    const sender = await getUserByEmail(session.email);
    if (!sender || !sender.isVerified) {
      return NextResponse.json({ error: 'Please verify your email before sending messages' }, { status: 403 });
    }

    const recipients = await findRecipients(filters, sender.email);
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients match these filters' }, { status: 400 });
    }

    const { remaining, perMemberLimit } = await getUsageToday(sender.email);
    if (recipients.length > remaining) {
      return NextResponse.json(
        {
          error: remaining === 0
            ? `You've reached today's sending limit (${perMemberLimit} recipients per day). Please try again tomorrow.`
            : `This would go to ${recipients.length} recipients, but you can send to ${remaining} more today (limit ${perMemberLimit} per day). Narrow your filters and try again.`,
        },
        { status: 429 }
      );
    }

    // Log before sending so the daily limit holds even if sending is interrupted
    await logMessage(sender.email, recipients.length, subject, filters);

    const { party, details } = senderFromAccount(sender);
    const sentMessages: StoredMessage[] = [];
    const failed: string[] = [];
    try {
      for (const recipient of recipients) {
        try {
          sentMessages.push(await sendMessage({ from: party, senderDetails: details, to: recipient, subject, body: message, kind: 'message', deferStore: true }));
        } catch (error) {
          console.error('Failed to send message to a recipient:', error);
          failed.push(recipient.profiles.map(p => p.teamName || p.name).filter(Boolean).join(', ') || 'unknown');
        }
      }
    } finally {
      // One write for the whole batch (Google Sheets limits writes per minute)
      await storeMessages(sentMessages);
    }
    const sent = sentMessages.length;

    return NextResponse.json({ sent, failed: failed.length, failedNames: failed.slice(0, 20) });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  } finally {
    inProgress.delete(senderKey);
  }
}
