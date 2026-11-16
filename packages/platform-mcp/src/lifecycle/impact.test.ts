import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import { baseLifecycleActors, createLifecycleFixture } from './fixtures.js';
import { executeLifecycleRequest } from './runtime.js';

it('reports shared-source effects across lifecycles while preserving an independent branch', async () => {
  const fixture = createLifecycleFixture({
    'shared.md': 'Shared contract v1',
    'a.md': 'A',
    'b.md': 'B',
    'c.md': 'C',
  });
  const options = {
    root: fixture.root,
    databasePath: fixture.databasePath,
    procedureRevision: 'impact-fixture-v1',
  };
  try {
    for (const [id, sourcePaths] of [
      ['a', ['shared.md', 'a.md']],
      ['b', ['shared.md', 'b.md']],
      ['c', ['c.md']],
    ] satisfies [string, string[]][]) {
      await executeLifecycleRequest(
        {
          action: 'create',
          id,
          operationId: 'create',
          expectedRevision: 0,
          goal: 'Inspect declared shared contracts',
          scope: 'shared',
          actors: baseLifecycleActors(),
          sourcePaths,
          externalRefs: [],
        },
        options,
      );
    }
    let current = await executeLifecycleRequest({ action: 'status', id: 'b' }, options);
    const body = {
      kind: 'invariant',
      statement: 'Scoped invariant',
      scope: ['shared contract'],
      violations: ['Unsupported change'],
      verification: 'Review dependency applicability',
    };
    for (const artifact of [
      { id: 'shared-rule', sourcePaths: ['shared.md'], dependsOn: [] },
      {
        id: 'dependent-rule',
        sourcePaths: ['b.md'],
        dependsOn: [{ id: 'shared-rule', version: 1 }],
      },
      { id: 'independent-rule', sourcePaths: ['b.md'], dependsOn: [] },
    ])
      current = await executeLifecycleRequest(
        {
          action: 'publish',
          id: 'b',
          operationId: artifact.id,
          expectedRevision: current.state.revision,
          artifact: { ...artifact, scope: 'shared', authorId: 'product-agent', content: body },
        },
        options,
      );
    writeFileSync(path.join(fixture.root, 'shared.md'), 'Shared contract v2');
    const result = await executeLifecycleRequest({ action: 'impact', id: 'a' }, options);
    expect(result.impact?.affected.map((item) => item.id)).toEqual(['b']);
    expect(result.impact?.affected[0]?.staleArtifacts).toEqual(
      expect.arrayContaining(['shared-rule@1', 'dependent-rule@1']),
    );
    expect(result.impact?.affected[0]?.staleArtifacts).not.toContain('independent-rule@1');
    expect(result.impact?.truncated).toBe(false);
  } finally {
    fixture.dispose();
  }
});
