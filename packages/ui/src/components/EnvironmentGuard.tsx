/**
 * Environment Guard Component
 * Adaptively renders components based on device capabilities and fidelity settings
 *
 * Philosophy: "The Mud Rule" - If it works on iPhone but lags on $100 Android, it's broken
 */

import type { ReactNode } from 'react';
import { useEnvironment } from '@repo/ui/context';

interface EnvironmentGuardProps {
  children: ReactNode;
  lowFidelityFallback?: ReactNode;
  requiresHighFidelity?: boolean;
}

/**
 * Environment Guard Component
 * Conditionally renders children based on effective fidelity level
 *
 * Usage:
 * ```tsx
 * <EnvironmentGuard lowFidelityFallback={<SolidBackground />}
 *   <GlassmorphismBackground /
 * </EnvironmentGuard
 * ```
 */
export function EnvironmentGuard({
  children,
  lowFidelityFallback = null,
  requiresHighFidelity = false,
}: EnvironmentGuardProps) {
  const { effectiveFidelity } = useEnvironment();

  // If component requires high fidelity and we're in low fidelity mode
  if (requiresHighFidelity && effectiveFidelity === 'low') {
    return <>{lowFidelityFallback}</>;
  }

  // If we're in low fidelity mode and have a fallback
  if (effectiveFidelity === 'low' && lowFidelityFallback !== null) {
    return <>{lowFidelityFallback}</>;
  }

  // Render children normally
  return <>{children}</>;
}

/**
 * Hook version of EnvironmentGuard for conditional logic
 *
 * Usage:
 * ```tsx
 * const shouldRenderBlur = useHighFidelity();
 * return shouldRenderBlur ? <BlurView /> : <View />;
 * ```
 */
export function useHighFidelity(): boolean {
  const { effectiveFidelity } = useEnvironment();
  return effectiveFidelity === 'high';
}

/**
 * Hook to check if we should render expensive animations
 */
export function useShouldAnimate(): boolean {
  const { effectiveFidelity, reality } = useEnvironment();

  // Don't animate in low fidelity mode
  if (effectiveFidelity === 'low') return false;

  // Don't animate if battery saver is on
  if (reality.isBatterySaverMode) return false;

  return true;
}

/**
 * Hook to check if we should load high-quality images
 */
export function useShouldLoadHighQualityImages(): boolean {
  const { effectiveFidelity, reality } = useEnvironment();

  // Don't load high-quality images in low fidelity mode
  if (effectiveFidelity === 'low') return false;

  // Don't load high-quality images in data saver mode
  if (reality.isDataSaverMode) return false;

  // Don't load high-quality images on poor network
  if (reality.networkQuality === 'poor' || reality.networkQuality === 'offline') {
    return false;
  }

  return true;
}
