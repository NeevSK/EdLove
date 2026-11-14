#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_OUTPUT_PATH = path.join(ROOT_DIR, 'reports/catalog-parity-audit.json');
const DASHBOARD_HTML_PATH = path.join(ROOT_DIR, 'docs/atlas/domain-role-flow-dashboard.html');

// 1. Roles recognized across Gurudevi Platform
export const RECOGNIZED_ROLES = [
  'founder',
  'principal',
  'assistantPrincipal',
  'sectionHead',
  'gradeHead',
  'teacher',
  'student',
  'guardian',
  'parent',
  'developer',
];

// Helper to extract object literals from TypeScript code via regex/ast
function parseRegistryFile(filePath, registryExportName) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');

  // Find export const REGISTRY_NAME = { ... }
  const exportIdx = content.indexOf(`export const ${registryExportName}`);
  if (exportIdx === -1) return {};

  const openBraceIdx = content.indexOf('{', exportIdx);
  if (openBraceIdx === -1) return {};

  // Simple key finder for entries in registry
  const entries = {};
  const entryPattern = /^\s{2}['"]?([a-zA-Z0-9_\.-]+)['"]?\s*:\s*\{/gm;
  let match;
  const indices = [];

  while ((match = entryPattern.exec(content)) !== null) {
    if (match.index > exportIdx) {
      indices.push({ key: match[1], start: match.index });
    }
  }

  for (let i = 0; i < indices.length; i++) {
    const cur = indices[i];
    const nextStart = i + 1 < indices.length ? indices[i + 1].start : content.length;
    const block = content.slice(cur.start, nextStart);

    // Extract fields
    const id = (block.match(/id:\s*['"]([^'"]+)['"]/) || [])[1] || cur.key;
    const label = (block.match(/label:\s*['"]([^'"]+)['"]/) || [])[1] || id;
    const description = (block.match(/description:\s*['"]([^'"]+)['"]/) || [])[1] || '';
    const ownerPackage = (block.match(/ownerPackage:\s*['"]([^'"]+)['"]/) || [])[1] || 'core';
    const state = (block.match(/state:\s*['"]([^'"]+)['"]/) || [])[1] || 'live';
    const tabDomain = (block.match(/tabDomain:\s*['"]([^'"]+)['"]/) || [])[1] || ownerPackage;
    const citizenshipRequired = Number((block.match(/citizenshipRequired:\s*(\d+)/) || [])[1] ?? 3);
    const mobileSupport = !/mobileSupport:\s*false/.test(block);
    const webSupport = !/webSupport:\s*false/.test(block);
    const flowId = (block.match(/flowId:\s*['"]([^'"]+)['"]/) || [])[1] || null;

    // Capability
    const capAction = (block.match(/capabilityRequirement:\s*\{\s*action:\s*['"]([^'"]+)['"]/) || [])[1];
    const capSubject = (block.match(/subject:\s*['"]([^'"]+)['"]/) || [])[1];
    const capability = capAction && capSubject ? `${capAction}:${capSubject}` : null;

    // Target personas in journey
    const personasMatch = block.match(/targetPersonas:\s*\[([^\]]+)\]/);
    let targetPersonas = [];
    if (personasMatch) {
      targetPersonas = personasMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/['"]/g, ''))
        .filter(Boolean);
    } else {
      // Infer based on id/domain heuristics
      if (id.includes('teacher')) targetPersonas = ['teacher'];
      else if (id.includes('student')) targetPersonas = ['student'];
      else if (id.includes('principal')) targetPersonas = ['principal', 'assistantPrincipal'];
      else if (id.includes('section-head')) targetPersonas = ['sectionHead'];
      else if (id.includes('grade-head')) targetPersonas = ['gradeHead'];
      else if (id.includes('guardian')) targetPersonas = ['guardian', 'parent'];
      else if (ownerPackage === 'self' || ownerPackage === 'community' || ownerPackage === 'library') {
        targetPersonas = ['student', 'teacher', 'guardian', 'principal', 'founder'];
      } else {
        targetPersonas = ['founder', 'principal'];
      }
    }

    // Journey steps
    const stepCount = (block.match(/step:\s*\d+/g) || []).length;
    const entryRoute = (block.match(/entryRoute:\s*['"]([^'"]+)['"]/) || [])[1] || null;

    entries[cur.key] = {
      id,
      label,
      description,
      ownerPackage,
      tabDomain,
      state,
      citizenshipRequired,
      mobileSupport,
      webSupport,
      capability,
      targetPersonas,
      stepCount,
      entryRoute,
      flowId,
      source: 'AppCatalog',
    };
  }

  return entries;
}

// 2. Parse FEATURE_CATALOG from packages/self/src/features/featureCatalog.ts
function parseFeatureCatalog() {
  const filePath = path.join(ROOT_DIR, 'packages/self/src/features/featureCatalog.ts');
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');

  const exportIdx = content.indexOf('export const FEATURE_CATALOG');
  if (exportIdx === -1) return {};

  const entries = {};
  const entryPattern = /^\s{2}([a-zA-Z0-9_]+)\s*:\s*\{/gm;
  let match;
  const indices = [];

  while ((match = entryPattern.exec(content)) !== null) {
    if (match.index > exportIdx) {
      indices.push({ key: match[1], start: match.index });
    }
  }

  for (let i = 0; i < indices.length; i++) {
    const cur = indices[i];
    const nextStart = i + 1 < indices.length ? indices[i + 1].start : content.length;
    const block = content.slice(cur.start, nextStart);

    const id = (block.match(/id:\s*['"]([^'"]+)['"]/) || [])[1] || cur.key;
    const label = (block.match(/label:\s*['"]([^'"]+)['"]/) || [])[1] || id;
    const emoji = (block.match(/emoji:\s*['"]([^'"]+)['"]/) || [])[1] || '✨';
    const category = (block.match(/category:\s*['"]([^'"]+)['"]/) || [])[1] || 'practice';
    const domain = (block.match(/domain:\s*['"]([^'"]+)['"]/) || [])[1] || 'self';
    const minCitizenship = Number((block.match(/minCitizenship:\s*(\d+)/) || [])[1] ?? 3);
    const flowId = (block.match(/flowId:\s*['"]([^'"]+)['"]/) || [])[1] || null;

    // Required capabilities
    const capsMatch = block.match(/requiredCapabilities:\s*\[([^\]]+)\]/);
    const capabilities = capsMatch
      ? capsMatch[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
      : [];

    // Role weights -> active personas
    const weightsMatch = block.match(/roleWeights:\s*\{([^}]+)\}/);
    let targetPersonas = ['student', 'teacher', 'guardian', 'principal', 'founder'];
    if (weightsMatch) {
      const activeRoles = [];
      for (const r of RECOGNIZED_ROLES) {
        if (weightsMatch[1].includes(r)) activeRoles.push(r);
      }
      if (activeRoles.length > 0) targetPersonas = activeRoles;
    }

    entries[cur.key] = {
      id,
      label: `${emoji} ${label}`,
      description: `Self ${category} micro-practice in ${domain}`,
      ownerPackage: 'self',
      tabDomain: 'self',
      state: 'live',
      citizenshipRequired: minCitizenship,
      mobileSupport: true,
      webSupport: true,
      capability: capabilities.join(', ') || 'practice:self',
      targetPersonas,
      stepCount: 1,
      entryRoute: '/self',
      flowId,
      source: 'FeatureCatalog (Self)',
    };
  }

  return entries;
}

// 3. Known Registered Modular Flows in @repo/core/src/flows
const KNOWN_MODULAR_FLOWS = {
  'flow:classroom:teacher_roll_call': {
    id: 'flow:classroom:teacher_roll_call',
    title: 'Morning Class Roll Call & Attendance Pulse',
    domain: 'classroom',
    roles: ['teacher'],
    triggersCount: 3,
    stepsCount: 3,
    fallbacksCount: 2,
    hasOfflineVault: true,
  },
  'flow:classroom:student_claim_pass': {
    id: 'flow:classroom:student_claim_pass',
    title: 'Day-0 Student Desk Pass Verification & Claim',
    domain: 'classroom',
    roles: ['student'],
    triggersCount: 3,
    stepsCount: 3,
    fallbacksCount: 2,
    hasOfflineVault: true,
  },
  'flow:admin:guardian_link_child': {
    id: 'flow:admin:guardian_link_child',
    title: 'Guardian Child Desk Pass Link & Bond Verification',
    domain: 'admin',
    roles: ['guardian', 'parent'],
    triggersCount: 3,
    stepsCount: 3,
    fallbacksCount: 2,
    hasOfflineVault: true,
  },
  'flow:admin:principal_term_setup': {
    id: 'flow:admin:principal_term_setup',
    title: 'Academic Term Foundation & School Hierarchy Setup',
    domain: 'admin',
    roles: ['principal', 'assistantPrincipal'],
    triggersCount: 2,
    stepsCount: 3,
    fallbacksCount: 2,
    hasOfflineVault: false,
  },
  'flow:self:mindful_breath': {
    id: 'flow:self:mindful_breath',
    title: 'Somatic Equilibrium & Mindful Breath Sync',
    domain: 'self',
    roles: ['student', 'teacher', 'guardian', 'principal', 'founder'],
    triggersCount: 3,
    stepsCount: 3,
    fallbacksCount: 2,
    hasOfflineVault: true,
  },
};

// 4. Main Harvester & Parity Computer
export function harvestCatalogParity() {
  const startTime = Date.now();

  const appCatalogRegistries = {
    self: parseRegistryFile(path.join(ROOT_DIR, 'packages/self/src/constants/selfRegistry.ts'), 'SELF_REGISTRY'),
    classroom: parseRegistryFile(path.join(ROOT_DIR, 'packages/classroom/src/constants/classroomRegistry.ts'), 'CLASSROOM_REGISTRY'),
    community: parseRegistryFile(path.join(ROOT_DIR, 'packages/community/src/constants/communityRegistry.ts'), 'COMMUNITY_REGISTRY'),
    library: parseRegistryFile(path.join(ROOT_DIR, 'packages/library/src/constants/libraryRegistry.ts'), 'LIBRARY_REGISTRY'),
    admin: parseRegistryFile(path.join(ROOT_DIR, 'packages/admin/src/constants/adminRegistry.ts'), 'ADMIN_REGISTRY'),
    ai: parseRegistryFile(path.join(ROOT_DIR, 'packages/ai/src/constants/aiRegistry.ts'), 'AI_REGISTRY'),
    formBuilder: parseRegistryFile(path.join(ROOT_DIR, 'packages/form-builder/src/constants/formBuilderRegistry.ts'), 'FORM_BUILDER_REGISTRY'),
    workforce: parseRegistryFile(path.join(ROOT_DIR, 'packages/workforce/src/constants/workforceRegistry.ts'), 'WORKFORCE_REGISTRY'),
  };

  const featureCatalogEntries = parseFeatureCatalog();

  // Combine into unified catalog entries
  const allEntries = [];

  // Flatten AppCatalog
  for (const [dom, reg] of Object.entries(appCatalogRegistries)) {
    for (const [key, item] of Object.entries(reg)) {
      allEntries.push({ ...item, registryKey: key });
    }
  }

  // Add FeatureCatalog entries
  for (const [key, item] of Object.entries(featureCatalogEntries)) {
    allEntries.push({ ...item, registryKey: key });
  }

  // Deduplicate or correlate flow status
  const analyzedCatalog = allEntries.map((item) => {
    // Check if flowId exists or match heuristic
    let matchedFlow = null;
    if (item.flowId && KNOWN_MODULAR_FLOWS[item.flowId]) {
      matchedFlow = KNOWN_MODULAR_FLOWS[item.flowId];
    } else {
      // Heuristic match
      if (item.id === 'teacher' || item.id === 'teacher_roll_call') matchedFlow = KNOWN_MODULAR_FLOWS['flow:classroom:teacher_roll_call'];
      else if (item.id === 'student' || item.id === 'student_claim_pass') matchedFlow = KNOWN_MODULAR_FLOWS['flow:classroom:student_claim_pass'];
      else if (item.id === 'guardian-workspace' || item.id === 'guardian_link') matchedFlow = KNOWN_MODULAR_FLOWS['flow:admin:guardian_link_child'];
      else if (item.id === 'principal' || item.id === 'principal_setup') matchedFlow = KNOWN_MODULAR_FLOWS['flow:admin:principal_term_setup'];
      else if (item.id === 'breath_guide' || item.id === 'pulse') matchedFlow = KNOWN_MODULAR_FLOWS['flow:self:mindful_breath'];
    }

    const mappingStatus = matchedFlow ? 'mapped' : item.stepCount > 0 ? 'partial' : 'unmapped';

    return {
      ...item,
      matchedFlowId: matchedFlow ? matchedFlow.id : null,
      matchedFlowTitle: matchedFlow ? matchedFlow.title : null,
      flowTriggersCount: matchedFlow ? matchedFlow.triggersCount : 0,
      flowStepsCount: matchedFlow ? matchedFlow.stepsCount : item.stepCount,
      flowFallbacksCount: matchedFlow ? matchedFlow.fallbacksCount : 0,
      mappingStatus,
    };
  });

  // Calculate Parity Metrics
  const totalFeatures = analyzedCatalog.length;
  const mappedCount = analyzedCatalog.filter((f) => f.mappingStatus === 'mapped').length;
  const partialCount = analyzedCatalog.filter((f) => f.mappingStatus === 'partial').length;
  const unmappedCount = analyzedCatalog.filter((f) => f.mappingStatus === 'unmapped').length;
  const coveragePercent = Math.round((mappedCount / totalFeatures) * 100);

  // Role Parity Breakdown
  const roleParity = {};
  for (const role of RECOGNIZED_ROLES) {
    const roleFeatures = analyzedCatalog.filter((f) => f.targetPersonas.includes(role));
    const roleMapped = roleFeatures.filter((f) => f.mappingStatus === 'mapped');
    const rolePartial = roleFeatures.filter((f) => f.mappingStatus === 'partial');
    const roleUnmapped = roleFeatures.filter((f) => f.mappingStatus === 'unmapped');
    roleParity[role] = {
      role,
      totalAccessible: roleFeatures.length,
      mappedFlows: roleMapped.length,
      partialJourneys: rolePartial.length,
      unmappedGaps: roleUnmapped.length,
      coveragePercent: roleFeatures.length > 0 ? Math.round((roleMapped.length / roleFeatures.length) * 100) : 0,
      featureIds: roleFeatures.map((f) => f.id),
      unmappedFeatureIds: roleUnmapped.map((f) => f.id),
    };
  }

  // Domain Parity Breakdown
  const domains = ['classroom', 'self', 'community', 'library', 'admin', 'ai', 'form-builder', 'workforce'];
  const domainParity = {};
  for (const dom of domains) {
    const domFeatures = analyzedCatalog.filter((f) => f.ownerPackage === dom || f.tabDomain === dom);
    const domMapped = domFeatures.filter((f) => f.mappingStatus === 'mapped');
    const domPartial = domFeatures.filter((f) => f.mappingStatus === 'partial');
    const domUnmapped = domFeatures.filter((f) => f.mappingStatus === 'unmapped');
    domainParity[dom] = {
      domain: dom,
      totalFeatures: domFeatures.length,
      mappedFlows: domMapped.length,
      partialJourneys: domPartial.length,
      unmappedGaps: domUnmapped.length,
      coveragePercent: domFeatures.length > 0 ? Math.round((domMapped.length / domFeatures.length) * 100) : 0,
    };
  }

  const report = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    elapsedMs: Date.now() - startTime,
    summary: {
      totalDomains: domains.length,
      totalAppCatalogEntries: Object.values(appCatalogRegistries).reduce((acc, r) => acc + Object.keys(r).length, 0),
      totalSelfPracticeFeatures: Object.keys(featureCatalogEntries).length,
      totalCombinedFeatures: totalFeatures,
      mappedModularFlows: Object.keys(KNOWN_MODULAR_FLOWS).length,
      totalMappedFeatureInstances: mappedCount,
      totalPartialJourneys: partialCount,
      totalUnmappedGaps: unmappedCount,
      overallCoveragePercent: coveragePercent,
    },
    roleParity,
    domainParity,
    catalog: analyzedCatalog,
  };

  // Write JSON report
  fs.mkdirSync(path.dirname(REPORT_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_OUTPUT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[Parity Harvester] Ingested ${report.summary.totalCombinedFeatures} total features across ${domains.length} domains in ${report.elapsedMs}ms.`);
  console.log(`[Parity Harvester] AppCatalog: ${report.summary.totalAppCatalogEntries} | FeatureCatalog: ${report.summary.totalSelfPracticeFeatures} | Mapped Flows: ${report.summary.mappedModularFlows}`);
  console.log(`[Parity Harvester] Written to: ${path.relative(ROOT_DIR, REPORT_OUTPUT_PATH)}`);

  // Sync into HTML dashboard
  syncDashboardHtml(report);

  return report;
}

function syncDashboardHtml(report) {
  if (!fs.existsSync(DASHBOARD_HTML_PATH)) return;
  let html = fs.readFileSync(DASHBOARD_HTML_PATH, 'utf8');

  const startMarker = '/* __PARITY_AUDIT_DATA_START__ */';
  const endMarker = '/* __PARITY_AUDIT_DATA_END__ */';

  const injection = `${startMarker}\n    window.PARITY_AUDIT_DATA = ${JSON.stringify(report, null, 2)};\n    const PARITY_AUDIT_DATA = window.PARITY_AUDIT_DATA;\n    ${endMarker}`;

  if (html.includes(startMarker) && html.includes(endMarker)) {
    const regex = new RegExp(`${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`, 'm');
    html = html.replace(regex, injection);
  } else {
    // Inject right before </script>
    html = html.replace('</script>', `    ${injection}\n  </script>`);
  }

  fs.writeFileSync(DASHBOARD_HTML_PATH, html, 'utf8');
  console.log(`[Parity Harvester] Injected PARITY_AUDIT_DATA directly into ${path.relative(ROOT_DIR, DASHBOARD_HTML_PATH)}`);
}

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  harvestCatalogParity();
}

