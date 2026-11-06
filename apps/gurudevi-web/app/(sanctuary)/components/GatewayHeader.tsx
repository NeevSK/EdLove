'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LanguagePicker } from '@repo/ui/components/web';
import { DiurnalThemeToggle } from './DiurnalThemeToggle';
import { useTranslation } from '../../../lib/i18n';

/**
 * GatewayHeader — Canonical, spacious, elegant header across Gurudevi Web gateway & auth flows.
 *
 * Modernized 2026 architecture:
 * - Pairs symmetrically with `GatewayFooter` for cohesive public and onboarding journeys
 * - Default out-of-the-box language selection (`LanguagePicker` auto-variant) and diurnal world theming (`DiurnalThemeToggle`)
 * - Responsive flex layout with consistent gaps and z-index containment
 * - Configurable `homeHref`, `extraActions` (e.g., contextual return links), and full `actions` override
 */
export type GatewayHeaderProps = Readonly<{
  /** Destination for the brand logo. Defaults to '/welcome'. */
  homeHref?: string;
  /** Whether to show the LanguagePicker capsule/dropdown. Defaults to true. */
  showLanguage?: boolean;
  /** Whether to show the DiurnalThemeToggle pill. Defaults to true. */
  showTheme?: boolean;
  /** Contextual actions placed alongside language and theme controls (e.g. back links). */
  extraActions?: ReactNode;
  /** Full override for action slot. When provided, replaces default language & theme controls. */
  actions?: ReactNode;
}>;

export function GatewayHeader({
  homeHref = '/welcome',
  showLanguage = true,
  showTheme = true,
  extraActions,
  actions,
}: GatewayHeaderProps) {
  const { locale, setLocale, t } = useTranslation();

  const renderedActions = actions ?? (
    <>
      {showLanguage && (
        <LanguagePicker
          value={locale as 'en' | 'si' | 'ta'}
          onChange={(next) => setLocale(next)}
          variant="auto"
        />
      )}
      {showTheme && <DiurnalThemeToggle />}
      {extraActions}
    </>
  );

  return (
    <header
      className="w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-between relative z-20"
      role="banner"
    >
      <Link
        className="flex items-center gap-2.5 group no-underline text-[var(--ink)] rounded-full focus-visible:outline-2 focus-visible:outline-[var(--w-focus,var(--color-sanctuary-saffron))] focus-visible:outline-offset-2 transition-transform duration-150"
        href={homeHref}
        aria-label={`${t('brand.name')} welcome`}
      >
        <div className="w-8 h-8 rounded-full bg-[var(--paper-light)] border border-[var(--line)] flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105 shadow-xs">
          <Image
            src="/gurudevi-mark.svg"
            alt=""
            width={20}
            height={20}
            priority
            className="w-5 h-5 object-contain"
          />
        </div>
        <span className="font-semibold text-base tracking-tight text-[var(--ink)] group-hover:text-[var(--color-sanctuary-saffron)] transition-colors duration-150">
          {t('brand.name')}
        </span>
      </Link>
      <div className="flex items-center gap-3">{renderedActions}</div>
    </header>
  );
}
