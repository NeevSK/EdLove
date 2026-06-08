import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);

function readArg(name, fallback = '') {
  for (
    let index = args.lastIndexOf(`--${name}`);
    index !== -1;
    index = args.lastIndexOf(`--${name}`, index - 1)
  ) {
    if (args[index + 1]) {
      return args[index + 1];
    }
  }
  return fallback;
}

const cwdArg = readArg('cwd', process.cwd());
const reportPath = readArg('report', 'reports/check-code.md');
const scope = readArg('scope', cwdArg);
const pathsArg = readArg('paths', '');
const scopedPaths = pathsArg
  ? pathsArg
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  : [];

const workspaceCwd = resolve(cwdArg);
const reportFile = resolve(cwdArg, reportPath);
const startTime = Date.now();
const pnpmBinary = process.env.npm_execpath || 'pnpm';

const checks = [
  { name: 'TypeScript', bin: 'tsc', args: ['--noEmit'] },
  { name: 'ESLint', bin: 'eslint', args: scopedPaths.length > 0 ? scopedPaths : ['.'] },
  {
    name: 'Biome',
    bin: 'biome',
    args: ['check', ...(scopedPaths.length > 0 ? scopedPaths : ['.'])],
  },
];

const results = [];

for (const check of checks) {
  const result = await runCheck(check.name, check.bin, check.args, workspaceCwd);
  results.push(result);
}

const totalFailures = results.filter((result) => result.exitCode !== 0).length;
const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

const report = buildReport({
  scope,
  durationSeconds,
  results,
});

await mkdir(dirname(reportFile), { recursive: true });
await writeFile(reportFile, report, 'utf8');

const summaryLine = `check:code ${totalFailures === 0 ? 'passed' : 'failed'} for ${scope} (${durationSeconds}s)`;
console.log(summaryLine);
console.log(`Report written to ${reportFile}`);

process.exit(totalFailures === 0 ? 0 : 1);

function runCheck(name, bin, args, cwd) {
  return new Promise((resolveResult) => {
    const child = spawn(process.execPath, [pnpmBinary, '--dir', cwd, 'exec', bin, ...args], {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    const stdout = [];
    const stderr = [];

    child.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text);
      stdout.push(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      process.stderr.write(text);
      stderr.push(text);
    });

    child.on('close', (code) => {
      resolveResult({
        name,
        cmd: `${bin} ${args.join(' ')}`,
        exitCode: code ?? 0,
        stdout: stdout.join(''),
        stderr: stderr.join(''),
      });
    });
  });
}

function buildReport({ scope, durationSeconds, results }) {
  const lines = [];
  const failed = results.filter((result) => result.exitCode !== 0);

  lines.push('# Code Check Report');
  lines.push('');
  lines.push(`> Scope: ${scope}`);
  lines.push(`> Generated: ${new Date().toISOString()}`);
  lines.push(`> Duration: ${durationSeconds}s`);
  lines.push(`> Status: ${failed.length === 0 ? 'PASS' : 'FAIL'}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Check | Status | Exit Code |');
  lines.push('| :--- | :---: | ---: |');

  for (const result of results) {
    lines.push(
      `| ${result.name} | ${result.exitCode === 0 ? 'PASS' : 'FAIL'} | ${result.exitCode} |`,
    );
  }

  lines.push('');
  lines.push('## Findings');
  lines.push('');

  if (failed.length === 0) {
    lines.push('No issues found.');
  } else {
    for (const result of failed) {
      lines.push(`### ${result.name}`);
      lines.push('');
      lines.push('```text');
      lines.push(result.stdout.trimEnd() || '(no stdout)');
      if (result.stderr.trim()) {
        lines.push('');
        lines.push(result.stderr.trimEnd());
      }
      lines.push('```');
      lines.push('');
    }
  }

  lines.push('## Raw Output');
  lines.push('');
  for (const result of results) {
    lines.push(`### ${result.name}`);
    lines.push('');
    lines.push('```text');
    lines.push(result.stdout.trimEnd() || '(no stdout)');
    if (result.stderr.trim()) {
      lines.push('');
      lines.push(result.stderr.trimEnd());
    }
    lines.push('```');
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
