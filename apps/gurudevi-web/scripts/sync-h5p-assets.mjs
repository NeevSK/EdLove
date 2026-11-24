import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, '..');
const srcDist = resolve(appRoot, 'node_modules/h5p-standalone/dist');
const destDir = resolve(appRoot, 'public/h5p-player');

if (!existsSync(srcDist)) {
  console.warn('[sync-h5p-assets] h5p-standalone/dist not found; skipping copy.');
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
cpSync(srcDist, destDir, { recursive: true, force: true });
console.log('[sync-h5p-assets] Synced h5p-standalone assets to public/h5p-player');
