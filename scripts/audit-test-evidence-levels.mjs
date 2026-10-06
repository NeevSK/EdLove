import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';

const roots = ['packages', 'apps'];
const violations = [];
const changedOnly = process.argv.includes('--changed');

function runGit(args) {
  try {
    return execFileSync('git', args, { cwd: process.cwd(), encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function readPackageAtRevision(revision, packagePath) {
  const source = runGit(['show', `${revision}:${packagePath.replaceAll('\\', '/')}`]);
  if (!source) return null;
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}

function changedTestScripts(packagePath, packageJson) {
  if (!changedOnly) return null;

  const baseRevision = process.env.GITHUB_BASE_SHA || 'HEAD';
  const previous = readPackageAtRevision(baseRevision, packagePath);
  const previousScripts = previous?.scripts ?? {};
  const currentScripts = packageJson.scripts ?? {};

  return new Set(
    Object.keys(currentScripts).filter(
      (name) =>
        (name === 'test' || name.startsWith('test:')) && currentScripts[name] !== previousScripts[name],
    ),
  );
}

function collectExplicitTestFiles(command, packageDirectory) {
  return [...command.matchAll(/(?:^|\s)([^\s"']+\.(?:test|spec)\.(?:[cm]?[jt]sx?))/g)]
    .map((match) => resolve(packageDirectory, match[1]))
    .filter((path) => path.startsWith(resolve(packageDirectory)));
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.next', '.vercel', 'build', 'coverage', 'dist'].includes(entry.name)) {
        walk(path);
      }
      continue;
    }
    if (entry.name !== 'package.json') continue;

    const packageJson = JSON.parse(readFileSync(path, 'utf8'));
    const packageDirectory = dirname(path);
    const selectedScripts = changedTestScripts(relative(process.cwd(), path), packageJson);
    for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
      if (name !== 'test' && !name.startsWith('test:')) continue;
      if (name === 'test:governance') continue;
      if (selectedScripts && !selectedScripts.has(name)) continue;

      const level = command.match(/--evidence-level\s+(G[0-5]|R1)\b/)?.[1];
      const delegatesToLevelledScript =
        name === 'test' && /pnpm\s+run\s+test:(boundary|runtime|native)\b/.test(command);
      if (!level && !delegatesToLevelledScript) {
        violations.push(`${relative(process.cwd(), path)} :: ${name} :: ${command}`);
      }

      for (const testFile of collectExplicitTestFiles(command, packageDirectory)) {
        if (!existsSync(testFile)) {
          violations.push(
            `${relative(process.cwd(), path)} :: ${name} :: declared test file does not exist: ${relative(process.cwd(), testFile)}`,
          );
          continue;
        }
        if (!level || !['G2', 'G3', 'G4', 'G5', 'R1'].includes(level)) continue;
        const source = readFileSync(testFile, 'utf8');
        if (/\b(?:vi|jest)\.mock\s*\(/.test(source)) {
          violations.push(
            `${relative(process.cwd(), path)} :: ${name} :: ${relative(process.cwd(), testFile)} contains a mock and must be G1 or lower`,
          );
        }
      }
    }
  }
}

for (const root of roots) walk(root);

if (violations.length > 0) {
  console.error(
    `Test evidence audit failed: ${violations.length} evidence-policy violation(s)${changedOnly ? ' among changed test commands' : ''}.`,
  );
  for (const violation of violations) console.error(`UNLEVELLED: ${violation}`);
  console.error(
    'Add --evidence-level G0|G1|G2|G3|G4|G5|R1 to the shared test runner command, or classify the direct runner before reporting its result.',
  );
  process.exit(1);
}

console.log(
  `Test evidence audit passed${changedOnly ? ' for changed test commands' : ''}: every audited package/app test command declares an evidence level and makes a compatible claim.`,
);
