import { api } from '@repo/core/api/client';
import type { SchoolGrade, Section } from '@repo/core/types';

import { ArrowLeft, GraduationCap, Plus, School as SchoolIcon } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
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
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useCallback, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

interface HierarchyBuilderProps {
  schoolId: string;
  onBack: () => void;
}

type State = {
  sections: Section[];
  gradesBySection: { [sectionId: string]: SchoolGrade[] };
  isLoading: boolean;
  showAddSection: boolean;
  showAddGrade: boolean;
  selectedSectionId: string | null;
  newSectionName: string;
  newGradeNumber: string;
  error: string | null;
};

type Action =
  | {
      type: 'SET_HIERARCHY';
      sections: Section[];
      gradesMap: { [id: string]: SchoolGrade[] };
    }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_ADD_SECTION'; payload: boolean }
  | { type: 'TOGGLE_ADD_GRADE'; payload: boolean; sectionId?: string }
  | { type: 'UPDATE_SECTION_NAME'; payload: string }
  | { type: 'UPDATE_GRADE_NUMBER'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_SECTION_FORM' }
  | { type: 'RESET_GRADE_FORM' };

const initialState: State = {
  sections: [],
  gradesBySection: {},
  isLoading: true,
  showAddSection: false,
  showAddGrade: false,
  selectedSectionId: null,
  newSectionName: '',
  newGradeNumber: '',
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_HIERARCHY':
      return {
        ...state,
        sections: action.sections,
        gradesBySection: action.gradesMap,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_ADD_SECTION':
      return {
        ...state,
        showAddSection: action.payload,
        error: action.payload ? state.error : null,
      };
    case 'TOGGLE_ADD_GRADE':
      return {
        ...state,
        showAddGrade: action.payload,
        selectedSectionId: action.sectionId ?? (action.payload ? state.selectedSectionId : null),
        error: action.payload ? state.error : null,
      };
    case 'UPDATE_SECTION_NAME':
      return { ...state, newSectionName: action.payload };
    case 'UPDATE_GRADE_NUMBER':
      return { ...state, newGradeNumber: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_SECTION_FORM':
      return { ...state, newSectionName: '', showAddSection: false };
    case 'RESET_GRADE_FORM':
      return {
        ...state,
        newGradeNumber: '',
        showAddGrade: false,
        selectedSectionId: null,
      };
    default:
      return state;
  }
}

export default function HierarchyBuilder({ schoolId, onBack }: HierarchyBuilderProps) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadHierarchy = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const sectionsData = await api.school.getSections(schoolId);
      const gradesMap: { [sectionId: string]: SchoolGrade[] } = {};
      for (const section of sectionsData) {
        const grades = await api.school.getGrades(section.id);
        gradesMap[section.id] = grades;
      }
      dispatch({ type: 'SET_HIERARCHY', sections: sectionsData, gradesMap });
    } catch (err: any) {
      console.error('Failed to load hierarchy:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || t('errors.fetchFailed'),
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [schoolId, t]);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  const handleOpenAddSection = useCallback(() => {
    hapticLight();
    dispatch({ type: 'TOGGLE_ADD_SECTION', payload: true });
  }, []);

  const handleCloseAddSection = useCallback(() => {
    dispatch({ type: 'RESET_SECTION_FORM' });
  }, []);

  const handleOpenAddGrade = useCallback((sectionId: string) => {
    hapticLight();
    dispatch({ type: 'TOGGLE_ADD_GRADE', payload: true, sectionId });
  }, []);

  const handleCloseAddGrade = useCallback(() => {
    dispatch({ type: 'RESET_GRADE_FORM' });
  }, []);

  const handleAddSection = async () => {
    if (!state.newSectionName.trim()) {
      dispatch({
        type: 'SET_ERROR',
        payload: t('principal.hierarchy.errorEmptyName') || 'Section name cannot be empty',
      });
      return;
    }

    try {
      hapticLight();
      await api.school.createSection(schoolId, state.newSectionName);
      dispatch({ type: 'RESET_SECTION_FORM' });
      await loadHierarchy();
    } catch (err: any) {
      console.error('Failed to create section:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || t('errors.somethingWentWrong'),
      });
    }
  };

  const handleAddGrade = async () => {
    if (!state.selectedSectionId) return;

    const gradeNum = parseInt(state.newGradeNumber, 10);
    if (Number.isNaN(gradeNum) || gradeNum < 1 || gradeNum > 13) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          t('principal.hierarchy.errorGradeLimit') || 'Grade number must be between 1 and 13',
      });
      return;
    }

    try {
      hapticLight();
      await api.school.createGrade(state.selectedSectionId, gradeNum);
      dispatch({ type: 'RESET_GRADE_FORM' });
      await loadHierarchy();
    } catch (err: any) {
      console.error('Failed to create grade:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || t('errors.somethingWentWrong'),
      });
    }
  };

  const handleUpdateSectionName = useCallback((payload: string) => {
    dispatch({ type: 'UPDATE_SECTION_NAME', payload });
  }, []);

  const handleUpdateGradeNumber = useCallback((payload: string) => {
    dispatch({ type: 'UPDATE_GRADE_NUMBER', payload });
  }, []);

  return (
    <Box className="flex-1 bg-phase-canvas">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack className="gap-8">
          {/* Header */}
          <VStack className="gap-4">
            <Pressable onPress={onBack}>
              <HStack className="items-center gap-2 bg-phase-surface self-start px-4 py-2 rounded-full border border-phase-border active:scale-95 transition-all">
                <Icon as={ArrowLeft} size="xs" className="text-phaseText-primary" />
                <Text className="text-[12px] font-black text-phaseText-primary uppercase tracking-widest">
                  Back
                </Text>
              </HStack>
            </Pressable>
            <VStack className="gap-1">
              <Heading className="text-[32px] font-black text-phaseText-primary tracking-tight">
                {t('principal.hierarchy.title') || 'Institution Hierarchy'}
              </Heading>
              <Text className="text-[13px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                Governance Structure
              </Text>
            </VStack>
          </VStack>

          <Button
            className="rounded-[20px] h-16 shadow-md w-full bg-phase-interactive"
            onPress={handleOpenAddSection}
          >
            <ButtonIcon as={Plus} className="mr-2 text-white" />
            <ButtonText className="text-white font-black uppercase text-[13px] tracking-widest">
              {t('principal.hierarchy.addSection') || 'Initialize Section'}
            </ButtonText>
          </Button>

          {/* Loading State */}
          {state.isLoading && (
            <Box className="p-20 items-center">
              <Spinner className="text-phase-interactive" />
            </Box>
          )}

          {/* Error State */}
          {state.error && (
            <Box className="p-5 bg-phase-danger/5 border border-phase-danger/20 rounded-[24px]">
              <Text className="text-phase-danger font-black text-[13px] tracking-tight">
                {state.error}
              </Text>
            </Box>
          )}

          {/* Hierarchy Tree */}
          {!state.isLoading &&
            state.sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                grades={state.gradesBySection[section.id] || []}
                onAddGrade={handleOpenAddGrade}
                t={t}
              />
            ))}

          {/* Empty State */}
          {!state.isLoading && state.sections.length === 0 && (
            <Box className="p-20 items-center bg-phase-surface rounded-[40px] border border-dashed border-phase-border">
              <Box className="w-16 h-16 bg-phase-canvas rounded-full items-center justify-center mb-6">
                <Icon as={SchoolIcon} size="md" className="text-phaseText-muted/20" />
              </Box>
              <Text className="text-phaseText-muted font-black text-center text-[15px] opacity-60">
                {t('principal.hierarchy.noSections') ||
                  'Institutional structure unset.\nStart by adding a section.'}
              </Text>
            </Box>
          )}
        </VStack>
      </ScrollView>

      {/* Add Section Modal */}
      <Modal isOpen={state.showAddSection} onClose={handleCloseAddSection}>
        <ModalBackdrop />
        <ModalContent className="bg-phase-surface rounded-[40px] p-2 border border-phase-border shadow-2xl">
          <ModalHeader className="p-8">
            <VStack className="gap-1">
              <Heading className="text-[20px] font-black text-phaseText-primary uppercase tracking-wider">
                {t('principal.hierarchy.addSectionTitle') || 'Create Section'}
              </Heading>
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                Core Institution Unit
              </Text>
            </VStack>
          </ModalHeader>
          <ModalBody className="px-8 pb-8">
            <VStack className="gap-5">
              <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[2px]">
                {t('principal.hierarchy.sectionNameLabel') || 'Section Name'}
              </Text>
              <Input className="h-16 bg-phase-canvas border-phase-border rounded-[20px] px-3">
                <InputField
                  placeholder={
                    t('principal.hierarchy.sectionNamePlaceholder') || 'e.g., Primary Wing'
                  }
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  value={state.newSectionName}
                  onChangeText={handleUpdateSectionName}
                  className="text-phaseText-primary font-black text-[15px]"
                />
              </Input>
            </VStack>
          </ModalBody>
          <ModalFooter className="p-8 pt-0">
            <HStack className="gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-[16px] h-14 border-phase-border bg-phase-canvas"
                onPress={handleCloseAddSection}
              >
                <ButtonText className="text-phaseText-primary font-black uppercase text-[11px] tracking-widest">
                  {t('common.cancel')}
                </ButtonText>
              </Button>
              <Button
                className="flex-1 rounded-[16px] h-14 shadow-md bg-phase-interactive border-none"
                onPress={handleAddSection}
              >
                <ButtonText className="text-white font-black uppercase text-[11px] tracking-widest">
                  {t('common.add') || 'Initialize'}
                </ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Grade Modal */}
      <Modal isOpen={state.showAddGrade} onClose={handleCloseAddGrade}>
        <ModalBackdrop />
        <ModalContent className="bg-phase-surface rounded-[40px] p-2 border border-phase-border shadow-2xl">
          <ModalHeader className="p-8">
            <VStack className="gap-1">
              <Heading className="text-[20px] font-black text-phaseText-primary uppercase tracking-wider">
                {t('principal.hierarchy.addGradeTitle') || 'Identify Grade'}
              </Heading>
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                Level Integration
              </Text>
            </VStack>
          </ModalHeader>
          <ModalBody className="px-8 pb-8">
            <VStack className="gap-5">
              <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[2px]">
                {t('principal.hierarchy.gradeNumberLabel') || 'Grade Level (1-13)'}
              </Text>
              <Input className="h-16 bg-phase-canvas border-phase-border rounded-[20px] px-3">
                <InputField
                  placeholder={t('principal.hierarchy.gradeNumberPlaceholder') || 'e.g., 5'}
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  value={state.newGradeNumber}
                  onChangeText={handleUpdateGradeNumber}
                  keyboardType="numeric"
                  className="text-phaseText-primary font-black text-[15px]"
                />
              </Input>
            </VStack>
          </ModalBody>
          <ModalFooter className="p-8 pt-0">
            <HStack className="gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-[16px] h-14 border-phase-border bg-phase-canvas"
                onPress={handleCloseAddGrade}
              >
                <ButtonText className="text-phaseText-primary font-black uppercase text-[11px] tracking-widest">
                  {t('common.cancel')}
                </ButtonText>
              </Button>
              <Button
                className="flex-1 rounded-[16px] h-14 shadow-md bg-phase-interactive border-none"
                onPress={handleAddGrade}
              >
                <ButtonText className="text-white font-black uppercase text-[11px] tracking-widest">
                  {t('common.add') || 'Commit'}
                </ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function SectionCard({
  section,
  grades,
  onAddGrade,
  t,
}: {
  section: Section;
  grades: SchoolGrade[];
  onAddGrade: (id: string) => void;
  t: any;
}) {
  const handleAddGrade = useCallback(() => onAddGrade(section.id), [onAddGrade, section.id]);

  return (
    <Box
      key={section.id}
      className="p-6 bg-phase-surface rounded-[32px] border border-phase-border shadow-sm border-l-8 border-l-phase-interactive"
    >
      <HStack className="justify-between items-center mb-6">
        <HStack className="gap-3 items-center">
          <Box className="p-2 bg-phase-interactive/10 rounded-xl">
            <Icon as={SchoolIcon} size="sm" className="text-phase-interactive" />
          </Box>
          <Text className="text-[18px] font-black text-phaseText-primary tracking-tight">
            {section.name}
          </Text>
        </HStack>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-10 px-6 border-phase-interactive/30"
          onPress={handleAddGrade}
        >
          <ButtonText className="text-phase-interactive text-[11px] font-black uppercase tracking-widest">
            + Grade
          </ButtonText>
        </Button>
      </HStack>

      <VStack className="gap-3 pl-2">
        {grades.length ? (
          grades.map((grade) => (
            <HStack
              key={grade.id}
              className="gap-4 p-4 bg-phase-canvas rounded-[18px] items-center border border-phase-border/50"
            >
              <Icon as={GraduationCap} size="xs" className="text-phaseText-muted/30" />
              <Text className="text-[14px] font-black text-phaseText-secondary tracking-tight">
                {t('principal.hierarchy.grade') || 'Grade'} {grade.number}
              </Text>
            </HStack>
          ))
        ) : (
          <Box className="py-4 px-4 border border-dashed border-phase-border rounded-[18px]">
            <Text className="text-[12px] font-bold text-phaseText-muted italic opacity-60">
              {t('principal.hierarchy.noGrades') || 'No grades defined in this section.'}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
