import { classifyRouteIntent } from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
import { Effect } from 'effect';

export type AuthCallbackIntent =
  | Readonly<{ kind: 'code'; code: string }>
  | Readonly<{ kind: 'providerError'; code: string | null }>
  | Readonly<{ kind: 'rejected'; reason: AuthCallbackRejectionReason }>;

export type AuthCallbackRejectionReason =
  | 'invalid-route'
  | 'missing-credential'
  | 'duplicate-credential'
  | 'mixed-credentials'
  | 'url-token';

const URL_TOKEN_NAMES = new Set(['access_token', 'refresh_token', 'id_token', 'token']);

function values(params: URLSearchParams, name: string): string[] {
  return params.getAll(name).filter((value) => value.length > 0);
}

export function classifyAuthCallback(url: string): AuthCallbackIntent {
  return Effect.runSync(
    Effect.sync(() => {
      if (classifyRouteIntent(url).kind !== 'authCallback') {
        return { kind: 'rejected', reason: 'invalid-route' } as const;
      }

      const parsed = new URL(url);
      const query = parsed.searchParams;
      const fragment = new URLSearchParams(parsed.hash.slice(1));
      const credentials = ['code', ...URL_TOKEN_NAMES].flatMap((name) => [
        ...values(query, name),
        ...values(fragment, name),
      ]);

      if (credentials.length > 1) return { kind: 'rejected', reason: 'mixed-credentials' } as const;
      if (
        Array.from(URL_TOKEN_NAMES).some(
          (name) => values(query, name).length || values(fragment, name).length,
        )
      ) {
        return { kind: 'rejected', reason: 'url-token' } as const;
      }

      const codes = [...values(query, 'code'), ...values(fragment, 'code')];
      if (codes.length > 1) return { kind: 'rejected', reason: 'duplicate-credential' } as const;
      if (codes.length === 1) return { kind: 'code', code: codes[0]! } as const;

      const errors = [...values(query, 'error'), ...values(fragment, 'error')];
      if (errors.length === 1) return { kind: 'providerError', code: errors[0]! } as const;
      return { kind: 'rejected', reason: 'missing-credential' } as const;
    }),
  );
}
