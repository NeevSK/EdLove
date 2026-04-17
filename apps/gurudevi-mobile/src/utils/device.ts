/**
 * Device Detection Utilities
 * Detect device capabilities and adapt app behavior accordingly
 */

import * as Device from 'expo-device';

/**
 * Device Tier based on RAM and performance capabilities
 */
export type DeviceTier = 'low' | 'mid' | 'high';

/**
 * Device Configuration based on tier
 */
export interface DeviceConfig {
    tier: DeviceTier;
    enableAnimations: boolean;
    enableGradients: boolean;
    enableShadows: boolean;
    enableBlur: boolean;
    imageQuality: 'low' | 'medium' | 'high';
    maxConcurrentImages: number;
}

/**
 * Get device tier based on RAM
 * low: <2GB RAM
 * mid: 2-4GB RAM
 * high: >4GB RAM
 */
export function getDeviceTier(): DeviceTier {
    const totalMemory = Device.totalMemory ?? 0;
    const GB = 1024 * 1024 * 1024;

    if (totalMemory > 4 * GB) return 'high';
    if (totalMemory > 2 * GB) return 'mid';
    return 'low';
}

/**
 * Get device configuration based on tier
 * Low-end devices get reduced visual effects for better performance
 */
export function getDeviceConfig(tier?: DeviceTier): DeviceConfig {
    const deviceTier = tier || getDeviceTier();

    const configs: Record<DeviceTier, DeviceConfig>  = {
        low: {
            tier: 'low',
            enableAnimations: false,        // Disable to save CPU
            enableGradients: false,          // Use solid colors
            enableShadows: false,            // Flat design
            enableBlur: false,               // Heavy on GPU
            imageQuality: 'low',
            maxConcurrentImages: 5},
        mid: {
            tier: 'mid',
            enableAnimations: true,
            enableGradients: true,
            enableShadows: true,
            enableBlur: false,               // Still heavy
            imageQuality: 'medium',
            maxConcurrentImages: 10},
        high: {
            tier: 'high',
            enableAnimations: true,
            enableGradients: true,
            enableShadows: true,
            enableBlur: true,
            imageQuality: 'high',
            maxConcurrentImages: 20}
    };

    return configs[deviceTier];
}

/**
 * Get device info for debugging/analytics
 */
export async function getDeviceInfo() {
    const tier = getDeviceTier();

    return {
        tier,
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        totalMemory: Device.totalMemory,
        supportedCpuArchitectures: Device.supportedCpuArchitectures};
}

/**
 * Log device info to console (development only)
 */
export async function logDeviceInfo() {
    if (__DEV__) {
        const info = await getDeviceInfo();
        console.log('=== Device Info ===');
        console.log(`Tier: ${info.tier}`);
        console.log(`Device: ${info.manufacturer} ${info.modelName}`);
        console.log(`OS: ${info.osName} ${info.osVersion}`);
        console.log(`RAM: ${info.totalMemory ? `${(info.totalMemory / (1024 * 1024 * 1024)).toFixed(1)}GB` : 'Unknown'}`);
        console.log('===================');
    }
}
