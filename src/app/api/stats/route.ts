import { NextResponse } from 'next/server';
import { getAllProfiles, isVisibleProfile } from '@/lib/profiles';

// 每 5 分钟重新统计一次（否则会在构建时固定为静态结果）
export const revalidate = 300;

export async function GET() {
  try {
    const profiles = (await getAllProfiles()).filter(isVisibleProfile);

    // Members = people who signed up; listed teams were imported and haven't joined yet
    const members = profiles.filter(p => !p.isListedTeam).length;

    // Teams = unique (program, team number); the same number can belong to different programs
    const teams = new Set(
      profiles.filter(p => p.teamNumber).map(p => `${p.program.toLowerCase()}|${p.teamNumber}`)
    ).size;

    const countries = new Set(profiles.map(p => p.country).filter(Boolean)).size;

    return NextResponse.json({
      listedTeams: teams,
      members,
      countriesServed: countries,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
