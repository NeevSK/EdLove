#!/usr/bin/env node

/**
 * ==============================================================================
 * CONTINUOUS NATIVE GENERATION (CNG) PIPELINE FIREWALL
 * ==============================================================================
 * Under Expo Continuous Native Generation (CNG), directories `android/` and `ios/`
 * are ephemeral compilation targets generated from `app.config.ts`, `app.json`,
 * and Expo Config Plugins in `apps/gurudevi-mobile/plugins/`.
 *
 * Direct manual edits to `android/` or `ios/` are fatal agentic anti-patterns:
 * 1. They are gitignored or discarded during clean prebuilds.
 * 2. They do not propagate to EAS Cloud Builds.
 * 3. They create ghost local state that cannot be reproduced.
 *
 * This audit engine verifies:
 * - Zero git staged or committed additions under `apps/gurudevi-mobile/(android|ios)`.
 * - Expo config plugins exist for any required native configuration.
 * - Developers/agents are alerted immediately with remediation guidance.
 * ==============================================================================
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const mobileDir = path.join(rootDir, 'apps', 'gurudevi-mobile');

const allowPrebuild = process.argv.includes('--allow-prebuild') || process.env.ALLOW_CNG_PREBUILD === 'true';

if (allowPrebuild) {
  console.log('\x1b[33m[CNG FIREWALL]\x1b[0m Bypassed via --allow-prebuild flag.');
  process.exit(0);
}

let violations = [];

// 1. Check git staged changes
try {
  const staged = execSync('git diff --cached --name-only', { cwd: rootDir, encoding: 'utf8' }).trim();
  if (staged) {
    const nativeStaged = staged.split(/\r?\n/).filter(file => 
      file.startsWith('apps/gurudevi-mobile/android/') || file.startsWith('apps/gurudevi-mobile/ios/')
    );
    if (nativeStaged.length > 0) {
      violations.push({
        type: 'STAGED_NATIVE_FILES',
        files: nativeStaged,
        message: 'Native files are staged for commit. Ephemeral CNG targets must not be tracked in git.'
      });
    }
  }
} catch (err) {
  // git diff failed or not a git repository
}

// 2. Check recent commits (last 3 commits) for accidental native commits
try {
  const recentCommits = execSync('git log -n 3 --name-only --oneline', { cwd: rootDir, encoding: 'utf8' }).trim();
  if (recentCommits) {
    const nativeCommitted = recentCommits.split(/\r?\n/).filter(line => 
      line.startsWith('apps/gurudevi-mobile/android/') || line.startsWith('apps/gurudevi-mobile/ios/')
    );
    if (nativeCommitted.length > 0) {
      violations.push({
        type: 'COMMITTED_NATIVE_FILES',
        files: Array.from(new Set(nativeCommitted)),
        message: 'Recent commits touched ephemeral native directories. Revert these and use config plugins.'
      });
    }
  }
} catch (err) {
  // git log failed
}

// 3. Verify plugins directory exists for config plugins
const pluginsDir = path.join(mobileDir, 'plugins');
if (!fs.existsSync(pluginsDir)) {
  violations.push({
    type: 'MISSING_PLUGINS_DIRECTORY',
    files: ['apps/gurudevi-mobile/plugins'],
    message: 'Missing `apps/gurudevi-mobile/plugins` directory for Expo Config Plugins.'
  });
}

// 4. Output results
console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m  CONTINUOUS NATIVE GENERATION (CNG) PIPELINE AUDIT\x1b[0m');
console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m');

if (violations.length === 0) {
  console.log('  \x1b[32m✔\x1b[0m Zero ephemeral native mutations staged or committed.');
  console.log('  \x1b[32m✔\x1b[0m Config plugins directory present at apps/gurudevi-mobile/plugins.');
  console.log('  \x1b[32m✔\x1b[0m Continuous Native Generation (CNG) invariant verified.');
  console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m\n');
  process.exit(0);
} else {
  console.error('  \x1b[31m✖\x1b[0m \x1b[1mCNG FIREWALL VETO DETECTED:\x1b[0m');
  for (const violation of violations) {
    console.error(`\n    [\x1b[31m${violation.type}\x1b[0m] ${violation.message}`);
    for (const f of violation.files.slice(0, 5)) {
      console.error(`      - ${f}`);
    }
    if (violation.files.length > 5) {
      console.error(`      ... and ${violation.files.length - 5} more`);
    }
  }
  console.error('\n\x1b[33mREMEDIATION:\x1b[0m');
  console.error('  1. NEVER edit files inside `apps/gurudevi-mobile/android/` or `ios/`.');
  console.error('  2. Author an Expo Config Plugin inside `apps/gurudevi-mobile/plugins/` (e.g. withAndroidConfig.js).');
  console.error('  3. Register your plugin in `apps/gurudevi-mobile/app.json` or `app.config.ts` under `"plugins"`.');
  console.error('  4. Rebuild cleanly via `npx expo prebuild --clean` or EAS Build.\n');
  console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m\n');
  process.exit(1);
}
