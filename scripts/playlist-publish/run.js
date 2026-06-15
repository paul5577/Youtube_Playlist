#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAuthClient } from './lib/auth.js';
import { readRows, updateRow } from './lib/sheets.js';
import { generateThumbnail } from './lib/thumbnail.js';
import { buildVideo } from './lib/video.js';
import { uploadVideo } from './lib/youtube.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { upload: true };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--playlist':
        args.playlist = argv[++i];
        break;
      case '--row':
        args.row = parseInt(argv[++i], 10);
        break;
      case '--all':
        args.all = true;
        break;
      case '--no-upload':
        args.upload = false;
        break;
      default:
        throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }
  return args;
}

function loadPlaylistConfig(name) {
  const configPath = path.join(__dirname, 'config', 'playlists.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Config not found at ${configPath}. Copy playlists.example.json to playlists.json and fill it in.`
    );
  }
  const all = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const cfg = all.playlists?.[name];
  if (!cfg) {
    const available = Object.keys(all.playlists || {}).join(', ') || '(none)';
    throw new Error(`Playlist "${name}" not found in config. Available: ${available}`);
  }
  return cfg;
}

function isReady(status) {
  const s = (status || '').trim().toLowerCase();
  return s === '' || s === 'ready';
}

async function processRow(auth, playlistConfig, row, { upload }) {
  console.log(`\n=== Row ${row._row}: "${row.title}" ===`);

  const backgroundImage = (row.backgroundImage && row.backgroundImage.trim())
    || playlistConfig.thumbnail.templateImage;

  console.log('Generating thumbnail...');
  const thumbnailPath = await generateThumbnail(playlistConfig, row);
  console.log(`  -> ${thumbnailPath}`);

  console.log('Building video (intro + content + outro)...');
  const { videoPath, audioPath } = await buildVideo(playlistConfig, row, backgroundImage);
  console.log(`  -> ${videoPath}`);
  console.log(`  audio: ${audioPath}`);

  if (!upload) {
    console.log('Skipping YouTube upload (--no-upload).');
    return;
  }

  console.log('Uploading to YouTube as private...');
  const { videoId, videoUrl } = await uploadVideo(auth, playlistConfig, row, videoPath, thumbnailPath);
  console.log(`  -> ${videoUrl}`);

  await updateRow(auth, playlistConfig.spreadsheet, row._row, {
    status: 'uploaded',
    videoId,
    videoUrl,
  });
  console.log('  sheet updated.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.playlist) throw new Error('Missing --playlist <name>');
  if (!args.row && !args.all) throw new Error('Specify --row <n> or --all');

  const playlistConfig = loadPlaylistConfig(args.playlist);
  const auth = getAuthClient();

  const rows = await readRows(auth, playlistConfig.spreadsheet);

  const targets = args.all
    ? rows.filter((r) => isReady(r.status))
    : rows.filter((r) => r._row === args.row);

  if (targets.length === 0) {
    console.log('No matching rows to process.');
    return;
  }

  for (const row of targets) {
    try {
      await processRow(auth, playlistConfig, row, { upload: args.upload });
    } catch (err) {
      console.error(`  ERROR on row ${row._row}: ${err.message}`);
      if (args.upload) {
        await updateRow(auth, playlistConfig.spreadsheet, row._row, { status: `error: ${err.message}` });
      }
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
