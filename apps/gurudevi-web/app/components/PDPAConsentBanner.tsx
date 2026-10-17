'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gurudevi_pdpa_consent';

export function PDPAConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  if (!mounted || !visible) {
    return null;
  }

  function handleDecision(granted: boolean) {
    const value = granted ? 'granted' : 'declined';
    try {
      localStorage.setItem(STORAGE_KEY, value);
      // Set 1-year cookie for SSR awareness
      document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors in private browsing
    }
    setVisible(false);
  }

  return (
    <aside
      role="region"
      aria-label="Privacy and PDPA Consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-sacred-white border-t border-line shadow-2xl backdrop-blur-md"
      style={{
        backgroundColor: 'var(--color-sacred-white, #fffdf8)',
        borderColor: 'var(--color-line, rgba(104, 94, 85, 0.16))',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              focusable="false"
              height="20"
              viewBox="0 0 24 24"
              width="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-action"
              style={{ color: 'var(--color-action, #a85022)' }}
            >
              <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
              <path d="m9.5 12 1.7 1.7 3.5-3.5" />
            </svg>
            <h2 className="text-sm font-bold font-sans tracking-wide text-ink m-0">
              Privacy & Consent (PDPA Compliance)
            </h2>
          </div>
          <p className="text-xs text-ink-soft leading-relaxed m-0 font-sans">
            In compliance with Sri Lanka’s Personal Data Protection Act (PDPA No. 9 of 2022),
            essential sanctuary operations do not depend on optional telemetry. We request your
            consent to measure application health and learning performance. Review our{' '}
            <Link
              href="/privacy"
              className="text-action underline underline-offset-2 hover:opacity-80"
              style={{ color: 'var(--color-action, #a85022)' }}
            >
              Privacy Policy
            </Link>{' '}
            for complete transparency.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleDecision(false)}
            className="touch-target-min px-4 py-2 text-xs font-semibold rounded-lg border border-line text-ink hover:bg-paper transition-colors"
            style={{
              borderColor: 'var(--color-line, rgba(104, 94, 85, 0.2))',
              color: 'var(--color-ink, #131e27)',
            }}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleDecision(true)}
            className="touch-target-min px-5 py-2 text-xs font-semibold rounded-lg text-white transition-opacity hover:opacity-95 shadow-sm"
            style={{
              backgroundColor: 'var(--color-action, #a85022)',
              color: '#ffffff',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </aside>
  );
}
