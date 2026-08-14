#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'apps', 'sanctuary-api', 'src', 'core', 'app.ts');
const routesDir = path.join(root, 'apps', 'sanctuary-api', 'src', 'core', 'routes');
const app = fs.readFileSync(appPath, 'utf8');
const failures = [];

for (const file of ['health.ts', 'payhereWebhook.ts', 'durableAgents.ts', 'orpc.ts']) {
  if (!fs.existsSync(path.join(routesDir, file)))
    failures.push(`Missing route boundary module: ${file}`);
}

for (const invariant of [
  "app.route('/', healthRoutes)",
  'createPayhereWebhookRoutes',
  'createDurableAgentRoutes',
  'registerNativeORPCRoutes(app, rpcHandler)',
]) {
  if (!app.includes(invariant)) failures.push(`Composition root is missing: ${invariant}`);
}

for (const forbidden of [
  "app.all('/api/durable-agents/*'",
  "app.post('/payments/payhere-webhook'",
  "app.get('/health/live'",
]) {
  if (app.includes(forbidden))
    failures.push(`Composition root still owns extracted route: ${forbidden}`);
}

const orpcSource = fs.readFileSync(path.join(routesDir, 'orpc.ts'), 'utf8');
const nativePaths = [...orpcSource.matchAll(/'\/api\/[^']+\/\*'/g)].map(([pathValue]) => pathValue);
if (new Set(nativePaths).size !== nativePaths.length)
  failures.push('Native oRPC route paths contain duplicates');
if (nativePaths.length !== 37)
  failures.push(`Expected 37 native oRPC route paths, found ${nativePaths.length}`);

if (failures.length) {
  console.error('API composition audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `API composition audit passed (${nativePaths.length} native oRPC mounts and 4 isolated route boundaries).`,
);
