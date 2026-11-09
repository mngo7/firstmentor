import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllMessages, simulateEmailReply, syncInboundReplies, threadFor } from '@/lib/inbox';

export const dynamic = 'force-dynamic';

// Local testing only: pretend the other side replied from their email app.
// The reply goes through the same path as a real one (email to the capture address → sync).
export async function POST(request: NextRequest, { params }: { params: { threadId: string } }) {
  if (!process.env.LOCAL_SHEET_FILE) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const thread = threadFor(await getAllMessages(), params.threadId, session.email);
  if (!thread) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  const { body } = await request.json();
  await simulateEmailReply(params.threadId, thread.other.email, String(body || 'Thanks, we are interested!'));
  await new Promise(resolve => setTimeout(resolve, 500)); // give Mailpit a moment to store it
  await syncInboundReplies({ force: true });
  return NextResponse.json({ success: true });
}
