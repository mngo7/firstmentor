import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/googleSheets';
import { sendPasswordResetEmail } from '@/lib/email';
import { createPasswordResetToken } from '@/lib/auth';

const GENERIC_MESSAGE = 'If your email is registered, you will receive a password reset link shortly.';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 1. 检查用户是否存在
    console.log('🔍 Checking if user exists:', email);
    const user = await getUserByEmail(email);
    
    if (!user) {
      // 为了安全，即使用户不存在也返回成功消息（防止邮箱枚举攻击）
      console.log('⚠️ User not found, but returning success for security');
      return NextResponse.json({ 
        status: 'success',
        message: GENERIC_MESSAGE
      });
    }

    // 2. 生成签名的密码重置token（1小时过期，密码修改后失效）
    const resetToken = await createPasswordResetToken(user.email, user.password);

    // 3. 发送重置密码邮件
    console.log('📧 Preparing to send password reset email to:', email);
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      console.log('✅ Password reset email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      return NextResponse.json(
        { 
          error: 'Failed to send reset email. Please try again later.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      status: 'success',
      message: GENERIC_MESSAGE
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process password reset request'
      },
      { status: 500 }
    );
  }
}