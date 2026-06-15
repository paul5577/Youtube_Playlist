import fs from 'fs';
import { google } from 'googleapis';

/**
 * Uploads a video as private, attaches the thumbnail, and adds it to the
 * configured playlist. Returns { videoId, videoUrl }.
 */
export async function uploadVideo(auth, playlistConfig, row, videoPath, thumbnailPath) {
  const youtube = google.youtube({ version: 'v3', auth });
  const { youtube: yt } = playlistConfig;

  const tags = (row.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const insertRes = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: row.title,
        description: row.description || '',
        tags,
        categoryId: yt.categoryId || '10',
        defaultLanguage: yt.defaultLanguage,
        defaultAudioLanguage: yt.defaultLanguage,
      },
      status: {
        privacyStatus: yt.privacyStatus || 'private',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = insertRes.data.id;

  if (thumbnailPath && fs.existsSync(thumbnailPath)) {
    await youtube.thumbnails.set({
      videoId,
      media: { body: fs.createReadStream(thumbnailPath) },
    });
  }

  if (yt.playlistId) {
    await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId: yt.playlistId,
          resourceId: { kind: 'youtube#video', videoId },
        },
      },
    });
  }

  return { videoId, videoUrl: `https://www.youtube.com/watch?v=${videoId}` };
}
