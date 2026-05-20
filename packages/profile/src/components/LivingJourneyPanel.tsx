/**
 * LivingJourneyPanel
 *
 * The holistic profile view — a place where the user can see their full growth
 * picture across all four nature paths, their moon context, and their discovered
 * Whispered Moments.
 */

import {
  type BanyanStage,
  type BhumiStage,
  type CrystalTier,
  type MoonPhase,
  moonPhaseAPI,
  profileAPI,
  type RiverStage,
  socialAPI,
  type UserGrowthState,
} from '@repo/core/api';
import { type TemporalScale, usePermissions, useTemporalStore } from '@repo/core/logic';
import { AnimatedView, Box, Heading, HStack, Spinner, Text, VStack } from '@repo/ui/primitives';
import { useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

type PanelState = {
  growth: UserGrowthState | null;
  rewards: { points: number; badges: string[] } | null;
  moon: MoonPhase | null;
  moments: Array<{ key: string; name_en: string; name_si: string }>;
  resonance: { likes: number; comments: number; shares: number };
  loading: boolean;
};

type PanelAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Omit<PanelState, 'loading'> }
  | { type: 'FETCH_FAILURE' };

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, ...action.payload, loading: false };
    case 'FETCH_FAILURE':
      return { ...state, loading: false };
    default:
      return state;
  }
}

