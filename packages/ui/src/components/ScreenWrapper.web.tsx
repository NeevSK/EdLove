import React from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEnvironment } from '../context';
import { getThemeColors } from '../utils/themeColors';

interface ScreenWrapperProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    scrollable?: boolean;
    scroll?: boolean;
    backgroundColor?: string;
    refreshControl?: React.ReactElement<import('react-native').RefreshControlProps>;
    style?: any;
    hasBottomTab?: boolean;
}

export function useBottomTabPadding() {
    // On web, we use a sidebar, so bottom padding for a tab bar is unnecessary.
    return 0;
}

/**
 * ScreenWrapper.web.tsx — High-fidelity web implementation
 * 
 * Unlike the native version, this implementation:
 * 1. Restores native browser scrollbars (showsVerticalScrollIndicator={true}).
 * 2. Removes KeyboardAvoidingView overhead which is unnecessary on desktop.
 * 3. Optimizes scroll behavior for mouse/touchpad interaction.
 */
export default function ScreenWrapper({
    children,
    scrollable = true,
    scroll,
    style,
    refreshControl,
    hasBottomTab = false
}: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();
    const { isDark, temporalPhase } = useEnvironment();
    const colors = getThemeColors(isDark, temporalPhase);

    const isScrollable = scroll ?? scrollable;

    return (
        <View style={styles.container}>
            {isScrollable ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.contentContainer,
                        style
                    ]}
                    // High-fidelity fix: show scrollbars on web for better spatial awareness (System 2 resonance)
                    showsVerticalScrollIndicator={true}
                    refreshControl={refreshControl}
                    scrollEventThrottle={16}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.contentContainer, styles.flex1, style]}>
                    {children}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        // Shared base styles
    },
    flex1: {
        flex: 1,
    }
});
