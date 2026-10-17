import crypto from 'node:crypto';
import {
  type ChannelMediaJob,
  ChannelMediaJobSchema,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;

type MediaJobRow = {
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

export type ClaimedChannelMediaJob = Readonly<{
  job: ChannelMediaJob;
  processingToken: string;
}>;

export type ClaimChannelMediaJobRequest = Readonly<{
  now: Date;
  leaseSeconds: number;
}>;

export type ChannelMediaScanDecision = Readonly<{
  jobId: string;
  processingToken: string;
  status: 'ready' | 'quarantined' | 'failed';
  errorCode: string | null;
  now: Date;
}>;

function mapMediaJob(row: MediaJobRow): ChannelMediaJob {
  return ChannelMediaJobSchema.parse({
    id: row.id,
    ingressEventId: row.ingress_event_id,
    accountId: row.account_id,
    channelIdentityId: row.channel_identity_id,
    mediaKind: row.media_kind,
    storageRef: row.storage_ref,
    contentFingerprint: row.content_fingerprint,
    status: row.status,
    expiresAt: new Date(row.expires_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  });
}

function validateLeaseSeconds(leaseSeconds: number): void {
  if (!Number.isInteger(leaseSeconds) || leaseSeconds < 1 || leaseSeconds > 300) {
    throw new Error('Channel media lease must be an integer between 1 and 300 seconds.');
  }
}

function validateDecision(decision: ChannelMediaScanDecision): void {
  if (decision.status === 'failed' && !decision.errorCode) {
    throw new Error('A failed channel media job requires an error code.');
  }
  if (decision.errorCode && !/^[A-Z][A-Z0-9_]{0,159}$/.test(decision.errorCode)) {
    throw new Error('Channel media error codes must be bounded uppercase identifiers.');
  }
}

/**
 * Claims the oldest unexpired queued job with a short, opaque lease. It makes
 * no provider, storage, or scanner call; a later worker must own the returned
 * token to write one terminal decision.
 */
export async function claimNextChannelMediaJob(
  request: ClaimChannelMediaJobRequest,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<ClaimedChannelMediaJob | null> {
  validateLeaseSeconds(request.leaseSeconds);
  const processingToken = crypto.randomUUID();
  const rows = await queryRows<MediaJobRow>(
    `with candidate as (
       select id
         from public.channel_media_jobs
        where status = 'queued'
          and expires_at > $1::timestamptz
        order by created_at asc
        for update skip locked
        limit 1
     )
     update public.channel_media_jobs as job
        set status = 'downloading',
            attempts = attempts + 1,
            locked_until = $1::timestamptz + make_interval(secs => $2::integer),
            processing_token = $3::uuid
       from candidate
      where job.id = candidate.id
      returning job.id, job.ingress_event_id, job.account_id, job.channel_identity_id,
                job.media_kind, job.storage_ref, job.content_fingerprint, job.status,
                job.expires_at, job.created_at, job.updated_at`,
    [request.now.toISOString(), request.leaseSeconds, processingToken],
  );
  const row = rows[0];
  return row ? { job: mapMediaJob(row), processingToken } : null;
}

/**
 * Settles a claimed job exactly once. A missing/expired/mismatched lease is a
 * no-op, preventing stale workers from overriding a newer outcome. Failed and
 * quarantined jobs remain terminal; this module never requeues them.
 */
export async function recordChannelMediaScanDecision(
  decision: ChannelMediaScanDecision,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<ChannelMediaJob | null> {
  validateDecision(decision);
  const rows = await queryRows<MediaJobRow>(
    `update public.channel_media_jobs
        set status = $2,
            last_error_code = $3,
            locked_until = null,
            processing_token = null
      where id = $1::uuid
        and status = 'downloading'
        and processing_token = $4::uuid
        and locked_until > $5::timestamptz
        and expires_at > $5::timestamptz
      returning id, ingress_event_id, account_id, channel_identity_id, media_kind,
                storage_ref, content_fingerprint, status, expires_at, created_at, updated_at`,
    [
      decision.jobId,
      decision.status,
      decision.errorCode,
      decision.processingToken,
      decision.now.toISOString(),
    ],
  );
  return rows[0] ? mapMediaJob(rows[0]) : null;
}
