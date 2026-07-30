/**
 * GENTLE PROGRESS TREE
 * Visual growth (seed → sapling → tree) over months
 * Standardized to Zero-Legacy: purged legacy components and integrated Sanctuary design system.
 */

import { Flower2, Leaf, Shapes, Sparkles, Sprout, TreePine } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useProgressTree } from '@repo/self/hooks/useProgressTree';

interface ProgressTreeProps {
  userId?: string;
}

const GROWTH_STAGES = [
  {
    minInteractions: 0,
    stage: 'seed',
    emoji: '🌱',
    label: 'Seed',
    description: 'Just beginning',
    icon: Sprout,
  },
  {
    minInteractions: 5,
    stage: 'sprout',
    emoji: '🌱',
    label: 'Sprout',
    description: 'Taking root',
    icon: Sprout,
  },
  {
    minInteractions: 15,
    stage: 'sapling',
    emoji: '🌿',
    label: 'Sapling',
    description: 'Growing steadily',
    icon: Leaf,
  },
  {
    minInteractions: 30,
    stage: 'young_tree',
    emoji: '🌳',
    label: 'Young Tree',
    description: 'Finding strength',
    icon: TreePine,
  },
  {
    minInteractions: 50,
    stage: 'tree',
    emoji: '🌲',
    label: 'Tree',
    description: 'Standing tall',
    icon: TreePine,
  },
  {
    minInteractions: 75,
    stage: 'blooming',
    emoji: '🌸',
    label: 'Blooming',
    description: 'Flourishing',
    icon: Flower2,
  },
];

