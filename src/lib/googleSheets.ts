import { google } from 'googleapis';

// 州缩写到全称的映射表
const STATE_ABBREVIATION_MAP: { [key: string]: string } = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia',
};

// 映射表单字段到 Google Sheet 列
export const SHEET_COLUMN_MAPPING = {
  firstName: 'D',           // First Name
  lastName: 'R',           // Last Name
  role: 'Q',               // Your Role
  program: 'C',            // Program (FRC/FTC/FLL Challenge/FLL Explore)
  teamNumber: 'E',         // Team Number (for high-school/coach)
  teamName: 'F',           // Team Name (for high-school/coach)
  universityName: 'Y',     // University Name (for university student)
  companyName: 'Z',        // Company Name (for professional)
  affiliation: 'AA',       // Affiliation (for others)
  major: 'AB',             // Your Major (for university student)
  jobCategory: 'AC',       // Job Title (for professional)
  otherSpecialties: 'AD',  // Your Specialties (for others)
  volunteerHoursCreditedTo: 'S', // Volunteer hours credited to which team/person
  country: 'A',            // Country
  state: 'B',              // State
  postCode: 'T',           // Post Code
  isMentor: 'K',           // I want to be a mentor
  isMentee: 'L',           // I want to be a mentee
  mentorSpecialties: 'H',  // Areas you can help with
  availability: 'J',       // When are you available
  mentorExperience: 'I',   // Mentoring Experience
  menteeNeeds: 'U',        // Areas you need help with
  menteePreferredMeeting: 'V', // When would you like to meet
  menteeRequiredExperience: 'W', // Preferred mentor experience
  additionalInfo: 'P',     // Additional Information
  website: 'N',            // Team/Personal Website
  linkedin: 'O',           // LinkedIn Profile
  email: 'G',              // Email Address
  password: 'X',           // Password
  verificationToken: 'AE', // Email Verification Token
  isVerified: 'AF',        // Email Verified Status
  volunteerMentoring: 'AG', // Volunteer Mentoring
  paidMentoring: 'AH',     // Paid Mentoring
  hourlyRateRange: 'AI',   // Hourly Rate Range
  mentorPrograms: 'AJ',    // Programs (Mentoring preference)
  membershipType: 'AK'     // Membership Type (legacy, no longer written)
};

// Google Sheets 客户端设置
export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// 添加新行到 Google Sheet
export async function appendToSheet(values: any[]) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const range = 'A:AK'; // 覆盖所有列 (A-AK = 37列)

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW', // RAW so user input is never evaluated as a formula
      requestBody: {
        values: [values],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw error;
  }
}

