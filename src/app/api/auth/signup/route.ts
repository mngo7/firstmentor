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

    // 检查是否为general member（简化注册）
    const isGeneralMember = data.membershipType === 'general';

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
    console.log('🔑 Generated verification token:', verificationToken.substring(0, 10) + '...');

    // 4. 密码加密
    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log('🔐 Password hashed:', {
      originalLength: data.password.length,
      hashedLength: hashedPassword.length,
      hashedPreview: hashedPassword.substring(0, 20) + '...',
    });
    
    // 5. 准备表单数据
    let formData;
    if (isGeneralMember) {
      // General Member: 仅包含邮箱、密码和会员类型
      formData = {
        email: data.email,
        password: hashedPassword,
        membershipType: 'general',
        verificationToken,
        isVerified: false,
        // 其他字段留空
        firstName: '',
        lastName: '',
        isMentor: false,
        isMentee: false,
      };
    } else {
      // Pro Member: 完整信息
      formData = {
        ...data,
        password: hashedPassword,
        membershipType: 'pro',
        verificationToken,
        isVerified: false,
      };
    }

    console.log('📝 FormData keys:', Object.keys(formData));
    console.log('📝 Membership type:', formData.membershipType);
    console.log('📝 FormData values check:', {
      hasEmail: !!formData.email,
      hasPassword: !!formData.password,
      passwordLength: formData.password?.length || 0,
      hasToken: !!formData.verificationToken,
      tokenLength: formData.verificationToken?.length || 0,
      isVerified: formData.isVerified,
      membershipType: formData.membershipType,
    });

    // 6. 转换数据并保存到 Google Sheet
    console.log('💾 Saving user data to Google Sheets...');
    const rowData = convertFormDataToSheetRow(formData);
    console.log('📊 Row data length:', rowData.length);
    console.log('📊 Row data[23] (password column X):', rowData[23] ? rowData[23].substring(0, 20) + '...' : 'EMPTY');
    console.log('📊 Row data[30] (token column AE):', rowData[30] ? rowData[30].substring(0, 20) + '...' : 'EMPTY');
    console.log('📊 Row data[31] (verified column AF):', rowData[31]);
    console.log('📊 Row data[36] (membershipType column AK):', rowData[36]);
    
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
      message: isGeneralMember 
        ? 'General Member account created successfully. Please check your email to verify your account.'
        : 'Pro Member account created successfully. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}