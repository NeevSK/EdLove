import { BrandPulse } from '@repo/ui';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { LottieSplashScreen } from '@/components/LottieSplashScreen';

export { RouteErrorBoundary as ErrorBoundary };

export default function IndexRoute() {
  const router = useRouter();
  const hasFinished = useRef(false);

  const finishSplash = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    router.replace('/welcome');
  }, [router]);

  useEffect(() => {
    // The index route is a finite splash, not a permanent screen. Keep a
    // timeout in case the native Lottie callback is unavailable on a device.
    const timer = setTimeout(finishSplash, 8500);

    return () => clearTimeout(timer);
  }, [finishSplash]);

  // On web, use the branded pulse briefly and then continue to welcome.
  if (Platform.OS === 'web') {
    return (
      <Center className="flex-1 bg-obsidian">
        <BrandPulse size={28} />
      </Center>
    );
  }

  return <LottieSplashScreen loop={false} onAnimationFinish={finishSplash} />;
}
