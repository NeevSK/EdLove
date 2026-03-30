alter table public.principal_governance_events
    drop constraint if exists principal_governance_events_event_type_check;

alter table public.principal_governance_events
    add constraint principal_governance_events_event_type_check
    check (event_type in ('create', 'read', 'use', 'expire', 'revoke', 'follow_up', 'approve'));
