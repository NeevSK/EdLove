import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Domain-namespaced Cedar: one schema fragment per domain plus `platform`, and
// policy files under modules/<domain>/. With no policy files every request is
// denied. The role-shaped engine in ../engine stays in use until each domain's
// rules move here. Structure: docs/architecture/module-structure.md#cedar-as-modules-too

type CedarResult<T> = { type: 'success' } & T;
type CedarFailure = { type: 'failure'; errors: { message: string }[] };
interface CedarWasm {
  policySetTextToParts(
    text: string,
  ): CedarResult<{ policies: string[]; policy_templates: string[] }> | CedarFailure;
  checkParseSchema(schema: string): CedarResult<object> | CedarFailure;
  validate(call: {
    schema: string;
    policies: { staticPolicies: string | Record<string, string> };
  }): CedarResult<{ validationErrors: { error: { message: string } }[] }> | CedarFailure;
  isAuthorized(call: object):
    | CedarResult<{
        response: {
          decision: 'allow' | 'deny';
          diagnostics: { reason: string[]; errors: { error: { message: string } }[] };
        };
      }>
    | CedarFailure;
}

// Resolved through the package, like ../engine/evaluator, so bundled hosts still find
// the source fragments.
const packageUrl = import.meta.resolve('@repo/policies/package.json');
const cedar = createRequire(packageUrl)('@cedar-policy/cedar-wasm/nodejs') as CedarWasm;
const modulesDir = fileURLToPath(new URL('./src/modules/', packageUrl));

export interface ModularPolicySet {
  readonly namespaces: readonly string[];
  readonly schema: string;
  readonly policies: string;
  readonly policyMap: Readonly<Record<string, string>>;
}

export interface ModularRequest {
  accountId: string;
  bond: {
    id: string;
    capacity: string;
    citizenship: string;
    entityType: string;
    entityId: string;
  };
  /** `<Namespace>::<capability>`, e.g. `Learning::submit`. */
  capability: string;
  resource: { type: string; id: string; attributes: Record<string, string | number | boolean> };
}

export interface ModularDecision {
  permitted: boolean;
  /** Ids of the policies that decided; empty when nothing permitted. */
  policies: string[];
}

/** Assembles and validates a policy set. Throws if the schema or a policy is invalid. */
export function createModularPolicySet(fragments: {
  schemas: readonly string[];
  policies: readonly (string | { source: string; text: string })[];
}): ModularPolicySet {
  const schema = fragments.schemas.join('\n');
  const parsed = cedar.checkParseSchema(schema);
  if (parsed.type !== 'success')
    throw new Error(`Invalid Cedar schema: ${parsed.errors.map((e) => e.message).join('; ')}`);
  const policyMap: Record<string, string> = {};
  const policies = fragments.policies
    .map((fragment, index) => {
      const source = typeof fragment === 'string' ? `inline/${index}` : fragment.source;
      const text = typeof fragment === 'string' ? fragment : fragment.text;
      if (!source.trim()) throw new Error('Cedar policy source must not be empty');
      const parts = cedar.policySetTextToParts(text);
      if (parts.type !== 'success') throw new Error(`Invalid Cedar policy source: ${source}`);
      if (parts.policy_templates.length)
        throw new Error(`Cedar templates are not admitted: ${source}`);
      parts.policies.forEach((policy, policyIndex) => {
        const id = `${source}#${policyIndex}`;
        if (Object.hasOwn(policyMap, id)) throw new Error(`Duplicate Cedar policy id: ${id}`);
        policyMap[id] = policy;
      });
      return text;
    })
    .join('\n');
  const validation = cedar.validate({ schema, policies: { staticPolicies: policyMap } });
  if (validation.type !== 'success')
    throw new Error(
      `Invalid Cedar policies: ${validation.errors.map((e) => e.message).join('; ')}`,
    );
  if (validation.validationErrors.length)
    throw new Error(
      `Cedar policies fail validation: ${validation.validationErrors.map((e) => e.error.message).join('; ')}`,
    );
  const namespaces = [...schema.matchAll(/^\s*namespace\s+([A-Za-z]+)\s*\{/gm)].map(
    (m) => m[1] ?? '',
  );
  return Object.freeze({
    namespaces: Object.freeze(namespaces),
    schema,
    policies,
    policyMap: Object.freeze(policyMap),
  });
}

/** Reads every fragment and policy file under modules/. Call once at startup. */
export function loadModularPolicySet(): ModularPolicySet {
  const entries = readdirSync(modulesDir, { withFileTypes: true, recursive: true });
  const read = (suffix: string) =>
    entries
      .filter((e) => e.isFile() && e.name.endsWith(suffix))
      .map((e) => join(e.parentPath, e.name))
      .sort()
      .map((path) => readFileSync(path, 'utf8'));
  const policies = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.cedar'))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort()
    .map((path) => ({
      source: relative(modulesDir, path).replaceAll('\\', '/'),
      text: readFileSync(path, 'utf8'),
    }));
  return createModularPolicySet({ schemas: read('.cedarschema'), policies });
}

/**
 * Decides one request. Unknown namespaces and evaluation errors throw, so the caller
 * can fail closed; a clean "no policy permits" is a deny.
 */
export function decideCapability(set: ModularPolicySet, request: ModularRequest): ModularDecision {
  const [namespace, name, ...rest] = request.capability.split('::');
  if (!namespace || !name || rest.length || !set.namespaces.includes(namespace))
    throw new Error(`Unknown capability namespace: ${request.capability}`);
  // Empty skeletons have no declared actions and can never permit a request.
  if (Object.keys(set.policyMap).length === 0) return { permitted: false, policies: [] };
  const bond = { type: 'Platform::Bond', id: request.bond.id };
  const answer = cedar.isAuthorized({
    schema: set.schema,
    validateRequest: true,
    principal: { type: 'Platform::Account', id: request.accountId },
    action: { type: `${namespace}::Action`, id: name },
    resource: { type: `${namespace}::${request.resource.type}`, id: request.resource.id },
    context: { bond: { __entity: bond } },
    policies: { staticPolicies: set.policyMap },
    entities: [
      { uid: { type: 'Platform::Account', id: request.accountId }, attrs: {}, parents: [] },
      {
        uid: bond,
        attrs: {
          capacity: request.bond.capacity,
          citizenship: request.bond.citizenship,
          entityType: request.bond.entityType,
          entityId: request.bond.entityId,
        },
        parents: [],
      },
      {
        uid: { type: `${namespace}::${request.resource.type}`, id: request.resource.id },
        attrs: request.resource.attributes,
        parents: [],
      },
    ],
  });
  if (answer.type !== 'success')
    throw new Error(`Cedar evaluation failed: ${answer.errors.map((e) => e.message).join('; ')}`);
  const { decision, diagnostics } = answer.response;
  if (diagnostics.errors.length)
    throw new Error(
      `Cedar policy errors: ${diagnostics.errors.map((e) => e.error.message).join('; ')}`,
    );
  return { permitted: decision === 'allow', policies: diagnostics.reason };
}
