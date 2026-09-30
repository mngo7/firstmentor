import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateUserProfile } from '@/lib/googleSheets';

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // 不允许更新某些敏感字段
    const forbiddenFields = ['email', 'password', 'isVerified', 'verificationToken'];
    forbiddenFields.forEach(field => {
      if (updates[field]) {
        delete updates[field];
      }
    });

    // 更新用户信息
    const result = await updateUserProfile(session.email, updates);
    
    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
