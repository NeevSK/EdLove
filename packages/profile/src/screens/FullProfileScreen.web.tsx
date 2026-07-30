import { usePermissions, useStore } from '@repo/core/logic';
import { StaffPresencePulse } from '@repo/people';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useThemedColors } from '@repo/ui/hooks';
import { AtSign, SquarePen, User as UserIcon } from '@repo/ui/icons';
import { Box, Heading, HStack, Text, VStack } from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { AddSocialLinkModal } from '@repo/profile/components/AddSocialLinkModal';
import { AvatarDisplay } from '@repo/profile/components/AvatarDisplay';
import { ContactLinktree } from '@repo/profile/components/ContactLinktree';
import { EditableItem } from '@repo/profile/components/EditableItem';
import { GiveThuthimalModal } from '@repo/profile/components/GiveThuthimalModal';
import { useProfile } from '@repo/profile/hooks/useProfile';
import { useProfileCompletion } from '@repo/profile/hooks/useProfileCompletion';
import { useSocialLinks } from '@repo/profile/hooks/useSocialLinks';
import type { UserProfile } from '@repo/profile/types';

export default function FullProfileScreenWeb() {
  const params = useLocalSearchParams<{ id?: string; userId?: string; full_name?: string }>();
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id || params.userId || '';
  const initialProfile = {
    id: profileId,
    full_name: Array.isArray(params.full_name)
      ? params.full_name[0]
      : params.full_name || 'Profile',
  } as UserProfile;

  const { t } = useTranslation();
  const _colors = useThemedColors();
  const { user: currentUser } = useStore();
  const { context } = usePermissions();

  const {
    profile: liveProfile,
    updateField,
    refresh,
    uploadAvatar,
  } = useProfile(initialProfile?.id);
  const profile = liveProfile || initialProfile;
  const completionCapacity = (context.activeBond?.capacity || context.primaryCapacity) ?? null;
  useProfileCompletion(profile, completionCapacity as any);
  const { links: socialLinks } = useSocialLinks(profile?.id);

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showThuthimalModal, setShowThuthimalModal] = useState(false);

  const currentUserId = currentUser?.id;
  const currentUserName = currentUser?.display_name || currentUser?.email || '';

  if (!profile) return null;

  const isOtherProfile = currentUserId !== undefined && currentUserId !== profile.id;
  const profileCapacity =
    (profile as any)?.active_bond?.capacity || (profile as any)?.capacity || '';
  const isTeacherProfile = [
    'teacher',
    'principal',
    'gradeHead',
    'sectionHead',
    'grade_head',
    'section_head',
  ].includes(profileCapacity || '');

  const handleSave = async (field: string, value: any) => {
    let valueToSave = value;
    if ((field === 'subjects_taught' || field === 'qualifications') && typeof value === 'string') {
      valueToSave = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');
    } else if (field === 'experience_years' && typeof value === 'string') {
      valueToSave = parseInt(value, 10) || 0;
    }

    const result = await updateField(field as keyof UserProfile, valueToSave);
    const success = !!result?.success;
    if (success) {
      hapticSuccess();
      refresh?.();
    }
    return success;
  };

  return (
    <ScreenWrapper scroll={false}>
      <GlobalHeader title={t('profile.fullProfile')} showBack onBack={() => safeBack('/profile')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Box className="max-w-[800px] mx-auto w-full p-6">
          <VStack space="2xl">
            <HStack space="xl" className="items-center">
              <AvatarDisplay
                userId={profile.id}
                avatarUrl={profile.avatar_url}
                fullName={profile.display_name}
                size={120}
                editable={!isOtherProfile}
                onAvatarSelected={async (localUri) => {
                  const result = await uploadAvatar(localUri);
                  if (result.success) {
                    refresh?.();
                    hapticSuccess();
                  }
                }}
              />
              <VStack>
                <Heading size="xl">{profile.display_name}</Heading>
                <Text className="text-text-tertiary">@{profile.username || 'no-handle'}</Text>
                {isTeacherProfile && profile.school_id ? (
                  <StaffPresencePulse userId={profile.id} schoolId={profile.school_id} />
                ) : null}
              </VStack>
            </HStack>

            <Box className="bg-secondary rounded-[32px] p-6 border border-border">
              <Heading size="md" className="mb-4">
                {t('profile.personalDetails')}
              </Heading>
              <VStack space="lg">
                <EditableItem
                  icon={UserIcon}
                  label={t('profile.fullName')}
                  value={profile.display_name}
                  field="display_name"
                  onSave={handleSave}
                  disabled={isOtherProfile}
                />
                <EditableItem
                  icon={UserIcon}
                  label={t('profile.firstName') || 'First name'}
                  value={profile.first_name ?? undefined}
                  field="first_name"
                  onSave={handleSave}
                  disabled={isOtherProfile}
                />
                <EditableItem
                  icon={UserIcon}
                  label={t('profile.lastName') || 'Last name'}
                  value={profile.last_name ?? undefined}
                  field="last_name"
                  onSave={handleSave}
                  disabled={isOtherProfile}
                />
                <EditableItem
                  icon={AtSign}
                  label={t('profile.username')}
                  value={profile.username ?? undefined}
                  field="username"
                  onSave={handleSave}
                  disabled={isOtherProfile}
                />
              </VStack>
            </Box>

            <ContactLinktree
              links={socialLinks || []}
              userName={profile.display_name}
              bio={profile.bio ?? undefined}
              userId={profile.id}
              isOwnProfile={!isOtherProfile}
            />

            {!isOtherProfile && (
              <SanctuaryButton onPress={() => setShowSocialModal(true)}>
                <HStack space="sm" className="items-center">
                  <SquarePen size={18} color="white" />
                  <Text className="text-white font-bold">Manage Social Links</Text>
                </HStack>
              </SanctuaryButton>
            )}
          </VStack>
        </Box>
      </ScrollView>

      {!isOtherProfile && (
        <AddSocialLinkModal
          visible={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          userId={profile.id}
        />
      )}

      {isOtherProfile && currentUserId && (
        <GiveThuthimalModal
          isOpen={showThuthimalModal}
          onClose={() => setShowThuthimalModal(false)}
          recipientId={profile.id}
          recipientName={profile.display_name ?? 'this person'}
          recipientTier={(profileCapacity || 'teacher') as any}
          giverId={currentUserId}
          giverName={currentUserName}
        />
      )}
    </ScreenWrapper>
  );
}

export { FullProfileScreenWeb as FullProfileScreen };
