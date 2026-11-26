/**
 * How an activity's run settings reach H5P content. H5P keeps its buttons in `content.json`,
 * not in the player, so an exam can turn off retry and "show solution" by rewriting those
 * settings when the content is played. The teacher's package is never changed: this returns a
 * new tree.
 *
 * Checked against each library's `semantics.json` (h5p GitHub, 14 Nov 2026):
 * - Question types (MultiChoice, TrueFalse, Blanks, DragText, MarkTheWords, DragQuestion,
 *   SingleChoiceSet) keep `behaviour.enableRetry`, `behaviour.enableSolutionsButton` and
 *   `behaviour.enableCheckButton` (all default true; SingleChoiceSet has no check button).
 * - Composites (QuestionSet, InteractiveVideo, CoursePresentation) keep an `override` group:
 *   `showSolutionButton` and `retryButton` take `'on'` or `'off'`; QuestionSet also has a
 *   boolean `checkButton`; InteractiveVideo has `preventSkippingMode` (`none`, `forward`, `both`).
 * Questions nested in a composite are `{ library, params }`, so the walk reaches them too.
 */

export interface H5PPlayPolicy {
  /** Let the learner retry a question after checking it. */
  readonly retry: boolean;
  /** Offer the "show solution" button. */
  readonly showSolutions: boolean;
  /**
   * Offer the "check" button. Some types only report an answer when it is checked, so turning
   * this off can mean no answer reaches the journal; verify per type before using it.
   */
  readonly check?: boolean;
  /** Interactive Video only: stop skipping ahead past interactions. */
  readonly preventSkipping?: 'none' | 'forward' | 'both';
}

const MAX_DEPTH = 64;

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const isObject = (value: unknown): value is Record<string, Json> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const onOff = (value: boolean) => (value ? 'on' : 'off');

function applyToBehaviour(
  behaviour: Record<string, Json>,
  policy: H5PPlayPolicy,
): Record<string, Json> {
  const next: Record<string, Json> = {
    ...behaviour,
    enableRetry: policy.retry,
    enableSolutionsButton: policy.showSolutions,
  };
  // Some question types never had a check button; adding the key there would be noise.
  if (policy.check !== undefined && 'enableCheckButton' in behaviour)
    next.enableCheckButton = policy.check;
  if (!policy.retry && 'allowRetryIfCorrect' in behaviour) next.allowRetryIfCorrect = false;
  return next;
}

function applyToOverride(
  override: Record<string, Json>,
  policy: H5PPlayPolicy,
): Record<string, Json> {
  const next: Record<string, Json> = {
    ...override,
    showSolutionButton: onOff(policy.showSolutions),
    retryButton: onOff(policy.retry),
  };
  if (policy.check !== undefined && 'checkButton' in override) next.checkButton = policy.check;
  if (policy.preventSkipping !== undefined && 'preventSkippingMode' in override) {
    next.preventSkippingMode = policy.preventSkipping;
  }
  return next;
}

function walk(value: Json, policy: H5PPlayPolicy, depth: number): Json {
  if (depth > MAX_DEPTH) return value;
  if (Array.isArray(value)) return value.map((item) => walk(item, policy, depth + 1));
  if (!isObject(value)) return value;
  const out: Record<string, Json> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === 'behaviour' && isObject(child)) out[key] = applyToBehaviour(child, policy);
    else if (key === 'override' && isObject(child)) out[key] = applyToOverride(child, policy);
    else out[key] = walk(child, policy, depth + 1);
  }
  return out;
}

/** The content as this run plays it. Values that aren't JSON objects come back unchanged. */
export function applyH5PBehaviour(content: unknown, policy: H5PPlayPolicy): unknown {
  return isObject(content) ? walk(content, policy, 0) : content;
}
