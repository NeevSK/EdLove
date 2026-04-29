import { Icon, ScanLine, Text } from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import React from 'react';

export function ScanQRAction() {
  return (
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-border shadow-sm active:bg-sanctuary-surface-secondary"
    >
      <Icon as={ScanLine} size="sm" className="text-sanctuary-text" />
      <Text className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">
        Scan QR
      </Text>
    </Pressable>
  );
}
