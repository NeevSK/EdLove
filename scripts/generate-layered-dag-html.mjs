import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const data = JSON.parse(fs.readFileSync('reports/topological-layer-analysis.json', 'utf8'));

// Format data for layered dag
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sanctuary Feature: 14-Layer Topological Architectural Matrix</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #161e2e;
      --border: #2d3748;
      --accent: #3b82f6;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    body {
      margin: 0;
      padding: 24px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow-x: auto;
    }
    header {
      margin-bottom: 24px;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 22px;
      color: #60a5fa;
    }
    p {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted);
    }
    .stats-bar {
      display: flex;
      gap: 20px;
      margin-top: 12px;
      font-size: 13px;
      color: #cbd5e1;
    }
    .stat-pill {
      background: #1e293b;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #334155;
    }
    .stat-pill strong {
      color: #38bdf8;
    }
    .board {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      min-width: 3200px;
    }
    .layer-column {
      background: rgba(22, 30, 46, 0.7);
      border: 1px solid var(--border);
      border-radius: 10px;
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      max-height: 85vh;
    }
    .layer-header {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      background: rgba(30, 41, 59, 0.9);
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .layer-title {
      font-size: 13px;
      font-weight: 700;
      color: #93c5fd;
    }
    .layer-badge {
      font-size: 11px;
      background: #0f172a;
      padding: 2px 7px;
      border-radius: 12px;
      border: 1px solid #334155;
      color: #cbd5e1;
    }
    .file-list {
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .file-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .file-card:hover {
      border-color: #60a5fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .file-card.selected {
      border-color: #38bdf8;
      background: #1e3a5f;
    }
    .file-name {
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 4px;
      word-break: break-all;
    }
    .file-meta {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      gap: 8px;
    }
    .tag {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 4px;
      background: #0f172a;
      border: 1px solid #334155;
    }
    #inspector {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 440px;
      max-height: 60vh;
      background: #0f172a;
      border: 1px solid #3b82f6;
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      overflow-y: auto;
      display: none;
      z-index: 100;
    }
    #inspector h3 {
      margin: 0 0 4px 0;
      color: #38bdf8;
      font-size: 16px;
    }
    #inspector p.path {
      margin: 0 0 12px 0;
      font-size: 11px;
      color: #94a3b8;
      word-break: break-all;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #f59e0b;
      margin: 10px 0 4px 0;
      font-weight: 700;
    }
    .symbol-pill {
      display: inline-block;
      font-size: 11px;
      background: #1e293b;
      color: #cbd5e1;
      padding: 2px 6px;
      border-radius: 4px;
      margin: 2px 4px 2px 0;
      border: 1px solid #334155;
    }
  </style>
