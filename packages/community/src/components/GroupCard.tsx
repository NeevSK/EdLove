import { Box, HStack, Icon, SanctuaryCard, Text, VStack } from '@repo/ui';
import { Globe, Lock, Users } from 'lucide-react-native';
import React from 'react';

interface GroupCardProps {
  id: string;
  name: string;
  memberCount: number;
  type: 'class' | 'interest' | 'staff' | 'public';
  description?: string;
  onPress: () => void;
}

const GroupCard = React.memo(function GroupCard({
  id,
  name,
  memberCount,
  type,
  description,
  onPress,
}: GroupCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'staff':
        return <Icon as={Lock} size="xs" className="text-phase-interactive" />;
      case 'public':
        return <Icon as={Globe} size="xs" className="text-phase-interactive" />;
      default:
        return <Icon as={Users} size="xs" className="text-phase-interactive" />;
    }
  };

  return (
    <SanctuaryCard
      onPress={onPress}
      className="mb-3 rounded-3xl bg-phase-surface border border-border shadow-sm p-4 overflow-hidden"
    >
      <HStack className="items-center gap-4">
        {/* Avatar with Modern Gradient/Placeholder */}
        <Box
          className={`w-14 h-14 rounded-2xl justify-center items-center ${type === 'public' ? 'bg-phase-interactive/10' : 'bg-phase-interactive/5'}`}
        >
          <Text className="text-2xl font-bold text-phase-interactive shadow-sm">
            {(name || 'G').charAt(0).toUpperCase()}
          </Text>
        </Box>

        <VStack className="flex-1 gap-1">
          <HStack className="justify-between items-center">
            <Text className="text-ink font-bold text-[17px] flex-1 mr-2" numberOfLines={1}>
              {name}
            </Text>
            <Box className="px-2 py-0.5 rounded-full bg-phase-interactive/10 border border-phase-interactive/20">
              {getIcon()}
            </Box>
          </HStack>

          <Text className="text-ink/60 text-[13px] leading-relaxed pr-2" numberOfLines={1}>
            {description || 'A space for shared exploration and connection.'}
          </Text>

          <HStack className="items-center mt-1 gap-3">
            <HStack className="items-center gap-1.5">
              <Icon as={Users} size="xs" className="text-ink/40" />
              <Text className="text-ink/40 text-xs font-medium">{memberCount} members</Text>
            </HStack>
            <Text className="text-ink/10 text-xs">•</Text>
            <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest">
              {type}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </SanctuaryCard>
  );
});

export default GroupCard;
