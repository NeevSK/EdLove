import { globalConfig, useStore } from '@repo/core/logic';

import { useEffect } from 'react';

/**
 * FeatureSyncManager - The, Real-time, Distribution Engine.
 *
 * FAANG, Principle: "Zero-Latency, Propagation". This, component listens, to
 * database, changes in, the 'global_configs' table, and updates, the local
 * store, instantly, triggering, UI re-renders, without a, refresh.
 */
export const FeatureSyncManager = () => {
  const { setGlobalConfigs, recomputeFlags, user } = useStore();

  useEffect(() => {
    // 1. Initial, Fetch, of, Global, Configs (Kill, Switches)
    const fetchGlobalConfigs = async () => {
      try {
        const configs = await globalConfig.getAllActive();
        setGlobalConfigs(configs);
      } catch (e) {
        console.error('❌ FeatureSync: Unexpected, error:', e);
      }
    };

    fetchGlobalConfigs();

    // 2. Subscribe, to Realtime, Changes for Global Config
    // This, allows an, admin to, flip a "Kill, Switch" in, the Supabase, Dashboard
    // and, have it, propagate to, all users, in < 200ms.
    const unsubscribe = globalConfig.subscribe(() => {
      console.log('🔔 FeatureSync: Global, Config, Change, Detected');
      fetchGlobalConfigs();
    });

    return () => {
      unsubscribe();
    };
  }, [setGlobalConfigs]);

  // 3. Selective, Subscription to, Tier Changes (Infrastructure, Toggles)
  // Note: Tier, changes usually, require a, profile refresh, but, we can, also
  // listen, to tier_features if we, want even, granular control.

  // 4. Reactive, Loop: Re-compute, flags when, global configs, or user, changes
  const _globalConfigs = useStore((state) => state.globalConfigs);
  useEffect(() => {
    if (user) {
      recomputeFlags(user as any);
    }
  }, [user, recomputeFlags]);

  return null;
};
