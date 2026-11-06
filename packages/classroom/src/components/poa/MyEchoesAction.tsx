import { ClipboardList } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight } from '@repo/ui/utils/haptics';
import React from 'react';
import { Pressable, Text } from 'react-native';

export function MyEchoesAction() {
  const { tokens } = useWorld();

  return (
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-border shadow-sm active:bg-sanctuary-surface-secondary"
    >
      <ClipboardList size={16} color={tokens.ink} />
      <Text className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">
        My Echoes
      </Text>
    </Pressable>
  );
}

export default MyEchoesAction;
