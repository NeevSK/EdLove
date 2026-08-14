-- Form templates and responses were present in the deployed schema backup and
-- PowerSync schema but had no tracked migration. This makes that authority
-- reproducible and preserves the existing RLS semantics.
create table if not exists public.form_templates (
  id uuid primary key default extensions.uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  config jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  slug text unique,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_responses (
  id uuid primary key default extensions.uuid_generate_v4(),
  template_id uuid not null references public.form_templates(id) on delete cascade,
  responder_id uuid references auth.users(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create index if not exists form_templates_owner_idx on public.form_templates(owner_id);
create index if not exists form_templates_slug_idx on public.form_templates(slug);
create index if not exists form_responses_template_idx on public.form_responses(template_id);

alter table public.form_templates enable row level security;
alter table public.form_responses enable row level security;

drop policy if exists "Public can read published templates" on public.form_templates;
create policy "Public can read published templates" on public.form_templates
  for select using (is_published = true);

drop policy if exists "Users can manage their own templates" on public.form_templates;
create policy "Users can manage their own templates" on public.form_templates
  for all to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Anyone can submit a response" on public.form_responses;
create policy "Anyone can submit a response" on public.form_responses
  for insert with check (
    exists (
      select 1 from public.form_templates template
      where template.id = form_responses.template_id and template.is_published = true
    )
  );

drop policy if exists "Owners can see responses to their templates" on public.form_responses;
create policy "Owners can see responses to their templates" on public.form_responses
  for select to authenticated using (
    exists (
      select 1 from public.form_templates template
      where template.id = form_responses.template_id and template.owner_id = auth.uid()
    )
  );
