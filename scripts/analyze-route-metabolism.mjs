/**
 * analyze-route-metabolism.mjs
 * Static Route Metabolism & Actuator Seam Analyzer
 * Scans route entrypoints across apps/gurudevi-mobile/app and apps/gurudevi-web/app,
 * computes static metabolic indicators, audits Verger lever bindings,
 * and generates packages/core/src/routing/routeMetabolic.generated.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const MOBILE_APP_DIR = path.join(REPO_ROOT, 'apps/gurudevi-mobile/app');
const WEB_APP_DIR = path.join(REPO_ROOT, 'apps/gurudevi-web/app');
const OUTPUT_FILE = path.join(REPO_ROOT, 'packages/core/src/routing/routeMetabolic.generated.json');

const CODE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const RESOLVE_EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];

// Indicators & weights
const GPU_MARKERS = [
  { name: '@shopify/react-native-skia', pattern: /@shopify\/react-native-skia/i },
  { name: 'Canvas', pattern: /\bCanvas\b|<\s*Canvas\b|\bHTMLCanvasElement\b|\bcanvas\b/ },
  { name: 'Skia', pattern: /\bSkia\b/ },
  { name: 'BlurView', pattern: /\bBlurView\b/ },
  { name: 'LinearGradient', pattern: /\bLinearGradient\b/ },
  { name: 'runtimeShader', pattern: /\bruntimeShader\b/i },
  { name: 'Three', pattern: /\b(?:Three|THREE)\b/ },
  { name: 'particle', pattern: /\bparticles?\b/i },
];

const MOTION_MARKERS = [
  { name: 'useAnimatedStyle', pattern: /\buseAnimatedStyle\b/ },
  { name: 'useFrameCallback', pattern: /\buseFrameCallback\b/ },
  { name: 'withRepeat', pattern: /\bwithRepeat\b/ },
  { name: 'GestureDetector', pattern: /\bGestureDetector\b/ },
  { name: 'withSpring', pattern: /\bwithSpring\b/ },
];

const VIRTUALIZATION_MARKERS = [
  { name: 'FlashList', pattern: /\bFlashList\b/ },
  { name: 'FlatList', pattern: /\bFlatList\b/ },
  { name: 'LegendList', pattern: /\bLegendList\b/ },
  { name: 'SovereignVirtualList', pattern: /\bSovereignVirtualList\b/ },
];

const UNVIRTUALIZED_LOOP_PATTERN = /\.map\s*\(\s*(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>\s*(?:<|\()/;
const UNSELECTED_STORE_PATTERN = /\buse[A-Za-z0-9]*Store\s*\(\s*\)/;

// Direct levers and horizontal governed façades
const GOVERNED_INDICATORS = [
  { name: 'useLeverLevel', pattern: /\buseLeverLevel\s*\(/ },
  { name: 'useVisualCapabilities', pattern: /\buseVisualCapabilities\s*\(/ },
  { name: 'useVergerSnapshot', pattern: /\buseVergerSnapshot\s*\(/ },
  { name: 'useVerger', pattern: /\buseVerger\s*\(/ },
  { name: 'SovereignVirtualList', pattern: /\bSovereignVirtualList\b/ },
  { name: 'WorkspaceWallpaper', pattern: /\bWorkspaceWallpaper\b/ },
  { name: 'SkiaGlowAura', pattern: /\bSkiaGlowAura\b/ },
  { name: 'WaitingSign', pattern: /\bWaitingSign\b/ },
  { name: 'Waiting', pattern: /\bWaiting\b/ },
  { name: 'LotusPetalFAB', pattern: /\bLotusPetalFAB\b/ },
  { name: 'Skeleton', pattern: /\bSkeleton\b/ },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (CODE_EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function resolveImportPath(importerFile, importSpecifier, platform) {
  if (importSpecifier.startsWith('.')) {
    const base = path.resolve(path.dirname(importerFile), importSpecifier);
    for (const ext of RESOLVE_EXTENSIONS) {
      const candidate = base + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
    return null;
  }

  if (importSpecifier.startsWith('@/')) {
    const sub = importSpecifier.slice(2);
    const base = platform === 'mobile'
      ? path.join(REPO_ROOT, 'apps/gurudevi-mobile/src', sub)
      : path.join(REPO_ROOT, 'apps/gurudevi-web', sub);
    for (const ext of RESOLVE_EXTENSIONS) {
      const candidate = base + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
    return null;
  }

  if (importSpecifier.startsWith('@repo/')) {
    const parts = importSpecifier.split('/');
    const pkgName = parts[1];
    const subPath = parts.slice(2).join('/');
    const pkgBase = path.join(REPO_ROOT, 'packages', pkgName, 'src', subPath);
    for (const ext of RESOLVE_EXTENSIONS) {
      const candidate = pkgBase + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
    return null;
  }

  return null;
}

function extractImports(source) {
  const imports = [];
  const staticImportExportRegex = /(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = staticImportExportRegex.exec(source)) !== null) {
    imports.push(match[1]);
  }
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(source)) !== null) {
    imports.push(match[1]);
  }
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(source)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function collectRouteComponentTree(entryFile, platform, maxDepth = 4) {
  const visited = new Set([entryFile]);
  const queue = [{ file: entryFile, depth: 0 }];

  while (queue.length > 0) {
    const { file, depth } = queue.shift();
    if (depth >= maxDepth) continue;

    let content = '';
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const specifiers = extractImports(content);
    for (const spec of specifiers) {
      const resolved = resolveImportPath(file, spec, platform);
      if (resolved && !visited.has(resolved) && !resolved.includes('node_modules')) {
        visited.add(resolved);
        queue.push({ file: resolved, depth: depth + 1 });
      }
    }
  }

  return Array.from(visited);
}

function analyzeRouteFiles(files) {
  const foundGpuMarkers = new Set();
  const foundMotionMarkers = new Set();
  const foundListMarkers = new Set();
  const foundGovernedMarkers = new Set();
  let totalJsxTags = 0;
  let totalLines = 0;
  let unvirtualizedLoopCount = 0;
  let unselectedStoreCount = 0;

  for (const file of files) {
    let content = '';
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    totalLines += content.split('\n').length;

    // Check GPU markers
    for (const marker of GPU_MARKERS) {
      if (marker.pattern.test(content)) {
        foundGpuMarkers.add(marker.name);
      }
    }

    // Check Motion markers
    for (const marker of MOTION_MARKERS) {
      if (marker.pattern.test(content)) {
        foundMotionMarkers.add(marker.name);
      }
    }

    // Check Virtualization markers
    for (const marker of VIRTUALIZATION_MARKERS) {
      if (marker.pattern.test(content)) {
        foundListMarkers.add(marker.name);
      }
    }

    // Check Governed markers (levers, VisualCapabilities, governed primitives)
    for (const marker of GOVERNED_INDICATORS) {
      if (marker.pattern.test(content)) {
        foundGovernedMarkers.add(marker.name);
      }
    }

    // Check Unvirtualized Loops
    if (UNVIRTUALIZED_LOOP_PATTERN.test(content)) {
      unvirtualizedLoopCount++;
    }

    // Check Unselected Stores
    if (UNSELECTED_STORE_PATTERN.test(content)) {
      unselectedStoreCount++;
    }

    // Count JSX elements roughly
    const tags = content.match(/<[A-Za-z][A-Za-z0-9_.]*(?:[\s>/]|$)/g);
    if (tags) {
      totalJsxTags += tags.length;
    }
  }

  const isComplex = totalJsxTags >= 20 || totalLines >= 300;

  // Weight calculations:
  // GPU markers: weight +30
  // Motion/Worklet markers: weight +20
  // Virtualization/List markers: weight +15
  // Unvirtualized loop penalty: weight +20 (high risk of jank)
  // Unselected store penalty: weight +10 (cascade re-renders)
  // Component tree complexity: weight +10
  const gpuWeight = foundGpuMarkers.size > 0 ? 30 : 0;
  const motionWeight = foundMotionMarkers.size > 0 ? 20 : 0;
  const listWeight = foundListMarkers.size > 0 ? 15 : 0;
  const unvirtualizedLoopWeight = unvirtualizedLoopCount > 0 ? 20 : 0;
  const unselectedStoreWeight = unselectedStoreCount > 0 ? 10 : 0;
  const complexityWeight = isComplex ? 10 : 0;

  // Additional weight for multiple dense indicators (e.g. multi-GPU or multi-motion)
  const densityBonus = Math.min(15, Math.max(0, (foundGpuMarkers.size - 1) * 5) + Math.max(0, (foundMotionMarkers.size - 1) * 3));

  const totalScore = gpuWeight + motionWeight + listWeight + unvirtualizedLoopWeight + unselectedStoreWeight + complexityWeight + densityBonus;

  // Intensity & intent determination
  let intensity = 'nominal';
  let intent;
  let transitionDwellMs = 200;

  const gpuDominates = foundGpuMarkers.size > 0 && (gpuWeight >= motionWeight);

  if (totalScore >= 75) {
    intensity = 'intensive';
    intent = gpuDominates ? 'canvas-mount' : 'heavy-navigation';
    transitionDwellMs = gpuDominates ? 600 : 500;
  } else if (totalScore >= 40) {
    intensity = 'heavy';
    intent = gpuDominates ? 'canvas-mount' : 'heavy-navigation';
    transitionDwellMs = gpuDominates ? 500 : 400;
  } else {
    intensity = 'nominal';
    transitionDwellMs = 200;
  }

  const leversConsumed = foundGovernedMarkers.size;
  const isUnregulatedSink = (intensity === 'heavy' || intensity === 'intensive') && leversConsumed === 0;

  return {
    intensity,
    intent,
    transitionDwellMs,
    score: totalScore,
    breakdown: {
      gpu: Array.from(foundGpuMarkers),
      motion: Array.from(foundMotionMarkers),
      virtualization: Array.from(foundListMarkers),
      governed: Array.from(foundGovernedMarkers),
      unvirtualizedLoops: unvirtualizedLoopCount,
      unselectedStores: unselectedStoreCount,
      complexity: isComplex,
      totalJsxTags,
      totalLines,
    },
    leversBound: leversConsumed,
    unregulatedSink: isUnregulatedSink,
  };
}

function discoverMobileRoutes() {
  const files = walk(MOBILE_APP_DIR);
  const routes = [];

  for (const file of files) {
    const rel = path.relative(MOBILE_APP_DIR, file).replace(/\\/g, '/');
    const basename = path.basename(rel);

    // Skip Expo layout & native intent files
    if (basename.startsWith('_') || basename.startsWith('+')) continue;
    if (basename.includes('.test.') || basename.includes('.spec.')) continue;

    // Remove file extension
    const ext = path.extname(rel);
    let routePath = rel.slice(0, -ext.length);

    // Filter out route groups e.g. (tabs), (modal), (dev)
    const segments = routePath.split('/').filter((s) => !/^\([^/]+\)$/.test(s));

    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'index')) {
      routePath = '/';
    } else {
      if (segments[segments.length - 1] === 'index') {
        segments.pop();
      }
      routePath = `/${segments.join('/')}`;
    }

    routes.push({
      route: routePath,
      file,
      platform: 'mobile',
    });
  }

  return routes;
}

function discoverWebRoutes() {
  const files = walk(WEB_APP_DIR);
  const routes = [];

  for (const file of files) {
    const rel = path.relative(WEB_APP_DIR, file).replace(/\\/g, '/');
    const basename = path.basename(rel);

    // In Next.js App router, only page files are route endpoints
    if (!/^page\.(tsx|jsx|ts|js)$/.test(basename)) continue;

    const dirRel = path.dirname(rel);
    const rawSegments = dirRel === '.' ? [] : dirRel.split('/');
    const segments = rawSegments.filter((s) => !/^\([^/]+\)$/.test(s));

    let routePath = '/';
    if (segments.length > 0) {
      routePath = `/${segments.join('/')}`;
    }

    routes.push({
      route: routePath,
      file,
      platform: 'web',
    });
  }

  return routes;
}

export function analyzeAllRoutes() {
  console.log('[analyze-route-metabolism] Scanning route entrypoints...');
  const mobileRoutes = discoverMobileRoutes();
  const webRoutes = discoverWebRoutes();

  console.log(`[analyze-route-metabolism] Found ${mobileRoutes.length} mobile routes and ${webRoutes.length} web routes.`);

  const routeLedger = {};
  const unregulatedWarnings = [];

  // Process mobile routes
  const processedMobile = [];
  for (const item of mobileRoutes) {
    const tree = collectRouteComponentTree(item.file, 'mobile');
    const analysis = analyzeRouteFiles(tree);
    processedMobile.push({ ...item, tree, analysis });
  }

  // Process web routes
  const processedWeb = [];
  for (const item of webRoutes) {
    const tree = collectRouteComponentTree(item.file, 'web');
    const analysis = analyzeRouteFiles(tree);
    processedWeb.push({ ...item, tree, analysis });
  }

  // Collect all unique canonical route paths
  const allRoutePaths = new Set([
    ...processedMobile.map((m) => m.route),
    ...processedWeb.map((w) => w.route),
  ]);

  for (const routePath of Array.from(allRoutePaths).sort()) {
    const mobileMatches = processedMobile.filter((m) => m.route === routePath);
    const webMatches = processedWeb.filter((w) => w.route === routePath);

    // Merge analysis: choose highest score
    let dominantAnalysis = null;
    let dominantPlatform = null;

    for (const m of mobileMatches) {
      if (!dominantAnalysis || m.analysis.score > dominantAnalysis.score) {
        dominantAnalysis = m.analysis;
        dominantPlatform = 'mobile';
      }
    }
    for (const w of webMatches) {
      if (!dominantAnalysis || w.analysis.score > dominantAnalysis.score) {
        dominantAnalysis = w.analysis;
        dominantPlatform = 'web';
      }
    }

    if (!dominantAnalysis) continue;

    if (dominantAnalysis.unregulatedSink) {
      const warnMsg = `UNREGULATED_METABOLIC_SINK: Route ${routePath} has high complexity but binds 0 Verger levers`;
      unregulatedWarnings.push(warnMsg);
    }

    routeLedger[routePath] = {
      intensity: dominantAnalysis.intensity,
      intent: dominantAnalysis.intent,
      transitionDwellMs: dominantAnalysis.transitionDwellMs,
      score: dominantAnalysis.score,
      dominantPlatform,
      breakdown: dominantAnalysis.breakdown,
      leversBound: dominantAnalysis.leversBound,
      unregulatedSink: dominantAnalysis.unregulatedSink,
      sources: [
        ...mobileMatches.map((m) => path.relative(REPO_ROOT, m.file).replace(/\\/g, '/')),
        ...webMatches.map((w) => path.relative(REPO_ROOT, w.file).replace(/\\/g, '/')),
      ],
    };
  }

  const generatedOutput = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    routeCount: Object.keys(routeLedger).length,
    unregulatedSinkCount: unregulatedWarnings.length,
    routes: routeLedger,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(generatedOutput, null, 2) + '\n', 'utf8');
  console.log(`[analyze-route-metabolism] Written static ledger to ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);

  console.log('\n--- METABOLIC ROUTING AUDIT SUMMARY ---');
  console.log(`Total Routes Scanned: ${Object.keys(routeLedger).length}`);
  const heavyCount = Object.values(routeLedger).filter((r) => r.intensity === 'heavy' || r.intensity === 'intensive').length;
  const nominalCount = Object.values(routeLedger).filter((r) => r.intensity === 'nominal').length;
  console.log(`Nominal Routes: ${nominalCount}`);
  console.log(`Heavy/Intensive Routes: ${heavyCount}`);

  if (unregulatedWarnings.length > 0) {
    console.log(`\n[WARNING] ${unregulatedWarnings.length} UNREGULATED METABOLIC SINKS DETECTED:`);
    for (const warning of unregulatedWarnings) {
      console.warn(`  ⚠️  ${warning}`);
    }
  } else {
    console.log('\n[PASS] All heavy routes correctly bind Verger metabolic levers.');
  }

  return { routeLedger, unregulatedWarnings };
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  analyzeAllRoutes();
}
