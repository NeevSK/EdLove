import { describe, expect, it } from 'vitest';
import { findConsumers } from './consumers.adapter';

const names = ['identity.entry', 'identity.scopes', 'learning.assignments.submit'];

describe('consumers adapter', () => {
  it('finds calls through a client, a destructured namespace and a three-level path', () => {
    const found = findConsumers(names, [
      {
        path: 'apps/gurudevi-web/lib/a.ts',
        text: [
          'const entry = await client.identity.entry();',
          'const { identity } = client;',
          'await identity.scopes({ signal });',
          'await v1.learning.assignments.submit(input);',
        ].join('\n'),
      },
    ]);
    expect(found).toEqual([
      {
        capability: 'identity.entry',
        client: 'web',
        channel: 'app',
        file: 'apps/gurudevi-web/lib/a.ts',
        line: 1,
      },
      {
        capability: 'identity.scopes',
        client: 'web',
        channel: 'app',
        file: 'apps/gurudevi-web/lib/a.ts',
        line: 3,
      },
      {
        capability: 'learning.assignments.submit',
        client: 'web',
        channel: 'app',
        file: 'apps/gurudevi-web/lib/a.ts',
        line: 4,
      },
    ]);
  });

  it('does not count names in strings, comments, router handlers or bare references', () => {
    const found = findConsumers(names, [
      {
        path: 'apps/gurudevi-mobile/src/b.ts',
        text: [
          "const label = 'identity.entry';",
          '// client.identity.entry() is called elsewhere',
          'api.identity.entry.handler(() => null);',
          'const ref = client.identity.entry;',
        ].join('\n'),
      },
    ]);
    expect(found).toEqual([]);
  });

  it('labels the client by where the file lives', () => {
    const call = 'client.identity.entry();';
    const found = findConsumers(names, [
      { path: 'apps/gurudevi-mobile/app/x.tsx', text: call },
      { path: 'packages/core/src/logic/y.ts', text: call },
    ]);
    expect(found.map((c) => c.client)).toEqual(['mobile', 'core']);
  });
});
