import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    StyleSheet, 
    FlatList, 
    useWindowDimensions, 
    Platform, 
    Pressable 
} from 'react-native';
import { 
    Theme, 
    useThemedColors, 
    Text, 
    HStack, 
    VStack, 
    Box,
    GlassCard,
    Heading
} from '@repo/ui';
import { Star, Sparkles, Megaphone, Users, Heart } from 'lucide-react-native';
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
    userId,
    onEndorseManifesto,
    onPressSpotlight,
}: CommunityHearthProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { width: windowWidth } = useWindowDimensions();
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Responsive card width
    const CARD_WIDTH = Platform.OS === 'web'
        ? Math.min(windowWidth - 120, 700)
        : windowWidth * 0.85;

    const SNAP_INTERVAL = CARD_WIDTH + Theme.spacing.md;

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
        <GlassCard style={[styles.card, { width: CARD_WIDTH }]}>
            <VStack space="md">
                <HStack space="sm" alignItems="center">
                    <Sparkles size={18} color={Theme.colors.sanctuarySaffron} />
                    <Text fontWeight="700" color={Theme.colors.sanctuarySaffron}>
                        {t('community.manifestoTopic') || 'Community Manifesto'}
                    </Text>
                </HStack>
                
                <Heading size="sm" sx={{ mt: 4 }}>{item.title}</Heading>
                <Text size="sm" color={colors.textSecondary} numberOfLines={3}>
                    {item.content}
                </Text>

                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 12 }}>
                    <HStack space="xs" sx={{ alignItems: 'center' }}>
                        <Users size={14} color={colors.textTertiary} />
                        <Text size="xs" color={colors.textTertiary}>
                            {item.endorsement_count || 0} {t('community.endorsers') || 'Endorsers'}
                        </Text>
                    </HStack>
                    
                    <Pressable 
                        onPress={() => onEndorseManifesto?.(item.id)}
                        style={({ pressed }) => [
                            styles.endorseBtn,
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <Heart size={16} color="white" fill="white" />
                        <Text size="xs" fontWeight="700" color="white" sx={{ ml: 6 }}>
                            {t('community.endorse') || 'Endorse'}
                        </Text>
                    </Pressable>
                </HStack>
            </VStack>
        </GlassCard>
    );

    return (
        <View style={styles.container}>
            <VStack space="lg">
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', px: 20 }}>
                    <VStack>
                        <Heading size="lg">{t('community.hearthTitle') || 'The Hearth'}</Heading>
                        <Text size="xs" color={colors.textSecondary}>
                            {t('community.hearthSubtitle') || 'Where the community pulse beats strongest'}
                        </Text>
                    </VStack>
                    <Box sx={{ bg: `${Theme.colors.sageGreen}20`, px: 12, py: 4, borderRadius: 20 }}>
                        <Text size="xs" fontWeight="700" color={Theme.colors.sageGreen}>
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
                    contentContainerStyle={styles.listContent}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
                        setActiveIndex(index);
                    }}
                />

                {spotlightPost && (
                    <Box sx={{ px: 20, mt: 8 }}>
                        <Pressable onPress={() => onPressSpotlight?.(spotlightPost.id)}>
                            <GlassCard style={styles.spotlightCard}>
                                <HStack space="md" sx={{ alignItems: 'center' }}>
                                    <Megaphone size={24} color={Theme.colors.skyBlue} />
                                    <VStack sx={{ flex: 1 }}>
                                        <Text size="xs" fontWeight="700" color={Theme.colors.skyBlue}>
                                            {t('community.spotlight') || 'SPOTLIGHT'}
                                        </Text>
                                        <Text size="sm" fontWeight="600" numberOfLines={2}>
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

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        gap: 16, // Use numeric gap or Theme.spacing.md
    },
    card: {
        padding: 24,
        borderRadius: 24,
        minHeight: 180,
    },
    endorseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.sanctuarySaffron,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    spotlightCard: {
        padding: 16,
        borderRadius: 20,
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.skyBlue,
    }
});
