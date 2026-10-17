import './setup';
import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../core/app';
import { createCloudinaryWallpaperUploadIntent } from '../core/handlers/media';
import { createTestORPCClient } from './orpc-client';
import {
  getMockLastExecuteRawArgs,
  getMockLastQueryRawArgs,
  setMockActiveBond,
  setMockRawQueryRowsQueue,
  setMockUserPreferences,
  setMockZenStackDbAvailable,
} from './setup';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const publicId = `gurudevi/${userId}/wallpapers/asset-1`;
const secureUrl = 'https://res.cloudinary.com/example/image/upload/asset-1.jpg';
const baseAsset = {
  publicId,
  secureUrl,
  format: 'jpg',
  mimeType: 'image/jpeg' as const,
  byteLength: 100_000,
  width: 1600,
  height: 900,
};

beforeEach(() => {
  vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'example');
  vi.stubEnv('CLOUDINARY_API_KEY', 'api-key');
  vi.stubEnv('CLOUDINARY_API_SECRET', 'secret');
  setMockZenStackDbAvailable(true);
  setMockRawQueryRowsQueue([]);
  setMockUserPreferences({ active_bond_id: '123e4567-e89b-12d3-a456-426614174001' });
  setMockActiveBond({
    id: '123e4567-e89b-12d3-a456-426614174001',
    user_id: userId,
    entity_id: '123e4567-e89b-12d3-a456-426614174002',
    entity_type: 'SCHOOL',
    capacity: 'teacher',
    status: 'active',
  });
});

