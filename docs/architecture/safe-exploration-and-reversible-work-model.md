---
title: "Safe Exploration and Reversible Work Model"
status: "active"
created: 2026-09-28
updated: 2026-10-04
decision_owner: "Naveen"
tags: [architecture, explore, guest, sandbox, demo, drafts, safety, product]
---

# Safe Exploration and Reversible Work Model

## Why this exists

Gurudevi needs to let a person explore, try, make changes, test outcomes, and
recover from mistakes without accidentally creating a consequence they did not
intend. This includes public showcases, first visits, pre-account exploration,
guest continuity, and feature discovery at any point in an account's lifetime.
An established person may encounter an unfamiliar feature years after joining;
safe practice is an ongoing product capability, not an onboarding phase that
expires when someone creates an account.

The words **Explore**, **guest**, **demo**, **sandbox**, **draft**, and **test**
have been used for overlapping things. This document records the agreed
platform scope and implementation sequence. It preserves accepted identity and
data boundaries and does not authorize new cloud identity, data, or environment
behavior.

## Product intent

**Confirmed product requirement (2026-10-04):** Safe practice remains available
to an account holder whenever they encounter a feature they have not learned,
regardless of how long they have used Gurudevi. Account creation and experience
do not remove the need or right to try safely.

**Confirmed Guest requirement (2026-10-04):** Guest feature work stays on the
current device until the person creates or claims an account. At that explicit
transition, eligible work is migrated into the account; the original local
copy remains recoverable until the app verifies migration completion. The
existing fifteen-day mobile lease remains the current retention limit while a
person remains Guest.

The product promise is **safe agency**, not a school-like "practice mode":

> A person can try before committing, understand whether their work is local,
> simulated, or live, recover safely, and choose deliberately when to keep or
> share it.

The user experience can be one progressive journey. Its internal authority and
persistence modes must remain separate so a harmless-looking route never gains
cloud, social, payment, notification, or synchronization consequences.

## Existing source-of-truth decisions

The following are already accepted and remain authoritative. Read the two
September 10 records together: the guest decision explicitly uses a Supabase
anonymous subject on mobile as a temporary identity, while keeping feature data
local and denying cloud writes/sync. The September 14 web Explore decision
starts public browser Explore without that identity. These are different
session choices, not a decision to reject anonymous guest identity everywhere.

| Record | Established fact |
| --- | --- |
| [Explore access and persistence ADR](../decisions/2026-09-14-sanctuary-explore-access-and-persistence.md) | `/explore` is public; it uses baseline fixtures and a private local adapter, with no Supabase identity, cloud write, outbox, or PowerSync request. |
| [Guest local-first lease ADR](../decisions/2026-09-10-guest-local-first-lease.md) | Explicit mobile Guest uses an anonymous Supabase subject to identify a fifteen-day local-first journey; feature data cloud writes and sync remain denied until a real account is established. |
| [Entry-route authority ADR](../decisions/2026-09-10-entry-route-authority.md) | Mobile guest entry is explicit; anonymous identity is not account authority and cannot start PowerSync, cloud feature hydration, or mutation draining. |
| [Sanctuary web implementation plan](../current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md) | Browser domain-canvas and route plan; adapters are account or public web Explore. Web Guest is out of scope. |
| [Docs source-of-truth and feature-rollout boundaries](../decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md) | GrowthBook rollout, Cedar authorization, and persistence are separate responsibilities; flags do not replace authorization or local data storage. |
| [Environment topology guide](./environment-topology-and-promotion.md) | Engineering local/staging/production tiers are distinct from product session/persistence modes. |

The accepted product intentionally assigns different visitor entry modes by
platform; Safe Try remains shared across signed-in platforms:

| Surface | Intended entry/presentation | Identity and persistence | Product continuity gap |
| --- | --- | --- | --- |
| Gurudevi web `/explore/*` | Public route at `https://sanctuary.gurudevi.app/explore/*`; anyone can open it without signing in. | No Supabase identity; baseline fixtures and browser-local persistence. | Public Explore must remain outside account authorization and must not acquire live account data through session restoration. |
| Gurudevi mobile Guest | Explicit Guest choice in the native welcome flow. | Supabase anonymous subject identifies the guest; fifteen-day feature data remains local-first. | Preserve this path and its identity meaning; it is not required to use the web Explore route name. |
| Authenticated web Sanctuary | Signed-in application at `https://sanctuary.gurudevi.app`. | Authenticated account and account-authorized data. | Account-holder Safe Try must be reachable here from features at any tenure. |

