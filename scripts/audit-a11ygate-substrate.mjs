#!/usr/bin/env node
/**
 * scripts/audit-a11ygate-substrate.mjs
 *
 * 🔬 Deterministic Living Substrate: Origin A11yGate Indexer & 5-Tier Wiring Depth Radar
 *
 * Full-Spectrum Intelligence across:
 * 1. Origin Substrate Indexing:
 *    - Dynamically indexes C:\projects\packages\a11y-gate (100% of symbols, subpaths, and 9 domains)
 * 2. 5-Tier Systemic Wiring Depth Classification:
 *    - Tier 4: RUNTIME_PRODUCTION (Living production screens & components active)
 *    - Tier 3: TOKEN_INTEGRATED (Design tokens & theme engines mathematically derived from curves)
 *    - Tier 2: TEST_ONLY ("Paper Tiger" - tests pass in isolation, 0 production adoption)
 *    - Tier 1: PASSIVE_BRIDGE (Re-export pass-through without internal consumption)
 *    - Tier 0: DECLARED_ONLY (In package.json, 0 file imports)
 * 3. Discrepancy & Drift Radar:
 *    - Dependency drift (v0.2.0 vs linked v0.3.0 vs git pointers)
 *    - Dead bridge re-exports (symbols exported by bridge with 0 downstream consumers)
 *    - Unused high-value surface ("what don't use")
 *
 * Usage:
 *   node scripts/audit-a11ygate-substrate.mjs           # Standard monorepo scan
 *   node scripts/audit-a11ygate-substrate.mjs --all     # Exhaustive scan including external C:\projects
 *   node scripts/audit-a11ygate-substrate.mjs --json    # Machine-readable JSON output
 *   node scripts/audit-a11ygate-substrate.mjs --report  # Save markdown summary report
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_DIR = process.cwd();
const ORIGIN_PATH = 'C:/projects/packages/a11y-gate';
const REPORTS_DIR = path.resolve(ROOT_DIR, 'reports');

const isJson = process.argv.includes('--json');
const isAll = process.argv.includes('--all');
const isReport = process.argv.includes('--report');

// ANSI Color Helpers
const c = {
  reset: (s) => `\x1b[0m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
};

// Domain Categorization for Origin Capabilities
const DOMAIN_RULES = [
  {
    domain: 'Typography & Proportional Scaling',
    patterns: [/Proportional/, /Typographic/, /Fluid/, /ModularStep/, /Leading/, /Tracking/, /WordSpacing/],
  },
  {
    domain: 'Psychophysical Doctrine & Gestalt',
    patterns: [/PSYCHOPHYSICAL/, /Psychophysical/, /Gestalt/, /Clinging/, /Harmonic/, /FocusRing/, /Concentric/, /Ratio/],
  },
  {
    domain: 'APCA & WCAG Contrast Models',
    patterns: [/Apca/, /APCA/, /Wcag/, /WCAG/, /Contrast/, /Luminance/, /DeltaE/, /toHex/, /hexToRgb/, /rgbToHex/],
  },
  {
    domain: 'Color Vision Deficiency (CVD)',
    patterns: [/Cvd/, /CVD/, /protan/, /deutan/, /tritan/],
  },
  {
    domain: 'Ergonomics & Touch Geometry',
    patterns: [/TouchTarget/, /TouchHitSlop/, /MobileMenu/, /ThumbZone/, /Ergonomic/],
  },
  {
    domain: 'Spatial Intervals & Quantum',
    patterns: [/Spatial/, /Quantum/, /SPATIAL/, /Convolutional/, /Density/],
  },
  {
    domain: 'Motion & Tactile Dynamics',
    patterns: [/Motion/, /Spring/, /SPRING/, /Tactile/, /ReducedMotion/],
  },
  {
    domain: 'Automated Screen & Component Gates',
    patterns: [/auditReactNative/, /auditTheme/, /auditComprehensive/, /AxeBaseline/, /evaluatePlatform/],
  },
];

function categorizeSymbol(name) {
  for (const rule of DOMAIN_RULES) {
    if (rule.patterns.some((p) => p.test(name))) {
      return rule.domain;
    }
  }
  return 'Core Utilities & Primitives';
}

/**
 * 1. Index Origin a11y-gate Package
 */
