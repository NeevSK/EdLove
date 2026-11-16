// Squawk on migrations this change adds or edits: unpushed commits (against the branch's
// upstream, else main-dev) plus the working tree. History has 1,423 findings in 209 of 222 files
// (2026-11-11), so only new work is gated.
// Run: node scripts/lint-new-migrations.mjs   (PIPELINE_BASE=<ref> to change the base)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = 'apps/gurudevi-mobile/supabase/migrations';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const upstream = () => {
  try {
    return git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')[0];
  } catch {
    return undefined;
  }
};
const base = process.env.PIPELINE_BASE ?? upstream() ?? 'main-dev';

const files = [
  ...new Set([
    ...git('diff', '--name-only', '--diff-filter=AM', `${base}...HEAD`, '--', dir),
    ...git('diff', '--name-only', '--diff-filter=AM', '--', dir),
    ...git('ls-files', '--others', '--exclude-standard', '--', dir),
  ]),
].filter((f) => f.endsWith('.sql'));

if (files.length === 0) {
  console.log(`No migrations new or changed against ${base}.`);
  process.exit(0);
}
const pkg = createRequire(join(root, 'package.json')).resolve('squawk-cli/package.json');
const { bin } = JSON.parse(readFileSync(pkg, 'utf8'));
const cli = join(dirname(pkg), typeof bin === 'string' ? bin : Object.values(bin)[0]);
console.log(`Squawk on ${files.length} migration(s) new or changed against ${base}:`);
try {
  execFileSync(process.execPath, [cli, ...files], { cwd: root, stdio: 'inherit' });
} catch (error) {
  process.exit(typeof error.status === 'number' ? error.status : 1);
}
