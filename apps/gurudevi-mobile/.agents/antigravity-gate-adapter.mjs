#!/usr/bin/env node
/**
 * @file antigravity-gate-adapter.mjs
 * Bridges Antigravity ProtoJSON PreToolUse hooks to RN-Terrain Scoped AST Invariant Gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const rawInput = Buffer.concat(chunks).toString('utf8').trim();
  if (!rawInput) {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  let payload;
  try {
    payload = JSON.parse(rawInput);
  } catch {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  const toolCall = payload.toolCall || {};
  const toolName = toolCall.name || '';
  const args = toolCall.args || {};

  const targetFile = args.TargetFile || args.targetFile || args.path || args.Target_File || '';
  if (!targetFile) {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  // Map Antigravity args to generic diff synthesizer inputs
  const syntheticPayload = {
    file_path: targetFile,
    content: args.CodeContent || undefined,
    old_string: args.TargetContent || undefined,
    new_string: args.ReplacementContent || undefined,
  };

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const gateScript = path.resolve(scriptDir, 'gate.mjs');

  const run = spawnSync('node', [gateScript, targetFile, '--auto-ground'], {
    input: JSON.stringify(syntheticPayload),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (run.status === 2) {
    // Intercepted & Denied
    const reasonText = (run.stderr || run.stdout || 'Action blocked by RN-Terrain Safety Gate.').trim();
    console.log(
      JSON.stringify({
        decision: 'deny',
        reason: reasonText,
      }),
    );
    process.exit(0);
  }

  // All invariants satisfied
  console.log(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

main().catch((err) => {
  // Fail-open with warning on unexpected crash to prevent deadlock
  console.log(
    JSON.stringify({
      decision: 'allow',
      reason: `Internal hook error: ${err.message}`,
    }),
  );
});
