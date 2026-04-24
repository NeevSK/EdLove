import { supabase } from '../native/supabase';

/**
 * API for tracking feature usage and exploration to drive gamification.
 */
export const trackingAPI = {
  /**
   * Logs feature usage. If it's the first time, it records the entry.
   */
  async logFeatureUsage(
    userId: string,
    featureName: string,
    interactionType: string = 'exploration',
  ) {
    // Find if already logged
    const { data: existing } = await supabase
      .from('feature_usage_log')
      .select('id')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('feature_usage_log')
      .insert([
        {
          user_id: userId,
          feature_name: featureName,
          interaction_type: interactionType,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error logging feature usage:', error);
      throw error;
    }
    return data;
  },

  /**
   * Fetches all unique features explored by the user.
   */
  async getExploredFeatures(userId: string) {
    const { data, error } = await supabase
      .from('feature_usage_log')
      .select('feature_name')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching explored features:', error);
      throw error;
    }
    return data.map((item) => item.feature_name);
  },
};
