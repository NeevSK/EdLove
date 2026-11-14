'use client';

import { useEffect, useState } from 'react';
import type { KitIconProps, TimeIntent, TimeLabels } from '../../../theme/contracts';
import { refreshAfter, TIME_ENGLISH } from '../../shared/time';

/** The page's language when the piece is not told one (`<html lang>`), else Sri Lankan English. */
function pageLocale(): string {
  if (typeof document === 'undefined') return 'en-LK';
  const lang = document.documentElement.lang;
  return lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : lang || 'en-LK';
}

export function useTimeWords(locale?: string, labels?: Partial<TimeLabels>) {
  return { locale: locale ?? pageLocale(), l: { ...TIME_ENGLISH, ...labels } };
}

/** `data-intent` values the stylesheet draws past, today and ahead by. */
export const INTENT_ATTR: Record<TimeIntent, string> = {
  review: 'past',
  current: 'today',
  plan: 'future',
};

/** Now, kept current as often as the moment needs, and only while the page is visible. */
export function useNow(fixed: Date | undefined, around: Date | null): Date {
  const [now, setNow] = useState(() => fixed ?? new Date());
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onChange = () => {
      const shown = document.visibilityState !== 'hidden';
      setVisible(shown);
      if (shown) setNow(new Date());
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  const at = around?.getTime();
  useEffect(() => {
    if (fixed || !visible || at === undefined || Number.isNaN(at)) return;
    const id = window.setTimeout(() => setNow(new Date()), refreshAfter(new Date(at), now));
    return () => window.clearTimeout(id);
  }, [fixed, visible, at, now]);
  return fixed ?? now;
}

export function Previous({ size = 20 }: KitIconProps) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>
      ‹
    </span>
  );
}

export function Next({ size = 20 }: KitIconProps) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>
      ›
    </span>
  );
}
