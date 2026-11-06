import { createRequire } from 'node:module';
import { expect, it, vi } from 'vitest';

it('reuses compiled policies for decisions and replaces the generation on reload', async () => {
  const require = createRequire(import.meta.url);
  const cedar =
    require('@cedar-policy/cedar-wasm/nodejs') as typeof import('@cedar-policy/cedar-wasm/nodejs');
  const parsePolicies = vi.spyOn(cedar, 'preparsePolicySet');
  const parseSchema = vi.spyOn(cedar, 'preparseSchema');
  const evaluate = vi.spyOn(cedar, 'statefulIsAuthorized');
  const reparsingEvaluate = vi.spyOn(cedar, 'isAuthorized');
  try {
    const { check, reinitializeCedar, cedarPolicyVersion } = await import('../engine/evaluator');
    const request = {
      principal: {
        type: 'principal',
        id: 'principal-1',
        attributes: {
          school_id: 'school-a',
          capacity: 'principal',
          active_entity_id: 'school-a',
          active_entity_type: 'SCHOOL',
        },
      },
      action: 'read',
      resource: { type: 'Classroom', id: 'class-1', attributes: { school_id: 'school-a' } },
    };
    const before = check(request);
    expect(before.permitted).toBe(true);
    expect(check(request)).toEqual(before);
    const unsafe = cedar.isAuthorized({
      principal: { type: 'User', id: 'alice' },
      action: { type: 'Action', id: 'read' },
      resource: { type: 'Document', id: 'one' },
      context: {},
      policies: {
        staticPolicies:
          'permit(principal, action, resource); forbid(principal, action, resource) when { resource.sensitive };',
      },
      entities: [
        { uid: { type: 'User', id: 'alice' }, attrs: {}, parents: [] },
        { uid: { type: 'Document', id: 'one' }, attrs: {}, parents: [] },
      ],
    });
    expect(unsafe.type).toBe('success');
    if (unsafe.type !== 'success') throw new Error('Expected Cedar decision');
    expect(unsafe.response.decision).toBe('allow');
    expect(unsafe.response.diagnostics.errors).toHaveLength(1);
    reparsingEvaluate.mockClear();
    evaluate.mockReturnValueOnce(unsafe);
    expect(check(request)).toMatchObject({ permitted: false, reason: 'CedarEvaluationFailure' });
    evaluate.mockClear();
    expect(parsePolicies).toHaveBeenCalledTimes(1);
    expect(parseSchema).toHaveBeenCalledTimes(1);
    expect(reparsingEvaluate).not.toHaveBeenCalled();
    const version = cedarPolicyVersion();
    check(request);
    const firstGeneration = evaluate.mock.calls[0]?.[0].preparsedPolicySetId;
    reinitializeCedar();
    expect(check(request)).toEqual(before);
    expect(cedarPolicyVersion()).toBe(version);
    expect(parsePolicies).toHaveBeenCalledTimes(2);
    expect(parseSchema).toHaveBeenCalledTimes(2);
    expect(evaluate.mock.calls[1]?.[0].preparsedPolicySetId).not.toBe(firstGeneration);
    expect(
      check({
        ...request,
        resource: { ...request.resource, attributes: { school_id: 'other-school' } },
      }).permitted,
    ).toBe(false);
    const activeGeneration = evaluate.mock.calls[1]?.[0].preparsedPolicySetId;
    parsePolicies.mockImplementationOnce(() => {
      throw new Error('Compilation interrupted');
    });
    reinitializeCedar();
    expect(check(request)).toEqual(before);
    expect(cedarPolicyVersion()).toBe(version);
    expect(evaluate.mock.calls.at(-1)?.[0].preparsedPolicySetId).toBe(activeGeneration);
  } finally {
    vi.restoreAllMocks();
  }
});
