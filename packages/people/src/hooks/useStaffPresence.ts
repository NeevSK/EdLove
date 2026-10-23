import { growthSignalsAPI } from '@repo/core/api/client';
import { handleAPIError } from '@repo/core/logic';
import type { StaffAttendance, StaffLeave } from '@repo/core/types';
import { staffAPI } from '@repo/people/staff';
import { useCallback, useEffect, useId, useState } from 'react';

export function useStaffPresence(userId?: string, schoolId?: string) {
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const channelSuffix = useId();

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      // `loading` starts true and this runs once per mount, so no spinner
      // reset is needed here (a sync set in the effect cascades renders).
      const [attData, leaveData] = await Promise.all([
        staffAPI.getAttendance(userId),
        staffAPI.getLeaves(userId),
      ]);
      setAttendance(attData);
      setLeaves(leaveData);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Real-time subscription to reflect check-in/out changes immediately
  useEffect(() => {
    if (!userId) return;

    let sub: { unsubscribe: () => Promise<void> } | null = null;
    let unsubscribed = false;

    void import('@repo/core/logic/managers/misc.factory')
      .then(({ realtime }) => {
        if (unsubscribed) return;
        sub = realtime.subscribe<StaffAttendance>(
          `staff_attendance:${userId}-${channelSuffix}`,
          {
            event: '*',
            table: 'staff_attendance',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.event === 'INSERT' && payload.new) {
              setAttendance((prev) => [payload.new, ...prev]);
            } else if (payload.event === 'UPDATE' && payload.new) {
              setAttendance((prev) =>
                prev.map((a) => (a.id === payload.new.id ? payload.new : a)),
              );
            }
          },
        );
      })
      .catch(() => {});

    return () => {
      unsubscribed = true;
      if (sub) void sub.unsubscribe();
    };
  }, [userId, channelSuffix]);

  const checkIn = async (notes?: string) => {
    if (!userId || !schoolId) return { success: false };
    try {
      const result = await staffAPI.checkIn(userId, schoolId, notes);
      setAttendance((prev) => [result, ...prev]);
      // Growth signal: teacher/principal chose to be present
      growthSignalsAPI.emitSilent({
        user_id: userId,
        event_type: 'attendance_marked',
        event_metadata: {
          school_id: schoolId,
          type: 'check_in',
        },
      });
      return { success: true, data: result };
    } catch (error) {
      handleAPIError(error);
      return { success: false, error };
    }
  };

  const checkOut = async () => {
    if (!userId) return { success: false };
    try {
      const result = await staffAPI.checkOut(userId);
      setAttendance((prev) => prev.map((a) => (a.id === result.id ? result : a)));
      return { success: true, data: result };
    } catch (error) {
      handleAPIError(error);
      return { success: false, error };
    }
  };

  const requestLeave = async (
    leave: Omit<StaffLeave, 'id' | 'user_id' | 'school_id' | 'status' | 'created_at'>,
  ) => {
    if (!userId || !schoolId) return { success: false };
    try {
      const result = await staffAPI.submitLeave({
        ...leave,
        user_id: userId,
        school_id: schoolId,
      });
      setLeaves((prev) => [result, ...prev]);
      return { success: true, data: result };
    } catch (error) {
      handleAPIError(error);
      return { success: false, error };
    }
  };

  const isCheckedIn = attendance.length > 0 && attendance[0] ? !attendance[0].check_out : false;

  return {
    attendance,
    leaves,
    loading,
    isCheckedIn,
    checkIn,
    checkOut,
    requestLeave,
    refresh: fetchData,
  };
}
