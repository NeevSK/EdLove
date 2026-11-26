import { auth } from '@repo/core/auth';
import { createAuthenticatedV1Client } from '@repo/core/api/v1/client';
import type {
  AppContractClient,
  CreateInviteCodeInput,
  CreateInviteCodeResult,
  HandleAvailableInput,
  HandleAvailableResult,
  ListInviteCodesInput,
  ListInviteCodesResult,
  ProvisionInstitutionInput,
  ProvisionInstitutionResult,
  RevokeInviteCodeInput,
  RevokeInviteCodeResult,
  UpdateInstitutionInput,
  UpdateInstitutionResult,
} from '@repo/core/api/v1/contract';

const v1: AppContractClient = createAuthenticatedV1Client({
  origin: process.env.EXPO_PUBLIC_API_URL,
  getAccessToken: async () => (await auth.getSession())?.access_token ?? null,
});

/**
 * institutionsAPI
 * Typed client for all institutional governance, progressive elaboration,
 * and invitation code operations under the admitted ops.institutions domain.
 */
export const institutionsAPI = {
  /**
   * Provision a brand new institution (Day 0 fast-path).
   */
  async provision(input: ProvisionInstitutionInput): Promise<ProvisionInstitutionResult> {
    return v1.ops.institutions.provision({ body: input });
  },

  /**
   * Check whether a vanity handle slug is available in real-time.
   */
  async checkHandleAvailable(input: HandleAvailableInput): Promise<HandleAvailableResult> {
    return v1.ops.institutions.handleAvailable({ body: input });
  },

  /**
   * Progressively update school profile details (name, handle, crest, timezone, policies).
   * Note: Changing vanity handle never breaks previously printed physical QR codes.
   */
  async update(input: UpdateInstitutionInput): Promise<UpdateInstitutionResult> {
    return v1.ops.institutions.update({ body: input });
  },

  /**
   * Generate an official capacity-specific invite code (TEACH, STUDY, STAFF, GUARD).
   */
  async createInviteCode(input: CreateInviteCodeInput): Promise<CreateInviteCodeResult> {
    return v1.ops.institutions.createInviteCode({ body: input });
  },

  /**
   * List active and historical invite codes for a school with usage metrics.
   */
  async listInviteCodes(input: ListInviteCodesInput): Promise<ListInviteCodesResult> {
    return v1.ops.institutions.listInviteCodes({ body: input });
  },

  /**
   * Revoke an active invite code with immediate invalidation.
   */
  async revokeInviteCode(input: RevokeInviteCodeInput): Promise<RevokeInviteCodeResult> {
    return v1.ops.institutions.revokeInviteCode({ body: input });
  },
};
