import { useTranslation } from 'react-i18next';
import ScreenWrapper from '@/components/ScreenWrapper';
import { Center, Heading, Text, VStack } from '@/gluestack';
import { useTheme } from '@/hooks/useTheme';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { text } = useTheme();

  return (
    <ScreenWrapper>
      <Center className="flex-1 p-5">
        <VStack className="items-center gap-2">
          <Heading size="md" style={{ color: text.primary }}>
            {t('notifications.title') || 'Notifications'}
          </Heading>
          <Text size="sm" className="text-center" style={{ color: text.secondary }}>
            {t('notifications.empty') || 'No new notifications'}
          </Text>
        </VStack>
      </Center>
    </ScreenWrapper>
  );
}
