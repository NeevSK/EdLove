import { View, Text } from 'react-native';
import type { School } from '@repo/core/types';
import { Building2, MapPin } from '@repo/ui/icons';

interface SchoolOverviewProps {
  school: School;
}

export default function SchoolOverview({ school }: SchoolOverviewProps) {
  if (!school) return null;

  return (
    <View className="gap-4 p-6 bg-phase-surface rounded-[32px] border border-phase-border shadow-sm">
      <View className="flex-row items-center gap-5 items-center">
        <View className="w-14 h-14 rounded-[20px] bg-phase-interactive/10 items-center justify-center">
          <Building2 size={20} className="text-phase-interactive" />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-[18px] font-black text-phaseText-primary tracking-tight">
            {school.name}
          </Text>
          <View className="flex-row items-center gap-1.5 items-center">
            <MapPin size={12} className="text-phaseText-muted" />
            <Text className="text-[13px] font-bold text-phaseText-secondary">
              {school.address || 'Sanctuary Address Unset'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
