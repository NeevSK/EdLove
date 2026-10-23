import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import {
  assessProtocolAdmission,
  CLIENT_STATE_REGISTRY,
  createPersistedRecord,
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
});

describe('state registry and XState admission', () => {
  it('has one uniquely identified, classified entry for each reviewed state holder', () => {
    const ids = CLIENT_STATE_REGISTRY.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CLIENT_STATE_REGISTRY).toHaveLength(20);
    expect(CLIENT_STATE_REGISTRY.every((entry) => entry.owner && entry.source)).toBe(true);
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
