import json

def build_visualizer():
    with open(r'c:\x\docs\research\edu-audit\data\graph\tri_layer_core_subgraph.json', 'r', encoding='utf-8') as f:
        core_graph = json.load(f)

    json_str = json.dumps(core_graph, ensure_ascii=False)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tri-Layer Knowledge & Insight Graph — Sri Lankan Educational Research (2026)</title>
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    body {{ background: #0f172a; color: #f8fafc; overflow: hidden; display: flex; height: 100vh; }}
    #sidebar {{ width: 380px; background: #1e293b; border-right: 1px solid #334155; display: flex; flex-direction: column; z-index: 10; box-shadow: 4px 0 16px rgba(0,0,0,0.4); }}
    #header {{ padding: 18px 20px; border-bottom: 1px solid #334155; background: #0f172a; }}
    #header h1 {{ font-size: 16px; font-weight: 700; color: #38bdf8; letter-spacing: -0.3px; }}
    #header p {{ font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4; }}
    #controls {{ padding: 14px 20px; border-bottom: 1px solid #334155; display: flex; flex-direction: column; gap: 10px; }}
    .search-box {{ width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #475569; border-radius: 6px; color: #fff; font-size: 12px; }}
    .search-box:focus {{ outline: none; border-color: #38bdf8; }}
    .layer-toggles {{ display: flex; flex-wrap: wrap; gap: 6px; }}
    .btn-toggle {{ font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 20px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; }}
    .btn-scholar {{ background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: #38bdf8; }}
    .btn-scholar.active {{ background: #38bdf8; color: #0f172a; }}
    .btn-inst {{ background: rgba(52, 211, 153, 0.15); color: #34d399; border-color: #34d399; }}
    .btn-inst.active {{ background: #34d399; color: #0f172a; }}
    .btn-concept {{ background: rgba(192, 132, 252, 0.15); color: #c084fc; border-color: #c084fc; }}
    .btn-concept.active {{ background: #c084fc; color: #0f172a; }}
    .btn-insight {{ background: rgba(244, 63, 94, 0.15); color: #f43f5e; border-color: #f43f5e; }}
    .btn-insight.active {{ background: #f43f5e; color: #0f172a; }}
    #inspector {{ flex: 1; padding: 20px; overflow-y: auto; font-size: 13px; line-height: 1.5; }}
    .empty-state {{ color: #64748b; font-style: italic; text-align: center; margin-top: 40px; }}
    .badge {{ display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; border-radius: 4px; margin-bottom: 8px; }}
    .badge-people {{ background: #0284c7; color: #fff; }}
    .badge-institutions {{ background: #059669; color: #fff; }}
    .badge-epistemic {{ background: #7c3aed; color: #fff; }}
    .badge-epistemic_insights {{ background: #e11d48; color: #fff; }}
    .metric-row {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #334155; font-size: 11px; }}
    .metric-label {{ color: #94a3b8; }}
    .metric-val {{ font-weight: 600; color: #f1f5f9; }}
    .claim-box {{ background: rgba(244, 63, 94, 0.1); border-left: 3px solid #f43f5e; padding: 10px; margin: 12px 0; border-radius: 0 6px 6px 0; font-size: 12px; }}
    #graph-container {{ flex: 1; position: relative; height: 100vh; background: #0b1120; }}
    #stats-overlay {{ position: absolute; bottom: 16px; right: 16px; background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(8px); padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; font-size: 11px; color: #94a3b8; pointer-events: none; }}
    #stats-overlay span {{ color: #38bdf8; font-weight: 700; }}
  </style>
</head>
<body>
  <div id="sidebar">
    <div id="header">
      <h1>Tri-Layer Knowledge & Insight Graph</h1>
      <p>Computational Metascience of Sri Lankan Education (1970–2026)<br>OpenAlex (15.5k), Full-Text Vault & Finding-Level Insights</p>
    </div>
    <div id="controls">
      <input type="text" id="search" class="search-box" placeholder="Search scholars, universities, insights..." onkeyup="filterNodes()">
      <div class="layer-toggles">
        <button class="btn-toggle btn-scholar active" onclick="toggleLayer('people', this)">Scholars</button>
        <button class="btn-toggle btn-inst active" onclick="toggleLayer('institutions', this)">Institutions</button>
        <button class="btn-toggle btn-concept active" onclick="toggleLayer('epistemic', this)">Paradigms</button>
        <button class="btn-toggle btn-insight active" onclick="toggleLayer('epistemic_insights', this)">Findings (2026)</button>
      </div>
    </div>
    <div id="inspector">
      <div class="empty-state">Click on any node in the graph to inspect its network position, evidence provenance, and empirical assertions.</div>
    </div>
  </div>

  <div id="graph-container"></div>
  <div id="stats-overlay">
    Nodes: <span id="stat-nodes">0</span> | Edges: <span id="stat-edges">0</span> | Active Layers: <span id="stat-layers">4/4</span>
  </div>

  <script>
    const rawData = {json_str};
    let network = null;
    let nodesDataSet = null;
    let edgesDataSet = null;
    const activeLayers = new Set(['people', 'institutions', 'epistemic', 'epistemic_insights']);

    function getNodeColor(layer, type) {{
      if (layer === 'people') return {{ background: '#38bdf8', border: '#0284c7' }};
      if (layer === 'institutions') return {{ background: '#34d399', border: '#059669' }};
      if (layer === 'epistemic') return {{ background: '#c084fc', border: '#7c3aed' }};
      if (layer === 'epistemic_insights') return {{ background: '#f43f5e', border: '#be123c' }};
      return {{ background: '#94a3b8', border: '#64748b' }};
    }}

    function getNodeShape(layer) {{
      if (layer === 'people') return 'dot';
      if (layer === 'institutions') return 'diamond';
      if (layer === 'epistemic') return 'hexagon';
      if (layer === 'epistemic_insights') return 'star';
      return 'ellipse';
    }}

    function initGraph() {{
      const visNodes = [];
      const visEdges = [];

      rawData.nodes.forEach(n => {{
        const layer = n.layer || 'unknown';
        const color = getNodeColor(layer, n.type);
        const shape = getNodeShape(layer);
        const size = layer === 'epistemic_insights' ? 24 :
                     layer === 'institutions' ? 18 :
                     layer === 'epistemic' ? 20 :
                     Math.max(10, Math.min(26, (n.degree_centrality || 0.005) * 800));

        visNodes.push({{
          id: n.id,
          label: n.name || n.id,
          layer: layer,
          shape: shape,
          size: size,
          color: {{
            background: color.background,
            border: color.border,
            highlight: {{ background: '#fbbf24', border: '#d97706' }}
          }},
          font: {{ color: '#f8fafc', size: layer === 'epistemic_insights' ? 13 : 11, strokeWidth: 2, strokeColor: '#0f172a' }},
          data: n
        }});
      }});

      rawData.links.forEach(l => {{
        visEdges.push({{
          from: l.source,
          to: l.target,
          relation: l.relation,
          width: Math.min(5, Math.max(1, (l.weight || 1))),
          color: {{ color: 'rgba(100, 116, 139, 0.4)', highlight: '#fbbf24' }},
          arrows: l.relation && (l.relation.includes('finding') || l.relation.includes('focus')) ? 'to' : undefined
        }});
      }});

      nodesDataSet = new vis.DataSet(visNodes);
      edgesDataSet = new vis.DataSet(visEdges);

      const container = document.getElementById('graph-container');
      const data = {{ nodes: nodesDataSet, edges: edgesDataSet }};
      const options = {{
        nodes: {{ borderWidth: 2 }},
        edges: {{ smooth: {{ type: 'continuous' }} }},
        physics: {{
          stabilization: {{ iterations: 150 }},
          barnesHut: {{ gravitationalConstant: -3500, centralGravity: 0.25, springLength: 95 }}
        }},
        interaction: {{ hover: true, tooltipDelay: 100 }}
      }};

      network = new vis.Network(container, data, options);

      document.getElementById('stat-nodes').innerText = visNodes.length;
      document.getElementById('stat-edges').innerText = visEdges.length;

      network.on('click', function(params) {{
        if (params.nodes.length > 0) {{
          const nodeId = params.nodes[0];
          const node = nodesDataSet.get(nodeId);
          renderInspector(node.data);
        }}
      }});
    }}

    function renderInspector(d) {{
      const container = document.getElementById('inspector');
      const layer = d.layer || 'unknown';
      let html = `<span class="badge badge-${{layer}}">${{layer.replace('_', ' ')}}</span>`;
      html += `<h2 style="font-size:16px; font-weight:700; color:#f8fafc; margin-bottom:8px;">${{d.name || d.id}}</h2>`;

      if (layer === 'epistemic_insights') {{
        html += `<div class="claim-box"><strong>Empirical Assertion:</strong><br>${{d.claim}}</div>`;
        html += `<div class="metric-row"><span class="metric-label">Evidence Provenance:</span><span class="metric-val">${{d.evidence_source}}</span></div>`;
        html += `<div class="metric-row"><span class="metric-label">Quantitative Finding:</span><span class="metric-val">${{d.empirical_metric}}</span></div>`;
      }} else if (layer === 'people') {{
        html += `<div class="metric-row"><span class="metric-label">Indexed Publications:</span><span class="metric-val">${{d.publications || 1}}</span></div>`;
        html += `<div class="metric-row"><span class="metric-label">Total Citations:</span><span class="metric-val">${{d.citations || 0}}</span></div>`;
        html += `<div class="metric-row"><span class="metric-label">Degree Centrality:</span><span class="metric-val">${{(d.degree_centrality || 0).toFixed(5)}}</span></div>`;
        html += `<div class="metric-row"><span class="metric-label">Betweenness Centrality:</span><span class="metric-val">${{(d.betweenness_centrality || 0).toFixed(5)}}</span></div>`;
        if (d.institutions) {{
          html += `<div class="metric-row"><span class="metric-label">Affiliations:</span><span class="metric-val">${{d.institutions}}</span></div>`;
        }}
      }} else if (layer === 'institutions') {{
        html += `<div class="metric-row"><span class="metric-label">Category:</span><span class="metric-val">${{d.category || 'Institution'}}</span></div>`;
        html += `<div class="metric-row"><span class="metric-label">Degree Centrality:</span><span class="metric-val">${{(d.degree_centrality || 0).toFixed(5)}}</span></div>`;
      }} else if (layer === 'epistemic') {{
        html += `<div class="metric-row"><span class="metric-label">Paradigm Domain:</span><span class="metric-val">Curriculum & Educational Policy</span></div>`;
        html += `<div class="metric-row"><span class="metric-label">Degree Centrality:</span><span class="metric-val">${{(d.degree_centrality || 0).toFixed(5)}}</span></div>`;
      }}

      container.innerHTML = html;
    }}

    function toggleLayer(layerName, btn) {{
      if (activeLayers.has(layerName)) {{
        activeLayers.delete(layerName);
        btn.classList.remove('active');
      }} else {{
        activeLayers.add(layerName);
        btn.classList.add('active');
      }}

      const allNodes = nodesDataSet.get();
      const updates = allNodes.map(n => ({{
        id: n.id,
        hidden: !activeLayers.has(n.layer)
      }}));
      nodesDataSet.update(updates);
      document.getElementById('stat-layers').innerText = `${{activeLayers.size}}/4`;
    }}

    function filterNodes() {{
      const q = document.getElementById('search').value.toLowerCase();
      const allNodes = nodesDataSet.get();
      const updates = allNodes.map(n => {{
        const matchesSearch = !q || (n.label && n.label.toLowerCase().includes(q));
        const matchesLayer = activeLayers.has(n.layer);
        return {{
          id: n.id,
          hidden: !(matchesSearch && matchesLayer)
        }};
      }});
      nodesDataSet.update(updates);
    }}

    window.onload = initGraph;
  </script>
</body>
</html>"""

    with open(r'c:\x\docs\research\edu-audit\visualizer\index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Successfully built visualizer at docs/research/edu-audit/visualizer/index.html")

if __name__ == '__main__':
    build_visualizer()
