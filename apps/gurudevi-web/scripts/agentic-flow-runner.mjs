#!/usr/bin/env node
/**
 * Pluggable Agentic Flow & User Journey Runner
 * Grounded in: docs/architecture/interaction-tree-and-e2e-testing-standard.md
 *
 * Universal, modular test runner orchestrating pluggable FlowDAG definitions.
 * ZERO hardcoded routes, selectors, or test steps in this runner.
 *
 * Capabilities:
 * - Dynamic discovery and execution of *.flow.mjs definitions from ./flows/
 * - Multi-engine support: Playwright native, Stagehand AI, Midscene multimodal visual
 * - W3C WCAG 2.1 AA auditing via @axe-core/playwright
 * - Modal focus-trap sentinel and keyboard loop containment
 * - Cross-screen state lineage and F5 reconstitution verification
 * - Generates structured JSON and interactive HTML reports
 *
 * CLI Usage:
 *   node scripts/agentic-flow-runner.mjs --flow=preference_cascade
 *   node scripts/agentic-flow-runner.mjs --flow=auth_qr_modal
 *   node scripts/agentic-flow-runner.mjs --all
 *   node scripts/agentic-flow-runner.mjs --list
 *   node scripts/agentic-flow-runner.mjs --engine=playwright|stagehand|midscene
 *   node scripts/agentic-flow-runner.mjs --url=http://explore.localhost:3000
 *   node scripts/agentic-flow-runner.mjs --report=reports/agentic-flow-report.json
 */

import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { discoverFlows, loadFlow } from './flows/registry.mjs';
import { mineScreen, auditModalFocusTrap } from './screen-miner.mjs';
import { auditA11y } from './adapters/axe-adapter.mjs';
import { createStagehandAdapter } from './adapters/stagehand-adapter.mjs';
import { createMidsceneAdapter } from './adapters/midscene-adapter.mjs';

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

const TARGET_FLOW = getArg('flow', null);
const TARGET_PJC = getArg('pjc', null);
const RUN_ALL = hasFlag('all');
const LIST_ONLY = hasFlag('list');
const ENGINE = getArg('engine', 'playwright'); // 'playwright' | 'stagehand' | 'midscene'
const BASE_URL = getArg('url', 'http://explore.localhost:3000');
const REPORT_PATH = resolve(
  import.meta.dirname,
  '../../../',
  getArg('report', 'reports/agentic-flow-report.json')
);
const HTML_REPORT_PATH = REPORT_PATH.replace(/\.json$/, '.html');

