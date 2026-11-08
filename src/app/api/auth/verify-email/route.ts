import { NextResponse } from 'next/server';
import { appUrl } from '@/lib/security';
import { getUserByVerificationToken, updateEmailVerification } from '@/lib/googleSheets';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // 1. 查找token对应的用户
    const user = await getUserByVerificationToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 404 }
      );
    }

    // 2. 检查是否已经验证过
    if (user.isVerified) {
      return NextResponse.json({
        status: 'already_verified',
        message: 'Email already verified. You can sign in now.'
      });
    }

    // 3. 更新验证状态
    console.log('✅ Updating verification status for:', user.email);
    await updateEmailVerification(user.email, true);
    console.log('✅ Verification status updated');

    // 4. 发送欢迎邮件
    console.log('🎉 Preparing to send welcome email...');
    try {
      await sendWelcomeEmail(user.email, user.firstName);
      console.log('✅ Welcome email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // 验证成功，即使欢迎邮件失败也不影响
    }

    // 5. 重定向到登录页面，带上成功消息
    return NextResponse.redirect(
      appUrl('/signin?verified=true', request.url)
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    );
  }
}
