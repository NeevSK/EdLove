import { identityAPI } from '../native/identity';
import { supabase } from '../native/supabase';

/**
 * Social & Safety API
 *
 * Logic for user-to-user safety interactions like blocking and muting.
 * Moved to core to allow multi-domain access without circular dependencies.
 */
export const socialAPI = {
  /**
   * Blocks a user.
   */
  async blockUser(targetUserId: string): Promise<void> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    const { error } = await supabase.from('user_blocks').insert([
      {
        blocker_id: myId,
        blocked_id: targetUserId,
      },
    ]);

    if (error && error.code !== '23505') throw error;
  },

  /**
   * Unblocks a user.
   */
  async unblockUser(targetUserId: string): Promise<void> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', myId)
      .eq('blocked_id', targetUserId);

    if (error) throw error;
  },

  /**
   * Checks if a blocking relationship exists between the current user and target user.
   */
  async isBlockingActive(targetUserId: string): Promise<boolean> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return false;

    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocker_id')
      .or(
        `and(blocker_id.eq.${myId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${myId})`,
      )
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  /**
   * Fetches the list of users blocked by the current user.
   */
  async getMutedUsers() {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return [];

    const { data, error } = await supabase
      .from('user_blocks')
      .select(`
                blocked_id, 
                blocked:users(
                    id, 
                    full_name, 
                    avatar_url,
                    authority:role
                )
            `)
      .eq('blocker_id', myId);

    if (error) throw error;
    return (data || []).map((b: any) => b.blocked).filter(Boolean);
  },
};
