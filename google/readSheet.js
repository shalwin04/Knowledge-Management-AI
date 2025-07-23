import { google } from 'googleapis';

/**
 * Reads data from one or more Google Sheets.
 *
 * @param {object} auth - An authorized OAuth2 client
 * @param {string|string[]} sheetIds - A single Sheet ID or array of Google Sheets file IDs
 * @returns {Promise<object[]>} - Array of { sheetId, content }
 */
export async function readGoogleSheet(auth, sheetIds) {
  const sheets = google.sheets({ version: 'v4', auth });

  const ids = Array.isArray(sheetIds) ? sheetIds : [sheetIds];
  const results = [];

  for (const sheetId of ids) {
    try {
      // Get metadata to list all sheet names
      const metadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const sheetTitles = metadata.data.sheets.map(s => s.properties.title);

      const allData = [];

      for (const title of sheetTitles) {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: `${title}`,
        });

        const values = response.data.values || [];

        allData.push({ sheet: title, values });
      }

      // ✅ Pretty print the result
      console.log(`📊 Content from Sheet ID: ${sheetId}:`);
      allData.forEach(({ sheet, values }) => {
        console.log(`\n🗂 Sheet: ${sheet}`);
        if (values.length === 0) {
          console.log('  (empty)');
        } else {
          values.forEach((row, i) => {
            console.log(`  Row ${i + 1}: ${row.join(' | ')}`);
          });
        }
      });
      console.log('\n');

      results.push({ sheetId, content: allData });
    } catch (error) {
      console.error(`❌ Failed to read sheet with ID ${sheetId}:`, error.message);
      results.push({ sheetId, content: null, error: error.message });
    }
  }

  return results;
}
