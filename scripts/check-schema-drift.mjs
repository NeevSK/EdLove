#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const zmodelPath = path.join(ROOT, 'packages', 'database', 'zenstack', 'schema.zmodel');
const generatedPath = path.join(ROOT, 'packages', 'core', 'src', 'logic', 'generated', 'models.ts');

console.log('⚖️ Checking Schema Alignment (Database vs Core Logic)...');

if (!fs.existsSync(zmodelPath) || !fs.existsSync(generatedPath)) {
  console.error('❌ Critical files missing for drift detection.');
  process.exit(1);
}

const zmodelStat = fs.statSync(zmodelPath);
const generatedStat = fs.statSync(generatedPath);

const zmodelContent = fs.readFileSync(zmodelPath, 'utf8');
const generatedContent = fs.readFileSync(generatedPath, 'utf8');

// Heuristic 1: Timestamps
const isDrifted = zmodelStat.mtime > generatedStat.mtime;

// Heuristic 2: Model Counts
const zmodelModels = (zmodelContent.match(/model\s+(\w+)/g) || []).map((m) => m.split(/\s+/)[1]);
const tsModels = (generatedContent.match(/export\s+type\s+(\w+)\s*=/g) || []).map(
  (m) => m.split(/\s+/)[2],
);

const missingInTs = zmodelModels.filter((m) => !tsModels.includes(m));

console.log(`\n- Source (zmodel): ${zmodelStat.mtime.toISOString()}`);
console.log(`- Artifact (ts): ${generatedStat.mtime.toISOString()}`);

if (isDrifted) {
  console.warn(
    '\n⚠️  WARNING: schema.zmodel is newer than generated models. Please run "pnpm run generate" in packages/database.',
  );
}

if (missingInTs.length > 0) {
  console.error(`\n❌ DRIFT DETECTED: Models found in .zmodel but missing in @repo/core:`);
  missingInTs.forEach((m) => console.log(`  - ${m}`));
} else if (!isDrifted) {
  console.log('\n✅ Schema Sync: PERFECT. Database and Core Logic are perfectly mirrored.');
} else {
  console.log('\n✅ Structural Sync: Models match, but timestamps suggest a refresh is needed.');
}
