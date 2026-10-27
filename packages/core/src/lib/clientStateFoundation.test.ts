import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import {
  abortableQueryRead,
  assessProtocolAdmission,
  CLIENT_STATE_REGISTRY,
  createPersistedRecord,
  disposeAccountBoundaryQueries,
  disposeQueryScope,
  invalidateQueryScope,
  type PersistedRecordPolicy,
  queryScopePrefix,
  restorePersistedRecord,
  scopedQueryKey,
} from './clientStateFoundation';

const preferencePolicy: PersistedRecordPolicy<{ theme: string }> = {
  key: 'theme',
  schemaVersion: 2,
  scope: 'device',
  sensitivity: 'preference',
  validate: (value): value is { theme: string } =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { theme?: unknown }).theme === 'string',
  migrate: (value, version) =>
    version === 1 && typeof value === 'object' && value !== null && 'colorMode' in value
      ? { theme: String((value as { colorMode: unknown }).colorMode) }
      : null,
};

describe('persisted record foundation', () => {
  it('restores a valid current record', () => {
    const record = createPersistedRecord({ theme: 'dark' }, preferencePolicy, 10);
    expect(restorePersistedRecord(JSON.stringify(record), preferencePolicy, 20)).toEqual({
      kind: 'restored',
      record,
      migrated: false,
    });
  });

  it('turns corruption, expiry, and migration failure into explicit non-throwing outcomes', () => {
    expect(restorePersistedRecord('{', preferencePolicy)).toEqual({ kind: 'corrupt' });
    expect(
      restorePersistedRecord(
        JSON.stringify({
          schemaVersion: 1,
          scope: 'device',
          writtenAt: 1,
          payload: { nope: true },
        }),
        preferencePolicy,
      ),
    ).toEqual({ kind: 'migration-failed' });
    expect(
      restorePersistedRecord(
        JSON.stringify(createPersistedRecord({ theme: 'light' }, preferencePolicy, 1)),
        { ...preferencePolicy, maxAgeMs: 10 },
        12,
      ),
    ).toEqual({ kind: 'expired' });
  });
});

