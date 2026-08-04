import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const endpoint = process.env.GROWTHBOOK_FEATURES_ENDPOINT;
const apiKey = process.env.GROWTHBOOK_API_KEY;
const scopePrefix = process.env.GROWTHBOOK_FEATURE_SCOPE_PREFIX || '';
const timeoutMs = Number.parseInt(process.env.GROWTHBOOK_API_TIMEOUT_MS || '10000', 10);
const manifestPath = path.join(
  rootDir,
  'packages/core/src/logic/registry/featureLifecycleManifest.ts',
);

function fail(message) {
  console.error(`GrowthBook inventory audit failed: ${message}`);
  process.exitCode = 1;
}

function manifestKeys() {
  const content = fs.readFileSync(manifestPath, 'utf8');
  const body = content.match(/export const FEATURE_FLAG_MANIFEST[^=]*=\s*{([\s\S]*?)}\s*as const/);
  if (!body) throw new Error('FEATURE_FLAG_MANIFEST not found.');

  const entries = [...body[1].matchAll(/^\s*(\w+):\s*\{([\s\S]*?)},?\s*$/gm)].map(
    ([, appKey, block]) => ({
      appKey,
      growthbookKey: block.match(/growthbookKey:\s*'([^']+)'/)?.[1],
    }),
  );

  const missing = entries.filter((entry) => !entry.growthbookKey);
  if (missing.length > 0) {
    throw new Error(
      `Manifest entries missing growthbookKey: ${missing.map(({ appKey }) => appKey).join(', ')}`,
    );
  }

  return entries;
}

export function validateEndpoint(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('GROWTHBOOK_FEATURES_ENDPOINT must be HTTP(S).');
  }
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error('GROWTHBOOK_FEATURES_ENDPOINT must use HTTPS outside localhost.');
  }
  return url;
}

export function validateTimeout(value) {
  if (!Number.isInteger(value) || value < 1000 || value > 120000) {
    throw new Error('GROWTHBOOK_API_TIMEOUT_MS must be an integer between 1000 and 120000.');
  }
  return value;
}

export function extractFeatureKeys(payload, prefix = scopePrefix) {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.features)
      ? payload.features
      : payload?.features && typeof payload.features === 'object'
        ? Object.entries(payload.features).map(([key, value]) => ({ key, ...value }))
        : null;

  if (!records) {
    throw new Error('GrowthBook inventory response must be an array or contain a features object.');
  }

  const parsed = records
    .map((feature) => ({
      key: feature.key || feature.id || feature.name,
      archived: feature.archived === true,
    }))
    .filter(({ key }) => typeof key === 'string' && key.length > 0)
    .filter(({ key }) => !prefix || key.startsWith(prefix));

  const duplicateKeys = parsed
    .map(({ key }) => key)
    .filter((key, index, all) => all.indexOf(key) !== index);
  if (duplicateKeys.length > 0) {
    throw new Error(
      `GrowthBook inventory contains duplicate feature keys: ${[...new Set(duplicateKeys)].join(', ')}`,
    );
  }

  return parsed;
}

async function run() {
  if (!endpoint) {
    console.log(
      'GrowthBook inventory audit skipped: set GROWTHBOOK_FEATURES_ENDPOINT and GROWTHBOOK_API_KEY for a read-only control-plane check.',
    );
    return;
  }
  if (!apiKey)
    throw new Error('GROWTHBOOK_API_KEY is required when inventory auditing is enabled.');

  const response = await fetch(validateEndpoint(endpoint), {
    signal: AbortSignal.timeout(validateTimeout(timeoutMs)),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'User-Agent': 'gurudevi-feature-lifecycle-audit/1.0',
    },
  });
  if (!response.ok) throw new Error(`GrowthBook returned HTTP ${response.status}.`);

  const remoteFeatures = extractFeatureKeys(await response.json());
  const activeRemoteKeys = remoteFeatures.filter(({ archived }) => !archived).map(({ key }) => key);
  const archivedRemoteKeys = remoteFeatures
    .filter(({ archived }) => archived)
    .map(({ key }) => key);
  const local = manifestKeys();
  const localKeys = local.map(({ growthbookKey }) => growthbookKey);
  const localSet = new Set(localKeys);
  const remoteSet = new Set(activeRemoteKeys);
  const orphanedRemoteKeys = activeRemoteKeys.filter((key) => !localSet.has(key)).sort();
  const missingRemoteKeys = localKeys.filter((key) => !remoteSet.has(key)).sort();

  console.log(
    JSON.stringify(
      {
        endpoint: new URL(endpoint).origin,
        scopePrefix: scopePrefix || null,
        activeRemoteCount: activeRemoteKeys.length,
        archivedRemoteCount: archivedRemoteKeys.length,
        localManifestCount: localKeys.length,
        orphanedRemoteKeys,
        missingRemoteKeys,
        manifestGrowthbookKeys: local.map(({ appKey, growthbookKey }) => ({
          appKey,
          growthbookKey,
        })),
      },
      null,
      2,
    ),
  );

  if (strict && (orphanedRemoteKeys.length > 0 || missingRemoteKeys.length > 0)) {
    throw new Error('GrowthBook inventory does not match the local lifecycle manifest.');
  }
}

const isEntrypoint =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  run().catch((error) => fail(error instanceof Error ? error.message : String(error)));
}
