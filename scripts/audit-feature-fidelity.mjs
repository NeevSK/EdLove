import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AlchemistExecution } from './utils/execution.mjs';

/**
 * FEATURE FIDELITY MIRROR (POLYMATH EDITION)
 *
 * Performance: Uses fast-track heuristic for Shadow Discovery.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const DOCS_DIR = path.join(ROOT, 'docs');
const FEATURE_ENGINE_PATH = path.join(
  ROOT,
  'packages/core/src/logic/permissions/feature-engine.ts',
);

const execution = new AlchemistExecution('audit_feature_fidelity');

async function run() {
  execution.start();

  const queryFilter = process.argv.find((arg) => arg.startsWith('--query='))?.split('=')[1];

  const results = {
    features: {},
    shadowFeatures: {},
    stats: {
      totalFeaturesFoundInDocs: 0,
      totalGatedByFlags: 0,
      totalImplementedOnMobile: 0,
      totalImplementedOnWeb: 0,
      totalShadowFeatures: 0,
      fidelityScore: 0,
    },
  };

  try {
    // 1. HARVEST DOCS
    const docs = harvestDocs(DOCS_DIR);
    for (const doc of docs) {
      extractFeaturesFromDocs(doc, results.features);
    }

    // 2. READ FLAGS
    const featureFlags = readFeatureFlags();

    // 3. SCAN CORE FOLDERS ONLY (Performance)
    const knownFeatureFiles = new Set();
    const corePaths = [
      path.join(ROOT, 'packages/classroom/src/screens'),
      path.join(ROOT, 'packages/self/src/screens'),
      path.join(ROOT, 'packages/admin/src/screens'),
      path.join(ROOT, 'packages/auth/src/screens'),
    ];

    // Documented Features Verification
    for (const [featureName, data] of Object.entries(results.features)) {
      const technicalKey = findTechnicalKey(featureName, featureFlags);
      data.flag = technicalKey || null;
      data.isGated = !!technicalKey;

      const coverage = checkFilesystemCoverage(
        featureName,
        technicalKey,
        corePaths,
        knownFeatureFiles,
      );
      data.platforms = coverage;
      data.isImplemented = coverage.mobile || coverage.web;
      data.fidelity =
        (data.isGated ? 50 : 0) + (coverage.mobile ? 25 : 0) + (coverage.web ? 25 : 0);
    }

    // 4. SHADOW DISCOVERY
    discoverShadowFeatures(
      results.features,
      results.shadowFeatures,
      knownFeatureFiles,
      featureFlags,
      corePaths,
    );

    // Filter
    if (queryFilter) {
      filterResults(results, queryFilter);
    }

    summarizeResults(results);
    printReport(results);

    await execution.complete(results);
  } catch (error) {
    console.error(error);
    await execution.fail(error);
    process.exit(1);
  }
}

function harvestDocs(dir, allDocs = []) {
  if (!fs.existsSync(dir)) return allDocs;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (['node_modules', '.git', '.gemini', 'archive'].includes(file)) continue;
      harvestDocs(fullPath, allDocs);
    } else if (file.endsWith('.md')) {
      allDocs.push({ path: fullPath, file: file, mtime: stat.mtime });
    }
  }
  return allDocs;
}

function extractFeaturesFromDocs(doc, features) {
  const content = fs.readFileSync(doc.path, 'utf-8');
  const headerRegex = /^#+ (?:Feature: )?(.+)$/gm;
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    const name = match[1].trim();
    if (name.length > 50 || name.includes('|') || ['Summary', 'Navigation'].includes(name))
      continue;
    if (!features[name]) {
      features[name] = {
        ancestry: [],
        isGated: false,
        fidelity: 0,
        platforms: { mobile: false, web: false },
      };
    }
    features[name].ancestry.push({ file: doc.file, mtime: doc.mtime });
  }
}

function readFeatureFlags() {
  if (!fs.existsSync(FEATURE_ENGINE_PATH)) return [];
  const content = fs.readFileSync(FEATURE_ENGINE_PATH, 'utf-8');
  const flagRegex = /is([A-Z][a-zA-Z0-9]+)Enabled: boolean/g;
  const flags = [];
  let match;
  while ((match = flagRegex.exec(content)) !== null) {
    flags.push(`is${match[1]}Enabled`);
  }
  return flags;
}

function checkFilesystemCoverage(name, technicalKey, paths, knownFiles) {
  const coverage = { mobile: false, web: false };
  const terms = [
    name
      .toLowerCase()
      .replace(/ /g, '')
      .replace(/[^a-z0-9]/g, ''),
    technicalKey ? technicalKey.replace('is', '').replace('Enabled', '').toLowerCase() : null,
  ].filter(Boolean);

  for (const searchPath of paths) {
    if (!fs.existsSync(searchPath)) continue;
    const files = fs.readdirSync(searchPath);
    for (const file of files) {
      for (const term of terms) {
        if (file.toLowerCase().includes(term)) {
          if (file.endsWith('.web.tsx')) coverage.web = true;
          else if (file.endsWith('.tsx')) coverage.mobile = true;
          knownFiles.add(path.join(searchPath, file));
        }
      }
    }
  }
  return coverage;
}

function discoverShadowFeatures(_documented, shadow, knownFiles, flags, paths) {
  for (const searchPath of paths) {
    if (!fs.existsSync(searchPath)) continue;
    const files = fs.readdirSync(searchPath);
    for (const file of files) {
      const fullPath = path.join(searchPath, file);
      if (knownFiles.has(fullPath)) continue;

      const featureName = file
        .replace('Screen', '')
        .replace('View', '')
        .replace('.web', '')
        .replace('.tsx', '');
      if (!shadow[featureName]) {
        shadow[featureName] = {
          name: featureName,
          platforms: { mobile: false, web: false },
          isGated: !!findTechnicalKey(featureName, flags),
        };
      }
      if (file.includes('.web')) shadow[featureName].platforms.web = true;
      else shadow[featureName].platforms.mobile = true;
    }
  }
}

function findTechnicalKey(name, flags) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return flags.find((f) => f.toLowerCase().includes(clean)) || null;
}

function filterResults(results, query) {
  const lower = query.toLowerCase();
  const filter = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([k]) => k.toLowerCase().includes(lower)));
  results.features = filter(results.features);
  results.shadowFeatures = filter(results.shadowFeatures);
}

function summarizeResults(results) {
  results.stats.totalFeaturesFoundInDocs = Object.keys(results.features).length;
  results.stats.totalShadowFeatures = Object.keys(results.shadowFeatures).length;
  results.stats.totalImplementedOnMobile = Object.values(results.features).filter(
    (f) => f.platforms?.mobile,
  ).length;
  results.stats.totalImplementedOnWeb = Object.values(results.features).filter(
    (f) => f.platforms?.web,
  ).length;
  results.stats.fidelityScore =
    results.stats.totalFeaturesFoundInDocs > 0
      ? Math.round(
          Object.values(results.features).reduce((acc, f) => acc + f.fidelity, 0) /
            results.stats.totalFeaturesFoundInDocs,
        )
      : 0;
}

function printReport(results) {
  console.log(`\n💎 Feature Fidelity Mirror (Polymath Edition)`);
  console.log(`-------------------------------------------`);
  console.log(`📚 Documented Features: ${results.stats.totalFeaturesFoundInDocs}`);
  console.log(`🎯 Fidelity Score:      ${results.stats.fidelityScore}%`);
  console.log(`👻 Shadow Features:    ${results.stats.totalShadowFeatures}\n`);

  if (Object.keys(results.shadowFeatures).length > 0) {
    console.log(`⚠️  SHADOW FEATURES (Implemented but NOT in Docs):`);
    Object.values(results.shadowFeatures)
      .slice(0, 10)
      .forEach((f) => {
        const pStr = `[Mobile: ${f.platforms.mobile ? '✅' : '❌'} | Web: ${f.platforms.web ? '✅' : '❌'}]`;
        console.log(`- ${f.name.padEnd(30)} ${pStr} ${f.isGated ? '(Gated)' : '(Ungated)'}`);
      });
  }
}

run();
