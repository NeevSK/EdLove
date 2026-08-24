import { profile, type UserPreferences, useStore } from '@repo/core/logic';
import { useCallback, useEffect, useState } from 'react';

export const useNotificationPreferences = () => {
  const userId = useStore((state) => state.user?.id);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const prefs = await profile.getUserPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('[useNotificationPreferences] Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = async (updates: Partial<UserPreferences>) => {
    if (!userId || !preferences) return;

    // Optimistic Update
    const previousPrefs = preferences;
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    setSaving(true);
    try {
      await profile.updateUserPreferences(userId, updates);
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
      [channel]: !settings.channels[channel],
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
        [channel]: !categorySettings[channel],
      },
    };

    await updatePreference({ notification_settings: settings });
  };

  return {
    preferences,
    loading,
    saving,
    toggleChannel,
    toggleCategory,
    refresh: fetchPreferences,
  };
};
