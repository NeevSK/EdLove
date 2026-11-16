// Reads the module statuses that human documents state, so the conformance report can show
// where a document and the catalog disagree. The catalog is the declaration; documents follow it.
import type { CapabilityManifest, ModuleStatus } from '../modules/catalog';

export interface DocClaim {
  doc: string;
  line: number;
  module: string;
  status: string;
  /** Capability short names a row lists in parentheses, e.g. `admitted (`session`, `scopes`)`. */
  capabilities: string[];
  /** The row claims to name every admitted module, so a missing one is drift too. */
  exhaustive?: true;
}

export interface DocDrift {
  doc: string;
  line: number;
  module: string;
  problem: string;
}

interface Catalog {
  modules: readonly { name: string; status: ModuleStatus }[];
  capabilities: readonly CapabilityManifest[];
}

const STATUS = /^(skeleton|card|admitted|retired)\b/;
const backticked = (text: string) => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1] ?? '');

/** Rows of the domain index: the status cell follows the cell naming the module. */
export function parseIndexTable(doc: string, text: string): DocClaim[] {
  return text.split(/\r?\n/).flatMap((row, i) => {
    if (!row.startsWith('|')) return [];
    const cells = row.split('|').map((c) => c.trim());
    const at = cells.findIndex((c) => STATUS.test(c));
    // Only namespace-shaped names; the channel table's `/api/v1` is not a module.
    const module =
      at > 0
        ? backticked(cells[at - 1] ?? '').find((n) => /^[a-z]+(\.[a-z]+)?$/.test(n))
        : undefined;
    const statusCell = cells[at] ?? '';
    if (!module) return [];
    const listed = statusCell.match(/\(([^)]*)\)/)?.[1] ?? '';
    return [
      {
        doc,
        line: i + 1,
        module,
        status: statusCell.match(STATUS)?.[1] ?? '',
        capabilities: backticked(listed).filter((n) => /^[a-z][A-Za-z]*$/.test(n)),
      },
    ];
  });
}

/** The module-structure "Platform frame" row names the platform modules it calls admitted. */
export function parseModuleStructure(doc: string, text: string): DocClaim[] {
  const lines = text.split(/\r?\n/);
  const at = lines.findIndex((l) => l.startsWith('| Platform frame'));
  const row = lines[at] ?? '';
  return [...row.matchAll(/`([a-z]+)`\s+admitted/g)].map((m) => ({
    doc,
    line: at + 1,
    module: m[1] ?? '',
    status: 'admitted',
    capabilities: [],
    exhaustive: true as const,
  }));
}

export function docDrift(claims: readonly DocClaim[], catalog: Catalog): DocDrift[] {
  const drift: DocDrift[] = [];
  const statusOf = (module: string) => catalog.modules.find((m) => m.name === module)?.status;

  for (const claim of claims) {
    const actual = statusOf(claim.module);
    const say = (problem: string) =>
      drift.push({ doc: claim.doc, line: claim.line, module: claim.module, problem });
    if (actual === undefined) say('not in the catalog');
    else if ((claim.status === 'admitted') !== (actual === 'admitted'))
      say(`marked ${claim.status} here, ${actual} in the catalog`);
    else if (claim.capabilities.length > 0) {
      const declared = catalog.capabilities
        .filter((c) => c.module === claim.module && c.status === 'admitted')
        .map((c) => c.name.slice(claim.module.length + 1));
      const missing = declared.filter((n) => !claim.capabilities.includes(n)).sort();
      const extra = claim.capabilities.filter((n) => !declared.includes(n)).sort();
      if (missing.length > 0 || extra.length > 0)
        say(
          `capabilities listed differ from the catalog: ${[
            missing.length > 0 ? `missing ${missing.join(', ')}` : '',
            extra.length > 0 ? `not declared ${extra.join(', ')}` : '',
          ]
            .filter(Boolean)
            .join('; ')}`,
        );
    }
  }

  const exhaustive = claims.filter((c) => c.exhaustive);
  for (const doc of new Set(exhaustive.map((c) => c.doc))) {
    const inDoc = exhaustive.filter((c) => c.doc === doc);
    const named = new Set(inDoc.map((c) => c.module));
    for (const m of catalog.modules.filter((x) => x.status === 'admitted' && !x.name.includes('.')))
      if (!named.has(m.name))
        drift.push({
          doc,
          line: inDoc[0]?.line ?? 0,
          module: m.name,
          problem: 'admitted in the catalog, not marked admitted here',
        });
  }
  return drift;
}
