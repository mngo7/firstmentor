import { NextResponse } from 'next/server';
import { getUserByResetToken, updateUserPassword } from '@/lib/googleSheets';
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
    const user = await getUserByResetToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    console.log('✅ Token is valid for user:', user.email);

    // 2. 加密新密码
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 更新密码并清除reset token
    await updateUserPassword(user.email, hashedPassword);
    console.log('✅ Password updated successfully');

    return NextResponse.json({ 
      status: 'success',
      message: 'Password has been reset successfully. You can now sign in with your new password.' 
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset password',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}