#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB_APP_ROOT = path.join(ROOT_DIR, 'apps/gurudevi-web/app');
const MOBILE_APP_ROOT = path.join(ROOT_DIR, 'apps/gurudevi-mobile/app');
const OUTPUT_PATH = path.join(ROOT_DIR, 'reports/flow-dag-audit.json');

const IGNORED_DIRS = new Set(['node_modules', '.next', '.turbo', '.git', '_layout', '__tests__']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return IGNORED_DIRS.has(entry.name) ? [] : walk(path.join(dir, entry.name));
    }
    return entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name) ? [path.join(dir, entry.name)] : [];
  });
}

function normalizeRoute(filePath, baseDir, isMobile = false) {
  const rel = path.relative(baseDir, filePath).replaceAll(path.sep, '/');
  if (isMobile) {
    // Mobile file-based routing: strip extension, keep route groups like (tabs)
    const withoutExt = rel.replace(/\.[^/.]+$/, '');
    if (withoutExt === 'index') return '/';
    return withoutExt.endsWith('/index')
      ? '/' + withoutExt.replace(/\/index$/, '')
      : '/' + withoutExt;
  } else {
    // Next.js App router: extract directory for page.tsx
    const dir = path.dirname(rel);
    if (path.basename(rel).startsWith('page.')) {
      if (dir === '.' || dir === '') return '/';
      // Next route groups (e.g. (sanctuary)) are stripped from browser URL path
      const segments = dir.split('/').filter((s) => !/^\([^/]+\)$/.test(s));
      return '/' + segments.join('/');
    }
    return null;
  }
}

export function runFlowDAGAudit() {
  const startTime = Date.now();

  // 1. Scan Web Routes
  const webFiles = walk(WEB_APP_ROOT);
  const webRoutes = new Set();
  for (const file of webFiles) {
    const route = normalizeRoute(file, WEB_APP_ROOT, false);
    if (route) webRoutes.add(route);
  }

  // 2. Scan Mobile Routes
  const mobileFiles = walk(MOBILE_APP_ROOT);
  const mobileRoutes = new Set();
  for (const file of mobileFiles) {
    if (path.basename(file).startsWith('_layout.')) continue;
    const route = normalizeRoute(file, MOBILE_APP_ROOT, true);
    if (route) mobileRoutes.add(route);
  }

  // 3. Scan Domain Packages for jtbdFlow declarations
  const domainPackageDirs = [
    path.join(ROOT_DIR, 'packages/core/src'),
    path.join(ROOT_DIR, 'packages/classroom/src'),
    path.join(ROOT_DIR, 'packages/admin/src'),
    path.join(ROOT_DIR, 'packages/self/src'),
    path.join(ROOT_DIR, 'packages/community/src'),
    path.join(ROOT_DIR, 'packages/library/src'),
  ];

  const declaredFlows = [];
  const flowPattern = /jtbdFlow\s*:\s*\{|flowId\s*:\s*['"`]flow:/g;

  // 3a. Scan dedicated flow definitions in @repo/core/src/flows
  const coreFlowsDir = path.join(ROOT_DIR, 'packages/core/src/flows');
  const modularFlowFiles = walk(coreFlowsDir).filter((f) => f.endsWith('.flow.ts'));

  for (const pkgDir of domainPackageDirs) {
    if (!fs.existsSync(pkgDir)) continue;
    const tsFiles = walk(pkgDir);
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (flowPattern.test(content)) {
        declaredFlows.push({
          file: path.relative(ROOT_DIR, file).replaceAll(path.sep, '/'),
        });
      }
    }
  }

  const results = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    elapsedMs: Date.now() - startTime,
    inventory: {
      totalWebRoutes: webRoutes.size,
      totalMobileRoutes: mobileRoutes.size,
      modularFlowDefinitions: modularFlowFiles.length,
      declaredFlowFiles: declaredFlows.length,
    },
    sampleRoutes: {
      web: Array.from(webRoutes).slice(0, 15),
      mobile: Array.from(mobileRoutes).slice(0, 15),
    },
    findings: [],
  };

  // Write Report
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf8');

  console.log(`[FlowDAG Audit] Scanned ${webRoutes.size} web routes, ${mobileRoutes.size} mobile routes in ${results.elapsedMs}ms.`);
  console.log(`[FlowDAG Audit] Report written to: ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFlowDAGAudit();
}
