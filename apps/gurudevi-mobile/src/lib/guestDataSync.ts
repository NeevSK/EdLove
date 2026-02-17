import { GuestDataManager } from './guestDataManager';
import { supabase } from './supabase';
import { authAPI } from './api/auth';

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
 * This service ensures seamless data continuity during the guest → authenticated user transition.
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
        let synced = {
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

            // 1. Sync Timetable
            updateProgress('Syncing timetable periods...');
            for (const period of guestData.timetable) {
                try {
                    const { error } = await supabase
                        .from('timetable')
                        .insert({
                            user_id: userId,
                            day_of_week: period.day_of_week,
                            period_number: period.period_number,
                            subject: period.subject,
                            class_name: period.class_name,
                            type: period.type,
                            start_time: period.start_time,
                            end_time: period.end_time
                        });

                    if (!error) {
                        synced.timetable++;
                    } else {
                        errors.push(`Timetable period: ${error.message}`);
                    }
                } catch (err: any) {
                    errors.push(`Timetable period: ${err.message}`);
                }
                completed++;
                updateProgress('Syncing timetable periods...');
            }

            // 2. Sync Mood Logs
            updateProgress('Syncing mood logs...');
            const moodMap = ['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'];
            for (const log of guestData.moodLogs) {
                try {
                    const { error } = await supabase
                        .from('mood_logs')
                        .insert({
                            user_id: userId,
                            mood: moodMap[log.mood],
                            note: log.note,
                            created_at: log.timestamp
                        });

                    if (!error) {
                        synced.moodLogs++;
                    } else {
                        errors.push(`Mood log: ${error.message}`);
                    }
                } catch (err: any) {
                    errors.push(`Mood log: ${err.message}`);
                }
                completed++;
                updateProgress('Syncing mood logs...');
            }

            // 3. Sync Journal Entries
            updateProgress('Syncing journal entries...');
            for (const entry of guestData.journalEntries) {
                try {
                    const { error } = await supabase
                        .from('journal_entries')
                        .insert({
                            user_id: userId,
                            content: entry.content,
                            created_at: entry.timestamp
                        });

                    if (!error) {
                        synced.journalEntries++;
                    } else {
                        errors.push(`Journal entry: ${error.message}`);
                    }
                } catch (err: any) {
                    errors.push(`Journal entry: ${err.message}`);
                }
                completed++;
                updateProgress('Syncing journal entries...');
            }

            // 4. Sync Students (if applicable - for teachers)
            updateProgress('Syncing students...');
            for (const student of guestData.students) {
                try {
                    const { error } = await supabase
                        .from('students')
                        .insert({
                            full_name: student.name,
                            index_number: student.index_number,
                            notes: student.notes,
                            // Note: class_id would need to be set separately if creating a classroom
                        });

                    if (!error) {
                        synced.students++;
                    } else {
                        errors.push(`Student: ${error.message}`);
                    }
                } catch (err: any) {
                    errors.push(`Student: ${err.message}`);
                }
                completed++;
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
