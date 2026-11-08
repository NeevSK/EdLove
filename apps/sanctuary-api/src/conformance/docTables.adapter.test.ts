import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { capabilities, domainModules, platformModules } from '../modules/catalog';
import { docDrift, parseIndexTable, parseModuleStructure } from './docTables.adapter';

const repo = (path: string) => fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
const catalog = { modules: [...platformModules, ...domainModules], capabilities };
// The catalog as it stood when that drift existed, so later capabilities don't rewrite history.
const catalogOn20261108 = {
  ...catalog,
  capabilities: capabilities.filter((c) => c.name !== 'identity.syncCredentials'),
};

// The rows as they stood on 2026-11-08, before the drift was corrected.
const driftedIndex = [
  '| Module | Namespace | Status |',
  '| --- | --- | --- |',
  '| Identity and accounts | `identity` | admitted (`session`, `scopes`) |',
  '| Bonds and authority | `authority` | admitted (`refreshSnapshot`; boundary in `security.ts`) |',
  '| Durable operations | `operations` | skeleton (store and dispatcher implemented internally) |',
  '| Learning | `learning` | Assignments | `learning.assignments` | skeleton |',
  '| App (oRPC `/api/v1` for mobile and web) | admitted |',
].join('\n');
const driftedStructure =
  '| Platform frame | All 15 platform modules named in the catalog with their layer; `identity` admitted | x |';

describe('doc tables adapter', () => {
  it('reads module, status and listed capabilities from index rows of either shape', () => {
    expect(parseIndexTable('index.md', driftedIndex)).toEqual([
      {
        doc: 'index.md',
        line: 3,
        module: 'identity',
        status: 'admitted',
        capabilities: ['session', 'scopes'],
      },
      {
        doc: 'index.md',
        line: 4,
        module: 'authority',
        status: 'admitted',
        capabilities: ['refreshSnapshot'],
      },
      { doc: 'index.md', line: 5, module: 'operations', status: 'skeleton', capabilities: [] },
      {
        doc: 'index.md',
        line: 6,
        module: 'learning.assignments',
        status: 'skeleton',
        capabilities: [],
      },
    ]);
  });

  it('reports the drift that existed on 2026-11-08', () => {
    const claims = [
      ...parseIndexTable('index.md', driftedIndex),
      ...parseModuleStructure('structure.md', driftedStructure),
    ];
    expect(docDrift(claims, catalogOn20261108)).toEqual([
      {
        doc: 'index.md',
        line: 3,
        module: 'identity',
        problem: 'capabilities listed differ from the catalog: missing createInitialBond, entry',
      },
      {
        doc: 'structure.md',
        line: 1,
        module: 'authority',
        problem: 'admitted in the catalog, not marked admitted here',
      },
    ]);
  });

  it('finds no drift in the current documents', () => {
    const claims = [
      ...parseIndexTable(
        'docs/architecture/domains/README.md',
        readFileSync(repo('docs/architecture/domains/README.md'), 'utf8'),
      ),
      ...parseModuleStructure(
        'docs/architecture/module-structure.md',
        readFileSync(repo('docs/architecture/module-structure.md'), 'utf8'),
      ),
    ];
    expect(claims.length).toBeGreaterThan(40);
    expect(docDrift(claims, catalog)).toEqual([]);
  });
});
