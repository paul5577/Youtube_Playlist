import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getApiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  const keyPath = path.join(__dirname, '..', 'config', 'openai.json');
  if (fs.existsSync(keyPath)) {
    const { apiKey } = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
    if (apiKey) return apiKey;
  }

  throw new Error(
    'No OpenAI API key found. Set the OPENAI_API_KEY env var, or create ' +
    'scripts/playlist-publish/config/openai.json with { "apiKey": "sk-..." }.'
  );
}

function fillTemplate(template, row) {
  return template.replace(/\{(\w+)\}/g, (_, key) => row[key] ?? '');
}

/**
 * Generates a background image for a row using the OpenAI image API and
 * saves it under output.tempDir/backgrounds. Returns the absolute file path.
 *
 * playlistConfig.imageGeneration:
 *   { enabled, model, promptTemplate, size }
 */
export async function generateBackgroundImage(playlistConfig, row, slug) {
  const cfg = playlistConfig.imageGeneration;
  if (!cfg?.enabled) return null;

  const apiKey = getApiKey();
  const prompt = fillTemplate(cfg.promptTemplate, row);
  const model = cfg.model || 'gpt-image-1';
  const size = cfg.size || '1792x1024';

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, prompt, size, n: 1 }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI image generation failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI image generation returned no image data.');

  const backgroundsDir = path.join(playlistConfig.output.tempDir, 'backgrounds');
  fs.mkdirSync(backgroundsDir, { recursive: true });
  const outPath = path.join(backgroundsDir, `${slug}.png`);
  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));

  return outPath;
}
