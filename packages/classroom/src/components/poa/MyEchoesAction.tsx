import { hapticLight, Icon, Pressable, Text } from '@repo/ui';
import { ClipboardList } from 'lucide-react-native';
import React from 'react';

export function MyEchoesAction() {
  return (
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-border shadow-sm active:bg-sanctuary-surface-secondary"
    >
      <Icon as={ClipboardList} size="sm" className="text-sanctuary-text" />
      <Text className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">
        My Echoes
      </Text>
    </Pressable>
  );
}
