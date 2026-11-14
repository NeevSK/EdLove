import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Parse CLI flags: --target <path> or --file <file>
const args = process.argv.slice(2);
let targetInput = 'packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' || args[i] === '--file') {
    targetInput = args[i + 1] || targetInput;
    i++;
  }
}

function resolveCanonical(importStr, sourceFile) {
  if (importStr.startsWith('@repo/core/')) {
    const sub = importStr.replace('@repo/core/', '');
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const p = path.join(ROOT_DIR, 'packages/core/src', sub + (ext.startsWith('/') ? ext : ext));
      if (fs.existsSync(p)) return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
    }
  }
  if (importStr.startsWith('@repo/ui/')) {
    const sub = importStr.replace('@repo/ui/', '');
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const p = path.join(ROOT_DIR, 'packages/ui/src', sub + (ext.startsWith('/') ? ext : ext));
      if (fs.existsSync(p)) return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
    }
  }
  if (importStr.startsWith('.')) {
    const dir = path.dirname(path.join(ROOT_DIR, sourceFile));
    const resolved = path.resolve(dir, importStr);
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const p = resolved + (ext.startsWith('/') ? ext : ext);
      if (fs.existsSync(p)) return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
    }
  }
  return null;
}

function extractAnatomy(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, 'utf8');
  // Strip comments
  const clean = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  const lines = raw.split('\n');

  // Imports
  const imports = [];
  const impRegex = /import\s+(type\s+)?(?:(\{[^}]+\})|([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = impRegex.exec(clean)) !== null) {
    const isTypeOnly = Boolean(match[1]);
    const symbols = match[2]
      ? match[2].replace(/[{}]/g, '').split(',').map(s => s.trim().replace(/^type\s+/, '')).filter(Boolean)
      : [match[3]];
    const source = match[4];
    const canonical = resolveCanonical(source, relPath);
    if (canonical) {
      imports.push({
        source,
        canonical,
        isTypeOnly,
        symbols,
      });
    }
  }

  // Declared Functions
  const fns = [];
  const fnRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/g;
  while ((match = fnRegex.exec(clean)) !== null) {
    fns.push({ name: match[1], isExported: match[0].startsWith('export'), params: match[2].trim() });
  }
  const arrowRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/g;
  while ((match = arrowRegex.exec(clean)) !== null) {
    fns.push({ name: match[1], isExported: match[0].startsWith('export'), params: match[2].trim() });
  }

  // Interfaces
  const interfaces = [];
  const ifRegex = /(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)/g;
  while ((match = ifRegex.exec(clean)) !== null) {
    interfaces.push({ name: match[1], isExported: match[0].startsWith('export') });
  }

  // Types
  const types = [];
  const typeRegex = /(?:export\s+)?type\s+([a-zA-Z0-9_$]+)/g;
  while ((match = typeRegex.exec(clean)) !== null) {
    types.push({ name: match[1], isExported: match[0].startsWith('export') });
  }

  // Constants
  const constants = [];
  const constRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=/g;
  while ((match = constRegex.exec(clean)) !== null) {
    const name = match[1];
    if (!fns.some(f => f.name === name)) {
      constants.push({ name, isExported: match[0].startsWith('export') });
    }
  }

  return {
    path: relPath,
    name: path.basename(relPath),
    dir: path.dirname(relPath).replace(/\\/g, '/'),
    loc: lines.length,
    fns,
    interfaces,
    types,
    constants,
    imports,
    content: raw,
  };
}

// Crawl universe starting from targetInput (or directory)
const universe = new Map();
const queue = [];

if (fs.lstatSync(path.join(ROOT_DIR, targetInput)).isDirectory()) {
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
        queue.push(path.relative(ROOT_DIR, p).replace(/\\/g, '/'));
      }
    }
  };
  walk(path.join(ROOT_DIR, targetInput));
} else {
  queue.push(targetInput.replace(/\\/g, '/'));
}

