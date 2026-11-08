import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/googleSheets';
import bcrypt from 'bcryptjs';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 2. 从 Google Sheets 查找用户
    console.log('🔍 Looking up user:', email);
    const user = await getUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'This email is not registered. Please sign up first.' },
        { status: 404 }
      );
    }

    // 3. 检查邮箱是否已验证
    if (!user.isVerified) {
      console.log('❌ Email not verified');
      return NextResponse.json(
        { error: 'Please verify your email before signing in. Check your inbox for the verification link.' },
        { status: 403 }
      );
    }

    // 4. 验证密码
    console.log('🔐 Verifying password...');
    
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 5. 创建会话并设置 cookie
    console.log('✅ Creating session for user:', user.email);
    const sessionData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    
    const token = await createSession(sessionData);
    await setSessionCookie(token);

    // 6. 返回成功响应（不包含密码）
    return NextResponse.json({
      status: 'success',
      user: sessionData
    });

  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    );
  }
}