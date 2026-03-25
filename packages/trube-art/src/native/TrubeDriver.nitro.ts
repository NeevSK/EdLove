import { type HybridObject } from 'react-native-nitro-modules';

/**
 * TrubeGPUDriver — Nitro JSI Bridge to TrubeCore C++ Engine
 *
 * This interface defines the zero-overhead binding between the
 * Reanimated worklet (UI thread) and the TrubeCore native engine.
 *
 * All methods are synchronous on the calling thread (UI thread worklet).
 * No serialization, no bridge hops between JS and native.
 *
 * Architecture: Tier 1 (API 31+) · Full-Metal · react-native-nitro-modules
 */
export interface TrubeGPUDriver extends HybridObject<{
  android: 'c++';
  ios: 'c++';
}> {
  // ---------------------------------------------------------------------------
  // Startup — called once per surface at app initialization.
  // Each call compiles a WGSL shader and allocates all GPU objects.
  // Returns true if compilation succeeded, false if the surface is unavailable.
  // ---------------------------------------------------------------------------
  prewarmSurface(name: string, wgslSource: string): boolean;

  /**
   * Async version of prewarmSurface to prevent ANR on the UI thread.
   * Compiles the WGSL pipeline on a background GPU worker thread.
   */
  prewarmSurfaceAsync(name: string, wgslSource: string): Promise<boolean>;

  // ---------------------------------------------------------------------------
  // Command Recording Bridge
  // ---------------------------------------------------------------------------
  /**
   * Records the actual GPU render pass for the named surface.
   * This is the "Full-Metal" draw call that executes the shader on the GPU.
   * @param name        Surface name
   * @param targetView  The WGPUTextureView handle from the Canvas
   */
  recordFrame(name: string, targetView: any): void;

  // ---------------------------------------------------------------------------
  // Per-Frame — called from Reanimated useFrameCallback worklet on UI thread.
  // Flushes uniform values to the GPU via wgpuQueueWriteBuffer.
  // Zero allocation. One GPU write per call.
  //
  // @param name      surface name (must be pre-warmed)
  // @param time      entropy-modulated time (use getEntropyTime())
  // @param entropy   meta-noise signal value (47s period, ±0.015)
  // @param intensity surface strength [0, 1]
  // @param resW      render-target width  (50% of screen width)
  // @param resH      render-target height (50% of screen height)
  // ---------------------------------------------------------------------------
  onFrame(
    name: string,
    time: number,
    entropy: number,
    intensity: number,
    resW: number,
    resH: number
  ): void;

  /**
   * Adds a geometry primitive to a specific surface session.
   * This is used for non-fullscreen motifs and ornaments.
   * Total vertices = vertices.length / 4 (x, y, u, v)
   */
  addPrimitive(
    sessionName: string,
    vertices: number[],
    indices: number[]
  ): void;

  // ---------------------------------------------------------------------------
  // Kells Time Protocol — entropy-modulated time.
  // Returns: t + sin(t/47)·0.015 + cos(t/19.3)·0.007 + sin(t·0.1)·0.003
  // This is the value that prevents any Trübe surface from ever looping.
  // ---------------------------------------------------------------------------
  readonly entropyTime: number;

  // ---------------------------------------------------------------------------
  // Status queries
  // ---------------------------------------------------------------------------
  isEngineReady(): boolean;
  isSurfaceReady(name: string): boolean;
  readonly isReady: boolean; // Global engine readiness (all critical pipelines compiled)

  // ---------------------------------------------------------------------------
  // Telemetry — for performance monitoring
  // ---------------------------------------------------------------------------
  readonly frameCount: number;
  readonly lastPrewarmMs: number;
  readonly lastFrameMs: number;
  readonly activeSurfaces: number;
}
