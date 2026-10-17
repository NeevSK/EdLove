import { createHash, randomUUID } from 'node:crypto';
import { ORPCError } from '@orpc/server';
import { mediaUploadContract } from '@repo/core/api/mediaUpload.contract';
import { validateMediaUpload, WALLPAPER_UPLOAD_POLICY } from '@repo/core/lib/mediaUploadPolicy';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const WALLPAPER_PROVIDER_TIMEOUT_MS = 15_000;

const impl = implement(mediaUploadContract).$context<ORPCContext>();
const MAX_WALLPAPER_EDGE = 1920;
const WALLPAPER_INCOMING_TRANSFORMATION = `c_limit,h_${MAX_WALLPAPER_EDGE},w_${MAX_WALLPAPER_EDGE},fl_strip_profile`;

export interface CloudinaryWallpaperIntentConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  userId: string;
  nowSeconds?: number;
}

export function createCloudinaryWallpaperUploadIntent({
  cloudName,
  apiKey,
  apiSecret,
  userId,
  nowSeconds = Math.floor(Date.now() / 1000),
}: CloudinaryWallpaperIntentConfig) {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    throw new ORPCError('FORBIDDEN', { message: 'Wallpaper ownership identity is invalid.' });
  }
  const folder = `gurudevi/${userId}/wallpapers`;
  const expiresAt = new Date((nowSeconds + 3600) * 1000).toISOString();
  const allowedFormats = 'avif,jpg,png,webp';
  const overwrite = 'false';
  const publicId = randomUUID();
  const transformation = WALLPAPER_INCOMING_TRANSFORMATION;
  const signatureBase = `allowed_formats=${allowedFormats}&folder=${folder}&overwrite=${overwrite}&public_id=${publicId}&timestamp=${nowSeconds}&transformation=${transformation}`;
  const signature = createHash('sha1').update(`${signatureBase}${apiSecret}`).digest('hex');

  return {
    provider: 'cloudinary' as const,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    fields: {
      api_key: apiKey,
      allowed_formats: allowedFormats,
      folder,
      overwrite,
      public_id: publicId,
      timestamp: String(nowSeconds),
      transformation,
      signature,
    },
    expiresAt,
  };
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new ORPCError('INTERNAL_SERVER_ERROR', { message: `${name} is not configured.` });
  return value;
}

