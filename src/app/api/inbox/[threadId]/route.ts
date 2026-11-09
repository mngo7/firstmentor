import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/googleSheets';
import { getAllProfiles } from '@/lib/profiles';
import { getAllMessages, sendMessage, senderFromAccount, syncInboundReplies, threadFor } from '@/lib/inbox';
import { MAX_BODY_LENGTH } from '@/lib/messaging';

export const dynamic = 'force-dynamic';

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export async function GET(_request: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    await syncInboundReplies();
    const thread = threadFor(await getAllMessages(), params.threadId, session.email);
    if (!thread) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json({
      subject: thread.subject,
      otherParty: thread.other.name,
      // Emails are never sent to the browser; each message just says whether it's mine
      messages: thread.messages.map(m => ({
        id: m.id,
        createdAt: m.createdAt,
        fromMe: same(m.from.email, session.email),
        fromName: m.from.name,
        body: m.body,
        kind: m.kind,
        via: m.via,
      })),
      localTesting: !!process.env.LOCAL_SHEET_FILE,
    });
  } catch (error) {
    console.error('Thread error:', error);
    return NextResponse.json({ error: 'Failed to load conversation' }, { status: 500 });
  }
}

// Reply on the site: stored in the conversation and emailed to the other person
export async function POST(request: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { body } = await request.json();
    const text = typeof body === 'string' ? body.trim() : '';
    if (!text || text.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: `Please enter a reply (up to ${MAX_BODY_LENGTH} characters)` }, { status: 400 });
    }

    const thread = threadFor(await getAllMessages(), params.threadId, session.email);
    const sender = await getUserByEmail(session.email);
    if (!thread || !sender) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const recipientProfiles = (await getAllProfiles()).filter(p => p.email && same(p.email, thread.other.email));
    const { party, details } = senderFromAccount(sender);
    const message = await sendMessage({
      threadId: params.threadId,
      from: party,
      senderDetails: details,
      to: { email: thread.other.email, profiles: recipientProfiles },
      subject: thread.subject,
      body: text,
      kind: 'reply',
    });
    return NextResponse.json({ success: true, id: message.id });
  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
