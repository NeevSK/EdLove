import { describe, expect, it } from 'vitest';
import { classifyFailure } from '../../../logic/failure/classifyFailure';
import { createV1Client } from '../client';

// A fetch that never answers until its signal aborts, like a stalled mobile connection.
// Like real fetch, it rejects at once when handed an already-aborted signal.
const stalled = (_url: unknown, init: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    const abort = () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    if (init.signal?.aborted) abort();
    else init.signal?.addEventListener('abort', abort);
  });

describe('G1 v1 transport timeout', () => {
  it('abandons a stalled call as UnavailableError, which is worth retrying', async () => {
    const client = createV1Client({ origin: 'https://api.example.test', fetch: stalled, timeoutMs: 20 });
    const error = await client.identity.session().catch((e: unknown) => e);
    expect(classifyFailure(error)).toMatchObject({ _tag: 'UnavailableError', code: 'CLIENT_TIMEOUT' });
  });

  it("keeps the caller's own cancellation an AbortError", async () => {
    const client = createV1Client({ origin: 'https://api.example.test', fetch: stalled, timeoutMs: 5_000 });
    const controller = new AbortController();
    const call = client.identity.session(undefined, { signal: controller.signal }).catch((e: unknown) => e);
    controller.abort();
    const error = await call;
    expect((error as { name?: string }).name).toBe('AbortError');
  });
});
