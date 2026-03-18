import React, { FC, useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { View, Pressable, StyleSheet, PanResponder, Dimensions, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    SharedValue,
    useSharedValue,
    Easing,
} from 'react-native-reanimated';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { hapticLight } from '../utils/haptics';
import { useAccessibility } from '../hooks/useAccessibility';
import { Wind } from 'lucide-react-native';
import { Box, VStack, HStack, Text } from '../gluestack';
import { UniversalModal } from './UniversalModal';
import { useBottomTabPadding } from './ScreenWrapper';
import { useFAB } from '../context/FABContext';

// ============================================================================
// TYPES
// ============================================================================

export type TabType = 'self' | 'classroom' | 'community' | 'library' | 'profile' | 'section' | 'grade' | 'principal' | 'founder';

export interface ActionItem {
    label: string;
    onPress: () => void;
    icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
}

interface LotusPetalFABProps {
    currentTab?: TabType;
    onPress?: () => void;
    icon?: React.ReactNode;
    actions?: ActionItem[];
    scrollY?: SharedValue<number>;
    disabled?: boolean;
    bottomInset?: number;
    hasActiveGaps?: boolean;
    gapPriority?: 'low' | 'medium' | 'high';
    onBreathingReset?: () => void;
    useGlobal?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FAB_SIZE = 56;
const ACTION_DRAWER_HEIGHT = Dimensions.get('window').height * 0.4;
const FAB_EDGE_MARGIN = Theme.spacing.lg;
const FAB_DRAG_THRESHOLD = 8;
const FAB_WEB_STORAGE_KEY = 'gurudevi_lotus_fab_position_v1';

const fabConfig: Record<TabType, { emoji: string; label: string }> = {
    self: { emoji: '🪷', label: 'Reflection' },
    classroom: { emoji: '➕', label: 'Add' },
    community: { emoji: '💬', label: 'Community' },
    library: { emoji: '📚', label: 'Library' },
    profile: { emoji: '👤', label: 'Profile' },
    section: { emoji: '🏢', label: 'Section' },
    grade: { emoji: '🏫', label: 'Grade' },
    principal: { emoji: '👑', label: 'Management' },
    founder: { emoji: '🏛️', label: 'Founder' }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LotusPetalFAB: FC<LotusPetalFABProps> = ({
    currentTab: propTab,
    onPress: propPress,
    icon: customIcon,
    actions: propActions,
    scrollY,
    disabled = false,
    bottomInset = Theme.spacing.lg,
    hasActiveGaps: propGaps,
    gapPriority: propPriority,
    onBreathingReset: propReset,
    useGlobal = true,
}) => {
    const { state: globalState } = useFAB();
    const { isReduceMotionEnabled } = useAccessibility();
    const bottomTabPadding = useBottomTabPadding();

    // Reconcile props with global state
    const currentTab = propTab || globalState.tabType;
    const actions = propActions || globalState.actions;
    const hasActiveGaps = propGaps ?? globalState.hasActiveGaps;
    const onPress = propPress || globalState.onPress;
    const onBreathingReset = propReset || globalState.onBreathingReset;
    const isVisible = useGlobal ? globalState.visible : true;
    const icon = customIcon || globalState.icon;

    const { isDark, accent } = useTheme();
    const config = useMemo(() => fabConfig[currentTab] || fabConfig.self, [currentTab]);

    // Reanimated Shared Values
    const pressScale = useSharedValue(1);
    const breathingScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);

    // Position Shared Values for Draggability
    const positionX = useSharedValue(0);
    const positionY = useSharedValue(0);
    const dragStartX = useRef(0);
    const dragStartY = useRef(0);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const clampFabToViewport = useCallback((x: number, y: number) => {
        const windowDims = Dimensions.get('window');
        const maxX = Math.max(FAB_EDGE_MARGIN, windowDims.width - FAB_SIZE - FAB_EDGE_MARGIN);
        const maxY = Math.max(
            FAB_EDGE_MARGIN,
            windowDims.height - FAB_SIZE - FAB_EDGE_MARGIN - (bottomInset + bottomTabPadding)
        );
        return {
            x: Math.max(FAB_EDGE_MARGIN, Math.min(maxX, x)),
            y: Math.max(FAB_EDGE_MARGIN, Math.min(maxY, y)),
        };
    }, [bottomInset, bottomTabPadding]);

    const persistWebPosition = useCallback((x: number, y: number) => {
        if (Platform.OS !== 'web') return;
        try {
            if (typeof window === 'undefined' || !window.localStorage) return;
            window.localStorage.setItem(FAB_WEB_STORAGE_KEY, JSON.stringify({ x, y }));
        } catch {
            // Ignore storage failures
        }
    }, []);

    const setDefaultPosition = useCallback(() => {
        const windowDims = Dimensions.get('window');
        const preferredX = windowDims.width - FAB_SIZE - FAB_EDGE_MARGIN;
        const preferredY = windowDims.height - FAB_SIZE - FAB_EDGE_MARGIN - (bottomInset + bottomTabPadding);
        const next = clampFabToViewport(preferredX, preferredY);
        positionX.value = next.x;
        positionY.value = next.y;
    }, [bottomInset, bottomTabPadding, clampFabToViewport, positionX, positionY]);

    useEffect(() => {
        let initialized = false;
        if (Platform.OS === 'web') {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const raw = window.localStorage.getItem(FAB_WEB_STORAGE_KEY);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
                            const next = clampFabToViewport(parsed.x, parsed.y);
                            positionX.value = next.x;
                            positionY.value = next.y;
                            initialized = true;
                        }
                    }
                }
            } catch {
                // Ignore and use default position
            }
        }

        if (!initialized) {
            setDefaultPosition();
        }
    }, [clampFabToViewport, positionX, positionY, setDefaultPosition]);

    useEffect(() => {
        const sub = Dimensions.addEventListener('change', () => {
            const next = clampFabToViewport(positionX.value, positionY.value);
            positionX.value = next.x;
            positionY.value = next.y;
            persistWebPosition(next.x, next.y);
        });
        return () => sub.remove();
    }, [clampFabToViewport, persistWebPosition, positionX, positionY]);

    // PanResponder for draggability
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gesture) => {
                return Math.abs(gesture.dx) > FAB_DRAG_THRESHOLD || Math.abs(gesture.dy) > FAB_DRAG_THRESHOLD;
            },
            onPanResponderGrant: () => {
                dragStartX.current = positionX.value;
                dragStartY.current = positionY.value;
                pressScale.value = withSpring(1.1);
                hapticLight();
            },
            onPanResponderMove: (_, gesture) => {
                const next = clampFabToViewport(
                    dragStartX.current + gesture.dx,
                    dragStartY.current + gesture.dy
                );
                positionX.value = next.x;
                positionY.value = next.y;
            },
            onPanResponderRelease: (_, gesture) => {
                pressScale.value = withSpring(1);

                // Tap
                if (Math.abs(gesture.dx) < FAB_DRAG_THRESHOLD && Math.abs(gesture.dy) < FAB_DRAG_THRESHOLD) {
                    handlePress();
                    return;
                }

                const next = clampFabToViewport(positionX.value, positionY.value);
                positionX.value = withSpring(next.x, Theme.motion.spring.gentle);
                positionY.value = withSpring(next.y, Theme.motion.spring.gentle);
                persistWebPosition(next.x, next.y);
            },
        })
    ).current;

    // Breathing Animation
    useEffect(() => {
        if (!disabled && !isReduceMotionEnabled) {
            breathingScale.value = withRepeat(
                withTiming(1.1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
            pulseOpacity.value = withRepeat(
                withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        }
    }, [disabled, isReduceMotionEnabled]);

    const containerStyle = useAnimatedStyle(() => ({
        left: positionX.value,
        top: positionY.value,
        transform: [
            { scale: pressScale.value }
        ],
    }));

    const breathingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breathingScale.value }],
        opacity: pulseOpacity.value,
    }));

    const handlePress = useCallback(() => {
        if (disabled) return;
        hapticLight();

        if (actions && actions.length > 0) {
            setIsDrawerVisible(true);
            return;
        }

        if (onPress) {
            pressScale.value = withSequence(
                withTiming(0.9, { duration: 100 }),
                withSpring(1)
            );
            onPress();
        }
    }, [disabled, onPress, actions]);

    const handleLongPress = useCallback(() => {
        if (disabled || !onBreathingReset) return;
        hapticLight();
        onBreathingReset();
    }, [disabled, onBreathingReset]);

    if (!isVisible) return null;

    return (
        <View style={styles.overlayContainer}>
            <Animated.View 
                {...panResponder.panHandlers}
                style={[styles.fabWrapper, containerStyle]}
            >
                {/* Breathing Glow */}
                <Animated.View style={[styles.glow, breathingStyle, hasActiveGaps && styles.glowActive]} />

                {/* Simple Circle */}
                <Box
                    sx={{
                        width: FAB_SIZE,
                        height: FAB_SIZE,
                        borderRadius: Theme.corners.full,
                        backgroundColor: accent.action,
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...(Platform.OS === 'web'
                            ? { boxShadow: `0 10px 24px ${Theme.colors.shadowAmbient}` }
                            : {
                                shadowColor: Theme.colors.shadowViolet,
                                shadowOpacity: 0.15,
                                shadowRadius: 15,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 12,
                            }),
                        borderWidth: 1.5,
                        borderColor: isDark ? Theme.colors.glass.dark.border : Theme.colors.glass.light.border,
                    }}
                >

                    {hasActiveGaps ? (
                        <Text style={styles.emojiText}>❗</Text>
                    ) : icon ? (
                        icon
                    ) : (
                        <Text style={styles.emojiText}>{config.emoji}</Text>
                    )}
                </Box>
            </Animated.View>

            {/* Simple Action Drawer Integration */}
            <UniversalModal
                isOpen={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsDrawerVisible(false)}
                >
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.shroud,
                            borderTopLeftRadius: Theme.corners.generous,
                            borderTopRightRadius: Theme.corners.generous,
                            padding: Theme.spacing.xl,
                            minHeight: ACTION_DRAWER_HEIGHT,
                            width: '100%',
                            marginTop: 'auto',
                        }}
                    >
                        <Box sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: Theme.colors.starlightGray,
                            borderRadius: 2,
                            alignSelf: 'center',
                            marginBottom: Theme.spacing.lg,
                            opacity: 0.3
                        }} />

                        <VStack sx={{ gap: '$md' as any }}>
                            <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$xl' as any, fontWeight: '600', marginBottom: '$2' as any }}>
                                {config.label} Actions
                            </Text>

                            {onBreathingReset && (
                                <Pressable
                                    onPress={() => {
                                        setIsDrawerVisible(false);
                                        onBreathingReset();
                                    }}
                                    style={({ pressed }) => [
                                        styles.actionItem,
                                        { backgroundColor: `${Theme.colors.sageGreen}1A` }, // 10% opacity
                                        pressed && { backgroundColor: `${Theme.colors.sageGreen}33` } // 20% opacity
                                    ]}
                                >
                                    <HStack alignItems="center" sx={{ gap: '$3' as any }}>
                                        <Wind size={20} color={Theme.colors.sageGreen} strokeWidth={2} />
                                        <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$md' as any, fontWeight: '600' }}>
                                            Breathing Reset
                                        </Text>
                                    </HStack>
                                </Pressable>
                            )}

                            {actions?.map((action, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => {
                                        setIsDrawerVisible(false);
                                        action.onPress();
                                    }}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={action.label}
                                    style={({ pressed }) => [
                                        styles.actionItem,
                                        pressed && { backgroundColor: `${Theme.colors.sacredWhite}0D` } // 5% opacity
                                    ]}
                                >
                                    <HStack alignItems="center" sx={{ gap: '$3' as any }}>
                                        {action.icon && <action.icon size={20} color={Theme.colors.sanctuarySaffron} strokeWidth={2} />}
                                        <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$md' as any }}>{action.label}</Text>
                                    </HStack>
                                </Pressable>
                            ))}
                        </VStack>
                    </Box>
                </Pressable>
            </UniversalModal>
        </View>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: Theme.zIndex.fab,
        pointerEvents: 'box-none' as any,
    },
    fabWrapper: {
        position: 'absolute',
        width: FAB_SIZE,
        height: FAB_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto' as any,
    },
    glow: {
        position: 'absolute',
        width: FAB_SIZE * 1.3,
        height: FAB_SIZE * 1.3,
        borderRadius: FAB_SIZE,
        backgroundColor: Theme.colors.sanctuarySaffron,
        opacity: 0.4,
    },
    glowActive: {
        backgroundColor: Theme.colors.lotusDeepPink,
        opacity: 0.6,
    },
    emojiText: {
        fontSize: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(107, 100, 128, 0.56)',
        justifyContent: 'flex-end',
    },
    actionItem: {
        paddingVertical: Theme.spacing.md,
        paddingHorizontal: Theme.spacing.sm,
        borderRadius: Theme.corners.comfortable,
    }
});

export default LotusPetalFAB;
