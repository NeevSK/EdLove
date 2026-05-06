import { profileAPI } from '@repo/core/api';
import { handleAPIError, useTemporalStore } from '@repo/core/logic';
import { useCallback, useEffect, useReducer } from 'react';
export interface PulseMetrics {
  resonance_score: number;
  aggregated_mood: 'joy' | 'peace' | 'focus' | 'struggle' | 'unknown';
  trend: 'rising' | 'stable' | 'failing';
  participation_rate: number;
  top_subjects: string[];
  interaction_volume: number;
}
type PulseState = {
  pulse: PulseMetrics | null;
  loading: boolean;
  error: string | null;
};

type PulseAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: PulseMetrics | null }
  | { type: 'FETCH_FAILURE'; payload: string };

function pulseReducer(state: PulseState, action: PulseAction): PulseState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, pulse: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export function useSchoolPulse(schoolId?: string) {
  const [state, dispatch] = useReducer(pulseReducer, {
    pulse: null,
    loading: true,
    error: null,
  });

  const { pulse, loading, error } = state;
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);
  const fetchPulse = useCallback(
    async (
      id: string,
      signal: {
        cancelled: boolean;
      },
      temporal: {
        viewDate: string;
        viewScale: import('@repo/core/store').TemporalScale;
      },
    ) => {
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await profileAPI.getSchoolPulse(id, {
          view_date: temporal.viewDate,
          view_scale: temporal.viewScale as any,
        });
        if (signal.cancelled) return;
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        handleAPIError(error);
        if (!signal.cancelled) {
          dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to sync school pulse' });
        }
      }
    },
    [],
  );
  useEffect(() => {
    if (!schoolId) {
      dispatch({ type: 'FETCH_SUCCESS', payload: null });
      return;
    }
    const signal = { cancelled: false };
    fetchPulse(schoolId, signal, { viewDate, viewScale });
    return () => {
      signal.cancelled = true;
    };
  }, [schoolId, fetchPulse, viewDate, viewScale]);
  return {
    pulse,
    loading,
    error,
    refresh: () => {
      if (schoolId) {
        const signal = { cancelled: false };
        fetchPulse(schoolId, signal, { viewDate, viewScale }).catch(handleAPIError);
      }
    },
  };
}
