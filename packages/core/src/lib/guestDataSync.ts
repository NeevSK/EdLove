import { GuestDataManager } from './guestDataManager';
import { supabase } from './supabase';
import { authAPI } from '../api/auth';


export interface SyncProgress {
    total: number;
    completed: number;
    currentStep: string;
    errors: string[];
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

/**
 * Guest Data Sync Service
 * 
 * Handles migration of locally stored guest data to Supabase when a user creates an account.
 * This service ensures seamless data continuity during the guest \u2192 authenticated user transition.
 */
export class GuestDataSync {
    /**
     * Syncs all guest data to Supabase for the authenticated user
     * @param userId The authenticated user's ID from Supabase
     * @param onProgress Optional callback for progress updates
     * @returns Summary of sync results
     */
    static async syncAllData(
        userId: string,
        onProgress?: SyncProgressCallback
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
            students: 0
        };

        try {
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
                        errors: [...errors]
                    });
                }
            };

            // 1. Sync Timetable \u2014 batch insert for all periods
            updateProgress('Syncing timetable periods...');
            if (guestData.timetable.length > 0) {
                const timetableRows = guestData.timetable.map(period => ({
                    user_id: userId,
                    day_of_week: period.day_of_week,
                    period_number: period.period_number,
                    subject: period.subject,
                    class_name: period.class_name,
                    type: period.type,
                    start_time: period.start_time,
                    end_time: period.end_time,
                }));
                const { error } = await supabase.from('timetable').insert(timetableRows);
                if (!error) {
                    synced.timetable = timetableRows.length;
                } else {
                    errors.push(`Timetable: ${error.message}`);
                }
                completed += guestData.timetable.length;
                updateProgress('Syncing timetable periods...');
            }

            // 2. Sync Mood Logs \u2014 batch insert
            updateProgress('Syncing mood logs...');
            const moodMap = ['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'];
            if (guestData.moodLogs.length > 0) {
                const moodRows = guestData.moodLogs.map(log => ({
                    user_id: userId,
                    mood: moodMap[log.mood],
                    note: log.note,
                    created_at: log.timestamp,
                }));
                const { error } = await supabase.from('mood_logs').insert(moodRows);
                if (!error) {
                    synced.moodLogs = moodRows.length;
                } else {
                    errors.push(`Mood logs: ${error.message}`);
                }
                completed += guestData.moodLogs.length;
                updateProgress('Syncing mood logs...');
            }

            // 3. Sync Journal Entries \u2014 batch insert
            updateProgress('Syncing journal entries...');
            if (guestData.journalEntries.length > 0) {
                const journalRows = guestData.journalEntries.map(entry => ({
                    user_id: userId,
                    content: entry.content,
                    created_at: entry.timestamp,
                }));
                const { error } = await supabase.from('journal_entries').insert(journalRows);
                if (!error) {
                    synced.journalEntries = journalRows.length;
                } else {
                    errors.push(`Journal entries: ${error.message}`);
                }
                completed += guestData.journalEntries.length;
                updateProgress('Syncing journal entries...');
            }

            // 4. Sync Students \u2014 batch insert (teachers only)
            updateProgress('Syncing students...');
            if (guestData.students.length > 0) {
                const studentRows = guestData.students.map(student => ({
                    full_name: student.name,
                    index_number: student.index_number,
                    notes: student.notes,
                    // Note: class_id would need to be set separately if creating a classroom
                }));
                const { error } = await supabase.from('students').insert(studentRows);
                if (!error) {
                    synced.students = studentRows.length;
                } else {
                    errors.push(`Students: ${error.message}`);
                }
                completed += guestData.students.length;
                updateProgress('Syncing students...');
            }

            // Final progress update
            updateProgress('Sync complete!');

            // Clear guest data after successful sync
            if (errors.length === 0) {
                await GuestDataManager.clearAllGuestData();
            }

            return {
                success: errors.length === 0,
                synced,
                errors
            };

        } catch (error: any) {
            errors.push(`Fatal sync error: ${error.message}`);
            return {
                success: false,
                synced,
                errors
            };
        }
    }

    /**
     * Checks if there's guest data available to sync
     */
    static async hasGuestData(): Promise<boolean> {
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
            total: summary.timetablePeriods + summary.moodLogs + summary.journalEntries + summary.students
        };
    }
}
