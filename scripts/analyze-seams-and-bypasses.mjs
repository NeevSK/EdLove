import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const archData = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json'), 'utf8')
);

const { layerBreakdown, edges, totalFiles } = archData;

// Flatten nodes
const nodeMap = new Map();
for (const layer of layerBreakdown) {
  for (const f of layer.files) {
    nodeMap.set(f.path, {
      ...f,
      layer: layer.layer,
      isBedrock: layer.layer === 0,
    });
  }
}

// Build adjacency
const outgoing = new Map(); // from -> [to]
const incoming = new Map(); // to -> [from]
for (const p of nodeMap.keys()) {
  outgoing.set(p, []);
  incoming.set(p, []);
}

for (const e of edges) {
  if (outgoing.has(e.from)) outgoing.get(e.from).push(e.to);
  if (incoming.has(e.to)) incoming.get(e.to).push(e.from);
}

// 1. Identify Domain Seams
function assignSeam(filePath) {
  const p = filePath.toLowerCase();
  if (p.includes('featureflag') || p.includes('featurerollout') || p.includes('featurelifecycle') || p.includes('usefeaturestore')) {
    return 'Feature Flags & Rollout Seam';
  }
  if (p.includes('entitlement')) {
    return 'Entitlements & Monetization Seam';
  }
  if (p.includes('cedar') || p.includes('authz') || p.includes('authorization')) {
    return 'Cedar Authorization Seam';
  }
  if (p.includes('perspective') || p.includes('srilankanschools') || p.includes('scopesession')) {
    return 'Perspective & Workspace Seam';
  }
  if (p.includes('identity') || p.includes('bondscope') || p.includes('citizenship') || p.includes('accesscontext') || p.includes('baselinecapabilities') || p.includes('sanctuaryfeature')) {
    return 'ReBAC Identity & Sanctuary Feature Seam';
  }
  if (p.includes('account') || p.includes('guest') || p.includes('storage') || p.includes('powersync') || p.includes('eventbus') || p.includes('auth')) {
    return 'Auth Session, Storage & Sync Seam';
  }
  if (p.includes('packages/ui') || p.includes('button') || p.includes('prompt') || p.includes('haptics') || p.includes('classnames') || p.includes('icons')) {
    return 'UI Presentation & Prompts Seam';
  }
  return 'Cross-Cutting Primitives';
}

// 2. Detect Transitive Bypasses (Diamond Dependencies)
// An edge U -> V is a bypass if there exists an alternate path U -> W -> ... -> V where len >= 2
function findBypasses() {
  const bypasses = [];

  for (const [u, directDeps] of outgoing.entries()) {
    for (const v of directDeps) {
      // Search for alternate path from u to v not using direct edge u -> v
      // BFS from children of u (excluding v directly)
      const queue = directDeps.filter(d => d !== v).map(d => [d]);
      const visited = new Set(directDeps.filter(d => d !== v));
      let alternatePath = null;

      while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];

        if (curr === v) {
          alternatePath = path;
          break;
        }

        const nexts = outgoing.get(curr) || [];
        for (const nxt of nexts) {
          if (!visited.has(nxt)) {
            visited.add(nxt);
            queue.push([...path, nxt]);
          }
        }
      }

      if (alternatePath) {
        const uNode = nodeMap.get(u);
        const vNode = nodeMap.get(v);
        const uSeam = assignSeam(u);
        const vSeam = assignSeam(v);
        const isSameSeam = uSeam === vSeam;

        bypasses.push({
          from: u,
          fromLayer: uNode?.layer ?? '?',
          to: v,
          toLayer: vNode?.layer ?? '?',
          alternatePath: [u, ...alternatePath],
          pathLength: alternatePath.length + 1,
          uSeam,
          vSeam,
          isSameSeam,
        });
      }
    }
  }

  return bypasses;
}

const bypasses = findBypasses();

// 3. Folder Topology Analysis
const folderMap = new Map();
for (const [pathStr, node] of nodeMap.entries()) {
  const folder = path.dirname(pathStr).replace(/\\/g, '/');
  if (!folderMap.has(folder)) {
    folderMap.set(folder, []);
  }
  folderMap.get(folder).push(node);
}

const folderReports = [];
for (const [folder, files] of folderMap.entries()) {
  const layers = files.map(f => f.layer);
  const minLayer = Math.min(...layers);
  const maxLayer = Math.max(...layers);
  const span = maxLayer - minLayer;
  folderReports.push({
    folder,
    fileCount: files.length,
    minLayer,
    maxLayer,
    span,
    files: files.map(f => ({ name: path.basename(f.path), layer: f.layer, loc: f.loc })),
  });
}

folderReports.sort((a, b) => b.span - a.span || b.fileCount - a.fileCount);

// 4. Output Summary Report
console.log('=================================================================');
console.log(`SUBYSTEM COMPUTATIONAL ANALYSIS: ${totalFiles} Total Files`);
console.log('=================================================================');
console.log(`Detected Transitive Bypasses: ${bypasses.length} edges`);
const sameSeamBypasses = bypasses.filter(b => b.isSameSeam);
console.log(`Same-Seam Layer Bypasses (Critical Smells): ${sameSeamBypasses.length}`);

console.log('\n--- TOP SAME-SEAM BYPASSES ---');
for (const b of sameSeamBypasses.slice(0, 10)) {
  console.log(`[L${b.fromLayer} -> L${b.toLayer}] ${path.basename(b.from)} -> ${path.basename(b.to)}`);
  console.log(`   Seam: ${b.uSeam}`);
  console.log(`   Intermediate Path: ${b.alternatePath.map(p => `${path.basename(p)} (L${nodeMap.get(p)?.layer})`).join(' -> ')}\n`);
}

console.log('\n--- FOLDER TO LAYER COHESION (Sorted by Layer Span) ---');
for (const f of folderReports.slice(0, 10)) {
  console.log(`Folder: ${f.folder} | Files: ${f.fileCount} | Layers: L${f.minLayer}..L${f.maxLayer} (Span: ${f.span})`);
}

// Write full JSON report
fs.writeFileSync(
  path.join(ROOT_DIR, 'reports/seams-and-bypasses-audit.json'),
  JSON.stringify({ totalFiles, bypassCount: bypasses.length, sameSeamBypasses, folderReports, bypasses }, null, 2)
);
console.log('\nSaved full report to reports/seams-and-bypasses-audit.json');
