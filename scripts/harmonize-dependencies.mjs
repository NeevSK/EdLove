#!/usr/bin/env node
/**
 * harmonize-dependencies.mjs
 *
 * Proactive Monorepo Dependency Harmonizer.
 * Enforces the Zero-Divergence Invariant across all workspace manifests
 * according to the canonical Ecosystem Cohorts defined in scripts/lib/dependency-cohorts.mjs.
 *
 * Usage:
 *   node scripts/harmonize-dependencies.mjs --check   # Verify alignment; exit 1 on divergence
 *   node scripts/harmonize-dependencies.mjs --write   # Automatically align all 32 manifests
 */

import fs from 'node:fs';
import path from 'node:path';
import { getCohortLookup, DEPENDENCY_COHORTS } from './lib/dependency-cohorts.mjs';

const ROOT_DIR = process.cwd();
const isWrite = process.argv.includes('--write') || process.argv.includes('-w') || process.argv.includes('--fix');
const isCheck = process.argv.includes('--check') || !isWrite;

function getManifestPaths() {
  const manifests = [path.join(ROOT_DIR, 'package.json')];
  const scanDirs = ['apps', 'packages', 'tooling'];

  for (const dir of scanDirs) {
    const fullDir = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const sub of fs.readdirSync(fullDir)) {
      const manifestPath = path.join(fullDir, sub, 'package.json');
      if (fs.existsSync(manifestPath)) {
        manifests.push(manifestPath);
      }
    }
  }

  return manifests;
}

function harmonize() {
  const cohortLookup = getCohortLookup();
  const manifestPaths = getManifestPaths();
  const violations = [];
  const modifiedFiles = [];

  for (const manifestPath of manifestPaths) {
    const relPath = path.relative(ROOT_DIR, manifestPath);
    let rawContent = '';
    let json = {};

    try {
      rawContent = fs.readFileSync(manifestPath, 'utf8');
      json = JSON.parse(rawContent);
    } catch (err) {
      console.error(`[Error] Failed to read ${relPath}: ${err.message}`);
      continue;
    }

    const pkgName = json.name || relPath;
    let fileModified = false;

    const sections = ['dependencies', 'devDependencies', 'peerDependencies'];

    for (const sec of sections) {
      if (!json[sec] || typeof json[sec] !== 'object') continue;

      for (const [dep, currentVer] of Object.entries(json[sec])) {
        // Skip workspace protocols and internal packages
        if (currentVer.startsWith('workspace:') || dep.startsWith('@repo/')) continue;

        const cohortInfo = cohortLookup.get(dep);
        if (!cohortInfo) continue;

        const canonical = cohortInfo.canonical;

        // Check divergence
        if (currentVer !== canonical) {
          violations.push({
            manifest: relPath,
            pkgName,
            dep,
            section: sec,
            current: currentVer,
            canonical,
            cohortId: cohortInfo.cohortId,
            cohortName: cohortInfo.cohortName,
            governance: cohortInfo.governance,
          });

          if (isWrite) {
            json[sec][dep] = canonical;
            fileModified = true;
          }
        }
      }
    }

    if (isWrite && fileModified) {
      fs.writeFileSync(manifestPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      modifiedFiles.push(relPath);
    }
  }

  // Reporting
  console.log('\n=============================================================');
  console.log('🏛️  POLYMATH ECOSYSTEM COHORT HARMONIZATION ENGINE');
  console.log('=============================================================');

  if (violations.length === 0) {
    console.log('\n✅ ALL 32 MANIFESTS ARE 100% IN HARMONY WITH ECOSYSTEM COHORTS!');
    console.log('   Zero internal divergence detected across the monorepo.\n');
    process.exit(0);
  }

  // Group violations by Cohort
  const byCohort = new Map();
  for (const v of violations) {
    if (!byCohort.has(v.cohortId)) {
      byCohort.set(v.cohortId, { name: v.cohortName, governance: v.governance, items: [] });
    }
    byCohort.get(v.cohortId).items.push(v);
  }

  if (isWrite) {
    console.log(`\n✨ AUTOMATICALLY HARMONIZED ${violations.length} DIVERGENT DECLARATIONS ACROSS ${modifiedFiles.length} FILES:\n`);
    for (const [cohortId, data] of byCohort.entries()) {
      console.log(`📦 [${data.name}] (${data.governance}):`);
      for (const item of data.items) {
        console.log(`   - ${item.pkgName} (${item.manifest}): ${item.dep} "${item.current}" -> "${item.canonical}"`);
      }
      console.log('');
    }
    console.log(`✅ Successfully updated ${modifiedFiles.length} package manifests to canonical cohort pins.\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ FOUND ${violations.length} COHORT INVARIANT VIOLATIONS:\n`);
    for (const [cohortId, data] of byCohort.entries()) {
      console.log(`🚨 Cohort: ${data.name} [${data.governance}]`);
      for (const item of data.items) {
        console.log(`   • ${item.pkgName.padEnd(28)} | ${item.dep.padEnd(30)} declared: "${item.current}" -> canonical: "${item.canonical}"`);
      }
      console.log('');
    }
    console.log('💡 PROACTIVE ACTION:');
    console.log('   To harmonize all packages automatically, run:');
    console.log('   node scripts/harmonize-dependencies.mjs --write\n');
    process.exit(1);
  }
}

harmonize();
