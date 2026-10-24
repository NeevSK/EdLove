import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// This dependency-free checker enforces a documented structural subset of the
// adjacent JSON Schema, including closed top-level/record shapes. It is not a
// general JSON Schema 2020-12 implementation.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(root, 'docs/architecture/gate-d0-capability-inventory.schema.json');
const inventoryPath = path.join(root, 'docs/architecture/gate-d0-capability-inventory.json');
const errors = [];
const required = ['id', 'name', 'owner', 'reviewedAt', 'claimType', 'kind', 'maturity', 'actor', 'scope', 'sensitivity', 'surfaces', 'routes', 'headless', 'packages', 'exports', 'consumers', 'contract', 'authorization', 'persistence', 'sync', 'fallback', 'recovery', 'effects', 'evidence', 'documentClaims', 'driftDisposition'];
const unknown = (value) => value && typeof value === 'object' && value.status === 'unknown' && typeof value.reason === 'string' && value.reason.trim().length > 0;
const explicit = (value) => typeof value === 'string' && value.trim().length > 0 || unknown(value);
const claimTypes = ['source-observation', 'document-intent', 'candidate', 'test-evidence', 'test-source'];
const compareCodeUnits = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const date = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const repoRelativeFileExists = (value) => typeof value === 'string' && !value.includes('\\') && !path.posix.isAbsolute(value) && !value.split('/').includes('..') && fs.existsSync(path.join(root, value)) && fs.statSync(path.join(root, value)).isFile();
const freeText = (value) => {
  if (typeof value !== 'string') return;
  const patterns = [/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, /\b(?:\+?\d[\d ()-]{7,}\d)\b/, /\b(?:sk|pk|api|ghp|github_pat|xox[baprs])-?[A-Za-z0-9_-]{16,}\b/i, /\bBearer\s+\S+/i, /\b(?:password|secret|access[_ -]?token)\s*[:=]\s*\S+/i];
  if (patterns.some((pattern) => pattern.test(value))) errors.push('Free text resembles PII or a secret value; store a redacted description only.');
};
const keysOnly = (value, keys, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  for (const key of Object.keys(value)) if (!keys.includes(key)) errors.push(`${label} has unknown field "${key}".`);
};

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { errors.push(`${path.relative(root, file)}: ${error.message}`); return null; }
}

