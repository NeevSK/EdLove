import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDirectory, '..');
const assetDirectory = join(workspaceRoot, 'packages', 'ui', 'assets', 'mascot');
const mobileAssetDirectory = join(workspaceRoot, 'apps', 'gurudevi-mobile', 'assets', 'mascot');
const manifestPath = join(assetDirectory, 'manifest.json');
const allowedFormats = new Set(['svg', 'png', 'webp', 'json', 'riv']);
const idPattern =
  /^firefly-(guide|student|teacher|guardian|host|librarian)-(resting|curious|guiding|interrupted|complete)-(light|dark)-(inline|card|scene)\.(svg|png|webp|json|riv)$/;

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!Array.isArray(manifest.entries)) {
  throw new Error('Mascot manifest must contain an entries array.');
}

const entries = new Map();
for (const entry of manifest.entries) {
  if (!entry || typeof entry.id !== 'string') {
    throw new Error('Every mascot manifest entry needs a string id.');
  }
  if (entries.has(entry.id)) {
    throw new Error(`Duplicate mascot asset id: ${entry.id}`);
  }
  if (!idPattern.test(entry.id)) {
    throw new Error(`Invalid mascot asset id: ${entry.id}`);
  }
  const format = entry.id.split('.').pop();
  if (!format || !allowedFormats.has(format)) {
    throw new Error(`Unsupported mascot asset extension: ${entry.id}`);
  }
  if (
    entry.status !== 'concept' &&
    entry.status !== 'review' &&
    entry.status !== 'approved' &&
    entry.status !== 'production'
  ) {
    throw new Error(`Invalid mascot asset status for ${entry.id}: ${entry.status}`);
  }
  if (
    !entry.source ||
    typeof entry.source.fileKey !== 'string' ||
    typeof entry.source.nodeId !== 'string'
  ) {
    throw new Error(`Mascot asset needs a Figma source reference: ${entry.id}`);
  }
  entries.set(entry.id, entry);
}

const files = await readdir(assetDirectory);
for (const file of files) {
  if (file === 'manifest.json') continue;
  const extension = file.split('.').pop();
  if (!extension || !allowedFormats.has(extension)) continue;
  if (!entries.has(file)) {
    throw new Error(`Mascot asset is not registered in manifest.json: ${file}`);
  }
}

for (const entry of entries.values()) {
  try {
    await readFile(join(assetDirectory, entry.id));
  } catch (error) {
    throw new Error(`Manifest points to a missing mascot asset: ${entry.id}`, { cause: error });
  }
}

console.log(`Validated ${entries.size} mascot asset entries.`);

const mobileDeliveryAssets = [
  'Gemini_Generated_Image_ezd4cqezd4cqezd4.webp',
  'firefly-guide-empty-light-scene.webp',
  'firefly-guide-error-light-scene.webp',
  'firefly-guide-offline-light-scene.webp',
  'firefly-guide-welcome-light-scene.webp',
  'firefly-guide-coming-soon-light-cutout-v2.webp',
  'firefly-guide-explore-light-cutout-v2.webp',
  'firefly-guide-onboarding-light-cutout-v2.webp',
  'firefly-guide-pro-light-cutout-v2.webp',
  'firefly-guide-welcome-light-cutout-v2.webp',
  'firefly-guide-empty-light-cutout-v2.webp',
  'firefly-guide-error-light-cutout-v2.webp',
  'firefly-guide-offline-light-cutout-v2.webp',
];

for (const asset of mobileDeliveryAssets) {
  const assetPath = join(mobileAssetDirectory, asset);
  let stats;
  try {
    stats = await stat(assetPath);
  } catch (error) {
    throw new Error(`Missing mobile mascot delivery asset: ${asset}`, { cause: error });
  }
  if (stats.size === 0 || stats.size > 500_000) {
    throw new Error(`Mobile mascot delivery asset is outside the 0–500 KB budget: ${asset}`);
  }
}

console.log(`Validated ${mobileDeliveryAssets.length} mobile mascot delivery assets.`);
