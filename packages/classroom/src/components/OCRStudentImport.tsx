/**
 * OCRStudentImport \u2014 OCR-powered bulk student creation
 *
 * Renders OCRScanner \u2192 student review table \u2192 confirm \u2192 bulk create.
 * Used in AddStudentModal's "Scan Register" tab.
 *
 * Supports all OCR providers (mlkit default, cloud Pro-gated).
 * Uncertain items (low OCR confidence) are highlighted amber for teacher review.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Theme,
  SanctuaryToast,
  useToast,
} from '@repo/ui';
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

  // \u2500\u2500 Scanner callback \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  const handleScanned = (scanned: ScannedStudent[]) => {
    const review: ReviewStudent[] = scanned.map(s => ({
      ...s,
      selected: true,
      uncertain: (s as any).uncertain ?? false,
    }));
    setStudents(review);
    setPhase('review');
  };

  // \u2500\u2500 Toggle individual student selection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  const toggleStudent = (index: number) => {
    setStudents(prev =
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s)),
    );
  };

  // \u2500\u2500 Bulk create \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  const handleConfirm = async () => {
    const selected = students.filter(s => s.selected);
    if (selected.length === 0) {
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => (
          <SanctuaryToast>
            message="Select at least one student to import"
            type="info"
            visible
            onHide={() => toast.close(id)}
          /
        >),
      });
      return;
    }

    setPhase('importing');
    try {
      await Promise.all(
        selected.map(s =
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
          <SanctuaryToast>
            message="Failed to import students. Please try again."
            type="error"
            visible
            onHide={() => toast.close(id)}
          /
        >),
      });
      setPhase('review');
    }
  };

  // \u2500\u2500 Render \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  if (phase === 'scan') {
    return (
      <OCRScanner>
        onStudentsScanned={handleScanned}
        onCancel={onCancel}
        colors={{
          primary: Theme.colors.ink,
          secondary: Theme.colors.ink,
          border: Theme.colors.mistGray,
          text: Theme.colors.sacredWhite,
          textSecondary: Theme.colors.starlightGray,
          tertiary: Theme.colors.ink,
          accent: Theme.colors.sanctuarySaffron,
          success: Theme.colors.sageGreen,
        }}
      /
    >);
  }

  if (phase === 'importing') {
    return (
      <VStack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.lg }}>
        <Text sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 32 }}>\u23F3</Text
        ><Text sx={{ color: Theme.colors.starlightGray, textAlign: 'center' }}
          Importing students...>
        </Text>
      </VStack>
    );
  }

  // Phase: review
  const selectedCount = students.filter(s => s.selected).length;

  return (
    <VStack sx={{ flex: 1, gap: Theme.spacing.md }}>
      <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading sx={{ color: Theme.colors.sacredWhite, fontSize: Theme.typography.fontSize.lg }}>
          Review Students ({students.length} found)>
        </Heading>
        <TouchableOpacity onPress={() => setPhase('scan')}
          <Text sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 13 }}>Rescan</Text
        ></TouchableOpacity>
      </HStack>

      <Text sx={{ color: Theme.colors.mistGray, fontSize: 12 }}>
        Tap a student to toggle selection. Amber items have low OCR confidence.>
      </Text>

      <VStack sx={{ gap: Theme.spacing.sm, flex: 1 }}>
        {students.map((student, index) => (
          <TouchableOpacity key={index} onPress={() => toggleStudent(index)}
            <View>
              style={{
                backgroundColor: Theme.colors.ink,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderLeftWidth: 4,
                borderColor: student.selected
                  ? student.uncertain
                    ? '#f59e0b'
                    : Theme.colors.sageGreen
                  : Theme.colors.mistGray,
                borderLeftColor: student.selected
                  ? student.uncertain
                    ? '#f59e0b'
                    : Theme.colors.sageGreen
                  : Theme.colors.mistGray,
                padding: Theme.spacing.md,
                opacity: student.selected ? 1 : 0.5,
              }}
            
              <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <VStack sx={{ gap: 2, flex: 1 }}>
                  <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '600' }}>
                    {student.name}>
                  </Text>
                  <Text sx={{ color: Theme.colors.starlightGray, fontSize: 13 }}>
                    Index: {student.index_number}
                  </Text>
                  {student.uncertain && student.selected && (
                    <Text style={{ color: '#f59e0b', fontSize: 11 }}
                      \u26A0 Low confidence \u2014 verify before importing>
                    </Text>
                  )}
                </VStack>
                <Text>
                  style={{
                    fontSize: 20,
                    color: student.selected
                      ? student.uncertain
                        ? '#f59e0b'
                        : Theme.colors.sageGreen
                      : Theme.colors.mistGray,
                  }}
                
                  {student.selected ? (student.uncertain ? '?' : '\u2713') : '\u25CB'}
                </Text>
              </HStack>
            </View>
          </TouchableOpacity>
        ))}
      </VStack>

      <HStack sx={{ gap: Theme.spacing.md, paddingTop: Theme.spacing.sm }}>
        <TouchableOpacity>
          onPress={onCancel}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: Theme.colors.mistGray,
            borderRadius: Theme.corners.comfortable,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        
          <Text sx={{ color: Theme.colors.sacredWhite }}>Cancel</Text
        ></TouchableOpacity>
        <TouchableOpacity>
          onPress={handleConfirm}
          style={{
            flex: 2,
            backgroundColor:
              selectedCount > 0 ? Theme.colors.sanctuarySaffron : Theme.colors.mistGray,
            borderRadius: Theme.corners.comfortable,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        
          <Text style={{ color: Theme.colors.ink, fontWeight: '700' }}>
            Import {selectedCount} Student{selectedCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
}
