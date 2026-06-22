import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(appDir);
const sourceDir = join(rootDir, 'node_modules', '@powersync', 'web', 'dist');
const targetDir = join(rootDir, 'public', '@powersync', 'web', 'dist');

if (!existsSync(sourceDir)) {
  console.warn(`[powersync-web-assets] Source not found: ${sourceDir}`);
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });
rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });
console.log(`[powersync-web-assets] Synced ${sourceDir} -> ${targetDir}`);
