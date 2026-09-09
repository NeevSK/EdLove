import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

interface LottieSplashScreenProps {
  onAnimationFinish?: () => void;
  loop?: boolean;
  autoPlay?: boolean;
}

/** Web-safe splash fallback; native keeps the SQL/Lottie-backed animation. */
export function LottieSplashScreen({ onAnimationFinish }: LottieSplashScreenProps) {
  useEffect(() => {
    onAnimationFinish?.();
  }, [onAnimationFinish]);
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F131C',
  },
});
