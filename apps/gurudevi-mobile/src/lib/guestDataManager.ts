import { SafeZustandStorage } from './storageWrapper';
import { supabase } from './supabase';

// Keys for MMKV storage
const GUEST_TIMETABLE_KEY = 'guest-timetable';
const GUEST_MOOD_LOGS_KEY = 'guest-mood-logs';
const GUEST_JOURNAL_ENTRIES_KEY = 'guest-journal-entries';
const GUEST_CLASSROOM_DATA_KEY = 'guest-classroom-data';
const GUEST_STUDENTS_KEY = 'guest-students';

export interface GuestTimetablePeriod {
    localId: string;
    day_of_week: number;
    period_number: number;
    subject: string;
    class_name: string;
    type: 'subject' | 'relief' | 'interval';
    start_time: string;
    end_time: string;
}

export interface GuestMoodLog {
    localId: string;
    mood: number;
    note?: string;
    timestamp: string;
}

export interface GuestJournalEntry {
    localId: string;
    content: string;
    timestamp: string;
}

export interface GuestStudent {
    localId: string;
    name: string;
    index_number: string;
    notes?: string;
}

/**
 * Guest Data Manager
 * Handles local storage for anonymous users using MMKV
 * Data is stored locally and synced to Supabase upon account creation
 */
export class GuestDataManager {
    // ============ Timetable Methods ============

