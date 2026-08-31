export type RuntimeNetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
export type RuntimeNetworkType = 'wifi' | 'cellular' | 'offline' | 'unknown';
export type RuntimeDeviceTier = 'high' | 'medium' | 'low';

export const MEMORY_TIER_THRESHOLDS = {
  lowBytes: 3 * 1024 * 1024 * 1024,
  highBytes: 6 * 1024 * 1024 * 1024,
} as const;

export function classifyMemoryTier(totalMemoryBytes: number | null): RuntimeDeviceTier {
  if (totalMemoryBytes === null || !Number.isFinite(totalMemoryBytes) || totalMemoryBytes <= 0) {
    return 'medium';
  }
  if (totalMemoryBytes < MEMORY_TIER_THRESHOLDS.lowBytes) return 'low';
  if (totalMemoryBytes < MEMORY_TIER_THRESHOLDS.highBytes) return 'medium';
  return 'high';
}

export function memoryBytesToGB(totalMemoryBytes: number | null): number {
  if (totalMemoryBytes === null || !Number.isFinite(totalMemoryBytes) || totalMemoryBytes <= 0) {
    return 4;
  }
  return totalMemoryBytes / (1024 * 1024 * 1024);
}

export interface RuntimeNetworkSnapshot {
  isConnected: boolean | null;
  type: string;
  isMetered?: boolean;
  details?: { cellularGeneration?: string | null };
}

export interface NormalizedNetworkConditions {
  type: RuntimeNetworkType;
  quality: RuntimeNetworkQuality;
  isMetered: boolean;
}

export function normalizeNetworkConditions(
  snapshot: RuntimeNetworkSnapshot,
): NormalizedNetworkConditions {
  if (snapshot.isConnected === false) {
    return { type: 'offline', quality: 'offline', isMetered: false };
  }

  if (snapshot.isConnected !== true) {
    return { type: 'unknown', quality: 'poor', isMetered: false };
  }

  if (snapshot.type === 'wifi') {
    return { type: 'wifi', quality: 'good', isMetered: Boolean(snapshot.isMetered) };
  }

  if (snapshot.type === 'cellular') {
    const generation = snapshot.details?.cellularGeneration;
    const quality =
      generation === '5g'
        ? 'excellent'
        : generation === '4g'
          ? 'good'
          : generation === '3g'
            ? 'fair'
            : 'poor';
    return { type: 'cellular', quality, isMetered: true };
  }

  return {
    type: 'unknown',
    quality: 'fair',
    isMetered: Boolean(snapshot.isMetered),
  };
}
