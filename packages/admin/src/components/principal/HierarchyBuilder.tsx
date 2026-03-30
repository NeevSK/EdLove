/**
 * HIERARCHY BUILDER COMPONENT
 *
 * Tree view for building school hierarchy:
 * School -> Section (Primary/Secondary) -> Grade (1-13)
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
    Theme,
    useThemedColors,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { type Section, type Grade } from '@repo/core';
import { structureAPI } from '../../structure';

interface HierarchyBuilderProps {
    schoolId: string;
    onBack: () => void;
}

export default function HierarchyBuilder({ schoolId, onBack }: HierarchyBuilderProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
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
            const sectionsData = await structureAPI.listSections(schoolId);
            setSections(sectionsData);

            const gradesMap: { [sectionId: string]: Grade[] } = {};
            for (const section of sectionsData) {
                const grades = await structureAPI.listGrades(section.id);
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
            await structureAPI.createSection(schoolId, newSectionName);
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
            await structureAPI.createGrade(selectedSectionId, gradeNum);
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
        <Box sx={{ flex: 1, backgroundColor: 'transparent' }}            <ScrollView                <VStack space="lg" sx={{ padding: Theme.spacing.lg }}                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}                        <Heading color={colors.action} sx={{ fontSize: 32 }}                            {t('principal.hierarchy.title')}
                        </Heading                        <Button variant="outline" size="sm" sx={{ borderColor: colors.border }} onPress={onBack}                            <ButtonText color={colors.text}>{t('common.back')}</ButtonText                        </Button                    </HStack
                    <Button sx={{ backgroundColor: colors.action }} onPress={() => setShowAddSection(true)}                        <ButtonText color={Theme.colors.sacredWhite}>{t('principal.hierarchy.addSection')}</ButtonText                    </Button
                    {isLoading && (
                        <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}                            <Spinner color={colors.action} /                        </Box                    )}

                    {error && (
                        <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.error, borderRadius: Theme.corners.comfortable }}                            <Text color={colors.text}>{error}</Text                        </Box                    )}

                    {!isLoading && sections.map((section) => (
                        <Box
                            key={section.id}
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 4,
                                borderLeftColor: colors.action,
                            }}
                                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.md }}                                <Text color={colors.text} sx={{ fontWeight: '700', fontSize: 18 }}                                    {section.name}
                                </Text                                <Button
                                    variant="link"
                                    size="sm"
                                    onPress={() => {
                                        setSelectedSectionId(section.id);
                                        setShowAddGrade(true);
                                    }}
                                                                    <ButtonText color={colors.action}>{t('principal.hierarchy.addGrade')}</ButtonText                                </Button                            </HStack
                            <VStack space="sm" sx={{ paddingLeft: Theme.spacing.lg }}                                {gradesBySection[section.id]?.length ? (
                                    gradesBySection[section.id]?.map((grade) => (
                                        <HStack
                                            key={grade.id}
                                            space="sm"
                                            sx={{
                                                padding: Theme.spacing.sm,
                                                backgroundColor: colors.tertiary,
                                                borderRadius: Theme.corners.tight,
                                            }}
                                                                                    <Text color={colors.textTertiary}>-</Text                                            <Text color={colors.text}                                                {t('principal.hierarchy.grade')} {grade.number}
                                            </Text                                        </HStack                                    ))
                                ) : (
                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}                                        {t('principal.hierarchy.noGrades')}
                                    </Text                                )}
                            </VStack                        </Box                    ))}

                    {!isLoading && sections.length === 0 && (
                        <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}                            <Text color={colors.textSecondary} textAlign="center" sx={{ fontSize: 18 }}                                {t('principal.hierarchy.noSections')}
                            </Text                        </Box                    )}
                </VStack            </ScrollView
            <Modal
                isOpen={showAddSection}
                onClose={() => {
                    setShowAddSection(false);
                    setNewSectionName('');
                }}
                            <ModalBackdrop /                <ModalContent sx={{ backgroundColor: colors.secondary }}                    <ModalHeader                        <Heading color={colors.action} sx={{ fontSize: 24 }}                            {t('principal.hierarchy.addSectionTitle')}
                        </Heading                    </ModalHeader                    <ModalBody                        <VStack sx={{ gap: Theme.spacing.md }}                            <Text color={colors.textSecondary}>{t('principal.hierarchy.sectionNameLabel')}</Text                            <Input sx={{ backgroundColor: colors.tertiary }}                                <InputField
                                    placeholder={t('principal.hierarchy.sectionNamePlaceholder')}
                                    value={newSectionName}
                                    onChangeText={setNewSectionName}
                                    sx={{ color: colors.text }}
                                /                            </Input                        </VStack                    </ModalBody                    <ModalFooter                        <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}                            <Button
                                variant="outline"
                                sx={{ flex: 1, borderColor: colors.border }}
                                onPress={() => {
                                    setShowAddSection(false);
                                    setNewSectionName('');
                                }}
                                                            <ButtonText color={colors.text}>{t('common.cancel')}</ButtonText                            </Button                            <Button sx={{ flex: 1, backgroundColor: colors.action }} onPress={handleAddSection}                                <ButtonText color={Theme.colors.sacredWhite}>{t('common.add') || 'Add'}</ButtonText                            </Button                        </HStack                    </ModalFooter                </ModalContent            </Modal
            <Modal
                isOpen={showAddGrade}
                onClose={() => {
                    setShowAddGrade(false);
                    setNewGradeNumber('');
                    setSelectedSectionId(null);
                }}
                            <ModalBackdrop /                <ModalContent sx={{ backgroundColor: colors.secondary }}                    <ModalHeader                        <Heading color={colors.action} sx={{ fontSize: 24 }}                            {t('principal.hierarchy.addGradeTitle')}
                        </Heading                    </ModalHeader                    <ModalBody                        <VStack sx={{ gap: Theme.spacing.md }}                            <Text color={colors.textSecondary}>{t('principal.hierarchy.gradeNumberLabel')}</Text                            <Input sx={{ backgroundColor: colors.tertiary }}                                <InputField
                                    placeholder={t('principal.hierarchy.gradeNumberPlaceholder')}
                                    value={newGradeNumber}
                                    onChangeText={setNewGradeNumber}
                                    keyboardType="numeric"
                                    sx={{ color: colors.text }}
                                /                            </Input                        </VStack                    </ModalBody                    <ModalFooter                        <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}                            <Button
                                variant="outline"
                                sx={{ flex: 1, borderColor: colors.border }}
                                onPress={() => {
                                    setShowAddGrade(false);
                                    setNewGradeNumber('');
                                    setSelectedSectionId(null);
                                }}
                                                            <ButtonText color={colors.text}>{t('common.cancel')}</ButtonText                            </Button                            <Button sx={{ flex: 1, backgroundColor: colors.action }} onPress={handleAddGrade}                                <ButtonText color={Theme.colors.sacredWhite}>{t('common.add') || 'Add'}</ButtonText                            </Button                        </HStack                    </ModalFooter                </ModalContent            </Modal        </Box    );
}
