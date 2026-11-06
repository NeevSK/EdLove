import type { AppContractClient } from '@repo/core/api/v1/contract';
import { createAuthenticatedV1Client } from '@repo/core/api/v1/client';
import { auth } from '@repo/core/auth';

export const v1Client: AppContractClient = createAuthenticatedV1Client({
  origin: process.env.EXPO_PUBLIC_API_URL,
  getAccessToken: async () => (await auth.getSession())?.access_token ?? null,
});
