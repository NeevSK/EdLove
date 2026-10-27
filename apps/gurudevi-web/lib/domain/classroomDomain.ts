'use client';

import { storage } from '@repo/core/lib/storage';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { useCallback, useEffect, useState } from 'react';

export interface ClassroomDetailStudent {
  id: string;
  name: string;
  rollNumber: number;
  attendanceRate: number;
}

export interface ClassroomDetailLesson {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  summary: string;
}

export interface ClassroomDetailAssignment {
  id: string;
  title: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
  status: 'active' | 'grading' | 'closed';
}

export interface ClassroomDetailObservation {
  id: string;
  studentName: string;
  date: string;
  type: 'positive' | 'concern' | 'neutral';
  note: string;
}

export interface ClassroomDetailSnapshot {
  classroomId: string;
  classroomName: string;
  subject: string;
  students: readonly ClassroomDetailStudent[];
  lessons: readonly ClassroomDetailLesson[];
  assignments: readonly ClassroomDetailAssignment[];
  observations: readonly ClassroomDetailObservation[];
}

const CLASSROOM_CACHE_PREFIX = 'gurudevi:domain:classroom:detail:';

export const classroomDetailService = {
  async getClassroomDetail(classroomId: string): Promise<ClassroomDetailSnapshot> {
    const cacheKey = `${CLASSROOM_CACHE_PREFIX}${classroomId}`;
    try {
      const cached = storage.getString(cacheKey);
      if (cached) return JSON.parse(cached) as ClassroomDetailSnapshot;
    } catch {
      // Storage read fallback
    }

    const snapshot: ClassroomDetailSnapshot = {
      classroomId,
      classroomName: 'Grade 10A Science & Ecology',
      subject: 'Biological & Environmental Sciences',
      students: getSandboxSamples<ClassroomDetailStudent[]>('classroomDetail', 'getStudents', [], []),
      lessons: getSandboxSamples<ClassroomDetailLesson[]>('classroomDetail', 'getLessons', [], []),
      assignments: getSandboxSamples<ClassroomDetailAssignment[]>('classroomDetail', 'getAssignments', [], []),
      observations: getSandboxSamples<ClassroomDetailObservation[]>('classroomDetail', 'getObservations', [], []),
    };

    try {
      storage.set(cacheKey, JSON.stringify(snapshot));
    } catch {
      // Storage write fallback
    }

    return snapshot;
  },

  async addObservation(
    classroomId: string,
    observation: Omit<ClassroomDetailObservation, 'id' | 'date'>,
  ): Promise<ClassroomDetailObservation> {
    const current = await this.getClassroomDetail(classroomId);
    const newEntry: ClassroomDetailObservation = {
      ...observation,
      id: `obs-${Date.now()}`,
      date: new Date().toISOString().split('T')[0] ?? 'Today',
    };

    const updated: ClassroomDetailSnapshot = {
      ...current,
      observations: [newEntry, ...current.observations],
    };

    try {
      storage.set(`${CLASSROOM_CACHE_PREFIX}${classroomId}`, JSON.stringify(updated));
    } catch {
      // Storage write fallback
    }

    return newEntry;
  },
};

export function useClassroomDomain(classroomId: string = 'default-classroom') {
  const [snapshot, setSnapshot] = useState<ClassroomDetailSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await classroomDetailService.getClassroomDetail(classroomId);
        if (active) setSnapshot(data);
      } catch {
        // Fallback handled by service
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [classroomId]);

  const addObservation = useCallback(
    async (obs: Omit<ClassroomDetailObservation, 'id' | 'date'>) => {
      const created = await classroomDetailService.addObservation(classroomId, obs);
      setSnapshot((prev) =>
        prev
          ? {
              ...prev,
              observations: [created, ...prev.observations],
            }
          : prev,
      );
      return created;
    },
    [classroomId],
  );

  return {
    snapshot,
    isLoading,
    classroomName: snapshot?.classroomName ?? 'Classroom',
    subject: snapshot?.subject ?? '',
    students: snapshot?.students ?? [],
    lessons: snapshot?.lessons ?? [],
    assignments: snapshot?.assignments ?? [],
    observations: snapshot?.observations ?? [],
    addObservation,
  };
}
