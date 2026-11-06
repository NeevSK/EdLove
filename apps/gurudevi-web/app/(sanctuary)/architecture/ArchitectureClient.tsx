'use client';

import { useMemo, useState, useEffect, useRef, type MouseEvent, type WheelEvent } from 'react';
import Link from 'next/link';
import { ScrollArea } from '@repo/ui/components/web';
import architectureData from './architectureData.json';
import toolsMetaModelData from './toolsMetaModelData.json';
import { getFileSourceAction, type FileSourceResult } from './actions';

interface FileNode {
  path: string;
  loc: number;
  content?: string;
  functions: Array<{ name: string; isExported: boolean; params: string }>;
  types: Array<{ name: string; isExported: boolean }>;
  interfaces: Array<{ name: string; isExported: boolean }>;
  constants: Array<{ name: string; isExported: boolean }>;
  exports: string[];
  imports: Array<{ canonical: string; symbols: string[]; isTypeOnly: boolean }>;
}

interface LayerData {
  layer: number;
  files: FileNode[];
}

interface EdgeData {
  from: string;
  to: string;
  symbols: string[];
  isTypeOnly?: boolean;
}

export function getFileMeta(filePath: string) {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1] || '';
  const isIndex = filename === 'index.ts' || filename === 'index.tsx';
  const parentDir = parts.length > 1 ? parts[parts.length - 2] : '';
  const displayName = isIndex ? `${parentDir}/${filename}` : filename;

  return {
    filename,
    displayName,
    parentDir,
    isIndex,
  };
}

export function getLayerMeta(layer: number) {
  if (layer === 0) {
    return {
      tier: 'Bedrock Primitives & Contracts',
      color: 'text-emerald-400',
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-950/80',
      badge: 'BEDROCK',
    };
  }
  if (layer <= 2) {
    return {
      tier: 'Pure Domain & Evaluators',
      color: 'text-purple-300',
      border: 'border-purple-500/50',
      bg: 'bg-purple-950/80',
      badge: `L${layer} Domain`,
    };
  }
  if (layer <= 5) {
    return {
      tier: 'Prompts & Rollouts',
      color: 'text-pink-300',
      border: 'border-pink-500/50',
      bg: 'bg-pink-950/80',
      badge: `L${layer} Prompt`,
    };
  }
  if (layer <= 11) {
    return {
      tier: 'Reactive State Stores & DB',
      color: 'text-sky-300',
      border: 'border-sky-500/50',
      bg: 'bg-sky-950/80',
      badge: `L${layer} Store`,
    };
  }
  if (layer === 12) {
    return {
      tier: 'Orchestrator Apex Hook',
      color: 'text-amber-300',
      border: 'border-amber-500/50',
      bg: 'bg-amber-950/80',
      badge: `L12 Orchestrator`,
    };
  }
  return {
    tier: 'UI Presentation & Guards',
    color: 'text-rose-300',
    border: 'border-rose-500/50',
    bg: 'bg-rose-950/80',
    badge: `L${layer} UI`,
  };
}

