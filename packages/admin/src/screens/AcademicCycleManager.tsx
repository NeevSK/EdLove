import { api } from '@repo/core/api/client';
import type { AcademicCycle } from '@repo/core/types';

import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Calendar, Circle, CircleCheck, Clock, Plus, Trash2 } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { confirmAction } from '@repo/ui/utils/dialogs';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useCallback, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

interface AcademicCycleManagerProps {
  schoolId: string;
  onBack: () => void;
}

type State = {
  cycles: AcademicCycle[];
  isLoading: boolean;
  loadError: string | null;
  isAddFormVisible: boolean;
  isSaving: boolean;
  form: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
};

type Action =
  | { type: 'SET_CYCLES'; cycles: AcademicCycle[] }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_LOAD_ERROR'; message: string | null }
  | { type: 'TOGGLE_FORM' }
  | { type: 'UPDATE_FORM'; field: keyof State['form']; value: string | boolean }
  | { type: 'RESET_FORM' }
  | { type: 'SET_SAVING'; isSaving: boolean };

const academicCyclesReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CYCLES':
      return { ...state, cycles: action.cycles, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_LOAD_ERROR':
      return { ...state, loadError: action.message };
    case 'TOGGLE_FORM':
      return { ...state, isAddFormVisible: !state.isAddFormVisible };
    case 'UPDATE_FORM':
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
      };
    case 'RESET_FORM':
      return {
        ...state,
        form: { name: '', startDate: '', endDate: '', isCurrent: false },
        isAddFormVisible: false,
        isSaving: false,
      };
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving };
    default:
      return state;
  }
};

