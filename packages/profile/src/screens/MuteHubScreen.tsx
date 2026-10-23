import { socialAPI } from '@repo/core/api/client';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { Shield, UserCheck } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, ScrollView } from 'react-native';

interface MutedUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  capacity?: string;
}

export default function MuteHubScreen() {
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();

  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMutes = useCallback(async () => {
    try {
      setError(null);
      const data = await socialAPI.getMutedUsers();
      setMutedUsers((data as unknown as MutedUser[]) || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load muted connections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMutes();
  }, [fetchMutes]);

  const handleUnmute = async (userId: string, userName: string) => {
    Alert.alert(
      t('profile.safety.unmuteTitle') || 'Unmute User',
      t('profile.safety.unmuteConfirm', { name: userName }) ||
        `Are you sure you want to unmute ${userName}?`,
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('profile.safety.unmuteAction') || 'Unmute',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialAPI.unblockUser(userId);
              hapticSuccess();
              setError(null);
              setMutedUsers((prev) => prev.filter((u) => u.id !== userId));
            } catch (error) {
              showToast({
                message:
                  error instanceof Error
                    ? error.message
                    : t('profile.safety.unmuteFailedMessage') || 'Please try again.',
                type: 'error',
              });
            }
          },
        },
      ],
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMutes();
  };

  return (
    <ScreenWrapper scroll={false}>
      <GlobalHeader
        title={t('profile.safety_hub') || 'Safety Hub'}
        showBack
        onBack={() => safeBack('/profile')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.colors.primary}
          />
        }
      >
        <VStack space="lg">
          <Box className="p-4 bg-phase-canvas rounded-2xl border border-phase-surface shadow-sm">
            <HStack space="md" className="items-center">
              <Icon as={Shield} size={24} color={tokens.colors.primary} />
              <VStack className="flex-1">
                <Text className="text-phase-text-primary font-bold">
                  {t('profile.safety.mutedTotal') || 'Muted Connections'}
                </Text>
                <Text className="text-phase-text-secondary text-xs">
                  {t('profile.safety.mutedDesc') ||
                    'People whose updates are hidden from your feed.'}
                </Text>
              </VStack>
            </HStack>
          </Box>

          {error && mutedUsers.length > 0 && (
            <Box className="p-3 rounded-xl bg-phase-surface">
              <Text className="text-phase-text-secondary text-xs" accessibilityRole="alert">
                {error}
              </Text>
            </Box>
          )}

          <Heading className="text-phase-text-secondary text-sm mt-4">
            {t('profile.safety.mutedList') || 'Muted List'} ({mutedUsers.length})
          </Heading>

          {loading ? (
            <Center className="py-12">
              <BrandPulse accessibilityLabel={t('accessibility.loading', 'Loading, please wait')} />
            </Center>
          ) : error && mutedUsers.length === 0 ? (
            <BrandedErrorState
              title={t('profile.safety.loadFailed') || 'Muted connections could not be loaded'}
              message={error}
            >
              <Button size="sm" onPress={() => void fetchMutes()}>
                <ButtonText>{t('common.retry') || 'Try again'}</ButtonText>
              </Button>
            </BrandedErrorState>
          ) : mutedUsers.length === 0 ? (
            <BrandedEmptyState
              title={t('profile.safety.noMutes') || 'Your list is empty.'}
              message={
                t('profile.safety.mutedDesc') || 'People whose updates are hidden from your feed.'
              }
            />
          ) : (
            <VStack space="sm">
              {mutedUsers.map((user) => (
                <Box
                  key={user.id}
                  className="p-4 bg-phase-canvas rounded-2xl border border-phase-surface"
                >
                  <HStack className="justify-between items-center">
                    <HStack space="md" className="items-center flex-1">
                      <UserAvatar
                        avatarUrl={user.avatar_url}
                        fullName={user.display_name}
                        size={44}
                      />
                      <VStack className="flex-1">
                        <Text className="text-phase-text-primary font-bold">
                          {user.display_name}
                        </Text>
                        <Text className="text-phase-text-tertiary text-[10px] uppercase tracking-wider">
                          @{user.id.substring(0, 8)}
                        </Text>
                      </VStack>
                    </HStack>

                    <Pressable
                      onPress={() => {
                        hapticLight();
                        handleUnmute(user.id, user.display_name);
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={t('profile.safety.unmuteActionName', {
                        name: user.display_name,
                      })}
                      accessibilityHint={t('profile.safety.unmuteHint')}
                      hitSlop={12}
                      className="p-3 rounded-xl bg-phase-error/10"
                    >
                      <Icon as={UserCheck} size={20} color={tokens.colors.primary} />
                    </Pressable>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
}
