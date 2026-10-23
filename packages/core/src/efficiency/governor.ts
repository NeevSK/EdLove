/**
 * Performance Governor Unified Control Plane Facade
 *
 * Implements the centralized performance control plane defined in:
 * docs/engineering/runtime-performance/governor-architecture-spec.md
 *
 * Unifies:
 * - Synchronous hardware sensing (`sense`)
 * - Deterministic workload admission (`admit`)
 * - Visual budget resolution (`getVisualBudget`)
 * - Hermes heap reclamation & memory shield (`reclaimMemory`)
 * - Low-memory query client tuning (`tuneQueryClient`)
 */

import {
  type HermesHeapStats,
  type MemoryReclamationOptions,
  type MemoryReclamationResult,
  getHermesHeapStats,
  reclaimHermesMemory,
  tuneQueryClientForLowMemory,
} from './hermesDeviceShield';
import {
  type RuntimeDeviceTier,
  type RuntimeNetworkQuality,
  classifyMemoryTier,
} from './runtimeConditions';
import {
  type RuntimeVisualBudget,
  type RuntimeVisualSignals,
  resolveRuntimeVisualBudget,
} from './visualBudget';

export type DeviceThermalState = 'nominal' | 'fair' | 'serious' | 'critical';
export type DeviceMemoryTier = RuntimeDeviceTier;
export type WorkAdmissionPhase = 'boot' | 'public-ready' | 'protected-ready' | 'settled';

export interface GovernorSnapshot {
  readonly timestamp: number;
  readonly deviceTier: DeviceMemoryTier;
  readonly totalMemoryBytes: number | null;
  readonly thermalState: DeviceThermalState;
  readonly isBatterySaver: boolean;
  readonly isLowBattery: boolean;
  readonly isMeteredNetwork: boolean;
  readonly isOnline: boolean;
  readonly activePhase: WorkAdmissionPhase;
  readonly pressure?: 'unknown' | 'normal' | 'constrained' | 'severe';
}

export type WorkCategory =
  | 'user-critical'
  | 'ui-transition'
  | 'background-sync'
  | 'media-prefetch'
  | 'storage-cleanup'
  | 'telemetry-flush';

export interface WorkAdmissionResult {
  readonly allowed: boolean;
  readonly maxConcurrency: number;
  readonly reason: string;
}

export function senseGovernor(options?: Partial<GovernorSnapshot>): GovernorSnapshot {
  const totalMemory = options?.totalMemoryBytes ?? null;
  const tier = options?.deviceTier ?? classifyMemoryTier(totalMemory);

  return {
    timestamp: options?.timestamp ?? Date.now(),
    deviceTier: tier,
    totalMemoryBytes: totalMemory,
    thermalState: options?.thermalState ?? 'nominal',
    isBatterySaver: options?.isBatterySaver ?? false,
    isLowBattery: options?.isLowBattery ?? false,
    isMeteredNetwork: options?.isMeteredNetwork ?? false,
    isOnline: options?.isOnline ?? true,
    activePhase: options?.activePhase ?? 'settled',
    pressure: options?.pressure ?? 'normal',
  };
}

export function admitWorkCategory(
  category: WorkCategory,
  snapshot: GovernorSnapshot = senseGovernor(),
): WorkAdmissionResult {
  // 1. User-critical actions (attendance save, grade submission) are NEVER deferred
  if (category === 'user-critical') {
    return {
      allowed: true,
      maxConcurrency: 1,
      reason: 'user-critical-unconditional',
    };
  }

  const isPressureSevere =
    snapshot.pressure === 'severe' || snapshot.thermalState === 'critical';
  const isPressureConstrained =
    snapshot.pressure === 'constrained' ||
    snapshot.thermalState === 'serious' ||
    snapshot.deviceTier === 'low';

  // 2. UI transitions (screen navigation, route mounting)
  if (category === 'ui-transition') {
    return {
      allowed: true,
      maxConcurrency: 1,
      reason: isPressureSevere ? 'transition-degraded-motion' : 'transition-normal',
    };
  }

  // 3. Background sync (PowerSync / knowledge base sync)
  if (category === 'background-sync') {
    if (snapshot.activePhase === 'boot') {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-during-boot' };
    }
    if (!snapshot.isOnline) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-offline' };
    }
    if (snapshot.isBatterySaver) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-battery-saver' };
    }
    if (isPressureSevere || isPressureConstrained) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-under-pressure' };
    }
    if (snapshot.isMeteredNetwork) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-metered-network' };
    }
    return { allowed: true, maxConcurrency: 2, reason: 'admitted-normal' };
  }

  // 4. Media prefetch (audio, images, lessons)
  if (category === 'media-prefetch') {
    if (snapshot.activePhase !== 'settled') {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-until-settled' };
    }
    if (isPressureSevere || isPressureConstrained) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-under-pressure' };
    }
    if (snapshot.isBatterySaver || snapshot.isLowBattery) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-power-conservation' };
    }
    if (!snapshot.isOnline || snapshot.isMeteredNetwork) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-metered-or-offline' };
    }
    return { allowed: true, maxConcurrency: 1, reason: 'admitted-prefetch' };
  }

  // 5. Storage cleanup (vacuum, compaction, trimming)
  if (category === 'storage-cleanup') {
    if (snapshot.activePhase !== 'settled') {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-until-settled' };
    }
    if (isPressureSevere) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-severe-pressure' };
    }
    return { allowed: true, maxConcurrency: 1, reason: 'admitted-idle-cleanup' };
  }

  // 6. Telemetry flush
  if (category === 'telemetry-flush') {
    if (isPressureSevere) {
      return { allowed: false, maxConcurrency: 0, reason: 'deferred-severe-pressure' };
    }
    return { allowed: true, maxConcurrency: 1, reason: 'admitted-telemetry' };
  }

  return { allowed: false, maxConcurrency: 0, reason: 'unknown-category' };
}

export const performanceGovernor = {
  sense: senseGovernor,
  admit: admitWorkCategory,
  getVisualBudget: resolveRuntimeVisualBudget,
  reclaimMemory: reclaimHermesMemory,
  tuneQueryClient: tuneQueryClientForLowMemory,
  getHeapStats: getHermesHeapStats,
};
