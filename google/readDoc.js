import { google } from 'googleapis';

/**
 * Reads text content from one or more Google Docs files.
 * 
 * @param {object} auth - An authorized OAuth2 client
 * @param {string|string[]} fileIds - A single file ID or array of Google Docs file IDs
 * @returns {Promise<object[]>} - Array of { fileId, content }
 */
export async function readGoogleDoc(auth, fileIds) {
  const docs = google.docs({ version: 'v1', auth });

  const ids = Array.isArray(fileIds) ? fileIds : [fileIds];
  const results = [];

  for (const fileId of ids) {
    try {
      const res = await docs.documents.get({ documentId: fileId });

      const content = res.data.body.content
        .map(elem =>
          elem.paragraph?.elements
            ?.map(e => e.textRun?.content || '')
            .join('') || ''
        )
        .join('\n');

      console.log(`📄 Content from File ID: ${fileId}:\n${content}\n`);

      results.push({ fileId, content });
    } catch (error) {
      console.error(`❌ Failed to read document with ID ${fileId}:`, error.message);
      results.push({ fileId, content: null, error: error.message });
    }
  }

  return results;
}
