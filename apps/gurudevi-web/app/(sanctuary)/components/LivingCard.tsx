'use client';

import React from 'react';
import styles from './living-card.module.css';

export interface LivingCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: 'div' | 'article' | 'section' | 'li';
  variant?: 'vellum' | 'glass' | 'ember' | 'lotus';
  elevation?: 'flat' | 'raised' | 'floating';
  tone?: 'plain' | 'raised' | 'inset';
  withGrain?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export function LivingCard({
  children,
  as: Component = 'div',
  className = '',
  variant = 'vellum',
  elevation = 'floating',
  tone = 'raised',
  withGrain = true,
  style,
  ref,
  ...props
}: Readonly<LivingCardProps>) {
  const variantClass = styles[variant] ?? styles.vellum;
  const elevationClass = elevation === 'floating' ? styles.floating : '';

  return (
    <Component
      ref={ref as any}
      className={`${styles.card} ${variantClass} ${elevationClass} ${className}`}
      data-tone={tone}
      style={style}
      {...props}
    >
      {withGrain && <div className={styles.grainOverlay} aria-hidden="true" />}
      <div className={styles.content}>{children}</div>
    </Component>
  );
}
