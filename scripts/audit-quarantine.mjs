#!/usr/bin/env node

/**
 * Sovereign Supply-Chain Quarantine Auditor (pnpm v12)
 * 
 * Inspects package versions against pnpm v12's 'minimumReleaseAge' quarantine policy.
 * Explains whether newly published releases are quarantined and shows exact maturation time.
 * 
 * Usage:
 *   node scripts/audit-quarantine.mjs [pkgName@version ...]
 *   node scripts/audit-quarantine.mjs   # Checks platform core packages
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('🛡️  Sovereign Supply-Chain Quarantine Auditor (pnpm v12)');
console.log('================================================================');

// 1. Read quarantine policy from pnpm-workspace.yaml
const workspaceYamlPath = path.join(ROOT, 'pnpm-workspace.yaml');
const workspaceYaml = fs.readFileSync(workspaceYamlPath, 'utf8');

const ageMatch = workspaceYaml.match(/minimumReleaseAge:\s*(\d+)/);
const minimumReleaseAgeMinutes = ageMatch ? parseInt(ageMatch[1], 10) : 1440;
const minimumReleaseAgeHours = (minimumReleaseAgeMinutes / 60).toFixed(1);

console.log(`⏱️  Active Quarantine Policy : ${minimumReleaseAgeMinutes} minutes (${minimumReleaseAgeHours} hours)`);

const excludeList = [];
let inExclude = false;
for (const line of workspaceYaml.split('\n')) {
  if (/^minimumReleaseAgeExclude:\s*$/.test(line)) {
    inExclude = true;
    continue;
  }
  if (inExclude) {
    if (/^[a-zA-Z0-9_-]+:\s*$/.test(line) || /^\s*$/.test(line)) {
      if (/^[a-zA-Z0-9_-]+:\s*$/.test(line)) break;
      continue;
    }
    const match = line.match(/^\s*-\s*['"]?([^'"]+)['"]?\s*$/);
    if (match) excludeList.push(match[1]);
  }
}

console.log(`🛡️  Exempted Patterns       : ${excludeList.join(', ') || 'none'}\n`);

// 2. Determine target packages
const cliArgs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = cliArgs.length > 0 ? cliArgs : ['pnpm', 'react', 'typescript', '@zenstackhq/cli', 'react-native-reanimated'];

for (const target of targets) {
  const parts = target.split('@');
  let pkgName = parts[0];
  let requestedVersion = parts[1] || 'latest';
  if (target.startsWith('@')) {
    pkgName = '@' + parts[1];
    requestedVersion = parts[2] || 'latest';
  }

  // Check exclusion
  const isExempt = excludeList.some((pattern) => {
    if (pattern.endsWith('*')) {
      return pkgName.startsWith(pattern.slice(0, -1));
    }
    return pkgName === pattern;
  });

  if (isExempt) {
    console.log(`✅ [${pkgName}] EXEMPTED from supply-chain quarantine (matches policy exception)`);
    continue;
  }

  try {
    const rawTime = execSync(`npm view ${pkgName} time --json`, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
    const timeMap = JSON.parse(rawTime);
    const resolvedVersion = requestedVersion === 'latest' ? timeMap['modified'] ? Object.keys(timeMap).reverse().find(k => k !== 'modified' && k !== 'created') : 'latest' : requestedVersion;
    const releaseTimeStr = timeMap[resolvedVersion] || timeMap[requestedVersion];

    if (!releaseTimeStr) {
      console.log(`⚠️  [${pkgName}@${requestedVersion}] Release timestamp could not be verified on npm.`);
      continue;
    }

    const releaseDate = new Date(releaseTimeStr);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60));

    if (diffMinutes >= minimumReleaseAgeMinutes) {
      const days = (diffMinutes / (60 * 24)).toFixed(1);
      console.log(`✅ [${pkgName}@${resolvedVersion}] MATURE (${days} days old — safely past 24h quarantine)`);
    } else {
      const remainingMinutes = minimumReleaseAgeMinutes - diffMinutes;
      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;
      const maturesAt = new Date(releaseDate.getTime() + minimumReleaseAgeMinutes * 60 * 1000);
      console.log(`🚨 [${pkgName}@${resolvedVersion}] IN QUARANTINE!`);
      console.log(`   Released: ${releaseDate.toISOString()}`);
      console.log(`   Maturation countdown: ${hours}h ${mins}m remaining (unlocks at ${maturesAt.toISOString()})`);
      console.log(`   Resolution: Wait for maturation or add to 'minimumReleaseAgeExclude' in pnpm-workspace.yaml if urgent.\n`);
    }
  } catch (err) {
    console.log(`❓ [${pkgName}] Unable to query npm registry: ${err.message}`);
  }
}
