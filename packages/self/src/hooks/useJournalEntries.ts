import { useState, useEffect, useCallback } from 'react';
import { supabase, GuestDataManager, authAPI, identityAPI, growthSignalsAPI, useTemporalStore, applyTemporalFilter } from '@repo/core';

import { JournalEntry } from '../types';

export const useJournalEntries = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const { viewDate, phase } = useTemporalStore();


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

                    let query = supabase
                        .from('journal_entries')
                        .select('*')
                        .eq('user_id', internalId);

                    query = applyTemporalFilter(query, {
                        column: 'created_at',
                        mode: 'event_time',
                        capability: 'event_stream',
                    });
                    query = query.order('created_at', { ascending: false }).limit(50);

                    const { data, error } = await query;


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
    }, [isAnonymous, viewDate, phase]);


    const addJournalEntry = useCallback(async (content: string) => {
                // Temporal mutation shielding is handled by the proxy, but we keep this check for UI responsiveness.
        if (phase === 'past') throw new Error("Cannot add entries to the past");

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
                // Growth signal  fire-and-forget (benefits mobile + web callers)
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
