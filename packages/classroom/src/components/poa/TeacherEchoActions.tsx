import { SanctuaryGuard } from '@repo/ui';
import { ClipboardList, MessageCircle } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight } from '@repo/ui/utils/haptics';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export function TeacherEchoActions() {
  const { tokens } = useWorld();
  const { t } = useTranslation();

  return (
    <View className="gap-4 flex-row flex-wrap items-center">
      <SanctuaryGuard action="read" subject="School" requirement={{ citizenshipRequired: 3 }}>
        <Pressable
          onPress={hapticLight}
          className="rounded-full px-8 h-14 border border-emberRed/40 shadow-sm bg-phase-surface active:bg-emberRed/5 justify-center"
        >
          <View className="flex-row items-center gap-2.5">
            <MessageCircle size={16} color={tokens.danger} />
            <Text className="text-emberRed font-black uppercase text-[10px] tracking-[0.2em]">
              {t('teacher.actions.principalEcho') || 'Principal Echo'}
            </Text>
          </View>
        </Pressable>
      </SanctuaryGuard>
      <SanctuaryGuard action="read" subject="School" requirement={{ citizenshipRequired: 3 }}>
        <Pressable
          onPress={hapticLight}
          className="rounded-full px-8 h-14 border border-phase-canvas bg-phase-surface/50 shadow-sm active:bg-phase-canvas/20 justify-center"
        >
          <View className="flex-row items-center gap-2.5">
            <ClipboardList size={16} color={tokens.ink} />
            <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
              My Echoes
            </Text>
          </View>
        </Pressable>
      </SanctuaryGuard>
    </View>
  );
}

export default TeacherEchoActions;
