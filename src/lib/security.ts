import crypto from 'crypto';

// Server secret used for sessions, signed links and profile IDs
export function getServerSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hmac(value: string): string {
  return crypto.createHmac('sha256', getServerSecret()).update(value).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// Stable public ID for a sheet row, so profiles can be linked without exposing emails.
// Members are identified by their account email (so editing their name or team keeps the link);
// listed teams by contact email + program + team number (one contact can be listed for several teams).
export function profileIdFor(row: { email?: string; isListedTeam?: boolean; program?: string; teamNumber?: string }): string {
  const norm = (v?: string) => (v || '').trim().toLowerCase();
  const key = row.isListedTeam
    ? `team|${norm(row.email)}|${norm(row.program)}|${norm(row.teamNumber)}`
    : `member|${norm(row.email)}`;
  return hmac(`profile:${key}`).slice(0, 16);
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Absolute URL on the public site. Inside the container request.url points at 0.0.0.0:3800,
// so redirects must be built from the configured base URL instead.
export function appUrl(path: string, requestUrl: string): URL {
  return new URL(path, getBaseUrl() || requestUrl);
}

// The site's public address, read when the server runs. APP_BASE_URL comes first because
// NEXT_PUBLIC_* values are baked in when the app is built (so a local build would still
// link to the production site).
export function getBaseUrl(): string {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';
}
