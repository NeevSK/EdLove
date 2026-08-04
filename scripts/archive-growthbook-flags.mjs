import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const allowOperational = process.argv.includes('--allow-operational');
const reason = process.argv
  .find((argument) => argument.startsWith('--reason='))
  ?.slice('--reason='.length)
  .trim();
const keys = process.argv
  .filter((argument) => argument.startsWith('--key='))
  .map((argument) => argument.slice('--key='.length))
  .filter(Boolean);
const timeoutMs = Number.parseInt(process.env.GROWTHBOOK_API_TIMEOUT_MS || '10000', 10);

function fail(message) {
  console.error(`GrowthBook archival refused: ${message}`);
  process.exitCode = 1;
}

function manifestGrowthbookKeyMap() {
  const content = fs.readFileSync(
    path.join(rootDir, 'packages/core/src/logic/registry/featureLifecycleManifest.ts'),
    'utf8',
  );
  const body = content.match(/export const FEATURE_FLAG_MANIFEST[^=]*=\s*{([\s\S]*?)}\s*as const/);
  if (!body) throw new Error('FEATURE_FLAG_MANIFEST not found.');

  const map = new Map();
  for (const match of body[1].matchAll(/^\s*(\w+):\s*\{([\s\S]*?)},?\s*$/gm)) {
    const growthbookKey = match[2].match(/growthbookKey:\s*'([^']+)'/)?.[1];
    if (growthbookKey) map.set(match[1], growthbookKey);
  }
  return map;
}

function loadAudit() {
  const output = execFileSync(
    process.execPath,
    [path.join(rootDir, 'scripts', 'audit-feature-flags.mjs'), '--strict', '--json'],
    { cwd: rootDir, encoding: 'utf8' },
  );
  return JSON.parse(output);
}

function endpointFor(key) {
  const template = process.env.GROWTHBOOK_ARCHIVE_ENDPOINT_TEMPLATE;
  if (!template || !template.includes('{key}')) {
    throw new Error(
      'GROWTHBOOK_ARCHIVE_ENDPOINT_TEMPLATE is required and must contain {key}; keep the deployment-specific GrowthBook API path out of source code.',
    );
  }
  const endpoint = template.replaceAll('{key}', encodeURIComponent(key));
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error('GROWTHBOOK_ARCHIVE_ENDPOINT_TEMPLATE must use HTTPS outside localhost.');
  }
  return endpoint;
}

function validateTimeout(value) {
  if (!Number.isInteger(value) || value < 1000 || value > 120000) {
    throw new Error('GROWTHBOOK_API_TIMEOUT_MS must be an integer between 1000 and 120000.');
  }
  return value;
}

function verifyControlPlane() {
  if (!process.env.GROWTHBOOK_FEATURES_ENDPOINT) {
    throw new Error(
      'GROWTHBOOK_FEATURES_ENDPOINT is required for --apply so the remote inventory is verified before archival.',
    );
  }
  execFileSync(
    process.execPath,
    [path.join(rootDir, 'scripts', 'audit-growthbook-features.mjs'), '--strict'],
    { cwd: rootDir, stdio: 'inherit' },
  );
}

async function archiveKey(key) {
  const apiKey = process.env.GROWTHBOOK_API_KEY;
  if (!apiKey) throw new Error('GROWTHBOOK_API_KEY is required for --apply.');
  if (!reason) throw new Error('--reason= is required for --apply so the retirement is auditable.');
  const method = process.env.GROWTHBOOK_ARCHIVE_METHOD || 'POST';
  if (!['POST', 'PATCH'].includes(method)) {
    throw new Error('GROWTHBOOK_ARCHIVE_METHOD must be POST or PATCH.');
  }

  const response = await fetch(endpointFor(key), {
    method,
    signal: AbortSignal.timeout(validateTimeout(timeoutMs)),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'gurudevi-feature-lifecycle-archive/1.0',
      'Idempotency-Key': `feature-lifecycle-archive:${key}`,
    },
    body: JSON.stringify({ archived: true }),
  });

  if (!response.ok) {
    throw new Error(`GrowthBook returned HTTP ${response.status} for ${key}.`);
  }
}

try {
  const audit = loadAudit();
  const growthbookKeyMap = manifestGrowthbookKeyMap();
  const requestedKeys = keys.length > 0 ? keys : audit.fullyLaunchedCandidates;

  if (requestedKeys.length === 0) {
    console.log('No flags are eligible for archival.');
    process.exit(0);
  }

  const unknownKeys = requestedKeys.filter((key) => !audit.featureKeys.includes(key));
  const protectedOperationalKeys = requestedKeys.filter(
    (key) => audit.permanentOperationalControls.includes(key) && !allowOperational,
  );
  const unsafeKeys = requestedKeys.filter(
    (key) =>
      (audit.codeReferences[key] ?? 0) !== 0 ||
      audit.catalogFlagKeys.filter((catalogKey) => catalogKey === key).length !== 0,
  );
  const unapprovedKeys = requestedKeys.filter(
    (key) => audit.lifecycleMetadata[key]?.disposition !== 'retire-after-migration',
  );

  if (unknownKeys.length > 0) {
    fail(`unknown manifest keys: ${unknownKeys.join(', ')}`);
    process.exit(1);
  }
  if (protectedOperationalKeys.length > 0) {
    fail(
      `operational controls require --allow-operational for an explicit emergency retirement: ${protectedOperationalKeys.join(', ')}`,
    );
    process.exit(1);
  }
  if (unapprovedKeys.length > 0) {
    fail(`manifest disposition does not permit archival for: ${unapprovedKeys.join(', ')}`);
    process.exit(1);
  }
  if (unsafeKeys.length > 0) {
    if (!apply) {
      console.log('Dry run: no requested flags are currently eligible for archival.');
      console.log('Blocked by remaining callers or catalog rollout references:');
      unsafeKeys.forEach((key) => console.log(`  - ${key}`));
      console.log('Remove those references, then rerun this command before using --apply.');
      process.exit(0);
    }
    fail(
      `references remain for: ${unsafeKeys.join(', ')}. Remove callers and catalog rollout keys before archival.`,
    );
    process.exit(1);
  }

  if (!apply) {
    console.log(`Dry run: ${requestedKeys.length} GrowthBook flag(s) are eligible:`);
    requestedKeys.forEach((key) =>
      console.log(`  - ${key} (GrowthBook: ${growthbookKeyMap.get(key) ?? key})`),
    );
    console.log(
      'Use --apply --reason="..." with server-side GrowthBook credentials to mutate the control plane.',
    );
    process.exit(0);
  }

  verifyControlPlane();

  for (const key of requestedKeys) {
    const remoteKey = growthbookKeyMap.get(key) ?? key;
    await archiveKey(remoteKey);
    console.log(`Archived GrowthBook flag: ${remoteKey} (${reason})`);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
