import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | Gurudevi',
  description: 'The requested threshold does not lead to a known sanctuary floor or realm.',
};

export default function NotFound() {
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
          src="/mascot/firefly-guide-explore-light-cutout-v2.webp"
          alt="Tutii the guide searching the sanctuary"
          style={{
            width: '96px',
            height: '96px',
            objectFit: 'contain',
            margin: '0 auto 1rem auto',
            display: 'block',
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
          404 · Uncharted Threshold
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
          Path Not Found
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
          This threshold does not lead to a known sanctuary floor or classroom room.
          You can return to the Welcome Gate or wander through the open museum.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/welcome"
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
              textDecoration: 'none',
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.2)',
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
              color: 'var(--color-ink, #131e27)',
              border: '1px solid var(--gd-border-subtle, rgba(69, 60, 53, 0.2))',
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
