import { describe, expect, it } from 'vitest';
import {
  createModularPolicySet,
  decideCapability,
  loadModularPolicySet,
  type ModularRequest,
} from '../modules/engine';

const request: ModularRequest = {
  accountId: '01234567-89ab-8101-8000-010203040506',
  bond: {
    id: 'bond-1',
    capacity: 'teacher',
    citizenship: 'FIRST_CLASS',
    entityType: 'SCHOOL',
    entityId: 'school-1',
  },
  capability: 'Learning::submit',
  resource: { type: 'Assignment', id: 'a-1', attributes: { schoolId: 'school-1' } },
};

describe('domain-namespaced Cedar engine', () => {
  const set = loadModularPolicySet();

  it.each(['Learning', 'Ops', 'Wellbeing', 'Library'])(
    'preserves source policy ids and forbid precedence for synthetic %s capabilities',
    (namespace) => {
      const schema = set.schema.replace(
        `namespace ${namespace} {}`,
        `namespace ${namespace} {
        entity Record;
        action "inspect" appliesTo {
          principal: [Platform::Account], resource: [Record], context: { bond: Platform::Bond }
        };
      }`,
      );
      const permit = `permit(principal, action == ${namespace}::Action::"inspect", resource);`;
      const forbid = `forbid(principal, action == ${namespace}::Action::"inspect", resource)
        when { context.bond.entityId == "blocked" };`;
      const source = `${namespace.toLowerCase()}/synthetic.cedar`;
      const policies = createModularPolicySet({
        schemas: [schema],
        policies: [{ source, text: `${permit}\n${forbid}` }],
      });
      const input = {
        ...request,
        capability: `${namespace}::inspect`,
        resource: { type: 'Record', id: 'test', attributes: {} },
      };
      expect(decideCapability(policies, input)).toEqual({
        permitted: true,
        policies: [`${source}#0`],
      });
      expect(
        decideCapability(policies, { ...input, bond: { ...input.bond, entityId: 'blocked' } }),
      ).toEqual({ permitted: false, policies: [`${source}#1`] });
      expect(Object.isFrozen(policies.policyMap)).toBe(true);
      expect(() =>
        decideCapability(policies, { ...input, capability: `${namespace}::undeclared` }),
      ).toThrow();
      expect(() =>
        decideCapability(policies, {
          ...input,
          resource: { ...input.resource, type: 'Undeclared' },
        }),
      ).toThrow();
      expect(() =>
        createModularPolicySet({
          schemas: [schema],
          policies: [
            { source, text: permit },
            { source, text: forbid },
          ],
        }),
      ).toThrow(/Duplicate Cedar policy id/);
    },
  );

  it('rejects malformed policy sources and templates instead of silently omitting them', () => {
    for (const text of ['not a policy', 'permit(principal == ?principal, action, resource);']) {
      expect(() =>
        createModularPolicySet({
          schemas: [set.schema],
          policies: [{ source: 'test.cedar', text }],
        }),
      ).toThrow();
    }
  });

  it('loads every domain namespace and the platform namespace', () => {
    expect([...set.namespaces].sort()).toEqual([
      'Agents',
      'Community',
      'Family',
      'Journey',
      'Learning',
      'Library',
      'Ops',
      'Platform',
      'Rewards',
      'Wellbeing',
    ]);
  });

  it.each([
    'Wellbeing',
    'Learning',
    'Ops',
    'Family',
    'Community',
    'Library',
    'Journey',
    'Rewards',
    'Agents',
  ])('denies %s capabilities while no policy permits them', (namespace) => {
    expect(decideCapability(set, { ...request, capability: `${namespace}::anything` })).toEqual({
      permitted: false,
      policies: [],
    });
  });

  it('rejects capabilities outside a loaded namespace', () => {
    expect(() => decideCapability(set, { ...request, capability: 'Payroll::run' })).toThrow();
    expect(() => decideCapability(set, { ...request, capability: 'submit' })).toThrow();
    expect(() => decideCapability(set, { ...request, capability: 'Learning::a::b' })).toThrow();
  });

  it('permits through the bond and its citizenship once a policy says so', () => {
    // What an admitted card adds: the action and resource in its namespace, and a policy.
    const learning = `namespace Learning {
      entity Assignment { schoolId: String };
      action "submit" appliesTo {
        principal: [Platform::Account], resource: [Assignment], context: { bond: Platform::Bond }
      };
    }`;
    const withPolicy = createModularPolicySet({
      schemas: [set.schema.replace(/namespace Learning \{\}/, learning)],
      policies: [
        `permit(principal, action == Learning::Action::"submit", resource)
         when { context.bond.capacity == "teacher" && context.bond.citizenship == "FIRST_CLASS" };`,
      ],
    });
    const permitted = decideCapability(withPolicy, request);
    expect(permitted.permitted).toBe(true);
    expect(permitted.policies).toHaveLength(1);
    expect(
      decideCapability(withPolicy, {
        ...request,
        bond: { ...request.bond, citizenship: 'SECOND_CLASS' },
      }).permitted,
    ).toBe(false);
    expect(
      decideCapability(withPolicy, { ...request, bond: { ...request.bond, capacity: 'student' } })
        .permitted,
    ).toBe(false);
  });

  it('refuses to start with an invalid schema', () => {
    expect(() =>
      createModularPolicySet({ schemas: ['namespace Broken {'], policies: [] }),
    ).toThrow();
  });
});
