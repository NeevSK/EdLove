/**
 * The files that let phones open Gurudevi links in the app: Apple's app-site association and
 * Android's asset links. Each build writes them under `/.well-known/`; the identifiers come
 * from the build environment, with the release defaults below.
 */
const BUNDLE_ID = 'app.gurudevi.sanctuary';
const ANDROID_RELEASE_FINGERPRINT =
  '14:6D:E9:7D:0F:52:AB:E0:EC:B2:D6:C2:59:E4:EB:42:DE:0A:A6:AB:4C:E6:B9:DE:EC:2B:B3:9C:6F:4D:48:8B';

export function appleAppSiteAssociation(teamId = process.env.APPLE_TEAM_ID ?? 'TEAMID') {
  const appID = `${teamId}.${BUNDLE_ID}`;
  return {
    applinks: {
      apps: [],
      details: [{ appID, paths: ['/qr*', '/invite/*', '/c/*', '/auth/callback*'] }],
    },
    webcredentials: { apps: [appID] },
  };
}

export function androidAssetLinks(
  fingerprint = process.env.ANDROID_SHA256_CERT_FINGERPRINT ?? ANDROID_RELEASE_FINGERPRINT,
) {
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: BUNDLE_ID,
        sha256_cert_fingerprints: [fingerprint],
      },
    },
  ];
}
