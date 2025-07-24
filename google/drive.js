import { google } from 'googleapis';

/**
 * Lists the first 10 files in the user's Drive, including metadata like creation date.
 */
export async function listDriveFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType, createdTime, modifiedTime, owners)', // ✅ extra fields
  });

  const files = res.data.files;
  if (!files || files.length === 0) {
    console.log('🗃️ No files found.');
    return [];
  }

  console.log('📂 Files with metadata:');
  files.forEach((file) => {
    console.log(`
📄 ${file.name} (${file.id})
📎 Type: ${file.mimeType}
📅 Created: ${file.createdTime}
🛠 Last Modified: ${file.modifiedTime}
👤 Owner: ${file.owners?.[0]?.displayName || 'Unknown'}
    `);
  });

  return files;
}
