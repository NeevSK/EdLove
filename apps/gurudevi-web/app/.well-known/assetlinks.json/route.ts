import { NextResponse } from 'next/server';

/**
 * Android Digital Asset Links Endpoint
 * Required for Android App Links auto-verification.
 */
export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'app.gurudevi.sanctuary',
        sha256_cert_fingerprints: [
          process.env.ANDROID_SHA256_CERT_FINGERPRINT ??
            '14:6D:E9:7D:0F:52:AB:E0:EC:B2:D6:C2:59:E4:EB:42:DE:0A:A6:AB:4C:E6:B9:DE:EC:2B:B3:9C:6F:4D:48:8B',
        ],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
