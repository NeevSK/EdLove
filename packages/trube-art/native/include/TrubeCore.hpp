/**
 * TrubeCore.hpp — The Full-Metal Soul Engine
 * Trübe-Art v1.0 · 2026 Production Ready
 *
 * This is the real native GPU engine. Every handle is a real GPU object.
 * Every function issues real GPU commands.
 * No mocks. No placeholders. No void* sentinel values.
 *
 * Architecture: WebGPU (Dawn / react-native-wgpu) · C++17 · RAII · Thread-safe
 *
 * "Colors are the deeds and sufferings of light." — Goethe, 1810
 */
#pragma once

// WebGPU C API — provided by react-native-wgpu / Dawn
#include <webgpu/webgpu.h>

#include <cstdint>
#include <cstring>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <chrono>
#include <vector>
#include <functional>
#include <atomic>
#include <thread>
#include <cassert>
#include <utility>

#include "TrubePrimitive.hpp"

namespace trube {

// =============================================================================
// § 1 — RAII GPU Handle Wrappers
// =============================================================================
// Each wrapper holds exactly one GPU object and releases it in its destructor.
// unique_ptr<T_raw, Deleter> gives us automatic release with zero overhead.

struct DeviceDeleter {
    void operator()(WGPUDevice d) const noexcept {
        if (d) wgpuDeviceRelease(d);
    }
};
using DeviceHandle = std::unique_ptr<WGPUDeviceImpl, DeviceDeleter>;

struct BindGroupLayoutDeleter {
    void operator()(WGPUBindGroupLayout l) const noexcept {
        if (l) wgpuBindGroupLayoutRelease(l);
    }
};
using BindGroupLayoutHandle = std::unique_ptr<WGPUBindGroupLayoutImpl, BindGroupLayoutDeleter>;

struct RenderPipelineDeleter {
    void operator()(WGPURenderPipeline p) const noexcept {
        if (p) wgpuRenderPipelineRelease(p);
    }
};
using RenderPipelineHandle = std::unique_ptr<WGPURenderPipelineImpl, RenderPipelineDeleter>;

struct BufferDeleter {
    void operator()(WGPUBuffer b) const noexcept {
        if (b) { wgpuBufferDestroy(b); wgpuBufferRelease(b); }
    }
};
using BufferHandle = std::unique_ptr<WGPUBufferImpl, BufferDeleter>;

struct BindGroupDeleter {
    void operator()(WGPUBindGroup g) const noexcept {
        if (g) wgpuBindGroupRelease(g);
    }
};
using BindGroupHandle = std::unique_ptr<WGPUBindGroupImpl, BindGroupDeleter>;

struct ShaderModuleDeleter {
    void operator()(WGPUShaderModule m) const noexcept {
        if (m) wgpuShaderModuleRelease(m);
    }
};
using ShaderModuleHandle = std::unique_ptr<WGPUShaderModuleImpl, ShaderModuleDeleter>;

struct CommandEncoderDeleter {
    void operator()(WGPUCommandEncoder e) const noexcept {
        if (e) wgpuCommandEncoderRelease(e);
    }
};
using CommandEncoderHandle = std::unique_ptr<WGPUCommandEncoderImpl, CommandEncoderDeleter>;


// =============================================================================
// § 2 — Uniform Layout (std140, matches WGSL TrubeUniforms struct)
// =============================================================================
// Must be kept in sync with shaders/shared/uniforms.wgsl.
// Total size: 32 bytes (8 × f32). Aligned to 16-byte boundary.

struct alignas(16) TrubeUniforms {
    float time;         // offset  0 — entropy-modulated running time (seconds)
    float entropy;      // offset  4 — 47s meta-noise modulator (prevents loops)
    float intensity;    // offset  8 — surface opacity/strength [0.0, 1.0]
    float _pad0;        // offset 12 — std140 padding
    float resolutionX;  // offset 16 — render-target width  (50% of screen)
    float resolutionY;  // offset 20 — render-target height (50% of screen)
    float _pad1;        // offset 24
    float _pad2;        // offset 28
};
static_assert(sizeof(TrubeUniforms) == 32, "TrubeUniforms must be exactly 32 bytes (std140)");


// =============================================================================
// § 3 — Surface Session
// =============================================================================
// One SurfaceSession per named surface (aurora, silk, mist …).
// Holds all GPU objects required to render that surface for its lifetime.

struct SurfaceSession {
    std::string            name;
    RenderPipelineHandle   pipeline;       // compiled vertex + fragment program
    BufferHandle           uniformBuffer;  // UNIFORM | COPY_DST — 32-byte host mirror
    BindGroupHandle        bindGroup;      // binds the uniform buffer to shader slot 0
    TrubeUniforms          uniforms{};     // host-side copy (flushed via wgpuQueueWriteBuffer)
    
    // Geometry Layer: Non-fullscreen primitives (Motifs/Ornaments)
    std::vector<std::unique_ptr<TrubePrimitive>> primitives;
    