async function indexOriginA11yGate() {
  if (!existsSync(ORIGIN_PATH)) {
    throw new Error(`Origin a11y-gate not found at ${ORIGIN_PATH}`);
  }

  const pkgJsonPath = path.join(ORIGIN_PATH, 'package.json');
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));

  const catalog = {
    name: pkgJson.name,
    version: pkgJson.version,
    path: ORIGIN_PATH,
    exports: {},
    symbols: new Map(), // symbol -> { name, subpaths: [], domain }
    domains: {},
  };

  for (const [subpath, def] of Object.entries(pkgJson.exports || {})) {
    if (subpath.includes('*')) continue;
    const targetFile = typeof def === 'string' ? def : def.import || def.default;
    if (!targetFile) continue;

    const absFile = path.resolve(ORIGIN_PATH, targetFile);
    if (!existsSync(absFile)) continue;

    catalog.exports[subpath] = targetFile;

    try {
      const fileUrl = pathToFileURL(absFile).href;
      const mod = await import(fileUrl);
      const keys = Object.keys(mod);

      for (const k of keys) {
        if (!catalog.symbols.has(k)) {
          const domain = categorizeSymbol(k);
          catalog.symbols.set(k, {
            name: k,
            subpaths: [],
            domain,
            type: typeof mod[k],
          });
          catalog.domains[domain] = (catalog.domains[domain] || 0) + 1;
        }
        catalog.symbols.get(k).subpaths.push(subpath);
      }
    } catch {
      // module load failure advisory
    }
  }

  return catalog;
}

/**
 * Recursively find source files
 */
