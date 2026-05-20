import { communityAPI } from '@repo/community';
import { growthSignalsAPI, identityAPI } from '@repo/core/api';
import { handleAPIError } from '@repo/core/logic';
import type { School } from '@repo/core/types';

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import {
  Activity,
  ChevronDown,
  Globe,
  LayoutGrid,
  School as SchoolIcon,
  Users,
} from '@repo/ui/icons';
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
  Heading,
  HStack,
  Input,
  InputField,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  Icon as UIIcon,
  VStack,
} from '@repo/ui/primitives';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createFounderClassroom, createFounderSchool } from '../../bridge/founderWorkspace';

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
          school_id: selectedSchoolId,
          name: name.trim(),
          grade_number: 1, // Default to 1
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

      if (type === 'classroom' && result) {
        void growthSignalsAPI
          .emitSignal({
            user_id: userId,
            event_type: 'classroom_created',
            event_metadata: {
              classroom_id: result.id,
              school_id: selectedSchoolId,
            },
          })
          .catch(() => {});
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
              className="flex-2 h-12 rounded-2xl bg-phase-accent shadow-sm"
              isDisabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <Spinner color="white" size="small" />
              ) : (
                <ButtonText className="text-white font-bold">Initialize Entity</ButtonText>
              )}
            </Button>
          </HStack>
        }
      >
        <VStack className="gap-8 p-6">
          <HStack className="gap-3">
            <TypeButton
              active={type === 'school'}
              onPress={() => setType('school')}
              label="New Institution"
              icon={SchoolIcon}
            />
            <TypeButton
              active={type === 'classroom'}
              onPress={() => setType('classroom')}
              label="New Classroom"
              icon={LayoutGrid}
            />
            <TypeButton
              active={type === 'group'}
              onPress={() => setType('group')}
              label="New Sanctuary"
              icon={Users}
            />
          </HStack>

          {error && (
            <Box className="p-4 bg-red-50 rounded-xl border border-red-200">
              <HStack className="gap-2 items-center">
                <UIIcon as={Activity} size="sm" className="text-red-500" />
                <Text className="text-red-600 text-[13px] font-bold">{error}</Text>
              </HStack>
            </Box>
          )}

          <VStack className="gap-6">
            {type !== 'school' && (
              <FormControl isRequired>
                <FormControlLabel>
                  <FormControlLabelText className="text-ink/40 font-bold text-xs uppercase tracking-wider">
                    Associated Institution
                  </FormControlLabelText>
                </FormControlLabel>
                <Button
                  variant="outline"
                  onPress={() => setShowSchoolPicker(true)}
                  className="justify-between border-border bg-silk h-14 rounded-2xl px-4"
                >
                  <HStack className="gap-2 items-center">
                    <UIIcon as={Globe} size="sm" className="text-ink/40" />
                    <ButtonText
                      className={`font-bold ${selectedSchoolId ? 'text-ink' : 'text-ink/40'}`}
                    >
                      {selectedSchool ? selectedSchool.name : 'Select Target Institution...'}
                    </ButtonText>
                  </HStack>
                  <UIIcon as={ChevronDown} size="sm" className="text-ink/40" />
                </Button>
              </FormControl>
            )}

            <FormControl isRequired>
              <FormControlLabel>
                <FormControlLabelText className="text-ink/40 font-bold text-xs uppercase tracking-wider">
                  {type === 'school'
                    ? 'Institution Name'
                    : type === 'classroom'
                      ? 'Classroom Display Name'
                      : 'Community Name'}
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="h-14 bg-silk border-border rounded-2xl px-2">
                <InputField
                  value={name}
                  onChangeText={setName}
                  className="text-ink font-bold"
                  placeholder={type === 'school' ? 'e.g., Royal Gurudevi Academy' : 'Enter name...'}
                />
              </Input>
            </FormControl>

            {type === 'school' && (
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-ink/40 font-bold text-xs uppercase tracking-wider">
                    Institutional Category
                  </FormControlLabelText>
                </FormControlLabel>
                <HStack className="gap-3">
                  {(['primary', 'secondary', 'mixed'] as const).map((t) => (
                    <Button
                      key={t}
                      variant={schoolType === t ? 'solid' : 'outline'}
                      onPress={() => setSchoolType(t)}
                      className={`flex-1 h-11 rounded-full shadow-sm ${schoolType === t ? 'bg-phase-accent' : 'bg-transparent border-border'}`}
                    >
                      <ButtonText
                        className={`text-xs font-black uppercase tracking-widest ${schoolType === t ? 'text-white' : 'text-ink/40'}`}
                      >
                        {t}
                      </ButtonText>
                    </Button>
                  ))}
                </HStack>
              </FormControl>
            )}

            {type === 'group' && (
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-ink/40 font-bold text-xs uppercase tracking-wider">
                    Intent & Purpose
                  </FormControlLabelText>
                </FormControlLabel>
                <Textarea className="min-h-[120px] bg-silk border-border rounded-[24px]">
                  <TextareaInput
                    value={description}
                    onChangeText={setDescription}
                    className="text-ink font-bold"
                    placeholder="Describe the heart and intent of this sanctuary space..."
                  />
                </Textarea>
              </FormControl>
            )}
          </VStack>
        </VStack>
      </SanctuaryModal>

      <Actionsheet isOpen={showSchoolPicker} onClose={() => setShowSchoolPicker(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-white max-w-[500px] self-center">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className="p-8 gap-4 w-full">
            <Heading className="text-xl font-black text-ink mb-2">Select Institution</Heading>
            {availableSchools.map((school) => (
              <ActionsheetItem
                key={school.id}
                onPress={() => {
                  setSelectedSchoolId(school.id);
                  setShowSchoolPicker(false);
                }}
                className="rounded-2xl active:bg-silk px-4"
              >
                <HStack className="gap-3 items-center">
                  <UIIcon as={SchoolIcon} size="sm" className="text-primary" />
                  <ActionsheetItemText className="text-ink font-bold">
                    {school.name}
                  </ActionsheetItemText>
                </HStack>
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
  icon: Icon,
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
      className={`flex-1 flex-col h-24 gap-2 rounded-[24px] shadow-sm ${active ? 'bg-phase-accent' : 'bg-transparent border-border'}`}
    >
      <Box className="mb-1">
        <UIIcon as={Icon} className={active ? 'text-white' : 'text-ink/40'} size="md" />
      </Box>
      <ButtonText
        className={`text-[10px] font-black uppercase tracking-widest text-center ${active ? 'text-white' : 'text-ink/40'}`}
      >
        {label}
      </ButtonText>
    </Button>
  );
}
