import { getAllProfiles, isVisibleProfile, ServerProfile } from './profiles';
import { appendToTab, readTab } from './sheetTabs';

// Sending limits. Google Workspace allows ~2,000 emails per day per account, so the
// site-wide limit stays below that; the per-member limit keeps one person from using it all.
export const PER_MEMBER_DAILY_LIMIT = parseInt(process.env.MESSAGE_DAILY_LIMIT_PER_MEMBER || '100', 10);
export const SITE_DAILY_LIMIT = parseInt(process.env.MESSAGE_DAILY_LIMIT_SITE || '1500', 10);
export const MAX_SUBJECT_LENGTH = 150;
export const MAX_BODY_LENGTH = 5000;

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

// Recipients matching the filters, one per email address, excluding the sender
export async function findRecipients(filters: RecipientFilters, senderEmail: string) {
  const profiles = await getAllProfiles();
  const sender = senderEmail.toLowerCase();
  const byEmail = new Map<string, Recipient>();

  for (const profile of profiles) {
    if (!isVisibleProfile(profile) || !profile.email || !matches(profile, filters)) continue;
    const key = profile.email.toLowerCase();
    if (key === sender) continue;
    const existing = byEmail.get(key);
    if (existing) existing.profiles.push(profile);
    else byEmail.set(key, { email: profile.email, profiles: [profile] });
  }
  return Array.from(byEmail.values());
}

// ---- Sending limits (based on the message log, so they survive restarts) ----

export async function getUsageToday(senderEmail: string) {
  const since = Date.now() - DAY_MS;
  const sender = senderEmail.toLowerCase();
  let mine = 0;
  let site = 0;
  for (const [timestamp, email, count] of await readTab(LOG_TAB, 'A:E')) {
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
  await appendToTab(LOG_TAB, [[new Date().toISOString(), senderEmail.toLowerCase(), String(recipientCount), subject, JSON.stringify(filters)]], 'A:E');
}
