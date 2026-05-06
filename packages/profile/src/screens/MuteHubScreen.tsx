import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { socialAPI } from '@repo/core/api';

import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { Box, Center, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { Shield, Trash2, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, ScrollView } from 'react-native';

interface MutedUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  capacity?: string;
}

export default function MuteHubScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMutes = useCallback(async () => {
    try {
      const data = await socialAPI.getMutedUsers();
      setMutedUsers((data as MutedUser[]) || []);
    } catch (error) {
      console.error('Failed to fetch muted users:', error);
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
              setMutedUsers((prev) => prev.filter((u) => u.id !== userId));
            } catch (error) {
              console.error('Failed to unmute user:', error);
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
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E67E22" />
        }
      >
        <VStack space="lg">
          <Box className="p-4 bg-phase-canvas rounded-2xl border border-phase-surface shadow-sm">
            <HStack space="md" className="items-center">
              <Icon as={Shield} size={24} color="#4A90E2" />
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

          <Heading className="text-phase-text-secondary text-sm mt-4">
            {t('profile.safety.mutedList') || 'Muted List'} ({mutedUsers.length})
          </Heading>

          {mutedUsers.length === 0 && !loading ? (
            <Center className="h-48 mt-8">
              <VStack space="md" className="items-center">
                <Icon as={XCircle} size={48} color="#9DA1A3" className="opacity-30" />
                <Text className="text-phase-text-tertiary">
                  {t('profile.safety.noMutes') || 'Your list is empty.'}
                </Text>
              </VStack>
            </Center>
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
                        fullName={user.full_name}
                        size={44}
                        fallbackEmoji={user.capacity === 'principal' ? '🏛️' : user.capacity === 'teacher' ? '🌱' : '🌿'}
                      />
                      <VStack className="flex-1">
                        <Text className="text-phase-text-primary font-bold">{user.full_name}</Text>
                        <Text className="text-phase-text-tertiary text-[10px] uppercase tracking-wider">
                          @{user.id.substring(0, 8)}
                        </Text>
                      </VStack>
                    </HStack>

                    <Pressable
                      onPress={() => {
                        hapticLight();
                        handleUnmute(user.id, user.full_name);
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={t('profile.safety.unmuteActionName', {
                        name: user.full_name,
                      })}
                      accessibilityHint={t('profile.safety.unmuteHint')}
                      className="p-3 rounded-xl bg-phase-error/10"
                    >
                      <Icon as={Trash2} size={20} color="#FF6B6B" />
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
