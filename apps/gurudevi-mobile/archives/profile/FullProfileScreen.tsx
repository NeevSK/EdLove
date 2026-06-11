import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStore } from '@repo/core/logic';
import {
  AddSocialLinkModal,
  AvatarDisplay,
  ContactLinktree,
  EditableItem,
  GiveThuthimalModal,
  IdentityCard,
  StaffPresencePulse,
  type UserProfile,
  useProfile,
  useProfileCompletion,
} from '@repo/profile';
import { AchievementUnlockOverlay, GlobalHeader, ScreenWrapper } from '@repo/ui';
import { SanctuaryButton, SanctuaryProgressBar, useBottomTabPadding } from '@repo/ui/components';
import { useThemedColors } from '@repo/ui/hooks';
import { Box, Center, Heading, HStack, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import {
  AtSign,
  BookOpen,
  Briefcase,
  SquarePen,
  FileText,
  FingerprintPattern,
  GraduationCap,
  Phone,
  School,
  User as UserIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { ProfileStackParamList } from '../../types/navigation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl * 2;
type FullProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'FullProfile'>;
export default function FullProfileScreen({ route, navigation }: FullProfileScreenProps) {
  const { profile: initialProfile } = route.params;
  const { updateField } = useProfile();
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { user: currentUser, userRole } = useStore();
  const bottomPadding = useBottomTabPadding();
  const [profile, setProfile] = useState<any>(initialProfile);
  const completionResult = useProfileCompletion(profile, userRole ?? null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showThuthimalModal, setShowThuthimalModal] = useState(false);
  const currentUserId = currentUser?.id ?? null;
  const currentUserName = currentUser?.full_name || currentUser?.email || '';
  // Animated opacity for bar fade-out on completion
  const barOpacity = useSharedValue(1);
  const barAnimStyle = useAnimatedStyle(() => ({
    opacity: barOpacity.value,
  }));
  // Watch for first-time 100% and trigger celebration
  useEffect(() => {
    if (completionResult.isComplete && !completionResult.hasSeenCompletionCelebration) {
      setShowCelebration(true);
      hapticSuccess();
      completionResult.markCompletionCelebrationSeen();
      const timer = setTimeout(() => {
        barOpacity.value = withTiming(0, { duration: 800 });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    completionResult.isComplete,
    completionResult.hasSeenCompletionCelebration,
    completionResult,
    barOpacity,
  ]);
  if (!profile) return null;
  // True when the signed-in user is viewing someone else's profile
  const isOtherProfile = currentUserId !== null && currentUserId !== profile.id;
  const isTeacherProfile = ['teacher', 'principal', 'grade_head', 'section_head'].includes(
    profile.authority || profile.role,
  );
  const handleSave = async (field: string, value: any) => {
    // Handle array-based professional fields transformation before passing to hook
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
    if (result) {
      setProfile((prev: any) => ({ ...prev, [field]: valueToSave }));
    }
    return result;
  };
  return (
    <ScreenWrapper scroll={false}>
      <GlobalHeader title={t('profile.fullProfile')} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}>
        <VStack space="2xl" sx={{ paddingVertical: Theme.spacing.md }}>
          {/* Identity Card Preview - Centered */}
          <Center>
            <Box>
              <IdentityCard profile={profile} />
            </Box>
          </Center>

          {/* Editable Avatar — tap to change photo */}
          <Center mt={Theme.spacing.lg}>
            <AvatarDisplay
              userId={profile.id}
              avatarUrl={profile.avatar_url}
              fullName={profile.full_name}
              size={72}
              editable={!isOtherProfile}
              onAvatarSelected={async (localUri) => {
                await updateField('avatar_url', localUri);
                hapticSuccess();
              }}
            />
            {!isOtherProfile && (
              <Text size="xs" color={colors.textTertiary} mt={Theme.spacing.xs}>
                Tap to update your photo
              </Text>
            )}
          </Center>

          {/* Give Thuthimal button — only shown when viewing another teacher's profile */}
          {isOtherProfile && isTeacherProfile && currentUserId && (
            <Center>
              <SanctuaryButton
                onPress={() => setShowThuthimalModal(true)}
                accessibilityLabel={`Give Thuthimal gift to ${profile.full_name}`}
              >
                🌸 Give Thuthimal
              </SanctuaryButton>
            </Center>
          )}

          {/* Completion bar — animated, fades out on 100% — only own profile */}
          {!isOtherProfile && (
            <Reanimated.View style={barAnimStyle}>
              <SanctuaryProgressBar
                percentage={completionResult.percentage}
                isComplete={completionResult.isComplete}
                nextHint={completionResult.nextHint}
                style={{
                  paddingHorizontal: Theme.spacing.xl,
                  marginTop: Theme.spacing.md,
                  marginBottom: Theme.spacing.xs,
                }}
              />
            </Reanimated.View>
          )}

          {/* Detailed Information */}
          <Center>
            <Box
              sx={{
                backgroundColor: colors.secondary,
                borderRadius: Theme.corners.generous,
                padding: Theme.spacing.lg,
                borderWidth: 1,
                borderColor: colors.border,
                width: CARD_WIDTH,
                ...Theme.shadows.md,
              }}
            >
              <Heading size="md" color={colors.text} mb="$4">
                {t('profile.personalDetails')}
              </Heading>

              <VStack space="xl">
                <EditableItem
                  icon={UserIcon}
                  label={t('profile.fullName')}
                  value={profile.full_name}
                  field="full_name"
                  placeholder="Enter full name"
                  onSave={isOtherProfile ? async () => {} : handleSave}
                />

                <EditableItem
                  icon={AtSign}
                  label={t('profile.username')}
                  value={profile.username}
                  field="username"
                  placeholder="your-handle"
                  onSave={isOtherProfile || profile.is_anonymous ? async () => {} : handleSave}
                  disabled={profile.is_anonymous}
                  helperText={
                    profile.is_anonymous
                      ? t('profile.anonymousHandleNotice')
                      : t('profile.handleGuideline')
                  }
                  transform={(text) => text.toLowerCase().replace(/[^a-z0-9_-]/g, '')}
                />

                <EditableItem
                  icon={Phone}
                  label={t('profile.phone')}
                  value={profile.phone}
                  field="phone"
                  placeholder="+94 XX XXX XXXX"
                  onSave={isOtherProfile ? async () => {} : handleSave}
                />

                {profile.role === 'student' ? (
                  <EditableItem
                    icon={FingerprintPattern}
                    label={t('profile.indexNumber')}
                    value={profile.index_number}
                    field="index_number"
                    placeholder="STU-XXXXX"
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                ) : (
                  <EditableItem
                    icon={FingerprintPattern}
                    label={t('profile.nicNumber')}
                    value={profile.nic_number}
                    field="nic_number"
                    placeholder="19XXXXXXXXXX"
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                )}
              </VStack>
            </Box>
          </Center>

          {/* Professional Details Section - Educational Staff Only */}
          {['teacher', 'principal', 'grade_head', 'section_head'].includes(
            profile.authority || profile.role,
          ) && (
            <Center>
              <Box
                sx={{
                  backgroundColor: colors.secondary,
                  borderRadius: Theme.corners.generous,
                  padding: Theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  width: CARD_WIDTH,
                  ...Theme.shadows.md,
                }}
              >
                <Heading size="md" color={colors.text} mb="$4">
                  {t('profile.professionalDetails')}
                </Heading>

                <VStack space="xl">
                  <EditableItem
                    icon={School}
                    label={t('profile.currentSchool')}
                    value={profile.school_name || ''}
                    field="school_name"
                    placeholder={t('profile.noSchool')}
                    onSave={async () => {}} // Read-only for now or needs school Picker
                  />

                  <EditableItem
                    icon={Briefcase}
                    label={t('profile.experience')}
                    value={profile.experience_years?.toString()}
                    field="experience_years"
                    placeholder="0"
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />

                  <EditableItem
                    icon={BookOpen}
                    label={t('profile.subjects')}
                    value={
                      Array.isArray(profile.subjects_taught)
                        ? profile.subjects_taught.join(', ')
                        : profile.subjects_taught
                    }
                    field="subjects_taught"
                    placeholder="Math, Physics..."
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />

                  <EditableItem
                    icon={GraduationCap}
                    label={t('profile.qualifications')}
                    value={
                      Array.isArray(profile.qualifications)
                        ? profile.qualifications.join(', ')
                        : profile.qualifications
                    }
                    field="qualifications"
                    placeholder="B.A, M.Sc, etc."
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                </VStack>
              </Box>
            </Center>
          )}

          {/* Bio Section */}
          <Center>
            <Box
              sx={{
                backgroundColor: colors.secondary,
                borderRadius: Theme.corners.generous,
                padding: Theme.spacing.lg,
                borderWidth: 1,
                borderColor: colors.border,
                width: CARD_WIDTH,
                ...Theme.shadows.md,
              }}
            >
              <Heading size="md" color={colors.text} mb="$4">
                {t('profile.aboutMe')}
              </Heading>
              <EditableItem
                field="bio"
                label={t('profile.bio')}
                value={profile.bio}
                icon={FileText}
                placeholder={t('profile.tellUsAboutYourself')}
                onSave={isOtherProfile ? async () => {} : handleSave}
                multiline={true}
              />
            </Box>
          </Center>

          {/* Social Sanctuary */}
          <Center>
            <Box sx={{ width: CARD_WIDTH }}>
              <ContactLinktree
                links={profile.social_links || []}
                userName={profile.full_name}
                bio={profile.bio}
                isOwnProfile={!isOtherProfile}
              />

              {!isOtherProfile && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setShowSocialModal(true)}
                  style={styles.manageSocialsBtn}
                >
                  <HStack space="sm" alignItems="center">
                    <SquarePen size={18} color={colors.action} />
                    <Text color={colors.action} bold>
                      Manage Social Hub
                    </Text>
                  </HStack>
                </TouchableOpacity>
              )}
            </Box>
          </Center>

          {/* Professional Pulse (Staff Attendance) */}
          {['teacher', 'principal', 'grade_head', 'section_head'].includes(
            profile.authority || profile.role,
          ) && (
            <Center>
              <Box sx={{ width: CARD_WIDTH }}>
                <StaffPresencePulse userId={profile.id} schoolId={profile.school_id} />
              </Box>
            </Center>
          )}

          {/* App Version Info */}
          <Box alignItems="center" mt="$4">
            <Text size="xs" color={colors.textTertiary}>
              v1.2.0 • Sanctuary ID: {profile.id?.substring(0, 8)}
            </Text>
          </Box>
        </VStack>
      </ScrollView>

      {!isOtherProfile && (
        <AddSocialLinkModal
          visible={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          userId={profile.id}
        />
      )}

      {/* Give Thuthimal modal */}
      {isOtherProfile && currentUserId && (
        <GiveThuthimalModal
          isOpen={showThuthimalModal}
          onClose={() => setShowThuthimalModal(false)}
          recipientId={profile.id}
          recipientName={profile.full_name ?? 'this person'}
          recipientTier={profile.authority || profile.role || 'teacher'}
          giverId={currentUserId}
          giverName={currentUserName}
        />
      )}

      {/* Overlay rendered outside ScrollView — uses position:absolute internally */}
      {!isOtherProfile && (
        <AchievementUnlockOverlay
          title="✨ Profile Complete!"
          visible={showCelebration}
          onHide={() => setShowCelebration(false)}
        />
      )}
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  manageSocialsBtn: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
});