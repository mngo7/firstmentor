import nodemailer from 'nodemailer';
import { generateToken, getBaseUrl } from './security';

// 创建邮件传输器
export function createEmailTransporter() {
  // Local testing must never reach real inboxes
  if (process.env.LOCAL_SHEET_FILE && !/^(mailpit|localhost|127\.0\.0\.1)$/.test(process.env.EMAIL_HOST || '')) {
    throw new Error('Refusing to send email: local test data is in use but EMAIL_HOST is not a local test server');
  }
  console.log('📧 Creating email transporter with config:', {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || '587',
    user: process.env.EMAIL_USER ? '***@' + process.env.EMAIL_USER.split('@')[1] : 'NOT SET',
    hasPassword: !!process.env.EMAIL_PASSWORD,
  });
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// 通用邮件发送函数
export async function sendEmail({
  to,
  subject,
  html,
  fromName = 'First Mentor',
  replyTo,
  headers,
}: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}) {
  console.log('📧 Sending email:', subject);

  
  const transporter = createEmailTransporter();
  
  const mailOptions = {
    from: { name: fromName, address: process.env.EMAIL_USER || '' },
    to,
    subject,
    html,
    replyTo,
    headers,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent, message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// 生成验证token
export function generateVerificationToken(): string {
  return generateToken();
}

// 发送验证邮件
export async function sendVerificationEmail(email: string, token: string) {
  console.log('📧 Starting sendVerificationEmail process...');
  console.log('   Target email:', email);
  console.log('   Token length:', token.length);
  
  const transporter = createEmailTransporter();
  
  const verificationUrl = `${getBaseUrl() || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"First Mentor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - First Mentor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Mentor Match!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6b7280; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  console.log('📤 Attempting to send email...');
  console.log('   From:', mailOptions.from);
  console.log('   To:', mailOptions.to);
  console.log('   Subject:', mailOptions.subject);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:');
    console.error('   Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    console.error('   Full error:', error);
    throw error;
  }
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email: string, token: string) {
  console.log('🔐 Starting sendPasswordResetEmail process...');
  console.log('   Target email:', email);
  console.log('   Token length:', token.length);
  
  const transporter = createEmailTransporter();
  
  const resetUrl = `${getBaseUrl() || 'http://localhost:3000'}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"First Mentor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - First Mentor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>You requested to reset your password for your First Mentor account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  };

  console.log('📤 Attempting to send password reset email...');
  console.log('   From:', mailOptions.from);
  console.log('   To:', mailOptions.to);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:');
    console.error('   Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    console.error('   Full error:', error);
    throw error;
  }
}

// 发送欢迎邮件（验证后）
export async function sendWelcomeEmail(email: string, firstName: string) {
  console.log('🎉 Starting sendWelcomeEmail process...');
  console.log('   Target email:', email);
  console.log('   First name:', firstName);
  
  const transporter = createEmailTransporter();
  
  const mailOptions = {
    from: `"First Mentor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to First Mentor!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome, ${firstName}!</h2>
        <p>Your email has been successfully verified. You can now access all features of Mentor Match.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${getBaseUrl() || 'http://localhost:3000'}/signin" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Sign In
          </a>
        </div>
        <p>Start connecting with mentors and mentees in the FIRST community!</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>
    `,
  };

  console.log('📤 Attempting to send welcome email...');
  console.log('   From:', mailOptions.from);
  console.log('   To:', mailOptions.to);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:');
    console.error('   Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    console.error('   Full error:', error);
    throw error;
  }
}
