import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { getServerSecret } from './security';

const getJwtSecret = () => new TextEncoder().encode(getServerSecret());

const COOKIE_NAME = 'session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// 创建 JWT token
export async function createSession(userData: SessionData) {
  const token = await new SignJWT({ user: userData })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());

  return token;
}

// 验证 JWT token
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload.user as SessionData;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 获取当前用户会话
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

// 设置 session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// 删除 session cookie
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// 密码重置 token：签名 + 1 小时过期，并绑定当前密码哈希（密码修改后自动失效）
const passwordFingerprint = (passwordHash: string | undefined) =>
  createHash('sha256').update(passwordHash || '').digest('hex').slice(0, 16);

export async function createPasswordResetToken(email: string, passwordHash: string | undefined) {
  return new SignJWT({ purpose: 'password-reset', email, pf: passwordFingerprint(passwordHash) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getJwtSecret());
}

export async function verifyPasswordResetToken(token: string, currentPasswordHash: (email: string) => Promise<string | undefined | null>) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.purpose !== 'password-reset' || typeof payload.email !== 'string') {
      return null;
    }
    const hash = await currentPasswordHash(payload.email);
    if (hash === null || payload.pf !== passwordFingerprint(hash)) {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}
