import { MessageCircle } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight } from '@repo/ui/utils/haptics';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

export function PrincipalEchoAction() {
  const { tokens } = useWorld();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-error shadow-sm active:bg-sanctuary-error/5"
    >
      <MessageCircle size={16} color={tokens.danger} />
      <Text className="text-sanctuary-error font-black uppercase text-[10px] tracking-[0.2em]">
        {t('teacher.actions.principalEcho') || 'Principal Echo'}
      </Text>
    </Pressable>
  );
}

export default PrincipalEchoAction;
