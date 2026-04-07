import React, { useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Input,
  InputField,
  SanctuaryModal,
  Spinner,
  Text,
  Theme,
  VStack,
  useThemedColors,
} from '@repo/ui';
import { School, handleAPIError, growthSignalsAPI, identityAPI } from '@repo/core';
import { createFounderClassroom, createFounderSchool } from '../../bridge/founderWorkspace';
import { communityAPI } from '@repo/community';
import { hapticLight, hapticSuccess, Textarea, useTranslation } from '@repo/ui';
import { ChevronDown, LayoutGrid, School as SchoolIcon, Users } from 'lucide-react-native';

interface GlobalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type: 'school' | 'classroom' | 'group', data: any) => void;
  availableSchools: School[];
}

type CreateType = 'school' | 'classroom' | 'group';

export default function GlobalCreateModal({
  isOpen,
  onClose,
  onSuccess,
  availableSchools,
}: GlobalCreateModalProps) {
  const { t } = useTranslation();
  const colors = useThemedColors();

  const [type, setType] = useState<CreateType>('school');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [schoolType, setSchoolType] = useState<'primary' | 'secondary' | 'mixed'>('mixed');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedSchoolId('');
    setSchoolType('mixed');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (type !== 'school' && !selectedSchoolId) {
      setError('Please select a target school');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    hapticLight();

    try {
      const userId = await identityAPI.getMyInternalId();
      if (!userId) throw new Error('Not authenticated');

      let result: any;
      if (type === 'school') {
        result = await createFounderSchool({
          name: name.trim(),
          type: schoolType,
          created_by: userId,
        });

        if (result) {
          await communityAPI.createGroupWithOwner(
            {
              name: `${name.trim()} Sanctuary`,
              description: `The primary sanctuary for ${name.trim()} members to share and resonate.`,
              group_type: 'school',
              join_policy: 'open',
              school_id: result.id,
            },
            userId,
          );
        }
      } else if (type === 'classroom') {
        result = await createFounderClassroom({
          name: name.trim(),
          school_id: selectedSchoolId,
          grade_number: 1, // Defaulting to 1 for global creator
          created_by: userId,
        });

        if (result) {
          await communityAPI.createGroupWithOwner(
            {
              name: `${name.trim()} Sanctuary`,
              description: `A sacred space for the ${name.trim()} classroom discussions and heart-sharing.`,
              group_type: 'class',
              join_policy: 'restricted',
              school_id: selectedSchoolId,
              classroom_id: result.id,
            },
            userId,
          );
        }
      } else if (type === 'group') {
        result = await communityAPI.createGroupWithOwner(
          {
            name: name.trim(),
            description: description.trim(),
            school_id: selectedSchoolId,
            group_type: 'general',
            join_policy: 'open',
          },
          userId,
        );
      }

      hapticSuccess();
      if (type === 'classroom' && result) {
        growthSignalsAPI.emitSilent(userId, 'classroom_created', {
          classroom_id: result.id,
          school_id: selectedSchoolId,
        });
      }

      onSuccess(type, result);
      handleClose();
    } catch (err: any) {
      const apiError = handleAPIError(err, true);
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSchool = availableSchools.find((s) => s.id === selectedSchoolId);

  return (
    <>
      <SanctuaryModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Ecosystem Creation"
        footer={
          <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
            <Button
              variant="outline"
              action="secondary"
              onPress={handleClose}
              sx={{ flex: 1, borderColor: colors.border }}
              isDisabled={isSubmitting}
            >
              <ButtonText color={colors.textSecondary}>Cancel</ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={handleSubmit}
              sx={{ flex: 1, backgroundColor: Theme.colors.sanctuarySaffron }}
              isDisabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <Spinner color={Theme.colors.sacredWhite} size="small" />
              ) : (
                <ButtonText color={Theme.colors.sacredWhite}>Initialize</ButtonText>
              )}
            </Button>
          </HStack>
        }
      >
        <VStack sx={{ gap: Theme.spacing.xl }}>
          <HStack sx={{ gap: Theme.spacing.sm }}>
            <TypeButton
              active={type === 'school'}
              onPress={() => setType('school')}
              label="School"
              icon={<SchoolIcon size={16} />}
            />
            <TypeButton
              active={type === 'classroom'}
              onPress={() => setType('classroom')}
              label="Class"
              icon={<LayoutGrid size={16} />}
            />
            <TypeButton
              active={type === 'group'}
              onPress={() => setType('group')}
              label="Group"
              icon={<Users size={16} />}
            />
          </HStack>

          {error ? (
            <Box
              sx={{
                padding: 12,
                backgroundColor: '#fee2e2',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ef4444',
              }}
            >
              <Text sx={{ color: '#b91c1c', fontSize: 13 }}>{error}</Text>
            </Box>
          ) : null}

          <VStack sx={{ gap: Theme.spacing.md }}>
            {type !== 'school' ? (
              <FormControl isRequired>
                <FormControlLabel>
                  <FormControlLabelText color={colors.textSecondary}>Target Institution</FormControlLabelText>
                </FormControlLabel>
                <Button
                  variant="outline"
                  onPress={() => setShowSchoolPicker(true)}
                  sx={{
                    justifyContent: 'space-between',
                    borderColor: colors.border,
                    backgroundColor: colors.tertiary,
                    height: 48,
                  }}
                >
                  <ButtonText color={selectedSchoolId ? colors.text : colors.textTertiary}>
                    {selectedSchool ? selectedSchool.name : 'Select School...'}
                  </ButtonText>
                  <ChevronDown size={18} color={colors.textSecondary} />
                </Button>
              </FormControl>
            ) : null}

            <FormControl isRequired>
              <FormControlLabel>
                <FormControlLabelText color={colors.textSecondary}>
                  {type === 'school' ? 'Institution Name' : type === 'classroom' ? 'Class Name/ID' : 'Group Name'}
                </FormControlLabelText>
              </FormControlLabel>
              <Input sx={{ backgroundColor: colors.tertiary, borderColor: colors.border }}>
                <InputField
                  value={name}
                  onChangeText={setName}
                  placeholder={
                    type === 'school'
                      ? t('founder.create.schoolName', { defaultValue: 'e.g. Gurudevi Academy' })
                      : type === 'classroom'
                        ? t('founder.create.className', { defaultValue: 'e.g. Grade 8A' })
                        : t('founder.create.groupName', { defaultValue: 'e.g. Parent Council' })
                  }
                  color={colors.text}
                />
              </Input>
            </FormControl>

            {type === 'group' ? (
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText color={colors.textSecondary}>Purpose / Description</FormControlLabelText>
                </FormControlLabel>
                <Textarea
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Briefly describe this community space..."
                  minHeight={80}
                  borderColor={colors.border}
                  bg={colors.tertiary}
                  color={colors.text}
                />
              </FormControl>
            ) : null}
          </VStack>
        </VStack>
      </SanctuaryModal>

      <Actionsheet isOpen={showSchoolPicker} onClose={() => setShowSchoolPicker(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent sx={{ backgroundColor: colors.secondary }}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack sx={{ padding: 16, gap: 8 }}>
            {availableSchools.map((school) => (
              <ActionsheetItem
                key={school.id}
                onPress={() => {
                  setSelectedSchoolId(school.id);
                  setShowSchoolPicker(false);
                }}
              >
                <ActionsheetItemText color={colors.text}>{school.name}</ActionsheetItemText>
              </ActionsheetItem>
            ))}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}

function TypeButton({
  active,
  onPress,
  label,
  icon,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  icon: React.ReactElement;
}) {
  const colors = useThemedColors();
  return (
    <Button
      variant={active ? 'solid' : 'outline'}
      onPress={onPress}
      sx={{
        flex: 1,
        gap: 4,
        backgroundColor: active ? Theme.colors.sanctuarySaffron : 'transparent',
        borderColor: active ? Theme.colors.sanctuarySaffron : colors.border,
      }}
      size="sm"
    >
      {React.cloneElement(icon as React.ReactElement<{ color?: string }>, { color: active ? '#fff' : colors.textSecondary })}
      <ButtonText color={active ? '#fff' : colors.textSecondary}>{label}</ButtonText>
    </Button>
  );
}
