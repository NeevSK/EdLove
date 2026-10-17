import { GURUDEVI_EXPLORE_URL } from '@repo/core/config/publicUrls';
import Image from 'next/image';
import Link from 'next/link';
import { SOCIAL_LINKS, WEB_LINKS } from '../../lib/site';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <div className="brand brand--footer">
            <Image src="/gurudevi-mark.svg" alt="" width={28} height={28} />
            <span>Gurudevi</span>
          </div>
          <p>Technology that gives energy back to education.</p>
        </div>
        <div>
          <p className="eyebrow footer-label">Explore</p>
          <div className="footer-links">
            <Link href="/about">The ecology</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/support">Support</Link>
            <Link href="/thuthimal">Thuthimal</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow footer-label">Elsewhere</p>
          <div className="footer-links">
            <a href={`${GURUDEVI_EXPLORE_URL}/self`}>Open platform ↗</a>
            <a href={WEB_LINKS.edlove} target="_blank" rel="noopener noreferrer">
              EdLove ↗
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {currentYear} Gurudevi · Part of EdLove</span>
        <span>
          <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> ·{' '}
          <Link href="/delete-account">Delete account</Link>
        </span>
      </div>
    </footer>
  );
}
