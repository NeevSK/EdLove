/**
 * FIRE JOURNAL
 * "Burn" negative thoughts - A cathartic release mechanism
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Input,
    InputField,
    Button,
    ButtonText,
    Theme,
    typography,
    hapticLight,
    hapticMedium,
    SkeletonCard,
    SkeletonLoader,
    PositiveInvitation
} from '@repo/ui';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    FadeIn,
} from 'react-native-reanimated';
import { Mic, Flame } from 'lucide-react-native';
import { usePermissions, useTemporalStore } from '@repo/core';
import { useFireJournal } from '../hooks/useFireJournal';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

interface FireJournalProps {
    userId?: string;
    onBurned?: () => void;
    disabled?: boolean;
}

export default function FireJournal({ userId, onBurned, disabled }: FireJournalProps) {
    const navigation = useNavigation<any>();
    const [content, setContent] = useState('');
    const [isBurning, setIsBurning] = useState(false);
    const { context } = usePermissions();
    const activeUserId = userId || context.userId;
    const isPastView = useTemporalStore(state => state.isPastView);
    const { journalHistory, burnEntry, isLoading } = useFireJournal(activeUserId ?? undefined);
    const [showSuccess, setShowSuccess] = useState(false);
    const [burnError, setBurnError] = useState<string | null>(null);
    const { t } = useTranslation();

    // Refs for timeout cleanup
    const burnTimeoutRef = useRef<any>(undefined);
    const successTimeoutRef = useRef<any>(undefined);

    // Animation values
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);

    // Ember particles animation values
    const ember1Y = useSharedValue(0);
    const ember2Y = useSharedValue(0);
    const ember3Y = useSharedValue(0);
    const ember1Opacity = useSharedValue(0);
    const ember2Opacity = useSharedValue(0);
    const ember3Opacity = useSharedValue(0);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (burnTimeoutRef.current) clearTimeout(burnTimeoutRef.current);
            if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        };
    }, []);

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { scale: scale.value },
                { translateY: translateY.value },
                { rotate: `${rotation.value}deg` },
            ] as any,
        };
    });

    const ember1Style = useAnimatedStyle(() => ({
        opacity: ember1Opacity.value,
        transform: [{ translateY: ember1Y.value }] as any,
    }));

    const ember2Style = useAnimatedStyle(() => ({
        opacity: ember2Opacity.value,
        transform: [{ translateY: ember2Y.value }] as any,
    }));

    const ember3Style = useAnimatedStyle(() => ({
        opacity: ember3Opacity.value,
        transform: [{ translateY: ember3Y.value }] as any,
    }));

    const handleBurn = async () => {
        if (!content.trim() || !activeUserId || isPastView) return;

        hapticMedium();
        setBurnError(null);
        setIsBurning(true); 

        performBurnAnimation();

        try {
            await burnEntry(content);
        } catch (error) {
            console.error('Failed to burn journal entry:', error);
            setBurnError(t('fireJournal.errorSaving') || 'We could not save this release safely.');
        }
    };

    const performBurnAnimation = () => {
        opacity.value = withSequence(
            withTiming(1.2, { duration: 100 }),
            withTiming(0.8, { duration: 300, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 700, easing: Easing.in(Easing.ease) })
        );

        scale.value = withSequence(
            withTiming(1.05, { duration: 100 }),
            withTiming(0.95, { duration: 300 }),
            withTiming(0.7, { duration: 700 })
        );

        translateY.value = withSequence(
            withTiming(0, { duration: 400 }),
            withTiming(-100, { duration: 700, easing: Easing.out(Easing.ease) })
        );

        rotation.value = withSequence(
            withTiming(0, { duration: 400 }),
            withTiming(5, { duration: 350 }),
            withTiming(-5, { duration: 350 })
        );

        ember1Opacity.value = withSequence(
            withTiming(0.8, { duration: 100 }),
            withTiming(0, { duration: 1200 })
        );
        ember1Y.value = withTiming(-150, { duration: 1300, easing: Easing.out(Easing.ease) });

        ember2Opacity.value = withSequence(
            withTiming(0, { duration: 200 }), 
            withTiming(0.9, { duration: 100 }),
            withTiming(0, { duration: 1100 })
        );
        ember2Y.value = withTiming(-180, { duration: 1400, easing: Easing.out(Easing.ease) });

        ember3Opacity.value = withSequence(
            withTiming(0, { duration: 300 }), 
            withTiming(0.7, { duration: 100 }),
            withTiming(0, { duration: 1000 })
        );
        ember3Y.value = withTiming(-160, { duration: 1400, easing: Easing.out(Easing.ease) });

        burnTimeoutRef.current = setTimeout(() => {
            resetAfterBurn();
        }, 1500);
    };

    const resetAfterBurn = () => {
        setContent('');
        setIsBurning(false);
        setShowSuccess(true);

        opacity.value = withSpring(1);
        scale.value = withSpring(1);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);

        ember1Y.value = 0;
        ember2Y.value = 0;
        ember3Y.value = 0;
        ember1Opacity.value = 0;
        ember2Opacity.value = 0;
        ember3Opacity.value = 0;

        successTimeoutRef.current = setTimeout(() => {
            setShowSuccess(false);
            onBurned?.();
        }, 2000);
    };

    if (isLoading && activeUserId) {
        return (
            <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                <SkeletonCard height={40} />
                <SkeletonCard height={200} />
                <HStack space="md" sx={{ justifyContent: 'flex-end' }}>
                    <SkeletonLoader width={48} height={48} borderRadius={24} />
                    <SkeletonLoader width={100} height={48} borderRadius={24} />
                </HStack>
            </VStack>
        );
    }

    if (!activeUserId) {
        return (
            <PositiveInvitation
                type="guest"
                onAction={() => navigation.navigate('Auth' as never)}
            />
        );
    }

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            <VStack space="xs">
                <Heading sx={{ color: Theme.colors.sacredWhite }} size="lg">
                    {t('fireJournal.title') || 'Fire Journal'}
                </Heading>
                <Text sx={{ color: Theme.colors.mistGray }} size="sm">
                    {isPastView ? t('fireJournal.pastRecord') || 'Historical Release' : t('fireJournal.subtitle') || 'Release what no longer serves you.'}
                </Text>
            </VStack>

            {showSuccess && (
                <Animated.View entering={FadeIn.duration(Theme.motion.quick)}>
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.sageGreen,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.comfortable,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            sx={{ color: Theme.colors.obsidian, fontWeight: '600' }}
                            size="md"
                        >
                            {t('fireJournal.released') || 'Released to the winds.'}
                        </Text>
                    </Box>
                </Animated.View>
            )}

            {burnError && (
                <Box
                    sx={{
                        backgroundColor: Theme.colors.emberRed,
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <Text sx={{ color: Theme.colors.sacredWhite, textAlign: 'center' }} size="sm">
                        {burnError}
                    </Text>
                </Box>
            )}

            <Box sx={{ position: 'relative' }}>
                {isBurning && (
                    <React.Fragment>
                        <Animated.View
                            style={[
                                ember1Style,
                                {
                                    position: 'absolute',
                                    left: '20%',
                                    top: 100,
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: Theme.colors.emberRed,
                                    zIndex: 10,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                ember2Style,
                                {
                                    position: 'absolute',
                                    left: '50%',
                                    top: 80,
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    zIndex: 10,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                ember3Style,
                                {
                                    position: 'absolute',
                                    left: '70%',
                                    top: 110,
                                    width: 7,
                                    height: 7,
                                    borderRadius: 3.5,
                                    backgroundColor: Theme.colors.amberGlow,
                                    zIndex: 10,
                                },
                            ]}
                        />
                    </React.Fragment>
                )}

                <Animated.View style={containerStyle}>
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.ink,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.md,
                            minHeight: 200,
                        }}
                    >
                        <Input
                            variant="outline"
                            size="md"
                            sx={{
                                borderWidth: 0,
                                flex: 1,
                            }}
                            isDisabled={isBurning || isPastView}
                        >
                            <InputField
                                placeholder={isPastView ? (journalHistory.length > 0 ? '' : t('fireJournal.noPastRecord')) : t('fireJournal.placeholder') || 'Write it down, then burn it...'}
                                multiline
                                value={isPastView ? (journalHistory[0]?.content_preview || '') : content}
                                onChangeText={setContent}
                                sx={{
                                    color: Theme.colors.sacredWhite,
                                    textAlignVertical: 'top',
                                    fontSize: typography.fontSize.lg,
                                    lineHeight: 28,
                                    minHeight: 160,
                                }}
                                placeholderTextColor={Theme.colors.dimGray}
                            />
                        </Input>
                    </Box>
                </Animated.View>
            </Box>

            <HStack space="md" sx={{ justifyContent: 'flex-end' }}>
                <Button
                    size="md"
                    onPress={hapticLight}
                    isDisabled={isBurning}
                    sx={{
                        borderRadius: Theme.corners.full,
                        width: 48,
                        height: 48,
                        backgroundColor: Theme.colors.ink,
                    }}
                >
                    <Mic color={Theme.colors.sanctuarySaffron} size={20} />
                </Button>

                <Button
                    size="md"
                    onPress={handleBurn}
                    isDisabled={!content.trim() || isBurning || isPastView}
                    sx={{
                        borderRadius: Theme.corners.full,
                        backgroundColor: isBurning
                            ? Theme.colors.emberRed
                            : Theme.colors.sanctuarySaffron,
                        paddingHorizontal: Theme.spacing.lg,
                    }}
                >
                    <Flame
                        color={Theme.colors.sacredWhite}
                        size={20}
                        style={{ marginRight: 8 }}
                    />
                    <ButtonText sx={{ color: Theme.colors.sacredWhite }}>
                        {isPastView ? t('fireJournal.historical') || 'Past Release' : (isBurning ? t('fireJournal.burning') || 'Burning...' : t('fireJournal.burn') || 'Burn and Release')}
                    </ButtonText>
                </Button>
            </HStack>

            <VStack space="sm">
                <Box
                    sx={{
                        backgroundColor: Theme.colors.ink,
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <Text sx={{ color: Theme.colors.mistGray, textAlign: 'center' }} size="xs">
                        {t('fireJournal.privacy') || 'Your words are for you alone. They are never shared or stored beyond this moment of release.'}
                    </Text>
                </Box>

                <Box
                    sx={{
                        padding: Theme.spacing.sm,
                    }}
                >
                    <Text
                        sx={{ color: Theme.colors.dimGray, textAlign: 'center', fontStyle: 'italic' }}
                        size="xs"
                    >
                        {t('fireJournal.guidance') || 'GuruDevi: "Let the smoke carry away the weight of what you cannot change."'}
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
}
