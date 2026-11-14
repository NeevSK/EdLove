import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB_ROOT = path.join(ROOT_DIR, 'apps/gurudevi-web');
const APP_ROOT = path.join(WEB_ROOT, 'app');
const OUTPUT_PATH = path.join(ROOT_DIR, 'reports/atlas-route-inventory.json');
const IGNORED_DIRS = new Set(['node_modules', '.next', '.turbo', '.git']);
const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js']);
const GENERATOR_VERSION = '1.3.0';
const EXCLUDED_DIRS = [...IGNORED_DIRS].sort();
const compareCodeUnits = (left, right) => left < right ? -1 : left > right ? 1 : 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => compareCodeUnits(a.name, b.name)).flatMap((entry) => {
    if (entry.isDirectory()) return IGNORED_DIRS.has(entry.name) ? [] : walk(path.join(dir, entry.name));
    return entry.isFile() ? [path.join(dir, entry.name)] : [];
  });
}

function relative(file) {
  return path.relative(ROOT_DIR, file).replaceAll(path.sep, '/');
}

function routeForPage(file) {
  const directory = path.relative(APP_ROOT, path.dirname(file)).split(path.sep).filter(Boolean);
  const segments = directory.filter((segment) => !/^\([^/]+\)$/.test(segment));
  const route = `/${segments.join('/')}`;
  return route === '/' ? route : route.replace(/\/$/, '');
}

function unsupportedConventions(file) {
  const segments = path.relative(APP_ROOT, path.dirname(file)).split(path.sep).filter(Boolean);
  const findings = [];
  for (const segment of segments) {
    if (segment.startsWith('@')) findings.push({ convention: 'parallel-route-slot', segment });
    else if (/^\(\.{1,3}\)/.test(segment)) findings.push({ convention: 'intercepting-route', segment });
    else if (segment.startsWith('_')) findings.push({ convention: 'private-folder', segment });
    else if (/^\[\[\.\.\..+\]\]$/.test(segment)) findings.push({ convention: 'optional-catch-all', segment });
    else if (/^\[\.\.\..+\]$/.test(segment)) findings.push({ convention: 'catch-all', segment });
  }
  return findings;
}

function candidateClass(route, file) {
  const input = `${route} ${file}`.toLowerCase();
  if (input.includes('/prototypes/')) return 'prototype';
  if (/(^|[\/.-])(demo|playground|lab|internal|dev|test)([\/.-]|$)/.test(input)) return 'non-product-candidate';
  return 'product-candidate';
}

function hrefsFromRegistry(file) {
  const source = fs.readFileSync(file, 'utf8');
  const found = [];
  const pattern = /\bhref\s*:\s*(?:(['"])(.*?)\1|`((?:\\.|[^`])*)`)/g;
  for (const match of source.matchAll(pattern)) {
    const href = match[2] ?? match[3];
    found.push(href);
  }
  return [...new Set(found)].sort();
}

function normalizedPath(href) {
  const pathname = href.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
  return pathname
    .replace(/\[\[\.\.\.[^/\]]+\]\]/g, '[[...param]]')
    .replace(/\[\.\.\.[^/\]]+\]/g, '[...param]')
    .replace(/\[[^/\]]+\]/g, '[param]');
}

