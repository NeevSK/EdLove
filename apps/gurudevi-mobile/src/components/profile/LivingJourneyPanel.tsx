/**
 * LivingJourneyPanel
 *
 * The holistic profile view — a place where the user can see their full growth
 * picture across all four nature paths, their moon context, and their discovered
 * Whispered Moments.
 *
 * See: docs/Core/GROWTH_MODEL.md §15 "The Living Journey Panel"
 *
 * Design principles:
 *   - Private — visible only to this user; never shown to colleagues
 *   - Story, not score — each row is human language, not a number
 *   - All paths shown — Bhumi + Banyan (teachers) or River + Crystal (students) + Moon (all)
 *   - Moon is live — computed in real time from the device's current date
 *   - Whispered Moments as memory — the moments that have been discovered are kept here
 *
 * This panel REPLACES UserStatsCard + AchievementGallery in ProfileScreen.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
    userGrowthStateAPI,
    type UserGrowthState,
    type MoonPhase,
    type BhumiStage,
    type BanyanStage,
    type RiverStage,
    type CrystalTier,
} from '@repo/core';
import { UserRole } from '@repo/core';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface LivingJourneyPanelProps {
    userId: string;
    role: UserRole;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE → HUMAN LANGUAGE
// ─────────────────────────────────────────────────────────────────────────────

const BHUMI_NARRATIVES: Record<BhumiStage, { label: string; description: string }> = {
    bijam: {
        label: 'Bijam 🌰',
        description: 'The seed is here — and seeds are beautiful.',
    },
    mula: {
        label: 'Mūla 🌱',
        description: 'Roots finding their ground. The foundation is real.',
    },
    nala: {
        label: 'Nāla 🌿',
        description: 'Rising through the water. Your presence is consistent.',
    },
    patra: {
        label: 'Patra 🍃',
        description: 'Leaves on the surface. You have contributed to the ecosystem.',
    },
    kamala: {
        label: 'Kamala 🌸',
        description: 'The bud is forming. Others feel your warmth.',
    },
    purna_kamala: {
        label: 'Pūrṇa Kamala 🪷',
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

// ─────────────────────────────────────────────────────────────────────────────
// PATH ROW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

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
        >
            <HStack space="md" alignItems="flex-start">
                <Text style={styles.pathEmoji}>{emoji}</Text>
                <VStack flex={1} space="xs">
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        >
                            {pathName}
                        </Text>
                        <Text size="sm" bold color={colors.text}>
                            {stageLabel}
                        </Text>
                    </HStack>
                    <Text size="sm" color={colors.textSecondary} style={{ lineHeight: 18 }}>
                        {narrative}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOON ROW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function MoonRow({ moon, colors }: { moon: MoonPhase; colors: ReturnType<typeof useThemedColors> }) {
    return (
        <Box
            sx={{
                paddingVertical: Theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}60`,
            }}
        >
            <HStack space="md" alignItems="flex-start">
                <Text style={styles.pathEmoji}>{moon.emoji}</Text>
                <VStack flex={1} space="xs">
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        >
                            Moon Tonight
                        </Text>
                        <Text size="sm" bold color={colors.text}>
                            {moon.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                    </HStack>
                    <Text size="sm" color={colors.textSecondary} style={{ lineHeight: 18, fontStyle: 'italic' }}>
                        {moon.invitation_en}
                    </Text>
                    {moon.is_poya && (
                        <Text size="xs" color={`${colors.action}`} style={{ marginTop: 2 }}>
                            ✦ Poya day
                        </Text>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHISPERED MOMENTS SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface WhisperedMomentsRowProps {
    moments: Array<{ key: string; name_en: string; name_si: string }>;
    colors: ReturnType<typeof useThemedColors>;
    t: ReturnType<typeof useTranslation>['t'];
}

function WhisperedMomentsRow({ moments, colors, t }: WhisperedMomentsRowProps) {
    if (moments.length === 0) {
        return (
            <Box sx={{ paddingVertical: Theme.spacing.md }}>
                <HStack space="md" alignItems="center">
                    <Text style={styles.pathEmoji}>✨</Text>
                    <VStack flex={1} space="xs">
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        >
                            {t('journey.whisperedMoments', 'Whispered Moments')}
                        </Text>
                        <Text size="sm" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
                            {t('journey.noMoments', 'Discoveries arrive in their own time — quietly.')}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        );
    }

    return (
        <Box sx={{ paddingVertical: Theme.spacing.md }}>
            <HStack space="md" alignItems="flex-start">
                <Text style={styles.pathEmoji}>✨</Text>
                <VStack flex={1} space="sm">
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text
                            size="xs"
                            color={colors.textTertiary}
                            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                        >
                            {t('journey.whisperedMoments', 'Whispered Moments')}
                        </Text>
                        <Text size="xs" color={colors.textTertiary}>
                            {moments.length} {moments.length === 1 ? 'discovery' : 'discoveries'}
                        </Text>
                    </HStack>
                    <HStack flexWrap="wrap" style={{ gap: 6 }}>
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
                            >
                                <Text size="xs" color={colors.text}>
                                    {m.name_en}
                                </Text>
                            </Box>
                        ))}
                    </HStack>
                </VStack>
            </HStack>
        </Box>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

export default function LivingJourneyPanel({ userId, role }: LivingJourneyPanelProps) {
    const colors = useThemedColors();
    const { t } = useTranslation();

    const [growthState, setGrowthState] = useState<UserGrowthState | null>(null);
    const [moon, setMoon] = useState<MoonPhase | null>(null);
    const [whisperedMoments, setWhisperedMoments] = useState<
        Array<{ key: string; name_en: string; name_si: string }>
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Moon is pure computation — instant, no network needed
        setMoon(moonPhaseAPI.getCurrentMoonPhase());

        // Growth state requires DB fetch
        Promise.all([
            userGrowthStateAPI.getOrCreateState(userId),
            userGrowthStateAPI.getWhisperedMoments(userId),
        ])
            .then(([state, moments]) => {
                setGrowthState(state);
                setWhisperedMoments(moments ?? []);
            })
            .catch(() => {
                // Silent failure — panel shows gracefully with defaults
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const isTeacherRole = ['teacher', 'principal', 'grade_head', 'section_head', 'developer'].includes(role);
    const isStudentRole = role === 'student';

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
            >
                <Text size="sm" color={colors.textTertiary} style={{ fontStyle: 'italic' }}>
                    {t('journey.loading', 'Your journey is waking up...')}
                </Text>
            </Box>
        );
    }

    const bhumi = growthState?.bhumi_stage ?? 'bijam';
    const banyan = (growthState?.banyan_stage as BanyanStage | undefined) ?? 'sapling';
    const river = (growthState?.river_stage as RiverStage | undefined) ?? 'trickle';
    const crystal = (growthState?.crystal_tier as CrystalTier | undefined) ?? 'spark';

    const bhumiData = BHUMI_NARRATIVES[bhumi];

    return (
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
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
            >
                {/* Header */}
                <Box
                    sx={{
                        paddingHorizontal: Theme.spacing.xl,
                        paddingTop: Theme.spacing.xl,
                        paddingBottom: Theme.spacing.md,
                        borderBottomWidth: 1,
                        borderBottomColor: `${colors.border}60`,
                    }}
                >
                    <Heading size="sm" color={colors.textSecondary as string}>
                        {t('journey.title', 'Your Living Journey')}
                    </Heading>
                    <Text size="xs" color={colors.textTertiary} style={{ marginTop: 4 }}>
                        {t('journey.subtitle', 'Private — only you can see this')}
                    </Text>
                </Box>

                {/* Path rows */}
                <Box sx={{ paddingHorizontal: Theme.spacing.xl }}>
                    {/* Bhumi (Lotus) — all users */}
                    <PathRow
                        emoji="🌸"
                        pathName={t('journey.lotusPath', 'Lotus Path')}
                        stageLabel={bhumiData.label}
                        narrative={bhumiData.description}
                        colors={colors}
                    />

                    {/* Banyan — teachers and principals */}
                    {isTeacherRole && (
                        <PathRow
                            emoji="🌳"
                            pathName={t('journey.banyanPath', 'Banyan Path')}
                            stageLabel={banyan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            narrative={BANYAN_NARRATIVES[banyan]}
                            colors={colors}
                        />
                    )}

                    {/* River — students */}
                    {isStudentRole && (
                        <PathRow
                            emoji="🌊"
                            pathName={t('journey.riverPath', 'River Path')}
                            stageLabel={river.charAt(0).toUpperCase() + river.slice(1)}
                            narrative={RIVER_NARRATIVES[river]}
                            colors={colors}
                        />
                    )}

                    {/* Crystal — students */}
                    {isStudentRole && (
                        <PathRow
                            emoji="💎"
                            pathName={t('journey.crystalPath', 'Crystal Collection')}
                            stageLabel={crystal.charAt(0).toUpperCase() + crystal.slice(1)}
                            narrative={CRYSTAL_NARRATIVES[crystal]}
                            colors={colors}
                        />
                    )}

                    {/* Moon — all users, live */}
                    {moon && <MoonRow moon={moon} colors={colors} />}

                    {/* Whispered Moments — all users */}
                    <WhisperedMomentsRow
                        moments={whisperedMoments}
                        colors={colors}
                        t={t}
                    />
                </Box>
            </Box>
        </Animated.View>
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
