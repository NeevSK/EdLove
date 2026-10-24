#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'docs/architecture/gate-d0-package-consumer-inventory.json');
const GENERATOR_VERSION = '1.4.0';
const SOURCE_EXTENSIONS = new Set(['.cjs', '.cts', '.js', '.jsx', '.mjs', '.mts', '.ts', '.tsx']);
const SKIP_DIRS = new Set(['.git', '.next', '.turbo', 'build', 'coverage', 'dist', 'node_modules', 'out']);
const compareCodeUnits = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

function readTrackedFile(relative) {
  try {
    return fs.readFileSync(path.join(ROOT, relative));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    throw new Error(`Tracked input disappeared during capture: ${relative}. No inventory was written; retry after workspace changes settle.`);
  }
}

function workspacePackages() {
  const result = [];
  const trackedManifests = ['packages', 'apps'].flatMap((group) => trackedFiles(group))
    .filter((file) => /^(?:packages|apps)\/[^/]+\/package\.json$/.test(file))
    .sort(compareCodeUnits);
  const trackedPackageManifestsAbsentFromWorkingTree = [];
  for (const manifestPath of trackedManifests) {
    if (!fs.existsSync(path.join(ROOT, manifestPath))) {
      trackedPackageManifestsAbsentFromWorkingTree.push(manifestPath);
      continue;
    }
    const manifest = JSON.parse(readTrackedFile(manifestPath).toString('utf8'));
    if (typeof manifest.name !== 'string') continue;
    result.push({
      name: manifest.name,
      directory: path.posix.dirname(manifestPath),
      manifestPath,
      exports: Object.keys(manifest.exports ?? {}).sort(compareCodeUnits),
      dependencies: manifest,
    });
  }
  return {
    packages: result.sort((a, b) => compareCodeUnits(a.name, b.name)),
    trackedPackageManifestPaths: trackedManifests,
    trackedPackageManifestsAbsentFromWorkingTree,
  };
}

function trackedFiles(scope) {
  const tracked = execFileSync('git', ['ls-files', '--', scope], { cwd: ROOT, encoding: 'utf8' });
  return tracked.split(/\r?\n/).filter(Boolean).sort(compareCodeUnits);
}

function selectedTrackedSourceFiles(directory) {
  return trackedFiles(directory).filter((file) => {
    const parts = file.split('/');
    return SOURCE_EXTENSIONS.has(path.extname(file)) && !parts.some((part) => SKIP_DIRS.has(part));
  });
}

function collectConsumerRefs(consumer, providers, sourceFiles) {
  const refs = new Map(providers.map((provider) => [provider.name, new Map()]));
  const matcher = /@repo\/[a-zA-Z0-9._-]+/g;
  for (const relative of sourceFiles) {
    const text = readTrackedFile(relative).toString('utf8');
    for (const name of text.match(matcher) ?? []) {
      if (refs.has(name)) refs.get(name).set(relative, (refs.get(name).get(relative) ?? 0) + 1);
    }
  }
  const manifest = consumer.dependencies;
  for (const provider of providers) {
    for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      if (Object.hasOwn(manifest[section] ?? {}, provider.name)) {
        const files = refs.get(provider.name);
        const manifestPath = `${consumer.directory}/package.json`;
        files.set(manifestPath, (files.get(manifestPath) ?? 0) + 1);
      }
    }
  }
  return refs;
}

