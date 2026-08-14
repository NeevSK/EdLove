import { AIAssistantScreen } from '@repo/ai/assistant';
import { BrandPulse } from '@repo/ui';
import { Flower2 } from '@repo/ui/icons';
import { Center, Text, VStack } from '@repo/ui/primitives';
import { Suspense } from 'react';
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
    <Center className="flex-1 bg-obsidian p-6">
      <VStack
        className="items-center bg-phase-canvas rounded-[32px] p-8 max-w-sm border border-phase-surface/60 shadow-xl"
        space="md"
      >
        <Center className="w-16 h-16 bg-[#F2994A]/10 rounded-2xl mb-2">
          <Flower2 size={32} color="#F2994A" strokeWidth={2.5} />
        </Center>
        <Text className="text-xl font-bold text-phase-text-primary text-center">
          Premium Feature Gated
        </Text>
        <Text className="text-sm text-phase-text-secondary text-center leading-relaxed">
          The AI Assistant is available exclusively to Gurudevi Pro and Institutional members.
        </Text>
        <Text className="text-xs text-[#F2994A] font-semibold text-center mt-2">
          Ask your school administrator or upgrade your plan on our web portal to gain access.
        </Text>
      </VStack>
    </Center>
  );
}

export default function AIAssistantRoute() {
  const { isPremium } = usePremiumStatus();

  if (!isPremium) {
    return <PremiumGuard />;
  }

  return (
    <Suspense fallback={<Fallback />}>
      <AIAssistantScreen />
    </Suspense>
  );
}
