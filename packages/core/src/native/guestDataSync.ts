import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { authAPI } from '@repo/core/api/auth';
import { identityAPI } from '@repo/core/api/identity';
import { isEdloveAccountId } from '@repo/core/logic/utils/edloveUuidV8';
import { orpcClient } from '@repo/core/api/orpcClient';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { readGuestConversionRecord } from '@repo/core/native/guestConversionLedger';
import { GuestDataManager } from '@repo/core/native/guestDataManager';
import {
  defaultGuestDataTransferPolicy,
  type GuestDataTransferPolicy,
  getGuestDataTransferAvailability,
} from '@repo/core/native/guestDataTransferPolicy';
import { setGuestScope } from '@repo/core/native/guestScope';

let pendingConversionGuestUserId: string | null = null;
const PENDING_GUEST_CONVERSION_KEY = 'auth:pending-guest-conversion';
const isValidGuestId = (value: string): boolean => {
  if (value.length === 0 || value.length > 256 || value.trim() !== value) return false;
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) < 32) return false;
  }
  return true;
};

export interface SyncProgress {
  total: number;
  completed: number;
  currentStep: string;
  errors: string[];
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export { type GuestDataTransferAvailability } from '@repo/core/native/guestDataTransferPolicy';

export class GuestDataSync {
  static getTransferAvailability(policy: GuestDataTransferPolicy = defaultGuestDataTransferPolicy) {
    return getGuestDataTransferAvailability(policy);
  }

  static async rememberGuestSession(userId: string): Promise<void> {
    if (!isValidGuestId(userId)) {
      throw new Error('Cannot preserve an invalid guest identity.');
    }
    pendingConversionGuestUserId = userId;
    setGuestScope(userId);
    await SafeZustandStorage.setItem(PENDING_GUEST_CONVERSION_KEY, userId);
  }

  /**
   * Restores the source guest scope after an external authentication callback.
   * Only an opaque Supabase user id is retained; credentials never leave Auth.
   */
  static async restorePendingGuestSession(): Promise<string | null> {
    if (pendingConversionGuestUserId) {
      setGuestScope(pendingConversionGuestUserId);
      return pendingConversionGuestUserId;
    }

    const raw = await SafeZustandStorage.getItem(PENDING_GUEST_CONVERSION_KEY);
    if (!raw || !isValidGuestId(raw)) {
      if (raw) await SafeZustandStorage.removeItem(PENDING_GUEST_CONVERSION_KEY);
      return null;
    }

    pendingConversionGuestUserId = raw;
    setGuestScope(raw);
    return raw;
  }

  static async clearPendingGuestSession(): Promise<void> {
    pendingConversionGuestUserId = null;
    setGuestScope(null);
    await SafeZustandStorage.removeItem(PENDING_GUEST_CONVERSION_KEY);
  }

