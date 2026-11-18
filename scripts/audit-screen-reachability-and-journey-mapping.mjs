#!/usr/bin/env node
/**
 * Screen Reachability, Island Detection & User Journey Mapping Analyzer
 * Grounded in:
 * - docs/architecture/navigation-mental-model.md
 * - docs/architecture/user-journey-orchestration.md
 * - docs/architecture/product-journey-catalog.md
 *
 * Answers two critical architectural questions:
 * 1. Which screens/floors were built but are NOT WIRED to anything (Ghost Components & Unreachable Island Routes)?
 * 2. How are the screens mapped to user journey flows, actors, and navigation spokes?
 */

import { readdirSync, readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { parse } from 'yaml';
import { WEB_ROUTES, MOBILE_ROUTES } from '../packages/core/src/routing/routeCatalog.generated.ts';

const ROOT = resolve(import.meta.dirname, '..');
const REPORT_JSON = join(ROOT, 'reports/screen-reachability-and-journey-mapping.json');
const REPORT_HTML = join(ROOT, 'reports/screen-reachability-and-journey-mapping.html');

function walkDir(dir, filter = () => true) {
  if (!existsSync(dir)) return [];
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', '.next', 'dist-explore'].includes(entry.name)) continue;
      files.push(...walkDir(full, filter));
    } else if (entry.isFile() && filter(full, entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// 1. INGEST PJC JOURNEY MAPPING
function ingestPjcJourneys() {
  const pjcDir = join(ROOT, 'packages/core/src/flows/pjc');
  const journeys = new Map();
  const screenToJourney = new Map();

  const files = readdirSync(pjcDir).filter((f) => f.endsWith('.yaml') && f !== 'pjc.catalog.yaml');

  for (const file of files) {
    try {
      const content = parse(readFileSync(join(pjcDir, file), 'utf-8'));
      if (!content || !content.id || !content.intents) continue;

      for (const intent of content.intents) {
        if (!intent.journeys) continue;
        for (const journey of intent.journeys) {
          const record = {
            id: journey.id,
            title: journey.title,
            featureId: content.id,
            intentId: intent.id,
            actor: intent.actor || 'user',
            situation: journey.situation,
            entryStep: journey.entry,
            steps: journey.steps || [],
            transitions: journey.transitions || [],
            integrationPoints: journey.development?.integrationPoints || [],
          };
          journeys.set(journey.id, record);

          for (const pt of record.integrationPoints) {
            const norm = pt.replace(/\\/g, '/');
            if (!screenToJourney.has(norm)) screenToJourney.set(norm, []);
            screenToJourney.get(norm).push(record);
          }
        }
      }
    } catch {}
  }

  return { journeys, screenToJourney };
}

// 2. FIND ALL BUILT SCREENS & FLOORS
function findBuiltScreens() {
  const screens = [];

  // Web Floors & Pages
  const webAppDir = join(ROOT, 'apps/gurudevi-web/app');
  const webFiles = walkDir(webAppDir, (_f, name) => name.endsWith('.tsx') && !name.includes('.test.'));
  for (const f of webFiles) {
    const rel = relative(ROOT, f).replace(/\\/g, '/');
    if (f.endsWith('Floor.tsx') || f.includes('Desk.tsx') || f.includes('Stage.tsx')) {
      screens.push({ path: rel, type: 'web_floor', name: f.split(/[/\\]/).pop().replace(/\.tsx$/, '') });
    } else if (f.endsWith('page.tsx')) {
      screens.push({ path: rel, type: 'web_page', name: f.split(/[/\\]/).pop().replace(/\.tsx$/, '') });
    }
  }

  // Mobile Screens
  const mobileAppDir = join(ROOT, 'apps/gurudevi-mobile/app');
  const mobileFiles = walkDir(mobileAppDir, (_f, name) => name.endsWith('.tsx') && !name.includes('.test.'));
  for (const f of mobileFiles) {
    const rel = relative(ROOT, f).replace(/\\/g, '/');
    screens.push({ path: rel, type: 'mobile_screen', name: f.split(/[/\\]/).pop().replace(/\.tsx$/, '') });
  }

  // Domain Package Screens (Admin, Classroom, UI)
  const pkgDirs = [
    join(ROOT, 'packages/admin/src'),
    join(ROOT, 'packages/classroom/src'),
    join(ROOT, 'packages/ui/src/screens'),
  ];
  for (const dir of pkgDirs) {
    const pkgFiles = walkDir(dir, (_f, name) => (name.endsWith('Screen.tsx') || name.endsWith('View.tsx')) && !name.includes('.test.'));
    for (const f of pkgFiles) {
      const rel = relative(ROOT, f).replace(/\\/g, '/');
      screens.push({ path: rel, type: 'package_screen', name: f.split(/[/\\]/).pop().replace(/\.tsx$/, '') });
    }
  }

  return screens;
}

// 3. CODEBASE AST & IN-DEGREE SCANNER
function scanCodebaseReferences() {
  const allSourceFiles = walkDir(ROOT, (path, name) => {
    return /\.(tsx?|mjs|js)$/.test(name) && !path.includes('routeCatalog.generated.ts') && !name.includes('.test.');
  });

  const fileContents = allSourceFiles.map((f) => ({
    file: relative(ROOT, f).replace(/\\/g, '/'),
    content: readFileSync(f, 'utf-8'),
  }));

  return fileContents;
}

function analyzeReachability(screens, { journeys, screenToJourney }, sources) {
  // A. Component Import In-Degree
  const analyzedScreens = screens.map((screen) => {
    const baseName = screen.name;
    const importers = [];

    for (const { file, content } of sources) {
      if (file === screen.path) continue; // Don't count self
      // Check import
      if (content.includes(baseName)) {
        importers.push(file);
      }
    }

    // Check PJC mapping
    let mappedJourneys = screenToJourney.get(screen.path) || [];
    if (mappedJourneys.length === 0) {
      const screenDir = dirname(screen.path).replace(/\\/g, '/');
      for (const [pt, jList] of screenToJourney.entries()) {
        if (dirname(pt).replace(/\\/g, '/') === screenDir) {
          mappedJourneys = jList;
          break;
        }
      }
    }

    let status = 'CONNECTED';
    if (importers.length === 0 && screen.type !== 'web_page') {
      status = 'GHOST_ISLAND'; // Built component with zero importers anywhere
    } else if (mappedJourneys.length === 0) {
      status = 'DARK_FEATURE'; // Imported/routed, but zero PJC journey attached
    } else {
      status = 'FLOW_MAPPED'; // Properly connected to code and spec
    }

    return {
      ...screen,
      inDegree: importers.length,
      importers: importers.slice(0, 5),
      status,
      mappedJourneys: mappedJourneys.map((j) => ({ id: j.id, title: j.title, actor: j.actor })),
    };
  });

  // B. Route In-Degree (Can a user actually navigate there?)
  const analyzedRoutes = [...WEB_ROUTES, ...MOBILE_ROUTES].map((route) => {
    const callers = [];
    const clean = route.replace(/^\/\(tabs\)\//, '/').replace(/\[.*?\]/g, '');

    for (const { file, content } of sources) {
      // Look for href, navigate, or path matching
      if (content.includes(`'${route}'`) || content.includes(`"${route}"`) || (clean.length > 2 && content.includes(`'${clean}'`))) {
        callers.push(file);
      }
    }

    const isIsland = callers.length === 0 && route !== '/' && route !== '/welcome';
    return {
      route,
      inDegree: callers.length,
      incomingCallers: callers.slice(0, 3),
      isIsland,
    };
  });

  const ghostScreens = analyzedScreens.filter((s) => s.status === 'GHOST_ISLAND');
  const islandRoutes = analyzedRoutes.filter((r) => r.isIsland);
  const flowMappedScreens = analyzedScreens.filter((s) => s.status === 'FLOW_MAPPED');
  const darkScreens = analyzedScreens.filter((s) => s.status === 'DARK_FEATURE');

  return {
    metrics: {
      totalScreensBuilt: screens.length,
      ghostScreensCount: ghostScreens.length,
      flowMappedCount: flowMappedScreens.length,
      darkScreensCount: darkScreens.length,
      totalRoutesCataloged: analyzedRoutes.length,
      islandRoutesCount: islandRoutes.length,
    },
    ghostScreens,
    islandRoutes,
    flowMappedScreens,
    darkScreens,
    allScreens: analyzedScreens,
    allRoutes: analyzedRoutes,
  };
}

function generateHtml(report) {
  const m = report.metrics;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Screen Reachability & User Journey Mapping Matrix</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b1120; color: #f8fafc; margin: 0; padding: 2rem; }
    h1 { color: #38bdf8; font-size: 1.8rem; margin-bottom: 0.25rem; }
    h2 { color: #94a3b8; font-size: 1.25rem; margin-top: 2rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .badge.green { background: #065f46; color: #34d399; }
    .badge.amber { background: #854d0e; color: #fde047; }
    .badge.red { background: #991b1b; color: #f87171; }
    .badge.purple { background: #581c87; color: #d8b4fe; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .card { background: #1e293b; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid #334155; }
    .card-val { font-size: 2rem; font-weight: 700; color: #f1f5f9; }
    .card-lbl { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: #1e293b; border-radius: 0.5rem; overflow: hidden; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #334155; font-size: 0.9rem; }
    th { background: #0f172a; color: #94a3b8; font-weight: 600; }
    tr:last-child td { border-bottom: none; }
    .code-tag { font-family: monospace; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; color: #e2e8f0; font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>Screen Reachability & User Journey Mapping Matrix</h1>
  <p style="color: #94a3b8;">Topology of Built Screens: Ghost Islands, Unreachable Routes, and FlowDAG Bindings</p>

  <h2>1. Screen Topology Summary</h2>
  <div class="grid">
    <div class="card">
      <div class="card-val">${m.totalScreensBuilt}</div>
      <div class="card-lbl">Total Built Screens / Floors</div>
      <span class="badge purple">Physical Substrate</span>
    </div>
    <div class="card">
      <div class="card-val">${m.flowMappedCount}</div>
      <div class="card-lbl">Flow-Mapped Screens (PJC Bound)</div>
      <span class="badge green">Traceable</span>
    </div>
    <div class="card">
      <div class="card-val">${m.ghostScreensCount}</div>
      <div class="card-lbl">Ghost Screens (Zero Importers)</div>
      <span class="badge red">Dead Code Island</span>
    </div>
    <div class="card">
      <div class="card-val">${m.islandRoutesCount}</div>
      <div class="card-lbl">Unreachable Island Routes (In-Degree 0)</div>
      <span class="badge amber">No Incoming Links</span>
    </div>
  </div>

  <h2>2. Ghost Screens: Built Components Never Imported Anywhere (${m.ghostScreensCount})</h2>
  <table>
    <thead>
      <tr><th>Component</th><th>File Path</th><th>Type</th><th>Diagnosis</th></tr>
    </thead>
    <tbody>
      ${report.ghostScreens
        .map(
          (s) => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td><span class="code-tag">${s.path}</span></td>
          <td>${s.type}</td>
          <td><span class="badge red">Zero Importers (Unwired)</span></td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>3. Unreachable Island Routes (Routes in Catalog With ZERO Incoming Links: ${m.islandRoutesCount})</h2>
  <table>
    <thead>
      <tr><th>Route URL</th><th>In-Degree</th><th>Diagnosis</th></tr>
    </thead>
    <tbody>
      ${report.islandRoutes
        .map(
          (r) => `
        <tr>
          <td><span class="code-tag">${r.route}</span></td>
          <td>0 callers</td>
          <td><span class="badge amber">Unreachable via UI Navigation</span></td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>4. Flow-Mapped Screens (Connected to PJC User Journeys: ${m.flowMappedCount})</h2>
  <table>
    <thead>
      <tr><th>Screen</th><th>Mapped Journey</th><th>Actor</th></tr>
    </thead>
    <tbody>
      ${report.flowMappedScreens
        .map(
          (s) => `
        <tr>
          <td><span class="code-tag">${s.path}</span></td>
          <td>${s.mappedJourneys.map((j) => `<div><strong>${j.title}</strong> (${j.id})</div>`).join('')}</td>
          <td>${s.mappedJourneys.map((j) => `<span class="badge green">${j.actor}</span>`).join(' ')}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}

function main() {
  console.log(`\n===============================================================`);
  console.log(`  SCREEN REACHABILITY & USER JOURNEY MAPPING ANALYZER`);
  console.log(`===============================================================\n`);

  const pjc = ingestPjcJourneys();
  const screens = findBuiltScreens();
  const sources = scanCodebaseReferences();
  const report = analyzeReachability(screens, pjc, sources);
  const m = report.metrics;

  console.log(`▶ 1. SCREEN INVENTORY & TOPOLOGY:`);
  console.log(`  • Total Built Screens/Floors: ${m.totalScreensBuilt}`);
  console.log(`  • 🟢 Flow-Mapped to PJC Journeys: ${m.flowMappedCount}`);
  console.log(`  • 🟡 Dark Features (Imported but No PJC): ${m.darkScreensCount}`);
  console.log(`  • 🔴 Ghost Islands (Built with ZERO Importers): ${m.ghostScreensCount}`);

  console.log(`\n▶ 2. ROUTE NAVIGATION REACHABILITY:`);
  console.log(`  • Total Routes Cataloged: ${m.totalRoutesCataloged}`);
  console.log(`  • 🟠 Unreachable Island Routes (Zero In-Degree): ${m.islandRoutesCount}`);

  console.log(`\n===============================================================`);
  console.log(`  TOP GHOST SCREENS (Built Components Never Imported Anywhere):`);
  console.log(`===============================================================`);
  report.ghostScreens.slice(0, 10).forEach((s) => {
    console.log(`  🔴 [${s.type}] ${s.name} -> ${s.path}`);
  });
  if (report.ghostScreens.length > 10) {
    console.log(`  ...and ${report.ghostScreens.length - 10} more ghost screens.`);
  }

  console.log(`\n===============================================================`);
  console.log(`  TOP UNREACHABLE ISLAND ROUTES (Zero Incoming Links Across UI):`);
  console.log(`===============================================================`);
  report.islandRoutes.slice(0, 12).forEach((r) => {
    console.log(`  🟠 Route: ${r.route}`);
  });
  if (report.islandRoutes.length > 12) {
    console.log(`  ...and ${report.islandRoutes.length - 12} more unreachable routes.`);
  }

  // Write reports
  mkdirSync(dirname(REPORT_JSON), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✔ JSON Report saved to: ${REPORT_JSON}`);

  const html = generateHtml(report);
  writeFileSync(REPORT_HTML, html, 'utf-8');
  console.log(`✔ Interactive HTML Report saved to: ${REPORT_HTML}`);
  console.log(`\n===============================================================\n`);
}

main();
