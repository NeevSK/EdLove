#!/usr/bin/env node

/**
 * Guard the API's public error boundary during the typed-error migration.
 * Active handlers must throw typed errors; raw Error instances fail this
 * audit before they become undocumented public API behavior.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const handlersRoot = path.join(root, 'apps', 'sanctuary-api', 'src', 'core', 'handlers');

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(fullPath) : fullPath.endsWith('.ts') ? [fullPath] : [];
  });
}

const findings = [];
for (const file of filesIn(handlersRoot)) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!line.includes('throw new Error(')) return;
    findings.push(`${path.relative(root, file)}:${index + 1}: ${line.trim()}`);
  });
}

if (findings.length) {
  console.error('API error taxonomy audit failed: raw handler errors found:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('API error taxonomy audit passed: active handlers use typed errors.');
