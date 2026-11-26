import { z } from 'zod';

const browserOrigins = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(
    z.array(
      z.url().refine((origin) => new URL(origin).origin === origin, {
        message: 'A browser origin has a scheme and host, with no path or trailing slash',
      }),
    ),
  );

const milliseconds = (defaultValue: number) =>
  z.coerce.number().int().min(1).max(600_000).default(defaultValue);

const environmentSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_REQUEST_TIMEOUT_MS: milliseconds(10_000),
    API_STREAM_TIMEOUT_MS: milliseconds(120_000),
    NODE_HEADERS_TIMEOUT_MS: milliseconds(10_000),
    NODE_REQUEST_TIMEOUT_MS: milliseconds(30_000),
    NODE_KEEP_ALIVE_TIMEOUT_MS: milliseconds(5_000),
    NODE_MAX_HEADER_BYTES: z.coerce.number().int().min(1024).max(65_536).default(16_384),
    NODE_MAX_HEADERS: z.coerce.number().int().min(1).max(2000).default(100),
    NODE_MAX_CONNECTIONS: z.coerce.number().int().min(1).max(10000).default(1000),
    API_MAX_UNKNOWN_LENGTH_REQUESTS: z.coerce.number().int().min(1).max(1000).default(8),
    API_MAX_AUTHENTICATION_REQUESTS: z.coerce.number().int().min(1).max(1000).default(8),
    API_MAX_IN_FLIGHT_REQUESTS: z.coerce.number().int().min(1).max(1000).default(32),
    SHUTDOWN_TIMEOUT_MS: milliseconds(15_000),
    API_AUTHENTICATION: z.enum(['disabled', 'required']).default('disabled'),
    DATABASE_URL: z.url().optional(),
    AUTH_ISSUER: z.url().optional(),
    AUTH_JWKS_URL: z.url().optional(),
    AUTH_AUDIENCE: z.string().trim().min(1).optional(),
    DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
    DB_CONNECT_TIMEOUT_MS: milliseconds(5000),
    DB_STATEMENT_TIMEOUT_MS: milliseconds(5000),
    DB_LOCK_TIMEOUT_MS: milliseconds(2000),
    DB_IDLE_TRANSACTION_TIMEOUT_MS: milliseconds(10000),
    API_ACCOUNT_REQUESTS_PER_MINUTE: z.coerce.number().int().min(1).max(10000).default(120),
    // Comma-separated web origins allowed to call /api/v1. Calls carry bearer tokens, never cookies.
    API_BROWSER_ORIGINS: browserOrigins,
    // Ed25519 private key (PKCS#8 PEM) for offline permission snapshots; held in Doppler.
    SNAPSHOT_SIGNING_PRIVATE_KEY: z.string().trim().min(1).optional(),
    // The PowerSync instance devices sync with, and the private ES256 JWK (JSON) that signs
    // their sync grants; both held in Doppler. Without both, identity.syncGrant is unavailable.
    POWERSYNC_URL: z.url().optional(),
    POWERSYNC_SIGNING_JWK: z.string().trim().min(1).optional(),
    // Configurable asset storage policy (R2 or Supabase Storage presigned URLs).
    ASSET_STORAGE_DRIVER: z.enum(['disabled', 'r2', 'supabase']).default('disabled'),
    ASSET_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(30).max(86_400).default(900),
    ASSET_PUBLIC_CDN_URL: z.url().optional(),
    R2_ENDPOINT: z.url().optional(),
    R2_ACCESS_KEY_ID: z.string().trim().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().trim().min(1).optional(),
    R2_BUCKET: z.string().trim().min(1).optional(),
    SUPABASE_URL: z.url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),
    SUPABASE_STORAGE_BUCKET: z.string().trim().min(1).default('files'),
  })
  .refine((config) => config.NODE_HEADERS_TIMEOUT_MS <= config.NODE_REQUEST_TIMEOUT_MS, {
    path: ['NODE_HEADERS_TIMEOUT_MS'],
    message: 'Header timeout must not exceed the request receive timeout',
  })
  .refine(
    (config) => config.NODE_ENV !== 'production' || config.API_AUTHENTICATION === 'required',
    {
      path: ['API_AUTHENTICATION'],
      message: 'Production requires authentication',
    },
  )
  .refine(
    (config) =>
      config.API_AUTHENTICATION !== 'required' ||
      Boolean(
        config.DATABASE_URL && config.AUTH_ISSUER && config.AUTH_JWKS_URL && config.AUTH_AUDIENCE,
      ),
    {
      path: ['API_AUTHENTICATION'],
      message:
        'Required authentication needs database, issuer, JWKS URL and audience configuration',
    },
  )
  .refine(
    (config) =>
      config.NODE_ENV !== 'production' ||
      config.API_BROWSER_ORIGINS.every((origin) => origin.startsWith('https://')),
    {
      path: ['API_BROWSER_ORIGINS'],
      message: 'Production browser origins must use HTTPS',
    },
  )
  .refine(
    (config) => config.NODE_ENV !== 'production' || Boolean(config.SNAPSHOT_SIGNING_PRIVATE_KEY),
    {
      path: ['SNAPSHOT_SIGNING_PRIVATE_KEY'],
      message: 'Production requires the permission snapshot signing key',
    },
  )
  // Without both, identity.syncCredentials answers SERVICE_UNAVAILABLE; half a configuration is a mistake.
  .refine((config) => Boolean(config.POWERSYNC_URL) === Boolean(config.POWERSYNC_SIGNING_JWK), {
    path: ['POWERSYNC_SIGNING_JWK'],
    message: 'PowerSync needs both its URL and its signing key, or neither',
  })
  .refine(
    (config) =>
      config.ASSET_STORAGE_DRIVER !== 'r2' ||
      Boolean(
        config.R2_ENDPOINT &&
          config.R2_ACCESS_KEY_ID &&
          config.R2_SECRET_ACCESS_KEY &&
          config.R2_BUCKET,
      ),
    {
      path: ['ASSET_STORAGE_DRIVER'],
      message: 'R2 storage driver requires R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET',
    },
  )
  .refine(
    (config) =>
      config.ASSET_STORAGE_DRIVER !== 'supabase' ||
      Boolean(config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY),
    {
      path: ['ASSET_STORAGE_DRIVER'],
      message: 'Supabase storage driver requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    },
  );

export type ServerConfig = z.infer<typeof environmentSchema>;

export function readServerConfig(environment: Record<string, string | undefined>) {
  return environmentSchema.parse(environment);
}
