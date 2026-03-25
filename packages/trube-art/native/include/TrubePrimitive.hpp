/**
 * TrubePrimitive.hpp — Native Geometry Layer
 * Trübe-Art v1.0 · 2026 Production Ready
 *
 * Manages GPU buffers for non-fullscreen geometry (Motifs, Ornaments).
 * Consistent with the engine's RAII pattern.
 */
#pragma once

#include <webgpu/webgpu.h>
#include <cstdint>
#include <memory>
#include <vector>

namespace trube {

/**
 * Standard vertex layout for all Trübe primitives.
 * Interleaved: [pos.x, pos.y, uv.u, uv.v]
 */
struct TrubeVertex {
    float position[2]; // x, y (NDC or object space)
    float uv[2];       // u, v (texture/procedural coordinates)
};

/**
 * TrubePrimitive — RAII wrapper for Vertex and Index buffers.
 * Owns exactly one set of buffers and releases them in destructor.
 */
class TrubePrimitive {
public:
    /**
     * Factory — Create a primitive from explicit vertices and indices.
     */
    static std::unique_ptr<TrubePrimitive> createFromVertices(
        WGPUDevice device,
        WGPUQueue queue,
        const std::vector<TrubeVertex>& verts,
        const std::vector<uint16_t>& indices
    );

    /**
     * Factory — Create a simple unit quad (2 triangles).
     * @param x, y, w, h — position and size in 2D space.
     */
    static std::unique_ptr<TrubePrimitive> createQuad(
        WGPUDevice device,
        WGPUQueue queue,
        float x, float y, float w, float h
    );

    explicit TrubePrimitive(WGPUDevice device);
    ~TrubePrimitive();

    // Non-copyable — owns unique GPU resources
    TrubePrimitive(const TrubePrimitive&) = delete;
    TrubePrimitive& operator=(const TrubePrimitive&) = delete;

    /**
     * Bind buffers to the render pass.
     */
    void bind(WGPURenderPassEncoder pass) const;

    /**
     * Issue the draw call.
     */
    void draw(WGPURenderPassEncoder pass) const;

    uint32_t getIndexCount() const noexcept { return indexCount_; }

private:
    WGPUDevice device_ = nullptr;
    WGPUBuffer vertexBuf_ = nullptr;
    WGPUBuffer indexBuf_ = nullptr;
    uint32_t   indexCount_ = 0;
};

} // namespace trube
