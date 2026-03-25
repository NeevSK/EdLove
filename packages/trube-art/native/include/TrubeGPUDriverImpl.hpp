/**
 * TrubeGPUDriverImpl.hpp — Nitro HybridObject for TrubeCore
 * Trübe-Art v1.0
 *
 * This is the generated-and-implemented Nitro C++ host.
 * It wraps TrubeCore and exposes it to the JS/Reanimated worklet via JSI.
 *
 * react-native-nitro-modules calls these methods directly on the UI thread
 * when invoked from a Reanimated worklet. Zero serialization overhead.
 */
#pragma once

// Nitro-generated base class (from TrubeDriver.nitro.ts)
#include "HybridTrubeGPUDriverSpec.hpp"
#include "TrubeCore.hpp"

#include <memory>
#include <string>

namespace trube {

class TrubeGPUDriverImpl : public HybridTrubeGPUDriverSpec {
public:
    TrubeGPUDriverImpl();
    ~TrubeGPUDriverImpl() override;

    // Called by react-native-wgpu during native module setup.
    // The WGPUDevice and WGPUQueue are provided by the WebGPU surface context.
    void initializeWithDevice(WGPUDevice device, WGPUQueue queue);

    // -------------------------------------------------------------------------
    // Nitro HybridObject — prewarmSurface
    // -------------------------------------------------------------------------
    bool prewarmSurface(const std::string& name, const std::string& wgslSource) override;

    // -------------------------------------------------------------------------
    // Nitro HybridObject — onFrame
    // -------------------------------------------------------------------------
    void onFrame(const std::string& name,
                 double time, double entropy, double intensity,
                 double resW, double resH) override;

    void addPrimitive(const std::string& sessionName,
                      const std::vector<double>& vertices,
                      const std::vector<double>& indices) override;

    // -------------------------------------------------------------------------
    // Nitro HybridObject — prewarmSurfaceAsync
    // -------------------------------------------------------------------------
    void prewarmSurfaceAsync(const std::string& name, 
                            const std::string& wgslSource, 
                            const std::function<void(bool)>& onReady) override;

    // -------------------------------------------------------------------------
    // Nitro HybridObject — recordFrame
    // -------------------------------------------------------------------------
    void recordFrame(const std::string& name, double targetViewHandle) override;

    // -------------------------------------------------------------------------
    // Nitro HybridObject — getEntropyTime
    // -------------------------------------------------------------------------
    double getEntropyTime() override;

    // -------------------------------------------------------------------------
    // Nitro HybridObject — status
    // -------------------------------------------------------------------------
    bool isEngineReady() override;
    bool isSurfaceReady(const std::string& name) override;
    bool getIsReady() override;

    // -------------------------------------------------------------------------
    // Nitro HybridObject — readonly telemetry properties
    // -------------------------------------------------------------------------
    double getFrameCount()    override;
    double getLastPrewarmMs() override;
    double getLastFrameMs()   override;
    double getActiveSurfaces() override;

    // Nitro requires this for memory management
    size_t getExternalMemorySize() noexcept override { return sizeof(TrubeCore); }

private:
    std::unique_ptr<TrubeCore> engine_;  ///< null until initializeWithDevice() is called
};

} // namespace trube
