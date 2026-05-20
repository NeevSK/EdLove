import { Box, HStack, Icon, Text, VStack } from '@repo/ui/primitives';

export const StudentStatCard = ({ stat, isDemo }: { stat: any; isDemo: boolean }) => {
  if (!stat) return null;

  return (
    <VStack className="flex-1 bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-6 gap-4 min-w-[150px]">
      <Box className="w-10 h-10 bg-sanctuary-surface-secondary rounded-2xl items-center justify-center border border-sanctuary-border/30">
        <Icon as={stat.icon} size="sm" className={stat.colorClass || 'text-sanctuarySaffron'} />
      </Box>
      <Box>
        <HStack className="items-baseline gap-1">
          <Text className="text-3xl font-black text-sanctuary-text tracking-tighter">
            {stat.value}
          </Text>
          {isDemo && stat.value !== '' && (
            <Text className="text-sm font-black text-sanctuarySaffron mb-1">&</Text>
          )}
        </HStack>
        <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-widest mt-1">
          {stat.label}
        </Text>
      </Box>
    </VStack>
  );
};

export const StudentStats = ({ stats, isDemo }: { stats: any[]; isDemo: boolean }) => {
  return (
    <HStack className="flex-wrap gap-4 mb-10 w-full">
      {stats.map((stat, i) => (
        <StudentStatCard key={i} stat={stat} isDemo={isDemo} />
      ))}
    </HStack>
  );
};
