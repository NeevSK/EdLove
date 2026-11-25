#!/usr/bin/env node
/**
 * scripts/deps-cli.mjs
 *
 * Consolidated Dependency & Ecosystem CLI.
 * Usage:
 *   node scripts/deps-cli.mjs scan [--json]
 *   node scripts/deps-cli.mjs apply --safe
 */

import { applyUpgrades, scanDependencies } from './lib/deps-engine.mjs';

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith('-') ? args[0] : 'scan';
const isJson = args.includes('--json');
const isSafe = args.includes('--safe');

async function main() {
  if (command === 'scan') {
    const report = await scanDependencies({ includePrerelease: true });
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log('\n=== Sovereign Dependency Scan ===');
    console.log(`Toolchain: Node ${report.toolchain.node} | ${report.toolchain.pnpm}`);
    console.log(
      `Summary: ${report.summary.totalUpdates} updates | ${report.summary.safeCount} safe | ` +
        `${report.summary.blocked24hCount} <24h | ${report.summary.majorCount} major | ` +
        `${report.summary.heldOrSacredCount} held/sacred | ${report.summary.prereleaseCount} prerelease radar\n`
    );

    for (const c of report.candidates) {
      console.log(`  [${c.bucket}] ${c.name}: ${c.current} -> ${c.target} (${c.reason})`);
    }
    if (report.prereleases.length > 0) {
      console.log('\nPrerelease Radar:');
      for (const p of report.prereleases) {
        console.log(`  [${p.previewTag}] ${p.name}: ${p.current} | latest=${p.latest} | preview=${p.preview}`);
      }
    }
    return;
  }

  if (command === 'apply') {
    const report = await scanDependencies({ includePrerelease: false });
    const selections = isSafe ? report.candidates.filter((c) => c.safeToAutoApply) : [];
    if (selections.length === 0) {
      console.log('No eligible safe updates to apply.');
      return;
    }
    console.log(`Applying ${selections.length} safe updates...`);
    const result = await applyUpgrades({
      selections,
      onProgress: (ev) => {
        if (ev.step) console.log(`[${ev.status.toUpperCase()}] ${ev.step}`);
        if (ev.log) process.stdout.write(ev.log);
      },
    });
    if (!result.ok) process.exit(1);
    return;
  }

  console.error(`Unknown command: ${command}. Use 'scan' or 'apply --safe'.`);
  process.exit(1);
}

main();
