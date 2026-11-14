import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Load all reports
const bypassesRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/seams-and-bypasses-audit.json'), 'utf8'));
const overlapsRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/semantic-overlaps-audit.json'), 'utf8'));
const folderRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/folder-ontology-audit.json'), 'utf8'));
const chronologyRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/bedrock-chronology.json'), 'utf8'));
const hierarchyRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/archetype-hierarchy-audit.json'), 'utf8'));
const fileTypesRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/canonical-file-types-audit.json'), 'utf8'));
const javaContaminationRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/java-contamination-audit.json'), 'utf8'));
const contaminationRaw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'reports/architectural-contamination.json'), 'utf8'));

const metaModel = {
  tools: [
    {
      id: 'file-archetypes',
      name: 'Canonical 12 File Archetypes & Taxonomy Sentinel',
      script: 'scripts/audit-canonical-file-types.mjs',
      category: 'File Taxonomy',
      purpose: 'Categorizes all 630 files in packages/core into the 12 Canonical Archetypes (Schema, Type, Port, Entity, Service, Adapter, Repository, Store, Slice, Hook, Flow, Barrel) to eliminate ambiguous Vibe Coder suffixes.',
      command: 'node scripts/audit-canonical-file-types.mjs',
      artifacts: ['reports/canonical-file-types-audit.json', 'docs/architecture/2026-11-01-canonical-file-archetypes-and-first-principles.md'],
      keyMetric: `12 Archetypes, ${fileTypesRaw.classifiedCount}/${fileTypesRaw.totalFiles} Core Files Classified (${Math.round((fileTypesRaw.classifiedCount / fileTypesRaw.totalFiles) * 100)}%)`,
    },
    {
      id: 'hierarchy',
      name: 'Canonical 7-Tier Archetype & Invariant Sentinel',
      script: 'scripts/audit-archetype-hierarchy.mjs',
      category: 'Architectural Hierarchy',
      purpose: 'Enforces the 7 Clean/Hexagonal Architectural Tiers (Schemas, Ports, Logic, Adapters, Stores, Hooks, UI). Detects Dependency Inversion violations (e.g. stores directly importing adapters) and schema runtime parsing in hooks.',
      command: 'node scripts/audit-archetype-hierarchy.mjs',
      artifacts: ['reports/archetype-hierarchy-audit.json', 'docs/architecture/2026-11-01-architectural-hierarchy-and-archetypes.md'],
      keyMetric: `7 Tiers, ${hierarchyRaw.violations.adapterCouplingCount} Adapter Couplings, ${hierarchyRaw.violations.schemaRuntimeInHookCount} Runtime Schemas in Hooks`,
    },
    {
      id: 'code-erd',
      name: 'Code-ERD & Topological Layer Engine',
      script: 'scripts/code-erd.mjs',
      category: 'Topology & AST',
      purpose: 'Discovers the full transitive dependency graph from any root component, extracts internal functions/types, and computes topological layers from bedrock leaves (out-degree 0).',
      command: 'node scripts/code-erd.mjs --target <root_component>',
      artifacts: ['reports/code-erd-explorer.html', 'apps/gurudevi-web/.../architectureData.json'],
      keyMetric: `${bypassesRaw.totalFiles} Subsystem Nodes, 14 Layers`,
    },
    {
      id: 'chronology',
      name: 'Bedrock Archaeology & Accretion Tracker',
      script: 'scripts/audit-layer-chronology.mjs',
      category: 'Historical Archaeology',
      purpose: 'Extracts git commit chronology (--follow) across all nodes to identify when Frankenstein ceremonies (like identityState.ts accretion) were introduced across 4 historical eras.',
      command: 'node scripts/audit-layer-chronology.mjs',
      artifacts: ['reports/bedrock-chronology-audit.md', 'reports/bedrock-chronology.json'],
      keyMetric: '31 Layer 0 Bedrock Files, 4 Eras (Feb-Nov 2026)',
    },
    {
      id: 'bypasses',
      name: 'Seam Clustering & Transitive Bypass Detector',
      script: 'scripts/analyze-seams-and-bypasses.mjs',
      category: 'Seams & Coupling',
      purpose: 'Clusters files into 7 architectural seams and detects diamond bypasses where upper layers (L12) reach around intermediate facades (L6/L11) to import lower-layer internals (L2/L0).',
      command: 'node scripts/analyze-seams-and-bypasses.mjs',
      artifacts: ['reports/seams-and-bypasses-audit.json'],
      keyMetric: `${bypassesRaw.bypassCount} Bypasses Detected (${bypassesRaw.sameSeamBypasses.length} Same-Seam)`,
    },
    {
      id: 'folder-ontology',
      name: 'Folder Ontology & Dispersion Auditor',
      script: 'scripts/audit-folder-ontology.mjs',
      category: 'Directory Architecture',
      purpose: 'Audits all 29 top-level folders in core to map hook dispersion (80 hooks), store dispersion (27 stores), utility overlap (lib vs utils vs shared), and framework leaks.',
      command: 'node scripts/audit-folder-ontology.mjs',
      artifacts: ['reports/folder-ontology-audit.json'],
      keyMetric: '841 Core Files across 29 Folders (Spans up to 10 Layers)',
    },
    {
      id: 'semantic-overlaps',
      name: 'Semantic Overlap & Redundancy Scanner',
      script: 'scripts/audit-semantic-overlaps.mjs',
      category: 'Semantic Duplication',
      purpose: 'Scans 4,057 exported symbols to isolate functional duplicates answering identical domain questions (e.g. 6 guest checkers, 5 button components, 6 storage wrappers).',
      command: 'node scripts/audit-semantic-overlaps.mjs',
      artifacts: ['reports/semantic-overlaps-audit.json'],
      keyMetric: '4,057 Symbols Audited (4 Critical Overlap Hotspots)',
    },
    {
      id: 'contamination-sentinel',
      name: 'Architectural Contamination & Modern React 19 Sentinel',
      script: 'scripts/check-architectural-contamination.mjs',
      category: 'Accretion & React 19 Modernization',
      purpose: 'Monorepo-wide AST/regex sentinel detecting Java OOP anti-patterns (GoF static singletons, useless pass-through wrappers, deadweight factories) and legacy React 18 patterns (forwardRef, useFormState, defaultProps, Zustand unselected subscriptions). Equipped with false-positive firewalls for Effect-TS, dispatchers, and grandfathered legacy ratchets.',
      command: 'pnpm run check:contamination (delta) | pnpm run audit:contamination (full)',
      artifacts: ['reports/architectural-contamination.json', 'docs/architecture/2026-11-01-canonical-file-archetypes-and-first-principles.md'],
      keyMetric: `3,219 Files Scanned: ${contaminationRaw.javaViolationsCount} Java OOP Violations, ${contaminationRaw.reactViolationsCount} React 18 Violations (${contaminationRaw.falsePositivesCount} False Positives Protected)`,
    },
  ],
  contaminationSummary: {
    scannedFiles: contaminationRaw.scannedFiles,
    totalViolations: contaminationRaw.violationsCount,
    javaViolations: contaminationRaw.javaViolationsCount,
    reactViolations: contaminationRaw.reactViolationsCount,
    debtCount: contaminationRaw.debtCount,
    falsePositivesProtected: contaminationRaw.falsePositivesCount,
    topViolations: contaminationRaw.violations.slice(0, 20),
    protectedFalsePositives: contaminationRaw.filteredFalsePositives,
  },
  javaContaminationSummary: {
    totalAnalyzed: javaContaminationRaw.totalAnalyzed,
    totalWithZeroAppCallers: javaContaminationRaw.totalWithZeroAppCallers,
    contaminationRate: javaContaminationRaw.contaminationRate,
    uselessPassThrough: javaContaminationRaw.uselessPassThrough,
    deadweightFactories: javaContaminationRaw.deadweightFactories,
    orphanedManagers: javaContaminationRaw.orphanedManagers,
    topContaminatedFiles: javaContaminationRaw.files.slice(0, 15),
  },
  fileTypesSummary: {
    totalFiles: fileTypesRaw.totalFiles,
    classifiedCount: fileTypesRaw.classifiedCount,
    unclassifiedCount: fileTypesRaw.unclassifiedCount,
    percentage: Math.round((fileTypesRaw.classifiedCount / fileTypesRaw.totalFiles) * 100),
    archetypes: fileTypesRaw.summary,
  },
  hierarchySummary: {
    totalTiers: hierarchyRaw.tiersSummary.length,
    tiers: hierarchyRaw.tiersSummary,
    violations: hierarchyRaw.violations,
  },
  bypassesSummary: {
    totalBypasses: bypassesRaw.bypassCount,
    sameSeamBypasses: bypassesRaw.sameSeamBypasses.length,
    useSanctuaryBypassesCount: bypassesRaw.bypasses.filter(b => b.from.includes('useSanctuaryFeature')).length,
    topSameSeam: bypassesRaw.sameSeamBypasses.slice(0, 15),
  },
  overlapsSummary: {
    totalExportedSymbols: overlapsRaw.totalExportedSymbols,
    totalFiles: overlapsRaw.totalAnalyzedFiles,
    guestCheckers: overlapsRaw.guestCheckOverlaps.map(g => ({ name: g.name, file: g.file })),
    storageWrappers: overlapsRaw.storageOverlaps.slice(0, 10).map(s => ({ name: s.name, file: s.file })),
    buttonComponents: overlapsRaw.buttonOverlaps.map(b => ({ name: b.name, file: b.file })),
    concepts: overlapsRaw.concepts,
  },
  foldersSummary: {
    totalFolders: folderRaw.length,
    topFolders: folderRaw.slice(0, 15),
  },
  chronologySummary: {
    eras: [
      { name: 'Era 1: Legacy Bootstrap', window: 'Feb – June 2026', focus: 'Basic Supabase session wrappers, PowerSync SQLite tables, 43-line identityState.ts.' },
      { name: 'Era 2: CASL Accretion', window: 'July – August 2026', focus: 'CASL rules, usePermissions hooks, Gluestack UI components, dynamic ability checks.' },
      { name: 'Era 3: Agentic Race Accretion', window: 'September 2026', focus: 'High churn (30-50 commits/file), auth race counters, suggestDisplayName, ad-hoc isLocalOnly.' },
      { name: 'Era 4: Canonical ReBAC', window: 'October – November 2026', focus: 'Immutable UUIDv8 account cutover, pure Bond Citizenship, synchronous O(1) evaluators, Code-ERD.' },
    ],
    bedrockFiles: chronologyRaw.filter(f => f.layer === 0).map(f => ({
      path: f.path,
      loc: f.loc,
      churn: f.commitCount,
      born: f.birthDate,
      verdict: f.verdict,
    })),
  },
};

const targetPath = path.join(ROOT_DIR, 'apps/gurudevi-web/app/(sanctuary)/architecture/toolsMetaModelData.json');
fs.writeFileSync(targetPath, JSON.stringify(metaModel, null, 2), 'utf8');
console.log(`✅ Bundled 7 tools & File Types Taxonomy to: ${targetPath}`);
