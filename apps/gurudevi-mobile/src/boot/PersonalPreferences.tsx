/**
 * Loads the person's own settings that live on the phone, before the first screens settle:
 * reading (size, weight, spacing), their companions, and any fonts downloaded before. Both apply without a restart.
 */

import { loadCompanions } from '@repo/ui/context/Companions';
import { loadReading } from '@repo/ui/context/ReadingPreferences';
import { useEffect } from 'react';
import { restoreDownloadedFonts } from './fontDownloads';

export function PersonalPreferences() {
  useEffect(() => {
    void loadReading();
    void loadCompanions();
    void restoreDownloadedFonts();
  }, []);
  return null;
}
