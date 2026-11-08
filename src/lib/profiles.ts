import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { profileIdFor } from './security';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_INDEX = 0; // 假设数据在第一个表格中

async function getAuthToken() {
  const credentials = {
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  };

  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

// 读取所有 profile（包含 email，仅供服务端使用，不能直接返回给浏览器）
export async function getAllProfiles() {
  try {
    const auth = await getAuthToken();
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID!, auth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[SHEET_INDEX];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    // Debug: log headers to see the actual column names
    console.log('📋 Sheet headers:', sheet.headerValues);
    console.log('📧 Column G header (index 6):', sheet.headerValues[6]);
    
    return rows.map((row, idx) => {
      // Get each cell's value directly by column letter
      // Access data through toObject() method
      const rowData = row.toObject();
      
      // Get the header row to find the column names
      const headers = sheet.headerValues;
      
      // Find the index of our target columns
      const countryIndex = 0;   // Column A is index 0
      const stateIndex = 1;     // Column B is index 1
      const programIndex = 2;   // Column C is index 2
      const nameIndex = 3;      // Column D is index 3
      const teamNumberIndex = 4; // Column E is index 4
      const teamNameIndex = 5;  // Column F is index 5
      const emailIndex = 6;     // Column G is index 6
      const mentorSpecialtiesIndex = 7;  // Column H is index 7
      const mentorExperienceIndex = 8;   // Column I is index 8
      const availabilityIndex = 9;       // Column J is index 9
      const mentorIndex = 10;   // Column K is index 10
      const menteeIndex = 11;   // Column L is index 11
      const teamWebsiteIndex = 12;       // Column M is index 12
      const websiteIndex = 13;           // Column N is index 13
      const linkedinIndex = 14;          // Column O is index 14
      const aboutIndex = 15;    // Column P is index 15
      const roleIndex = 16;     // Column Q is index 16
      const lastNameIndex = 17;      // Column R is index 17
      const menteeNeedsIndex = 20;  // Column U is index 20
      const menteePreferredMeetingIndex = 21;  // Column V is index 21
      const menteeRequiredExpIndex = 22;  // Column W is index 22
      const universityNameIndex = 24;  // Column Y is index 24
      const companyNameIndex = 25;     // Column Z is index 25
      const affiliationIndex = 26;     // Column AA is index 26
      const majorIndex = 27;           // Column AB is index 27
      const jobCategoryIndex = 28;     // Column AC is index 28
      const otherSpecialtiesIndex = 29; // Column AD is index 29
      const mentorProgramsIndex = 35;  // Column AJ is index 35

      // Get email from Column G using the header name
      const emailHeader = headers[emailIndex];
      const rawEmail = (row.get(emailHeader) || '').trim();
      const email = rawEmail.includes('@') ? rawEmail : '';
      
      const country = row.get(headers[countryIndex]) || '';    // Get country from Column A
      const state = row.get(headers[stateIndex]) || '';       // Get state from Column B
      const programRaw = row.get(headers[programIndex]) || '';  // Get program from Column C
      const program = programRaw.trim() === '' ? 'Others' : programRaw;  // Set to 'Others' if Column C is empty
      const name = row.get(headers[nameIndex]) || '';
      const lastName = row.get(headers[lastNameIndex]) || '';  // Get last name from Column R
      const teamNumber = row.get(headers[teamNumberIndex]) || '';  // Get team number from Column E
      const teamName = row.get(headers[teamNameIndex]) || '';  // Get team name from Column F
      const role = row.get(headers[roleIndex]) || '';  // Get role from Column Q
      const mentorData = row.get(headers[mentorIndex]) || '';
      const menteeData = row.get(headers[menteeIndex]) || '';
      const about = row.get(headers[aboutIndex]) || '';  // Get about from Column P
      
      // Get mentor specialties from Column H
      const mentorSpecialties = row.get(headers[mentorSpecialtiesIndex]) || '';
      // Get mentor experience from Column I
      const mentorExperience = row.get(headers[mentorExperienceIndex]) || '';
      // Get availability from Column J
      const availability = row.get(headers[availabilityIndex]) || '';
      // Get mentee needs from Column U
      const menteeNeeds = row.get(headers[menteeNeedsIndex]) || '';
      // Get mentee preferred meeting from Column V
      const menteePreferredMeeting = row.get(headers[menteePreferredMeetingIndex]) || '';
      // Get mentee required experience from Column W
      const menteeRequiredExp = row.get(headers[menteeRequiredExpIndex]) || '';
      
      // Get website fields
      const teamWebsite = row.get(headers[teamWebsiteIndex]) || '';  // Column M
      const website = row.get(headers[websiteIndex]) || '';          // Column N
      const linkedin = row.get(headers[linkedinIndex]) || '';        // Column O
      
      // Get role-specific fields
      const universityName = row.get(headers[universityNameIndex]) || '';  // Column Y
      const companyName = row.get(headers[companyNameIndex]) || '';        // Column Z
      const affiliation = row.get(headers[affiliationIndex]) || '';        // Column AA
      const major = row.get(headers[majorIndex]) || '';                    // Column AB
      const jobCategory = row.get(headers[jobCategoryIndex]) || '';        // Column AC
      const otherSpecialties = row.get(headers[otherSpecialtiesIndex]) || ''; // Column AD
      const mentorPrograms = row.get(headers[mentorProgramsIndex]) || '';  // Column AJ

      return {
        id: profileIdFor({ email, teamNumber, firstName: name, lastName }),
        name,  // Use name from Column D
        lastName,  // Last name from Column R
        role: role,  // Use role from Column Q (Mentor Type)
        program,  // Program from Column C
        teamNumber,
        teamName,
        teamOrCompany: row.get('Team/Company') || '',
        country, // Use country from Column A
        state: row.get('State') || '',
        isMentor: !!mentorData,  // Convert to boolean based on whether Column K has data
        isMentee: !!menteeData,  // Convert to boolean based on whether Column L has data
        
        // Role-specific fields
        major,           // Column AB
        universityName,  // Column Y
        jobCategory,     // Column AC
        companyName,     // Column Z
        otherSpecialties, // Column AD
        affiliation,     // Column AA
        
        mentorSpecialties: mentorSpecialties.split(',').map((s: string) => s.trim()).filter(Boolean),  // Column H
        mentorExperience: mentorExperience || 'Coming soon...',  // Column I
        menteeNeeds: menteeNeeds.split(',').map((s: string) => s.trim()).filter(Boolean),  // Column U
        menteePreferredMeeting: menteePreferredMeeting.split(',').map((s: string) => s.trim()).filter(Boolean),  // Column V
        menteeRequiredExperience: menteeRequiredExp || '',  // Column W
        availability: availability.split(',').map((s: string) => s.trim()).filter(Boolean),  // Column J
        mentorPrograms: mentorPrograms.split(',').map((s: string) => s.trim()).filter(Boolean),  // Column AJ
        teamWebsite,      // Column M
        website,          // Column N
        linkedin,         // Column O
        detailedDescription: about || 'Coming soon...',  // Column P - About
        email,            // Column G
      };
    });
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    throw error;
  }
}

