import { getGoogleSheetsClient } from './googleSheets';
import { normalizeCountry, normalizeState } from './countries';
import { profileIdFor } from './security';

const splitList = (value: string) => value.split(',').map(s => s.trim()).filter(Boolean);

// 读取所有 profile（包含 email，仅供服务端使用，不能直接返回给浏览器）
//
// The sheet holds two kinds of rows:
// - accounts: people who signed up on First Mentor (they have a password in column X)
// - listed teams: FIRST teams that were imported with a contact email but haven't signed up yet
export async function getAllProfiles() {
  const sheets = await getGoogleSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'A2:AK',
  });
  const rows = (response.data.values || []) as string[][];

  const profiles = rows.map((row, idx) => {
    const cell = (i: number) => (row[i] || '').trim();
    const rawEmail = cell(6);
    const email = rawEmail.includes('@') ? rawEmail : '';
    const name = cell(3);
    const lastName = cell(17);
    const teamNumber = cell(4);
    const isListedTeam = !cell(23); // no password → imported team listing, not an account
    const country = normalizeCountry(cell(0));
    // Non-US rows store the country in the state column
    const rawState = normalizeState(cell(1));
    const state = normalizeCountry(rawState) === country ? country : rawState;
    const programRaw = cell(2);

    return {
      id: profileIdFor({ email, isListedTeam, program: programRaw === '' ? 'Others' : programRaw, teamNumber }),
      rowNumber: idx + 2,
      isListedTeam,
      name,
      lastName,
      role: cell(16),
      program: programRaw === '' ? 'Others' : programRaw,
      teamNumber,
      teamName: cell(5),
      teamOrCompany: '',
      country,
      state,
      // Listed teams were imported with default Mentor/Mentee values they never chose
      isMentor: !isListedTeam && !!cell(10),
      isMentee: !isListedTeam && !!cell(11),
      major: cell(27),
      universityName: cell(24),
      jobCategory: cell(28),
      companyName: cell(25),
      otherSpecialties: cell(29),
      affiliation: cell(26),
      mentorSpecialties: splitList(cell(7)),
      mentorExperience: cell(8) || 'Coming soon...',
      menteeNeeds: splitList(cell(20)),
      menteePreferredMeeting: splitList(cell(21)),
      menteeRequiredExperience: cell(22),
      availability: splitList(cell(9)),
      mentorPrograms: splitList(cell(35)),
      teamWebsite: cell(12),
      website: cell(13),
      linkedin: cell(14),
      detailedDescription: cell(15) || 'Coming soon...',
      email,
    };
  });

  // Once a team's contact signs up for that team, hide the old listing so the team doesn't appear twice
  const claimed = new Set(
    profiles
      .filter(p => !p.isListedTeam && p.email && p.teamNumber)
      .map(p => `${p.email.toLowerCase()}|${p.teamNumber}`)
  );
  // The import also contains a few exact duplicate listings; show each team once
  const seen = new Set<string>();
  return profiles.filter(p => {
    if (p.isListedTeam && claimed.has(`${p.email.toLowerCase()}|${p.teamNumber}`)) return false;
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export type ServerProfile = Awaited<ReturnType<typeof getAllProfiles>>[number];

// Hide blank accounts (no name or team) from search and messaging
export function isVisibleProfile(profile: ServerProfile) {
  return !!(profile.name || profile.lastName || profile.teamName || profile.teamNumber);
}

// What the browser is allowed to see: never the email address or sheet row
export function toPublicProfile({ email, rowNumber, ...profile }: ServerProfile) {
  return { ...profile, canConnect: !!email };
}
