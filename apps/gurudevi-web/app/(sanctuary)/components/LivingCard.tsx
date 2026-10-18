'use client';

import React from 'react';
import styles from './living-card.module.css';

export interface LivingCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: 'div' | 'article' | 'section' | 'li';
  variant?: 'vellum' | 'glass' | 'ember' | 'lotus';
  elevation?: 'flat' | 'raised' | 'floating';
  withGrain?: boolean;
}

export const LivingCard = React.forwardRef<HTMLElement, LivingCardProps>(function LivingCard(
  {
    children,
    as: Component = 'div',
    className = '',
    variant = 'vellum',
    elevation = 'floating',
    withGrain = true,
    style,
    ...props
  },
  ref,
) {
  const variantClass = styles[variant] ?? styles.vellum;
  const elevationClass = elevation === 'floating' ? styles.floating : '';

  return (
    <Component
      ref={ref as any}
      className={`${styles.card} ${variantClass} ${elevationClass} ${className}`}
      style={style}
      {...props}
    >
      {withGrain && <div className={styles.grainOverlay} aria-hidden="true" />}
      <div className={styles.content}>{children}</div>
    </Component>
  );
});
