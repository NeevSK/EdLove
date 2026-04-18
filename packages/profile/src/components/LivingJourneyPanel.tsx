/**
 * LivingJourneyPanel
 *
 * The holistic profile view — a place where the user can see their full growth
 * picture across all four nature paths, their moon context, and their discovered
 * Whispered Moments.
 */

import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Spinner,
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
    usePermissions,
    communityAPI,
} from '@repo/core';
import { profileAPI } from '../api/profile';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface LivingJourneyPanelProps {
    userId: string;
    authority?: string;
    role?: string;
}

// —————————————————————————————————————————————————————————————————————————————
// STAGE → HUMAN LANGUAGE
// —————————————————————————————————————————————————————————————————————————————

const BHUMI_NARRATIVES: Record<BhumiStage, { label: string; description: string }> = {
    bijam: {
        label: 'Bijam 🌱',
        description: 'The seed is here — and seeds are beautiful.',
    },
    mula: {
        label: 'Mūla 🌿',
        description: 'Roots finding their ground. The foundation is real.',
    },
    nala: {
        label: 'Nāla 🍀',
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

// —————————————————————————————————————————————————————————————————————————————
// PATH ROW COMPONENT
// —————————————————————————————————————————————————————————————————————————————

interface PathRowProps {
    emoji: string;
    pathName: string;
    stageLabel: string;
    narrative: string;
}

function PathRow({ emoji, pathName, stageLabel, narrative }: PathRowProps) {
    return (
        <Box className="py-md border-b border-phase-surface/60">
            <HStack className="items-start gap-md">
                <Text className="text-2xl leading-8 w-8 text-center">{emoji}</Text>
                <VStack className="flex-1 gap-xs">
                    <HStack className="justify-between items-center">
                        <Text className="text-[10px] text-phaseText-secondary uppercase tracking-[0.8px]">
                            {pathName}
                        </Text>
                        <Text className="text-sm font-bold text-phaseText-primary">
                            {stageLabel}
                        </Text>
                    </HStack>
                    <Text className="text-sm text-phaseText-secondary leading-[18px]">
                        {narrative}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
}

// —————————————————————————————————————————————————————————————————————————————
// MOON ROW COMPONENT
// —————————————————————————————————————————————————————————————————————————————

interface MoonRowProps {
    moon: MoonPhase;
    t: (key: string) => string;
}

function MoonRow({ moon, t }: MoonRowProps) {
    return (
        <Box className="py-md border-b border-phase-surface/60">
            <HStack className="items-start gap-md">
                <Text className="text-2xl leading-8 w-8 text-center">{moon.emoji}</Text>
                <VStack className="flex-1 gap-xs">
                    <HStack className="justify-between items-center">
                        <Text className="text-[10px] text-phaseText-secondary uppercase tracking-[0.8px]">
                            {t('journey.moonTonight')}
                        </Text>
                        <Text className="text-sm font-bold text-phaseText-primary">
                            {moon.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                    </HStack>
                    <Text className="text-sm text-phaseText-secondary leading-[18px] italic">
                        {moon.invitation_en}
                    </Text>
                    {moon.is_poya && (
                        <Text className="text-xs text-phase-interactive mt-0.5">
                            {t('journey.poyaDay')}
                        </Text>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
}

// —————————————————————————————————————————————————————————————————————————————
// RESONANCE ROW COMPONENT
// —————————————————————————————————————————————————————————————————————————————

interface ResonanceRowProps {
    stats: { likes: number; comments: number; shares: number };
}

function ResonanceRow({ stats }: ResonanceRowProps) {
    const total = stats.likes + stats.comments + stats.shares;
    let label = 'Quiet Presence 🤫';
    let narrative = 'Your voice is being found. Each interaction is a resonance.';

    if (total > 50) {
        label = 'Luminous Echo 🔔';
        narrative = 'Your presence ripples through the community. Others are listening.';
    } else if (total > 20) {
        label = 'Steady Vibration 🌊';
        narrative = 'You are consistently heard. Your contributions find their mark.';
    } else if (total > 5) {
        label = 'First Ripples 💧';
        narrative = 'A splash in the pond. Others have begun to respond to your presence.';
    }

    return (
        <Box className="py-md border-b border-phase-surface/60">
            <HStack className="items-start gap-md">
                <Text className="text-2xl leading-8 w-8 text-center">✨</Text>
                <VStack className="flex-1 gap-xs">
                    <HStack className="justify-between items-center">
                        <Text className="text-[10px] text-phaseText-secondary uppercase tracking-[0.8px]">
                            COMMUNITY RESONANCE
                        </Text>
                        <Text className="text-sm font-bold text-phaseText-primary">
                            {label}
                        </Text>
                    </HStack>
                    <Text className="text-sm text-phaseText-secondary leading-[18px]">
                        {narrative}
                    </Text>
                    <HStack className="gap-sm mt-1">
                        <Box className="bg-phase-interactive/15 px-2 py-0.5 rounded">
                            <Text className="text-xs text-phase-interactive">
                                {stats.likes} Likes
                            </Text>
                        </Box>
                        <Box className="bg-phase-interactive/15 px-2 py-0.5 rounded">
                            <Text className="text-xs text-phase-interactive">
                                {stats.comments} Comments
                            </Text>
                        </Box>
                    </HStack>
                </VStack>
            </HStack>
        </Box>
    );
}

// —————————————————————————————————————————————————————————————————————————————
// RECOGNITION ROW COMPONENT
// —————————————————————————————————————————————————————————————————————————————

interface RecognitionRowProps {
    badges: string[];
}

function RecognitionRow({ badges }: RecognitionRowProps) {
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
        <Box className="py-md border-b border-phase-surface/60">
            <HStack className="items-start gap-md">
                <Text className="text-2xl leading-8 w-8 text-center">🏅</Text>
                <VStack className="flex-1 gap-xs">
                    <HStack className="justify-between items-center">
                        <Text className="text-[10px] text-phaseText-secondary uppercase tracking-[0.8px]">
                            JOURNEY RECOGNITION
                        </Text>
                        <Text className="text-sm font-bold text-phaseText-primary">
                            {label}
                        </Text>
                    </HStack>
                    <Text className="text-sm text-phaseText-secondary leading-[18px]">
                        {narrative}
                    </Text>
                    {visibleBadges.length > 0 && (
                        <HStack className="flex-wrap gap-[6px] mt-1">
                            {visibleBadges.map((badge) => (
                                <Box
                                    key={badge}
                                    className="px-sm py-1 bg-phase-interactive/15 rounded-full border border-phase-interactive/30"
                                >
                                    <Text className="text-xs text-phaseText-primary">
                                        {badge}
                                    </Text>
                                </Box>
                            ))}
                        </HStack>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
}

// —————————————————————————————————————————————————————————————————————————————
// WHISPERED MOMENTS ROW COMPONENT
// —————————————————————————————————————————————————————————————————————————————

interface WhisperedMomentsRowProps {
    moments: Array<{ key: string; name_en: string; name_si: string }>;
    t: (key: string) => string;
}

function WhisperedMomentsRow({ moments, t }: WhisperedMomentsRowProps) {
    return (
        <Box className="py-md">
            <HStack className="items-start gap-md">
                <Text className="text-2xl leading-8 w-8 text-center">✨</Text>
                <VStack className="flex-1 gap-xs">
                    <HStack className="justify-between items-center">
                        <Text className="text-[10px] text-phaseText-secondary uppercase tracking-[0.8px]">
                            {t('journey.whisperedMoments')}
                        </Text>
                        {moments.length > 0 && (
                            <Text className="text-xs text-phaseText-secondary">
                                {moments.length} {moments.length === 1 ? 'discovery' : 'discoveries'}
                            </Text>
                        )}
                    </HStack>
                    {moments.length === 0 ? (
                        <Text className="text-sm text-phaseText-secondary italic">
                            {t('journey.noMoments')}
                        </Text>
                    ) : (
                        <HStack className="flex-wrap gap-[6px] mt-2">
                            {moments.map(m => (
                                <Box
                                    key={m.key}
                                    className="px-sm py-1 bg-phase-interactive/15 rounded-full border border-phase-interactive/30"
                                >
                                    <Text className="text-xs text-phaseText-primary">
                                        {m.name_en}
                                    </Text>
                                </Box>
                            ))}
                        </HStack>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
}

// —————————————————————————————————————————————————————————————————————————————
// MAIN PANEL
// —————————————————————————————————————————————————————————————————————————————

export default function LivingJourneyPanel({ userId }: LivingJourneyPanelProps) {
    const { can } = usePermissions();
    const { t } = useTranslation();
    const viewDate = useTemporalStore(state => state.viewDate);
    const viewScale = useTemporalStore(state => state.viewScale);
    const phase = useTemporalStore(state => state.phase);

    const [growth, setGrowth] = useState<UserGrowthState | null>(null);
    const [journeyRewards, setJourneyRewards] = useState<{ points: number; badges: string[] } | null>(null);
    const [moon, setMoon] = useState<MoonPhase | null>(null);
    const [moments, setMoments] = useState<Array<{ key: string; name_en: string; name_si: string }>>([]);
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

        void fetchData();
    }, [userId, phase, viewDate, viewScale]);

    if (loading) {
        return (
            <Box
                className="bg-phase-canvas rounded-generous border border-phase-surface p-xl mx-md mt-lg min-h-[180px] items-center justify-center"
            >
                <Spinner className="text-phase-interactive" />
            </Box>
        );
    }

    if (!growth) {
        return (
            <Box className="p-xl items-center">
                <Text className="text-phaseText-secondary">{t('profile.noJourneyData') || 'No journey data found'}</Text>
            </Box>
        );
    }

    const bhumi = growth.bhumi_stage ?? 'bijam';
    const banyan = (growth.banyan_stage as BanyanStage | undefined) ?? 'sapling';
    const river = (growth.river_stage as RiverStage | undefined) ?? 'trickle';
    const crystal = (growth.crystal_tier as CrystalTier | undefined) ?? 'spark';

    const bhumiData = BHUMI_NARRATIVES[bhumi];

    const isTeacherRole = can('read', 'TeacherPulse') || can('read', 'PrincipalPulse') || can('read', 'FounderPulse');
    const isStudentRole = can('read', 'StudentPulse');

    const enteringAnimation = Platform.OS === 'web'
        ? undefined
        : FadeInDown.springify();

    return (
        <Animated.View entering={enteringAnimation}>
            <Box
                className="bg-phase-canvas rounded-generous border border-phase-surface shadow-sm mx-md mt-lg overflow-hidden"
            >
                {/* Header */}
                <Box
                    className="px-xl pt-xl pb-md border-b border-phase-surface/60"
                >
                    <Heading size="sm" className="text-phaseText-secondary">
                        {t('journey.title')}
                    </Heading>
                    <Text className="text-xs text-phaseText-secondary mt-1">
                        {t('journey.subtitle')}
                    </Text>
                    {phase !== 'present' && (
                        <Text className="text-xs text-phaseText-secondary mt-1.5 opacity-80">
                            Journey state, discoveries, moon context, and community resonance follow the selected time.
                        </Text>
                    )}
                </Box>

                {/* Path rows */}
                <Box className="px-xl">
                    {/* Bhumi (Lotus) — all users */}
                    <PathRow
                        emoji="🌸"
                        pathName={t('journey.lotusPath')}
                        stageLabel={bhumiData.label}
                        narrative={bhumiData.description}
                    />

                    {/* Banyan — teachers and principals */}
                    {isTeacherRole && (
                        <PathRow
                            emoji="🌳"
                            pathName={t('journey.banyanPath')}
                            stageLabel={banyan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            narrative={BANYAN_NARRATIVES[banyan]}
                        />
                    )}

                    {/* River — students */}
                    {isStudentRole && (
                        <PathRow
                            emoji="🌊"
                            pathName={t('journey.riverPath')}
                            stageLabel={river.charAt(0).toUpperCase() + river.slice(1)}
                            narrative={RIVER_NARRATIVES[river]}
                        />
                    )}

                    {/* Crystal — students */}
                    {isStudentRole && (
                        <PathRow
                            emoji="💎"
                            pathName={t('journey.crystalPath')}
                            stageLabel={crystal.charAt(0).toUpperCase() + crystal.slice(1)}
                            narrative={CRYSTAL_NARRATIVES[crystal]}
                        />
                    )}

                    {/* Moon — all users, live */}
                    {moon && <MoonRow moon={moon} t={t} />}

                    {/* Community Resonance — aggregated from social actions */}
                    <ResonanceRow stats={resonance} />

                    {/* Rewards / recognition — shown as narrative signals rather than a score */}
                    <RecognitionRow badges={journeyRewards?.badges ?? []} />

                    {/* Whispered Moments — all users */}
                    <WhisperedMomentsRow
                        moments={moments}
                        t={t}
                    />
                </Box>
            </Box>
        </Animated.View>
    );
}

