/**
 * SHADOW AGENT DRAWER
 * The Quiet Drawer - A space for reflection and gentle guidance.
 * Standardized to Zero-Legacy: native layout + Lucide vector icons.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { hapticLight } from '@repo/ui/utils/haptics';
import { Coffee, Moon, Sparkles, Sun, X, Zap } from '@repo/ui/icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function ShadowAgentDrawer() {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSeed, setCurrentSeed] = useState('');
  const [contextualSuggestion, setContextualSuggestion] = useState<{
    message: string;
    icon: any;
  } | null>(null);

  const THOUGHT_SEEDS = useMemo(
    () => [
      t('shadowAgent.prompts.heavy') || 'What feels heavy today?',
      t('shadowAgent.prompts.peace') || 'Where did you find peace?',
      t('shadowAgent.prompts.holding') || 'What are you holding onto?',
      t('shadowAgent.prompts.release') || 'What can you release?',
      t('shadowAgent.prompts.joy') || 'Recall a moment of joy.',
    ],
    [t],
  );

  const CONTEXTUAL_SUGGESTIONS = useMemo(
    () => [
      {
        condition: 'late_night',
        message: t('shadowAgent.nudges.lateNight') || 'The world is quiet. Take a breath.',
        icon: Moon,
      },
      {
        condition: 'early_morning',
        message: t('shadowAgent.nudges.earlyStart') || 'A new genesis awaits you.',
        icon: Sun,
      },
      {
        condition: 'midday',
        message: t('shadowAgent.nudges.lowEnergy') || 'A gentle pause for momentum.',
        icon: Coffee,
      },
    ],
    [t],
  );

  // Orb breathing animation
  const orbScale = useSharedValue(1);
  const orbGlow = useSharedValue(0.4);

  useEffect(() => {
    orbScale.value = withRepeat(
      withTiming(1.15, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    orbGlow.value = withRepeat(
      withTiming(0.8, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [orbScale, orbGlow]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbGlow.value,
  }));

  const handleOpenDrawer = () => {
    hapticLight();
    const randomSeed = THOUGHT_SEEDS[Math.floor(Math.random() * THOUGHT_SEEDS.length)];
    setCurrentSeed(randomSeed || '');
    const hour = new Date().getHours();
    let suggestion = null;
    if (hour >= 22 || hour < 5) {
      suggestion = CONTEXTUAL_SUGGESTIONS.find((s) => s.condition === 'late_night');
    } else if (hour >= 5 && hour < 8) {
      suggestion = CONTEXTUAL_SUGGESTIONS.find((s) => s.condition === 'early_morning');
    } else if (hour >= 11 && hour < 14) {
      suggestion = CONTEXTUAL_SUGGESTIONS.find((s) => s.condition === 'midday');
    }
    setContextualSuggestion(suggestion || null);
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    hapticLight();
    setIsOpen(false);
  };

  const SuggestionIcon = contextualSuggestion?.icon;

  return (
    <>
      {/* Glowing Orb Trigger */}
      <View className="absolute bottom-24 right-6 z-50">
        <Pressable
          onPress={handleOpenDrawer}
          accessibilityRole="button"
          accessibilityLabel="Open Shadow Agent"
          accessibilityHint="Opens a quiet reflection prompt"
        >
          <Animated.View style={orbStyle}>
            <View className="w-14 h-14 rounded-full bg-sanctuarySaffron items-center justify-center shadow-xl shadow-sanctuarySaffron/40">
              <Sparkles size={24} className="text-obsidian" />
            </View>
          </Animated.View>
        </Pressable>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleCloseDrawer}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={handleCloseDrawer}>
          <Pressable className="w-full h-1/2" onPress={(e) => e.stopPropagation()}>
            <View className="flex-1 bg-obsidian rounded-t-[40px] border-t border-white/10 p-xl">
              {/* Handle bar */}
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-8 opacity-50" />

              {/* Close Button */}
              <Pressable
                onPress={handleCloseDrawer}
                accessibilityRole="button"
                accessibilityLabel="Close Shadow Agent"
                accessibilityHint="Closes the reflection drawer"
                className="absolute top-8 right-8 z-10 p-2 bg-white/5 rounded-full border border-white/5 active:scale-90 transition-all"
              >
                <X className="text-mistGray" size={18} />
              </Pressable>

              <View className="gap-8">
                {/* Title */}
                <Animated.View entering={FadeIn.duration(800)}>
                  <Text className="text-sacredWhite font-black tracking-tight text-2xl">
                    {t('shadowAgent.title') || 'The Quiet Space'}
                  </Text>
                  <Text className="text-mistGray/60 text-sm mt-1 font-medium">
                    {t('shadowAgent.subtitle') || 'A moment for reflection.'}
                  </Text>
                </Animated.View>

                {/* Contextual Suggestion */}
                {contextualSuggestion && SuggestionIcon && (
                  <Animated.View entering={FadeInDown.delay(200)}>
                    <View className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-sm">
                      <View className="gap-3">
                        <View className="flex-row items-center gap-2 opacity-50">
                          <SuggestionIcon size={12} className="text-sanctuarySaffron" />
                          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuarySaffron">
                            Gentle Nudge
                          </Text>
                        </View>
                        <Text className="text-sacredWhite/80 text-lg font-medium leading-relaxed italic">
                          {contextualSuggestion.message}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                )}

                {/* Thought Seed */}
                <Animated.View entering={FadeInDown.delay(400)}>
                  <View className="bg-white/5 p-6 rounded-3xl border-l-4 border-sanctuarySaffron border-y border-r border-white/5">
                    <View className="gap-3">
                      <View className="flex-row items-center gap-2 opacity-50">
                        <Zap size={12} className="text-sanctuarySaffron" />
                        <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuarySaffron">
                          Thought Seed
                        </Text>
                      </View>
                      <Text className="text-sacredWhite text-xl font-bold leading-relaxed">
                        {currentSeed}
                      </Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Contemplation Space */}
                <Animated.View entering={FadeInDown.delay(600)}>
                  <View className="gap-2 px-1">
                    <Text className="text-mistGray/50 text-xs font-medium italic">
                      "Sometimes questions are more valuable than answers. Take your time."
                    </Text>
                  </View>
                </Animated.View>

                {/* Future Growth Hook */}
                <Animated.View entering={FadeIn.delay(1000)}>
                  <View className="mt-4 py-3 border-t border-white/5 items-center">
                    <Text className="text-[9px] font-black uppercase tracking-[0.3em] text-mistGray/30">
                      ✨ This Sanctuary evolves with you
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
