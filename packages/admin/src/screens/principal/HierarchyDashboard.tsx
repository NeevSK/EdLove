import {
  ArrowLeft,
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Castle,
  FormControl,
  Heading,
  HStack,
  hapticLight,
  hapticSuccess,
  Icon,
  Input,
  InputField,
  Plus,
  Pressable,
  ScrollView,
  SkeletonCard,
  Text,
  VStack,
} from '@repo/ui';
import type React from 'react';
import { useCallback, useEffect, useReducer } from 'react';
import { type SchoolSectionRow, sectionsAPI } from '../../sections';

interface HierarchyDashboardProps {
  schoolId: string;
  isPastView: boolean;
  onBack: () => void;
}

type State = {
  sections: SchoolSectionRow[];
  loading: boolean;
  saving: boolean;
  newSectionName: string;
  newSectionGrade: string;
};

type Action =
  | { type: 'SET_SECTIONS'; payload: SchoolSectionRow[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'UPDATE_FIELD'; field: 'newSectionName' | 'newSectionGrade'; value: string }
  | { type: 'ADD_SECTION'; payload: SchoolSectionRow }
  | { type: 'RESET_FORM' };

const initialState: State = {
  sections: [],
  loading: true,
  saving: false,
  newSectionName: '',
  newSectionGrade: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_SECTION':
      return {
        ...state,
        sections: [...state.sections, action.payload],
        newSectionName: '',
        newSectionGrade: '',
      };
    case 'RESET_FORM':
      return { ...state, newSectionName: '', newSectionGrade: '' };
    default:
      return state;
  }
}

export const HierarchyDashboard: React.FC<HierarchyDashboardProps> = ({
  schoolId,
  isPastView,
  onBack,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadSections = useCallback(async () => {
    if (!schoolId) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await sectionsAPI.listSchoolSections(schoolId);
      dispatch({ type: 'SET_SECTIONS', payload: data ?? [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [schoolId]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const handleUpdateName = useCallback((value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'newSectionName', value });
  }, []);

  const handleUpdateGrade = useCallback((value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'newSectionGrade', value });
  }, []);

  const handleCreateSection = async () => {
    if (!state.newSectionName.trim()) return;
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const data = await sectionsAPI.createSchoolSection({
        schoolId,
        name: state.newSectionName,
        grade: state.newSectionGrade,
      });
      dispatch({ type: 'ADD_SECTION', payload: data });
      hapticSuccess();
    } catch (err) {
      console.error('Failed to create section:', err);
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  return (
    <ScrollView className="flex-1 bg-phase-canvas" showsVerticalScrollIndicator={false}>
      <VStack className="gap-8 p-5">
        <Pressable
          onPress={() => {
            hapticLight();
            onBack();
          }}
          className="active:scale-95 transition-all"
          accessibilityLabel="Go back"
          accessibilityHint="Navigates back to the main principal dashboard"
        >
          <HStack className="items-center gap-2 bg-phase-surface self-start px-5 py-2.5 rounded-2xl border border-phase-border shadow-sm">
            <Icon as={ArrowLeft} size="sm" className="text-phaseText-primary" />
            <Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-wider">
              Dashboard
            </Text>
          </HStack>
        </Pressable>

        <VStack className="gap-1.5">
          <Heading className="text-3xl font-black text-phaseText-primary tracking-tighter">
            System Hierarchy
          </Heading>
          <Text className="text-[14px] font-bold text-phaseText-muted uppercase tracking-widest">
            Governance structure & class taxonomy
          </Text>
        </VStack>

        <Box
          className={`bg-phase-surface p-6 rounded-3xl border border-phase-border gap-5 shadow-sm ${isPastView ? 'opacity-60' : ''}`}
        >
          <Heading className="text-[11px] font-black uppercase tracking-[0.2em] text-phaseText-muted">
            Initialize New Tier
          </Heading>

          <HStack className="gap-3 flex-wrap">
            <FormControl className="flex-1 min-w-[140px]">
              <Input className="h-14 rounded-2xl bg-phase-canvas border-phase-border shadow-inner">
                <InputField
                  value={state.newSectionGrade}
                  onChangeText={handleUpdateGrade}
                  readOnly={isPastView}
                  placeholder="Grade (e.g. 8)"
                  placeholderTextColor="rgba(0,0,0,0.2)"
                  className="font-bold text-phaseText-primary"
                  accessibilityLabel="Grade Level"
                  accessibilityHint="Enter the numeric grade level for the new section"
                />
              </Input>
            </FormControl>

            <FormControl className="flex-1 min-w-[140px]">
              <Input className="h-14 rounded-2xl bg-phase-canvas border-phase-border shadow-inner">
                <InputField
                  value={state.newSectionName}
                  onChangeText={handleUpdateName}
                  readOnly={isPastView}
                  placeholder="Section (e.g. 8A)"
                  placeholderTextColor="rgba(0,0,0,0.2)"
                  className="font-bold text-phaseText-primary"
                  accessibilityLabel="Section Name"
                  accessibilityHint="Enter the unique identifier for the new section"
                />
              </Input>
            </FormControl>

            <Button
              onPress={handleCreateSection}
              isDisabled={!state.newSectionName.trim() || state.saving || isPastView}
              className="bg-phase-interactive rounded-2xl h-14 shadow-sm active:scale-95 px-6"
              accessibilityLabel="Add New Tier"
              accessibilityHint="Initializes a new governance tier with the specified grade and name"
            >
              {state.saving ? (
                <ButtonText className="font-black">...</ButtonText>
              ) : (
                <>
                  <ButtonIcon as={Plus} className="text-white" />
                  <ButtonText className="font-black uppercase tracking-widest text-white ml-2">
                    Add
                  </ButtonText>
                </>
              )}
            </Button>
          </HStack>
        </Box>

        {state.loading ? (
          <VStack className="gap-4">
            <SkeletonCard height={90} className="rounded-3xl" />
            <SkeletonCard height={90} className="rounded-3xl" />
            <SkeletonCard height={90} className="rounded-3xl" />
          </VStack>
        ) : state.sections.length === 0 ? (
          <Box className="p-12 items-center justify-center bg-phase-canvas rounded-3xl border border-dashed border-phase-border">
            <Text className="text-phaseText-muted italic font-black text-sm uppercase tracking-widest">
              No active modules found
            </Text>
          </Box>
        ) : (
          <HStack className="flex-wrap gap-4">
            {state.sections.map((s) => (
              <Box
                key={s.id}
                className="bg-phase-surface p-6 rounded-3xl border border-phase-border border-l-[6px] border-l-phase-interactive min-w-[160px] flex-1 shadow-sm active:scale-98 transition-all"
              >
                <VStack className="gap-1.5">
                  <Text className="font-black text-xl text-phaseText-primary tracking-tight">
                    {s.name}
                  </Text>
                  {s.grade && (
                    <HStack className="items-center gap-2">
                      <Icon as={Castle} size="xs" className="text-phase-interactive" />
                      <Text className="text-[12px] text-phaseText-muted font-bold uppercase tracking-widest">
                        Grade {s.grade}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            ))}
          </HStack>
        )}
      </VStack>
    </ScrollView>
  );
};

export type { HierarchyDashboardProps };
