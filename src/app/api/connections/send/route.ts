import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/googleSheets';
import { getAllProfiles } from '@/lib/profiles';
import { sendMessage, senderFromAccount } from '@/lib/inbox';
import { MAX_BODY_LENGTH } from '@/lib/messaging';

// 简单的内存限流：每个发送者每小时最多 20 个请求
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const recentSends = new Map<string, number[]>();

function isRateLimited(senderEmail: string) {
  const now = Date.now();
  const sends = (recentSends.get(senderEmail) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (sends.length >= RATE_LIMIT) {
    recentSends.set(senderEmail, sends);
    return true;
  }
  sends.push(now);
  recentSends.set(senderEmail, sends);
  return false;
}

// Connect: start a conversation with one member or listed team. It lands in both inboxes
// (for members) and is emailed to the recipient.
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in to send connection requests' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId } = body;
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const requestType = body.requestType === 'mentor' ? 'mentor' : 'mentee';

    if (message.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: `Message is too long (max ${MAX_BODY_LENGTH} characters)` }, { status: 400 });
    }

    // Sender details come from the signed-in user's own row, never from the request body
    const sender = await getUserByEmail(session.email);
    if (!sender) {
      return NextResponse.json({ error: 'Your account could not be found' }, { status: 404 });
    }

    // Recipient is looked up by public profile ID; their email is never sent to the browser
    const profiles = await getAllProfiles();
    const recipient = profiles.find(profile => profile.id === recipientId);
    if (!recipient || !recipient.email) {
      return NextResponse.json(
        { error: 'This user has not provided a valid email address yet. They cannot receive connection requests at this time.' },
        { status: 400 }
      );
    }
    if (recipient.email.toLowerCase() === sender.email.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot send a connection request to yourself' }, { status: 400 });
    }
    if (isRateLimited(sender.email.toLowerCase())) {
      return NextResponse.json({ error: 'You have sent too many connection requests. Please try again later.' }, { status: 429 });
    }

    const { party, details } = senderFromAccount(sender);
    const sent = await sendMessage({
      from: party,
      senderDetails: details,
      to: { email: recipient.email, profiles: [recipient] },
      subject: requestType === 'mentor' ? `${party.name} would like to mentor you` : `${party.name} is looking for a mentor`,
      body: message || (requestType === 'mentor'
        ? "Hi! I'd like to offer mentorship. Let me know if you're interested."
        : "Hi! I'm looking for a mentor and would love to connect."),
      kind: requestType === 'mentor' ? 'connect-mentor' : 'connect-mentee',
    });

    return NextResponse.json({ success: true, message: 'Connection request sent successfully', threadId: sent.threadId });
  } catch (error) {
    console.error('Error sending connection request:', error);
    return NextResponse.json({ error: 'Failed to send connection request' }, { status: 500 });
  }
}
