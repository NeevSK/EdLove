import { createHash, createHmac } from 'node:crypto';
import type { ServerConfig } from '../config';

export interface PresignedUploadResult {
  readonly uploadUrl: string;
  readonly objectKey: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly expiresAt: string;
}

export interface PresignedDownloadResult {
  readonly downloadUrl: string;
  readonly expiresAt: string;
}

export interface ObjectHeadResult {
  readonly exists: boolean;
  readonly bytes?: number;
}

export interface ObjectStoragePort {
  createPresignedUpload(input: {
    readonly key: string;
    readonly contentType: string;
    readonly bytes: number;
    readonly expiresInSeconds: number;
  }): Promise<PresignedUploadResult>;

  createPresignedDownload(input: {
    readonly key: string;
    readonly expiresInSeconds: number;
  }): Promise<PresignedDownloadResult>;

  headObject(key: string): Promise<ObjectHeadResult>;
}

const sha256Hex = (data: string) => createHash('sha256').update(data).digest('hex');
const hmac = (key: Buffer | string, data: string) => createHmac('sha256', key).update(data).digest();

function presignS3Url(params: {
  method: 'PUT' | 'GET' | 'HEAD';
  endpoint: string;
  bucket: string;
  key: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresInSeconds: number;
  now?: Date;
}): { url: string; expiresAt: string } {
  const now = params.now ?? new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const base = new URL(params.endpoint);
  const canonicalUri = `/${params.bucket}/${params.key.replace(/^\/+/, '')}`;

  const query = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${params.accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(params.expiresInSeconds),
    'X-Amz-SignedHeaders': 'host',
  });
  query.sort();

  const canonicalRequest = [
    params.method,
    canonicalUri,
    query.toString(),
    `host:${base.host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = hmac(`AWS4${params.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  query.set('X-Amz-Signature', signature);
  const expiresAt = new Date(now.getTime() + params.expiresInSeconds * 1000).toISOString();

  return {
    url: `${base.origin}${canonicalUri}?${query.toString()}`,
    expiresAt,
  };
}

export function createR2StorageAdapter(options: {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}): ObjectStoragePort {
  return {
    async createPresignedUpload({ key, contentType, expiresInSeconds }) {
      const { url, expiresAt } = presignS3Url({
        method: 'PUT',
        ...options,
        key,
        expiresInSeconds,
      });
      return {
        uploadUrl: url,
        objectKey: key,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
        expiresAt,
      };
    },
    async createPresignedDownload({ key, expiresInSeconds }) {
      const { url, expiresAt } = presignS3Url({
        method: 'GET',
        ...options,
        key,
        expiresInSeconds,
      });
      return { downloadUrl: url, expiresAt };
    },
    async headObject(key) {
      const { url } = presignS3Url({
        method: 'HEAD',
        ...options,
        key,
        expiresInSeconds: 60,
      });
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 404) return { exists: false };
      if (!res.ok) throw new Error(`R2 HEAD failed (${res.status})`);
      const len = Number(res.headers.get('content-length'));
      return { exists: true, bytes: Number.isFinite(len) ? len : undefined };
    },
  };
}

export function createSupabaseSignedStorageAdapter(options: {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
}): ObjectStoragePort {
  const base = options.supabaseUrl.replace(/\/+$/, '');
  const authHeaders = {
    apikey: options.serviceRoleKey,
    Authorization: `Bearer ${options.serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  return {
    async createPresignedUpload({ key, contentType, expiresInSeconds }) {
      const res = await fetch(
        `${base}/storage/v1/object/upload/sign/${options.bucket}/${key}`,
        { method: 'POST', headers: authHeaders, body: JSON.stringify({}) },
      );
      if (!res.ok) throw new Error(`Supabase signed upload failed (${res.status})`);
      const data = (await res.json()) as { url?: string };
      const signedPath = data.url ?? '';
      const uploadUrl = signedPath.startsWith('http') ? signedPath : `${base}/storage/v1${signedPath}`;
      return {
        uploadUrl,
        objectKey: key,
        headers: { 'Content-Type': contentType },
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      };
    },
    async createPresignedDownload({ key, expiresInSeconds }) {
      const res = await fetch(
        `${base}/storage/v1/object/sign/${options.bucket}/${key}`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ expiresIn: expiresInSeconds }),
        },
      );
      if (!res.ok) throw new Error(`Supabase signed download failed (${res.status})`);
      const data = (await res.json()) as { signedURL?: string };
      const signedPath = data.signedURL ?? '';
      const downloadUrl = signedPath.startsWith('http')
        ? signedPath
        : `${base}/storage/v1${signedPath}`;
      return {
        downloadUrl,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      };
    },
    async headObject(key) {
      const res = await fetch(`${base}/storage/v1/object/info/${options.bucket}/${key}`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (res.status === 404) return { exists: false };
      if (!res.ok) throw new Error(`Supabase object info failed (${res.status})`);
      const data = (await res.json()) as { metadata?: { size?: number } };
      return { exists: true, bytes: data.metadata?.size };
    },
  };
}

export function createConfiguredObjectStorage(config: ServerConfig): ObjectStoragePort | null {
  if (config.ASSET_STORAGE_DRIVER === 'r2') {
    return createR2StorageAdapter({
      endpoint: config.R2_ENDPOINT!,
      bucket: config.R2_BUCKET!,
      accessKeyId: config.R2_ACCESS_KEY_ID!,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY!,
    });
  }
  if (config.ASSET_STORAGE_DRIVER === 'supabase') {
    return createSupabaseSignedStorageAdapter({
      supabaseUrl: config.SUPABASE_URL!,
      serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY!,
      bucket: config.SUPABASE_STORAGE_BUCKET,
    });
  }
  return null;
}
