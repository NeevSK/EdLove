import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './auth.module.css';
import { DiurnalThemeToggle } from '../components/DiurnalThemeToggle';

export function AuthFrame({
  children,
  title,
  description,
  showOnboardingLink = true,
}: Readonly<{
  children: ReactNode;
  title: string;
  description: string;
  showOnboardingLink?: boolean;
}>) {
  return (
    <div className={styles.viewport}>
      <div className={styles.datumMatrix} aria-hidden="true" />
      <div className={styles.ambientOrb1} aria-hidden="true" />
      <div className={styles.ambientOrb2} aria-hidden="true" />

      <header className={styles.header}>
        <Link className={styles.brandLink} href="/welcome">
          <div className={styles.brandMark} aria-hidden="true">
            🪷
          </div>
          <div>
            <span className={styles.brandText}>Gurudevi</span>
          </div>
        </Link>
        <div className={styles.headerActions}>
          <DiurnalThemeToggle />
          <Link className={styles.backLink} href="/welcome">
            <span aria-hidden="true">←</span>
            <span>Welcome Gate</span>
          </Link>
        </div>
      </header>

      <main className={styles.stage} id="main-content">
        <div className={styles.authGrid}>
          <section className={styles.heroPanel} aria-labelledby="auth-hero-title">
            <div>
              <div className={styles.heroBadge}>
                <span className={styles.statusDot} />
                <span className={styles.heroBadgeText}>Gurudevi Sanctuary</span>
              </div>

              <h1 className={styles.heroTitle} id="auth-hero-title">
                {title}
              </h1>

              <p className={styles.heroDesc}>{description}</p>
            </div>

            <div className={styles.tutiiGuideContainer}>
              <div className={styles.tutiiHalo} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
                  alt="Tutii the Firefly Guide holding a gentle lantern"
                  className={styles.tutiiImg}
                />
              </div>
              <p className={styles.tutiiQuote}>
                “A quiet place to teach, learn, and reflect. Everything is held safely on your device.”
              </p>
            </div>

            {showOnboardingLink ? (
              <div className={styles.onboardingBanner}>
                <span>Setting up a school or choosing your role?</span>
                <Link className={styles.onboardingLink} href="/onboarding">
                  Go to Onboarding →
                </Link>
              </div>
            ) : null}
          </section>

          <section className={styles.formPanel} aria-label="Authentication Form">
            {children}
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/privacy">Privacy Policy</Link>
          <span className={styles.metaDivider}>•</span>
          <Link href="/terms">Terms of Use</Link>
          <span className={styles.metaDivider}>•</span>
          <Link href="/guidelines">Community Guidelines</Link>
        </div>
        <div className={styles.colophon}>
          Part of the EdLove Constellation · Made with 💖 in Sri Lanka
        </div>
      </footer>
    </div>
  );
}
