import { schoolAPI } from '@repo/core/api';
import { handleAPIError, useMutationQueue, usePermissions } from '@repo/core/logic';
import type { School, SchoolStats } from '@repo/core/types';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

type SchoolState = {
  school: School | null;
  stats: SchoolStats | null;
  loading: boolean;
};

type SchoolAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { school: School | null; stats: SchoolStats | null } }
  | { type: 'UPDATE_SCHOOL'; payload: Partial<School> }
  | { type: 'FETCH_FAILURE' };

function schoolReducer(state: SchoolState, action: SchoolAction): SchoolState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, ...action.payload, loading: false };
    case 'UPDATE_SCHOOL':
      return { ...state, school: state.school ? { ...state.school, ...action.payload } : null };
    case 'FETCH_FAILURE':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function useSchoolProfile(schoolId: string) {
  const [state, dispatch] = useReducer(schoolReducer, {
    school: null,
    stats: null,
    loading: true,
  });

  const { school, stats, loading } = state;
  const { can } = usePermissions();

  // ✅ 2026 Sovereign Pattern: Ability-based gate (Union of Identity)
  // This allows editing if the user has the power at THIS school, regardless of active focus.
  const isEditable = useMemo(
    () => can('manage', 'School'),
    [can, schoolId],
  );
  const addToQueue = useMutationQueue((state) => state.addToQueue);

  const fetchSchool = useCallback(async () => {
    if (!schoolId) return;
    dispatch({ type: 'FETCH_START' });
    try {
      const [schoolData, statsData] = await Promise.all([
        schoolAPI.getSchool(schoolId),
        schoolAPI.getSchoolStats(schoolId),
      ]);
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { school: schoolData, stats: statsData },
      });
    } catch (error) {
      handleAPIError(error);
      dispatch({ type: 'FETCH_FAILURE' });
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSchool().catch(handleAPIError);
  }, [fetchSchool]);

  const refresh = useCallback(() => {
    return fetchSchool();
  }, [fetchSchool]);

  const updateField = async (field: keyof School, value: School[keyof School]) => {
    if (!isEditable || !school) return { success: false };

    // Optimistic update
    dispatch({ type: 'UPDATE_SCHOOL', payload: { [field]: value } });

    addToQueue({
      type: 'UPDATE',
      scope: 'school',
      name: 'updateSchoolField',
      variables: { id: school.id, [field]: value },
    });

    try {
      await schoolAPI.update(school.id, { [field]: value });
      return { success: true };
    } catch {
      console.log('= Sync pending for school:', field);
      return { success: true, pending: true };
    }
  };

  return {
    school,
    stats,
    loading,
    refresh,
    updateField,
    isEditable,
  };
}