const visited = new Set();
while (queue.length > 0) {
  const cur = queue.shift();
  if (visited.has(cur)) continue;
  visited.add(cur);

  const fileData = extractAnatomy(cur);
  if (!fileData) continue;
  universe.set(cur, fileData);

  for (const imp of fileData.imports) {
    if (!visited.has(imp.canonical)) {
      queue.push(imp.canonical);
    }
  }
}

// Build edges and downstream/upstream maps
const edges = [];
const downstreamMap = new Map(); // file -> [dependencies]
const upstreamMap = new Map();   // file -> [callers]

for (const f of universe.keys()) {
  downstreamMap.set(f, []);
  upstreamMap.set(f, []);
}

for (const [src, data] of universe.entries()) {
  for (const imp of data.imports) {
    if (universe.has(imp.canonical)) {
      edges.push({
        from: src,
        to: imp.canonical,
        symbols: imp.symbols,
        isTypeOnly: imp.isTypeOnly,
      });
      downstreamMap.get(src).push(imp.canonical);
      upstreamMap.get(imp.canonical).push(src);
    }
  }
}

// Compute Topological Layer (Depth from Bedrock)
// Bedrock files = 0 downstream dependencies in the universe
const depthMemo = new Map();
const visiting = new Set();

function getDepth(node) {
  if (depthMemo.has(node)) return depthMemo.get(node);
  if (visiting.has(node)) return 0;
  visiting.add(node);

  const deps = downstreamMap.get(node) || [];
  if (deps.length === 0) {
    depthMemo.set(node, 0);
    visiting.delete(node);
    return 0;
  }

  let maxD = 0;
  for (const d of deps) {
    const curD = getDepth(d);
    if (curD > maxD) maxD = curD;
  }
  const result = maxD + 1;
  depthMemo.set(node, result);
  visiting.delete(node);
  return result;
}

for (const f of universe.keys()) getDepth(f);

// Prepare nodes with layer annotations
const nodes = Array.from(universe.values()).map(file => {
  const depth = depthMemo.get(file.path) || 0;
  const isBedrock = (downstreamMap.get(file.path) || []).length === 0;
  return {
    ...file,
    layer: depth,
    isBedrock,
    downstreamCount: (downstreamMap.get(file.path) || []).length,
    upstreamCount: (upstreamMap.get(file.path) || []).length,
  };
});

