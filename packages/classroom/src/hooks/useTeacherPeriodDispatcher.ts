import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchTimetablePeriods } from '@repo/self/api/selfFeatureRepository';
import {
  type ActivePeriodSlot,
  type PeriodDispatchResult,
  type PeriodDispatchStatus,
  type PeriodSlotInput,
  type UpcomingPeriodSlot,
  resolveActivePeriod,
} from '../logic/periodDispatcher/resolveActivePeriod';

export interface UseTeacherPeriodDispatcherOptions {
  /** Optional override for day of week (0 = Sunday, 1 = Monday ... 6 = Saturday). Defaults to today. */
  dayOfWeek?: number;
  /** Custom periods if already fetched by parent view */
  customPeriods?: PeriodSlotInput[];
  /** Poll interval in milliseconds to recalculate remaining minutes (default: 30000ms / 30s) */
  pollIntervalMs?: number;
}

export function useTeacherPeriodDispatcher(options: UseTeacherPeriodDispatcherOptions = {}) {
  const { pollIntervalMs = 30000 } = options;

  const todayDayOfWeek = useMemo(() => {
    return options.dayOfWeek ?? new Date().getDay();
  }, [options.dayOfWeek]);

  const [rawPeriods, setRawPeriods] = useState<PeriodSlotInput[]>(options.customPeriods || []);
  const [isLoading, setIsLoading] = useState(!options.customPeriods);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const loadSchedule = useCallback(async () => {
    if (options.customPeriods) {
      setRawPeriods(options.customPeriods);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTimetablePeriods(todayDayOfWeek);
      if (data) {
        const mapped: PeriodSlotInput[] = data.map((p) => {
          const className = p.class_name || 'Standard Class';
          const subject = p.subject || p.activity || 'General Session';
          return {
            periodNumber: p.period_number,
            startTime: p.start_time,
            endTime: p.end_time,
            subject,
            className,
            classroomId: p.class_name
              ? `class-${p.class_name.toLowerCase().replace(/\s+/g, '-')}`
              : undefined,
            roomVenue: p.type === 'relief' ? 'Relief Venue' : 'Standard Room',
            type: p.type || 'subject',
          };
        });
        setRawPeriods(mapped);
      }
    } catch (err) {
      console.error('Failed to load active timetable schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  }, [options.customPeriods, todayDayOfWeek]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  // Tick timer to keep remaining minutes accurate in real time
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, pollIntervalMs);
    return () => clearInterval(timer);
  }, [pollIntervalMs]);

  const dispatchResult: PeriodDispatchResult = useMemo(() => {
    return resolveActivePeriod(rawPeriods, now);
  }, [rawPeriods, now]);

  return {
    ...dispatchResult,
    isLoading,
    error,
    refresh: loadSchedule,
  };
}

export type {
  ActivePeriodSlot,
  PeriodDispatchResult,
  PeriodDispatchStatus,
  PeriodSlotInput,
  UpcomingPeriodSlot,
};