export function ArchitectureClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilePath, setActiveFilePath] = useState(
    'packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts',
  );
  const [viewMode, setViewMode] = useState<'graph' | 'erd' | 'matrix' | 'tools'>('graph');
  const [toolsTab, setToolsTab] = useState<'hierarchy' | 'archetypes' | 'contamination' | 'engines' | 'bypasses' | 'overlaps' | 'folders' | 'chronology'>('hierarchy');
  const [bypassFilter, setBypassFilter] = useState<'all' | 'same-seam'>('same-seam');
  const [showBedrockLineage, setShowBedrockLineage] = useState(true);

  // Pan & Zoom Canvas State
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Hover states
  const [hoveredEdge, setHoveredEdge] = useState<{
    from: string;
    to: string;
    symbols: string[];
    x: number;
    y: number;
  } | null>(null);

  const [hoveredNode, setHoveredNode] = useState<{
    node: FileNode & { layer: number; isBedrock: boolean };
    x: number;
    y: number;
  } | null>(null);

  // Source code reader state
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [sourceData, setSourceData] = useState<FileSourceResult | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullScreenSource, setIsFullScreenSource] = useState(false);
  const [targetHighlightLine, setTargetHighlightLine] = useState<number | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const { totalFiles, totalEdges, cycles, maxLayer, layerBreakdown, edges } = architectureData as {
    totalFiles: number;
    totalEdges: number;
    cycles: string[][];
    maxLayer: number;
    layerBreakdown: LayerData[];
    edges: EdgeData[];
  };

  // Flatten all files
  const allFiles = useMemo(() => {
    const list: Array<FileNode & { layer: number; isBedrock: boolean }> = [];
    for (const l of layerBreakdown) {
      for (const f of l.files) {
        list.push({
          ...f,
          layer: l.layer,
          isBedrock: l.layer === 0,
        });
      }
    }
    return list;
  }, [layerBreakdown]);

  const fileMap = useMemo(() => {
    const map = new Map<string, FileNode & { layer: number; isBedrock: boolean }>();
    for (const f of allFiles) map.set(f.path, f);
    return map;
  }, [allFiles]);

  const defaultNode: FileNode & { layer: number; isBedrock: boolean } = allFiles[0] ?? {
    path: activeFilePath,
    loc: 0,
    functions: [],
    types: [],
    interfaces: [],
    constants: [],
    exports: [],
    imports: [],
    layer: 0,
    isBedrock: true,
  };
  const activeNode = fileMap.get(activeFilePath) ?? defaultNode;

  // Filtered files for search bar
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allFiles;
    const q = searchQuery.toLowerCase();
    return allFiles.filter(
      (f) =>
        f.path.toLowerCase().includes(q) ||
        f.functions.some((fn) => fn.name.toLowerCase().includes(q)) ||
        f.types.some((t) => t.name.toLowerCase().includes(q)) ||
        f.interfaces.some((i) => i.name.toLowerCase().includes(q)),
    );
  }, [allFiles, searchQuery]);

  // Downstream & Upstream edges for active file
  const downstreamEdges = useMemo(() => {
    return edges.filter((e) => e.from === activeFilePath);
  }, [edges, activeFilePath]);

  const upstreamEdges = useMemo(() => {
    return edges.filter((e) => e.to === activeFilePath);
  }, [edges, activeFilePath]);

  // Downstream nodes (sorted by Layer descending so State Stores come first, then Domain, then Bedrock)
  const downstreamNodes = useMemo(() => {
    const list = downstreamEdges
      .map((e) => ({
        edge: e,
        node: fileMap.get(e.to),
      }))
      .filter((item): item is { edge: EdgeData; node: FileNode & { layer: number; isBedrock: boolean } } =>
        Boolean(item.node),
      );

    return list.sort((a, b) => b.node.layer - a.node.layer);
  }, [downstreamEdges, fileMap]);

  // Upstream nodes (sorted by Layer descending)
  const upstreamNodes = useMemo(() => {
    const list = upstreamEdges
      .map((e) => ({
        edge: e,
        node: fileMap.get(e.from),
      }))
      .filter((item): item is { edge: EdgeData; node: FileNode & { layer: number; isBedrock: boolean } } =>
        Boolean(item.node),
      );

    return list.sort((a, b) => b.node.layer - a.node.layer);
  }, [upstreamEdges, fileMap]);

  // Bedrock reachable nodes
  const bedrockReachable = useMemo(() => {
    if (!showBedrockLineage) return [];
    const visited = new Set<string>();
    const bedrocks = new Set<string>();

    function dfs(cur: string) {
      if (visited.has(cur)) return;
      visited.add(cur);
      const outs = edges.filter((e) => e.from === cur);
      if (outs.length === 0) {
        if (cur !== activeFilePath) bedrocks.add(cur);
        return;
      }
      for (const o of outs) dfs(o.to);
    }

    dfs(activeFilePath);
    return Array.from(bedrocks)
      .map((p) => fileMap.get(p))
      .filter((n): n is FileNode & { layer: number; isBedrock: boolean } => Boolean(n));
  }, [showBedrockLineage, activeFilePath, edges, fileMap]);

  // Open source code fetcher (with Instant Local Embedded Content + Fallbacks)
  const openSource = (filePath: string, focusSymbol?: string) => {
    setIsSourceOpen(true);
    setSourceFilter('');
    setTargetHighlightLine(null);
    setSourceLoading(false);

    // 1. Instant local read from embedded architectureData (0ms latency, always works!)
    const targetNode = fileMap.get(filePath);
    if (targetNode?.content) {
      const content = targetNode.content;
      const lines = content.split('\n');
      setSourceData({
        path: filePath,
        filename: filePath.split('/').pop() || '',
        loc: lines.length,
        sizeBytes: content.length,
        content,
      });

      if (focusSymbol) {
        const idx = lines.findIndex((l) => l.includes(focusSymbol));
        if (idx !== -1) setTargetHighlightLine(idx + 1);
      }
      return;
    }

    // 2. Fallback to API route
    setSourceLoading(true);
    fetch(`/api/architecture/source?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSourceData(data);
        if (focusSymbol && data.content) {
          const lines = data.content.split('\n');
          const idx = lines.findIndex((l: string) => l.includes(focusSymbol));
          if (idx !== -1) setTargetHighlightLine(idx + 1);
        }
      })
      .catch(() => {
        // 3. Fallback to Server Action
        getFileSourceAction(filePath)
          .then((res) => {
            if (res && res.content) {
              setSourceData(res);
              if (focusSymbol && res.content) {
                const lines = res.content.split('\n');
                const idx = lines.findIndex((l: string) => l.includes(focusSymbol));
                if (idx !== -1) setTargetHighlightLine(idx + 1);
              }
            } else {
              setSourceData({
                path: filePath,
                filename: filePath.split('/').pop() || '',
                loc: 0,
                sizeBytes: 0,
                content: '',
                error: 'Could not load file from substrate',
              });
            }
          })
          .finally(() => setSourceLoading(false));
      })
      .finally(() => setSourceLoading(false));
  };

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSourceOpen(false);
        setHoveredEdge(null);
        setHoveredNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to target highlight line when loaded
  useEffect(() => {
    if (targetHighlightLine && codeContainerRef.current) {
      const el = codeContainerRef.current.querySelector(`[data-line="${targetHighlightLine}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [targetHighlightLine, sourceLoading, isSourceOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Source lines
  const sourceLines = useMemo(() => {
    if (!sourceData?.content) return [];
    return sourceData.content.split('\n');
  }, [sourceData?.content]);

  // Pan & Zoom Event Handlers
  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.2));
  };

  const resetView = () => {
    setPan({ x: 40, y: 40 });
    setZoom(1);
  };

  // Graph Layout Calculations
  const graphLayout = useMemo(() => {
    const centerNodeWidth = 330;
    const centerNodeHeight = 190;
    const leafNodeWidth = 250;
    const leafNodeHeight = 68;
    const verticalGap = 18;

    const maxItems = Math.max(downstreamNodes.length, upstreamNodes.length, bedrockReachable.length, 1);
    const canvasHeight = Math.max(maxItems * (leafNodeHeight + verticalGap) + 160, 840);

    // Center coordinates
    const centerX = 570;
    const centerY = canvasHeight / 2 - centerNodeHeight / 2;

    // Upstream (Callers) column on Left
    const upstreamX = 60;
    const upstreamTotalH = upstreamNodes.length * (leafNodeHeight + verticalGap);
    const upstreamStartY = Math.max(centerY + centerNodeHeight / 2 - upstreamTotalH / 2, 60);

    const upPositions = upstreamNodes.map((item, idx) => ({
      ...item,
      x: upstreamX,
      y: upstreamStartY + idx * (leafNodeHeight + verticalGap),
      width: leafNodeWidth,
      height: leafNodeHeight,
    }));

    // Downstream (Imports) column on Right
    const downstreamX = 1060;
    const downstreamTotalH = downstreamNodes.length * (leafNodeHeight + verticalGap);
    const downstreamStartY = Math.max(centerY + centerNodeHeight / 2 - downstreamTotalH / 2, 60);

    const downPositions = downstreamNodes.map((item, idx) => ({
      ...item,
      x: downstreamX,
      y: downstreamStartY + idx * (leafNodeHeight + verticalGap),
      width: leafNodeWidth,
      height: leafNodeHeight,
    }));

    // Bedrock column on Far Right
    const bedrockX = 1480;
    const bedrockTotalH = bedrockReachable.length * (leafNodeHeight + verticalGap);
    const bedrockStartY = Math.max(centerY + centerNodeHeight / 2 - bedrockTotalH / 2, 60);

    const bedrockPositions = bedrockReachable.map((node, idx) => ({
      node,
      x: bedrockX,
      y: bedrockStartY + idx * (leafNodeHeight + verticalGap),
      width: leafNodeWidth - 20,
      height: leafNodeHeight,
    }));

    return {
      canvasWidth: showBedrockLineage && bedrockReachable.length > 0 ? 1800 : 1420,
      canvasHeight,
      center: {
        node: activeNode,
        x: centerX,
        y: centerY,
        width: centerNodeWidth,
        height: centerNodeHeight,
      },
      upstream: upPositions,
      downstream: downPositions,
      bedrock: bedrockPositions,
    };
  }, [activeNode, upstreamNodes, downstreamNodes, bedrockReachable, showBedrockLineage]);

  const centerMeta = getFileMeta(activeNode.path);
  const centerLayerMeta = getLayerMeta(activeNode.layer);

  return (
    <div className="relative flex h-screen w-screen flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header & Metrics */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-3.5 backdrop-blur z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold text-base shadow-inner">
            📐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-sky-400">
                Sanctuary Architecture & Code-ERD Explorer
              </h1>
              <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                Spotlight Mind-Map
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Disambiguated module names, layer-grouped hierarchy, and instant substrate file inspection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Metrics Pill */}
          <div className="hidden lg:flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300">
            <span>Files: <strong className="text-sky-400">{totalFiles}</strong></span>
            <span className="text-slate-700">|</span>
            <span>Edges: <strong className="text-sky-400">{totalEdges}</strong></span>
            <span className="text-slate-700">|</span>
            <span>Cycles: <strong className="text-emerald-400">{cycles.length}</strong></span>
            <span className="text-slate-700">|</span>
            <span>Depth: <strong className="text-sky-400">{maxLayer + 1} Layers</strong></span>
          </div>

          {/* Lab Link */}
          <Link
            href="/architecture-lab"
            className="flex items-center gap-1.5 rounded-lg border border-amber-600/80 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/60 hover:text-white transition shadow"
          >
            <span>🧪 Architecture Lab &amp; Simulator</span>
            <span className="text-amber-400 font-mono">→</span>
          </Link>

          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setViewMode('graph')}
              className={`rounded px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'graph' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🕸️ Spotlight Graph
            </button>
            <button
              onClick={() => setViewMode('erd')}
              className={`rounded px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'erd' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              📑 Code-ERD View
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`rounded px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'matrix' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🧱 14-Layer Matrix
            </button>
            <button
              onClick={() => setViewMode('tools')}
              className={`rounded px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'tools' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛠️ Toolset & Meta-Model
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Subsystem Navigator */}
        <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900/60 p-3 z-20">
          <div className="mb-2.5">
            <input
              type="text"
              placeholder="Search file, function, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {filteredFiles.map((f) => {
              const meta = getFileMeta(f.path);
              const layerMeta = getLayerMeta(f.layer);

              return (
                <div
                  key={f.path}
                  onClick={() => setActiveFilePath(f.path)}
                  className={`flex cursor-pointer items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition ${
                    f.path === activeFilePath
                      ? 'border-sky-500 bg-sky-950/50 text-sky-200 font-semibold'
                      : 'border-transparent bg-slate-800/30 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="truncate">{meta.displayName}</span>
                    {meta.isIndex && (
                      <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        barrel
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${layerMeta.color} ${layerMeta.bg} border ${layerMeta.border}`}
                  >
                    {layerMeta.badge}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick File Read Action in Sidebar */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => openSource(activeFilePath)}
              className="w-full flex items-center justify-center gap-1.5 rounded bg-sky-500/20 border border-sky-500/40 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/30 transition shadow"
            >
              <span>📖</span> Inspect Active File Code
            </button>
          </div>
        </aside>

        {/* Center Canvas Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {viewMode === 'graph' ? (
            /* Interactive Directed Mind-Map Graph Canvas */
            <div
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className={`flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950 ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Floating Canvas Controls */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 backdrop-blur rounded-lg p-1.5 shadow-lg">
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
                  className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
                  className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  onClick={resetView}
                  className="px-2 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  title="Reset View"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
                <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer pr-1">
                  <input
                    type="checkbox"
                    checked={showBedrockLineage}
                    onChange={(e) => setShowBedrockLineage(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>Show Bedrock Leaf Nodes</span>
                </label>
              </div>

              {/* Transformed Canvas Container (Both SVG Curves and HTML Cards pan & zoom in lockstep) */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  width: `${graphLayout.canvasWidth}px`,
                  height: `${graphLayout.canvasHeight}px`,
                  position: 'relative',
                }}
              >
                {/* SVG Connecting Directed Lines Layer */}
                <svg
                  width={graphLayout.canvasWidth}
                  height={graphLayout.canvasHeight}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <defs>
                    <marker
                      id="arrow-cyan"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                    </marker>
                    <marker
                      id="arrow-amber"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                    </marker>
                    <marker
                      id="arrow-emerald"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                    </marker>
                  </defs>

                  {/* 1. Directed Curves from Upstream Callers -> Center */}
                  {graphLayout.upstream.map((up) => {
                    const x1 = up.x + up.width;
                    const y1 = up.y + up.height / 2;
                    const x2 = graphLayout.center.x;
                    const y2 = graphLayout.center.y + graphLayout.center.height / 2;
                    const cx1 = (x1 + x2) / 2;
                    const cx2 = cx1;
                    const pathD = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

                    const isHovered =
                      hoveredEdge?.from === up.node.path && hoveredEdge?.to === activeFilePath;

                    return (
                      <g key={up.node.path} className="pointer-events-auto cursor-pointer">
                        <path
                          d={pathD}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="18"
                          onMouseEnter={() =>
                            setHoveredEdge({
                              from: up.node.path,
                              to: activeFilePath,
                              symbols: up.edge.symbols,
                              x: (x1 + x2) / 2,
                              y: (y1 + y2) / 2,
                            })
                          }
                          onMouseLeave={() => setHoveredEdge(null)}
                        />
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isHovered ? '#fbbf24' : '#f59e0b'}
                          strokeWidth={isHovered ? '3' : '1.8'}
                          strokeDasharray={up.edge.isTypeOnly ? '4 4' : 'none'}
                          opacity={isHovered ? '1' : '0.65'}
                          markerEnd="url(#arrow-amber)"
                        />
                      </g>
                    );
                  })}

                  {/* 2. Directed Curves from Center -> Downstream Imports */}
                  {graphLayout.downstream.map((down) => {
                    const x1 = graphLayout.center.x + graphLayout.center.width;
                    const y1 = graphLayout.center.y + graphLayout.center.height / 2;
                    const x2 = down.x;
                    const y2 = down.y + down.height / 2;
                    const cx1 = (x1 + x2) / 2;
                    const cx2 = cx1;
                    const pathD = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

                    const isHovered =
                      hoveredEdge?.from === activeFilePath && hoveredEdge?.to === down.node.path;

                    return (
                      <g key={down.node.path} className="pointer-events-auto cursor-pointer">
                        <path
                          d={pathD}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="18"
                          onMouseEnter={() =>
                            setHoveredEdge({
                              from: activeFilePath,
                              to: down.node.path,
                              symbols: down.edge.symbols,
                              x: (x1 + x2) / 2,
                              y: (y1 + y2) / 2,
                            })
                          }
                          onMouseLeave={() => setHoveredEdge(null)}
                        />
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isHovered ? '#38bdf8' : '#0284c7'}
                          strokeWidth={isHovered ? '3' : '1.8'}
                          strokeDasharray={down.edge.isTypeOnly ? '4 4' : 'none'}
                          opacity={isHovered ? '1' : '0.75'}
                          markerEnd="url(#arrow-cyan)"
                        />
                      </g>
                    );
                  })}

                  {/* 3. Directed Curves from Downstream -> Bedrock Nodes */}
                  {showBedrockLineage &&
                    graphLayout.bedrock.map((bed) => {
                      const sourceDown = graphLayout.downstream.find((d) =>
                        edges.some((e) => e.from === d.node.path && e.to === bed.node.path),
                      ) || graphLayout.downstream[0];

                      if (!sourceDown) return null;
                      const x1 = sourceDown.x + sourceDown.width;
                      const y1 = sourceDown.y + sourceDown.height / 2;
                      const x2 = bed.x;
                      const y2 = bed.y + bed.height / 2;
                      const cx = (x1 + x2) / 2;
                      const pathD = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;

                      return (
                        <path
                          key={bed.node.path}
                          d={pathD}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.2"
                          strokeDasharray="2 3"
                          opacity="0.45"
                          markerEnd="url(#arrow-emerald)"
                        />
                      );
                    })}
                </svg>

                {/* HTML Nodes Layer (Interactive Cards) */}
                <div className="absolute inset-0" style={{ zIndex: 2 }}>
                  {/* Column Labels */}
                  <div
                    className="absolute text-[11px] font-bold uppercase tracking-wider text-amber-400/80"
                    style={{ left: `${graphLayout.upstream[0]?.x || 60}px`, top: '16px' }}
                  >
                    ⬅ Upstream Callers ({upstreamNodes.length})
                  </div>
                  <div
                    className="absolute text-[11px] font-bold uppercase tracking-wider text-sky-400/80"
                    style={{ left: `${graphLayout.center.x}px`, top: '16px' }}
                  >
                    ★ Active Spotlight Center
                  </div>
                  <div
                    className="absolute text-[11px] font-bold uppercase tracking-wider text-sky-400/80"
                    style={{ left: `${graphLayout.downstream[0]?.x || 1060}px`, top: '16px' }}
                  >
                    Direct Imports ({downstreamNodes.length}) — Sorted by Layer Tier ➔
                  </div>
                  {showBedrockLineage && bedrockReachable.length > 0 && (
                    <div
                      className="absolute text-[11px] font-bold uppercase tracking-wider text-emerald-400/80"
                      style={{ left: `${graphLayout.bedrock[0]?.x || 1480}px`, top: '16px' }}
                    >
                      Bedrock Primitives ({bedrockReachable.length}) 🛡️
                    </div>
                  )}

                  {/* 1. Upstream Caller Nodes (Left Column) */}
                  {graphLayout.upstream.map((up) => {
                    const meta = getFileMeta(up.node.path);
                    const layerMeta = getLayerMeta(up.node.layer);

                    return (
                      <div
                        key={up.node.path}
                        onClick={() => setActiveFilePath(up.node.path)}
                        onMouseEnter={(e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setHoveredNode({ node: up.node, x: rect.right + 10, y: rect.top });
                        }}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{
                          left: `${up.x}px`,
                          top: `${up.y}px`,
                          width: `${up.width}px`,
                          height: `${up.height}px`,
                        }}
                        className="interactive-node absolute flex flex-col justify-between rounded-xl border border-amber-500/40 bg-slate-900/90 p-2.5 shadow-md hover:border-amber-400 hover:bg-slate-800 transition cursor-pointer group backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                            <span className="text-xs font-bold text-amber-200 group-hover:text-amber-100 truncate">
                              {meta.displayName}
                            </span>
                            {meta.isIndex && (
                              <span className="text-[8px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                barrel
                              </span>
                            )}
                          </div>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${layerMeta.color} ${layerMeta.bg} border ${layerMeta.border}`}>
                            {layerMeta.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{up.edge.symbols.length} imported sym</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openSource(up.node.path);
                            }}
                            className="rounded px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold transition"
                            title="Read source file"
                          >
                            📖 Read
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* 2. CENTER HERO SPOTLIGHT NODE */}
                  <div
                    style={{
                      left: `${graphLayout.center.x}px`,
                      top: `${graphLayout.center.y}px`,
                      width: `${graphLayout.center.width}px`,
                      height: `${graphLayout.center.height}px`,
                    }}
                    className="interactive-node absolute flex flex-col justify-between rounded-2xl border-2 border-sky-400 bg-slate-900 shadow-2xl shadow-sky-500/30 ring-4 ring-sky-500/20 p-4 z-10"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-sky-300 tracking-tight">
                            {centerMeta.displayName}
                          </span>
                          {centerMeta.isIndex && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                              barrel
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-sky-400/80 font-medium">
                          {centerLayerMeta.tier}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[210px]">
                          {activeNode.path}
                        </span>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${centerLayerMeta.color} ${centerLayerMeta.bg} border ${centerLayerMeta.border}`}>
                        {centerLayerMeta.badge}
                      </span>
                    </div>

                    {/* Stats & Symbols Snapshot */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-950/80 p-2 text-center text-xs border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Lines</div>
                        <div className="font-bold text-slate-200">{activeNode.loc}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Functions</div>
                        <div className="font-bold text-sky-400">{activeNode.functions.length}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Types</div>
                        <div className="font-bold text-purple-400">
                          {activeNode.types.length + activeNode.interfaces.length}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400">
                        {downstreamNodes.length} direct imports
                      </span>
                      <button
                        onClick={() => openSource(activeNode.path)}
                        className="rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
                      >
                        <span>📖</span> View Full Source Code
                      </button>
                    </div>
                  </div>

                  {/* 3. Downstream Direct Import Nodes (Right Column) */}
                  {graphLayout.downstream.map((down) => {
                    const meta = getFileMeta(down.node.path);
                    const layerMeta = getLayerMeta(down.node.layer);

                    return (
                      <div
                        key={down.node.path}
                        onClick={() => setActiveFilePath(down.node.path)}
                        onMouseEnter={(e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setHoveredNode({ node: down.node, x: rect.right + 10, y: rect.top });
                        }}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{
                          left: `${down.x}px`,
                          top: `${down.y}px`,
                          width: `${down.width}px`,
                          height: `${down.height}px`,
                        }}
                        className="interactive-node absolute flex flex-col justify-between rounded-xl border border-sky-500/40 bg-slate-900/90 p-2.5 shadow-md hover:border-sky-400 hover:bg-slate-800 transition cursor-pointer group backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                            <span className="text-xs font-bold text-sky-200 group-hover:text-white truncate">
                              {meta.displayName}
                            </span>
                            {meta.isIndex && (
                              <span className="text-[8px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                barrel
                              </span>
                            )}
                          </div>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${layerMeta.color} ${layerMeta.bg} border ${layerMeta.border}`}
                          >
                            {layerMeta.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono text-sky-400/80 truncate max-w-[160px]">
                            {down.edge.symbols.slice(0, 2).join(', ')}
                            {down.edge.symbols.length > 2 ? ` +${down.edge.symbols.length - 2}` : ''}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openSource(down.node.path);
                            }}
                            className="rounded px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold transition"
                            title="Read source file"
                          >
                            📖 Read
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* 4. Bedrock Leaf Nodes (Far Right Column) */}
                  {showBedrockLineage &&
                    graphLayout.bedrock.map((bed) => {
                      const meta = getFileMeta(bed.node.path);

                      return (
                        <div
                          key={bed.node.path}
                          onClick={() => setActiveFilePath(bed.node.path)}
                          onMouseEnter={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setHoveredNode({ node: bed.node, x: rect.right + 10, y: rect.top });
                          }}
                          onMouseLeave={() => setHoveredNode(null)}
                          style={{
                            left: `${bed.x}px`,
                            top: `${bed.y}px`,
                            width: `${bed.width}px`,
                            height: `${bed.height}px`,
                          }}
                          className="interactive-node absolute flex flex-col justify-between rounded-xl border border-emerald-500/40 bg-slate-900/80 p-2 shadow hover:border-emerald-400 hover:bg-slate-800 transition cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11.5px] font-bold text-emerald-300 truncate max-w-[130px]">
                              {meta.displayName}
                            </span>
                            <span className="rounded bg-emerald-950 px-1 py-0.5 text-[8.5px] font-bold text-emerald-400 border border-emerald-700">
                              BEDROCK
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{bed.node.loc} loc</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openSource(bed.node.path);
                              }}
                              className="rounded px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold transition"
                              title="Read source"
                            >
                              📖 Read
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Edge Hover Tooltip */}
              {hoveredEdge && (
                <div
                  className="fixed z-50 pointer-events-none rounded-lg border border-sky-400/80 bg-slate-900/95 px-3 py-2 text-xs shadow-2xl backdrop-blur font-sans"
                  style={{
                    left: `${hoveredEdge.x * zoom + pan.x + 288}px`,
                    top: `${hoveredEdge.y * zoom + pan.y + 60}px`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Directed Import Relation
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-200">
                    <span className="text-amber-300">{getFileMeta(hoveredEdge.from).displayName}</span> ➔{' '}
                    <span className="text-sky-300">{getFileMeta(hoveredEdge.to).displayName}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    <strong>Symbols:</strong>{' '}
                    <span className="font-mono text-sky-400">{hoveredEdge.symbols.join(', ')}</span>
                  </div>
                </div>
              )}

              {/* Node Hover Popover Card */}
              {hoveredNode && (
                <div
                  className="fixed z-50 pointer-events-none rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 text-xs shadow-2xl backdrop-blur w-72"
                  style={{
                    left: `${Math.min(hoveredNode.x, window.innerWidth - 300)}px`,
                    top: `${Math.min(hoveredNode.y, window.innerHeight - 250)}px`,
                  }}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-slate-200 text-xs truncate">
                        {getFileMeta(hoveredNode.node.path).displayName}
                      </span>
                      {getFileMeta(hoveredNode.node.path).isIndex && (
                        <span className="text-[8px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          barrel
                        </span>
                      )}
                    </div>
                    <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[9px] text-sky-400 border border-slate-800">
                      Layer {hoveredNode.node.layer}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-[11px] text-slate-400">
                    <div>
                      <strong className="text-slate-300">Functions ({hoveredNode.node.functions.length}):</strong>{' '}
                      <span className="font-mono text-sky-400">
                        {hoveredNode.node.functions.slice(0, 3).map((f) => f.name).join(', ') || 'None'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-300">Types ({hoveredNode.node.types.length + hoveredNode.node.interfaces.length}):</strong>{' '}
                      <span className="font-mono text-purple-400">
                        {[...hoveredNode.node.interfaces, ...hoveredNode.node.types].slice(0, 3).map((t) => t.name).join(', ') || 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'erd' ? (
            /* Traditional Compartmentalized ERD Cards View */
            <ScrollArea orientation="horizontal" variant="auto" label="Architecture ERD" className="flex-1 bg-slate-950">
              <div className="flex gap-6 p-6 pb-6">
                {/* Active Focus Card */}
                <div className="flex w-96 flex-shrink-0 flex-col rounded-xl border-2 border-sky-500 bg-slate-900 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/80 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sky-300 text-sm">{centerMeta.displayName}</span>
                      {centerMeta.isIndex && (
                        <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          barrel
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openSource(activeNode.path)}
                      className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-500/40"
                    >
                      📖 Read Source
                    </button>
                  </div>
                  <div className="p-3 divide-y divide-slate-800/60 overflow-y-auto max-h-[70vh] space-y-3">
                    {activeNode.functions.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Functions</div>
                        {activeNode.functions.map((fn) => (
                          <div
                            key={fn.name}
                            onClick={() => openSource(activeNode.path, fn.name)}
                            className="flex justify-between text-xs font-mono text-sky-300 py-0.5 cursor-pointer hover:underline"
                          >
                            <span>{fn.name}()</span>
                            <span className="text-[10px] text-slate-500">{fn.isExported ? 'pub' : 'priv'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(activeNode.types.length > 0 || activeNode.interfaces.length > 0) && (
                      <div className="pt-2">
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Types</div>
                        {[...activeNode.interfaces, ...activeNode.types].map((t) => (
                          <div
                            key={t.name}
                            onClick={() => openSource(activeNode.path, t.name)}
                            className="flex justify-between text-xs font-mono text-purple-300 py-0.5 cursor-pointer hover:underline"
                          >
                            <span>{t.name}</span>
                            <span className="text-[10px] text-slate-500">{t.isExported ? 'pub' : 'priv'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Downstream Cards */}
                {downstreamNodes.map(({ node, edge }) => {
                  const meta = getFileMeta(node.path);
                  const layerMeta = getLayerMeta(node.layer);

                  return (
                    <div
                      key={node.path}
                      className="flex w-80 flex-shrink-0 flex-col rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/40 px-4 py-2.5">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <span
                            onClick={() => setActiveFilePath(node.path)}
                            className="cursor-pointer font-semibold text-slate-200 hover:text-sky-400 text-xs truncate"
                          >
                            {meta.displayName}
                          </span>
                          {meta.isIndex && (
                            <span className="text-[8px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              barrel
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openSource(node.path)}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 hover:text-white"
                          >
                            📖
                          </button>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${layerMeta.color} ${layerMeta.bg}`}>
                            {layerMeta.badge}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 text-xs text-slate-400 space-y-2">
                        <div>Imported: <span className="font-mono text-sky-400">{edge.symbols.join(', ')}</span></div>
                        <div>Tier: <span className="text-slate-200">{layerMeta.tier}</span> ({node.loc} lines)</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : viewMode === 'matrix' ? (
            /* 14-Layer Matrix View */
            <ScrollArea orientation="horizontal" variant="auto" label="14-Layer Architecture Matrix" className="flex-1 bg-slate-950">
              <div className="p-6 flex gap-4">
              {layerBreakdown.map((l) => {
                const layerMeta = getLayerMeta(l.layer);

                return (
                  <div
                    key={l.layer}
                    className="flex w-64 flex-shrink-0 flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
                  >
                    <div className="border-b border-slate-800 bg-slate-800/60 px-3 py-2 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${layerMeta.color}`}>
                          Layer {l.layer} {l.layer === 0 ? '(Bedrock)' : ''}
                        </span>
                        <span className="text-[9px] text-slate-500">{layerMeta.tier}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{l.files.length} files</span>
                    </div>
                    <div className="p-2 space-y-1.5 overflow-y-auto max-h-[75vh]">
                      {l.files.map((f) => {
                        const meta = getFileMeta(f.path);

                        return (
                          <div
                            key={f.path}
                            onClick={() => {
                              setActiveFilePath(f.path);
                              setViewMode('graph');
                            }}
                            className="p-2 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs cursor-pointer truncate flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-1 truncate">
                              <span className="truncate group-hover:text-sky-300">{meta.displayName}</span>
                              {meta.isIndex && (
                                <span className="text-[8px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                  barrel
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openSource(f.path);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-[10px] px-1 bg-slate-800 rounded text-slate-300"
                            >
                              📖
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              </div>
            </ScrollArea>
          ) : (
            /* 🛠️ Toolset & Meta-Model View */
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6">
              {/* Header & Sub-Tab Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-sky-300 flex items-center gap-2">
                    🛠️ Sovereign Architecture Intelligence Suite (Meta-Model)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Five computational engines operating deterministically to prevent accretive Frankenstein drift.
                  </p>
                </div>
                {/* Sub-Tabs */}
                <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
                  <button
                    onClick={() => setToolsTab('hierarchy')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'hierarchy' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏛️ 7-Tier Hierarchy
                  </button>
                  <button
                    onClick={() => setToolsTab('archetypes')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'archetypes' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📜 Taxonomy ({toolsMetaModelData.fileTypesSummary.percentage}%)
                  </button>
                  <button
                    onClick={() => setToolsTab('contamination')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'contamination' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ☕ Java Debt ({toolsMetaModelData.javaContaminationSummary?.contaminationRate ?? 94}%)
                  </button>
                  <button
                    onClick={() => setToolsTab('engines')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'engines' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛠️ 8 Engines
                  </button>
                  <button
                    onClick={() => setToolsTab('bypasses')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'bypasses' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🚨 Bypasses ({toolsMetaModelData.bypassesSummary.totalBypasses})
                  </button>
                  <button
                    onClick={() => setToolsTab('overlaps')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'overlaps' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚖️ Overlaps & SSOT
                  </button>
                  <button
                    onClick={() => setToolsTab('folders')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'folders' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📁 Folders ({toolsMetaModelData.foldersSummary.totalFolders})
                  </button>
                  <button
                    onClick={() => setToolsTab('chronology')}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      toolsTab === 'chronology' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⏳ Archaeology ({toolsMetaModelData.chronologySummary.bedrockFiles.length})
                  </button>
                </div>
              </div>

              {/* Sub-Tab 0: Canonical 7-Tier Hierarchy */}
              {toolsTab === 'hierarchy' && (
                <div className="space-y-6">
                  {/* Context Banner */}
                  <div className="rounded-xl border border-sky-800 bg-sky-950/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <span>🏛️ Graph Topological Depth vs. Canonical Architectural Tiers</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>Why files were smeared across 14 layers:</strong> Pure topological sorting calculates DAG longest path. If schema B imports schema A, B is placed at L1. If an adapter imports database proxies, it gets pushed to L10, while a UI spinner with 0 imports lands at L0!
                      <br />
                      <strong>The Canonical Hierarchy:</strong> Files belong to <strong>7 fixed Architectural Archetypes</strong> governed by Clean/Hexagonal boundaries. Higher tiers may never be tightly coupled to concrete adapters, and hooks must not execute runtime schema validation.
                    </p>
                  </div>

                  {/* Violation Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-rose-900 bg-rose-950/40 p-3">
                      <div className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider">
                        🚨 Adapter Direct Couplings
                      </div>
                      <div className="text-2xl font-black text-rose-400 mt-1">
                        {toolsMetaModelData.hierarchySummary.violations.adapterCouplingCount}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Stores/Logic directly importing concrete adapters instead of Ports (DIP violation).
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-900 bg-amber-950/40 p-3">
                      <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                        ⚠️ Schema Parses in Hooks
                      </div>
                      <div className="text-2xl font-black text-amber-400 mt-1">
                        {toolsMetaModelData.hierarchySummary.violations.schemaRuntimeInHookCount}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        <code>CapacitySchema</code> &amp; <code>UserContextSchema</code> executed on every render inside <code>useSanctuaryFeature</code>.
                      </p>
                    </div>

                    <div className="rounded-lg border border-purple-900 bg-purple-950/40 p-3">
                      <div className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">
                        🔗 Chain Leapfrogging
                      </div>
                      <div className="text-2xl font-black text-purple-400 mt-1">
                        {toolsMetaModelData.hierarchySummary.violations.chainBypassesCount}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Hook bypassing <code>useEntitlementStore</code> to invoke <code>resolveScopedEntitlement</code> directly from port.
                      </p>
                    </div>
                  </div>

                  {/* 7 Tiers Cards */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      The 7 Architectural Archetypes ({toolsMetaModelData.hierarchySummary.totalTiers} Tiers, 79 Files)
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {toolsMetaModelData.hierarchySummary.tiers.map((tier) => (
                        <div
                          key={tier.tierKey}
                          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 hover:border-slate-700 transition"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{tier.icon}</span>
                              <div>
                                <h4 className="text-sm font-bold text-slate-100">{tier.name}</h4>
                                <p className="text-xs text-slate-400">{tier.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                                Topo Span: {tier.topologicalSpan}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {tier.fileCount} files • {tier.totalLoc} LOC
                              </span>
                            </div>
                          </div>

                          {/* File Pills */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {tier.files.map((file) => (
                              <div
                                key={file.path}
                                onClick={() => {
                                  setActiveFilePath(file.path);
                                  setViewMode('graph');
                                }}
                                className="group flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-sky-500 hover:text-white cursor-pointer transition"
                              >
                                <span>{file.name}</span>
                                <span className="text-[9px] font-mono text-slate-500 group-hover:text-sky-300">
                                  L{file.topologicalLayer}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSource(file.path);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px]"
                                  title="Inspect Source"
                                >
                                  📖
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 11 Adapter Couplings Table */}
                  <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                        🚨 The 11 Adapter Coupling Violations (Stores Directly Binding to Infra)
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900 text-rose-200">
                        Dependency Inversion Needed
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-rose-900/50 text-[10px] uppercase text-slate-400">
                            <th className="py-2 px-2">High-Level Consumer (Store/Logic)</th>
                            <th className="py-2 px-2">Concrete Adapter Target</th>
                            <th className="py-2 px-2">Coupled Symbols</th>
                            <th className="py-2 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-900/30">
                          {toolsMetaModelData.hierarchySummary.violations.adapterCoupling.map((v, i) => (
                            <tr key={i} className="hover:bg-rose-950/40">
                              <td className="py-2 px-2 font-mono text-slate-200">
                                <div>{v.sourceFile}</div>
                                <div className="text-[9px] text-slate-400">{v.sourceTier}</div>
                              </td>
                              <td className="py-2 px-2 font-mono text-rose-300">
                                <div>{v.targetFile}</div>
                                <div className="text-[9px] text-slate-400">{v.targetTier}</div>
                              </td>
                              <td className="py-2 px-2 font-mono text-amber-300 text-[11px]">
                                {v.symbols.join(', ')}
                              </td>
                              <td className="py-2 px-2 text-right">
                                <button
                                  onClick={() => {
                                    setActiveFilePath(v.sourcePath);
                                    setViewMode('graph');
                                  }}
                                  className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-sky-600 hover:text-white"
                                >
                                  Spotlight
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab: Canonical 12 File Archetypes */}
              {toolsTab === 'archetypes' && (
                <div className="space-y-6">
                  {/* Context Banner */}
                  <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <span>📜 The Canonical 12 File Archetypes (Top-Down First Principles)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>Escaping &ldquo;Archetype Soup&rdquo;:</strong> Vibe coders invent ambiguous suffixes like <code>manager</code>, <code>helper</code>, <code>handler</code>, or <code>coordinator</code> without knowing their single responsibility or boundary layer.
                      In modern clean architecture, there are only <strong>12 Canonical Building Blocks</strong> across all 630 files in <code>@repo/core</code>.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Total Core Files
                      </div>
                      <div className="text-2xl font-black text-slate-100 mt-1">
                        {toolsMetaModelData.fileTypesSummary.totalFiles}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Non-test source files in @repo/core</p>
                    </div>

                    <div className="rounded-lg border border-emerald-900 bg-emerald-950/40 p-3">
                      <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                        Classified Archetypes
                      </div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        {toolsMetaModelData.fileTypesSummary.classifiedCount}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {toolsMetaModelData.fileTypesSummary.percentage}% strictly adhere to 12 archetypes
                      </p>
                    </div>

                    <div className="rounded-lg border border-sky-900 bg-sky-950/40 p-3">
                      <div className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                        Canonical Archetypes
                      </div>
                      <div className="text-2xl font-black text-sky-400 mt-1">
                        12
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Spanning Tiers 0 to 6 + Barrels</p>
                    </div>

                    <div className="rounded-lg border border-amber-900 bg-amber-950/40 p-3">
                      <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                        Freeform / Legacy
                      </div>
                      <div className="text-2xl font-black text-amber-400 mt-1">
                        {toolsMetaModelData.fileTypesSummary.unclassifiedCount}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Target for naming standardization</p>
                    </div>
                  </div>

                  {/* 12 Archetypes Cards Grid */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      The 12 Canonical Archetypes Reference
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {toolsMetaModelData.fileTypesSummary.archetypes.map((arch) => (
                        <div
                          key={arch.key}
                          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-100">{arch.name}</span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  arch.tier >= 4 ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                                  arch.tier >= 2 ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                                  arch.tier >= 0 ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                                  'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}>
                                  {arch.tier >= 0 ? `Tier ${arch.tier}` : 'Cross-Cutting'}
                                </span>
                              </div>
                              <code className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
                                {arch.suffix}
                              </code>
                            </div>
                            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-200">
                              {arch.count} files
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {arch.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disambiguation Guide Card */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      💡 Senior Architect Disambiguation Matrix (Quick Reference)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-sky-300">Port vs. Adapter</div>
                        <p className="text-slate-400 text-[11px]">
                          <strong>Port</strong> is the abstract interface owned by domain. <strong>Adapter</strong> is the concrete implementation binding to external SDK/database.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-sky-300">Store vs. Service</div>
                        <p className="text-slate-400 text-[11px]">
                          <strong>Store</strong> is stateful in-memory cache for React reactivity. <strong>Service</strong> is stateless business calculation.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-sky-300">Repository vs. Adapter</div>
                        <p className="text-slate-400 text-[11px]">
                          <strong>Adapter</strong> connects to a technology (Supabase, Sentry). <strong>Repository</strong> handles aggregate CRUD SQL queries.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-sky-300">Schema vs. Type</div>
                        <p className="text-slate-400 text-[11px]">
                          <strong>Type</strong> is compile-time only (0 bytes). <strong>Schema</strong> is an executable Zod validator for untrusted runtime inputs.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-sky-300">Hook vs. Flow</div>
                        <p className="text-slate-400 text-[11px]">
                          <strong>Hook</strong> binds components to reactive stores. <strong>Flow</strong> is a multi-step async business wizard / saga.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-sky-300">The Golden Barrel Rule</div>
                        <p className="text-slate-400 text-[11px]">
                          <code>index.ts</code> exports downward to outside callers. Files in the same folder must <strong>never</strong> import their own barrel!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pareto 20% Breakdown Card */}
                  <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        ⚖️ The Pareto 20% Deep Dive: Where the 71 Freeform Files Hide
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900 text-amber-200">
                        80% of Debt in 2 Folders
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      The Pareto Principle proves that 20% of unstandardized files cause 80% of accidental coupling. They are not random—they cluster into two historical anti-patterns:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-950 border border-amber-900/40 space-y-1">
                        <div className="font-bold text-amber-400">1. &ldquo;lib/&rdquo; Junk Drawer (33 files)</div>
                        <p className="text-slate-400 text-[11px]">
                          Storage wrappers (<code>authStorage</code>), 3rd-party SDKs (<code>cloudinary</code>, <code>inngest</code>), and security policies dumped into a generic folder.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-amber-900/40 space-y-1">
                        <div className="font-bold text-amber-400">2. Misnamed &ldquo;native/&rdquo; (12 files)</div>
                        <p className="text-slate-400 text-[11px]">
                          Pure TypeScript guest session managers (<code>guestDataManager</code>) with 0 native code, misleading developers into building parallel web drivers.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-amber-900/40 space-y-1">
                        <div className="font-bold text-amber-400">3. Verger Runtime (7 files)</div>
                        <p className="text-slate-400 text-[11px]">
                          Hardware sensing and adaptive performance levers (<code>gurudeviLevers</code>, <code>wallpaper</code>).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab: Java OOP Contamination & Accretive Debt */}
              {toolsTab === 'contamination' && (
                <div className="space-y-6">
                  {/* Context Banner */}
                  <div className="rounded-xl border border-amber-800 bg-amber-950/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <span>☕ Java OOP Contamination & The &ldquo;Using Somewhere&rdquo; Fallacy</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>The Accretive Zombie Loop:</strong> Developers often fall into the trap of thinking: <em>&ldquo;If AuthManager is an anti-pattern, why is it imported in auth.factory.ts? It&rsquo;s being used somewhere!&rdquo;</em>
                      <br />
                      Empirical in-degree analysis proves this is a <strong>self-referential bubble</strong>: dead code importing dead code.
                      In modern TypeScript and React 19.3, <strong>ES modules are already singletons</strong>, and state belongs in external reactive stores (Zustand)â€”not 600-line imperative Java classes.
                    </p>
                  </div>

                  {/* Violation Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Managers Folder
                      </div>
                      <div className="text-2xl font-black text-slate-100 mt-1">
                        {toolsMetaModelData.javaContaminationSummary?.totalAnalyzed ?? 32} Files
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        <code>packages/core/.../managers/</code>
                      </div>
                    </div>

                    <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3">
                      <div className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">
                        Contamination Rate
                      </div>
                      <div className="text-2xl font-black text-red-400 mt-1">
                        {toolsMetaModelData.javaContaminationSummary?.contaminationRate ?? 94}%
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {toolsMetaModelData.javaContaminationSummary?.totalWithZeroAppCallers ?? 30} files with 0 App Callers!
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-3">
                      <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                        Useless Pass-Throughs
                      </div>
                      <div className="text-2xl font-black text-amber-300 mt-1">
                        {toolsMetaModelData.javaContaminationSummary?.uselessPassThrough ?? 5} Classes
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        100% pure delegation to <code>this.repo</code>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Deadweight Factories
                      </div>
                      <div className="text-2xl font-black text-slate-300 mt-1">
                        {toolsMetaModelData.javaContaminationSummary?.deadweightFactories ?? 11} Files
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Manual DI singletons never used by apps
                      </div>
                    </div>
                  </div>

                  {/* Contrast Case Study: The Auth Seam Reality */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* The Real SSOT Workhorse */}
                    <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          âœ… The Real Production Workhorse (SSOT)
                        </span>
                        <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[11px] font-mono text-emerald-300 border border-emerald-700">
                          34 Total Callers (12 Apps, 22 Core)
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-100">
                        useAuthStore.ts (Zustand Store)
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The true single source of truth for client state across mobile and web. Powered by{' '}
                        <code>useSyncExternalStore</code> with surgical subscriptions (components only re-render when their selected property changes).
                        Synchronously accessible everywhere via <code>useAuthStore.getState()</code> outside React!
                      </p>
                      <div className="rounded bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800">
                        const user = useAuthStore(s =&gt; s.user); // Surgical UI subscription<br />
                        const token = useAuthStore.getState().session?.token; // Universal read
                      </div>
                    </div>

                    {/* The Accretive Zombie Class */}
                    <div className="rounded-xl border border-red-800/80 bg-red-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                          â Œ The Accretive Zombie (Java OOP Contamination)
                        </span>
                        <span className="rounded bg-red-900/60 px-2 py-0.5 text-[11px] font-mono text-red-300 border border-red-700">
                          0 App Callers (611 LOC)
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-100">
                        AuthManager.ts + auth.factory.ts
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        An imperative class holding state + methods. Because it is a plain class, it has no reactive bindings to React&rsquo;s render cycle.
                        Mobile developers had to bypass it to get reactive UI. It survives only because it is imported by its own dead factory!
                      </p>
                      <div className="rounded bg-slate-950 p-2.5 font-mono text-[11px] text-red-400 border border-slate-800">
                        // 0 App Callers! Only imported by dead factory:<br />
                        export const auth = new AuthManager(new SupabaseAuthAdapter(), ...);
                      </div>
                    </div>
                  </div>

                  {/* Contaminated Files Inventory Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Logic Managers Inventory ({toolsMetaModelData.javaContaminationSummary?.topContaminatedFiles.length ?? 0} Largest Files)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Grounded via <code>scripts/audit-java-contamination.mjs</code>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                            <th className="p-3">File Name</th>
                            <th className="p-3">LOC</th>
                            <th className="p-3">Classification</th>
                            <th className="p-3 text-center">App Callers</th>
                            <th className="p-3 text-center">Core Callers</th>
                            <th className="p-3">Architectural Verdict</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {toolsMetaModelData.javaContaminationSummary?.topContaminatedFiles.map((file) => {
                            const isDeadweight = file.appCallersCount === 0;
                            return (
                              <tr key={file.file} className="hover:bg-slate-800/30 transition">
                                <td className="p-3 font-mono font-bold text-slate-200">
                                  {file.file}
                                </td>
                                <td className="p-3 font-mono text-slate-400">
                                  {file.loc}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                      file.classification === 'USELESS PASS-THROUGH WRAPPER'
                                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                        : file.classification === 'DEADWEIGHT FACTORY'
                                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                        : file.classification === 'ORPHANED OOP MANAGER'
                                        ? 'bg-red-950 text-red-300 border border-red-800'
                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    }`}
                                  >
                                    {file.classification}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold">
                                  <span className={isDeadweight ? 'text-red-400' : 'text-emerald-400'}>
                                    {file.appCallersCount}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono text-slate-400">
                                  {file.coreCallersCount}
                                </td>
                                <td className="p-3 text-slate-300 text-[11px] max-w-md">
                                  {file.reason}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => openSource(`packages/core/src/logic/managers/${file.file}`)}
                                    className="rounded px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold transition text-[11px]"
                                  >
                                    ðŸ“– Inspect
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* React 18 vs 19.3 State Mechanics Card */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      ⚛️ State Mechanics: React 18 Era vs. React 19.3 First Principles
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                            <th className="p-2">Primitive</th>
                            <th className="p-2">Single Responsibility</th>
                            <th className="p-2">Reactive Engine</th>
                            <th className="p-2">Re-Render Blast Radius</th>
                            <th className="p-2">Universal Access (Outside JSX)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          <tr>
                            <td className="p-2 font-mono font-bold text-sky-300">Context</td>
                            <td className="p-2">Tree-scoped Dependency Injection</td>
                            <td className="p-2">React Context API</td>
                            <td className="p-2 text-amber-400">Cascading Subtree Re-render</td>
                            <td className="p-2 text-red-400">â Œ Forbidden (Throws outside render)</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold text-sky-300">Provider</td>
                            <td className="p-2">Environmental boundary (Theme, QueryClient)</td>
                            <td className="p-2">JSX Hierarchy Mounting</td>
                            <td className="p-2 text-slate-300">Static / Low Frequency Scope</td>
                            <td className="p-2 text-red-400">â Œ Forbidden (JSX tree only)</td>
                          </tr>
                          <tr className="bg-emerald-950/20">
                            <td className="p-2 font-mono font-bold text-emerald-300">Store (Zustand)</td>
                            <td className="p-2">Global Mutable Application State</td>
                            <td className="p-2 font-bold text-emerald-400">useSyncExternalStore</td>
                            <td className="p-2 text-emerald-400 font-bold">Surgical (Only selected prop)</td>
                            <td className="p-2 text-emerald-400 font-bold">âœ… Native (store.getState())</td>
                          </tr>
                          <tr className="bg-red-950/20">
                            <td className="p-2 font-mono font-bold text-red-300">Manager (Legacy)</td>
                            <td className="p-2">Imperative OOP Class (State + I/O)</td>
                            <td className="p-2 text-red-400">None (Manual event polling)</td>
                            <td className="p-2 text-red-400">Zero Reactivity (UI desyncs)</td>
                            <td className="p-2 text-slate-300">âœ… Native JS, but decoupled from UI</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 1: 5 Sovereign Engines */}
              {toolsTab === 'engines' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {toolsMetaModelData.tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                              {tool.category}
                            </span>
                            <h3 className="text-sm font-bold text-slate-100 mt-1.5">{tool.name}</h3>
                          </div>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            {tool.keyMetric}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{tool.purpose}</p>
                        <div className="rounded-lg bg-slate-950 p-2 border border-slate-800 font-mono text-[11px] text-sky-300 flex items-center justify-between">
                          <span className="truncate">{tool.command}</span>
                          <button
                            onClick={() => copyToClipboard(tool.command)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded ml-2"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Artifacts: <span className="font-mono text-slate-300">{tool.artifacts.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Transitive Bypasses */}
              {toolsTab === 'bypasses' && (
                <div className="space-y-4">
                  {/* Bypasses Metric Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Bypasses</div>
                      <div className="text-2xl font-bold text-rose-400 mt-1">
                        {toolsMetaModelData.bypassesSummary.totalBypasses}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Diamond dependency edges</div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Same-Seam Critical</div>
                      <div className="text-2xl font-bold text-amber-400 mt-1">
                        {toolsMetaModelData.bypassesSummary.sameSeamBypasses}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Breaks domain encapsulation</div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-400">In useSanctuaryFeature</div>
                      <div className="text-2xl font-bold text-sky-400 mt-1">
                        {toolsMetaModelData.bypassesSummary.useSanctuaryBypassesCount}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">11 of 15 direct imports</div>
                    </div>
                  </div>

                  {/* Filter Pill */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-300">
                      Showing Top Same-Seam Layer Bypasses
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Upper layers bypassing intermediate facades
                    </div>
                  </div>

                  {/* Bypass Cards */}
                  <div className="space-y-2">
                    {toolsMetaModelData.bypassesSummary.topSameSeam.map((b, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              L{b.fromLayer} ➔ L{b.toLayer}
                            </span>
                            <span className="font-mono text-xs font-semibold text-slate-100">
                              {b.from.split('/').pop()}
                            </span>
                            <span className="text-slate-500 text-xs">directly imports</span>
                            <span className="font-mono text-xs font-semibold text-amber-300">
                              {b.to.split('/').pop()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setActiveFilePath(b.from);
                                setViewMode('graph');
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800"
                            >
                              🔍 Spotlight
                            </button>
                            <button
                              onClick={() => openSource(b.from)}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              📖 Source
                            </button>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Seam: <span className="text-sky-300 font-medium">{b.uSeam}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          Alternate Path: {b.alternatePath.map((p: string) => p.split('/').pop()).join(' ➔ ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Semantic Overlaps & SSOT */}
              {toolsTab === 'overlaps' && (
                <div className="space-y-4">
                  {/* Card 1: Guest Checkers */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Hotspot 1 • 6 Overlapping Checkers (44 Related Files)
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-1">
                          "Is the user a guest, anonymous, or local-only?"
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {toolsMetaModelData.overlapsSummary.guestCheckers.slice(0, 6).map((g, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                          <span className="font-mono text-amber-300">{g.name}()</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[180px]">{g.file.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-2.5 text-xs text-emerald-200">
                      <strong>Canonical SSOT:</strong> <code className="font-mono text-emerald-300">resolveBondCitizenship(activeBond) === &apos;THIRD_CLASS&apos; || !user?.id</code> in <code className="text-sky-300">packages/core/src/types/Identity.ts</code>
                    </div>
                  </div>

                  {/* Card 2: UI Buttons */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Hotspot 2 • 5 Parallel Button Implementations
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-1">
                          Button UI Components across @repo/ui
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {toolsMetaModelData.overlapsSummary.buttonComponents.slice(0, 6).map((b, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                          <span className="font-mono text-sky-300">&lt;{b.name}&gt;</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[180px]">{b.file.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-2.5 text-xs text-emerald-200">
                      <strong>Canonical SSOT:</strong> <code className="font-mono text-emerald-300">@repo/ui/components/native/Button</code> and <code className="font-mono text-emerald-300">@repo/ui/components/web/Button</code>. Legacy Gluestack/SanctuaryButton are frozen under ratchet.
                    </div>
                  </div>

                  {/* Card 3: Storage Adapters */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          Hotspot 3 • 6 Storage Wrappers & 3 Key Formatters
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-1">
                          Storage Persistence & Key Namespaces
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {toolsMetaModelData.overlapsSummary.storageWrappers.slice(0, 6).map((st, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                          <span className="font-mono text-purple-300">{st.name}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[180px]">{st.file.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-2.5 text-xs text-emerald-200">
                      <strong>Canonical SSOT:</strong> <code className="font-mono text-emerald-300">StorageManager</code> proxy in <code className="text-sky-300">packages/core/src/lib/storage.ts</code>.
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Folder Ontology */}
              {toolsTab === 'folders' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Audit of all 29 top-level folders in <code className="text-sky-300">packages/core/src</code>. Sorted by layer span.
                  </div>
                  <div className="space-y-2">
                    {toolsMetaModelData.foldersSummary.topFolders.map((f, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-sky-300">{f.folder}/</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {f.fileCount} files • {f.loc} LOC
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              {f.primaryRole}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 text-[11px] text-slate-400">
                          <span>Hooks: <strong className="text-slate-200">{f.hookCount}</strong></span>
                          <span>Stores: <strong className="text-slate-200">{f.storeCount}</strong></span>
                          <span>React imports: <strong className="text-slate-200">{f.reactFiles}</strong></span>
                          <span>Zustand imports: <strong className="text-slate-200">{f.zustandFiles}</strong></span>
                        </div>
                        {f.smells.length > 0 && (
                          <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-900/60 p-1.5 rounded">
                            ⚠️ {f.smells.join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 5: Bedrock Archaeology */}
              {toolsTab === 'chronology' && (
                <div className="space-y-4">
                  {/* The 4 Eras */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {toolsMetaModelData.chronologySummary.eras.map((era, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-sky-300">{era.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{era.window}</span>
                        </div>
                        <p className="text-xs text-slate-300">{era.focus}</p>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-slate-300 mt-4">
                    Layer 0 Bedrock Inventory ({toolsMetaModelData.chronologySummary.bedrockFiles.length} Foundational Leaf Files)
                  </div>

                  <div className="space-y-1.5">
                    {toolsMetaModelData.chronologySummary.bedrockFiles.map((bf, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="font-mono text-emerald-400 font-semibold truncate">
                            {bf.path.split('/').pop()}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                            {bf.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {bf.loc} LOC • {bf.churn} commits
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {bf.born}
                          </span>
                          <button
                            onClick={() => openSource(bf.path)}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            📖
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TOP-LEVEL GLOBAL INSPECT DRAWER / MODAL (Guaranteed visible, never clipped) */}
      {isSourceOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          {/* Dimming Backdrop click-to-close */}
          <div
            onClick={() => setIsSourceOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Source Inspector Panel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: isFullScreenSource ? '100vw' : 'min(960px, 92vw)',
              backgroundColor: '#090d16',
              borderLeft: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.85)',
              transition: 'width 0.2s ease-in-out',
            }}
            className="font-mono text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-3.5">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-xl">📄</span>
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sky-400 text-sm truncate">
                      {sourceData?.path ? getFileMeta(sourceData.path).displayName : 'Source Inspector'}
                    </span>
                    {sourceData?.path && getFileMeta(sourceData.path).isIndex && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                        barrel
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-lg">
                    {sourceData?.path}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Find in file..."
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 w-44"
                />

                <button
                  onClick={() => setIsFullScreenSource(!isFullScreenSource)}
                  className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                  title={isFullScreenSource ? 'Exit Full Screen' : 'Full Screen'}
                >
                  {isFullScreenSource ? '🗗 Split' : '🗖 Expand'}
                </button>

                <button
                  onClick={() => copyToClipboard(sourceData?.content || '')}
                  className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>

                <button
                  onClick={() => setIsSourceOpen(false)}
                  className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-950/40 hover:border-red-500 transition"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Source Content */}
            <ScrollArea
              orientation="both"
              variant="auto"
              label="Source Content"
              className="flex-1 bg-slate-950"
            >
              <div
                ref={codeContainerRef}
                className="p-4 font-mono text-[12px] leading-relaxed"
              >
              {sourceLoading && (
                <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse text-sm">
                  Loading source file from substrate...
                </div>
              )}

              {sourceData?.error && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-red-300 text-sm">
                  <strong>Failed to read file:</strong> {sourceData.error}
                </div>
              )}

              {!sourceLoading && !sourceData?.error && sourceLines.length > 0 && (
                <div className="divide-y divide-slate-900/10">
                  {sourceLines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isHighlighted = targetHighlightLine === lineNum;
                    const matchesFilter =
                      sourceFilter.trim() !== '' &&
                      line.toLowerCase().includes(sourceFilter.toLowerCase());

                    return (
                      <div
                        key={lineNum}
                        data-line={lineNum}
                        className={`flex items-start transition ${
                          isHighlighted
                            ? 'bg-amber-500/25 border-l-4 border-amber-400 text-amber-100'
                            : matchesFilter
                            ? 'bg-sky-500/20 text-sky-200'
                            : 'text-slate-300 hover:bg-slate-900/60'
                        }`}
                      >
                        <span className="w-12 flex-shrink-0 select-none text-right pr-4 font-mono text-[11px] text-slate-600">
                          {lineNum}
                        </span>
                        <span className="flex-1 whitespace-pre font-mono overflow-x-auto">
                          {line || ' '}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-5 py-2.5 text-[11px] text-slate-500">
              <span>{sourceData?.loc} lines total</span>
              <span>{((sourceData?.sizeBytes || 0) / 1024).toFixed(1)} KB</span>
              <span className="text-emerald-400 font-semibold">Verified Substrate File • Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