describe('signed wallpaper upload intent', () => {
  it('binds the signature and folder to the authenticated user', () => {
    const userId = '00000000-0000-4000-8000-000000000001';
    const intent = createCloudinaryWallpaperUploadIntent({
      cloudName: 'example',
      apiKey: 'api-key',
      apiSecret: 'secret',
      userId,
      nowSeconds: 1_800_000_000,
    });

    const folder = `gurudevi/${userId}/wallpapers`;
    const allowedFormats = 'avif,jpg,png,webp';
    const overwrite = 'false';
    const publicId = intent.fields.public_id;
    const transformation = 'c_limit,h_1920,w_1920,fl_strip_profile';
    expect(publicId).toMatch(/^[0-9a-f-]{36}$/i);
    const expected = createHash('sha1')
      .update(
        `allowed_formats=${allowedFormats}&folder=${folder}&overwrite=${overwrite}&public_id=${publicId}&timestamp=1800000000&transformation=${transformation}secret`,
      )
      .digest('hex');

    expect(intent.uploadUrl).toBe('https://api.cloudinary.com/v1_1/example/image/upload');
    expect(intent.fields).toEqual({
      api_key: 'api-key',
      allowed_formats: allowedFormats,
      folder,
      overwrite,
      public_id: publicId,
      timestamp: '1800000000',
      transformation,
      signature: expected,
    });
    expect(intent.fields).not.toHaveProperty('return_delete_token');
    expect(Date.parse(intent.expiresAt)).toBe((1_800_000_000 + 3600) * 1000);
  });

  it('rejects an identity that could escape the owner folder', () => {
    expect(() =>
      createCloudinaryWallpaperUploadIntent({
        cloudName: 'example',
        apiKey: 'api-key',
        apiSecret: 'secret',
        userId: '../other-user',
      }),
    ).toThrow('ownership identity is invalid');
  });

  it('serves the authenticated route through the existing self-scoped User policy', async () => {
    const result = await createTestORPCClient({
      Authorization: `Bearer ${userId}`,
    }).media.requestWallpaperUpload({
      body: {
        mimeType: baseAsset.mimeType,
        byteLength: baseAsset.byteLength,
        width: baseAsset.width,
        height: baseAsset.height,
      },
    });

    expect(result.provider).toBe('cloudinary');
    expect(result.fields.folder).toBe(`gurudevi/${userId}/wallpapers`);
    expect(result.fields.allowed_formats).toBe('avif,jpg,png,webp');
    expect(result.fields.transformation).toBe('c_limit,h_1920,w_1920,fl_strip_profile');
    expect(result.fields.overwrite).toBe('false');
    expect(result.fields.public_id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('rejects anonymous asset registration before provider verification', async () => {
    const providerFetch = vi.fn();
    vi.stubGlobal('fetch', providerFetch);

    await expect(
      createTestORPCClient().media.registerWallpaperAsset({ body: baseAsset }),
    ).rejects.toMatchObject({ status: 403 });
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it('rejects another account’s asset before provider verification', async () => {
    const providerFetch = vi.fn();
    vi.stubGlobal('fetch', providerFetch);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.registerWallpaperAsset({
        body: {
          ...baseAsset,
          publicId: 'gurudevi/123e4567-e89b-12d3-a456-426614174099/wallpapers/asset-1',
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it('does not expose media writes through the read-only OpenAPI transport', async () => {
    const response = await app.request('/api/openapi/media/wallpapers/upload-intents', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mimeType: baseAsset.mimeType,
        byteLength: baseAsset.byteLength,
        width: baseAsset.width,
        height: baseAsset.height,
      }),
    });

    expect(response.status).toBe(404);
  });

  it('registers provider-verified metadata rather than trusting client dimensions', async () => {
    const providerFetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      Response.json({
        resources: [
          {
            public_id: publicId,
            secure_url: secureUrl,
            format: 'jpg',
            bytes: 120_000,
            width: 1200,
            height: 800,
            resource_type: 'image',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', providerFetch);
    setMockRawQueryRowsQueue([
      [
        {
          id: '423e4567-e89b-12d3-a456-426614174000',
          public_id: publicId,
          secure_url: secureUrl,
          format: 'jpg',
          byte_length: 120_000,
          width: 1200,
          height: 800,
        },
      ],
    ]);

    const result = await createTestORPCClient({
      Authorization: `Bearer ${userId}`,
    }).media.registerWallpaperAsset({ body: { ...baseAsset, byteLength: 110_000, width: 1000 } });

    expect(result).toMatchObject({ byteLength: 120_000, width: 1200, height: 800 });
    expect(JSON.stringify(getMockLastQueryRawArgs())).toContain('120000');
    expect(JSON.stringify(getMockLastQueryRawArgs())).toContain('1200');
    expect(providerFetch).toHaveBeenCalledOnce();
    const [request, init] = providerFetch.mock.calls[0] ?? [];
    expect(String(request)).toContain('public_ids%5B%5D=');
    expect(new Headers(init?.headers).get('authorization')).toMatch(/^Basic /);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('classifies provider network failures during verification as retryable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('provider connection reset');
      }),
    );

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.registerWallpaperAsset({
        body: baseAsset,
      }),
    ).rejects.toMatchObject({ status: 503 });
  });

  it('classifies unreadable provider metadata as retryable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{', { status: 200 })),
    );

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.registerWallpaperAsset({
        body: baseAsset,
      }),
    ).rejects.toMatchObject({ status: 503 });
  });

  it('rejects provider metadata that violates the wallpaper policy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          resources: [
            {
              public_id: publicId,
              secure_url: secureUrl,
              format: 'jpg',
              bytes: 120_000,
              width: 5000,
              height: 5000,
              resource_type: 'image',
            },
          ],
        }),
      ),
    );
    setMockRawQueryRowsQueue([[{ id: '423e4567-e89b-12d3-a456-426614174000' }]]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.registerWallpaperAsset({
        body: baseAsset,
      }),
    ).rejects.toThrow();
  });

  it('does not register an asset whose public ID has a deletion tombstone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          resources: [
            {
              public_id: publicId,
              secure_url: secureUrl,
              format: 'jpg',
              bytes: 120_000,
              width: 1200,
              height: 800,
              resource_type: 'image',
            },
          ],
        }),
      ),
    );
    setMockRawQueryRowsQueue([[]]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.registerWallpaperAsset({
        body: baseAsset,
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(JSON.stringify(getMockLastQueryRawArgs())).toContain(
      "where user_wallpaper_assets.deletion_state = 'active'",
    );
  });

  it('rejects provider assets that were not normalized to the signed edge limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          resources: [
            {
              public_id: publicId,
              secure_url: secureUrl,
              format: 'jpg',
              bytes: 120_000,
              width: 2500,
              height: 900,
              resource_type: 'image',
            },
          ],
        }),
      ),
    );

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.registerWallpaperAsset({
        body: baseAsset,
      }),
    ).rejects.toMatchObject({
      message: 'Wallpaper dimensions exceed the normalized upload limit.',
    });
  });

  it('keeps a retryable tombstone when Cloudinary does not confirm deletion', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ result: 'error' })),
    );
    setMockRawQueryRowsQueue([[{ public_id: publicId }]]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.deleteWallpaperAsset({
        body: { publicId },
      }),
    ).rejects.toThrow();
  });

  it('keeps a pending tombstone after an uncertain delete and completes on retry', async () => {
    const providerFetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ result: 'error' }))
      .mockResolvedValueOnce(Response.json({ result: 'not found' }));
    vi.stubGlobal('fetch', providerFetch);
    setMockRawQueryRowsQueue([[{ public_id: publicId, deletion_state: 'active' }], []]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.deleteWallpaperAsset({
        body: { publicId },
      }),
    ).rejects.toMatchObject({ status: 503 });
    expect(JSON.stringify(getMockLastExecuteRawArgs())).toContain("set deletion_state = 'pending'");
    expect(providerFetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);

    setMockRawQueryRowsQueue([[{ public_id: publicId, deletion_state: 'pending' }]]);
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.deleteWallpaperAsset({
        body: { publicId },
      }),
    ).resolves.toEqual({ deleted: true });
    expect(JSON.stringify(getMockLastExecuteRawArgs())).toContain("set deletion_state = 'deleted'");
    expect(providerFetch).toHaveBeenCalledTimes(2);
  });

  it('keeps deletion pending when Cloudinary returns an unreadable response body', async () => {
    const providerFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('{', { status: 200 }))
      .mockResolvedValueOnce(Response.json({ result: 'not found' }));
    vi.stubGlobal('fetch', providerFetch);
    setMockRawQueryRowsQueue([[{ public_id: publicId, deletion_state: 'active' }], []]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.deleteWallpaperAsset({
        body: { publicId },
      }),
    ).rejects.toMatchObject({ status: 503 });
    expect(JSON.stringify(getMockLastExecuteRawArgs())).toContain("set deletion_state = 'pending'");

    setMockRawQueryRowsQueue([[{ public_id: publicId, deletion_state: 'pending' }]]);
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.deleteWallpaperAsset({
        body: { publicId },
      }),
    ).resolves.toEqual({ deleted: true });
    expect(JSON.stringify(getMockLastExecuteRawArgs())).toContain("set deletion_state = 'deleted'");
  });

  it('refuses to delete an asset that is still referenced by a workspace', async () => {
    const providerFetch = vi.fn();
    vi.stubGlobal('fetch', providerFetch);
    setMockRawQueryRowsQueue([
      [{ public_id: publicId, deletion_state: 'active' }],
      [{ workspace_id: 'self' }],
    ]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).media.deleteWallpaperAsset({
        body: { publicId },
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(providerFetch).not.toHaveBeenCalled();
  });
});
