import type { Metadata } from 'next';
import Link from 'next/link';
import { DiurnalThemeToggle } from '../components/DiurnalThemeToggle';
import { OnboardingForm } from './OnboardingForm';
import styles from './onboarding.module.css';

export const metadata: Metadata = {
  title: 'Meet Tutii | Gurudevi Sanctuary',
  description: 'A warm, guided introduction to your Gurudevi Sanctuary.',
};

export default function OnboardingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/welcome" aria-label="Gurudevi welcome">
          <span className={styles.brandMark} aria-hidden="true">🪷</span>
          <span>Gurudevi</span>
        </Link>
        <div className={styles.headerActions}>
          <DiurnalThemeToggle />
          <Link className={styles.backLink} href="/welcome">Back to welcome</Link>
        </div>
      </header>

      <main className={styles.main} id="main-content">
        <section className={styles.content} aria-label="Your introduction">
          <OnboardingForm />
        </section>
      </main>

      <footer className={styles.footer}>
        <nav className={styles.footerLinks} aria-label="Legal">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <Link href="/guidelines">Community Guidelines</Link>
        </nav>
        <p>Part of the EdLove Constellation · Made with care in Sri Lanka</p>
      </footer>
    </div>
  );
}