// Generate Interactive HTML Code-ERD
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sanctuary Code-ERD Explorer</title>
  <style>
    :root {
      --bg: #090d16;
      --panel-bg: #111827;
      --card-bg: #1e293b;
      --card-header: #334155;
      --border: #334155;
      --accent: #38bdf8;
      --accent-hover: #0ea5e9;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --fn: #60a5fa;
      --type: #c084fc;
      --const: #34d399;
      --bedrock: #10b981;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    #sidebar {
      width: 380px;
      background: var(--panel-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    #sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
    }
    #sidebar-header h2 {
      margin: 0 0 6px 0;
      font-size: 17px;
      color: var(--accent);
    }
    #sidebar-header p {
      margin: 0 0 12px 0;
      font-size: 12px;
      color: var(--text-muted);
    }
    #search-box {
      width: 100%;
      background: #0f172a;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text);
      font-size: 13px;
      outline: none;
    }
    #search-box:focus { border-color: var(--accent); }
    #file-tree {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tree-item {
      padding: 8px 12px;
      border-radius: 6px;
      background: #1e293b;
      border: 1px solid transparent;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.15s;
    }
    .tree-item:hover {
      background: #283548;
      border-color: #475569;
    }
    .tree-item.active {
      background: #1e3a5f;
      border-color: var(--accent);
    }
    .tree-name {
      font-size: 13px;
      font-weight: 500;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
    }
    .tree-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      background: #0f172a;
      border: 1px solid #334155;
      color: #94a3b8;
    }
    .tree-badge.bedrock {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10b981;
      color: #34d399;
      font-weight: 600;
    }

    #main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: radial-gradient(circle at 50% 50%, #111a2e 0%, #090d16 100%);
    }
    #main-toolbar {
      padding: 12px 24px;
      background: rgba(17, 24, 39, 0.85);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-group {
      display: flex;
      gap: 10px;
    }
    .btn {
      background: #1e293b;
      border: 1px solid var(--border);
      color: #f1f5f9;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .btn:hover {
      background: #334155;
      border-color: var(--accent);
    }
    .btn.active {
      background: var(--accent);
      color: #090d16;
      font-weight: 600;
    }

    #workspace {
      flex: 1;
      overflow: auto;
      padding: 32px;
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }

    /* Code-ERD Table Box */
    .erd-table {
      width: 360px;
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .erd-table.focused {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4), 0 12px 32px rgba(0,0,0,0.7);
      transform: scale(1.02);
    }
    .erd-table.upstream-highlight {
      border-color: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.4);
    }
    .erd-table.downstream-highlight {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.4);
    }
    .erd-header {
      padding: 12px 16px;
      background: var(--card-header);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .erd-title {
      font-size: 14px;
      font-weight: 700;
      color: #f8fafc;
    }
    .erd-layer {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      background: #0f172a;
      border: 1px solid #475569;
      color: #38bdf8;
    }
    .erd-section {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    }
    .erd-section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .erd-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      cursor: pointer;
    }
    .erd-row:hover { background: #1e293b; }
    .erd-row.fn { color: var(--fn); }
    .erd-row.type { color: var(--type); }
    .erd-row.const { color: var(--const); }
    .erd-row-badge {
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 3px;
      background: #0f172a;
      color: #64748b;
    }

    #trace-panel {
      position: absolute;
      bottom: 24px;
      left: 404px;
      right: 24px;
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      display: none;
      z-index: 50;
    }
    #trace-panel h4 {
      margin: 0 0 8px 0;
      color: var(--accent);
      font-size: 14px;
    }
    .trace-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      font-size: 12px;
    }
    .trace-step {
      background: #1e293b;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #334155;
    }
    .trace-arrow { color: #64748b; font-weight: bold; }
  </style>
</head>
<body>
  <div id="sidebar">
    <div id="sidebar-header">
      <h2>Sanctuary Code-ERD</h2>
      <p>Select any file to inspect its internal columns (functions/types) and trace relations to bedrock.</p>
      <input type="text" id="search-box" placeholder="Search file, function, or type..." oninput="filterTree()">
    </div>
    <div id="file-tree"></div>
  </div>

  <div id="main">
    <div id="main-toolbar">
      <div id="current-file-label" style="font-size: 14px; font-weight: 600; color: #f1f5f9">
        Select a file from the sidebar
      </div>
      <div class="btn-group">
        <button class="btn" onclick="traceBedrock()">⚡ Trace to Bedrock (Downstream)</button>
        <button class="btn" onclick="traceUpstream()">🚀 Trace Callers (Upstream)</button>
        <button class="btn" onclick="clearHighlights()">Clear Filter</button>
      </div>
    </div>

    <div id="workspace"></div>

    <div id="trace-panel">
      <button style="float: right; background: transparent; border: none; color: #94a3b8; font-size: 16px; cursor: pointer" onclick="document.getElementById('trace-panel').style.display='none'">✕</button>
      <h4 id="trace-title">Lineage Trace</h4>
      <div class="trace-flow" id="trace-flow-content"></div>
    </div>
  </div>

  <script>
    const nodes = ${JSON.stringify(nodes)};
    const edges = ${JSON.stringify(edges)};

    const nodeMap = new Map();
    for (const n of nodes) nodeMap.set(n.path, n);

    let activeFilePath = nodes[0].path;

    function renderTree(filterText = '') {
      const tree = document.getElementById('file-tree');
      tree.innerHTML = '';
      const filtered = nodes.filter(n => 
        n.name.toLowerCase().includes(filterText.toLowerCase()) ||
        n.fns.some(f => f.name.toLowerCase().includes(filterText.toLowerCase())) ||
        n.types.some(t => t.name.toLowerCase().includes(filterText.toLowerCase()))
      );

      for (const n of filtered) {
        const item = document.createElement('div');
        item.className = 'tree-item' + (n.path === activeFilePath ? ' active' : '');
        item.onclick = () => selectFile(n.path);
        item.innerHTML = \`
          <span class="tree-name">\${n.name}</span>
          <span class="tree-badge \${n.isBedrock ? 'bedrock' : ''}">
            \${n.isBedrock ? 'BEDROCK' : 'L' + n.layer}
          </span>
        \`;
        tree.appendChild(item);
      }
    }

    function filterTree() {
      const q = document.getElementById('search-box').value;
      renderTree(q);
    }

    function selectFile(filePath) {
      activeFilePath = filePath;
      renderTree(document.getElementById('search-box').value);
      renderWorkspace();
    }

    function renderWorkspace() {
      const ws = document.getElementById('workspace');
      ws.innerHTML = '';
      const focusNode = nodeMap.get(activeFilePath);
      if (!focusNode) return;

      document.getElementById('current-file-label').innerHTML = \`
        Focus: <span style="color:#38bdf8">\${focusNode.name}</span> 
        <span style="font-size:12px; color:#94a3b8; font-weight:normal; margin-left: 10px;">
          (Layer \${focusNode.layer} • \${focusNode.loc} lines • \${focusNode.downstreamCount} imports • \${focusNode.upstreamCount} callers)
        </span>
      \`;

      // Render Focus ERD Table
      ws.appendChild(createERDTable(focusNode, 'focused'));

      // Render 1-hop downstream tables
      const downstreamFiles = edges.filter(e => e.from === focusNode.path).map(e => e.to);
      const uniqueDown = [...new Set(downstreamFiles)];
      for (const dPath of uniqueDown) {
        const dNode = nodeMap.get(dPath);
        if (dNode) ws.appendChild(createERDTable(dNode, 'downstream'));
      }
    }

    function createERDTable(node, statusClass = '') {
      const card = document.createElement('div');
      card.className = 'erd-table ' + statusClass;
      card.id = 'erd-' + node.path.replace(/[^a-zA-Z0-9]/g, '_');

      let fnsHtml = '';
      if (node.fns.length > 0) {
        fnsHtml = '<div class="erd-section"><div class="erd-section-title">Functions (' + node.fns.length + ')</div>' +
          node.fns.map(f => \`<div class="erd-row fn"><span>\${f.name}()</span><span class="erd-row-badge">\${f.isExported ? 'pub' : 'priv'}</span></div>\`).join('') +
          '</div>';
      }

      let typesHtml = '';
      const allTypes = [...node.interfaces, ...node.types];
      if (allTypes.length > 0) {
        typesHtml = '<div class="erd-section"><div class="erd-section-title">Types & Interfaces (' + allTypes.length + ')</div>' +
          allTypes.map(t => \`<div class="erd-row type"><span>\${t.name}</span><span class="erd-row-badge">\${t.isExported ? 'pub' : 'priv'}</span></div>\`).join('') +
          '</div>';
      }

      let importsHtml = '';
      if (node.imports.length > 0) {
        importsHtml = '<div class="erd-section"><div class="erd-section-title">Imports (' + node.imports.length + ')</div>' +
          node.imports.map(i => \`<div class="erd-row" style="color:#94a3b8" onclick="selectFile('\${i.canonical}')"><span>\${i.canonical.split('/').pop()}</span><span class="erd-row-badge">\${i.symbols.length} sym</span></div>\`).join('') +
          '</div>';
      }

      card.innerHTML = \`
        <div class="erd-header">
          <span class="erd-title">\${node.name}</span>
          <span class="erd-layer">\${node.isBedrock ? 'BEDROCK' : 'Layer ' + node.layer}</span>
        </div>
        \${fnsHtml}
        \${typesHtml}
        \${importsHtml}
      \`;

      return card;
    }

    function traceBedrock() {
      const panel = document.getElementById('trace-panel');
      const content = document.getElementById('trace-flow-content');
      document.getElementById('trace-title').innerText = 'Downstream Lineage Trace to Bedrock for: ' + nodeMap.get(activeFilePath).name;

      const visitedPaths = [];
      function crawl(p, currentLineage) {
        const nexts = edges.filter(e => e.from === p).map(e => e.to);
        if (nexts.length === 0) {
          visitedPaths.push([...currentLineage, p]);
          return;
        }
        for (const nxt of nexts) {
          if (!currentLineage.includes(nxt)) {
            crawl(nxt, [...currentLineage, p]);
          }
        }
      }
      crawl(activeFilePath, []);

      content.innerHTML = visitedPaths.slice(0, 5).map(line => 
        '<div style="margin: 6px 0; width: 100%">' +
        line.map((step, idx) => {
          const n = nodeMap.get(step);
          return \`<span class="trace-step \${n?.isBedrock ? 'style="border-color:#10b981; color:#34d399"' : ''}">\${n?.name || step} (L\${n?.layer ?? '?'})</span>\` +
            (idx < line.length - 1 ? ' <span class="trace-arrow">➔</span> ' : '');
        }).join('') +
        '</div>'
      ).join('') || '<div>This file is already at bedrock! (0 downstream dependencies)</div>';

      panel.style.display = 'block';
    }

    function traceUpstream() {
      const panel = document.getElementById('trace-panel');
      const content = document.getElementById('trace-flow-content');
      document.getElementById('trace-title').innerText = 'Upstream Callers for: ' + nodeMap.get(activeFilePath).name;

      const callers = edges.filter(e => e.to === activeFilePath).map(e => nodeMap.get(e.from));
      content.innerHTML = callers.length > 0
        ? callers.map(c => \`<span class="trace-step" style="border-color:#f59e0b; color:#fbbf24" onclick="selectFile('\${c.path}')">\${c.name} (Layer \${c.layer})</span>\`).join('')
        : '<div>No upstream files in this subsystem import this file directly.</div>';

      panel.style.display = 'block';
    }

    function clearHighlights() {
      document.getElementById('trace-panel').style.display = 'none';
      renderWorkspace();
    }

    // Init
    renderTree();
    selectFile(activeFilePath);
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT_DIR, 'reports/code-erd-explorer.html'), html);
console.log(`[Code-ERD] Successfully generated interactive explorer at reports/code-erd-explorer.html with ${nodes.length} files.`);

// Also sync directly to apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json
try {
  const maxLayer = Math.max(...nodes.map(n => n.layer), 0);
  const layerBreakdown = [];
  for (let l = 0; l <= maxLayer; l++) {
    const layerFiles = nodes.filter(n => n.layer === l).map(n => {
      const exportsList = [
        ...n.fns.filter(f => f.isExported).map(f => 'fn: ' + f.name),
        ...n.types.filter(t => t.isExported).map(t => 'type: ' + t.name),
        ...n.interfaces.filter(i => i.isExported).map(i => 'interface: ' + i.name),
        ...n.constants.filter(c => c.isExported).map(c => 'const: ' + c.name),
      ];
      return {
        path: n.path,
        loc: n.loc,
        functions: n.fns,
        types: n.types,
        interfaces: n.interfaces,
        constants: n.constants,
        exports: exportsList,
        imports: n.imports,
        content: n.content,
      };
    });
    if (layerFiles.length > 0) {
      layerBreakdown.push({ layer: l, files: layerFiles });
    }
  }

  const archData = {
    totalFiles: nodes.length,
    totalEdges: edges.length,
    cycles: [],
    maxLayer,
    layerBreakdown,
    edges: edges.map(e => ({
      from: e.from,
      to: e.to,
      symbols: e.symbols || [],
      isTypeOnly: Boolean(e.isTypeOnly),
    })),
  };

  const archDataPath = path.join(ROOT_DIR, 'apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json');
  fs.writeFileSync(archDataPath, JSON.stringify(archData, null, 2));
  console.log(`[Code-ERD] Successfully synchronized architectureData.json at ${archDataPath}`);
} catch (err) {
  console.warn('[Code-ERD] Failed to write architectureData.json:', err);
}
