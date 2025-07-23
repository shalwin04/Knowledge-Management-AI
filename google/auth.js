// google/auth.js
import fs from "fs/promises";
import { google } from "googleapis";
import readline from "readline";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents.readonly"
];

const CREDENTIALS_PATH = "credentials.json";
const TOKEN_PATH = "token.json";

export async function authorize() {
  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if token already exists
  try {
    const token = JSON.parse(await fs.readFile(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } catch (err) {
    return getNewToken(oAuth2Client);
  }
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("🔑 Authorize this app by visiting this URL:\n", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("📋 Enter the code from that page here: ", async (code) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
      console.log("✅ Token saved to", TOKEN_PATH);
      resolve(oAuth2Client);
    });
  });
}
