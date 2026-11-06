'use client';

import { ThemeSwitcher, type ThemeSwitcherProps } from '@repo/ui/components/web';
import { WORLD_IDS, WORLDS, type WorldId } from '@repo/ui/theme';
import { useTranslation } from '../../../lib/i18n';
import { type LuminanceMode, useWorldTheme } from '../../../lib/theme/useWorldTheme';

export type { LuminanceMode };

export interface DiurnalThemeToggleProps {
  /**
   * When true, renders compact/icon gear (ideal for dense headers).
   * When false (default), renders responsive 'auto' or 'pill' gear.
   */
  readonly headerIcon?: boolean;
}

export function DiurnalThemeToggle({ headerIcon = false }: Readonly<DiurnalThemeToggleProps>) {
  const { world, mode, resolvedMode, setWorld, setMode } = useWorldTheme();
  const { locale } = useTranslation();
  const activeLang = (locale === 'si' || locale === 'ta' ? locale : 'en') as 'en' | 'si' | 'ta';

  return (
    <ThemeSwitcher
      world={world}
      onWorldChange={setWorld}
      mode={mode}
      onModeChange={setMode}
      resolvedMode={resolvedMode}
      variant={headerIcon ? 'icon' : 'auto'}
      lang={activeLang}
    />
  );
}
