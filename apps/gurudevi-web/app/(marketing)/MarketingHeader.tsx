'use client';

import { GURUDEVI_EXPLORE_URL } from '@repo/core/config/publicUrls';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const navItems = [
  { name: 'The Ecology', href: '/about' },
  { name: 'Workspaces', href: '/#workspaces' },
  { name: 'Roadmap', href: '/#roadmap' },
  { name: 'Journal', href: '/journal' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Support', href: '/support' },
];

export function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        Skip to content
      </a>

      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Gurudevi home">
          <Image src="/gurudevi-mark.svg" alt="" width={28} height={28} priority />
          <span>Gurudevi</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.name}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <nav aria-label="Choose language" className="hidden gap-2 font-sans text-xs sm:flex">
            <Link href="/" aria-label="English">
              EN
            </Link>
            <Link href="/si" lang="si" aria-label="සිංහල">
              සි
            </Link>
            <Link href="/ta" lang="ta" aria-label="தமிழ்">
              த
            </Link>
          </nav>
          <a className="header-platform" href={`${GURUDEVI_EXPLORE_URL}/self`}>
            Open platform <span aria-hidden="true">↗</span>
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
          <span className="eyebrow">Gurudevi</span>
          <button
            id="menu-close"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
          >
            Close
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.name} onClick={() => setIsMenuOpen(false)}>
              {item.name}
            </Link>
          ))}
          <a href={`${GURUDEVI_EXPLORE_URL}/self`} onClick={() => setIsMenuOpen(false)}>
            Open platform ↗
          </a>
          <div
            className="mt-6 flex gap-5 border-t border-line pt-5 font-sans text-sm"
            aria-label="Choose language"
          >
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              English
            </Link>
            <Link href="/si" lang="si" onClick={() => setIsMenuOpen(false)}>
              සිංහල
            </Link>
            <Link href="/ta" lang="ta" onClick={() => setIsMenuOpen(false)}>
              தமிழ்
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