    static async getTimetable(dayOfWeek: number): Promise<GuestTimetablePeriod[]> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY);
            if (!data) return [];

            const allPeriods: GuestTimetablePeriod[] = JSON.parse(data);
            return allPeriods.filter(p => p.day_of_week === dayOfWeek);
        } catch (error) {
            console.error('Failed to get guest timetable:', error);
            return [];
        }
    }

    static async addTimetablePeriod(period: Omit<GuestTimetablePeriod, 'localId'>): Promise<GuestTimetablePeriod> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY);
            const allPeriods: GuestTimetablePeriod[] = data ? JSON.parse(data) : [];

            const newPeriod: GuestTimetablePeriod = {
                ...period,
                localId: `local-${Date.now()}-${Math.random()}`
            };

            allPeriods.push(newPeriod);
            await SafeZustandStorage.setItem(GUEST_TIMETABLE_KEY, JSON.stringify(allPeriods));

            return newPeriod;
        } catch (error) {
            console.error('Failed to add guest timetable period:', error);
            throw error;
        }
    }

    static async updateTimetablePeriod(localId: string, updates: Partial<GuestTimetablePeriod>): Promise<void> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY);
            if (!data) return;

            const allPeriods: GuestTimetablePeriod[] = JSON.parse(data);
            const index = allPeriods.findIndex(p => p.localId === localId);

            if (index !== -1) {
                allPeriods[index] = { ...allPeriods[index], ...updates };
                await SafeZustandStorage.setItem(GUEST_TIMETABLE_KEY, JSON.stringify(allPeriods));
            }
        } catch (error) {
            console.error('Failed to update guest timetable period:', error);
            throw error;
        }
    }

    static async deleteTimetablePeriod(localId: string): Promise<void> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY);
            if (!data) return;

            const allPeriods: GuestTimetablePeriod[] = JSON.parse(data);
            const filtered = allPeriods.filter(p => p.localId !== localId);

            await SafeZustandStorage.setItem(GUEST_TIMETABLE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Failed to delete guest timetable period:', error);
            throw error;
        }
    }

    // ============ Mood Log Methods ============

    static async getMoodLogs(): Promise<GuestMoodLog[]> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_MOOD_LOGS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get guest mood logs:', error);
            return [];
        }
    }

    static async addMoodLog(mood: number, note?: string): Promise<GuestMoodLog> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_MOOD_LOGS_KEY);
            const logs: GuestMoodLog[] = data ? JSON.parse(data) : [];

            const newLog: GuestMoodLog = {
                localId: `local-${Date.now()}-${Math.random()}`,
                mood,
                note,
                timestamp: new Date().toISOString()
            };

            logs.push(newLog);
            await SafeZustandStorage.setItem(GUEST_MOOD_LOGS_KEY, JSON.stringify(logs));

            return newLog;
        } catch (error) {
            console.error('Failed to add guest mood log:', error);
            throw error;
        }
    }

    // ============ Journal Entry Methods ============

    static async getJournalEntries(): Promise<GuestJournalEntry[]> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_JOURNAL_ENTRIES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get guest journal entries:', error);
            return [];
        }
    }

    static async addJournalEntry(content: string): Promise<GuestJournalEntry> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_JOURNAL_ENTRIES_KEY);
            const entries: GuestJournalEntry[] = data ? JSON.parse(data) : [];

            const newEntry: GuestJournalEntry = {
                localId: `local-${Date.now()}-${Math.random()}`,
                content,
                timestamp: new Date().toISOString()
            };

            entries.push(newEntry);
            await SafeZustandStorage.setItem(GUEST_JOURNAL_ENTRIES_KEY, JSON.stringify(entries));

            return newEntry;
        } catch (error) {
            console.error('Failed to add guest journal entry:', error);
            throw error;
        }
    }

    // ============ Student Methods ============

    static async getStudents(): Promise<GuestStudent[]> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_STUDENTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get guest students:', error);
            return [];
        }
    }

    static async addStudents(students: Omit<GuestStudent, 'localId'>[]): Promise<GuestStudent[]> {
        try {
            const data = await SafeZustandStorage.getItem(GUEST_STUDENTS_KEY);
            const existing: GuestStudent[] = data ? JSON.parse(data) : [];

            const newStudents = students.map(s => ({
                ...s,
                localId: `local-${Date.now()}-${Math.random()}`
            }));

            const updated = [...existing, ...newStudents];
            await SafeZustandStorage.setItem(GUEST_STUDENTS_KEY, JSON.stringify(updated));

            return newStudents;
        } catch (error) {
            console.error('Failed to add guest students:', error);
            throw error;
        }
    }

    // ============ Data Summary & Clearing ============

    static async getDataSummary(): Promise<{
        timetablePeriods: number;
        moodLogs: number;
        journalEntries: number;
        students: number;
    }> {
        const [timetableData, moodData, journalData, studentData] = await Promise.all([
            SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY),
            SafeZustandStorage.getItem(GUEST_MOOD_LOGS_KEY),
            SafeZustandStorage.getItem(GUEST_JOURNAL_ENTRIES_KEY),
            SafeZustandStorage.getItem(GUEST_STUDENTS_KEY)
        ]);

        return {
            timetablePeriods: timetableData ? JSON.parse(timetableData).length : 0,
            moodLogs: moodData ? JSON.parse(moodData).length : 0,
            journalEntries: journalData ? JSON.parse(journalData).length : 0,
            students: studentData ? JSON.parse(studentData).length : 0
        };
    }

    static async clearAllGuestData(): Promise<void> {
        await Promise.all([
            SafeZustandStorage.removeItem(GUEST_TIMETABLE_KEY),
            SafeZustandStorage.removeItem(GUEST_MOOD_LOGS_KEY),
            SafeZustandStorage.removeItem(GUEST_JOURNAL_ENTRIES_KEY),
            SafeZustandStorage.removeItem(GUEST_STUDENTS_KEY),
            SafeZustandStorage.removeItem(GUEST_CLASSROOM_DATA_KEY)
        ]);
    }

    // ============ Data Export (for sync) ============

    static async exportAllData(): Promise<{
        timetable: GuestTimetablePeriod[];
        moodLogs: GuestMoodLog[];
        journalEntries: GuestJournalEntry[];
        students: GuestStudent[];
    }> {
        const [timetableData, moodData, journalData, studentData] = await Promise.all([
            SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY),
            SafeZustandStorage.getItem(GUEST_MOOD_LOGS_KEY),
            SafeZustandStorage.getItem(GUEST_JOURNAL_ENTRIES_KEY),
            SafeZustandStorage.getItem(GUEST_STUDENTS_KEY)
        ]);

        return {
            timetable: timetableData ? JSON.parse(timetableData) : [],
            moodLogs: moodData ? JSON.parse(moodData) : [],
            journalEntries: journalData ? JSON.parse(journalData) : [],
            students: studentData ? JSON.parse(studentData) : []
        };
    }
}