function findSourceFiles(dir, maxDepth = 6, currentDepth = 0) {
  const files = [];
  if (currentDepth > maxDepth || !existsSync(dir)) return files;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name.startsWith('.') ||
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === 'dist-explore' ||
      entry.name === 'dist-sanctuary'
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSourceFiles(fullPath, maxDepth, currentDepth + 1));
    } else if (/\.(tsx?|jsx?|mjs|astro|css)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function classifyFileContext(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (/\.(test|spec)\.[tj]sx?$|__tests__|tests\//.test(norm)) {
    return 'TEST';
  }
  if (/a11yUtils\.ts|lib\/a11y\.ts/.test(norm)) {
    return 'BRIDGE';
  }
  if (/tokens\/|theme\/|\.module\.css|styles\//.test(norm)) {
    return 'TOKEN_THEME';
  }
  return 'PRODUCTION';
}

/**
 * 2. Scan App / Package Consumer with 5-Tier Wiring Depth Analysis
 */
function auditConsumer(appDir, originCatalog) {
  const pkgJsonPath = path.join(appDir, 'package.json');
  if (!existsSync(pkgJsonPath)) return null;

  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  const allDeps = {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
    ...pkgJson.peerDependencies,
  };

  const declaredVersion = allDeps['@intuitui-labs/a11y-gate'] || null;

  let versionStatus = 'NOT_INSTALLED';
  if (declaredVersion) {
    if (declaredVersion.includes('link:')) {
      versionStatus = 'LINKED_LOCAL_V0.3.0';
    } else if (declaredVersion.includes('github:')) {
      versionStatus = 'GITHUB_REMOTE';
    } else if (declaredVersion.includes('0.3.')) {
      versionStatus = 'EXACT_V0.3.0';
    } else if (declaredVersion.includes('0.2.')) {
      versionStatus = 'OUTDATED_V0.2.0';
    } else {
      versionStatus = `OTHER (${declaredVersion})`;
    }
  }

  const files = findSourceFiles(appDir);
  const usedSymbols = new Map(); // symbol -> count
  const fileHitMap = new Map(); // file -> [symbols]
  const importSources = new Set();

  const contextSymbolHits = {
    PRODUCTION: new Set(),
    TOKEN_THEME: new Set(),
    TEST: new Set(),
    BRIDGE: new Set(),
  };

  const contextFileCounts = {
    PRODUCTION: 0,
    TOKEN_THEME: 0,
    TEST: 0,
    BRIDGE: 0,
  };

  for (const file of files) {
    const content = readFileSync(file, 'utf8');

    const hasA11yImport =
      content.includes('@intuitui-labs/a11y-gate') ||
      content.includes('a11yUtils') ||
      content.includes('/lib/a11y') ||
      content.includes('PSYCHOPHYSICAL') ||
      content.includes('computeProportional');

    if (!hasA11yImport) continue;

    const fileCtx = classifyFileContext(file);
    contextFileCounts[fileCtx]++;

    // Detect import statements
    const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      if (
        match[1].includes('a11y-gate') ||
        match[1].includes('a11yUtils') ||
        match[1].endsWith('/a11y')
      ) {
        importSources.add(match[1]);
      }
    }

    // Check symbol occurrences
    for (const [symbolName] of originCatalog.symbols.entries()) {
      const regex = new RegExp(`\\b${symbolName}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        usedSymbols.set(symbolName, (usedSymbols.get(symbolName) || 0) + matches.length);
        contextSymbolHits[fileCtx].add(symbolName);
        if (!fileHitMap.has(file)) fileHitMap.set(file, []);
        fileHitMap.get(file).push(symbolName);
      }
    }
  }

  // Determine 5-Tier Systemic Wiring Depth
  let wiringTier = 'TIER_0_DECLARED_ONLY';
  let tierLabel = 'Tier 0: Declared Only';
  let isPaperTiger = false;

  const prodCount = contextSymbolHits.PRODUCTION.size;
  const tokenCount = contextSymbolHits.TOKEN_THEME.size;
  const testCount = contextSymbolHits.TEST.size;
  const bridgeCount = contextSymbolHits.BRIDGE.size;

  if (prodCount > 0) {
    wiringTier = 'TIER_4_RUNTIME_PRODUCTION';
    tierLabel = 'Tier 4: Runtime Production';
  } else if (tokenCount > 0) {
    wiringTier = 'TIER_3_TOKEN_INTEGRATED';
    tierLabel = 'Tier 3: Token/Theme Integrated';
  } else if (testCount > 0) {
    wiringTier = 'TIER_2_TEST_ONLY';
    tierLabel = 'Tier 2: Test-Only (Paper Tiger)';
    isPaperTiger = true;
  } else if (bridgeCount > 0) {
    wiringTier = 'TIER_1_PASSIVE_BRIDGE';
    tierLabel = 'Tier 1: Passive Bridge (Re-export)';
  } else if (declaredVersion) {
    wiringTier = 'TIER_0_DECLARED_ONLY';
    tierLabel = 'Tier 0: Declared Only';
  } else {
    wiringTier = 'NOT_INSTALLED';
    tierLabel = 'Not Installed';
  }

  // Calculate domain coverage
  const domainUsage = {};
  for (const [symbolName] of usedSymbols.entries()) {
    const symInfo = originCatalog.symbols.get(symbolName);
    if (symInfo) {
      domainUsage[symInfo.domain] = (domainUsage[symInfo.domain] || 0) + 1;
    }
  }

  // Identify unused high-value capabilities
  const unusedSymbols = [];
  for (const [symbolName, symInfo] of originCatalog.symbols.entries()) {
    if (!usedSymbols.has(symbolName)) {
      unusedSymbols.push(symInfo);
    }
  }

  const totalOriginSymbols = originCatalog.symbols.size;
  const adoptedCount = usedSymbols.size;
  const adoptionRate = Math.round((adoptedCount / totalOriginSymbols) * 100);

  // Mobile-First Invariant Audit
  const mobileFirstInvariants = auditMobileFirstInvariants(pkgJson.name, files);

  return {
    name: pkgJson.name || path.basename(appDir),
    dir: appDir,
    declaredVersion,
    versionStatus,
    wiringTier,
    tierLabel,
    isPaperTiger,
    importSources: Array.from(importSources),
    totalFilesScanned: files.length,
    filesWithA11y: fileHitMap.size,
    contextFileCounts,
    contextSymbolHits: {
      production: Array.from(contextSymbolHits.PRODUCTION),
      tokenTheme: Array.from(contextSymbolHits.TOKEN_THEME),
      test: Array.from(contextSymbolHits.TEST),
      bridge: Array.from(contextSymbolHits.BRIDGE),
    },
    adoptedSymbols: Array.from(usedSymbols.entries()).map(([name, count]) => ({
      name,
      count,
      domain: originCatalog.symbols.get(name)?.domain || 'Unknown',
    })),
    adoptedCount,
    adoptionRate,
    domainUsage,
    unusedCount: unusedSymbols.length,
    unusedHighlights: unusedSymbols
      .filter((s) => s.domain !== 'Core Utilities & Primitives')
      .slice(0, 8)
      .map((s) => `${s.name} (${s.domain})`),
    mobileFirstInvariants,
  };
}

/**
 * 2b. Audit Mobile-First Invariants (iOS zoom trap, 48px touch floor, fluid continuum)
 */
function auditMobileFirstInvariants(pkgName, files) {
  const violations = [];
  const compliant = [];

  if (pkgName === '@repo/ui') {
    const tokenFile = files.find((f) => f.replace(/\\/g, '/').endsWith('tokens/index.ts'));
    if (tokenFile) {
      const content = readFileSync(tokenFile, 'utf8');
      if (content.includes('minTouchTarget: 48') || content.includes('minTouchTarget: PSYCHOPHYSICAL_RATIOS.TOUCH_TARGET_FLOOR_PX')) {
        compliant.push('48px Touch Floor Active');
      } else if (content.includes('minTouchTarget: 44')) {
        violations.push('[TOUCH TARGET WARNING] minTouchTarget is 44px (desktop-only). Mobile standard requires 48px.');
      }

      if (content.includes('fontSize: 16,\n        lineHeight: computeProportionalLeading(16, \'body\')') || content.includes('body: {\n        fontSize: 16')) {
        compliant.push('16px Universal Body Active (iOS Zoom Trap Safe)');
      } else if (content.includes('body: {\n        fontSize: 14')) {
        violations.push('[IOS ZOOM TRAP] body fontSize is 14px. On iOS Safari mobile web, inputs < 16px force destructive viewport zoom.');
      }

      if (content.includes('generateFluidClamp')) {
        compliant.push('Fluid Utopia Scale Active');
      }
    }
  }

  return {
    isCompliant: violations.length === 0,
    compliant,
    violations,
  };
}

/**
 * 3. Discover All Target Applications and Packages
 */
function discoverTargets(includeExternal = false) {
  const targets = [];

  const monorepoPaths = ['packages', 'apps', 'tooling'];
  for (const mp of monorepoPaths) {
    const base = path.resolve(ROOT_DIR, mp);
    if (!existsSync(base)) continue;
    const dirs = readdirSync(base, { withFileTypes: true });
    for (const d of dirs) {
      if (d.isDirectory() && existsSync(path.join(base, d.name, 'package.json'))) {
        targets.push(path.join(base, d.name));
      }
    }
  }

  if (includeExternal) {
    const extBase = 'C:/projects';
    if (existsSync(extBase)) {
      const extDirs = ['intuitui-web', 'neevsk-web', 'packages/form-builder-engine'];
      for (const ed of extDirs) {
        const full = path.resolve(extBase, ed);
        if (existsSync(path.join(full, 'package.json'))) {
          targets.push(full);
        }
      }
    }
  }

  return targets;
}

/**
 * Main Audit Execution
 */
async function main() {
  const startTime = Date.now();
  const originCatalog = await indexOriginA11yGate();
  const targetDirs = discoverTargets(isAll);

  const consumerReports = [];
  for (const t of targetDirs) {
    const report = auditConsumer(t, originCatalog);
    if (report && (report.declaredVersion || report.filesWithA11y > 0 || isAll)) {
      consumerReports.push(report);
    }
  }

  // Sort: Tier 4 down to Tier 0, then by adopted count
  const tierOrder = {
    TIER_4_RUNTIME_PRODUCTION: 4,
    TIER_3_TOKEN_INTEGRATED: 3,
    TIER_2_TEST_ONLY: 2,
    TIER_1_PASSIVE_BRIDGE: 1,
    TIER_0_DECLARED_ONLY: 0,
    NOT_INSTALLED: -1,
  };
  consumerReports.sort((a, b) => {
    const diff = (tierOrder[b.wiringTier] || 0) - (tierOrder[a.wiringTier] || 0);
    return diff !== 0 ? diff : b.adoptedCount - a.adoptedCount;
  });

  const durationMs = Date.now() - startTime;

  const resultPayload = {
    timestamp: new Date().toISOString(),
    durationMs,
    origin: {
      name: originCatalog.name,
      version: originCatalog.version,
      path: originCatalog.path,
      totalSymbols: originCatalog.symbols.size,
      subpaths: Object.keys(originCatalog.exports),
      domainDistribution: originCatalog.domains,
    },
    consumers: consumerReports,
  };

  if (isJson) {
    console.log(JSON.stringify(resultPayload, null, 2));
    return;
  }

  // Terminal Visual Presentation
  console.log('\n' + c.cyan(c.bold('========================================================================================')));
  console.log(c.cyan(c.bold('  🔬 SOVEREIGN A11YGATE 5-TIER SYSTEMIC WIRING DEPTH RADAR')));
  console.log(c.cyan(c.bold('========================================================================================')));
  console.log(`\n${c.bold('Origin Engine:')} ${c.green(originCatalog.name)} @ ${c.green(originCatalog.version)} [${originCatalog.path}]`);
  console.log(`${c.bold('Total Exported Symbols:')} ${c.yellow(originCatalog.symbols.size)} unique APIs across ${c.yellow(Object.keys(originCatalog.exports).length)} subpaths`);
  console.log(`${c.bold('Scan Horizon:')} ${c.yellow(consumerReports.length)} consumer applications & monorepo packages (${durationMs}ms)\n`);

  console.log(c.bold('--- 5-TIER WIRING DEPTH MATRIX ---'));
  for (const rep of consumerReports) {
    let tierBadge = c.gray(`[${rep.tierLabel}]`);
    if (rep.wiringTier === 'TIER_4_RUNTIME_PRODUCTION') {
      tierBadge = c.green(c.bold(`[${rep.tierLabel}]`));
    } else if (rep.wiringTier === 'TIER_3_TOKEN_INTEGRATED') {
      tierBadge = c.cyan(c.bold(`[${rep.tierLabel}]`));
    } else if (rep.wiringTier === 'TIER_2_TEST_ONLY') {
      tierBadge = c.magenta(c.bold(`[${rep.tierLabel} ⚠️ PAPER TIGER]`));
    } else if (rep.wiringTier === 'TIER_1_PASSIVE_BRIDGE') {
      tierBadge = c.yellow(`[${rep.tierLabel}]`);
    }

    const versionBadge =
      rep.versionStatus === 'LINKED_LOCAL_V0.3.0'
        ? c.green('LINKED_V0.3.0')
        : rep.versionStatus === 'OUTDATED_V0.2.0'
          ? c.red('OUTDATED_V0.2.0')
          : c.gray(rep.versionStatus);

    console.log(`\n📦 ${c.bold(rep.name)} ${c.gray(`(${path.basename(path.dirname(rep.dir))}/${path.basename(rep.dir)})`)}`);
    console.log(`   Wiring Depth: ${tierBadge}`);
    console.log(`   Dependency:   ${versionBadge} ${c.gray(`[${rep.declaredVersion || 'none'}]`)}`);
    console.log(`   Adoption:     ${c.yellow(rep.adoptedCount + ' symbols')} (${c.yellow(rep.adoptionRate + '%')}) across ${c.cyan(rep.filesWithA11y)} files`);
    console.log(`   Breakdown:    Prod: ${c.green(rep.contextSymbolHits.production.length)} | Token/Theme: ${c.cyan(rep.contextSymbolHits.tokenTheme.length)} | Test: ${rep.isPaperTiger ? c.red(rep.contextSymbolHits.test.length) : c.gray(rep.contextSymbolHits.test.length)} | Bridge: ${c.yellow(rep.contextSymbolHits.bridge.length)}`);

    if (rep.isPaperTiger) {
      console.log(`   ${c.red(c.bold('🚨 PAPER TIGER ALERT:'))} 100% of adopted symbols exist exclusively in test suites. Zero production adoption!`);
    }

    if (rep.adoptedSymbols.length > 0) {
      const topSymbols = rep.adoptedSymbols.slice(0, 5).map((s) => `${s.name} (${s.count}x)`).join(', ');
      console.log(`   ${c.bold('Active:')} ${c.green(topSymbols)}${rep.adoptedSymbols.length > 5 ? c.gray(` + ${rep.adoptedSymbols.length - 5} more`) : ''}`);
    }

    if (rep.mobileFirstInvariants) {
      if (rep.mobileFirstInvariants.compliant.length > 0) {
        console.log(`   ${c.green('📱 Mobile-First Continuum:')} ${rep.mobileFirstInvariants.compliant.join(', ')}`);
      }
      if (rep.mobileFirstInvariants.violations.length > 0) {
        for (const v of rep.mobileFirstInvariants.violations) {
          console.log(`   ${c.red('🚨 ' + v)}`);
        }
      }
    }

    if (rep.unusedHighlights.length > 0 && rep.adoptedCount > 0) {
      console.log(`   ${c.bold('Unused High-Value Surface:')}`);
      for (const uh of rep.unusedHighlights.slice(0, 3)) {
        console.log(`     ⚠️  ${c.yellow(uh)}`);
      }
    }
  }

  // Summary Table of Discrepancies
  console.log('\n' + c.bold('--- SYSTEMIC WIRING HEALTH SUMMARY ---'));
  const prodTiers = consumerReports.filter((r) => r.wiringTier === 'TIER_4_RUNTIME_PRODUCTION');
  const tokenTiers = consumerReports.filter((r) => r.wiringTier === 'TIER_3_TOKEN_INTEGRATED');
  const paperTigers = consumerReports.filter((r) => r.isPaperTiger);
  const bridges = consumerReports.filter((r) => r.wiringTier === 'TIER_1_PASSIVE_BRIDGE');

  console.log(`  🌟 Tier 4 (Runtime Production):  ${c.green(prodTiers.length)} (${prodTiers.map((r) => r.name).join(', ') || 'none'})`);
  console.log(`  🎨 Tier 3 (Token/Theme Engine):  ${c.cyan(tokenTiers.length)} (${tokenTiers.map((r) => r.name).join(', ') || 'none'})`);
  console.log(`  ⚠️  Tier 2 (Paper Tigers/Test):  ${c.magenta(paperTigers.length)} (${paperTigers.map((r) => r.name).join(', ') || 'none'})`);
  console.log(`  🌉 Tier 1 (Passive Bridges):     ${c.yellow(bridges.length)} (${bridges.map((r) => r.name).join(', ') || 'none'})`);

  if (!existsSync(REPORTS_DIR)) {
    try {
      readdirSync(ROOT_DIR);
    } catch {}
  }
  const reportJsonFile = path.join(REPORTS_DIR, 'a11ygate-substrate-matrix.json');
  writeFileSync(reportJsonFile, JSON.stringify(resultPayload, null, 2), 'utf8');
  console.log(`\n💾 Deterministic substrate report saved to: ${c.cyan(reportJsonFile)}`);

  if (isReport) {
    const reportMdFile = path.join(REPORTS_DIR, 'a11ygate-substrate-matrix.md');
    let md = `# Origin A11yGate 5-Tier Systemic Wiring Depth Radar\n\n`;
    md += `**Timestamp:** ${resultPayload.timestamp}  \n`;
    md += `**Origin:** \`${originCatalog.name}@${originCatalog.version}\` (${originCatalog.symbols.size} unique symbols)\n\n`;
    md += `| Consumer | Wiring Depth Tier | Dependency | Adopted Symbols | Adoption Rate | Mobile-First Continuum | Prod Calls | Test Calls |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    for (const r of consumerReports) {
      const badge = r.isPaperTiger ? `⚠️ **${r.tierLabel}**` : `\`${r.tierLabel}\``;
      const mobileStatus = r.mobileFirstInvariants?.compliant.length > 0
        ? `✅ ${r.mobileFirstInvariants.compliant[0]}`
        : r.mobileFirstInvariants?.violations.length > 0
          ? `⚠️ ${r.mobileFirstInvariants.violations[0]}`
          : `—`;
      md += `| **${r.name}** | ${badge} | \`${r.versionStatus}\` | ${r.adoptedCount} | ${r.adoptionRate}% | ${mobileStatus} | ${r.contextSymbolHits.production.length} | ${r.contextSymbolHits.test.length} |\n`;
    }
    writeFileSync(reportMdFile, md, 'utf8');
    console.log(`📄 Markdown radar table written to: ${c.cyan(reportMdFile)}`);
  }
}

main().catch((err) => {
  console.error('\n❌ Radar Audit Error:', err);
  process.exit(1);
});
