import { readFileSync } from 'node:fs';
import { check } from '@repo/policies';
import { describe, expect, it, vi } from 'vitest';
import { evaluateShape2 } from '../cedarClientEvaluator';

// Exercise Cedar's real engine while substituting browser WASM initialization in Node.
vi.mock('@cedar-policy/cedar-wasm/web', async () => {
  const engine = await import('@cedar-policy/cedar-wasm/nodejs');
  return { default: vi.fn(async () => {}), isAuthorized: engine.isAuthorized };
});

describe('client Cedar adapter with real engine', () => {
  it('aligns the client with the server for a mapped domain verb', async () => {
    const policyFile = new URL(
      './src/policies/guest/personal.cedar',
      import.meta.resolve('@repo/policies/package.json'),
    );
    const policies = readFileSync(policyFile, 'utf8');
    const server = check({
      principal: { id: 'alice', type: 'member', attributes: { capacity: 'member', school_id: '' } },
      action: 'verify',
      resource: { type: 'User', id: 'alice', attributes: {} },
    });
    const client = await evaluateShape2(policies, {
      user: { id: 'alice', attrs: { capacity: 'member', school_id: '', classroom_ids: [] } },
      action: 'verify',
      resourceType: 'User',
      resourceId: 'alice',
      resourceAttrs: {},
    });
    expect(server.permitted).toBe(true);
    expect(client).toBe(true);
  });
  const request = {
    user: { id: 'alice', attrs: { school_id: 's1', capacity: 'teacher', classroom_ids: [] } },
    action: 'read',
    resourceType: 'Classroom',
    resourceId: 'c1',
    resourceAttrs: { school_id: 's1' },
  };

  it('allows only a matching tenant', async () => {
    const policy =
      'permit(principal, action, resource) when { principal.school_id == resource.school_id };';
    await expect(evaluateShape2(policy, request)).resolves.toBe(true);
    await expect(
      evaluateShape2(policy, { ...request, resourceAttrs: { school_id: 's2' } }),
    ).resolves.toBe(false);
  });

  it('surfaces policy errors to the existing fallback', async () => {
    const policy =
      'permit(principal, action, resource); forbid(principal, action, resource) when { resource.secret };';
    await expect(evaluateShape2(policy, request)).rejects.toThrow();
  });

  it('provides authenticated IDs as attributes and handles a self resource once', async () => {
    const policy = 'permit(principal, action, resource) when { resource.id == principal.id };';
    await expect(
      evaluateShape2(policy, {
        ...request,
        resourceType: 'User',
        resourceId: 'alice',
        resourceAttrs: {},
      }),
    ).resolves.toBe(true);
    await expect(
      evaluateShape2(policy, {
        ...request,
        resourceType: 'User',
        resourceId: 'bob',
        resourceAttrs: {},
      }),
    ).resolves.toBe(false);
  });

  it('does not promote self-resource attributes into authenticated principal attributes', async () => {
    const policy =
      'permit(principal, action, resource) when { principal has grade_id && principal.grade_id == "elevated" };';
    await expect(
      evaluateShape2(policy, {
        ...request,
        resourceType: 'User',
        resourceId: 'alice',
        resourceAttrs: { grade_id: 'elevated' },
      }),
    ).resolves.toBe(false);
    await expect(
      evaluateShape2(policy, {
        ...request,
        user: { ...request.user, attrs: { ...request.user.attrs, grade_id: 'elevated' } },
        resourceType: 'User',
        resourceId: 'alice',
        resourceAttrs: {},
      }),
    ).resolves.toBe(true);
  });
});
