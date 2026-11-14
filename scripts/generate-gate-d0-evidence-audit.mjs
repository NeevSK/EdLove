#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = 'docs/architecture/gate-d0-evidence-audit.json';
const PROGRAMME = 'docs/architecture/2026-10-23-gate-d-human-first-platform-programme.md';
const ROUTE_INVENTORY = 'reports/atlas-route-inventory.json';
const CAPABILITY_INVENTORY = 'docs/architecture/gate-d0-capability-inventory.json';
const CAPABILITY_DISCOVERY = 'docs/architecture/gate-d0-capability-discovery.json';
const PACKAGE_INVENTORY = 'docs/architecture/gate-d0-package-consumer-inventory.json';
const SCOPE_REGISTER = 'docs/architecture/gate-d0-scope-drift-register.json';
const CAPABILITY_SCHEMA = 'docs/architecture/gate-d0-capability-inventory.schema.json';
const compareCodeUnits = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function read(relative) {
  try { return fs.readFileSync(path.join(ROOT, relative)); }
  catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`AUDIT_SOURCE_MISSING: ${relative}`);
    throw error;
  }
}

function readJson(relative) {
  return JSON.parse(read(relative).toString('utf8'));
}

function scopedD0Files() {
  const architecture = fs.readdirSync(path.join(ROOT, 'docs/architecture'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith('gate-d0'))
    .map((entry) => `docs/architecture/${entry.name}`);
  const scripts = fs.readdirSync(path.join(ROOT, 'scripts'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && (/^(?:generate|check)-gate-d0-.*\.mjs$/.test(entry.name) || entry.name === 'audit-route-inventory.mjs'))
    .map((entry) => `scripts/${entry.name}`);
  return [...new Set([...architecture, ROUTE_INVENTORY, ...scripts, PROGRAMME])]
    .filter((relative) => relative !== OUTPUT)
    .sort(compareCodeUnits);
}

function untrackedStatusByPath(paths) {
  const output = git(['status', '--porcelain=v1', '--untracked-files=all', '--', ...paths]);
  const statuses = new Map();
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const status = line.slice(0, 2);
    const relative = line.slice(3);
    if (status === '??') statuses.set(relative, 'untracked-addition');
  }
  return statuses;
}

function rule({ id, inventoryPath, surface, classification, assertionCount, sourcePaths, method, limitations }) {
  return {
    id,
    inventoryPath,
    surface,
    classification,
    assertionCount,
    sourcePaths: [...new Set(sourcePaths)].sort(compareCodeUnits),
    method,
    limitations,
  };
}

function auditRules(data) {
  const route = data.route;
  const pkg = data.package;
  const capability = data.capability;
  const discovery = data.discovery;
  const routeGenerator = 'scripts/audit-route-inventory.mjs';
  const packageGenerator = 'scripts/generate-gate-d0-package-inventory.mjs';
  const discoveryGenerator = 'scripts/generate-gate-d0-capability-discovery.mjs';
  const capabilityChecker = 'scripts/check-gate-d0-capability-inventory.mjs';
  const routeEvidencePaths = [...route.provenance.inputs, ROUTE_INVENTORY, routeGenerator];
  const packageEvidencePaths = [PACKAGE_INVENTORY, packageGenerator];
  const capabilityEvidencePaths = [...new Set(capability.records.flatMap((record) => record.evidence.map((item) => item.sourcePath)))];
  const capabilityValidationPaths = [CAPABILITY_INVENTORY, CAPABILITY_SCHEMA, capabilityChecker, ...capabilityEvidencePaths];
  const discoveryEvidencePaths = [CAPABILITY_DISCOVERY, CAPABILITY_INVENTORY, discoveryGenerator];
  const packageEdgeCount = pkg.packages.reduce((total, provider) => total + provider.consumers.length, 0);
  const packageReferenceCount = pkg.packages.reduce((total, provider) => total + provider.consumers.reduce((sum, consumer) => sum + consumer.references.length, 0), 0);
  const packageLexicalMentionCount = pkg.packages.reduce((total, provider) => total + provider.consumers.reduce((sum, consumer) => sum + consumer.references.reduce((count, ref) => count + ref.count, 0), 0), 0);
  const capabilityEvidenceCount = capability.records.reduce((total, record) => total + record.evidence.length, 0);
  const capabilityEffectCount = capability.records.reduce((total, record) => total + record.effects.length, 0);
  const capabilityEffectLinks = capability.records.reduce((total, record) => total + record.effects.reduce((sum, effect) => sum + effect.evidenceClaimIds.length, 0), 0);
  const capabilityDocumentClaims = capability.records.reduce((total, record) => total + record.documentClaims.length, 0);
  const capabilityClaimTextCount = capability.records.reduce((total, record) => total + record.evidence.length, 0);
  const routeUnsupportedConventionCount = route.routes.reduce((total, item) => total + item.unsupportedConventions.length, 0);
  const discoveredIntersectionCount = discovery.candidates.filter((candidate) => candidate.traceRelation === 'source-path-overlap-only').length;
  const discoveredNoIntersectionCount = discovery.candidates.filter((candidate) => candidate.traceRelation === 'no-source-path-overlap').length;

  return [
    rule({ id: 'route-filesystem-shapes', inventoryPath: ROUTE_INVENTORY, surface: 'routes[*].route,shape,file,mappingStatus,unsupportedConventions', classification: 'deterministic', assertionCount: route.routes.length + routeUnsupportedConventionCount, sourcePaths: routeEvidencePaths, method: 'The route generator walks selected app files, derives route shapes by removing route-group segments, and applies fixed path-pattern checks for unsupported conventions.', limitations: 'This establishes filesystem-shape mapping and recognized folder-pattern hits only; it does not prove Next.js compilation, routing semantics for unsupported conventions, authorization, runtime reachability, or product behavior.' }),
    rule({ id: 'route-candidate-labels', inventoryPath: ROUTE_INVENTORY, surface: 'routes[*].candidateClass and literalHrefProperties[*].candidateClass', classification: 'heuristic', assertionCount: route.routes.length + route.literalHrefProperties.length, sourcePaths: routeEvidencePaths, method: 'Rule-based labels infer product-candidate, prototype, or non-product-candidate from route/file name text.', limitations: 'Name/path heuristics can misclassify actual product purpose and are not a review of user-facing intent.' }),
    rule({ id: 'route-registry-literals', inventoryPath: ROUTE_INVENTORY, surface: 'literalHrefProperties[*].href,source', classification: 'deterministic', assertionCount: route.literalHrefProperties.length, sourcePaths: routeEvidencePaths, method: 'A lexical pattern extracts literal or template-literal href properties from selected registry files and records the source path.', limitations: 'Computed values, JSX hrefs, navigation calls, and imported registry data are outside the selected pattern.' }),
    rule({ id: 'route-registry-shape-classification', inventoryPath: ROUTE_INVENTORY, surface: 'literalHrefProperties[*].classification,status,shape and duplicateRouteShapes[*]', classification: 'deterministic', assertionCount: route.literalHrefProperties.length + route.duplicateRouteShapes.length, sourcePaths: routeEvidencePaths, method: 'Static path-string parsing and normalized shape equality compare literals with the selected filesystem route-shape set.', limitations: 'A shape match is not proof of route authorization, route compilation, navigation use, or runtime response; dynamic values are not evaluated.' }),
    rule({ id: 'route-scope-and-provenance', inventoryPath: ROUTE_INVENTORY, surface: 'schemaVersion,scope,provenance', classification: 'deterministic', assertionCount: 1, sourcePaths: routeEvidencePaths, method: 'The generator writes a fixed scope declaration and captures the selected input paths, content digest, Git revision/status digest, and observational capture metadata.', limitations: 'The route inventory check intentionally ignores observational timestamps/revision/working-tree metadata; scope is limited to declared page files and literal registry hrefs.' }),

    rule({ id: 'package-manifest-nodes', inventoryPath: PACKAGE_INVENTORY, surface: 'packages[*].name,directory,manifestExports and snapshot counts/hashes/deletion lists', classification: 'deterministic', assertionCount: pkg.packages.length + pkg.packages.reduce((sum, item) => sum + item.manifestExports.length, 0) + pkg.snapshot.trackedSourcePathsAbsentFromWorkingTree.length + pkg.snapshot.trackedPackageManifestsAbsentFromWorkingTree.length, sourcePaths: packageEvidencePaths, method: 'Current package records are derived from present immediate tracked manifests; export keys are copied from manifests; selected source/deletion lists and content digest follow the declared scope.', limitations: 'Manifest presence and export-key text do not prove export targets resolve, runtime import works, or the package capability is mature.' }),
    rule({ id: 'package-consumer-reference-rows', inventoryPath: PACKAGE_INVENTORY, surface: 'packages[*].consumers[*].references[*].file,count', classification: 'deterministic', assertionCount: packageReferenceCount, sourcePaths: packageEvidencePaths, method: 'The generator counts lexical @repo package-name occurrences in selected source text and adds direct manifest dependency-key references.', limitations: 'The counted occurrences may be comments or strings; aliases, dynamic resolution, AST meaning, and runtime use are not evaluated.' }),
    rule({ id: 'package-consumer-edges', inventoryPath: PACKAGE_INVENTORY, surface: 'packages[*].consumers[*] provider-to-consumer relationships', classification: 'heuristic', assertionCount: packageEdgeCount, sourcePaths: packageEvidencePaths, method: 'A consumer edge is inferred from one or more lexical package-name occurrences or a manifest dependency key.', limitations: 'This edge means a possible textual/package-manifest relation, not resolved import or runtime dependency.' }),
    rule({ id: 'package-reference-occurrences', inventoryPath: PACKAGE_INVENTORY, surface: 'packages[*].consumers[*].references[*].count', classification: 'deterministic', assertionCount: packageLexicalMentionCount, sourcePaths: packageEvidencePaths, method: 'Exact lexical match counts over selected current source bytes plus one count per direct package dependency key.', limitations: 'Occurrence count is not call count, resolved import count, or usage frequency.' }),
    rule({ id: 'package-method-and-provenance', inventoryPath: PACKAGE_INVENTORY, surface: 'title,generatedBy,generatorVersion,snapshot, captureProvenance,method', classification: 'deterministic', assertionCount: 1, sourcePaths: packageEvidencePaths, method: 'Fixed method/scope metadata and input/deletion-state hashes are emitted by the generator; Git revision and dirty state are observational provenance.', limitations: 'Deterministic snapshot freshness and observed Git state do not establish module resolution, runtime behavior, or review/commit status.' }),

    rule({ id: 'capability-review-claims', inventoryPath: CAPABILITY_INVENTORY, surface: 'records[*] reviewer-authored fields, evidence[*].claim, effects[*] semantic descriptions, and documentClaims[*]', classification: 'heuristic', assertionCount: capability.records.length + capabilityClaimTextCount + capabilityEffectCount + capabilityDocumentClaims, sourcePaths: capabilityValidationPaths, method: 'Ten bounded records and their claim/effect narratives were manually source-traced and written as reviewer interpretations.', limitations: 'The checker validates structure, links, and selected-source freshness only. It does not independently prove the narrative conclusions, runtime behavior, deployment, completeness, or governance.' }),
    rule({ id: 'capability-evidence-links', inventoryPath: CAPABILITY_INVENTORY, surface: 'records[*].evidence[*].claimId,sourcePath and effects[*].evidenceClaimIds', classification: 'deterministic', assertionCount: capabilityEvidenceCount + capabilityEffectLinks, sourcePaths: capabilityValidationPaths, method: 'Literal evidence/claim identifiers and source paths are checked for required structure, ordering, existence, and referential integrity by the capability checker.', limitations: 'Valid references prove linkage and snapshot freshness, not that the referenced source supports the human-authored claim.' }),
    rule({ id: 'capability-version-and-source-snapshot', inventoryPath: CAPABILITY_INVENTORY, surface: 'schemaVersion,sourceSnapshot.algorithm/sourcePaths/sha256 and checker-enforced record shape/order', classification: 'deterministic', assertionCount: 1, sourcePaths: [CAPABILITY_INVENTORY, CAPABILITY_SCHEMA, capabilityChecker], method: 'The checker recomputes the SHA-256 over listed evidence paths plus schema/checker contents and enforces structural invariants.', limitations: 'Freshness is not runtime proof and does not validate semantic judgments in record content.' }),

    rule({ id: 'discovery-lexical-signals', inventoryPath: CAPABILITY_DISCOVERY, surface: 'candidates[*].id,signal,signalMethod,evidenceSourcePaths,contractSourcePaths,handlerSourcePaths', classification: 'deterministic', assertionCount: discovery.candidates.length, sourcePaths: discoveryEvidencePaths, method: 'Fixed line-oriented lexical patterns extract top-level contract members and handler impl members; candidate IDs hash the signal plus sorted evidence paths.', limitations: 'Formatting variants and semantic aliases may be missed; extracted names are candidate signals, not confirmed capabilities.' }),
    rule({ id: 'discovery-candidate-meaning', inventoryPath: CAPABILITY_DISCOVERY, surface: 'candidates[*] interpreted as capability candidates', classification: 'heuristic', assertionCount: discovery.candidates.length, sourcePaths: discoveryEvidencePaths, method: 'Lexically discovered procedure-like names are presented as candidates for review.', limitations: 'A lexical member may not represent a user capability, and no candidate establishes behavior, maturity, authorization, persistence, or coverage.' }),
    rule({ id: 'discovery-trace-path-intersections', inventoryPath: CAPABILITY_DISCOVERY, surface: 'candidates[*].traceRelation,matchesExistingTracedCapabilityIds and intersection counts', classification: 'deterministic', assertionCount: discovery.candidates.length + discoveredIntersectionCount + discoveredNoIntersectionCount, sourcePaths: discoveryEvidencePaths, method: 'Exact set intersection compares candidate evidence source paths with each traced record’s cited evidence paths.', limitations: 'An intersection indicates shared cited file paths only, never that the candidate is the same capability. No intersection makes no semantic absence claim.' }),
    rule({ id: 'discovery-selection-and-snapshot-metadata', inventoryPath: CAPABILITY_DISCOVERY, surface: 'schemaVersion,selection,snapshot,counts', classification: 'deterministic', assertionCount: 1, sourcePaths: discoveryEvidencePaths, method: 'The generator records fixed lexical selection rules, sorted selected input paths and per-file/aggregate hashes, and counts derived from generated candidates.', limitations: 'The deterministic scope is limited to the declared tracked immediate contract/handler paths and lexical patterns.' }),
  ];
}

function generate() {
  const route = readJson(ROUTE_INVENTORY);
  const pkg = readJson(PACKAGE_INVENTORY);
  const capability = readJson(CAPABILITY_INVENTORY);
  const discovery = readJson(CAPABILITY_DISCOVERY);
  const scopedFiles = scopedD0Files();
  const inputPaths = scopedFiles;
  const inputHashes = inputPaths.map((relative) => ({ path: relative, sha256: sha256(read(relative)) }));
  const aggregate = createHash('sha256');
  for (const item of inputHashes) aggregate.update(item.path).update('\0').update(item.sha256).update('\0');
  const untracked = untrackedStatusByPath(scopedFiles);
  const deliveryEntries = [...untracked.entries()].sort(([left], [right]) => compareCodeUnits(left, right)).map(([relative, status]) => ({ path: relative, sha256: sha256(read(relative)), rawBaselineStatus: status }));
  const rules = auditRules({ route, package: pkg, capability, discovery });

  return {
    schemaVersion: '1.0.0',
    title: 'Gate D0 generated evidence and raw-baseline audit',
    semantics: 'Classifications apply to generated fields and edge interpretations in the four scoped inventory artifacts. Deterministic means repeatable from the declared selected inputs and algorithm; heuristic means a lexical or human semantic interpretation that is not established by repeatability alone. Per-rule assertion counts can overlap and are not a unique total of all JSON fields.',
    selfReferencePolicy: 'This report is excluded from its own source snapshot and raw-baseline delivery manifest to avoid recursive self-hashing. Its generator is included and hashed. The delivery manifest is a bounded review aid and cannot replace a Git staged or committed diff.',
    freshnessBoundary: 'This report hashes the scoped D0 artifacts and generators. It does not run their dedicated source-freshness checkers; run those checkers separately before relying on the inventories as current. Underlying product-source paths may be cited by classification rules but are not added to this report’s bounded D0 source snapshot.',
    sourceSnapshot: {
      algorithm: 'sha256',
      sourcePaths: inputPaths,
      sourceHashes: inputHashes,
      sha256: aggregate.digest('hex'),
    },
    inventoryCounts: {
      routeFiles: route.routes.length,
      registryHrefProperties: route.literalHrefProperties.length,
      packageRecords: pkg.packages.length,
      packageConsumerEdges: pkg.packages.reduce((total, provider) => total + provider.consumers.length, 0),
      tracedCapabilityRecords: capability.records.length,
      capabilityDiscoveryCandidates: discovery.candidates.length,
    },
    classificationCounts: {
      deterministicRuleCount: rules.filter((item) => item.classification === 'deterministic').length,
      heuristicRuleCount: rules.filter((item) => item.classification === 'heuristic').length,
      sumOfPerRuleAssertionCounts: rules.reduce((total, item) => total + item.assertionCount, 0),
    },
    classifications: rules,
    deliveryManifest: {
      semantics: 'Lists only in-scope files whose raw Git porcelain baseline status is exactly untracked (??). Each listed file has a SHA-256 of its current bytes. This status does not mean staged, reviewed, committed, or accepted.',
      rawBaselineCommand: 'git status --porcelain=v1 --untracked-files=all',
      rawBaselineStatus: 'untracked-addition',
      entryCount: deliveryEntries.length,
      entries: deliveryEntries,
    },
  };
}

let expected;
try { expected = `${JSON.stringify(generate(), null, 2)}\n`; }
catch (error) {
  console.error(`Gate D0 evidence audit failed: ${error instanceof Error ? error.message : String(error)}. No report was written.`);
  process.exit(1);
}

const outputPath = path.join(ROOT, OUTPUT);
if (process.argv.includes('--check')) {
  let current;
  try { current = fs.readFileSync(outputPath, 'utf8'); }
  catch (error) {
    if (error?.code === 'ENOENT') {
      console.error(`D0_AUDIT_STALE: report is missing: ${OUTPUT}. Run: node scripts/generate-gate-d0-evidence-audit.mjs`);
      process.exit(1);
    }
    throw error;
  }
  if (current !== expected) {
    console.error(`D0_AUDIT_STALE: selected inputs or raw-baseline manifest changed. Run: node scripts/generate-gate-d0-evidence-audit.mjs`);
    process.exit(1);
  }
  console.log('Gate D0 evidence audit is current.');
} else {
  fs.writeFileSync(outputPath, expected);
  console.log(`Wrote ${OUTPUT}`);
}
