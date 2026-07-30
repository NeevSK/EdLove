import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const jsonOutput = process.argv.includes('--json');

const featureFlagsPath = path.join(rootDir, 'packages/core/src/store/types/featureFlags.ts');
const manifestPath = path.join(
  rootDir,
  'packages/core/src/logic/registry/featureLifecycleManifest.ts',
);
const sourceRoots = [
  path.join(rootDir, 'packages'),
  path.join(rootDir, 'apps'),
  path.join(rootDir, 'apps/gurudevi-mobile/src'),
  path.join(rootDir, 'scripts'),
];
const catalogFiles = [
  'packages/self/src/constants/selfRegistry.ts',
  'packages/classroom/src/constants/classroomRegistry.ts',
  'packages/community/src/constants/communityRegistry.ts',
  'packages/library/src/constants/libraryRegistry.ts',
  'packages/admin/src/constants/adminRegistry.ts',
  'packages/ai/src/constants/aiRegistry.ts',
  'packages/form-builder/src/constants/formBuilderRegistry.ts',
  'packages/workforce/src/constants/workforceRegistry.ts',
].map((relativePath) => path.join(rootDir, relativePath));
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'reports',
  '.vercel',
  'generated',
  '__snapshots__',
]);
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : [];
  });
}

function extractInterfaceKeys(content) {
  const match = content.match(/export interface FeatureFlags\s*{([\s\S]*?)}/);
  if (!match) throw new Error('FeatureFlags interface not found.');
  return [...match[1].matchAll(/^\s*(\w+)\s*:/gm)].map(([, key]) => key);
}

function extractObjectKeys(content, objectName) {
  const match = content.match(
    new RegExp(`export const ${objectName}[^=]*=\\s*{([\\s\\S]*?)}\\s*as const`),
  );
  if (!match) throw new Error(`${objectName} object not found.`);
  return [...match[1].matchAll(/^\s*(\w+)\s*:/gm)].map(([, key]) => key);
}

function unique(values) {
  return [...new Set(values)].sort();
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function countReferences(files, key) {
  const pattern = new RegExp(`\\b${key}\\b`, 'g');
  return files.reduce((count, filePath) => {
    // Declarations, lifecycle policy tests, and test fixtures are not runtime
    // consumers. Counting them makes an abandoned flag look active forever.
    if (
      filePath === featureFlagsPath ||
      filePath === manifestPath ||
      filePath.includes(`${path.sep}__tests__${path.sep}`) ||
      filePath.endsWith('.test.ts') ||
      filePath.endsWith('.test.tsx')
    ) {
      return count;
    }
    return count + (read(filePath).match(pattern)?.length ?? 0);
  }, 0);
}

function manifestHelperForKey(content, key) {
  return (
    content.match(new RegExp(`${key}:\\s*(legacyRelease|legacyBeta|permanentOperational)`))?.[1] ??
    null
  );
}

function lifecycleForKey(content, key) {
  const helper = manifestHelperForKey(content, key);
  if (helper === 'legacyRelease') {
    return { class: 'release', disposition: 'retire-after-migration' };
  }
  if (helper === 'legacyBeta') {
    return { class: 'beta', disposition: 'retire-after-migration' };
  }
  if (helper === 'permanentOperational') {
    return { class: 'operational', disposition: 'retain-operational' };
  }
  return null;
}

function dateFromManifest(content, key, field) {
  const helper = manifestHelperForKey(content, key);
  if (!helper) return null;
  const helperDefinition = content.match(
    new RegExp(`(?:const|function)\\s+${helper}[\\s\\S]*?\\n}\\);`, 'm'),
  )?.[0];
  return (
    helperDefinition?.match(new RegExp(`${field}:\\s*['"](\\d{4}-\\d{2}-\\d{2})['"]`))?.[1] ?? null
  );
}

function reportList(title, values) {
  console.log(`\n${title} (${values.length})`);
  values.forEach((value) => console.log(`  - ${value}`));
}

function auditCatalogLifecycle(knownFlagKeys) {
  const violations = [];
  const records = [];
  const flagKeys = [];
  const entryOwners = new Map();

  catalogFiles.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      violations.push(`${path.relative(rootDir, filePath)} (registry file missing)`);
      return;
    }

    const content = read(filePath);
    const states = content.match(/^\s{4}state:\s*'(development|beta|live|deprecated)'/gm) ?? [];
    const lifecycles = content.match(/^\s{4}lifecycle:\s*\w+/gm) ?? [];
    const entryHeaders = [...content.matchAll(/^\s{2}([A-Za-z_$][\w$-]*|'[^']+'):\s*{\s*$/gm)];
    const fileFlagKeys = [...content.matchAll(/^\s{4}flagKey:\s*['"]([^'"]+)['"]/gm)].map(
      ([, key]) => key,
    );
    flagKeys.push(...fileFlagKeys);
    const relativePath = path.relative(rootDir, filePath);
    records.push(`${relativePath}: ${states.length} entries`);
    if (states.length !== lifecycles.length) {
      violations.push(
        `${relativePath} (entries=${states.length}, lifecycle metadata=${lifecycles.length})`,
      );
    }
    fileFlagKeys
      .filter((key) => !knownFlagKeys.includes(key))
      .forEach((key) => violations.push(`${relativePath} (unknown flagKey=${key})`));

    entryHeaders.forEach((header, index) => {
      const entryStart = header.index ?? 0;
      const entryEnd = entryHeaders[index + 1]?.index ?? content.length;
      const entryBody = content.slice(entryStart, entryEnd);
      const key = header[1].replace(/^'|'$/g, '');
      const id = entryBody.match(/^\s{4}id:\s*['"]([^'"]+)['"]/m)?.[1];
      if (id && key !== id) {
        violations.push(`${relativePath} (registry key=${key}, entry id=${id})`);
      }
      if (id) {
        const previousOwner = entryOwners.get(id);
        if (previousOwner) {
          violations.push(`duplicate catalog id=${id} (${previousOwner} and ${relativePath})`);
        } else {
          entryOwners.set(id, relativePath);
        }
      }
    });
  });

  return { records, violations, flagKeys };
}

