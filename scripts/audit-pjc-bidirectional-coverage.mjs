#!/usr/bin/env node
/**
 * Bidirectional PJC <-> Code Conformance & Reverse Coverage Analyzer
 * Grounded in:
 * - docs/architecture/product-journey-catalog.md
 * - packages/core/src/flows/pjc/*.yaml
 * - packages/core/src/routing/routeCatalog.generated.ts
 *
 * Performs vice-versa comparison:
 * 1. PJC -> Code: Are declared PJC features, journeys, and bindings backed by real physical code?
 * 2. Code -> PJC: What percentage of implemented routes, screens, and components have NO PJC catalog entry (Orphan / Dark functionality)?
 */

import { readdirSync, readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { parse } from 'yaml';
import { WEB_ROUTES, MOBILE_ROUTES } from '../packages/core/src/routing/routeCatalog.generated.ts';

const ROOT = resolve(import.meta.dirname, '..');
const PJC_DIR = join(ROOT, 'packages/core/src/flows/pjc');
const REPORT_JSON = join(ROOT, 'reports/pjc-bidirectional-coverage.json');
const REPORT_HTML = join(ROOT, 'reports/pjc-bidirectional-coverage.html');

// Helper to recursively walk a directory
function walkDir(dir, filter = () => true) {
  if (!existsSync(dir)) return [];
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full, filter));
    } else if (entry.isFile() && filter(full, entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// 1. INGEST PJC CATALOG
function ingestPjcCatalog() {
  const pjc = {
    features: new Map(),
    intents: new Map(),
    journeys: new Map(),
    steps: new Map(),
    bindings: [],
    integrationPoints: new Map(), // filePath -> [journeyId]
    referencedRoutes: new Set(),
  };

  const files = readdirSync(PJC_DIR).filter((f) => f.endsWith('.yaml') && f !== 'pjc.catalog.yaml');

  for (const file of files) {
    try {
      const content = parse(readFileSync(join(PJC_DIR, file), 'utf-8'));
      if (!content || !content.id) continue;

      pjc.features.set(content.id, {
        id: content.id,
        title: content.title || content.id,
        maturity: content.lifecycle?.maturity || 'unknown',
        owner: content.lifecycle?.owner || 'unassigned',
        catalogFile: file,
      });

      if (!content.intents) continue;

      for (const intent of content.intents) {
        pjc.intents.set(intent.id, {
          id: intent.id,
          title: intent.title,
          actor: intent.actor,
          featureId: content.id,
        });

        if (!intent.journeys) continue;

        for (const journey of intent.journeys) {
          const journeyRecord = {
            id: journey.id,
            title: journey.title,
            situation: journey.situation,
            featureId: content.id,
            intentId: intent.id,
            stepsCount: journey.steps?.length || 0,
            integrationPoints: journey.development?.integrationPoints || [],
            bindings: journey.bindings || [],
            invariants: journey.development?.invariants || [],
            scenarios: journey.scenarios?.map((s) => s.id) || [],
          };

          pjc.journeys.set(journey.id, journeyRecord);

          // Index steps
          if (Array.isArray(journey.steps)) {
            for (const step of journey.steps) {
              pjc.steps.set(step.id, {
                id: step.id,
                title: step.title,
                interaction: step.interaction,
                journeyId: journey.id,
              });
            }
          }

          // Index Integration Points
          for (const rawPt of journeyRecord.integrationPoints) {
            const normPt = rawPt.replace(/\\/g, '/');
            if (!pjc.integrationPoints.has(normPt)) {
              pjc.integrationPoints.set(normPt, []);
            }
            pjc.integrationPoints.get(normPt).push(journey.id);

            // Infer route if applicable
            const match = normPt.match(/apps\/gurudevi-web\/app\/\(sanctuary\)\/([^/]+)/);
            if (match) {
              pjc.referencedRoutes.add(`/${match[1]}`);
            }
          }

          // Index Bindings
          for (const rawBinding of journeyRecord.bindings) {
            const normRef = rawBinding.reference ? rawBinding.reference.replace(/\\/g, '/') : null;
            const exists = normRef ? existsSync(join(ROOT, normRef)) : false;

            pjc.bindings.push({
              id: rawBinding.id,
              journeyId: journey.id,
              reference: normRef,
              category: rawBinding.category || 'unknown',
              status: rawBinding.status || 'unknown',
              existsOnDisk: exists,
            });

            if (normRef) {
              if (!pjc.integrationPoints.has(normRef)) {
                pjc.integrationPoints.set(normRef, []);
              }
              pjc.integrationPoints.get(normRef).push(journey.id);

              const match = normRef.match(/apps\/gurudevi-web\/app\/\(sanctuary\)\/([^/]+)/);
              if (match) {
                pjc.referencedRoutes.add(`/${match[1]}`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[PJC Ingest] Error in ${file}: ${err.message}`);
    }
  }

  return pjc;
}

// 2. INGEST CODEBASE SURFACES
function ingestCodeSurfaces() {
  const code = {
    webRoutes: [...WEB_ROUTES],
    mobileRoutes: [...MOBILE_ROUTES],
    webFloors: [],
    webPages: [],
    mobileScreens: [],
  };

  // Find all Web Floor components
  const webAppDir = join(ROOT, 'apps/gurudevi-web/app');
  const webFiles = walkDir(webAppDir, (_f, name) => name.endsWith('.tsx') && !name.includes('.test.'));
  
  for (const f of webFiles) {
    const rel = relative(ROOT, f).replace(/\\/g, '/');
    if (f.endsWith('Floor.tsx') || f.includes('Desk.tsx') || f.includes('Stage.tsx')) {
      code.webFloors.push(rel);
    }
    if (f.endsWith('page.tsx')) {
      code.webPages.push(rel);
    }
  }

  // Find all Mobile Screen files
  const mobileAppDir = join(ROOT, 'apps/gurudevi-mobile/app');
  const mobileFiles = walkDir(mobileAppDir, (_f, name) => name.endsWith('.tsx') && !name.includes('.test.'));
  for (const f of mobileFiles) {
    const rel = relative(ROOT, f).replace(/\\/g, '/');
    code.mobileScreens.push(rel);
  }

  return code;
}

// 3. BIDIRECTIONAL ANALYSIS
function analyzeCoverage(pjc, code) {
  // --- DIRECTION A: PJC -> Code (Spec Implementation & Integrity) ---
  const validBindings = pjc.bindings.filter((b) => b.existsOnDisk);
  const brokenBindings = pjc.bindings.filter((b) => !b.existsOnDisk);

  const journeysWithCode = [];
  const journeysWithoutCode = [];

  for (const [id, journey] of pjc.journeys.entries()) {
    const allRefs = [...journey.integrationPoints, ...journey.bindings.map((b) => b.reference).filter(Boolean)];
    const existingRefs = allRefs.filter((r) => existsSync(join(ROOT, r)));

    if (existingRefs.length > 0) {
      journeysWithCode.push({ id, title: journey.title, referencesCount: allRefs.length, existingCount: existingRefs.length });
    } else {
      journeysWithoutCode.push({ id, title: journey.title, totalReferences: allRefs.length });
    }
  }

  // --- DIRECTION B: Code -> PJC (Dark Feature & Orphan Detection) ---
  // Helper to check if a route is covered by PJC
  const isWebRouteCovered = (route) => {
    // Exact or prefix match with referenced routes
    for (const refRoute of pjc.referencedRoutes) {
      if (route === refRoute || route.startsWith(`${refRoute}/`)) return true;
    }
    // Check if route name appears in any integration point or step text
    const cleanName = route.replace(/^\//, '').split('/')[0];
    if (!cleanName || cleanName === '') return false;
    for (const [pt] of pjc.integrationPoints.entries()) {
      if (pt.includes(cleanName)) return true;
    }
    return false;
  };

  const coveredWebRoutes = code.webRoutes.filter(isWebRouteCovered);
  const orphanWebRoutes = code.webRoutes.filter((r) => !isWebRouteCovered(r));

  const isMobileRouteCovered = (route) => {
    const clean = route.replace(/^\/\(tabs\)\//, '').replace(/^\//, '').split('/')[0];
    if (!clean) return false;
    for (const [pt] of pjc.integrationPoints.entries()) {
      if (pt.toLowerCase().includes(clean.toLowerCase())) return true;
    }
    return false;
  };

  const coveredMobileRoutes = code.mobileRoutes.filter(isMobileRouteCovered);
  const orphanMobileRoutes = code.mobileRoutes.filter((r) => !isMobileRouteCovered(r));

  // Check Web Floor components
  const coveredFloors = [];
  const orphanFloors = [];

  for (const floorPath of code.webFloors) {
    const floorDir = dirname(floorPath).replace(/\\/g, '/');
    let matchedJourneys = pjc.integrationPoints.get(floorPath);

    if (!matchedJourneys) {
      for (const [pt, journeys] of pjc.integrationPoints.entries()) {
        const ptDir = dirname(pt).replace(/\\/g, '/');
        if (floorDir === ptDir || floorPath.startsWith(ptDir) || pt.startsWith(floorDir)) {
          matchedJourneys = journeys;
          break;
        }
      }
    }

    if (matchedJourneys) {
      coveredFloors.push({ path: floorPath, journeys: matchedJourneys });
    } else {
      orphanFloors.push(floorPath);
    }
  }

  return {
    metrics: {
      pjcFeaturesCount: pjc.features.size,
      pjcIntentsCount: pjc.intents.size,
      pjcJourneysCount: pjc.journeys.size,
      pjcStepsCount: pjc.steps.size,
      pjcTotalBindings: pjc.bindings.length,
      pjcValidBindings: validBindings.length,
      pjcBrokenBindings: brokenBindings.length,
      pjcBindingIntegrityPercent: ((validBindings.length / (pjc.bindings.length || 1)) * 100).toFixed(1),

      totalWebRoutes: code.webRoutes.length,
      coveredWebRoutesCount: coveredWebRoutes.length,
      orphanWebRoutesCount: orphanWebRoutes.length,
      webRoutePjcCoveragePercent: ((coveredWebRoutes.length / (code.webRoutes.length || 1)) * 100).toFixed(1),

      totalMobileRoutes: code.mobileRoutes.length,
      coveredMobileRoutesCount: coveredMobileRoutes.length,
      orphanMobileRoutesCount: orphanMobileRoutes.length,
      mobileRoutePjcCoveragePercent: ((coveredMobileRoutes.length / (code.mobileRoutes.length || 1)) * 100).toFixed(1),

      totalWebFloors: code.webFloors.length,
      coveredWebFloorsCount: coveredFloors.length,
      orphanWebFloorsCount: orphanFloors.length,
      webFloorCoveragePercent: ((coveredFloors.length / (code.webFloors.length || 1)) * 100).toFixed(1),
    },
    directionA_SpecToCode: {
      journeysWithCode,
      journeysWithoutCode,
      brokenBindings,
    },
    directionB_CodeToSpec: {
      coveredWebRoutes,
      orphanWebRoutes,
      coveredMobileRoutes,
      orphanMobileRoutes,
      coveredFloors,
      orphanFloors,
    },
  };
}

function generateHtml(report) {
  const m = report.metrics;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PJC Bidirectional Conformance & Reverse Coverage Matrix</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b1120; color: #f8fafc; margin: 0; padding: 2rem; }
    h1 { color: #38bdf8; font-size: 1.8rem; margin-bottom: 0.25rem; }
    h2 { color: #94a3b8; font-size: 1.25rem; margin-top: 2rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .badge.success { background: #065f46; color: #34d399; }
    .badge.warn { background: #854d0e; color: #fde047; }
    .badge.danger { background: #991b1b; color: #f87171; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .card { background: #1e293b; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid #334155; }
    .card-val { font-size: 2rem; font-weight: 700; color: #f1f5f9; }
    .card-lbl { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: #1e293b; border-radius: 0.5rem; overflow: hidden; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #334155; font-size: 0.9rem; }
    th { background: #0f172a; color: #94a3b8; font-weight: 600; }
    tr:last-child td { border-bottom: none; }
    .code-tag { font-family: monospace; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; color: #e2e8f0; }
  </style>
</head>
<body>
  <h1>PJC Bidirectional Conformance & Coverage Matrix</h1>
  <p style="color: #94a3b8;">Vice-Versa Analysis: Spec ➔ Code Traceability & Code ➔ Spec Dark Feature Detection</p>

  <h2>1. Executive Summary & Coverage Metrics</h2>
  <div class="grid">
    <div class="card">
      <div class="card-val">${m.webRoutePjcCoveragePercent}%</div>
      <div class="card-lbl">Web Routes with PJC (${m.coveredWebRoutesCount} / ${m.totalWebRoutes})</div>
      <span class="badge ${parseFloat(m.webRoutePjcCoveragePercent) > 60 ? 'success' : 'warn'}">Code ➔ Spec</span>
    </div>
    <div class="card">
      <div class="card-val">${m.mobileRoutePjcCoveragePercent}%</div>
      <div class="card-lbl">Mobile Routes with PJC (${m.coveredMobileRoutesCount} / ${m.totalMobileRoutes})</div>
      <span class="badge ${parseFloat(m.mobileRoutePjcCoveragePercent) > 60 ? 'success' : 'warn'}">Code ➔ Spec</span>
    </div>
    <div class="card">
      <div class="card-val">${m.webFloorCoveragePercent}%</div>
      <div class="card-lbl">Web Floor Components with PJC (${m.coveredWebFloorsCount} / ${m.totalWebFloors})</div>
      <span class="badge ${parseFloat(m.webFloorCoveragePercent) > 60 ? 'success' : 'danger'}">Code ➔ Spec</span>
    </div>
    <div class="card">
      <div class="card-val">${m.pjcBindingIntegrityPercent}%</div>
      <div class="card-lbl">PJC Binding Integrity (${m.pjcValidBindings} / ${m.pjcTotalBindings})</div>
      <span class="badge ${parseFloat(m.pjcBindingIntegrityPercent) > 80 ? 'success' : 'warn'}">Spec ➔ Code</span>
    </div>
  </div>

  <h2>2. Dark Features: Implemented Web Routes With NO PJC Attached (${m.orphanWebRoutesCount})</h2>
  <table>
    <thead>
      <tr><th>Uncataloged Web Route</th><th>Status</th><th>Recommended Action</th></tr>
    </thead>
    <tbody>
      ${report.directionB_CodeToSpec.orphanWebRoutes
        .map(
          (r) => `
        <tr>
          <td><span class="code-tag">${r}</span></td>
          <td><span class="badge danger">Uncataloged Code</span></td>
          <td style="color: #94a3b8;">Declare user intent & scenario in PJC catalog</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>3. Dark Features: Implemented Web Floor Components With NO PJC Attached (${m.orphanWebFloorsCount})</h2>
  <table>
    <thead>
      <tr><th>Component File</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${report.directionB_CodeToSpec.orphanFloors
        .map(
          (f) => `
        <tr>
          <td><span class="code-tag">${f}</span></td>
          <td><span class="badge danger">No PJC Binding</span></td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>4. Phantom / Broken PJC Bindings (Declared in Spec, Missing in Code: ${m.pjcBrokenBindings})</h2>
  <table>
    <thead>
      <tr><th>Binding ID</th><th>Declared Reference</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${report.directionA_SpecToCode.brokenBindings
        .map(
          (b) => `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td><span class="code-tag">${b.reference || 'None'}</span></td>
          <td><span class="badge danger">File Missing On Disk</span></td>
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
  console.log(`  PJC BIDIRECTIONAL CONFORMANCE & REVERSE COVERAGE ANALYZER`);
  console.log(`===============================================================\n`);

  const pjc = ingestPjcCatalog();
  const code = ingestCodeSurfaces();
  const report = analyzeCoverage(pjc, code);
  const m = report.metrics;

  console.log(`▶ DIRECTION 1: SPEC ➔ CODE (PJC CATALOG INTEGRITY)`);
  console.log(`  • Features: ${m.pjcFeaturesCount} | Intents: ${m.pjcIntentsCount} | Journeys: ${m.pjcJourneysCount} | Steps: ${m.pjcStepsCount}`);
  console.log(`  • Declared Bindings: ${m.pjcTotalBindings}`);
  console.log(`  • Valid Physical Files on Disk: ${m.pjcValidBindings} / ${m.pjcTotalBindings} (${m.pjcBindingIntegrityPercent}%)`);
  console.log(`  • Phantom / Broken File References: ${m.pjcBrokenBindings}`);

  console.log(`\n▶ DIRECTION 2: CODE ➔ SPEC (DARK FEATURE & ORPHAN AUDIT)`);
  console.log(`  • Implemented Web Routes: ${m.totalWebRoutes}`);
  console.log(`    - Covered in PJC: ${m.coveredWebRoutesCount} (${m.webRoutePjcCoveragePercent}%)`);
  console.log(`    - Uncataloged "Dark" Routes: ${m.orphanWebRoutesCount}`);
  console.log(`  • Implemented Mobile Routes: ${m.totalMobileRoutes}`);
  console.log(`    - Covered in PJC: ${m.coveredMobileRoutesCount} (${m.mobileRoutePjcCoveragePercent}%)`);
  console.log(`    - Uncataloged "Dark" Routes: ${m.orphanMobileRoutesCount}`);
  console.log(`  • Implemented Web Floors: ${m.totalWebFloors}`);
  console.log(`    - Bound in PJC: ${m.coveredWebFloorsCount} (${m.webFloorCoveragePercent}%)`);
  console.log(`    - Unbound "Dark" Floors: ${m.orphanWebFloorsCount}`);

  console.log(`\n===============================================================`);
  console.log(`  KEY ORPHAN / DARK SURFACES FOUND IN CODE:`);
  console.log(`===============================================================`);
  report.directionB_CodeToSpec.orphanFloors.slice(0, 10).forEach((f) => {
    console.log(`  ⚠ Unbound UI Floor: ${f}`);
  });
  console.log(`  ...and ${Math.max(0, report.directionB_CodeToSpec.orphanFloors.length - 10)} more uncataloged floor surfaces.`);

  console.log(`\n===============================================================`);
  console.log(`  KEY PHANTOM BINDINGS IN PJC (Declared in YAML, Missing in Code):`);
  console.log(`===============================================================`);
  report.directionA_SpecToCode.brokenBindings.slice(0, 8).forEach((b) => {
    console.log(`  ❌ Missing on disk: [${b.id}] -> ${b.reference}`);
  });
  console.log(`  ...and ${Math.max(0, report.directionA_SpecToCode.brokenBindings.length - 8)} more broken bindings.`);

  // Write reports
  mkdirSync(dirname(REPORT_JSON), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✔ JSON Report written to: ${REPORT_JSON}`);

  const html = generateHtml(report);
  writeFileSync(REPORT_HTML, html, 'utf-8');
  console.log(`✔ Interactive HTML Report written to: ${REPORT_HTML}`);
  console.log(`\n===============================================================\n`);
}

main();
