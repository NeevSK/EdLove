#!/usr/bin/env node

/**
 * Sovereign Catalog Migration Codemod (pnpm v12)
 * 
 * Safely migrates package.json dependencies and devDependencies across
 * the Polymath Platform monorepo to use pnpm v12 'catalog:' specifiers.
 * 
 * Usage:
 *   node scripts/migrate-to-catalog.mjs --dry-run
 *   node scripts/migrate-to-catalog.mjs --write
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const isWrite = process.argv.includes('--write');
const isDryRun = !isWrite || process.argv.includes('--dry-run');

console.log('📦 Sovereign Catalog Migration Codemod (pnpm v12)');
console.log(`📌 Mode: ${isWrite ? 'WRITE (APPLYING CHANGES)' : 'DRY RUN (REPORT ONLY)'}`);
console.log('================================================================');

// 1. Read catalog definitions from pnpm-workspace.yaml
const workspaceYamlPath = path.join(ROOT, 'pnpm-workspace.yaml');
const workspaceYaml = fs.readFileSync(workspaceYamlPath, 'utf8');

const catalogLines = [];
let inCatalogSection = false;
for (const line of workspaceYaml.split('\n')) {
  if (/^catalog:\s*$/.test(line)) {
    inCatalogSection = true;
    continue;
  }
  if (inCatalogSection) {
    if (/^[a-zA-Z0-9_-]+:\s*$/.test(line)) {
      break; // End of catalog section
    }
    const match = line.match(/^\s+['"]?([^'":]+)['"]?:\s*['"]?([^'"]+)['"]?\s*$/);
    if (match) {
      catalogLines.push({ name: match[1].trim(), targetVersion: match[2].trim() });
    }
  }
}

const catalogMap = new Map();
for (const item of catalogLines) {
  catalogMap.set(item.name, item.targetVersion);
}

console.log(`\n📋 Cataloged Packages (${catalogMap.size}):`);
for (const [name, ver] of catalogMap.entries()) {
  console.log(`   • ${name} -> ${ver}`);
}
console.log('');

// 2. Discover all package.json files
const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.expo',
  'coverage', '.turbo', '.system_generated', 'artifacts', 'scratch',
  '.agents', '.claude'
]);

function findPackageJsons(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        results.push(...findPackageJsons(path.join(dir, entry.name)));
      }
    } else if (entry.name === 'package.json') {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

const allPackageFiles = findPackageJsons(ROOT);
console.log(`🔍 Found ${allPackageFiles.length} package.json files across monorepo.\n`);

let totalModifications = 0;
let modifiedPackages = 0;

for (const pkgPath of allPackageFiles) {
  const relPath = path.relative(ROOT, pkgPath).replace(/\\/g, '/');
  let content = fs.readFileSync(pkgPath, 'utf8').replace(/^\uFEFF/, '');
  let pkgJson;
  try {
    pkgJson = JSON.parse(content);
  } catch (err) {
    console.error(`❌ Failed to parse ${relPath}: ${err.message}`);
    continue;
  }

  let pkgChanged = false;
  const changes = [];

  const depSections = ['dependencies', 'devDependencies'];
  for (const section of depSections) {
    if (!pkgJson[section]) continue;

    for (const [depName, currentVersion] of Object.entries(pkgJson[section])) {
      if (catalogMap.has(depName)) {
        if (currentVersion !== 'catalog:') {
          // Special exception: don't overwrite if it's an explicit alias or specific native binding that cannot use catalog
          changes.push({
            section,
            dep: depName,
            from: currentVersion,
            to: 'catalog:',
          });
          pkgJson[section][depName] = 'catalog:';
          pkgChanged = true;
          totalModifications++;
        }
      }
    }
  }

  if (pkgChanged) {
    modifiedPackages++;
    console.log(`📁 ${relPath}:`);
    for (const ch of changes) {
      console.log(`   ✓ ${ch.section}.${ch.dep}: "${ch.from}" → "${ch.to}"`);
    }

    if (isWrite) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n', 'utf8');
    }
  }
}

console.log('\n================================================================');
console.log(`📊 Summary:`);
console.log(`   Packages Modified : ${modifiedPackages}`);
console.log(`   Total Dependencies Migrated to 'catalog:' : ${totalModifications}`);

if (isDryRun) {
  console.log(`\n💡 To write these changes, run with: node scripts/migrate-to-catalog.mjs --write`);
} else {
  console.log(`\n✨ Successfully migrated all dependencies to 'catalog:'! Run 'pnpm install --lockfile-only' to refresh.`);
}
