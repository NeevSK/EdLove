import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * useAccessibility Hook
 * 
 * Provides real-time access to the device's accessibility settings.
 * Useful for adapting UI/UX for screen readers and reduced motion preferences.
 */
export const useAccessibility = () => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
    const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

    useEffect(() => {
        // Handlers
        const handleScreenReaderChange = (enabled: boolean) => {
            setIsScreenReaderEnabled(enabled);
        };

        const handleReduceMotionChange = (enabled: boolean) => {
            setIsReduceMotionEnabled(enabled);
        };

        // Initial checks
        AccessibilityInfo.isScreenReaderEnabled().then(handleScreenReaderChange);
        AccessibilityInfo.isReduceMotionEnabled().then(handleReduceMotionChange);

        // Event Listeners
        const screenReaderSubscription = AccessibilityInfo.addEventListener(
            'screenReaderChanged',
            handleScreenReaderChange
        );

        const reduceMotionSubscription = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            handleReduceMotionChange
        );

        return () => {
            screenReaderSubscription.remove();
            reduceMotionSubscription?.remove();
        };
    }, []);

    /**
     * Post a string to be announced by the screen reader.
     * @param message The string to announce
     */
    const announce = (message: string) => {
        AccessibilityInfo.announceForAccessibility(message);
    };

    return {
        isScreenReaderEnabled,
        isReduceMotionEnabled,
        announce,
    };
};