These labels may differ across platforms because their entry and identity
mechanisms differ. The shared promise is safe, truthful practice; route names
and persistence adapters do not need to be identical.

## Canonical vocabulary

| Term | User meaning | Technical boundary |
| --- | --- | --- |
| **Explore** | “See what is possible and try safely.” | Public web journey at `/explore/*`. Uses browser-local data and fixtures; no cloud identity. |
| **Safe Try** | A clear action label: “You can try this without affecting live work.” | The promise shown before a reversible/local/simulated action. It is not a hidden global mode. |
| **Demo** | A quick, curated tour. | Baseline sample content; normally read-only or lightly interactive. It must disclose any reset/non-persistence. |
| **Draft** | Private work that is not yet live, shared, or final. | A state within an Explore, guest, or account adapter; retention and conversion are feature-specific. |
| **What if?** | “Show me the likely result before I commit.” | A pure simulation/preview command. It validates/calculates but does not mutate durable state or call an external provider. |
| **Guest** | “Keep using the app on this device for a limited time.” | Explicit mobile-only temporary continuity identity/lease. Mobile uses a Supabase anonymous subject for this identity; that does not grant feature-data cloud-write or sync authority. Web has no Guest mode. |
| **Safe practice** | “Let me learn or try this feature without affecting my live work.” | An account holder can enter this per feature at any time. The implementation may be a draft, preview, local copy, or isolated server workspace according to the feature's risk. |
| **Sandbox** | “Give me a separate, resettable place for deeper training or controlled trials.” | An isolation capability and possible future product surface, not a mandatory route for every safe try. Where server-backed, isolation and reset must be enforced by the server. It is not the engineering test environment. |
| **Test mode** | “Exercise a consequential integration without its real-world effect.” | Feature/provider-specific simulated endpoint or credential set. It cannot be a global toggle that disrupts live users. |
| **Live** | Durable work with real consequences. | Account-authorized server data, sharing, synchronization, and external effects. |

Use **Explore** only for the public web try-before-account journey and **Guest**
only for mobile local continuity. Use **Safe Try** for the promise attached to
an action or feature on either platform. Account holders retain access to Safe
Try whenever they meet something unfamiliar. Use **Sandbox** only when a
feature needs a distinct isolated workspace; reserve **test mode** for a
specific provider or transaction boundary.

## Independent app controls

Feature rollout, app presentation, and safe practice are three independent
controls. They can all affect one feature screen, but none substitutes for
another:

| Control | Answers | Existing foundation | Must not do |
| --- | --- | --- | --- |
| Feature availability | Is this capability released for this user or operationally enabled? | The feature lifecycle manifest, GrowthBook rollout, and Cedar-backed access checks. | Treat a rollout flag as authorization or as a safe-write boundary. |
| Presentation profile | How much of the app and its navigation is shown at once? | Self canvas preferences and existing responsive/accessibility presentation policies. | Change permissions, data ownership, or which persistence adapter receives a write. |
| Safe Try | Where do this feature's reads, writes, and effects go while the user practices? | Existing persistence-boundary concepts and feature-owned data/command seams. | Change account identity or use an app-wide mode/feature flag as the sole write guard. |

The product will offer **Simple** and **Full** presentation profiles, while
feature availability remains a separate policy. Simple can reduce navigation
choices and use progressive disclosure; Full can expose the complete available
surface. Both profiles use the same authorization and feature data. Availability
can be constrained by rollout, account capability, or an intentional product
edition without changing the practice boundary. There is no existing
app-wide Simple profile or unified edition policy, so these should be added as
presentation and availability configuration respectively, not folded into the
Safe Try contract.

## Real-world patterns and what they teach

