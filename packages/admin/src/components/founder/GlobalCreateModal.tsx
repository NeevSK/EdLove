import { communityAPI } from '@repo/community';
import { growthSignalsAPI, identityAPI } from '@repo/core/api';
import { handleAPIError } from '@repo/core/logic';
import type { School } from '@repo/core/types';

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
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
  Icon,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { ChevronDown, LayoutGrid, School as SchoolIcon, Users } from 'lucide-react-native';
import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { createFounderClassroom, createFounderSchool } from '../../bridge/founderWorkspace';

interface GlobalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type: 'school' | 'classroom' | 'group', data: any) => void;
  availableSchools: School[];
}

type State = {
  type: CreateType;
  name: string;
  description: string;
  selectedSchoolId: string;
  schoolType: 'primary' | 'secondary' | 'mixed';
  isSubmitting: boolean;
  error: string | null;
  showSchoolPicker: boolean;
};

type Action =
  | { type: 'SET_TYPE'; createType: CreateType }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'SET_SCHOOL'; schoolId: string }
  | { type: 'SET_SCHOOL_TYPE'; schoolType: 'primary' | 'secondary' | 'mixed' }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'TOGGLE_PICKER'; isOpen: boolean }
  | { type: 'RESET' };

const createReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TYPE':
      return { ...state, type: action.createType, error: null };
    case 'SET_NAME':
      return { ...state, name: action.name, error: null };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.description };
    case 'SET_SCHOOL':
      return { ...state, selectedSchoolId: action.schoolId, error: null };
    case 'SET_SCHOOL_TYPE':
      return { ...state, schoolType: action.schoolType };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'TOGGLE_PICKER':
      return { ...state, showSchoolPicker: action.isOpen };
    case 'RESET':
      return {
        ...state,
        name: '',
        description: '',
        selectedSchoolId: '',
        schoolType: 'mixed',
        error: null,
        isSubmitting: false,
      };
    default:
      return state;
  }
};

type CreateType = 'school' | 'classroom' | 'group';

