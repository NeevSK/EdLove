'use client';

import type { CSSProperties, ReactNode } from 'react';

export interface BackButtonProps {
  readonly fallbackHref?: string;
  readonly label?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
}

export function BackButton({
  fallbackHref = '/welcome',
  label = '← Go Back',
  style,
  children,
}: BackButtonProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else if (typeof window !== 'undefined') {
      window.location.href = fallbackHref;
    }
  };

  return (
    <button type="button" onClick={handleClick} style={style}>
      {children ?? label}
    </button>
  );
}
