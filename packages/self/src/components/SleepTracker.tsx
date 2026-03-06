/**
 * SLEEP TRACKER
 * Morning check-in: "How was your sleep?"
 * Simple, gentle way to track sleep quality
 * 
 * Philosophy:
 * - Asked only in the morning (5am - 11am)
 * - Simple scale (1-5) with meaningful labels
 * - No pressure, just awareness
 * - Helps teachers understand rest patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Button,
    ButtonText,
} from '@repo/ui';
import { supabase } from '@repo/core';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Moon, Sun, Cloud, Stars } from 'lucide-react-native';
import { Theme, typography } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useSafeMutation } from '@repo/core';
import { useSleepTracker } from '../hooks/useSleepTracker';
import { useTranslation } from 'react-i18next';

interface SleepTrackerProps {
    userId?: string;
}

export default function SleepTracker({ userId }: SleepTrackerProps) {
    // Resilient Data Hook
    const { sleepLogs, refreshData } = useSleepTracker(userId);
    const { t, i18n } = useTranslation();

    const [sleepQuality, setSleepQuality] = useState(3);
    const [hasLoggedToday, setHasLoggedToday] = useState(false);

    // Animation values
    const moonScale = useSharedValue(1);
    const starsOpacity = useSharedValue(0.6);

    const SLEEP_QUALITY = useMemo(() => [
        { value: 1, label: t('sleepTracker.restless'), emoji: '😰', color: Theme.colors.emberRed, description: t('sleepTracker.restlessDesc') },
        { value: 2, label: t('sleepTracker.poor'), emoji: '😔', color: Theme.colors.amberGlow, description: t('sleepTracker.poorDesc') },
        { value: 3, label: t('sleepTracker.okay'), emoji: '😐', color: Theme.colors.mistGray, description: t('sleepTracker.okayDesc') },
        { value: 4, label: t('sleepTracker.good'), emoji: '😊', color: Theme.colors.sageGreen, description: t('sleepTracker.goodDesc') },
        { value: 5, label: t('sleepTracker.excellent'), emoji: '😌', color: Theme.colors.sanctuarySaffron, description: t('sleepTracker.excellentDesc') },
    ], [i18n.resolvedLanguage]);

    const currentQuality = SLEEP_QUALITY[sleepQuality - 1] || SLEEP_QUALITY[2];

    const checkTodayLog = () => {
        if (!sleepLogs.length) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLog = sleepLogs.find(log => new Date(log.created_at) >= today);

        if (todayLog) {
            setHasLoggedToday(true);
            setSleepQuality(todayLog.quality);
        }
    };

    useEffect(() => {
        if (userId) {
            checkTodayLog();
        }

        // Gentle breathing animation
        moonScale.value = withRepeat(
            withTiming(1.1, {
                duration: 3000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        starsOpacity.value = withRepeat(
            withTiming(1, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [userId]);

    // Check if logged today based on hook data
    useEffect(() => {
        if (!userId || !sleepLogs.length) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLog = sleepLogs.find(log => new Date(log.created_at) >= today);

        if (todayLog) {
            setHasLoggedToday(true);
            setSleepQuality(todayLog.quality);
        }
    }, [sleepLogs, userId]);

    const { mutate: saveLog, isLoading: isSaving } = useSafeMutation(
        async (quality: number) => {
            const { error } = await supabase
                .from('sleep_logs')
                .insert([
                    {
                        user_id: userId,
                        quality: quality,
                        created_at: new Date().toISOString(),
                    },
                ]);
            if (error) throw error;
        },
        {
            onSuccess: () => {
                hapticSuccess();
                setHasLoggedToday(true);
                refreshData();
            }
        }
    );

    const saveSleepLog = async () => {
        if (!userId) return;
        hapticLight();
        await saveLog(sleepQuality);
    };

    const moonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: moonScale.value }],
    }));

    const starsStyle = useAnimatedStyle(() => ({
        opacity: starsOpacity.value,
    }));

    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 11;

    if (!isMorning && !hasLoggedToday) {
        return (
            <VStack space="lg" sx={{ padding: Theme.spacing.lg, alignItems: 'center' }}>
                <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                    Sleep tracking is available in the morning (5am - 11am)
                </Text>
                <Text style={{ fontSize: 48 }}>🌙</Text>
            </VStack>
        );
    }

    // Loading state removed as we show UI optimistically or empty state

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            {/* Header */}
            <VStack space="xs">
                <Heading color={Theme.colors.sacredWhite} size="lg">
                    {t('sleepTracker.title')}
                </Heading>
                <Text color={Theme.colors.mistGray} size="sm">
                    Understanding your rest helps you care for yourself
                </Text>
            </VStack>

            {/* Sleep visualization */}
            <Box
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: Theme.spacing.xl,
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: 200,
                    position: 'relative',
                }}
            >
                {/* Animated stars */}
                <Animated.View
                    style={[
                        starsStyle,
                        {
                            position: 'absolute',
                            top: 20,
                            right: 30,
                        },
                    ]}
                >
                    <Stars color={Theme.colors.twilightBlue} size={24} />
                </Animated.View>

                {/* Moon/Sun based on quality */}
                <Animated.View style={moonStyle}>
                    <Text style={{ fontSize: 96 }}>
                        {currentQuality?.emoji}
                    </Text>
                </Animated.View>

                <Text
                    color={currentQuality?.color}
                    size="2xl"
                    sx={{
                        fontWeight: typography.fontWeight.semibold,
                        marginTop: Theme.spacing.md,
                    }}
                >
                    {currentQuality?.label}
                </Text>
                <Text
                    color={Theme.colors.mistGray}
                    size="sm"
                    sx={{ fontStyle: 'italic' }}
                >
                    {currentQuality?.description}
                </Text>
            </Box>

            {/* Slider */}
            {!hasLoggedToday && (
                <>
                    <Box sx={{ paddingHorizontal: Theme.spacing.md }}>
                        <Slider
                            value={sleepQuality}
                            onChange={(value: number) => {
                                hapticLight();
                                setSleepQuality(value);
                            }}
                            minValue={1}
                            maxValue={5}
                            step={1}
                            size="lg"
                            orientation="horizontal"
                        >
                            <SliderTrack sx={{ height: 12, borderRadius: 6, backgroundColor: Theme.colors.ink }}>
                                <SliderFilledTrack
                                    sx={{
                                        backgroundColor: currentQuality?.color,
                                    }}
                                />
                            </SliderTrack>
                            <SliderThumb
                                sx={{
                                    backgroundColor: currentQuality?.color,
                                    borderWidth: 4,
                                    borderColor: Theme.colors.sacredWhite,
                                    width: 36,
                                    height: 36,
                                }}
                            />
                        </Slider>

                        {/* Labels */}
                        <HStack
                            justifyContent="space-between"
                            sx={{ marginTop: Theme.spacing.md }}
                        >
                            <Text color={Theme.colors.dimGray} size="xs">
                                {t('sleepTracker.restless')}
                            </Text>
                            <Text color={Theme.colors.dimGray} size="xs">
                                {t('sleepTracker.excellent')}
                            </Text>
                        </HStack>
                    </Box>

                    {/* Save button */}
                    <Button
                        size="lg"
                        onPress={saveSleepLog}
                        isDisabled={isSaving}
                        sx={{
                            borderRadius: Theme.corners.full,
                            backgroundColor: currentQuality?.color,
                        }}
                    >
                        <ButtonText>
                            {isSaving ? t('common.loading') : t('sleepTracker.logButton')}
                        </ButtonText>
                    </Button>
                </>
            )}

            {hasLoggedToday && (
                <Box
                    sx={{
                        padding: Theme.spacing.md,
                        backgroundColor: Theme.colors.ink,
                        borderRadius: Theme.corners.comfortable,
                        alignItems: 'center',
                    }}
                >
                    <Text color={Theme.colors.sageGreen} size="md">
                        ✓ {t('sleepTracker.alreadyLogged')}
                    </Text>
                    <Text color={Theme.colors.mistGray} size="xs" sx={{ marginTop: Theme.spacing.xs }}>
                        You can update tomorrow morning
                    </Text>
                </Box>
            )}

            {/* Info */}
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                }}
            >
                <Text
                    color={Theme.colors.mistGray}
                    size="xs"
                    textAlign="center"
                    sx={{ fontStyle: 'italic' }}
                >
                    💤 Rest is sacred. Your wellbeing matters.
                </Text>
            </Box>
        </VStack>
    );
}
