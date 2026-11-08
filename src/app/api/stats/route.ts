import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/googleSheets';

// 每 5 分钟重新统计一次（否则会在构建时固定为静态结果）
export const revalidate = 300;

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = 'A:E'; // 读取 A-E 列（Country 和 Team Number）

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        registeredMembers: 0,
        firstTeams: 0,
        countriesServed: 0,
      });
    }

    // 1. Registered Members = 总行数 - 1（减去标题行）
    const registeredMembers = rows.length - 1;

    // 2. FIRST Teams = Column E 中不重复的 team number 数量
    const teamNumbers = new Set<string>();
    for (let i = 1; i < rows.length; i++) { // 从第二行开始（跳过标题）
      const teamNumber = rows[i][4]; // Column E (index 4)
      if (teamNumber && teamNumber.trim() !== '') {
        teamNumbers.add(teamNumber.trim());
      }
    }
    const firstTeams = teamNumbers.size;

    // 3. Countries Served = Column A 中不重复的 country 数量
    const countries = new Set<string>();
    for (let i = 1; i < rows.length; i++) { // 从第二行开始（跳过标题）
      const country = rows[i][0]; // Column A (index 0)
      if (country && country.trim() !== '') {
        countries.add(country.trim());
      }
    }
    const countriesServed = countries.size;

    return NextResponse.json({
      registeredMembers,
      firstTeams,
      countriesServed,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