function generate() {
  const { packages, trackedPackageManifestPaths, trackedPackageManifestsAbsentFromWorkingTree } = workspacePackages();
  const manifests = packages.map((pkg) => pkg.manifestPath).sort(compareCodeUnits);
  const trackedSourceFilesByPackage = new Map(packages.map((pkg) => [pkg.name, selectedTrackedSourceFiles(pkg.directory)]));
  const trackedSourceFiles = [...trackedSourceFilesByPackage.values()].flat().sort(compareCodeUnits);
  const trackedSourcePathsAbsentFromWorkingTree = trackedSourceFiles.filter((file) => !fs.existsSync(path.join(ROOT, file)));
  const sourceFilesByPackage = new Map([...trackedSourceFilesByPackage.entries()].map(([name, files]) => [
    name,
    files.filter((file) => fs.existsSync(path.join(ROOT, file))),
  ]));
  const sourceFiles = [...sourceFilesByPackage.values()].flat().sort(compareCodeUnits);
  const inputFiles = [...new Set([...manifests, ...sourceFiles])].sort();
  const digest = createHash('sha256');
  for (const relative of inputFiles) {
    digest.update('file\0').update(relative).update('\0').update(readTrackedFile(relative)).update('\0');
  }
  digest.update('trackedSourcePathsAbsentFromWorkingTree\0');
  for (const relative of trackedSourcePathsAbsentFromWorkingTree) digest.update(relative).update('\0');
  digest.update('trackedPackageManifestsAbsentFromWorkingTree\0');
  for (const relative of trackedPackageManifestsAbsentFromWorkingTree) digest.update(relative).update('\0');
  const consumerReferences = new Map(packages.map((consumer) => [
    consumer.name,
    collectConsumerRefs(consumer, packages, sourceFilesByPackage.get(consumer.name)),
  ]));
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const dirty = execFileSync('git', ['status', '--porcelain', '--', 'packages', 'apps'], { cwd: ROOT, encoding: 'utf8' }).trim().length > 0;
  return {
    title: 'Gate D0 package/export/consumer inventory',
    generatedBy: 'scripts/generate-gate-d0-package-inventory.mjs',
    generatorVersion: GENERATOR_VERSION,
    snapshot: {
      semantics: 'Deterministic digest of listed tracked package manifests and selected tracked JS/TS source files that exist in the current working tree, plus separate deletion-state markers and sorted lists for selected tracked source paths and immediate tracked package manifests absent from the filesystem. Missing paths are excluded because they are absent, not because they are untracked. A package with a missing manifest is not source-scanned or included in the current package set. This identifies inputs; it does not prove import resolution or runtime use.',
      sha256: digest.digest('hex'),
      trackedPackageManifestCount: trackedPackageManifestPaths.length,
      packageManifestCount: manifests.length,
      trackedPackageManifestsAbsentFromWorkingTreeCount: trackedPackageManifestsAbsentFromWorkingTree.length,
      trackedPackageManifestsAbsentFromWorkingTree,
      sourceFileCount: sourceFiles.length,
      trackedSourcePathsAbsentFromWorkingTreeCount: trackedSourcePathsAbsentFromWorkingTree.length,
      trackedSourcePathsAbsentFromWorkingTree,
      inputFileCount: inputFiles.length,
      inputFileScope: inputFiles,
    },
    captureProvenance: {
      gitRevision: revision,
      packagesAndAppsWorkingTreeDirty: dirty,
      generatedAt: null,
    },
    method: {
      scope: 'Tracked immediate packages/* and apps/* package.json paths enumerated from Git paths independently of filesystem traversal; present manifests define current package records, while missing tracked manifests are recorded and their package source paths are not scanned. Selected tracked JS/TS source paths under present package directories are scanned when present, and missing tracked source paths are recorded separately. Direct dependency keys in dependencies, devDependencies, optionalDependencies, and peerDependencies.',
      exclusions: ['untracked manifests and source files', 'non-JS/TS source files', 'node_modules', 'dist', 'build', 'coverage', 'out', '.git', '.next', '.turbo'],
      limitation: 'Consumer references are lexical @repo package-name occurrences and dependency keys. This is not AST resolution: comments, strings, excluded or untracked files, aliases, dynamic resolution, and runtime usage can cause false positives or omissions.',
      exports: 'Export keys are copied from package.json exports; their targets and runtime condition resolution are not validated.',
    },
    packages: packages.map((provider) => ({
      name: provider.name,
      directory: provider.directory,
      manifestExports: provider.exports,
      consumers: packages
        .filter((consumer) => consumer.name !== provider.name)
        .map((consumer) => ({
          package: consumer.name,
          directory: consumer.directory,
          references: [...consumerReferences.get(consumer.name).get(provider.name)]
            .sort(([a], [b]) => compareCodeUnits(a, b))
            .map(([file, count]) => ({ file, count })),
        }))
        .filter((consumer) => consumer.references.length > 0),
    })),
  };
}

let expected;
try {
  expected = `${JSON.stringify(generate(), null, 2)}\n`;
} catch (error) {
  console.error(`Gate D0 inventory capture failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
if (process.argv.includes('--check')) {
  let current;
  try {
    current = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  } catch {
    current = null;
  }
  const sourceDerivedPayload = (inventory) => {
    if (!inventory || typeof inventory !== 'object') return null;
    const { captureProvenance: _captureProvenance, ...payload } = inventory;
    return JSON.stringify(payload);
  };
  if (sourceDerivedPayload(current) !== sourceDerivedPayload(JSON.parse(expected))) {
    console.error(`Gate D0 inventory is stale. Run: node ${path.relative(ROOT, fileURLToPath(import.meta.url)).split(path.sep).join('/')}`);
    process.exit(1);
  }
  console.log('Gate D0 package inventory is current.');
} else {
  fs.writeFileSync(OUTPUT, expected);
  console.log(`Wrote ${path.relative(ROOT, OUTPUT).split(path.sep).join('/')}`);
}
