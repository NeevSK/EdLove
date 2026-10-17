import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

export function assertCleanPullDestination(destination) {
  // Include untracked files: rsync can overwrite them without any Git recovery path.
  const status = execFileSync('git', ['-C', destination, 'status', '--porcelain=v1', '--untracked-files=all'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (status.length > 0) {
    throw new Error('Pull refused: destination has staged, modified, or untracked files. Preserve and reconcile that work first; there is no force bypass.');
  }
}

export async function confirmWorkspacePull(destination, preview) {
  assertCleanPullDestination(destination);
  preview();
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Pull refused: review the preview and run again in an interactive terminal to confirm.');
  }
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  let answer;
  try {
    answer = await terminal.question('Review the preview above. Type PULL to copy WSL files into Windows: ');
  } finally {
    terminal.close();
  }
  if (answer !== 'PULL') throw new Error('Pull cancelled: confirmation did not match PULL.');
  // The user can edit while reviewing; never rely on the pre-preview check alone.
  assertCleanPullDestination(destination);
}
