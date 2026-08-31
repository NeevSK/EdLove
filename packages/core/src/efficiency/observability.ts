import { trackProductEvent } from '@repo/core/monitoring';
import type { EfficiencyAction, EfficiencyOperation } from './policy';

const OBSERVATION_WINDOW_MS = 60_000;
const recentDecisions = new Map<string, number>();
const SAFE_REASONS = new Set([
  'critical_free_disk',
  'offline',
  'unknown_battery_state',
  'low_battery',
  'metered_network',
  'unknown_network',
  'metered_background_maintenance',
  'unknown_free_disk',
]);

export function observeEfficiencyDecision(
  operation: EfficiencyOperation,
  action: EfficiencyAction,
  reason: string,
): void {
  if (action === 'allow') return;

  const safeReason = SAFE_REASONS.has(reason) ? reason : 'unknown_reason';
  const key = `${operation}:${action}:${safeReason}`;
  const now = Date.now();
  const lastObservedAt = recentDecisions.get(key);
  if (lastObservedAt !== undefined && now - lastObservedAt < OBSERVATION_WINDOW_MS) return;

  recentDecisions.set(key, now);
  try {
    trackProductEvent('efficiency_policy_decision', {
      operation,
      action,
      reason: safeReason,
    });
  } catch (error) {
    recentDecisions.delete(key);
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[Efficiency] Decision telemetry failed', error);
    }
  }

  for (const [entryKey, observedAt] of recentDecisions) {
    if (now - observedAt >= OBSERVATION_WINDOW_MS) recentDecisions.delete(entryKey);
  }
}
