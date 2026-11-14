/**
 * Moments: small, well-timed offers that carry the learning loops into work people already do.
 * Examples: "What will you do first?" when an activity opens; "You did this alone today; last
 * month it took two hints. Keep it?" when help fades; "Three of your students did this without
 * help" for a teacher.
 *
 * The engine decides whether to offer, never what anything means. A signal (a fact the app
 * observed) meets a rule (what to offer for it), and the guards decide: consent, the person
 * turning a rule off, how often anything may be offered, quiet hours, and asking less after
 * dismissals. An offer is a flow step, opened by the caller with `useFlowNavigator().open`, so
 * a moment is never a screen of its own.
 *
 * Pure and deterministic: time comes in as arguments, and every decision says why. Every number
 * here is a default in a policy that can be changed.
 */

export interface MomentSignal {
  /** What happened, such as `attempt.finished`, `help.faded`, `activity.opening`. */
  readonly kind: string;
  /** When it happened (ISO 8601). */
  readonly at: string;
  /** What it is about (an activity, a part, a relation), for per-subject cooldowns. */
  readonly subject?: string;
  /** Values the offer passes on as flow parameters. */
  readonly params?: Readonly<Record<string, string>>;
}

export type Audience = 'self' | 'teacher' | 'guardian';

export interface MomentRule<Flow extends string = string> {
  /** Stable id, such as `moment:help_faded`. Also what the PJC record and evidence link to. */
  readonly id: string;
  readonly on: string;
  readonly audience: Audience;
  readonly offer: { readonly flowId: Flow; readonly stepId: string };
  /** A consent the person must have given, such as `share.guardian`. */
  readonly needsConsent?: string;
  /** At most this many offers from this rule per local day. */
  readonly perDay?: number;
  /** No second offer about the same subject within this many minutes. */
  readonly subjectCooldownMinutes?: number;
  /** After this many dismissals in a row, the rule stops offering until it is taken again. */
  readonly quietAfterDismissals?: number;
  /** Offered even in quiet hours (for something the person started, like opening an activity). */
  readonly ignoresQuietHours?: boolean;
  /** Higher wins when two rules match one signal. */
  readonly priority?: number;
}

export interface MomentsPolicy {
  /** Offers of any kind per local day. */
  readonly maxPerDay: number;
  /** Minutes between any two offers. */
  readonly minGapMinutes: number;
  /** Local minutes after midnight; the window may cross midnight. */
  readonly quietHours: { readonly from: number; readonly to: number } | null;
  readonly quietAfterDismissals: number;
}

export const DEFAULT_MOMENTS_POLICY: MomentsPolicy = {
  maxPerDay: 4,
  minGapMinutes: 10,
  quietHours: { from: 21 * 60, to: 6 * 60 },
  quietAfterDismissals: 3,
};

export type Outcome = 'shown' | 'taken' | 'dismissed';

export interface MomentEvent {
  readonly ruleId: string;
  readonly subject?: string;
  readonly at: string;
  /** The local day it happened on (`YYYY-MM-DD`), so caps follow the person's day, not UTC. */
  readonly localDay: string;
  readonly outcome: Outcome;
}

/** One person's moment history and choices. Kept on their device. */
export interface MomentsState {
  readonly history: readonly MomentEvent[];
  readonly consents: ReadonlySet<string>;
  /** Rules the person turned off. */
  readonly off: ReadonlySet<string>;
}

export const emptyMomentsState = (): MomentsState => ({
  history: [],
  consents: new Set(),
  off: new Set(),
});

/** The person's local clock, which the caller works out from their time zone. */
export interface LocalNow {
  readonly at: string;
  readonly localDay: string;
  readonly localMinutes: number;
}

export type SkipReason =
  | 'no_rule'
  | 'turned_off'
  | 'no_consent'
  | 'quiet_hours'
  | 'daily_limit'
  | 'rule_daily_limit'
  | 'too_soon'
  | 'subject_cooldown'
  | 'dismissed_often';

export interface MomentOffer<Flow extends string = string> {
  readonly ruleId: string;
  readonly flowId: Flow;
  readonly stepId: string;
  readonly params: Readonly<Record<string, string>>;
  readonly audience: Audience;
}

export type Decision<Flow extends string = string> =
  | {
      readonly offer: MomentOffer<Flow>;
      readonly skipped: readonly { ruleId: string; reason: SkipReason }[];
    }
  | { readonly offer: null; readonly skipped: readonly { ruleId: string; reason: SkipReason }[] };

