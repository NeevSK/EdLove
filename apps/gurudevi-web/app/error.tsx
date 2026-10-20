'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side exceptions for telemetry
    console.error('[Gurudevi] Boundary caught unhandled error:', error);
  }, [error]);

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'var(--gd-surface-page, #fffdf8)',
        color: 'var(--gd-text-primary, #131e27)',
      }}
    >
      <div
        style={{
          maxWidth: '36rem',
          width: '100%',
          textAlign: 'center',
          padding: '2.5rem 2rem',
          border: '1px solid var(--gd-border-subtle, rgba(69, 60, 53, 0.16))',
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mascot/firefly-guide-error-light-scene.webp"
          alt="Tutii holding a warm lantern in the quiet sanctuary"
          style={{
            width: '140px',
            height: '140px',
            objectFit: 'cover',
            borderRadius: '20px',
            margin: '0 auto 1.25rem auto',
            display: 'block',
            boxShadow: '0 6px 18px rgba(168, 80, 34, 0.15)',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-sans, "Space Grotesk", sans-serif)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-sanctuary-saffron, #a85022)',
            marginBottom: '0.5rem',
          }}
        >
          Sanctuary Boundary
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
            color: 'var(--color-ink, #131e27)',
          }}
        >
          A Moment of Pause
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-serif, "Newsreader", serif)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            color: 'var(--color-ink-soft, #453c35)',
            marginBottom: '2rem',
          }}
        >
          Something interrupted this sanctuary threshold. Your private work remains safe.
          You can attempt to restore this view, or return to the Welcome Gate.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '2.75rem',
              padding: '0 1.25rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-ink, #131e27)',
              color: '#fffdf8',
              fontFamily: 'var(--font-sans, "Space Grotesk", sans-serif)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            Try Again
          </button>
          <Link
            href="/welcome"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '2.75rem',
              padding: '0 1.25rem',
              borderRadius: '9999px',
              backgroundColor: 'transparent',
              color: 'var(--color-ink, #131e27)',
              border: '1px solid var(--gd-border-subtle, rgba(69, 60, 53, 0.2))',
              fontFamily: 'var(--font-sans, "Space Grotesk", sans-serif)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Return to Welcome Gate
          </Link>
          <a
            href="https://explore.gurudevi.app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '2.75rem',
              padding: '0 1.25rem',
              borderRadius: '9999px',
              backgroundColor: 'transparent',
              color: 'var(--color-ink-soft, #453c35)',
              border: '1px solid var(--gd-border-subtle, rgba(69, 60, 53, 0.15))',
              fontFamily: 'var(--font-sans, "Space Grotesk", sans-serif)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Guest House Museum ↗
          </a>
        </div>
      </div>
    </main>
  );
}
