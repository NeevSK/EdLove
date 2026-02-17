import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GuestDataManager, GuestMoodLog } from '../lib/guestDataManager';
import { authAPI } from '../lib/api/auth';

export interface MoodLog {
    id: string;
    user_id: string;
    mood: 'joyful' | 'calm' | 'curious' | 'anxious' | 'frustrated' | 'sad';
    note?: string;
    created_at: string;
}

export const useMoodLogs = () => {
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Check anonymous status
    useEffect(() => {
        const checkAnonymous = async () => {
            const anon = await authAPI.isAnonymous();
            setIsAnonymous(anon);
        };
        checkAnonymous();
    }, []);

    // Load mood logs
    useEffect(() => {
        const loadLogs = async () => {
            try {
                if (isAnonymous) {
                    // Load from guest storage
                    const guestLogs = await GuestDataManager.getMoodLogs();
                    const mappedLogs = guestLogs.map(gl => ({
                        id: gl.localId,
                        user_id: 'guest',
                        mood: ['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'][gl.mood] as MoodLog['mood'],
                        note: gl.note,
                        created_at: gl.timestamp
                    }));
                    setLogs(mappedLogs);
                } else {
                    // Load from Supabase
                    const { data, error } = await supabase
                        .from('mood_logs')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(30);

                    if (!error && data) {
                        setLogs(data);
                    }
                }
            } catch (error) {
                console.error('Failed to load mood logs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLogs();
    }, [isAnonymous]);

    const addMoodLog = useCallback(async (mood: MoodLog['mood'], note?: string) => {
        try {
            if (isAnonymous) {
                // Guest mode: Save to local storage
                const moodIndex = ['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'].indexOf(mood);
                const guestLog = await GuestDataManager.addMoodLog(moodIndex, note);
                const newLog: MoodLog = {
                    id: guestLog.localId,
                    user_id: 'guest',
                    mood,
                    note,
                    created_at: guestLog.timestamp
                };
                setLogs(prev => [newLog, ...prev]);
                return newLog;
            } else {
                // Authenticated mode: Save to Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data, error } = await supabase
                    .from('mood_logs')
                    .insert([{ mood, note, user_id: user.id }])
                    .select()
                    .single();

                if (error) throw error;
                setLogs(prev => [data, ...prev]);
                return data;
            }
        } catch (error) {
            console.error('Failed to add mood log:', error);
            throw error;
        }
    }, [isAnonymous]);

    return {
        logs,
        loading,
        isAnonymous,
        addMoodLog
    };
};
