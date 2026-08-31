import { memoryBytesToGB, normalizeNetworkConditions } from '@repo/core/efficiency';
import { coreRuntime } from '@repo/core/logic';
import type { DeviceTier, NetworkQuality, TemporalPhase } from './types';
import { classifyDeviceTier } from './visualPolicy';

export {
  classifyDeviceTier,
  computeEffectiveFidelity,
  resolveVisualCapabilities,
} from './visualPolicy';

/**
 * Determines the temporal phase based on current time
 * - Predawn:   4 AM - 6 AM  (dark)
 * - Dawn:      6 AM - 9 AM  (light)
 * - Morning:   9 AM - 12 PM (light)
 * - Afternoon: 12 PM - 5 PM (light)
 * - Dusk:      5 PM - 8 PM  (dark)
 * - Night:     8 PM - 4 AM  (dark, wraps midnight)
 */
export function getTemporalPhase(): TemporalPhase {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 6) return 'predawn';
  if (hour >= 6 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

/**
 * Determines if current temporal phase should use dark theme
 */
export function shouldUseDarkTheme(phase: TemporalPhase): boolean {
  return phase === 'predawn' || phase === 'dusk' || phase === 'night';
  // dawn, morning, afternoon → light world
}

/**
 * Detects device performance tier based on available memory
 * - Low: < 3GB RAM
 * - Medium: 3-6GB RAM
 * - High: > 6GB RAM
 */
export async function detectDeviceTier(): Promise<{
  tier: DeviceTier;
  memoryGB: number;
}> {
  try {
    // Before the runtime is registered there is no reliable device adapter yet.
    // Do not check navigator here: native React Native commonly has no navigator
    // global, even though expo-device can provide totalMemory.
    if (!coreRuntime.isRegistered()) {
      return { tier: 'medium', memoryGB: 4 };
    }

    // Get total memory if available
    const totalMemory = coreRuntime.device.getTotalMemory?.();

    if (!totalMemory) {
      // If we can't detect, assume medium tier to be safe
      return { tier: 'medium', memoryGB: 4 };
    }

    const memoryGB = memoryBytesToGB(totalMemory);

    const tier = classifyDeviceTier(totalMemory);

    return { tier, memoryGB };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not registered')) {
      return { tier: 'medium', memoryGB: 4 };
    }
    console.warn('Failed to detect device tier:', error);
    return { tier: 'medium', memoryGB: 4 };
  }
}

/**
 * Detects network quality based on connection info
 */
export async function detectNetworkQuality(): Promise<NetworkQuality> {
  try {
    if (!coreRuntime.isRegistered()) {
      return 'fair';
    }

    const netInfo = await coreRuntime.network.fetch();

    if (!netInfo.isConnected) {
      return 'offline';
    }

    return normalizeNetworkConditions(netInfo).quality;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not registered')) {
      return 'fair';
    }
    console.warn('Failed to detect network quality:', error);
    return 'fair';
  }
}

/**
 * Determines if data saver mode should be active based on network quality
 */
export function shouldUseDataSaver(quality: NetworkQuality): boolean {
  return quality === 'poor' || quality === 'fair';
}

/**
 * Determines effective fidelity level based on settings and reality
 */
