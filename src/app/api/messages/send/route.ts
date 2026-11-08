import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/googleSheets';
import { sendEmail } from '@/lib/email';
import {
  MAX_BODY_LENGTH,
  MAX_SUBJECT_LENGTH,
  findRecipients,
  getUsageToday,
  logMessage,
  parseFilters,
  renderMessageEmail,
  unsubscribeUrl,
} from '@/lib/messaging';

export const dynamic = 'force-dynamic';

// One bulk send at a time per member, so double-clicks can't send twice
const inProgress = new Set<string>();

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

    const { recipients } = await findRecipients(filters, sender.email);
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

    const senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'A First Mentor member';
    const senderDetails = [
      sender.teamNumber || sender.teamName ? `Team ${[sender.teamNumber, sender.teamName].filter(Boolean).join(' ')}` : '',
      sender.universityName || sender.companyName || sender.affiliation || '',
      [sender.state, sender.country].filter((v, i, a) => v && a.indexOf(v) === i).join(', '),
    ].filter(Boolean).join(' · ');

    // Log before sending so the daily limit holds even if sending is interrupted
    await logMessage(sender.email, recipients.length, subject, filters);

    let sent = 0;
    const failed: string[] = [];
    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient.email,
          subject,
          fromName: `${senderName} via First Mentor`,
          replyTo: sender.email,
          html: renderMessageEmail({ senderName, senderDetails, subject, body: message, recipient }),
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl(recipient.email)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });
        sent++;
      } catch (error) {
        console.error('Failed to send message to a recipient:', error);
        failed.push(recipient.profiles.map(p => p.teamName || p.name).filter(Boolean).join(', ') || 'unknown');
      }
    }

    return NextResponse.json({ sent, failed: failed.length, failedNames: failed.slice(0, 20) });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  } finally {
    inProgress.delete(senderKey);
  }
}
