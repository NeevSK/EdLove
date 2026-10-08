import { describe, expect, it } from 'vitest';
import { GET as getAssetLinks } from '../assetlinks.json/route';
import { GET as getAASA } from '../apple-app-site-association/route';

describe('Web .well-known Endpoints (App Links & Universal Links)', () => {
  it('returns valid assetlinks.json with Content-Type application/json', async () => {
    const response = await getAssetLinks();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toMatchObject({
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'app.gurudevi.sanctuary',
      },
    });
    expect(data[0].target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
  });

  it('returns valid apple-app-site-association with Content-Type application/json', async () => {
    const response = await getAASA();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const data = await response.json();
    expect(data).toHaveProperty('applinks');
    expect(data.applinks.details[0]).toMatchObject({
      paths: ['/qr*', '/invite/*', '/c/*', '/auth/callback*'],
    });
    expect(data.applinks.details[0].appID).toContain('app.gurudevi.sanctuary');
  });
});
