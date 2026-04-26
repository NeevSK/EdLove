/**
 * OCRStudentImport — OCR-powered bulk student creation
 *
 * Renders OCRScanner → student review table → confirm → bulk create.
 * Used in AddStudentModal's "Scan Register" tab.
 *
 * Supports all OCR providers (mlkit default, cloud Pro-gated).
 * Uncertain items (low OCR confidence) are highlighted amber for teacher review.
 */

import { studentsAPI } from '@repo/core';
import type { ScannedStudent } from '@repo/scanner-kit';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  SanctuaryToast,
  ScrollView,
  Text,
  useToast,
  VStack,
} from '@repo/ui';
import { Camera, Check, Info, RotateCcw, X } from 'lucide-react-native';
import React, { useState } from 'react';
import OCRScanner from './OCRScanner';

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
  const { showToast } = useToast();
  const [phase, setPhase] = useState<Phase>('scan');
  const [students, setStudents] = useState<ReviewStudent[]>([]);

  // ── Scanner callback ──────────────────────────────────────────────────

  const handleScanned = (scanned: ScannedStudent[]) => {
    const review: ReviewStudent[] = scanned.map((s) => ({
      ...s,
      selected: true,
      uncertain: (s as any).uncertain ?? false,
    }));
    setStudents(review);
    setPhase('review');
  };

  // ── Toggle individual student selection ───────────────────────────────

  const toggleStudent = (index: number) => {
    setStudents((prev) => prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s)));
  };

  // ── Bulk create ───────────────────────────────────────────────────────

  const handleConfirm = async () => {
    const selected = students.filter((s) => s.selected);
    if (selected.length === 0) {
      showToast({
        message: 'Select at least one student to import',
        type: 'info',
      });
      return;
    }

    setPhase('importing');
    try {
      await Promise.all(
        selected.map((s) =>
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
      showToast({
        message: 'Failed to import students. Please try again.',
        type: 'error',
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
          primary: '#0F0F0F', // ink replacement
          secondary: '#0F0F0F',
          border: '#E2E2E2',
          text: '#FFFFFF',
          textSecondary: '#A3A3A3',
          tertiary: '#0F0F0F',
          accent: '#E7C67F', // templeGold replacement
          success: '#4ADE80', // sageGreen approx
        }}
      />
    );
  }

  if (phase === 'importing') {
    return (
      <VStack className="flex-1 items-center justify-center gap-6 bg-phase-world">
        <Icon as={Camera} size="xl" className="text-templeGold opacity-50" />
        <Text className="text-phaseText-secondary text-center font-black">
          Importing students...
        </Text>
      </VStack>
    );
  }

  // Phase: review
  const selectedCount = students.filter((s) => s.selected).length;

  return (
    <VStack className="flex-1 gap-4 bg-phase-world">
      <HStack className="justify-between items-center">
        <Heading className="text-phaseText-primary text-xl font-black">Review Students</Heading>
        <Pressable
          onPress={() => setPhase('scan')}
          className="flex-row items-center gap-1 bg-templeGold/10 px-3 py-1.5 rounded-full"
        >
          <Icon as={RotateCcw} size="xs" className="text-templeGold" />
          <Text className="text-templeGold text-xs font-black uppercase">Rescan</Text>
        </Pressable>
      </HStack>

      <HStack className="items-center gap-2 bg-phase-canvas/50 p-3 rounded-2xl border border-phase-canvas">
        <Icon as={Info} size="xs" className="text-phaseText-secondary" />
        <Text className="text-phaseText-secondary text-[10px] font-bold flex-1">
          Tap a student to toggle selection. Amber items have low OCR confidence.
        </Text>
      </HStack>

      <VStack className="flex-1">
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          {students.map((student, index) => (
            <Pressable key={index} onPress={() => toggleStudent(index)}>
              <Box
                className={`p-4 rounded-generous border bg-phase-surface shadow-sm ${!student.selected ? 'opacity-50 grayscale' : ''} ${student.selected ? (student.uncertain ? 'border-l-4 border-l-amberGlow' : 'border-l-4 border-l-sageGreen') : 'border-phase-canvas'}`}
              >
                <HStack className="justify-between items-center">
                  <VStack className="gap-1 flex-1">
                    <Text className="text-phaseText-primary font-black text-lg">
                      {student.name}
                    </Text>
                    <Text className="text-phaseText-secondary text-sm font-medium">
                      Index: {student.index_number}
                    </Text>
                    {student.uncertain && student.selected && (
                      <HStack className="items-center gap-1 mt-1">
                        <Icon as={Info} size="xs" className="text-amberGlow" />
                        <Text className="text-amberGlow text-xs font-black">
                          Low confidence — verify
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                  <Box
                    className={`w-8 h-8 rounded-full items-center justify-center ${student.selected ? (student.uncertain ? 'bg-amberGlow' : 'bg-sageGreen') : 'bg-phase-canvas'}`}
                  >
                    <Icon
                      as={student.selected ? (student.uncertain ? Info : Check) : X}
                      size="xs"
                      className="text-white"
                    />
                  </Box>
                </HStack>
              </Box>
            </Pressable>
          ))}
        </ScrollView>
      </VStack>

      <HStack className="gap-4 pt-2">
        <Pressable
          onPress={onCancel}
          className="flex-1 h-16 rounded-full border border-phase-canvas items-center justify-center bg-phase-surface"
        >
          <Text className="text-phaseText-primary font-black">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          disabled={selectedCount === 0}
          className={`flex-[2] h-16 rounded-full items-center justify-center shadow-lg ${selectedCount > 0 ? 'bg-templeGold shadow-templeGold/20 active:opacity-90' : 'bg-phase-canvas opacity-50'}`}
        >
          <Text className="text-black font-black uppercase tracking-wider">
            Import {selectedCount} Member{selectedCount !== 1 ? 's' : ''}
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
}
