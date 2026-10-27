import { useActorSnapshot } from '@repo/core/hooks';
import { sanctuaryPulseMachine } from '@repo/self/machines/sanctuaryPulseMachine';
import { Mascot } from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';
import { sensoryFeedback } from '@repo/ui/sensory';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
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
import { createActor } from 'xstate';

export interface SanctuaryPulseOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  isPlayfulMode?: boolean;
  onSessionComplete?: (durationSeconds: number) => void;
}

const PHASE_DURATION_MS = 4000;

/**
 * SanctuaryPulseOverlay
 *
 * Somatic decompression space. Awakens when the device is shaken or triggered manually.
 * Combines Reanimated radial luminance, progressive haptics, and the Firefly companion
 * to guide the nervous system into steady regulation via deterministic XState v6 statechart.
 */
export function SanctuaryPulseOverlay({
  visible,
  onDismiss,
  isPlayfulMode = false,
  onSessionComplete,
}: SanctuaryPulseOverlayProps) {
  // Deterministic XState v6 box breathing machine
  const actor = useMemo(() => {
    const act = createActor(sanctuaryPulseMachine);
    act.start();
    return act;
  }, []);

  const snapshot = useActorSnapshot(actor);
  const phase = snapshot.context.phase;
  const cycleCount = snapshot.context.cycleCount;

  // Animation values for the breathing pulse
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // Sync sensory feedback to machine phase transitions
  useEffect(() => {
    if (!visible) return;
    if (phase === 'inhale') {
      sensoryFeedback.emit('breath-start');
    } else if (phase === 'exhale') {
      sensoryFeedback.emit('breath-end');
    } else if (phase === 'holdIn' || phase === 'holdOut') {
      sensoryFeedback.emit('selection');
    }
  }, [phase, visible]);

  useEffect(() => {
    if (!visible) {
      actor.send({ type: 'INTERRUPT' });
      scale.value = 1;
      glowOpacity.value = 0.3;
      return;
    }

    // Start or restart session in statechart
    actor.send({ type: 'START', isPlayfulMode });

    // Announce to screen readers
    AccessibilityInfo.announceForAccessibility(
      isPlayfulMode
        ? "It's the timeee. Take a deep breath with the Firefly."
        : 'Sanctuary breath session started. Breathe in with the glowing lantern.',
    );

    // Initial shock-absorption haptic
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Phase ticker interval - exactly 4000ms per phase of Box Breathing
    const phaseTimer = setInterval(() => {
      actor.send({ type: 'TICK_PHASE' });
    }, PHASE_DURATION_MS);

    // Reanimated 4 smooth breathing curve (ease-in-out)
    // 4 phases: Inhale (4s) -> HoldIn (4s) -> Exhale (4s) -> HoldOut (4s)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: PHASE_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.4, { duration: PHASE_DURATION_MS }), // hold apex
        withTiming(1.0, { duration: PHASE_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: PHASE_DURATION_MS }), // rest base
      ),
      -1,
      false,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: PHASE_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.75, { duration: PHASE_DURATION_MS }),
        withTiming(0.25, { duration: PHASE_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: PHASE_DURATION_MS }),
      ),
      -1,
      false,
    );

    return () => {
      clearInterval(phaseTimer);
      actor.send({ type: 'INTERRUPT' });
      scale.value = 1;
      glowOpacity.value = 0.3;
    };
  }, [visible, isPlayfulMode, actor]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: glowOpacity.value,
  }));

  const handleDismiss = () => {
    const elapsedSeconds = snapshot.context.totalDurationSeconds;
    if (elapsedSeconds >= 12 && onSessionComplete) {
      onSessionComplete(elapsedSeconds);
    }

    actor.send({ type: 'INTERRUPT' });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onDismiss();
  };

  const getPhasePrompt = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in with the gentle light…';
      case 'holdIn':
        return 'Hold peacefully. You are safe here.';
      case 'exhale':
        return 'Let it go softly…';
      case 'holdOut':
        return 'Rest in stillness. Center yourself.';
      case 'idle':
      default:
        return 'Take a gentle breath…';
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
              Breath {cycleCount || 1} • Inhale 4s • Hold 4s • Exhale 4s • Rest 4s
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
