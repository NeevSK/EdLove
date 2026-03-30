import React, { useMemo, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, type CanvasRef } from 'react-native-wgpu';
import { useFrameCallback, runOnJS } from 'react-native-reanimated';
import { NitroModules } from 'react-native-nitro-modules';
import type { TrubeGPUDriver } from '../TrubeDriver.nitro';

import { driverManager } from '../DriverManager';
import { soulLibrary } from '../../core/soul/SoulLibrary';
import { ScoreComposer } from '../../core/soul/ScoreComposer';
import { useTrubeTime } from '../../core/soul/TimeLayer';
import type { TrubeRendererProps } from '../renderers/types';

interface NativeSubstrateProps extends TrubeRendererProps {
  soul: any; 
}

/**
 * NativeSubstrateRenderer \u2014 The "Full-Metal" and "Anyhow" bridge component.
 * Targets both Tier 1 (C++/Nitro) and Tier 2 (WebGPU/Standard).
 */
export function NativeSubstrateRenderer({ width, height, surface, plan, soul }: NativeSubstrateProps) {
  const nativeDriver = driverManager.getNativeDriver();
  const webgpuDriver = driverManager.getWebGPUDriver();
  const currentBackend = driverManager.getBestBackend();
  const canvasRef = useRef<CanvasRef>(null);

  // 1. Compose the score
  const score = useMemo(() => ScoreComposer.compose({
    surface: soul,
    motif: plan.motif as any,
    ornament: plan.ornament as any,
    rationale: `Active ${surface.name} performance on ${currentBackend} substrate.`,
  }), [surface, plan, soul, currentBackend]);

  // 1b. Acquire a stable Nitro driver reference for the worklet
  const driver = useMemo(() => {
    try {
      return NitroModules.createHybridObject<TrubeGPUDriver>('TrubeGPUDriver');
    } catch {
      return null;
    }
  }, []);

  // 2. Generate WGSL
  const wgsl = useMemo(() => soulLibrary.getSurfaceShader(surface.name), [surface.name]);

  // 3. Register the shader session (Internal lifecycle)
  const [isWarmed, setIsWarmed] = React.useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!wgsl) return;
      
      console.log(`[Tr\u00FCbe-Art] [Substrate] Pre-warming ${surface.name} soul...`);
      
      if (currentBackend === 'native-vulkan' || currentBackend === 'native-metal') {
        const ok = nativeDriver?.prewarmSurface(surface.name, wgsl) ?? false;
        if (!cancelled) setIsWarmed(ok);
      } else if (currentBackend === 'webgpu') {
        await webgpuDriver.prewarm(surface.name, wgsl);
        // Tier 2 uses a session-based submit for the real canvas binding
        await webgpuDriver.submitShader(surface.name, wgsl);
        if (!cancelled) setIsWarmed(true);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [wgsl, currentBackend, surface.name, nativeDriver, webgpuDriver]);

  // WebGPU initialization via Ref
  useEffect(() => {
    if (currentBackend === 'webgpu' && canvasRef.current) {
      canvasRef.current.whenReady(() => {
        console.log(`[Tr\u00FCbe-Art] [WebGPU] ${surface.name} Canvas Ready.`);
      });
    }
  }, [currentBackend, surface.name]);

  // 4. Zero-Allocation Uniform Bridge
  useFrameCallback(() => {
    'worklet';

    if (!isWarmed || !plan.animationEnabled) return;
    if (!driver || !driver.isReady) return;

    const t = driver.entropyTime;
    const entropyValue = Math.sin(t / 47.0) * 0.012
                       + Math.cos(t / 19.3) * 0.006
                       + Math.sin(t * 0.1)  * 0.003;

    if (currentBackend === 'native-vulkan' || currentBackend === 'native-metal') {
      // Tier 1: Record and update uniforms in one pass
      driver.onFrame(surface.name, t, entropyValue, 1.0, width, height);
      
      // Attempt to get the native surface view handle if supported by the bridge
      // For now, we rely on the native driver to have its own surface-to-context mapping
      // or we pass the context handle if available.
    } else if (currentBackend === 'webgpu') {
      runOnJS(webgpuDriver.onFrame)(surface.name, t, entropyValue, 1.0, width, height);
    }
  });

  return (
    <Canvas 
      ref={canvasRef}
      style={StyleSheet.absoluteFill}
    /  );
}
