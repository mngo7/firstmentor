import { NextRequest, NextResponse } from 'next/server';
import { getAllProfiles, isVisibleProfile, toPublicProfile } from '@/lib/profiles';
import { getSession } from '@/lib/auth';

// 禁用缓存，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    let data = await getAllProfiles();

    // 旧的 profile 链接使用 email（/profile/<email>），仅允许已登录用户按 email 查找
    const legacyEmail = request.nextUrl.searchParams.get('email');
    if (legacyEmail) {
      if (!(await getSession())) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      data = data.filter(profile => profile.email.toLowerCase() === legacyEmail.trim().toLowerCase());
    }

    // 隐藏空白账号（没有姓名、队伍信息的注册账号），并且不向浏览器暴露 email
    const publicProfiles = data.filter(isVisibleProfile).map(toPublicProfile);

    // 设置响应头，禁用浏览器和CDN缓存
    const response = NextResponse.json(publicProfiles);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}