import React from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme/Theme';
import { useEnvironment } from '../context';
import { getThemeColors } from '../utils/themeColors';

interface ScreenWrapperProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    scrollable?: boolean;
    scroll?: boolean; // When provided, overrides scrollable. Pass scroll={false} to disable scrolling even when scrollable defaults to true.
    backgroundColor?: string;
    refreshControl?: React.ReactElement<import('react-native').RefreshControlProps>;
    style?: any;
    hasBottomTab?: boolean;
    noTopInset?: boolean;
}

export function useBottomTabPadding() {
    const insets = useSafeAreaInsets();
    // On web, the sidebar navigation has no bottom tab bar, so no padding is needed.
    if (Platform.OS === 'web') return 0;
    return 80 + insets.bottom;
}

export default function ScreenWrapper({
    children,
    title,
    showBack = false,
    scrollable = true,
    scroll,
    backgroundColor,
    refreshControl,
    style,
    hasBottomTab = false,
    noTopInset = false
}: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();
    const { isDark, temporalPhase } = useEnvironment();
    const colors = getThemeColors(isDark, temporalPhase);

    const safeAreaStyle = {
        paddingTop: noTopInset ? 0 : insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
    };

    const gradientColors = isDark
        ? [colors.primary, colors.secondary] // Deep indigo gradient
        : [colors.primary, colors.secondary]; // Light porcelain gradient

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.primary}
            />

            <View style={[styles.container, safeAreaStyle, { backgroundColor: backgroundColor || colors.primary }]}>
                {(scroll ?? scrollable) ? (
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={[
                            styles.contentContainer,
                            hasBottomTab && { paddingBottom: 80 + insets.bottom },
                            style
                        ]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={refreshControl}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View style={[styles.contentContainer, { flex: 1 }, style]}>
                        {children}
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        // Default View
    }
});
