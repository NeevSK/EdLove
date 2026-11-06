import { Plus } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight } from '@repo/ui/utils/haptics';
import React from 'react';
import { Pressable, Text } from 'react-native';

export function CreateClassroomAction({ onCreateClassroom }: { onCreateClassroom: () => void }) {
  const { tokens } = useWorld();

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onCreateClassroom();
      }}
      className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuarySaffron shadow-sm active:opacity-85"
    >
      <Plus size={16} color={tokens.onLamp} />
      <Text className="text-sacredWhite font-black uppercase text-[10px] tracking-[0.2em]">
        Create Classroom
      </Text>
    </Pressable>
  );
}

export default CreateClassroomAction;
