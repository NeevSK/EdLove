import { observeEfficiencyDecision } from './observability';

export type EfficiencyAction = 'allow' | 'defer' | 'reduce';

export type EfficiencyOperation =
  | 'user-action'
  | 'background-sync'
  | 'storage-maintenance'
  | 'media-prefetch'
  | 'analytics'
  | 'cache-write';

export interface EfficiencyContext {
  appState: 'active' | 'background';
  network: 'wifi' | 'cellular' | 'offline' | 'unknown';
  isMetered: boolean;
  batteryLevel: number | null;
  isCharging: boolean;
  freeDiskBytes: number | null;
}

export interface EfficiencyDecision {
  action: EfficiencyAction;
  reason: string;
}

export const CRITICAL_FREE_DISK_BYTES = 100 * 1024 * 1024;
export const LOW_BATTERY_LEVEL = 0.2;

function isLowBattery(context: EfficiencyContext): boolean {
  return (
    !context.isCharging && context.batteryLevel !== null && context.batteryLevel < LOW_BATTERY_LEVEL
  );
}

function hasInvalidBatteryState(context: EfficiencyContext): boolean {
  return (
    context.batteryLevel === null ||
    !Number.isFinite(context.batteryLevel) ||
    context.batteryLevel < 0 ||
    context.batteryLevel > 1
  );
}

function hasInvalidFreeDiskState(context: EfficiencyContext): boolean {
  return (
    context.freeDiskBytes === null ||
    !Number.isFinite(context.freeDiskBytes) ||
    context.freeDiskBytes < 0
  );
}

export function evaluateEfficiency(
  operation: EfficiencyOperation,
  context: EfficiencyContext,
): EfficiencyDecision {
  const decide = (decision: EfficiencyDecision): EfficiencyDecision => {
    observeEfficiencyDecision(operation, decision.action, decision.reason);
    return decision;
  };

  if (operation === 'user-action') {
    return decide({ action: 'allow', reason: 'user_initiated' });
  }

  if (
    !hasInvalidFreeDiskState(context) &&
    context.freeDiskBytes !== null &&
    context.freeDiskBytes < CRITICAL_FREE_DISK_BYTES
  ) {
    if (operation === 'storage-maintenance' || operation === 'cache-write') {
      return decide({ action: 'reduce', reason: 'critical_free_disk' });
    }
    return decide({ action: 'defer', reason: 'critical_free_disk' });
  }

  if (context.network === 'offline') {
    return decide({ action: 'defer', reason: 'offline' });
  }

  if (
    (operation === 'background-sync' ||
      operation === 'media-prefetch' ||
      operation === 'analytics' ||
      (operation === 'storage-maintenance' && context.appState === 'background')) &&
    hasInvalidBatteryState(context)
  ) {
    return decide({ action: 'defer', reason: 'unknown_battery_state' });
  }

  if (isLowBattery(context)) {
    return decide({ action: 'defer', reason: 'low_battery' });
  }

  if (
    operation === 'background-sync' ||
    operation === 'media-prefetch' ||
    operation === 'analytics'
  ) {
    if (context.isMetered) {
      return decide({ action: 'defer', reason: 'metered_network' });
    }
    if (context.network === 'unknown') {
      return decide({ action: 'defer', reason: 'unknown_network' });
    }
  }

  if (
    operation === 'storage-maintenance' &&
    context.appState === 'background' &&
    context.isMetered
  ) {
    return decide({ action: 'reduce', reason: 'metered_background_maintenance' });
  }

  if (operation === 'storage-maintenance' && hasInvalidFreeDiskState(context)) {
    return decide({ action: 'defer', reason: 'unknown_free_disk' });
  }

  return decide({ action: 'allow', reason: 'eligible' });
}
