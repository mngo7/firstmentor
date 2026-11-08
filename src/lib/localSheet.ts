import fs from 'fs';

// Local stand-in for the Google Sheets API, used when LOCAL_SHEET_FILE is set.
// Data lives in a JSON file ({ "<tab name>": string[][] }) so local testing never touches the real sheet.
// Only the calls this app makes are implemented: values.get / update / append, get, batchUpdate(addSheet).

type Tabs = Record<string, string[][]>;

const DEFAULT_TAB = 'Sheet1';

function load(file: string): Tabs {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function save(file: string, tabs: Tabs) {
  fs.writeFileSync(file, JSON.stringify(tabs));
}

function colToIndex(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function parseRange(range: string) {
  let tab = DEFAULT_TAB;
  let ref = range;
  const bang = range.lastIndexOf('!');
  if (bang >= 0) {
    tab = range.slice(0, bang).replace(/^'|'$/g, '');
    ref = range.slice(bang + 1);
  }
  const [start, end = start] = ref.split(':');
  const cell = (s: string) => {
    const m = /^([A-Za-z]+)(\d*)$/.exec(s);
    if (!m) throw new Error(`Unsupported range: ${range}`);
    return { col: colToIndex(m[1]), row: m[2] ? parseInt(m[2], 10) - 1 : null };
  };
  const a = cell(start);
  const b = cell(end);
  return { tab, startCol: a.col, startRow: a.row ?? 0, endCol: b.col, endRow: b.row };
}

function trimRow(row: string[]) {
  const out = [...row];
  while (out.length && (out[out.length - 1] ?? '') === '') out.pop();
  return out;
}

export function createLocalSheetsClient(file: string) {
  const tabFor = (tabs: Tabs, name: string) => {
    if (!tabs[name]) throw new Error(`Unable to parse range: sheet "${name}" not found`);
    return tabs[name];
  };

  return {
    spreadsheets: {
      async get() {
        const tabs = load(file);
        return {
          data: {
            sheets: Object.keys(tabs).map(title => ({
              properties: { title, gridProperties: { rowCount: tabs[title].length, columnCount: 37 } },
            })),
          },
        };
      },
      async batchUpdate({ requestBody }: any) {
        const tabs = load(file);
        for (const req of requestBody?.requests || []) {
          const title = req.addSheet?.properties?.title;
          if (title && !tabs[title]) tabs[title] = [];
        }
        save(file, tabs);
        return { data: {} };
      },
      values: {
        async get({ range }: any) {
          const tabs = load(file);
          const r = parseRange(range);
          const rows = tabFor(tabs, r.tab);
          const last = r.endRow === null ? rows.length - 1 : Math.min(r.endRow, rows.length - 1);
          const values: string[][] = [];
          for (let i = r.startRow; i <= last; i++) {
            values.push(trimRow((rows[i] || []).slice(r.startCol, r.endCol + 1)));
          }
          while (values.length && values[values.length - 1].length === 0) values.pop();
          return { data: { values: values.length ? values : undefined } };
        },
        async update({ range, requestBody }: any) {
          const tabs = load(file);
          const r = parseRange(range);
          const rows = tabFor(tabs, r.tab);
          (requestBody.values as any[][]).forEach((vals, i) => {
            const rowIdx = r.startRow + i;
            while (rows.length <= rowIdx) rows.push([]);
            vals.forEach((v, j) => {
              const row = rows[rowIdx];
              while (row.length <= r.startCol + j) row.push('');
              row[r.startCol + j] = v === null || v === undefined ? '' : String(v);
            });
          });
          save(file, tabs);
          return { data: {} };
        },
        async append({ range, requestBody }: any) {
          const tabs = load(file);
          const r = parseRange(range);
          const rows = tabFor(tabs, r.tab);
          for (const vals of requestBody.values as any[][]) {
            rows.push(vals.map(v => (v === null || v === undefined ? '' : String(v))));
          }
          save(file, tabs);
          return { data: {} };
        },
      },
    },
  };
}
