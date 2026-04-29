import {
  growthSignalsAPI,
  handleAPIError,
  type StaffAttendance,
  type StaffLeave,
} from '@repo/core';
import { supabase } from '@repo/core/native';

import { useCallback, useEffect, useState } from 'react';
import { staffAPI } from '../api/staff';

export function useStaffPresence(userId?: string, schoolId?: string) {
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
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
    fetchData();
  }, [fetchData]);

  // Real-time subscription to reflect check-in/out changes immediately
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`staff_attendance:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_attendance',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAttendance((prev) => [payload.new as StaffAttendance, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAttendance((prev) =>
              prev.map((a) =>
                a.id === (payload.new as StaffAttendance).id ? (payload.new as StaffAttendance) : a,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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
