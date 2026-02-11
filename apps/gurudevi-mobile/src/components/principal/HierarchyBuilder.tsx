/**
 * HIERARCHY BUILDER COMPONENT
 * 
 * Tree view for building school hierarchy:
 * School → Section (Primary/Secondary) → Grade (1-13)
 * 
 * Features:
 * - Add Section button
 * - Add Grade button (for each section)
 * - Tree visualization
 * 
 * Mission 04: Principal's Office
 */

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
} from '@/ui';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Section, Grade } from '../../lib/api/school';
import Theme from '../../constants/Theme';

interface HierarchyBuilderProps {
    schoolId: string;
    onBack: () => void;
}

export default function HierarchyBuilder({ schoolId, onBack }: HierarchyBuilderProps) {
    const { t } = useTranslation();
    const [sections, setSections] = useState<Section[]>([]);
    const [gradesBySection, setGradesBySection] = useState<{ [sectionId: string]: Grade[] }>({});
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

            // Load grades for each section
            const gradesMap: { [sectionId: string]: Grade[] } = {};
            for (const section of sectionsData) {
                const grades = await api.school.getGrades(section.id);
                gradesMap[section.id] = grades;
            }
            setGradesBySection(gradesMap);
        } catch (err: any) {
            console.error('Failed to load hierarchy:', err);
            setError(err.message || 'Failed to load hierarchy');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionName.trim()) {
            setError('Section name cannot be empty');
            return;
        }

        try {
            await api.school.createSection(schoolId, newSectionName);
            setNewSectionName('');
            setShowAddSection(false);
            await loadHierarchy();
        } catch (err: any) {
            console.error('Failed to create section:', err);
            setError(err.message || 'Failed to create section');
        }
    };

    const handleAddGrade = async () => {
        if (!selectedSectionId) return;

        const gradeNum = parseInt(newGradeNumber, 10);
        if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 13) {
            setError('Grade number must be between 1 and 13');
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
            setError(err.message || 'Failed to create grade');
        }
    };

    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.voidIndigo,
            }}
        >
            <ScrollView>
                <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                    {/* Header */}
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Heading size="2xl" color={Theme.colors.sanctuarySaffron}>
                            {t('principal.hierarchy.title') || 'School Hierarchy'}
                        </Heading>

                        <Button
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: Theme.colors.pearlGray,
                            }}
                            onPress={onBack}
                        >
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {t('common.back') || 'Back'}
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Add Section Button */}
                    <Button
                        sx={{
                            backgroundColor: Theme.colors.sanctuarySaffron,
                        }}
                        onPress={() => setShowAddSection(true)}
                    >
                        <ButtonText color={Theme.colors.sacredWhite}>
                            {t('principal.hierarchy.addSection') || '+ Add Section'}
                        </ButtonText>
                    </Button>

                    {/* Loading State */}
                    {isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Spinner color={Theme.colors.sanctuarySaffron} />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.emberRed,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <Text color={Theme.colors.sacredWhite}>{error}</Text>
                        </Box>
                    )}

                    {/* Hierarchy Tree */}
                    {!isLoading && sections.map((section) => (
                        <Box
                            key={section.id}
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 4,
                                borderLeftColor: Theme.colors.sanctuarySaffron,
                            }}
                        >
                            {/* Section Header */}
                            <HStack
                                sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: Theme.spacing.md,
                                }}
                            >
                                <Text
                                    size="lg"
                                    color={Theme.colors.sacredWhite}
                                    sx={{ fontWeight: '700' }}
                                >
                                    📚 {section.name}
                                </Text>

                                <Button
                                    variant="link"
                                    size="sm"
                                    onPress={() => {
                                        setSelectedSectionId(section.id);
                                        setShowAddGrade(true);
                                    }}
                                >
                                    <ButtonText color={Theme.colors.sanctuarySaffron}>
                                        {t('principal.hierarchy.addGrade') || '+ Add Grade'}
                                    </ButtonText>
                                </Button>
                            </HStack>

                            {/* Grades List */}
                            <VStack space="sm" sx={{ paddingLeft: Theme.spacing.lg }}>
                                {gradesBySection[section.id]?.length > 0 ? (
                                    gradesBySection[section.id].map((grade) => (
                                        <HStack
                                            key={grade.id}
                                            space="sm"
                                            sx={{
                                                padding: Theme.spacing.sm,
                                                backgroundColor: Theme.colors.midnightBlue,
                                                borderRadius: Theme.corners.tight,
                                            }}
                                        >
                                            <Text color={Theme.colors.pearlGray}>└─</Text>
                                            <Text color={Theme.colors.sacredWhite}>
                                                {t('principal.hierarchy.grade') || 'Grade'} {grade.number}
                                            </Text>
                                        </HStack>
                                    ))
                                ) : (
                                    <Text color={Theme.colors.mistGray} size="sm">
                                        {t('principal.hierarchy.noGrades') || 'No grades added yet'}
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    ))}

                    {/* Empty State */}
                    {!isLoading && sections.length === 0 && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                size="lg"
                                color={Theme.colors.pearlGray}
                                textAlign="center"
                            >
                                {t('principal.hierarchy.noSections') ||
                                    'No sections yet. Add your first section to get started!'}
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
                <ModalContent
                    sx={{
                        backgroundColor: Theme.colors.deepIndigo,
                    }}
                >
                    <ModalHeader>
                        <Heading size="lg" color={Theme.colors.sanctuarySaffron}>
                            {t('principal.hierarchy.addSectionTitle') || 'Add New Section'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            <Text color={Theme.colors.pearlGray}>
                                {t('principal.hierarchy.sectionNameLabel') ||
                                    'Enter section name (e.g., Primary, Secondary)'}
                            </Text>
                            <Input
                                sx={{
                                    backgroundColor: Theme.colors.voidIndigo,
                                }}
                            >
                                <InputField
                                    placeholder="Section name"
                                    value={newSectionName}
                                    onChangeText={setNewSectionName}
                                    sx={{
                                        color: Theme.colors.sacredWhite,
                                    }}
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack space="md" sx={{ width: '100%' }}>
                            <Button
                                variant="outline"
                                sx={{ flex: 1, borderColor: Theme.colors.mistGray }}
                                onPress={() => {
                                    setShowAddSection(false);
                                    setNewSectionName('');
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('common.cancel') || 'Cancel'}
                                </ButtonText>
                            </Button>
                            <Button
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                                onPress={handleAddSection}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('common.add') || 'Add'}
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
                <ModalContent
                    sx={{
                        backgroundColor: Theme.colors.deepIndigo,
                    }}
                >
                    <ModalHeader>
                        <Heading size="lg" color={Theme.colors.sanctuarySaffron}>
                            {t('principal.hierarchy.addGradeTitle') || 'Add New Grade'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            <Text color={Theme.colors.pearlGray}>
                                {t('principal.hierarchy.gradeNumberLabel') ||
                                    'Enter grade number (1-13)'}
                            </Text>
                            <Input
                                sx={{
                                    backgroundColor: Theme.colors.voidIndigo,
                                }}
                            >
                                <InputField
                                    placeholder="1-13"
                                    value={newGradeNumber}
                                    onChangeText={setNewGradeNumber}
                                    keyboardType="numeric"
                                    sx={{
                                        color: Theme.colors.sacredWhite,
                                    }}
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack space="md" sx={{ width: '100%' }}>
                            <Button
                                variant="outline"
                                sx={{ flex: 1, borderColor: Theme.colors.mistGray }}
                                onPress={() => {
                                    setShowAddGrade(false);
                                    setNewGradeNumber('');
                                    setSelectedSectionId(null);
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('common.cancel') || 'Cancel'}
                                </ButtonText>
                            </Button>
                            <Button
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                                onPress={handleAddGrade}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('common.add') || 'Add'}
                                </ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
