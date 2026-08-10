import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';

interface LottieSplashScreenProps {
  onAnimationFinish?: () => void;
  loop?: boolean;
  autoPlay?: boolean;
}

export function LottieSplashScreen({
  onAnimationFinish,
  loop = false,
  autoPlay = true,
}: LottieSplashScreenProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay) {
      animationRef.current?.play();
    }
  }, [autoPlay]);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../../assets/splash-animation.json')}
        autoPlay={autoPlay}
        loop={loop}
        onAnimationFinish={onAnimationFinish}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F131C', // Dark background for splash
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
