#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const expectedNode = readFileSync(resolve(root, '.nvmrc'), 'utf8').trim();
const expectedPnpm = packageJson.packageManager.replace(/^pnpm@/, '');
const currentNode = process.versions.node;

const nodeMatches =
  currentNode.split('.').slice(0, 2).join('.') ===
  expectedNode.split('.').slice(0, 2).join('.');
if (!nodeMatches) {
  console.error(`Node ${expectedNode}.x is required; found ${currentNode}.`);
  process.exit(1);
}

const executable = (name) => (process.platform === 'win32' ? `${name}.exe` : name);
const versionOf = (name, args) => {
  const result = spawnSync(executable(name), args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    shell: false,
  });
  if (result.status !== 0) return null;
  return result.stdout.trim().split(/\r?\n/)[0];
};

const pnpmVersion = versionOf('pnpm', ['--version']);
if (!pnpmVersion || pnpmVersion !== expectedPnpm) {
  console.error(`pnpm ${expectedPnpm} is required; found ${pnpmVersion ?? 'not installed'}.`);
  process.exit(1);
}

const dopplerVersion = versionOf('doppler', ['--version']);
if (!dopplerVersion) {
  console.error('Doppler CLI is required but was not found on PATH.');
  process.exit(1);
}

console.log(
  `Toolchain versions passed: Node ${currentNode}, pnpm ${pnpmVersion}, ${dopplerVersion}.`,
);
