import { create } from 'zustand';

export type TemporalPhase = 'past' | 'present' | 'future';
export type TemporalScale = 'day' | 'week' | 'month' | 'year' | 'custom';
export type TemporalViewMode = 'spotlight' | 'timeline';
export type TemporalCapability =
  | 'snapshot'
  | 'event_stream'
  | 'business_fact'
  | 'effective_dated'
  | 'audit_history';

export interface TemporalState {
  viewDate: string;
  intensity: number;
  phase: TemporalPhase;
  viewScale: TemporalScale;
  isOffline: boolean;
  viewMode: TemporalViewMode;
  timelineFocus: string;
  isPastView: boolean;
  setViewDate: (date: string) => void;
  setIntensity: (value: number) => void;
  resetToToday: () => void;
  setScale: (scale: TemporalScale) => void;
  setOffline: (offline: boolean) => void;
  setViewMode: (mode: TemporalViewMode) => void;
  setTimelineFocus: (focus: string) => void;
  isPast: () => boolean;
}

const getTodayString = (): string => {
  const date = new Date().toISOString().split('T')[0];
  return date || '';
};

export const useTemporalStore = create<TemporalState>((set, get) => ({
  viewDate: getTodayString(),
  intensity: 1,
  phase: 'present',
  viewScale: 'day',
  isOffline: false,
  viewMode: 'spotlight',
  timelineFocus: 'all',
  isPastView: false,
  setViewDate: (date) => {
    const today = getTodayString();
    let phase: TemporalPhase = 'present';

    if (date < today) {
      phase = 'past';
    } else if (date > today) {
      phase = 'future';
    }

    set({
      viewDate: date,
      phase,
      isPastView: phase === 'past',
      intensity: 0.8,
    });

    setTimeout(() => get().setIntensity(1), 300);
  },
  setIntensity: (value) => set({ intensity: Math.max(0, Math.min(1, value)) }),
  resetToToday: () =>
    set({
      viewDate: getTodayString(),
      phase: 'present',
      intensity: 1,
      viewScale: 'day',
      isPastView: false,
    }),
  setScale: (scale) => set({ viewScale: scale }),
  setOffline: (offline) => set({ isOffline: offline }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setTimelineFocus: (focus) => set({ timelineFocus: focus }),
  isPast: () => get().phase === 'past',
}));
