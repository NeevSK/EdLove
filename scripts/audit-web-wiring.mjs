import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const WEB_ROOT = path.join(ROOT_DIR, 'apps/gurudevi-web');

const SEARCH_DIRS = [
  path.join(WEB_ROOT, 'app'),
  path.join(WEB_ROOT, 'lib'),
  path.join(WEB_ROOT, 'components'),
];

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.module.css', '.css'];

const NEXTJS_SPECIAL_FILENAMES = new Set([
  'page.tsx',
  'page.jsx',
  'page.js',
  'layout.tsx',
  'layout.jsx',
  'layout.js',
  'loading.tsx',
  'loading.jsx',
  'error.tsx',
  'error.jsx',
  'not-found.tsx',
  'not-found.jsx',
  'route.ts',
  'route.js',
  'default.tsx',
  'template.tsx',
  'proxy.ts',
  'middleware.ts',
  'robots.ts',
  'sitemap.ts',
  'next-env.d.ts',
]);

function norm(p) {
  if (!p) return '';
  return path.resolve(p).toLowerCase().replace(/\\/g, '/');
}

function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.turbo', 'coverage', '.git'].includes(entry.name)) continue;
      walkDir(fullPath, fileList);
    } else if (entry.isFile()) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function resolveImportPath(importingFile, importSpecifier) {
  let basePath;

  if (importSpecifier.startsWith('@/')) {
    basePath = path.resolve(WEB_ROOT, importSpecifier.slice(2));
  } else if (importSpecifier.startsWith('.')) {
    basePath = path.resolve(path.dirname(importingFile), importSpecifier);
  } else if (importSpecifier.startsWith('/')) {
    basePath = path.resolve(WEB_ROOT, importSpecifier.replace(/^\//, ''));
  } else {
    // Might be relative or external
    return null;
  }

  // Check direct file match (e.g. .module.css)
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return norm(basePath);
  }

  // Check with extensions
  for (const ext of EXTENSIONS) {
    const withExt = basePath + ext;
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
      return norm(withExt);
    }
  }

  // Check index file
  for (const ext of EXTENSIONS) {
    const indexFile = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
      return norm(indexFile);
    }
  }

  return null;
}

function parseImports(filePath) {
  if (
    !filePath.endsWith('.ts') &&
    !filePath.endsWith('.tsx') &&
    !filePath.endsWith('.js') &&
    !filePath.endsWith('.jsx')
  ) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];

  // Match:
  // - import '...'
  // - import foo from '...'
  // - import { foo } from '...'
  // - import * as foo from '...'
  // - export { foo } from '...'
  // - export * from '...'
  // - export * as foo from '...'
  const importExportRegex = /(?:import|export)\s+(?:type\s+)?(?:(?:[\w*\s{},$]+|{[\s\S]*?})\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importExportRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  // Fallback simple: any `from '...'` or `from "..."`
  const simpleFromRegex = /\bfrom\s+['"]([^'"]+)['"]/g;
  while ((match = simpleFromRegex.exec(content)) !== null) {
    if (!matches.includes(match[1])) matches.push(match[1]);
  }

  // Dynamic import('...')
  const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicRegex.exec(content)) !== null) {
    if (!matches.includes(match[1])) matches.push(match[1]);
  }

  // require('...')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    if (!matches.includes(match[1])) matches.push(match[1]);
  }

  return matches;
}

