import React, { useMemo } from 'react';
import { StyleSheet, Dimensions, Pressable, ScrollView, Modal } from 'react-native';
import { Box, VStack, HStack, Text, Heading } from '@/ui';
import { X, Bell, Info } from 'lucide-react-native';
import Animated, {
    SlideInLeft,
    SlideOutLeft,
    Easing
} from 'react-native-reanimated';
import { Theme } from '../../constants/Theme';
import { useThemedColors } from '../../hooks/useThemedColors';
import { hapticLight } from '../../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.65;

interface NotificationDrawerProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function NotificationDrawer({ isVisible, onClose }: NotificationDrawerProps) {
    const colors = useThemedColors();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)', // Subtle dimming
                }}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        hapticLight();
                        onClose();
                    }}
                />

                <Animated.View
                    entering={SlideInLeft.duration(800).easing(Easing.out(Easing.exp))}
                    exiting={SlideOutLeft.duration(500)}
                    style={[
                        styles.drawer,
                        {
                            backgroundColor: colors.primary,
                            borderColor: colors.border,
                            paddingTop: insets.top,
                            paddingBottom: insets.bottom,
                        }
                    ]}
                >
                    <VStack space="md" sx={{ flex: 1, padding: Theme.spacing.lg }}>
                        <HStack justifyContent="space-between" alignItems="center" sx={{ height: 60 }}>
                            <HStack space="sm" alignItems="center">
                                <Bell size={24} color={colors.action} />
                                <Heading size="lg" color={colors.text}>Notifications</Heading>
                            </HStack>
                            <Pressable
                                onPress={() => { hapticLight(); onClose(); }}
                                hitSlop={10}
                            >
                                <X size={28} color={colors.textSecondary} />
                            </Pressable>
                        </HStack>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: Theme.spacing.xl }}
                        >
                            <VStack space="sm" mt="$4">
                                {[1, 2, 3].map((i) => (
                                    <Box key={i} sx={{
                                        padding: Theme.spacing.md,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.tertiary,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}>
                                        <HStack space="sm" alignItems="flex-start">
                                            <Box sx={{
                                                padding: 8,
                                                borderRadius: 20,
                                                backgroundColor: colors.secondary
                                            }}>
                                                <Info size={16} color={colors.action} />
                                            </Box>
                                            <VStack sx={{ flex: 1 }}>
                                                <Text color={colors.text} bold size="sm">
                                                    Update Available
                                                </Text>
                                                <Text color={colors.textSecondary} size="xs">
                                                    New learning modules have been added to your library.
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                ))}
                            </VStack>
                        </ScrollView>

                        <Text
                            color={colors.textTertiary}
                            size="xs"
                            textAlign="center"
                            sx={{ fontStyle: 'italic', marginBottom: Theme.spacing.sm }}
                        >
                            Your sanctuary stays updated.
                        </Text>
                    </VStack>
                </Animated.View>
            </Box>
        </Modal>
    );
}

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        borderRightWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    }
});
