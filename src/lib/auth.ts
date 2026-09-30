import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

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
    .sign(JWT_SECRET);

  return token;
}

// 验证 JWT token
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
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
