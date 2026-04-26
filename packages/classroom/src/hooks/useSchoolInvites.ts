import { type InviteCode, invitesAPI } from '@repo/admin';
import { useCallback, useEffect, useState } from 'react';

export function useSchoolInvites(schoolId: string) {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadInviteCodes = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const data = await invitesAPI.listInviteCodes(schoolId);
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
      const code = await invitesAPI.generateInviteCode(schoolId, role, userId);
      setInviteCodes((prev) => [code, ...prev]);
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
