import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/googleSheets';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 从 Google Sheets 获取最新的用户完整信息
    const user = await getUserByEmail(session.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 返回用户信息（不包含密码和敏感信息）
    const { password, rowIndex, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}
