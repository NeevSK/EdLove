import { describe, expect, it } from 'vitest';
import { androidAssetLinks, appleAppSiteAssociation } from './appLinks';

describe('app-link files (G1 / Vitest)', () => {
  it('names the iOS app for the paths it opens', () => {
    const file = appleAppSiteAssociation('ABCDE12345');
    expect(file.applinks.details).toEqual([
      {
        appID: 'ABCDE12345.app.gurudevi.sanctuary',
        paths: ['/qr*', '/invite/*', '/c/*', '/auth/callback*'],
      },
    ]);
    expect(file.webcredentials.apps).toEqual(['ABCDE12345.app.gurudevi.sanctuary']);
  });

  it('names the Android app and its signing fingerprint', () => {
    const [link] = androidAssetLinks('AA:BB');
    expect(link?.relation).toEqual(['delegate_permission/common.handle_all_urls']);
    expect(link?.target).toEqual({
      namespace: 'android_app',
      package_name: 'app.gurudevi.sanctuary',
      sha256_cert_fingerprints: ['AA:BB'],
    });
  });
});
