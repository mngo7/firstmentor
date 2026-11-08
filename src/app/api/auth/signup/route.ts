import { NextResponse } from 'next/server';
import { convertFormDataToSheetRow, appendToSheet, getUserByEmail } from '@/lib/googleSheets';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. 验证必填字段
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 2. 检查邮箱是否已存在
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // 3. 生成验证token
    const verificationToken = generateVerificationToken();

    // 4. 密码加密
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // 5. 准备表单数据
    // 只保留表单字段；验证状态、token、付费辅导等字段由服务端控制
    const {
      isVerified: _isVerified,
      verificationToken: _verificationToken,
      membershipType: _membershipType,
      volunteerMentoring: _volunteerMentoring,
      paidMentoring: _paidMentoring,
      hourlyRateRange: _hourlyRateRange,
      ...profileData
    } = data;
    const formData = {
      ...profileData,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    };

    // 6. 转换数据并保存到 Google Sheet
    console.log('💾 Saving user data to Google Sheets...');
    const rowData = convertFormDataToSheetRow(formData);
    
    await appendToSheet(rowData);
    console.log('✅ User data saved successfully');

    // 7. 发送验证邮件
    console.log('📧 Preparing to send verification email to:', data.email);
    try {
      await sendVerificationEmail(data.email, verificationToken);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // 即使邮件发送失败，账号仍然创建成功
      return NextResponse.json({
        status: 'success',
        message: 'Account created successfully, but verification email failed to send. Please contact support.',
        warning: 'Email not sent'
      });
    }

    // 8. 返回成功响应
    return NextResponse.json({
      status: 'success',
      message: 'Account created successfully. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Registration failed'
      },
      { status: 500 }
    );
  }
}