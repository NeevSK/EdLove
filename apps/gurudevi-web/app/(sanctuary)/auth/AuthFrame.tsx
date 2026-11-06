'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LivingGround } from '@repo/ui/components/web';
import { GatewayFooter } from '../components/GatewayFooter';
import { GatewayHeader } from '../components/GatewayHeader';
import styles from './auth.module.css';

export function AuthFrame({
  children,
  title,
  description,
}: Readonly<{
  children: ReactNode;
  title: string;
  description: string;
  showOnboardingLink?: boolean;
}>) {
  return (
    <LivingGround atmosphere="canopy" dither className={styles.viewport}>
      <div className={styles.ambientOrb1} aria-hidden="true" />
      <div className={styles.ambientOrb2} aria-hidden="true" />

      <GatewayHeader
        extraActions={
          <Link className={styles.backLink} href="/welcome">
            <span>Guest House</span>
            <span aria-hidden="true">→</span>
          </Link>
        }
      />

      <main className={styles.stage} id="main-content">
        <div className={styles.authGrid}>
          <section className={styles.heroPanel} aria-label="Welcome from Tutii">
            <div className={styles.tutiiGuideContainer}>
              <div className={styles.tutiiHalo} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
                  alt="Tutii the Firefly Guide holding a gentle lantern"
                  className={styles.tutiiImg}
                />
              </div>
              <p className={styles.unboxedLede}>A calm space to teach, learn, and wander freely.</p>
            </div>
          </section>

          <section className={styles.formPanel} aria-label="Authentication Form">
            {children}
          </section>
        </div>
      </main>

      <GatewayFooter />
    </LivingGround>
  );
}
