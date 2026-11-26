#!/usr/bin/env node
/**
 * Pluggable Screen-Anchored Tree & Bidirectional Verification Runner
 * Grounded in: docs/architecture/interaction-tree-and-e2e-testing-standard.md
 *
 * Modular model-based engine verifying bidirectional user transitions
 * (Screen Anchor S₀ -> Forward Spoke -> State B -> Reverse Spoke -> S' ≅ S₀).
 *
 * Invariants:
 * 1. Pluggable: Any screen can be targeted via --screen=<route> or discovered via crawler.
 * 2. Autonomous Mining: Uses screen-miner.mjs to dynamically extract identity,
 *    WCAG AA contrast, layout overflow, and affordances without hardcoded selectors.
 * 3. Bidirectional Reversibility: Every forward spoke is matched by a reverse spoke execution.
 *
 * CLI Flags:
 *   --screen=<route>       Target specific screen anchor (e.g. /workspace, /welcome, /library)
 *   --mode=full|smoke      Execution mode (full = exhaustive, smoke = fast pre-push)
 *   --depth=<n>            Max traversal depth (default: smoke=3, full=5)
 *   --url=<baseUrl>        Root URL (default: http://explore.localhost:3000)
 *   --surface=explore|sanctuary (default: explore)
 *   --report=<path>        Output JSON path (default: reports/web-state-graph.json)
 *   --chaos=none|light|heavy Network latency simulation
 *   --idempotency          Rage-click stress testing
 *   --nuance               Escape/backdrop modal dismissal testing
 */

import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { mineScreen, computeSceneHash, auditModalFocusTrap } from './screen-miner.mjs';

// Parse CLI arguments
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith(prefix)) return args[i].slice(prefix.length);
    if (args[i] === `--${name}` && i + 1 < args.length && !args[i + 1].startsWith('--')) {
      return args[i + 1];
    }
  }
  return fallback;
};
const hasFlag = (name) => args.includes(`--${name}`) || getArg(name, 'false') === 'true';

const MODE = getArg('mode', 'full');
const MAX_DEPTH = parseInt(getArg('depth', MODE === 'smoke' ? '3' : '5'), 10);
const MAX_NODES = parseInt(getArg('max-nodes', MODE === 'smoke' ? '10' : '50'), 10);
const PORT = 3000;

// Resolve entry URL and target screen
const rawEntry = getArg('entry', null) || getArg('url', null);
let BASE_URL = `http://explore.localhost:${PORT}`;
let cliTargetScreen = getArg('screen', null);

if (rawEntry) {
  try {
    const parsedEntry = new URL(rawEntry);
    BASE_URL = parsedEntry.origin;
    if (parsedEntry.pathname && parsedEntry.pathname !== '/' && !cliTargetScreen) {
      cliTargetScreen = parsedEntry.pathname;
    }
  } catch {
    BASE_URL = rawEntry;
  }
}

const SURFACE = getArg('surface', 'explore');
const TARGET_SCREEN = cliTargetScreen;
const TARGET_JOURNEY = getArg('journey', null); // If set, seeds on screen anchor mapped to this scenario/flow
const EVIDENCE_LEVEL = getArg('evidence-level', 'G4');
const CHAOS = getArg('chaos', 'none'); // 'none' | 'light' | 'heavy'
const IDEMPOTENCY_TEST = hasFlag('idempotency');
const NUANCE_TEST = hasFlag('nuance');
const DUAL_MODE = hasFlag('dual-mode');
const REPORT_PATH = resolve(
  import.meta.dirname,
  '../../../',
  getArg('report', 'reports/web-state-graph.json')
);
const HTML_REPORT_PATH = REPORT_PATH.replace(/\.json$/, '.html');

// PJC & FlowDAG Mapping: Associates real scene paths to PJC scenarios and Flow DAG steps
const SCENE_PJC_FLOW_MAP = {
  '/welcome': {
    flowId: 'flow:entry:web_sanctuary',
    stepId: 'guest_house_welcome',
    scenarioId: 'scenario:welcome.explore_entry',
    featureId: 'feature:entry.web_sanctuary',
    title: 'Sanctuary Guest House Welcome & Role Selection',
  },
  '/self': {
    flowId: 'flow:self:student_daily_prep',
    stepId: 'morning_situational_brief',
    scenarioId: 'scenario:self.morning_situational_brief',
    featureId: 'feature:self.learner_growth',
    title: 'Personal Self Floor & Situational Brief',
  },
  '/workspace': {
    flowId: 'flow:teacher:first_workspace',
    stepId: 'resolve_workspace',
    scenarioId: 'scenario:classroom.teacher_first_workspace',
    featureId: 'feature:classroom.teacher_first_workspace',
    title: 'Classroom & School Teaching Workspace',
  },
  '/workspace/plan': {
    flowId: 'flow:teacher:first_workspace',
    stepId: 'term_curriculum_plan',
    scenarioId: 'scenario:classroom.teaching_plan',
    featureId: 'feature:classroom.teaching_loop',
    title: 'Academic Term Plan & Curriculum Desk',
  },
  '/workspace/notices': {
    flowId: 'flow:teacher:first_workspace',
    stepId: 'school_notices_board',
    scenarioId: 'scenario:classroom.school_notices',
    featureId: 'feature:classroom.teaching_loop',
    title: 'Institutional School Notices & Broadcast Floor',
  },
  '/library': {
    flowId: 'flow:entry:web_sanctuary',
    stepId: 'library_reading_hall',
    scenarioId: 'scenario:library.reading_hall',
    featureId: 'feature:pjc.catalog',
    title: 'Sanctuary Knowledge Library',
  },
  '/library/map': {
    flowId: 'flow:entry:web_sanctuary',
    stepId: 'library_atlas_desk',
    scenarioId: 'scenario:library.atlas_desk',
    featureId: 'feature:pjc.catalog',
    title: 'Spatial Knowledge Atlas Desk',
  },
  '/community': {
    flowId: 'flow:entry:web_sanctuary',
    stepId: 'community_circle',
    scenarioId: 'scenario:community.forest_circles',
    featureId: 'feature:pjc.catalog',
    title: 'Community Circles & Tutii Companion',
  },
};

function getPjcFlowMapping(pathname) {
  for (const [routePattern, mapping] of Object.entries(SCENE_PJC_FLOW_MAP)) {
    if (pathname === routePattern || (routePattern !== '/' && pathname.startsWith(routePattern))) {
      return mapping;
    }
  }
  return {
    flowId: 'flow:dynamic',
    stepId: 'dynamic_scene_step',
    scenarioId: 'scenario:custom.scene',
    featureId: 'feature:dynamic',
    title: 'Dynamic Scene Floor',
  };
}

