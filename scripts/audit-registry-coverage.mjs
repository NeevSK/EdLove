import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const bootPath = path.join(rootDir, 'apps/gurudevi-mobile/src/boot/registerAppCatalog.ts');
const manifestPath = path.join(
  rootDir,
  'packages/core/src/logic/registry/featureLifecycleManifest.ts',
);
const appPath = path.join(rootDir, 'apps/gurudevi-mobile/app');
const reportPath = path.join(rootDir, 'reports/registry-coverage-audit.json');

const registryImportPattern = /import\s+\{\s*(\w+_REGISTRY)\s*\}\s+from\s+'([^']+)'/g;
const registryDeclarationPattern =
  /export const (\w+_REGISTRY)\s*:[^=]+?=\s*\{/g;
const entryStartPattern = /^\s{2}(['\w-]+):\s*\{/;

function relativeToRoot(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function findMatchingObjectEnd(text, objectStart) {
  let depth = 1;
  let quote = null;
  let escaped = false;
  for (let index = objectStart + 1; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
    } else if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function property(block, name) {
  const match = block.match(new RegExp(`\\b${name}\\s*:\\s*'([^']*)'`));
  return match?.[1];
}

function booleanProperty(block, name) {
  const match = block.match(new RegExp(`\\b${name}\\s*:\\s*(true|false)`));
  return match?.[1] === 'true';
}

function parseRegistryEntries(registryName, source) {
  const declaration = new RegExp(
    `export const ${registryName}\\s*:[^=]+?=\\s*\\{`,
  ).exec(source);
  if (!declaration) throw new Error(`${registryName} declaration not found.`);

  const objectStart = declaration.index + declaration[0].length - 1;
  const objectEnd = findMatchingObjectEnd(source, objectStart);
  if (objectEnd < 0) throw new Error(`${registryName} object is not balanced.`);

  const body = source.slice(objectStart + 1, objectEnd);
  const entries = [];
  let depth = 0;
  let entryStart = null;
  let entryKey = null;
  let lineStart = 0;

  for (const line of body.split('\n')) {
    const match = depth === 0 ? entryStartPattern.exec(line) : null;
    if (match) {
      entryKey = match[1].replaceAll("'", '');
      entryStart = lineStart + line.indexOf('{');
    }

    for (const character of line) {
      if (character === '{') depth += 1;
      if (character === '}') {
        depth -= 1;
        if (depth === 0 && entryStart !== null && entryKey !== null) {
          const block = body.slice(entryStart, lineStart + line.length);
          entries.push({
            registryName,
            key: entryKey,
            id: property(block, 'id'),
            ownerPackage: property(block, 'ownerPackage'),
            state: property(block, 'state'),
            flagKey: property(block, 'flagKey'),
            tabDomain: property(block, 'tabDomain'),
            surfaceId: property(block, 'surfaceId'),
            analyticsKey: property(block, 'analyticsKey'),
            mobileSupport: booleanProperty(block, 'mobileSupport'),
            webSupport: booleanProperty(block, 'webSupport'),
            sourceBlock: block,
          });
          entryStart = null;
          entryKey = null;
        }
      }
    }
    lineStart += line.length + 1;
  }
  return entries;
}

function listSourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist') continue;
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) files.push(...listSourceFiles(fullPath));
    else if (/\.(?:ts|tsx|js|jsx)$/.test(item.name)) files.push(fullPath);
  }
  return files;
}

function sourceMatches(files, terms, excluded = []) {
  return files.filter((filePath) => {
    if (excluded.some((value) => filePath.includes(value))) return false;
    const content = readText(filePath).toLowerCase();
    return terms.some((term) => content.includes(term.toLowerCase()));
  });
}

function routeEvidence(entry) {
  const routeFiles = listSourceFiles(appPath);
  const tabMatches = routeFiles.filter((filePath) => {
    const relative = relativeToRoot(filePath);
    return relative.includes(`app/(tabs)/${entry.tabDomain}`);
  });
  const exactMatches = routeFiles.filter((filePath) => {
    const content = readText(filePath).toLowerCase();
    return content.includes(entry.id.toLowerCase()) || content.includes(entry.surfaceId?.toLowerCase() ?? '');
  });
  return {
    tabRoute: tabMatches.length > 0,
    exactRouteReference: exactMatches.length > 0,
    evidence: [...new Set([...tabMatches, ...exactMatches])].slice(0, 8).map(relativeToRoot),
  };
}

function registryConsumerEvidence(entry, registryName, sourceFiles) {
  const keyReference = new RegExp(
    `${registryName}(?:\\.${entry.key}|\\[['\"]${entry.key}['\"]\\])`,
  );
  const rolloutReference = new RegExp(
    `useDomainRollout\\(\\s*['\"]${entry.id}['\"]\\s*\\)`,
  );
  const featureReference = new RegExp(
    `useDomainFeature\\(\\s*['"]${entry.id}['"]\\s*\\)`,
  );
  const composedSurfaceReference = new RegExp(
    `createSurface\\(\\s*['"](?:${entry.surfaceId ?? entry.id}|${entry.id})['"]\\s*,`,
  );
  const files = sourceFiles.filter((filePath) => {
    const content = readText(filePath);
    return (
      keyReference.test(content) ||
      rolloutReference.test(content) ||
      featureReference.test(content) ||
      composedSurfaceReference.test(content)
    );
  });
  return files.slice(0, 8).map(relativeToRoot);
}

function loadRegistryImports() {
  const bootSource = readText(bootPath);
  return [...bootSource.matchAll(registryImportPattern)].map(([, registryName, importPath]) => ({
    registryName,
    filePath: path.join(
      rootDir,
      'packages',
      importPath.replace('@repo/', '').replaceAll('/', path.sep).replace(`${path.sep}constants`, `${path.sep}src${path.sep}constants`) + '.ts',
    ),
  }));
}

function loadManifestKeys() {
  const source = readText(manifestPath);
  const keys = new Set(
    [...source.matchAll(/^\s{2}(\w+):\s*\{/gm)].map(([, key]) => key),
  );
  return keys;
}

function inspectEntry(entry, registryFile, sourceFiles, manifestKeys) {
  const terms = [entry.id, entry.key].filter(Boolean);
  const implementationFiles = sourceMatches(sourceFiles, terms, ['constants' + path.sep]);
  const route = routeEvidence(entry);
  const consumerEvidence = registryConsumerEvidence(entry, entry.registryName, sourceFiles);
  const lifecycleValid = Boolean(entry.id && entry.ownerPackage && entry.state && entry.tabDomain && entry.analyticsKey);
  const flagMapped = !entry.flagKey || manifestKeys.has(entry.flagKey);
  const intentionalDevelopment = entry.state === 'development';
  const implementationStatus = implementationFiles.length > 0 ? 'evidence' : 'missing';
  const routeStatus = route.exactRouteReference || (route.tabRoute && consumerEvidence.length > 0)
    ? 'evidence'
    : route.tabRoute
      ? 'tab-only'
      : 'missing';
  const verdict = !lifecycleValid || !flagMapped
    ? 'invalid'
    : intentionalDevelopment
      ? 'development-by-contract'
      : implementationStatus === 'missing'
        ? 'registered-only'
        : routeStatus === 'missing'
          ? 'unrouted'
          : routeStatus === 'tab-only'
            ? 'unverified'
            : 'evidence';

  return {
    registry: entry.registryName,
    key: entry.key,
    id: entry.id,
    ownerPackage: entry.ownerPackage,
    state: entry.state,
    flagKey: entry.flagKey ?? null,
    lifecycle: lifecycleValid ? 'valid' : 'invalid',
    flagMapping: flagMapped ? 'valid' : 'missing-manifest-entry',
    implementation: implementationStatus,
    implementationEvidence: implementationFiles.slice(0, 8).map(relativeToRoot),
    consumerEvidence,
    route: routeStatus,
    routeEvidence: route.evidence,
    mobileSupport: entry.mobileSupport,
    webSupport: entry.webSupport,
    registryFile: relativeToRoot(registryFile),
    verdict,
  };
}

export function auditRegistries() {
  const manifestKeys = loadManifestKeys();
  const rows = [];
  for (const { registryName, filePath } of loadRegistryImports()) {
    const source = readText(filePath);
    const packageSource = path.dirname(path.dirname(path.dirname(filePath)));
    const sourceFiles = listSourceFiles(path.join(packageSource, 'src'));
    for (const entry of parseRegistryEntries(registryName, source)) {
      rows.push(inspectEntry(entry, filePath, sourceFiles, manifestKeys));
    }
  }
  return rows;
}

function printReport(rows) {
  const counts = rows.reduce((result, row) => {
    result[row.verdict] = (result[row.verdict] ?? 0) + 1;
    return result;
  }, {});
  const report = {
    generatedAt: new Date().toISOString(),
    entryCount: rows.length,
    counts,
    entries: rows,
  };
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  try {
    const rows = auditRegistries();
    printReport(rows);
    const structuralFailures = rows.filter((row) => row.verdict === 'invalid');
    if (strict && structuralFailures.length > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Registry coverage audit failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