export default function ProgressTree({ userId }: ProgressTreeProps) {
  const router = useRouter();
  const { interactionCount, isLoading } = useProgressTree(userId);
  const [currentStage, setCurrentStage] = useState(GROWTH_STAGES[0]!);
  const [showBloom, setShowBloom] = useState(false);
  const { t } = useTranslation();

  const treeScale = useSharedValue(0.9);
  const bloomOpacity = useSharedValue(0);
  const bloomScale = useSharedValue(0.5);

  useEffect(() => {
    treeScale.value = withRepeat(
      withTiming(1.05, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [treeScale]);

  useEffect(() => {
    const stage =
      [...GROWTH_STAGES].reverse().find((s) => interactionCount >= s.minInteractions) ||
      GROWTH_STAGES[0]!;

    if (stage.stage !== currentStage.stage && stage.minInteractions > 0) {
      setShowBloom(true);
      bloomOpacity.value = withTiming(1, { duration: 600 });
      bloomScale.value = withSpring(1.2, { damping: 10, stiffness: 100 });

      setTimeout(() => {
        bloomOpacity.value = withTiming(0, { duration: 1000 });
        setTimeout(() => setShowBloom(false), 1000);
      }, 3000);
    }

    setCurrentStage(stage);
  }, [interactionCount, currentStage.stage, bloomScale, bloomOpacity]);

  const treeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: treeScale.value }],
  }));

  const bloomAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bloomOpacity.value,
    transform: [{ scale: bloomScale.value }],
  }));

  const nextStage = GROWTH_STAGES.find((s) => s.minInteractions > interactionCount);
  const progressPercent =
    nextStage && currentStage
      ? ((interactionCount - currentStage.minInteractions) /
          (nextStage.minInteractions - currentStage.minInteractions)) *
        100
      : 100;

  if (isLoading && userId) {
    return (
      <VStack className="gap-6 w-full animate-pulse">
        <Box className="h-24 bg-white/5 rounded-3xl" />
        <Box className="h-[350px] bg-white/5 rounded-[40px]" />
        <Box className="h-32 bg-white/5 rounded-3xl" />
      </VStack>
    );
  }

  if (!userId) {
    return (
      <VStack className="items-center justify-center py-20 gap-8 bg-shroud rounded-[40px] border border-dashed border-white/10 px-8">
        <VStack className="items-center gap-3">
          <Box className="w-16 h-16 rounded-[24px] bg-sanctuarySaffron/10 items-center justify-center">
            <Icon as={Shapes} size={32} className="text-sanctuarySaffron" />
          </Box>
          <Heading className="text-sacredWhite text-center" size="md">
            Begin Your Journey
          </Heading>
          <Text className="text-mistGray/60 text-center text-sm max-w-[280px]">
            Authentication is required to nurture your personal progress tree and track organic
            growth.
          </Text>
        </VStack>
        <Button
          onPress={() => router.push('/auth')}
          className="bg-sanctuarySaffron rounded-2xl h-14 px-10 shadow-lg shadow-sanctuarySaffron/20"
        >
          <ButtonText className="text-obsidian font-black uppercase tracking-widest text-xs">
            Establish Presence
          </ButtonText>
        </Button>
      </VStack>
    );
  }

  return (
    <VStack className="gap-8 w-full">
      {/* Header Area */}
      <VStack className="gap-1.5 px-1">
        <HStack className="items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 self-start">
          <Icon as={Sparkles} size={10} className="text-sanctuarySaffron" />
          <Text className="text-[9px] font-black uppercase tracking-[0.3em] text-mistGray/60">
            Vitality Manifest
          </Text>
        </HStack>
        <Heading className="text-sacredWhite font-black tracking-tighter" size="lg">
          {t('progressTree.title') || 'Organic Growth'}
        </Heading>
      </VStack>

      {/* Tree Visualization (Main Core) */}
      <Box className="items-center justify-center p-12 bg-shroud rounded-[48px] min-h-[380px] relative border border-white/5 overflow-hidden shadow-2xl">
        {/* Background Ambient Glow */}
        <Box className="absolute w-[250px] h-[250px] bg-emeraldGreen/5 blur-[120px] rounded-full" />

        {/* Milestone Bloom Overlay */}
        {showBloom && (
          <AnimatedView
            style={[
              bloomAnimatedStyle,
              {
                position: 'absolute',
                top: 40,
                zIndex: 20,
                alignItems: 'center',
              },
            ]}
          >
            <Box className="p-6 bg-sanctuarySaffron/10 rounded-[32px] border border-sanctuarySaffron/20 items-center gap-2 backdrop-blur-md">
              <Text className="text-6xl mb-2">🌸</Text>
              <Text className="text-sanctuarySaffron font-black uppercase tracking-[0.2em] text-[10px]">
                Threshold Transcended
              </Text>
            </Box>
          </AnimatedView>
        )}

        {/* The Resonant Entity */}
        <AnimatedView
          style={[treeAnimatedStyle, { alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text className="text-[140px] drop-shadow-2xl select-none">{currentStage.emoji}</Text>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.delay(200)} className="items-center mt-8">
          <HStack className="items-center gap-3">
            <Icon as={currentStage.icon} size={24} className="text-emeraldGreen opacity-40" />
            <Heading className="text-sacredWhite text-3xl font-black tracking-tighter">
              {currentStage.label}
            </Heading>
          </HStack>
          <Box className="mt-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
            <Text className="text-mistGray/60 text-[11px] font-black uppercase tracking-[0.2em]">
              {currentStage.description}
            </Text>
          </Box>
        </AnimatedView>
      </Box>

      {/* Growth Metrics */}
      <VStack className="bg-shroud p-8 rounded-[32px] border border-white/5 gap-6 shadow-xl">
        <HStack className="justify-between items-end">
          <VStack className="gap-1">
            <Text className="text-mistGray/40 text-[9px] font-black uppercase tracking-widest pl-1">
              Accumulated Resonance
            </Text>
            <Heading size="xs" className="text-sacredWhite font-black tracking-tight pl-1">
              {interactionCount}{' '}
              <Text className="text-emeraldGreen opacity-80">
                {t('progressTree.interactionsLabel') || 'Vitality Totals'}
              </Text>
            </Heading>
          </VStack>

          {nextStage && (
            <Box className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
              <Text className="text-mistGray/60 text-[10px] font-black uppercase tracking-widest">
                {nextStage.minInteractions - interactionCount} Units to{' '}
                <Text className="text-sanctuarySaffron">{nextStage.label}</Text>
              </Text>
            </Box>
          )}
        </HStack>

        <VStack className="gap-2">
          <Box className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <Box
              className="h-full bg-emeraldGreen transition-all duration-1000 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </Box>
          <HStack className="justify-between px-1">
            <Text className="text-[8px] text-mistGray/20 font-black uppercase tracking-[0.3em]">
              Rooted
            </Text>
            <Text className="text-[8px] text-mistGray/20 font-black uppercase tracking-[0.3em]">
              Ascending
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* Guiding Philosophy */}
      <AnimatedView
        entering={FadeInDown.delay(400)}
        className="p-6 bg-white/5 rounded-3xl border border-dashed border-white/10"
      >
        <HStack className="items-center gap-4">
          <Icon as={Leaf} size={16} className="text-emeraldGreen/30" />
          <Text className="text-mistGray/40 text-[11px] font-medium leading-relaxed flex-1 italic">
            {t('progressTree.philosophy') ||
              'Growth is an organic unfolding, not a performance. Every breath, every reflection, and every moment of presence nourishes the whole. 🌱'}
          </Text>
        </HStack>
      </AnimatedView>
    </VStack>
  );
}
