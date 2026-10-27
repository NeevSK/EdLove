import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable } from '@repo/ui/primitives';
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentRef } from 'react';

const danceAnimation = require('../../assets/animations/tutii-happy-dance.json');
const danceStill = require('../../assets/animations/tutii-dance.png');

export default function TutiiDancePreviewScreen() {
  const animationRef = useRef<ComponentRef<typeof LottieView>>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [animationFailed, setAnimationFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const { width } = useWindowDimensions();
  const animationWidth = Math.min(width - 24, 440);
  const animationHeight = animationWidth * 1.2;

  useEffect(() => {
    let mounted = true;
    const handleReduceMotion = (enabled: boolean) => {
      if (mounted) setReduceMotion(enabled);
    };

    void AccessibilityInfo.isReduceMotionEnabled()
      .then(handleReduceMotion)
      .catch(() => handleReduceMotion(true));
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      handleReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const showStill = reduceMotion || animationFailed;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>A LITTLE TUTII MOMENT</Text>
        <Text style={styles.title}>A happy little dance</Text>
        <Text style={styles.subtitle}>A small celebration, just because.</Text>

        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={
            showStill ? 'Tutii smiling in a joyful dance pose' : 'Tutii dances in a joyful circle'
          }
          style={[styles.animationStage, { width: animationWidth, height: animationHeight }]}
        >
          {showStill ? (
            <Image
              resizeMode="contain"
              source={danceStill}
              style={styles.character}
            />
          ) : (
            <LottieView
              ref={animationRef}
              autoPlay
              cacheComposition
              loop
              onAnimationFailure={() => setAnimationFailed(true)}
              resizeMode="contain"
              source={danceAnimation}
              style={[styles.character, { width: animationWidth, height: animationHeight }]}
              webStyle={{ width: animationWidth, height: animationHeight }}
            />
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={showStill}
          onPress={() => {
            if (isPlaying) {
              animationRef.current?.pause();
            } else {
              animationRef.current?.play();
            }
            setIsPlaying(!isPlaying);
          }}
          style={({ pressed }) => [styles.button, pressed && !showStill && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>
            {showStill ? 'Tutii is resting' : isPlaying ? 'Pause dance' : 'Dance again'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F4EC',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
  },
  eyebrow: {
    color: '#758465',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
  },
  title: {
    marginTop: 10,
    color: '#2E3328',
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 7,
    color: '#75776C',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  animationStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  character: {
    width: '100%',
    height: '100%',
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: '#41513B',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#FFFDF7',
    fontSize: 15,
    fontWeight: '600',
  },
});
