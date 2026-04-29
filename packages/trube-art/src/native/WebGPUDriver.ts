import { tgpu as t } from 'typegpu';
import * as d from 'typegpu/data';

/**
 * TypeGPU Schema for the Standard Soul-set Uniforms.
 * Ensures cross-platform consistency and type safety.
 */
const SoulSetSchema = d.struct({
  time: d.f32,
  entropy: d.f32,
  intensity: d.f32,
  padding: d.f32, // Ensure 16-byte alignment
});

/**
 * WebGPUDriver: Tier 2 rendering path utilizing WebGPU and TypeGPU.
 * Executes complex SDF math on the GPU via standardized bridges.
 */
export class WebGPUDriver {
  private device: GPUDevice | null = null;
  private pipelineCache: Map<string, GPURenderPipeline> = new Map();
  private pipelines: Map<string, GPURenderPipeline> = new Map();
  private buffers: Map<string, any> = new Map(); // TypeGPU managed buffers
  private bindGroups: Map<string, GPUBindGroup> = new Map();
  private root: any = null;

  constructor() {
    console.log('[Tr\u00FCbe-Art] [Tier 2] WebGPUDriver Initialized.');
  }

  async ensureDevice(): Promise<GPUDevice | null> {
    if (this.device) return this.device;
    try {
      // In react-native-wgpu, typically we get the device from the context
      // but we can also use the standard navigator.gpu if available.
      const adapter = await navigator.gpu?.requestAdapter();
      this.device = (await adapter?.requestDevice()) ?? null;

      if (this.device) {
        this.device.lost.then((info) => {
          console.error(`[Tr\u00FCbe-Art] [Tier 2] GPU Device Lost: ${info.message}`, info.reason);
          this.handleDeviceLoss();
        });
        this.root = t.initFromDevice({ device: this.device });
      }

      return this.device;
    } catch (e) {
      console.warn('[Tr\u00FCbe-Art] [Tier 2] WebGPU Device Acquisition Failed.', e);
      return null;
    }
  }

  private handleDeviceLoss() {
    this.device = null;
    this.root = null;
    this.pipelineCache.clear();
    this.pipelines.clear();
    this.buffers.clear();
    // Signal to failover to Tier 3 if recovery fails
    this.onDeviceLost?.('WebGPU Device Loss');
  }

  public onDeviceLost?: (reason: string) => void;

  async submitShader(name: string, source: string): Promise<string> {
    const device = await this.ensureDevice();
    if (!device || !this.root) throw new Error('WebGPU device not available.');

    const sessionId = `${name}_${Math.random().toString(36).substring(7)}`;

    // 1. Check Pre-warm Cache
    let pipeline = this.pipelineCache.get(name);

    if (!pipeline) {
      console.log(`[Tr\u00FCbe-Art] [WebGPU] Compiling Pipeline (In-line): ${name}`);
      const module = device.createShaderModule({
        label: `SoulShader_${name}`,
        code: source,
      });

      pipeline = device.createRenderPipeline({
        label: `SoulPipeline_${name}`,
        layout: 'auto',
        vertex: {
          module,
          entryPoint: 'main_vertex',
        },
        fragment: {
          module,
          entryPoint: 'main_fragment',
          targets: [{ format: 'bgra8unorm' }],
        },
        primitive: {
          topology: 'triangle-list',
        },
      });
      this.pipelineCache.set(name, pipeline);
    } else {
      console.log(`[Tr\u00FCbe-Art] [WebGPU] Using Pre-warmed Pipeline for: ${name}`);
    }

    this.pipelines.set(sessionId, pipeline);

    // Create TypeGPU managed buffer using Root
    const buffer = this.root
      .createBuffer(SoulSetSchema, {
        time: 0,
        entropy: 0,
        intensity: 1.0,
        padding: 0,
      })
      .$usage(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    this.buffers.set(sessionId, buffer);

    // Create BindGroup (Simulated for Tier 2)
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: buffer.buffer },
        },
      ],
    });
    this.bindGroups.set(sessionId, bindGroup);

    // Also store by name for the onFrame lookup
    this.buffers.set(name, buffer);

    console.log(`[Tr\u00FCbe-Art] [Tier 2] TypeGPU Pipeline & BindGroup Created: ${name}`);
    return sessionId;
  }

  async prewarm(name: string, source: string) {
    const device = await this.ensureDevice();
    if (!device || !this.root) return;

    if (this.pipelineCache.has(name)) return;

    const module = device.createShaderModule({
      label: `SoulShader_Prewarm_${name}`,
      code: source,
    });

    const pipeline = device.createRenderPipeline({
      label: `SoulPipeline_Prewarm_${name}`,
      layout: 'auto',
      vertex: { module, entryPoint: 'main_vertex' },
      fragment: {
        module,
        entryPoint: 'main_fragment',
        targets: [{ format: 'bgra8unorm' }],
      },
      primitive: { topology: 'triangle-list' },
    });

    this.pipelineCache.set(name, pipeline);
    console.log(`[Tr\u00FCbe-Art] [Tier 2] WebGPU Pre-warmed Surface: ${name}`);
  }

  onFrame(
    name: string,
    time: number,
    entropy: number,
    intensity: number,
    _resW: number,
    _resH: number,
  ) {
    // Session ID is derived from name for simplicity in standard path
    // In Tier 2, we usually have one pipeline/buffer per named surface.
    const buffer = this.buffers.get(name);
    if (!buffer || !this.device || !this.root) return;

    // Use TypeGPU's type-safe write method
    this.root.writeBuffer(buffer, {
      time,
      entropy,
      intensity,
      padding: 0,
    });
  }

  /**
   * @deprecated Use onFrame
   */
  updateUniforms(id: string, uniforms: { time: number; entropy: number; intensity: number }) {
    const buffer = this.buffers.get(id);
    if (!buffer || !this.device || !this.root) return;

    this.root.writeBuffer(buffer, {
      ...uniforms,
      padding: 0,
    });
  }

  release(id: string) {
    const pipeline = this.pipelines.get(id);
    const buffer = this.buffers.get(id);

    if (buffer) {
      // buffer.gpuBuffer.destroy();
      this.buffers.delete(id);
    }
    if (pipeline) {
      this.pipelines.delete(id);
    }
    this.bindGroups.delete(id);
    console.log(`[Tr\u00FCbe-Art] [Tier 2] WebGPU Resources Released: ${id}`);
  }

  get isSupported(): boolean {
    return !!navigator?.gpu;
  }
}
