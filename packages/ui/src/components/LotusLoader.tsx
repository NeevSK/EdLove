import { Flower } from '@repo/ui/icons';
import { BrandPulse } from './BrandPulse';
import { EaseView } from 'react-native-ease';
import { Center, Text, VStack } from '@repo/ui/gluestack';

interface LotusLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

const SIZES = {
  sm: 24,
  md: 48,
  lg: 72,
};

export default function LotusLoader({
  size = 'md',
  text = 'Loading...',
  fullscreen = false,
}: LotusLoaderProps) {
  const content = (
    <VStack space="md" className="items-center justify-center">
      <EaseView
        initialAnimate={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ type: 'timing', duration: 1500, easing: 'easeInOut', loop: 'reverse' }}
      >
        <EaseView
          initialAnimate={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ type: 'timing', duration: 12000, easing: 'linear', loop: 'repeat' }}
        >
          <Flower size={SIZES[size]} className="text-phase-accent" strokeWidth={1.5} />
        </EaseView>
      </EaseView>
      <BrandPulse size={SIZES[size]} tintColor="#6B647F" />
      {text && <Text className="text-phase-text-secondary text-sm tracking-[1px]">{text}</Text>}
    </VStack>
  );

  if (fullscreen) {
    return (
      <Center className="flex-1 z-[1000] bg-phase-canvas absolute top-0 left-0 right-0 bottom-0">
        {content}
      </Center>
    );
  }

  return <Center className="p-8">{content}</Center>;
}
