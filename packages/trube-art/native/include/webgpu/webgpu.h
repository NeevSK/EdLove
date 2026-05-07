/**
 * webgpu/webgpu.h — Forward Declaration Stub for IDE (clangd)
 *
 * This stub allows clangd to parse TrubeCore.hpp without errors
 * BEFORE compile_commands.json has been generated with the real NDK sysroot.
 *
 * The REAL webgpu.h is provided by react-native-wgpu (Dawn) at build time.
 * This file is ONLY used by the IDE. It is excluded from the actual build
 * via CMakeLists.txt (which finds webgpu.h in the NDK rnwgpu include path).
 *
 * HOW TO REMOVE THIS STUB:
 *   Run: packages/trube-art/scripts/gen-compile-commands.ps1
 *   After that, clangd uses the real Dawn headers via compile_commands.json.
 *
 * Minimal surface that satisfies all types used in TrubeCore.hpp.
 */
#pragma once

#include <stdbool.h>   // bool in C mode
#include <stdint.h>    // uint32_t, uint64_t, size_t
#include <stddef.h>    // size_t

// =============================================================================
// Opaque handle structs (Dawn follows the pattern: WGPUFooImpl* = WGPUFoo)
// =============================================================================
struct WGPUInstanceImpl;
struct WGPUAdapterImpl;
struct WGPUDeviceImpl;
struct WGPUQueueImpl;
struct WGPUShaderModuleImpl;
struct WGPURenderPipelineImpl;
struct WGPUPipelineLayoutImpl;
struct WGPUBindGroupLayoutImpl;
struct WGPUBindGroupImpl;
struct WGPUBufferImpl;
struct WGPUCommandEncoderImpl;
struct WGPURenderPassEncoderImpl;
struct WGPUCommandBufferImpl;
struct WGPUTextureViewImpl;
struct WGPUTextureImpl;

typedef WGPUInstanceImpl*            WGPUInstance;
typedef WGPUAdapterImpl*             WGPUAdapter;
typedef WGPUDeviceImpl*              WGPUDevice;
typedef WGPUQueueImpl*               WGPUQueue;
typedef WGPUShaderModuleImpl*        WGPUShaderModule;
typedef WGPURenderPipelineImpl*      WGPURenderPipeline;
typedef WGPUPipelineLayoutImpl*      WGPUPipelineLayout;
typedef WGPUBindGroupLayoutImpl*     WGPUBindGroupLayout;
typedef WGPUBindGroupImpl*           WGPUBindGroup;
typedef WGPUBufferImpl*              WGPUBuffer;
typedef WGPUCommandEncoderImpl*      WGPUCommandEncoder;
typedef WGPURenderPassEncoderImpl*   WGPURenderPassEncoder;
typedef WGPUCommandBufferImpl*       WGPUCommandBuffer;
typedef WGPUTextureViewImpl*         WGPUTextureView;
typedef WGPUTextureImpl*             WGPUTexture;

// =============================================================================
// Enumerations needed by TrubeCore
// =============================================================================
typedef enum WGPUShaderStage {
    WGPUShaderStage_None     = 0x00000000,
    WGPUShaderStage_Vertex   = 0x00000001,
    WGPUShaderStage_Fragment = 0x00000002,
    WGPUShaderStage_Compute  = 0x00000004,
} WGPUShaderStage;
typedef uint32_t WGPUShaderStageFlags;

typedef enum WGPUBufferBindingType {
    WGPUBufferBindingType_Undefined    = 0x00000000,
    WGPUBufferBindingType_Uniform      = 0x00000001,
    WGPUBufferBindingType_Storage      = 0x00000002,
    WGPUBufferBindingType_ReadOnlyStorage = 0x00000003,
} WGPUBufferBindingType;

typedef enum WGPUBufferUsage {
    WGPUBufferUsage_None      = 0x00000000,
    WGPUBufferUsage_MapRead   = 0x00000001,
    WGPUBufferUsage_MapWrite  = 0x00000002,
    WGPUBufferUsage_CopySrc   = 0x00000004,
    WGPUBufferUsage_CopyDst   = 0x00000008,
    WGPUBufferUsage_Index     = 0x00000010,
    WGPUBufferUsage_Vertex    = 0x00000020,
    WGPUBufferUsage_Uniform   = 0x00000040,
    WGPUBufferUsage_Storage   = 0x00000080,
} WGPUBufferUsage;
typedef uint32_t WGPUBufferUsageFlags;

