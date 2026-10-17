/**
 * The single send-time resolver. Every release time for a staff -> family
 * notice goes through this function: the server calls it when scheduling (and
 * is authoritative); the client calls it only to preview.
 *
 * Precedence (ADR): school policy > personal mode > logged emergency override.
 * This slice evaluates the school side (sender) only. Recipient-side modes
 * (push deferral, digest) arrive with PB8d; the inbox always receives.
 */
import type { SchoolModePolicy } from './catalog';
import { checkWindow, nextAllowedInstant, toWeekly, type WindowInterval } from './schedule';

export type SendTiming = 'as_requested' | 'next_allowed' | 'override';

export type SendTimeInput = {
  requestedAt: Date;
  timezone: string;
  policies: SchoolModePolicy[];
  senderCapacity: string | null | undefined;
  timing: SendTiming;
  overrideReason?: string | null;
  /** Emergency sends this sender already made in the last 24 h. */
  overridesUsedToday?: number;
};

export type SendTimeDecision =
  | {
      ok: true;
      sendAt: Date;
      /** The request fell inside a holding window. */
      insideWindow: boolean;
      window: WindowInterval | null;
      modeKey: SchoolModePolicy['modeKey'] | null;
      /** When the window would have released it (equals sendAt unless overridden). */
      nextAllowedAt: Date;
      overridden: boolean;
    }
  | {
      ok: false;
      code:
        | 'INSIDE_POLICY_WINDOW'
        | 'OVERRIDE_NOT_ALLOWED'
        | 'OVERRIDE_REASON_REQUIRED'
        | 'OVERRIDE_RATE_LIMITED';
      nextAllowedAt: Date;
      window: WindowInterval | null;
      modeKey: SchoolModePolicy['modeKey'] | null;
    };

export const MIN_OVERRIDE_REASON = 10;

/** Roles come from the school's policy (or the provisional default), not code. */
export function canUseEmergencyLane(
  capacity: string | null | undefined,
  policy: SchoolModePolicy | null,
): boolean {
  return !!capacity && !!policy && policy.overrideRoles.includes(capacity);
}

export function resolveSendTime(input: SendTimeInput): SendTimeDecision {
  const holding = input.policies.filter((p) => p.lock !== 'off' && p.effects.holdStaffNotices);
  // Most restrictive wins: walk forward until no holding window applies.
  let cursor = input.requestedAt;
  let hit: { policy: SchoolModePolicy; window: WindowInterval } | null = null;
  for (let hops = 0; hops < 16; hops += 1) {
    const inside = holding
      .map((policy) => ({
        policy,
        check: checkWindow(cursor, toWeekly(policy.schedule), input.timezone),
      }))
      .find((x) => x.check.inside);
    if (!inside || !inside.check.inside) break;
    hit ??= { policy: inside.policy, window: inside.check.interval };
    cursor = nextAllowedInstant(cursor, toWeekly(inside.policy.schedule), input.timezone);
  }
  const nextAllowedAt = cursor;
  const base = { window: hit?.window ?? null, modeKey: hit?.policy.modeKey ?? null };

  if (!hit) {
    return {
      ok: true,
      sendAt: input.requestedAt,
      insideWindow: false,
      nextAllowedAt,
      overridden: false,
      ...base,
    };
  }
  if (input.timing === 'next_allowed') {
    return {
      ok: true,
      sendAt: nextAllowedAt,
      insideWindow: true,
      nextAllowedAt,
      overridden: false,
      ...base,
    };
  }
  if (input.timing === 'override') {
    if (!canUseEmergencyLane(input.senderCapacity, hit.policy)) {
      return { ok: false, code: 'OVERRIDE_NOT_ALLOWED', nextAllowedAt, ...base };
    }
    if ((input.overrideReason ?? '').trim().length < MIN_OVERRIDE_REASON) {
      return { ok: false, code: 'OVERRIDE_REASON_REQUIRED', nextAllowedAt, ...base };
    }
    const limit = hit.policy.overrideRateLimitPerDay;
    if (limit !== null && (input.overridesUsedToday ?? 0) >= limit) {
      return { ok: false, code: 'OVERRIDE_RATE_LIMITED', nextAllowedAt, ...base };
    }
    return {
      ok: true,
      sendAt: input.requestedAt,
      insideWindow: true,
      nextAllowedAt,
      overridden: true,
      ...base,
    };
  }
  // as_requested inside a window: allowed when the school only suggests the window.
  if (hit.policy.lock === 'suggested') {
    return {
      ok: true,
      sendAt: input.requestedAt,
      insideWindow: true,
      nextAllowedAt,
      overridden: false,
      ...base,
    };
  }
  return { ok: false, code: 'INSIDE_POLICY_WINDOW', nextAllowedAt, ...base };
}