    bool                   needsFlush = true;
    bool                   isReady    = false;
};


// =============================================================================
// § 4 — Telemetry
// =============================================================================

struct TrubeTelemetry {
    uint64_t frameCount          = 0;
    double   lastPrewarmMs       = 0.0;
    double   lastFrameMs         = 0.0;
    float    currentEntropyTime  = 0.0f;
    uint32_t activeSurfaces      = 0;
};


// =============================================================================
// § 5 — TrubeCore Engine
// =============================================================================
/**
 * TrubeCore is the production GPU engine for Trübe-Art Tier 1.
 *
 * Lifecycle:
 *   1. Construct with a real WGPUDevice + WGPUQueue (provided by react-native-wgpu).
 *   2. Call prewarmSurface() for each named surface at app startup (~300ms total).
 *   3. Call onFrame() from the Reanimated UI-thread worklet every N frames.
 *
 * Thread safety:
 *   All public methods are thread-safe via sessionMutex_.
 *   onFrame() is designed for UI-thread invocation but safe from any thread.
 */
class TrubeCore {
public:
    /**
     * Construct the engine.
     * @param device  Borrowed WGPUDevice from react-native-wgpu. TrubeCore does NOT own this.
     * @param queue   Borrowed WGPUQueue. Also not owned by TrubeCore.
     */
    explicit TrubeCore(WGPUDevice device, WGPUQueue queue);
    ~TrubeCore();

    // Non-copyable, moveable
    TrubeCore(const TrubeCore&) = delete;
    TrubeCore& operator=(const TrubeCore&) = delete;
    TrubeCore(TrubeCore&&) = default;
    TrubeCore& operator=(TrubeCore&&) = default;

    // -------------------------------------------------------------------------
    // Startup — call once per surface at app init
    // -------------------------------------------------------------------------
    /**
     * Compile a WGSL shader and create all GPU objects for the named surface.
     * Idempotent: safe to call multiple times for the same name.
     * @param name        Surface name (e.g. "aurora", "silk")
     * @param wgslSource  Complete WGSL source (vertex + fragment in one module)
     * @return true on success, false if GPU compilation failed
     */
    bool prewarmSurface(const std::string& name, const std::string& wgslSource);

    /**
     * Async version of prewarmSurface to prevent ANR.
     */
    void prewarmSurfaceAsync(const std::string& name, 
                            const std::string& wgslSource, 
                            std::function<void(bool)> onReady);

    // -------------------------------------------------------------------------
    // Command Recording — called from Nitro's recordFrame
    // -------------------------------------------------------------------------
    /**
     * Records and submits the actual render pass.
     * @param targetView Borrowed WGPUTextureView for the current swapchain texture.
     */
    void recordFrame(const std::string& name, WGPUTextureView targetView);

    // -------------------------------------------------------------------------
    // Per-Frame — call from Reanimated UI-thread worklet
    // -------------------------------------------------------------------------
    /**
     * Push new uniform values for a surface and flush to GPU.
     * Called by the Reanimated worklet on every scheduled frame.
     * Zero allocation. One wgpuQueueWriteBuffer call.
     *
     * @param name       Surface name (must have been pre-warmed)
     * @param time       Entropy-modulated time in seconds
     * @param entropy    Meta-noise entropy value (47s period, ~±0.02)
     * @param intensity  Surface strength [0.0, 1.0]
     * @param resW       Render-target width  (typically 50% of screen)
     * @param resH       Render-target height (typically 50% of screen)
     */
    void onFrame(const std::string& name,
                 float time, float entropy, float intensity,
                 float resW, float resH);

    void addPrimitive(const std::string& sessionName,
                      const std::vector<trube::TrubeVertex>& vertices,
                      const std::vector<uint16_t>& indices);

    float getEntropyModulatedTime() const noexcept;

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    bool            isReady()       const noexcept;
    TrubeTelemetry  getTelemetry()  const noexcept;
    bool            isSurfaceReady(const std::string& name) const noexcept;

private:
    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------
    ShaderModuleHandle    createShaderModule(const std::string& wgsl) const noexcept;
    RenderPipelineHandle  createRenderPipeline(WGPUShaderModule shader) const noexcept;
    BufferHandle          createUniformBuffer() const noexcept;
    BindGroupHandle       createBindGroup(WGPUBuffer uniformBuffer) const noexcept;

    // -------------------------------------------------------------------------
    // GPU state — borrowed, never owned
    // -------------------------------------------------------------------------
    WGPUDevice  device_;  ///< Borrowed from react-native-wgpu — do NOT release
    WGPUQueue   queue_;   ///< Borrowed from react-native-wgpu — do NOT release

    // -------------------------------------------------------------------------
    // Shared GPU objects — created once, shared across all sessions
    // -------------------------------------------------------------------------
    BindGroupLayoutHandle  sharedBindGroupLayout_;  ///< uniform at binding=0

    // -------------------------------------------------------------------------
    // Per-surface sessions
    // -------------------------------------------------------------------------
    mutable std::mutex                            sessionMutex_;
    std::unordered_map<std::string, SurfaceSession> sessions_;

    // -------------------------------------------------------------------------
    // Timing
    // -------------------------------------------------------------------------
    std::chrono::steady_clock::time_point startTime_;

    // -------------------------------------------------------------------------
    // Telemetry
    // -------------------------------------------------------------------------
    mutable TrubeTelemetry telemetry_;
};

} // namespace trube
