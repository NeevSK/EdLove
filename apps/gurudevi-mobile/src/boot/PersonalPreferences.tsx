/**
 * Loads the person's own settings that live on the phone, before the first screens settle:
 * reading (size, weight, spacing) and comfort (control size, simpler look, hand), kept per account
 * so a shared phone follows whoever is signed in; their companions, and any fonts downloaded
 * before. All apply without a restart.
 */

import { loadComfort } from '@repo/ui/context/ComfortPreferences';
import { loadCompanions } from '@repo/ui/context/Companions';
import { loadReading } from '@repo/ui/context/ReadingPreferences';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useEffect } from 'react';
import { restoreDownloadedFonts } from './fontDownloads';

export function PersonalPreferences() {
  useEffect(() => {
    void loadCompanions();
    void restoreDownloadedFonts();
  }, []);
  // Reading and comfort belong to the person, not the phone: a shared phone switches with them.
  const account = useAuthStore((s) => s.user?.id ?? null);
  useEffect(() => {
    void loadReading(account);
    void loadComfort(account);
  }, [account]);
  return null;
}
