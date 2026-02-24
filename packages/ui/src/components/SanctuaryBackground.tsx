/**
 * SanctuaryBackground
 *
 * The living backdrop of the app. Rendered ONCE at TabNavigator level,
 * behind all tab screens (which are transparent over it).
 *
 * High/Mid: Animated gradient mesh — 2 LinearGradient layers crossfading.
 * Low/Battery: Static LinearGradient snapshot — same palette, zero animation cost.
 *
 * Phase transitions: 2s crossfade between palettes.
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

export function SanctuaryBackground() {
    const { gradientNodes, animationsEnabled, phase } = useTheme();

    // Two gradient layers for crossfade transition
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const prevNodes = useRef<[string, string, string]>(gradientNodes);
    const currentNodes = useRef<[string, string, string]>(gradientNodes);

    useEffect(() => {
        if (!animationsEnabled) {
            // Static — just update immediately
            prevNodes.current = gradientNodes;
            currentNodes.current = gradientNodes;
            fadeAnim.setValue(1);
            return;
        }

        // Crossfade: prev layer stays, new layer fades in over 2s
        prevNodes.current = currentNodes.current;
        currentNodes.current = gradientNodes;

        fadeAnim.setValue(0);
        const animation = Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        });
        animation.start();

        return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]); // Re-run only when phase changes.
    // Note: isDark theme-mode toggles do NOT trigger a crossfade here by design —
    // they take effect at the next phase boundary.

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {/* Layer 0: Previous phase (fades out) */}
            <LinearGradient
                colors={prevNodes.current}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            {/* Layer 1: Current phase (fades in) */}
            <Animated.View
                style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
                pointerEvents="none"
            >
                <LinearGradient
                    colors={currentNodes.current}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>
        </View>
    );
}
