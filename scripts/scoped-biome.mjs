import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const isWrite = args.includes('--write');
// Filter out options to find any explicit file paths passed
const explicitFiles = args.filter((arg) => !arg.startsWith('-') && arg !== '.');

let filesToProcess = explicitFiles;

if (filesToProcess.length === 0) {
  try {
    // Git reports paths relative to the repository root, but this script runs
    // from the calling package's directory. Resolve every path against the
    // repo root first, then scope to the calling directory.
    const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    const baseDir = process.env.PNPM_SCRIPT_SRC_DIR || process.cwd();

    // Get modified files in git
    const modified = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
    // Get untracked files
    const untracked = execSync('git ls-files --others --exclude-standard', {
      encoding: 'utf8',
    }).trim();

    filesToProcess = [...modified.split('\n'), ...untracked.split('\n')]
      .map((f) => f.trim())
      .filter(Boolean)
      .filter((f) => /\.(js|ts|tsx|jsx|json)$/.test(f))
      .map((f) => path.resolve(gitRoot, f))
      .filter((abs) => fs.existsSync(abs))
      .map((f) => path.relative(process.cwd(), f))
      .filter((rel) => rel && !rel.startsWith('..') && !path.isAbsolute(rel));
  } catch (err) {
    console.error('⚠️ Failed to determine changed files via Git:', err.message);
    process.exit(1);
  }
}

if (filesToProcess.length === 0) {
  console.log('>>> No modified files found to format.');
  process.exit(0);
}

const action = isWrite ? 'check --write' : 'check';
const chunkSize = 30;
let success = true;

for (let i = 0; i < filesToProcess.length; i += chunkSize) {
  const chunk = filesToProcess.slice(i, i + chunkSize);
  const filesList = chunk.map((f) => `"${f}"`).join(' ');
  const cmd = `pnpm exec biome ${action} --no-errors-on-unmatched ${filesList}`;
  console.log(
    `>>> Executing scoped Biome check (chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(filesToProcess.length / chunkSize)}): ${cmd}`,
  );
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    success = false;
  }
}

if (!success) {
  process.exit(1);
}
