// Copies the real sheet into .local-data/sheet.json for local testing (read-only on the real sheet).
// Every email address is replaced with a fake one, and passwords/tokens are cleared,
// so the local copy can never email or log in as a real person.
//
// Usage (from docker-compose.local.yml): docker compose -f docker-compose.local.yml run --rm app node scripts/make-local-sheet.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');

function readEnvFile(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '');
  }
  return env;
}

(async () => {
  const env = { ...readEnvFile(path.join(__dirname, '..', '.env.local')), ...process.env };
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: (env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: env.GOOGLE_SHEETS_ID, range: 'A1:AK' });
  const rows = res.data.values || [];

  const fakeEmail = email => `contact-${crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 10)}@example.test`;
  const local = rows.map((row, i) => {
    if (i === 0) return row;
    const r = [...row];
    while (r.length < 37) r.push('');
    if ((r[6] || '').includes('@')) r[6] = fakeEmail(r[6].trim());
    if (r[23]) r[23] = 'existing-account-password-removed'; // keeps the row an account, but nobody can sign in as it
    r[30] = ''; // verification token
    if ((r[32] || '').length > 5) r[32] = ''; // old reset tokens left in the volunteer column
    if ((r[33] || '').length > 5) r[33] = '';
    return r;
  });

  const outDir = path.join(__dirname, '..', '.local-data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'sheet.json'), JSON.stringify({ Sheet1: local }));
  console.log(`Saved ${local.length - 1} rows to .local-data/sheet.json (emails anonymized)`);
})().catch(err => {
  console.error('Failed to copy sheet:', err.message);
  process.exit(1);
});