function classifyRegistryHref(href, routeKeys) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) {
    return { classification: 'external', status: 'external-literal', shape: null };
  }
  const pathname = href.split(/[?#]/, 1)[0];
  const hasInterpolation = pathname.includes('${');
  const segments = pathname.split('/');
  const isSimpleDynamicPath = href.startsWith('/') && hasInterpolation && segments.every((segment) =>
    !segment.includes('${') || /^\$\{[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\}$/.test(segment),
  );
  if (isSimpleDynamicPath) {
    const shape = normalizedPath(pathname.replace(/\$\{[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\}/g, '[param]'));
    return { classification: 'dynamic', status: routeKeys.has(shape) ? 'dynamic-filesystem-route-shape-match' : 'dynamic-unresolved', shape };
  }
  if (!href.startsWith('/') || href.startsWith('//')) {
    return { classification: 'unresolved', status: 'unresolved-registry-href', shape: null };
  }
  const shape = normalizedPath(href);
  return routeKeys.has(shape)
    ? { classification: 'resolved', status: 'filesystem-route-shape-match', shape }
    : { classification: 'unresolved', status: 'no-filesystem-route-shape', shape };
}

export function buildRouteInventory() {
  const files = walk(APP_ROOT);
  const routes = files
    .filter((file) => PAGE_FILES.has(path.basename(file)))
    .map((file) => {
      const route = routeForPage(file);
      const unsupported = unsupportedConventions(file);
      return {
        route,
        shape: normalizedPath(route),
        file: relative(file),
        candidateClass: candidateClass(route, relative(file)),
        mappingStatus: unsupported.length ? 'unsupported-folder-convention' : 'mapped-filesystem-shape',
        unsupportedConventions: unsupported,
      };
    })
    .sort((a, b) => compareCodeUnits(a.route, b.route) || compareCodeUnits(a.file, b.file));

  const routeCounts = new Map();
  for (const route of routes) routeCounts.set(route.shape, [...(routeCounts.get(route.shape) ?? []), route.file]);
  const duplicateRouteShapes = [...routeCounts]
    .filter(([, filesForShape]) => filesForShape.length > 1)
    .map(([shape, filesForShape]) => ({ shape, files: filesForShape.sort() }))
    .sort((a, b) => compareCodeUnits(a.shape, b.shape));
  const routeKeys = new Set(routes.filter((route) => route.mappingStatus === 'mapped-filesystem-shape').map(({ shape }) => shape));
  const registries = walk(WEB_ROOT)
    .filter((file) => /Registry\.[jt]sx?$/.test(path.basename(file)) && /\.(?:ts|tsx|js|jsx)$/.test(file))
    .sort();
  const literalHrefProperties = registries.flatMap((file) => hrefsFromRegistry(file).map((href) => {
    const classification = classifyRegistryHref(href, routeKeys);
    return {
      href,
      source: relative(file),
      candidateClass: candidateClass(href, relative(file)),
      ...classification,
    };
  }));
  const hrefClassificationCounts = { resolved: 0, dynamic: 0, external: 0, unresolved: 0 };
  for (const item of literalHrefProperties) hrefClassificationCounts[item.classification] += 1;

  const inputPaths = [...new Set([
    ...routes.map((route) => path.join(ROOT_DIR, route.file)),
    ...registries,
    fileURLToPath(import.meta.url),
  ])].sort();
  const inputs = inputPaths.map(relative).sort();
  const inputsHash = createHash('sha256');
  for (const file of inputPaths) {
    inputsHash.update(relative(file));
    inputsHash.update('\0');
    inputsHash.update(fs.readFileSync(file));
    inputsHash.update('\0');
  }
  let sourceRevision = 'unavailable';
  let workingTree = { dirty: null, statusSha256: null };
  try {
    sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
    const status = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT_DIR, encoding: 'utf8' });
    workingTree = {
      dirty: status.length > 0,
      statusSha256: createHash('sha256').update(status).digest('hex'),
    };
  } catch {
    // The inventory remains usable in exported source snapshots without Git metadata.
  }

  return {
    schemaVersion: 1,
    provenance: {
      generatedAt: new Date().toISOString(),
      generator: 'scripts/audit-route-inventory.mjs',
      generatorVersion: GENERATOR_VERSION,
      nodeVersion: process.version,
      sourceRevision,
      workingTree,
      inputsSha256: inputsHash.digest('hex'),
      inputs,
    },
    scope: {
      routeFiles: 'apps/gurudevi-web/app/**/page.{tsx,ts,jsx,js}',
      hrefSources: 'apps/gurudevi-web/**/*Registry.{ts,tsx,js,jsx}',
      registryHrefClassifications: {
        counts: hrefClassificationCounts,
        headless: { status: 'unknown', reason: 'This browser page/registry scan does not inventory headless endpoints or establish their absence.' },
      },
      excludedDirectories: EXCLUDED_DIRS,
      unsupportedNextFolderConventions: ['parallel slots (@slot)', 'intercepting routes ((.), (..), (...))', 'private folders (_folder)', 'catch-all ([...slug])', 'optional catch-all ([[...slug]])'],
      detection: 'Next.js page filesystem paths with route groups removed; literal root-relative href properties only',
      limitations: [
        'Static source scan only; does not prove route authorization, runtime reachability, or implementation behavior.',
        'Does not detect computed hrefs, JSX href attributes, navigation calls, or registry data imported from elsewhere.',
        'Does not inventory route handlers, layouts, middleware, rewrites, or generated routes.',
        'Registry classification covers only static href properties with string or template-literal values; arbitrary expressions and computed navigation are not evaluated. Headless endpoint coverage is unknown.',
        'Dynamic segment matching uses positional placeholder normalization and does not evaluate parameter constraints.',
      ],
    },
    routes,
    duplicateRouteShapes,
    literalHrefProperties: literalHrefProperties.sort((a, b) => compareCodeUnits(a.href, b.href) || compareCodeUnits(a.source, b.source)),
  };
}

function main() {
  const inventory = buildRouteInventory();
  const output = `${JSON.stringify(inventory, null, 2)}\n`;
  if (process.argv.includes('--write')) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, output);
    console.log(`Wrote ${relative(OUTPUT_PATH)} (${inventory.routes.length} routes, ${inventory.literalHrefProperties.length} literal href properties).`);
  } else if (process.argv.includes('--check')) {
    if (!fs.existsSync(OUTPUT_PATH)) {
      console.error(`Missing ${relative(OUTPUT_PATH)}; run with --write to generate it.`);
      process.exitCode = 1;
      return;
    }
    const current = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    const expected = JSON.parse(output);
    for (const report of [current, expected]) {
      delete report.provenance.generatedAt;
      delete report.provenance.sourceRevision;
      delete report.provenance.workingTree;
    }
    if (JSON.stringify(current) !== JSON.stringify(expected)) {
      console.error(`${relative(OUTPUT_PATH)} is stale; run with --write to regenerate it.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Route inventory is current (${inventory.routes.length} routes, ${inventory.literalHrefProperties.length} literal href properties).`);
  } else {
    process.stdout.write(output);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
