/**
 * FIRE JOURNAL
 * "Burn" negative thoughts - A cathartic release mechanism
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
    Box, 
    Button, 
    ButtonText, 
    HStack, 
    Heading, 
    Input, 
    InputField, 
    PositiveInvitation, 
    SkeletonCard, 
    Text, 
    VStack,
    Icon,
    hapticLight, 
    hapticMedium
} from '@repo/ui';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    FadeIn
} from 'react-native-reanimated';
import { Mic, Flame, CheckCircle } from 'lucide-react-native';
import { usePermissions, useTemporalStore } from '@repo/core';
import { useFireJournal } from '../hooks/useFireJournal';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

interface FireJournalProps {
    userId?: string;
    onBurned?: () => void;
    disabled?: boolean;
}

export default function FireJournal({ userId, onBurned, disabled: componentDisabled }: FireJournalProps) {
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
    const burnTimeoutRef = useRef<NodeJS.Timeout>();
    const successTimeoutRef = useRef<NodeJS.Timeout>();

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

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
            { rotate: `${rotation.value}deg` },
        ]
    }));

    const ember1Style = useAnimatedStyle(() => ({
        opacity: ember1Opacity.value,
        transform: [{ translateY: ember1Y.value }]
    }));

    const ember2Style = useAnimatedStyle(() => ({
        opacity: ember2Opacity.value,
        transform: [{ translateY: ember2Y.value }]
    }));

    const ember3Style = useAnimatedStyle(() => ({
        opacity: ember3Opacity.value,
        transform: [{ translateY: ember3Y.value }]
    }));

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

    const handleBurn = async () => {
        if (!content.trim() || !activeUserId || isPastView || componentDisabled) return;

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

    if (isLoading && activeUserId) {
        return (
            <VStack className="p-lg gap-lg">
                <SkeletonCard height={40} />
                <SkeletonCard height={200} />
                <HStack className="justify-end gap-md">
                    <Box className="w-12 h-12 rounded-full bg-obsidian animate-pulse" />
                    <Box className="w-[120px] h-12 rounded-full bg-obsidian animate-pulse" />
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
        <VStack className="p-lg gap-lg">
            <VStack className="gap-1">
                <Heading className="text-sacredWhite" size="lg">
                    {t('fireJournal.title') || 'Fire Journal'}
                </Heading>
                <Text className="text-mistGray text-sm">
                    {isPastView ? t('fireJournal.pastRecord') || 'Historical Release' : t('fireJournal.subtitle') || 'Release what no longer serves you.'}
                </Text>
            </VStack>

            {showSuccess && (
                <Animated.View entering={FadeIn}>
                    <Box className="bg-emeraldGreen/10 p-md rounded-comfortable items-center border border-emeraldGreen/20">
                        <HStack className="items-center gap-2">
                            <Icon as={CheckCircle} className="text-emeraldGreen" size={16} />
                            <Text className="text-emeraldGreen font-semibold text-md">
                                {t('fireJournal.released') || 'Released to the winds.'}
                            </Text>
                        </HStack>
                    </Box>
                </Animated.View>
            )}

            {burnError && (
                <Box className="bg-emberRed/10 p-md rounded-comfortable border border-emberRed/20">
                    <Text className="text-emberRed text-center text-sm">
                        {burnError}
                    </Text>
                </Box>
            )}

            <Box className="relative">
                {isBurning && (
                    <>
                        <Animated.View
                            style={[ember1Style]}
                            className="absolute left-[20%] top-[100px] w-2 h-2 rounded-full bg-emberRed z-10"
                        />
                        <Animated.View
                            style={[ember2Style]}
                            className="absolute left-[50%] top-[80px] w-1.5 h-1.5 rounded-full bg-sanctuarySaffron z-10"
                        />
                        <Animated.View
                            style={[ember3Style]}
                            className="absolute left-[70%] top-[110px] w-2 h-2 rounded-full bg-goldenApricot z-10"
                        />
                    </>
                )}

                <Animated.View style={containerStyle}>
                    <Box className="bg-obsidian rounded-comfortable p-md min-h-[200px] border border-white/5">
                        <Input
                            variant="outline"
                            className="border-0 flex-1"
                            isDisabled={isBurning || isPastView}
                        >
                            <InputField
                                placeholder={isPastView ? (journalHistory.length > 0 ? '' : t('fireJournal.noPastRecord')) : t('fireJournal.placeholder') || 'Write it down, then burn it...'}
                                multiline
                                value={isPastView ? (journalHistory[0]?.content_preview || '') : content}
                                onChangeText={setContent}
                                className="text-sacredWhite text-lg leading-relaxed min-h-[160px]"
                                placeholderTextColor="#6A6358"
                                textAlignVertical="top"
                            />
                        </Input>
                    </Box>
                </Animated.View>
            </Box>

            <HStack className="justify-end gap-md">
                <Button
                    size="md"
                    onPress={hapticLight}
                    isDisabled={isBurning}
                    className="rounded-full w-12 h-12 bg-obsidian border border-white/5 items-center justify-center"
                >
                    <Icon as={Mic} className="text-sanctuarySaffron" size={20} />
                </Button>

                <Button
                    size="md"
                    onPress={handleBurn}
                    isDisabled={!content.trim() || isBurning || isPastView}
                    className={`rounded-full px-lg h-12 flex-row items-center ${isBurning ? 'bg-emberRed' : 'bg-sanctuarySaffron'}`}
                >
                    <Icon as={Flame} className="text-white mr-2" size={20} />
                    <ButtonText className="text-white font-bold">
                        {isPastView ? t('fireJournal.historical') || 'Past Release' : (isBurning ? (t('fireJournal.burning') || 'Burning...') : (t('fireJournal.burn') || 'Burn and Release'))}
                    </ButtonText>
                </Button>
            </HStack>

            <VStack className="gap-4">
                <Box className="bg-obsidian p-md rounded-comfortable border border-white/5">
                    <Text className="text-mistGray text-center text-xs">
                        {t('fireJournal.privacy') || 'Your words are for you alone. They are never shared or stored beyond this moment of release.'}
                    </Text>
                </Box>

                <Box className="p-sm">
                    <Text className="text-dimGray text-center text-xs italic">
                        {t('fireJournal.guidance') || 'GuruDevi: "Let the smoke carry away the weight of what you cannot change."'}
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
}
