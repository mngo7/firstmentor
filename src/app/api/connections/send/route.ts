import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/googleSheets';
import { getAllProfiles } from '@/lib/profiles';
import { escapeHtml, hmac, profileIdFor } from '@/lib/security';

// 简单的内存限流：每个发送者每小时最多 20 个请求
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const recentSends = new Map<string, number[]>();

function isRateLimited(senderEmail: string) {
  const now = Date.now();
  const sends = (recentSends.get(senderEmail) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (sends.length >= RATE_LIMIT) {
    recentSends.set(senderEmail, sends);
    return true;
  }
  sends.push(now);
  recentSends.set(senderEmail, sends);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to send connection requests' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, message } = body;
    const requestType = body.requestType === 'mentor' ? 'mentor' : 'mentee';

    // Validate message length if provided
    if (typeof message !== 'undefined' && (typeof message !== 'string' || message.length > 600)) {
      return NextResponse.json(
        { error: 'Message is too long (max 600 characters)' },
        { status: 400 }
      );
    }

    // Sender details come from the signed-in user's own row, never from the request body
    const sender = await getUserByEmail(session.email);
    if (!sender) {
      return NextResponse.json({ error: 'Your account could not be found' }, { status: 404 });
    }

    // Recipient is looked up by public profile ID; their email is never sent to the browser
    const recipient = (await getAllProfiles()).find(profile => profile.id === recipientId);
    if (!recipient || !recipient.email) {
      return NextResponse.json(
        { error: 'This user has not provided a valid email address yet. They cannot receive connection requests at this time.' },
        { status: 400 }
      );
    }

    if (recipient.email.toLowerCase() === sender.email.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot send a connection request to yourself' }, { status: 400 });
    }

    if (isRateLimited(sender.email.toLowerCase())) {
      return NextResponse.json(
        { error: 'You have sent too many connection requests. Please try again later.' },
        { status: 429 }
      );
    }

    const recipientEmail = recipient.email;
    const recipientName = escapeHtml(recipient.name || recipient.teamName || 'there');
    const senderName = escapeHtml(`${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'A First Mentor member');
    const senderRole = escapeHtml(sender.role === 'university' ? 'university student' : (sender.role || 'Member'));
    const senderTeam = escapeHtml(sender.teamName || sender.universityName || sender.companyName || sender.affiliation || '');
    const senderCity = escapeHtml(Array.from(new Set([sender.state, sender.country].filter(Boolean))).join(', '));
    const safeMessage = escapeHtml(message || '');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const senderProfileUrl = `${baseUrl}/profile/${profileIdFor({
      email: sender.email,
      teamNumber: sender.teamNumber,
      firstName: sender.firstName,
      lastName: sender.lastName,
    })}`;

    // Connection data is carried in the response links and signed, so it can't be forged or altered
    const connectionData = Buffer.from(JSON.stringify({
      senderEmail: sender.email,
      senderName: `${sender.firstName || ''} ${sender.lastName || ''}`.trim(),
      recipientName: recipient.name || recipient.teamName || '',
      recipientEmail,
      recipientId: recipient.id,
    })).toString('base64url');
    const token = hmac(`connection:${connectionData}`);

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
              <span class="profile-label">Profile:</span> <a href="${senderProfileUrl}" style="color: #3B82F6;">View Full Profile</a>
            </div>
            <div class="profile-item">
              <span class="profile-label">Wants to:</span> ${requestType === 'mentor' ? 'Offer Mentorship' : 'Seek Mentorship'}
            </div>
          </div>
          
          ${message ? `
          <div class="message-box">
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 10px 0 0 0;">"${safeMessage}"</p>
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
      message: 'Connection request sent successfully'
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}