| Pattern | Real-world example | Gurudevi lesson |
| --- | --- | --- |
| Isolated engineering/training environment | Microsoft Power Platform calls sandbox environments non-production, isolated, resettable spaces for development, testing, UAT, staging, and training. [Microsoft sandbox environments](https://learn.microsoft.com/en-in/power-platform/admin/sandbox-environments) | This is the right model for developer/QA infrastructure and a future organization-level Sandbox; it is not a reason to make public Explore depend on a hosted test environment. |
| Environment-level data-source isolation | Power Platform restricts an app in a Test environment to Test data sources rather than Dev data sources. [Environment overview](https://learn.microsoft.com/en-us/power-platform/admin/environments-overview) | Environment separation is enforced by wiring and credentials, not by a label in the UI. |
| Anonymous temporary identity | Supabase Anonymous Sign-Ins creates a real user ID and JWT without personal information. Anonymous users use the Postgres `authenticated` role; RLS must inspect the `is_anonymous` JWT claim. Supabase warns to add abuse protection, and automatic cleanup is not available. [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous) | This identifies the explicitly created mobile Guest. It does not require public Explore to sign in, and it does not decide whether Guest feature data is local or cloud-backed. If selected, policies must distinguish anonymous users from permanent accounts and an expiry cleanup job must be designed. |
| Isolated engineering database | Supabase Branching creates separate project environments and credentials; preview branches start without production data by default and are designed for schema/PR testing. [Supabase Branching](https://supabase.com/docs/guides/deployment/branching) | Useful for engineering preview and migration checks. It is not a per-person in-product practice workspace. |
| Explicit test credentials/data | Stripe test mode uses test credentials/data and does not affect live data or banking networks. [Stripe API test mode](https://docs.stripe.com/api) | Consequential integrations need an explicit test boundary; it must not be inferred from a user clicking Explore. |
| Simulated success and failure | Shopify test orders simulate checkout behavior without charges and can exercise error cases. [Shopify test orders](https://help.shopify.com/en/manual/checkout-settings/test-orders) | “Test mode” must be able to prove failure/recovery, while clearly excluding test results from real financial/reporting outcomes. |
| Separate changes with explicit merge | Figma branches isolate design changes and make merge/review intentional. [Figma branches](https://help.figma.com/hc/en-us/articles/5668839659415-View-and-manage-branches) | Draft/sandbox work needs an explicit promotion step; it must never silently become live work. |

These products do not use one universal safety switch. They combine separate
patterns for low-risk exploration, drafts, simulations, isolated environments,
and consequential integration tests.

## Platform journeys and transitions

```text
Web visitor
  └─ /explore/* → public Explore, browser-local sample workspace
       ├─ reset / leave
       └─ create or sign into account → explicit import of eligible Explore work

Mobile visitor
  └─ Continue as Guest → anonymous subject + local-only work (15-day lease)
       ├─ reset / expiry
       └─ create or claim account → explicit migration of eligible Guest work

Authenticated account holder (web or mobile; new or long-time)
  ├─ use feature live → existing account-authorized work
  └─ Safe Try this feature → that feature's draft / preview / practice copy
       ├─ reset or discard
       └─ explicitly apply selected work to Live only when supported
```

These are intentionally different visitor entry journeys. **Web has Explore,
not Guest. Mobile has Guest, not Explore.** Both platforms provide Safe Try
inside an authenticated account, whenever a person encounters an unfamiliar
feature. Explore and Guest conversion are independent: web Explore work may be
explicitly imported where supported; mobile Guest work follows the Guest claim
and migration contract. Neither path silently imports sample fixtures.

- **Explore** is public web access at `sanctuary.gurudevi.app/explore/*`, with
  fictional baseline data and reversible browser-local interaction. Opening it
  creates no Supabase identity.
- **Guest** is explicit mobile-only temporary continuity. Its Supabase
  anonymous subject identifies a device-local journey; it grants no feature
  data cloud-write or sync authority.
- **Safe Try** is a per-feature option available to authenticated account
  holders on web and mobile. It never changes the account identity or another
  feature's live persistence mode.
- **Demo** is curated orientation. **Sandbox** is reserved for features whose
  realistic rehearsal requires server isolation. Provider test modes remain
  specific to a payment, messaging, or other external integration.

## Implementation plan (updated 2026-10-04)

This plan reuses the accepted web Explore and mobile Guest decisions and the
active Sanctuary web canvas plan. It does not create a separate product, cloud
Guest tier, or generic global practice mode.

### Phase 0 — Resolve docs and characterize real seams

1. Keep [web Explore access](../decisions/2026-09-14-sanctuary-explore-access-and-persistence.md)
   and [mobile Guest lease](../decisions/2026-09-10-guest-local-first-lease.md)
   as separate authorities. Keep [mobile entry routing](../decisions/2026-09-10-entry-route-authority.md)
   scoped to mobile Guest; don't interpret its “Explore as Guest” language as a
   mobile Explore product mode.
2. For candidate feature slices, record renderer, live query/command, current
   Explore adapter, current Guest store (mobile), account drafts, reset, external
   effects, and migration eligibility. Trace every caller of the command. For
   web `/explore/*`, inspect host routing, proxy session refresh, and the
   sanctuary layout/auth provider to verify no account feature data hydrates. Key
   seams include `apps/gurudevi-web/lib/explore/storage.ts`,
   `apps/gurudevi-web/lib/explore/self-reflection.ts`, web feature canvases,
   `packages/core/src/lib/persistenceBoundary.ts`, and mobile
   `packages/core/src/native/guestDataManager.ts`, `guestIdentity.ts`, and
   `guestLease.ts`.
3. Characterize `GuestDataSync` and its `/powersync/upload` gateway call before
   reuse. Current code covers only timetable, mood logs, journal entries, and
   students; it makes random operation IDs and deletes local data after a
   successful response. Establish transaction/partial-failure, retry,
   duplicate, authorization, and existing-account collision behavior first.
   `migrateGuestDataToAuthenticatedUser` handles identity state; it is not the
   feature-record migration itself. The September 10 entry ADR already says
   legacy direct upload is not the default claim mechanism.
4. Reconcile entry labels while inventorying: `SanctuaryDoorwayActions` still
   defaults to “Explore as Guest”; mobile must say “Continue as Guest”, while
   web visitor entry must point to public Explore and must not offer Guest.
5. Use the Fire Journal candidate described below, subject to confirming its
   current web and native action seams. It has an irreversible live action, so
   its practice path must use synthetic entries only. Do not use real journal
   content or student records as practice fixtures.

**Exit:** a feature/platform inventory names the actual persistence adapters,
external side effects, and live mutation gates; no unresolved web Guest or
mobile Explore mode remains in active plans.

### Phase 1 — Finish the public web Explore contract

1. Keep `/explore/*` public on `sanctuary.gurudevi.app`, outside account-only
   authorization. Web welcome/visitor actions say **Explore** and route there;
   remove Guest wording from the web visitor path. Explore routes must not hydrate live account feature data
   from a restored browser session.
2. Reuse real canvases and domain validation where implemented; inject the
   Explore local adapter for local reversible operations and fictional fixtures.
   Keep each feature's Explore namespace separate from account data.
3. Preserve the existing `localStorage` adapter for small Explore records. A
   failed write must remain visible and preserve the entered content. Browser
   storage is best-effort, can be cleared/evicted, and has a small Web Storage
   quota; only introduce IndexedDB if a feature's structured-data volume or
   query needs justify it. Request persistent storage only if the product
   contract truly depends on it.
4. For “keep this work,” show exactly which user-created records can move to an
   account. Freeze the source namespace during import, use stable source record
   IDs and an idempotent import operation, retain the local copy until the
   server confirms completion, and exclude baseline fixtures.
5. Keep server-required actions unavailable with preserved input and an honest
   account requirement; do not intercept a real command and report fake success.
   The current Sanctuary web auth/client guard rejects anonymous identities;
   preserve it for account APIs, with public Explore using its separate local
   adapter.

**Exit:** anonymous browser use has working local edits/reset; the live account
adapter and durable mutation endpoints are not reachable from Explore; storage
failure is disclosed; supported import is reviewable and retry-safe.

### Phase 2 — Complete mobile Guest local-first and claim

1. Label the native welcome action **Continue as Guest**. Preserve the existing
   explicit Guest choice, anonymous subject, fifteen-day lease, reminder/expiry
   cleanup, guest-scoped storage, and no PowerSync/no cloud feature-write
   policy.
2. Audit every Guest-enabled feature store and external effect. Guest work must
   remain local to the current device and lease. Do not reuse account outbox
   drafts as Guest or Safe Try storage.
3. Separate identity claim (linking the current anonymous subject to account
   credentials) from feature-data migration. Present a manifest of eligible
   records, freeze source writes while importing, use stable IDs and idempotent
   server commands, and retain local source data until a durable completion
   receipt. Define conflicts when the person signs into an existing account.
4. Migrate one feature at a time through normal account-authorized commands.
   Start authenticated sync only after the subject is a permanent account and
   migration policy is resolved. Preserve unsupported data locally until lease
   expiry and tell the user what will not transfer.

**Exit:** lease expiry removes every registered Guest key; anonymous identity
cannot create feature-data cloud writes; claim and data transfer have distinct
states; partial failure/retry cannot lose or duplicate eligible records.

### Phase 3 — Build account-holder Safe Try foundation, then prove it by feature

1. Build the shared contract and enforcement before adding per-feature entry
   points: resolve the selected feature's Practice adapter before command
   dispatch; scope local data to the account, feature, and practice workspace;
   and make unsupported actions fail closed. Do not change global
   `ExperienceMode`, PowerSync identity, or session state. The contract records
   supported platforms, reads/writes/effects, fixture source, reset behavior,
   and whether Keep is supported.
2. Persist web account practice in a namespace distinct from public Explore and
   account data. On mobile, use a separate account-practice keyspace from Guest;
   do not register account practice in the Guest lease or allow it into Guest
   migration. The persistence-boundary helper is not sufficient if a command
   call site can bypass the adapter.
3. Support validation mistakes, simulated recoverable save failure, retry,
   cancel, reset, and discard. Never call a production endpoint to simulate
   failure. Safe Try remains reachable from the feature after account creation
   and at any later tenure.
4. At the end of a practice session, let the user discard or review and Keep
   selected eligible user-created records. In v1, Keep creates new live records
   only through the feature's normal authenticated command, with server-side
   authorization rechecked and an idempotent operation. It never copies sample
   fixtures or silently overwrites existing live records. The feature contract
   can later opt into reviewed edits with explicit conflict handling; v1 does
   not prevent that extension.
5. Prove isolation and failure recovery with a consequential canary such as
   **Fire Journal**. Its practice uses a separate, visibly synthetic fixture,
   makes no request to `burnJournal`, and exposes reset/discard. Because this
   action is irreversible, Fire Journal practice content is not eligible for
   Keep. Select a separate reversible feature during the inventory phase to
   prove the new-record Keep path before claiming that promotion is implemented.
   Confirm the native Fire Journal command/store seam before enabling its
   practice entry point on mobile.

**Exit:** web and mobile account holders can try the feature without changing
identity; practice records reset independently; Fire Journal practice cannot
call the live burn command; a promotion-capable feature can Keep selected new
records without duplication; account tenure does not affect availability.

### Phase 4 — Add higher-consequence rehearsal only when needed

Choose the least complex honest containment per feature: pure What-if
calculation; local practice copy; account-private server draft; isolated
server Sandbox; provider-specific test environment. A server Sandbox is a
separate project only when the feature needs realistic server-backed or
multi-person rehearsal. It then requires server-enforced ownership/isolation,
reset and expiry, authorization, audit policy, sync/cache scope, and provider
side-effect controls. Payment and messaging practice must use provider test
credentials/environment and be excluded from live reporting and delivery.

### Phase 5 — Expand by feature, not by global switch

Maintain a feature matrix with platform, mode, fixture, permitted commands,
blocked effects, reset, Keep eligibility, and evidence. Keep rollout/edition
availability and Simple/Full presentation as separate matrix dimensions. Add
Safe Try from each feature entry point as that feature's contract is completed.
Do not claim the whole application is safely explorable based on one canary.

### Research-grounded implementation patterns

- Local-first means writes apply to local persistence immediately; remote-only
  effects still need explicit queued/accepted/failed states. Expo's guidance
  uses SQLite on native and discusses localStorage on web, but does not prescribe
  a universal cross-platform backend. [Expo local-first guide](https://docs.expo.dev/guides/local-first/)
- Supabase anonymous users are real `authenticated` Postgres users with an
  `is_anonymous` JWT claim, not the unauthenticated `anon` role. Anonymous
  identity linking and RLS are separate concerns; anonymous sign-ins need abuse
  controls and Supabase documents manual cleanup. This supports the already
  accepted mobile identity choice but is unnecessary for identity-free web
  Explore. [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- Supabase security uses both table grants and RLS. If any future Safe Try
  feature gets server-side practice storage, isolation must be enforced by the
  server and RLS—not by a client label or local mode flag. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Browser storage is best-effort by default and Web Storage is quota-limited;
  IndexedDB is appropriate for larger structured offline data but still needs
  an explicit server synchronization design. [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

## Isolation canary: Fire Journal

Fire Journal is a useful first **isolation** canary, not the promotion canary.
The web Self canvas exposes the real `burnJournal` operation, while the
existing Explore reflection adapter proves local creation, update, delete,
reset, and namespaced persistence. The Safe Try adapter will have its own
account-practice namespace and synthetic entries. It must never send practice
content to `burnJournal` or import real journal text. Because the real action is
irreversible, Fire Journal practice content is not eligible for Keep. A
separate reversible feature that creates new records must prove selected-record
Keep through its normal authorized command. Mobile Fire Journal follows after
its native command/store seam is characterized. Workspace attendance remains a
higher-consequence candidate because it involves real learner records.

## Infrastructure decision

The first release needs no new cloud identity, Supabase table, PowerSync
publication, dedicated database, or package. Reuse browser-local storage for
small web Explore/practice records and existing mobile Guest-safe local
storage. Complete the adapter/write-dispatch plumbing and migration contract
first. Add IndexedDB only for a demonstrated web record/query need. Add
server-side practice tables and RLS only when a feature requires durable
server-backed practice; add a separate provider test account only for a real
external integration rehearsal. Supabase anonymous-user settings, CAPTCHA,
RLS changes, and cleanup jobs are not required for public web Explore; mobile
Guest already uses the accepted anonymous identity and local-only policy.

## Safety contract for every feature

Before a feature offers Safe Try, Demo, Draft, What-if, Sandbox, or Live, its
owner records the following:

1. **Persistence:** Is the change local, simulated, sandbox-isolated, or
   durable live data?
2. **Reset and recovery:** What exactly is reset, how can the user undo it,
   and what remains after reset/expiry?
3. **External effects:** Are sync, sharing, notifications, email, push,
   payments, provider calls, analytics identity, and uploads blocked, dry-run,
   simulated, or live?
4. **Promotion:** Can work move to an account/live state? For v1 Safe Try, only
   explicitly selected, user-created records that become new live records are
   eligible. Sample fixtures and updates to existing live records are excluded.
   The feature names the authorized command, validation, idempotency, and
   failure/retry behavior. Future reviewed edits require an explicit feature
   contract and conflict flow.
5. **Truthful feedback:** Does the UI ever report success for a discarded or
   blocked operation? It must not.
6. **Evidence:** Which local, adapter, server, browser, and device scenarios
   prove the stated boundary?

## How Safe Try is wired into a feature

Safe Try is selected when a person enters an individual feature. It is not an
app-wide authentication state or a global switch. Their account remains
authenticated; only that feature instance receives a practice data adapter.
The same renderer and domain validation can operate on live account data or
Safe Try fixtures for account holders on both platforms; web Explore and mobile
Guest use their own respective local adapters through an explicit feature port:

```text
feature UI and domain validation
               |
        feature data port
   /           |          |          \
live account  Explore    Guest       Safe Try
API + authz   local      local       synthetic/local
```

For example, an attendance feature port needs operations equivalent to
`loadRoster`, `saveMarks`, and `resetPractice`. The account adapter resolves
the selected classroom and calls the current authorized attendance service.
Explore and Guest adapters use their own local namespaces. The Safe Try
adapter loads a fictional roster, saves only to its practice namespace, and
never imports real student IDs or calls the account save function. The existing
account attendance draft is pending live work; it is not the practice adapter.
Browser attendance is the first Workspace Safe Try implementation. Its
fictional roster is keyed by account, feature, and practice workspace; it does
not load a live roster and has no path to the account attendance command.
Practice marks stay local and are discarded together. They cannot be kept on a
real classroom roster. This is a browser implementation; mobile account
practice remains a separate platform task.

`packages/core/src/lib/persistenceBoundary.ts` already provides an internal
`sandbox` persistence namespace for account-owned local data and a decision
that denies production writes for that namespace. A feature may use that
namespace for Safe Try while displaying the human label **Try safely**. The
write decision must be checked before every real API/outbox dispatch; naming a
namespace alone does not block a call site that bypasses the boundary. Do not
set the existing app-wide `ExperienceMode` to `sandbox` to enter one feature's
practice flow.

Failure practice is a scenario input to that feature's local adapter, such as
`normal`, `validation-error`, `temporary-save-failure`, or `offline`. The
adapter returns the same typed outcomes the feature UI already needs to
present, but does not send a fake request to the production service. A retry
scenario can fail once then save to the practice namespace. A feature that
needs a realistic third-party integration must use that provider's own test
credentials/environment, never the account holder's live credentials.

Reset clears only the selected practice namespace and restores its baseline
fixture. Baseline fixtures use fictional identities, are labelled as sample
data, and are excluded from guest/account migration. If a different feature
supports applying practice changes to real work, it must show a specific change
preview, revalidate live authorization, and submit through the existing live
command. The attendance practice fixture itself is discarded; it is not copied
onto a real class roster.

### Guest-to-account data transfer

Each Guest-local feature store is keyed by the temporary guest subject and
registers its data with the existing lease cleanup. When a person explicitly
creates an account, the app freezes writes for the source Guest namespace and
builds a versioned manifest of eligible feature records. It upgrades/claims the
identity where supported, then writes eligible records through normal
account-authorized feature commands. The server returns a migration receipt
keyed by an idempotent operation ID. Only after the receipt confirms every
record does the client mark the manifest complete and offer to remove the
local Guest copy. Failure keeps the source records intact and allows a safe
retry; no migration step is a generic copy of every browser key.

Signing into an already existing account can have collisions with that
account's records. It uses the same reviewed manifest but requires a
feature-specific conflict choice (keep account, replace, or merge where
meaningful) before writing. This is distinct from claiming the current Guest
identity. Unsupported records stay local and are disclosed before the person
confirms.

## Future authenticated Sandbox

An authenticated person must be able to safely learn a feature whenever they
encounter it. That promise does not require a universal Sandbox. Reversible
features can use account-private drafts, local copies, undo, or What-if
previews. A distinct Sandbox is needed only for a feature whose realistic
practice requires server-backed records or coordinated workflows that cannot
be safely represented by those simpler mechanisms. It lets an already
authenticated person or organization practice without creating live
consequences or opening a second account.

It needs a dedicated decision before implementation because it may require:

- server-enforced sandbox ownership and data isolation;
- reset/expiry and explicit promotion-to-live semantics;
- restricted provider effects and separate storage/analytics handling;
- PowerSync publication/cache scope if offline behavior is included; and
- organization, role, audit, privacy, and cost rules.

Until that decision exists, use feature-level **Draft** or **What-if** behavior
for safe account-holder experimentation where those mechanisms are sufficient.
Do not mislabel a local draft as a server-isolated Sandbox, or expose a feature
as safely testable when it can still affect another person or live records.

## Implementation status

The platform scope and ordered implementation plan are above. The source
inventory and feature-by-feature execution remain to be completed; this plan
does not claim implementation is complete.

### Implementation checkpoint (2026-10-04)

- The shared core now has an account-owned, feature/workspace-scoped local
  practice identity and key derivation. Safe Try writes resolve to local, while
  production writes remain blocked by the existing persistence boundary.
- The shared core now also exposes a cross-platform practice adapter/controller
  contract and a role/capacity-aware availability decision. Web and native
  features can use the same lifecycle (`load`, `save`, `reset`, `discard`) while
  retaining platform-specific storage.
- The authenticated web Fire Journal exposes a Safe Try canary backed by
  fictional browser-local data. It never calls the live `burnJournal` command;
  ending the try discards its local workspace. The UI distinguishes persistent
  browser storage from the in-memory fallback.
- The authenticated browser Workspace exposes Safe Try for daily attendance.
  It loads only fictional students, saves to a separate account-scoped local
  practice workspace, and offers one action to discard that workspace. Practice
  data cannot be copied into live attendance. Public Explore and account
  attendance flows remain separate.
- This checkpoint does not implement mobile account Safe Try, selected-record
  Keep, the Simple/Full presentation profiles, a product-edition policy, or
  feature-wide rollout. Those remain in the ordered plan above.

