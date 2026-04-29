import { MessageCircle } from '@repo/ui/icons';
import { Icon, Text } from '@repo/ui/primitives';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useTranslation } from 'react-i18next';

export function PrincipalEchoAction() {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-error shadow-sm active:bg-sanctuary-error/5"
    >
      <Icon as={MessageCircle} size="sm" className="text-sanctuary-error" />
      <Text className="text-sanctuary-error font-black uppercase text-[10px] tracking-[0.2em]">
        {t('teacher.actions.principalEcho') || 'Principal Echo'}
      </Text>
    </Pressable>
  );
}
