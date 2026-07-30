import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { app } from '../core/app';

export function createTestORPCClient(headers: Record<string, string> = {}) {
  const link = new RPCLink<Record<never, never>>({
    url: 'http://sanctuary.test/api',
    headers,
    fetch: async (request, init) => app.fetch(new Request(request, init)),
  });

  return createORPCClient<any>(link);
}