const minutesBetween = (a: string, b: string) => Math.abs(Date.parse(b) - Date.parse(a)) / 60_000;

const inQuietHours = (minutes: number, quiet: MomentsPolicy['quietHours']) => {
  if (quiet === null) return false;
  return quiet.from <= quiet.to
    ? minutes >= quiet.from && minutes < quiet.to
    : minutes >= quiet.from || minutes < quiet.to;
};

function dismissalsInARow(history: readonly MomentEvent[], ruleId: string): number {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const event = history[i];
    if (event === undefined || event.ruleId !== ruleId || event.outcome === 'shown') continue;
    if (event.outcome === 'taken') break;
    count += 1;
  }
  return count;
}

function whyNot(
  rule: MomentRule,
  signal: MomentSignal,
  state: MomentsState,
  now: LocalNow,
  policy: MomentsPolicy,
): SkipReason | null {
  const shown = state.history.filter((e) => e.outcome === 'shown');
  if (state.off.has(rule.id)) return 'turned_off';
  if (rule.needsConsent !== undefined && !state.consents.has(rule.needsConsent))
    return 'no_consent';
  if (!rule.ignoresQuietHours && inQuietHours(now.localMinutes, policy.quietHours))
    return 'quiet_hours';
  if (
    dismissalsInARow(state.history, rule.id) >=
    (rule.quietAfterDismissals ?? policy.quietAfterDismissals)
  ) {
    return 'dismissed_often';
  }
  const today = shown.filter((e) => e.localDay === now.localDay);
  if (today.length >= policy.maxPerDay) return 'daily_limit';
  if (
    rule.perDay !== undefined &&
    today.filter((e) => e.ruleId === rule.id).length >= rule.perDay
  ) {
    return 'rule_daily_limit';
  }
  const last = shown.at(-1);
  if (last !== undefined && minutesBetween(last.at, now.at) < policy.minGapMinutes)
    return 'too_soon';
  if (signal.subject !== undefined && rule.subjectCooldownMinutes !== undefined) {
    const sameSubject = shown
      .filter((e) => e.ruleId === rule.id && e.subject === signal.subject)
      .at(-1);
    if (
      sameSubject !== undefined &&
      minutesBetween(sameSubject.at, now.at) < rule.subjectCooldownMinutes
    ) {
      return 'subject_cooldown';
    }
  }
  return null;
}

/** Whether a signal earns an offer now, and if not, why each matching rule held back. */
export function decideMoment<Flow extends string>(
  signal: MomentSignal,
  rules: readonly MomentRule<Flow>[],
  state: MomentsState,
  now: LocalNow,
  policy: MomentsPolicy = DEFAULT_MOMENTS_POLICY,
): Decision<Flow> {
  const matching = rules
    .filter((r) => r.on === signal.kind)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id));
  if (matching.length === 0)
    return { offer: null, skipped: [{ ruleId: signal.kind, reason: 'no_rule' }] };

  const skipped: { ruleId: string; reason: SkipReason }[] = [];
  for (const rule of matching) {
    const reason = whyNot(rule, signal, state, now, policy);
    if (reason !== null) {
      skipped.push({ ruleId: rule.id, reason });
      continue;
    }
    return {
      offer: {
        ruleId: rule.id,
        flowId: rule.offer.flowId,
        stepId: rule.offer.stepId,
        params: signal.params ?? {},
        audience: rule.audience,
      },
      skipped,
    };
  }
  return { offer: null, skipped };
}

/** Records what happened to an offer: shown, then taken or dismissed. */
export function recordMoment(
  state: MomentsState,
  offer: Pick<MomentOffer, 'ruleId'>,
  outcome: Outcome,
  now: Pick<LocalNow, 'at' | 'localDay'>,
  subject?: string,
): MomentsState {
  return {
    ...state,
    history: [
      ...state.history,
      { ruleId: offer.ruleId, subject, at: now.at, localDay: now.localDay, outcome },
    ],
  };
}

/** The person turns a kind of moment off or back on. */
export function setRuleOff(state: MomentsState, ruleId: string, off: boolean): MomentsState {
  const next = new Set(state.off);
  if (off) next.add(ruleId);
  else next.delete(ruleId);
  return { ...state, off: next };
}

/** Keeps the history bounded on a small phone: only what the guards can still look at. */
export function pruneMoments(state: MomentsState, keep = 500): MomentsState {
  return state.history.length <= keep ? state : { ...state, history: state.history.slice(-keep) };
}
