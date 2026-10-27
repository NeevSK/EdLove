'use client';

import { storage } from '@repo/core/lib/storage';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { useEffect, useState } from 'react';

export interface GuardianChild {
  id: string;
  name: string;
  grade: string;
  attendanceRate: number;
  homeroomTeacher: string;
  avatarInitials: string;
}

export interface GuardianAttendanceEvent {
  id: string;
  date: string;
  time: string;
  type: string;
  status: 'present' | 'late' | 'excused';
  session: string;
}

export interface GuardianNotice {
  id: string;
  author: string;
  role: string;
  date: string;
  title: string;
  content: string;
}

const GUARDIAN_CHILDREN_KEY = 'gurudevi:domain:guardian:children';

export const guardianService = {
  async getChildren(): Promise<readonly GuardianChild[]> {
    try {
      const cached = storage.getString(GUARDIAN_CHILDREN_KEY);
      if (cached) return JSON.parse(cached) as GuardianChild[];
    } catch {
      // Storage read fallback
    }
    const defaults = getSandboxSamples<GuardianChild[]>('guardian', 'getChildren', [], []);
    try {
      storage.set(GUARDIAN_CHILDREN_KEY, JSON.stringify(defaults));
    } catch {
      // Storage write fallback
    }
    return defaults;
  },

  async getAttendanceTimeline(childId: string): Promise<readonly GuardianAttendanceEvent[]> {
    return getSandboxSamples<GuardianAttendanceEvent[]>('guardian', 'getAttendanceTimeline', [childId], []);
  },

  async getNotices(childId?: string): Promise<readonly GuardianNotice[]> {
    return getSandboxSamples<GuardianNotice[]>('guardian', 'getNotices', [childId], []);
  },
};

export function useGuardianDomain() {
  const [children, setChildren] = useState<readonly GuardianChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('st-amara');
  const [events, setEvents] = useState<readonly GuardianAttendanceEvent[]>([]);
  const [notices, setNotices] = useState<readonly GuardianNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const loadedChildren = await guardianService.getChildren();
        const loadedEvents = await guardianService.getAttendanceTimeline(selectedChildId);
        const loadedNotices = await guardianService.getNotices(selectedChildId);

        if (!active) return;
        setChildren(loadedChildren);
        setEvents(loadedEvents);
        setNotices(loadedNotices);
        if (loadedChildren.length > 0 && !loadedChildren.some((c) => c.id === selectedChildId)) {
          setSelectedChildId(loadedChildren[0]?.id ?? 'st-amara');
        }
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
  }, [selectedChildId]);

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? children[0];

  return {
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    events,
    notices,
    isLoading,
  };
}
