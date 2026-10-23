import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const fileIndex = args.indexOf('--file');
const expectedIndex = args.indexOf('--expect-violations');
const explicitFile = fileIndex === -1 ? undefined : args[fileIndex + 1];
const expectedViolations = expectedIndex === -1 ? undefined : Number(args[expectedIndex + 1]);

if (
  (fileIndex !== -1 && !explicitFile) ||
  (expectedIndex !== -1 && !Number.isInteger(expectedViolations))
) {
  throw new Error('Usage: --file <path> and --expect-violations <integer> require values.');
}

const sourceFile = (path) =>
  (path.startsWith('apps/') || path.startsWith('packages/')) && /\.(?:ts|tsx)$/.test(path);

function changedSourceLines() {
  const names = new Set(
    execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD', '--'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .filter(sourceFile),
  );
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', '--', 'apps', 'packages'],
    { cwd: root, encoding: 'utf8' },
  )
    .split(/\r?\n/)
    .filter(sourceFile);
  const changed = new Map();
  for (const path of names) {
    const diff = execFileSync('git', ['diff', '--unified=0', 'HEAD', '--', path], {
      cwd: root,
      encoding: 'utf8',
    });
    const lines = new Set();
    let nextLine = 0;
    for (const line of diff.split(/\r?\n/)) {
      const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (hunk) {
        nextLine = Number(hunk[1]);
        continue;
      }
      if (nextLine === 0 || line.startsWith('+++')) continue;
      if (line.startsWith('+')) lines.add(nextLine++);
      else if (!line.startsWith('-')) nextLine++;
    }
    changed.set(path, lines);
  }
  for (const path of untracked) {
    const lines = readFileSync(resolve(root, path), 'utf8').split(/\r?\n/);
    changed.set(path, new Set(lines.map((_, index) => index + 1)));
  }
  return changed;
}

function inspect(path, candidateLines) {
  const absolutePath = resolve(root, path);
  const source = readFileSync(absolutePath, 'utf8');
  const lines = source.split(/\r?\n/);
  const violations = [];
  for (const lineNumber of candidateLines) {
    const line = lines[lineNumber - 1] ?? '';
    const fullStore = /\buse[A-Za-z0-9]+Store\s*\(\s*\)/.exec(line);
    if (fullStore) {
      violations.push({
        path,
        line: lineNumber,
        rule: 'no-new-full-store-subscription',
        detail: `${fullStore[0]} needs an atomic selector.`,
      });
    }
    if (/\bpersist\s*\(/.test(line)) {
      const remainingSource = lines.slice(lineNumber - 1).join('\n');
      const missing = ['version', 'migrate', 'partialize'].filter(
        (option) => !new RegExp(`\\b${option}\\s*:`).test(remainingSource),
      );
      if (missing.length > 0) {
        violations.push({
          path,
          line: lineNumber,
          rule: 'persisted-state-contract',
          detail: `persist(...) is missing ${missing.join(', ')}.`,
        });
      }
    }
  }
  return violations;
}

const candidates = explicitFile
  ? new Map([[relative(root, resolve(root, explicitFile)).replaceAll('\\', '/'), new Set()]])
  : changedSourceLines();

const violations = [];
for (const [path, changedLines] of candidates) {
  const absolutePath = resolve(root, path);
  const allLines = readFileSync(absolutePath, 'utf8').split(/\r?\n/);
  const candidateLines = explicitFile
    ? new Set(allLines.map((_, index) => index + 1))
    : changedLines;
  violations.push(...inspect(path, candidateLines));
}

for (const violation of violations) {
  console.error(`${violation.path}:${violation.line} [${violation.rule}] ${violation.detail}`);
}

if (expectedViolations !== undefined) {
  if (violations.length !== expectedViolations) {
    throw new Error(
      `Expected ${expectedViolations} policy violations, found ${violations.length}.`,
    );
  }
  console.log(`State architecture policy fixture: ${violations.length} expected violation(s).`);
} else if (violations.length > 0) {
  process.exitCode = 1;
} else {
  console.log('State architecture policy: no violations in changed source lines.');
}
