import crypto from 'node:crypto';
import {
  type ChannelAiProposal,
  ChannelAiProposalSchema,
  type ChannelMediaJob,
  ChannelMediaJobSchema,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;

export type QueueChannelMediaJobRequest = Readonly<{
  ingressEventId: string;
  accountId: string | null;
  channelIdentityId: string | null;
  mediaKind: ChannelMediaJob['mediaKind'];
  storageRef: string;
  contentFingerprint: string;
  expiresAt: string;
}>;

export type CreateChannelAiProposalRequest = Readonly<{
  accountId: string | null;
  channelIdentityId: string | null;
  mediaJobId: string;
  capability: string;
  proposalRef: string;
  payloadFingerprint: string;
  expiresAt: string;
}>;

type MediaRow = {
  id: string;
  ingress_event_id: string;
  account_id: string | null;
  channel_identity_id: string | null;
  media_kind: ChannelMediaJob['mediaKind'];
  storage_ref: string;
  content_fingerprint: string;
  status: ChannelMediaJob['status'];
  expires_at: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
};

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

function date(value: Date | string): string {
  return new Date(value).toISOString();
}

function mapMedia(row: MediaRow): ChannelMediaJob {
  return ChannelMediaJobSchema.parse({
    id: row.id,
    ingressEventId: row.ingress_event_id,
    accountId: row.account_id,
    channelIdentityId: row.channel_identity_id,
    mediaKind: row.media_kind,
    storageRef: row.storage_ref,
    contentFingerprint: row.content_fingerprint,
    status: row.status,
    expiresAt: date(row.expires_at),
    createdAt: date(row.created_at),
    updatedAt: date(row.updated_at),
  });
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

/** Queues a quarantinable server-owned media job without fetching any provider media. */
export async function queueChannelMediaJob(
  request: QueueChannelMediaJobRequest,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<ChannelMediaJob> {
  const rows = await queryRows<MediaRow>(
    `insert into public.channel_media_jobs
      (id, ingress_event_id, account_id, channel_identity_id, media_kind, storage_ref,
       content_fingerprint, status, expires_at)
     values ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7, 'queued', $8::timestamptz)
     on conflict (ingress_event_id) do update set ingress_event_id = excluded.ingress_event_id
     returning id, ingress_event_id, account_id, channel_identity_id, media_kind, storage_ref,
       content_fingerprint, status, expires_at, created_at, updated_at`,
    [
      crypto.randomUUID(),
      request.ingressEventId,
      request.accountId,
      request.channelIdentityId,
      request.mediaKind,
      request.storageRef,
      request.contentFingerprint,
      request.expiresAt,
    ],
  );
  const mediaJob = rows[0];
  if (!mediaJob) throw new Error('Channel media job persistence returned no record.');
  return mapMedia(mediaJob);
}

/** Creates an AI proposal only after the source media job has passed quarantine and is ready. */
export async function createChannelAiProposal(
  request: CreateChannelAiProposalRequest,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<ChannelAiProposal | null> {
  const rows = await queryRows<ProposalRow>(
    `insert into public.channel_ai_proposals
      (id, account_id, channel_identity_id, media_job_id, capability, proposal_ref,
       payload_fingerprint, status, expires_at)
     select $1::uuid, $2::uuid, $3::uuid, media_job.id, $4, $5, $6,
       'pending_confirmation', $7::timestamptz
       from public.channel_media_jobs as media_job
      where media_job.id = $8::uuid
        and media_job.status = 'ready'
        and media_job.expires_at > now()
     returning id, account_id, channel_identity_id, media_job_id, capability, proposal_ref,
       payload_fingerprint, status, expires_at, confirmed_at, created_at, updated_at`,
    [
      crypto.randomUUID(),
      request.accountId,
      request.channelIdentityId,
      request.capability,
      request.proposalRef,
      request.payloadFingerprint,
      request.expiresAt,
      request.mediaJobId,
    ],
  );
  return rows[0] ? mapProposal(rows[0]) : null;
}
