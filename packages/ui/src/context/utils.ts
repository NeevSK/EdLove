import { coreRuntime } from '@repo/core/logic';
import type { DeviceTier, NetworkQuality, TemporalPhase } from './types';

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
    // Get total memory if available
    const totalMemory = coreRuntime.device.getTotalMemory?.();

    if (!totalMemory) {
      // If we can't detect, assume medium tier to be safe
      return { tier: 'medium', memoryGB: 4 };
    }

    const memoryGB = totalMemory / (1024 * 1024 * 1024);

    let tier: DeviceTier;
    if (memoryGB < 3) {
      tier = 'low';
    } else if (memoryGB < 6) {
      tier = 'medium';
    } else {
      tier = 'high';
    }

    return { tier, memoryGB };
  } catch (error) {
    console.warn('Failed to detect device tier:', error);
    return { tier: 'medium', memoryGB: 4 };
  }
}

/**
 * Detects network quality based on connection info
 */
export async function detectNetworkQuality(): Promise<NetworkQuality> {
  try {
    const netInfo = await coreRuntime.network.fetch();

    if (!netInfo.isConnected) {
      return 'offline';
    }

    // Check connection type and effective type
    const type = netInfo.type;
    const details = netInfo.details as any;

    // If we have cellular connection, check the type
    if (type === 'cellular') {
      const cellularGeneration = details?.cellularGeneration;

      if (cellularGeneration === '5g') {
        return 'excellent';
      } else if (cellularGeneration === '4g') {
        return 'good';
      } else if (cellularGeneration === '3g') {
        return 'fair';
      } else {
        return 'poor';
      }
    }

    // For WiFi, assume good quality unless we have more info
    if (type === 'wifi') {
      return 'good';
    }

    // Default to fair for other connection types
    return 'fair';
  } catch (error) {
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
export function computeEffectiveFidelity(
  fidelityLevel: 'auto' | 'low' | 'high',
  deviceTier: DeviceTier,
): 'low' | 'high' {
  // If user explicitly chose, respect their choice
  if (fidelityLevel === 'low') return 'low';
  if (fidelityLevel === 'high') return 'high';

  // Auto mode: base on device tier
  return deviceTier === 'low' ? 'low' : 'high';
}
