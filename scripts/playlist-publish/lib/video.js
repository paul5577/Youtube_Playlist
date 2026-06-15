import fs from 'fs';
import path from 'path';
import { run, getDuration, hasAudioStream } from './ffmpeg.js';
import { slugify } from './thumbnail.js';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.flac'];

/**
 * Resolves the audio file for a row.
 * - If row.audioFile is set, resolves it (absolute path, or relative to audioFolder).
 * - Otherwise, deterministically picks a file from audioFolder based on the row number,
 *   so the same row always maps to the same audio file.
 */
export function resolveAudioFile(playlistConfig, row) {
  const { audioFolder } = playlistConfig;

  if (row.audioFile && row.audioFile.trim()) {
    const p = row.audioFile.trim();
    const resolved = path.isAbsolute(p) ? p : path.join(audioFolder, p);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Audio file not found: ${resolved}`);
    }
    return resolved;
  }

  const files = fs.readdirSync(audioFolder)
    .filter((f) => AUDIO_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    throw new Error(`No audio files found in ${audioFolder}`);
  }

  const headerRow = playlistConfig.spreadsheet.headerRow ?? 1;
  const dataIndex = row._row - headerRow - 1; // 0-based index among data rows
  const file = files[((dataIndex % files.length) + files.length) % files.length];
  return path.join(audioFolder, file);
}

function parseResolution(resolution) {
  const [w, h] = resolution.split('x').map(Number);
  return { w, h };
}

/** Re-encodes a clip to a common resolution/fps and guarantees it has an audio track. */
async function normalizeSegment(inputPath, outputPath, { resolution, fps }) {
  const { w, h } = parseResolution(resolution);
  const vf = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}`;

  const audioPresent = await hasAudioStream(inputPath);

  if (audioPresent) {
    await run('ffmpeg', [
      '-y', '-i', inputPath,
      '-vf', vf,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-ar', '44100', '-ac', '2',
      outputPath,
    ]);
  } else {
    await run('ffmpeg', [
      '-y', '-i', inputPath,
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
      '-vf', vf,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-ar', '44100', '-ac', '2',
      '-map', '0:v:0', '-map', '1:a:0',
      '-shortest',
      outputPath,
    ]);
  }
}

/** Builds the main segment: still image (optionally with a slow zoom) synced to the audio length. */
async function buildMainSegment(imagePath, audioPath, outputPath, { resolution, fps, kenBurns }) {
  const { w, h } = parseResolution(resolution);
  const duration = await getDuration(audioPath);

  let vf;
  if (kenBurns) {
    const totalFrames = Math.max(1, Math.round(duration * fps));
    vf = `scale=${w * 2}:${h * 2},zoompan=z='min(zoom+0.0008,1.3)':d=${totalFrames}:s=${w}x${h}:fps=${fps},setsar=1`;
  } else {
    vf = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1,fps=${fps}`;
  }

  await run('ffmpeg', [
    '-y',
    '-loop', '1', '-i', imagePath,
    '-i', audioPath,
    '-vf', vf,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-ar', '44100', '-ac', '2',
    '-t', String(duration),
    '-shortest',
    outputPath,
  ]);

  return duration;
}

/** Concatenates normalized segments (all same resolution/fps/codec) into one file. */
async function concatSegments(segmentPaths, outputPath) {
  const args = ['-y'];
  for (const p of segmentPaths) args.push('-i', p);

  const n = segmentPaths.length;
  const filterParts = segmentPaths.map((_, i) => `[${i}:v][${i}:a]`).join('');
  const filter = `${filterParts}concat=n=${n}:v=1:a=1[outv][outa]`;

  args.push(
    '-filter_complex', filter,
    '-map', '[outv]', '-map', '[outa]',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-ar', '44100', '-ac', '2',
    outputPath
  );

  await run('ffmpeg', args);
}

/**
 * Builds the full video for a row: intro + (background image synced to audio) + outro.
 * Returns { videoPath, audioPath, backgroundImagePath }.
 */
export async function buildVideo(playlistConfig, row, backgroundImagePath) {
  const { video, output } = playlistConfig;
  const resolution = video.resolution ?? '1920x1080';
  const fps = video.fps ?? 30;

  fs.mkdirSync(output.videosDir, { recursive: true });
  fs.mkdirSync(output.tempDir, { recursive: true });

  const audioPath = resolveAudioFile(playlistConfig, row);
  const slug = slugify(row.title || `row-${row._row}`);
  const tmp = output.tempDir;

  const mainPath = path.join(tmp, `${slug}_main.mp4`);
  await buildMainSegment(backgroundImagePath, audioPath, mainPath, { resolution, fps, kenBurns: !!video.kenBurns });

  const segments = [mainPath];

  if (video.introPath && fs.existsSync(video.introPath)) {
    const introNorm = path.join(tmp, `${slug}_intro.mp4`);
    await normalizeSegment(video.introPath, introNorm, { resolution, fps });
    segments.unshift(introNorm);
  }

  if (video.outroPath && fs.existsSync(video.outroPath)) {
    const outroNorm = path.join(tmp, `${slug}_outro.mp4`);
    await normalizeSegment(video.outroPath, outroNorm, { resolution, fps });
    segments.push(outroNorm);
  }

  const finalPath = path.join(output.videosDir, `${slug}.mp4`);

  if (segments.length === 1) {
    fs.copyFileSync(segments[0], finalPath);
  } else {
    await concatSegments(segments, finalPath);
  }

  // Clean up temp segments
  for (const seg of segments) {
    if (seg !== finalPath) fs.unlinkSync(seg);
  }

  return { videoPath: finalPath, audioPath };
}