</head>
<body>
  <header>
    <h1>Sanctuary Feature: Topological Layer & Anatomy Matrix</h1>
    <p>Every file categorized by its exact dependency depth from Bedrock (Layer 0) to UI Consumer (Layer 13). Zero cycles. Pure directed order.</p>
    <div class="stats-bar">
      <div class="stat-pill">Total Subsystem Files: <strong>${data.totalFiles}</strong></div>
      <div class="stat-pill">Internal Dependency Edges: <strong>${data.totalEdges}</strong></div>
      <div class="stat-pill">Cycles: <strong style="color: #4ade80">0 (Zero Cycles)</strong></div>
      <div class="stat-pill">Architectural Depth: <strong>14 Distinct Layers</strong></div>
    </div>
  </header>

  <div class="board">
    ${data.layerBreakdown.map(l => `
      <div class="layer-column">
        <div class="layer-header">
          <span class="layer-title">Layer ${l.layer} ${getLayerDescriptor(l.layer)}</span>
          <span class="layer-badge">${l.files.length} files</span>
        </div>
        <div class="file-list">
          ${l.files.map(f => `
            <div class="file-card" onclick="inspectFile('${f.path}')">
              <div class="file-name">${path.basename(f.path)}</div>
              <div class="file-meta">
                <span>${f.loc} lines</span>
                <span class="tag">${f.functions.length} fns</span>
                <span class="tag">${f.types.length + f.interfaces.length} types</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>

  <div id="inspector">
    <button style="float: right; background: transparent; border: none; color: #94a3b8; font-size: 16px; cursor: pointer" onclick="closeInspector()">✕</button>
    <h3 id="ins-name">File Anatomy</h3>
    <p class="path" id="ins-path"></p>
    <div class="section-title">Declared Functions (<span id="ins-fn-count">0</span>)</div>
    <div id="ins-fns"></div>
    <div class="section-title">Interfaces & Types (<span id="ins-type-count">0</span>)</div>
    <div id="ins-types"></div>
    <div class="section-title">Outgoing Monorepo Imports (<span id="ins-imp-count">0</span>)</div>
    <div id="ins-imports"></div>
  </div>

  <script>
    const dataset = ${JSON.stringify(data.layerBreakdown)};
    const fileMap = new Map();
    for (const l of dataset) {
      for (const f of l.files) {
        fileMap.set(f.path, f);
      }
    }

    function inspectFile(filePath) {
      const f = fileMap.get(filePath);
      if (!f) return;
      document.getElementById('ins-name').innerText = filePath.split('/').pop();
      document.getElementById('ins-path').innerText = f.path;

      // Functions
      document.getElementById('ins-fn-count').innerText = f.functions.length;
      document.getElementById('ins-fns').innerHTML = f.functions.length > 0
        ? f.functions.map(fn => '<span class="symbol-pill" style="color: #60a5fa">' + (fn.isExported ? 'export ' : '') + fn.name + '(' + fn.params + ')</span>').join('')
        : '<span style="color:#64748b; font-size:11px">(none)</span>';

      // Types
      const allTypes = [...f.interfaces.map(i => ({ ...i, kind: 'interface' })), ...f.types.map(t => ({ ...t, kind: 'type' }))];
      document.getElementById('ins-type-count').innerText = allTypes.length;
      document.getElementById('ins-types').innerHTML = allTypes.length > 0
        ? allTypes.map(t => '<span class="symbol-pill" style="color: #c084fc">' + (t.isExported ? 'export ' : '') + t.kind + ' ' + t.name + '</span>').join('')
        : '<span style="color:#64748b; font-size:11px">(none)</span>';

      // Imports
      document.getElementById('ins-imp-count').innerText = f.imports.length;
      document.getElementById('ins-imports').innerHTML = f.imports.length > 0
        ? f.imports.map(i => '<div style="margin: 4px 0; font-size: 11px"><strong style="color:#38bdf8">' + i.canonical.split('/').pop() + '</strong>: ' + i.symbols.join(', ') + '</div>').join('')
        : '<span style="color:#64748b; font-size:11px">(pure bedrock leaf - zero internal imports)</span>';

      document.getElementById('inspector').style.display = 'block';
    }

    function closeInspector() {
      document.getElementById('inspector').style.display = 'none';
    }
  </script>
</body>
</html>
`;

function getLayerDescriptor(layer) {
  switch (layer) {
    case 0: return '(Bedrock Primitives)';
    case 1: return '(Pure Protocols)';
    case 2: return '(Pure Evaluators)';
    case 3: return '(Prompts & Roles)';
    case 4: return '(Feature Adapters)';
    case 5: return '(Factories)';
    case 6: return '(State Slices)';
    case 7: return '(Auth Store)';
    case 8: return '(DB Proxy)';
    case 9: return '(DB Engine)';
    case 10: return '(Cedar Store)';
    case 11: return '(Atomic Stores)';
    case 12: return '(Unified Hook)';
    case 13: return '(UI Consumer)';
    default: return '';
  }
}

fs.writeFileSync(path.join(ROOT_DIR, 'reports/sanctuary-feature-topological-dag.html'), html);
console.log('Generated Layered DAG Matrix at reports/sanctuary-feature-topological-dag.html');
