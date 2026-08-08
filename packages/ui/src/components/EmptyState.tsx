import type { LucideIcon } from '@repo/ui/icons';
import { Box, Center, Heading, Text, VStack } from '@repo/ui/gluestack';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  minHeight?: number;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  minHeight = 300,
}: EmptyStateProps) {
  return (
    <Center style={{ minHeight }} className="p-8">
      <Animated.View
        entering={FadeInUp.duration(600).springify()}
        style={{ width: '100%' }}
      >
        <VStack space="md" className="items-center max-w-[300px]">
          <Animated.View
            entering={ZoomIn.duration(400).delay(100)}
            className="p-6 bg-phase-surface border border-phase-surface rounded-full mb-2"
          >
            <Icon size={48} className="text-phase-accent" strokeWidth={1.5} />
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(200)}>
            <Heading size="xl" className="text-center text-phase-text-primary">
              {title}
            </Heading>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(300)}>
            <Text className="text-center text-phase-text-secondary text-base leading-6">
              {description}
            </Text>
          </Animated.View>

          {actionLabel && onAction && (
            <Animated.View entering={FadeInUp.duration(500).delay(400)}>
              <Box className="mt-4">
                <SanctuaryButton onPress={onAction} size="md" variant="outline">
                  {actionLabel}
                </SanctuaryButton>
              </Box>
            </Animated.View>
          )}
        </VStack>
      </Animated.View>
    </Center>
  );
}
