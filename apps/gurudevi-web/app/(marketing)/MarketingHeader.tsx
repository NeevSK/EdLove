'use client';

import { resolveSurfaceUrl } from '../../lib/surface-urls';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation, LANGUAGES } from '../../lib/i18n';

export function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { locale, setLocale, t } = useTranslation();

  const navItems = [
    { name: t('nav.ecology'), href: '/about' },
    { name: t('nav.workspaces'), href: '/#workspaces' },
    { name: t('nav.roadmap'), href: '/#roadmap' },
    { name: t('nav.journal'), href: '/journal' },
    { name: t('nav.faq'), href: '/faq' },
    { name: t('nav.support'), href: '/support' },
  ];

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <a
        className="sr-only absolute left-4 top-4 z-50 rounded bg-charcoal-truth px-4 py-3 font-ui-grotesque text-sm font-bold text-sacred-white focus:not-sr-only focus:outline-3 focus:outline-offset-4 focus:outline-teal-water"
        href="#main-content"
      >
        {t('nav.skipToContent')}
      </a>

      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Gurudevi home">
          <Image src="/gurudevi-mark.svg" alt="" width={28} height={28} priority />
          <span>{t('brand.name')}</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div aria-label={t('nav.chooseLanguage')} className="hidden items-center gap-1.5 font-sans text-xs sm:flex">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                className={`rounded px-1.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                  locale === lang.code
                    ? 'bg-charcoal-truth text-sacred-white dark:bg-sacred-white dark:text-charcoal-truth'
                    : 'text-ink-soft hover:text-ink'
                }`}
                aria-label={lang.label}
                aria-pressed={locale === lang.code}
              >
                {lang.shortLabel}
              </button>
            ))}
          </div>
          <a className="header-platform" href={resolveSurfaceUrl('explore', '/self')}>
            {t('nav.openPlatform')} <span aria-hidden="true">↗</span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Open navigation menu"
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-menu__top">
          <span className="eyebrow">{t('brand.name')}</span>
          <button
            id="menu-close"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('nav.close')}
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.name}
            </Link>
          ))}
          <a href={resolveSurfaceUrl('explore', '/self')} onClick={() => setIsMenuOpen(false)}>
            {t('nav.openPlatform')} ↗
          </a>
          <div
            className="mt-6 flex flex-wrap gap-4 border-t border-line pt-5 font-sans text-sm"
            aria-label={t('nav.chooseLanguage')}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLocale(lang.code);
                  setIsMenuOpen(false);
                }}
                className={`font-semibold cursor-pointer ${locale === lang.code ? 'underline underline-offset-4' : 'text-ink-soft'}`}
              >
                {lang.nativeLabel}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