typedef enum WGPUColorWriteMask {
    WGPUColorWriteMask_None  = 0,
    WGPUColorWriteMask_Red   = 0x1,
    WGPUColorWriteMask_Green = 0x2,
    WGPUColorWriteMask_Blue  = 0x4,
    WGPUColorWriteMask_Alpha = 0x8,
    WGPUColorWriteMask_All   = 0xF,
} WGPUColorWriteMask;
typedef uint32_t WGPUColorWriteMaskFlags;

typedef enum WGPUTextureFormat {
    WGPUTextureFormat_Undefined   = 0,
    WGPUTextureFormat_BGRA8Unorm  = 23,
    WGPUTextureFormat_RGBA8Unorm  = 18,
} WGPUTextureFormat;

typedef enum WGPUPrimitiveTopology {
    WGPUPrimitiveTopology_PointList     = 0,
    WGPUPrimitiveTopology_LineList      = 1,
    WGPUPrimitiveTopology_LineStrip     = 2,
    WGPUPrimitiveTopology_TriangleList  = 3,
    WGPUPrimitiveTopology_TriangleStrip = 4,
} WGPUPrimitiveTopology;

typedef enum WGPUCullMode {
    WGPUCullMode_None  = 0,
    WGPUCullMode_Front = 1,
    WGPUCullMode_Back  = 2,
} WGPUCullMode;

typedef enum WGPUFrontFace {
    WGPUFrontFace_CCW = 0,
    WGPUFrontFace_CW  = 1,
} WGPUFrontFace;

typedef enum WGPUIndexFormat {
    WGPUIndexFormat_Undefined = 0,
    WGPUIndexFormat_Uint16    = 1,
    WGPUIndexFormat_Uint32    = 2,
} WGPUIndexFormat;

typedef enum WGPUBlendOperation {
    WGPUBlendOperation_Add              = 0,
    WGPUBlendOperation_Subtract         = 1,
    WGPUBlendOperation_ReverseSubtract  = 2,
    WGPUBlendOperation_Min              = 3,
    WGPUBlendOperation_Max              = 4,
} WGPUBlendOperation;

typedef enum WGPUBlendFactor {
    WGPUBlendFactor_Zero                = 0,
    WGPUBlendFactor_One                 = 1,
    WGPUBlendFactor_Src                 = 2,
    WGPUBlendFactor_OneMinusSrc         = 3,
    WGPUBlendFactor_SrcAlpha            = 4,
    WGPUBlendFactor_OneMinusSrcAlpha    = 5,
    WGPUBlendFactor_Dst                 = 6,
    WGPUBlendFactor_OneMinusDst         = 7,
    WGPUBlendFactor_DstAlpha            = 8,
    WGPUBlendFactor_OneMinusDstAlpha    = 9,
} WGPUBlendFactor;

typedef enum WGPUSType {
    WGPUSType_Invalid                       = 0,
    WGPUSType_ShaderModuleWGSLDescriptor    = 6,
    WGPUSType_Force32                       = 0x7FFFFFFF,
} WGPUSType;

// =============================================================================
// Descriptor structs needed by TrubeCore
// =============================================================================
typedef struct WGPUChainedStruct {
    struct WGPUChainedStruct const* next;
    WGPUSType sType;
} WGPUChainedStruct;

typedef struct WGPUShaderModuleWGSLDescriptor {
    WGPUChainedStruct chain;
    const char* code;
} WGPUShaderModuleWGSLDescriptor;

typedef struct WGPUShaderModuleDescriptor {
    WGPUChainedStruct const* nextInChain;
    const char* label;
} WGPUShaderModuleDescriptor;

typedef struct WGPUBufferBindingLayout {
    WGPUChainedStruct const* nextInChain;
    WGPUBufferBindingType type;
    bool  hasDynamicOffset;
    uint64_t minBindingSize;
} WGPUBufferBindingLayout;

typedef struct WGPUBindGroupLayoutEntry {
    WGPUChainedStruct const* nextInChain;
    uint32_t binding;
    WGPUShaderStageFlags visibility;
    WGPUBufferBindingLayout buffer;
} WGPUBindGroupLayoutEntry;

typedef struct WGPUBindGroupLayoutDescriptor {
    WGPUChainedStruct const* nextInChain;
    const char* label;
    size_t entryCount;
    const WGPUBindGroupLayoutEntry* entries;
} WGPUBindGroupLayoutDescriptor;

typedef struct WGPUBufferDescriptor {
    WGPUChainedStruct const* nextInChain;
    const char* label;
    WGPUBufferUsageFlags usage;
    uint64_t size;
    bool mappedAtCreation;
} WGPUBufferDescriptor;

typedef struct WGPUBindGroupEntry {
    WGPUChainedStruct const* nextInChain;
    uint32_t binding;
    WGPUBuffer buffer;
    uint64_t offset;
    uint64_t size;
    WGPUTextureView textureView;
} WGPUBindGroupEntry;

