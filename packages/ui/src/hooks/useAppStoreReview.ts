import { storage } from '@repo/core/logic';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export interface StoreReviewOptions {
  /** Minimum number of times this action must occur before prompting */
  minActions?: number;
  /** Probability threshold (0.0 to 1.0) to randomize the prompt */
  probability?: number;
  /** Cooldown in days before requesting again */
  cooldownDays?: number;
}

/**
 * Reusable hook to request an App Store rating/review under controlled conditions.
 * Uses persistent storage to track action counts, cooldowns, and avoid over-prompting.
 */
export function useAppStoreReview() {
  const triggerReview = useCallback(async (actionKey: string, options?: StoreReviewOptions) => {
    if (Platform.OS === 'web') return;

    const minActions = options?.minActions ?? 3;
    const probability = options?.probability ?? 1.0;
    const cooldownDays = options?.cooldownDays ?? 30;

    const actionCountKey = `store_review_action_count_${actionKey}`;
    const lastPromptKey = 'store_review_last_prompt_time';

    try {
      // 1. Increment and update action count
      const currentCount = storage.getNumber(actionCountKey) ?? 0;
      const nextCount = currentCount + 1;
      storage.set(actionCountKey, nextCount);

      // 2. Check if action threshold is met
      if (nextCount < minActions) {
        return;
      }

      // 3. Check rate-limit/cooldown constraints
      const lastPromptTimeStr = storage.getString(lastPromptKey);
      const now = Date.now();
      if (lastPromptTimeStr) {
        const lastPromptTime = parseInt(lastPromptTimeStr, 10);
        const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
        if (now - lastPromptTime < cooldownMs) {
          return;
        }
      }

      // 4. Random probability check
      if (Math.random() > probability) {
        return;
      }

      // 5. Require and trigger expo-store-review dynamically
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const StoreReview = require('expo-store-review');
      const hasAction = await StoreReview.hasAction();
      if (hasAction) {
        await StoreReview.requestReview();
        // Update last prompt time and reset action count
        storage.set(lastPromptKey, now.toString());
        storage.set(actionCountKey, 0);
      }
    } catch (err) {
      console.warn('[useAppStoreReview] Failed to request store review:', err);
    }
  }, []);

  return { triggerReview };
}
