// Capability conformance: reads the four layers for every capability, writes
// reports/capability-conformance.{json,md}, and with --check fails when any gap count rises
// above its ceiling in tooling/ratchet.json (`capabilityGaps`). --update only lowers ceilings.
// Plan: apps/sanctuary-api/docs/implementation/2026-11-08-capability-conformance-plan.md
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appContract } from '@repo/core/api/v1/contract';
import { readCard } from '../src/conformance/cards.adapter';
import { findConsumers, readClientSources } from '../src/conformance/consumers.adapter';
import {
  docDrift,
  parseIndexTable,
  parseModuleStructure,
} from '../src/conformance/docTables.adapter';
import { readEvidence } from '../src/conformance/evidence';
import {
  type ConformanceRow,
  countGaps,
  type GapCode,
  gapCodes,
  type PolicyState,
  reconcile,
} from '../src/conformance/reconcile';
import { router } from '../src/core/router';
import { capabilities, domainModules, platformModules } from '../src/modules/catalog';
import { implementedPaths, procedurePaths } from '../src/modules/contractPaths';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const at = (path: string) => join(root, path);
const read = (path: string) => readFileSync(at(path), 'utf8');
const modules = [...platformModules, ...domainModules];
const isPlatform = (module: string) => !module.includes('.');

// Identity and authority are both implemented in security.ts today; other modules in their folder.
const implementationFiles = (module: string) => [
  'packages/core/src/api/v1/contract.ts',
  'apps/sanctuary-api/src/core/router.ts',
  module === 'identity' || module === 'authority'
    ? 'apps/sanctuary-api/src/security/security.ts'
    : `apps/sanctuary-api/src/modules/${module.replace('.', '/')}`,
];
const changedAt = (module: string) =>
  new Date(
    Math.max(
      ...implementationFiles(module)
        .filter((f) => existsSync(at(f)))
        .map((f) => statSync(at(f)).mtimeMs),
    ),
  ).toISOString();

const names = capabilities.map((c) => c.name);
const rows = reconcile({
  capabilities,
  contractPaths: procedurePaths(appContract),
  implementedPaths: implementedPaths(router, appContract),
  cards: Object.fromEntries(
    [
      ...new Set([
        ...capabilities.map((c) => c.module),
        ...modules.filter((m) => m.status === 'admitted').map((m) => m.name),
      ]),
    ].map((m) => [m, readCard(root, m)]),
  ),
  docDrift: docDrift(
    [
      ...parseIndexTable(
        'docs/architecture/domains/README.md',
        read('docs/architecture/domains/README.md'),
      ),
      ...parseModuleStructure(
        'docs/architecture/module-structure.md',
        read('docs/architecture/module-structure.md'),
      ),
    ],
    { modules, capabilities },
  ),
  evidence: readEvidence(at('reports/evidence')),
  consumers: findConsumers(names, readClientSources(root)),
  // No channel conformance suite runs yet (plan Task 9), so every open channel is unproven.
  channelRuns: [],
  changedAt: Object.fromEntries(capabilities.map((c) => [c.name, changedAt(c.module)])),
  policy: Object.fromEntries(
    capabilities.map((c): [string, PolicyState] => [
      c.name,
      isPlatform(c.module) ? 'n/a' : 'unmeasured',
    ]),
  ),
});
const counts = countGaps(rows);

// Each reader's recall against an independent baseline, from its last measurement.
const toolCoverage = [
  [
    'contract and router walk',
    'oRPC walkProcedureContractsSync + getRouter',
    '5/5 contract procedures; a contract without a handler is rejected (contractPaths.test.ts)',
  ],
  [
    'cards',
    'markdown sections',
    'fixture cases incl. heading case and missing sections (cards.adapter.test.ts)',
  ],
  [
    'doc tables',
    'domain index + module structure',
    'reproduces the 2026-11-08 drift from a fixture (docTables.adapter.test.ts)',
  ],
  [
    'evidence',
    'Vitest JSON reports in reports/evidence',
    'fixture cases; reads only tests tagged with capabilityTag()',
  ],
  [
    'consumers',
    'TypeScript AST over web, mobile, core',
    'recall 3/3 against a hand-read rg baseline (2026-11-08)',
  ],
  ['policy (Cedar)', 'none yet', 'unmeasured: no Cedar action convention for domain capabilities'],
  ['channel runs', 'none yet', 'unmeasured: channel conformance suite not built (Task 9)'],
];

