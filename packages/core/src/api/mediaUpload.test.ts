import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requestWallpaperUpload: vi.fn(),
  registerWallpaperAsset: vi.fn(),
  reconcileWallpaperAsset: vi.fn(),
  deleteWallpaperAsset: vi.fn(),
}));

vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: {
    media: {
      requestWallpaperUpload: mocks.requestWallpaperUpload,
      registerWallpaperAsset: mocks.registerWallpaperAsset,
      reconcileWallpaperAsset: mocks.reconcileWallpaperAsset,
      deleteWallpaperAsset: mocks.deleteWallpaperAsset,
    },
  },
}));

import { uploadWallpaper } from './mediaUpload';

const metadata = {
  mimeType: 'image/jpeg' as const,
  byteLength: 3,
  width: 2,
  height: 2,
};
const uploadUrl = 'https://api.cloudinary.com/v1_1/example/image/upload';
const cloudinaryAsset = {
  secure_url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
  public_id: 'gurudevi/user/wallpapers/wallpaper',
  width: 2,
  height: 2,
  format: 'jpg',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requestWallpaperUpload.mockResolvedValue({
    provider: 'cloudinary',
    uploadUrl,
    fields: { api_key: 'api-key', signature: 'signature', timestamp: '1800000000' },
  });
  mocks.registerWallpaperAsset.mockResolvedValue({
    assetId: '423e4567-e89b-12d3-a456-426614174000',
    publicId: cloudinaryAsset.public_id,
    secureUrl: cloudinaryAsset.secure_url,
    format: cloudinaryAsset.format,
    byteLength: 3,
    width: 2,
    height: 2,
  });
  mocks.reconcileWallpaperAsset.mockResolvedValue({ status: 'cleaned' });
});

describe('wallpaper upload client', () => {
  it('registers the uploaded asset without requesting a client-side delete capability', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
        Response.json(cloudinaryAsset),
      ),
    );

    await expect(
      uploadWallpaper(new Blob(['abc'], { type: 'image/jpeg' }), metadata),
    ).resolves.toEqual({
      provider: 'cloudinary',
      url: cloudinaryAsset.secure_url,
      publicId: cloudinaryAsset.public_id,
      width: 2,
      height: 2,
    });
    expect(mocks.registerWallpaperAsset).toHaveBeenCalledOnce();
    expect(JSON.stringify(mocks.registerWallpaperAsset.mock.calls)).not.toContain('delete_token');
  });

  it('reconciles a committed registration whose response was lost', async () => {
    mocks.registerWallpaperAsset.mockRejectedValueOnce(
      new TypeError('response lost after server commit'),
    );
    mocks.reconcileWallpaperAsset.mockResolvedValueOnce({
      status: 'registered',
      asset: {
        assetId: '423e4567-e89b-12d3-a456-426614174000',
        publicId: cloudinaryAsset.public_id,
        secureUrl: cloudinaryAsset.secure_url,
        format: cloudinaryAsset.format,
        byteLength: 3,
        width: 2,
        height: 2,
      },
    });
    const uploadFetch = vi.fn(async () => Response.json(cloudinaryAsset));
    vi.stubGlobal('fetch', uploadFetch);

    await expect(
      uploadWallpaper(new Blob(['abc'], { type: 'image/jpeg' }), metadata),
    ).resolves.toMatchObject({
      publicId: cloudinaryAsset.public_id,
    });

    expect(mocks.registerWallpaperAsset).toHaveBeenCalledOnce();
    expect(mocks.reconcileWallpaperAsset).toHaveBeenCalledOnce();
    expect(mocks.reconcileWallpaperAsset.mock.calls[0]?.[0]).toEqual(
      mocks.registerWallpaperAsset.mock.calls[0]?.[0],
    );
    expect(uploadFetch).toHaveBeenCalledOnce();
  });

  it('surfaces an unknown registration outcome without deleting the provider asset', async () => {
    mocks.registerWallpaperAsset.mockRejectedValue(new TypeError('response outcome unknown'));
    mocks.reconcileWallpaperAsset.mockRejectedValue(new TypeError('reconciliation unavailable'));
    const uploadFetch = vi.fn(async () => Response.json(cloudinaryAsset));
    vi.stubGlobal('fetch', uploadFetch);

    await expect(
      uploadWallpaper(new Blob(['abc'], { type: 'image/jpeg' }), metadata),
    ).rejects.toMatchObject({
      name: 'WallpaperRegistrationOutcomeUnknownError',
      publicId: cloudinaryAsset.public_id,
    });
    expect(mocks.registerWallpaperAsset).toHaveBeenCalledOnce();
    expect(mocks.reconcileWallpaperAsset).toHaveBeenCalledOnce();
    expect(uploadFetch).toHaveBeenCalledOnce();
  });

  it('does not retry definitive registration rejection', async () => {
    const rejection = Object.assign(new Error('asset metadata rejected'), { status: 400 });
    mocks.registerWallpaperAsset.mockRejectedValue(rejection);
    mocks.reconcileWallpaperAsset.mockResolvedValue({ status: 'cleaned' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(cloudinaryAsset)),
    );

    await expect(uploadWallpaper(new Blob(['abc'], { type: 'image/jpeg' }), metadata)).rejects.toBe(
      rejection,
    );
    expect(mocks.registerWallpaperAsset).toHaveBeenCalledOnce();
    expect(mocks.reconcileWallpaperAsset).not.toHaveBeenCalled();
  });

  it('rejects upload intents that point outside Cloudinary before sending the file', async () => {
    mocks.requestWallpaperUpload.mockResolvedValue({
      provider: 'cloudinary',
      uploadUrl: 'https://attacker.example/collect',
      fields: {},
    });
    const uploadFetch = vi.fn();
    vi.stubGlobal('fetch', uploadFetch);

    await expect(
      uploadWallpaper(new Blob(['abc'], { type: 'image/jpeg' }), metadata),
    ).rejects.toThrow('invalid upload URL');
    expect(uploadFetch).not.toHaveBeenCalled();
  });

  it('rejects a source blob whose actual bytes exceed the policy before requesting an upload', async () => {
    const uploadFetch = vi.fn();
    vi.stubGlobal('fetch', uploadFetch);

    await expect(
      uploadWallpaper(
        new Blob([new Uint8Array(8 * 1024 * 1024 + 1)], { type: 'image/jpeg' }),
        metadata,
      ),
    ).rejects.toMatchObject({ code: 'MEDIA_SIZE_EXCEEDED' });
    expect(mocks.requestWallpaperUpload).not.toHaveBeenCalled();
    expect(uploadFetch).not.toHaveBeenCalled();
  });
});
