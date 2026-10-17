import {
  type ChannelAiProposal,
  ChannelAiProposalSchema,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;

type ProposalRow = {
  id: string;
  account_id: string | null;
  channel_identity_id: string | null;
  media_job_id: string | null;
  capability: string;
  proposal_ref: string;
  payload_fingerprint: string;
  status: ChannelAiProposal['status'];
  expires_at: Date | string;
  confirmed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type ReviewChannelAiProposalRequest = Readonly<{
  accountId: string;
  proposalId: string;
  payloadFingerprint: string;
  decision: 'confirmed' | 'rejected';
  channelIdentityId?: string;
}>;

function date(value: Date | string): string {
  return new Date(value).toISOString();
}

function mapProposal(row: ProposalRow): ChannelAiProposal {
  return ChannelAiProposalSchema.parse({
    id: row.id,
    accountId: row.account_id,
    channelIdentityId: row.channel_identity_id,
    mediaJobId: row.media_job_id,
    capability: row.capability,
    proposalRef: row.proposal_ref,
    payloadFingerprint: row.payload_fingerprint,
    status: row.status,
    expiresAt: date(row.expires_at),
    confirmedAt: row.confirmed_at ? date(row.confirmed_at) : null,
    createdAt: date(row.created_at),
    updatedAt: date(row.updated_at),
  });
}

/**
 * Records a human decision over an immutable proposal reference. This never
 * executes the proposed capability; a separate normal Sanctuary command must
 * perform any resulting domain action.
 */
export async function reviewChannelAiProposal(
  request: ReviewChannelAiProposalRequest,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<ChannelAiProposal | null> {
  const rows = await queryRows<ProposalRow>(
    `update public.channel_ai_proposals as proposal
        set status = $4,
            confirmed_at = case when $4 = 'confirmed' then now() else null end
      where proposal.id = $1::uuid
        and proposal.account_id = $2::uuid
        and proposal.payload_fingerprint = $3
        and proposal.status = 'pending_confirmation'
        and proposal.expires_at > now()
        and ($5::uuid is null or (
          proposal.channel_identity_id = $5::uuid
          and exists (
            select 1 from public.channel_identities as identity
             where identity.id = $5::uuid
               and identity.account_id = proposal.account_id
               and identity.state = 'linked'
               and identity.revoked_at is null
          )
        ))
    returning proposal.id, proposal.account_id, proposal.channel_identity_id, proposal.media_job_id,
      proposal.capability, proposal.proposal_ref, proposal.payload_fingerprint, proposal.status,
      proposal.expires_at, proposal.confirmed_at, proposal.created_at, proposal.updated_at`,
    [
      request.proposalId,
      request.accountId,
      request.payloadFingerprint,
      request.decision,
      request.channelIdentityId ?? null,
    ],
  );
  return rows[0] ? mapProposal(rows[0]) : null;
}
