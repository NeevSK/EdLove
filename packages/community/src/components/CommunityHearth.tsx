import React, { useState, useEffect, useRef } from 'react';
import { 
    FlatList, 
    useWindowDimensions, 
    Platform
} from 'react-native';
import { 
    Text, 
    HStack, 
    VStack, 
    Box,
    GlassCard,
    Heading,
    Pressable,
    View
} from '@repo/ui';
import { Sparkles, Megaphone, Users, Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { SanctuaryManifesto, CommunityPost as Post } from '../types/Community';

interface CommunityHearthProps {
    manifestos?: SanctuaryManifesto[];
    spotlightPost?: Post;
    userVibe?: string;
    userId: string;
    onEndorseManifesto?: (id: string) => void;
    onPressSpotlight?: (id: string) => void;
}

const AUTO_SWIPE_INTERVAL = 8000;

export default function CommunityHearth({
    manifestos = [],
    spotlightPost,
    userVibe = 'active',
    onEndorseManifesto,
    onPressSpotlight,
}: CommunityHearthProps) {
    const { t } = useTranslation();
    const { width: windowWidth } = useWindowDimensions();
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Responsive card width
    const CARD_WIDTH = Platform.OS === 'web'
        ? Math.min(windowWidth - 120, 700)
        : windowWidth * 0.85;

    const SNAP_INTERVAL = CARD_WIDTH + 9; // Theme.spacing.md is 9px

    useEffect(() => {
        if (!manifestos || !manifestos.length) return;
        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % manifestos.length;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setActiveIndex(nextIndex);
        }, AUTO_SWIPE_INTERVAL);
        return () => clearInterval(interval);
    }, [activeIndex, manifestos?.length]);

    const renderManifesto = ({ item }: { item: SanctuaryManifesto }) => (
        <GlassCard 
            className="p-6 rounded-generous min-h-[180px]" 
            style={{ width: CARD_WIDTH }}
        >
            <VStack space="md">
                <HStack space="sm" className="items-center">
                    <Sparkles size={18} color="#F6BF8C" />
                    <Text className="font-bold text-sanctuarySaffron">
                        {t('community.manifestoTopic') || 'Community Manifesto'}
                    </Text>
                </HStack>
                
                <Heading size="sm" className="mt-1">{item.title}</Heading>
                <Text size="sm" className="text-willow" numberOfLines={3}>
                    {item.content}
                </Text>

                <HStack className="justify-between items-center mt-3">
                    <HStack space="xs" className="items-center">
                        <Users size={14} color="#968E80" />
                        <Text className="text-xs text-mistGray">
                            {item.endorsement_count || 0} {t('community.endorsers') || 'Endorsers'}
                        </Text>
                    </HStack>
                    
                    <Pressable 
                        onPress={() => onEndorseManifesto?.(item.id)}
                        className="flex-row items-center bg-sanctuarySaffron px-4 py-2 rounded-full active:opacity-70"
                    >
                        <Heart size={16} color="white" fill="white" />
                        <Text className="text-xs font-bold text-white ml-1.5">
                            {t('community.endorse') || 'Endorse'}
                        </Text>
                    </Pressable>
                </HStack>
            </VStack>
        </GlassCard>
    );

    return (
        <View className="py-5">
            <VStack space="lg">
                <HStack className="justify-between items-center px-5">
                    <VStack>
                        <Heading size="lg">{t('community.hearthTitle') || 'The Hearth'}</Heading>
                        <Text className="text-xs text-willow">
                            {t('community.hearthSubtitle') || 'Where the community pulse beats strongest'}
                        </Text>
                    </VStack>
                    <Box className="bg-sageGreen/20 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-sageGreen">
                            {userVibe.toUpperCase()}
                        </Text>
                    </Box>
                </HStack>

                <FlatList
                    ref={flatListRef}
                    data={manifestos}
                    renderItem={renderManifesto}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={SNAP_INTERVAL}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
                        setActiveIndex(index);
                    }}
                />

                {spotlightPost && (
                    <Box className="px-5 mt-2">
                        <Pressable onPress={() => onPressSpotlight?.(spotlightPost.id)}>
                            <GlassCard className="p-4 rounded-comfortable border-l-4 border-l-skyBlue">
                                <HStack space="md" className="items-center">
                                    <Megaphone size={24} color="#87CEEB" />
                                    <VStack className="flex-1">
                                        <Text className="text-xs font-bold text-skyBlue">
                                            {t('community.spotlight') || 'SPOTLIGHT'}
                                        </Text>
                                        <Text size="sm" className="font-semibold" numberOfLines={2}>
                                            {spotlightPost.content}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </GlassCard>
                        </Pressable>
                    </Box>
                )}
            </VStack>
        </View>
    );
}
