import { google } from 'googleapis';

function columnLetterToIndex(letter) {
  let index = 0;
  for (const char of letter.toUpperCase()) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }
  return index - 1; // 0-based
}

/**
 * Reads all rows after the header row and returns plain objects keyed by the
 * field names defined in `columns` (e.g. { title: 'A', status: 'H', ... }).
 * Each row also carries its 1-based sheet row number as `_row`.
 */
export async function readRows(auth, { spreadsheetId, sheetName, headerRow = 1, columns }) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });
  const values = res.data.values || [];

  const rows = [];
  for (let i = headerRow; i < values.length; i++) {
    const raw = values[i] || [];
    const row = { _row: i + 1, _raw: raw };
    for (const [field, letter] of Object.entries(columns)) {
      const idx = columnLetterToIndex(letter);
      row[field] = raw[idx] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

/** Writes a single cell, e.g. updateCell(auth, cfg, 5, 'H', 'uploaded') */
export async function updateCell(auth, { spreadsheetId, sheetName }, rowNumber, columnLetter, value) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!${columnLetter}${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] },
  });
}

/** Writes multiple fields for a row at once, e.g. { status: 'H', videoId: 'I' } */
export async function updateRow(auth, sheetCfg, rowNumber, fieldUpdates) {
  for (const [field, value] of Object.entries(fieldUpdates)) {
    const letter = sheetCfg.columns[field];
    if (!letter) continue;
    await updateCell(auth, sheetCfg, rowNumber, letter, value);
  }
}
