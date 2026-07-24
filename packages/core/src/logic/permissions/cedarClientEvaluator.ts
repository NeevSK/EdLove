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

type EvaluateFn = (args: {
  policies: string;
  schema: string;
  request: {
    principal: { type: string; id: string };
    action: { type: string; id: string };
    resource: { type: string; id: string };
    context: Record<string, unknown>;
  };
  entities: Array<{
    uid: { type: string; id: string };
    attrs: Record<string, unknown>;
    parents: string[];
  }>;
}) => Promise<{ decision: string }>;

let _wasmPromise: Promise<EvaluateFn> | null = null;
let _wasmLoaded = false;

function getWasmEvaluator(): Promise<EvaluateFn> {
  if (_wasmPromise) return _wasmPromise;
  _wasmPromise = (async () => {
    try {
      // @ts-expect-error - Dynamic import for cross-platform WASM compat
      const mod = await import('@cedar-policy/cedar-wasm/web');
      _wasmLoaded = true;
      return mod.evaluate as EvaluateFn;
    } catch {
      _wasmLoaded = false;
      throw new Error('CedarClientEvaluator: failed to load @cedar-policy/cedar-wasm/web');
    }
  })();
  return _wasmPromise;
}

export function isCedarWasmLoaded(): boolean {
  return _wasmLoaded;
}

/**
 * warmCedarWasm — eagerly loads the WASM module at boot per D4 Section 1.
 * Safe to call multiple times; the module-level promise cache ensures
 * the WASM is loaded at most once.
 */
export function warmCedarWasm(): Promise<void> {
  return getWasmEvaluator().then(() => {}, () => {});
}

const SHAPE1_PLACEHOLDER_ID = '__cedar_shape1_check__';

export interface CedarUserAttrs {
  school_id: string;
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
export async function evaluateShape1(
  policyString: string,
  req: Shape1Request,
): Promise<boolean> {
  const evaluate = await getWasmEvaluator();
  const decision = await evaluate({
    policies: policyString,
    schema: '',
    request: {
      principal: { type: 'User', id: req.user.id },
      action: { type: 'Action', id: req.action },
      resource: { type: req.resourceType, id: SHAPE1_PLACEHOLDER_ID },
      context: {},
    },
    entities: [
      {
        uid: { type: 'User', id: req.user.id },
        attrs: req.user.attrs as unknown as Record<string, unknown>,
        parents: [],
      },
    ],
  });
  return decision.decision === 'Allow';
}

/**
 * evaluateShape2 — instance-level permission check.
 * Can this user perform this action on THIS specific resource?
 * Used for offline write checks and record-level gating.
 */
export async function evaluateShape2(
  policyString: string,
  req: Shape2Request,
): Promise<boolean> {
  const evaluate = await getWasmEvaluator();
  const decision = await evaluate({
    policies: policyString,
    schema: '',
    request: {
      principal: { type: 'User', id: req.user.id },
      action: { type: 'Action', id: req.action },
      resource: { type: req.resourceType, id: req.resourceId },
      context: {},
    },
    entities: [
      {
        uid: { type: 'User', id: req.user.id },
        attrs: req.user.attrs as unknown as Record<string, unknown>,
        parents: [],
      },
      {
        uid: { type: req.resourceType, id: req.resourceId },
        attrs: req.resourceAttrs,
        parents: [],
      },
    ],
  });
  return decision.decision === 'Allow';
}

/**
 * Reset the WASM loader for testing.
 */
export function _resetWasmForTesting(): void {
  _wasmPromise = null;
  _wasmLoaded = false;
}
