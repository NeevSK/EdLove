'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import {
  accountNavigation,
  advancedTools,
  isSanctuaryNavActive,
  primaryNavigation,
  type SanctuaryNavItem,
  withSanctuaryRoutePrefix,
} from '../sanctuary-nav';
import styles from '../sanctuary-shell.module.css';
import { AccountSignOut } from './AccountSignOut';

type SanctuaryShellProps = Readonly<{
  children: ReactNode;
  displayName: string;
  navigationPrefix: string;
  unreadNotifications?: number;
}>;

const showAdvancedTools = process.env.NODE_ENV !== 'production';

export function SanctuaryShell({
  children,
  displayName,
  navigationPrefix,
  unreadNotifications = 0,
}: SanctuaryShellProps) {
  const pathname = usePathname();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const advancedTriggerRef = useRef<HTMLButtonElement>(null);
  const accountMenuId = useId();
  const advancedMenuId = useId();
  const primaryItems = withSanctuaryRoutePrefix(primaryNavigation, navigationPrefix);
  const accountItems = withSanctuaryRoutePrefix(accountNavigation, navigationPrefix);
  const title =
    [...primaryItems, ...accountItems].find((item) => isSanctuaryNavActive(pathname, item.href))
      ?.label ?? 'Sanctuary';
  const profile = accountItems[0];
  const notifications = accountItems[1];
  const settings = accountItems[2];

  if (!profile || !notifications || !settings) {
    throw new Error('Sanctuary account navigation is incomplete.');
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      if (accountMenuOpen) {
        setAccountMenuOpen(false);
        accountTriggerRef.current?.focus();
      }
      if (advancedOpen) {
        setAdvancedOpen(false);
        advancedTriggerRef.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [accountMenuOpen, advancedOpen]);

  const initial = displayName.trim().charAt(0).toUpperCase() || 'G';

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#sanctuary-main">
        Skip to content
      </a>
      <header className={styles.header}>
        <Link
          aria-label="Gurudevi Sanctuary"
          className={styles.wordmark}
          href={`${navigationPrefix}/self`}
        >
          Gurudevi <span>Sanctuary</span>
        </Link>
        <p className={styles.pageTitle} aria-live="polite">
          {title}
        </p>
        <div className={styles.accountIsland} aria-label="Account navigation">
          <AccountLink item={notifications} pathname={pathname} unreadCount={unreadNotifications} />
          <AccountLink item={settings} pathname={pathname} />
          <Link
            aria-current={isSanctuaryNavActive(pathname, profile.href) ? 'page' : undefined}
            aria-label={`Profile: ${displayName}`}
            className={styles.avatarLink}
            href={profile.href}
            title={profile.label}
          >
            {initial}
          </Link>
          <button
            ref={accountTriggerRef}
            aria-controls={accountMenuId}
            aria-expanded={accountMenuOpen}
            className={styles.accountMenuTrigger}
            onClick={() => setAccountMenuOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true">☰</span>
            <span className={styles.srOnly}>Open account menu</span>
          </button>
          {accountMenuOpen ? (
            <nav aria-label="Account menu" className={styles.accountMenu} id={accountMenuId}>
              {accountItems.map((item) => (
                <Link
                  aria-current={isSanctuaryNavActive(pathname, item.href) ? 'page' : undefined}
                  className={styles.accountMenuItem}
                  href={item.href}
                  key={item.id}
                  onClick={() => setAccountMenuOpen(false)}
                >
                  <span aria-hidden="true">{item.symbol}</span>
                  {item.label}
                </Link>
              ))}
              {!navigationPrefix ? <AccountSignOut /> : null}
            </nav>
          ) : null}
        </div>
      </header>
      <div className={styles.body}>
        <aside className={styles.rail} aria-label="Primary navigation">
          <nav>
            <ul className={styles.navList}>
              {primaryItems.map((item) => (
                <li key={item.id}>
                  <NavLink item={item} pathname={pathname} />
                </li>
              ))}
            </ul>
          </nav>
          {showAdvancedTools ? (
            <div className={styles.advanced}>
              <button
                ref={advancedTriggerRef}
                aria-controls={advancedMenuId}
                aria-expanded={advancedOpen}
                className={styles.advancedTrigger}
                onClick={() => setAdvancedOpen((open) => !open)}
                type="button"
              >
                Advanced <span aria-hidden="true">{advancedOpen ? '−' : '+'}</span>
              </button>
              {advancedOpen ? (
                <div className={styles.advancedPanel} id={advancedMenuId}>
                  <p>Development tools</p>
                  <ul>
                    {advancedTools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
        <main className={styles.main} id="sanctuary-main" tabIndex={-1}>
          <div className={styles.canvasFrame}>{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavLink({ item, pathname }: Readonly<{ item: SanctuaryNavItem; pathname: string }>) {
  const active = isSanctuaryNavActive(pathname, item.href);
  return (
    <Link aria-current={active ? 'page' : undefined} className={styles.navLink} href={item.href}>
      <span aria-hidden="true" className={styles.navSymbol}>
        {item.symbol}
      </span>
      <span className={styles.navLabel}>{item.label}</span>
    </Link>
  );
}

function AccountLink({
  item,
  pathname,
  unreadCount,
}: Readonly<{ item: SanctuaryNavItem; pathname: string; unreadCount?: number }>) {
  const safeUnreadCount = unreadCount ?? 0;
  const hasUnread = item.id === 'notifications' && safeUnreadCount > 0;
  const unreadLabel = hasUnread ? `, ${safeUnreadCount > 99 ? '99+' : safeUnreadCount} unread` : '';
  return (
    <Link
      aria-current={isSanctuaryNavActive(pathname, item.href) ? 'page' : undefined}
      aria-label={`${item.label}${unreadLabel}`}
      className={styles.accountLink}
      href={item.href}
      title={item.label}
    >
      <span aria-hidden="true">{item.symbol}</span>
      {hasUnread ? (
        <span aria-hidden="true" className={styles.notificationBadge}>
          {safeUnreadCount > 99 ? '99+' : safeUnreadCount}
        </span>
      ) : null}
    </Link>
  );
}
