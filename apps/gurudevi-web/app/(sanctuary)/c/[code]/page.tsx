import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classroom Invitation | Gurudevi Sanctuary',
  description: 'Join a learning sanctuary classroom on Gurudevi',
};

interface ClassroomVanityPageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ClassroomVanityPage({
  params,
  searchParams,
}: ClassroomVanityPageProps) {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code ?? '';
  // OWASP sanitization: alphanumeric 4-32 characters
  const cleanCode = rawCode.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);

  const nativeAppUrl = `gurudevi://c/${cleanCode}`;
  const playStoreReferrer = encodeURIComponent(
    `utm_source=invite&inviteCode=${cleanCode}&intent=classroom`,
  );
  const playStoreUrl = `https://play.google.com/store/apps/details?id=app.gurudevi.sanctuary&referrer=${playStoreReferrer}`;
  const webCommunityUrl = `/community?inviteCode=${encodeURIComponent(cleanCode)}`;

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5EDD6',
        color: '#2A2318',
        padding: '24px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: '0 12px 36px rgba(107, 100, 128, 0.12)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#FAF4E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px',
          }}
        >
          🪔
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2A2318',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          Classroom Invitation
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#655A48',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          You have been invited to join a classroom workspace in the Gurudevi Sanctuary.
        </p>

        {cleanCode && (
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              backgroundColor: '#FAF4E8',
              border: '1px solid rgba(212, 132, 58, 0.25)',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              color: '#D4843A',
              letterSpacing: '0.05em',
              marginBottom: '28px',
            }}
          >
            Code: {cleanCode}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href={nativeAppUrl}
            style={{
              display: 'block',
              backgroundColor: '#D4843A',
              color: '#FFFFFF',
              fontWeight: '600',
              padding: '14px 20px',
              borderRadius: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(212, 132, 58, 0.3)',
              transition: 'transform 0.15s ease',
            }}
          >
            Open in Gurudevi App
          </a>

          <Link
            href={webCommunityUrl}
            style={{
              display: 'block',
              backgroundColor: '#F5EDD6',
              color: '#2A2318',
              fontWeight: '600',
              padding: '14px 20px',
              borderRadius: '14px',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            Continue in Browser
          </Link>

          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              color: '#8A7B69',
              fontSize: '13px',
              marginTop: '8px',
              textDecoration: 'none',
            }}
          >
            Need the app? Get it on Google Play
          </a>
        </div>
      </div>
    </main>
  );
}
