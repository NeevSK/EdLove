#!/usr/bin/env node
/**
 * @file codex-gate-adapter.mjs
 * Bridge adapter connecting OpenAI Codex CLI PreToolUse hooks to RN-Terrain Gate.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const chunks = [];
process.stdin.on('data', (chunk) => chunks.push(chunk));
process.stdin.on('end', () => {
  const rawInput = Buffer.concat(chunks).toString('utf8').trim();
  let targetPath = '';

  try {
    const payload = JSON.parse(rawInput);
    const args = payload.args || payload.input || {};
    targetPath = args.path || args.file_path || args.filePath || '';
  } catch {
    targetPath = rawInput;
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const gateScript = path.resolve(scriptDir, 'gate.mjs');

  const result = spawnSync('node', [gateScript, targetPath, '--auto-ground'], {
    input: rawInput,
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: process.env,
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  process.exit(result.status ?? 0);
});
