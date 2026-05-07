-- Workspace layout targets
-- Allows the same user and workspace to keep separate layout preferences for
-- web and mobile form factors while preserving a shared fallback shape.

alter table public.user_workspace_layouts
    add column if not exists layout_target text not null default 'shared';

alter table public.user_workspace_layouts
    drop constraint if exists uq_user_workspace_layout;

update public.user_workspace_layouts
set layout_target = 'shared'
where layout_target is null;

alter table public.user_workspace_layouts
    add constraint chk_user_workspace_layout_target
    check (layout_target in ('shared', 'web', 'mobile'));

alter table public.user_workspace_layouts
    add constraint uq_user_workspace_layout
    unique (user_id, workspace_id, layout_target);

drop index if exists idx_user_workspace_layouts_user_workspace;
create index if not exists idx_user_workspace_layouts_user_workspace_target
    on public.user_workspace_layouts(user_id, workspace_id, layout_target);
