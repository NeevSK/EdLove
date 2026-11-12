'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EDLOVE_URL, FOUNDER_URL, INTUITUI_URL, SOCIAL_LINKS } from '@repo/core/site';
import { EXTERNAL_LINK_PROPS, resolveSurfaceUrl } from '../../lib/surface-urls';
import { useTranslation, LANGUAGES } from '../../lib/i18n';
import { SriLankaFlag } from '../components/SriLankaFlag';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();
  const { locale, setLocale, t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <div className="brand brand--footer">
            <Image src="/gurudevi-mark.svg" alt="" width={28} height={28} />
            <span>Gurudevi</span>
          </div>
          <p>
            An education ecology support system and sanctuary for education in Sri Lanka,
            connecting teachers, students, schools, and families.
          </p>
          <small className="site-footer__brand-note">
            Rooted in pedagogical care, local-first trust, and sovereign privacy.
          </small>
        </div>

        <div>
          <p className="eyebrow footer-label">Ecology</p>
          <div className="footer-links">
            <Link href="/about">The Living Ecology</Link>
            <Link href="/journal">Journal &amp; Updates</Link>
            <Link href="/thuthimal">Thuthimal Heritage</Link>
            <Link href="/faq">Questions &amp; Clarity</Link>
            <Link href="/support">Support Desk</Link>
          </div>
        </div>

        <div>
          <p className="eyebrow footer-label">Sanctuary</p>
          <div className="footer-links">
            <a href={resolveSurfaceUrl('explore', '/self')}>Open Platform ↗</a>
            <a href={resolveSurfaceUrl('sanctuary', '/sign-in')}>Educator Sign In ↗</a>
            <a href={resolveSurfaceUrl('sanctuary', '/welcome')}>School Gateway ↗</a>
          </div>
        </div>

        <div>
          <p className="eyebrow footer-label">Foundation &amp; Ecosystem</p>
          <div className="footer-links">
            <a href={EDLOVE_URL} {...EXTERNAL_LINK_PROPS}>
              EdLove Foundation ↗
            </a>
            <a href={INTUITUI_URL} {...EXTERNAL_LINK_PROPS}>
              Intuitui Labs ↗
            </a>
            <a href={FOUNDER_URL} {...EXTERNAL_LINK_PROPS}>
              Neev / Research ↗
            </a>
            <a href={SOCIAL_LINKS.linkedin} {...EXTERNAL_LINK_PROPS}>
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__upper-bar">
          <nav className="site-footer__legal" aria-label="Legal and compliance">
            <Link href="/status">Status</Link>
            <span className="site-footer__colophon-divider" aria-hidden="true">·</span>
            <Link href="/guidelines">Community Guidelines</Link>
            <span className="site-footer__colophon-divider" aria-hidden="true">·</span>
            <Link href="/privacy">Privacy Policy</Link>
            <span className="site-footer__colophon-divider" aria-hidden="true">·</span>
            <Link href="/terms">Terms of Service</Link>
            <span className="site-footer__colophon-divider" aria-hidden="true">·</span>
            <Link href="/delete-account">Account &amp; Data</Link>
          </nav>

          <div className="site-footer__languages" aria-label="Language selection">
            {LANGUAGES.map((lang, idx) => (
              <span key={lang.code}>
                {idx > 0 && ' · '}
                <button
                  type="button"
                  onClick={() => setLocale(lang.code)}
                  className={`cursor-pointer hover:underline ${locale === lang.code ? 'font-bold underline' : ''}`}
                  lang={lang.code}
                >
                  {lang.nativeLabel}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="site-footer__bottomline">
          <span>© {currentYear} Gurudevi</span>
          <span className="site-footer__colophon-divider" aria-hidden="true">·</span>
          <span>
            Part of the{' '}
            <a
              href={EDLOVE_URL}
              {...EXTERNAL_LINK_PROPS}
              className="site-footer__edlove-link"
            >
              EdLove Foundation
            </a>
          </span>
          <span className="site-footer__colophon-divider" aria-hidden="true">·</span>
          <span className="site-footer__made-with">
            Made with ❤️ in <SriLankaFlag />
          </span>
        </div>
      </div>
    </footer>
  );
}
