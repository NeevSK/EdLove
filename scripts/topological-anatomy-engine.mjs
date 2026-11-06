import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

/**
 * Normalizes relative or monorepo alias import paths to a canonical repo-relative path.
 */
function resolveCanonicalPath(importStr, sourceFile) {
  if (importStr.startsWith('@repo/core/')) {
    const subpath = importStr.replace('@repo/core/', '');
    const candidateTs = path.join(ROOT_DIR, 'packages/core/src', subpath + '.ts');
    const candidateTsx = path.join(ROOT_DIR, 'packages/core/src', subpath + '.tsx');
    const candidateIdx = path.join(ROOT_DIR, 'packages/core/src', subpath, 'index.ts');
    if (fs.existsSync(candidateTs)) return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/');
    if (fs.existsSync(candidateTsx)) return path.relative(ROOT_DIR, candidateTsx).replace(/\\/g, '/');
    if (fs.existsSync(candidateIdx)) return path.relative(ROOT_DIR, candidateIdx).replace(/\\/g, '/');
    return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/');
  }

  if (importStr.startsWith('@repo/ui/')) {
    const subpath = importStr.replace('@repo/ui/', '');
    const candidateTs = path.join(ROOT_DIR, 'packages/ui/src', subpath + '.ts');
    const candidateTsx = path.join(ROOT_DIR, 'packages/ui/src', subpath + '.tsx');
    const candidateIdx = path.join(ROOT_DIR, 'packages/ui/src', subpath, 'index.ts');
    if (fs.existsSync(candidateTs)) return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/');
    if (fs.existsSync(candidateTsx)) return path.relative(ROOT_DIR, candidateTsx).replace(/\\/g, '/');
    if (fs.existsSync(candidateIdx)) return path.relative(ROOT_DIR, candidateIdx).replace(/\\/g, '/');
    return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/');
  }

  if (importStr.startsWith('.')) {
    const dir = path.dirname(path.join(ROOT_DIR, sourceFile));
    const resolved = path.resolve(dir, importStr);
    const candidateTs = resolved + '.ts';
    const candidateTsx = resolved + '.tsx';
    const candidateIdx = path.join(resolved, 'index.ts');
    if (fs.existsSync(candidateTs)) return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/');
    if (fs.existsSync(candidateTsx)) return path.relative(ROOT_DIR, candidateTsx).replace(/\\/g, '/');
    if (fs.existsSync(candidateIdx)) return path.relative(ROOT_DIR, candidateIdx).replace(/\\/g, '/');
    return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/');
  }

  return null; // External package (react, zustand, zod, etc.)
}

/**
 * Extracts granular AST declarations from a TypeScript file.
 */
