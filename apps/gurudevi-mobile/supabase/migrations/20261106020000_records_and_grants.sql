-- Platform mechanisms for record lifecycle and sharing. Identifiers and reasons only: the
-- content stays in the owning domain's table. Retention periods are never set here; a module
-- declares them on its subdomain card. See docs/architecture/data-governance-and-records.md.

create table public.record_versions (
  record_type text not null,
  record_id text not null,
  version bigint not null check (version > 0),
  updated_at timestamptz not null default clock_timestamp(),
  primary key (record_type, record_id)
);

-- The original is never changed. Each correction names the one it supersedes, so two people
-- correcting the same state can't both win.
create table public.record_corrections (
  id uuid primary key default gen_random_uuid(),
  record_type text not null,
  record_id text not null,
  supersedes uuid references public.record_corrections(id),
  reason text not null check (char_length(reason) between 1 and 500),
  author_account uuid not null,
  created_at timestamptz not null default clock_timestamp(),
  constraint record_corrections_one_successor unique nulls not distinct (record_type, record_id, supersedes)
);

-- Outlives the purge of the record it describes, so sync and audit can still say it existed.
create table public.record_tombstones (
  record_type text not null,
  record_id text not null,
  owner_account uuid,
  deleted_by uuid not null,
  reason text not null check (char_length(reason) between 1 and 500),
  deleted_at timestamptz not null default clock_timestamp(),
  -- Null: the period is undecided, so the record is kept and never purged.
  restore_until timestamptz,
  restored_at timestamptz,
  restored_by uuid,
  purged_at timestamptz,
  primary key (record_type, record_id)
);

create index record_tombstones_purge_idx on public.record_tombstones (record_type, restore_until)
  where restored_at is null and purged_at is null and restore_until is not null;

create table public.record_holds (
  id uuid primary key default gen_random_uuid(),
  record_type text not null,
  record_id text not null,
  reason text not null check (char_length(reason) between 1 and 500),
  placed_by uuid not null,
  placed_at timestamptz not null default clock_timestamp(),
  lifted_by uuid,
  lifted_at timestamptz
);

create index record_holds_active_idx on public.record_holds (record_type, record_id)
  where lifted_at is null;

create table public.sharing_grants (
  id uuid primary key default gen_random_uuid(),
  grantor_account uuid not null,
  record_type text not null,
  record_id text not null,
  audience_type text not null check (audience_type in ('account', 'entity', 'public')),
  audience_id text,
  actions text[] not null check (cardinality(actions) between 1 and 32),
  purpose text not null check (char_length(purpose) between 1 and 200),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid,
  created_at timestamptz not null default clock_timestamp(),
  constraint sharing_grants_audience_named check ((audience_type = 'public') = (audience_id is null))
);

create index sharing_grants_record_idx on public.sharing_grants (record_type, record_id)
  where revoked_at is null;

do $$
declare
  t text;
begin
  foreach t in array array['record_versions', 'record_corrections', 'record_tombstones', 'record_holds', 'sharing_grants']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated, service_role', t);
  end loop;
end $$;

-- Reached only through commands, never directly by a client. Nothing here can be deleted.
grant select, insert, update on table public.record_versions to service_role;
grant select, insert on table public.record_corrections to service_role;
grant select, insert, update on table public.record_tombstones to service_role;
grant select, insert, update on table public.record_holds to service_role;
grant select, insert, update on table public.sharing_grants to service_role;
