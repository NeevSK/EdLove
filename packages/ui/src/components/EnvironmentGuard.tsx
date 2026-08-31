/**
 * Environment Guard Component
 * Adaptively renders components based on device capabilities and fidelity settings
 *
 * Philosophy: "The Mud Rule" - If it works on iPhone but lags on $100 Android, it's broken
 */

import { useEnvironment } from '@repo/ui/context';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import type { ReactNode } from 'react';

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
  const { visualCapabilities } = useEnvironment();

  // If component requires high fidelity and we're in low fidelity mode
  if (requiresHighFidelity && visualCapabilities.effectiveFidelity === 'low') {
    return <>{lowFidelityFallback}</>;
  }

  // If we're in low fidelity mode and have a fallback
  if (visualCapabilities.effectiveFidelity === 'low' && lowFidelityFallback !== null) {
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
  return useVisualCapabilities().effectiveFidelity === 'high';
}

/**
 * Hook to check if we should render expensive animations
 */
export function useShouldAnimate(): boolean {
  return useVisualCapabilities().allowSubtleAnimation;
}

/**
 * Hook to check if we should load high-quality images
 */
export function useShouldLoadHighQualityImages(): boolean {
  return useVisualCapabilities().shouldPrefetchAssets;
}
