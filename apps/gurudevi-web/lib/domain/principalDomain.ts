'use client';

import { storage } from '@repo/core/lib/storage';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { useCallback, useEffect, useState } from 'react';

export interface CurriculumProgress {
  grade: string;
  subject: string;
  completionPercent: number;
  status: 'on_track' | 'lagging' | 'accelerated';
}

export interface PendingStaffLeave {
  id: string;
  staffName: string;
  role: string;
  type: string;
  duration: string;
  substitute: string;
}

const PRINCIPAL_LEAVES_KEY = 'gurudevi:domain:principal:pending_leaves';

export const principalService = {
  async getCurriculumProgress(): Promise<readonly CurriculumProgress[]> {
    return getSandboxSamples<CurriculumProgress[]>('principal', 'getCurriculumProgress', [], []);
  },

  async getPendingLeaves(): Promise<readonly PendingStaffLeave[]> {
    try {
      const cached = storage.getString(PRINCIPAL_LEAVES_KEY);
      if (cached) return JSON.parse(cached) as PendingStaffLeave[];
    } catch {
      // Storage read fallback
    }
    const defaults = getSandboxSamples<PendingStaffLeave[]>('principal', 'getPendingLeaves', [], []);
    try {
      storage.set(PRINCIPAL_LEAVES_KEY, JSON.stringify(defaults));
    } catch {
      // Storage write fallback
    }
    return defaults;
  },

  async reviewLeave(leaveId: string, decision: 'approved' | 'rejected'): Promise<void> {
    const current = await this.getPendingLeaves();
    const updated = current.filter((l) => l.id !== leaveId);
    try {
      storage.set(PRINCIPAL_LEAVES_KEY, JSON.stringify(updated));
    } catch {
      // Storage write fallback
    }
  },
};

export function usePrincipalDomain() {
  const [curriculumData, setCurriculumData] = useState<readonly CurriculumProgress[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<readonly PendingStaffLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const [progress, leaves] = await Promise.all([
          principalService.getCurriculumProgress(),
          principalService.getPendingLeaves(),
        ]);
        if (!active) return;
        setCurriculumData(progress);
        setPendingLeaves(leaves);
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
  }, []);

  const reviewLeave = useCallback(async (id: string, decision: 'approved' | 'rejected') => {
    setPendingLeaves((prev) => prev.filter((l) => l.id !== id));
    await principalService.reviewLeave(id, decision);
  }, []);

  return {
    curriculumData,
    pendingLeaves,
    isLoading,
    reviewLeave,
  };
}
