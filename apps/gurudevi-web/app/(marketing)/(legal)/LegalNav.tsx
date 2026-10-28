'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../../../lib/i18n';

export function LegalNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const legalTabs = [
    { href: '/privacy', label: t('gateway.footer.privacy') || t('nav.privacy') || 'Privacy Policy' },
    { href: '/terms', label: t('gateway.footer.terms') || t('nav.terms') || 'Terms of Use' },
    { href: '/guidelines', label: t('gateway.footer.guidelines') || t('nav.guidelines') || 'Community Guidelines' },
    { href: '/delete-account', label: t('nav.deleteAccount') || 'Delete Account' },
  ];

  return (
    <nav className="legal-nav" aria-label="Legal and trust policies">
      <div className="legal-nav__inner">
        {legalTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`legal-nav__link ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
