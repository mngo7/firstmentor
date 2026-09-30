import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipientEmail, 
      recipientName,
      senderName,
      senderEmail,
      senderRole, 
      senderTeam,
      senderCity,
      senderProfileUrl,
      message,
      requestType // 'mentor' or 'mentee'
    } = body;

    // Validate email address
    if (!recipientEmail || 
        recipientEmail === 'Coming soon...' || 
        recipientEmail === 'N/A' || 
        !recipientEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid or unavailable email address. This user has not provided a valid email.' },
        { status: 400 }
      );
    }

    // Validate message length if provided
    if (message && message.length > 600) {
      return NextResponse.json(
        { error: 'Message is too long (max 600 characters)' },
        { status: 400 }
      );
    }

    // Generate unique token for this connection request
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Store connection request data for later retrieval when recipient responds
    // In production, this should be stored in a database
    // For now, we'll encode it in the URL (not secure for production, but works for demo)
    const connectionData = Buffer.from(JSON.stringify({
      senderEmail,
      senderName,
      recipientName,
      recipientEmail
    })).toString('base64');

    // Email to recipient (person receiving the connection request)
    const recipientEmailContent = `
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
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); 
            color: white !important; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0 0 12px 0 !important;
            font-size: 26px !important;
            font-weight: bold !important;
            color: white !important;
            line-height: 1.2 !important;
            display: block !important;
          }
          .header p {
            margin: 0 !important;
            font-size: 15px !important;
            opacity: 0.95;
            color: white !important;
            line-height: 1.4 !important;
            display: block !important;
          }
          .content { 
            background: #ffffff; 
            padding: 30px; 
          }
          .profile-box { 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #3B82F6; 
          }
          .profile-item { margin: 10px 0; }
          .profile-label { font-weight: bold; color: #374151; }
          .message-box { 
            background: #eff6ff; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border: 1px solid #bfdbfe; 
          }
          .button-container { 
            text-align: center; 
            margin: 30px 0; 
            padding: 0 10px;
          }
          .button { 
            display: inline-block; 
            padding: 14px 24px; 
            margin: 0 6px;
            width: 160px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            text-align: center;
            font-size: 15px;
            box-sizing: border-box;
          }
          .btn-accept { background: #10b981; color: white !important; }
          .btn-maybe { background: #f59e0b; color: white !important; }
          .btn-decline { background: #ef4444; color: white !important; }
          .footer { 
            background: #f9fafb; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
            color: #6b7280; 
          }
          .notice { 
            background: #fef3c7; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #f59e0b; 
            font-size: 14px; 
          }
          
          @media only screen and (max-width: 560px) {
            body {
              padding: 10px;
            }
            .content {
              padding: 20px;
            }
            .header h1 {
              font-size: 22px !important;
              margin: 0 0 10px 0 !important;
            }
            .header p {
              font-size: 14px !important;
            }
            .button-container {
              padding: 0 !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 12px !important;
            }
            .button {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 14px 20px !important;
              box-sizing: border-box !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); background-color: #3B82F6;">
            <h1 style="color: #ffffff;">New Connection Request</h1>
            <p style="color: #ffffff;">Someone from First Mentor wants to connect with you</p>
          </div>
        
        <div class="content">
          <p>Hello <strong>${recipientName}</strong>,</p>
          
          <p>You received a new connection request through <strong>First Mentor</strong>.</p>
          
          <div class="profile-box">
            <h3 style="margin-top: 0; color: #1f2937;">Sender Profile</h3>
            <div class="profile-item">
              <span class="profile-label">Name:</span> ${senderName}
            </div>
            <div class="profile-item">
              <span class="profile-label">Role:</span> ${senderRole}
            </div>
            ${senderTeam ? `<div class="profile-item"><span class="profile-label">Team/School:</span> ${senderTeam}</div>` : ''}
            ${senderCity ? `<div class="profile-item"><span class="profile-label">Location:</span> ${senderCity}</div>` : ''}
            <div class="profile-item">
              <span class="profile-label">Profile:</span> <a href="${baseUrl}/profile/${encodeURIComponent(body.senderEmail || '')}" style="color: #3B82F6;">View Full Profile</a>
            </div>
            <div class="profile-item">
              <span class="profile-label">Wants to:</span> ${requestType === 'mentor' ? 'Offer Mentorship' : 'Seek Mentorship'}
            </div>
          </div>
          
          ${message ? `
          <div class="message-box">
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 10px 0 0 0;">"${message}"</p>
          </div>
          ` : ''}
          
          <div class="button-container">
            <a href="${baseUrl}/api/connections/respond?token=${token}&response=accept&data=${connectionData}" class="button btn-accept">
              I'm Interested
            </a>
            <a href="${baseUrl}/api/connections/respond?token=${token}&response=maybe&data=${connectionData}" class="button btn-maybe">
              Maybe Later
            </a>
            <a href="${baseUrl}/api/connections/respond?token=${token}&response=decline&data=${connectionData}" class="button btn-decline">
              No Thanks
            </a>
          </div>
          
          <div class="notice">
            <p style="margin: 0;"><strong>📌 Important Notes:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>First Mentor does not share personal emails by default. All communication is forwarded through the platform unless both sides choose to exchange their own contact information.</li>
              <li>Please communicate politely and responsibly. Mentors volunteer their time and may not respond immediately.</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This message was sent through First Mentor Platform</p>
          <p style="margin: 5px 0 0 0;">Connecting mentors and mentees in the FIRST® and STEM community</p>
        </div>
        </div>
      </body>
      </html>
    `;

    // Send email to recipient
    await sendEmail({
      to: recipientEmail,
      subject: 'New Connection Request from First Mentor',
      html: recipientEmailContent,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Connection request sent successfully',
      token 
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}
