#!/usr/bin/env node
// One-time OAuth setup. Usage:
//   node scripts/playlist-publish/authorize.js [path/to/credentials.json]
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { SCOPES, TOKEN_PATH } from './lib/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const credentialsArg = process.argv[2];
const credentialsPath = credentialsArg
  ? path.resolve(credentialsArg)
  : path.join(__dirname, 'config', 'credentials.json');

if (!fs.existsSync(credentialsPath)) {
  console.error(`credentials.json not found at ${credentialsPath}`);
  console.error('Download an OAuth "Desktop app" client JSON from Google Cloud Console.');
  process.exit(1);
}

const targetCredentialsPath = path.join(__dirname, 'config', 'credentials.json');
if (path.resolve(credentialsPath) !== path.resolve(targetCredentialsPath)) {
  fs.copyFileSync(credentialsPath, targetCredentialsPath);
  console.log(`Copied credentials to ${targetCredentialsPath}`);
}

const credentials = JSON.parse(fs.readFileSync(targetCredentialsPath, 'utf-8'));
const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

console.log('Open this URL in your browser, sign in, and grant access:\n');
console.log(authUrl);
console.log();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste the authorization code here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());
    fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log(`Saved token to ${TOKEN_PATH}`);
  } catch (err) {
    console.error('Failed to exchange authorization code:', err.message);
    process.exit(1);
  }
});
