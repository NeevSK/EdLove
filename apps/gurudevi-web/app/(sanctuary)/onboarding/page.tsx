import type { Metadata } from 'next';
import Link from 'next/link';
import { LivingGround } from '@repo/ui/components/web';
import { GatewayFooter } from '../components/GatewayFooter';
import { GatewayHeader } from '../components/GatewayHeader';
import { OnboardingForm } from './OnboardingForm';
import styles from './onboarding.module.css';

export const metadata: Metadata = {
  title: 'Meet Tutii | Gurudevi Sanctuary',
  description: 'A warm, guided introduction to your Gurudevi Sanctuary.',
};

export default function OnboardingPage() {
  return (
    <LivingGround atmosphere="canopy" dither className={styles.page}>
      <GatewayHeader
        extraActions={
          <Link className={styles.backLink} href="/welcome">
            Back to welcome
          </Link>
        }
      />

      <main className={styles.main} id="main-content">
        <section className={styles.content} aria-label="Your introduction">
          <OnboardingForm />
        </section>
      </main>

      <GatewayFooter />
    </LivingGround>
  );
}
