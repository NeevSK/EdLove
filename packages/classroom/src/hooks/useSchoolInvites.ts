import { useState, useEffect, useCallback } from 'react';
import { schoolAPI } from '@repo/core';

export function useSchoolInvites(schoolId: string) {
    const [inviteCodes, setInviteCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const loadInviteCodes = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await schoolAPI.getInviteCodes(schoolId);
            setInviteCodes(data ?? []);
        } catch (err) {
            console.error('Failed to load invite codes:', err);
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        loadInviteCodes();
    }, [loadInviteCodes]);

    const generateCode = async (role: 'teacher' | 'principal', userId: string) => {
        if (!schoolId || !userId) return;
        setGenerating(true);
        try {
            const code = await schoolAPI.generateInviteCode(schoolId, role, userId);
            setInviteCodes(prev => [code, ...prev]);
            return code;
        } catch (err) {
            console.error('Failed to generate invite code:', err);
            throw err;
        } finally {
            setGenerating(false);
        }
    };

    return { inviteCodes, loading, generating, generateCode, refresh: loadInviteCodes };
}
