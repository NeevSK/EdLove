import { Image as ExpoImage } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { MascotRole, MascotState } from './mascotTypes';

export interface TutiiLivingProps {
  /** The community role or attire of Tutii */
  role?: MascotRole;
  /** Emotional state or gesture */
  state?: MascotState;
  /** Size in DP (width and height) */
  size?: number;
  /** Disable continuous animation loops for accessibility (prefers-reduced-motion) */
  reducedMotion?: boolean;
  /** Callback fired whenever Tutii naturally blinks */
  onBlink?: () => void;
}

// 1. Inpainted Micro-Life Overlays (Cropped from master artwork, <35KB total)
const EYELIDS_LAYER = require('../../assets/mascot/living/eyelids_cropped.webp');
const LANTERN_GLOW_LAYER = require('../../assets/mascot/living/lantern_glow_cropped.webp');

// 2. Base Guide Cutouts (1184x1187 Gouache Masters)
const GUIDE_CUTOUTS: Record<MascotState, any> = {
  guiding: require('../../assets/mascot/firefly-guide-welcome-light-cutout-v2.webp'),
  curious: require('../../assets/mascot/firefly-guide-explore-light-cutout-v2.webp'),
  resting: require('../../assets/mascot/firefly-guide-offline-light-cutout-v2.webp'),
  interrupted: require('../../assets/mascot/firefly-guide-error-light-cutout-v2.webp'),
  complete: require('../../assets/mascot/firefly-guide-pro-light-cutout-v2.webp'),
};

// 3. Community Roles & Attire
const ROLE_ARTWORK: Partial<Record<MascotRole, any>> = {
  student: require('../../assets/mascot/roles/role-student-reading.png'),
  teacher: require('../../assets/mascot/roles/role-teacher-welcome.png'),
  guardian: require('../../assets/mascot/roles/role-guardian-welcome.png'),
};

/**
 * TutiiLiving:
 * Canonical production-grade living mascot component.
 * Executes thoracic respiration, natural randomized blinking, bioluminescent glow,
 * and community wardrobe attachments on the native C++ UI thread.
 */
export function TutiiLiving({
  role = 'guide',
  state = 'guiding',
  size = 280,
  reducedMotion: propReducedMotion = false,
  onBlink,
}: TutiiLivingProps) {
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReducedMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReducedMotion);
    return () => sub.remove();
  }, []);

  const isMotionDisabled = propReducedMotion || systemReducedMotion;

  // UI-thread worklet values
  const hoverY = useSharedValue(0);
  const breathScale = useSharedValue(1);
  const eyelidOpacity = useSharedValue(0);
  const lanternPulse = useSharedValue(0.7);

  // 1. Thoracic Respiration & Floating Worklet
  useEffect(() => {
    if (isMotionDisabled) {
      hoverY.set(withTiming(0, { duration: 300 }));
      breathScale.set(withTiming(1, { duration: 300 }));
      return;
    }

    hoverY.set(
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
          withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );

    breathScale.set(
      withRepeat(
        withSequence(
          withTiming(1.015, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.985, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [isMotionDisabled, hoverY, breathScale]);

  // 2. Bioluminescent Lantern Glow Pulse
  useEffect(() => {
    if (isMotionDisabled) {
      lanternPulse.set(withTiming(0.8, { duration: 300 }));
      return;
    }

    lanternPulse.set(
      withRepeat(
        withSequence(
          withTiming(0.95, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.45, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
  }, [isMotionDisabled, lanternPulse]);

  // 3. Natural Randomized Eyelid Blink Engine
  const triggerBlink = useCallback(() => {
    const isDoubleBlink = Math.random() < 0.25;

    if (onBlink) {
      scheduleOnRN(onBlink);
    }

    if (isDoubleBlink) {
      eyelidOpacity.set(
        withSequence(
          withTiming(1, { duration: 90, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 110, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 80, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 130, easing: Easing.out(Easing.quad) }),
        ),
      );
    } else {
      eyelidOpacity.set(
        withSequence(
          withTiming(1, { duration: 120, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 150, easing: Easing.out(Easing.quad) }),
        ),
      );
    }
  }, [onBlink, eyelidOpacity]);

  useEffect(() => {
    if (isMotionDisabled || state === 'resting') {
      eyelidOpacity.set(withTiming(state === 'resting' ? 1 : 0, { duration: 200 }));
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const scheduleNext = () => {
      const delay = Math.random() * 2600 + 3200; // 3.2s to 5.8s natural cadence
      timeoutId = setTimeout(() => {
        if (isCancelled) return;
        triggerBlink();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isMotionDisabled, state, triggerBlink, eyelidOpacity]);

  // Animated worklet styles
  const animatedBodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hoverY.get() }, { scaleY: breathScale.get() }],
  }));

  const animatedEyelidStyle = useAnimatedStyle(() => ({
    opacity: eyelidOpacity.get(),
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: lanternPulse.get(),
  }));

  // Resolve base illustration
  const isCustomRole = role !== 'guide';
  const artworkSource = isCustomRole
    ? ROLE_ARTWORK[role] || ROLE_ARTWORK.student
    : GUIDE_CUTOUTS[state] || GUIDE_CUTOUTS.guiding;

  const showMicroLifeLayers = !isCustomRole && (state === 'guiding' || state === 'curious');

  return (
    <View style={[styles.container, { width: size, height: size }]} testID="tutii-living-container">
      <Animated.View style={[styles.characterAnchor, animatedBodyStyle]}>
        {/* Layer 1: Hand-Painted Base Illustration / Attire */}
        <ExpoImage
          source={artworkSource}
          style={styles.fullImage}
          contentFit="contain"
          transition={250}
          cachePolicy="disk"
        />

        {/* Layer 2: Inpainted Living Eyelids */}
        {showMicroLifeLayers && (
          <Animated.View
            pointerEvents="none"
            testID="tutii-eyelids-layer"
            style={[
              styles.eyelidAnchor,
              {
                left: '42.48%',
                top: '28.47%',
                width: '18.75%',
                height: '11.29%',
              },
              animatedEyelidStyle,
            ]}
          >
            <ExpoImage
              source={EYELIDS_LAYER}
              style={styles.fullImage}
              contentFit="contain"
              cachePolicy="disk"
            />
          </Animated.View>
        )}

        {/* Layer 3: Bioluminescent Lantern Glow */}
        {showMicroLifeLayers && (
          <Animated.View
            pointerEvents="none"
            testID="tutii-glow-layer"
            style={[
              styles.glowAnchor,
              {
                left: '30.91%',
                top: '10.45%',
                width: '31.67%',
                height: '8.51%',
              },
              animatedGlowStyle,
            ]}
          >
            <ExpoImage
              source={LANTERN_GLOW_LAYER}
              style={styles.fullImage}
              contentFit="contain"
              cachePolicy="disk"
            />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterAnchor: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  eyelidAnchor: {
    position: 'absolute',
  },
  glowAnchor: {
    position: 'absolute',
  },
});
