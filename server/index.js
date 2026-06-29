import express from 'express';
import path from 'path';
import fs from 'fs';
import { getAuthClient } from '../scripts/playlist-publish/lib/auth.js';
import { readRows } from '../scripts/playlist-publish/lib/sheets.js';
import { listPlaylistNames, loadPlaylistConfig } from '../scripts/playlist-publish/lib/config.js';
import { runThumbnailStep, runVideoStep, runUploadStep } from '../scripts/playlist-publish/lib/pipeline.js';
import { createJob, getJob } from './jobs.js';

const app = express();
app.use(express.json());

function findRow(rows, rowNumber) {
  const row = rows.find((r) => r._row === rowNumber);
  if (!row) throw new Error(`Row ${rowNumber} not found`);
  return row;
}

function isPathInsideAllowedDirs(filePath, playlistConfig) {
  const allowed = [
    playlistConfig.output.thumbnailsDir,
    playlistConfig.output.videosDir,
    playlistConfig.output.tempDir,
  ].map((d) => path.resolve(d));
  const resolved = path.resolve(filePath);
  return allowed.some((dir) => resolved === dir || resolved.startsWith(dir + path.sep));
}

app.get('/api/playlists', (req, res) => {
  try {
    res.json({ playlists: listPlaylistNames() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/playlists/:name/rows', async (req, res) => {
  try {
    const playlistConfig = loadPlaylistConfig(req.params.name);
    const auth = getAuthClient();
    const rows = await readRows(auth, playlistConfig.spreadsheet);
    res.json({ rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/playlists/:name/file', (req, res) => {
  try {
    const playlistConfig = loadPlaylistConfig(req.params.name);
    const filePath = req.query.path;
    if (!filePath || !isPathInsideAllowedDirs(filePath, playlistConfig)) {
      return res.status(403).json({ error: 'Path not allowed' });
    }
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function startStepJob(req, res, stepName, fn) {
  try {
    const playlistConfig = loadPlaylistConfig(req.params.name);
    const rowNumber = parseInt(req.params.row, 10);

    const jobId = createJob(async (log) => {
      const auth = getAuthClient();
      const rows = await readRows(auth, playlistConfig.spreadsheet);
      const row = findRow(rows, rowNumber);
      log(`Starting ${stepName} for row ${rowNumber}: "${row.title}"`);
      return fn({ auth, playlistConfig, row, log });
    });

    res.json({ jobId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/playlists/:name/rows/:row/thumbnail', (req, res) => {
  startStepJob(req, res, 'thumbnail', async ({ playlistConfig, row, log }) => {
    return runThumbnailStep(playlistConfig, row, log);
  });
});

app.post('/api/playlists/:name/rows/:row/video', (req, res) => {
  startStepJob(req, res, 'video', async ({ playlistConfig, row, log }) => {
    return runVideoStep(playlistConfig, row, req.body?.backgroundImage, log);
  });
});

app.post('/api/playlists/:name/rows/:row/upload', (req, res) => {
  startStepJob(req, res, 'upload', async ({ auth, playlistConfig, row, log }) => {
    const { videoPath, thumbnailPath } = req.body || {};
    if (!videoPath || !thumbnailPath) throw new Error('videoPath and thumbnailPath are required');
    return runUploadStep(auth, playlistConfig, row, videoPath, thumbnailPath, log);
  });
});

app.post('/api/playlists/:name/rows/:row/all', (req, res) => {
  startStepJob(req, res, 'full pipeline', async ({ auth, playlistConfig, row, log }) => {
    const { thumbnailPath, backgroundImage } = await runThumbnailStep(playlistConfig, row, log);
    const { videoPath } = await runVideoStep(playlistConfig, row, backgroundImage, log);
    const { videoId, videoUrl } = await runUploadStep(auth, playlistConfig, row, videoPath, thumbnailPath, log);
    return { thumbnailPath, videoPath, videoId, videoUrl };
  });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

const PORT = process.env.PLAYLIST_SERVER_PORT || 8787;
app.listen(PORT, () => {
  console.log(`playlist-publish API server listening on http://localhost:${PORT}`);
});
