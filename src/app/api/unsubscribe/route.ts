import { NextRequest, NextResponse } from 'next/server';
import { addUnsubscribe, verifyUnsubscribeToken } from '@/lib/messaging';

export const dynamic = 'force-dynamic';

function page(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
      <div style="background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.08);padding:32px;max-width:420px;text-align:center;">
        <h1 style="font-size:22px;margin:0 0 12px 0;">${title}</h1>
        <p style="color:#4b5563;margin:0;">${message}</p>
      </div>
    </body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function handle(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('e') || '';
  const token = request.nextUrl.searchParams.get('t') || '';
  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return null;
  }
  await addUnsubscribe(email);
  return true;
}

// Link in the email footer
export async function GET(request: NextRequest) {
  try {
    if (!(await handle(request))) {
      return page('Invalid link', 'This unsubscribe link is invalid or incomplete.', 400);
    }
    return page("You're unsubscribed", "You won't receive any more messages sent through First Mentor.");
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return page('Something went wrong', 'Please try again later.', 500);
  }
}

// One-click unsubscribe from email clients (List-Unsubscribe-Post)
export async function POST(request: NextRequest) {
  try {
    if (!(await handle(request))) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }
    return NextResponse.json({ status: 'unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
