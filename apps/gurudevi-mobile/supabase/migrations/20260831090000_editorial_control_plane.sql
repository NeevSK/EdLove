-- Durable editorial control plane.
-- Public sites remain Git-backed; these server-owned records track authorship,
-- rights, publishing events, translations, and external delivery state.

create table if not exists public.editorial_authors (
  id text primary key,
  display_name text not null,
  biography text not null default '',
  email text,
  website_url text,
  social_links text[] not null default '{}',
  attribution_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editorial_rights_agreements (
  id text primary key,
  rights_holder text not null,
  license text not null,
  permitted_publications text[] not null default '{}',
  permitted_channels text[] not null default '{}',
  evidence_reference text not null,
  expires_at timestamptz,
  takedown_contact text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editorial_works (
  id text primary key,
  publication text not null check (publication in ('edlove', 'gurudevi')),
  content_kind text not null check (content_kind in ('original', 'curated', 'licensed', 'guest', 'translation')),
  status text not null check (status in ('draft', 'submitted', 'in_review', 'rights_review', 'approved', 'scheduled', 'published', 'withdrawn')),
  canonical_slug text not null,
  source_work_id text references public.editorial_works(id),
  rights_agreement_id text references public.editorial_rights_agreements(id),
  external_source jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (publication, canonical_slug)
);

create table if not exists public.editorial_versions (
  id text primary key,
  work_id text not null references public.editorial_works(id) on delete cascade,
  language text not null check (language in ('en', 'si', 'ta')),
  title text not null,
  summary text not null,
  canonical_url text not null,
  content_path text not null,
  publish_date timestamptz,
  updated_date timestamptz,
  translation_of_version_id text references public.editorial_versions(id),
  translation_status text not null default 'not_applicable' check (translation_status in ('not_applicable', 'draft', 'in_review', 'approved')),
  unique (work_id, language)
);

create table if not exists public.editorial_contributions (
  work_id text not null references public.editorial_works(id) on delete cascade,
  author_id text not null references public.editorial_authors(id),
  role text not null check (role in ('author', 'translator', 'editor', 'reviewer', 'curator')),
  credit text not null,
  primary key (work_id, author_id, role)
);

create table if not exists public.editorial_events (
  event_id text primary key,
  event_type text not null check (event_type in ('article.published', 'article.updated', 'article.withdrawn')),
  work_id text not null references public.editorial_works(id),
  version_id text not null references public.editorial_versions(id),
  payload jsonb not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.editorial_distribution_deliveries (
  idempotency_key text primary key,
  event_id text not null references public.editorial_events(event_id) on delete cascade,
  channel text not null check (channel in ('linkedin', 'medium', 'substack', 'meta', 'rss')),
  account_id text not null,
  status text not null check (status in ('pending', 'processing', 'published', 'failed', 'withdrawn', 'skipped')),
  attempts integer not null default 0 check (attempts >= 0),
  external_url text,
  last_error text,
  updated_at timestamptz not null default now(),
  unique (event_id, channel, account_id)
);

create table if not exists public.editorial_submissions (
  id uuid primary key default gen_random_uuid(),
  publication text not null check (publication in ('edlove', 'gurudevi')),
  content_kind text not null check (content_kind in ('original', 'curated', 'licensed', 'guest', 'translation')),
  title text not null check (char_length(title) between 3 and 240),
  summary text not null check (char_length(summary) between 10 and 1000),
  body text not null check (char_length(body) between 50 and 200000),
  language text not null check (language in ('en', 'si', 'ta')),
  submitter_id uuid not null references auth.users(id),
  source_url text,
  rights_agreement_id text references public.editorial_rights_agreements(id),
  translation_of_version_id text references public.editorial_versions(id),
  author_id text references public.editorial_authors(id),
  status text not null default 'submitted' check (status in ('submitted', 'in_review', 'rights_review', 'approved', 'rejected', 'withdrawn')),
  reviewer_id uuid references auth.users(id),
  decision_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists editorial_versions_work_id_idx on public.editorial_versions(work_id);
create index if not exists editorial_events_occurred_at_idx on public.editorial_events(occurred_at);
create index if not exists editorial_deliveries_event_id_idx on public.editorial_distribution_deliveries(event_id);
create index if not exists editorial_deliveries_status_idx on public.editorial_distribution_deliveries(status);

alter table public.editorial_authors enable row level security;
alter table public.editorial_rights_agreements enable row level security;
alter table public.editorial_works enable row level security;
alter table public.editorial_versions enable row level security;
alter table public.editorial_contributions enable row level security;
alter table public.editorial_events enable row level security;
alter table public.editorial_distribution_deliveries enable row level security;
alter table public.editorial_submissions enable row level security;

-- Editorial records and rights evidence are server-owned. Public rendering is
-- produced from reviewed repository content, not direct client table access.
revoke all on table public.editorial_authors from anon, authenticated;
revoke all on table public.editorial_rights_agreements from anon, authenticated;
revoke all on table public.editorial_works from anon, authenticated;
revoke all on table public.editorial_versions from anon, authenticated;
revoke all on table public.editorial_contributions from anon, authenticated;
revoke all on table public.editorial_events from anon, authenticated;
revoke all on table public.editorial_distribution_deliveries from anon, authenticated;
revoke all on table public.editorial_submissions from anon, authenticated;

grant all on table public.editorial_authors to service_role;
grant all on table public.editorial_rights_agreements to service_role;
grant all on table public.editorial_works to service_role;
grant all on table public.editorial_versions to service_role;
grant all on table public.editorial_contributions to service_role;
grant all on table public.editorial_events to service_role;
grant all on table public.editorial_distribution_deliveries to service_role;
grant all on table public.editorial_submissions to service_role;

comment on table public.editorial_rights_agreements is 'Private rights and takedown metadata for editorial works.';
comment on table public.editorial_events is 'Idempotent server-owned editorial lifecycle events.';
comment on table public.editorial_distribution_deliveries is 'Per-channel delivery ledger for editorial events.';
comment on table public.editorial_submissions is 'Private contributor submissions awaiting editorial and rights review.';
