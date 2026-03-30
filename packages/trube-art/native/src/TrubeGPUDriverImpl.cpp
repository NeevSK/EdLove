/**
 * TrubeGPUDriverImpl.cpp — Nitro HybridObject Implementation (Vulkan)
 * Trübe-Art v1.0 · 2026 Production Ready
 */

#include "../include/TrubeGPUDriverImpl.hpp"
#include <iostream>

namespace trube {

TrubeGPUDriverImpl::TrubeGPUDriverImpl()
    : HybridObject("TrubeGPUDriver")
{
    engine_ = std::make_unique<TrubeCore>();
    std::cout << "[Trübe-Art] [Nitro] Vulkan Driver initialized.\n";
}

TrubeGPUDriverImpl::~TrubeGPUDriverImpl() {
    if (engine_) engine_->destroy();
}

void TrubeGPUDriverImpl::initialize(void* window) {
    if (engine_) {
        engine_->init(window);
    }
}

void TrubeGPUDriverImpl::onFrame(double time) {
    if (engine_ && engine_->isReady()) {
        // Automatically sync uniforms before each frame
        engine_->updateUniforms("main", static_cast<float>(time), 1080.0f, 1920.0f);
        engine_->renderFrame(static_cast<float>(time));
    }
}

void TrubeGPUDriverImpl::destroy() {
    if (engine_) {
        engine_->destroy();
    }
}

double TrubeGPUDriverImpl::getEntropyTime() {
    if (!engine_) return 0.0;
    return static_cast<double>(engine_->getEntropy());
}

double TrubeGPUDriverImpl::getFrameCount() {
    if (!engine_) return 0.0;
    return static_cast<double>(engine_->getFrameCount());
}

bool TrubeGPUDriverImpl::getIsReady() {
    return engine_ && engine_->isReady();
}

} // namespace trube
