-- Mapping topology authority. The table and functions previously existed only
-- in the remote schema backup, which made local deployments non-reproducible.
create table if not exists public.mapping_topologies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  nodes jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  supported_perspectives text[] not null default '{}'::text[],
  context jsonb default '{}'::jsonb,
  is_public boolean not null default false,
  share_token text unique default encode(gen_random_bytes(16), 'hex'::text),
  share_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mapping_topologies
  add column if not exists share_token_expires_at timestamptz;

create index if not exists mapping_topologies_owner_id_idx
  on public.mapping_topologies(owner_id);

alter table public.mapping_topologies enable row level security;

drop policy if exists "Owners can manage their own topologies" on public.mapping_topologies;
drop policy if exists "Public can view public or shared topologies" on public.mapping_topologies;

create policy "Owners can manage their own topologies"
  on public.mapping_topologies
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Public can view public or shared topologies"
  on public.mapping_topologies
  for select
  using (
    is_public = true
    or (
      share_token is not null
      and (share_token_expires_at is null or share_token_expires_at > now())
    )
  );

create or replace function public.generate_mapping_share_token(
  p_topology_id uuid,
  p_expires_days integer default 7
)
returns text
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_token text;
begin
  if p_expires_days < 1 or p_expires_days > 30 then
    raise exception 'p_expires_days must be between 1 and 30';
  end if;

  v_token := encode(gen_random_bytes(16), 'hex');

  update public.mapping_topologies
  set share_token = v_token,
      share_token_expires_at = now() + make_interval(days => p_expires_days),
      updated_at = now()
  where id = p_topology_id
    and owner_id = auth.uid();

  if not found then
    raise exception 'topology not found or not owned by caller';
  end if;

  return v_token;
end;
$function$;

-- Keep the legacy RPC name deployable while accepting the date argument that
-- the old client already sends. The API handler does authorization before use.
drop function if exists public.get_school_mapping_pulse(uuid);
create or replace function public.get_school_mapping_pulse(
  p_school_id uuid,
  p_view_date date default current_date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_school_name text;
  v_nodes jsonb;
  v_links jsonb;
begin
  select name into v_school_name from public.schools where id = p_school_id;

  with node_data as (
    select id::text as node_id, name as label, 'school' as type, 'School' as "group"
    from public.schools where id = p_school_id
    union all
    select distinct 'subj-' || subject, subject, 'topic', 'Department'
    from public.classrooms
    where school_id = p_school_id and subject is not null
    union all
    select id::text, name, 'topic', coalesce(subject, 'Classroom')
    from public.classrooms where school_id = p_school_id
  )
  select jsonb_agg(jsonb_build_object('id', node_id, 'label', label, 'type', type, 'group', "group"))
    into v_nodes
  from node_data;

  with link_data as (
    select p_school_id::text as source, 'subj-' || subject as target, 'manages' as relationship
    from public.classrooms
    where school_id = p_school_id and subject is not null
    group by subject
    union all
    select 'subj-' || subject, id::text, 'contains'
    from public.classrooms
    where school_id = p_school_id and subject is not null
  )
  select jsonb_agg(jsonb_build_object('source', source, 'target', target, 'relationship', relationship))
    into v_links
  from link_data;

  return jsonb_build_object(
    'nodes', coalesce(v_nodes, '[]'::jsonb),
    'links', coalesce(v_links, '[]'::jsonb),
    'context', jsonb_build_object(
      'title', coalesce(v_school_name, 'School') || ' Topology Pulse',
      'viewDate', p_view_date
    )
  );
end;
$function$;
