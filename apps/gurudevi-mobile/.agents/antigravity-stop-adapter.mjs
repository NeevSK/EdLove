#!/usr/bin/env node
/**
 * @file antigravity-stop-adapter.mjs
 * Bridges Antigravity Stop lifecycle hook to RN-Terrain Diff-Scoped Stop Gate.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const stopGateScript = path.resolve(scriptDir, 'stop-gate.mjs');

  const run = spawnSync('node', [stopGateScript], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (run.status === 2) {
    const reason = (run.stderr || run.stdout || 'Regressions detected in diff lines.').trim();
    console.log(
      JSON.stringify({
        decision: 'continue',
        reason: `🛑 RN-TERRAIN VERIFICATION FAILED:\n${reason}\nPlease fix the reported regressions before stopping.`,
      }),
    );
    process.exit(0);
  }

  console.log(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

main().catch(() => {
  console.log(JSON.stringify({ decision: 'allow' }));
});
