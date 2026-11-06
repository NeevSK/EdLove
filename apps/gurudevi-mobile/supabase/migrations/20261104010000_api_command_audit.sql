-- Accepted command evidence contains identifiers only; receipts and payloads have
-- their own lifecycle. No foreign keys cascade deletion into this record.
create table public.api_command_audit (
  operation_id uuid primary key,
  account_id uuid not null,
  bond_id uuid not null,
  entity_type text not null,
  entity_id text not null,
  capacity text not null,
  capability text not null,
  resource_type text not null,
  resource_id text not null,
  -- How it arrived. account_id is always the person; when an agent acted, they delegated.
  channel text not null check (channel in ('app', 'mcp', 'webmcp', 'whatsapp', 'telegram', 'worker')),
  agent_key text,
  grant_id uuid,
  run_id uuid,
  recorded_at timestamptz not null default clock_timestamp(),
  chain_sequence bigint not null,
  previous_hash text,
  entry_hash text not null,
  constraint api_command_audit_agent_has_grant check ((agent_key is null) = (grant_id is null)),
  constraint api_command_audit_chain unique (account_id, chain_sequence)
);

alter table public.api_command_audit enable row level security;
revoke all on table public.api_command_audit from public, anon, authenticated, service_role;
grant select, insert on table public.api_command_audit to service_role;

comment on table public.api_command_audit is
  'Accepted API command evidence. Not a complete or independently anchored audit trail.';

-- A refused command rolls back, so its record has to be written separately, afterwards.
create table public.api_command_denials (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  bond_id uuid not null,
  capability text not null,
  channel text not null check (channel in ('app', 'mcp', 'webmcp', 'whatsapp', 'telegram', 'worker')),
  agent_key text,
  grant_id uuid,
  run_id uuid,
  recorded_at timestamptz not null default clock_timestamp(),
  chain_sequence bigint not null,
  previous_hash text,
  entry_hash text not null,
  constraint api_command_denials_agent_has_grant check ((agent_key is null) = (grant_id is null)),
  constraint api_command_denials_chain unique (account_id, chain_sequence)
);

alter table public.api_command_denials enable row level security;
revoke all on table public.api_command_denials from public, anon, authenticated, service_role;
grant select, insert on table public.api_command_denials to service_role;

comment on table public.api_command_denials is
  'Commands refused at their authority check. Best effort: a failed write is logged and the refusal stands.';

-- A sensitive read commits with its record, or doesn't happen.
create table public.api_sensitive_reads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  bond_id uuid not null,
  capability text not null,
  resource_type text not null,
  resource_id text not null,
  reason text not null check (char_length(reason) between 1 and 500),
  channel text not null check (channel in ('app', 'mcp', 'webmcp', 'whatsapp', 'telegram', 'worker')),
  agent_key text,
  grant_id uuid,
  run_id uuid,
  recorded_at timestamptz not null default clock_timestamp(),
  chain_sequence bigint not null,
  previous_hash text,
  entry_hash text not null,
  constraint api_sensitive_reads_agent_has_grant check ((agent_key is null) = (grant_id is null)),
  constraint api_sensitive_reads_chain unique (account_id, chain_sequence)
);

alter table public.api_sensitive_reads enable row level security;
revoke all on table public.api_sensitive_reads from public, anon, authenticated, service_role;
grant select, insert on table public.api_sensitive_reads to service_role;

-- Each account has its own chain per table, so one person's writes never wait on another's
-- and the morning burst has no global hot row. This detects a changed or missing row. It is
-- not proof against a database owner until chain heads are checkpointed somewhere independent.
create function public.api_audit_hash(entry jsonb) returns text
  language sql immutable set search_path = ''
  as $$ select encode(sha256(convert_to((entry - 'entry_hash')::text, 'UTF8')), 'hex') $$;

create function public.api_audit_chain() returns trigger
  language plpgsql security definer set search_path = '' set timezone = 'UTC'
  as $$
declare
  head record;
begin
  perform pg_advisory_xact_lock(hashtextextended(tg_table_name || ':' || new.account_id::text, 0));
  execute format(
    'select chain_sequence, entry_hash from public.%I where account_id = $1 order by chain_sequence desc limit 1',
    tg_table_name
  ) into head using new.account_id;
  new.recorded_at := clock_timestamp();
  new.chain_sequence := coalesce(head.chain_sequence, 0) + 1;
  new.previous_hash := head.entry_hash;
  new.entry_hash := public.api_audit_hash(to_jsonb(new));
  return new;
end $$;

create function public.api_audit_append_only() returns trigger
  language plpgsql set search_path = ''
  as $$
begin
  raise exception 'Audit records are append-only' using errcode = '42501';
end $$;

do $$
declare
  t text;
begin
  foreach t in array array['api_command_audit', 'api_command_denials', 'api_sensitive_reads']
  loop
    execute format('create trigger api_audit_chain before insert on public.%I for each row execute function public.api_audit_chain()', t);
    execute format('create trigger api_audit_no_change before update or delete on public.%I for each row execute function public.api_audit_append_only()', t);
    execute format('create trigger api_audit_no_truncate before truncate on public.%I for each statement execute function public.api_audit_append_only()', t);
  end loop;
end $$;

-- Returns the first sequence that doesn't verify, or null when the chain holds.
create function public.api_audit_verify(audit_table regclass, account uuid) returns bigint
  language plpgsql set search_path = '' set timezone = 'UTC'
  as $$
declare
  entry jsonb;
  expected bigint := 0;
  previous text := null;
begin
  for entry in execute format(
    'select to_jsonb(t) from %s t where account_id = $1 order by chain_sequence', audit_table
  ) using account
  loop
    expected := expected + 1;
    if (entry ->> 'chain_sequence')::bigint <> expected
      or (entry ->> 'previous_hash') is distinct from previous
      or (entry ->> 'entry_hash') <> public.api_audit_hash(entry)
    then
      return expected;
    end if;
    previous := entry ->> 'entry_hash';
  end loop;
  return null;
end $$;

revoke all on function public.api_audit_verify(regclass, uuid) from public, anon, authenticated;
grant execute on function public.api_audit_verify(regclass, uuid) to service_role;
