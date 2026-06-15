---
name: playlist-publish
description: Automate YouTube content production for one or more playlists - reads a schedule from Google Sheets, generates a thumbnail, assembles a video (intro + image/audio + outro), and uploads it to YouTube as a private video added to the target playlist. Use when the user asks to "process/publish playlist videos", "generate thumbnails and upload", or mentions a configured playlist name (e.g. "PlaylistA") together with rows/dates from their content schedule sheet.
---

# Playlist Publish Skill

Automates the repetitive production pipeline for channels that run **multiple playlists**:

1. Read a row (or all "ready" rows) from a Google Sheet schedule for a given playlist.
2. Generate a thumbnail image (background template + title text overlay via ffmpeg `drawtext`).
3. Pick/match an audio file from the playlist's audio folder.
4. Build the video: `intro.mp4` + (background image synced to audio length) + `outro.mp4`.
5. Upload the result to YouTube as **private**, attach the generated thumbnail, and add it to the configured YouTube playlist.
6. Write back the result (status, video ID/URL) to the Google Sheet row.

Everything is driven by a per-playlist config so the same skill works for any number of playlists -
only the config entry changes between channels/playlists.

## Prerequisites (one-time setup)

1. `ffmpeg` and `ffprobe` must be installed and on `PATH`.
2. `npm install` in the repo root (adds `googleapis`).
3. Create a Google Cloud OAuth client (Desktop app type) with the Sheets and YouTube APIs enabled,
   download `credentials.json`.
4. Run the one-time authorization:
   ```
   node scripts/playlist-publish/authorize.js /path/to/credentials.json
   ```
   This stores a refresh token at `scripts/playlist-publish/config/token.json`.
5. Copy `scripts/playlist-publish/config/playlists.example.json` to
   `scripts/playlist-publish/config/playlists.json` and fill in one entry per playlist
   (Google Sheet ID, audio folder, intro/outro paths, output folder, YouTube playlist ID, etc).
   See that file for field documentation.

## Running the pipeline

```
# Process every row marked "ready" in the sheet for "PlaylistA"
node scripts/playlist-publish/run.js --playlist PlaylistA --all

# Process a single sheet row (1-based, including header row)
node scripts/playlist-publish/run.js --playlist PlaylistA --row 5

# Dry run: build the video/thumbnail locally but skip the YouTube upload
node scripts/playlist-publish/run.js --playlist PlaylistA --row 5 --no-upload
```

## How Claude should use this skill

- If the user names a playlist, look it up in `scripts/playlist-playlist/config/playlists.json`
  (after it has been created). If it doesn't exist yet, help the user add a new entry by asking
  for: Google Sheet ID/tab name, audio folder path, intro/outro video paths, thumbnail template
  image, output folder, and target YouTube playlist ID.
- Run `run.js` via Bash with the appropriate `--playlist` and `--row`/`--all` flags.
- Surface ffmpeg/Google API errors clearly - common issues are missing fonts (Korean text needs a
  Hangul-capable font configured via `thumbnail.fontFile`), expired OAuth tokens (re-run
  `authorize.js`), and mismatched intro/outro resolution or frame rate (the pipeline normalizes
  these automatically, but very unusual inputs may still fail).
- Never mark a sheet row as uploaded unless the YouTube upload actually succeeded.
