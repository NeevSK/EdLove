import {
  type ChannelInboundEnvelope,
  ChannelInboundEnvelopeSchema,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;

export type ChannelIngressAcceptance = 'accepted' | 'duplicate';

type IngressRow = { id: string };

/**
 * Attempts durable acceptance before an adapter acknowledges a provider. The
 * unique provider event/replay keys make all later processing repairable.
 */
export async function persistChannelIngress(
  candidate: ChannelInboundEnvelope,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<ChannelIngressAcceptance> {
  const envelope = ChannelInboundEnvelopeSchema.parse(candidate);
  const rows = await queryRows<IngressRow>(
    `with channel_identity as (
       insert into public.channel_identities (provider, external_subject_key, state)
       values ($1, $2, 'verified')
       on conflict (provider, external_subject_key) do update set updated_at = now()
       returning id
     )
     insert into public.channel_ingress_events
      (provider, provider_event_id, replay_key, channel_identity_id, endpoint_kind, payload_kind,
       verification_ref, payload_fingerprint, correlation_id, received_at, status)
     select $1, $3, $4, channel_identity.id, $5, $6, $7, $8, $9::uuid, $10::timestamptz, 'accepted'
     from channel_identity
     on conflict do nothing
     returning id`,
    [
      envelope.provider,
      envelope.externalSubjectKey,
      envelope.providerEventId,
      envelope.replayKey,
      envelope.endpointKind,
      envelope.payloadKind,
      envelope.verificationRef,
      envelope.payloadFingerprint,
      envelope.correlationId,
      envelope.receivedAt,
    ],
  );
  return rows.length === 1 ? 'accepted' : 'duplicate';
}
