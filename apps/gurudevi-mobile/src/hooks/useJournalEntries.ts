import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GuestDataManager, GuestJournalEntry } from '../lib/guestDataManager';
import { authAPI } from '../lib/api/auth';

export interface JournalEntry {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
}

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
                    // Load from Supabase
                    const { data, error } = await supabase
                        .from('journal_entries')
                        .select('*')
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
                // Authenticated mode: Save to Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data, error } = await supabase
                    .from('journal_entries')
                    .insert([{ content, user_id: user.id }])
                    .select()
                    .single();

                if (error) throw error;
                setEntries(prev => [data, ...prev]);
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
