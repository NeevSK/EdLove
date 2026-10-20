'use client';

import Image from 'next/image';
import styles from './tutii-greeting.module.css';

type TutiiGreetingProps = Readonly<{
  context: 'explore' | 'sanctuary';
  actionLabel: string;
  onContinue: () => void;
  autoFocus?: boolean;
}>;

export function TutiiGreeting({ context, actionLabel, onContinue, autoFocus = false }: TutiiGreetingProps) {
  const introduction =
    context === 'explore'
      ? 'I’m your guide around Explore, a sample of the learning and community spaces in Gurudevi.'
      : 'I’ll help you find your way around. First, let’s make this place feel like yours.';

  return (
    <section className={styles.greeting} aria-labelledby="tutii-greeting-title">
      <div className={styles.portrait}>
        <Image
          src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
          alt="Tutii looks toward you with a welcoming expression."
          width={360}
          height={360}
          priority
        />
      </div>
      <div className={styles.voice}>
        <h1 className={styles.title} id="tutii-greeting-title">
          <span className={styles.greetingLine}>Hello.</span>
          <span className={styles.greetingLine}>I’m Tutii.</span>
        </h1>
        <p className={styles.introduction}>{introduction}</p>
        <button autoFocus={autoFocus} className={styles.action} onClick={onContinue} type="button">
          {actionLabel} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
