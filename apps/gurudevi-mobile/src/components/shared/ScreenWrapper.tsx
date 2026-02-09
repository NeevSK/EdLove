import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { IS_LOW_POWER_MODE } from '../../utils/DeviceUtils';
import { useColorScheme } from 'react-native';

interface ScreenWrapperProps {
    children: ReactNode;
    noPadding?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, noPadding = false }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    // Background Colors
    const bgColors = isDark
        ? [Theme.colors.voidIndigo, Theme.colors.deepIndigo, Theme.colors.midnightBlue] // Dark Mode: Deep Ocean
        : [Theme.colors.creamSilence, Theme.colors.lotusWhite, Theme.colors.sandStone]; // Light Mode: Porcelain

    return (
        <View style={styles.container}>
            {/* 1. Global Background */}
            {IS_LOW_POWER_MODE ? (
                // Low Power: Solid color
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? Theme.colors.voidIndigo : Theme.colors.creamSilence }]} />
            ) : (
                // High Power: Gradient Atmosphere
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

            {/* 3. Safe Area Content */}
            <View
                style={[
                    styles.content,
                    /* Apply top inset manually instead of SafeAreaView to allow background to bleed */
                    { paddingTop: insets.top, paddingBottom: 0 },
                    !noPadding && styles.defaultPadding
                ]}
            >
                {children}
            </View>
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
        paddingHorizontal: Theme.spacing.lg,
    },
});

export default ScreenWrapper;
