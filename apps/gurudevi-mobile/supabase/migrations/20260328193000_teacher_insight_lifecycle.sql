-- Teacher Insight Lifecycle Bedrock
-- Keeps teacher-owned pedagogical intelligence durable over time without
-- forcing it into the student longitudinal store or exposing it upward by default.

create table if not exists public.teacher_insight_events (
    id uuid primary key default uuid_generate_v4(),
    insight_type text not null check (insight_type in ('teacher_note', 'student_observation', 'student_potential')),
    insight_id uuid not null,
    owner_id uuid not null references public.users(id) on delete cascade,
    school_id uuid null references public.schools(id) on delete set null,
    classroom_id uuid null references public.classrooms(id) on delete set null,
    student_id uuid null references public.users(id) on delete set null,
    event_type text not null check (event_type in ('create', 'update', 'delete', 'finalize', 'share', 'revoke_share', 'promote')),
    visibility text null check (visibility in ('private', 'student_visible', 'handover_visible')),
    share_state text not null check (share_state in ('private', 'shared_selected', 'shared_role', 'official')),
    promotion_target text null,
    snapshot jsonb not null,
    occurred_at timestamptz not null,
    recorded_at timestamptz not null default now(),
    effective_from timestamptz null,
    effective_to timestamptz null,
    recorded_by uuid null references public.users(id) on delete set null
);

create index if not exists idx_teacher_insight_events_owner_occurred
    on public.teacher_insight_events(owner_id, occurred_at desc, recorded_at desc);

create index if not exists idx_teacher_insight_events_target_occurred
    on public.teacher_insight_events(insight_type, insight_id, occurred_at desc, recorded_at desc);

create index if not exists idx_teacher_insight_events_school_share
    on public.teacher_insight_events(school_id, share_state, occurred_at desc);

alter table public.teacher_insight_events enable row level security;

drop policy if exists "Teacher insight lifecycle private-aware read" on public.teacher_insight_events;
create policy "Teacher insight lifecycle private-aware read"
on public.teacher_insight_events
for select
to authenticated
using (
    owner_id = auth.uid()
    or recorded_by = auth.uid()
    or (
        share_state <> 'private'
        and exists (
            select 1
            from public.users viewer
            where viewer.id = auth.uid()
              and viewer.school_id = teacher_insight_events.school_id
              and coalesce(viewer.role, '') in (
                  'founder',
                  'developer',
                  'admin',
                  'principal',
                  'assistant_principal',
                  'assistantPrincipal',
                  'teacher',
                  'section_head',
                  'grade_head'
              )
        )
    )
);

grant select on public.teacher_insight_events to authenticated;
