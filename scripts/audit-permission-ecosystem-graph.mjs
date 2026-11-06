import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Core files in the permission & identity subsystem
const SEED_FILES = [
  'packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts',
  'packages/core/src/logic/permissions/sanctuaryFeature.ts',
  'packages/core/src/logic/permissions/accessContext.ts',
  'packages/core/src/logic/permissions/baselineCapabilities.ts',
  'packages/core/src/logic/permissions/bondScope.ts',
  'packages/core/src/logic/permissions/cedarEvaluator.ts',
  'packages/core/src/logic/permissions/localEvaluator.ts',
  'packages/core/src/logic/permissions/sovereignty.ts',
  'packages/core/src/store/useCedarDecisionStore.ts',
  'packages/core/src/store/usePerspectiveStore.ts',
  'packages/core/src/store/useEntitlementStore.ts',
  'packages/core/src/store/useFeatureStore.ts',
  'packages/core/src/store/scopeSession.ts',
  'packages/core/src/types/Identity.ts',
  'packages/core/src/types/Perspective.ts',
  'packages/core/src/types/authorization.ts',
  'packages/core/src/logic/registry/citizenship.ts',
  'packages/core/src/logic/ports/entitlement.port.ts',
];

function resolveImportPath(importStr, sourceFile) {
  if (importStr.startsWith('@repo/core/')) {
    const subpath = importStr.replace('@repo/core/', '');
    const candidateTs = path.join(ROOT_DIR, 'packages/core/src', subpath + '.ts');
    const candidateTsx = path.join(ROOT_DIR, 'packages/core/src', subpath + '.tsx');
    const candidateIdx = path.join(ROOT_DIR, 'packages/core/src', subpath, 'index.ts');
    if (fs.existsSync(candidateTs)) return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/');
    if (fs.existsSync(candidateTsx)) return path.relative(ROOT_DIR, candidateTsx).replace(/\\/g, '/');
    if (fs.existsSync(candidateIdx)) return path.relative(ROOT_DIR, candidateIdx).replace(/\\/g, '/');
    return path.relative(ROOT_DIR, candidateTs).replace(/\\/g, '/'); // Unresolved / phantom
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
  return null; // External package
}

function parseFile(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    return {
      path: relPath,
      exists: false,
      imports: [],
      exports: [],
      loc: 0,
    };
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  const imports = [];
  const importRegex = /import\s+(?:type\s+)?(?:(\{[^}]+\})|([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const symbols = match[1]
      ? match[1].replace(/[{}]/g, '').split(',').map(s => s.trim().replace(/^type\s+/, '')).filter(Boolean)
      : [match[2]];
    const importSource = match[3];
    const resolved = resolveImportPath(importSource, relPath);
    if (resolved) {
      imports.push({
        source: importSource,
        resolved,
        symbols,
        exists: fs.existsSync(path.join(ROOT_DIR, resolved)),
      });
    }
  }

  const exports = [];
  const exportRegex = /export\s+(?:const|function|interface|type|class)\s+([a-zA-Z0-9_$]+)/g;
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  return {
    path: relPath,
    exists: true,
    imports,
    exports,
    loc: lines.length,
  };
}

// Traverse graph
const visited = new Set();
const queue = [...SEED_FILES];
const nodes = new Map();
const edges = [];

while (queue.length > 0) {
  const file = queue.shift();
  if (visited.has(file)) continue;
  visited.add(file);

  const parsed = parseFile(file);
  nodes.set(file, parsed);

  for (const imp of parsed.imports) {
    edges.push({
      from: file,
      to: imp.resolved,
      symbols: imp.symbols,
      exists: imp.exists,
    });
    if (!visited.has(imp.resolved) && imp.resolved.startsWith('packages/core/')) {
      queue.push(imp.resolved);
    }
  }
}

// Generate Mermaid
let mermaid = 'graph TD\n';
for (const [f, node] of nodes.entries()) {
  const label = path.basename(f);
  const nodeId = f.replace(/[^a-zA-Z0-9]/g, '_');
  if (!node.exists) {
    mermaid += `    ${nodeId}["❌ ${label}<br/>(PHANTOM/DEAD)"]:::dead\n`;
  } else if (f.includes('useSanctuaryFeature') || f.includes('sanctuaryFeature')) {
    mermaid += `    ${nodeId}["⭐ ${label}<br/>(${node.loc} lines)"]:::core\n`;
  } else if (f.includes('store/')) {
    mermaid += `    ${nodeId}["🗄️ ${label}<br/>(Store)"]:::store\n`;
  } else if (f.includes('types/')) {
    mermaid += `    ${nodeId}["🏷️ ${label}<br/>(Types)"]:::type\n`;
  } else {
    mermaid += `    ${nodeId}["📄 ${label}"]:::logic\n`;
  }
}

for (const edge of edges) {
  const fromId = edge.from.replace(/[^a-zA-Z0-9]/g, '_');
  const toId = edge.to.replace(/[^a-zA-Z0-9]/g, '_');
  const symLabel = edge.symbols.slice(0, 2).join(', ') + (edge.symbols.length > 2 ? '...' : '');
  if (!edge.exists) {
    mermaid += `    ${fromId} -.->|❌ ${symLabel}| ${toId}\n`;
  } else {
    mermaid += `    ${fromId} -->|"${symLabel}"| ${toId}\n`;
  }
}

mermaid += `
    classDef core fill:#dbeafe,stroke:#2563eb,stroke-width:3px,color:#1e3a8a;
    classDef store fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef type fill:#e0e7ff,stroke:#6366f1,stroke-width:1px,color:#312e81;
    classDef logic fill:#f3f4f6,stroke:#9ca3af,stroke-width:1px,color:#1f2937;
    classDef dead fill:#fee2e2,stroke:#ef4444,stroke-width:2px,stroke-dasharray: 5 5,color:#991b1b;
`;

const result = {
  totalNodes: nodes.size,
  totalEdges: edges.length,
  phantomEdges: edges.filter(e => !e.exists),
  nodes: Array.from(nodes.values()),
  edges,
  mermaid,
};

fs.writeFileSync(
  path.join(ROOT_DIR, 'reports/permission-ecosystem-graph.json'),
  JSON.stringify(result, null, 2),
);

console.log(`[Permission Graph Auditor] Scanned ${nodes.size} nodes, ${edges.length} edges.`);
console.log(`[Permission Graph Auditor] Phantom/unresolved edges: ${result.phantomEdges.length}`);