const cell = (row: ConformanceRow) => {
  const best = row.practice.best;
  return [
    `\`${row.capability}\``,
    row.kind,
    row.status,
    row.intent.card ? `${row.intent.cardStatus}${row.intent.listed ? '' : ', unlisted'}` : 'none',
    row.symbol.contract ? 'yes' : 'no',
    `${row.code.handler ? 'yes' : 'no'} / ${row.code.policy}`,
    best
      ? `${best.level} (needs ${row.practice.required})`
      : `none (needs ${row.practice.required ?? '-'})`,
    String(row.practice.consumers.length),
    row.gaps.join(', ') || '—',
  ].join(' | ');
};

const generatedAt = new Date().toISOString();
mkdirSync(at('reports'), { recursive: true });
writeFileSync(
  at('reports/capability-conformance.json'),
  `${JSON.stringify({ generatedAt, counts, rows }, null, 2)}\n`,
);
writeFileSync(
  at('reports/capability-conformance.md'),
  [
    '# Capability conformance',
    '',
    `Generated ${generatedAt} by \`pnpm --filter @repo/sanctuary-api audit:conformance\`.`,
    '',
    'G0 static contract plus the evidence records below. Proves: for each declared capability, the',
    'card, catalog, contract, router, documents, tagged tests and client call sites were compared,',
    "and the gaps listed remain. Does not prove: that a card's intent is right, production behaviour,",
    'or any channel other than `app`. Evidence on a dirty tree counts but is not a release claim.',
    '',
    '| Capability | Kind | Status | Card | Contract | Handler / policy | Best evidence | Callers | Gaps |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map((r) => `| ${cell(r)} |`),
    '',
    '## Gaps',
    '',
    '| Code | Count |',
    '| --- | --- |',
    ...counts.map((c) => `| ${c.code} | ${c.count} |`),
    '',
    '## Document drift',
    '',
    ...(rows
      .flatMap((r) => r.symbol.docDrift)
      .map((d) => `- ${d.doc}:${d.line} \`${d.module}\`: ${d.problem}`) || []),
    rows.some((r) => r.symbol.docDrift.length > 0) ? '' : 'None.',
    '',
    '## Tool coverage',
    '',
    '| Reader | Method | Last measured |',
    '| --- | --- | --- |',
    ...toolCoverage.map((t) => `| ${t.join(' | ')} |`),
    '',
  ].join('\n'),
);

const ratchetFile = at('tooling/ratchet.json');
const ratchet: { capabilityGaps?: Partial<Record<GapCode, number>> } & Record<string, unknown> =
  JSON.parse(readFileSync(ratchetFile, 'utf8'));
const ceilings = ratchet.capabilityGaps;
console.table(counts);

if (process.argv.includes('--update')) {
  const next = Object.fromEntries(
    gapCodes.map((code) => {
      const current = counts.find((c) => c.code === code)?.count ?? 0;
      const stored = ceilings?.[code];
      return [code, stored === undefined ? current : Math.min(stored, current)];
    }),
  );
  writeFileSync(ratchetFile, `${JSON.stringify({ ...ratchet, capabilityGaps: next }, null, 2)}\n`);
  console.log('Ceilings set; they only ever fall. Raising one is a reviewed manual edit.');
} else if (process.argv.includes('--check')) {
  if (!ceilings)
    throw new Error('No capabilityGaps in tooling/ratchet.json; run with --update once.');
  const risen = counts.filter((c) => c.count > (ceilings[c.code] ?? 0));
  if (risen.length > 0) {
    console.error(
      `Gaps rose: ${risen.map((r) => `${r.code} ${r.count} > ${ceilings[r.code] ?? 0}`).join(', ')}`,
    );
    process.exit(1);
  }
  console.log('No gap count rose above its ceiling.');
}
console.log(`Report: reports/capability-conformance.md (${rows.length} capabilities)`);
