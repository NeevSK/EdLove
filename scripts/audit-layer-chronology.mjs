import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

// Load the graph files from code-erd logic
const entryPoints = [
  'packages/ui/src/components/SanctuaryGuard.tsx',
  'packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts',
  'packages/core/src/logic/auth/identityState.ts',
];

function resolveCanonical(importStr, sourceFile) {
  if (importStr.startsWith('@repo/core/')) {
    const sub = importStr.replace('@repo/core/', '');
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      const p = path.join(ROOT_DIR, 'packages/core/src', sub + (ext.startsWith('/') ? ext : ext));
      if (fs.existsSync(p)) return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
    }
  }
  if (importStr.startsWith('@repo/ui/')) {
    const sub = importStr.replace('@repo/ui/', '');
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      const p = path.join(ROOT_DIR, 'packages/ui/src', sub + (ext.startsWith('/') ? ext : ext));
      if (fs.existsSync(p)) return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
    }
  }
  if (importStr.startsWith('.')) {
    const dir = path.dirname(path.join(ROOT_DIR, sourceFile));
    const resolved = path.resolve(dir, importStr);
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      const p = resolved + (ext.startsWith('/') ? ext : ext);
      if (fs.existsSync(p)) return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
    }
  }
  return null;
}

function extractImports(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return [];
  const raw = fs.readFileSync(fullPath, 'utf8');
  const clean = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  const imports = [];
  const impRegex = /import\s+(?:type\s+)?(?:(\{[^}]+\})|([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = impRegex.exec(clean)) !== null) {
    const source = match[3];
    const canonical = resolveCanonical(source, relPath);
    if (canonical) imports.push(canonical);
  }
  return imports;
}

// Collect all reachable files
const visited = new Set();
const queue = [...entryPoints];
const graph = new Map(); // file -> [dependencies]
const incoming = new Map(); // file -> [dependents]

while (queue.length > 0) {
  const curr = queue.shift();
  if (visited.has(curr)) continue;
  visited.add(curr);

  const deps = extractImports(curr);
  graph.set(curr, deps);

  for (const dep of deps) {
    if (!incoming.has(dep)) incoming.set(dep, []);
    incoming.get(dep).push(curr);
    if (!visited.has(dep)) queue.push(dep);
  }
}

console.log(`Discovered ${visited.size} total files in subsystem scope.`);

// Compute topological layers
function computeLayers() {
  const layers = new Map();
  // Find bedrock (out-degree 0 in internal graph)
  for (const f of visited) {
    const deps = graph.get(f) || [];
    if (deps.length === 0) {
      layers.set(f, 0);
    }
  }

  let changed = true;
  let iter = 0;
  while (changed && iter < 50) {
    changed = false;
    iter++;
    for (const f of visited) {
      if (layers.has(f) && layers.get(f) === 0) continue;
      const deps = graph.get(f) || [];
      if (deps.length === 0) {
        if (!layers.has(f) || layers.get(f) !== 0) {
          layers.set(f, 0);
          changed = true;
        }
        continue;
      }
      const depLayers = deps.map(d => layers.get(d)).filter(l => l !== undefined);
      if (depLayers.length === deps.length) {
        const maxDep = Math.max(...depLayers);
        const myLayer = maxDep + 1;
        if (layers.get(f) !== myLayer) {
          layers.set(f, myLayer);
          changed = true;
        }
      }
    }
  }

  // Fallback for uncomputed (cycles)
  for (const f of visited) {
    if (!layers.has(f)) layers.set(f, 99);
  }
  return layers;
}

const fileLayers = computeLayers();

// Extract Git history for each file
const fileReports = [];

