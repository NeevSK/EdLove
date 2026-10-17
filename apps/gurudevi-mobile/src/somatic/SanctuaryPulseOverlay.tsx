import { Mascot } from '@repo/ui';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface SanctuaryPulseOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  isPlayfulMode?: boolean;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 4000;
const TOTAL_CYCLE_MS = INHALE_MS + HOLD_MS + EXHALE_MS; // 12,000ms

/**
 * SanctuaryPulseOverlay
 *
 * Somatic decompression space. Awakens when the device is shaken or triggered manually.
 * Combines Reanimated radial luminance, progressive haptics, and the Firefly companion
 * to guide the nervous system into steady regulation.
 */
export function SanctuaryPulseOverlay({
  visible,
  onDismiss,
  isPlayfulMode = false,
}: SanctuaryPulseOverlayProps) {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [cycleCount, setCycleCount] = useState<number>(1);

  // Animation values for the breathing pulse
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const notifyPhaseChange = (nextPhase: BreathPhase) => {
    setPhase(nextPhase);
    void Haptics.selectionAsync().catch(() => {});
  };

  const advanceCycle = () => {
    setCycleCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (!visible) {
      scale.value = 1;
      glowOpacity.value = 0.3;
      setPhase('inhale');
      setCycleCount(1);
      return;
    }

    // Announce to screen readers
    AccessibilityInfo.announceForAccessibility(
      isPlayfulMode
        ? "It's the timeee. Take a deep breath with the Firefly."
        : 'Sanctuary breath session started. Breathe in with the glowing lantern.',
    );

    // Initial shock-absorption haptic
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Phase timer loops
    let cycleTimer: NodeJS.Timeout | null = null;
    let holdTimer: NodeJS.Timeout | null = null;
    let exhaleTimer: NodeJS.Timeout | null = null;

    const startCycle = () => {
      notifyPhaseChange('inhale');

      holdTimer = setTimeout(() => {
        notifyPhaseChange('hold');
      }, INHALE_MS);

      exhaleTimer = setTimeout(() => {
        notifyPhaseChange('exhale');
      }, INHALE_MS + HOLD_MS);

      cycleTimer = setTimeout(() => {
        advanceCycle();
        startCycle();
      }, TOTAL_CYCLE_MS);
    };

    startCycle();

    // Reanimated 4 smooth breathing curve (ease-in-out)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: INHALE_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.4, { duration: HOLD_MS }), // hold at apex
        withTiming(1.0, { duration: EXHALE_MS, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: INHALE_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.75, { duration: HOLD_MS }),
        withTiming(0.25, { duration: EXHALE_MS, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    return () => {
      if (cycleTimer) clearTimeout(cycleTimer);
      if (holdTimer) clearTimeout(holdTimer);
      if (exhaleTimer) clearTimeout(exhaleTimer);
      scale.value = 1;
      glowOpacity.value = 0.3;
    };
  }, [visible, isPlayfulMode]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: glowOpacity.value,
  }));

  const handleDismiss = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onDismiss();
  };

  const getPhasePrompt = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in with the gentle light…';
      case 'hold':
        return 'Hold peacefully. You are safe here.';
      case 'exhale':
        return 'Let it go softly…';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View
        style={styles.backdrop}
        accessibilityRole="alert"
        accessibilityLabel="Sanctuary Somatic Breathing Space"
        accessibilityViewIsModal
      >
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>
            {isPlayfulMode ? "It's the timeee 🌿" : 'Sanctuary Breath'}
          </Text>
          <Text style={styles.subtitle}>
            {isPlayfulMode
              ? 'Shake it off. Take this moment for yourself.'
              : 'The world can wait. Let your nervous system settle.'}
          </Text>

          {/* Central Animated Sanctuary Pulse & Mascot */}
          <View style={styles.lanternContainer}>
            {/* Outer expanding halo */}
            <Animated.View style={[styles.haloRing, animatedRingStyle]} />

            {/* Inner glowing core */}
            <Animated.View
              style={[
                styles.coreRing,
                useAnimatedStyle(() => ({
                  transform: [{ scale: (scale.value - 1) * 0.7 + 1 }],
                  opacity: glowOpacity.value * 0.6,
                })),
              ]}
            />

            {/* Resting Firefly companion holding the light */}
            <View style={styles.mascotAnchor}>
              <Mascot size={108} mode="glowing" state="resting" glowColor="#E29447" />
            </View>
          </View>

          {/* Dynamic Breathing Cadence Prompt */}
          <View style={styles.promptContainer}>
            <Text style={styles.phasePrompt}>{getPhasePrompt()}</Text>
            <Text style={styles.cycleIndicator}>
              Breath {cycleCount} • Inhale 4s • Hold 4s • Exhale 4s
            </Text>
          </View>

          {/* Peaceful Dismissal Action */}
          <Pressable
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="I am ready to return"
            style={({ pressed }) => [styles.dismissButton, pressed && styles.dismissButtonPressed]}
          >
            <Text style={styles.dismissButtonText}>I'm ready</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 16, 11, 0.96)', // Deep twilight saffron/umber
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  title: {
    color: '#FBF5EE',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#D8C6B6',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 44,
    paddingHorizontal: 16,
  },
  lanternContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  haloRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(226, 148, 71, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(247, 194, 126, 0.45)',
  },
  coreRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(226, 148, 71, 0.35)',
  },
  mascotAnchor: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: 48,
    minHeight: 56,
  },
  phasePrompt: {
    color: '#FBF5EE',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  cycleIndicator: {
    color: '#A89280',
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: '#D4843A',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4843A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  dismissButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  dismissButtonText: {
    color: '#1A100B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
