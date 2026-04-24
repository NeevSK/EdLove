import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { driverManager } from '../DriverManager';
import type { TrubeRendererProps } from './types';
import { CompatibilityRenderer } from './CompatibilityRenderer';

// Tier 2/3 / Failover: Skia Renderers
import { MistRendererSkia } from './MistRenderer.skia';
import { AuroraRendererSkia } from './AuroraRenderer.skia';
import { YoungLeafRendererSkia } from './YoungLeafRenderer.skia';
import { SilkRendererSkia } from './SilkRenderer.skia';
import { WaterfallRendererSkia } from './WaterfallRenderer.skia';
import { EveningSkyRendererSkia } from './EveningSkyRenderer.skia';
import { SkymorphicRendererSkia } from './SkymorphicRenderer.skia';
import { WaterSurfaceRendererSkia } from './WaterSurfaceRenderer.skia';

// Tier 1: Vulkan/Native Renderers
import { AuroraRendererVulkan } from './AuroraRenderer.vulkan';
import { MistRendererVulkan } from './MistRenderer.vulkan';
import { YoungLeafRendererVulkan } from './YoungLeafRenderer.vulkan';
import { SilkRendererVulkan } from './SilkRenderer.vulkan';
import { WaterfallRendererVulkan } from './WaterfallRenderer.vulkan';
import { EveningSkyRendererVulkan } from './EveningSkyRenderer.vulkan';
import { SkymorphicRendererVulkan } from './SkymorphicRenderer.vulkan';
import { WaterSurfaceRendererVulkan } from './WaterSurfaceRenderer.vulkan';

/**
 * UnifiedRenderer: The orchestration point for the Triple-Tier Rendering Hierarchy.
 */
export function UnifiedRenderer(props: TrubeRendererProps) {
  const { plan, stage } = props;
  const [_, setTick] = useState(0);

  // Phase III: Failover Watchdog (The 2026 Mandate "500ms Floor")
  useEffect(() => {
    const bestBackend = driverManager.getBestBackend();
    if (bestBackend === 'skia-runtime-effect' || bestBackend === 'compatibility-static') return;

    // Start a 500ms watchdog for native paths (Tier 1 & 2)
    const timeoutId = setTimeout(() => {
      driverManager.triggerGlobalFailover(`${bestBackend} stalled for > 500ms.`);
      setTick(t => t + 1); // Force re-render into Skia
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [stage.kind]); // Reset watchdog on stage change

  // Determine the best available Tier at runtime
  const bestBackend = driverManager.getBestBackend();
  const isNative = bestBackend === 'native-vulkan' || bestBackend === 'native-metal' || bestBackend === 'webgpu';

  // 1. Check for Compatibility Tier (Static Fallback)
  if (plan.capabilityTier === 'compatibility' || bestBackend === 'compatibility-static') {
    return <CompatibilityRenderer {...props} />;
  }

  const renderLayer = (layer: any, index: number) => {
    const { resolveSurface } = require('../../core/surface');
    const resolvedSurface = resolveSurface(layer.surface);
    const layerProps = { ...props, surface: resolvedSurface };

    useEffect(() => {
      return () => {
        driverManager.releaseResources(resolvedSurface.name);
      };
    }, [resolvedSurface.name]);

    const renderContent = () => {
      if (isNative) {
        switch (resolvedSurface.name) {
          case 'aurora': return <AuroraRendererVulkan {...layerProps} />;
          case 'mist': return <MistRendererVulkan {...layerProps} />;
          case 'young-leaf': return <YoungLeafRendererVulkan {...layerProps} />;
          case 'silk': return <SilkRendererVulkan {...layerProps} />;
          case 'waterfall': return <WaterfallRendererVulkan {...layerProps} />;
          case 'evening-sky': return <EveningSkyRendererVulkan {...layerProps} />;
          case 'skymorphic': return <SkymorphicRendererVulkan {...layerProps} />;
          case 'water-surface': return <WaterSurfaceRendererVulkan {...layerProps} />;
        }
      }

      // Tier 2 (Standard/Skia) / Default: High-Fidelity Skia Logic
      switch (resolvedSurface.name) {
        case 'mist': return <MistRendererSkia {...layerProps} />;
        case 'aurora': return <AuroraRendererSkia {...layerProps} />;
        case 'young-leaf': return <YoungLeafRendererSkia {...layerProps} />;
        case 'silk': return <SilkRendererSkia {...layerProps} />;
        case 'waterfall': return <WaterfallRendererSkia {...layerProps} />;
        case 'evening-sky': return <EveningSkyRendererSkia {...layerProps} />;
        case 'skymorphic': return <SkymorphicRendererSkia {...layerProps} />;
        case 'water-surface': return <WaterSurfaceRendererSkia {...layerProps} />;
        default: return null;
      }
    };

    return (
      <View
        key={index}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: layer.opacity ?? 1 }]}
              {renderContent()}
      </View    );
  };

  return (
    <View style={StyleSheet.absoluteFill}      {stage.layers.map((layer, index) => renderLayer(layer, index))}
    </View  );
}