typedef struct WGPUBindGroupDescriptor {
    WGPUChainedStruct const* nextInChain;
    const char* label;
    WGPUBindGroupLayout layout;
    size_t entryCount;
    const WGPUBindGroupEntry* entries;
} WGPUBindGroupDescriptor;

typedef struct WGPUPipelineLayoutDescriptor {
    WGPUChainedStruct const* nextInChain;
    const char* label;
    size_t bindGroupLayoutCount;
    const WGPUBindGroupLayout* bindGroupLayouts;
} WGPUPipelineLayoutDescriptor;

typedef struct WGPUBlendComponent {
    WGPUBlendOperation operation;
    WGPUBlendFactor    srcFactor;
    WGPUBlendFactor    dstFactor;
} WGPUBlendComponent;

typedef struct WGPUBlendState {
    WGPUBlendComponent color;
    WGPUBlendComponent alpha;
} WGPUBlendState;

typedef struct WGPUColorTargetState {
    WGPUChainedStruct const* nextInChain;
    WGPUTextureFormat format;
    const WGPUBlendState* blend;
    WGPUColorWriteMaskFlags writeMask;
} WGPUColorTargetState;

typedef struct WGPUVertexState {
    WGPUChainedStruct const* nextInChain;
    WGPUShaderModule module;
    const char* entryPoint;
    size_t constantCount;
    const void* constants;
    size_t bufferCount;
    const void* buffers;
} WGPUVertexState;

typedef struct WGPUFragmentState {
    WGPUChainedStruct const* nextInChain;
    WGPUShaderModule module;
    const char* entryPoint;
    size_t constantCount;
    const void* constants;
    size_t targetCount;
    const WGPUColorTargetState* targets;
} WGPUFragmentState;

typedef struct WGPUPrimitiveState {
    WGPUChainedStruct const* nextInChain;
    WGPUPrimitiveTopology topology;
    WGPUIndexFormat stripIndexFormat;
    WGPUFrontFace frontFace;
    WGPUCullMode cullMode;
} WGPUPrimitiveState;

typedef struct WGPUMultisampleState {
    WGPUChainedStruct const* nextInChain;
    uint32_t count;
    uint32_t mask;
    bool alphaToCoverageEnabled;
} WGPUMultisampleState;

typedef struct WGPURenderPipelineDescriptor {
    WGPUChainedStruct const* nextInChain;
    const char* label;
    WGPUPipelineLayout layout;
    WGPUVertexState vertex;
    WGPUPrimitiveState primitive;
    const void* depthStencil;
    WGPUMultisampleState multisample;
    const WGPUFragmentState* fragment;
} WGPURenderPipelineDescriptor;

// =============================================================================
// Function declarations — matching Dawn's C API signatures
// =============================================================================
#ifdef __cplusplus
extern "C" {
#endif

void wgpuDeviceRelease(WGPUDevice device);
void wgpuBindGroupLayoutRelease(WGPUBindGroupLayout bindGroupLayout);
void wgpuRenderPipelineRelease(WGPURenderPipeline renderPipeline);
void wgpuBufferDestroy(WGPUBuffer buffer);
void wgpuBufferRelease(WGPUBuffer buffer);
void wgpuBindGroupRelease(WGPUBindGroup bindGroup);
void wgpuShaderModuleRelease(WGPUShaderModule shaderModule);
void wgpuCommandEncoderRelease(WGPUCommandEncoder commandEncoder);
void wgpuPipelineLayoutRelease(WGPUPipelineLayout pipelineLayout);

WGPUBindGroupLayout    wgpuDeviceCreateBindGroupLayout(WGPUDevice device, const WGPUBindGroupLayoutDescriptor* descriptor);
WGPUBuffer             wgpuDeviceCreateBuffer(WGPUDevice device, const WGPUBufferDescriptor* descriptor);
WGPUBindGroup          wgpuDeviceCreateBindGroup(WGPUDevice device, const WGPUBindGroupDescriptor* descriptor);
WGPUShaderModule       wgpuDeviceCreateShaderModule(WGPUDevice device, const WGPUShaderModuleDescriptor* descriptor);
WGPURenderPipeline     wgpuDeviceCreateRenderPipeline(WGPUDevice device, const WGPURenderPipelineDescriptor* descriptor);
WGPUPipelineLayout     wgpuDeviceCreatePipelineLayout(WGPUDevice device, const WGPUPipelineLayoutDescriptor* descriptor);

void wgpuQueueWriteBuffer(WGPUQueue queue, WGPUBuffer buffer, uint64_t bufferOffset, const void* data, size_t size);

#ifdef __cplusplus
}
#endif
