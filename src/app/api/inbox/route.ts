import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllMessages, syncInboundReplies, threadsFor } from '@/lib/inbox';

export const dynamic = 'force-dynamic';

// The signed-in member's conversations: messages they sent, received, and email replies
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    await syncInboundReplies();
    return NextResponse.json({ threads: threadsFor(await getAllMessages(), session.email) });
  } catch (error) {
    console.error('Inbox error:', error);
    return NextResponse.json({ error: 'Failed to load inbox' }, { status: 500 });
  }
}
