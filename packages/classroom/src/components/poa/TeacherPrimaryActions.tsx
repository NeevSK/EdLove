import { SanctuaryGuard } from '@repo/ui';
import { Plus, ScanLine } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight } from '@repo/ui/utils/haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export function TeacherPrimaryActions({ onCreateClassroom }: { onCreateClassroom: () => void }) {
  const { tokens } = useWorld();

  return (
    <View className="gap-4 flex-row flex-wrap items-center">
      <SanctuaryGuard action="create" subject="Classroom" requirement={{ citizenshipRequired: 3 }}>
        <Pressable
          onPress={() => {
            hapticLight();
            onCreateClassroom();
          }}
          className="bg-templeGold rounded-full px-8 h-14 shadow-lg shadow-templeGold/20 active:opacity-85 justify-center"
        >
          <View className="flex-row items-center gap-2.5">
            <Plus size={16} color={tokens.onLamp} />
            <Text className="text-black font-black uppercase text-[10px] tracking-[0.2em]">
              Create Classroom
            </Text>
          </View>
        </Pressable>
      </SanctuaryGuard>
      <SanctuaryGuard action="read" subject="Classroom" requirement={{ citizenshipRequired: 3 }}>
        <Pressable
          className="rounded-full px-8 h-14 border border-phase-canvas bg-phase-surface/50 shadow-sm active:bg-phase-canvas/20 justify-center"
          onPress={hapticLight}
        >
          <View className="flex-row items-center gap-2.5">
            <ScanLine size={16} color={tokens.ink} />
            <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
              Scan QR
            </Text>
          </View>
        </Pressable>
      </SanctuaryGuard>
    </View>
  );
}

export default TeacherPrimaryActions;
