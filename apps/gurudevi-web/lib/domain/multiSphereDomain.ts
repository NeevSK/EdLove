'use client';

import { getSandboxSamples } from '@repo/core/logic/modes/sandboxDataset';
import { storage } from '@repo/core/lib/storage.adapter';
import { useCallback, useEffect, useState } from 'react';
import { erpAdapter } from './adapters/erp/erp.adapter';

export interface CoCurricularActivity {
  id: string;
  name: string;
  category: 'society' | 'sport' | 'house';
  role: string;
  membershipCount: number;
  nextEvent: {
    title: string;
    scheduledAt: string;
    venue: string;
  };
  badgeColor: string;
}

export interface OperationalDuty {
  id: string;
  period: number;
  timeSlot: string;
  type: 'relief_cover' | 'nutrition_inspection' | 'gate_duty' | 'assembly';
  title: string;
  coveringFor?: string;
  venue: string;
  status: 'pending' | 'in_progress' | 'completed';
  urgency: 'high' | 'normal' | 'calm';
}

export interface SanctuarySeed {
  id: string;
  title: string;
  type: 'draft_note' | 'reflection' | 'syllabus_seed';
  summary: string;
  updatedAt: string;
  wordCount: number;
}

const COCURRICULAR_CACHE_KEY = 'gurudevi:domain:cocurricular:activities';
const DUTIES_CACHE_KEY = 'gurudevi:domain:campusops:duties';
const SEEDS_CACHE_KEY = 'gurudevi:domain:sanctuary:seeds';

export const multiSphereDomainService = {
  async getCoCurricularActivities(): Promise<readonly CoCurricularActivity[]> {
    try {
      const cached = storage.getString(COCURRICULAR_CACHE_KEY);
      if (cached) return JSON.parse(cached) as CoCurricularActivity[];
    } catch {
      // Storage read fallback
    }

    const items = [...getSandboxSamples<CoCurricularActivity[]>('cocurricular', 'getActivities', [], [])];

    // Cross-link institutional ERP sports/societies events to avoid isolated islands
    try {
      const events = await erpAdapter.getInstitutionalEvents('school-ananda-colombo');
      const sportsEvt = events.find((e: { category: string; title: string }) => e.category === 'sports');
      if (sportsEvt && !items.some((a) => a.id === 'cocurr-interhouse-athletics')) {
        items.push({
          id: 'cocurr-interhouse-athletics',
          name: sportsEvt.title,
          category: 'sport',
          role: 'Teacher-in-Charge (Track & Field Events)',
          membershipCount: 120,
          nextEvent: {
            title: 'Athletic Meet Rehearsals & Marshalling',
            scheduledAt: '2026-11-04 14:30',
            venue: 'Main College Oval Ground',
          },
          badgeColor: '#10b981',
        });
      }
    } catch {
      // ERP cross-link fallback
    }

    try {
      storage.set(COCURRICULAR_CACHE_KEY, JSON.stringify(items));
    } catch {
      // Storage write fallback
    }
    return items;
  },

  async getDailyDuties(): Promise<readonly OperationalDuty[]> {
    try {
      const cached = storage.getString(DUTIES_CACHE_KEY);
      if (cached) return JSON.parse(cached) as OperationalDuty[];
    } catch {
      // Storage read fallback
    }

    const duties = [...getSandboxSamples<OperationalDuty[]>('campusOps', 'getDailyDuties', [], [])];

    // Cross-link institutional ERP nutrition / daily events to avoid isolated islands
    try {
      const events = await erpAdapter.getInstitutionalEvents('school-ananda-colombo');
      const nutritionEvt = events.find((e: { category: string; title: string }) => e.category === 'nutrition');
      if (nutritionEvt && !duties.some((d) => d.id === 'duty-nutrition-audit')) {
        duties.push({
          id: 'duty-nutrition-audit',
          period: 5,
          timeSlot: '11:10 - 11:50',
          type: 'nutrition_inspection',
          title: nutritionEvt.title,
          venue: 'Primary Canteen & Serving Bays',
          status: 'pending',
          urgency: 'high',
        });
      }
    } catch {
      // ERP cross-link fallback
    }

    try {
      storage.set(DUTIES_CACHE_KEY, JSON.stringify(duties));
    } catch {
      // Storage write fallback
    }
    return duties;
  },

  async getSanctuarySeeds(): Promise<readonly SanctuarySeed[]> {
    try {
      const cached = storage.getString(SEEDS_CACHE_KEY);
      if (cached) return JSON.parse(cached) as SanctuarySeed[];
    } catch {
      // Storage read fallback
    }

    const seeds = getSandboxSamples<SanctuarySeed[]>('sanctuary', 'getDraftSeeds', [], []);
    try {
      storage.set(SEEDS_CACHE_KEY, JSON.stringify(seeds));
    } catch {
      // Storage write fallback
    }
    return seeds;
  },

  async updateDutyStatus(
    dutyId: string,
    status: 'pending' | 'in_progress' | 'completed',
  ): Promise<readonly OperationalDuty[]> {
    const current = await this.getDailyDuties();
    const updated = current.map((d) => (d.id === dutyId ? { ...d, status } : d));
    try {
      storage.set(DUTIES_CACHE_KEY, JSON.stringify(updated));
    } catch {
      // Storage write fallback
    }
    return updated;
  },
};

export function useMultiSphereDomain() {
  const [activities, setActivities] = useState<readonly CoCurricularActivity[]>([]);
  const [duties, setDuties] = useState<readonly OperationalDuty[]>([]);
  const [seeds, setSeeds] = useState<readonly SanctuarySeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAll() {
      setIsLoading(true);
      try {
        const [acts, dts, sds] = await Promise.all([
          multiSphereDomainService.getCoCurricularActivities(),
          multiSphereDomainService.getDailyDuties(),
          multiSphereDomainService.getSanctuarySeeds(),
        ]);
        if (active) {
          setActivities(acts);
          setDuties(dts);
          setSeeds(sds);
        }
      } catch {
        // Fallbacks handled in service
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadAll();
    return () => {
      active = false;
    };
  }, []);

  const setDutyStatus = useCallback(
    async (dutyId: string, status: 'pending' | 'in_progress' | 'completed') => {
      const updated = await multiSphereDomainService.updateDutyStatus(dutyId, status);
      setDuties(updated);
    },
    [],
  );

  return {
    activities,
    duties,
    seeds,
    isLoading,
    setDutyStatus,
  };
}

