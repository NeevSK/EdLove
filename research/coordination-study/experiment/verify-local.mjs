import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rows = [];
for (const [variant, filename] of [['frozen', 'controller.frozen.mjs'], ['hardened', 'controller.mjs']]) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-check-'));
  fs.copyFileSync(path.join(here, filename), path.join(root, 'controller.mjs'));
  fs.copyFileSync(path.join(here, 'controller.test.mjs'), path.join(root, 'controller.test.mjs'));
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', path.join(root, 'controller.test.mjs')], { encoding: 'utf8', timeout: 30000 });
  rows.push({ variant, file: filename, status: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.message ?? null });
}
const result = { observedAt: new Date().toISOString(), engine: process.version, tier: 'G1 synthetic controller boundaries and real local subprocess restarts', rows, limitations: ['The frozen and hardened versions are distinct. Trial-agent results use only the frozen controller.', 'Tests verify declared source references and state behavior; they do not prove human intent or automatic Codex interception.', 'The hardened version deliberately preserves unresolved declarations and has no authenticated decision-resolution command.'] };
fs.writeFileSync(path.join(here, '../local-verification.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(rows.map((row) => ({ variant: row.variant, status: row.status, summary: row.stdout.split('\n').filter((line) => /^# (tests|pass|fail|skipped)/.test(line)) })), null, 2));
if (rows.find((row) => row.variant === 'hardened').status !== 0) process.exitCode = 1;
