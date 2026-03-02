import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
    ScreenWrapper,
    GlobalHeader,
    useThemedColors,
    Theme,
    Box,
    Text,
    FadeInDown
} from '@repo/ui';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';

/**
 * MapScreen — The Epistemic Universe of Gurudevi
 * 
 * This screen renders the knowledge nodes in a navigable 2D space.
 * Future implementation will use SVG + Skia for performance.
 */
export default function MapScreen() {
    const colors = useThemedColors();
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title="Knowledge Map"
                subtitle="The Trübe of Shared Wisdom"
                showBack
            />

            <Box sx={{ flex: 1, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.placeholder}>
                    <Search size={48} color={colors.textTertiary} />
                    <Text sx={{ marginTop: Theme.spacing.md, color: colors.textSecondary }}>
                        The Epistemic Map is assembling...
                    </Text>
                    <Text sx={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center', maxWidth: 250, marginTop: 8 }}>
                        Preparing the SVG topology and node-link resonance protocols.
                    </Text>
                </Animated.View>
            </Box>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        alignItems: 'center',
    }
});
