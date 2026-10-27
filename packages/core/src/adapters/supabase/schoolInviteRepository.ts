import { type Capacity, CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface VerifiedSchoolInvite {
  bondId: string;
  schoolId: string;
  capacity: Capacity;
  alreadyClaimed: boolean;
}

export interface SchoolInviteRepository {
  verifyAndRedeemInviteCode(code: string, userId: string): Promise<VerifiedSchoolInvite>;
}

export interface SchoolInviteScopeSelector {
  switchPerspective(entityId: string, capacity: Capacity): Promise<void>;
}

/** Claims a school membership before selecting it; a failed selection never mutates local scope. */
export async function claimAndSelectSchoolInvite(input: {
  readonly repository: SchoolInviteRepository;
  readonly identity: SchoolInviteScopeSelector;
  readonly refreshIdentity: () => Promise<void>;
  readonly code: string;
  readonly userId: string;
}): Promise<VerifiedSchoolInvite> {
  const claimed = await input.repository.verifyAndRedeemInviteCode(input.code, input.userId);
  await input.identity.switchPerspective(claimed.schoolId, claimed.capacity);
  await input.refreshIdentity();
  return claimed;
}

export const createSupabaseSchoolInviteRepository = (
  supabase: SupabaseClient,
): SchoolInviteRepository => ({
  async verifyAndRedeemInviteCode(code: string, userId: string): Promise<VerifiedSchoolInvite> {
    const formattedCode = code.toUpperCase().trim();
    const { data, error } = await supabase.rpc('claim_invite_code', {
      p_invite_code: formattedCode,
      p_user_id: userId,
    });
    if (error) throw new APIError('Failed to redeem school invite', error.code, error);

    const result = data as Record<string, unknown> | null;
    if (!result?.success) {
      throw new APIError(
        typeof result?.message === 'string' ? result.message : 'Failed to redeem school invite',
        'INVITE_CLAIM_FAILED',
      );
    }
    const capacity = CapacitySchema.safeParse(result.capacity);
    if (
      typeof result.bond_id !== 'string' ||
      typeof result.school_id !== 'string' ||
      !capacity.success
    ) {
      throw new APIError(
        'Invite claim returned an invalid authority result',
        'INVALID_INVITE_CLAIM',
      );
    }

    return {
      bondId: result.bond_id,
      schoolId: result.school_id,
      capacity: capacity.data,
      alreadyClaimed: result.already_claimed === true,
    };
  },
});
