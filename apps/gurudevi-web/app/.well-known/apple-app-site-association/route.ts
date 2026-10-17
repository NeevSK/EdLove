import { NextResponse } from 'next/server';

/**
 * Apple App Site Association (AASA) Endpoint
 * Required for iOS Universal Links. Apple mandates Content-Type application/json
 * and strictly forbids redirects or trailing slashes.
 */
export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID ?? 'TEAMID';
  const bundleId = 'app.gurudevi.sanctuary';

  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${teamId}.${bundleId}`,
          paths: ['/qr*', '/invite/*', '/c/*', '/auth/callback*'],
        },
      ],
    },
    webcredentials: {
      apps: [`${teamId}.${bundleId}`],
    },
  };

  return NextResponse.json(aasa, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
