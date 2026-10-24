#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = 'scripts/generate-gate-d0-capability-discovery.mjs';
const OUTPUT = 'docs/architecture/gate-d0-capability-discovery.json';
const TRACED_INVENTORY = 'docs/architecture/gate-d0-capability-inventory.json';
const CONTRACT_ROOT = 'packages/core/src/api';
const HANDLER_ROOT = 'apps/sanctuary-api/src/core/handlers';
const compareCodeUnits = (left, right) => left < right ? -1 : left > right ? 1 : 0;

function trackedFiles(scope) {
  try {
    return execFileSync('git', ['ls-files', '--', scope], { cwd: ROOT, encoding: 'utf8' })
      .split(/\r?\n/).filter(Boolean).sort(compareCodeUnits);
  } catch (error) {
    throw new Error(`DISCOVERY_SOURCE_MISSING: could not enumerate tracked inputs under ${scope}: ${error.message}`);
  }
}

function readInput(relative) {
  try { return fs.readFileSync(path.join(ROOT, relative)); }
  catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`DISCOVERY_SOURCE_MISSING: selected input is absent: ${relative}`);
    throw error;
  }
}

function selectedInputs() {
  const contracts = trackedFiles(CONTRACT_ROOT).filter((file) => /^packages\/core\/src\/api\/[^/]+\.contract\.ts$/.test(file));
  const handlers = trackedFiles(HANDLER_ROOT).filter((file) => /^apps\/sanctuary-api\/src\/core\/handlers\/[^/]+\.ts$/.test(file));
  const paths = [...new Set([...contracts, ...handlers, TRACED_INVENTORY, SCRIPT])].sort(compareCodeUnits);
  const inputs = paths.map((file) => ({ path: file, bytes: readInput(file) }));
  return { contracts: new Set(contracts), handlers: new Set(handlers), inputs };
}

function declarationSignals(text, kind) {
  const signals = new Set();
  const pattern = kind === 'contract'
    ? /^  ([A-Za-z_$][\w$]*):\s*\{/gm
    : /^ {2,4}([A-Za-z_$][\w$]*):[ \t]*impl\.\1(?:\W|$)/gm;
  for (const match of text.matchAll(pattern)) signals.add(match[1]);
  return [...signals].sort(compareCodeUnits);
}

function slug(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'signal';
}

function generate() {
  const { contracts, handlers, inputs } = selectedInputs();
  const signalsByName = new Map();
  for (const input of inputs) {
    if (!contracts.has(input.path) && !handlers.has(input.path)) continue;
    const kind = contracts.has(input.path) ? 'contract' : 'handler';
    for (const signal of declarationSignals(input.bytes.toString('utf8'), kind)) {
      const entry = signalsByName.get(signal) ?? { contractPaths: [], handlerPaths: [] };
      entry[kind === 'contract' ? 'contractPaths' : 'handlerPaths'].push(input.path);
      signalsByName.set(signal, entry);
    }
  }

  const traced = JSON.parse(readInput(TRACED_INVENTORY).toString('utf8'));
  const tracePaths = new Map(traced.records.map((record) => [
    record.id,
    new Set((record.evidence ?? []).map((item) => item.sourcePath)),
  ]));
  const candidates = [...signalsByName.entries()].sort(([left], [right]) => compareCodeUnits(left, right)).map(([signal, paths]) => {
    const evidenceSourcePaths = [...new Set([...paths.contractPaths, ...paths.handlerPaths])].sort(compareCodeUnits);
    const matchesExistingTracedCapabilityIds = [...tracePaths.entries()]
      .filter(([, sourcePaths]) => evidenceSourcePaths.some((sourcePath) => sourcePaths.has(sourcePath)))
      .map(([id]) => id).sort(compareCodeUnits);
    const identity = `${signal}\0${evidenceSourcePaths.join('\0')}`;
    const suffix = [...createHash('sha256').update(identity).digest('hex')].filter((character) => /[a-f]/.test(character)).join('').slice(0, 16);
    return {
      id: `candidate.${slug(signal)}.${suffix}`,
      signal,
      signalMethod: 'top-level lexical property name in selected contract/handler source; not semantic parsing',
      evidenceSourcePaths,
      contractSourcePaths: [...paths.contractPaths].sort(compareCodeUnits),
      handlerSourcePaths: [...paths.handlerPaths].sort(compareCodeUnits),
      traceRelation: matchesExistingTracedCapabilityIds.length ? 'source-path-overlap-only' : 'no-source-path-overlap',
      matchesExistingTracedCapabilityIds,
    };
  });

  const digest = createHash('sha256');
  for (const input of inputs) digest.update(input.path).update('\0').update(input.bytes).update('\0');
  return {
    schemaVersion: '1.0.0',
    discoverySemantics: 'Lexical/heuristic candidate discovery only. Candidate rows do not assert behavior, maturity, runtime reachability, authorization, persistence, or coverage completion. A source-path overlap labels only an exact intersection between candidate evidence paths and an existing record\'s cited evidence paths; it does not establish that the extracted signal is the same capability. No source-path overlap makes no semantic absence claim.',
    selection: {
      contractPattern: 'tracked immediate files packages/core/src/api/*.contract.ts',
      handlerPattern: 'tracked immediate files apps/sanctuary-api/src/core/handlers/*.ts',
      signalRule: 'Contract: two-space top-level property followed by an object literal. Handler: two-to-four-space property whose value begins impl.<same-name>. No TypeScript AST or semantic analysis.',
      tracedInventoryPath: TRACED_INVENTORY,
      generatorPath: SCRIPT,
    },
    snapshot: {
      algorithm: 'sha256',
      inputPaths: inputs.map(({ path: inputPath }) => inputPath),
      inputContentHashes: inputs.map(({ path: inputPath, bytes }) => ({ path: inputPath, sha256: createHash('sha256').update(bytes).digest('hex') })),
      sha256: digest.digest('hex'),
    },
    counts: {
      selectedContractFiles: contracts.size,
      selectedHandlerFiles: handlers.size,
      selectedInputFiles: inputs.length,
      candidates: candidates.length,
      candidatesWithCitedPathIntersection: candidates.filter((candidate) => candidate.matchesExistingTracedCapabilityIds.length > 0).length,
      candidatesWithoutCitedPathIntersection: candidates.filter((candidate) => candidate.matchesExistingTracedCapabilityIds.length === 0).length,
    },
    candidates,
  };
}

let expected;
try { expected = `${JSON.stringify(generate(), null, 2)}\n`; }
catch (error) {
  console.error(`Gate D0 capability discovery failed: ${error instanceof Error ? error.message : String(error)}. No discovery artifact was written.`);
  process.exit(1);
}

const outputPath = path.join(ROOT, OUTPUT);
if (process.argv.includes('--check')) {
  let current;
  try { current = fs.readFileSync(outputPath, 'utf8'); }
  catch (error) {
    if (error?.code === 'ENOENT') {
      console.error(`DISCOVERY_STALE: artifact is missing: ${OUTPUT}. Run: node ${SCRIPT}`);
      process.exit(1);
    }
    throw error;
  }
  if (current !== expected) {
    console.error(`DISCOVERY_STALE: selected inputs or discovery output changed. Run: node ${SCRIPT}`);
    process.exit(1);
  }
  console.log('Gate D0 capability discovery is current.');
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, expected);
  console.log(`Wrote ${OUTPUT}`);
}