for (const filePath of visited) {
  const fullPath = path.join(ROOT_DIR, filePath);
  const exists = fs.existsSync(fullPath);
  let loc = 0;
  if (exists) {
    loc = fs.readFileSync(fullPath, 'utf8').split('\n').length;
  }

  let gitHistory = [];
  try {
    const rawLog = execSync(
      `git log --follow --format="%h|%ad|%s" --date=short -- "${filePath}"`,
      { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    ).trim();

    if (rawLog) {
      gitHistory = rawLog.split('\n').map(line => {
        const [hash, date, ...rest] = line.split('|');
        return { hash, date, message: rest.join('|') };
      });
    }
  } catch (err) {
    // Git error or uncommitted
  }

  const birthCommit = gitHistory[gitHistory.length - 1] || null;
  const latestCommit = gitHistory[0] || null;
  const commitCount = gitHistory.length;

  const layer = fileLayers.get(filePath) ?? 0;
  const deps = graph.get(filePath) || [];
  const callers = incoming.get(filePath) || [];

  // Determine Architectural Era & Category
  let era = 'Unknown';
  const birthDate = birthCommit ? birthCommit.date : 'Uncommitted';
  if (birthDate.startsWith('2026-06') || birthDate.startsWith('2026-05')) {
    era = 'Era 1: Legacy Bootstrap (June 2026)';
  } else if (birthDate.startsWith('2026-07') || birthDate.startsWith('2026-08')) {
    era = 'Era 2: CASL & Permissions Accretion (July-Aug 2026)';
  } else if (birthDate.startsWith('2026-09')) {
    era = 'Era 3: Agentic Feature & Race Accretion (Sept 2026)';
  } else if (birthDate.startsWith('2026-10') || birthDate.startsWith('2026-11')) {
    era = 'Era 4: Canonical ReBAC & Architecture Modernization (Oct-Nov 2026)';
  }

  // Diagnostic verdict
  let verdict = 'Essential Component';
  let redundancyNotes = '';

  if (loc === 0) {
    verdict = 'Deadweight (0 LOC empty file)';
    redundancyNotes = 'File is completely empty (0 lines). Safe to retire.';
  } else if (callers.length === 0 && filePath !== 'packages/ui/src/components/SanctuaryGuard.tsx') {
    verdict = 'Orphaned Subsystem Node (0 in-degree callers)';
    redundancyNotes = 'No internal files in this subsystem import this file.';
  } else if (filePath.includes('identityState')) {
    verdict = 'Accretive Frankenstein (Deprecated Auth/Citizenship Hybrids)';
    redundancyNotes = 'Mixes auth bootstrap generation races, soft-deletion, display name parsing, and ReBAC citizenship. ReBAC must live in Identity.ts; transport belongs in signup flow.';
  } else if (filePath.includes('SriLankanSchools')) {
    verdict = 'Massive Static Constant (874 LOC)';
    redundancyNotes = 'Heavy hardcoded static data in core layer; should be loaded dynamically or kept strictly leaf-level.';
  } else if (filePath.includes('guestScope')) {
    verdict = 'Legacy Session Shim';
    redundancyNotes = 'Used for guest mode scoping prior to canonical third-class citizenship.';
  } else if (layer === 0) {
    verdict = 'Bedrock Invariant';
    redundancyNotes = 'Foundational contract/port with 0 internal dependencies.';
  }

  fileReports.push({
    path: filePath,
    layer,
    loc,
    commitCount,
    birthDate,
    birthCommit: birthCommit ? `${birthCommit.hash}: ${birthCommit.message}` : 'N/A',
    latestCommit: latestCommit ? `${latestCommit.hash} (${latestCommit.date}): ${latestCommit.message}` : 'N/A',
    era,
    depsCount: deps.length,
    callersCount: callers.length,
    callers,
    deps,
    verdict,
    redundancyNotes,
  });
}

// Sort by layer ascending, then by commitCount descending
fileReports.sort((a, b) => a.layer - b.layer || b.commitCount - a.commitCount);

// Generate Markdown Report
let md = `# Comprehensive Historical Chronology & Layer Audit of the Sanctuary Subsystem\n\n`;
md += `Generated: ${new Date().toISOString()}\n`;
md += `Total Files Audited: ${fileReports.length}\n\n`;

md += `## 1. Executive Summary & Evolutionary Eras\n\n`;
md += `This archaeological analysis tracks the creation dates, git churn, and accretion patterns across all layers of the Sanctuary subsystem.\n\n`;
md += `| Era | Time Window | Characteristics & Agentic Patterns |\n`;
md += `| :--- | :--- | :--- |\n`;
md += `| **Era 1: Legacy Bootstrap** | June 2026 | Initial prototypes, basic auth session wrappers, barebone PowerSync sync shims. |\n`;
md += `| **Era 2: CASL & Permissions Accretion** | July–Aug 2026 | CASL rules (\`defineRulesFor\`), ability builders, and \`usePermissions\` ceremonies introduced. Cross-imports began tangling. |\n`;
md += `| **Era 3: Agentic Race Accretion** | Sept 2026 | High churn (50+ commits/file). Generation race-condition counters, string heuristics (\`suggestDisplayName\`), and hybrid identity shims (\`identityState.ts\`) accreted. |\n`;
md += `| **Era 4: Canonical ReBAC & Modernization** | Oct–Nov 2026 | Canonical UUIDv8 account cutover, pure ReBAC bond citizenship (\`FIRST_CLASS\`, \`SECOND_CLASS\`, \`THIRD_CLASS\`), deterministic Code-ERD graph mapping. |\n\n`;

md += `## 2. Bedrock (Layer 0) Archaeological Analysis (0 Internal Dependencies)\n\n`;
md += `Layer 0 files are foundational leaves that import nothing else within this subsystem. They define the data contracts, ports, utilities, and storage shims.\n\n`;

md += `| File | LOC | Churn | Born | Era | Verdict | Redundancy Assessment |\n`;
md += `| :--- | :---: | :---: | :---: | :--- | :--- | :--- |\n`;

const l0Reports = fileReports.filter(r => r.layer === 0);
for (const r of l0Reports) {
  md += `| \`${r.path}\` | ${r.loc} | ${r.commitCount} | ${r.birthDate} | ${r.era.split(':')[0]} | **${r.verdict}** | ${r.redundancyNotes} |\n`;
}

md += `\n## 3. Downstream & Higher Layer Chronology (Layers 1–13)\n\n`;
md += `| Layer | File | LOC | Churn | Born | In-Degree | Out-Degree | Verdict |\n`;
md += `| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |\n`;

const upperReports = fileReports.filter(r => r.layer > 0);
for (const r of upperReports) {
  md += `| L${r.layer} | \`${r.path}\` | ${r.loc} | ${r.commitCount} | ${r.birthDate} | ${r.callersCount} | ${r.depsCount} | ${r.verdict} |\n`;
}

md += `\n## 4. Deep-Dive on Accretive Ceremonies & Redundancy Findings\n\n`;
md += `### A. \`identityState.ts\` - The Frankenstein Accretion Landmark\n`;
md += `- **Original Purpose (2026-06-26, commit \`b4a119db5\`):** A minimal 43-line helper distinguishing \`guest\`, \`authenticated\`, \`sandbox\`, and \`demo\` from Supabase session metadata.\n`;
md += `- **Accretion 1 (2026-07-28, commit \`8b53a75c0\`):** Renamed \`guest\` to \`unauthenticated\` / \`anonymous\`.\n`;
md += `- **Accretion 2 (2026-09-04 / 2026-09-08, commits \`75420cb08\` & \`c9648552b\`):** Added race condition generation counters (\`isCurrentAuthBootstrapGeneration\`, \`isCurrentIdentityResolutionGeneration\`), soft deletion check (\`isActiveIdentityProfile\`), and email name extraction (\`suggestDisplayName\`).\n`;
md += `- **Accretion 3 (2026-09-12, commit \`ad9c59edd\`):** Added \`isLocalOnlyIdentity\` checking \`citizenship === 'THIRD_CLASS' || citizenship === 'WANDERER'\`, creating a duplicate, competing source of truth with canonical ReBAC in \`Identity.ts\`.\n`;
md += `- **Deconstruction & Refactoring Action:**\n`;
md += `  1. \`suggestDisplayName\`: Belongs exclusively in onboarding/signup adapter where auth metadata is mapped to initial profile name.\n`;
md += `  2. \`isLocalOnlyIdentity\`: Replaced by canonical \`resolveBondCitizenship(activeBond) === 'THIRD_CLASS' || !user?.id\`.\n`;
md += `  3. Generation counters: Belong in local session bootstrap state machine, not global bedrock.\n\n`;

md += `### B. Empty & Zombie Files Detected\n`;
const zombies = fileReports.filter(r => r.loc === 0 || r.verdict.includes('Deadweight'));
if (zombies.length > 0) {
  for (const z of zombies) {
    md += `- \`${z.path}\`: ${z.redundancyNotes}\n`;
  }
} else {
  md += `- None detected.\n`;
}

md += `\n### C. The Evolution of Permissions: From CASL to ReBAC\n`;
md += `- **Old Way (Era 2):** CASL \`defineRulesFor\`, \`usePermissions()\`, imperative \`ability.can(action, subject)\` with 12-layer dynamic shims and race-prone async checks.\n`;
md += `- **New Way (Era 4):** Synchronous O(1) ReBAC via \`useSanctuaryFeature()\` reading \`activeBond\` from \`Identity.ts\`, verified against \`SanctuaryGuard.tsx\` with 0 async overhead.\n`;

fs.writeFileSync(path.join(ROOT_DIR, 'reports/bedrock-chronology-audit.md'), md);
fs.writeFileSync(path.join(ROOT_DIR, 'reports/bedrock-chronology.json'), JSON.stringify(fileReports, null, 2));

console.log(`[Chronology Audit] Successfully written report to reports/bedrock-chronology-audit.md and JSON to reports/bedrock-chronology.json`);
