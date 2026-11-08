import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findRecipients, getUsageToday, parseFilters } from '@/lib/messaging';

export const dynamic = 'force-dynamic';

// Shows who a message would go to, without exposing anyone's email address
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in to send messages' }, { status: 401 });
    }

    const filters = parseFilters(await request.json());
    const [{ recipients, unsubscribedCount }, usage] = await Promise.all([
      findRecipients(filters, session.email),
      getUsageToday(session.email),
    ]);

    const teams = recipients.flatMap(r => r.profiles);
    return NextResponse.json({
      recipientCount: recipients.length,
      teamCount: teams.length,
      unsubscribedCount,
      remainingToday: usage.remaining,
      dailyLimit: usage.perMemberLimit,
      sample: teams.slice(0, 100).map(p => ({
        id: p.id,
        name: [p.name, p.lastName].filter(Boolean).join(' '),
        teamNumber: p.teamNumber,
        teamName: p.teamName,
        program: p.program,
        state: p.state,
        country: p.country,
        isListedTeam: p.isListedTeam,
      })),
    });
  } catch (error) {
    console.error('Message preview error:', error);
    return NextResponse.json({ error: 'Failed to load recipients' }, { status: 500 });
  }
}
