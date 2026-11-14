#!/usr/bin/env node
/**
 * scripts/sync-upstream-terrain.mjs
 *
 * Sovereign Dual-Enrichment Bridge: Monorepo -> Upstream rn-terrain.
 *
 * Exports empirical substrate deprecation signals harvested from real
 * monorepo node_modules into c:/projects/rn-terrain package shards,
 * continuously enriching upstream intelligence from production usage.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const LIVE_DEPRECATIONS_FILE = path.join(ROOT_DIR, 'reports', 'live-deprecations.json');
const TERRAIN_PACKAGES_DIR = path.resolve('c:/projects/rn-terrain/docs/changelog-intelligence/data/packages');

function main() {
  const args = process.argv.slice(2);
  const isWrite = args.includes('--write');
  const isDryRun = !isWrite;

  console.log('🔄 [UPSTREAM TERRAIN BRIDGE] Monorepo Substrate -> rn-terrain Shard Synchronizer');
  console.log(`📁 Source Substrate: ${LIVE_DEPRECATIONS_FILE}`);
  console.log(`🎯 Upstream Shards:  ${TERRAIN_PACKAGES_DIR}`);
  console.log(`⚙️  Mode:             ${isWrite ? 'LIVE WRITE (--write)' : 'DRY RUN (preview only)'}\n`);

  if (!fs.existsSync(TERRAIN_PACKAGES_DIR)) {
    console.warn('⚠️  [UPSTREAM TERRAIN BRIDGE] Warning: rn-terrain data directory not detected at local disk path.');
    console.warn('   Skipping upstream synchronization.');
    process.exit(0);
  }

  if (!fs.existsSync(LIVE_DEPRECATIONS_FILE)) {
    console.error(`❌ Error: ${LIVE_DEPRECATIONS_FILE} not found. Run 'node scripts/harvest-live-deprecations.mjs' first.`);
    process.exit(1);
  }

  let liveDeprecations = {};
  try {
    liveDeprecations = JSON.parse(fs.readFileSync(LIVE_DEPRECATIONS_FILE, 'utf8'));
  } catch (err) {
    console.error('❌ Failed to parse live-deprecations.json:', err.message);
    process.exit(1);
  }

  let totalDiscovered = 0;
  let totalNewSignals = 0;
  let totalUpdatedShards = 0;

  for (const [pkgName, items] of Object.entries(liveDeprecations)) {
    if (!Array.isArray(items) || items.length === 0) continue;

    // Normalize package file name (e.g. @types/react -> types-react.json or react.json)
    const normalizedFileName = `${pkgName.replace(/^@/, '').replace(/\//g, '-')}.json`;
    const shardPath = path.join(TERRAIN_PACKAGES_DIR, normalizedFileName);

    let shard = null;
    let isExistingShard = false;

    if (fs.existsSync(shardPath)) {
      try {
        shard = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
        isExistingShard = true;
      } catch {
        shard = null;
      }
    }

    if (!shard) {
      // Only create draft shards for major core packages
      const isCore = ['react', 'react-native', 'expo', 'expo-router', 'zod', 'hono', 'drizzle-orm', 'effect'].includes(pkgName);
      if (!isCore) continue;

      shard = {
        "$schema": "../../schemas/package-features.schema.json",
        "package": pkgName,
        "vendor": "community",
        "category": "LIBRARY",
        "canonical_docs": `https://www.npmjs.com/package/${pkgName}`,
        "features": {},
      };
    }

    if (!shard.features) shard.features = {};

    let shardModified = false;
    let pkgNewCount = 0;

    for (const item of items) {
      totalDiscovered++;
      if (!item.symbol) continue;

      const cleanPkg = pkgName.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanSym = item.symbol.replace(/[^a-zA-Z0-9]/g, '_');
      const featureKey = `${cleanPkg}_dep_${cleanSym}`;

      if (!shard.features[featureKey]) {
        shard.features[featureKey] = {
          display: `Deprecated API: ${item.symbol} in ${pkgName}`,
          transition_milestones: {
            experimental: null,
            added: null,
            deprecated: item.packageVersion || null,
            removed: null,
          },
          rules: {
            replacement: item.replacement || null,
            deprecation_note: item.message || 'Deprecated in upstream TypeScript declarations.',
            substrate_declaration: item.file ? `${item.file}#L${item.line || 1}` : null,
          },
          impact_severity: 'MEDIUM',
        };
        shardModified = true;
        pkgNewCount++;
        totalNewSignals++;
      } else {
        // Enrich existing entry if substrate declaration was missing
        const existingFeat = shard.features[featureKey];
        if (item.file && (!existingFeat.rules || !existingFeat.rules.substrate_declaration)) {
          if (!existingFeat.rules) existingFeat.rules = {};
          existingFeat.rules.substrate_declaration = `${item.file}#L${item.line || 1}`;
          shardModified = true;
        }
      }
    }

    if (shardModified) {
      totalUpdatedShards++;
      console.log(`📦 [${pkgName}] ${pkgNewCount} new deprecations mapped -> ${normalizedFileName}`);
      if (isWrite) {
        fs.writeFileSync(shardPath, JSON.stringify(shard, null, 2), 'utf8');
      }
    }
  }

  console.log('\n========================================================');
  console.log('       UPSTREAM TERRAIN SYNCHRONIZATION SUMMARY         ');
  console.log('========================================================');
  console.log(`Total live deprecations inspected: ${totalDiscovered}`);
  console.log(`New signals mapped:                ${totalNewSignals}`);
  console.log(`Shards updated:                    ${totalUpdatedShards}`);
  console.log(`Execution Mode:                    ${isWrite ? '✅ COMMITTED TO DISK' : '🔍 DRY RUN (Pass --write to apply)'}\n`);
}

main();
