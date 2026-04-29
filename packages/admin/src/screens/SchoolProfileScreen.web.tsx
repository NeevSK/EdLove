import { useNavigation } from '@react-navigation/native';
import { AvatarDisplay, ContactLinktree, EditableItem, useSchoolProfile } from '@repo/profile';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Globe,
  Layout,
  Pressable,
  School as SchoolIcon,
  Shield,
  Users,
} from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';

import { useTranslation } from 'react-i18next';

export default function SchoolProfileScreenWeb({ schoolId }: { schoolId: string }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { school, stats, loading: isLoading, updateField, isEditable } = useSchoolProfile(schoolId);

  if (isLoading)
    return (
      <Box className="p-10">
        <SkeletonCard />
      </Box>
    );
  if (!school)
    return (
      <Box className="p-10 items-center">
        <Text className="font-black opacity-50 uppercase tracking-widest">School not found</Text>
      </Box>
    );

  return (
    <VStack className="flex-1 bg-phase-canvas">
      <Box className="max-w-[1000px] w-full mx-auto px-6 py-10">
        {/* Header with Back button */}
        <HStack className="mb-10">
          <Pressable
            onPress={() => {
              hapticLight();
              navigation.goBack();
            }}
            className="flex-row items-center gap-2 px-4 py-2.5 rounded-2xl border border-phase-border bg-phase-surface shadow-sm active:scale-95 transition-all"
          >
            <Icon as={ArrowLeft} size={14} className="text-phaseText-primary" />
            <Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-widest">
              Back
            </Text>
          </Pressable>
        </HStack>

        <HStack className="gap-8 items-start">
          {/* Left Column: Essential Info */}
          <VStack className="flex-1 gap-6">
            {/* Hero Section */}
            <Box className="bg-phase-surface rounded-[40px] border border-phase-border p-10 shadow-xl overflow-hidden relative">
              <HStack className="gap-10 items-start">
                <AvatarDisplay
                  userId={school.id}
                  fullName={school.name}
                  avatarUrl={school.avatar_url || undefined}
                  editable={isEditable}
                  onAvatarSelected={async (uri: string) => {
                    await updateField('avatar_url', uri);
                  }}
                  peekType="school"
                />

                <VStack className="flex-1 gap-6">
                  <EditableItem
                    icon={SchoolIcon}
                    label="School Name"
                    value={school.name}
                    field="name"
                    placeholder="Enter school name"
                    onSave={(field, val) => updateField(field as any, val)}
                    disabled={!isEditable}
                  />

                  <HStack className="items-center gap-3">
                    <Box className="bg-phase-interactive/10 px-3 py-1.5 rounded-full border border-phase-interactive/20">
                      <HStack className="items-center gap-2">
                        <Icon as={Shield} size={10} className="text-phase-interactive" />
                        <Text className="text-[10px] font-black text-phase-interactive uppercase tracking-widest">
                          {school.type} School
                        </Text>
                      </HStack>
                    </Box>
                    <Text className="text-[14px] font-bold text-phaseText-muted">
                      @{school.handle}
                    </Text>
                  </HStack>

                  {isEditable && (
                    <Pressable
                      onPress={() => hapticLight()}
                      className="bg-phase-interactive self-start px-6 h-12 rounded-2xl items-center justify-center shadow-md active:scale-95 transition-all"
                    >
                      <Text className="text-white text-[12px] font-black uppercase tracking-[2px]">
                        Manage Institution
                      </Text>
                    </Pressable>
                  )}
                </VStack>
              </HStack>
            </Box>

            {/* Quick Stats Grid */}
            <HStack className="gap-4">
              <Box className="flex-1 bg-phase-surface p-6 rounded-[32px] border border-phase-border shadow-sm">
                <HStack className="items-center gap-5">
                  <Box className="p-4 bg-phase-interactive/10 rounded-[22px]">
                    <Icon as={Users} size="md" className="text-phase-interactive" />
                  </Box>
                  <VStack className="gap-0.5">
                    <Text className="text-[28px] font-black text-phaseText-primary tracking-tighter">
                      {stats?.total_students || 0}
                    </Text>
                    <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[2px]">
                      Students
                    </Text>
                  </VStack>
                </HStack>
              </Box>
              <Box className="flex-1 bg-phase-surface p-6 rounded-[32px] border border-phase-border shadow-sm">
                <HStack className="items-center gap-5">
                  <Box className="p-4 bg-phase-success/10 rounded-[22px]">
                    <Icon as={BookOpen} size="md" className="text-phase-success" />
                  </Box>
                  <VStack className="gap-0.5">
                    <Text className="text-[28px] font-black text-phaseText-primary tracking-tighter">
                      {stats?.total_teachers || 0}
                    </Text>
                    <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[2px]">
                      Teachers
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </HStack>

            {/* About Section */}
            <Box className="bg-phase-surface p-8 rounded-[32px] border border-phase-border shadow-sm">
              <VStack className="gap-4">
                <Heading className="text-[20px] font-black text-phaseText-primary tracking-tight">
                  Our Mission
                </Heading>
                <Text className="text-[15px] leading-relaxed text-phaseText-secondary font-medium opacity-90">
                  Welcome to the public profile of {school.name}. We are dedicated to nurturing the
                  growth of every student and educator in our community. Our commitment to
                  excellence shapes every aspect of our institutional life.
                </Text>
              </VStack>
            </Box>
          </VStack>

          {/* Right Column: Socials & Context */}
          <VStack className="w-[340px] gap-6">
            {/* Social Sanctuary */}
            <Box className="bg-phase-surface p-8 rounded-[32px] border border-phase-border shadow-sm">
              <VStack className="gap-6">
                <HStack className="items-center gap-3">
                  <Icon as={Globe} size="sm" className="text-phase-interactive" />
                  <Text className="text-[12px] font-black text-phaseText-muted uppercase tracking-[2px]">
                    Official Links
                  </Text>
                </HStack>

                <ContactLinktree
                  links={[]}
                  userName={school.name}
                  userId={school.id}
                  isOwnProfile={isEditable}
                  editable={isEditable}
                />
              </VStack>
            </Box>

            {/* Info Card */}
            <Box className="bg-phase-canvas p-6 rounded-[32px] border border-phase-border border-dashed">
              <VStack className="gap-4">
                <HStack className="items-center gap-3">
                  <Icon as={Layout} size="xs" className="text-phaseText-muted" />
                  <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-widest">
                    School Structure
                  </Text>
                </HStack>
                <HStack className="items-center justify-between">
                  <Text className="text-[14px] font-black text-phaseText-primary">
                    {stats?.total_sections || 0} Sections
                  </Text>
                  <Icon as={ChevronRight} size="xs" className="text-phaseText-muted opacity-30" />
                </HStack>
                <HStack className="items-center justify-between">
                  <Text className="text-[14px] font-black text-phaseText-primary">
                    {stats?.total_classrooms || 0} Classrooms
                  </Text>
                  <Icon as={ChevronRight} size="xs" className="text-phaseText-muted opacity-30" />
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
}
