import { readFileSync } from 'node:fs';
import { isAuthorized, schemaToJson } from '@cedar-policy/cedar-wasm/nodejs';
import { describe, expect, it, vi } from 'vitest';
import { check } from '../engine/evaluator';

describe('Cedar WASM authorization contract', () => {
  const request = {
    principal: { type: 'User', id: 'alice' },
    action: { type: 'Action', id: 'read' },
    resource: { type: 'Document', id: 'one' },
    context: {},
    entities: [
      { uid: { type: 'User', id: 'alice' }, attrs: {}, parents: [] },
      { uid: { type: 'Document', id: 'one' }, attrs: {}, parents: [] },
    ],
  };

  it('exposes the web authorization API used by the installed release', async () => {
    const web = await import('@cedar-policy/cedar-wasm/web');
    expect(web.isAuthorized).toBeTypeOf('function');
    expect(web.default).toBeTypeOf('function');
    expect('evaluate' in web).toBe(false);
  });

  it('reports an errored forbid separately even when another policy permits', () => {
    const result = isAuthorized({
      ...request,
      policies: {
        staticPolicies:
          'permit(principal, action, resource); forbid(principal, action, resource) when { resource.sensitive };',
      },
    });
    expect(result.type).toBe('success');
    if (result.type !== 'success') throw new Error('Expected a Cedar decision');
    expect(result.response.decision).toBe('allow');
    expect(result.response.diagnostics.errors).toHaveLength(1);
  });

  it('keeps personal policy decisions unchanged when guarding a missing type attribute', () => {
    const legacy =
      'permit(principal, action, resource) when { principal.capacity == "member" && resource.type == "User" && resource.id == principal.id };';
    const guarded =
      'permit(principal, action, resource) when { principal.capacity == "member" && resource has type && resource.type == "User" && resource.id == principal.id };';
    for (const attrs of [
      { id: 'alice' },
      { id: 'alice', type: 'User' },
      { id: 'bob', type: 'User' },
      { id: 'alice', type: 'other' },
    ]) {
      const entities = [
        {
          uid: { type: 'User', id: 'alice' },
          attrs: { id: 'alice', capacity: 'member' },
          parents: [],
        },
        { uid: { type: 'Document', id: 'one' }, attrs, parents: [] },
      ];
      const before = isAuthorized({ ...request, entities, policies: { staticPolicies: legacy } });
      const after = isAuthorized({ ...request, entities, policies: { staticPolicies: guarded } });
      expect(before.type).toBe('success');
      expect(after.type).toBe('success');
      if (before.type !== 'success' || after.type !== 'success')
        throw new Error('Expected Cedar decisions');
      expect(after.response.decision).toBe(before.response.decision);
      expect(after.response.diagnostics.errors).toHaveLength(0);
    }
  });

  it.each([
    ['submitter_id', 'EditorialSubmission'],
    ['user_id', 'ManifestoEndorsement'],
  ])('guards missing %s without changing decisions for %s', (attribute, type) => {
    const legacy = `permit(principal, action, resource) when { resource is ${type} && resource.${attribute} == principal.id };`;
    const guarded = `permit(principal, action, resource) when { resource is ${type} && resource has ${attribute} && resource.${attribute} == principal.id };`;
    for (const attrs of [{}, { [attribute]: 'alice' }, { [attribute]: 'bob' }]) {
      const entities = [
        { uid: { type: 'User', id: 'alice' }, attrs: { id: 'alice' }, parents: [] },
        { uid: { type, id: 'one' }, attrs, parents: [] },
      ];
      const input = { ...request, resource: { type, id: 'one' }, entities };
      const before = isAuthorized({ ...input, policies: { staticPolicies: legacy } });
      const after = isAuthorized({ ...input, policies: { staticPolicies: guarded } });
      if (before.type !== 'success' || after.type !== 'success')
        throw new Error('Expected Cedar decisions');
      expect(after.response.decision).toBe(before.response.decision);
      expect(after.response.diagnostics.errors).toHaveLength(0);
    }
  });

  it('guards an absent admin capacity without broadening access', () => {
    const legacy = 'permit(principal, action, resource) when { principal.capacity == "admin" };';
    const guarded =
      'permit(principal, action, resource) when { principal has capacity && principal.capacity == "admin" };';
    for (const attrs of [{}, { capacity: 'admin' }, { capacity: 'teacher' }]) {
      const entities = [
        { uid: { type: 'User', id: 'alice' }, attrs, parents: [] },
        { uid: { type: 'Document', id: 'one' }, attrs: {}, parents: [] },
      ];
      const before = isAuthorized({ ...request, entities, policies: { staticPolicies: legacy } });
      const after = isAuthorized({ ...request, entities, policies: { staticPolicies: guarded } });
      if (before.type !== 'success' || after.type !== 'success')
        throw new Error('Expected Cedar decisions');
      expect(after.response.decision).toBe(before.response.decision);
      expect(after.response.diagnostics.errors).toHaveLength(0);
    }
  });

  it('preserves school role decisions when principal attributes are missing', () => {
    const legacy =
      'permit(principal, action, resource) when { principal.capacity == "principal" && resource has school_id && resource.school_id == principal.school_id };';
    const guarded =
      'permit(principal, action, resource) when { principal has capacity && principal has school_id && principal.capacity == "principal" && resource has school_id && resource.school_id == principal.school_id };';
    for (const attrs of [
      {},
      { capacity: 'principal' },
      { capacity: 'principal', school_id: 's1' },
      { capacity: 'principal', school_id: 's2' },
    ]) {
      const entities = [
        { uid: { type: 'User', id: 'alice' }, attrs, parents: [] },
        { uid: { type: 'Document', id: 'one' }, attrs: { school_id: 's1' }, parents: [] },
      ];
      const before = isAuthorized({ ...request, entities, policies: { staticPolicies: legacy } });
      const after = isAuthorized({ ...request, entities, policies: { staticPolicies: guarded } });
      if (before.type !== 'success' || after.type !== 'success')
        throw new Error('Expected Cedar decisions');
      expect(after.response.decision).toBe(before.response.decision);
      expect(after.response.diagnostics.errors).toHaveLength(0);
    }
  });

  it('preserves ledger forbids for absent, matching and mismatching owners', () => {
    const legacy =
      'forbid(principal, action, resource) when { resource is PrivacyLedgerEntry && (!(resource has user_id) || resource.user_id != principal.id || !(action in [Action::"read", Action::"create"])) };';
    const guarded =
      'forbid(principal, action, resource) when { resource is PrivacyLedgerEntry && (if resource has user_id then (resource.user_id != principal.id || !(action in [Action::"read", Action::"create"])) else true) };';
    for (const attrs of [{}, { user_id: 'alice' }, { user_id: 'bob' }]) {
      for (const action of ['read', 'create', 'update', 'delete']) {
        const input = {
          ...request,
          action: { type: 'Action', id: action },
          resource: { type: 'PrivacyLedgerEntry', id: 'one' },
          entities: [
            { uid: { type: 'User', id: 'alice' }, attrs: { id: 'alice' }, parents: [] },
            { uid: { type: 'PrivacyLedgerEntry', id: 'one' }, attrs, parents: [] },
          ],
        };
        const before = isAuthorized({
          ...input,
          policies: { staticPolicies: `permit(principal, action, resource); ${legacy}` },
        });
        const after = isAuthorized({
          ...input,
          policies: { staticPolicies: `permit(principal, action, resource); ${guarded}` },
        });
        if (before.type !== 'success' || after.type !== 'success')
          throw new Error('Expected Cedar decisions');
        expect(after.response.decision).toBe(before.response.decision);
      }
    }
  });

  it('denies a request without a matching permit', () => {
    const result = isAuthorized({ ...request, policies: { staticPolicies: '' } });
    expect(result.type).toBe('success');
    if (result.type !== 'success') throw new Error('Expected a Cedar decision');
    expect(result.response.decision).toBe('deny');
    expect(result.response.diagnostics.errors).toHaveLength(0);
  });

  it('characterizes the current FormTemplate action schema gap', () => {
    const source = readFileSync(new URL('../schema/schema.cedarschema', import.meta.url), 'utf8');
    const schema = schemaToJson(source);
    if (schema.type !== 'success') throw new Error('Expected a valid Cedar schema');
    const result = isAuthorized({
      principal: { type: 'User', id: 'alice' },
      action: { type: 'Action', id: 'read' },
      resource: { type: 'FormTemplate', id: 'one' },
      context: {},
      schema: schema.json,
      policies: { staticPolicies: 'permit(principal, action, resource);' },
      entities: [
        { uid: { type: 'User', id: 'alice' }, attrs: { id: 'alice' }, parents: [] },
        { uid: { type: 'FormTemplate', id: 'one' }, attrs: { id: 'one' }, parents: [] },
      ],
    });
    expect(result.type).toBe('failure');
    if (result.type !== 'failure') throw new Error('Expected request validation failure');
    expect(result.errors.some((error) => error.message.includes('FormTemplate'))).toBe(true);
  });

  it('does not report a policy error for a member reading their ledger', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      check({
        principal: {
          type: 'member',
          id: 'owner',
          attributes: { capacity: 'member', school_id: 'school-a' },
        },
        action: 'read',
        resource: { id: 'ledger', type: 'PrivacyLedgerEntry', attributes: { user_id: 'owner' } },
      });
      expect(warning).not.toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'authorization.policy_evaluation_errors',
        }),
      );
    } finally {
      warning.mockRestore();
    }
  });
});
