---
title: "Arrive Journey"
status: "active"
created: 2026-11-06
updated: 2026-11-06
author: "Naveen"
scribe: "Claude"
tags: [architecture, journey, identity, authority, onboarding, guest, self, founder, steel-thread]
---

# Arrive Journey

The first path that must run on a real phone: open the app, come in as a guest or a
signed-in person, hold a bond and a capacity, and use Self without obstruction. It is the
**steel thread**: one thin, real path through transport, authentication and authorization.
It contains no business domain except on-device Self, so it fits the owner's rule that
horizontal foundations come before business slices.

Structure: [platform map](platform-map.md). Authority: [authority model](authority-model.md).

## Owner rules

1. **What broke stays gone.** Retired API code isn't restored, wrapped or aliased, for any
   reason. A caller of removed code moves to v1 or is removed. No compatibility types.
2. **v1 is built properly.** New capabilities go through `/api/v1` and the durable command
   path.
3. **No one gets in without a bond and a capacity.**
4. **Self lets everyone in.** Any guest or signed-in person reaches Self. Nothing about the
   server, snapshots or other domains may stop them; whatever does gets fixed.
5. **Principals are invite only.** Teachers, students and guardians join freely. A
   principal acts only in an institutional or commercial context, and the founder issues
   that invite.

## The journey

### Guest

- A guest is a **device-local UUID**. No server account exists. Supabase anonymous sign-in
  is retired, along with the conversion path that assumes an anonymous Supabase source.
- They choose a capacity, which creates a local bond, so rule 3 holds. Citizenship is
  `THIRD_CLASS`.
- **Guest data is never deleted.** The 15-day lease (`GUEST_LEASE_DAYS` in
  `packages/core/src/native/guestLease.ts`) is only a nudge schedule: reminders to sign in on
  days 1, 3, 6, 10 and 15, then on every launch. It never blocks and nothing expires.

### Sign-in

- Supabase creates or returns the credential; the database creates the canonical account.
- Apps reach authentication only through the port: `IAuthPort`, `AuthClient`, and
  `auth` from `@repo/core/auth`. Supabase doesn't leak into screens.
- `ScopeSession` holds who is acting and through which bond. It is what the app reads after
  sign-in.

### First bond and citizenship

- In onboarding the person chooses teacher, student or guardian. The server creates their
  personal bond with that capacity, as `SECOND_CLASS`, with entity type `PERSONAL`.
  `PERSONAL_CLASSROOM` is not carried forward.
