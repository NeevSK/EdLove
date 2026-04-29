import type { School, SchoolStats } from '@repo/core';
import { handleAPIError, usePermissions } from '@repo/core';
import { schoolAPI } from '@repo/core/api';
import { useMutationQueue } from '@repo/core/logic';

import { useCallback, useEffect, useState } from 'react';

export function useSchoolProfile(schoolId: string) {
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { context } = usePermissions();
  const { roles, schoolId: userSchoolId } = context;
  const authority = roles[0];

  // Editable only if current user is principal of THIS school
  const isPrincipal =
    (authority === 'principal' || authority === 'developer') && userSchoolId === schoolId;
  const addToQueue = useMutationQueue((state) => state.addToQueue);

  const fetchSchool = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const [schoolData, statsData] = await Promise.all([
        schoolAPI.getSchool(schoolId),
        schoolAPI.getSchoolStats(schoolId),
      ]);
      setSchool(schoolData);
      setStats(statsData);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSchool();
  }, [fetchSchool]);

  const refresh = useCallback(() => {
    return fetchSchool();
  }, [fetchSchool]);

  const updateField = async (field: keyof School, value: any) => {
    if (!isPrincipal || !school) return { success: false };

    // Optimistic update
    setSchool((prev) => (prev ? { ...prev, [field]: value } : null));

    addToQueue({
      type: 'UPDATE',
      scope: 'school',
      name: 'updateSchoolField',
      variables: { id: school.id, [field]: value },
    });

    try {
      await schoolAPI.update(school.id, { [field]: value });
      return { success: true };
    } catch (_error) {
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
    isEditable: isPrincipal,
  };
}
