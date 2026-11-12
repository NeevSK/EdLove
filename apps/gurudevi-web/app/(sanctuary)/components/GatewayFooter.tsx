'use client';

import Link from 'next/link';
import { EDLOVE_URL } from '@repo/core/site';
import { EXTERNAL_LINK_PROPS, resolveSurfaceUrl } from '../../../lib/surface-urls';
import { SriLankaFlag } from '../../components/SriLankaFlag';
import { useTranslation } from '../../../lib/i18n';

/**
 * GatewayFooter — Spacious, elegant, perfectly centered footer across Gurudevi Web gateway & auth flows.
 *
 * Modernized 2026 architecture:
 * - Next.js 16 Link primitives with automatic client-side prefetching
 * - Balanced flex layout with generous horizontal and vertical breathing room (no left-heavy clumps)
 * - Semantic navigation links with smooth saffron transitions
 * - Official precision Sri Lanka vector flag (1:2 aspect ratio)
 * - Seamless light/dark sovereign theme token integration
 */
export function GatewayFooter() {
  const currentYear = 2026;
  const { t } = useTranslation();

  const legalLinks = [
    { label: t('gateway.footer.privacy'), href: resolveSurfaceUrl('public', '/privacy') },
    { label: t('gateway.footer.terms'), href: resolveSurfaceUrl('public', '/terms') },
    { label: t('gateway.footer.guidelines'), href: resolveSurfaceUrl('public', '/guidelines') },
    { label: t('gateway.footer.accountData'), href: resolveSurfaceUrl('public', '/delete-account') },
    { label: t('gateway.footer.status'), href: resolveSurfaceUrl('public', '/status') },
  ];

  return (
    <footer
      className="w-full max-w-4xl mx-auto px-6 py-10 md:py-12 border-t border-[var(--line)] flex flex-col items-center justify-center gap-5 text-xs text-[var(--ink-soft)] relative z-10 box-border text-center"
      role="contentinfo"
    >
      {/* Spacious, balanced, perfectly centered legal navigation */}
      <nav
        aria-label="Legal and guidelines"
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12.5px] font-medium tracking-wide text-center"
      >
        {legalLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[var(--ink-soft)] hover:text-[var(--color-sanctuary-saffron)] transition-colors duration-150 underline-offset-4 hover:underline py-0.5 whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Spacious, balanced colophon bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[12px] text-[var(--ink-soft)] opacity-85 text-center leading-relaxed font-normal">
        <span className="whitespace-nowrap">
          © {currentYear} {t('brand.name')}
        </span>
        <span className="hidden sm:inline opacity-30 select-none" aria-hidden="true">
          ·
        </span>
        <span className="whitespace-nowrap">
          {t('gateway.footer.partOf')}{' '}
          <a
            href={EDLOVE_URL}
            {...EXTERNAL_LINK_PROPS}
            className="font-semibold text-[var(--ink)] underline underline-offset-4 hover:text-[var(--color-sanctuary-saffron)] transition-colors duration-150"
          >
            {t('gateway.footer.edloveFoundation')}
          </a>
        </span>
        <span className="hidden sm:inline opacity-30 select-none" aria-hidden="true">
          ·
        </span>
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <span>{t('gateway.footer.madeWithLove')}</span>
          <SriLankaFlag width={22} height={11} className="shadow-xs" />
        </span>
      </div>
    </footer>
  );
}
