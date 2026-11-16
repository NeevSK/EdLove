import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { analysisArtifact, createLifecycleFixture, createRequest } from './fixtures.js';
import { executeLifecycleRequest } from './runtime.js';

it('admits a discovered file through actual fingerprinting and requires its analysis', async () => {
  const fixture = createLifecycleFixture({
    'feature.md': 'Owner request',
    'detail.md': 'Discovered contract',
  });
  const options = {
    root: fixture.root,
    databasePath: fixture.databasePath,
    procedureRevision: 'source-registration-v1',
  };
  try {
    let result = await executeLifecycleRequest(
      { ...createRequest(fixture, 'registration'), sourcePaths: ['feature.md'] },
      options,
    );
    const request = {
      action: 'register-source',
      id: result.state.id,
      operationId: 'register',
      expectedRevision: result.state.revision,
      sourcePath: 'detail.md',
    };
    result = await executeLifecycleRequest(request, options);
    expect(result.state.sources.find((source) => source.path === 'detail.md')?.sha256).toBe(
      createHash('sha256').update('Discovered contract').digest('hex'),
    );
    expect(result.projection.blockers).toContain('unassessed_source:detail.md');
    expect((await executeLifecycleRequest(request, options)).duplicate).toBe(true);
    const artifact = analysisArtifact('feature.md');
    artifact.sourcePaths.push('detail.md');
    result = await executeLifecycleRequest(
      {
        action: 'publish',
        id: result.state.id,
        operationId: 'analyze',
        expectedRevision: result.state.revision,
        artifact,
      },
      options,
    );
    expect(result.projection.blockers).not.toContain('unassessed_source:detail.md');
    const history = await executeLifecycleRequest(
      { action: 'history', id: result.state.id },
      options,
    );
    expect(history.history?.map((event) => event.operationId)).toEqual([
      'registration-create',
      'register',
      'analyze',
    ]);
  } finally {
    fixture.dispose();
  }
});

it('rejects invented source hashes, escapes and unknown paths without adding them', async () => {
  const fixture = createLifecycleFixture();
  const options = {
    root: fixture.root,
    databasePath: fixture.databasePath,
    procedureRevision: 'source-registration-v1',
  };
  try {
    const result = await executeLifecycleRequest(createRequest(fixture, 'boundary'), options);
    const request = {
      action: 'register-source',
      id: result.state.id,
      operationId: 'register',
      expectedRevision: result.state.revision,
      sourcePath: '../outside.md',
    };
    await expect(
      executeLifecycleRequest({ ...request, sha256: '0'.repeat(64) }, options),
    ).rejects.toThrow();
    await expect(executeLifecycleRequest(request, options)).rejects.toThrow('invalid_source_path');
    await expect(
      executeLifecycleRequest({ ...request, sourcePath: 'missing.md' }, options),
    ).rejects.toThrow();
    const current = await executeLifecycleRequest(
      { action: 'status', id: result.state.id },
      options,
    );
    expect(current.state.revision).toBe(0);
    expect(current.state.sources).toHaveLength(1);
  } finally {
    fixture.dispose();
  }
});
