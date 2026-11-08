import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateUserProfile } from '@/lib/googleSheets';

const EDITABLE_FIELDS = [
  'firstName', 'lastName', 'role', 'program', 'teamNumber', 'teamName',
  'universityName', 'companyName', 'affiliation', 'major', 'jobCategory', 'otherSpecialties',
  'volunteerHoursCreditedTo', 'country', 'state', 'postCode',
  'isMentor', 'isMentee', 'mentorPrograms', 'mentorSpecialties', 'availability', 'mentorExperience',
  'menteeNeeds', 'menteePreferredMeeting', 'menteeRequiredExperience',
  'additionalInfo', 'website', 'linkedin',
];

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 只允许更新个人资料字段（不包括 email、password、验证状态等）
    const updates: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

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
