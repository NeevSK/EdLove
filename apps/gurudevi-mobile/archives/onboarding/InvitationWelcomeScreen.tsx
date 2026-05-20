import { useNavigation } from '@react-navigation/native';
import { identityAPI } from '@repo/core/api';
import { supabase } from '@repo/core/native';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { Theme } from '@repo/ui/theme';
import { useTranslation } from 'react-i18next';

interface InvitationWelcomeScreenProps {
  route?: {
    params: {
      role: string;
      schoolName: string;
    };
  };
}
export default function InvitationWelcomeScreen({ route }: InvitationWelcomeScreenProps) {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const { t } = useTranslation();
  const role = route?.params?.role || 'User';
  const schoolName = route?.params?.schoolName || 'the Sanctuary';
  const handleJoin = async () => {
    try {
      const userId = await identityAPI.getMyInternalId();
      if (userId) {
        // In a real app, we would update the user's role in the database
        const { error } = await supabase
          .from('users')
          .update({
            role: role.toLowerCase(),
            organization_name: schoolName,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq('id', userId);
        if (error) {
          console.error('Database update error:', error);
          toast.show({
            placement: 'top',
            render: ({ id }) => (
              <Toast nativeID={id} action="error" variant="solid">
                <ToastTitle>{t('invitationWelcome.joinFailed')}</ToastTitle>
                <ToastDescription>{t('invitationWelcome.joinFailedDesc')}</ToastDescription>
              </Toast>
            ),
          });
          return;
        }
      }
      // Navigate to Main screen on success (or if no session for demo)
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error joining sanctuary:', error);
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>{t('invitationWelcome.errorTitle')}</ToastTitle>
            <ToastDescription>{t('invitationWelcome.errorDesc')}</ToastDescription>
          </Toast>
        ),
      });
    }
  };
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: Theme.colors.obsidian,
        justifyContent: 'center',
        padding: Theme.spacing.xl,
      }}
    >
      <VStack space="xl" alignItems="center">
        <Text color={Theme.colors.sanctuarySaffron} size="xl" bold>
          {t('invitationWelcome.invited')}
        </Text>
        <Heading size="2xl" color={Theme.colors.sacredWhite} textAlign="center">
          {t('invitationWelcome.welcomeTo', { schoolName })}
        </Heading>
        <Box
          sx={{
            backgroundColor: Theme.colors.ink,
            padding: Theme.spacing.md,
            borderRadius: Theme.corners.comfortable,
          }}
        >
          <Text color={Theme.colors.mistGray}>
            {t('invitationWelcome.role')}:{' '}
            <Text color={Theme.colors.sacredWhite} bold>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
          </Text>
        </Box>
        <Button
          size="lg"
          variant="solid"
          action="primary"
          sx={{ backgroundColor: Theme.colors.sanctuarySaffron, width: '100%' }}
          onPress={handleJoin}
        >
          <ButtonText color={Theme.colors.obsidian} bold>
            {t('invitationWelcome.joinButton')}
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
