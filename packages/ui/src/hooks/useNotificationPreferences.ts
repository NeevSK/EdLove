import { useStore } from '@repo/core/logic';
import { useEffect, useState, useCallback } from 'react';
import type { UserPreferences } from '@repo/core/logic';

/**
 * useNotificationPreferences
 * 
 * Sovereign hook for managing granular notification settings.
 * Handles fetching, local state updates, and persistence.
 */
export const useNotificationPreferences = () => {
  const profileManager = useStore((state) => state.profile);
  const userId = useStore((state) => state.session?.user?.id);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!userId || !profileManager) return;
    setLoading(true);
    try {
      const prefs = await profileManager.getUserPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('[useNotificationPreferences] Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, profileManager]);

  useEffect(() => {
    void fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = async (updates: Partial<UserPreferences>) => {
    if (!userId || !profileManager || !preferences) return;
    
    // Optimistic Update
    const previousPrefs = preferences;
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    
    setSaving(true);
    try {
      await profileManager.updateUserPreferences(userId, updates);
    } catch (error) {
      console.error('[useNotificationPreferences] Update failed:', error);
      setPreferences(previousPrefs); // Rollback
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = async (channel: 'push' | 'email' | 'in_app') => {
    if (!preferences?.notification_settings) return;
    
    const settings = { ...preferences.notification_settings };
    settings.channels = { 
      ...settings.channels, 
      [channel]: !settings.channels[channel] 
    };
    
    await updatePreference({ notification_settings: settings });
  };

  const toggleCategory = async (category: string, channel: 'push' | 'email') => {
    if (!preferences?.notification_settings) return;
    
    const settings = { ...preferences.notification_settings };
    const categorySettings = settings.categories[category] || { push: true, email: false };
    
    settings.categories = {
      ...settings.categories,
      [category]: {
        ...categorySettings,
        [channel]: !categorySettings[channel]
      }
    };
    
    await updatePreference({ notification_settings: settings });
  };

  return {
    preferences,
    loading,
    saving,
    toggleChannel,
    toggleCategory,
    refresh: fetchPreferences
  };
};
