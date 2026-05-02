# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 2026-05-01 16:01:25
> **Command:** pnpm turbo run check-types

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 14 |

## Detailed Findings

### Category: General
- @repo/core:check-types: src/api/hooks/community.hooks.ts(36,27): error TS2339: Property 'getGroups' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/api/hooks/community.hooks.ts(169,33): error TS2339: Property 'getAnnouncements' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/api/hooks/community.hooks.ts(196,20): error TS2339: Property 'reportContent' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/api/hooks/notification.hooks.ts(24,33): error TS2339: Property 'getNotifications' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/api/hooks/notification.hooks.ts(32,27): error TS2339: Property 'getUnreadNotificationCount' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/api/hooks/notification.hooks.ts(88,51): error TS2339: Property 'markNotificationRead' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/api/hooks/notification.hooks.ts(95,30): error TS2339: Property 'markAllNotificationsRead' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/api/hooks/social.hooks.ts(22,27): error TS2339: Property 'reportContent' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
- @repo/core:check-types: src/hooks/useAuthorityLifecycle.ts(118,46): error TS2551: Property 'getSession' does not exist on type '{ getAuthSession(): Promise<Session>; getAuthUser(): Promise<User>; signIn(email: string, password: string): Promise<{ user: User; session: Session; weakPassword?: WeakPassword; } | { ...; }>; ... 9 more ...; deleteAccount(): Promise<...>; }'. Did you mean 'setSession'?
- @repo/core:check-types: src/native/useAuthorityLifecycle.ts(118,46): error TS2551: Property 'getSession' does not exist on type '{ getAuthSession(): Promise<Session>; getAuthUser(): Promise<User>; signIn(email: string, password: string): Promise<{ user: User; session: Session; weakPassword?: WeakPassword; } | { ...; }>; ... 9 more ...; deleteAccount(): Promise<...>; }'. Did you mean 'setSession'?
- @repo/core:check-types: src/utils/temporal.ts(16,7): error TS2578: Unused '@ts-expect-error' directive.
- @repo/core:check-types: src/utils/temporal.ts(28,7): error TS2578: Unused '@ts-expect-error' directive.
-  ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)
-  ERROR  run failed: command  exited (2)


## Raw Output
```text
• turbo 2.9.4

   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 28 packages
   • Remote caching disabled

apps-intuitui-web:check-types: cache miss, executing 79c42c4b8cc722ae
apps-edlove-web:check-types: cache miss, executing 8b919e856a5242ab
apps-neevsk-web:check-types: cache miss, executing 63281414c280905d
@repo/core:check-types: cache miss, executing 46e65d367e7420f2
@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec astro check
apps-intuitui-web:check-types: 
apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec astro check
apps-edlove-web:check-types: 
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec astro check
apps-neevsk-web:check-types: 
apps-intuitui-web:check-types: [2m16:01:06[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-edlove-web:check-types: [2m16:01:06[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-neevsk-web:check-types: [2m16:01:06[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-intuitui-web:check-types: [2m16:01:13[22m [34m[types][39m Generated [2m7.54s[22m
apps-intuitui-web:check-types: [2m16:01:13[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\intuitui-web...
apps-edlove-web:check-types: [2m16:01:17[22m [34m[content][39m Syncing content
apps-edlove-web:check-types: [2m16:01:17[22m [34m[content][39m Content config changed
apps-edlove-web:check-types: [2m16:01:17[22m [34m[content][39m Clearing content store
apps-neevsk-web:check-types: [2m16:01:17[22m [34m[content][39m Syncing content
apps-neevsk-web:check-types: [2m16:01:17[22m [34m[content][39m Content config changed
apps-neevsk-web:check-types: [2m16:01:17[22m [34m[content][39m Clearing content store
apps-edlove-web:check-types: [2m16:01:17[22m [34m[content][39m Synced content
apps-edlove-web:check-types: [2m16:01:17[22m [34m[types][39m Generated [2m11.02s[22m
apps-edlove-web:check-types: [2m16:01:17[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\edlove-web...
apps-neevsk-web:check-types: [2m16:01:17[22m [34m[content][39m Synced content
apps-neevsk-web:check-types: [2m16:01:17[22m [34m[types][39m Generated [2m11.19s[22m
apps-neevsk-web:check-types: [2m16:01:17[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\neevsk-web...
@repo/core:check-types: src/api/hooks/community.hooks.ts(36,27): error TS2339: Property 'getGroups' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/api/hooks/community.hooks.ts(169,33): error TS2339: Property 'getAnnouncements' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/api/hooks/community.hooks.ts(196,20): error TS2339: Property 'reportContent' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/api/hooks/notification.hooks.ts(24,33): error TS2339: Property 'getNotifications' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/api/hooks/notification.hooks.ts(32,27): error TS2339: Property 'getUnreadNotificationCount' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/api/hooks/notification.hooks.ts(88,51): error TS2339: Property 'markNotificationRead' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/api/hooks/notification.hooks.ts(95,30): error TS2339: Property 'markAllNotificationsRead' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/api/hooks/social.hooks.ts(22,27): error TS2339: Property 'reportContent' does not exist on type '{ getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string; viewScale?: TemporalScale; }): Promise<{ id: string; group_id: string; author_id: string; content: string; ... 13 more ...; media_type?: string; }[]>; ... 7 more ...; markOfficialAnswer(commentId: string, isOfficial: boolean): ...'.
@repo/core:check-types: src/hooks/useAuthorityLifecycle.ts(118,46): error TS2551: Property 'getSession' does not exist on type '{ getAuthSession(): Promise<Session>; getAuthUser(): Promise<User>; signIn(email: string, password: string): Promise<{ user: User; session: Session; weakPassword?: WeakPassword; } | { ...; }>; ... 9 more ...; deleteAccount(): Promise<...>; }'. Did you mean 'setSession'?
@repo/core:check-types: src/native/useAuthorityLifecycle.ts(118,46): error TS2551: Property 'getSession' does not exist on type '{ getAuthSession(): Promise<Session>; getAuthUser(): Promise<User>; signIn(email: string, password: string): Promise<{ user: User; session: Session; weakPassword?: WeakPassword; } | { ...; }>; ... 9 more ...; deleteAccount(): Promise<...>; }'. Did you mean 'setSession'?
@repo/core:check-types: src/utils/temporal.ts(16,7): error TS2578: Unused '@ts-expect-error' directive.
@repo/core:check-types: src/utils/temporal.ts(28,7): error TS2578: Unused '@ts-expect-error' directive.
@repo/core:check-types:  ELIFECYCLE  Command failed with exit code 2.
 ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)

 Tasks:    0 successful, 4 total
Cached:    0 cached, 4 total
  Time:    30.185s 
Failed:    @repo/core#check-types

 ERROR  run failed: command  exited (2)
```
