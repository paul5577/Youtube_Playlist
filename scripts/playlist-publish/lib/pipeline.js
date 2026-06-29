import { generateThumbnail, slugify } from './thumbnail.js';
import { buildVideo } from './video.js';
import { uploadVideo } from './youtube.js';
import { generateBackgroundImage } from './imageGen.js';
import { updateRow } from './sheets.js';

/** Resolves the background image for a row: explicit sheet value -> AI generation -> template. */
export async function resolveBackgroundImage(playlistConfig, row) {
  let backgroundImage = row.backgroundImage && row.backgroundImage.trim();
  if (!backgroundImage && playlistConfig.imageGeneration?.enabled) {
    backgroundImage = await generateBackgroundImage(
      playlistConfig,
      row,
      slugify(row.title || `row-${row._row}`)
    );
  }
  return backgroundImage || playlistConfig.thumbnail.templateImage;
}

export async function runThumbnailStep(playlistConfig, row, log = () => {}) {
  log('Resolving background image...');
  const backgroundImage = await resolveBackgroundImage(playlistConfig, row);
  log(`Background: ${backgroundImage}`);

  log('Generating thumbnail...');
  const thumbnailPath = await generateThumbnail(playlistConfig, row, backgroundImage);
  log(`Thumbnail: ${thumbnailPath}`);

  return { thumbnailPath, backgroundImage };
}

export async function runVideoStep(playlistConfig, row, backgroundImage, log = () => {}) {
  const bg = backgroundImage || (await resolveBackgroundImage(playlistConfig, row));
  log('Building video (intro + content + outro)...');
  const { videoPath, audioPath } = await buildVideo(playlistConfig, row, bg);
  log(`Video: ${videoPath}`);
  return { videoPath, audioPath };
}

export async function runUploadStep(auth, playlistConfig, row, videoPath, thumbnailPath, log = () => {}) {
  log('Uploading to YouTube as private...');
  const { videoId, videoUrl } = await uploadVideo(auth, playlistConfig, row, videoPath, thumbnailPath);
  log(`Uploaded: ${videoUrl}`);

  await updateRow(auth, playlistConfig.spreadsheet, row._row, {
    status: 'uploaded',
    videoId,
    videoUrl,
  });
  log('Sheet updated.');

  return { videoId, videoUrl };
}

/** Runs the full pipeline (thumbnail -> video -> upload) for one row. */
export async function runFullPipeline(auth, playlistConfig, row, log = () => {}) {
  const { thumbnailPath, backgroundImage } = await runThumbnailStep(playlistConfig, row, log);
  const { videoPath } = await runVideoStep(playlistConfig, row, backgroundImage, log);
  const { videoId, videoUrl } = await runUploadStep(auth, playlistConfig, row, videoPath, thumbnailPath, log);
  return { thumbnailPath, videoPath, videoId, videoUrl };
}