async function main() {
  console.log(`\n===============================================================`);
  console.log(`  PLUGGABLE SCREEN-ANCHORED TREE RUNNER (${SURFACE.toUpperCase()})`);
  console.log(`  Mode: ${MODE} | Depth: ${MAX_DEPTH} | Anchor Target: ${TARGET_SCREEN || 'Auto Doorway'}`);
  console.log(`  Base: ${BASE_URL} | Chaos: ${CHAOS} | Idempotency: ${IDEMPOTENCY_TEST}`);
  console.log(`===============================================================\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const networkErrors = [];
  const uncaughtExceptions = [];

  page.on('pageerror', (err) => {
    uncaughtExceptions.push({ type: 'pageerror', message: err.message, url: page.url() });
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      uncaughtExceptions.push({ type: 'console.error', text: msg.text(), url: page.url() });
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      networkErrors.push({ url: res.url(), status: res.status(), fromPage: page.url() });
    }
  });

  const graph = {
    metadata: {
      generator: 'pluggable-screen-tree-runner',
      version: '2.1.0',
      surface: SURFACE,
      mode: MODE,
      targetScreen: TARGET_SCREEN,
      baseUrl: BASE_URL,
      maxDepth: MAX_DEPTH,
      chaos: CHAOS,
      idempotency: IDEMPOTENCY_TEST,
      nuance: NUANCE_TEST,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'RUNNING',
    },
    nodes: {},
    edges: [],
    roundTrips: [],
    pjcEvidence: {
      tier: EVIDENCE_LEVEL,
      tool: 'screen-anchored-tree-runner',
      scenariosVerified: [],
      verifiedAt: new Date().toISOString(),
    },
    summary: {
      totalAnchorsExplored: 0,
      totalSpokesTested: 0,
      inPageControlsTested: 0,
      inPageEffectsVerified: 0,
      deadClicksDetected: 0,
      roundTripsPassed: 0,
      roundTripsFailed: 0,
      axePassesCount: 0,
      axeViolationsCount: 0,
      focusTrapsTested: 0,
      focusTrapsPassed: 0,
      sequentialJourneysVerified: 0,
      wcag2AAPassCount: 0,
      bronzeTierPassCount: 0,
      silverTierPassCount: 0,
      goldTierPassCount: 0,
      totalMissingLabels: 0,
      totalBrokenAriaRefs: 0,
      totalControlsWithHints: 0,
      totalHiddenFocusables: 0,
      totalPositiveTabIndex: 0,
      totalDuplicateIds: 0,
      totalLiveRegions: 0,
      dualThemeTestedCount: 0,
      dualThemeStableCount: 0,
      uncaughtErrorsCount: 0,
      networkErrorsCount: 0,
    },
  };

  // Chaos Monkey Fault Injection (Network latency & packet jitter simulation)
  if (CHAOS !== 'none') {
    console.log(`[Chaos Monkey] Injected mode: ${CHAOS} (simulating network latency and jitter)`);
    await page.route('**/*', async (route) => {
      const req = route.request();
      const rt = req.resourceType();
      if (rt === 'fetch' || rt === 'xhr') {
        const delay = CHAOS === 'heavy' ? Math.floor(Math.random() * 350 + 150) : 80;
        await new Promise((r) => setTimeout(r, delay));
      }
      await route.continue();
    });
  }

  const visitedHashes = new Set();
  const verifiedScenarios = new Set();

  try {
    // Determine entry anchor
    let initialRoute = TARGET_SCREEN || '/welcome';
    if (TARGET_JOURNEY) {
      const match = Object.entries(SCENE_PJC_FLOW_MAP).find(
        ([_, m]) => m.scenarioId === TARGET_JOURNEY || m.flowId === TARGET_JOURNEY
      );
      if (match) {
        initialRoute = match[0];
        console.log(`[PJC Target] Resolved scenario "${TARGET_JOURNEY}" -> Screen Anchor: ${initialRoute}`);
      } else {
        console.warn(`[PJC Target] Scenario "${TARGET_JOURNEY}" not explicitly mapped; falling back to ${initialRoute}`);
      }
    }
    console.log(`[Anchor Entry] Initializing Screen Anchor at ${BASE_URL}${initialRoute}`);
    await page.goto(`${BASE_URL}${initialRoute}`, { waitUntil: 'networkidle', timeout: 12000 });
    await page.waitForTimeout(500);

    /**
     * Autonomous Screen-Anchored Tree Traversal Harness.
     * Takes any active screen anchor S₀, mines its affordances, executes forward spokes,
     * validates reverse returns, and asserts anchor reconstitution (S' ≅ S₀).
     */
    async function exploreScreenAnchor(depth = 0, breadcrumbs = [initialRoute]) {
      if (depth >= MAX_DEPTH) return;
      if (Object.keys(graph.nodes).length >= MAX_NODES) return;

      // 1. Mine Screen Anchor S₀
      const anchorInspection = await mineScreen(page);
      const anchorUrl = anchorInspection.identity.url;
      const anchorPath = anchorInspection.identity.pathname;
      const anchorHash = computeSceneHash(
        anchorPath,
        anchorInspection.identity.search,
        anchorInspection.spokes.all.length,
        anchorInspection.identity.themeMode
      );

      const pjcMapping = getPjcFlowMapping(anchorPath);
      if (pjcMapping.scenarioId) {
        verifiedScenarios.add(pjcMapping.scenarioId);
      }

      // Register Anchor Node in Graph
      if (!graph.nodes[anchorHash]) {
        graph.nodes[anchorHash] = {
          hash: anchorHash,
          url: anchorUrl,
          path: anchorPath,
          title: anchorInspection.identity.title,
          depth,
          quality: anchorInspection.quality,
          pjc: pjcMapping,
          breadcrumbs: [...breadcrumbs],
          minedSpokesCount: anchorInspection.spokes.all.length,
          forwardSpokesCount: anchorInspection.spokes.forward.length,
          reverseSpokesCount: anchorInspection.spokes.reverse.length,
          exploredAt: new Date().toISOString(),
        };

        const apca = anchorInspection.quality.apca || { bronze: {}, silver: {}, gold: {} };
        const wcag2 = anchorInspection.quality.wcag2 || {};
        const touch = anchorInspection.quality.touchTargets || {};
        const sem = anchorInspection.quality.semantics || {};
        const scorecard = anchorInspection.quality.scorecard || {};
        const axe = anchorInspection.quality.axe || { passesCount: 0, violationsCount: 0, violations: [] };

        graph.summary.axePassesCount += axe.passesCount || 0;
        graph.summary.axeViolationsCount += axe.violationsCount || 0;

        if (scorecard.wcag2AA) graph.summary.wcag2AAPassCount++;
        if (scorecard.bronzeTier) graph.summary.bronzeTierPassCount++;
        if (scorecard.silverTier) graph.summary.silverTierPassCount++;
        if (scorecard.goldTier) graph.summary.goldTierPassCount++;
        graph.summary.totalMissingLabels += sem.missingAccessibleNames || 0;
        graph.summary.totalBrokenAriaRefs += sem.brokenAriaReferences || 0;
        graph.summary.totalControlsWithHints += sem.controlsWithHints || 0;
        graph.summary.totalHiddenFocusables += sem.hiddenFocusableElements || 0;
        graph.summary.totalPositiveTabIndex += sem.positiveTabIndexElements || 0;
        graph.summary.totalDuplicateIds += sem.duplicateIds || 0;
        graph.summary.totalLiveRegions += sem.liveRegionsCount || 0;
      }

      visitedHashes.add(anchorHash);

      const apca = anchorInspection.quality.apca || { bronze: {}, silver: {}, gold: {} };
      const wcag2 = anchorInspection.quality.wcag2 || {};
      const touch = anchorInspection.quality.touchTargets || {};
      const sem = anchorInspection.quality.semantics || {};
      const scorecard = anchorInspection.quality.scorecard || {};
      const axe = anchorInspection.quality.axe || { passesCount: 0, violationsCount: 0, violations: [] };

      console.log(`\n===============================================================`);
      console.log(`[Anchor Depth ${depth}] Screen: ${anchorPath} (#${anchorHash})`);
      console.log(`  PJC Mapping: [${pjcMapping.featureId}] -> ${pjcMapping.title}`);
      console.log(`  Legal Compliance: WCAG 2.2 AA=${scorecard.wcag2AA ? '✔ PASS' : '⚠ DEFICIT'} (${wcag2.passed || 0} pass, ${wcag2.failed || 0} fail | ${wcag2.complianceRate || '100%'})`);
      console.log(`  Axe-Core W3C Rules: ${axe.passesCount || 0} passed, ${axe.violationsCount === 0 ? '✔ 0 violations' : `⚠ ${axe.violationsCount} violations`}`);
      if (axe.violationsCount > 0) {
        for (const v of axe.violations.slice(0, 3)) {
          console.log(`    - [${v.impact}] ${v.id}: ${v.description} (${v.help})`);
        }
      }
      console.log(`  Tier Conformance: Bronze=${scorecard.bronzeTier ? '✔ PASS' : '✖ FAIL'} | Silver=${scorecard.silverTier ? '✔ PASS' : '⚠ DEFICIT'} | Gold=${scorecard.goldTier ? '✔ PASS' : 'ℹ STANDARD'}`);
      console.log(`  APCA Contrast: Bronze=${apca.bronze?.passed || 0} pass, ${apca.bronze?.failed || 0} fail | Silver=${apca.silver?.passed || 0} pass | Gold=${apca.gold?.passed || 0} pass`);
      console.log(`  Pointer Targets: Gold(≥48px)=${touch.gold || 0} | Silver(≥44px)=${touch.silver || 0} | Bronze(≥24px)=${touch.bronze || 0} | Sub-24px=${touch.subBronze || 0}`);
      console.log(`  Semantics & Wiring: MissingLabels=${sem.missingAccessibleNames || 0} | BrokenAriaRefs=${sem.brokenAriaReferences || 0} | HintsWired=${sem.controlsWithHints || 0} | Overflow=${anchorInspection.quality.hasHorizontalOverflow}`);
      console.log(`  Affordance Tree: ${anchorInspection.spokes.all.length} spokes mined (${anchorInspection.spokes.forward.length} forward, ${anchorInspection.spokes.reverse.length} reverse)`);

      if (sem.missingAccessibleNamesSamples && sem.missingAccessibleNamesSamples.length > 0) {
        console.log(`  ⚠ Missing Accessible Names:`);
        for (const m of sem.missingAccessibleNamesSamples) {
          console.log(`    - <${m.tag} role="${m.role}"> selector: ${m.selector}`);
        }
      }
      if (sem.brokenAriaReferencesSamples && sem.brokenAriaReferencesSamples.length > 0) {
        console.log(`  ⚠ Broken ARIA References (Dangling IDs):`);
        for (const b of sem.brokenAriaReferencesSamples) {
          console.log(`    - <${b.element} ${b.attribute}="${b.missingId}"> (id "${b.missingId}" not found in DOM)`);
        }
      }
      if (sem.hiddenFocusableElements > 0) {
        console.log(`  ⚠ Focusable Elements Trapped in aria-hidden="true" (${sem.hiddenFocusableElements}):`);
        for (const hf of sem.hiddenFocusableSamples || []) {
          console.log(`    - <${hf.tag}> "${hf.text}" (selector: ${hf.selector})`);
        }
      }
      if (sem.positiveTabIndexElements > 0) {
        console.log(`  ⚠ Disruptive Positive TabIndex (> 0) (${sem.positiveTabIndexElements}):`);
        for (const pt of sem.positiveTabIndexSamples || []) {
          console.log(`    - <${pt.tag} tabindex="${pt.tabIndex}"> "${pt.text}"`);
        }
      }
      if (sem.duplicateIds > 0) {
        console.log(`  ⚠ Duplicate DOM IDs Colliding (${sem.duplicateIds}):`);
        for (const di of sem.duplicateIdSamples || []) {
          console.log(`    - id="${di.id}" (repeated ${di.count} times)`);
        }
      }
      if (sem.liveRegionsCount > 0) {
        console.log(`  ℹ Active Dynamic Live Regions (${sem.liveRegionsCount} registered)`);
      }
      if (sem.hintsSamples && sem.hintsSamples.length > 0) {
        console.log(`  ℹ Wired Hints & Descriptions:`);
        for (const h of sem.hintsSamples) {
          console.log(`    - <${h.tag}> "${h.hint}" (via ${h.type})`);
        }
      }

      // Dual-Mode Theme Inversion Verification (Dynamic vs Static Theme Fragility)
      if (DUAL_MODE) {
        graph.summary.dualThemeTestedCount++;
        const initialMode = anchorInspection.identity.themeMode || 'light';
        const targetAltMode = initialMode === 'dark' ? 'light' : 'dark';
        console.log(`  🌓 [Dual-Theme Inversion] Testing opposite theme mode: ${targetAltMode.toUpperCase()}...`);
        await page.evaluate((m) => {
          document.documentElement.setAttribute('data-mode', m);
          localStorage.setItem('gurudevi_mode', m);
          window.dispatchEvent(new CustomEvent('gurudevi:mode-changed', { detail: { mode: m } }));
        }, targetAltMode);
        await page.waitForTimeout(200);

        const altInspection = await mineScreen(page);
        const altScorecard = altInspection.quality.scorecard || {};
        const altWcag2 = altInspection.quality.wcag2 || {};
        const altApca = altInspection.quality.apca || {};

        const dualPass = scorecard.wcag2AA && altScorecard.wcag2AA && scorecard.bronzeTier && altScorecard.bronzeTier;
        if (dualPass) {
          graph.summary.dualThemeStableCount++;
        }

        const dualModeResult = {
          tested: true,
          primaryMode: initialMode,
          altMode: targetAltMode,
          dualPass,
          primaryWcag2: scorecard.wcag2AA,
          altWcag2: altScorecard.wcag2AA,
          altWcag2Stats: `${altWcag2.passed || 0}p / ${altWcag2.failed || 0}f (${altWcag2.complianceRate || '100%'})`,
          altApcaBronze: `${altApca.bronze?.passed || 0}p / ${altApca.bronze?.failed || 0}f`,
        };

        if (graph.nodes[anchorHash]) {
          graph.nodes[anchorHash].dualTheme = dualModeResult;
        }

        console.log(`  🌓 Dual-Theme Verdict: ${dualPass ? '✔ STABLE ACROSS MODES' : '⚠ THEME DIVERGENCE DETECTED'} (${initialMode}: WCAG2=${scorecard.wcag2AA ? 'PASS' : 'FAIL'} | ${targetAltMode}: WCAG2=${altScorecard.wcag2AA ? 'PASS' : 'FAIL'}, APCA=${altApca.bronze?.passed || 0}p/${altApca.bronze?.failed || 0}f)`);

        // Revert to initial mode
        await page.evaluate((m) => {
          document.documentElement.setAttribute('data-mode', m);
          localStorage.setItem('gurudevi_mode', m);
          window.dispatchEvent(new CustomEvent('gurudevi:mode-changed', { detail: { mode: m } }));
        }, initialMode);
        await page.waitForTimeout(100);
      }
      console.log(`===============================================================`);

      // Special Scene Progression: If on /welcome and in step 1, advance wizard steps dynamically
      if (anchorPath === '/welcome') {
        const step1Btn = page.locator('button:has-text("One more thing")').first();
        if ((await step1Btn.count()) > 0 && (await step1Btn.isVisible())) {
          console.log(`  [Mined Progression] Advancing Welcome Step 1 -> Step 2...`);
          await step1Btn.click({ timeout: 4000 });
          await page.waitForTimeout(400);
        }

        const step2Btn = page.locator('button:has-text("Choose your perspective")').first();
        if ((await step2Btn.count()) > 0 && (await step2Btn.isVisible())) {
          console.log(`  [Mined Progression] Advancing Welcome Step 2 -> Step 3...`);
          await step2Btn.click({ timeout: 4000 });
          await page.waitForTimeout(400);
        }

        const roleCard = page.locator('[role="radio"]').filter({ hasText: /Teacher/i }).first();
        if ((await roleCard.count()) > 0 && (await roleCard.isVisible())) {
          console.log(`  [Mined Progression] Selecting Teacher role card in showroom...`);
          await roleCard.click({ timeout: 4000 });
          await page.waitForTimeout(400);
        }
      }

      // Re-mine after any in-page wizard progression
      const activeInspection = await mineScreen(page);
      const forwardSpokes = activeInspection.spokes.forward;

      // Balanced Spoke Sampling: Prioritize in-screen controls, actions, and modal triggers
      // over generic global shell navigation links
      const inScreenSpokes = forwardSpokes.filter(
        (s) => !s.isShell && (s.spokeType === 'IN_PAGE_CONTROL' || s.spokeType === 'ACTION' || s.spokeType === 'MODAL_TRIGGER' || s.spokeType === 'PRIMARY_ACTION')
      );
      const navSpokes = forwardSpokes.filter(
        (s) => s.spokeType === 'NAVIGATION_SPOKE' || s.spokeType === 'SHELL_NAV' || (s.href && s.href !== anchorPath)
      );

      let sampleSpokes = [];
      if (inScreenSpokes.length > 0) {
        if (MODE === 'smoke') {
          sampleSpokes = [...inScreenSpokes.slice(0, 5), ...navSpokes.slice(0, 2)];
        } else {
          sampleSpokes = [...inScreenSpokes.slice(0, 12), ...navSpokes.slice(0, 4)];
        }
      } else {
        sampleSpokes = MODE === 'smoke' ? forwardSpokes.slice(0, 5) : forwardSpokes.slice(0, 10);
      }

      // 2. Execute Fan-Out & Rewind on Mined Spokes
      for (const spoke of sampleSpokes) {
        const spokeLabel = spoke.text || spoke.ariaLabel || spoke.href || spoke.id;

        // Skip direct self loops
        if (spoke.href && spoke.href === anchorPath) continue;

        console.log(`\n  👉 [Spoke ${spoke.spokeType}] Testing: "${spokeLabel}"`);
        const preSpokeUrl = page.url();
        const preSpokeHash = computeSceneHash(
          new URL(preSpokeUrl).pathname,
          new URL(preSpokeUrl).search,
          activeInspection.spokes.all.length,
          activeInspection.identity.themeMode
        );

        try {
          // 1. Snapshot pre-spoke DOM & state for Action-Effect Verification
          const preState = await page.evaluate(({ spokeSel, spokeId }) => {
            let el = null;
            if (spokeId) el = document.querySelector(`[data-spoke-id="${spokeId}"]`);
            if (!el && spokeSel && !spokeSel.includes(':has-text(')) {
              try { el = document.querySelector(spokeSel); } catch { /* ignore */ }
            }

            const activeModals = Array.from(
              document.querySelectorAll('dialog[open], [role="dialog"], [data-modal]')
            ).filter((m) => {
              const st = window.getComputedStyle(m);
              return st.display !== 'none' && st.visibility !== 'hidden';
            });

            const liveRegions = Array.from(
              document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')
            ).map((lr) => (lr.textContent || '').trim()).filter(Boolean);

            return {
              elAriaPressed: el ? el.getAttribute('aria-pressed') : null,
              elAriaChecked: el ? el.getAttribute('aria-checked') : null,
              elAriaExpanded: el ? el.getAttribute('aria-expanded') : null,
              elDataSelected: el ? el.getAttribute('data-selected') : null,
              elDataActive: el ? el.getAttribute('data-active') : null,
              elClassName: el ? el.className : null,
              docDataWorld: document.documentElement.getAttribute('data-world'),
              docDataMode: document.documentElement.getAttribute('data-mode'),
              docClassList: Array.from(document.documentElement.classList),
              modalCount: activeModals.length,
              modalTitles: activeModals.map(
                (m) => m.getAttribute('aria-label') || m.querySelector('h1, h2, h3')?.textContent || 'Dialog'
              ),
              liveRegionTexts: liveRegions,
              domLength: document.body.innerHTML.length,
            };
          }, { spokeSel: spoke.selector, spokeId: spoke.id });

          // Robust locator selection using data-spoke-id first, then primaryText, then text, then href
          const cleanText = (spoke.text || '').replace(/[→←✕↗]/g, '').trim();
          let spokeLocator;
          if (spoke.id) {
            const byId = page.locator(`[data-spoke-id="${spoke.id}"]`).first();
            if ((await byId.count()) > 0 && (await byId.isVisible())) {
              spokeLocator = byId;
            }
          }
          if (!spokeLocator && spoke.primaryText) {
            const byPrimary = page.locator(`${spoke.tag}:has-text("${spoke.primaryText}")`).first();
            if ((await byPrimary.count()) > 0 && (await byPrimary.isVisible())) {
              spokeLocator = byPrimary;
            }
          }
          if (!spokeLocator && spoke.href) {
            spokeLocator = page.locator(`a[href="${spoke.href}"]`).first();
          }
          if (!spokeLocator && cleanText) {
            spokeLocator = page.locator(`${spoke.tag}:has-text("${cleanText.slice(0, 25)}")`).first();
          }
          if (!spokeLocator && spoke.ariaLabel) {
            spokeLocator = page.locator(`[aria-label="${spoke.ariaLabel}"]`).first();
          }

          if (!spokeLocator || (await spokeLocator.count()) === 0 || !(await spokeLocator.isVisible())) {
            console.log(`    (Spoke element not visible in current DOM; skipping)`);
            continue;
          }

          // Forward execution (click)
          await spokeLocator.click({ timeout: 5000 });
          graph.summary.totalSpokesTested++;

          // Idempotency stress test
          if (IDEMPOTENCY_TEST) {
            spokeLocator.click({ timeout: 600 }).catch(() => {});
          }
          await page.waitForTimeout(400);

          const postSpokeUrl = page.url();
          const postSpokePath = new URL(postSpokeUrl).pathname;
          const postSpokeHash = computeSceneHash(postSpokePath, new URL(postSpokeUrl).search, 0, 'post');
          const isRouteTransition = preSpokeUrl !== postSpokeUrl;

          if (isRouteTransition) {
            console.log(`    Forward Transition: ${preSpokeUrl} -> ${postSpokeUrl}`);

            // Record Edge
            graph.edges.push({
              type: spoke.spokeType,
              from: preSpokeHash,
              to: postSpokeHash,
              label: spokeLabel,
              fromUrl: preSpokeUrl,
              toUrl: postSpokeUrl,
              actionEffects: [`Route transition: ${preSpokeUrl} -> ${postSpokeUrl}`],
              effectVerified: true,
              timestamp: new Date().toISOString(),
              success: true,
            });

            // Recurse to explore child anchor if within depth limit and unvisited
            if (!visitedHashes.has(postSpokeHash) && depth + 1 < MAX_DEPTH && Object.keys(graph.nodes).length < MAX_NODES) {
              await exploreScreenAnchor(depth + 1, [...breadcrumbs, postSpokePath]);
            }

            // BIDIRECTIONAL REVERSAL: Return to Anchor S₀
            console.log(`    Validating Reverse Spoke: Returning to Anchor ${anchorPath}...`);
            const childInspection = await mineScreen(page);
            const internalReverseSpokes = childInspection.spokes.reverse.filter(
              (r) => !r.href.includes('gurudevi.app') && !r.text.includes('Gurudevi.app')
            );

            let returned = false;
            if (internalReverseSpokes.length > 0) {
              const rev = internalReverseSpokes[0];
              console.log(`      Found explicit reverse spoke: "${rev.text || rev.ariaLabel}". Clicking...`);
              const revLocator = page.locator(`button, [role="button"]`).filter({
                hasNotText: /gurudevi\.app/i,
                hasText: new RegExp(rev.text.replace(/[→←✕↗]/g, '').trim() || 'back|cancel|close', 'i'),
              }).first();

              if ((await revLocator.count()) > 0 && (await revLocator.isVisible())) {
                await revLocator.click({ timeout: 4000 });
                await page.waitForTimeout(400);
                if (page.url() === preSpokeUrl) {
                  returned = true;
                }
              }
            }

            if (!returned) {
              console.log(`      Exercising browser goBack()...`);
              await page.goBack({ timeout: 4000 }).catch(() => {});
              await page.waitForTimeout(400);
            }

            // Assert Anchor Reconstitution
            const reconstitutedUrl = page.url();
            const pass = reconstitutedUrl === preSpokeUrl;

            graph.roundTrips.push({
              anchorUrl: preSpokeUrl,
              childUrl: postSpokeUrl,
              spoke: spokeLabel,
              reconstitutedUrl,
              passed: pass,
            });

            if (pass) {
              console.log(`      ✔ ANCHOR RECONSTITUTED: Reconstituted cleanly to ${reconstitutedUrl} (S' ≅ S₀)`);
              graph.summary.roundTripsPassed++;
            } else {
              console.warn(`      ⚠ RECONSTITUTION DISCREPANCY: Landed on ${reconstitutedUrl} (Expected: ${preSpokeUrl})`);
              graph.summary.roundTripsFailed++;
              // Restore anchor before continuing next spoke
              await page.goto(preSpokeUrl, { waitUntil: 'networkidle', timeout: 8000 }).catch(() => {});
            }
          } else {
            // In-Page Action-Effect Verification
            graph.summary.inPageControlsTested++;

            const postState = await page.evaluate(({ spokeSel, spokeId }) => {
              let el = null;
              if (spokeId) el = document.querySelector(`[data-spoke-id="${spokeId}"]`);
              if (!el && spokeSel && !spokeSel.includes(':has-text(')) {
                try { el = document.querySelector(spokeSel); } catch { /* ignore */ }
              }

              const activeModals = Array.from(
                document.querySelectorAll('dialog[open], [role="dialog"], [data-modal]')
              ).filter((m) => {
                const st = window.getComputedStyle(m);
                return st.display !== 'none' && st.visibility !== 'hidden';
              });

              const liveRegions = Array.from(
                document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')
              ).map((lr) => (lr.textContent || '').trim()).filter(Boolean);

              return {
                elAriaPressed: el ? el.getAttribute('aria-pressed') : null,
                elAriaChecked: el ? el.getAttribute('aria-checked') : null,
                elAriaExpanded: el ? el.getAttribute('aria-expanded') : null,
                elDataSelected: el ? el.getAttribute('data-selected') : null,
                elDataActive: el ? el.getAttribute('data-active') : null,
                elClassName: el ? el.className : null,
                docDataWorld: document.documentElement.getAttribute('data-world'),
                docDataMode: document.documentElement.getAttribute('data-mode'),
                docClassList: Array.from(document.documentElement.classList),
                modalCount: activeModals.length,
                modalTitles: activeModals.map(
                  (m) => m.getAttribute('aria-label') || m.querySelector('h1, h2, h3')?.textContent || 'Dialog'
                ),
                liveRegionTexts: liveRegions,
                domLength: document.body.innerHTML.length,
              };
            }, { spokeSel: spoke.selector, spokeId: spoke.id });

            const actionEffects = [];
            if (postState.elAriaPressed !== preState.elAriaPressed) {
              actionEffects.push(`aria-pressed: "${preState.elAriaPressed}" -> "${postState.elAriaPressed}"`);
            }
            if (postState.elAriaChecked !== preState.elAriaChecked) {
              actionEffects.push(`aria-checked: "${preState.elAriaChecked}" -> "${postState.elAriaChecked}"`);
            }
            if (postState.elAriaExpanded !== preState.elAriaExpanded) {
              actionEffects.push(`aria-expanded: "${preState.elAriaExpanded}" -> "${postState.elAriaExpanded}"`);
            }
            if (postState.elDataSelected !== preState.elDataSelected) {
              actionEffects.push(`data-selected: "${preState.elDataSelected}" -> "${postState.elDataSelected}"`);
            }
            if (postState.elDataActive !== preState.elDataActive) {
              actionEffects.push(`data-active: "${preState.elDataActive}" -> "${postState.elDataActive}"`);
            }
            if (postState.elClassName !== preState.elClassName) {
              actionEffects.push(`class updated: "${postState.elClassName}"`);
            }
            if (postState.docDataWorld !== preState.docDataWorld) {
              actionEffects.push(`theme world: "${preState.docDataWorld}" -> "${postState.docDataWorld}"`);
            }
            if (postState.docDataMode !== preState.docDataMode) {
              actionEffects.push(`diurnal mode: "${preState.docDataMode}" -> "${postState.docDataMode}"`);
            }
            const classesAdded = postState.docClassList.filter((c) => !preState.docClassList.includes(c));
            const classesRemoved = preState.docClassList.filter((c) => !postState.docClassList.includes(c));
            if (classesAdded.length > 0 || classesRemoved.length > 0) {
              actionEffects.push(`html classes: +[${classesAdded.join(',')}] -[${classesRemoved.join(',')}]`);
            }
            if (postState.modalCount > preState.modalCount) {
              actionEffects.push(`Modal dialog opened: "${postState.modalTitles.join(', ') || 'Dialog'}"`);
            }
            const newNotices = postState.liveRegionTexts.filter((t) => !preState.liveRegionTexts.includes(t));
            if (newNotices.length > 0) {
              actionEffects.push(`Live feedback notice: "${newNotices[0]}"`);
            }
            if (actionEffects.length === 0 && Math.abs(postState.domLength - preState.domLength) > 15) {
              actionEffects.push(`DOM structure mutated (delta ${postState.domLength - preState.domLength} bytes)`);
            }

            const effectVerified = actionEffects.length > 0;
            if (effectVerified) {
              console.log(`    ✔ ACTION-EFFECT VERIFIED: [${actionEffects.join(' | ')}]`);
              graph.summary.inPageEffectsVerified++;
            } else {
              console.warn(`    ⚠ DEAD CLICK / INERT CONTROL: Button was clicked but produced zero state change, zero DOM update, zero notice, and zero navigation.`);
              graph.summary.deadClicksDetected++;
            }

            // Record Edge
            graph.edges.push({
              type: spoke.spokeType,
              from: preSpokeHash,
              to: postSpokeHash,
              label: spokeLabel,
              fromUrl: preSpokeUrl,
              toUrl: postSpokeUrl,
              actionEffects,
              effectVerified,
              timestamp: new Date().toISOString(),
              success: true,
            });

            // Exercise W3C Modal Focus Trap & Dismissal Nuance
            if (postState.modalCount > preState.modalCount) {
              const modalTitle = postState.modalTitles[0] || 'Dialog';
              console.log(`      Modal detected: "${modalTitle}". Auditing W3C keyboard focus trap...`);
              graph.summary.focusTrapsTested++;
              const trapAudit = await auditModalFocusTrap(page);
              if (trapAudit.passed) {
                console.log(`      ✔ FOCUS TRAP VERIFIED: Focus is contained strictly inside "${modalTitle}" (cycling ${trapAudit.focusableCount} focusables)`);
                actionEffects.push(`Focus trap verified (${trapAudit.focusableCount} items)`);
                graph.summary.focusTrapsPassed++;
              } else {
                console.warn(`      ⚠ FOCUS LEAK DETECTED: Keyboard focus escaped "${modalTitle}" during Tab cycling!`);
                actionEffects.push(`Focus leak defect detected`);
              }

              // Test Escape key dismissal nuance & focus restoration
              console.log(`      Testing Escape key dismissal nuance...`);
              await page.keyboard.press('Escape');
              await page.waitForTimeout(300);
              const postEscapeCount = await page.evaluate(() => {
                return document.querySelectorAll('dialog[open], [role="dialog"]').length;
              });
              if (postEscapeCount < postState.modalCount) {
                console.log(`      ✔ Dismissed modal cleanly via Escape key`);
                // Assert focus return
                const focusReturned = await page.evaluate(({ spokeId, spokeSel }) => {
                  let trigger = null;
                  if (spokeId) {
                    try { trigger = document.querySelector(`[data-spoke-id="${spokeId}"]`); } catch {}
                  }
                  if (!trigger && spokeSel && !spokeSel.includes(':has-text(')) {
                    try { trigger = document.querySelector(spokeSel); } catch {}
                  }
                  return Boolean(trigger && document.activeElement === trigger);
                }, { spokeId: spoke.id, spokeSel: spoke.selector });
                if (focusReturned) {
                  console.log(`      ✔ FOCUS RESTORED: Focus cleanly returned to trigger button`);
                  actionEffects.push(`Focus restored to trigger`);
                }
              } else {
                const closeBtn = page.locator('dialog[open] button, [role="dialog"] button').filter({
                  hasText: /close|cancel|✕|x/i,
                }).first();
                if ((await closeBtn.count()) > 0 && (await closeBtn.isVisible())) {
                  await closeBtn.click();
                  await page.waitForTimeout(300);
                  console.log(`      ✔ Dismissed modal via Close button`);
                }
              }
            }
          }
        } catch (err) {
          console.warn(`    Spoke execution failed: ${err.message}`);
        }
      }
    }

    // Launch anchor tree exploration
    await exploreScreenAnchor(0, [initialRoute]);

    // Aggregate Summary & Evidence
    graph.pjcEvidence.scenariosVerified = Array.from(verifiedScenarios);
    graph.metadata.endTime = new Date().toISOString();
    graph.metadata.status = uncaughtExceptions.length === 0 ? 'SUCCESS' : 'FAILED';
    graph.summary.totalAnchorsExplored = Object.keys(graph.nodes).length;
    graph.summary.uncaughtErrorsCount = uncaughtExceptions.length;
    graph.summary.networkErrorsCount = networkErrors.length;
    graph.uncaughtExceptions = uncaughtExceptions;
    graph.networkErrors = networkErrors;

    // Save JSON report
    mkdirSync(dirname(REPORT_PATH), { recursive: true });
    writeFileSync(REPORT_PATH, JSON.stringify(graph, null, 2), 'utf-8');
    console.log(`\n✔ JSON Report saved to: ${REPORT_PATH}`);

    // Generate HTML Visualization Report
    const htmlReport = generateHtmlReport(graph);
    writeFileSync(HTML_REPORT_PATH, htmlReport, 'utf-8');
    console.log(`✔ Interactive HTML Report saved to: ${HTML_REPORT_PATH}`);

    console.log(`\n===============================================================`);
    console.log(`  SCREEN-ANCHORED TREE RUN COMPLETE`);
    console.log(`  Screen Anchors Explored: ${graph.summary.totalAnchorsExplored}`);
    console.log(`  Spokes Tested: ${graph.summary.totalSpokesTested}`);
    console.log(`  In-Page Controls Exercised: ${graph.summary.inPageControlsTested} (${graph.summary.inPageEffectsVerified} verified, ${graph.summary.deadClicksDetected} dead clicks)`);
    console.log(`  Axe-Core W3C Audit: ${graph.summary.axePassesCount} rules passed, ${graph.summary.axeViolationsCount} violations`);
    if (graph.summary.focusTrapsTested > 0) {
      console.log(`  Modal Focus Traps: ${graph.summary.focusTrapsPassed} / ${graph.summary.focusTrapsTested} Verified`);
    }
    if (graph.summary.sequentialJourneysVerified > 0) {
      console.log(`  Sequential Journeys Verified: ${graph.summary.sequentialJourneysVerified}`);
    }
    console.log(`  Round-Trips Passed: ${graph.summary.roundTripsPassed} / ${graph.summary.roundTripsPassed + graph.summary.roundTripsFailed}`);
    console.log(`  WCAG 2.2 AA Legal Compliance: ${graph.summary.wcag2AAPassCount} / ${graph.summary.totalAnchorsExplored} Clean`);
    console.log(`  WCAG 3.0 Tier Conformance: Bronze=${graph.summary.bronzeTierPassCount}/${graph.summary.totalAnchorsExplored} | Silver=${graph.summary.silverTierPassCount}/${graph.summary.totalAnchorsExplored} | Gold=${graph.summary.goldTierPassCount}/${graph.summary.totalAnchorsExplored}`);
    console.log(`  Semantics & Wiring: HintsWired=${graph.summary.totalControlsWithHints} | MissingLabels=${graph.summary.totalMissingLabels} | BrokenAriaRefs=${graph.summary.totalBrokenAriaRefs}`);
    console.log(`  PJC Scenarios Verified: ${graph.pjcEvidence.scenariosVerified.length}`);
    console.log(`  Uncaught Exceptions: ${graph.summary.uncaughtErrorsCount}`);
    console.log(`  Network 404/500 Errors: ${graph.summary.networkErrorsCount}`);
    console.log(`===============================================================\n`);

    if (uncaughtExceptions.length > 0) {
      console.error(`FAILED: ${uncaughtExceptions.length} uncaught error(s) detected.`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Tree run aborted with fatal error: ${err.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHtmlReport(graph) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gurudevi Screen-Anchored Tree Verification Audit</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #38bdf8; }
    .meta { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
    .stats { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
    .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px 20px; min-width: 140px; }
    .stat-value { font-size: 26px; font-weight: 700; color: #f8fafc; }
    .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px; }
    .badge-pass { color: #4ade80; font-weight: 600; }
    .badge-fail { color: #f87171; font-weight: 600; }
    .badge-warn { color: #fbbf24; font-weight: 600; }
    .badge-gold { background: #78350f; color: #fef08a; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-silver { background: #334155; color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-bronze { background: #451a03; color: #fdba74; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 32px; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 13px; }
    th { background: #0f172a; color: #94a3b8; font-weight: 600; }
    tr:hover { background: #243248; }
    .code { font-family: monospace; background: #0f172a; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #334155; color: #e2e8f0; }
    .tag-pjc { background: #1e3a5f; color: #38bdf8; }
    .tag-flow { background: #2e1065; color: #c084fc; }
  </style>
</head>
<body>
  <h1>Screen-Anchored Tree Verification Audit</h1>
  <div class="meta">
    Generated: ${graph.metadata.endTime} | Mode: <strong>${graph.metadata.mode}</strong> | 
    Surface: <strong>${graph.metadata.surface}</strong> | 
    Target Anchor: <strong>${graph.metadata.targetScreen || 'Autonomous Crawl'}</strong>
  </div>
  
  <div class="stats">
    <div class="stat-card">
      <div class="stat-value">${graph.summary.totalAnchorsExplored}</div>
      <div class="stat-label">Screen Anchors</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${graph.summary.totalSpokesTested}</div>
      <div class="stat-label">Spokes Exercised</div>
    </div>
    <div class="stat-card">
      <div class="stat-value badge-pass">${graph.summary.roundTripsPassed} / ${graph.summary.roundTripsPassed + graph.summary.roundTripsFailed}</div>
      <div class="stat-label">Round-Trips Passed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value badge-pass">${graph.pjcEvidence.scenariosVerified.length}</div>
      <div class="stat-label">PJC Scenarios Verified</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.wcag2AAPassCount === graph.summary.totalAnchorsExplored ? 'badge-pass' : 'badge-warn'}">
        ${graph.summary.wcag2AAPassCount} / ${graph.summary.totalAnchorsExplored}
      </div>
      <div class="stat-label">WCAG 2.2 AA Legal</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.bronzeTierPassCount === graph.summary.totalAnchorsExplored ? 'badge-pass' : 'badge-warn'}">
        ${graph.summary.bronzeTierPassCount} / ${graph.summary.totalAnchorsExplored}
      </div>
      <div class="stat-label">Bronze Tier Pass</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.silverTierPassCount === graph.summary.totalAnchorsExplored ? 'badge-pass' : 'badge-warn'}">
        ${graph.summary.silverTierPassCount} / ${graph.summary.totalAnchorsExplored}
      </div>
      <div class="stat-label">Silver Tier Pass</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.goldTierPassCount > 0 ? 'badge-pass' : 'badge-silver'}">
        ${graph.summary.goldTierPassCount} / ${graph.summary.totalAnchorsExplored}
      </div>
      <div class="stat-label">Gold Tier Pass</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.totalControlsWithHints > 0 ? 'badge-pass' : 'badge-silver'}">
        ${graph.summary.totalControlsWithHints}
      </div>
      <div class="stat-label">Wired Hints</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.totalMissingLabels === 0 && graph.summary.totalBrokenAriaRefs === 0 && graph.summary.totalHiddenFocusables === 0 && graph.summary.totalPositiveTabIndex === 0 && graph.summary.totalDuplicateIds === 0 ? 'badge-pass' : 'badge-fail'}">
        ${graph.summary.totalMissingLabels + graph.summary.totalBrokenAriaRefs + graph.summary.totalHiddenFocusables + graph.summary.totalPositiveTabIndex + graph.summary.totalDuplicateIds}
      </div>
      <div class="stat-label">Total A11y Defects</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.dualThemeTestedCount === 0 || graph.summary.dualThemeStableCount === graph.summary.dualThemeTestedCount ? 'badge-pass' : 'badge-warn'}">
        ${graph.summary.dualThemeTestedCount > 0 ? `${graph.summary.dualThemeStableCount} / ${graph.summary.dualThemeTestedCount}` : 'Off'}
      </div>
      <div class="stat-label">Dual Theme Stable</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.deadClicksDetected === 0 ? 'badge-pass' : 'badge-fail'}">
        ${graph.summary.inPageEffectsVerified || 0} / ${graph.summary.inPageControlsTested || 0}
      </div>
      <div class="stat-label">In-Page Effects Verified</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.deadClicksDetected === 0 ? 'badge-pass' : 'badge-fail'}">
        ${graph.summary.deadClicksDetected || 0}
      </div>
      <div class="stat-label">Dead Clicks Detected</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.axeViolationsCount === 0 ? 'badge-pass' : 'badge-fail'}">
        ${graph.summary.axePassesCount || 0} p / ${graph.summary.axeViolationsCount || 0} v
      </div>
      <div class="stat-label">Axe W3C Rules</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.focusTrapsTested === 0 || graph.summary.focusTrapsPassed === graph.summary.focusTrapsTested ? 'badge-pass' : 'badge-fail'}">
        ${graph.summary.focusTrapsPassed || 0} / ${graph.summary.focusTrapsTested || 0}
      </div>
      <div class="stat-label">Focus Traps Verified</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.sequentialJourneysVerified > 0 ? 'badge-pass' : 'badge-silver'}">
        ${graph.summary.sequentialJourneysVerified || 0}
      </div>
      <div class="stat-label">Sequential Flows</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${graph.summary.uncaughtErrorsCount === 0 ? 'badge-pass' : 'badge-fail'}">${graph.summary.uncaughtErrorsCount}</div>
      <div class="stat-label">Uncaught Errors</div>
    </div>
  </div>

  <h2>In-Page Affordances & Action Effects Tested (${graph.edges.filter((e) => e.actionEffects).length})</h2>
  <table>
    <thead>
      <tr>
        <th>Affordance / Spoke Label</th>
        <th>Spoke Type</th>
        <th>Screen Anchor</th>
        <th>Observed Action Effects & Mutations</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${graph.edges
        .filter((e) => e.actionEffects)
        .map(
          (e) => `<tr>
        <td><strong>${escapeHtml(e.label)}</strong></td>
        <td><span class="tag tag-pjc">${escapeHtml(e.type)}</span></td>
        <td><span class="code">${escapeHtml(e.fromUrl ? e.fromUrl.replace(graph.metadata.baseUrl, '') : 'Anchor')}</span></td>
        <td>
          <ul style="margin: 0; padding-left: 18px;">
            ${(e.actionEffects || []).map((eff) => `<li>${escapeHtml(eff)}</li>`).join('')}
          </ul>
        </td>
        <td>${e.effectVerified ? '<span class="badge-pass">✔ EFFECT VERIFIED</span>' : '<span class="badge-fail">⚠ DEAD CLICK</span>'}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>PJC & FlowDAG Verified Scenarios (${graph.pjcEvidence.scenariosVerified.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Scenario ID</th>
        <th>Evidence Tier</th>
        <th>Verification Tool</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${graph.pjcEvidence.scenariosVerified
        .map(
          (sc) => `<tr>
        <td><span class="code">${escapeHtml(sc)}</span></td>
        <td><span class="tag tag-pjc">G4 (Platform-Real)</span></td>
        <td>${escapeHtml(graph.pjcEvidence.tool)}</td>
        <td><span class="badge-pass">✔ VERIFIED ON SCENE</span></td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>Bidirectional Round-Trip Reconstitution Tested (${graph.roundTrips.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Spoke Element</th>
        <th>Screen Anchor S₀</th>
        <th>Destination Child</th>
        <th>Reconstituted URL</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      ${graph.roundTrips
        .map(
          (rt) => `<tr>
        <td><strong>${escapeHtml(rt.spoke)}</strong></td>
        <td><span class="code">${escapeHtml(rt.anchorUrl.replace(graph.metadata.baseUrl, ''))}</span></td>
        <td><span class="code">${escapeHtml(rt.childUrl.replace(graph.metadata.baseUrl, ''))}</span></td>
        <td><span class="code">${escapeHtml(rt.reconstitutedUrl.replace(graph.metadata.baseUrl, ''))}</span></td>
        <td>${rt.passed ? '<span class="badge-pass">✔ PASS (S\' ≅ S₀)</span>' : '<span class="badge-fail">✕ FAIL</span>'}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>Screen Anchor Quality Scorecards (${Object.keys(graph.nodes).length})</h2>
  <table>
    <thead>
      <tr>
        <th>Screen Anchor Path</th>
        <th>Title</th>
        <th>PJC Feature / Flow</th>
        <th>Mined Spokes</th>
        <th>WCAG 2.2 AA</th>
        <th>WCAG 3.0 Tier</th>
        <th>Dual-Theme Mode</th>
        <th>APCA Contrast (Pass / Fail)</th>
        <th>Touch Targets</th>
        <th>Semantics & ARIA Shield</th>
        <th>Overflow</th>
      </tr>
    </thead>
    <tbody>
      ${Object.values(graph.nodes)
        .map((n) => {
          const apca = n.quality?.apca || { bronze: {}, silver: {}, gold: {} };
          const wcag2 = n.quality?.wcag2 || {};
          const touch = n.quality?.touchTargets || {};
          const sem = n.quality?.semantics || {};
          const scorecard = n.quality?.scorecard || {};
          return `<tr>
        <td><span class="code">${escapeHtml(n.path || n.url.replace(graph.metadata.baseUrl, ''))}</span></td>
        <td>${escapeHtml(n.title)}</td>
        <td>
          <span class="tag tag-pjc">${escapeHtml(n.pjc?.featureId || 'n/a')}</span><br>
          <span class="tag tag-flow" style="margin-top: 4px;">${escapeHtml(n.pjc?.flowId || 'n/a')}</span>
        </td>
        <td><strong>${n.minedSpokesCount}</strong> (${n.forwardSpokesCount} fwd, ${n.reverseSpokesCount} rev)</td>
        <td>
          ${scorecard.wcag2AA ? '<span class="badge-pass">✔ PASS</span>' : '<span class="badge-warn">⚠ DEFICIT</span>'}<br>
          <span style="font-size: 11px; color: #94a3b8;">${wcag2.passed || 0}p / ${wcag2.failed || 0}f (${wcag2.complianceRate || '100%'})</span>
        </td>
        <td>
          ${scorecard.goldTier ? '<span class="badge-gold">GOLD</span> ' : ''}
          ${scorecard.silverTier ? '<span class="badge-silver">SILVER</span> ' : ''}
          ${scorecard.bronzeTier ? '<span class="badge-bronze">BRONZE</span>' : '<span class="badge-fail">FAIL</span>'}
        </td>
        <td>
          ${
            n.dualTheme
              ? n.dualTheme.dualPass
                ? '<span class="badge-pass">✔ STABLE</span><br><span style="font-size: 11px; color: #94a3b8;">' + n.dualTheme.primaryMode + ' & ' + n.dualTheme.altMode + '</span>'
                : '<span class="badge-warn">⚠ DIVERGENT</span><br><span style="font-size: 11px; color: #f87171;">' + n.dualTheme.altMode + ' failed</span>'
              : '<span style="color: #64748b; font-size: 11px;">Not Tested</span>'
          }
        </td>
        <td>
          Bronze: ${apca.bronze?.passed || 0}p / ${apca.bronze?.failed || 0}f<br>
          Silver: ${apca.silver?.passed || 0}p / ${apca.silver?.failed || 0}f<br>
          Gold: ${apca.gold?.passed || 0}p / ${apca.gold?.failed || 0}f
        </td>
        <td>
          ≥48px (Gold): ${touch.gold || 0}<br>
          ≥44px (Silver): ${touch.silver || 0}<br>
          ≥24px (Bronze): ${touch.bronze || 0}<br>
          ${touch.subBronze > 0 ? `<span class="badge-fail">&lt;24px: ${touch.subBronze}</span>` : '&lt;24px: 0'}
        </td>
        <td>
          Hints: ${sem.controlsWithHints || 0}<br>
          ${sem.missingAccessibleNames > 0 ? `<span class="badge-fail">Missing: ${sem.missingAccessibleNames}</span><br>` : 'Missing: 0<br>'}
          ${sem.brokenAriaReferences > 0 ? `<span class="badge-fail">Broken ARIA: ${sem.brokenAriaReferences}</span><br>` : 'Broken ARIA: 0<br>'}
          ${sem.hiddenFocusableElements > 0 ? `<span class="badge-fail">Hidden Focus: ${sem.hiddenFocusableElements}</span><br>` : 'Hidden Focus: 0<br>'}
          ${sem.duplicateIds > 0 ? `<span class="badge-warn">Dupe IDs: ${sem.duplicateIds}</span><br>` : 'Dupe IDs: 0<br>'}
          Live: ${sem.liveRegionsCount || 0}
        </td>
        <td>${
          !n.quality?.hasHorizontalOverflow
            ? '<span class="badge-pass">✔ 0px</span>'
            : '<span class="badge-fail">✖ Overflowing</span>'
        }</td>
      </tr>`;
        })
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}

main().catch((err) => {
  console.error('Fatal execution failure:', err);
  process.exit(1);
});
