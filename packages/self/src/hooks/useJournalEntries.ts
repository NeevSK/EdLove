import { useState, useEffect, useCallback } from 'react';
import { supabase, GuestDataManager, authAPI, identityAPI, growthSignalsAPI } from '@repo/core';
import { JournalEntry } from '../types';

export const useJournalEntries = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
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

    // Load journal entries
    useEffect(() => {
        const loadEntries = async () => {
            try {
                if (isAnonymous) {
                    // Load from guest storage
                    const guestEntries = await GuestDataManager.getJournalEntries();
                    const mappedEntries = guestEntries.map(ge => ({
                        id: ge.localId,
                        user_id: 'guest',
                        content: ge.content,
                        created_at: ge.timestamp
                    }));
                    setEntries(mappedEntries);
                } else {
                    // Load from Supabase using internal identity
                    const internalId = await identityAPI.getMyInternalId();
                    if (!internalId) return;

                    const { data, error } = await supabase
                        .from('journal_entries')
                        .select('*')
                        .eq('user_id', internalId) // Explicitly filter for robustness
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (!error && data) {
                        setEntries(data);
                    }
                }
            } catch (error) {
                console.error('Failed to load journal entries:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEntries();
    }, [isAnonymous]);

    const addJournalEntry = useCallback(async (content: string) => {
        try {
            if (isAnonymous) {
                // Guest mode: Save to local storage
                const guestEntry = await GuestDataManager.addJournalEntry(content);
                const newEntry: JournalEntry = {
                    id: guestEntry.localId,
                    user_id: 'guest',
                    content,
                    created_at: guestEntry.timestamp
                };
                setEntries(prev => [newEntry, ...prev]);
                return newEntry;
            } else {
                // Authenticated mode: Save to Supabase using internal identity
                const internalId = await identityAPI.getMyInternalId();
                if (!internalId) throw new Error("Not authenticated");

                const { data, error } = await supabase
                    .from('journal_entries')
                    .insert([{ content, user_id: internalId }])
                    .select()
                    .single();

                if (error) throw error;
                setEntries(prev => [data, ...prev]);
                // Growth signal — fire-and-forget (benefits mobile + web callers)
                void growthSignalsAPI.emitSignal(internalId, 'reflection_written', {}).catch(() => { });
                return data;
            }
        } catch (error) {
            console.error('Failed to add journal entry:', error);
            throw error;
        }
    }, [isAnonymous]);

    return {
        entries,
        loading,
        isAnonymous,
        addJournalEntry
    };
};