const schema = readJson(schemaPath);
const inventory = readJson(inventoryPath);
if (!schema || schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') errors.push('Schema must declare JSON Schema draft 2020-12.');
if (schema && (schema.additionalProperties !== false || schema.$defs?.capability?.additionalProperties !== false || schema.$defs?.capability?.properties?.evidence?.items?.additionalProperties !== false)) errors.push('Schema must forbid unknown top-level, record, and evidence fields.');
if (schema && ['claimId', 'claimType', 'sourcePath', 'claim', 'observedAt', 'method', 'level', 'engine', 'substitutions', 'limitations'].some((key) => !schema.$defs?.capability?.properties?.evidence?.items?.required?.includes(key))) errors.push('Schema evidence entries must require typed claims, G-level details, and limitations.');
if (!inventory || inventory.schemaVersion !== '1.3.0' || !Array.isArray(inventory.records) || inventory.records.length === 0) errors.push('Inventory requires schemaVersion 1.3.0 and at least one record.');
if (schema && (schema.properties?.schemaVersion?.const !== inventory?.schemaVersion || schema.$defs?.capability?.properties?.effects?.type !== 'array' || !schema.$defs?.capability?.properties?.effects?.items?.required?.includes('evidenceClaimIds'))) errors.push('Schema must declare the inventory version and require effect evidence links.');
keysOnly(inventory, ['schemaVersion', 'sourceSnapshot', 'records'], 'inventory');
if (schema && (schema.properties?.sourceSnapshot?.properties?.sha256?.pattern !== '^[a-f0-9]{64}$' || !schema.required?.includes('sourceSnapshot'))) errors.push('Schema must require the deterministic source snapshot.');
const snapshotKeys = ['algorithm', 'semantics', 'sourcePaths', 'sha256'];
keysOnly(inventory?.sourceSnapshot, snapshotKeys, 'sourceSnapshot');
for (const key of snapshotKeys) if (!(key in (inventory?.sourceSnapshot ?? {}))) errors.push(`sourceSnapshot.${key} is required.`);
if (inventory?.sourceSnapshot?.algorithm !== 'sha256') errors.push('sourceSnapshot.algorithm must be sha256.');
if (typeof inventory?.sourceSnapshot?.semantics !== 'string' || !inventory.sourceSnapshot.semantics.trim()) errors.push('sourceSnapshot.semantics is required.');
if (!Array.isArray(inventory?.sourceSnapshot?.sourcePaths) || inventory.sourceSnapshot.sourcePaths.some((value) => typeof value !== 'string')) errors.push('sourceSnapshot.sourcePaths must be an array of paths.');
if (typeof inventory?.sourceSnapshot?.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(inventory.sourceSnapshot.sha256)) errors.push('sourceSnapshot.sha256 must be a SHA-256 hex digest.');
const ids = new Set();
let previousId = '';
for (const [index, record] of (inventory?.records ?? []).entries()) {
  const label = `records[${index}]`;
  if (!record || typeof record !== 'object' || Array.isArray(record)) { errors.push(`${label} must be an object.`); continue; }
  keysOnly(record, required, label);
  for (const key of required) if (!(key in record)) errors.push(`${label}.${key} is required.`);
  if (typeof record.id !== 'string' || !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)+$/.test(record.id)) errors.push(`${label}.id must be a stable dotted lowercase identifier.`);
  else {
    if (ids.has(record.id)) errors.push(`Duplicate capability id: ${record.id}`);
    if (previousId && compareCodeUnits(record.id, previousId) < 0) errors.push('Records must be ordered by ascending id.');
    ids.add(record.id); previousId = record.id;
  }
  if (!['source-observation', 'document-intent', 'candidate'].includes(record.claimType)) errors.push(`${label}.claimType is invalid.`);
  if (!['end-to-end-evidenced', 'implemented-wired', 'partial', 'scaffold', 'document-intent', 'historical-stale', 'unknown'].includes(record.maturity)) errors.push(`${label}.maturity is invalid.`);
  if (!date(record.reviewedAt)) errors.push(`${label}.reviewedAt must be an ISO date.`);
  for (const key of ['actor', 'scope', 'sensitivity', 'contract', 'authorization', 'persistence', 'sync', 'fallback', 'recovery', 'driftDisposition']) if (!explicit(record[key])) errors.push(`${label}.${key} must contain a value or explicit unknown with reason.`);
  for (const key of ['surfaces', 'packages', 'exports', 'consumers']) if (!Array.isArray(record[key]) || record[key].some((item) => !explicit(item))) errors.push(`${label}.${key} must be an array whose entries are values or explicit unknowns.`);
  if (!Array.isArray(record.effects)) errors.push(`${label}.effects must be an array.`);
  else for (const [effectIndex, effect] of record.effects.entries()) {
    const effectLabel = `${label}.effects[${effectIndex}]`;
    const effectKeys = ['id', 'kind', 'name', 'payloadFields', 'evidenceClaimIds', 'purpose', 'consent', 'audience', 'retention', 'downstreamStorage', 'deliveryFailure'];
    keysOnly(effect, effectKeys, effectLabel);
    for (const key of effectKeys) if (!(key in (effect ?? {}))) errors.push(`${effectLabel}.${key} is required.`);
    if (typeof effect?.id !== 'string' || !/^[a-z][a-z0-9-]+$/.test(effect.id) || !['growth-signal', 'analytics-event', 'external-effect', 'other'].includes(effect?.kind) || typeof effect?.name !== 'string' || !effect.name.trim()) errors.push(`${effectLabel} requires stable id, recognized kind, and name.`);
    if (!Array.isArray(effect?.payloadFields) || effect.payloadFields.some((field) => typeof field !== 'string' || !field.trim())) errors.push(`${effectLabel}.payloadFields must be non-empty strings.`);
    if (!Array.isArray(effect?.evidenceClaimIds) || effect.evidenceClaimIds.length === 0 || effect.evidenceClaimIds.some((claimId) => typeof claimId !== 'string' || !/^[a-z][a-z0-9-]+$/.test(claimId))) errors.push(`${effectLabel}.evidenceClaimIds must be a non-empty array of stable claim IDs.`);
    else {
      const referencedEvidenceIds = (record.evidence ?? []).map((item) => item?.claimId).filter((claimId) => typeof claimId === 'string');
      const linkedIds = new Set();
      let previousLinkedId = '';
      for (const claimId of effect.evidenceClaimIds) {
        if (linkedIds.has(claimId)) errors.push(`${effectLabel}.evidenceClaimIds must not contain duplicates.`);
        if (previousLinkedId && compareCodeUnits(claimId, previousLinkedId) < 0) errors.push(`${effectLabel}.evidenceClaimIds must be ordered by ascending code-unit ID.`);
        if (!referencedEvidenceIds.includes(claimId)) errors.push(`${effectLabel}.evidenceClaimIds references a claim absent from this record: ${claimId}.`);
        linkedIds.add(claimId);
        previousLinkedId = claimId;
      }
    }
    for (const key of ['purpose', 'consent', 'audience', 'retention', 'downstreamStorage', 'deliveryFailure']) if (!explicit(effect?.[key])) errors.push(`${effectLabel}.${key} must contain a value or explicit unknown with reason.`);
    for (const text of [effect?.name, ...(effect?.payloadFields ?? [])]) freeText(text);
  }
  if (!Array.isArray(record.routes) || record.routes.some((route) => !route || typeof route.surface !== 'string' || !explicit(route.path) || !['resolved', 'dynamic', 'external', 'headless', 'unresolved', 'unknown'].includes(route.status))) errors.push(`${label}.routes entries require surface, path, and recognized status.`);
  if (!record.headless || !(typeof record.headless.value === 'boolean' || unknown(record.headless.value)) || !explicit(record.headless.reason)) errors.push(`${label}.headless requires boolean or explicit unknown value and reason.`);
  if (!Array.isArray(record.evidence)) errors.push(`${label}.evidence must be an array.`);
  else {
    let previousClaimId = '';
    const claimIds = new Set();
    for (const [evidenceIndex, item] of record.evidence.entries()) {
    const evidenceLabel = `${label}.evidence[${evidenceIndex}]`;
    keysOnly(item, ['claimId', 'claimType', 'sourcePath', 'line', 'symbol', 'claim', 'observedAt', 'method', 'level', 'engine', 'substitutions', 'limitations'], evidenceLabel);
    if (!item || !repoRelativeFileExists(item.sourcePath)) errors.push(`${evidenceLabel}.sourcePath must point to an existing repository-relative file.`);
    if (!claimTypes.includes(item?.claimType) || typeof item?.claimId !== 'string' || !/^[a-z][a-z0-9-]+$/.test(item.claimId) || typeof item?.claim !== 'string' || !date(item?.observedAt) || typeof item?.method !== 'string' || typeof item?.limitations !== 'string' || !item.limitations.trim() || !['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'R1', 'none'].includes(item?.level) || typeof item?.engine !== 'string' || !Array.isArray(item?.substitutions)) errors.push(`${evidenceLabel} requires claimId, typed claim, sourcePath, date, method, level, engine, substitutions, and limitations.`);
    if (item?.line !== undefined && (!Number.isInteger(item.line) || item.line < 1)) errors.push(`${evidenceLabel}.line must be a positive integer.`);
    if (item?.claimId) {
      if (claimIds.has(item.claimId)) errors.push(`${label} has duplicate evidence claimId ${item.claimId}.`);
      if (previousClaimId && compareCodeUnits(item.claimId, previousClaimId) < 0) errors.push(`${label}.evidence must be ordered by ascending claimId.`);
      claimIds.add(item.claimId); previousClaimId = item.claimId;
    }
    for (const text of [item?.claim, item?.method, item?.engine, item?.limitations, ...(item?.substitutions ?? [])]) freeText(text);
    }
  }
  for (const text of [record.name, record.owner, record.kind, record.sensitivity, record.headless?.reason, record.driftDisposition, ...record.surfaces, ...record.packages, ...record.exports, ...record.consumers]) if (typeof text === 'string') freeText(text);
  if (record.maturity === 'end-to-end-evidenced') errors.push(`${label}: end-to-end-evidenced is disabled until evidence-to-field linkage is designed and reviewed.`);
  if (!Array.isArray(record.documentClaims)) errors.push(`${label}.documentClaims must be an array.`);
  else for (const [claimIndex, item] of record.documentClaims.entries()) {
    const claimLabel = `${label}.documentClaims[${claimIndex}]`;
    keysOnly(item, ['path', 'claim', 'status'], claimLabel);
    if (!item || !repoRelativeFileExists(item.path) || typeof item.claim !== 'string' || !['corroborated', 'contradicted', 'unverified', 'historical'].includes(item.status)) errors.push(`${claimLabel} requires an existing repository-relative path, claim, and disposition.`);
    freeText(item?.claim);
  }
}

if (inventory && Array.isArray(inventory.records)) {
  const sourcePaths = [...new Set([
    ...inventory.records.flatMap((record) => Array.isArray(record?.evidence) ? record.evidence.map((item) => item?.sourcePath).filter((value) => typeof value === 'string') : []),
    path.relative(root, schemaPath).split(path.sep).join('/'),
    path.relative(root, fileURLToPath(import.meta.url)).split(path.sep).join('/'),
  ])].sort(compareCodeUnits);
  if (JSON.stringify(inventory.sourceSnapshot?.sourcePaths) !== JSON.stringify(sourcePaths)) errors.push('sourceSnapshot.sourcePaths must exactly list the sorted unique evidence sources, schema, and checker.');
  const digest = createHash('sha256');
  let readable = true;
  for (const relative of sourcePaths) {
    try {
      digest.update(relative).update('\0').update(fs.readFileSync(path.join(root, relative))).update('\0');
    } catch (error) {
      readable = false;
      errors.push(`Freshness source is missing or unreadable: ${relative} (${error?.code ?? 'read error'}).`);
    }
  }
  if (readable && inventory.sourceSnapshot?.sha256 !== digest.digest('hex')) errors.push('Capability inventory source snapshot is stale; refresh the snapshot after reviewing changed evidence sources.');
}

if (errors.length) { console.error(`Gate D0 capability inventory invalid (${errors.length} issue(s)):`); for (const error of errors) console.error(`- ${error}`); process.exitCode = 1; }
else console.log(`Gate D0 capability inventory valid: ${inventory.records.length} record(s), schema ${inventory.schemaVersion}.`);