async function main() {
  const flowsDir = join(import.meta.dirname, 'flows');
  const registry = await discoverFlows(flowsDir);
  const uniqueFlows = Array.from(new Set(registry.values()));

  if (LIST_ONLY) {
    console.log(`\n===============================================================`);
    console.log(`  DISCOVERED PLUGGABLE USER JOURNEY FLOWS (${uniqueFlows.length})`);
    console.log(`===============================================================`);
    for (const flow of uniqueFlows) {
      const isPjc = Boolean(flow.sourceCatalog);
      console.log(`  • [${flow.id}] ${flow.title} ${isPjc ? '(from PJC YAML)' : '(dedicated .flow.mjs)'}`);
      console.log(`    Description: ${flow.description || 'N/A'}`);
      console.log(`    Steps: ${flow.steps?.length || 0} | Feature: ${flow.pjc?.featureId || 'N/A'}`);
      console.log(`    Source: ${flow._sourceFile || flow.sourceCatalog}\n`);
    }
    return;
  }

  // Determine target flows
  const flowsToExecute = [];
  if (TARGET_FLOW) {
    const flow = registry.get(TARGET_FLOW);
    if (!flow) {
      console.error(`\n❌ Error: Flow '${TARGET_FLOW}' not found in registry.`);
      console.error(`Available flows: ${uniqueFlows.map((f) => f.id).join(', ')}`);
      process.exit(1);
    }
    flowsToExecute.push(flow);
  } else if (TARGET_PJC) {
    const matched = uniqueFlows.filter((f) => {
      return (
        f.id.includes(TARGET_PJC) ||
        f.pjc?.featureId?.includes(TARGET_PJC) ||
        f.sourceCatalog?.includes(TARGET_PJC)
      );
    });
    if (matched.length === 0) {
      console.error(`\n❌ Error: No PJC flows found matching filter '${TARGET_PJC}'.`);
      process.exit(1);
    }
    flowsToExecute.push(...matched);
  } else if (RUN_ALL) {
    flowsToExecute.push(...uniqueFlows);
  } else {
    // Default: run first registered flow or prompt
    if (uniqueFlows.length > 0) {
      const first = uniqueFlows[0];
      console.log(`ℹ No --flow specified, defaulting to first registered flow: '${first.id}'`);
      flowsToExecute.push(first);
    } else {
      console.error(`\n❌ Error: No flows found in ${flowsDir}`);
      process.exit(1);
    }
  }

  console.log(`\n===============================================================`);
  console.log(`  AGENTIC FLOW RUNNER · PLUGGABLE USER JOURNEY ENGINE`);
  console.log(`  Target Flows: ${flowsToExecute.map((f) => f.id).join(', ')}`);
  console.log(`  Engine: ${ENGINE.toUpperCase()} | Base URL: ${BASE_URL}`);
  console.log(`===============================================================\n`);

  const report = {
    metadata: {
      runner: 'agentic-flow-runner',
      engine: ENGINE,
      baseUrl: BASE_URL,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'RUNNING',
    },
    summary: {
      totalFlows: flowsToExecute.length,
      passedFlows: 0,
      failedFlows: 0,
      totalStepsExecuted: 0,
      totalAssertionsPassed: 0,
      totalAssertionsFailed: 0,
      totalAxePasses: 0,
      totalAxeViolations: 0,
    },
    flows: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Initialize adapters
  const stagehandAdapter = await createStagehandAdapter({ enabled: ENGINE === 'stagehand' });
  const midsceneAdapter = await createMidsceneAdapter(page, { enabled: ENGINE === 'midscene' });

  const tools = {
    mineScreen: (p) => mineScreen(p),
    auditModalFocusTrap: (p) => auditModalFocusTrap(p),
    auditA11y: (p, opts) => auditA11y(p, opts),
    stagehand: stagehandAdapter,
    midscene: midsceneAdapter,
  };

  try {
    for (const flow of flowsToExecute) {
      console.log(`\n---------------------------------------------------------------`);
      console.log(`▶ EXECUTING FLOW: [${flow.id}] ${flow.title}`);
      console.log(`  Scenario: ${flow.pjc?.scenarioId || 'N/A'}`);
      console.log(`---------------------------------------------------------------`);

      const flowExecution = {
        id: flow.id,
        title: flow.title,
        description: flow.description,
        pjc: flow.pjc,
        startTime: new Date().toISOString(),
        endTime: null,
        status: 'RUNNING',
        steps: [],
        error: null,
      };

      const flowState = {};
      let flowFailed = false;

      // Execute custom runner if flow provides one, else execute step array
      if (typeof flow.execute === 'function') {
        try {
          const result = await flow.execute({ page, context, browser, baseUrl: BASE_URL, tools, flowState });
          flowExecution.customResult = result;
        } catch (err) {
          flowFailed = true;
          flowExecution.error = err.message;
        }
      } else if (Array.isArray(flow.steps)) {
        for (let i = 0; i < flow.steps.length; i++) {
          const step = flow.steps[i];
          const stepIndex = i + 1;
          const stepRecord = {
            stepIndex,
            name: step.name,
            route: step.route || null,
            startTime: new Date().toISOString(),
            status: 'RUNNING',
            assertion: null,
            axeQuality: null,
            error: null,
          };

          console.log(`\n👉 [Step ${stepIndex}/${flow.steps.length}] ${step.name}`);

          try {
            // 1. Navigation
            if (step.route) {
              const fullUrl = step.route.startsWith('http') ? step.route : `${BASE_URL}${step.route}`;
              console.log(`   Navigating to ${fullUrl}...`);
              await page.goto(fullUrl, { waitUntil: 'networkidle' });
              await page.waitForTimeout(300);
            }

            // 2. Action
            if (typeof step.action === 'function') {
              console.log(`   Executing step action...`);
              await step.action({ page, context, browser, baseUrl: BASE_URL, tools, flowState });
              await page.waitForTimeout(200);
            }

            // 3. A11y Audit (if enabled on step)
            if (step.auditA11y) {
              const axeRes = await auditA11y(page);
              stepRecord.axeQuality = {
                passesCount: axeRes.passesCount,
                violationsCount: axeRes.violationsCount,
              };
              report.summary.totalAxePasses += axeRes.passesCount;
              report.summary.totalAxeViolations += axeRes.violationsCount;
              console.log(`   Axe A11y Audit: ${axeRes.passesCount} passes, ${axeRes.violationsCount} violations`);
            }

            // 4. Assertion
            if (typeof step.assert === 'function') {
              const assertResult = await step.assert({ page, context, browser, baseUrl: BASE_URL, tools, flowState });
              stepRecord.assertion = assertResult;
              if (assertResult.passed) {
                report.summary.totalAssertionsPassed++;
                console.log(`   ✔ Assertion Passed: ${assertResult.message || 'OK'}`);
              } else {
                report.summary.totalAssertionsFailed++;
                flowFailed = true;
                console.warn(`   ⚠ Assertion FAILED: ${assertResult.message || 'Assertion condition returned false'}`);
                console.warn(`     Expected: ${JSON.stringify(assertResult.expected)} | Actual: ${JSON.stringify(assertResult.actual)}`);
              }
            }

            stepRecord.status = flowFailed ? 'FAILED' : 'PASSED';
            stepRecord.endTime = new Date().toISOString();
            report.summary.totalStepsExecuted++;
          } catch (err) {
            flowFailed = true;
            stepRecord.status = 'ERROR';
            stepRecord.error = err.message;
            stepRecord.endTime = new Date().toISOString();
            console.error(`   ❌ Step Error: ${err.message}`);
          }

          flowExecution.steps.push(stepRecord);
          if (flowFailed) break; // Break step chain on failure
        }
      }

      flowExecution.status = flowFailed ? 'FAILED' : 'PASSED';
      flowExecution.endTime = new Date().toISOString();
      if (flowFailed) {
        report.summary.failedFlows++;
        console.log(`\n❌ FLOW [${flow.id}] FAILED`);
      } else {
        report.summary.passedFlows++;
        console.log(`\n✔ FLOW [${flow.id}] PASSED ALL VERIFICATIONS`);
      }

      report.flows.push(flowExecution);
    }
  } finally {
    await browser.close();
    await stagehandAdapter.close?.();
  }

  report.metadata.endTime = new Date().toISOString();
  report.metadata.status = report.summary.failedFlows === 0 ? 'SUCCESS' : 'FAILED';

  // Write Reports
  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✔ JSON Report saved to: ${REPORT_PATH}`);

  const htmlReport = generateHtmlReport(report);
  writeFileSync(HTML_REPORT_PATH, htmlReport, 'utf-8');
  console.log(`✔ Interactive HTML Report saved to: ${HTML_REPORT_PATH}`);

  console.log(`\n===============================================================`);
  console.log(`  EXECUTION SUMMARY`);
  console.log(`  Flows: ${report.summary.passedFlows}/${report.summary.totalFlows} passed`);
  console.log(`  Steps: ${report.summary.totalStepsExecuted} executed`);
  console.log(`  Assertions: ${report.summary.totalAssertionsPassed} passed, ${report.summary.totalAssertionsFailed} failed`);
  console.log(`  Axe WCAG: ${report.summary.totalAxePasses} passed, ${report.summary.totalAxeViolations} violations`);
  console.log(`===============================================================\n`);

  if (report.metadata.status !== 'SUCCESS') {
    process.exit(1);
  }
}

function generateHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agentic User Journey & Interaction Feedback Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
    h1 { font-size: 1.75rem; color: #38bdf8; margin-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .badge.success { background: #065f46; color: #34d399; }
    .badge.failed { background: #991b1b; color: #f87171; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .metric-card { background: #1e293b; padding: 1rem; border-radius: 0.5rem; border: 1px solid #334155; }
    .metric-val { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    .flow-card { background: #1e293b; border-radius: 0.5rem; border: 1px solid #334155; margin-bottom: 1.5rem; overflow: hidden; }
    .flow-header { padding: 1rem; background: #243248; display: flex; justify-content: space-between; align-items: center; }
    .step-list { padding: 1rem; }
    .step-item { padding: 0.75rem; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .step-item:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <h1>Agentic User Journey Report</h1>
  <div>Status: <span class="badge ${report.metadata.status === 'SUCCESS' ? 'success' : 'failed'}">${report.metadata.status}</span> · Engine: ${report.metadata.engine.toUpperCase()}</div>
  <div class="metrics">
    <div class="metric-card"><div class="metric-val">${report.summary.passedFlows} / ${report.summary.totalFlows}</div><div>Flows Passed</div></div>
    <div class="metric-card"><div class="metric-val">${report.summary.totalAssertionsPassed}</div><div>Assertions Passed</div></div>
    <div class="metric-card"><div class="metric-val">${report.summary.totalAxePasses}</div><div>Axe Rules Passed</div></div>
    <div class="metric-card"><div class="metric-val">${report.summary.totalAxeViolations}</div><div>Axe Violations</div></div>
  </div>
  <h2>Flow Executions</h2>
  ${report.flows
    .map(
      (f) => `
    <div class="flow-card">
      <div class="flow-header">
        <div><strong>[${f.id}] ${f.title}</strong><div style="font-size: 0.85rem; color: #94a3b8;">${f.pjc?.scenarioId || ''}</div></div>
        <span class="badge ${f.status === 'PASSED' ? 'success' : 'failed'}">${f.status}</span>
      </div>
      <div class="step-list">
        ${f.steps
          .map(
            (s) => `
          <div class="step-item">
            <div>
              <strong>Step ${s.stepIndex}: ${s.name}</strong>
              <div style="font-size: 0.8rem; color: #94a3b8;">${s.assertion?.message || (s.error ? 'Error: ' + s.error : 'Completed')}</div>
            </div>
            <span class="badge ${s.status === 'PASSED' ? 'success' : 'failed'}">${s.status}</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
}

main().catch((err) => {
  console.error('\nFatal Agentic Flow Runner Exception:', err);
  process.exit(1);
});
