/**
 * Loads the person's own settings that live on the phone, before the first screens settle:
 * reading (size, weight, spacing), comfort (control size, simpler look, hand), their companions, and any fonts downloaded before. Both apply without a restart.
 */

import { loadComfort } from '@repo/ui/context/ComfortPreferences';
import { loadCompanions } from '@repo/ui/context/Companions';
import { loadReading } from '@repo/ui/context/ReadingPreferences';
import { useEffect } from 'react';
import { restoreDownloadedFonts } from './fontDownloads';

export function PersonalPreferences() {
  useEffect(() => {
    void loadReading();
    void loadComfort();
    void loadCompanions();
    void restoreDownloadedFonts();
  }, []);
  return null;
}
