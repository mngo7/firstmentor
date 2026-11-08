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

// Stable public ID for a sheet row, so profiles can be linked without exposing emails
export function profileIdFor(row: { email?: string; teamNumber?: string; firstName?: string; lastName?: string }): string {
  const key = [row.email, row.teamNumber, row.firstName, row.lastName]
    .map(v => (v || '').trim().toLowerCase())
    .join('|');
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
