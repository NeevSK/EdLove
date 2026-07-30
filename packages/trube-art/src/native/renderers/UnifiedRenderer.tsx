import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { driverManager } from '@repo/trube-art/native/DriverManager';
import { AuroraRendererSkia } from '@repo/trube-art/native/renderers/AuroraRenderer.skia';
// Tier 1: Vulkan/Native Renderers
import { AuroraRendererVulkan } from '@repo/trube-art/native/renderers/AuroraRenderer.vulkan';
import { CompatibilityRenderer } from '@repo/trube-art/native/renderers/CompatibilityRenderer';
import { EveningSkyRendererSkia } from '@repo/trube-art/native/renderers/EveningSkyRenderer.skia';
import { EveningSkyRendererVulkan } from '@repo/trube-art/native/renderers/EveningSkyRenderer.vulkan';
// Tier 2/3 / Failover: Skia Renderers
import { MistRendererSkia } from '@repo/trube-art/native/renderers/MistRenderer.skia';
import { MistRendererVulkan } from '@repo/trube-art/native/renderers/MistRenderer.vulkan';
import { SilkRendererSkia } from '@repo/trube-art/native/renderers/SilkRenderer.skia';
import { SilkRendererVulkan } from '@repo/trube-art/native/renderers/SilkRenderer.vulkan';
import { SkymorphicRendererSkia } from '@repo/trube-art/native/renderers/SkymorphicRenderer.skia';
import { SkymorphicRendererVulkan } from '@repo/trube-art/native/renderers/SkymorphicRenderer.vulkan';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { WaterfallRendererSkia } from '@repo/trube-art/native/renderers/WaterfallRenderer.skia';
import { WaterfallRendererVulkan } from '@repo/trube-art/native/renderers/WaterfallRenderer.vulkan';
import { WaterSurfaceRendererSkia } from '@repo/trube-art/native/renderers/WaterSurfaceRenderer.skia';
import { WaterSurfaceRendererVulkan } from '@repo/trube-art/native/renderers/WaterSurfaceRenderer.vulkan';
import { YoungLeafRendererSkia } from '@repo/trube-art/native/renderers/YoungLeafRenderer.skia';
import { YoungLeafRendererVulkan } from '@repo/trube-art/native/renderers/YoungLeafRenderer.vulkan';

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
      setTick((t) => t + 1); // Force re-render into Skia
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []); // Reset watchdog on stage change

  // Determine the best available Tier at runtime
  const bestBackend = driverManager.getBestBackend();
  const isNative =
    bestBackend === 'native-vulkan' || bestBackend === 'native-metal' || bestBackend === 'webgpu';

  // 1. Check for Compatibility Tier (Static Fallback)
  if (plan.capabilityTier === 'compatibility' || bestBackend === 'compatibility-static') {
    return <CompatibilityRenderer {...props} />;
  }

  const Layer = ({ layer, index }: { layer: any; index: number }) => {
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
          case 'aurora':
            return <AuroraRendererVulkan {...layerProps} />;
          case 'mist':
            return <MistRendererVulkan {...layerProps} />;
          case 'young-leaf':
            return <YoungLeafRendererVulkan {...layerProps} />;
          case 'silk':
            return <SilkRendererVulkan {...layerProps} />;
          case 'waterfall':
            return <WaterfallRendererVulkan {...layerProps} />;
          case 'evening-sky':
            return <EveningSkyRendererVulkan {...layerProps} />;
          case 'skymorphic':
            return <SkymorphicRendererVulkan {...layerProps} />;
          case 'water-surface':
            return <WaterSurfaceRendererVulkan {...layerProps} />;
        }
      }

      // Tier 2 (Standard/Skia) / Default: High-Fidelity Skia Logic
      switch (resolvedSurface.name) {
        case 'mist':
          return <MistRendererSkia {...layerProps} />;
        case 'aurora':
          return <AuroraRendererSkia {...layerProps} />;
        case 'young-leaf':
          return <YoungLeafRendererSkia {...layerProps} />;
        case 'silk':
          return <SilkRendererSkia {...layerProps} />;
        case 'waterfall':
          return <WaterfallRendererSkia {...layerProps} />;
        case 'evening-sky':
          return <EveningSkyRendererSkia {...layerProps} />;
        case 'skymorphic':
          return <SkymorphicRendererSkia {...layerProps} />;
        case 'water-surface':
          return <WaterSurfaceRendererSkia {...layerProps} />;
        default:
          return null;
      }
    };

    return (
      <View
        key={index}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: layer.opacity ?? 1 }]}
      >
        {renderContent()}
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {stage.layers.map((layer, index) => (
        <Layer key={index} layer={layer} index={index} />
      ))}
    </View>
  );
}
