/**
 * TrubeCore.hpp — The Full-Metal Soul Engine (Vulkan)
 * Trübe-Art v1.0 · 2026 Production Ready
 *
 * This is the real native Vulkan GPU engine. 
 * Every handle is a real Vk* object.
 *
 * Architecture: Vulkan 1.1 · C++17 · RAII · Thread-safe
 */
#pragma once

#include <vulkan/vulkan.h>
#include <vulkan/vulkan_android.h>

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
// § 1 — RAII Vulkan Handle Wrappers
// =============================================================================

template <typename T, void (*Deleter)(VkDevice, T, const VkAllocationCallbacks*)>
struct VulkanDeviceDeleter {
    VkDevice device;
    void operator()(T obj) const noexcept {
        if (obj && device) Deleter(device, obj, nullptr);
    }
};

// =============================================================================
// § 2 — Uniform Layout (std140)
// =============================================================================

struct alignas(16) TrubeUniforms {
    float time;         // offset  0
    float _pad0[3];     // offset  4-12
    float resolution[2]; // offset 16-24
    float _pad1[2];     // offset 24-32
};
static_assert(sizeof(TrubeUniforms) == 32, "TrubeUniforms must be 32 bytes (std140)");

// =============================================================================
// § 3 — Surface Session
// =============================================================================

struct SurfaceSession {
    std::string            name;
    VkPipeline             pipeline         = VK_NULL_HANDLE;
    VkPipelineLayout       pipelineLayout   = VK_NULL_HANDLE;
    VkBuffer               uniformBuffer    = VK_NULL_HANDLE;
    VkDeviceMemory         uniformMemory    = VK_NULL_HANDLE;
    VkDescriptorSet        descriptorSet    = VK_NULL_HANDLE;
    void*                  uniformPtr       = nullptr;
    TrubeUniforms          uniforms{};
    
    bool                   isReady          = false;
};

struct TrubeTelemetry {
    uint64_t frameCount          = 0;
    double   lastFrameMs         = 0.0;
    float    currentEntropyTime  = 0.0f;
    uint32_t activeSurfaces      = 0;
};

// =============================================================================
// § 5 — TrubeCore Engine
// =============================================================================

class TrubeCore {
public:
    TrubeCore();
    ~TrubeCore();

    // Lifecycle
    void init(void* window); // ANativeWindow*
    void renderFrame(float time);
    void destroy();

    // Per-frame updates
    void updateUniforms(const std::string& name, float time, float resW, float resH);

    float getEntropy();
    uint64_t getFrameCount() const noexcept;
    bool isReady() const noexcept { return isInitialized_; }

private:
    // Vulkan Core Initialization
    void createInstance();
    void createSurface(void* window);
    void pickPhysicalDevice();
    void createLogicalDevice();
    void createSwapchain();
    void createFramebuffers();
    void createRenderPass();
    void createDescriptorSetLayout();
    void createGraphicsPipeline();
    void createUniformBuffers();
    void createDescriptorPool();
    void createDescriptorSets();
    void createCommandPool();
    void createCommandBuffers();
    void createSyncObjects();

    // Vulkan Core Handles
    VkInstance       instance_       = VK_NULL_HANDLE;
    VkSurfaceKHR     surface_        = VK_NULL_HANDLE;
    VkPhysicalDevice physicalDevice_ = VK_NULL_HANDLE;
    VkDevice         device_         = VK_NULL_HANDLE;
    VkQueue          graphicsQueue_  = VK_NULL_HANDLE;
    VkQueue          presentQueue_   = VK_NULL_HANDLE;

    VkSwapchainKHR   swapChain_      = VK_NULL_HANDLE;
    std::vector<VkImage> swapChainImages_;
    VkFormat         swapChainFormat_;
    VkExtent2D       swapChainExtent_;
    std::vector<VkImageView> swapChainImageViews_;
    std::vector<VkFramebuffer> swapChainFramebuffers_;

    VkRenderPass     renderPass_     = VK_NULL_HANDLE;
    VkDescriptorSetLayout descriptorSetLayout_ = VK_NULL_HANDLE;
    VkPipelineLayout pipelineLayout_ = VK_NULL_HANDLE;
    VkPipeline       graphicsPipeline_ = VK_NULL_HANDLE;

    VkDescriptorPool descriptorPool_ = VK_NULL_HANDLE;
    std::vector<VkDescriptorSet> descriptorSets_;

    std::vector<VkBuffer> uniformBuffers_;
    std::vector<VkDeviceMemory> uniformBuffersMemory_;
    std::vector<void*> uniformBuffersMapped_;

    VkCommandPool    commandPool_    = VK_NULL_HANDLE;
    std::vector<VkCommandBuffer> commandBuffers_;

    // Sync
    std::vector<VkSemaphore> imageAvailableSemaphores_;
    std::vector<VkSemaphore> renderFinishedSemaphores_;
    std::vector<VkFence>     inFlightFences_;
    uint32_t currentFrame_ = 0;

    bool isInitialized_ = false;
    std::chrono::steady_clock::time_point startTime_;
    mutable TrubeTelemetry telemetry_;
    
    // Helpers
    uint32_t findMemoryType(uint32_t typeFilter, VkMemoryPropertyFlags properties);
    VkShaderModule createShaderModule(const std::vector<uint32_t>& code);
};

} // namespace trube
