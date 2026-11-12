import type { AppContractClient } from '@repo/core/api/v1/contract';
import { createAuthenticatedV1Client, createV1QueryUtils } from '@repo/core/api/v1/client';
import { auth } from '@repo/core/auth';

export const v1Client: AppContractClient = createAuthenticatedV1Client({
  origin: process.env.EXPO_PUBLIC_API_URL,
  getAccessToken: async () => (await auth.getSession())?.access_token ?? null,
});

/**
 * Query and mutation options for every v1 procedure, for `useQuery` and `useMutation`:
 * `useMutation(v1.identity.createInitialBond.mutationOptions())`. Retry, backoff and failure
 * feedback come from the QueryClient policy (src/lib/queryClient.ts).
 */
export const v1 = createV1QueryUtils(v1Client);