async function verifyCloudinaryWallpaperAsset({
  cloudName,
  apiKey,
  apiSecret,
  publicId,
}: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  publicId: string;
}): Promise<{
  secureUrl: string;
  format: string;
  byteLength: number;
  width: number;
  height: number;
}> {
  const endpoint = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`);
  endpoint.searchParams.set('public_ids[]', publicId);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: {
        authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(WALLPAPER_PROVIDER_TIMEOUT_MS),
    });
  } catch {
    throw new ORPCError('SERVICE_UNAVAILABLE', { message: 'Wallpaper verification failed.' });
  }
  if (!response.ok) {
    throw new ORPCError('SERVICE_UNAVAILABLE', { message: 'Wallpaper verification failed.' });
  }
  let payload: {
    resources?: Array<{
      public_id?: unknown;
      secure_url?: unknown;
      format?: unknown;
      bytes?: unknown;
      width?: unknown;
      height?: unknown;
      resource_type?: unknown;
    }>;
  };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new ORPCError('SERVICE_UNAVAILABLE', { message: 'Wallpaper verification failed.' });
  }
  const asset = payload.resources?.[0];
  if (
    !asset ||
    asset.public_id !== publicId ||
    typeof asset.secure_url !== 'string' ||
    typeof asset.format !== 'string' ||
    typeof asset.bytes !== 'number' ||
    typeof asset.width !== 'number' ||
    typeof asset.height !== 'number' ||
    asset.resource_type !== 'image'
  ) {
    throw new ORPCError('BAD_REQUEST', {
      message: 'Cloudinary returned invalid wallpaper metadata.',
    });
  }
  return {
    secureUrl: asset.secure_url,
    format: asset.format,
    byteLength: asset.bytes,
    width: asset.width,
    height: asset.height,
  };
}

async function destroyCloudinaryWallpaperAsset({
  cloudName,
  apiKey,
  apiSecret,
  publicId,
}: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  publicId: string;
}): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');
  const form = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  let response: Response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: AbortSignal.timeout(WALLPAPER_PROVIDER_TIMEOUT_MS),
    });
  } catch {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Wallpaper deletion is pending provider confirmation; retry the delete request.',
    });
  }
  if (!response.ok) {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Wallpaper deletion is pending provider confirmation; retry the delete request.',
    });
  }
  let result: { result?: unknown };
  try {
    result = (await response.json()) as typeof result;
  } catch {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Wallpaper deletion is pending provider confirmation; retry the delete request.',
    });
  }
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Wallpaper deletion is pending provider confirmation; retry the delete request.',
    });
  }
}

export const mediaRouter = impl.router({
  requestWallpaperUpload: impl.requestWallpaperUpload
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
      }

      validateMediaUpload(input.body, WALLPAPER_UPLOAD_POLICY);
      const cloudName = requiredEnv('CLOUDINARY_CLOUD_NAME');
      const apiKey = requiredEnv('CLOUDINARY_API_KEY');
      const apiSecret = requiredEnv('CLOUDINARY_API_SECRET');
      return createCloudinaryWallpaperUploadIntent({
        cloudName,
        apiKey,
        apiSecret,
        userId: context.user.id,
      });
    }),
  registerWallpaperAsset: impl.registerWallpaperAsset
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
      }
      if (!context.db) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database context not initialized',
        });
      }
      validateMediaUpload(input.body, WALLPAPER_UPLOAD_POLICY);
      const ownerPrefix = `gurudevi/${context.user.id}/wallpapers/`;
      if (!input.body.publicId.startsWith(ownerPrefix)) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Wallpaper asset is not owned by this account.',
        });
      }
      const verified = await verifyCloudinaryWallpaperAsset({
        cloudName: requiredEnv('CLOUDINARY_CLOUD_NAME'),
        apiKey: requiredEnv('CLOUDINARY_API_KEY'),
        apiSecret: requiredEnv('CLOUDINARY_API_SECRET'),
        publicId: input.body.publicId,
      });
      const verifiedMimeType =
        verified.format === 'avif'
          ? 'image/avif'
          : verified.format === 'jpg' || verified.format === 'jpeg'
            ? 'image/jpeg'
            : verified.format === 'png'
              ? 'image/png'
              : verified.format === 'webp'
                ? 'image/webp'
                : null;
      if (!verifiedMimeType || input.body.format !== verified.format) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Wallpaper format does not match the verified provider asset.',
        });
      }
      validateMediaUpload(
        {
          mimeType: verifiedMimeType,
          byteLength: verified.byteLength,
          width: verified.width,
          height: verified.height,
        },
        WALLPAPER_UPLOAD_POLICY,
      );
      if (verified.width > MAX_WALLPAPER_EDGE || verified.height > MAX_WALLPAPER_EDGE) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Wallpaper dimensions exceed the normalized upload limit.',
        });
      }
      if (verified.secureUrl !== input.body.secureUrl) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Wallpaper URL does not match the provider asset.',
        });
      }
      const secureUrl = new URL(input.body.secureUrl);
      if (
        secureUrl.protocol !== 'https:' ||
        (secureUrl.hostname !== 'res.cloudinary.com' &&
          !secureUrl.hostname.endsWith('.res.cloudinary.com'))
      ) {
        throw new ORPCError('BAD_REQUEST', { message: 'Wallpaper asset URL is not trusted.' });
      }
      const rows = await context.db.$queryRaw<
        Array<{
          id: string;
          public_id: string;
          secure_url: string;
          format: string;
          byte_length: number;
          width: number;
          height: number;
        }>
      >`
        insert into public.user_wallpaper_assets
          (user_id, public_id, secure_url, format, byte_length, width, height)
        values (${context.user.id}::uuid, ${input.body.publicId}, ${verified.secureUrl},
                ${verified.format}, ${verified.byteLength}, ${verified.width}, ${verified.height})
        on conflict (user_id, public_id) do update set
          secure_url = excluded.secure_url, format = excluded.format,
          byte_length = excluded.byte_length, width = excluded.width, height = excluded.height
        where user_wallpaper_assets.deletion_state = 'active'
        returning id, public_id, secure_url, format, byte_length, width, height
      `;
      const asset = rows[0];
      if (!asset) {
        throw new ORPCError('CONFLICT', {
          message:
            'This wallpaper asset is pending or has completed deletion and cannot be registered again.',
        });
      }
      return {
        assetId: asset.id,
        publicId: asset.public_id,
        secureUrl: asset.secure_url,
        format: asset.format,
        byteLength: asset.byte_length,
        width: asset.width,
        height: asset.height,
      };
    }),
  reconcileWallpaperAsset: impl.reconcileWallpaperAsset
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
      }
      if (!context.db) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database context not initialized',
        });
      }
      validateMediaUpload(input.body, WALLPAPER_UPLOAD_POLICY);
      const ownerPrefix = `gurudevi/${context.user.id}/wallpapers/`;
      if (!input.body.publicId.startsWith(ownerPrefix)) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Wallpaper asset is not owned by this account.',
        });
      }
      const secureUrl = new URL(input.body.secureUrl);
      if (
        secureUrl.protocol !== 'https:' ||
        (secureUrl.hostname !== 'res.cloudinary.com' &&
          !secureUrl.hostname.endsWith('.res.cloudinary.com')) ||
        !['avif', 'jpg', 'jpeg', 'png', 'webp'].includes(input.body.format)
      ) {
        throw new ORPCError('BAD_REQUEST', { message: 'Wallpaper metadata is not trusted.' });
      }
      const verified = await verifyCloudinaryWallpaperAsset({
        cloudName: requiredEnv('CLOUDINARY_CLOUD_NAME'),
        apiKey: requiredEnv('CLOUDINARY_API_KEY'),
        apiSecret: requiredEnv('CLOUDINARY_API_SECRET'),
        publicId: input.body.publicId,
      });
      if (
        verified.secureUrl !== input.body.secureUrl ||
        verified.format !== input.body.format ||
        verified.byteLength !== input.body.byteLength ||
        verified.width !== input.body.width ||
        verified.height !== input.body.height
      ) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Wallpaper metadata does not match the provider asset.',
        });
      }

      const state = await context.db.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<
          Array<{
            id: string;
            public_id: string;
            secure_url: string;
            format: string;
            byte_length: number;
            width: number;
            height: number;
            deletion_state: string;
          }>
        >`
          select id, public_id, secure_url, format, byte_length, width, height, deletion_state
          from public.user_wallpaper_assets
          where user_id = ${context.user.id}::uuid and public_id = ${input.body.publicId}
          for update
        `;
        let asset = rows[0];
        if (asset?.deletion_state === 'active') {
          return {
            status: 'registered' as const,
            asset: {
              assetId: asset.id,
              publicId: asset.public_id,
              secureUrl: asset.secure_url,
              format: asset.format,
              byteLength: asset.byte_length,
              width: asset.width,
              height: asset.height,
            },
          };
        }
        if (asset?.deletion_state === 'deleted') return { status: 'cleaned' as const };

        const references = await tx.$queryRaw<Array<{ workspace_id: string }>>`
          select workspace_id
          from public.user_workspace_layouts
          where user_id = ${context.user.id}::uuid
            and surface_metadata_jsonb @> jsonb_build_object(
              '__workspaceAppearance',
              jsonb_build_object('wallpaper', jsonb_build_object('publicId', ${input.body.publicId}))
            )
          limit 1
        `;
        if (references[0]) return { status: 'referenced' as const };

        if (!asset) {
          await tx.$executeRaw`
            insert into public.user_wallpaper_assets
              (user_id, public_id, secure_url, format, byte_length, width, height, deletion_state)
            values (${context.user.id}::uuid, ${input.body.publicId}, ${input.body.secureUrl},
                    ${input.body.format}, ${input.body.byteLength}, ${input.body.width},
                    ${input.body.height}, 'pending')
            on conflict (user_id, public_id) do nothing
          `;
          const inserted = await tx.$queryRaw<typeof rows>`
            select id, public_id, secure_url, format, byte_length, width, height, deletion_state
            from public.user_wallpaper_assets
            where user_id = ${context.user.id}::uuid and public_id = ${input.body.publicId}
            for update
          `;
          asset = inserted[0];
          if (asset?.deletion_state === 'active') {
            return {
              status: 'registered' as const,
              asset: {
                assetId: asset.id,
                publicId: asset.public_id,
                secureUrl: asset.secure_url,
                format: asset.format,
                byteLength: asset.byte_length,
                width: asset.width,
                height: asset.height,
              },
            };
          }
          if (asset?.deletion_state === 'deleted') return { status: 'cleaned' as const };
        }
        return { status: 'pending' as const };
      });

      if (state.status === 'registered') return state;
      if (state.status === 'cleaned') return state;
      if (state.status === 'referenced') {
        throw new ORPCError('CONFLICT', {
          message: 'This wallpaper is still referenced and cannot be cleaned up.',
        });
      }

      await destroyCloudinaryWallpaperAsset({
        cloudName: requiredEnv('CLOUDINARY_CLOUD_NAME'),
        apiKey: requiredEnv('CLOUDINARY_API_KEY'),
        apiSecret: requiredEnv('CLOUDINARY_API_SECRET'),
        publicId: input.body.publicId,
      });
      await context.db.$executeRaw`
        update public.user_wallpaper_assets
        set deletion_state = 'deleted'
        where user_id = ${context.user.id}::uuid
          and public_id = ${input.body.publicId}
          and deletion_state = 'pending'
      `;
      return { status: 'cleaned' as const };
    }),
  deleteWallpaperAsset: impl.deleteWallpaperAsset
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
      }
      if (!context.db) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database context not initialized',
        });
      }
      const ownerPrefix = `gurudevi/${context.user.id}/wallpapers/`;
      if (!input.body.publicId.startsWith(ownerPrefix)) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Wallpaper asset is not owned by this account.',
        });
      }
      const deletionState = await context.db.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<Array<{ public_id: string; deletion_state: string }>>`
          select public_id, deletion_state from public.user_wallpaper_assets
          where user_id = ${context.user.id}::uuid and public_id = ${input.body.publicId}
          for update
        `;
        const asset = rows[0];
        if (!asset) return 'missing' as const;
        if (asset.deletion_state === 'deleted') return 'deleted' as const;

        if (asset.deletion_state === 'active') {
          const references = await tx.$queryRaw<Array<{ workspace_id: string }>>`
            select workspace_id
            from public.user_workspace_layouts
            where user_id = ${context.user.id}::uuid
              and surface_metadata_jsonb @> jsonb_build_object(
                '__workspaceAppearance',
                jsonb_build_object('wallpaper', jsonb_build_object('publicId', ${input.body.publicId}))
              )
            limit 1
          `;
          if (references[0]) return 'referenced' as const;

          await tx.$executeRaw`
            update public.user_wallpaper_assets
            set deletion_state = 'pending'
            where user_id = ${context.user.id}::uuid and public_id = ${input.body.publicId}
          `;
        }
        return 'pending' as const;
      });

      if (deletionState === 'missing' || deletionState === 'deleted') {
        return { deleted: true as const };
      }
      if (deletionState === 'referenced') {
        throw new ORPCError('CONFLICT', {
          message: 'Clear this wallpaper from every workspace before deleting it.',
        });
      }

      await destroyCloudinaryWallpaperAsset({
        cloudName: requiredEnv('CLOUDINARY_CLOUD_NAME'),
        apiKey: requiredEnv('CLOUDINARY_API_KEY'),
        apiSecret: requiredEnv('CLOUDINARY_API_SECRET'),
        publicId: input.body.publicId,
      });
      await context.db.$executeRaw`
        update public.user_wallpaper_assets
        set deletion_state = 'deleted'
        where user_id = ${context.user.id}::uuid
          and public_id = ${input.body.publicId}
          and deletion_state = 'pending'
      `;
      return { deleted: true as const };
    }),
});
