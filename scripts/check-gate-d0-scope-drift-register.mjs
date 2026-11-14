import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registerPath = path.join(root, 'docs/architecture/gate-d0-scope-drift-register.json');
const routeInventoryPath = path.join(root, 'reports/atlas-route-inventory.json');
const packageInventoryPath = path.join(root, 'docs/architecture/gate-d0-package-consumer-inventory.json');
const capabilityInventoryPath = path.join(root, 'docs/architecture/gate-d0-capability-inventory.json');
const capabilityDiscoveryPath = path.join(root, 'docs/architecture/gate-d0-capability-discovery.json');
const errors = [];
const compareCodeUnits = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const date = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const repoRelativeFileExists = (value) => typeof value === 'string' && !value.includes('\\') && !path.posix.isAbsolute(value) && !value.split('/').includes('..') && fs.existsSync(path.join(root, value)) && fs.statSync(path.join(root, value)).isFile();
const repoRelativeFileTracked = (value) => {
  if (!repoRelativeFileExists(value)) return false;
  try { execFileSync('git', ['ls-files', '--error-unmatch', value], { cwd: root, stdio: 'ignore' }); return true; }
  catch { return false; }
};
const freeTextPatterns = [/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, /\b(?:\+?\d[\d ()-]{7,}\d)\b/, /\b(?:sk|pk|api|ghp|github_pat|xox[baprs])-?[A-Za-z0-9_-]{16,}\b/i, /\bBearer\s+\S+/i, /\b(?:password|secret|access[_ -]?token)\s*[:=]\s*\S+/i];
const knownKeys = {
  root: ['version', 'reviewedAt', 'ownerRole', 'coverage', 'driftFindings'],
  coverage: ['id', 'inventoryPath', 'ownerRole', 'reviewedAt', 'coveredApps', 'coveredPackages', 'coveredRouteDomains', 'coveredCapabilities', 'coveredCounts', 'scope', 'limitations', 'emptyStateSemantics', 'exclusions'],
  exclusion: ['id', 'reason', 'ownerRole', 'reviewedAt', 'evidencePaths'],
  driftFinding: ['id', 'observedAt', 'findingClass', 'inheritedLedgerObservation', 'independentlySourceValidated', 'documentPath', 'documentClaim', 'currentEvidence', 'disposition', 'ownerRole', 'reviewBy', 'evidencePaths', 'validationEvidencePaths', 'autoRepair'],
};

function readRegister() {
  try { return JSON.parse(fs.readFileSync(registerPath, 'utf8')); }
  catch (error) { errors.push(`Register JSON could not be read: ${error.message}`); return null; }
}

function checkKeys(value, expected, label, optional = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { errors.push(`${label} must be an object.`); return; }
  for (const key of Object.keys(value)) if (!expected.includes(key)) errors.push(`${label} has unknown field "${key}".`);
  for (const key of expected) if (!optional.includes(key) && !(key in value)) errors.push(`${label}.${key} is required.`);
}

function checkIdOrder(items, label) {
  if (!Array.isArray(items)) { errors.push(`${label} must be an array.`); return; }
  const seen = new Set();
  let previous = '';
  for (const [index, item] of items.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (!item || typeof item.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) errors.push(`${itemLabel}.id must be a stable lowercase kebab ID.`);
    else {
      if (seen.has(item.id)) errors.push(`${label} contains duplicate id ${item.id}.`);
      if (previous && compareCodeUnits(item.id, previous) < 0) errors.push(`${label} must be ordered by ascending code-unit id.`);
      seen.add(item.id); previous = item.id;
    }
    if (item?.ownerRole && typeof item.ownerRole !== 'string' || item && !item.ownerRole?.trim()) errors.push(`${itemLabel}.ownerRole is required.`);
    const dateField = item && ('reviewBy' in item ? item.reviewBy : item.reviewedAt);
    if (!date(dateField)) errors.push(`${itemLabel} requires a valid ISO review date.`);
    if ('evidencePaths' in (item ?? {})) {
      if (!Array.isArray(item.evidencePaths) || item.evidencePaths.length === 0) errors.push(`${itemLabel}.evidencePaths must be non-empty.`);
      for (const evidencePath of item.evidencePaths ?? []) if (!repoRelativeFileTracked(evidencePath)) errors.push(`${itemLabel} evidence path must exist and be tracked: ${evidencePath}`);
    }
  }
}