const initialPanelState: PanelState = {
  growth: null,
  rewards: null,
  moon: null,
  moments: [],
  resonance: { likes: 0, comments: 0, shares: 0 },
  loading: true,
};

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
    <Box className="py-5 border-b border-phase-surface/40">
      <HStack className="items-start gap-4">
        <Box className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 shadow-sm">
          <Text className="text-2xl leading-8">{emoji}</Text>
        </Box>
        <VStack className="flex-1 gap-1">
          <HStack className="justify-between items-center">
            <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest">
              {pathName}
            </Text>
            <Text className="text-sm font-bold text-phase-text-primary">{stageLabel}</Text>
          </HStack>
          <Text className="text-sm text-phase-text-secondary leading-relaxed">{narrative}</Text>
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
    <Box className="py-5 border-b border-phase-surface/40">
      <HStack className="items-start gap-4">
        <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/5 items-center justify-center border border-phase-interactive/10 shadow-sm">
          <Text className="text-2xl leading-8">{moon.emoji}</Text>
        </Box>
        <VStack className="flex-1 gap-1">
          <HStack className="justify-between items-center">
            <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest">
              {t('journey.moonTonight')}
            </Text>
            <Text className="text-sm font-bold text-phase-text-primary">
              {moon.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </Text>
          </HStack>
          <Text className="text-sm text-phase-text-secondary leading-relaxed italic">
            {moon.invitation_en}
          </Text>
          {moon.is_poya && (
            <Box className="bg-phase-interactive/10 self-start px-2 py-0.5 rounded-md mt-1">
              <Text className="text-[10px] font-bold text-phase-interactive uppercase tracking-wider">
                {t('journey.poyaDay')}
              </Text>
            </Box>
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
    <Box className="py-5 border-b border-phase-surface/40">
      <HStack className="items-start gap-4">
        <Box className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 shadow-sm">
          <Text className="text-2xl leading-8">✨</Text>
        </Box>
        <VStack className="flex-1 gap-1">
          <HStack className="justify-between items-center">
            <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest">
              COMMUNITY RESONANCE
            </Text>
            <Text className="text-sm font-bold text-phase-text-primary">{label}</Text>
          </HStack>
          <Text className="text-sm text-phase-text-secondary leading-relaxed">{narrative}</Text>
          <HStack className="gap-2 mt-2">
            <Box className="bg-phase-interactive/10 px-3 py-1 rounded-full">
              <Text className="text-[11px] font-bold text-phase-interactive">
                {stats.likes} Likes
              </Text>
            </Box>
            <Box className="bg-phase-interactive/10 px-3 py-1 rounded-full">
              <Text className="text-[11px] font-bold text-phase-interactive">
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
  const label =
    badges.length === 0
      ? 'Recognition Still Gathering'
      : badges.length >= 4
        ? 'Recognition Constellation'
        : 'Recognition Taking Shape';
  const narrative =
    badges.length === 0
      ? 'Your journey is being noticed quietly. Meaningful signals will gather here over time.'
      : `Your path has already left ${badges.length} memorable ${badges.length === 1 ? 'signal' : 'signals'} in the platform.`;

  return (
    <Box className="py-5 border-b border-phase-surface/40">
      <HStack className="items-start gap-4">
        <Box className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 shadow-sm">
          <Text className="text-2xl leading-8">🏅</Text>
        </Box>
        <VStack className="flex-1 gap-1">
          <HStack className="justify-between items-center">
            <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest">
              JOURNEY RECOGNITION
            </Text>
            <Text className="text-sm font-bold text-phase-text-primary">{label}</Text>
          </HStack>
          <Text className="text-sm text-phase-text-secondary leading-relaxed">{narrative}</Text>
          {visibleBadges.length > 0 && (
            <HStack className="flex-wrap gap-2 mt-2">
              {visibleBadges.map((badge) => (
                <Box
                  key={badge}
                  className="px-3 py-1 bg-phase-canvas border border-phase-surface rounded-full"
                >
                  <Text className="text-[11px] font-bold text-phase-text-primary">{badge}</Text>
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
    <Box className="py-5">
      <HStack className="items-start gap-4">
        <Box className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 shadow-sm">
          <Text className="text-2xl leading-8">✨</Text>
        </Box>
        <VStack className="flex-1 gap-1">
          <HStack className="justify-between items-center">
            <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest">
              {t('journey.whisperedMoments')}
            </Text>
            {moments.length > 0 && (
              <Text className="text-[11px] font-bold text-phase-text-tertiary">
                {moments.length} {moments.length === 1 ? 'discovery' : 'discoveries'}
              </Text>
            )}
          </HStack>
          {moments.length === 0 ? (
            <Text className="text-sm text-phase-text-secondary italic leading-relaxed">
              {t('journey.noMoments')}
            </Text>
          ) : (
            <HStack className="flex-wrap gap-2 mt-2">
              {moments.map((m) => (
                <Box
                  key={m.key}
                  className="px-3 py-1 bg-phase-canvas border border-phase-surface rounded-full"
                >
                  <Text className="text-[11px] font-bold text-phase-text-primary">{m.name_en}</Text>
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
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);
  const phase = useTemporalStore((state) => state.phase);

  const [state, dispatch] = useReducer(panelReducer, initialPanelState);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const [journeySnapshot, resonanceData] = await Promise.all([
          profileAPI.getJourneySnapshot(userId, {
            at: phase === 'past' ? viewDate : undefined,
            view_date: viewDate,
            view_scale: viewScale as TemporalScale,
          }),
          socialAPI.getCommunityResonance(userId, {
            viewDate,
            viewScale: viewScale as TemporalScale,
          }),
        ]);

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            moon: moonPhaseAPI.getCurrentMoonPhase(new Date(viewDate)),
            growth: (journeySnapshot?.growth as unknown as UserGrowthState | undefined) ?? null,
            rewards: journeySnapshot?.rewards ?? null,
            moments: journeySnapshot?.whispered_moments ?? [],
            resonance: resonanceData || { likes: 0, comments: 0, shares: 0 },
          },
        });
      } catch (err) {
        console.error('Error fetching growth journey:', err);
        dispatch({ type: 'FETCH_FAILURE' });
      }
    };

    fetchData().catch(console.error);
  }, [userId, phase, viewDate, viewScale]);

  if (state.loading) {
    return (
      <Box className="bg-phase-canvas rounded-3xl border border-phase-surface p-10 mx-5 mt-8 min-h-[200px] items-center justify-center shadow-lg">
        <Spinner className="text-phase-interactive" size="large" />
      </Box>
    );
  }

  if (!state.growth) {
    return (
      <Box className="p-12 items-center">
        <Text className="text-phase-text-tertiary italic">
          {t('profile.noJourneyData') || 'No journey data found'}
        </Text>
      </Box>
    );
  }

  const growth = state.growth;
  const journeyRewards = state.rewards;
  const moon = state.moon;
  const moments = state.moments;
  const resonance = state.resonance;

  const bhumi = growth.bhumi_stage ?? 'bijam';
  const banyan = (growth.banyan_stage as BanyanStage | undefined) ?? 'sapling';
  const river = (growth.river_stage as RiverStage | undefined) ?? 'trickle';
  const crystal = (growth.crystal_tier as CrystalTier | undefined) ?? 'spark';

  const bhumiData = BHUMI_NARRATIVES[bhumi] ?? BHUMI_NARRATIVES.bijam;

  const isTeacherRole =
    can('read', 'TeacherPulse') || can('read', 'PrincipalPulse') || can('read', 'FounderPulse');
  const isStudentRole = can('read', 'StudentPulse');

  const enteringAnimation = Platform.OS === 'web' ? undefined : FadeInDown.springify();

  return (
    <AnimatedView entering={enteringAnimation} className="px-5">
      <Box className="bg-phase-canvas rounded-[40px] border border-phase-surface shadow-xl overflow-hidden mb-10">
        {/* Header */}
        <Box className="px-8 pt-8 pb-6 border-b border-phase-surface/40 bg-phase-surface/30">
          <Heading size="md" className="text-phase-text-primary">
            {t('journey.title') || 'Living Journey'}
          </Heading>
          <Text className="text-xs text-phase-text-secondary mt-2 leading-relaxed">
            {t('journey.subtitle') ||
              'Observe the evolution of your presence across the sanctuary paths.'}
          </Text>
          {phase !== 'present' && (
            <Box className="bg-phase-interactive/10 px-3 py-1 rounded-full self-start mt-4">
              <Text className="text-[10px] font-bold text-phase-interactive uppercase tracking-wider">
                HISTORICAL PERSPECTIVE
              </Text>
            </Box>
          )}
        </Box>

        {/* Path rows */}
        <Box className="px-8">
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
              stageLabel={banyan
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase())}
              narrative={BANYAN_NARRATIVES[banyan] ?? ''}
            />
          )}

          {/* River — students */}
          {isStudentRole && (
            <PathRow
              emoji="🌊"
              pathName={t('journey.riverPath')}
              stageLabel={river.charAt(0).toUpperCase() + river.slice(1)}
              narrative={RIVER_NARRATIVES[river] ?? ''}
            />
          )}

          {/* Crystal — students */}
          {isStudentRole && (
            <PathRow
              emoji="💎"
              pathName={t('journey.crystalPath')}
              stageLabel={crystal.charAt(0).toUpperCase() + crystal.slice(1)}
              narrative={CRYSTAL_NARRATIVES[crystal] ?? ''}
            />
          )}

          {/* Moon — all users, live */}
          {moon && <MoonRow moon={moon} t={t} />}

          {/* Community Resonance — aggregated from social actions */}
          <ResonanceRow stats={resonance} />

          {/* Rewards / recognition — shown as narrative signals rather than a score */}
          <RecognitionRow badges={journeyRewards?.badges ?? []} />

          {/* Whispered Moments — all users */}
          <WhisperedMomentsRow moments={moments} t={t} />
        </Box>
      </Box>
    </AnimatedView>
  );
}
