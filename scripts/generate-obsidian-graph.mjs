import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const graphData = JSON.parse(fs.readFileSync('reports/permission-ecosystem-graph.json', 'utf8'));
// Embed d3 so the page works offline and in sandboxed previews, where a CDN script is blocked
// ("d3 is not defined"). d3 is a dependency of @repo/library.
const d3Source = fs
  .readFileSync(path.resolve('packages/library/node_modules/d3/dist/d3.min.js'), 'utf8')
  .replace(/<\/script/gi, '<\\/script');

// Categorize nodes
const formattedNodes = graphData.nodes.map((node) => {
  let group = 'logic';
  let color = '#6b7280';
  if (!node.exists) {
    group = 'dead';
    color = '#ef4444';
  } else if (node.path.includes('useSanctuaryFeature') || node.path.includes('sanctuaryFeature')) {
    group = 'core';
    color = '#3b82f6';
  } else if (node.path.includes('store/')) {
    group = 'store';
    color = '#f59e0b';
  } else if (node.path.includes('types/')) {
    group = 'types';
    color = '#8b5cf6';
  } else if (node.path.includes('schemas/')) {
    group = 'schema';
    color = '#10b981';
  } else if (node.path.includes('adapters/')) {
    group = 'adapter';
    color = '#ec4899';
  }

  return {
    id: node.path,
    name: path.basename(node.path),
    path: node.path,
    group,
    color,
    loc: node.loc,
    exports: node.exports || [],
    exists: node.exists,
  };
});

const formattedLinks = graphData.edges.map((edge) => ({
  source: edge.from,
  target: edge.to,
  symbols: edge.symbols,
  exists: edge.exists,
}));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sanctuary Permission & Identity Ecosystem Graph (Obsidian-Style)</title>
  <script>${d3Source}</script>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #111827;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
    }
    #header {
      position: absolute;
      top: 16px;
      left: 16px;
      z-index: 10;
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(8px);
      padding: 14px 20px;
      border-radius: 10px;
      border: 1px solid #374151;
      max-width: 460px;
    }
    #header h1 {
      margin: 0 0 6px 0;
      font-size: 18px;
      color: #60a5fa;
    }
    #header p {
      margin: 0 0 10px 0;
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.4;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 11px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    #details {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      background: rgba(17, 24, 39, 0.9);
      backdrop-filter: blur(8px);
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #374151;
      width: 320px;
      max-height: 80vh;
      overflow-y: auto;
      display: none;
    }
    #details h3 {
      margin: 0 0 8px 0;
      font-size: 15px;
      color: #93c5fd;
      word-break: break-all;
    }
    #details p {
      margin: 4px 0;
      font-size: 12px;
      color: #d1d5db;
    }
    #details ul {
      margin: 6px 0;
      padding-left: 16px;
      font-size: 12px;
      color: #9ca3af;
    }
    svg {
      width: 100vw;
      height: 100vh;
    }
    .link {
      stroke: #374151;
      stroke-opacity: 0.6;
      stroke-width: 1.2px;
    }
    .link.phantom {
      stroke: #ef4444;
      stroke-dasharray: 4 4;
      stroke-width: 2px;
    }
    .node circle {
      stroke: #1f2937;
      stroke-width: 2px;
      cursor: pointer;
      transition: r 0.2s;
    }
    .node:hover circle {
      stroke: #ffffff;
      stroke-width: 2.5px;
    }
    .node text {
      fill: #e5e7eb;
      font-size: 10px;
      pointer-events: none;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
  </style>
</head>
<body>
  <div id="header">
    <h1>Sanctuary Ecosystem Graph (Obsidian-Style)</h1>
    <p>Deterministic AST import traversal of all permission, identity, store, and gate files. Drag to pan, scroll to zoom, click any node to inspect.</p>
    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#3b82f6"></div> Core Gate</div>
      <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div> Store (Zustand)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#8b5cf6"></div> Types / Enums</div>
      <div class="legend-item"><div class="legend-dot" style="background:#10b981"></div> Schemas (Zod)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ec4899"></div> Adapters / DB</div>
      <div class="legend-item"><div class="legend-dot" style="background:#6b7280"></div> Logic / Evaluator</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div> Phantom / Dead</div>
    </div>
  </div>

  <div id="details">
    <h3 id="detail-title">File Details</h3>
    <p><strong>Path:</strong> <span id="detail-path"></span></p>
    <p><strong>Group:</strong> <span id="detail-group"></span></p>
    <p><strong>Lines of Code:</strong> <span id="detail-loc"></span></p>
    <p><strong>Exports:</strong></p>
    <ul id="detail-exports"></ul>
    <p><strong>Imports (<span id="detail-import-count">0</span>):</strong></p>
    <ul id="detail-imports"></ul>
  </div>

  <svg id="graph"></svg>

  <script>
    const data = {
      nodes: ${JSON.stringify(formattedNodes)},
      links: ${JSON.stringify(formattedLinks)}
    };

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#graph")
      .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g");

    svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform)));

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

    const link = g.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("class", d => d.exists ? "link" : "link phantom");

    const node = g.append("g")
      .selectAll(".node")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", d => d.group === 'core' ? 14 : d.group === 'store' ? 11 : 8)
      .attr("fill", d => d.color);

    node.append("text")
      .attr("dx", 12)
      .attr("dy", 4)
      .text(d => d.name);

    node.on("click", (event, d) => {
      const details = document.getElementById("details");
      details.style.display = "block";
      document.getElementById("detail-title").innerText = d.name;
      document.getElementById("detail-path").innerText = d.path;
      document.getElementById("detail-group").innerText = d.group.toUpperCase();
      document.getElementById("detail-loc").innerText = d.loc || "N/A";
      
      const exportsList = document.getElementById("detail-exports");
      exportsList.innerHTML = (d.exports && d.exports.length > 0) 
        ? d.exports.map(e => "<li>" + e + "</li>").join("")
        : "<li>(none)</li>";

      const outgoing = data.links.filter(l => (l.source.id || l.source) === d.id);
      document.getElementById("detail-import-count").innerText = outgoing.length;
      const importsList = document.getElementById("detail-imports");
      importsList.innerHTML = outgoing.map(l => {
        const targetName = l.target.name || l.target.id || l.target;
        return "<li>" + targetName + ": " + (l.symbols.join(", ") || "*") + "</li>";
      }).join("") || "<li>(none)</li>";
    });

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT_DIR, 'reports/permission-ecosystem-graph.html'), html);
console.log('Generated interactive graph at reports/permission-ecosystem-graph.html');
