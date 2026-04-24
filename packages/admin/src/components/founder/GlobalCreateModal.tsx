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
  VStack,
  Heading,
  Icon as UIIcon,
  Textarea,
  TextareaInput
} from '@repo/ui';
import { handleAPIError, growthSignalsAPI, identityAPI, type School } from '@repo/core';
import { createFounderClassroom, createFounderSchool } from '../../bridge/founderWorkspace';
import { communityAPI } from '@repo/community';
import { hapticLight, hapticSuccess, useTranslation } from '@repo/ui';
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
  availableSchools
}: GlobalCreateModalProps) {
  const { t } = useTranslation();

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
          created_by: userId
        });

        if (result) {
          await communityAPI.createGroupWithOwner(
            {
              name: `${name.trim()} Sanctuary`,
              description: `The primary sanctuary for ${name.trim()} members to share and resonate.`,
              group_type: 'school',
              join_policy: 'open',
              school_id: result.id
            },
            userId,
          );
        }
      } else if (type === 'classroom') {
        result = await createFounderClassroom({
          name: name.trim(),
          school_id: selectedSchoolId,
          grade_number: 1, // Defaulting to 1 for global creator
          created_by: userId
        });

        if (result) {
          await communityAPI.createGroupWithOwner(
            {
              name: `${name.trim()} Sanctuary`,
              description: `A sacred space for the ${name.trim()} classroom discussions and heart-sharing.`,
              group_type: 'class',
              join_policy: 'restricted',
              school_id: selectedSchoolId,
              classroom_id: result.id
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
            join_policy: 'open'
          },
          userId,
        );
      }

      hapticSuccess();
      if (type === 'classroom' && result) {
        growthSignalsAPI.emitSilent({
          user_id: userId,
          event_type: 'classroom_created',
          event_metadata: {
            classroom_id: result.id,
            school_id: selectedSchoolId
          }
        });
      }

      onSuccess(type, result);
      handleClose();
    } catch (err: any) {
      const apiError = handleAPIError(err, true);
      setError(apiError.message || 'Action failed');
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
          <HStack className="gap-3 w-full">
            <Button
              variant="outline"
              onPress={handleClose}
              className="flex-1 rounded-2xl h-12"
              isDisabled={isSubmitting}
            >
              <ButtonText className="text-ink/60 font-bold">Cancel</ButtonText>
            </Button>
            <Button
              onPress={handleSubmit}
              className="flex-1 rounded-2xl h-12 bg-phase-accent shadow-sm"
              isDisabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <Spinner color="white" size="small" />
              ) : (
                <ButtonText className="text-white font-bold">Initialize</ButtonText>
              )}
            </Button>
          </HStack>
        }
      >
        <VStack className="gap-6 p-4">
          <HStack className="gap-2">
            <TypeButton
              active={type === 'school'}
              onPress={() => setType('school')}
              label="School"
              icon={SchoolIcon}
            />
            <TypeButton
              active={type === 'classroom'}
              onPress={() => setType('classroom')}
              label="Class"
              icon={LayoutGrid}
            />
            <TypeButton
              active={type === 'group'}
              onPress={() => setType('group')}
              label="Group"
              icon={Users}
            />
          </HStack>

          {error ? (
            <Box className="p-3 bg-red-50 rounded-xl border border-red-200">
              <Text className="text-red-600 text-[13px] font-bold">{error}</Text>
            </Box>
          ) : null}

          <VStack className="gap-4">
            {type !== 'school' ? (
              <FormControl isRequired>
                <FormControlLabel>
                  <FormControlLabelText className="text- ink/40 font-bold text-xs uppercase tracking-wider">Target Institution</FormControlLabelText>
                </FormControlLabel>
                <Button
                  variant="outline"
                  onPress={() => setShowSchoolPicker(true)}
                  className="justify-between border-border bg-silk h-12 rounded-xl px-4"
                >
                  <ButtonText className={`font-bold ${selectedSchoolId ? 'text-ink' : 'text-ink/40'}`}>
                    {selectedSchool ? selectedSchool.name : 'Select School...'}
                  </ButtonText>
                  <UIIcon as={ChevronDown} size="sm" className="text-ink/40" />
                </Button>
              </FormControl>
            ) : null}

            <FormControl isRequired>
              <FormControlLabel>
                <FormControlLabelText className="text-ink/40 font-bold text-xs uppercase tracking-wider">
                  {type === 'school' ? 'Institution Name' : type === 'classroom' ? 'Class Name/ID' : 'Group Name'}
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="bg-silk border-border h-12 rounded-xl px-2">
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
                  className="text-ink font-bold"
                />
              </Input>
            </FormControl>

            {type === 'group' ? (
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-ink/40 font-bold text-xs uppercase tracking-wider">Purpose / Description</FormControlLabelText>
                </FormControlLabel>
                <Textarea className="border-border bg-silk rounded-xl">
                  <TextareaInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Briefly describe this community space..."
                    className="text-ink font-bold"
                  />
                </Textarea>
              </FormControl>
            ) : null}
          </VStack>
        </VStack>
      </SanctuaryModal>

      <Actionsheet isOpen={showSchoolPicker} onClose={() => setShowSchoolPicker(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-white">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className="p-4 gap-2 w-full">
            {availableSchools.map((school) => (
              <ActionsheetItem
                key={school.id}
                onPress={() => {
                  setSelectedSchoolId(school.id);
                  setShowSchoolPicker(false);
                }}
                className="rounded-xl active:bg-silk"
              >
                <ActionsheetItemText className="text-ink font-bold">{school.name}</ActionsheetItemText>
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
  icon: Icon
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  icon: any;
}) {
  return (
    <Button
      variant={active ? 'solid' : 'outline'}
      onPress={onPress}
      className={`flex-1 gap-2 h-11 rounded-xl shadow-sm ${active ? 'bg-primary' : 'bg-transparent border-border'}`}
    >
      <UIIcon as={Icon} className={active ? 'text-white' : 'text-ink/40'} size="sm" />
      <ButtonText className={`font-black text-xs uppercase tracking-widest ${active ? 'text-white' : 'text-ink/40'}`}>{label}</ButtonText>
    </Button>
  );
}
