import React, { useState, useEffect, useCallback } from 'react';
import { supabase, GuestDataManager, authAPI, SafeZustandStorage, useStore, growthSignalsAPI, useResonanceStore, applyResonanceFilter } from '@repo/core';

import { MoodLog } from '../types';

const MOOD_CACHE_KEY = 'gurudevi-mood-cache';

/**
 * useMoodLogs Hook
 * 
 * Manages mood tracking with "Local-First" resonance.
 * - Loads recent history instantly from cache.
 * - Supports both Authenticated (Supabase) and Guest (Local Storage) modes.
 * - Syncs with Supabase in background for authenticated users.
 */
export const useMoodLogs = (userId?: string) => {
    const isOnline = useStore(state => state.isOnline);
    const { resonanceDate, phase } = useResonanceStore();

    const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Initial check for anonymous status
    useEffect(() => {
        const checkStatus = async () => {
            const anon = await authAPI.isAnonymous();
            setIsAnonymous(anon);
        };
        checkStatus();
    }, []);

    // Load from cache or guest storage
    useEffect(() => {
        const loadInitial = async () => {
            try {
                if (isAnonymous) {
                    // Guest Mode: Direct from Storage
                    const guestLogs = await GuestDataManager.getMoodLogs();
                    const mappedLogs = guestLogs.map(gl => ({
                        id: gl.localId,
                        user_id: 'guest',
                        mood_score: gl.mood,
                        mood: (['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'][gl.mood] || 'calm') as MoodLog['mood'],
                        note: gl.note,
                        created_at: gl.timestamp
                    }));
                    setMoodHistory(mappedLogs as MoodLog[]);
                } else if (userId) {
                    // Authenticated Mode: Load from Cache first
                    const cached = await SafeZustandStorage.getItem(`${MOOD_CACHE_KEY}-${userId}-${resonanceDate}`);

                    if (cached) {
                        setMoodHistory(JSON.parse(cached));
                    }
                }
            } catch (e) {
                console.warn('Failed to load initial mood logs', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitial();
    }, [isAnonymous, userId, resonanceDate]);

    // Refresh from API or Storage
    const refreshData = useCallback(async () => {
        if (isAnonymous) {
            const guestLogs = await GuestDataManager.getMoodLogs();
            const mappedLogs = guestLogs.map(gl => ({
                id: gl.localId,
                user_id: 'guest',
                mood_score: gl.mood,
                mood: (['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'][gl.mood] || 'calm') as MoodLog['mood'],
                note: gl.note,
                created_at: gl.timestamp
            }));
            setMoodHistory(mappedLogs as MoodLog[]);
            return;
        }

        if (!userId || !isOnline) return;

        try {
            let query = supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', userId);

            // Automated Resonance Filtering
            query = applyResonanceFilter(query);

            
            if (phase === 'present') {
                query = query.order('created_at', { ascending: false }).limit(30);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                setMoodHistory(data);
                // Sync to cache
                await SafeZustandStorage.setItem(
                    `${MOOD_CACHE_KEY}-${userId}-${resonanceDate}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh mood logs', e);
        }
    }, [userId, isOnline, isAnonymous, resonanceDate, phase]);


    // Sync from API in background on state change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    const addMoodLog = useCallback(async (mood: MoodLog['mood'], note?: string) => {
        if (!mood) return;
        try {
            const moodIndex = ['joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad'].indexOf(mood);
            const score = moodIndex !== -1 ? moodIndex : 3;

            if (isAnonymous) {
                // Save locally only
                const guestLog = await GuestDataManager.addMoodLog(score, note);
                const newLog: MoodLog = {
                    id: guestLog.localId,
                    user_id: 'guest',
                    mood_score: score,
                    mood,
                    note,
                    created_at: guestLog.timestamp
                };
                setMoodHistory(prev => [newLog, ...prev]);
                return newLog;
            } else {
                // Save to Supabase
                const { data, error } = await supabase
                    .from('mood_logs')
                    .insert([{
                        mood,
                        mood_score: score,
                        note,
                        user_id: userId,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                if (!data) throw new Error('No data returned from mood log insertion');

                setMoodHistory(prev => [data, ...prev]);

                // Growth signal — fire-and-forget (benefits both mobile and web callers)
                if (userId) {
                    void growthSignalsAPI.emitSignal(userId, 'mood_checkin', { mood_score: score }).catch((err) => {
                        if (__DEV__) console.warn('[useMoodLogs] mood_checkin signal failed:', err);
                    });
                }

                // Update cache
                if (userId) {
                    const currentHistory = [data, ...moodHistory].slice(0, 30);
                    await SafeZustandStorage.setItem(
                        `${MOOD_CACHE_KEY}-${userId}`,
                        JSON.stringify(currentHistory)
                    );
                }

                return data;
            }
        } catch (error) {
            console.error('Failed to add mood log:', error);
            throw error;
        }
    }, [isAnonymous, userId, moodHistory]);

    return {
        // Properties
        moodHistory,
        logs: moodHistory, // Compatibility alias
        isLoading,
        loading: isLoading, // Compatibility alias
        isAnonymous,

        // Methods
        refreshData,
        addMoodLog,
        setMoodHistory
    };
};
