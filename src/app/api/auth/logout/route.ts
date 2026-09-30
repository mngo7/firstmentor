import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await deleteSessionCookie();
    
    return NextResponse.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
