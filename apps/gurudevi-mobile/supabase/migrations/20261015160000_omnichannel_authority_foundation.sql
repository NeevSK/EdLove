-- Requires 20261015150000_server_owned_auth_identity.sql (or its approved
-- successor): public.users.id is the only canonical account identifier here.
-- Server-owned identity, consent, and delegation facts for external channels.
-- These records attach provider identities to public.users; a provider sender
-- ID or chat ID is never an application account or an authorization grant.

create table if not exists public.channel_identities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.users(id) on delete cascade,
  provider text not null check (provider in ('whatsapp', 'telegram')),
  external_subject_key text not null,
  state text not null check (state in ('pending', 'verified', 'linked', 'suspended', 'revoked')),
  metadata jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_channel_identities_provider_subject unique (provider, external_subject_key)
);

create index if not exists idx_channel_identities_account_active
  on public.channel_identities (account_id, state)
  where revoked_at is null;

create table if not exists public.channel_link_attempts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.users(id) on delete cascade,
  provider text not null check (provider in ('whatsapp', 'telegram')),
  channel_identity_id uuid references public.channel_identities(id) on delete set null,
  nonce_hash text not null unique,
  purpose text not null check (char_length(purpose) between 1 and 120),
  state text not null check (state in ('pending', 'confirmed', 'expired', 'revoked')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_channel_link_attempt_consumption
    check ((consumed_at is null) or state = 'confirmed')
);

create index if not exists idx_channel_link_attempts_account_state
  on public.channel_link_attempts (account_id, state, expires_at desc);

create table if not exists public.channel_consent_grants (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.users(id) on delete cascade,
  channel_identity_id uuid not null references public.channel_identities(id) on delete cascade,
  purpose text not null check (char_length(purpose) between 1 and 120),
  capabilities text[] not null check (cardinality(capabilities) between 1 and 64),
  resource_scope jsonb not null default '{}'::jsonb,
  status text not null check (status in ('active', 'revoked', 'expired')),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_channel_consent_grants_identity_active
  on public.channel_consent_grants (channel_identity_id, status, expires_at)
  where revoked_at is null;

create table if not exists public.channel_delegations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.users(id) on delete cascade,
  agent_key text not null check (char_length(agent_key) between 1 and 160),
  capabilities text[] not null check (cardinality(capabilities) between 1 and 64),
  resource_scope jsonb not null default '{}'::jsonb,
  status text not null check (status in ('active', 'revoked', 'expired')),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_channel_delegations_account_agent_active
  on public.channel_delegations (account_id, agent_key, status, expires_at)
  where revoked_at is null;

create table if not exists public.channel_ingress_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('whatsapp', 'telegram')),
  provider_event_id text not null check (char_length(provider_event_id) between 1 and 256),
  replay_key text not null check (replay_key ~* '^[a-f0-9]{64}$'),
  channel_identity_id uuid references public.channel_identities(id) on delete set null,
  endpoint_kind text not null check (endpoint_kind in ('not_applicable', 'private', 'group', 'channel')),
  payload_kind text not null check (payload_kind in ('text', 'audio', 'image', 'document', 'video', 'interactive', 'status')),
  verification_ref text not null check (char_length(verification_ref) between 1 and 160),
  payload_fingerprint text not null check (payload_fingerprint ~* '^[a-f0-9]{64}$'),
  correlation_id uuid not null,
  received_at timestamptz not null,
  status text not null check (status in ('accepted', 'processing', 'processed', 'rejected', 'failed')),
  processed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_channel_ingress_provider_event unique (provider, provider_event_id),
  constraint uq_channel_ingress_provider_replay unique (provider, replay_key)
);

create index if not exists idx_channel_ingress_events_status_received
  on public.channel_ingress_events (status, received_at);

create table if not exists public.channel_delivery_intents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.users(id) on delete set null,
  provider text not null check (provider in ('whatsapp', 'telegram')),
  channel_identity_id uuid references public.channel_identities(id) on delete set null,
  endpoint_kind text not null check (endpoint_kind in ('not_applicable', 'private', 'group', 'channel')),
  operation_id uuid,
  capability text not null check (char_length(capability) between 1 and 160),
  delegation_agent_key text check (delegation_agent_key is null or char_length(delegation_agent_key) between 1 and 160),
  resource_scope jsonb not null default '{}'::jsonb,
  idempotency_key uuid not null,
  payload_ref text not null check (char_length(payload_ref) between 1 and 256),
  status text not null check (status in ('pending', 'processing', 'accepted', 'delivered', 'failed', 'unknown', 'cancelled')),
  expires_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  locked_until timestamptz,
  provider_message_id text,
  accepted_at timestamptz,
  delivered_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_channel_delivery_idempotency unique (provider, idempotency_key)
);

create index if not exists idx_channel_delivery_intents_dispatch
  on public.channel_delivery_intents (status, created_at)
  where status = 'pending';

create table if not exists public.channel_media_jobs (
  id uuid primary key default gen_random_uuid(),
  ingress_event_id uuid not null references public.channel_ingress_events(id) on delete cascade,
  account_id uuid references public.users(id) on delete set null,
  channel_identity_id uuid references public.channel_identities(id) on delete set null,
  media_kind text not null check (media_kind in ('audio', 'image', 'document', 'video')),
  storage_ref text not null check (char_length(storage_ref) between 1 and 256),
  content_fingerprint text not null check (content_fingerprint ~* '^[a-f0-9]{64}$'),
  status text not null check (status in ('queued', 'downloading', 'scanning', 'quarantined', 'ready', 'failed', 'expired')),
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0),
  locked_until timestamptz,
  processing_token uuid,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_channel_media_job_ingress unique (ingress_event_id)
);

