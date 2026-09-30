import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const response = searchParams.get('response'); // 'accept', 'maybe', 'decline'
    const dataParam = searchParams.get('data');

    if (!token || !response || !dataParam) {
      return NextResponse.redirect(new URL('/?error=invalid-request', request.url));
    }

    // Decode connection data
    let connectionData;
    try {
      connectionData = JSON.parse(Buffer.from(dataParam, 'base64').toString('utf-8'));
    } catch (error) {
      console.error('Error decoding connection data:', error);
      return NextResponse.redirect(new URL('/?error=invalid-data', request.url));
    }

    const { senderEmail, senderName, recipientName, recipientEmail } = connectionData;
    
    // Send response email to original sender
    let emailSubject = '';
    let emailContent = '';
    
    switch (response) {
      case 'accept':
        emailSubject = 'Great News — Connection Accepted on First Mentor';
        emailContent = generateAcceptEmail(senderName, recipientName, recipientEmail);
        break;
      case 'maybe':
        emailSubject = 'Connection Response — Maybe Later';
        emailContent = generateMaybeEmail(senderName, recipientName);
        break;
      case 'decline':
        emailSubject = 'Connection Response — Not Available';
        emailContent = generateDeclineEmail(senderName, recipientName);
        break;
    }

    // Send notification email to the original sender
    await sendEmail({
      to: senderEmail,
      subject: emailSubject,
      html: emailContent,
    });
    
    let responseMessage = '';
    
    switch (response) {
      case 'accept':
        responseMessage = 'Great! We\'ll share your contact information with the requester.';
        break;
      case 'maybe':
        responseMessage = 'Noted. The requester may follow up with you later.';
        break;
      case 'decline':
        responseMessage = 'Thank you for your response. The requester will be notified.';
        break;
    }

    // Return HTML response page
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Response Received - First Mentor</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
          }
          .message {
            font-size: 18px;
            color: #374151;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #3B82F6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          }
          .button:hover {
            background: #2563EB;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Response Received</h1>
          <p class="message">${responseMessage}</p>
          <a href="/" class="button">Return to First Mentor</a>
        </div>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error processing response:', error);
    return NextResponse.redirect(new URL('/?error=processing-failed', request.url));
  }
}

function generateAcceptEmail(senderName: string, recipientName: string, recipientEmail: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          background-color: #f3f4f6;
        }
        .email-wrapper {
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white !important; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 !important;
          font-size: 24px !important;
          font-weight: bold !important;
          color: white !important;
        }
        .content { 
          background: #ffffff; 
          padding: 30px; 
        }
        .highlight-box {
          background: #d1fae5;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #10b981;
        }
        .footer { 
          background: #f9fafb; 
          padding: 20px; 
          text-align: center; 
          font-size: 14px; 
          color: #6b7280; 
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); background-color: #10b981;">
          <h1 style="color: #ffffff;">Great News!</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${senderName}</strong>,</p>
          
          <p>Good news! <strong>${recipientName}</strong> is interested in connecting with you.</p>
          
          <div class="highlight-box">
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>📧 Contact Email:</strong> <span style="color: #059669; font-size: 16px;">${recipientEmail}</span></p>
            <p style="margin: 0; font-size: 15px;"><strong>👤 Profile:</strong> <a href="${baseUrl}/profile/${encodeURIComponent(recipientEmail)}" style="color: #3B82F6; text-decoration: none;">View Full Profile</a></p>
          </div>
          
          <p>You can continue the conversation by reaching out directly to this email address.</p>
          
          <p>Please keep communication respectful, youth-friendly, and aligned with our <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/about" style="color: #3B82F6;">Community Guidelines</a>.</p>
          
          <p style="margin-top: 30px;">Wishing you a great mentorship experience,<br><strong>First Mentor Team</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This message was sent through First Mentor Platform</p>
          <p style="margin: 5px 0 0 0;">Connecting mentors and mentees in the FIRST® and STEM community</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateMaybeEmail(senderName: string, recipientName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          background-color: #f3f4f6;
        }
        .email-wrapper {
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
          color: white !important; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 !important;
          font-size: 24px !important;
          font-weight: bold !important;
          color: white !important;
        }
        .content { 
          background: #ffffff; 
          padding: 30px; 
        }
        .highlight-box {
          background: #fef3c7;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }
        .footer { 
          background: #f9fafb; 
          padding: 20px; 
          text-align: center; 
          font-size: 14px; 
          color: #6b7280; 
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); background-color: #f59e0b;">
          <h1 style="color: #ffffff;">Connection Response</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${senderName}</strong>,</p>
          
          <p>Thank you for reaching out through First Mentor.</p>
          
          <div class="highlight-box">
            <p style="margin: 0;"><strong>${recipientName}</strong> isn't available to connect right now, but they're open to hearing from you again in the future.</p>
          </div>
          
          <p>You may reach out again after some time has passed.</p>
          
          <p style="margin-top: 30px;">Thank you for being part of First Mentor,<br><strong>First Mentor Team</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This message was sent through First Mentor Platform</p>
          <p style="margin: 5px 0 0 0;">Connecting mentors and mentees in the FIRST® and STEM community</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDeclineEmail(senderName: string, recipientName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          background-color: #f3f4f6;
        }
        .email-wrapper {
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); 
          color: white !important; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 !important;
          font-size: 24px !important;
          font-weight: bold !important;
          color: white !important;
        }
        .content { 
          background: #ffffff; 
          padding: 30px; 
        }
        .highlight-box {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #6b7280;
        }
        .footer { 
          background: #f9fafb; 
          padding: 20px; 
          text-align: center; 
          font-size: 14px; 
          color: #6b7280; 
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); background-color: #6b7280;">
          <h1 style="color: #ffffff;">Connection Response</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${senderName}</strong>,</p>
          
          <p>Thank you for your interest in connecting through First Mentor.</p>
          
          <div class="highlight-box">
            <p style="margin: 0;"><strong>${recipientName}</strong> has declined the connection request at this time.</p>
            <p style="margin: 15px 0 0 0;">Please refrain from contacting them again.</p>
          </div>
          
          <p>Thank you for respecting each user's preferences and helping keep our community positive and comfortable.</p>
          
          <p>We encourage you to explore other mentorship opportunities on our platform.</p>
          
          <p style="margin-top: 30px;">Best,<br><strong>First Mentor Team</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This message was sent through First Mentor Platform</p>
          <p style="margin: 5px 0 0 0;">Connecting mentors and mentees in the FIRST® and STEM community</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
