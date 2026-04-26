import { api, type SchoolGrade, type Section } from '@repo/core';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Heading,
  HStack,
  hapticLight,
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
} from '@repo/ui';
import { ArrowLeft, GraduationCap, Plus, School as SchoolIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HierarchyBuilderProps {
  schoolId: string;
  onBack: () => void;
}

export default function HierarchyBuilder({ schoolId, onBack }: HierarchyBuilderProps) {
  const { t } = useTranslation();
  const [sections, setSections] = useState<Section[]>([]);
  const [gradesBySection, setGradesBySection] = useState<{ [sectionId: string]: SchoolGrade[] }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newGradeNumber, setNewGradeNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadHierarchy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sectionsData = await api.school.getSections(schoolId);
      setSections(sectionsData);

      const gradesMap: { [sectionId: string]: SchoolGrade[] } = {};
      for (const section of sectionsData) {
        const grades = await api.school.getGrades(section.id);
        gradesMap[section.id] = grades;
      }
      setGradesBySection(gradesMap);
    } catch (err: any) {
      console.error('Failed to load hierarchy:', err);
      setError(err.message || t('errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchy();
  }, [schoolId]);

  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      setError(t('principal.hierarchy.errorEmptyName') || 'Section name cannot be empty');
      return;
    }

    try {
      hapticLight();
      await api.school.createSection(schoolId, newSectionName);
      setNewSectionName('');
      setShowAddSection(false);
      await loadHierarchy();
    } catch (err: any) {
      console.error('Failed to create section:', err);
      setError(err.message || t('errors.somethingWentWrong'));
    }
  };

  const handleAddGrade = async () => {
    if (!selectedSectionId) return;

    const gradeNum = parseInt(newGradeNumber, 10);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 13) {
      setError(t('principal.hierarchy.errorGradeLimit') || 'Grade number must be between 1 and 13');
      return;
    }

    try {
      hapticLight();
      await api.school.createGrade(selectedSectionId, gradeNum);
      setNewGradeNumber('');
      setShowAddGrade(false);
      setSelectedSectionId(null);
      await loadHierarchy();
    } catch (err: any) {
      console.error('Failed to create grade:', err);
      setError(err.message || t('errors.somethingWentWrong'));
    }
  };

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
            onPress={() => {
              hapticLight();
              setShowAddSection(true);
            }}
          >
            <ButtonIcon as={Plus} className="mr-2 text-white" />
            <ButtonText className="text-white font-black uppercase text-[13px] tracking-widest">
              {t('principal.hierarchy.addSection') || 'Initialize Section'}
            </ButtonText>
          </Button>

          {/* Loading State */}
          {isLoading && (
            <Box className="p-20 items-center">
              <Spinner className="text-phase-interactive" />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Box className="p-5 bg-phase-danger/5 border border-phase-danger/20 rounded-[24px]">
              <Text className="text-phase-danger font-black text-[13px] tracking-tight">
                {error}
              </Text>
            </Box>
          )}

          {/* Hierarchy Tree */}
          {!isLoading &&
            sections.map((section) => (
              <Box
                key={section.id}
                className="p-6 bg-phase-surface rounded-[32px] border border-phase-border shadow-sm border-l-8 border-l-phase-interactive"
              >
                {/* Section Header */}
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
                    onPress={() => {
                      hapticLight();
                      setSelectedSectionId(section.id);
                      setShowAddGrade(true);
                    }}
                  >
                    <ButtonText className="text-phase-interactive text-[11px] font-black uppercase tracking-widest">
                      + Grade
                    </ButtonText>
                  </Button>
                </HStack>

                {/* Grades List */}
                <VStack className="gap-3 pl-2">
                  {gradesBySection[section.id]?.length ? (
                    gradesBySection[section.id]?.map((grade) => (
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
            ))}

          {/* Empty State */}
          {!isLoading && sections.length === 0 && (
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
      <Modal
        isOpen={showAddSection}
        onClose={() => {
          setShowAddSection(false);
          setNewSectionName('');
        }}
      >
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
                  value={newSectionName}
                  onChangeText={setNewSectionName}
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
                onPress={() => {
                  setShowAddSection(false);
                  setNewSectionName('');
                }}
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
      <Modal
        isOpen={showAddGrade}
        onClose={() => {
          setShowAddGrade(false);
          setNewGradeNumber('');
          setSelectedSectionId(null);
        }}
      >
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
                  value={newGradeNumber}
                  onChangeText={setNewGradeNumber}
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
                onPress={() => {
                  setShowAddGrade(false);
                  setNewGradeNumber('');
                  setSelectedSectionId(null);
                }}
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
