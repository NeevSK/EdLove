/**
 * TrubeGPUDriverImpl.cpp — Nitro HybridObject Implementation
 * Trübe-Art v1.0 · 2026 Production Ready
 *
 * Bridges TrubeCore (GPU engine) to React Native's JSI via Nitro.
 * Every method here maps to an equivalent call in TrubeCore.
 */

#include "../include/TrubeGPUDriverImpl.hpp"
#include <iostream>
#include <cstring>

namespace trube {

TrubeGPUDriverImpl::TrubeGPUDriverImpl()
    : HybridObject("TrubeGPUDriver")
{
    std::cout << "[Trübe-Art] [Nitro] TrubeGPUDriverImpl created. "
              << "Awaiting initializeWithDevice().\n";
}

TrubeGPUDriverImpl::~TrubeGPUDriverImpl() {
    std::cout << "[Trübe-Art] [Nitro] TrubeGPUDriverImpl destroyed.\n";
}

void TrubeGPUDriverImpl::initializeWithDevice(WGPUDevice device, WGPUQueue queue) {
    if (engine_) {
        std::cout << "[Trübe-Art] [Nitro] Engine already initialized — reinitializing.\n";
    }
    engine_ = std::make_unique<TrubeCore>(device, queue);
    std::cout << "[Trübe-Art] [Nitro] Engine initialized and ready.\n";
}

// =============================================================================
// prewarmSurface
// =============================================================================

bool TrubeGPUDriverImpl::prewarmSurface(const std::string& name,
                                        const std::string& wgslSource) {
    if (!engine_) {
        std::cerr << "[Trübe-Art] [Nitro] prewarmSurface called before initializeWithDevice!\n";
        return false;
    }
    return engine_->prewarmSurface(name, wgslSource);
}

// =============================================================================
// onFrame — called from Reanimated worklet every N frames
// =============================================================================

void TrubeGPUDriverImpl::onFrame(const std::string& name,
                                 double time, double entropy, double intensity,
                                 double resW, double resH) {
    if (!engine_) return;
    engine_->onFrame(name,
                     static_cast<float>(time),
                     static_cast<float>(entropy),
                     static_cast<float>(intensity),
                     static_cast<float>(resW),
                     static_cast<float>(resH));
}

void TrubeGPUDriverImpl::prewarmSurfaceAsync(const std::string& name, 
                                            const std::string& wgslSource, 
                                            const std::function<void(bool)>& onReady) {
    if (!engine_) {
        if (onReady) onReady(false);
        return;
    }
    // Note: TrubeCore handles the background thread and callback dispatch.
    engine_->prewarmSurfaceAsync(name, wgslSource, onReady);
}

void TrubeGPUDriverImpl::recordFrame(const std::string& name, double targetViewHandle) {
    if (!engine_) return;
    
    // Safety check for 0.0 handles
    if (targetViewHandle == 0.0) return;

    // Use reinterpret_cast for JSI pointer passing. 
    // This is the standard pattern for react-native-wgpu handles.
    WGPUTextureView targetView = nullptr;
    std::memcpy(&targetView, &targetViewHandle, sizeof(void*));
    
    if (targetView) {
        engine_->recordFrame(name, targetView);
    }
}

// =============================================================================
// Kells Time Protocol
// =============================================================================

double TrubeGPUDriverImpl::getEntropyTime() {
    if (!engine_) return 0.0;
    return static_cast<double>(engine_->getEntropyModulatedTime());
}

// =============================================================================
// Status
// =============================================================================

bool TrubeGPUDriverImpl::isEngineReady() {
    return engine_ && engine_->isReady();
}

bool TrubeGPUDriverImpl::isSurfaceReady(const std::string& name) {
    if (!engine_) return false;
    return engine_->isSurfaceReady(name);
}

bool TrubeGPUDriverImpl::getIsReady() {
    return engine_ && engine_->isReady();
}

// =============================================================================
// Telemetry properties
// =============================================================================

double TrubeGPUDriverImpl::getFrameCount() {
    if (!engine_) return 0.0;
    return static_cast<double>(engine_->getTelemetry().frameCount);
}

double TrubeGPUDriverImpl::getLastPrewarmMs() {
    if (!engine_) return 0.0;
    return engine_->getTelemetry().lastPrewarmMs;
}

double TrubeGPUDriverImpl::getLastFrameMs() {
    if (!engine_) return 0.0;
    return engine_->getTelemetry().lastFrameMs;
}

double TrubeGPUDriverImpl::getActiveSurfaces() {
    if (!engine_) return 0.0;
    return static_cast<double>(engine_->getTelemetry().activeSurfaces);
}

// =============================================================================
// Geometry Layer
// =============================================================================

void TrubeGPUDriverImpl::addPrimitive(const std::string& sessionName,
                                      const std::vector<double>& vertices,
                                      const std::vector<double>& indices) {
    if (!engine_) return;

    // Convert flat double array [x, y, u, v, ...] to TrubeVertex layout
    std::vector<trube::TrubeVertex> nativeVertices;
    nativeVertices.reserve(vertices.size() / 4);
    for (size_t i = 0; i + 3 < vertices.size(); i += 4) {
        trube::TrubeVertex v;
        v.position[0] = static_cast<float>(vertices[i]);
        v.position[1] = static_cast<float>(vertices[i + 1]);
        v.uv[0]       = static_cast<float>(vertices[i + 2]);
        v.uv[1]       = static_cast<float>(vertices[i + 3]);
        nativeVertices.push_back(v);
    }

    // Convert indices to uint16
    std::vector<uint16_t> nativeIndices;
    nativeIndices.reserve(indices.size());
    for (double idx : indices) {
        nativeIndices.push_back(static_cast<uint16_t>(idx));
    }

    engine_->addPrimitive(sessionName, nativeVertices, nativeIndices);
}

} // namespace trube
