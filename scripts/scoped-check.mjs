import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const isAll = args.includes('--all') || args.includes('--whole');
const runLint = args.includes('--lint') || args.length === 0;
const runTypecheck = args.includes('--typecheck') || args.length === 0;

let lintLogs = '';
let typecheckLogs = '';

function logLint(msg) {
  console.log(msg);
  lintLogs += msg + '\n';
}

function logTypecheck(msg) {
  console.log(msg);
  typecheckLogs += msg + '\n';
}

function runCommand(cmd, options = {}, isLint = true) {
  const log = isLint ? logLint : logTypecheck;
  log(`> Executing: ${cmd}`);
  try {
    const output = execSync(cmd, { ...options, encoding: 'utf8' });
    log(output);
    return true;
  } catch (err) {
    if (err.stdout) log(err.stdout);
    if (err.stderr) log(err.stderr);
    log(`⚠️ Command failed with exit code: ${err.status}`);
    return false;
  }
}

// Gather files from git
let changedFiles = [];
if (!isAll) {
  try {
    const modified = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    const untracked = execSync('git ls-files --others --exclude-standard', {
      encoding: 'utf8',
    }).trim();

    const rawFiles = new Set([
      ...modified.split('\n'),
      ...staged.split('\n'),
      ...untracked.split('\n'),
    ]);

    changedFiles = Array.from(rawFiles)
      .map((f) => f.trim())
      .filter(Boolean)
      .filter((f) => existsSync(f) && /\.(js|ts|tsx|jsx)$/.test(f));
  } catch (err) {
    console.warn('⚠️ Git diff failed, defaulting to whole workspace check.', err.message);
    changedFiles = [];
  }
}

if (isAll || changedFiles.length === 0) {
  const modeMsg =
    changedFiles.length === 0 && !isAll
      ? 'No modified files found. Running whole-workspace check...'
      : 'Running full workspace checks...';

  if (runLint) logLint(modeMsg);
  if (runTypecheck) logTypecheck(modeMsg);

  let success = true;
  if (runLint) {
    logLint('>>> Running full oxlint...');
    if (!runCommand('pnpm exec oxlint .', {}, true)) success = false;

    logLint('>>> Running full ESLint...');
    if (!runCommand('pnpm turbo run lint:eslint', {}, true)) success = false;
  }
  if (runTypecheck) {
    logTypecheck('>>> Running full check-types...');
    if (!runCommand('pnpm turbo run check-types --concurrency=1', {}, false)) success = false;
  }

  writeOutputs();
  process.exit(success ? 0 : 1);
}

if (runLint) logLint(`>>> Found ${changedFiles.length} modified file(s).`);
if (runTypecheck) logTypecheck(`>>> Found ${changedFiles.length} modified file(s).`);

// Identify changed packages
const changedPackages = new Set();
changedFiles.forEach((file) => {
  const normalizedFile = file.replace(/\\/g, '/');
  const parts = normalizedFile.split('/');
  if (parts[0] === 'packages' && parts[1]) {
    changedPackages.add(`packages/${parts[1]}`);
  } else if (parts[0] === 'apps' && parts[1]) {
    changedPackages.add(`apps/${parts[1]}`);
  }
});

function runChunkedCommand(baseCmd, fileList, options = {}, isLint = true, chunkSize = 30) {
  let success = true;
  for (let i = 0; i < fileList.length; i += chunkSize) {
    const chunk = fileList.slice(i, i + chunkSize);
    const quotedFiles = chunk.map((f) => `"${f}"`).join(' ');
    const cmd = `${baseCmd} ${quotedFiles}`;
    const ok = runCommand(cmd, options, isLint);
    if (!ok) success = false;
  }
  return success;
}

let finalSuccess = true;

if (runLint) {
  logLint('\n=== RUNNING SCOPED LINT CHECKS ===');

  // 1. Oxlint
  logLint(`>>> oxlint ${changedFiles.length} files...`);
  if (!runChunkedCommand('pnpm exec oxlint', changedFiles, {}, true)) {
    finalSuccess = false;
  }

  // 2. ESLint (run per package to scope TypeScript compiler parsing and prevent OOM)
  for (const pkg of changedPackages) {
    const pkgFiles = changedFiles
      .filter((f) => f.replace(/\\/g, '/').startsWith(pkg))
      .map((f) => path.relative(pkg, f));

    if (pkgFiles.length === 0) continue;

    logLint(`>>> eslint [${pkg}] on ${pkgFiles.length} files...`);
    const ok = runChunkedCommand(
      'pnpm exec eslint',
      pkgFiles,
      {
        cwd: path.resolve(pkg),
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
      },
      true,
      30
    );
    if (!ok) finalSuccess = false;
  }
}

if (runTypecheck) {
  logTypecheck('\n=== RUNNING SCOPED TYPE CHECKS ===');
  // Run tsc --noEmit inside each modified package directory
  for (const pkg of changedPackages) {
    if (existsSync(path.join(pkg, 'tsconfig.json'))) {
      logTypecheck(`>>> tsc --noEmit inside [${pkg}]...`);
      const ok = runCommand(
        'pnpm exec tsc --noEmit',
        {
          cwd: path.resolve(pkg),
        },
        false,
      );
      if (!ok) finalSuccess = false;
    }
  }
}

writeOutputs();
process.exit(finalSuccess ? 0 : 1);

function writeOutputs() {
  if (runLint) {
    writeFileSync('lint_output.txt', lintLogs, 'utf8');
    console.log('>>> Lint output written to lint_output.txt');
  }
  if (runTypecheck) {
    writeFileSync('typecheck_output.txt', typecheckLogs, 'utf8');
    console.log('>>> Typecheck output written to typecheck_output.txt');
  }
}
