'use client';

import { storage } from '@repo/core/lib/storage';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useOfflineStatus } from '@repo/core/offline/resilience';
import { useCallback, useEffect, useState } from 'react';

export interface AssignmentQuest {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submittedCount: number;
  totalStudents: number;
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  rollNo: string;
  assignmentTitle: string;
  assignmentId: string;
  submittedAt: string;
  status: 'pending_review' | 'graded' | 'resubmit';
  grade?: string;
  feedback?: string;
  fileName?: string;
  fileSize?: string;
}

const DEFAULT_ASSIGNMENTS: AssignmentQuest[] = [
  {
    id: 'asg-1',
    title: 'Wetland Ecology & Botanical Field Study',
    subject: 'Environmental Science',
    dueDate: '2026-10-18',
    submittedCount: 28,
    totalStudents: 35,
  },
  {
    id: 'asg-2',
    title: 'Thermodynamics Problem Set 4',
    subject: 'Physics',
    dueDate: '2026-10-22',
    submittedCount: 19,
    totalStudents: 35,
  },
  {
    id: 'asg-3',
    title: 'Classical Sinhala Verse Translation (Book 2)',
    subject: 'Sinhala Literature',
    dueDate: '2026-10-25',
    submittedCount: 31,
    totalStudents: 35,
  },
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    studentName: 'Amara Perera',
    rollNo: 'STD-1014',
    assignmentTitle: 'Wetland Ecology & Botanical Field Study',
    assignmentId: 'asg-1',
    submittedAt: 'Today, 10:45 AM',
    status: 'pending_review',
    fileName: 'Amara_Wetlands_Report.pdf',
    fileSize: '4.2 MB',
  },
  {
    id: 'sub-2',
    studentName: 'Kavi Fernando',
    rollNo: 'STD-1019',
    assignmentTitle: 'Wetland Ecology & Botanical Field Study',
    assignmentId: 'asg-1',
    submittedAt: 'Yesterday, 04:12 PM',
    status: 'graded',
    grade: 'A',
    feedback: 'Excellent taxonomy analysis and high-quality specimens photographic plate.',
    fileName: 'Kavi_Field_Study_Final.pdf',
    fileSize: '6.8 MB',
  },
  {
    id: 'sub-3',
    studentName: 'Mihiri Silva',
    rollNo: 'STD-1022',
    assignmentTitle: 'Thermodynamics Problem Set 4',
    assignmentId: 'asg-2',
    submittedAt: 'Oct 07, 08:30 PM',
    status: 'pending_review',
    fileName: 'Mihiri_Thermo_Problems.pdf',
    fileSize: '1.9 MB',
  },
];

function getStorageKey(classroomId: string): string {
  return `classroom:submissions:${classroomId}`;
}

export function loadDurableSubmissions(classroomId: string): StudentSubmission[] {
  const key = getStorageKey(classroomId);
  const raw = storage.getString(key);
  if (!raw) {
    storage.set(key, JSON.stringify(INITIAL_SUBMISSIONS));
    return INITIAL_SUBMISSIONS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback if corrupted
  }
  return INITIAL_SUBMISSIONS;
}

export function saveDurableSubmissions(classroomId: string, records: StudentSubmission[]): void {
  storage.set(getStorageKey(classroomId), JSON.stringify(records));
}

/**
 * useAcademicSubmissions
 *
 * Headless domain hook for assignment quests and student submissions with
 * offline durability, local file draft state, and background queueing.
 */
export function useAcademicSubmissions(classroomId = 'class-10a') {
  const { isOffline, isOnline } = useOfflineStatus();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() =>
    loadDurableSubmissions(classroomId),
  );
  const [assignments] = useState<AssignmentQuest[]>(DEFAULT_ASSIGNMENTS);
  const pendingCount = useMutationQueue(
    (s) => s.queue.filter((item) => item.scope === 'classroom').length,
  );

  useEffect(() => {
    setSubmissions(loadDurableSubmissions(classroomId));
  }, [classroomId]);

  const submitAssignment = useCallback(
    async (
      assignmentId: string,
      studentName: string,
      fileName: string,
      fileSize: string,
    ): Promise<StudentSubmission> => {
      const targetAsg = assignments.find((a) => a.id === assignmentId) ?? assignments[0];
      const nowIso = new Date().toISOString();
      const newSubmission: StudentSubmission = {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentName,
        rollNo: 'STD-YOU',
        assignmentTitle: targetAsg?.title ?? 'Classroom Assignment',
        assignmentId,
        submittedAt: 'Just now',
        status: 'pending_review',
        fileName,
        fileSize,
      };

      const current = loadDurableSubmissions(classroomId);
      const updatedList = [newSubmission, ...current];

      // 1. Persist locally to storage
      saveDurableSubmissions(classroomId, updatedList);
      setSubmissions(updatedList);

      // 2. Register with Hexagonal Domain Service (@repo/core educational contract)
      try {
        const { academicHexagonalService } = await import(
          '../domain/adapters/academic/academicHexagonalService'
        );
        await academicHexagonalService.submitAssignment({
          assignmentId,
          studentId: 'student-current-user',
          studentName,
          content: `Attached file: ${fileName}`,
        });
      } catch {
        // Safe fallback in isolated environments
      }

      // 3. Queue mutation
      await useMutationQueue.getState().addToQueue({
        name: 'submitAssignment',
        scope: 'classroom',
        variables: {
          classroomId,
          assignmentId,
          studentName,
          fileName,
          fileSize,
          submittedAt: nowIso,
        },
        type: 'CUSTOM',
      });

      return newSubmission;
    },
    [assignments, classroomId],
  );

  const gradeSubmission = useCallback(
    async (submissionId: string, grade: string, feedback: string) => {
      const current = loadDurableSubmissions(classroomId);
      const updatedList = current.map((s) =>
        s.id === submissionId ? { ...s, status: 'graded' as const, grade, feedback } : s,
      );

      saveDurableSubmissions(classroomId, updatedList);
      setSubmissions(updatedList);

      // Register with Hexagonal Domain Service (@repo/core grading contract)
      try {
        const { academicHexagonalService } = await import(
          '../domain/adapters/academic/academicHexagonalService'
        );
        await academicHexagonalService.gradeSubmission({
          submissionId,
          studentId: 'student-target',
          classroomId,
          marks: grade === 'A' ? 90 : grade === 'B' ? 80 : 70,
          letterGrade: grade,
          feedback,
        });
      } catch {
        // Safe fallback in isolated environments
      }

      await useMutationQueue.getState().addToQueue({
        name: 'gradeSubmission',
        scope: 'classroom',
        variables: {
          submissionId,
          grade,
          feedback,
          gradedAt: new Date().toISOString(),
        },
        type: 'CUSTOM',
      });
    },
    [classroomId],
  );

  return {
    assignments,
    submissions,
    submitAssignment,
    gradeSubmission,
    isOffline,
    isOnline,
    pendingCount,
  };
}