- **Citizenship is an explicit property stored on each bond**, set by the server when the
  bond is created, never computed later (see
  [authority model](authority-model.md#citizenship-is-part-of-every-bond)).
- `admin`, `founder` and `developer` are never self-selected; the server provisions them.
- School Leader isn't a choice in the role list. It is reached only by an invite.
- Later bonds (joining a school) add `FIRST_CLASS` bonds beside the personal one. They
  don't replace it.

### Guest conversion

- The conversion ledger (`guestConversionLedger.ts`) makes the move resumable and refuses a
  mismatched account. The guest's data must survive a crash mid-conversion.
- On conversion the data stays on the device, re-owned by the new account. Upload is
  wired in slowly, at stage C. Nothing is lost by waiting.

### Self

See [Self and Wellbeing](#self-and-wellbeing).

## Stages: when each layer becomes mandatory

| Stage | What runs | Must be finished first |
| --- | --- | --- |
| A. Arrive | Guest, sign-in, first bond, snapshot, tab shell | Identity, authority, durable commands, budgets |
| B. Self on the device | Journals and mood stored locally | Nothing new on the server |
| B2. Founder and invitations | Founder enters; invites a principal; the principal's school exists | Founder provisioning, founder device security, audit including denials |
| C. Person-owned data synced | Journals across devices, conversion upload | Records lifecycle, consent, export |
| D. Institution data | Teachers join, attendance, grades | Corrections, full audit including reads, guardians and minors |
| E. Other channels | Bots and agents | Delegation, verified ingress |

Each stage ends on a real phone.

## Founder

The founder is the platform's root of authority and the only source of principal invites.
The bond is `PLATFORM` / `GLOBAL`, provisioned by the server for a configured account and
never reachable through onboarding. The pieces to reuse, not revive: the
`school.founder_invitation` and `platform.founder_cockpit` journeys, the invite migrations
(`20260726000004`, `20260811060000`), and the provisioning rule in the retired
`platformBondProvision.ts`.

Because one compromised account would reach everything, the founder needs more protection
than anyone else. Recommended, pending the owner's decision:

- Founder actions pass through the same Cedar, durable command and audit path as everyone.
  Control is broad, and it is never unrecorded.
- Sign-in requires a passkey on a registered device, and risky actions re-verify.
- A written recovery path, so losing one device can't lock out the platform.
- **Open:** whether founder authority reaches children's private journals and mood. The
  recommendation is no standing access: control over the platform and institutions, with
  private person-owned content reachable only through a recorded break-glass with a reason.

## Self and Wellbeing

**Self is a place. Wellbeing is the domain it mainly shows.** A place owns nothing, so
Self is Wellbeing plus read-only windows onto other domains. A missing window shows an
empty state and never blocks Self.

`packages/self` holds both today. The zones are Journey, Inner Pulse, Growth, Care & Rhythm,
Reflection, Working Rhythm and Leadership Focus, and its storage is mostly local (79 uses
of `SafeZustandStorage`). Proposed ownership:

| Owner | What in `packages/self` | At Arrive |
| --- | --- | --- |
| `wellbeing.mood` | `MoodLotus`, `MoodPickerCard`, `PulseDashboard`, `EnergyForecast`, `EnergyBarChart`, `TeacherVitalityCard` | Works |
| `wellbeing.journal` | `FireJournal`, `VoiceJournaling`, `DecisionJournalSection`, `GratitudeGlimmers`, `JoyJar` | Works |
| `wellbeing.reflection` | `ResonancePatternCard`, `ResonanceTimeline`, `WindDownRitual` | Works |
| `wellbeing.practice` | `BreathGuide`, `SleepTracker`, `DailyRhythm`, `TomorrowPrep`, `TodoView`, `RemindersPanel`, `StudentGoals`, `ProgressTree` | Works |
| `journey.*` (window) | `AcademicHistoryTimeline`, `ClassroomLegacyTimeline`, `SchoolLegacyTimeline`, `TeachingHistoryTimeline`, `GovernanceHistoryTimeline`, `TimelineEvent` | Empty state |
| `learning.grading` (window) | `MyGradesView`, `useStudentGrades` | Empty state |
| `ops.timetables` (window) | `useTimetable` | Empty state |
| `community.*` (window) | `CommunityPresence` | Empty state |
| To decide | `WisdomSeeds` and `wisdom.ts` (Wellbeing, or Library content?), Leadership Focus zone (needs institutional bonds) | Hidden until decided |

The Cedar name is safe: the old role schema's `entity Wellbeing` and the new `Wellbeing`
namespace are separate. Moving code out of `packages/self` is later work, done as each
owning module gets built. Arrive only needs the windows to stop being able to block.

## Build state (2026-11-06)

The Android bundle now builds: Metro exported 6,434 modules. It failed at the first screen
before this work. **Nothing has run on a device yet**, and the server half isn't deployed.

| Done in the working tree | Where |
| --- | --- |
| Welcome uses a local guest only; no Supabase anonymous sign-in from this screen | `app/welcome.tsx` |
| `identity.createInitialBond`: teacher, student or guardian; personal, `SECOND_CLASS`; atomic with profile and audit; retry returns the existing bond | `security.ts`, `contract.ts` |
| Onboarding creates the bond for guests (locally) and signed-in people (v1). Failure stays on the screen instead of entering without a bond. School Leader removed from the choices | `app/onboarding.tsx`, `CivicRole.ts` |
| Account resolved with `get_my_id()`; profile and bonds read under RLS | `supabaseIdentity.adapter.ts` |
| Citizenship stored on bonds and read from the column; never derived; `PERSONAL_CLASSROOM` gone from client code | migration `20261106010000`, `Identity.ts`, `bondScope.ts` |
| **Bonds are server-written only.** Closes a hole where any signed-in user could insert their own bond with any capacity | migration `20261106010000` |
| Self: undefined components replaced with kit ones; on-device Self work needs no snapshot | `packages/self`, `sanctuaryFeature.ts` |
| Tab shell uses the kit's `AppHeader`; all five tabs are back, with honest empty places | `app/(tabs)/_layout.tsx`, `UnbuiltPlace.tsx` |
| Snapshot refresher starts after sign-in | `useSnapshotRefresh.ts` |

### What is actually deployed (checked 2026-11-07)

The API on Render (`sanctuary-api-tpj7.onrender.com`) is the **pre-reset code**. Its
`/health/live` reports `environment: production` where the new code reports
`generation: v1`, `/api/identity/identifyActiveCitizen` answers, and every `/api/v1` path
returns 404. So nothing from the reset or from Arrive is hosted yet, and the signed-in path
can't work against it. Render deploys from git, so the reset must be committed and pushed
first.

Three things decide the switch:

- **Web uses the old API.** No web code calls v1, and 44 web files import the retired
  `core/api`. Replacing the hosted API stops those screens.
- **The new API refuses browsers from other origins** (`originGuard` in `core/app.ts`), by
  design until a session and CORS policy is admitted. Web can't call v1 until that exists.
- **Migration `20261106010000` affects the old API.** It requires `citizenship` on new bonds
  and revokes client writes, so the old API's bond creation may stop once it runs.


Guest path: needs nothing on the server. Install on a phone and go through welcome,
onboarding and Self.

Signed-in path also needs, in order:

1. Run migration `20261106010000` against a real database. It hasn't run anywhere yet. See
   the security note below first.
2. Add `SNAPSHOT_SIGNING_PRIVATE_KEY` to the API and
   `EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY` to the app in Doppler. Neither exists yet.
3. Deploy the API so `EXPO_PUBLIC_API_URL` reaches this code.

### Security note: check existing bonds

Until that migration runs, any signed-in user can write their own bond row through the
public API, if the hosted database matches the migrations. Before relying on bonds, list
any that no server path would have created:

```sql
select user_id, entity_type, entity_id, capacity, created_at from public.bonds
where capacity in ('admin', 'founder', 'coFounder', 'director', 'developer')
   or (capacity = 'principal' and coalesce(metadata->>'source', '') = '')
order by created_at desc;
```

### Left for later

- **Account switching in settings.** `DeviceAccountManager` was deleted for its name and its
  importer pointed at a `DeviceAccountModal` that never existed, so the section renders
  nothing. Multi-account needs it rebuilt on the kit.
- **`users.citizenship`** goes when the invite functions are rebuilt at stage B2.
- **Anonymous guest code** still present and unused from welcome: `AuthClient.signInAnonymously`,
  the anonymous branches in `bootstrapRouteState.ts` and `guestConversionLedger.ts`.
- **`ClimateSensingScreen`** is no longer exported. The installed engine has no `templates`
  module; nothing used the screen.
- **Other retired routes** still in `app/` should be checked once the app runs.
- **Mobile typecheck** still has 79 errors (136 this morning), none of them undefined names on
  a reachable path, plus 33 in legacy `core/api`.

## Open decisions

- **Teachers joining a school.** Read here as: anyone signs up as a teacher freely, while
  joining a specific school still needs that school's invite or approval. To confirm.
- **A person with a principal invite who hasn't signed up:** do they get a personal bond
  too, and with which capacity? Rule 3 needs a bond the moment they enter; the invite's
  institutional bond can satisfy it if the claim happens during onboarding.
- **Founder reach into private content**, above.
- **`WisdomSeeds` and the Leadership Focus zone**, above.
- **Web.** 44 web files import the retired `core/api`. Mobile comes first; web follows the
  same v1 path and loses those screens until then.
