#!/usr/bin/env node
import { getAuthClient } from './lib/auth.js';
import { readRows, updateRow } from './lib/sheets.js';
import { loadPlaylistConfig } from './lib/config.js';
import { runFullPipeline } from './lib/pipeline.js';

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

function isReady(status) {
  const s = (status || '').trim().toLowerCase();
  return s === '' || s === 'ready';
}

async function processRow(auth, playlistConfig, row, { upload }) {
  console.log(`\n=== Row ${row._row}: "${row.title}" ===`);
  const log = (msg) => console.log(`  ${msg}`);

  if (upload) {
    await runFullPipeline(auth, playlistConfig, row, log);
  } else {
    const { runThumbnailStep, runVideoStep } = await import('./lib/pipeline.js');
    const { backgroundImage } = await runThumbnailStep(playlistConfig, row, log);
    await runVideoStep(playlistConfig, row, backgroundImage, log);
    log('Skipping YouTube upload (--no-upload).');
  }
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
