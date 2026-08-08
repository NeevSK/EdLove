import { describe, expect, it, vi } from 'vitest';
import { DbAiPersistenceAdapter } from '../ai/adapters/DbAiPersistenceAdapter';
import { runAiRetentionCleanup } from '../ai/maintenance/retention';

const retentionMocks = vi.hoisted(() => ({
  queryDatabaseRows: vi.fn(),
}));

vi.mock('@repo/database/client', () => ({
  canUseZenStackDb: () => true,
  queryDatabaseRows: retentionMocks.queryDatabaseRows,
}));

describe('DbAiPersistenceAdapter', () => {
  function makeDb() {
    const create = vi.fn().mockResolvedValue({ id: 'msg-1' });
    return { aiMessage: { create }, create };
  }

  it('persists saved messages', async () => {
    const db = makeDb();
    const adapter = new DbAiPersistenceAdapter(db);

    await adapter.persistMessage({
      userId: 'u-1',
      threadId: 'thread-1',
      role: 'assistant',
      content: 'Hello',
      privacyMode: 'saved',
    });

    expect(db.create).toHaveBeenCalledTimes(1);
    const { data } = db.create.mock.calls[0][0];
    expect(data).toMatchObject({
      user_id: 'u-1',
      thread_id: 'thread-1',
      role: 'assistant',
      content: 'Hello',
      privacy_mode: 'saved',
    });
    expect(data.expires_at).toBeNull();
  });

  it('sets an expiry for temporary messages', async () => {
    const db = makeDb();
    const adapter = new DbAiPersistenceAdapter(db);

    await adapter.persistMessage({
      userId: 'u-1',
      threadId: 'thread-1',
      role: 'user',
      content: 'Hi',
      privacyMode: 'temporary',
    });

    const { data } = db.create.mock.calls[0][0];
    expect(data.privacy_mode).toBe('temporary');
    expect(data.expires_at).toBeInstanceOf(Date);
    expect(data.expires_at.getTime()).toBeGreaterThan(Date.now());
  });

  it('never persists incognito messages', async () => {
    const db = makeDb();
    const adapter = new DbAiPersistenceAdapter(db);

    await adapter.persistMessage({
      userId: 'u-1',
      threadId: 'thread-1',
      role: 'assistant',
      content: 'Secret',
      privacyMode: 'incognito',
    });

    expect(db.create).not.toHaveBeenCalled();
  });

  it('no-ops when db is unavailable', async () => {
    const adapter = new DbAiPersistenceAdapter(null);
    await expect(
      adapter.persistMessage({
        userId: 'u-1',
        threadId: 'thread-1',
        role: 'user',
        content: 'Hi',
        privacyMode: 'saved',
      }),
    ).resolves.toBeUndefined();
  });
});

describe('Ai retention cleanup', () => {
  it('deletes expired temporary and old saved messages using the configured window', async () => {
    retentionMocks.queryDatabaseRows.mockReset();
    retentionMocks.queryDatabaseRows.mockImplementation(async (query: string) => {
      if (query.includes('app_config')) {
        return [{ value: '30' }];
      }
      if (query.includes('DELETE')) {
        return [{ id: 'a' }, { id: 'b' }];
      }
      return [];
    });

    const result = await runAiRetentionCleanup();

    expect(result).toEqual({ deleted: 2 });
    expect(retentionMocks.queryDatabaseRows).toHaveBeenCalledTimes(2);
    const deleteQuery = retentionMocks.queryDatabaseRows.mock.calls[1][0];
    expect(deleteQuery).toContain('DELETE FROM public.ai_messages');
    expect(deleteQuery).toContain('created_at < $1');
  });
});
