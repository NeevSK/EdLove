import { useNavigation } from '@react-navigation/native';
import { api, communityAPI, identityAPI } from '@repo/core/api';

import { CheckCircle, MessageSquare, School } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (school: any) => void;
  initialData?: {
    id: string;
    name: string;
    handle?: string;
    type: 'primary' | 'secondary' | 'mixed';
  };
}

export default function CreateSchoolModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateSchoolModalProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<'details' | 'type' | 'success'>('details');
  const [name, setName] = useState(initialData?.name ?? '');
  const [handle, setHandle] = useState(initialData?.handle ?? '');
  const [type, setType] = useState<'primary' | 'secondary' | 'mixed'>(initialData?.type ?? 'mixed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIds, setCreatedIds] = useState<{
    schoolId: string;
    groupId?: string;
  } | null>(null);

  const isEdit = !!initialData;

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? '');
      setHandle(initialData?.handle ?? '');
      setType(initialData?.type ?? 'mixed');
      setStep('details');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t('school.errorNameRequired') || 'School name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    hapticLight();

    try {
      const userId = await identityAPI.getMyInternalId();
      if (!userId) throw new Error('Not authenticated');

      let updatedSchool;
      if (isEdit && initialData) {
        updatedSchool = await api['school'].update(initialData.id, {
          name: name.trim(),
          handle: handle.trim(),
          type,
        });
        hapticSuccess();
        onSuccess(updatedSchool);
        handleClose();
        return;
      } else {
        // 1. Create real School
        updatedSchool = await api['school'].create({
          name: name.trim(),
          handle: handle.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
          type,
          created_by: userId,
        });

        let communityGroupId: string | undefined;

        // 2. Create default Community Group
        try {
          const group = await communityAPI.createGroupWithOwner(
            {
              name: `${name.trim()} HQ`,
              description: `Official community portal for ${name.trim()}`,
              type: 'general',
              join_policy: 'open',
              school_id: updatedSchool.id,
            },
            userId,
          );
          communityGroupId = group.id;
        } catch (groupErr) {
          console.warn('Failed to create default group:', groupErr);
        }

        hapticSuccess();
        setCreatedIds({
          schoolId: updatedSchool.id,
          groupId: communityGroupId,
        });
        setStep('success');
        onSuccess(updatedSchool);
      }
    } catch (err: any) {
      console.error('Failed to save school:', err);
      setError(err.message || 'Failed to save school');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setHandle('');
    setType('mixed');
    setError(null);
    setStep('details');
    onClose();
  };

  const navigateToCommunity = () => {
    if (createdIds?.groupId) {
      navigation.navigate('CommunityStack', {
        screen: 'GroupDetails',
        params: { groupId: createdIds.groupId },
      });
      handleClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalBackdrop />
      <ModalContent className="bg-sanctuary-surface max-w-[400px] border-sanctuary-border border rounded-generous">
        {step === 'details' && (
          <>
            <ModalHeader>
              <VStack className="gap-1">
                <Heading className="text-sanctuary-text" size="lg">
                  {isEdit
                    ? 'Refine Sanctuary Identity'
                    : t('school.createTitle') || 'Sanctuary Identity'}
                </Heading>
                <Text size="xs" className="text-sanctuary-text-secondary">
                  {isEdit
                    ? 'Update the details of your institution'
                    : 'Step 1 of 2: Name your institution'}
                </Text>
              </VStack>
            </ModalHeader>

            <ModalBody>
              <VStack className="gap-xl py-md">
                {error && (
                  <Box className="p-md bg-emberRed/20 rounded-comfortable border border-emberRed">
                    <Text className="text-emberRed text-sm">{error}</Text>
                  </Box>
                )}

                <FormControl isRequired isInvalid={!!error}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sanctuary-text-secondary">
                      {t('school.labelName') || 'What shall we call your Sanctuary?'}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-14 bg-sanctuary-surface-elevated border-sanctuary-border border rounded-generous">
                    <InputField
                      placeholder={t('school.placeholderName') || 'e.g., Green Valley Sanctuary'}
                      value={name}
                      onChangeText={(text: string) => {
                        setName(text);
                        if (!isEdit) {
                          setHandle(
                            text
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9_-]/g, ''),
                          );
                        }
                        if (error) setError(null);
                      }}
                      className="text-sanctuary-text text-lg font-semibold"
                      placeholderTextColor={Theme.colors.mistGray}
                    />
                  </Input>
                </FormControl>

                <FormControl isRequired isInvalid={!!error}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sanctuary-text-secondary">
                      URL Handle (unique ID)
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-14 bg-sanctuary-surface-elevated border-sanctuary-border border rounded-generous">
                    <InputField
                      placeholder="e.g., green-valley"
                      value={handle}
                      onChangeText={(text: string) => {
                        setHandle(
                          text
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9_-]/g, ''),
                        );
                        if (error) setError(null);
                      }}
                      className="text-sanctuary-text text-base font-medium"
                      placeholderTextColor={Theme.colors.mistGray}
                    />
                  </Input>
                  <Text size="xs" className="text-sanctuary-text-tertiary mt-1">
                    Used in your Sanctuary's QR codes and links.
                  </Text>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack className="w-full gap-md">
                <Button
                  variant="outline"
                  action="secondary"
                  onPress={handleClose}
                  className="flex-1 border-phase-border"
                  isDisabled={isSubmitting}
                >
                  <ButtonText className="text-sanctuary-text-secondary font-English">
                    {t('common.cancel') || 'Cancel'}
                  </ButtonText>
                </Button>
                <Button
                  action="primary"
                  onPress={() => setStep('type')}
                  className="flex-[2] bg-sanctuarySaffron"
                  isDisabled={!name.trim() || !handle.trim()}
                >
                  <ButtonText className="text-sacredWhite font-English">
                    {isEdit ? 'Continue to Focus' : 'Next — Academic Focus'}
                  </ButtonText>
                </Button>
              </HStack>
            </ModalFooter>
          </>
        )}

        {step === 'type' && (
          <>
            <ModalHeader>
              <VStack className="gap-1">
                <Heading className="text-sanctuary-text" size="lg">
                  Academic Focus
                </Heading>
                <Text size="xs" className="text-sanctuary-text-secondary">
                  {isEdit ? 'Update your scope' : 'Step 2 of 2: Define your scope'}
                </Text>
              </VStack>
            </ModalHeader>

            <ModalBody>
              <VStack className="gap-lg py-md">
                <Text className="text-sanctuary-text-secondary text-sm">
                  What is the core mission of{' '}
                  <Text className="font-bold text-sanctuary-text">{name}</Text>?
                </Text>

                {(
                  [
                    {
                      id: 'primary',
                      label: 'Primary Excellence',
                      emoji: '🏫',
                      desc: 'Foundational years (Grades 1-5). Focus on literacy and logic.',
                    },
                    {
                      id: 'secondary',
                      label: 'Higher Foundations',
                      emoji: '🎓',
                      desc: 'Advanced development (Grades 6-13). Specialized disciplines.',
                    },
                    {
                      id: 'mixed',
                      label: 'All-Grade Sanctuary',
                      emoji: '🌿',
                      desc: 'Holistic journey across all levels. Complete integration.',
                    },
                  ] as const
                ).map((tType) => {
                  const isSelected = type === tType.id;
                  return (
                    <Pressable
                      onPress={() => {
                        hapticLight();
                        setType(tType.id);
                      }}
                    >
                      <Box
                        className={`p-md rounded-generous border-2 ${
                          isSelected
                            ? 'border-sanctuarySaffron bg-sanctuarySaffron/5'
                            : 'border-sanctuary-border bg-sanctuary-surface-elevated'
                        }`}
                      >
                        <HStack className="gap-md items-center">
                          <Text className="text-[32px]">{tType.emoji}</Text>
                          <VStack className="flex-1">
                            <Text className="font-extrabold text-sanctuary-text">
                              {tType.label}
                            </Text>
                            <Text size="xs" className="text-sanctuary-text-secondary">
                              {tType.desc}
                            </Text>
                          </VStack>
                          {isSelected && (
                            <Icon as={CheckCircle} className="text-sanctuarySaffron" size="sm" />
                          )}
                        </HStack>
                      </Box>
                    </Pressable>
                  );
                })}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack className="w-full gap-md">
                <Button
                  variant="outline"
                  action="secondary"
                  onPress={() => setStep('details')}
                  className="flex-1 border-sanctuary-border"
                  isDisabled={isSubmitting}
                >
                  <ButtonText className="text-sanctuary-text-secondary font-English">
                    Back
                  </ButtonText>
                </Button>
                <Button
                  action="primary"
                  onPress={handleSubmit}
                  className="flex-[2] bg-sanctuarySaffron"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner size="small" className="text-sacredWhite" />
                  ) : (
                    <ButtonText className="text-sacredWhite font-English">
                      {isEdit ? 'Save Changes' : 'Establish Sanctuary'}
                    </ButtonText>
                  )}
                </Button>
              </HStack>
            </ModalFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <ModalHeader>
              <VStack className="items-center w-full gap-sm">
                <Icon as={CheckCircle} className="text-sanctuarySaffron" size="xl" />
                <Heading className="text-sanctuary-text text-center" size="lg">
                  Sanctuary Established!
                </Heading>
              </VStack>
            </ModalHeader>

            <ModalBody>
              <VStack className="gap-lg items-center">
                <Text className="text-center text-sanctuary-text-secondary">
                  Congratulations! <Text className="font-bold text-sanctuary-text">{name}</Text> is
                  now live.
                </Text>

                <Box className="bg-sanctuary-surface-elevated p-md rounded-comfortable w-full">
                  <VStack className="gap-sm">
                    <HStack className="gap-sm items-center">
                      <Icon as={School} className="text-sanctuarySaffron" size="sm" />
                      <Text className="text-sm text-sanctuary-text">School Dashboard Ready</Text>
                    </HStack>
                    <HStack className="gap-sm items-center">
                      <Icon as={MessageSquare} className="text-sanctuarySaffron" size="sm" />
                      <Text className="text-sm text-sanctuary-text">Community HQ Created</Text>
                    </HStack>
                  </VStack>
                </Box>

                <Text className="text-[13px] text-sanctuary-text-tertiary text-center">
                  You've been assigned as the Principal. You can now invite staff and start building
                  your curriculum.
                </Text>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <VStack className="w-full gap-md">
                <Button
                  action="primary"
                  onPress={handleClose}
                  className="w-full bg-sanctuarySaffron"
                >
                  <ButtonText className="text-sacredWhite font-English">
                    Enter School Dashboard
                  </ButtonText>
                </Button>
                {createdIds?.groupId && (
                  <Button
                    variant="outline"
                    onPress={navigateToCommunity}
                    className="w-full border-sanctuary-border"
                  >
                    <ButtonText className="text-sanctuary-text-secondary font-English">
                      Visit Community HQ
                    </ButtonText>
                  </Button>
                )}
              </VStack>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
