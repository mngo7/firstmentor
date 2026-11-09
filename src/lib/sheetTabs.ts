import { getGoogleSheetsClient } from './googleSheets';

// Helpers for the extra tabs the app keeps in the spreadsheet (messages, message log).
// Tabs are created on first write.

async function ensureTab(title: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
  if (!meta.data.sheets?.some(s => s.properties?.title === title)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
  }
}

export async function readTab(title: string, columns = 'A:Z'): Promise<string[][]> {
  const sheets = await getGoogleSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `'${title}'!${columns}`,
    });
    return (res.data.values || []) as string[][];
  } catch {
    return []; // tab doesn't exist yet
  }
}

export async function appendToTab(title: string, rows: string[][], columns = 'A:Z') {
  await ensureTab(title);
  const sheets = await getGoogleSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `'${title}'!${columns}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}
