import { LivingGround } from '@repo/ui/components/web';
import { createFileRoute, Link } from '@tanstack/react-router';
import { GatewayFooter } from '../../../app/(sanctuary)/components/GatewayFooter';
import { GatewayHeader } from '../../../app/(sanctuary)/components/GatewayHeader';
import { OnboardingForm } from '../../../app/(sanctuary)/onboarding/OnboardingForm';
import styles from '../../../app/(sanctuary)/onboarding/onboarding.module.css';

export const Route = createFileRoute('/_account/onboarding')({
  head: () => ({ meta: [{ title: 'Meet Tutii | Gurudevi Sanctuary' }] }),
  component: OnboardingScreen,
});

function OnboardingScreen() {
  return (
    <LivingGround atmosphere="canopy" dither className={styles.page}>
      <GatewayHeader
        extraActions={
          <Link className={styles.backLink} to="/welcome">
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
