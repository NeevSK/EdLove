/**
 * CedarClientEvaluator — singleton WASM loader + Shape 1 / Shape 2 evaluator.
 *
 * Loads @cedar-policy/cedar-wasm/web once at module scope (lazy).
 * Provides evaluate() for both role-level (Shape 1) and instance-level (Shape 2) checks.
 *
 * Shape 1: "Can this capacity perform this action on this resource type?"
 *   → evaluated with generic resource ID, no instance attributes needed.
 * Shape 2: "Can this user act on this specific record?"
 *   → evaluated with real resource ID + instance attributes.
 */

import type { AuthorizationAnswer, AuthorizationCall } from '@cedar-policy/cedar-wasm/web';
import { cedarActionFor } from '@repo/policies/authorizationRegistry';
import { z } from 'zod';

type EvaluateFn = (args: AuthorizationCall) => AuthorizationAnswer;
const entityAttributes = z.record(z.string(), z.json());

let _wasmPromise: Promise<EvaluateFn> | null = null;
let _wasmLoaded = false;

function getWasmEvaluator(): Promise<EvaluateFn> {
  if (_wasmPromise) return _wasmPromise;
  _wasmPromise = (async () => {
    try {
      const mod = await import('@cedar-policy/cedar-wasm/web');
      await mod.default();
      _wasmLoaded = true;
      return mod.isAuthorized;
    } catch (error) {
      _wasmLoaded = false;
      _wasmPromise = null;
      throw new Error('CedarClientEvaluator: failed to load @cedar-policy/cedar-wasm/web', {
        cause: error,
      });
    }
  })();
  return _wasmPromise;
}

export function isCedarWasmLoaded(): boolean {
  return _wasmLoaded;
}

/**
 * warmCedarWasm — eagerly loads the WASM module at boot per D4 Section 1.
 * Safe to call multiple times; successful initialization is cached and failed
 * initialization can be retried.
 */
export function warmCedarWasm(): Promise<void> {
  return getWasmEvaluator().then(
    () => {},
    () => {},
  );
}

const SHAPE1_PLACEHOLDER_ID = '__cedar_shape1_check__';

export interface CedarUserAttrs {
  school_id: string;
  active_entity_id?: string;
  active_entity_type?: string;
  capacity: string;
  grade_id?: string;
  section_id?: string;
  classroom_ids: string[];
  child_student_ids?: string[];
}

export interface Shape1Request {
  user: { id: string; attrs: CedarUserAttrs };
  action: string;
  resourceType: string;
}

export interface Shape2Request extends Shape1Request {
  resourceId: string;
  resourceAttrs: Record<string, unknown>;
}

/**
 * evaluateShape1 — role-level capability check.
 * Does this user's capacity permit this action on this resource type?
 * Uses a placeholder resource ID — no instance data needed.
 */
export async function evaluateShape1(policyString: string, req: Shape1Request): Promise<boolean> {
  const evaluate = await getWasmEvaluator();
  const decision = evaluate({
    policies: { staticPolicies: policyString },
    principal: { type: 'User', id: req.user.id },
    action: { type: 'Action', id: cedarActionFor(req.action, req.resourceType) },
    resource: { type: req.resourceType, id: SHAPE1_PLACEHOLDER_ID },
    context: {},
    entities: [
      {
        uid: { type: 'User', id: req.user.id },
        // contract-check: shapes typed request attributes into Cedar entity attributes
        attrs: entityAttributes.parse({ ...req.user.attrs, id: req.user.id }),
        parents: [],
      },
    ],
  });
  if (decision.type === 'failure' || decision.response.diagnostics.errors.length > 0) {
    throw new Error('CedarClientEvaluator: authorization evaluation failed');
  }
  return decision.response.decision === 'allow';
}

/**
 * evaluateShape2 — instance-level permission check.
 * Can this user perform this action on THIS specific resource?
 * Used for offline write checks and record-level gating.
 */
export async function evaluateShape2(policyString: string, req: Shape2Request): Promise<boolean> {
  const evaluate = await getWasmEvaluator();
  // contract-check: shapes typed request attributes into Cedar entity attributes
  const principalAttrs = entityAttributes.parse({ ...req.user.attrs, id: req.user.id });
  // contract-check: shapes typed request attributes into Cedar entity attributes
  const resourceAttrs = entityAttributes.parse({ ...req.resourceAttrs, id: req.resourceId });
  const sameEntity = req.resourceType === 'User' && req.resourceId === req.user.id;
  const decision = evaluate({
    policies: { staticPolicies: policyString },
    principal: { type: 'User', id: req.user.id },
    action: { type: 'Action', id: cedarActionFor(req.action, req.resourceType) },
    resource: { type: req.resourceType, id: req.resourceId },
    context: {},
    entities: [
      {
        uid: { type: 'User', id: req.user.id },
        attrs: principalAttrs,
        parents: [],
      },
      ...(!sameEntity
        ? [
            {
              uid: { type: req.resourceType, id: req.resourceId },
              attrs: resourceAttrs,
              parents: [],
            },
          ]
        : []),
    ],
  });
  if (decision.type === 'failure' || decision.response.diagnostics.errors.length > 0) {
    throw new Error('CedarClientEvaluator: authorization evaluation failed');
  }
  return decision.response.decision === 'allow';
}

/**
 * Reset the WASM loader for testing.
 */
export function _resetWasmForTesting(): void {
  _wasmPromise = null;
  _wasmLoaded = false;
}
