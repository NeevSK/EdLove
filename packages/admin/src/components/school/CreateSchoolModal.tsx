import { useNavigation } from '@react-navigation/native';
import {
  RELIGIOUS_AFFILIATIONS,
  SRI_LANKAN_DISTRICTS,
  SRI_LANKAN_PROVINCES,
  SRI_LANKAN_SCHOOL_TYPES,
  STUDENT_TYPES,
} from '@repo/core';
import { communityAPI, identityAPI } from '@repo/core/api';
import { useEntity, useSchoolCreation } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';

import {
  BookOpen,
  Box,
  Building2,
  Button,
  ButtonText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heading,
  HStack,
  Icon,
  MapPin,
  MessageSquare,
  SanctuaryInput,
  SanctuaryModal,
  School as SchoolIcon,
  Spinner,
  Text,
  Users,
  VStack,
} from '@repo/ui';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { useMemo, useState } from 'react';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (school: any) => void;
  initialData?: {
    id: string;
    name: string;
    handle?: string;
    type?: string;
  };
}

export default function CreateSchoolModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateSchoolModalProps) {
  const navigation = useNavigation<any>();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const isEdit = !!initialData;

  const { updateInstance, create } = useEntity({
    type: 'school',
    id: initialData?.id,
    mode: isEdit ? 'edit' : 'create',
  });

  const { state, updateStep, updateBasicInfo, updateLocation, updateDemographics, resetProgress } =
    useSchoolCreation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIds, setCreatedIds] = useState<{ schoolId: string; groupId?: string } | null>(null);

  const availableDistricts = useMemo(() => {
    if (!state.location.provinceId) return [];
    return SRI_LANKAN_DISTRICTS.filter((d) => d.provinceId === state.location.provinceId);
  }, [state.location.provinceId]);

  const handleClose = () => {
    setError(null);
    if (!isEdit && state.step === 5) {
      resetProgress();
    }
    onClose();
  };

  const handleEnterDashboard = () => {
    if (!createdIds?.schoolId) return;
    const sId = createdIds.schoolId;
    handleClose();
    navigation.navigate(
      'FounderSchoolDashboard' as never,
      {
        schoolId: sId,
        userId: user?.id ?? '',
      } as never,
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    hapticLight();

    try {
      const userId = await identityAPI.getMyInternalId();
      if (!userId) throw new Error('Not authenticated');

      const payload: any = {
        name: state.basicInfo.name.trim(),
        handle: state.basicInfo.handle.trim(),
        official_type: state.basicInfo.officialType,
        province_id: state.location.provinceId,
        district_id: state.location.districtId,
        city: state.location.city,
        address: state.location.address,
        student_type: state.demographics.studentType,
        religious_affiliation: state.demographics.religiousAffiliation,
        student_count: parseInt(state.demographics.studentCount, 10) || 0,
        type: (state.basicInfo.officialType || '').includes('Primary')
          ? 'primary'
          : ('mixed' as const),
      };

      let school;
      if (isEdit && initialData) {
        school = await updateInstance(payload);
        hapticSuccess();
        onSuccess(school);
        handleClose();
      } else {
        payload.created_by = userId;
        school = await create(payload);

        if (userId) {
          await identityAPI.updateProfile(userId, { school_id: school.id });
        }
        if (user) {
          setUser({ ...user, school_id: school.id } as any);
        }

        let communityGroupId: string | undefined;
        try {
          const group = await communityAPI.createGroupWithOwner(
            {
              name: `${state.basicInfo.name.trim()} HQ`,
              description: `Official community portal for ${state.basicInfo.name.trim()}`,
              type: 'general',
              join_policy: 'open',
              school_id: school.id,
            },
            userId,
          );
          communityGroupId = group.id;
        } catch (groupErr) {
          console.warn('Failed to create default group:', groupErr);
        }

        hapticSuccess();
        setCreatedIds({ schoolId: school.id, groupId: communityGroupId });
        updateStep(5);
        onSuccess(school);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save school';
      console.error('Failed to save school:', err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFooter = () => {
    if (state.step === 5) {
      return (
        <VStack className="w-full gap-4">
          <Button
            onPress={handleEnterDashboard}
            className="bg-phase-interactive rounded-2xl h-14 shadow-sm active:scale-95"
          >
            <ButtonText className="text-white font-black uppercase tracking-widest">
              Enter Dashboard
            </ButtonText>
            <Icon as={ChevronRight} className="text-white ml-2" />
          </Button>
        </VStack>
      );
    }

    return (
      <HStack className="w-full gap-4">
        {state.step > 1 && (
          <Button
            variant="outline"
            onPress={() => updateStep(state.step - 1)}
            className="flex-1 rounded-2xl h-14 border-phase-border"
          >
            <Icon as={ChevronLeft} className="text-phaseText-muted mr-2" />
            <ButtonText className="text-phaseText-muted font-bold">Back</ButtonText>
          </Button>
        )}
        <Button
          onPress={state.step === 4 ? handleSubmit : () => updateStep(state.step + 1)}
          className="flex-[2] bg-phase-interactive rounded-2xl h-14 shadow-sm active:scale-95"
          isDisabled={isSubmitting || (state.step === 1 && !state.basicInfo.name)}
        >
          {isSubmitting ? (
            <Spinner color="white" />
          ) : (
            <HStack className="items-center">
              <ButtonText className="text-white font-black uppercase tracking-widest">
                {state.step === 4 ? 'Establish Sanctuary' : 'Next Step'}
              </ButtonText>
              {state.step < 4 && <Icon as={ChevronRight} className="text-white ml-2" />}
            </HStack>
          )}
        </Button>
      </HStack>
    );
  };

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Refine Sanctuary' : 'Found New Sanctuary'}
      footer={renderFooter()}
    >
      <VStack className="gap-6">
        {state.step < 5 && (
          <HStack className="gap-1 justify-center">
            {[1, 2, 3, 4].map((s) => (
              <Box
                key={s}
                className={`h-1.5 flex-1 rounded-full ${s <= state.step ? 'bg-phase-interactive' : 'bg-phase-canvas'}`}
              />
            ))}
          </HStack>
        )}

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
          <VStack className="gap-8 pb-5">
            {state.step === 1 && (
              <VStack className="gap-6">
                <Heading className="text-xl font-black text-phaseText-primary uppercase tracking-wider">
                  Identity & Calling
                </Heading>
                <SanctuaryInput
                  label="Sanctuary Name"
                  placeholder="e.g. Nalanda College"
                  value={state.basicInfo.name}
                  onChangeText={(val) => {
                    updateBasicInfo({ name: val });
                    if (!isEdit) {
                      updateBasicInfo({
                        handle: val
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9_-]/g, ''),
                      });
                    }
                  }}
                  leftIcon={Building2}
                />
                <SanctuaryInput
                  label="Unique Handle"
                  value={state.basicInfo.handle}
                  onChangeText={(val) =>
                    updateBasicInfo({ handle: val.toLowerCase().replace(/[^a-z0-9_-]/g, '') })
                  }
                  leftIcon={Globe}
                  helperText="Used for QR codes and deep links"
                />
                <VStack className="gap-2">
                  <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest px-1">
                    Classification
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {Object.values(SRI_LANKAN_SCHOOL_TYPES).map((type) => (
                      <Pressable
                        key={type.key}
                        onPress={() => {
                          hapticLight();
                          updateBasicInfo({ officialType: type.key });
                        }}
                        className={`px-4 py-2 rounded-full border-2 transition-all ${state.basicInfo.officialType === type.key ? 'border-phase-interactive bg-phase-interactive/10' : 'border-phase-border bg-transparent'}`}
                      >
                        <Text
                          className={`text-xs font-black uppercase tracking-tight ${state.basicInfo.officialType === type.key ? 'text-phase-interactive' : 'text-phaseText-secondary'}`}
                        >
                          {type.en}
                        </Text>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>
              </VStack>
            )}

            {state.step === 2 && (
              <VStack className="gap-6">
                <Heading className="text-xl font-black text-phaseText-primary uppercase tracking-wider">
                  Sacred Geography
                </Heading>
                <VStack className="gap-3">
                  <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest px-1">
                    Province
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack className="gap-2">
                      {SRI_LANKAN_PROVINCES.map((p) => (
                        <Pressable
                          key={p.id}
                          onPress={() => {
                            hapticLight();
                            updateLocation({ provinceId: p.id, districtId: '' });
                          }}
                          className={`px-5 py-2.5 rounded-xl border-2 transition-all ${state.location.provinceId === p.id ? 'border-phase-interactive bg-phase-interactive/10' : 'border-phase-border bg-phase-canvas'}`}
                        >
                          <Text
                            className={`font-black uppercase tracking-tight text-xs ${state.location.provinceId === p.id ? 'text-phase-interactive' : 'text-phaseText-secondary'}`}
                          >
                            {p.en}
                          </Text>
                        </Pressable>
                      ))}
                    </HStack>
                  </ScrollView>
                </VStack>

                {state.location.provinceId && (
                  <VStack className="gap-3">
                    <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest px-1">
                      District
                    </Text>
                    <HStack className="flex-wrap gap-2">
                      {availableDistricts.map((d) => (
                        <Pressable
                          key={d.id}
                          onPress={() => {
                            hapticLight();
                            updateLocation({ districtId: d.id });
                          }}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${state.location.districtId === d.id ? 'border-phase-interactive bg-phase-interactive/5' : 'border-phase-border bg-transparent'}`}
                        >
                          <Text
                            className={`text-sm font-bold ${state.location.districtId === d.id ? 'text-phase-interactive' : 'text-phaseText-primary'}`}
                          >
                            {d.en}
                          </Text>
                        </Pressable>
                      ))}
                    </HStack>
                  </VStack>
                )}

                <SanctuaryInput
                  label="City / Town"
                  placeholder="e.g. Colombo 07"
                  value={state.location.city}
                  onChangeText={(val) => updateLocation({ city: val })}
                  leftIcon={MapPin}
                />
                <SanctuaryInput
                  label="Full Address"
                  placeholder="Number, Street details..."
                  value={state.location.address}
                  onChangeText={(val) => updateLocation({ address: val })}
                  multiline
                  numberOfLines={2}
                />
              </VStack>
            )}

            {state.step === 3 && (
              <VStack className="gap-6">
                <Heading className="text-xl font-black text-phaseText-primary uppercase tracking-wider">
                  Nature & Pulse
                </Heading>
                <VStack className="gap-3">
                  <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest px-1">
                    Student Demographic
                  </Text>
                  <HStack className="gap-3">
                    {STUDENT_TYPES.map((type) => (
                      <Pressable
                        key={type.id}
                        onPress={() => {
                          hapticLight();
                          updateDemographics({ studentType: type.id as any });
                        }}
                        className={`flex-1 p-5 rounded-2xl border-2 items-center transition-all ${state.demographics.studentType === type.id ? 'border-phase-interactive bg-phase-interactive/10' : 'border-phase-border bg-phase-canvas'}`}
                      >
                        <Text className="text-3xl mb-1">
                          {type.id === 'mixed'
                            ? '\u1F46A'
                            : type.id === 'boys'
                              ? '\u1F466'
                              : '\u1F467'}
                        </Text>
                        <Text
                          className={`text-[10px] font-black uppercase text-center ${state.demographics.studentType === type.id ? 'text-phase-interactive' : 'text-phaseText-secondary'}`}
                        >
                          {type.en}
                        </Text>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                <VStack className="gap-3">
                  <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest px-1">
                    Religious Affiliation
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {RELIGIOUS_AFFILIATIONS.map((r) => (
                      <Pressable
                        key={r.id}
                        onPress={() => {
                          hapticLight();
                          updateDemographics({ religiousAffiliation: r.id });
                        }}
                        className={`px-4 py-2.5 rounded-xl border-2 transition-all ${state.demographics.religiousAffiliation === r.id ? 'border-phase-interactive bg-phase-interactive/10' : 'border-phase-border bg-transparent'}`}
                      >
                        <Text
                          className={`text-sm font-bold ${state.demographics.religiousAffiliation === r.id ? 'text-phase-interactive' : 'text-phaseText-primary'}`}
                        >
                          {r.en}
                        </Text>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>
                <SanctuaryInput
                  label="Estimated Student Count"
                  placeholder="e.g. 1500"
                  value={state.demographics.studentCount}
                  onChangeText={(val) => updateDemographics({ studentCount: val })}
                  keyboardType="numeric"
                  leftIcon={Users}
                />
              </VStack>
            )}

            {state.step === 4 && (
              <VStack className="gap-6">
                <Heading className="text-xl font-black text-phaseText-primary uppercase tracking-wider">
                  Hierarchy & Vision
                </Heading>
                <Box className="p-6 rounded-3xl bg-phase-canvas border border-phase-border shadow-sm">
                  <VStack className="gap-5">
                    <HStack className="gap-4 items-center">
                      <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center border border-phase-interactive/20">
                        <Icon as={SchoolIcon} className="text-phase-interactive" size="sm" />
                      </Box>
                      <VStack>
                        <Text className="text-lg font-black text-phaseText-primary leading-tight">
                          {state.basicInfo.name}
                        </Text>
                        <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-wider">
                          @{state.basicInfo.handle}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack className="justify-between border-t border-phase-border pt-4">
                      <VStack>
                        <Text className="text-[10px] font-black uppercase text-phaseText-muted mb-1">
                          Classification
                        </Text>
                        <Text className="text-sm font-black text-phaseText-primary">
                          {state.basicInfo.officialType}
                        </Text>
                      </VStack>
                      <VStack className="items-end">
                        <Text className="text-[10px] font-black uppercase text-phaseText-muted mb-1">
                          Demographic
                        </Text>
                        <Text className="text-sm font-black text-phaseText-primary capitalize">
                          {state.demographics.studentType}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack className="gap-2 items-center">
                      <Icon as={MapPin} size={14} className="text-phaseText-secondary" />
                      <Text className="text-sm font-bold text-phaseText-secondary flex-1">
                        {state.location.city},{' '}
                        {SRI_LANKAN_DISTRICTS.find((d) => d.id === state.location.districtId)?.en}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
                <Box className="p-4 rounded-2xl bg-phase-success/5 border border-phase-success/20">
                  <HStack className="gap-3 items-center">
                    <Icon as={CheckCircle} className="text-phase-success" size="sm" />
                    <Text className="text-xs font-bold text-phase-success/60 flex-1 leading-relaxed">
                      Establishing this sanctuary will automatically create a Community HQ and
                      assign you as the Principal.
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}

            {state.step === 5 && (
              <VStack className="gap-8 items-center py-6">
                <Box className="bg-phase-success/10 p-8 rounded-full border border-phase-success/20">
                  <Icon as={CheckCircle} className="text-phase-success" size={64} />
                </Box>

                <VStack className="gap-2 items-center">
                  <Heading className="text-2xl font-black text-phaseText-primary text-center leading-tight">
                    Sanctuary Founded!
                  </Heading>
                  <Text className="text-center font-bold text-phaseText-muted px-4">
                    Your institution is now part of the Gurudevi ecosystem.
                  </Text>
                </VStack>

                <Box className="bg-phase-surface p-5 rounded-[24px] w-full border border-phase-border">
                  <VStack className="gap-4">
                    <HStack className="gap-3 items-center">
                      <Icon as={BookOpen} className="text-phase-interactive" size="xs" />
                      <Text className="text-sm font-bold text-phaseText-secondary">
                        Academic Cycle Initialized
                      </Text>
                    </HStack>
                    <HStack className="gap-3 items-center">
                      <Icon as={MessageSquare} className="text-phase-interactive" size="xs" />
                      <Text className="text-sm font-bold text-phaseText-secondary">
                        Community Space Ready
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            )}
          </VStack>
        </ScrollView>
        {error && (
          <Box className="p-4 bg-phase-danger/10 rounded-[16px] border border-phase-danger/20">
            <Text className="text-phase-danger font-bold text-sm text-center">{error}</Text>
          </Box>
        )}
      </VStack>
    </SanctuaryModal>
  );
}
