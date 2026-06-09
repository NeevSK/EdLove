import { execSync } from 'node:child_process';
import path from 'node:path';

/**
 * Surgical Sentinel (Pre-commit)
 * AUDIT_MODE:
 *   - full (default): Run everything (TSC + Biome via lint-staged)
 *   - tsc: Only run TSC
 *   - hooks: Skip TSC (Biome already ran via lint-staged)
 */

const auditMode = process.env.AUDIT_MODE || 'full';
const stagedFiles = process.argv.slice(2);

if (auditMode === 'hooks') {
  console.log('>>> ⚡ Audit Mode: HOOKS ONLY (Skipping Surgical TSC)');
  process.exit(0);
}

if (stagedFiles.length === 0) {
  console.log('>>> No staged files. Skipping surgical check.');
  process.exit(0);
}

const affectedPackages = new Set();
for (const file of stagedFiles) {
  const parts = file.split(path.sep === '\\' ? /\\|\// : '/');
  if (parts[0] === 'packages' || parts[0] === 'apps') {
    affectedPackages.add(`${parts[0]}/${parts[1]}`);
  }
}

if (affectedPackages.size === 0) {
  console.log('>>> No package-level changes. Skipping surgical check.');
  process.exit(0);
}

const filterArgs = Array.from(affectedPackages)
  .map((pkg) => `--filter=./${pkg}`)
  .join(' ');

console.log(
  `>>> 🛡️  Surgical Sentinel [Mode: ${auditMode.toUpperCase()}]: Auditing ${affectedPackages.size} packages...`,
);

try {
  // Execute TSC via Turbo
  const cmd = `pnpm exec turbo run check-types ${filterArgs} --continue --concurrency=1`;
  console.log(`>>> Executing: ${cmd}`);

  execSync(cmd, { stdio: ['ignore', 'inherit', 'inherit'] });

  console.log('\n✅ Surgical Sentinel: Package integrity verified.');
  process.exit(0);
} catch (_error) {
  console.error('\n❌ Surgical Sentinel: Impurities detected in affected packages.');
  process.exit(1);
}
