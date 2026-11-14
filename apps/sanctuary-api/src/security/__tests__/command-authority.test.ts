import type { PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import {
  type ActiveScope,
  assertCommandAuthority,
  authorizeCommand,
  type Capability,
  type CommandAuthority,
} from '../security';

const capability: Capability = {
  name: 'Learning::submit',
  resourceType: 'Assignment',
  resolveResource: async () => ({ id: 'a-1', attributes: {} }),
};
const policy = {
  action: 'create' as const,
  resourceType: 'Assignment' as const,
  resolveResource: async () => ({ id: 'a-1', attributes: {} }),
};
const scope = {} as ActiveScope;
const transaction = {} as PoolClient;
const signal = new AbortController().signal;

describe('durable command authority', () => {
  it('accepts a domain capability whose name matches the receipt capability', () => {
    expect(() =>
      assertCommandAuthority({ domainCapability: capability }, 'Learning::submit'),
    ).not.toThrow();
  });

  it('rejects a domain capability that differs from the receipt capability', () => {
    expect(() =>
      assertCommandAuthority({ domainCapability: capability }, 'Learning::grade'),
    ).toThrow(expect.objectContaining({ code: 'FORBIDDEN' }));
  });

  it('rejects both authorities at once, and neither', () => {
    const both = { domainCapability: capability, policy } as unknown as CommandAuthority;
    const neither = {} as CommandAuthority;
    expect(() => assertCommandAuthority(both, 'Learning::submit')).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN' }),
    );
    expect(() => assertCommandAuthority(neither, 'Learning::submit')).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN' }),
    );
  });

  it('keeps the role path limited to create, update and delete', () => {
    expect(() => assertCommandAuthority({ policy }, 'account.update')).not.toThrow();
    const read = { policy: { ...policy, action: 'read' } } as unknown as CommandAuthority;
    expect(() => assertCommandAuthority(read, 'account.read')).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN' }),
    );
  });

  it('decides a domain capability through the domain engine, inside the transaction', async () => {
    const security = {
      authorize: vi.fn(),
      authorizeCapability: vi.fn(async () => ({ permitted: true, policies: [] })),
    };
    await authorizeCommand(security, scope, { domainCapability: capability }, signal, transaction);
    expect(security.authorizeCapability).toHaveBeenCalledWith(
      scope,
      capability,
      signal,
      transaction,
    );
    expect(security.authorize).not.toHaveBeenCalled();
  });

  it('decides a role policy through the role engine, inside the transaction', async () => {
    const security = { authorize: vi.fn(async () => undefined), authorizeCapability: vi.fn() };
    await authorizeCommand(security, scope, { policy }, signal, transaction);
    expect(security.authorize).toHaveBeenCalledWith(scope, policy, signal, transaction);
    expect(security.authorizeCapability).not.toHaveBeenCalled();
  });

  it('passes a denial through so the command never runs', async () => {
    const denied = Object.assign(new Error('denied'), { code: 'FORBIDDEN' });
    const security = {
      authorize: vi.fn(),
      authorizeCapability: vi.fn(async () => {
        throw denied;
      }),
    };
    await expect(
      authorizeCommand(security, scope, { domainCapability: capability }, signal, transaction),
    ).rejects.toBe(denied);
  });
});
