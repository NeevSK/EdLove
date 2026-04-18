import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Button,
    ButtonText,
    ScrollView,
    Input,
    InputField,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    Icon,
    Pressable
} from '@repo/ui';
import { ArrowLeft, Plus, GraduationCap, School as SchoolIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api, type Section, type SchoolGrade } from '@repo/core';

interface HierarchyBuilderProps {
    schoolId: string;
    onBack: () => void;
}

export default function HierarchyBuilder({ schoolId, onBack }: HierarchyBuilderProps) {
    const { t } = useTranslation();
    const [sections, setSections] = useState<Section[]>([]);
    const [gradesBySection, setGradesBySection] = useState<{ [sectionId: string]: SchoolGrade[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [showAddSection, setShowAddSection] = useState(false);
    const [showAddGrade, setShowAddGrade] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [newSectionName, setNewSectionName] = useState('');
    const [newGradeNumber, setNewGradeNumber] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHierarchy();
    }, [schoolId]);

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

    const handleAddSection = async () => {
        if (!newSectionName.trim()) {
            setError(t('principal.hierarchy.errorEmptyName') || 'Section name cannot be empty');
            return;
        }

        try {
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
        <Box className="flex-1 bg-silk">
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <VStack className="gap-8">
                    {/* Header */}
                    <HStack className="justify-between items-center">
                        <VStack className="gap-1 flex-1">
                            <Pressable onPress={onBack} className="mb-2">
                                <HStack className="items-center gap-2 bg-white/50 self-start px-3 py-1.5 rounded-full border border-border active:opacity-60">
                                    <Icon as={ArrowLeft} size="xs" className="text-ink" />
                                    <Text className="text-xs font-bold text-ink">Back</Text>
                                </HStack>
                            </Pressable>
                            <Heading className="text-3xl font-black text-ink">
                                {t('principal.hierarchy.title') || 'Institution Hierarchy'}
                            </Heading>
                        </VStack>
                    </HStack>

                    <Button
                        action="primary"
                        leftIcon={Plus}
                        className="rounded-[24px] h-14 shadow-sm"
                        fullWidth
                        onPress={() => setShowAddSection(true)}
                    >
                        {t('principal.hierarchy.addSection') || 'Add Section'}
                    </Button>

                    {/* Loading State */}
                    {isLoading && (
                        <Box className="p-12 items-center">
                            <Spinner color="#3b82f6" />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && (
                        <Box className="p-4 bg-red-50 border border-red-200 rounded-[20px]">
                            <Text className="text-red-600 font-bold text-sm">{error}</Text>
                        </Box>
                    )}

                    {/* Hierarchy Tree */}
                    {!isLoading && sections.map((section) => (
                        <Box
                            key={section.id}
                            className="p-5 bg-white rounded-[24px] border border-border shadow-sm border-l-4 border-l-primary"
                        >
                            {/* Section Header */}
                            <HStack className="justify-between items-center mb-4">
                                <HStack className="gap-2 items-center">
                                    <Icon as={SchoolIcon} size="sm" className="text-primary" />
                                    <Text className="text-lg font-black text-ink">{section.name}</Text>
                                </HStack>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    action="primary"
                                    className="rounded-full h-8 px-4"
                                    onPress={() => {
                                        setSelectedSectionId(section.id);
                                        setShowAddGrade(true);
                                    }}
                                >
                                    {t('principal.hierarchy.addGrade') || '+ GRADE'}
                                </Button>
                            </HStack>

                            {/* Grades List */}
                            <VStack className="gap-2 pl-4">
                                {gradesBySection[section.id]?.length ? (
                                    gradesBySection[section.id]?.map((grade) => (
                                        <HStack
                                            key={grade.id}
                                            className="gap-3 p-3 bg-silk rounded-2xl items-center"
                                        >
                                            <Icon as={GraduationCap} size="xs" className="text-ink/20" />
                                            <Text className="text-sm font-bold text-ink">
                                                {t('principal.hierarchy.grade') || 'Grade'} {grade.number}
                                            </Text>
                                        </HStack>
                                    ))
                                ) : (
                                    <Text className="text-xs font-bold text-ink/40 italic py-2">
                                        {t('principal.hierarchy.noGrades') || 'No grades defined.'}
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    ))}

                    {/* Empty State */}
                    {!isLoading && sections.length === 0 && (
                        <Box className="p-12 items-center">
                            <Icon as={SchoolIcon} size="xl" className="text-ink/10 mb-4" />
                            <Text className="text-ink/40 font-bold text-center">
                                {t('principal.hierarchy.noSections') || 'No institutional sections found. Start by adding one.'}
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
                <ModalContent className="bg-white rounded-[32px] p-2">
                    <ModalHeader className="p-6">
                        <Heading className="text-xl font-black text-ink uppercase tracking-wider">
                            {t('principal.hierarchy.addSectionTitle') || 'Create Section'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody className="px-6 pb-6">
                        <VStack className="gap-4">
                            <Text className="text-xs font-bold text-ink/40 uppercase tracking-widest">
                                {t('principal.hierarchy.sectionNameLabel') || 'Section Name'}
                            </Text>
                            <Input className="h-14 bg-silk border-border rounded-2xl px-2">
                                <InputField
                                    placeholder={t('principal.hierarchy.sectionNamePlaceholder') || "e.g., Primary Section"}
                                    value={newSectionName}
                                    onChangeText={setNewSectionName}
                                    className="text-ink font-bold"
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter className="p-6 pt-0">
                        <HStack className="gap-3 w-full">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl h-12 border-border"
                                onPress={() => {
                                    setShowAddSection(false);
                                    setNewSectionName('');
                                }}
                            >
                                <ButtonText className="text-ink font-bold">
                                    {t('common.cancel')}
                                </ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                className="flex-1 rounded-2xl h-12 shadow-sm"
                                onPress={handleAddSection}
                            >
                                {t('common.add') || 'Add'}
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
                <ModalContent className="bg-white rounded-[32px] p-2">
                    <ModalHeader className="p-6">
                        <Heading className="text-xl font-black text-ink uppercase tracking-wider">
                            {t('principal.hierarchy.addGradeTitle') || 'Initialize Grade'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody className="px-6 pb-6">
                        <VStack className="gap-4">
                            <Text className="text-xs font-bold text-ink/40 uppercase tracking-widest">
                                {t('principal.hierarchy.gradeNumberLabel') || 'Grade Level (1-13)'}
                            </Text>
                            <Input className="h-14 bg-silk border-border rounded-2xl px-2">
                                <InputField
                                    placeholder={t('principal.hierarchy.gradeNumberPlaceholder') || "e.g., 5"}
                                    value={newGradeNumber}
                                    onChangeText={setNewGradeNumber}
                                    keyboardType="numeric"
                                    className="text-ink font-bold"
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter className="p-6 pt-0">
                        <HStack className="gap-3 w-full">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl h-12 border-border"
                                onPress={() => {
                                    setShowAddGrade(false);
                                    setNewGradeNumber('');
                                    setSelectedSectionId(null);
                                }}
                            >
                                <ButtonText className="text-ink font-bold">
                                    {t('common.cancel')}
                                </ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                className="flex-1 rounded-2xl h-12 shadow-sm"
                                onPress={handleAddGrade}
                            >
                                {t('common.add') || 'Add'}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
