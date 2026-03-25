/**
 * TrubePrimitive.cpp — Native Geometry Implementation
 * Trübe-Art v1.0 · 2026 Production Ready
 */
#include "../include/TrubePrimitive.hpp"
#include <cstring>
#include <iostream>

namespace trube {

TrubePrimitive::TrubePrimitive(WGPUDevice device)
    : device_(device) {
    if (device_) {
        wgpuDeviceReference(device_);
    }
}

TrubePrimitive::~TrubePrimitive() {
    if (vertexBuf_) {
        wgpuBufferDestroy(vertexBuf_);
        wgpuBufferRelease(vertexBuf_);
    }
    if (indexBuf_) {
        wgpuBufferDestroy(indexBuf_);
        wgpuBufferRelease(indexBuf_);
    }
    if (device_) {
        wgpuDeviceRelease(device_);
    }
}

std::unique_ptr<TrubePrimitive> TrubePrimitive::createFromVertices(
    WGPUDevice device,
    WGPUQueue queue,
    const std::vector<TrubeVertex>& verts,
    const std::vector<uint16_t>& indices
) {
    auto prim = std::make_unique<TrubePrimitive>(device);
    prim->indexCount_ = static_cast<uint32_t>(indices.size());

    // 1. Create and upload vertex buffer
    WGPUBufferDescriptor vDesc{};
    vDesc.label = "trube_vertex_buffer";
    vDesc.size = verts.size() * sizeof(TrubeVertex);
    vDesc.usage = WGPUBufferUsage_Vertex | WGPUBufferUsage_CopyDst;
    vDesc.mappedAtCreation = false;

    prim->vertexBuf_ = wgpuDeviceCreateBuffer(device, &vDesc);
    if (!prim->vertexBuf_) return nullptr;

    wgpuQueueWriteBuffer(queue, prim->vertexBuf_, 0, verts.data(), vDesc.size);

    // 2. Create and upload index buffer
    WGPUBufferDescriptor iDesc{};
    iDesc.label = "trube_index_buffer";
    iDesc.size = indices.size() * sizeof(uint16_t);
    iDesc.usage = WGPUBufferUsage_Index | WGPUBufferUsage_CopyDst;
    iDesc.mappedAtCreation = false;

    prim->indexBuf_ = wgpuDeviceCreateBuffer(device, &iDesc);
    if (!prim->indexBuf_) return nullptr;

    wgpuQueueWriteBuffer(queue, prim->indexBuf_, 0, indices.data(), iDesc.size);

    return prim;
}

std::unique_ptr<TrubePrimitive> TrubePrimitive::createQuad(
    WGPUDevice device,
    WGPUQueue queue,
    float x, float y, float w, float h
) {
    // Standard unit quad (0..1) or custom size (x..x+w, y..y+h)
    // Using 2 triangles, CCW winding order.
    std::vector<TrubeVertex> verts = {
        {{x,     y},     {0.0f, 0.0f}}, // Bottom-left
        {{x + w, y},     {1.0f, 0.0f}}, // Bottom-right
        {{x + w, y + h}, {1.0f, 1.0f}}, // Top-right
        {{x,     y + h}, {0.0f, 1.0f}}  // Top-left
    };

    std::vector<uint16_t> indices = {
        0, 1, 2, // Triangle 1
        0, 2, 3  // Triangle 2
    };

    return createFromVertices(device, queue, verts, indices);
}

void TrubePrimitive::bind(WGPURenderPassEncoder pass) const {
    if (!vertexBuf_ || !indexBuf_) return;
    wgpuRenderPassEncoderSetVertexBuffer(pass, 0, vertexBuf_, 0, WGPU_WHOLE_SIZE);
    wgpuRenderPassEncoderSetIndexBuffer(pass, indexBuf_, WGPUIndexFormat_Uint16, 0, WGPU_WHOLE_SIZE);
}

void TrubePrimitive::draw(WGPURenderPassEncoder pass) const {
    if (!indexBuf_) return;
    wgpuRenderPassEncoderDrawIndexed(pass, indexCount_, 1, 0, 0, 0);
}

} // namespace trube