// 根据邮箱查找用户
export async function getUserByEmail(email: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const range = 'A:AK'; // 读取到 Column AK

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return null;
    }

    // 第一行是标题，从第二行开始查找
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const emailInSheet = row[6]; // Column G (index 6) is email
      
      if (emailInSheet && emailInSheet.toLowerCase() === email.toLowerCase()) {
        const verifiedValue = row[31]; // Column AF - Verification Status
        const isVerified = verifiedValue && verifiedValue.toLowerCase() === 'yes';
        
        return {
          rowIndex: i, // 保存行索引，用于更新
          email: row[6], // Column G - Email
          password: row[23], // Column X - Password (hashed)
          firstName: row[3], // Column D - First Name
          lastName: row[17], // Column R - Last Name
          role: row[16], // Column Q - Role
          program: row[2], // Column C - Program
          teamNumber: row[4], // Column E - Team Number
          teamName: row[5], // Column F - Team Name
          universityName: row[24], // Column Y - University Name
          companyName: row[25], // Column Z - Company Name
          affiliation: row[26], // Column AA - Affiliation
          major: row[27], // Column AB - Major
          jobCategory: row[28], // Column AC - Job Category
          otherSpecialties: row[29], // Column AD - Other Specialties
          contributeTo: row[18], // Column S - Contribute To
          country: row[0], // Column A - Country
          state: row[1], // Column B - State
          postCode: row[19], // Column T - Post Code
          isMentor: row[10], // Column K - I want to be a mentor
          isMentee: row[11], // Column L - I want to be a mentee
          mentorSpecialties: row[7], // Column H - Areas you can help with
          availability: row[9], // Column J - When are you available
          mentorExperience: row[8], // Column I - Mentoring Experience
          menteeNeeds: row[20], // Column U - Areas you need help with
          menteePreferredMeeting: row[21], // Column V - When would you like to meet
          menteeRequiredExperience: row[22], // Column W - Preferred mentor experience
          additionalInfo: row[15], // Column P - Additional Information
          website: row[13], // Column N - Team/Personal Website
          linkedin: row[14], // Column O - LinkedIn Profile
          isVerified: isVerified, // Column AF - Verification Status (case-insensitive)
          volunteerMentoring: row[32], // Column AG - Volunteer Mentoring
          paidMentoring: row[33], // Column AH - Paid Mentoring
          hourlyRateRange: row[34], // Column AI - Hourly Rate Range
          volunteerHoursCreditedTo: row[18], // Column S - Volunteer hours credited to
          mentorPrograms: row[35], // Column AJ - Programs (Mentoring preference)
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

// 将表单数据转换为 Google Sheet 行数据
export function convertFormDataToSheetRow(formData: any) {
  // 创建一个包含 37 列的数组（A 到 AK）
  const rowData = Array(37).fill('');

  // 特殊处理：根据 role 分配 affiliation 到不同列
  const role = formData.role;
  const affiliationValue = formData.affiliation;
  const majorValue = formData.major;
  const jobCategoryValue = formData.jobCategory;
  const otherSpecialtiesValue = formData.otherSpecialties;

  // 辅助函数：将字符串首字母大写
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // 遍历映射关系，将数据放入正确的位置
  Object.entries(SHEET_COLUMN_MAPPING).forEach(([field, column]) => {
    let columnIndex: number;
    
    // 处理特殊列（AA=26, AB=27, AC=28, AD=29, AE=30, AF=31, AG=32, AH=33, AI=34, AJ=35, AK=36）
    if (column === 'AA') {
      columnIndex = 26;
    } else if (column === 'AB') {
      columnIndex = 27;
    } else if (column === 'AC') {
      columnIndex = 28;
    } else if (column === 'AD') {
      columnIndex = 29;
    } else if (column === 'AE') {
      columnIndex = 30;
    } else if (column === 'AF') {
      columnIndex = 31;
    } else if (column === 'AG') {
      columnIndex = 32;
    } else if (column === 'AH') {
      columnIndex = 33;
    } else if (column === 'AI') {
      columnIndex = 34;
    } else if (column === 'AJ') {
      columnIndex = 35;
    } else if (column === 'AK') {
      columnIndex = 36;
    } else {
      columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);
    }

    let value = formData[field];

    // 特殊处理：根据 role 将 affiliation 分配到不同列
    if (field === 'teamNumber' || field === 'teamName') {
      // 只有 high-school 或 coach 才有 team number 和 team name
      if (role !== 'high-school' && role !== 'coach') {
        value = '';
      }
    } else if (field === 'universityName') {
      // 只有 university 才有 university name
      value = role === 'university' ? affiliationValue : '';
    } else if (field === 'companyName') {
      // 只有 professional 才有 company name
      value = role === 'professional' ? affiliationValue : '';
    } else if (field === 'affiliation') {
      // 只有 others 才有 affiliation
      value = role === 'others' ? affiliationValue : '';
    } else if (field === 'major') {
      // 只有 university 才有 major，并且首字母大写
      value = role === 'university' ? capitalizeFirstLetter(majorValue) : '';
    } else if (field === 'jobCategory') {
      // 只有 professional 才有 job category，并且首字母大写
      value = role === 'professional' ? capitalizeFirstLetter(jobCategoryValue) : '';
    } else if (field === 'otherSpecialties') {
      // 只有 others 才有 other specialties，并且首字母大写
      value = role === 'others' ? capitalizeFirstLetter(otherSpecialtiesValue) : '';
    } else if (field === 'isMentor') {
      // 只有选择了 mentor 才填入数据，否则留空
      value = value ? 'Yes' : '';
    } else if (field === 'isMentee') {
      // 只有选择了 mentee 才填入数据，否则留空
      value = value ? 'Yes' : '';
    } else if (field === 'state') {
      // 如果国家不是 United States，将国家名填入 state 字段
      const country = formData.country || '';
      const countryLower = country.toLowerCase().trim();
      
      if (countryLower !== 'united states' && countryLower !== 'usa' && countryLower !== 'us') {
        // 如果不是美国，用国家名填充 state 字段
        value = country;
      } else {
        // 如果是美国，处理州缩写转换
        if (value && typeof value === 'string') {
          const upperValue = value.toUpperCase().trim();
          value = STATE_ABBREVIATION_MAP[upperValue] || value;
        }
      }
    }

    // 特殊处理数组类型的数据
    if (Array.isArray(value)) {
      value = value.join(', ');
    }
    // 特殊处理布尔值（但不包括 isMentor 和 isMentee，它们已经在上面处理了）
    else if (typeof value === 'boolean' && field !== 'isMentor' && field !== 'isMentee') {
      value = value ? 'Yes' : 'No';
    }
    // 不要清空 password、verificationToken 和 isVerified 字段
    // 它们需要正常存储

    rowData[columnIndex] = value || '';
  });

  return rowData;
}

// 更新用户的邮箱验证状态
export async function updateEmailVerification(email: string, isVerified: boolean = true) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const range = 'A:AF'; // 读取所有数据

  try {
    // 1. 获取所有数据
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return null;
    }

    // 2. 查找用户行
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const emailInSheet = row[6]; // Column G (index 6) is email
      
      if (emailInSheet && emailInSheet.toLowerCase() === email.toLowerCase()) {
        // 3. 更新验证状态（Column AF, index 31）
        const updateRange = `AF${i + 1}`; // +1 because sheets are 1-indexed
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: updateRange,
          valueInputOption: 'RAW', // RAW so user input is never evaluated as a formula
          requestBody: {
            values: [['Yes']],
          },
        });

        // 4. 清除验证token（Column AE, index 30）
        const tokenRange = `AE${i + 1}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: tokenRange,
          valueInputOption: 'RAW', // RAW so user input is never evaluated as a formula
          requestBody: {
            values: [['']],
          },
        });

        return true;
      }
    }

    return null;
  } catch (error) {
    console.error('Error updating email verification:', error);
    throw error;
  }
}

// 根据验证token查找用户
export async function getUserByVerificationToken(token: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const range = 'A:AF';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return null;
    }

    // 查找匹配token的用户
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const tokenInSheet = row[30]; // Column AE (index 30) is verification token
      
      if (tokenInSheet && tokenInSheet === token) {
        const verifiedValue = row[31]; // Column AF
        const isVerified = verifiedValue && verifiedValue.toLowerCase() === 'yes';
        
        return {
          email: row[6], // Column G
          firstName: row[3], // Column D
          lastName: row[17], // Column R
          isVerified: isVerified, // Column AF (case-insensitive)
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching user by token:', error);
    throw error;
  }
}

// 更新用户密码
export async function updateUserPassword(email: string, hashedPassword: string) {
  try {
    console.log('🔐 Updating password for:', email);
    
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
    const rowNumber = user.rowIndex + 1; // Sheets 是 1-indexed

    // Column X (index 23) for password
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `X${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[hashedPassword]],
      },
    });
    
    console.log('✅ Password updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating password:', error);
    throw error;
  }
}

// 更新用户信息
export async function updateUserProfile(email: string, updates: any) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const range = 'A:AF';

  try {
    // 1. 查找用户行
    const user = await getUserByEmail(email);
    if (!user || !user.rowIndex) {
      return null;
    }

    const rowNumber = user.rowIndex + 1; // Sheets 是 1-indexed

    // 2. 根据字段更新对应的列
    const updatePromises = Object.entries(updates).map(async ([field, value]) => {
      const column = SHEET_COLUMN_MAPPING[field as keyof typeof SHEET_COLUMN_MAPPING];
      if (!column) {
        console.warn(`Unknown field: ${field}`);
        return;
      }

      const updateRange = `${column}${rowNumber}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: 'RAW', // RAW so user input is never evaluated as a formula
        requestBody: {
          values: [[value || '']],
        },
      });
    });

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