function checkFreeText(value, label = '$', key = '') {
  if (['reviewBy', 'reviewedAt', 'observedAt', 'id', 'evidencePaths'].includes(key) || key.endsWith('Path')) return;
  if (typeof value === 'string') {
    if (freeTextPatterns.some((pattern) => pattern.test(value))) errors.push(`${label} resembles PII or a secret value.`);
  } else if (Array.isArray(value)) value.forEach((child, index) => checkFreeText(child, `${label}[${index}]`));
  else if (value && typeof value === 'object') for (const [childKey, child] of Object.entries(value)) checkFreeText(child, `${label}.${childKey}`, childKey);
}

const register = readRegister();
if (register) {
  checkKeys(register, knownKeys.root, 'register');
  if (register.version !== '1.0.0') errors.push('Register version must be 1.0.0.');
  if (!date(register.reviewedAt) || typeof register.ownerRole !== 'string' || !register.ownerRole.trim()) errors.push('Register requires ownerRole and valid reviewedAt.');
  checkIdOrder(register.coverage, 'coverage');
  const routeInventory = JSON.parse(fs.readFileSync(routeInventoryPath, 'utf8'));
  const packageInventory = JSON.parse(fs.readFileSync(packageInventoryPath, 'utf8'));
  const capabilityInventory = JSON.parse(fs.readFileSync(capabilityInventoryPath, 'utf8'));
  const capabilityDiscovery = JSON.parse(fs.readFileSync(capabilityDiscoveryPath, 'utf8'));
  const sorted = (items) => [...items].sort(compareCodeUnits);
  const routeApps = sorted([...new Set([...routeInventory.routes.map((route) => route.file), ...routeInventory.literalHrefProperties.map((href) => href.source)].map((file) => file.split('/').slice(0, 2).join('/')))]);
  const routeDomains = sorted([...new Set(routeInventory.routes.map((route) => route.route.split('/').filter(Boolean)[0] || 'root'))]);
  const packageDirectories = sorted(packageInventory.packages.map((item) => item.directory));
  const packageApps = packageDirectories.filter((directory) => directory.startsWith('apps/'));
  const packageDirs = packageDirectories.filter((directory) => directory.startsWith('packages/'));
  const capabilityIds = sorted(capabilityInventory.records.map((record) => record.id));
  const discoveryIds = sorted(capabilityDiscovery.candidates.map((candidate) => candidate.id));
  const expectedMembership = {
    'route-inventory': { coveredApps: routeApps, coveredPackages: [], coveredRouteDomains: routeDomains, coveredCapabilities: [], coveredCounts: { routeFiles: routeInventory.routes.length, literalHrefProperties: routeInventory.literalHrefProperties.length } },
    'package-consumer-inventory': { coveredApps: packageApps, coveredPackages: packageDirs, coveredRouteDomains: [], coveredCapabilities: [], coveredCounts: { packageManifests: packageInventory.packages.length, trackedPackageManifestsAbsent: packageInventory.snapshot.trackedPackageManifestsAbsentFromWorkingTreeCount, sourceFiles: packageInventory.snapshot.sourceFileCount, trackedSourcePathsAbsent: packageInventory.snapshot.trackedSourcePathsAbsentFromWorkingTreeCount, inputFiles: packageInventory.snapshot.inputFileCount } },
    'capability-inventory': { coveredApps: [], coveredPackages: [], coveredRouteDomains: [], coveredCapabilities: capabilityIds, coveredCounts: { capabilityRecords: capabilityInventory.records.length } },
    'capability-discovery': { coveredApps: ['apps/sanctuary-api'], coveredPackages: ['packages/core'], coveredRouteDomains: [], coveredCapabilities: discoveryIds, coveredCounts: { selectedContractFiles: capabilityDiscovery.counts.selectedContractFiles, selectedHandlerFiles: capabilityDiscovery.counts.selectedHandlerFiles, selectedInputFiles: capabilityDiscovery.counts.selectedInputFiles, discoveryCandidates: capabilityDiscovery.counts.candidates, candidatesWithCitedPathIntersection: capabilityDiscovery.counts.candidatesWithCitedPathIntersection, candidatesWithoutCitedPathIntersection: capabilityDiscovery.counts.candidatesWithoutCitedPathIntersection } },
  };
  const expectedPaths = {
    'route-inventory': 'reports/atlas-route-inventory.json',
    'package-consumer-inventory': 'docs/architecture/gate-d0-package-consumer-inventory.json',
    'capability-inventory': 'docs/architecture/gate-d0-capability-inventory.json',
    'capability-discovery': 'docs/architecture/gate-d0-capability-discovery.json',
  };
  const compareJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  for (const [index, entry] of (register.coverage ?? []).entries()) {
    const label = `coverage[${index}]`;
    checkKeys(entry, knownKeys.coverage, label);
    if (!repoRelativeFileExists(entry.inventoryPath)) errors.push(`${label}.inventoryPath must be an existing repository-relative file.`);
    if (typeof entry.emptyStateSemantics !== 'string' || !entry.emptyStateSemantics.trim()) errors.push(`${label}.emptyStateSemantics is required.`);
    for (const field of ['coveredApps', 'coveredPackages', 'coveredRouteDomains', 'coveredCapabilities', 'limitations']) {
      if (!Array.isArray(entry[field]) || entry[field].some((value) => typeof value !== 'string' || !value.trim())) errors.push(`${label}.${field} must be an array of non-empty strings.`);
      else for (let cursor = 1; cursor < entry[field].length; cursor += 1) if (compareCodeUnits(entry[field][cursor], entry[field][cursor - 1]) < 0) errors.push(`${label}.${field} must be sorted by code-unit order.`);
    }
    const expected = expectedMembership[entry.id];
    if (!expected) errors.push(`${label} has unrecognized inventory id ${entry.id}.`);
    else {
      if (entry.inventoryPath !== expectedPaths[entry.id]) errors.push(`${label}.inventoryPath does not match its inventory type.`);
      for (const field of ['coveredApps', 'coveredPackages', 'coveredRouteDomains', 'coveredCapabilities']) if (!compareJson(entry[field], expected[field])) errors.push(`${label}.${field} does not match the referenced inventory membership.`);
      if (!compareJson(entry.coveredCounts, expected.coveredCounts)) errors.push(`${label}.coveredCounts does not match the referenced inventory snapshot.`);
    }
    if (entry.id === 'route-inventory' && (routeInventory.scope.routeFiles !== 'apps/gurudevi-web/app/**/page.{tsx,ts,jsx,js}' || routeInventory.scope.hrefSources !== 'apps/gurudevi-web/**/*Registry.{ts,tsx,js,jsx}')) errors.push(`${label} route scope linkage differs from the declared browser scan patterns.`);
    if (entry.id === 'package-consumer-inventory') {
      const absentSourcePaths = packageInventory.snapshot.trackedSourcePathsAbsentFromWorkingTree;
      const absentManifests = packageInventory.snapshot.trackedPackageManifestsAbsentFromWorkingTree;
      const sortedAbsentSources = Array.isArray(absentSourcePaths) ? [...absentSourcePaths].sort(compareCodeUnits) : [];
      const sortedAbsentManifests = Array.isArray(absentManifests) ? [...absentManifests].sort(compareCodeUnits) : [];
      const absentSourcesAreValid = Array.isArray(absentSourcePaths) && JSON.stringify(absentSourcePaths) === JSON.stringify(sortedAbsentSources) && absentSourcePaths.every((file) => typeof file === 'string' && !packageInventory.snapshot.inputFileScope.includes(file) && !fs.existsSync(path.join(root, file)));
      const absentManifestsAreValid = Array.isArray(absentManifests) && JSON.stringify(absentManifests) === JSON.stringify(sortedAbsentManifests) && absentManifests.every((file) => typeof file === 'string' && /^(?:packages|apps)\/[^/]+\/package\.json$/.test(file) && !packageInventory.snapshot.inputFileScope.includes(file) && !fs.existsSync(path.join(root, file)));
      const absentManifestDirectories = (absentManifests ?? []).map((file) => path.posix.dirname(file));
      const absentManifestSourcesExcluded = packageInventory.snapshot.inputFileScope.every((file) => !absentManifestDirectories.some((directory) => file.startsWith(`${directory}/`)));
      if (!packageInventory.method.scope.includes('immediate packages/* and apps/*') || packageInventory.snapshot.packageManifestCount !== packageInventory.packages.length || packageInventory.snapshot.trackedPackageManifestCount !== packageInventory.snapshot.packageManifestCount + absentManifests?.length || packageInventory.snapshot.inputFileCount !== packageInventory.snapshot.inputFileScope.length || packageInventory.snapshot.trackedSourcePathsAbsentFromWorkingTreeCount !== absentSourcePaths?.length || packageInventory.snapshot.trackedPackageManifestsAbsentFromWorkingTreeCount !== absentManifests?.length || !absentSourcesAreValid || !absentManifestsAreValid || !absentManifestSourcesExcluded) errors.push(`${label} package snapshot scope/count or tracked-deletion linkage is inconsistent.`);
    }
    if (!Array.isArray(entry.exclusions)) errors.push(`${label}.exclusions must be an array.`);
    else {
      checkIdOrder(entry.exclusions, `${label}.exclusions`);
      for (const [exclusionIndex, exclusion] of entry.exclusions.entries()) {
        const exclusionLabel = `${label}.exclusions[${exclusionIndex}]`;
        checkKeys(exclusion, knownKeys.exclusion, exclusionLabel);
        if (typeof exclusion.reason !== 'string' || !exclusion.reason.trim()) errors.push(`${exclusionLabel}.reason is required.`);
      }
    }
  }
  checkIdOrder(register.driftFindings, 'driftFindings');
  for (const [index, finding] of (register.driftFindings ?? []).entries()) {
    const label = `driftFindings[${index}]`;
    checkKeys(finding, knownKeys.driftFinding, label, ['validationEvidencePaths']);
    if (!date(finding.observedAt) || !date(finding.reviewBy)) errors.push(`${label} requires valid observedAt and reviewBy ISO dates.`);
    if (!['stale', 'historical', 'unverified', 'scope-gap', 'direct-conflict'].includes(finding.findingClass)) errors.push(`${label}.findingClass is invalid.`);
    if (typeof finding.inheritedLedgerObservation !== 'boolean' || typeof finding.independentlySourceValidated !== 'boolean' || (!finding.inheritedLedgerObservation && !finding.independentlySourceValidated)) errors.push(`${label} must declare inherited or independently source-validated provenance.`);
    if (finding.independentlySourceValidated === true) {
      if (!Array.isArray(finding.validationEvidencePaths) || finding.validationEvidencePaths.length === 0) errors.push(`${label}.validationEvidencePaths must be non-empty for an independently validated finding.`);
      const seenValidationPaths = new Set();
      let previousValidationPath = '';
      for (const evidencePath of finding.validationEvidencePaths ?? []) {
        if (!repoRelativeFileTracked(evidencePath)) errors.push(`${label} validation evidence path must exist and be tracked: ${evidencePath}`);
        if (seenValidationPaths.has(evidencePath)) errors.push(`${label}.validationEvidencePaths must not contain duplicates.`);
        if (previousValidationPath && compareCodeUnits(evidencePath, previousValidationPath) < 0) errors.push(`${label}.validationEvidencePaths must be ordered by ascending code-unit path.`);
        seenValidationPaths.add(evidencePath);
        previousValidationPath = evidencePath;
      }
    } else if (finding.validationEvidencePaths !== undefined) errors.push(`${label}.validationEvidencePaths is only allowed when independent source validation is true.`);
    if (!repoRelativeFileExists(finding.documentPath)) errors.push(`${label}.documentPath must be an existing repository-relative file.`);
    for (const key of ['documentClaim', 'currentEvidence', 'disposition']) if (typeof finding[key] !== 'string' || !finding[key].trim()) errors.push(`${label}.${key} is required.`);
    if (finding.autoRepair !== false) errors.push(`${label}.autoRepair must be false; this register never authorizes repair.`);
  }
  checkFreeText(register);
}

if (errors.length) { console.error(`Gate D0 scope/drift register invalid (${errors.length} issue(s)):`); for (const error of errors) console.error(`- ${error}`); process.exitCode = 1; }
else console.log(`Gate D0 scope/drift register valid: ${register.coverage.length} inventory scopes, ${register.driftFindings.length} drift findings.`);
