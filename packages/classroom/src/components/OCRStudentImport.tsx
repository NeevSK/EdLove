/**
 * OCRStudentImport — OCR-powered bulk student creation
 *
 * Renders OCRScanner → student review table → confirm → bulk create.
 * Used in AddStudentModal's "Scan Register" tab.
 *
 * Supports all OCR providers (mlkit default, cloud Pro-gated).
 * Uncertain items (low OCR confidence) are highlighted amber for teacher review.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
    useToast,
    Box,
    ScrollView,
    Text,
    theme,
    VStack,
    HStack,
    Heading,
    SanctuaryToast,
    Icon,
} from '@repo/ui';
import { Camera, ChevronRight, Check, X, Info, RotateCcw } from 'lucide-react-native';
import OCRScanner from './OCRScanner';
import type { ScannedStudent } from '@repo/scanner-kit';
import { studentsAPI } from '@repo/core';

interface OCRStudentImportProps {
    classroomId: string;
    onImported: (count: number) => void;
    onCancel: () => void;
}

type Phase = 'scan' | 'review' | 'importing';

interface ReviewStudent extends ScannedStudent {
    /** Selected for import (defaults to true, teacher can deselect) */
    selected: boolean;
    /** Low OCR confidence flag passed through from ParsedStudent */
    uncertain?: boolean;
}

