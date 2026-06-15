# playlist-publish

Multi-playlist content pipeline: Google Sheet schedule -> thumbnail -> intro/outro+audio video -> private YouTube upload.

See `.claude/skills/playlist-publish/SKILL.md` for the full setup guide and usage.

## Sheet column reference (defaults, configurable per playlist)

| Column | Field            | Notes                                                            |
|--------|------------------|-------------------------------------------------------------------|
| A      | title            | Video title, also used as default thumbnail text                |
| B      | description      | Video description                                                |
| C      | tags             | Comma-separated tags                                             |
| D      | thumbnailText    | Optional override text for the thumbnail (falls back to title)  |
| E      | backgroundImage  | Optional path to a background image for this row's thumbnail/video |
| F      | audioFile        | Optional filename (or path) in the playlist's audio folder       |
| G      | scheduledDate    | Informational only                                               |
| H      | status           | empty / "ready" -> processed, "uploaded" -> skipped              |
| I      | videoId          | Filled in automatically after upload                             |
| J      | videoUrl         | Filled in automatically after upload                             |

## Files

- `config/playlists.example.json` - copy to `playlists.json` and fill in per-playlist settings
- `authorize.js` - one-time Google OAuth setup
- `run.js` - main pipeline entrypoint
- `lib/` - sheets, thumbnail, video, youtube helpers
