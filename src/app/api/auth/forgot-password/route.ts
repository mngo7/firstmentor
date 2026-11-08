import { NextResponse } from 'next/server';
import { getUserByEmail, updatePasswordResetToken } from '@/lib/googleSheets';
import { sendPasswordResetEmail, generateVerificationToken } from '@/lib/email';

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
        message: 'If your email is registered, you will receive a password reset link shortly.' 
      });
    }

    // 2. 生成密码重置token
    const resetToken = generateVerificationToken();
    
    // 3. 设置token过期时间（1小时）
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    console.log('⏰ Token expiry set to:', expiry.toISOString());
    
    // 4. 保存token到数据库
    await updatePasswordResetToken(email, resetToken, expiry);
    console.log('✅ Reset token saved to database');

    // 5. 发送重置密码邮件
    console.log('📧 Preparing to send password reset email to:', email);
    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log('✅ Password reset email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      return NextResponse.json(
        { 
          error: 'Failed to send reset email. Please try again later.',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Password reset link has been sent to your email.' 
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process password reset request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}