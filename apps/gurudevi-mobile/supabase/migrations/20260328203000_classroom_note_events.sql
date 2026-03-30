-- ============================================================
-- Classroom Note Events
-- Temporal bedrock for classroom notes so notes can be replayed,
-- reconstructed as-of a date, and audited as a real domain.
-- ============================================================

create table if not exists public.classroom_note_events (
    id uuid primary key default gen_random_uuid(),
    note_id uuid not null,
    classroom_id uuid not null references public.classrooms(id) on delete cascade,
    author_id uuid not null references public.users(id) on delete cascade,
    event_type text not null check (event_type in ('create', 'update', 'delete')),
    note_type text not null check (note_type in ('note', 'announcement', 'lesson_recap', 'reminder', 'personal')),
    visibility text not null check (visibility in ('private', 'class')),
    is_pinned boolean not null default false,
    snapshot jsonb not null,
    occurred_at timestamptz not null default now(),
    recorded_at timestamptz not null default now(),
    effective_from timestamptz null,
    effective_to timestamptz null,
    recorded_by uuid null references public.users(id) on delete set null
);

create index if not exists idx_classroom_note_events_note_timeline
    on public.classroom_note_events (note_id, occurred_at desc, recorded_at desc);

create index if not exists idx_classroom_note_events_classroom
    on public.classroom_note_events (classroom_id, occurred_at desc, recorded_at desc);

alter table public.classroom_note_events enable row level security;

create policy "classroom_note_events_own_read"
    on public.classroom_note_events for select
    using (author_id = auth.uid());

create policy "classroom_note_events_class_read"
    on public.classroom_note_events for select
    using (
        visibility = 'class'
        and (
            exists (
                select 1 from public.classrooms c
                where c.id = classroom_note_events.classroom_id
                  and c.teacher_id = auth.uid()
            )
            or exists (
                select 1 from public.classroom_students cs
                where cs.classroom_id = classroom_note_events.classroom_id
                  and cs.student_id = auth.uid()
            )
        )
    );

create policy "classroom_note_events_insert"
    on public.classroom_note_events for insert
    with check (
        author_id = auth.uid()
        and (recorded_by is null or recorded_by = auth.uid())
    );

insert into public.classroom_note_events (
    note_id,
    classroom_id,
    author_id,
    event_type,
    note_type,
    visibility,
    is_pinned,
    snapshot,
    occurred_at,
    recorded_at,
    effective_from,
    recorded_by
)
select
    cn.id,
    cn.classroom_id,
    cn.author_id,
    'create',
    cn.note_type,
    cn.visibility,
    coalesce(cn.is_pinned, false),
    jsonb_build_object(
        'id', cn.id,
        'classroom_id', cn.classroom_id,
        'author_id', cn.author_id,
        'content', cn.content,
        'note_type', cn.note_type,
        'visibility', cn.visibility,
        'is_pinned', coalesce(cn.is_pinned, false),
        'created_at', cn.created_at,
        'updated_at', cn.updated_at
    ),
    cn.created_at,
    coalesce(cn.updated_at, cn.created_at),
    cn.created_at,
    cn.author_id
from public.classroom_notes cn
where not exists (
    select 1
    from public.classroom_note_events cne
    where cne.note_id = cn.id
);
