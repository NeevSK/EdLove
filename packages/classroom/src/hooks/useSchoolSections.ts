import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@repo/core';

export function useSchoolSections(schoolId: string) {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadSections = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('school_sections')
                .select('*')
                .eq('school_id', schoolId)
                .order('grade', { ascending: true });
            setSections(data ?? []);
        } catch (err) {
            console.error('Failed to load sections:', err);
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        loadSections();
    }, [loadSections]);

    const createSection = async (name: string, grade: string | null) => {
        if (!name.trim() || !schoolId) return;
        setSaving(true);
        try {
            const { data } = await supabase
                .from('school_sections')
                .insert({ 
                    school_id: schoolId, 
                    name: name.trim(), 
                    grade: grade?.trim() || null 
                })
                .select()
                .single();
            if (data) setSections(prev => [...prev, data]);
            return data;
        } catch (err) {
            console.error('Failed to create section:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return { sections, loading, saving, createSection, refresh: loadSections };
}