function audit() {
  if (!fs.existsSync(featureFlagsPath)) throw new Error(`Missing ${featureFlagsPath}`);
  if (!fs.existsSync(manifestPath)) throw new Error(`Missing ${manifestPath}`);

  const flagContent = read(featureFlagsPath);
  const manifestContent = read(manifestPath);
  const featureKeys = unique(extractInterfaceKeys(flagContent));
  const manifestKeys = unique(extractObjectKeys(manifestContent, 'FEATURE_FLAG_MANIFEST'));
  const lifecycleMetadata = Object.fromEntries(
    manifestKeys.map((key) => [key, lifecycleForKey(manifestContent, key)]),
  );
  const retiredHistoryBody = manifestContent.match(
    /RETIRED_FEATURE_FLAG_HISTORY\s*=\s*\[([\s\S]*?)\]\s*as const/,
  )?.[1];
  const retiredKeys = unique(
    retiredHistoryBody
      ? [...retiredHistoryBody.matchAll(/\bkey:\s*['"]([^'"]+)['"]/g)].map(([, key]) => key)
      : [
          ...(manifestContent
            .match(/RETIRED_FEATURE_FLAG_KEYS\s*=\s*\[([\s\S]*?)\]/)?.[1]
            ?.matchAll(/['"]([^'"]+)['"]/g) ?? []),
        ].map(([, key]) => key),
  );
  const files = unique(sourceRoots.flatMap(walk));
  const legacySchemaRuntimeReferences = files.filter((filePath) => {
    if (filePath.includes(`${path.sep}packages${path.sep}schema${path.sep}`)) return false;
    if (filePath === fileURLToPath(import.meta.url)) return false;
    if (filePath.endsWith(`${path.sep}check-legacy-feature-flag-schema.mjs`)) return false;
    const content = read(filePath);
    return /\bFeatureFlag(?:Find|Create|Update|Delete|GetPayload)?\b|from\(['"]feature_flags['"]\)/.test(
      content,
    );
  });
  const codeReferences = new Map(featureKeys.map((key) => [key, countReferences(files, key)]));
  const defaultsTrue = featureKeys.filter((key) =>
    new RegExp(`^\\s*${key}:\\s*true,?`, 'm').test(flagContent),
  );
  const unused = featureKeys.filter((key) => codeReferences.get(key) === 0);
  const fullyLaunchedCandidates = defaultsTrue.filter(
    (key) =>
      (codeReferences.get(key) ?? 0) > 0 && manifestContent.includes(`${key}: legacyRelease`),
  );
  const permanentOperationalControls = featureKeys.filter(
    (key) => manifestHelperForKey(manifestContent, key) === 'permanentOperational',
  );
  const missingMetadata = difference(featureKeys, manifestKeys);
  const orphanedMetadata = difference(manifestKeys, featureKeys);
  const retiredReused = featureKeys.filter((key) => retiredKeys.includes(key));
  const reviewDates = featureKeys
    .map((key) => ({ key, date: dateFromManifest(manifestContent, key, 'reviewAt') }))
    .filter(({ date }) => date && date < new Date().toISOString().slice(0, 10))
    .map(({ key, date }) => `${key} (reviewAt ${date})`);
  const catalogAudit = auditCatalogLifecycle(featureKeys);
  const catalogRolloutKeys = new Set(catalogAudit.flagKeys);
  const unmappedRolloutFlags = featureKeys.filter(
    (key) =>
      manifestHelperForKey(manifestContent, key) !== 'permanentOperational' &&
      !catalogRolloutKeys.has(key),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    featureKeys,
    manifestKeys,
    lifecycleMetadata,
    sourceFilesScanned: files.length,
    legacyFeatureFlagSchema: {
      status: 'manual-migration-boundary',
      runtimeReferences: legacySchemaRuntimeReferences.map((filePath) =>
        path.relative(rootDir, filePath),
      ),
    },
    catalogRegistryCount: catalogAudit.records.length,
    catalogFlagKeys: catalogAudit.flagKeys,
    codeReferences: Object.fromEntries(codeReferences),
    unused,
    fullyLaunchedCandidates,
    permanentOperationalControls,
    missingMetadata,
    orphanedMetadata,
    reviewDates,
    retiredReused,
    catalogViolations: catalogAudit.violations,
    unmappedRolloutFlags,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report));
  } else {
    console.log(`Feature lifecycle audit — ${report.generatedAt}`);
    console.log(`Registered flags: ${featureKeys.length}`);
    console.log(`Lifecycle metadata records: ${manifestKeys.length}`);
    console.log(`Source files scanned: ${files.length}`);
    console.log(
      `Legacy FeatureFlag schema runtime references: ${legacySchemaRuntimeReferences.length}`,
    );
    console.log(`Catalog registries audited: ${catalogAudit.records.length}`);
    console.log(`Catalog rollout references: ${catalogAudit.flagKeys.length}`);
    catalogAudit.records.forEach((record) => console.log(`  - ${record}`));

    reportList('Unused / no remaining source references', unused);
    reportList(
      'Fully-launched release flags scheduled for retirement after catalog migration',
      fullyLaunchedCandidates,
    );
    reportList('Permanent operational controls retained by policy', permanentOperationalControls);
    reportList('Missing lifecycle metadata', missingMetadata);
    reportList('Orphaned lifecycle metadata', orphanedMetadata);
    reportList('Overdue review dates', reviewDates);
    reportList('Retired keys reused by active flags', retiredReused);
    reportList('Non-operational flags without an AppCatalog owner', unmappedRolloutFlags);
    reportList('Catalog lifecycle contract violations', catalogAudit.violations);
  }

  const contractViolations = [
    ...missingMetadata,
    ...orphanedMetadata,
    ...retiredReused,
    ...unmappedRolloutFlags,
    ...unused,
    ...fullyLaunchedCandidates,
    ...reviewDates,
    ...legacySchemaRuntimeReferences,
    ...catalogAudit.violations,
  ];
  if (strict && contractViolations.length > 0) {
    process.exitCode = 1;
  }
}

try {
  audit();
} catch (error) {
  console.error(
    `Feature lifecycle audit failed: ${error instanceof Error ? error.message : error}`,
  );
  process.exitCode = 1;
}
