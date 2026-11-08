import { NextResponse } from 'next/server';
import { getUserByEmail, updateUserPassword } from '@/lib/googleSheets';
import { verifyPasswordResetToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // 1. 验证token并获取用户
    console.log('🔍 Verifying reset token...');
    const email = await verifyPasswordResetToken(token, async (email) => {
      const user = await getUserByEmail(email);
      return user ? user.password : null;
    });
    
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    console.log('✅ Token is valid for user:', email);

    // 2. 加密新密码
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 更新密码并清除reset token
    await updateUserPassword(email, hashedPassword);
    console.log('✅ Password updated successfully');

    return NextResponse.json({ 
      status: 'success',
      message: 'Password has been reset successfully. You can now sign in with your new password.' 
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset password'
      },
      { status: 500 }
    );
  }
}