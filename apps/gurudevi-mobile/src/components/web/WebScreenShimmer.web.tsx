/* biome-ignore-all lint/suspicious/noArrayIndexKey: shimmer layout is static */
/**
 * WebScreenShimmer — pure HTML/CSS shimmer skeleton for web Suspense fallbacks.
 *
 * Matches the sanctuary design language: vellum background (#F5EDD6),
 * saffron-tinted shimmer wave. No React Native dependencies — safe to use
 * as a <React.Suspense fallback> inside Tab.Screen renders.
 *
 * The layout mimics a generic "content + cards" page so the transition
 * from loading → loaded feels spatially stable (no jarring layout shifts).
 */

// ── Generic page shimmer ─────────────────────────────────────────────────────
export default function WebScreenShimmer({
  variant = 'cards',
}: {
  variant?: 'cards' | 'list' | 'profile' | 'full';
}) {
  return (
    <div className="wsm-root" role="status" aria-busy="true" aria-label="Loading…">
      {/* Section heading */}
      <div
        className="wsm-block"
        style={{
          height: 14,
          maxWidth: '200px',
          width: '22%',
          borderRadius: 4,
          marginBottom: 8,
        }}
      />
      <div
        className="wsm-block"
        style={{
          height: 36,
          maxWidth: '500px',
          width: '55%',
          borderRadius: 8,
          marginBottom: 6,
        }}
      />
      <div
        className="wsm-block"
        style={{
          height: 16,
          maxWidth: '300px',
          width: '40%',
          borderRadius: 4,
          marginBottom: 40,
        }}
      />

      {variant === 'cards' && <CardsShimmer />}
      {variant === 'list' && <ListShimmer />}
      {variant === 'profile' && <ProfileShimmer />}
      {variant === 'full' && <FullShimmer />}

      <style>{CSS}</style>
    </div>
  );
}

// ── Card grid shimmer (Library, Community, Self dashboard) ───────────────────
function CardsShimmer() {
  return (
    <>
      {/* Search / filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <div className="wsm-block" style={{ flex: 1, height: 44, borderRadius: 12 }} />
        <div className="wsm-block" style={{ width: 120, height: 44, borderRadius: 12 }} />
      </div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[80, 110, 90, 70, 100].map((w, i) => (
          <div
            key={`pill-${i}`}
            className="wsm-block"
            style={{ width: w, height: 34, borderRadius: 50 }}
          />
        ))}
      </div>
      {/* Card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(400px, 100%), 1fr))',
          gap: 32,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`card-${i}`}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid var(--border, rgba(42,35,24,0.06))',
              background: 'var(--card-bg, rgba(255,255,255,0.3))',
            }}
          >
            <div className="wsm-block" style={{ height: 220, borderRadius: 0 }} />
            <div style={{ padding: '24px' }}>
              <div
                className="wsm-block"
                style={{
                  height: 18,
                  width: '60%',
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              />
              <div
                className="wsm-block"
                style={{
                  height: 14,
                  width: '85%',
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
              <div className="wsm-block" style={{ height: 14, width: '40%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── List shimmer (Notifications, Settings, Classroom list) ───────────────────
function ListShimmer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`list-item-${i}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px',
            borderRadius: 14,
            border: '1px solid var(--border, rgba(42,35,24,0.08))',
          }}
        >
          <div
            className="wsm-block"
            style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div
              className="wsm-block"
              style={{
                height: 14,
                width: '55%',
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div className="wsm-block" style={{ height: 12, width: '75%', borderRadius: 4 }} />
          </div>
          <div className="wsm-block" style={{ width: 60, height: 28, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}

// ── Profile shimmer ──────────────────────────────────────────────────────────
function ProfileShimmer() {
  return (
    <>
      {/* Hero banner */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          padding: '40px',
          borderRadius: 20,
          border: '1px solid var(--border, rgba(42,35,24,0.08))',
          marginBottom: 32,
        }}
      >
        <div
          className="wsm-block"
          style={{ width: 88, height: 88, borderRadius: 44, flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div
            className="wsm-block"
            style={{
              height: 32,
              width: '45%',
              borderRadius: 6,
              marginBottom: 12,
            }}
          />
          <div
            className="wsm-block"
            style={{
              height: 16,
              width: '30%',
              borderRadius: 4,
              marginBottom: 20,
            }}
          />
          <div
            className="wsm-block"
            style={{
              height: 6,
              width: '70%',
              borderRadius: 3,
              marginBottom: 16,
            }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="wsm-block" style={{ height: 14, width: 160, borderRadius: 4 }} />
            <div className="wsm-block" style={{ height: 14, width: 120, borderRadius: 4 }} />
          </div>
        </div>
        <div
          className="wsm-block"
          style={{ width: 140, height: 140, borderRadius: 12, flexShrink: 0 }}
        />
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        {[240, 180, 200].map((h, i) => (
          <div
            key={`grid-block-${i}`}
            className="wsm-block"
            style={{ height: h, borderRadius: 16 }}
          />
        ))}
      </div>
    </>
  );
}

// ── Full-page shimmer (initial app shell load) ───────────────────────────────
function FullShimmer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Big hero area */}
      <div className="wsm-block" style={{ height: 200, borderRadius: 20, marginBottom: 8 }} />
      {/* Two-column overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[160, 120, 180, 100].map((h, i) => (
          <div
            key={`full-block-${i}`}
            className="wsm-block"
            style={{ height: h, borderRadius: 16 }}
          />
        ))}
      </div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={`stat-${i}`}
            className="wsm-block"
            style={{ flex: 1, height: 80, borderRadius: 14 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
.wsm-root {
    padding: 40px 48px 60px 48px; /* Matched to .sanctuary-screen padding */
    max-width: var(--container-width, 1400px);
    margin: 0 auto;
    min-height: 100vh;
}
@media (max-width: 1024px) {
    .wsm-root { padding: 32px 24px; }
}
@media (max-width: 768px) {
    .wsm-root { padding: 20px 14px 88px 14px; }
}

@keyframes wsmShimmer {
    0%   { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}
@keyframes wsmPulse {
    0%, 100% { opacity: 0.85; }
    50%      { opacity: 1; }
}
.wsm-block {
    background: linear-gradient(
        90deg,
        var(--border, rgba(42,35,24,0.06)) 25%,
        rgba(212,132,58,0.04) 37%,
        rgba(212,132,58,0.08) 50%,
        rgba(212,132,58,0.04) 63%,
        var(--border, rgba(42,35,24,0.06)) 75%
    );
    background-size: 200% 100%;
    animation: 
        wsmShimmer 2.5s infinite linear,
        wsmPulse 3.5s ease-in-out infinite;
    border-radius: 12px;
}
@media (prefers-reduced-motion: reduce) {
    .wsm-block { animation: none; opacity: 0.5; }
}
`;

// ── Named helpers exported for direct use ────────────────────────────────────
export function StackFallback({ variant }: { variant?: 'cards' | 'list' | 'profile' | 'full' }) {
  return <WebScreenShimmer variant={variant ?? 'cards'} />;
}
