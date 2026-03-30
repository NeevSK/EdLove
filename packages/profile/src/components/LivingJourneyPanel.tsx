/**
 * LivingJourneyPanel
 *
 * The holistic profile view \u2014 a place where the user can see their full growth
 * picture across all four nature paths, their moon context, and their discovered
 * Whispered Moments.
 *
 * See: docs/Core/GROWTH_MODEL.md \u00A715 "The Living Journey Panel"
 *
 * Design principles:
 *   - Private \u2014 visible only to this user; never shown to colleagues
 *   - Story, not score \u2014 each row is human language, not a number
 *   - All paths shown \u2014 Bhumi + Banyan (teachers) or River + Crystal (students) + Moon (all)
 *   - Moon is live \u2014 computed in real time from the device's current date
 *   - Whispered Moments as memory \u2014 the moments that have been discovered are kept here
 *
 * This panel REPLACES UserStatsCard + AchievementGallery in ProfileScreen.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, ActivityIndicator } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    moonPhaseAPI,
    useTemporalStore,
    type UserGrowthState,
    type MoonPhase,
    type BhumiStage,
    type BanyanStage,
    type RiverStage,
    type CrystalTier,
} from '@repo/core';
import { usePermissions } from '@repo/core';
import { communityAPI } from '@repo/core';
import { profileAPI } from '../api/profile';

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// TYPES
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface LivingJourneyPanelProps {
    userId: string;
    authority?: string;
    role?: string;
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// STAGE \u2192 HUMAN LANGUAGE
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const BHUMI_NARRATIVES: Record<BhumiStage, { label: string; description: string }> = {
    bijam: {
        label: 'Bijam \uD83C\uDF30',
        description: 'The seed is here \u2014 and seeds are beautiful.',
    },
    mula: {
        label: 'M\u016Bla \uD83C\uDF31',
        description: 'Roots finding their ground. The foundation is real.',
    },
    nala: {
        label: 'N\u0101la \uD83C\uDF3F',
        description: 'Rising through the water. Your presence is consistent.',
    },
    patra: {
        label: 'Patra \uD83C\uDF43',
        description: 'Leaves on the surface. You have contributed to the ecosystem.',
    },
    kamala: {
        label: 'Kamala \uD83C\uDF38',
        description: 'The bud is forming. Others feel your warmth.',
    },
    purna_kamala: {
        label: 'P\u016Br\u1E47a Kamala \uD83E\uDEB7',
        description: 'Full bloom. You are alive in all five dimensions.',
    },
};

const BANYAN_NARRATIVES: Record<BanyanStage, string> = {
    sapling: 'A young banyan is taking shape. The first branches are real.',
    roots_spreading: 'Your roots are spreading. Three colleagues have felt your shade.',
    canopy: 'A canopy is forming above you. Others rest in what you offer.',
    shade_giver: 'You are a shade giver now. Your community circle is alive.',
    forest_maker: 'You have become a forest. Others have grown with your support.',
};

const RIVER_NARRATIVES: Record<RiverStage, string> = {
    trickle: 'A trickle from the mountain spring. Curiosity awakening.',
    stream: 'A stream finding its direction. Learning is flowing.',
    river: 'A river, confident and wide. Deep engagement; you give back.',
    delta: 'The river meets the sea. Knowledge flows outward from you.',
};

const CRYSTAL_NARRATIVES: Record<CrystalTier, string> = {
    spark: 'A first crystal caught the light. Discovery has begun.',
    cluster: 'A cluster is forming. Several discoveries, all connecting.',
    cave: 'You have found a crystal cave. Knowledge rich across many subjects.',
    fractal: 'The fractal pattern is visible. You see how everything connects.',
};

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// PATH ROW COMPONENT
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface PathRowProps {
    emoji: string;
    pathName: string;
    stageLabel: string;
    narrative: string;
    colors: ReturnType<typeof useThemedColors>;
}

function PathRow({ emoji, pathName, stageLabel, narrative, colors }: PathRowProps) {
    return (
        <Box
            sx={{
                paddingVertical: Theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}60`,
            }}
        
            <HStack space="md" alignItems="flex-start"
                <Text style={styles.pathEmoji}>{emoji}</Text
                <VStack flex={1} space="xs"
                    <HStack justifyContent="space-between" alignItems="center"
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        
                            {pathName}
                        </Text
                        <Text size="sm" bold color={colors.text}
                            {stageLabel}
                        </Text
                    </HStack
                    <Text size="sm" color={colors.textSecondary} style={{ lineHeight: 18 }}
                        {narrative}
                    </Text
                </VStack
            </HStack
        </Box
    );
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// MOON ROW COMPONENT
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface MoonRowProps {
    moon: MoonPhase;
    colors: ReturnType<typeof useThemedColors>;
    t: ReturnType<typeof useTranslation>['t'];
}

function MoonRow({ moon, colors, t }: MoonRowProps) {
    return (
        <Box
            sx={{
                paddingVertical: Theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}60`,
            }}
        
            <HStack space="md" alignItems="flex-start"
                <Text style={styles.pathEmoji}>{moon.emoji}</Text
                <VStack flex={1} space="xs"
                    <HStack justifyContent="space-between" alignItems="center"
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        
                            {t('journey.moonTonight')}
                        </Text
                        <Text size="sm" bold color={colors.text}
                            {moon.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text
                    </HStack
                    <Text size="sm" color={colors.textSecondary} style={{ lineHeight: 18, fontStyle: 'italic' }}
                        {moon.invitation_en}
                    </Text
                    {moon.is_poya && (
                        <Text size="xs" color={`${colors.action}`} style={{ marginTop: 2 }}
                            {t('journey.poyaDay')}
                        </Text
                    )}
                </VStack
            </HStack
        </Box
    );
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// RESONANCE ROW COMPONENT
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface ResonanceRowProps {
    stats: { likes: number; comments: number; shares: number };
    colors: ReturnType<typeof useThemedColors>;
}

function ResonanceRow({ stats, colors }: ResonanceRowProps) {
    const total = stats.likes + stats.comments + stats.shares;
    let label = 'Quiet Presence \uD83E\uDD2B';
    let narrative = 'Your voice is being found. Each interaction is a resonance.';

    if (total > 50) {
        label = 'Luminous Echo \uD83D\uDD14';
        narrative = 'Your presence ripples through the community. Others are listening.';
    } else if (total > 20) {
        label = 'Steady Vibration \uD83C\uDF0A';
        narrative = 'You are consistently heard. Your contributions find their mark.';
    } else if (total > 5) {
        label = 'First Ripples \uD83D\uDCA7';
        narrative = 'A splash in the pond. Others have begun to respond to your presence.';
    }

    return (
        <Box
            sx={{
                paddingVertical: Theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}60`,
            }}
        
            <HStack space="md" alignItems="flex-start"
                <Text style={styles.pathEmoji}>\u2728</Text
                <VStack flex={1} space="xs"
                    <HStack justifyContent="space-between" alignItems="center"
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        
                            COMMUNITY RESONANCE
                        </Text
                        <Text size="sm" bold color={colors.text}
                            {label}
                        </Text
                    </HStack
                    <Text size="sm" color={colors.textSecondary} style={{ lineHeight: 18 }}
                        {narrative}
                    </Text
                    <HStack space="sm" mt={4}
                        <Text size="xs" sx={{ bg: `${colors.action}15`, px: 8, py: 2, borderRadius: 4, color: colors.action }}
                            {stats.likes} Likes
                        </Text
                        <Text size="xs" sx={{ bg: `${colors.action}15`, px: 8, py: 2, borderRadius: 4, color: colors.action }}
                            {stats.comments} Comments
                        </Text
                    </HStack
                </VStack
            </HStack
        </Box
    );
}

interface RecognitionRowProps {
    badges: string[];
    colors: ReturnType<typeof useThemedColors>;
}

function RecognitionRow({ badges, colors }: RecognitionRowProps) {
    const visibleBadges = badges.slice(0, 3);
    const label = badges.length === 0
        ? 'Recognition Still Gathering'
        : badges.length >= 4
            ? 'Recognition Constellation'
            : 'Recognition Taking Shape';
    const narrative = badges.length === 0
        ? 'Your journey is being noticed quietly. Meaningful signals will gather here over time.'
        : `Your path has already left ${badges.length} memorable ${badges.length === 1 ? 'signal' : 'signals'} in the platform.`;

    return (
        <Box
            sx={{
                paddingVertical: Theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}60`,
            }}
                    <HStack space="md" alignItems="flex-start"                <Text style={styles.pathEmoji}>\uD83C\uDFC5</Text                <VStack flex={1} space="xs"                    <HStack justifyContent="space-between" alignItems="center"                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                                                    JOURNEY RECOGNITION
                        </Text                        <Text size="sm" bold color={colors.text}                            {label}
                        </Text                    </HStack                    <Text size="sm" color={colors.textSecondary} style={{ lineHeight: 18 }}                        {narrative}
                    </Text                    {visibleBadges.length > 0 && (
                        <HStack flexWrap="wrap" style={{ gap: 6, marginTop: 4 }}                            {visibleBadges.map((badge) => (
                                <Box
                                    key={badge}
                                    sx={{
                                        paddingHorizontal: Theme.spacing.sm,
                                        paddingVertical: 4,
                                        backgroundColor: `${colors.action}15`,
                                        borderRadius: Theme.corners.full,
                                        borderWidth: 1,
                                        borderColor: `${colors.action}30`,
                                    }}
                                                                    <Text size="xs" color={colors.text}                                        {badge}
                                    </Text                                </Box                            ))}
                        </HStack                    )}
                </VStack            </HStack        </Box    );
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// WHISPERED MOMENTS SECTION
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface WhisperedMomentsRowProps {
    moments: Array<{ key: string; name_en: string; name_si: string }>;
    colors: ReturnType<typeof useThemedColors>;
    t: ReturnType<typeof useTranslation>['t'];
}

function WhisperedMomentsRow({ moments, colors, t }: WhisperedMomentsRowProps) {
    if (moments.length === 0) {
        return (
            <Box sx={{ paddingVertical: Theme.spacing.md }}
                <HStack space="md" alignItems="center"
                    <Text style={styles.pathEmoji}>\u2728</Text
                    <VStack flex={1} space="xs"
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        
                            {t('journey.whisperedMoments')}
                        </Text
                        <Text size="sm" color={colors.textSecondary} style={{ fontStyle: 'italic' }}
                            {t('journey.noMoments')}
                        </Text
                    </VStack
                </HStack
            </Box
        );
    }

    return (
        <Box sx={{ paddingVertical: Theme.spacing.md }}
            <HStack space="md" alignItems="flex-start"
                <Text style={styles.pathEmoji}>\u2728</Text
                <VStack flex={1} space="sm"
                    <HStack justifyContent="space-between" alignItems="center"
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        
                            {t('journey.whisperedMoments')}
                        </Text
                        <Text size="xs" color={colors.textTertiary}
                            {moments.length} {moments.length === 1 ? 'discovery' : 'discoveries'}
                        </Text
                    </HStack
                    <HStack flexWrap="wrap" style={{ gap: 6 }}
                        {moments.map(m => (
                            <Box
                                key={m.key}
                                sx={{
                                    paddingHorizontal: Theme.spacing.sm,
                                    paddingVertical: 4,
                                    backgroundColor: `${colors.action}15`,
                                    borderRadius: Theme.corners.full,
                                    borderWidth: 1,
                                    borderColor: `${colors.action}30`,
                                }}
                            
                                <Text size="xs" color={colors.text}
                                    {m.name_en}
                                </Text
                            </Box
                        ))}
                    </HStack
                </VStack
            </HStack
        </Box
    );
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// MAIN PANEL
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export default function LivingJourneyPanel({ userId }: LivingJourneyPanelProps) {
    const { can } = usePermissions();
    const colors = useThemedColors();
    const { t } = useTranslation();
    const viewDate = useTemporalStore(state => state.viewDate);
    const viewScale = useTemporalStore(state => state.viewScale);
    const phase = useTemporalStore(state => state.phase);

    const [growth, setGrowth] = useState<UserGrowthState | null>(null);
    const [journeyRewards, setJourneyRewards] = useState<{ points: number; badges: string[] } | null>(null);
    const [moon, setMoon] = useState<MoonPhase | null>(null);
    const [moments, setMoments] = useState
        Array<{ key: string; name_en: string; name_si: string }
    >([]);
    const [resonance, setResonance] = useState({ likes: 0, comments: 0, shares: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setMoon(moonPhaseAPI.getCurrentMoonPhase(new Date(viewDate)));

                const [journeySnapshot, resonanceData] = await Promise.all([
                    profileAPI.getJourneySnapshot(userId, {
                        asOf: phase === 'past' ? viewDate : undefined,
                        viewDate,
                        viewScale,
                    }),
                    communityAPI.getCommunityResonance(userId, { viewDate, viewScale })
                ]);

                if (journeySnapshot?.growth) setGrowth(journeySnapshot.growth);
                else setGrowth(null);
                setJourneyRewards(journeySnapshot?.rewards ?? null);
                setMoments(journeySnapshot?.whispered_moments ?? []);
                if (resonanceData) setResonance(resonanceData);

            } catch (err) {
                console.error('Error fetching growth journey:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, phase, viewDate, viewScale]);

    if (loading) {
        return (
            <Box
                sx={{
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.generous,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: Theme.spacing.xl,
                    marginHorizontal: Theme.spacing.md,
                    marginTop: Theme.spacing.lg,
                    minHeight: 180,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            
                <ActivityIndicator color={colors.action} /
            </Box
        );
    }

    // 1. Data Guards (Defensive Coding)
    if (!growth) {
        return (
            <Box sx={{ p: Theme.spacing.xl, alignItems: 'center' }}
                <Text color={colors.textSecondary}>{t('profile.noJourneyData') || 'No journey data found'}</Text
            </Box
        );
    }

    const bhumi = growth.bhumi_stage ?? 'bijam';
    const banyan = (growth.banyan_stage as BanyanStage | undefined) ?? 'sapling';
    const river = (growth.river_stage as RiverStage | undefined) ?? 'trickle';
    const crystal = (growth.crystal_tier as CrystalTier | undefined) ?? 'spark';

    const bhumiData = BHUMI_NARRATIVES[bhumi];

    const isTeacherRole = can('read', 'TeacherPulse') || can('read', 'PrincipalPulse') || can('read', 'FounderPulse');
    const isStudentRole = can('read', 'StudentPulse');

    // 2. Animation Gating (Ensuring web-safe defaults)
    const enteringAnimation = Platform.OS === 'web'
        ? undefined  // Skip complex entering animations on web
        : FadeInDown.springify();

    return (
        <Animated.View entering={enteringAnimation}
            <Box
                sx={{
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.generous,
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowColor: colors.glow,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 15,
                    elevation: 5,
                    marginHorizontal: Theme.spacing.md,
                    marginTop: Theme.spacing.lg,
                    overflow: 'hidden',
                }}
            
                {/* Header */}
                <Box
                    sx={{
                        paddingHorizontal: Theme.spacing.xl,
                        paddingTop: Theme.spacing.xl,
                        paddingBottom: Theme.spacing.md,
                        borderBottomWidth: 1,
                        borderBottomColor: `${colors.border}60`,
                    }}
                
                    <Heading size="sm" color={colors.textSecondary as string}
                        {t('journey.title')}
                    </Heading
                    <Text size="xs" color={colors.textTertiary} style={{ marginTop: 4 }}                        {t('journey.subtitle')}
                    </Text                    {phase !== 'present' && (
                        <Text size="xs" color={colors.textTertiary} style={{ marginTop: 6 }}                            Journey state, discoveries, moon context, and community resonance follow the selected time.
                        </Text                    )}
                </Box
                {/* Path rows */}
                <Box sx={{ paddingHorizontal: Theme.spacing.xl }}
                    {/* Bhumi (Lotus) \u2014 all users */}
                    <PathRow
                        emoji="\uD83C\uDF38"
                        pathName={t('journey.lotusPath')}
                        stageLabel={bhumiData.label}
                        narrative={bhumiData.description}
                        colors={colors}
                    /

                    {/* Banyan \u2014 teachers and principals */}
                    {isTeacherRole && (
                        <PathRow
                            emoji="\uD83C\uDF33"
                            pathName={t('journey.banyanPath')}
                            stageLabel={banyan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            narrative={BANYAN_NARRATIVES[banyan]}
                            colors={colors}
                        /
                    )}

                    {/* River \u2014 students */}
                    {isStudentRole && (
                        <PathRow
                            emoji="\uD83C\uDF0A"
                            pathName={t('journey.riverPath')}
                            stageLabel={river.charAt(0).toUpperCase() + river.slice(1)}
                            narrative={RIVER_NARRATIVES[river]}
                            colors={colors}
                        /
                    )}

                    {/* Crystal \u2014 students */}
                    {isStudentRole && (
                        <PathRow
                            emoji="\uD83D\uDC8E"
                            pathName={t('journey.crystalPath')}
                            stageLabel={crystal.charAt(0).toUpperCase() + crystal.slice(1)}
                            narrative={CRYSTAL_NARRATIVES[crystal]}
                            colors={colors}
                        /
                    )}

                    {/* Moon \u2014 all users, live */}
                    {moon && <MoonRow moon={moon} colors={colors} t={t} />}

                    {/* Community Resonance \u2014 aggregated from social actions */}
                    <ResonanceRow stats={resonance} colors={colors} /
                    {/* Rewards / recognition \u2014 shown as narrative signals rather than a score */}
                    <RecognitionRow badges={journeyRewards?.badges ?? []} colors={colors} /
                    {/* Whispered Moments \u2014 all users */}
                    <WhisperedMomentsRow
                        moments={moments}
                        colors={colors}
                        t={t}
                    /
                </Box
            </Box
        </Animated.View
    );
}

const styles = StyleSheet.create({
    pathEmoji: {
        fontSize: 24,
        lineHeight: 32,
        width: 32,
        textAlign: 'center',
    },
});