describe('scoped Query lifecycle', () => {
  it('rejects a late non-abortable transport when Query cancels the read', async () => {
    const controller = new AbortController();
    const pending = abortableQueryRead(controller.signal, () => new Promise(() => {}));
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('invalidates only the named scope without starting refetch work', async () => {
    const client = new QueryClient();
    const alpha = { principalId: 'alpha', tenantId: 'school-a', perspectiveId: 'teacher' };
    const beta = { principalId: 'beta', tenantId: 'school-b', perspectiveId: 'teacher' };
    const alphaKey = scopedQueryKey(alpha, ['profile']);
    const betaKey = scopedQueryKey(beta, ['profile']);
    client.setQueryData(alphaKey, { name: 'Alpha' });
    client.setQueryData(betaKey, { name: 'Beta' });

    await expect(invalidateQueryScope(client, alpha)).resolves.toMatchObject({
      scope: queryScopePrefix(alpha),
      matchedQueryCount: 1,
    });
    expect(client.getQueryState(alphaKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(betaKey)?.isInvalidated).toBe(false);
  });

  it('removes only the outgoing scope after cancellation and preserves other scopes', async () => {
    const client = new QueryClient();
    const alpha = { principalId: 'alpha', tenantId: 'school-a', perspectiveId: 'teacher' };
    const beta = { principalId: 'beta', tenantId: 'school-b', perspectiveId: 'teacher' };
    client.setQueryData(scopedQueryKey(alpha, ['profile']), { name: 'Alpha' });
    client.setQueryData(scopedQueryKey(beta, ['profile']), { name: 'Beta' });
    client.setQueryData(['public', 'library'], { title: 'Public' });

    await expect(disposeQueryScope(client, alpha)).resolves.toMatchObject({
      scope: queryScopePrefix(alpha),
      matchedQueryCount: 1,
    });
    expect(client.getQueryData(scopedQueryKey(alpha, ['profile']))).toBeUndefined();
    expect(client.getQueryData(scopedQueryKey(beta, ['profile']))).toEqual({ name: 'Beta' });
    expect(client.getQueryData(['public', 'library'])).toEqual({ title: 'Public' });
  });

  it('clears legacy Query data at an account boundary without clearing mutations', async () => {
    const client = new QueryClient();
    const alpha = { principalId: 'alpha', tenantId: 'school-a', perspectiveId: 'teacher' };
    const beta = { principalId: 'beta', tenantId: 'school-b', perspectiveId: 'teacher' };
    const mutation = client.getMutationCache().build(client, {
      mutationKey: ['command', 'alpha'],
      mutationFn: async () => undefined,
    });
    client.setQueryData(scopedQueryKey(alpha, ['profile']), { name: 'Alpha' });
    client.setQueryData(scopedQueryKey(beta, ['profile']), { name: 'Beta' });
    client.setQueryData(['legacy', 'private-profile'], { name: 'Legacy Alpha' });

    await expect(disposeAccountBoundaryQueries(client, 'alpha')).resolves.toEqual({
      outgoingPrincipalId: 'alpha',
      scopedQueryCount: 1,
      legacyQueryCount: 1,
    });
    expect(client.getQueryData(scopedQueryKey(alpha, ['profile']))).toBeUndefined();
    expect(client.getQueryData(['legacy', 'private-profile'])).toBeUndefined();
    expect(client.getQueryData(scopedQueryKey(beta, ['profile']))).toEqual({ name: 'Beta' });
    expect(client.getMutationCache().find({ mutationId: mutation.mutationId })).toBe(mutation);
  });

  it('does not remove newly created queries while outgoing cancellation is settling', async () => {
    const client = new QueryClient();
    const key = scopedQueryKey({ principalId: 'alpha' }, ['profile']);
    client.setQueryData(key, 'old alpha');
    client.setQueryData(['old-legacy'], 'old');
    const cancel = client.cancelQueries.bind(client);
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(client, 'cancelQueries').mockImplementation(async (filters, options) => {
      await cancel(filters, options);
      await barrier;
    });
    const pending = disposeAccountBoundaryQueries(client, 'alpha');
    await Promise.resolve();
    expect(client.getQueryData(key)).toBeUndefined();
    client.setQueryData(key, 'new alpha after return');
    client.setQueryData(['new-legacy'], 'incoming data');
    release();
    await pending;
    expect(client.getQueryData(key)).toBe('new alpha after return');
    expect(client.getQueryData(['new-legacy'])).toBe('incoming data');
    expect(client.getQueryData(['old-legacy'])).toBeUndefined();
    client.clear();
  });

  it('cancels an outgoing read so late transport completion cannot repopulate its cache', async () => {
    const client = new QueryClient();
    const key = scopedQueryKey({ principalId: 'alpha' }, ['pending']);
    let finish!: (value: string) => void;
    const pending = client
      .fetchQuery({
        queryKey: key,
        queryFn: ({ signal }) =>
          abortableQueryRead(
            signal,
            () =>
              new Promise<string>((resolve) => {
                finish = resolve;
              }),
          ),
      })
      .catch(() => undefined);
    await disposeAccountBoundaryQueries(client, 'alpha');
    finish('old account result');
    await pending;
    expect(client.getQueryData(key)).toBeUndefined();
    client.clear();
  });
});

describe('state registry and XState admission', () => {
  it('has one uniquely identified, classified entry for each reviewed state holder', () => {
    const ids = CLIENT_STATE_REGISTRY.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CLIENT_STATE_REGISTRY).toHaveLength(21);
    expect(CLIENT_STATE_REGISTRY.every((entry) => entry.owner && entry.source)).toBe(true);
    const perspective = CLIENT_STATE_REGISTRY.find((entry) => entry.id === 'perspective');
    const scope = CLIENT_STATE_REGISTRY.find((entry) => entry.id === 'scope-session');
    expect(perspective?.disposition).toBe('consolidated');
    expect(perspective?.source).toBe(scope?.source);
    expect(CLIENT_STATE_REGISTRY.find((entry) => entry.id === 'growth')).toMatchObject({
      source: 'packages/core/src/hooks/useGrowthQuery.ts',
      disposition: 'query',
    });
  });

  it('rejects ceremony-only machines and admits a fully evidenced protocol', () => {
    expect(
      assessProtocolAdmission({
        name: 'drawer-toggle',
        meaningfulStateGraph: false,
        survivesInterruption: false,
        transitionGuardsImproveSafety: false,
        effectOwnersNamed: false,
        machineTestsImproveEvidence: false,
      }),
    ).toMatchObject({ admitted: false });
    expect(
      assessProtocolAdmission({
        name: 'scope-transition',
        meaningfulStateGraph: true,
        survivesInterruption: true,
        transitionGuardsImproveSafety: true,
        effectOwnersNamed: true,
        machineTestsImproveEvidence: true,
      }),
    ).toEqual({ admitted: true, name: 'scope-transition' });
  });
});
