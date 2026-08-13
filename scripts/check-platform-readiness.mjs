#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const environmentIndex = args.indexOf('--environment');
const environment = environmentIndex >= 0 ? args[environmentIndex + 1] : 'development';
const strict = args.includes('--strict');

const requiredFiles = [
  'AGENTS.md',
  'config/doppler-secrets.json',
  'docs/infra/production-readiness-program.md',
  'docs/infra/release-environments-runbook.md',
  'docs/infra/critical-infra-vs-use-cases.md',
  '.github/workflows/quality-gate.yml',
  '.github/workflows/android-build.yml',
  '.github/workflows/browser-e2e.yml',
  '.github/workflows/web-deploy.yml',
  'apps/sanctuary-api/src/entry-node.ts',
  'apps/gurudevi-mobile/eas.json',
  'apps/gurudevi-mobile/playwright.config.ts',
  'apps/gurudevi-mobile/maestro/config.yaml',
  'apps/gurudevi-marketingWeb/public/sw.js',
];

const requiredScripts = [
  ['package.json', 'toolchain:check'],
  ['package.json', 'env:check'],
  ['package.json', 'check-types'],
  ['apps/sanctuary-api/package.json', 'build'],
  ['apps/sanctuary-api/package.json', 'test'],
  ['apps/gurudevi-mobile/package.json', 'build:web'],
  ['apps/gurudevi-mobile/package.json', 'test:e2e'],
  ['apps/gurudevi-marketingWeb/package.json', 'build'],
];

const failures = [];
const warnings = [];

for (const relative of requiredFiles) {
  if (!existsSync(resolve(root, relative))) failures.push(`missing required file: ${relative}`);
}

for (const [relative, script] of requiredScripts) {
  const path = resolve(root, relative);
  if (!existsSync(path)) {
    failures.push(`missing package manifest: ${relative}`);
    continue;
  }
  const packageJson = JSON.parse(readFileSync(path, 'utf8'));
  if (!packageJson.scripts?.[script]) failures.push(`missing script ${script}: ${relative}`);
}

const appSource = readFileSync(resolve(root, 'apps/sanctuary-api/src/core/app.ts'), 'utf8');
for (const route of ['/health/live', '/health/ready']) {
  if (!appSource.includes(`'${route}'`)) failures.push(`missing API health route: ${route}`);
}

const doppler = JSON.parse(readFileSync(resolve(root, 'config/doppler-secrets.json'), 'utf8'));
const expectedConfig = { development: 'dev', preview: 'stg', production: 'prd' }[environment];
if (!expectedConfig) failures.push(`unknown environment: ${environment}`);
else if (doppler.ciConfigs?.[environment] !== expectedConfig) {
  failures.push(`Doppler mapping mismatch: ${environment} must use ${expectedConfig}`);
}

if (environment !== 'development') {
  warnings.push(
    `external provider evidence required for ${environment}: Doppler, Supabase, PowerSync, EAS, Sentry, hosting, payments, and push credentials`,
  );
}

const report = {
  environment,
  expectedDopplerConfig: expectedConfig ?? null,
  requiredFileCount: requiredFiles.length,
  failures,
  warnings,
  status: failures.length === 0 && (!strict || warnings.length === 0) ? 'pass' : 'fail',
};

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0 || (strict && warnings.length > 0)) process.exit(1);
