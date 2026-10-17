import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { authAPI } from '@repo/core/api/auth';
import { orpcClient } from '@repo/core/api/orpcClient';
import { GuestDataManager } from '@repo/core/native/guestDataManager';
import { setGuestScope } from '@repo/core/native/guestScope';

let pendingConversionGuestUserId: string | null = null;

export interface SyncProgress {
  total: number;
  completed: number;
  currentStep: string;
  errors: string[];
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export class GuestDataSync {
  static rememberGuestSession(userId: string): void {
    pendingConversionGuestUserId = userId;
    setGuestScope(userId);
  }
  /**
   * Syncs all guest data to Supabase for the authenticated user
   * @param userId The authenticated user's ID from Supabase
   * @param onProgress Optional callback for progress updates
   * @returns Summary of sync results
   */
  static async syncAllData(
    userId: string,
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
      if (pendingConversionGuestUserId) setGuestScope(pendingConversionGuestUserId);
      // Check if user is still anonymous
      const isAnon = await authAPI.isAnonymous();
      if (isAnon) {
        throw new Error('Cannot sync data for anonymous user');
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
              user_id: userId,
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
              user_id: userId,
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
              user_id: userId,
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

        const {
          data: { session },
          error: sessionError,
        } = await supabaseClient.auth.getSession();

        if (sessionError || !session) {
          throw new Error('No active authenticated session. Cannot migrate guest data.');
        }

        await orpcClient.sync.uploadBatch({
          body: {
            batch: crudBatch,
          },
        });

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
        pendingConversionGuestUserId = null;
        setGuestScope(null);
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
      GuestDataSync.rememberGuestSession(sourceGuestUserId);
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
