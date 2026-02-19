import * as Device from 'expo-device';
import { Platform } from 'react-native';

export enum PerformanceTier {
    HIGH = 'HIGH',
    MID = 'MID',
    LOW = 'LOW',
}

/**
 * Heuristic to determine device performance tier
 * This can be refined with specific device model checks
 */
export const getDeviceTier = (): PerformanceTier => {
    // 1. Simulators/Emulators are treated as High (for dev)
    if (!Device.isDevice) return PerformanceTier.HIGH;

    // 2. iOS Devices
    if (Platform.OS === 'ios') {
        const modelId = Device.modelId;
        // iPhone 11 (iPhone12,1) or newer is High
        // Older iPhones are Mid/Low
        // This is a simplified check
        if (modelId && modelId.startsWith('iPhone')) {
            const version = parseInt(modelId.replace('iPhone', '').split(',')[0], 10);
            if (version >= 12) return PerformanceTier.HIGH; // iPhone 11+
            if (version >= 10) return PerformanceTier.MID;  // iPhone 8/X/XS
            return PerformanceTier.LOW;
        }
        return PerformanceTier.HIGH; // Default for newer iPads/unknown
    }

    // 3. Android Devices
    if (Platform.OS === 'android') {
        // Use total memory as a proxy for performance
        // Device.totalMemory is in bytes
        const totalMemory = Device.totalMemory;

        // > 6GB RAM -> High
        if (totalMemory && totalMemory > 6 * 1024 * 1024 * 1024) return PerformanceTier.HIGH;

        // > 4GB RAM -> Mid
        if (totalMemory && totalMemory > 4 * 1024 * 1024 * 1024) return PerformanceTier.MID;

        // <= 4GB RAM -> Low
        return PerformanceTier.LOW;
    }

    // Fallback
    return PerformanceTier.MID;
};

export const DEVICE_TIER = getDeviceTier();
export const IS_LOW_POWER_MODE = DEVICE_TIER === PerformanceTier.LOW;
