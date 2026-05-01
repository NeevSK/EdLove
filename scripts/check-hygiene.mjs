import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';

/**
 * Sovereign Hygiene Audit (Node.js version)
 * Cross-platform replacement for check-hygiene.ps1
 */

if (!existsSync('reports')) {
  mkdirSync('reports');
}

let hasErrors = false;

console.log('\n>>> Starting Unified Hygiene Audit <<<\n');

function runAudit(name, script) {
  console.log(`--- Checking ${name} ---`);
  const result = spawnSync('pnpm', ['run', script], { 
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  
  if (result.status !== 0) {
    hasErrors = true;
    console.log(`❌ ${name} check failed!`);
  }
}

// 1. Circular Dependencies
runAudit('Circular Dependencies', 'check:circular');

// 2. Unused Code
runAudit('Unused Code', 'check:unused');

// 3. Architecture Boundaries
runAudit('Architecture Boundaries', 'check:architecture');

if (hasErrors) {
  console.log('\n⚠️  Hygiene checks failed. Please review the reports in the \'reports/\' directory.');
  console.log('\n>>> FACILITATION & HEALING SUGGESTIONS <<<');
  console.log('💡 Circular Dependencies: Run \'node scripts/refactor/sovereign-cycle-checker.mjs\' or \'pnpm run ai:fix\'');
  console.log('💡 Architectural Boundaries: Run \'pnpm run check:architecture\' for details');
  process.exit(1);
} else {
  console.log('\n✅ All hygiene checks passed!');
  process.exit(0);
}
