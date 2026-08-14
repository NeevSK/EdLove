import { Center } from '@repo/ui/primitives';
import { BrandPulse } from '@repo/ui';
import { LottieSplashScreen } from '@/components/LottieSplashScreen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export default function IndexRoute() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Fallback to spinner after 3 seconds if Lottie doesn't load
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // On web or fallback, use the branded pulse since Lottie may have performance issues
  if (Platform.OS === 'web' || showFallback) {
    return (
      <Center className="flex-1 bg-obsidian">
        <BrandPulse size={28} />
      </Center>
    );
  }

  return <LottieSplashScreen loop={true} />;
}