function inspectFileAnatomy(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    return {
      path: relPath,
      exists: false,
      loc: 0,
      functions: [],
      types: [],
      interfaces: [],
      constants: [],
      imports: [],
      exports: [],
    };
  }

  const rawContent = fs.readFileSync(fullPath, 'utf8');
  // Strip comments to avoid matching import examples in docstrings
  const content = rawContent
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');
  const lines = rawContent.split('\n');

  // Imports
  const imports = [];
  const importRegex = /import\s+(type\s+)?(?:(\{[^}]+\})|([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const isTypeOnly = Boolean(match[1]);
    const symbols = match[2]
      ? match[2].replace(/[{}]/g, '').split(',').map(s => s.trim().replace(/^type\s+/, '')).filter(Boolean)
      : [match[3]];
    const importSource = match[4];
    const canonical = resolveCanonicalPath(importSource, relPath);
    imports.push({
      source: importSource,
      canonical,
      isExternal: canonical === null,
      isTypeOnly,
      symbols,
      exists: canonical ? fs.existsSync(path.join(ROOT_DIR, canonical)) : true,
    });
  }

  // Declared Functions
  const functions = [];
  const fnRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/g;
  while ((match = fnRegex.exec(content)) !== null) {
    const isExported = match[0].startsWith('export');
    functions.push({ name: match[1], isExported, params: match[2].trim() });
  }
  // Arrow functions
  const arrowRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/g;
  while ((match = arrowRegex.exec(content)) !== null) {
    const isExported = match[0].startsWith('export');
    functions.push({ name: match[1], isExported, params: match[2].trim() });
  }

  // Interfaces
  const interfaces = [];
  const ifaceRegex = /(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)/g;
  while ((match = ifaceRegex.exec(content)) !== null) {
    interfaces.push({ name: match[1], isExported: match[0].startsWith('export') });
  }

  // Types
  const types = [];
  const typeRegex = /(?:export\s+)?type\s+([a-zA-Z0-9_$]+)/g;
  while ((match = typeRegex.exec(content)) !== null) {
    types.push({ name: match[1], isExported: match[0].startsWith('export') });
  }

  // Constants
  const constants = [];
  const constRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=/g;
  while ((match = constRegex.exec(content)) !== null) {
    const name = match[1];
    // filter out arrow functions already captured
    if (!functions.some(f => f.name === name)) {
      constants.push({ name, isExported: match[0].startsWith('export') });
    }
  }

  // Exports
  const exports = [
    ...functions.filter(f => f.isExported).map(f => `fn: ${f.name}`),
    ...interfaces.filter(i => i.isExported).map(i => `interface: ${i.name}`),
    ...types.filter(t => t.isExported).map(t => `type: ${t.name}`),
    ...constants.filter(c => c.isExported).map(c => `const: ${c.name}`),
  ];

  return {
    path: relPath,
    exists: true,
    loc: lines.length,
    functions,
    types,
    interfaces,
    constants,
    imports,
    exports,
  };
}

/**
 * Builds the complete topological graph from a list of root files.
 */
export function buildTopologicalEcosystem(targetFiles) {
  const universe = new Map();
  const queue = [...targetFiles];
  const visited = new Set();

  while (queue.length > 0) {
    const file = queue.shift();
    if (visited.has(file)) continue;
    visited.add(file);

    const anatomy = inspectFileAnatomy(file);
    universe.set(file, anatomy);

    for (const imp of anatomy.imports) {
      if (!imp.isExternal && imp.canonical && !visited.has(imp.canonical)) {
        // Stay within monorepo core/ui boundary
        if (imp.canonical.startsWith('packages/core/') || imp.canonical.startsWith('packages/ui/')) {
          queue.push(imp.canonical);
        }
      }
    }
  }

  // Compute In-Degree and Out-Degree
  const internalEdges = [];
  for (const [filePath, fileAnatomy] of universe.entries()) {
    for (const imp of fileAnatomy.imports) {
      if (!imp.isExternal && imp.canonical && universe.has(imp.canonical)) {
        internalEdges.push({
          from: filePath,
          to: imp.canonical,
          symbols: imp.symbols,
          isTypeOnly: imp.isTypeOnly,
          exists: imp.exists,
        });
      }
    }
  }

  // Detect Cycles using DFS
  const adjList = new Map();
  for (const f of universe.keys()) adjList.set(f, []);
  for (const edge of internalEdges) adjList.get(edge.from).push(edge.to);

  const cycles = [];
  const dfsState = new Map(); // 0: unvisited, 1: visiting, 2: visited
  for (const f of universe.keys()) dfsState.set(f, 0);

  function checkCycles(u, currentPath) {
    dfsState.set(u, 1);
    currentPath.push(u);

    for (const v of adjList.get(u) || []) {
      if (dfsState.get(v) === 1) {
        // Cycle detected
        const cycleStartIndex = currentPath.indexOf(v);
        cycles.push([...currentPath.slice(cycleStartIndex), v]);
      } else if (dfsState.get(v) === 0) {
        checkCycles(v, currentPath);
      }
    }

    currentPath.pop();
    dfsState.set(u, 2);
  }

  for (const f of universe.keys()) {
    if (dfsState.get(f) === 0) {
      checkCycles(f, []);
    }
  }

  // Assign Topological Depth Layers
  // Layer 0: Files with 0 outgoing internal dependencies (pure leaves)
  // Layer N: max(layer of dependencies) + 1
  const depthMemo = new Map();
  const visiting = new Set();

  function computeDepth(u) {
    if (depthMemo.has(u)) return depthMemo.get(u);
    if (visiting.has(u)) return 0; // Break cycle for depth estimation
    visiting.add(u);

    const deps = adjList.get(u) || [];
    if (deps.length === 0) {
      depthMemo.set(u, 0);
      visiting.delete(u);
      return 0;
    }

    let maxDepDepth = 0;
    for (const v of deps) {
      const d = computeDepth(v);
      if (d > maxDepDepth) maxDepDepth = d;
    }

    const depth = maxDepDepth + 1;
    depthMemo.set(u, depth);
    visiting.delete(u);
    return depth;
  }

  for (const f of universe.keys()) {
    computeDepth(f);
  }

  // Group files by layer
  const layers = new Map();
  for (const [f, depth] of depthMemo.entries()) {
    if (!layers.has(depth)) layers.set(depth, []);
    layers.get(depth).push(universe.get(f));
  }

  return {
    universe,
    edges: internalEdges,
    cycles,
    depthMemo,
    layers,
  };
}

