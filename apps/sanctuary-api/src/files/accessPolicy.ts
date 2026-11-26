import type { FilePurpose } from '@repo/core/logic/files/filePolicy';

export type AssetVisibility = 'public' | 'institution' | 'private';

export type AssetAccessDecision =
  | { readonly mode: 'public_cdn'; readonly url: string }
  | { readonly mode: 'signed_url'; readonly ttlSeconds: number };

export interface AssetAccessPolicyConfig {
  readonly publicCdnUrl?: string;
  readonly signedUrlTtlSeconds: number;
}

/**
 * Configurable access policy for asset downloads:
 * - Public library resources use `public_cdn` when `publicCdnUrl` is configured.
 * - Private, institution-scoped, draft, and submission assets always use short-lived signed URLs.
 */
export function resolveAssetAccessPolicy(
  input: {
    readonly objectKey: string;
    readonly visibility: AssetVisibility;
    readonly purpose: FilePurpose;
  },
  config: AssetAccessPolicyConfig,
): AssetAccessDecision {
  const isPublicLibrary =
    input.visibility === 'public' &&
    (input.purpose === 'library_resource' || input.purpose === 'h5p_package');

  if (isPublicLibrary && config.publicCdnUrl) {
    const base = config.publicCdnUrl.replace(/\/+$/, '');
    const key = input.objectKey.replace(/^\/+/, '');
    return { mode: 'public_cdn', url: `${base}/${key}` };
  }

  return {
    mode: 'signed_url',
    ttlSeconds: config.signedUrlTtlSeconds,
  };
}