  static async discardPendingGuestData(): Promise<void> {
    const guestUserId = await GuestDataSync.restorePendingGuestSession();
    if (!guestUserId) return;
    await GuestDataManager.clearAllGuestData();
    await GuestDataSync.clearPendingGuestSession();
  }
  /**
   * Syncs all guest data to Supabase for the authenticated user
   * @param userId The authenticated user's ID from Supabase
   * @param onProgress Optional callback for progress updates
   * @returns Summary of sync results
   */
  static async syncAllData(
    _requestedUserId: string,
    onProgress?: SyncProgressCallback,
  ): Promise<{
    success: boolean;
    synced: {
      timetable: number;
      moodLogs: number;
      journalEntries: number;
      students: number;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const synced = {
      timetable: 0,
      moodLogs: 0,
      journalEntries: 0,
      students: 0,
    };

    try {
      const conversion = await readGuestConversionRecord();
      if (!conversion?.targetUserId) {
        throw new Error('Guest data transfer requires a confirmed durable account conversion.');
      }
      const availability = GuestDataSync.getTransferAvailability();
      if (!availability.isAvailable) {
        throw new Error(availability.reason);
      }
      setGuestScope(conversion.sourceGuestId);
      // Check if user is still anonymous
      const isAnon = await authAPI.isAnonymous();
      if (isAnon) {
        throw new Error('Cannot sync data for anonymous user');
      }
      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No active authenticated session. Cannot migrate guest data.');
      }
      if (session.user.id !== conversion.targetUserId) {
        throw new Error('Guest data transfer target no longer matches the confirmed account.');
      }
      const targetUserId = await identityAPI.getMyInternalId();
      const current = await supabaseClient.auth.getSession();
      if (
        !targetUserId ||
        !isEdloveAccountId(targetUserId) ||
        current.error ||
        current.data.session?.user.id !== session.user.id
      ) {
        throw new Error('Guest data transfer requires the verified canonical account.');
      }

      // Export all guest data
      const guestData = await GuestDataManager.exportAllData();
      const totalItems =
        guestData.timetable.length +
        guestData.moodLogs.length +
        guestData.journalEntries.length +
        guestData.students.length;

      let completed = 0;

      // Helper to update progress
      const updateProgress = (step: string) => {
        if (onProgress) {
          onProgress({
            total: totalItems,
            completed,
            currentStep: step,
            errors: [...errors],
          });
        }
      };

      const crudBatch: Array<{
        id: string;
        op: 'PUT';
        table: string;
        opData: Record<string, any>;
      }> = [];

      // 1. Stage Timetable
      if (guestData.timetable.length > 0) {
        guestData.timetable.forEach((period) => {
          crudBatch.push({
            id:
              typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `temp-id-${Math.random().toString(36).substr(2, 9)}`,
            op: 'PUT',
            table: 'timetable',
            opData: {
              user_id: targetUserId,
              day_of_week: period.day_of_week,
              period_number: period.period_number,
              subject: period.subject,
              class_name: period.class_name,
              type: period.type,
              start_time: period.start_time,
              end_time: period.end_time,
            },
          });
        });
      }

      // 2. Stage Mood Logs
      const moodMap = ['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'];
      if (guestData.moodLogs.length > 0) {
        guestData.moodLogs.forEach((log) => {
          crudBatch.push({
            id:
              typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `temp-id-${Math.random().toString(36).substr(2, 9)}`,
            op: 'PUT',
            table: 'mood_logs',
            opData: {
              user_id: targetUserId,
              mood: moodMap[log.mood],
              note: log.note,
              created_at: log.timestamp,
            },
          });
        });
      }

      // 3. Stage Journal Entries
      if (guestData.journalEntries.length > 0) {
        guestData.journalEntries.forEach((entry) => {
          crudBatch.push({
            id:
              typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `temp-id-${Math.random().toString(36).substr(2, 9)}`,
            op: 'PUT',
            table: 'fire_journal',
            opData: {
              user_id: targetUserId,
              content: entry.content,
              created_at: entry.timestamp,
            },
          });
        });
      }

      // 4. Stage Students
      if (guestData.students.length > 0) {
        guestData.students.forEach((student) => {
          crudBatch.push({
            id:
              typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `temp-id-${Math.random().toString(36).substr(2, 9)}`,
            op: 'PUT',
            table: 'classroom_student',
            opData: {
              full_name: student.name,
              index_number: student.index_number,
              notes: student.notes,
            },
          });
        });
      }

      if (crudBatch.length > 0) {
        updateProgress('Migrating user data payload through Sanctuary Gateway...');

        const receipt = await orpcClient.sync.uploadBatch({
          body: {
            idempotencyKey: conversion.conversionId,
            crud: crudBatch as any,
          },
        });
        if (!receipt.success || receipt.processedCount !== crudBatch.length) {
          throw new Error('Guest data transfer did not receive a complete server receipt.');
        }

        synced.timetable = guestData.timetable.length;
        synced.moodLogs = guestData.moodLogs.length;
        synced.journalEntries = guestData.journalEntries.length;
        synced.students = guestData.students.length;
        completed = totalItems;
      }

      updateProgress('Sync complete!');

      // Clear guest data after successful sync
      if (errors.length === 0) {
        await GuestDataManager.clearAllGuestData();
        await SafeZustandStorage.removeItem(PENDING_GUEST_CONVERSION_KEY);
      }

      return {
        success: errors.length === 0,
        synced,
        errors,
      };
    } catch (error: any) {
      errors.push(`Fatal sync error: ${error.message}`);
      return {
        success: false,
        synced,
        errors,
      };
    }
  }

  /**
   * Checks if there's guest data available to sync
   */
  static async hasGuestData(sourceGuestUserId?: string): Promise<boolean> {
    if (sourceGuestUserId) {
      const record = await readGuestConversionRecord();
      if (!record || record.sourceGuestId !== sourceGuestUserId) {
        throw new Error('Guest data cannot be selected outside its pending conversion record.');
      }
      setGuestScope(sourceGuestUserId);
    }
    const summary = await GuestDataManager.getDataSummary();
    return (
      summary.timetablePeriods > 0 ||
      summary.moodLogs > 0 ||
      summary.journalEntries > 0 ||
      summary.students > 0
    );
  }

  /**
   * Gets a summary of guest data available for sync
   */
  static async getGuestDataSummary(): Promise<{
    timetablePeriods: number;
    moodLogs: number;
    journalEntries: number;
    students: number;
    total: number;
  }> {
    const summary = await GuestDataManager.getDataSummary();
    return {
      ...summary,
      total:
        summary.timetablePeriods + summary.moodLogs + summary.journalEntries + summary.students,
    };
  }
}