export default function OCRStudentImport({
    classroomId,
    onImported,
    onCancel,
}: OCRStudentImportProps) {
    const toast = useToast();
    const [phase, setPhase] = useState<Phase>('scan');
    const [students, setStudents] = useState<ReviewStudent[]>([]);

    // ── Scanner callback ──────────────────────────────────────────────────

    const handleScanned = (scanned: ScannedStudent[]) => {
        const review: ReviewStudent[] = scanned.map(s => ({
            ...s,
            selected: true,
            uncertain: (s as any).uncertain ?? false,
        }));
        setStudents(review);
        setPhase('review');
    };

    // ── Toggle individual student selection ───────────────────────────────

    const toggleStudent = (index: number) => {
        setStudents(prev =>
            prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s)),
        );
    };

    // ── Bulk create ───────────────────────────────────────────────────────

    const handleConfirm = async () => {
        const selected = students.filter(s => s.selected);
        if (selected.length === 0) {
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <SanctuaryToast
                        message="Select at least one student to import"
                        type="info"
                        visible
                        onHide={() => toast.close(id)}
                    />
                ),
            });
            return;
        }

        setPhase('importing');
        try {
            await Promise.all(
                selected.map(s =>
                    studentsAPI.create({
                        full_name: s.name,
                        roll_number: s.index_number,
                        notes: s.notes,
                        class_id: classroomId,
                    } as any),
                ),
            );
            onImported(selected.length);
        } catch (err) {
            console.error('OCRStudentImport: bulk create failed', err);
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <SanctuaryToast
                        message="Failed to import students. Please try again."
                        type="error"
                        visible
                        onHide={() => toast.close(id)}
                    />
                ),
            });
            setPhase('review');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    if (phase === 'scan') {
        return (
            <OCRScanner
                onStudentsScanned={handleScanned}
                onCancel={onCancel}
                colors={{
                    primary: theme.colors.ink,
                    secondary: theme.colors.ink,
                    border: theme.colors.sanctuary-border,
                    text: theme.colors.sacredWhite,
                    textSecondary: theme.colors.starlightGray,
                    tertiary: theme.colors.ink,
                    accent: theme.colors.sanctuarySaffron,
                    success: theme.colors.sageGreen,
                }}
            />
        );
    }

    if (phase === 'importing') {
        return (
            <VStack className="flex-1 items-center justify-center gap-6 bg-sanctuary-surface">
                <Icon as={Camera} size="xl" className="text-sanctuarySaffron opacity-50" />
                <Text className="text-sanctuary-text-secondary text-center font-medium">
                    Importing students...
                </Text>
            </VStack>
        );
    }

    // Phase: review
    const selectedCount = students.filter(s => s.selected).length;

    return (
        <VStack className="flex-1 gap-4 bg-sanctuary-surface">
            <HStack className="justify-between items-center">
                <Heading className="text-sanctuary-text text-xl">
                    Review Students
                </Heading>
                <TouchableOpacity 
                    onPress={() => setPhase('scan')}
                    className="flex-row items-center gap-1 bg-sanctuarySaffron/10 px-3 py-1.5 rounded-full"
                >
                    <Icon as={RotateCcw} size="xs" className="text-sanctuarySaffron" />
                    <Text className="text-sanctuarySaffron text-xs font-bold">Rescan</Text>
                </TouchableOpacity>
            </HStack>

            <HStack className="items-center gap-2 bg-sanctuary-border/5 p-3 rounded-2xl border border-sanctuary-border/10">
                <Icon as={Info} size="xs" className="text-sanctuary-text-tertiary" />
                <Text className="text-sanctuary-text-secondary text-xs flex-1">
                    Tap a student to toggle selection. Amber items have low OCR confidence.
                </Text>
            </HStack>

            <VStack className="flex-1">
                <ScrollView contentContainerStyle={{ gap: 12 }}>
                {students.map((student, index) => (
                    <TouchableOpacity key={index} onPress={() => toggleStudent(index)} activeOpacity={0.7}>
                        <Box
                            className={`p-4 rounded-[24px] border bg-sanctuary-surface-secondary shadow-sm ${!student.selected ? 'opacity-50 grayscale' : ''}`}
                            style={{
                                borderLeftWidth: 6,
                                borderColor: student.selected
                                    ? student.uncertain
                                        ? '#f59e0b'
                                        : theme.colors.sageGreen
                                    : theme.colors.sanctuary-border,
                                borderLeftColor: student.selected
                                    ? student.uncertain
                                        ? '#f59e0b'
                                        : theme.colors.sageGreen
                                    : theme.colors.sanctuary-border,
                            }}
                        >
                            <HStack className="justify-between items-center">
                                <VStack className="gap-1 flex-1">
                                    <Text className="text-sanctuary-text font-bold text-lg">
                                        {student.name}
                                    </Text>
                                    <Text className="text-sanctuary-text-secondary text-sm">
                                        Index: {student.index_number}
                                    </Text>
                                    {student.uncertain && student.selected && (
                                        <HStack className="items-center gap-1 mt-1">
                                            <Icon as={Info} size="xs" className="text-amber-500" />
                                            <Text className="text-amber-500 text-xs font-medium">
                                                Low confidence — verify
                                            </Text>
                                        </HStack>
                                    )}
                                </VStack>
                                <Box className={`w-8 h-8 rounded-full items-center justify-center ${student.selected ? (student.uncertain ? 'bg-amber-500' : 'bg-green-500') : 'bg-sanctuary-border/20'}`}>
                                    <Icon 
                                        as={student.selected ? (student.uncertain ? Info : Check) : X} 
                                        size="xs" 
                                        className="text-white" 
                                    />
                                </Box>
                            </HStack>
                        </Box>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </VStack>

            <HStack className="gap-4 pt-2">
                <TouchableOpacity
                    onPress={onCancel}
                    className="flex-1 h-14 rounded-[24px] border border-sanctuary-border items-center justify-center bg-sanctuary-surface-secondary active:bg-sanctuary-border/10"
                >
                    <Text className="text-sanctuary-text font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={selectedCount === 0}
                    className={`flex-[2] h-14 rounded-[24px] items-center justify-center shadow-lg ${selectedCount > 0 ? 'bg-sanctuarySaffron shadow-sanctuarySaffron/20 active:opacity-90' : 'bg-sanctuary-border opacity-50'}`}
                >
                    <Text className="text-sanctuary-ink font-bold">
                        Import {selectedCount} Student{selectedCount !== 1 ? 's' : ''}
                    </Text>
                </TouchableOpacity>
            </HStack>
        </VStack>
    );
}
