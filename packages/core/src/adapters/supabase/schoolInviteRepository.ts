import { APIError } from '@repo/core/types/API';
import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface VerifiedSchoolInvite {
  schoolId: string;
  schoolName: string;
  capacity: Capacity;
  roles: Capacity[];
}

export interface SchoolInviteRepository {
  verifyAndRedeemInviteCode(code: string, userId: string): Promise<VerifiedSchoolInvite>;
}

export const createSupabaseSchoolInviteRepository = (
  supabase: SupabaseClient,
): SchoolInviteRepository => ({
  async verifyAndRedeemInviteCode(code: string, userId: string): Promise<VerifiedSchoolInvite> {
    const formattedCode = code.toUpperCase().trim();

    // 1. Fetch active invite code with joined school metadata
    const { data: invite, error: inviteError } = await supabase
      .from('school_invite_codes')
      .select('*, schools(id, name, type)')
      .eq('code', formattedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (inviteError) {
      throw new APIError('Failed to verify invite code', inviteError.code, inviteError);
    }
    if (!invite) {
      throw new APIError('Invalid or expired invite code', 'NOT_FOUND');
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      throw new APIError('This invite code has expired', 'EXPIRED');
    }

    if (invite.max_uses && invite.used_count >= invite.max_uses) {
      throw new APIError('This invite code has reached its maximum redemptions', 'MAX_USES_REACHED');
    }

    const school = invite.schools;
    if (!school) {
      throw new APIError('Associated school not found', 'SCHOOL_NOT_FOUND');
    }

    // 2. Increment usage counter
    await supabase
      .from('school_invite_codes')
      .update({
        used_count: invite.used_count + 1,
      })
      .eq('id', invite.id);

    // 3. Upsert bond in DB
    const bondPayload = {
      user_id: userId,
      entity_id: school.id,
      entity_type: 'school',
      capacity: invite.capacity,
      metadata: JSON.stringify({ roles: invite.roles }),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('bonds').upsert(bondPayload);

    return {
      schoolId: school.id,
      schoolName: school.name,
      capacity: invite.capacity,
      roles: Array.isArray(invite.roles) ? invite.roles : [invite.capacity],
    };
  },
});