create index if not exists idx_channel_media_jobs_status_expiry
  on public.channel_media_jobs (status, expires_at);

create index if not exists idx_channel_media_jobs_queued_dispatch
  on public.channel_media_jobs (created_at)
  where status = 'queued';

create table if not exists public.channel_ai_proposals (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.users(id) on delete set null,
  channel_identity_id uuid references public.channel_identities(id) on delete set null,
  media_job_id uuid references public.channel_media_jobs(id) on delete set null,
  capability text not null check (char_length(capability) between 1 and 160),
  proposal_ref text not null check (char_length(proposal_ref) between 1 and 256),
  payload_fingerprint text not null check (payload_fingerprint ~* '^[a-f0-9]{64}$'),
  status text not null check (status in ('pending_confirmation', 'confirmed', 'rejected', 'expired', 'failed')),
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_channel_ai_proposal_confirmation
    check ((confirmed_at is null) or status = 'confirmed')
);

create index if not exists idx_channel_ai_proposals_status_expiry
  on public.channel_ai_proposals (status, expires_at);

create or replace function public.touch_omnichannel_authority_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_channel_identities_updated_at on public.channel_identities;
create trigger trg_channel_identities_updated_at
before update on public.channel_identities
for each row execute function public.touch_omnichannel_authority_updated_at();

drop trigger if exists trg_channel_link_attempts_updated_at on public.channel_link_attempts;
create trigger trg_channel_link_attempts_updated_at
before update on public.channel_link_attempts
for each row execute function public.touch_omnichannel_authority_updated_at();

drop trigger if exists trg_channel_consent_grants_updated_at on public.channel_consent_grants;
create trigger trg_channel_consent_grants_updated_at
before update on public.channel_consent_grants
for each row execute function public.touch_omnichannel_authority_updated_at();

drop trigger if exists trg_channel_delegations_updated_at on public.channel_delegations;
create trigger trg_channel_delegations_updated_at
before update on public.channel_delegations
for each row execute function public.touch_omnichannel_authority_updated_at();

drop trigger if exists trg_channel_ingress_events_updated_at on public.channel_ingress_events;
create trigger trg_channel_ingress_events_updated_at
before update on public.channel_ingress_events
for each row execute function public.touch_omnichannel_authority_updated_at();

drop trigger if exists trg_channel_delivery_intents_updated_at on public.channel_delivery_intents;
create trigger trg_channel_delivery_intents_updated_at
before update on public.channel_delivery_intents
for each row execute function public.touch_omnichannel_authority_updated_at();

drop trigger if exists trg_channel_media_jobs_updated_at on public.channel_media_jobs;
create trigger trg_channel_media_jobs_updated_at
before update on public.channel_media_jobs
for each row execute function public.touch_omnichannel_authority_updated_at();

drop trigger if exists trg_channel_ai_proposals_updated_at on public.channel_ai_proposals;
create trigger trg_channel_ai_proposals_updated_at
before update on public.channel_ai_proposals
for each row execute function public.touch_omnichannel_authority_updated_at();

alter table public.channel_identities enable row level security;
alter table public.channel_link_attempts enable row level security;
alter table public.channel_consent_grants enable row level security;
alter table public.channel_delegations enable row level security;
alter table public.channel_ingress_events enable row level security;
alter table public.channel_delivery_intents enable row level security;
alter table public.channel_media_jobs enable row level security;
alter table public.channel_ai_proposals enable row level security;

revoke all on public.channel_identities from anon, authenticated;
revoke all on public.channel_link_attempts from anon, authenticated;
revoke all on public.channel_consent_grants from anon, authenticated;
revoke all on public.channel_delegations from anon, authenticated;
revoke all on public.channel_ingress_events from anon, authenticated;
revoke all on public.channel_delivery_intents from anon, authenticated;
revoke all on public.channel_media_jobs from anon, authenticated;
revoke all on public.channel_ai_proposals from anon, authenticated;

comment on table public.channel_identities is
  'Server-owned external channel identities; external_subject_key is a provider-scoped opaque lookup key, never a canonical account ID.';
comment on table public.channel_link_attempts is
  'Single-use, expiry-bound account-to-channel linking ceremonies; nonce_hash stores no raw linking secret.';
comment on table public.channel_consent_grants is
  'Explicit account consent for a named channel identity, purpose, capability set, and resource scope.';
comment on table public.channel_delegations is
  'Explicit account delegation for a named agent, capability set, and resource scope; server checks status and expiry at settlement.';
comment on table public.channel_ingress_events is
  'Verified provider ingress ledger. It stores only provider references and fingerprints, never raw webhook proofs or message bodies.';
comment on table public.channel_delivery_intents is
  'Durable provider-neutral dispatch intents. Accepted or delivered status is tracked separately from a related domain operation.';
comment on table public.channel_media_jobs is
  'Quarantinable transient media-processing work. The server owns storage references, expiry, and scan state.';
comment on table public.channel_ai_proposals is
  'Typed AI proposals. A proposal is not a domain command and can settle only after an independent human confirmation.';
