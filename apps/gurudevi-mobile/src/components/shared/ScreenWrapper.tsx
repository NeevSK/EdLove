import React, { ReactNode, useMemo } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { useEnvironment } from '../../context';
import { getThemeColors } from '../../utils/themeColors';

interface ScreenWrapperProps {
    children: ReactNode;
    noPadding?: boolean;
    scroll?: boolean;
    keyboardAvoiding?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    noPadding = false,
    scroll = false,
    keyboardAvoiding = true
}) => {
    const { isDark, temporalPhase, effectiveFidelity } = useEnvironment();
    const colors = getThemeColors(isDark, temporalPhase);
    const insets = useSafeAreaInsets();
    const isLowFidelity = effectiveFidelity === 'low';

    // Background Gradient based on theme engine
    const bgColors = useMemo(() => {
        // Preference for Sky Blue dominant backgrounds
        if (temporalPhase === 'dawn' || temporalPhase === 'day') {
            return isDark
                ? ['#0F172A', '#1E293B', '#1E293B'] // Darker Sky/Void Blue
                : ['#E0F7FF', '#F0F9FF', '#F0F9FF']; // Pure Sky Blue light mode
        }

        return [colors.primary, colors.secondary, colors.tertiary];
    }, [colors, isDark, temporalPhase]);

    const content = (
        <View
            style={[
                styles.content,
                /* Apply top inset manually to allow background to bleed under status bar */
                { paddingTop: insets.top, paddingBottom: insets.bottom },
                !noPadding && styles.defaultPadding
            ]}
        >
            {children}
        </View>
    );

    const mainContent = scroll ? (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            {content}
        </ScrollView>
    ) : content;

    return (
        <View style={[styles.container, { backgroundColor: colors.primary }]}>
            {/* 1. Global Background Atmosphere */}
            {isLowFidelity ? (
                // Efficiency Mode: Solid color
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
            ) : (
                // Sanctuary Mode: Gradient Atmosphere
                <LinearGradient
                    colors={bgColors as [string, string, string]}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* 2. Status Bar Control */}
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            {/* 3. Safe Area & Layout Control */}
            {keyboardAvoiding ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    {mainContent}
                </KeyboardAvoidingView>
            ) : mainContent}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    defaultPadding: {
        paddingHorizontal: Theme.spacing.md,
    },
});

export default ScreenWrapper;
