import fs from 'fs';
import path from 'path';
import { run } from './ffmpeg.js';

/**
 * Generates a thumbnail image by overlaying title text onto a background
 * image using ffmpeg's drawtext filter.
 *
 * Returns the absolute path to the generated thumbnail (JPEG).
 */
export async function generateThumbnail(playlistConfig, row, background) {
  const { thumbnail, output } = playlistConfig;

  if (!fs.existsSync(background)) {
    throw new Error(`Thumbnail background image not found: ${background}`);
  }

  fs.mkdirSync(output.thumbnailsDir, { recursive: true });
  fs.mkdirSync(output.tempDir, { recursive: true });

  const text = (row.thumbnailText && row.thumbnailText.trim()) || row.title || '';
  const textFile = path.join(output.tempDir, `thumb_text_${row._row}.txt`);
  fs.writeFileSync(textFile, text, 'utf-8');

  const slug = slugify(row.title || `row-${row._row}`);
  const outPath = path.join(output.thumbnailsDir, `${slug}.jpg`);

  const drawtext = [
    `fontfile=${thumbnail.fontFile}`,
    `textfile=${textFile}`,
    `fontsize=${thumbnail.fontSize ?? 72}`,
    `fontcolor=${thumbnail.fontColor ?? 'white'}`,
    `x=${thumbnail.x ?? '(w-text_w)/2'}`,
    `y=${thumbnail.y ?? 'h-220'}`,
    'borderw=4',
    'bordercolor=black@0.6',
  ].join(':');

  await run('ffmpeg', [
    '-y',
    '-i', background,
    '-vf', `drawtext=${drawtext}`,
    '-frames:v', '1',
    outPath,
  ]);

  fs.unlinkSync(textFile);
  return outPath;
}

export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}
