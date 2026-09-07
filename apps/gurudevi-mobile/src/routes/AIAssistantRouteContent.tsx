import { AIAssistantScreen } from '@repo/ai/assistant';
import { BrandPulse, FireflyProductMoment } from '@repo/ui';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

import { fireflyProductArtwork } from '@/brand/mascotArtwork';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading AI assistant" />
    </Center>
  );
}

function PremiumGuard() {
  return (
    <Center className="flex-1 bg-phase-canvas">
      <FireflyProductMoment
        kind="pro"
        message="The AI Assistant is available to Gurudevi Pro and Institutional members. Ask your school administrator or explore an upgrade on the web portal."
        artwork={fireflyProductArtwork.pro}
        title="A deeper way to learn"
      />
    </Center>
  );
}

/** Shared content for every Expo Router entry to the premium AI assistant. */
export function AIAssistantRouteContent() {
  const { isPremium } = usePremiumStatus();

  if (!isPremium) return <PremiumGuard />;

  return (
    <Suspense fallback={<Fallback />}>
      <AIAssistantScreen />
    </Suspense>
  );
}
