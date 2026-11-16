import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-boundary-'));
for (const name of ['gate.mjs', 'stop-gate.mjs']) fs.copyFileSync(path.join(repo, '.agents', name), path.join(root, name));
const scenarios = [
  ['recognized-input', 2], ['tool-input-envelope', 0], ['missing-input', 0],
  ['missing-receipt', 2], ['auto-ground', 0], ['invalid-date-receipt', 0],
  ['stop-outside-git', 0], ['stop-untracked-canary', 0], ['stop-staged-canary', 2],
];
const rows = [];
for (const [id, expected] of scenarios) {
  const cwd = path.join(root, id);
  fs.mkdirSync(cwd);
  let input = {};
  if (id === 'recognized-input' || id === 'tool-input-envelope') {
    fs.writeFileSync(path.join(cwd, 'source.ts'), Array.from({ length: 60 }, (_, n) => `export const value${n} = ${n};`).join('\n'));
    const body = { file_path: 'source.ts', content: 'export const short=true;\n' };
    input = id === 'recognized-input' ? { input: body } : { tool_name: 'Write', tool_input: body };
  }
  if (['missing-receipt', 'auto-ground', 'invalid-date-receipt'].includes(id)) input = { input: { file_path: 'src/View.tsx', content: "import { Text } from 'react-native';\nexport const View=()=>null;\n" } };
  if (id === 'invalid-date-receipt') {
    fs.mkdirSync(path.join(cwd, '.agents/state'), { recursive: true });
    fs.writeFileSync(path.join(cwd, '.agents/state/receipt.json'), JSON.stringify({ lastGrounding: 'not-a-date', packages: { 'react-native': { version: 'latest', timestamp: 'not-a-date' } } }));
  }
  if (id === 'stop-untracked-canary' || id === 'stop-staged-canary') {
    const initialized = spawnSync('git', ['init', '--quiet'], { cwd, encoding: 'utf8' });
    if (initialized.status !== 0) throw new Error(initialized.stderr);
    fs.mkdirSync(path.join(cwd, 'apps/mobile'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'apps/mobile/Canary.tsx'), "import { useAnimatedGestureHandler } from 'react-native-reanimated';\nconst gesture = useAnimatedGestureHandler({});\n");
    if (id === 'stop-staged-canary') {
      const staged = spawnSync('git', ['add', 'apps/mobile/Canary.tsx'], { cwd, encoding: 'utf8' });
      if (staged.status !== 0) throw new Error(staged.stderr);
    }
  }
  const script = id.startsWith('stop-') ? 'stop-gate.mjs' : 'gate.mjs';
  const args = [path.join(root, script), ...(id === 'auto-ground' ? ['--auto-ground'] : [])];
  const result = spawnSync(process.execPath, args, { cwd, input: JSON.stringify(input), encoding: 'utf8', timeout: 15000, env: { ...process.env, TERRAIN_AUTO_GROUND: '0', TERRAIN_TELEMETRY_OPT_IN: '0' } });
  rows.push({ id, expected, actual: result.status, matched: result.status === expected, stdout: result.stdout, stderr: result.stderr, error: result.error?.message ?? null });
}
console.log(JSON.stringify({ observedAt: new Date().toISOString(), tier: 'G1 isolated subprocess boundaries', root, rows, allMatched: rows.every((row) => row.matched), limitations: ['Observed exit codes describe copied local scripts with synthetic inputs, not automatic hook invocation.', 'No network behavior or production performance was evaluated.'] }, null, 2));
if (rows.some((row) => !row.matched)) process.exitCode = 1;
