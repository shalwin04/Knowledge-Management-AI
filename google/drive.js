import { google } from 'googleapis';

/**
 * Lists the first 10 files in the user's Drive, including MIME type.
 */
export async function listDriveFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType)',  // ✅ Add mimeType here
  });

  const files = res.data.files;
  if (!files || files.length === 0) {
    console.log('🗃️ No files found.');
    return [];
  }

  console.log('📂 Files:');
  files.forEach((file) => {
    console.log(`${file.name} (${file.id}) - ${file.mimeType}`);
  });

  return files;
}
