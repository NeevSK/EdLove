import { describe, expect, it, vi } from 'vitest';
import { createV1SyncConnector } from '../v1Connector.adapter';

const grant = {
  endpoint: 'https://instance.powersync.example.test',
  token: 'jwt',
  expiresAt: 1_800_000_000,
};
const clientReturning = (syncCredentials: () => Promise<typeof grant>) => ({
  identity: { syncCredentials },
});
const rejection = (code: string) => Object.assign(new Error(code), { code });

describe('v1 sync connector', () => {
  it('fetches a fresh grant from identity.syncCredentials on every call', async () => {
    const syncCredentials = vi.fn(async () => grant);
    const connector = createV1SyncConnector(clientReturning(syncCredentials));

    await expect(connector.fetchCredentials()).resolves.toEqual({
      endpoint: grant.endpoint,
      token: 'jwt',
      expiresAt: new Date(1_800_000_000_000),
    });
    await connector.fetchCredentials();
    expect(syncCredentials).toHaveBeenCalledTimes(2);
  });

  it('reports signed out as no credentials, so PowerSync stops rather than retries', async () => {
    const connector = createV1SyncConnector(
      clientReturning(() => Promise.reject(rejection('UNAUTHORIZED'))),
    );
    await expect(connector.fetchCredentials()).resolves.toBeNull();
  });

  it('throws on an outage or a server without sync, so PowerSync retries later', async () => {
    for (const code of ['SERVICE_UNAVAILABLE', 'TOO_MANY_REQUESTS']) {
      const connector = createV1SyncConnector(
        clientReturning(() => Promise.reject(rejection(code))),
      );
      await expect(connector.fetchCredentials()).rejects.toMatchObject({ code });
    }
  });

  it('asks for no grant and uploads nothing once sync is no longer admitted', async () => {
    const syncCredentials = vi.fn(async () => grant);
    let admitted = true;
    const connector = createV1SyncConnector(clientReturning(syncCredentials), () => admitted);
    admitted = false;
    const getNextCrudTransaction = vi.fn(async () => null);

    await expect(connector.fetchCredentials()).resolves.toBeNull();
    // Not admitted is not "nothing to upload": fail so the queue waits for admission.
    await expect(connector.uploadData({ getNextCrudTransaction })).rejects.toThrow('not admitted');
    expect(syncCredentials).not.toHaveBeenCalled();
    expect(getNextCrudTransaction).not.toHaveBeenCalled();
  });

  it('has nothing to do when the upload queue is empty', async () => {
    const connector = createV1SyncConnector(clientReturning(async () => grant));
    await expect(
      connector.uploadData({ getNextCrudTransaction: async () => null }),
    ).resolves.toBeUndefined();
  });

  it('keeps local writes queued while no v1 capability accepts them, and names their tables', async () => {
    const complete = vi.fn();
    const connector = createV1SyncConnector(clientReturning(async () => grant));
    const database = {
      getNextCrudTransaction: async () => ({
        crud: [{ table: 'todos' }, { table: 'lists' }, { table: 'todos' }],
        complete,
      }),
    };

    await expect(connector.uploadData(database)).rejects.toThrow('lists, todos');
    // Completing would drop the writes; the queue must stay intact for when a capability exists.
    expect(complete).not.toHaveBeenCalled();
  });
});
