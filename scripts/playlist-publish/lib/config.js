import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'playlists.json');

export function loadAllConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      `Config not found at ${CONFIG_PATH}. Copy playlists.example.json to playlists.json and fill it in.`
    );
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

export function listPlaylistNames() {
  try {
    const all = loadAllConfig();
    return Object.entries(all.playlists || {}).map(([name, cfg]) => ({
      name,
      description: cfg.description || '',
    }));
  } catch {
    return [];
  }
}

export function loadPlaylistConfig(name) {
  const all = loadAllConfig();
  const cfg = all.playlists?.[name];
  if (!cfg) {
    const available = Object.keys(all.playlists || {}).join(', ') || '(none)';
    throw new Error(`Playlist "${name}" not found in config. Available: ${available}`);
  }
  return cfg;
}
