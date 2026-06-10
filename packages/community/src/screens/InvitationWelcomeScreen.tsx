import { useNavigation } from '@react-navigation/native';
import { identityAPI, supabase } from '@repo/core/api';

import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useSanctuaryToast } from '@repo/ui/hooks';
import { ArrowRight, GraduationCap, ShieldCheck } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface InvitationWelcomeScreenProps {
  route?: {
    params: {
      capacity: string;
      schoolName: string;
    };
  };
}

export default function InvitationWelcomeScreen({ route }: InvitationWelcomeScreenProps) {
  const navigation = useNavigation<any>();
  const { showToast } = useSanctuaryToast();
  const { t } = useTranslation();
  const capacity = route?.params?.capacity || 'User';
  const schoolName = route?.params?.schoolName || 'the Sanctuary';

  const handleJoin = async () => {
    try {
      const userId = await identityAPI.getMyInternalId();

      if (userId) {
        const { error } = await supabase
          .from('users')
          .update({
            capacity: capacity.toLowerCase(),
            organization_name: schoolName,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Database update error:', error);
          showToast({
            message:
              t('invitationWelcome.joinFailedDesc') ||
              'Unable to update your profile. Please try again.',
            type: 'error',
          });
          return;
        }
      }

      navigation.navigate('Main');
    } catch (error) {
      console.error('Error joining sanctuary:', error);
      showToast({
        message:
          t('invitationWelcome.errorDesc') || 'Something went wrong. Please contact support.',
        type: 'error',
      });
    }
  };

  return (
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <Box className="flex-1 justify-center p-8">
        <VStack className="gap-12 items-center">
          <Animated.View entering={FadeInDown.duration(800).springify()}>
            <VStack className="items-center gap-4">
              <Box className="w-20 h-20 rounded-[32px] bg-phase-interactive/10 items-center justify-center">
                <Icon as={ShieldCheck} size="xl" className="text-phase-interactive" />
              </Box>
              <Text className="text-phase-interactive text-sm font-black uppercase tracking-[4px]">
                {t('invitationWelcome.invited') || 'Call to Action'}
              </Text>
            </VStack>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()}>
            <VStack className="gap-2 items-center">
              <Heading className="text-4xl text-ink text-center font-black leading-tight">
                {t('invitationWelcome.welcomeTo', { schoolName }) || `Welcome to ${schoolName}`}
              </Heading>
              <Text className="text-ink/40 text-base text-center font-medium px-4">
                {t('invitationWelcome.desc') ||
                  'Your presence has been requested within this sanctuary.'}
              </Text>
            </VStack>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(800).springify()}
            style={{ width: '100%' }}
          >
            <Box className="bg-phase-surface p-6 rounded-[32px] border border-border shadow-sm">
              <HStack className="items-center gap-5">
                <Box className="w-12 h-12 rounded-2xl bg-ink/5 items-center justify-center">
                  <Icon as={GraduationCap} size="sm" className="text-ink" />
                </Box>
                <VStack className="gap-0.5">
                  <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest text-left">
                    {t('invitationWelcome.capacity') || 'Sovereign Capacity'}
                  </Text>
                  <Text className="text-ink text-lg font-black text-left">
                    {capacity.charAt(0).toUpperCase() + capacity.slice(1)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(800).springify()}
            style={{ width: '100%' }}
          >
            <SanctuaryButton
              action="primary"
              className="w-full h-16 rounded-[24px] shadow-xl"
              onPress={handleJoin}
            >
              <HStack className="items-center gap-2">
                <Text className="text-white text-lg font-black">
                  {t('invitationWelcome.joinButton') || 'Enter Sanctuary'}
                </Text>
                <Icon as={ArrowRight} size="sm" className="text-white" />
              </HStack>
            </SanctuaryButton>
          </Animated.View>
        </VStack>
      </Box>
    </ScreenWrapper>
  );
}