// Default execution on Sanctuary Feature subsystem
const SANCTUARY_ENTRYPOINTS = [
  'packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts',
  'packages/core/src/logic/permissions/sanctuaryFeature.ts',
  'packages/ui/src/components/SanctuaryGuard.tsx',
  'packages/core/src/store/usePerspectiveStore.ts',
  'packages/core/src/store/useCedarDecisionStore.ts',
  'packages/core/src/store/useEntitlementStore.ts',
  'packages/core/src/types/Identity.ts',
  'packages/core/src/types/Perspective.ts',
];

const result = buildTopologicalEcosystem(SANCTUARY_ENTRYPOINTS);

console.log('======================================================');
console.log(' SANCTUARY FEATURE TOPOLOGICAL LAYER AUDIT');
console.log('======================================================');
console.log(`Total Files in Subsystem: ${result.universe.size}`);
console.log(`Internal Dependency Edges: ${result.edges.length}`);
console.log(`Cycles Detected: ${result.cycles.length}`);
if (result.cycles.length > 0) {
  console.log('⚠️ Cycles:', JSON.stringify(result.cycles, null, 2));
}

const maxLayer = Math.max(...result.layers.keys());
console.log(`Layer Depth Span: 0 to ${maxLayer} (${maxLayer + 1} distinct architectural layers)\n`);

for (let l = 0; l <= maxLayer; l++) {
  const files = result.layers.get(l) || [];
  console.log(`--- LAYER ${l} (${files.length} files) ---`);
  for (const f of files) {
    const internalFns = f.functions.length;
    const internalTypes = f.types.length + f.interfaces.length;
    console.log(`  • [L${l}] ${f.path} (${f.loc} loc | ${internalFns} fns, ${internalTypes} types, ${f.exports.length} exports)`);
  }
}

// Write out JSON
fs.writeFileSync(
  path.join(ROOT_DIR, 'reports/topological-layer-analysis.json'),
  JSON.stringify(
    {
      totalFiles: result.universe.size,
      totalEdges: result.edges.length,
      cycles: result.cycles,
      maxLayer,
      layerBreakdown: Array.from(result.layers.entries()).map(([layer, files]) => ({
        layer,
        files: files.map(f => ({
          path: f.path,
          loc: f.loc,
          functions: f.functions,
          types: f.types,
          interfaces: f.interfaces,
          constants: f.constants,
          exports: f.exports,
          imports: f.imports.filter(i => !i.isExternal),
        })),
      })),
      edges: result.edges,
    },
    null,
    2,
  ),
);