function main() {
  console.log('Scanning apps/gurudevi-web with normalized path resolution...');

  const allWebFiles = [];
  for (const dir of SEARCH_DIRS) {
    walkDir(dir, allWebFiles);
  }

  const testsFiles = walkDir(path.join(WEB_ROOT, 'tests'));

  // Also include proxy.ts and root config
  const rootFiles = ['proxy.ts', 'middleware.ts'].map((f) => path.join(WEB_ROOT, f)).filter(fs.existsSync);
  allWebFiles.push(...rootFiles);

  const sourceFiles = allWebFiles
    .filter((f) => EXTENSIONS.some((ext) => f.endsWith(ext)))
    .filter((f) => !f.endsWith('.d.ts'));

  const fileMap = new Map(); // normPath -> originalPath
  const incomingEdges = new Map(); // normPath -> Set of normPath importers
  const outgoingEdges = new Map(); // normPath -> Set of normPath imported

  for (const file of sourceFiles) {
    const n = norm(file);
    fileMap.set(n, file);
    incomingEdges.set(n, new Set());
    outgoingEdges.set(n, new Set());
  }

  // Populate graph
  for (const file of sourceFiles) {
    const fromNorm = norm(file);
    const rawImports = parseImports(file);
    for (const spec of rawImports) {
      const resolved = resolveImportPath(file, spec);
      if (resolved && incomingEdges.has(resolved)) {
        incomingEdges.get(resolved).add(fromNorm);
        outgoingEdges.get(fromNorm).add(resolved);
      }
    }
  }

  // Record test imports
  const testImporters = new Map();
  for (const testFile of testsFiles) {
    const fromNorm = norm(testFile);
    const rawImports = parseImports(testFile);
    for (const spec of rawImports) {
      const resolved = resolveImportPath(testFile, spec);
      if (resolved && incomingEdges.has(resolved)) {
        if (!testImporters.has(resolved)) testImporters.set(resolved, new Set());
        testImporters.get(resolved).add(fromNorm);
      }
    }
  }

  // Also check packages/* and apps/*
  const otherAppDirs = [
    path.join(ROOT_DIR, 'packages/core/src'),
    path.join(ROOT_DIR, 'packages/ui/src'),
    path.join(ROOT_DIR, 'packages/classroom/src'),
  ];
  for (const otherDir of otherAppDirs) {
    const files = walkDir(otherDir);
    for (const f of files) {
      const rawImports = parseImports(f);
      for (const spec of rawImports) {
        if (spec.includes('gurudevi-web')) {
          const resolved = resolveImportPath(f, spec);
          if (resolved && incomingEdges.has(resolved)) {
            incomingEdges.get(resolved).add(norm(f));
          }
        }
      }
    }
  }

  // Production Entry Points
  const entryPoints = new Set();
  for (const file of sourceFiles) {
    const basename = path.basename(file);
    if (NEXTJS_SPECIAL_FILENAMES.has(basename)) {
      entryPoints.add(norm(file));
    }
  }

  // Reachability traversal
  const reachableFromProduction = new Set();
  const queue = Array.from(entryPoints);

  for (const ep of queue) {
    reachableFromProduction.add(ep);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    const children = outgoingEdges.get(current) || new Set();
    for (const child of children) {
      if (!reachableFromProduction.has(child)) {
        reachableFromProduction.add(child);
        queue.push(child);
      }
    }
  }

  // Categorize
  const completelyDead = [];
  const testOnlyReachable = [];
  const islandClusters = [];
  const unusedCss = [];

  const normWebRoot = norm(WEB_ROOT);

  for (const [nPath, origPath] of fileMap.entries()) {
    const relPath = path.relative(WEB_ROOT, origPath).replace(/\\/g, '/');
    const basename = path.basename(origPath);
    const isSpecial = NEXTJS_SPECIAL_FILENAMES.has(basename);
    const inDegree = incomingEdges.get(nPath)?.size || 0;
    const testInDegree = testImporters.get(nPath)?.size || 0;


    if (origPath.endsWith('.module.css')) {
      if (inDegree === 0) {
        unusedCss.push(relPath);
      }
      continue;
    }

    // Skip special Next.js files and test files
    if (isSpecial || basename.includes('.test.') || basename.includes('.spec.')) continue;

    if (inDegree === 0 && testInDegree === 0) {
      completelyDead.push(relPath);
    } else if (inDegree === 0 && testInDegree > 0) {
      const tests = Array.from(testImporters.get(nPath)).map((t) => path.relative(WEB_ROOT, t).replace(/\\/g, '/'));
      testOnlyReachable.push({ file: relPath, tests });
    } else if (!reachableFromProduction.has(nPath)) {
      const importers = Array.from(incomingEdges.get(nPath)).map((t) => path.relative(WEB_ROOT, t).replace(/\\/g, '/'));
      islandClusters.push({ file: relPath, importers, testCount: testInDegree });
    }
  }

  console.log('\n======================================================');
  console.log('       GURUDEVI-WEB WIRING & REACHABILITY REPORT       ');
  console.log('======================================================');
  console.log(`Total Source Files: ${sourceFiles.length}`);
  console.log(`Production Routes / Entry Points: ${entryPoints.size}`);
  console.log(`Fully Wired Production Reachable: ${reachableFromProduction.size}`);
  console.log(`Completely Dead / Orphaned (0 prod, 0 test): ${completelyDead.length}`);
  console.log(`Test-Only Reachable (0 prod, >0 test): ${testOnlyReachable.length}`);
  console.log(`Island Clusters (Imported, but disconnected from route tree): ${islandClusters.length}`);
  console.log(`Unused CSS Modules: ${unusedCss.length}`);
  console.log('======================================================\n');

  if (completelyDead.length > 0) {
    console.log(`🔴 TRULY DEAD / UNWIRED FILES (${completelyDead.length}):`);
    for (const f of completelyDead) {
      console.log(`  - ${f}`);
    }
    console.log('');
  }

  if (testOnlyReachable.length > 0) {
    console.log(`🟡 TEST-ONLY REACHABLE FILES (${testOnlyReachable.length}):`);
    for (const item of testOnlyReachable) {
      console.log(`  - ${item.file} (tested by: ${item.tests.join(', ')})`);
    }
    console.log('');
  }

  if (islandClusters.length > 0) {
    console.log(`🟠 ISLAND CLUSTERS (Connected amongst themselves, but NOT routed into any page) (${islandClusters.length}):`);
    for (const item of islandClusters) {
      console.log(`  - ${item.file} (imported by: ${item.importers.join(', ')}${item.testCount > 0 ? ` + ${item.testCount} tests` : ''})`);
    }
    console.log('');
  }

  if (unusedCss.length > 0) {
    console.log(`⚪ UNUSED CSS MODULES (${unusedCss.length}):`);
    for (const f of unusedCss) {
      console.log(`  - ${f}`);
    }
    console.log('');
  }

  const isStrict = process.argv.includes('--strict');
  if (isStrict) {
    const deadComponents = completelyDead.filter((f) => f.endsWith('.tsx') || f.endsWith('.jsx'));
    if (unusedCss.length > 0 || deadComponents.length > 0) {
      console.error('❌ STRICT AUDIT FAILED: Unwired components or unused CSS modules detected.');
      process.exit(1);
    }
    console.log('✔ Strict audit passed: Zero unwired UI components and zero unused CSS modules.');
  }
}

main();

