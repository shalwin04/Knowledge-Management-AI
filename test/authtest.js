import { authorize } from '../google/auth.js';
import { listDriveFiles } from '../google/drive.js';
import { readGoogleDoc } from '../google/readDoc.js';
import { readGoogleSheet } from '../google/readSheet.js'; // ✅ import new

async function main() {
  const auth = await authorize();
  const files = await listDriveFiles(auth);

  const googleDocs = files.filter(f => f.mimeType === 'application/vnd.google-apps.document');
  const googleSheets = files.filter(f => f.mimeType === 'application/vnd.google-apps.spreadsheet');

  if (googleDocs.length > 0) {
    console.log(`\n📖 Found ${googleDocs.length} Google Doc(s). Reading all...`);
    const docIds = googleDocs.map(doc => doc.id);
    await readGoogleDoc(auth, docIds);
  } else {
    console.log('⚠️ No Google Docs found.');
  }

  if (googleSheets.length > 0) {
    console.log(`\n📊 Found ${googleSheets.length} Google Sheet(s). Reading all...`);
    const sheetIds = googleSheets.map(sheet => sheet.id);
    await readGoogleSheet(auth, sheetIds);
  } else {
    console.log('⚠️ No Google Sheets found.');
  }
}

main().catch(console.error);
