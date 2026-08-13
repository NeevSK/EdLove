#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(
  readFileSync(resolve(root, 'config/doppler-secrets.json'), 'utf8'),
);

const args = process.argv.slice(2);
const valueFor = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const hasFlag = (name) => args.includes(name);

const scope = valueFor('--scope', 'workspace');
const project = valueFor('--project', process.env.DOPPLER_PROJECT || manifest.project);
const config = valueFor(
  '--config',
  process.env.DOPPLER_CONFIG || manifest.localConfig,
);
const allCi = hasFlag('--all-ci');
const required = new Set();

if (scope === 'workspace' || scope === 'ci') {
  for (const name of manifest.required.mobile ?? []) required.add(name);
  for (const name of manifest.required.api ?? []) required.add(name);
}
if (scope === 'mobile' || scope === 'api') {
  for (const name of manifest.required[scope] ?? []) required.add(name);
}

if (required.size === 0 && !allCi) {
  console.error(`Unknown Doppler contract scope: ${scope}`);
  process.exit(2);
}

if (hasFlag('--require-token') && !process.env.DOPPLER_TOKEN) {
  console.error('DOPPLER_TOKEN is required for this check but is not set.');
  process.exit(2);
}

const configs = allCi
  ? Object.entries(manifest.ciConfigs ?? {}).map(([environment, ciConfig]) => ({
      environment,
      config: ciConfig,
    }))
  : [{ environment: scope, config }];

let failed = false;
for (const entry of configs) {
  const result = spawnSync(
    'doppler',
    [
      'secrets',
      'download',
      '--no-file',
      '--format=json',
      '--no-fallback',
      '--project',
      project,
      '--config',
      entry.config,
    ],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: false,
    },
  );

  if (result.error || result.status !== 0) {
    console.error(
      `Unable to read Doppler secret names for project "${project}" and config "${entry.config}" (${entry.environment}).`,
    );
    failed = true;
    continue;
  }

  let names;
  try {
    names = Object.keys(JSON.parse(result.stdout));
  } catch {
    console.error(`Doppler returned an unreadable response for ${entry.config}.`);
    failed = true;
    continue;
  }

  const missing = [...required].filter((name) => !names.includes(name));
  if (missing.length > 0) {
    console.error(
      `Doppler contract failed for ${project}/${entry.config} (${entry.environment}); missing: ${missing.join(', ')}`,
    );
    failed = true;
    continue;
  }

  console.log(
    `Doppler contract passed for ${project}/${entry.config} (${entry.environment}); ${names.length} secret names available.`,
  );
}

if (failed) process.exit(1);