export default function AcademicCycleManager({ schoolId, onBack }: AcademicCycleManagerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [state, dispatch] = useReducer(academicCyclesReducer, {
    cycles: [],
    isLoading: true,
    loadError: null,
    isAddFormVisible: false,
    isSaving: false,
    form: { name: '', startDate: '', endDate: '', isCurrent: false },
  });

  const fetchCycles = useCallback(async () => {
    try {
      const data = await api.academicCycles.getAll(schoolId);
      dispatch({ type: 'SET_CYCLES', cycles: data ?? [] });
      dispatch({ type: 'SET_LOAD_ERROR', message: null });
    } catch (error) {
      console.error('Failed to fetch cycles:', error);
      dispatch({ type: 'SET_LOADING', isLoading: false });
      dispatch({ type: 'SET_LOAD_ERROR', message: 'Academic cycles could not be loaded.' });
    }
  }, [schoolId]);

  useEffect(() => {
    void fetchCycles();
  }, [fetchCycles]);

  const handleCreate = async () => {
    const { name, startDate, endDate, isCurrent } = state.form;
    if (!name || !startDate || !endDate) {
      toast.showToast({
        message: 'Missing Info: Please fill in all fields',
        type: 'error',
      });
      return;
    }

    const parsedStart = new Date(`${startDate}T00:00:00`);
    const parsedEnd = new Date(`${endDate}T00:00:00`);
    const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (
      !isIsoDate(startDate) ||
      !isIsoDate(endDate) ||
      Number.isNaN(parsedStart.getTime()) ||
      Number.isNaN(parsedEnd.getTime()) ||
      parsedStart > parsedEnd
    ) {
      toast.showToast({
        message: 'Please enter valid dates in YYYY-MM-DD order.',
        type: 'error',
      });
      return;
    }

    dispatch({ type: 'SET_SAVING', isSaving: true });
    try {
      await api.academicCycles.create({
        school_id: schoolId,
        name,
        start_date: parsedStart,
        end_date: parsedEnd,
        is_current: isCurrent,
      });
      hapticSuccess();
      dispatch({ type: 'RESET_FORM' });
      void fetchCycles();
      toast.showToast({
        message: 'Success: Academic cycle created',
        type: 'success',
      });
    } catch {
      toast.showToast({
        message: 'Error: Failed to create academic cycle',
        type: 'error',
      });
      dispatch({ type: 'SET_SAVING', isSaving: false });
    }
  };

  const handleSetCurrent = async (cycleId: string) => {
    try {
      await api.academicCycles.update(cycleId, schoolId, { is_current: true });
      hapticLight();
      void fetchCycles();
      toast.showToast({
        message: 'Cycle Updated: This cycle is now active',
        type: 'success',
      });
    } catch {
      toast.showToast({
        message: 'Error: Failed to update cycle',
        type: 'error',
      });
    }
  };

  const handleDelete = async (cycleId: string) => {
    const confirmed = await confirmAction(
      t('common.confirmDeleteTitle') || 'Delete academic cycle?',
      t('common.confirmDelete') ||
        'This permanently removes the academic cycle. This action cannot be undone.',
    );
    if (confirmed) {
      await executeDelete(cycleId);
    }
  };

  const executeDelete = async (cycleId: string) => {
    try {
      await api.academicCycles.delete(cycleId);
      hapticLight();
      void fetchCycles();
      toast.showToast({
        message: 'Deleted: Cycle removed successfully',
        type: 'success',
      });
    } catch {
      toast.showToast({
        message: 'Error: Failed to delete cycle',
        type: 'error',
      });
    }
  };

  if (state.isLoading) {
    return (
      <Box className="flex-1 bg-phase-canvas">
        <GlobalHeader title="Academic Cycles" onBack={onBack} />
        <VStack className="p-6 gap-4">
          <SkeletonCard height={100} />
          <SkeletonCard height={100} />
          <SkeletonCard height={100} />
        </VStack>
      </Box>
    );
  }

  if (state.loadError) {
    return (
      <Box className="flex-1 bg-phase-canvas">
        <GlobalHeader title="Academic Cycles" onBack={onBack} />
        <VStack className="flex-1 items-center justify-center p-8 gap-4">
          <Text className="text-phase-danger font-bold text-center">{state.loadError}</Text>
          <Button
            variant="outline"
            onPress={() => {
              dispatch({ type: 'SET_LOADING', isLoading: true });
              void fetchCycles();
            }}
            accessibilityLabel="Retry loading academic cycles"
          >
            <ButtonText className="text-phase-danger font-bold">Try again</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-phase-canvas">
      <GlobalHeader
        title={t('principal.cycles.title') || 'Academic Cycles'}
        onBack={onBack}
        rightAction={
          <Pressable
            onPress={() => dispatch({ type: 'TOGGLE_FORM' })}
            accessibilityLabel="New Academic Cycle"
            accessibilityHint="Opens the form to define a new academic term or cycle"
          >
            <Icon as={Plus} size={24} className="text-phase-interactive" />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <VStack className="gap-8">
          <Box>
            <Text className="text-phaseText-secondary text-[13px] mb-1">
              {t('principal.cycles.description') ||
                'Define your terms and semesters to synchronize syllabus progress and attendance reports.'}
            </Text>
          </Box>

          {state.isAddFormVisible && (
            <Box className="bg-phase-surface p-6 rounded-[24px] border border-phase-border shadow-sm">
              <VStack className="gap-4">
                <Text className="text-sm font-black text-phaseText-primary uppercase tracking-widest">
                  New Cycle
                </Text>

                <VStack className="gap-1">
                  <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-wider">
                    Name (e.g. Term 1 2026)
                  </Text>
                  <Input className="border-phase-border">
                    <InputField
                      value={state.form.name}
                      onChangeText={(val) =>
                        dispatch({
                          type: 'UPDATE_FORM',
                          field: 'name',
                          value: val,
                        })
                      }
                      placeholder="Cycle Name"
                      className="text-phaseText-primary font-bold"
                      accessibilityLabel="Cycle Name"
                      accessibilityHint="Enter the name for the academic term, e.g. Semester 1"
                    />
                  </Input>
                </VStack>

                <HStack className="gap-4">
                  <VStack className="flex-1 gap-1">
                    <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-wider">
                      Start Date
                    </Text>
                    <Input className="border-phase-border">
                      <InputField
                        value={state.form.startDate}
                        onChangeText={(val) =>
                          dispatch({
                            type: 'UPDATE_FORM',
                            field: 'startDate',
                            value: val,
                          })
                        }
                        placeholder="YYYY-MM-DD"
                        className="text-phaseText-primary font-bold"
                        accessibilityLabel="Start Date"
                        accessibilityHint="Enter the starting date in ISO format"
                      />
                    </Input>
                  </VStack>
                  <VStack className="flex-1 gap-1">
                    <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-wider">
                      End Date
                    </Text>
                    <Input className="border-phase-border">
                      <InputField
                        value={state.form.endDate}
                        onChangeText={(val) =>
                          dispatch({
                            type: 'UPDATE_FORM',
                            field: 'endDate',
                            value: val,
                          })
                        }
                        placeholder="YYYY-MM-DD"
                        className="text-phaseText-primary font-bold"
                        accessibilityLabel="End Date"
                        accessibilityHint="Enter the ending date in ISO format"
                      />
                    </Input>
                  </VStack>
                </HStack>

                <HStack className="gap-3 items-center">
                  <Pressable
                    onPress={() =>
                      dispatch({
                        type: 'UPDATE_FORM',
                        field: 'isCurrent',
                        value: !state.form.isCurrent,
                      })
                    }
                    accessibilityLabel="Toggle Active Status"
                    accessibilityHint="Determines if this cycle should be the globally active one"
                  >
                    <HStack className="gap-2 items-center">
                      {state.form.isCurrent ? (
                        <Icon as={CircleCheck} size={18} className="text-phase-success" />
                      ) : (
                        <Icon as={Circle} size={18} className="text-phaseText-muted" />
                      )}
                      <Text className="text-[13px] font-bold text-phaseText-primary">
                        Set as Current Cycle
                      </Text>
                    </HStack>
                  </Pressable>
                </HStack>

                <Button
                  onPress={handleCreate}
                  isDisabled={state.isSaving}
                  className="bg-phase-interactive rounded-full h-12 shadow-sm mt-2"
                  accessibilityLabel="Create Cycle"
                  accessibilityHint="Submits the form and synchronizes the new cycle with the platform"
                >
                  <ButtonText className="text-white font-black uppercase tracking-widest">
                    {state.isSaving ? 'Saving...' : 'Create Cycle'}
                  </ButtonText>
                </Button>
              </VStack>
            </Box>
          )}

          <VStack className="gap-4">
            {state.cycles.length === 0 ? (
              <Box className="items-center p-12">
                <Icon as={Calendar} size={48} className="text-phaseText-muted" strokeWidth={1} />
                <Text className="mt-4 text-phaseText-muted font-bold">No cycles defined yet.</Text>
              </Box>
            ) : (
              state.cycles.map((cycle) => (
                <Box
                  key={cycle.id}
                  className={`bg-phase-surface p-5 rounded-[24px] border border-phase-border shadow-sm ${cycle.is_current ? 'border-phase-success/30' : ''}`}
                >
                  <HStack className="justify-between items-start">
                    <VStack className="gap-1 flex-1">
                      <HStack className="gap-2 items-center">
                        <Text className="text-lg font-black text-phaseText-primary">
                          {cycle.name}
                        </Text>
                        {cycle.is_current && (
                          <Box className="bg-phase-success/10 px-2 py-0.5 rounded-full border border-phase-success/30">
                            <Text className="text-[10px] font-black text-phase-success uppercase">
                              CURRENT
                            </Text>
                          </Box>
                        )}
                      </HStack>
                      <HStack className="gap-2 items-center">
                        <Icon as={Clock} size={12} className="text-phaseText-muted" />
                        <Text className="text-xs font-bold text-phaseText-muted">
                          {cycle.start_date.toLocaleDateString()} to{' '}
                          {cycle.end_date.toLocaleDateString()}
                        </Text>
                      </HStack>
                    </VStack>

                    <HStack className="gap-4">
                      {!cycle.is_current && (
                        <Pressable
                          onPress={() => handleSetCurrent(cycle.id)}
                          className="active:scale-90"
                          accessibilityLabel={`Set ${cycle.name} as active`}
                          accessibilityHint="Switches the platform to use this academic cycle for all data projections"
                        >
                          <Icon as={CircleCheck} size={20} className="text-phaseText-muted" />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() => void handleDelete(cycle.id)}
                        className="active:scale-90"
                        accessibilityLabel={`Delete ${cycle.name}`}
                        accessibilityHint="Permanently removes this academic cycle"
                      >
                        <Icon as={Trash2} size={20} className="text-phase-danger" />
                      </Pressable>
                    </HStack>
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
