import type { LucideIcon } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '@repo/ui/gluestack';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';

interface DailyResonanceCardProps {
  title: string;
  content: string;
  author?: string;
  icon: LucideIcon;
  type?: 'motivation' | 'wisdom' | 'general';
  className?: string;
}

/**
 * DailyResonanceCard - A specialized SanctuaryCard for daily insights.
 * Aligned with the "Sanctuary Protocol" and "Active Resonance".
 */
export const DailyResonanceCard = ({
  title,
  content,
  author,
  icon: Icon,
  type = 'general',
  className,
}: DailyResonanceCardProps) => {
  return (
    <SanctuaryCard className={className}>
      <VStack className="gap-4">
        <HStack className="items-center gap-3">
          <Box
            className={`
                            p-2 rounded-xl
                            ${type === 'motivation' ? 'bg-phase-accent/15' : 'bg-phase-accent/10'}
                        `}
          >
            <Icon size={20} className="text-phase-accent" />
          </Box>
          <Text className="text-phase-text-secondary text-sm font-bold tracking-widest uppercase">
            {title}
          </Text>
        </HStack>

        <VStack className="gap-2">
          <Text className="text-phase-text-primary text-lg leading-7 font-medium">
            &quot;{content}&quot;
          </Text>
          {author && (
            <Text className="text-phase-text-secondary/70 text-sm italic text-right mt-2">
              — {author}
            </Text>
          )}
        </VStack>
      </VStack>
    </SanctuaryCard>
  );
};
