import { View, Text, Pressable, ScrollView } from 'react-native';
import { Briefcase, ChevronRight, User } from '@repo/ui/icons';
import { hapticLight } from '@repo/ui/utils/haptics';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

interface StaffDirectoryProps {
  staff: StaffMember[];
  onSelect?: (staff: StaffMember) => void;
}

export default function StaffDirectory({ staff, onSelect }: StaffDirectoryProps) {
  if (!staff?.length)
    return (
      <View className="p-12 items-center justify-center bg-phase-canvas rounded-[32px] border border-dashed border-phase-border">
        <Text className="text-[14px] font-bold text-phaseText-muted italic opacity-60">
          Institutional directory is empty.
        </Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="gap-4">
        {staff.map((member) => (
          <Pressable
            key={member.id}
            onPress={() => {
              hapticLight();
              onSelect?.(member);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${member.name}, ${member.role}`}
            accessibilityHint="Opens staff details"
            className="active:scale-[0.98] transition-all"
          >
            <View className="p-5 bg-phase-surface rounded-[24px] border border-phase-border shadow-sm">
              <View className="flex-row items-center items-center gap-5">
                <View className="w-14 h-14 rounded-[18px] bg-phase-canvas border border-phase-border items-center justify-center">
                  <User size={16} className="text-phaseText-primary" />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-[17px] font-black text-phaseText-primary tracking-tight">
                    {member.name}
                  </Text>
                  <View className="flex-row items-center items-center gap-2">
                    <Briefcase size={12} className="text-phase-interactive" />
                    <Text className="text-[11px] font-black text-phase-interactive uppercase tracking-widest">
                      {member.role}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={12} className="text-phaseText-muted/20" />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