export default function GlobalCreateModal({
  isOpen,
  onClose,
  onSuccess,
  availableSchools,
}: GlobalCreateModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [state, dispatch] = useReducer(createReducer, {
    type: 'school',
    name: '',
    description: '',
    selectedSchoolId: '',
    schoolType: 'mixed',
    isSubmitting: false,
    error: null,
    showSchoolPicker: false,
  });

  const handleClose = () => {
    dispatch({ type: 'RESET' });
    onClose();
  };

  const handleSubmit = async () => {
    if (!state.name.trim()) {
      dispatch({ type: 'SET_ERROR', error: 'Name is required' });
      return;
    }

    if (state.type !== 'school' && !state.selectedSchoolId) {
      dispatch({ type: 'SET_ERROR', error: 'Please select a target school' });
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    hapticLight();

    try {
      const userId = await identityAPI.getMyInternalId();
      if (!userId) throw new Error('Not authenticated');

      let result: any;
      if (state.type === 'school') {
        result = await createFounderSchool({
          name: state.name.trim(),
          type: state.schoolType,
          created_by: userId,
        });

        if (result) {
          await communityAPI.createGroupWithOwner(
            {
              name: `${state.name.trim()} Sanctuary`,
              description: `The primary sanctuary for ${state.name.trim()} members to share and resonate.`,
              group_type: 'school',
              join_policy: 'open',
              school_id: result.id,
            },
            userId,
          );
        }
      } else if (state.type === 'classroom') {
        result = await createFounderClassroom({
          name: state.name.trim(),
          school_id: state.selectedSchoolId,
          grade_number: 1,
          created_by: userId,
        });

        if (result) {
          await communityAPI.createGroupWithOwner(
            {
              name: `${state.name.trim()} Sanctuary`,
              description: `A sacred space for the ${state.name.trim()} classroom discussions and heart-sharing.`,
              group_type: 'class',
              join_policy: 'restricted',
              school_id: state.selectedSchoolId,
              classroom_id: result.id,
            },
            userId,
          );
        }
      } else if (state.type === 'group') {
        result = await communityAPI.createGroupWithOwner(
          {
            name: state.name.trim(),
            description: state.description.trim(),
            school_id: state.selectedSchoolId,
            group_type: 'general',
            join_policy: 'open',
          },
          userId,
        );
      }

      hapticSuccess();
      if (state.type === 'classroom' && result) {
        growthSignalsAPI.emitSilent({
          user_id: userId,
          event_type: 'classroom_created',
          event_metadata: {
            classroom_id: result.id,
            school_id: state.selectedSchoolId,
          },
        });
      }

      toast.showToast({
        message: `Success: ${state.type} initialized`,
        type: 'success',
      });
      onSuccess(state.type, result);
      handleClose();
    } catch (err: any) {
      const apiError = handleAPIError(err, true);
      dispatch({ type: 'SET_ERROR', error: apiError.message });
      toast.showToast({
        message: `Error: ${apiError.message}`,
        type: 'error',
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  };

  const selectedSchool = availableSchools.find((s) => s.id === state.selectedSchoolId);

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
              action="secondary"
              onPress={handleClose}
              className="flex-1 rounded-2xl border-phase-border"
              isDisabled={state.isSubmitting}
              accessibilityLabel="Cancel"
              accessibilityHint="Discards changes and closes the creation modal"
            >
              <ButtonText className="text-phaseText-secondary font-bold uppercase tracking-wider">
                Cancel
              </ButtonText>
            </Button>
            <Button
              onPress={handleSubmit}
              className={`flex-1 rounded-2xl bg-phase-interactive shadow-sm ${state.isSubmitting || !state.name.trim() ? 'opacity-50' : ''}`}
              isDisabled={state.isSubmitting || !state.name.trim()}
              accessibilityLabel="Initialize"
              accessibilityHint="Starts the creation process for the selected entity"
            >
              {state.isSubmitting ? (
                <Spinner color="#FFFFFF" size="small" />
              ) : (
                <ButtonText className="text-white font-black uppercase tracking-[2px]">
                  Initialize
                </ButtonText>
              )}
            </Button>
          </HStack>
        }
      >
        <VStack className="gap-6 py-4">
          <HStack className="gap-2">
            <TypeButton
              active={state.type === 'school'}
              onPress={() => dispatch({ type: 'SET_TYPE', createType: 'school' })}
              label="School"
              icon={<Icon as={SchoolIcon} size="xs" />}
            />
            <TypeButton
              active={state.type === 'classroom'}
              onPress={() => dispatch({ type: 'SET_TYPE', createType: 'classroom' })}
              label="Class"
              icon={<Icon as={LayoutGrid} size="xs" />}
            />
            <TypeButton
              active={state.type === 'group'}
              onPress={() => dispatch({ type: 'SET_TYPE', createType: 'group' })}
              label="Group"
              icon={<Icon as={Users} size="xs" />}
            />
          </HStack>

          {state.error ? (
            <Box className="p-4 bg-phase-danger/10 border border-phase-danger/30 rounded-2xl">
              <Text className="text-phase-danger text-[13px] font-bold">{state.error}</Text>
            </Box>
          ) : null}

          <VStack className="gap-5">
            {state.type !== 'school' ? (
              <FormControl isRequired>
                <FormControlLabel>
                  <FormControlLabelText className="text-phaseText-secondary text-xs font-bold uppercase tracking-wider">
                    Target Institution
                  </FormControlLabelText>
                </FormControlLabel>
                <Pressable
                  onPress={() => {
                    hapticLight();
                    dispatch({ type: 'TOGGLE_PICKER', isOpen: true });
                  }}
                  className="flex-row justify-between items-center px-4 h-14 bg-phase-canvas border border-phase-border rounded-2xl active:scale-[0.98] transition-all"
                  accessibilityLabel="Target School"
                  accessibilityHint="Select which school this classroom or group belongs to"
                >
                  <Text
                    className={`font-bold ${state.selectedSchoolId ? 'text-phaseText-primary' : 'text-phaseText-muted'}`}
                  >
                    {selectedSchool ? selectedSchool.name : 'Select School...'}
                  </Text>
                  <Icon as={ChevronDown} size="sm" className="text-phaseText-muted" />
                </Pressable>
              </FormControl>
            ) : null}

            <FormControl isRequired>
              <FormControlLabel>
                <FormControlLabelText className="text-phaseText-secondary text-xs font-bold uppercase tracking-wider">
                  {state.type === 'school'
                    ? 'Institution Name'
                    : state.type === 'classroom'
                      ? 'Class Name/ID'
                      : 'Group Name'}
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="h-14 bg-phase-canvas border-phase-border rounded-2xl">
                <InputField
                  value={state.name}
                  onChangeText={(val) => dispatch({ type: 'SET_NAME', name: val })}
                  placeholder={
                    state.type === 'school'
                      ? t('founder.create.schoolName', {
                          defaultValue: 'e.g. Gurudevi Academy',
                        })
                      : state.type === 'classroom'
                        ? t('founder.create.className', {
                            defaultValue: 'e.g. Grade 8A',
                          })
                        : t('founder.create.groupName', {
                            defaultValue: 'e.g. Parent Council',
                          })
                  }
                  className="text-phaseText-primary font-bold"
                  accessibilityLabel="Entity Name"
                  accessibilityHint="Enter the formal name for the new entity"
                />
              </Input>
            </FormControl>

            {state.type === 'group' ? (
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-phaseText-secondary text-xs font-bold uppercase tracking-wider">
                    Purpose / Description
                  </FormControlLabelText>
                </FormControlLabel>
                <Textarea className="bg-phase-canvas border-phase-border rounded-2xl p-0 overflow-hidden">
                  <TextareaInput
                    value={state.description}
                    onChangeText={(val) => dispatch({ type: 'SET_DESCRIPTION', description: val })}
                    placeholder="Briefly describe this community space..."
                    className="p-4 text-phaseText-primary font-medium"
                    accessibilityLabel="Description"
                    accessibilityHint="Provide a short overview of the group's intent"
                  />
                </Textarea>
              </FormControl>
            ) : null}
          </VStack>
        </VStack>
      </SanctuaryModal>

      <Actionsheet
        isOpen={state.showSchoolPicker}
        onClose={() => dispatch({ type: 'TOGGLE_PICKER', isOpen: false })}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-phase-surface">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className="p-4 gap-2 w-full">
            {availableSchools.map((school) => (
              <ActionsheetItem
                key={school.id}
                onPress={() => {
                  hapticLight();
                  dispatch({ type: 'SET_SCHOOL', schoolId: school.id });
                  dispatch({ type: 'TOGGLE_PICKER', isOpen: false });
                }}
                className="rounded-xl active:bg-phase-canvas"
              >
                <ActionsheetItemText className="text-phaseText-primary font-bold">
                  {school.name}
                </ActionsheetItemText>
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
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border transition-all ${active ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-canvas border-phase-border'}`}
      accessibilityLabel={`Select ${label}`}
      accessibilityHint={`Sets the creation type to ${label}`}
      accessibilityState={{ selected: active }}
    >
      {React.cloneElement(icon, {
        className: active ? 'text-white' : 'text-phaseText-secondary',
      } as any)}
      <Text
        className={`text-[11px] font-black uppercase tracking-wider ${active ? 'text-white' : 'text-phaseText-secondary'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
