import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

export const TOKEN_PATH = path.join(__dirname, '..', 'config', 'token.json');

export function getAuthClient(credentialsPath = path.join(__dirname, '..', 'config', 'credentials.json')) {
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      `Google OAuth credentials not found at ${credentialsPath}.\n` +
      `Download a "Desktop app" OAuth client JSON from Google Cloud Console and save it there.`
    );
  }
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(
      `No stored token found at ${TOKEN_PATH}.\n` +
      `Run: node scripts/playlist-publish/authorize.js ${credentialsPath}`
    );
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  oAuth2Client.setCredentials(token);

  oAuth2Client.on('tokens', (tokens) => {
    const merged = { ...token, ...tokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
  });

  return oAuth2Client;
}
