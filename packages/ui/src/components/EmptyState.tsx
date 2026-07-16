import type { LucideIcon } from '@repo/ui/icons';
import { Box, Center, Heading, Text, VStack } from '../gluestack';
import { SanctuaryButton } from './SanctuaryButton';

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
      <VStack space="md" className="items-center max-w-[300px]">
        <Box className="p-6 bg-phase-surface border border-phase-surface rounded-full mb-2">
          <Icon size={48} className="text-phase-accent" strokeWidth={1.5} />
        </Box>

        <Heading size="xl" className="text-center text-phase-text-primary">
          {title}
        </Heading>

        <Text className="text-center text-phase-text-secondary text-base leading-6">
          {description}
        </Text>

        {actionLabel && onAction && (
          <Box className="mt-4">
            <SanctuaryButton onPress={onAction} size="md" variant="outline">
              {actionLabel}
            </SanctuaryButton>
          </Box>
        )}
      </VStack>
    </Center>
  );
}
