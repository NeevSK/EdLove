---
title: "Mobile state foundation: capability ownership and interaction design"
status: "draft"
created: 2026-10-26
updated: 2026-10-26
author: "Codex"
tags: [mobile, architecture, design, capabilities, state]
---

# Mobile state foundation: capability ownership and interaction design

## Design purpose and place in the program

This is the missing horizontal design between research/reconciliation and implementation. It defines what the whole mobile state system must do, the authority and lifetime of each capability, which dependency serves which role, and how the parts cooperate. The earlier implementation work packages are a draft delivery backlog; they cannot choose this structure merely by fixing one file after another.

Read order: [existing inventory](2026-10-26-mobile-state-01-existing-inventory.md) → [installed capabilities](2026-10-26-mobile-state-02-runtime-capabilities.md) and [upstream lessons](2026-10-26-mobile-state-05-upstream-guidance-and-lessons.md) → [reconciliation](2026-10-26-mobile-state-04-reconciliation-and-direction.md) → **this design** → [implementation plan](2026-10-26-mobile-state-06-implementation-plan.md) → [execution log](../current_progress/2026-10-26-mobile-state-modernization-log.md).

Scope is the horizontal client foundation supporting the mobile app's domains. This is not a new backend/database schema or a complete redesign of every domain feature. Each feature still needs its own domain contract; the foundation supplies consistent ownership, lifetime, observation and interaction rules. Diagrams are conceptual responsibility views, not proposed classes/providers/files. This draft is not shipped behavior, a dependency-upgrade authorization or device evidence.

## What “foundation” means here

A coherent set of responsibilities and contracts, not an application-wide super-store, new framework, generalized orchestrator or mandatory layer through which every tap must pass. Existing ports, database runtime, query cache, router and UI owners are the substrate. Consolidate these where justified; do not add a parallel foundation beside them.

The design separates three decisions:

1. **Functional capability:** what the person needs to do and what must survive interruption.
2. **Ownership and interaction:** who confirms facts, who retains them, who observes changes, who coordinates lifetimes.
3. **Implementation choice:** which installed library or small existing module supplies that contract with the least machinery.

For example, “retain a user's sound choice” is the capability. “One device preference record, observed by settings and feedback” is ownership. “Existing selected storage plus reactive observation; MMKV hooks if that backend is admitted” is an implementation choice. Creating useSoundStore is not the design requirement.

## Dependency alignment: compatibility and meaning

Pinned versions below are the audit baseline, not a live registry promise. Recheck manifests, installed declarations, native cohort and generated build before implementation. No upgrade is selected by this document.

| Dependency family | Baseline | Assigned role in the design | Boundary / alignment evidence required |
| --- | --- | --- | --- |
| React | 19.3.1 | Component/subtree state, derivation, composition, subscription integration, Action display lifecycle | Native renderer support; Compiler output where relevant. No external authoritative data mirror by default. |
| RN / Expo | 0.88.0 / 58.0.17 | Native host, runtime modules, AppState and platform signals | SDK/native module compatibility and development-client binary identity; JSI is not a durability or zero-cost contract. |
| Expo Router | 58.0.25 | Route identity, navigation stack, focused route parameters and lifecycle | Back/deep-link semantics, stable native API support; web loaders are not a native read-cache replacement. |
| Zustand | 5.0.16 | Only retained shared app-owned models needing selective observation | Prefer local/scoped lifetime; stable selectors; persist only explicitly justified data. Does not own every capability in this table. |
| MMKV / Nitro | 4.3.2 / 0.37.1 | Candidate native scalar preference backend and reactive key observation | Same instance/namespace, admitted startup cost, actual binary; typed remove; defined alternate-backend/migration semantics. |
| AsyncStorage / StorageManager | Installed adapters and established KV ports | Required supported backend/fallback and access seam until a replacement is proven | Memory acceptance versus completed write must be explicit; no hidden per-operation second authority. |
| TanStack Query | 5.104.5 | Remote read lifecycle/cache, qualified mutation presentation, invalidation | Resource-specific scope, native connectivity/focus integration, cancellation and stale response disposition. |
| PowerSync / Drizzle | React 2.0.2, native 2.3.1, driver 0.8.0 | Local relational observation, account database runtime and supported replicated writes | Single active ownership, account-isolated files, database/receipt lifecycle, declared replication/upload semantics. |
| XState | 5.33.3 | Optional implementation of an admitted transition protocol | Not a required global layer; v6 docs excluded; transition/effect/resource model must be simpler than retained coordination. |
| Worklets / Reanimated / RNGH | 0.13.0 / 4.7.1 / 3.4.0 | High-frequency gesture/animation work and explicit runtime crossings | No per-frame global React store updates; ordinary JS singleton is not implicitly worklet-safe. |
| Verger / existing efficiency runtime | Workspace packages and unmerged adaptive-runtime branch | Device resource observations, reversible quality and optional workload admission | Single resource policy; never auth, durable intent or network truth; see upstream comparison below. |
| Expo audio / haptics | Installed SDK58 cohort | Native effects with bounded resource lifetime | Feedback policy, one registration owner, cleanup; neither is authority for user preferences. |
| SecureStore / auth provider | Existing supported ports and native implementation | Credential and protected-key custody | Canonical account ID remains separate from provider subject; never move tokens into convenience stores. |

**Version alignment** means compatible dependencies/build artifacts. **Semantic alignment** means each dependency has one justified job and cooperates through explicit contracts. A fully current installation can still have an incoherent architecture; adding a newer state library does not supply the latter.

## Horizontal ownership view

~~~mermaid
flowchart TB
  UI[Feature UI: local inputs and derived display]
  ROUTE[Router: screen identity and focused lifecycle]
  LIFE[Existing lifecycle boundaries: account and active scope]
  PREF[Preference owner: validated scoped keys]
  REMOTE[Query: remote read observers]
  LOCAL[PowerSync and Drizzle: local relational observers]
  CMD[Existing domain commands and durable receipts]
  POLICY[Verified authorization and capability policy]
  EFFECT[Native effects and resources]
  SIGNAL[Platform observations]
  VERGER[Verger: resource policy and optional admission]
  BACK[Server authority]
  UI --> ROUTE
  UI --> PREF
  UI --> REMOTE
  UI --> LOCAL
  UI --> CMD
  UI --> EFFECT
  LIFE --> REMOTE
  LIFE --> LOCAL
  LIFE --> CMD
  LIFE --> POLICY
  PREF --> EFFECT
  PREF --> VERGER
  SIGNAL --> VERGER
  VERGER --> EFFECT
  POLICY --> CMD
  CMD --> BACK
  BACK --> REMOTE
  BACK --> LOCAL
~~~

Arrows identify allowed dependency/interaction directions, not synchronous function calls in every case. Replication and transport are asynchronous. Policy influences local admission but server policy remains authoritative. Lifecycle coordinates disposal/admission across owners; it does not copy all their data into one runtime snapshot. UI can subscribe directly to the appropriate owner without a facade forwarding every library.

## Capability map: need → current implementation → proposed structure

Current paths summarize the source-linked inventory; target columns are design proposals. “Owner” names a responsibility, not necessarily a new store. No row authorizes removing its existing working path yet.

| App capability | Current implementation / friction | Proposed owner and modern implementation | Interactions and lifetime |
| --- | --- | --- | --- |
| Launch public routes reliably | Runtime bootstrap, EntryShell, providers and startup gates; required/optional work spread across owners | Existing app bootstrap owns adapter availability; route admission owns required readiness; optional services remain independently scheduled | Process runtime; public UI does not wait for optional account resources. |
| Acquire identity, refresh and recover credentials | AuthProvider/useAuthLifecycle, auth store, provider sessions, recovery boundaries | Credential provider owns credential status; existing account lifecycle resolves canonical account facts; minimal observed identity result | Account lifecycle; credential subject is not domain account ID; failure distinguishes resolving/offline/revoked. |
| Explore as guest, convert and retain intended work | Guest lease/conversion/persistence boundaries and account services | Existing guest/account lifecycle with explicit ownership transfer/disposition | Guest scope to confirmed account; no blind copying of all old cache/state. |
| Choose personal/institutional workspace | ScopeSession coordinator plus Auth/Tenant/Perspective mirrors | One validated active-scope authority; tenant/bond projections derived; transition implementation selected after full graph review | Principal and scope lifecycle; changes coordinate policy/read work, not account-wide clearing. |
| Navigate and restore focused work | Router plus active-subtabs/workbench and pending intent store | Router owns navigable identity/back stack; task model owns only task-specific descriptors, dirty state and capacity | Route/subtree/task lifetime; restore only allowlisted validated descriptor data. |
| Handle external/deferred links | Native intent, TTL pending intent, legacy deferred key | Existing link admission resolves one pending intent; router executes only after route/account constraints satisfied | TTL and explicit consumption; links never grant authority. |
| Theme, consent and sensory choices | Mixed UI store, consent store, sensory provider/key, dormant sensory store | One explicit preference authority by device/account policy; direct reactive key or a justified narrow observer | Persistent choice; effective system theme/policy derived; storage failure explicit where required. |
| Read local and selectively replicated domain records | Drizzle/PowerSync hooks and local-first adapters, some overlapping query paths; classrooms is not selected by checked-in streams | Database observer for resources already locally authoritative under their domain contract | Account database lifecycle; no automatic second mutable cache. |
| Read remote notifications/security/social data | Query families, older hooks and service boundaries | Existing resource-scoped Query observers with typed ports and exact failure states | Principal or resource scope as defined; no shared “all app state” projection. |
| Authorize local operation and show capability status | Cedar decision store, capability hydration, entitlement store and flags | Verified authorization reader/evaluator; separate commercial entitlement and rollout metadata owners | Snapshot principal/scope/policy/expiry checks; UI hides/admission not server authorization. |
| Edit forms, journals and attendance drafts | Local reducers/hooks, generic draft declaration and feature persistence | Form/route owns edits; required restart-safe drafts use scoped domain persistence | Unsaved/locally saved/submitted are distinct; do not overwrite edits on cache refresh. |
| Submit work offline and reconcile | MutationQueue, SyncManager, audit/conflict stores, provisional queue; PowerSync CRUD where supported | Existing qualified domain command path; choose the queue belonging to that data contract | Local acceptance → durable acknowledgement → pending → server receipt/rejection; no dual enqueue. |
| Resolve conflicts and inspect command outcomes | Conflict/audit holders and bus-driven UI | Domain reconciliation/history with minimal observed UI status | Original principal/command ID; history retention separate from preference reset. |
| Browse past/future and switch timeline views | Temporal store has date, derivatives, animation and offline flag | Minimal navigation/time selection; pure derived phase; animation owned by its rendering runtime | Domain/route scope; timezone/midnight and rapid interaction defined. |
| Arrange personal canvas/desk/workbench | Stores combine preferences, structured resources, retries and remote persistence | Separate preference values from domain resources and local/remote save coordination | Exact account/task scope; late completion cannot update replacement owner. |
| Emit feedback, play audio and show overlays | Contexts, singleton copies, callback registration, players and UI flags | Local UI for local overlay; one explicit app effect registration where global invocation is needed; feedback derives from preferences/policy | Commit/register/dispose lifetime; background or unmounted owner must release resources. |
| Adapt to motion, power, connectivity and pressure | Reality/Fidelity/VisualCapabilities, native signals and optional admission pilot | Platform observation owner plus user override; pure effective policy | Process/account/route depend on signal; unknown remains unknown, not fabricated healthy. |
| Admit versions and recover from failures | Version gate mixes manifest facts, severity and dismissal | Manifest read owner; derived required severity; scoped/device dismissal preference | Failed check is explicit policy; hard-block requirements retained. |
| Observe performance and diagnose faults | Existing telemetry, trace/profile tooling, gates | Existing observability owner reports artifacts/journeys; no parallel telemetry platform | Instrument cost and privacy bounded; static counts are not phone performance. |

## Functional surfaces consume these capabilities

| Surface | Composition of foundation capabilities | What should not be global by convenience |
| --- | --- | --- |
| Workspace / classroom / attendance | Account+scope, verified policy, qualified roster read, form/draft owner, durable attendance command and receipt | Entire roster, field inputs and submission status copied into Auth/UI/feature stores. |
| Self / journals / personal canvas | Principal, local or remote domain reads as specified, local form state, required draft persistence, preference layout | Every card's state and every derived growth label in a cross-app singleton. |
| Library / reader / media | Route resource ID, qualified resource read, local player/reader position, explicit permitted bookmark persistence | Player resources or reading progress copied to a generic app store without a continuity requirement. |
| Community / messaging | Principal/resource keys, actual transport/cache owner, pending composer, qualified durable send/rejection flow | Another duplicated entity map merely because the data is used in two screens. |
| Profile / security / consent | Canonical account, principal-scoped Query summary, existing command manager, consent preference and credential provider | Trust/session revoke success inferred from optimistic local state. |
| Global shell / sensory / task affordances | Structural hosts, task/route registration, one preference policy and native effect ownership | A provider for each boolean or a singleton for each subtree-local UI element. |

This map covers horizontal composition across the named domains. Domain-specific schema/endpoint correctness still needs a separate bounded feature review; no claim that every feature is currently wired exactly this way is made.

## Shared semantic contracts

These are semantic requirements to bind to existing types, not proposed new universal interfaces.

| Contract | Required meaning | Existing anchor / design consequence |
| --- | --- | --- |
| Identity | Canonical account/principal ID distinct from provider subject and credential status | Auth port and canonical UUIDv8 cutover; no token/subject substituted into domain data keys. |
| Scope | Validated selected lens, relevant bond/entity and transition identity | ScopeSessionSnapshot/coordinator; per-resource key uses only real ownership dimensions. |
| Observation | Current immutable/stable snapshot plus change notification and release | Query/PowerSync/MMKV hooks or retained store; no polling/copy loop when an observer already exists. |
| Persistence | Namespace/schema/allowed payload, retention, restore outcome and acknowledgement | Existing KV/storage ports and domain journals; memory acceptance is not completed persistent write. |
| Read state | Not-ready, loading, data/staleness, unavailable/error and cancellation disposition | Existing family-specific hooks; preserve last data only when its scope/policy permits. No universal result wrapper needed. |
| Command state | Original principal/scope, operation/idempotency key, local acknowledgement, receipt/rejection/conflict | Existing command types and receipts; UI optimistic projection is explicitly separate. |
| Resource lifetime | Who creates, who may replace, who disposes, and behavior of late callbacks | Native players/listeners/DB ownership and app boundaries; disposal must not clear a newer owner's registration. |
| Transition completion | No future read/work can re-enter from outgoing scope after completion | Existing generations/cancellation/commit guards; verify all observers rather than invent one new global lock. |

Credentials, domain IDs, validated grants, feature flags and presentation choices remain distinct facts even where the UI uses all of them. Architecture simplification must not collapse real distinctions to reduce type or store counts.

## Allowed interaction rules

| From → To | Permitted relationship | Relationship to avoid |
| --- | --- | --- |
| Screen → read owner | Subscribe to the matching resource and derive display | Query success Effect writes the same data into Zustand. |
| Screen → command owner | Submit explicit domain intent; observe durable/confirmed result where needed | Screen calls transport, queue and optimistic store independently for one operation. |
| Screen → route owner | Navigate or change non-sensitive navigable parameters | Mirror every URL param into a global selected-entity object. |
| Account/scope lifecycle → resource owners | Validate, pause/admit, cancel/detach/invalidate and commit by actual ownership | Reset every store/cache/database on any workspace change. |
| Command settlement → read owner | Apply confirmed domain update or invalidate exact read family | Broadcast unscoped “refresh everything” or make cached grants authoritative. |
| Database/remote adapter → UI | Existing observable read contract | Adapter imports UI components or closes over a screen's changing state. |
| Preference → policy/effects | Observe one preference record; derive effective behavior; configure bounded resource | Context, store and service each persist an independently editable preference copy. |
| Worklet → RN function | Verified explicit scheduling at a meaningful event boundary | Directly invoke arbitrary mutable JS services on every animation frame. |
| Event bus → observer | Notify lifecycle/domain occurrence with cleanup; use authoritative owner for current state | Treat transient event delivery as durable journal or reconstruct hidden truth from event order. |

Dependency direction follows repo boundaries: app owns native composition, core/domain packages own platform-neutral contracts and logic, UI owns rendering and effect adapters appropriate to its boundary. Any shared direct MMKV import must respect the existing native adapter boundary; no browser target gains native dependencies through this design.

## Interaction flow 1: startup and account admission

1. The app registers verified runtime adapters once. Restore only what a public launch needs; optional native warmups do not become mandatory route gates.
2. Credential acquisition reports its status. Existing identity resolution binds the credential subject to canonical account identity; an old profile must not silently become a new subject's identity.
3. The lifecycle admits the matching account database/reads and the selected validated scope. Account/scope-ready is distinct from online, capability-verified and server-confirmed.
4. Protected features observe their qualified readiness. Missing optional data yields a feature-level state, not an app-wide spinner or false success.
5. Services register through their owning committed lifecycle; route/subtree resources are released when that owner ends.

The staged ordering is resolved under D02/D03 and Exact account, scope and startup ordering below: minimally verified identity may select the database; protected consumers wait for the matching runtime and policy. No synchronous atomic commit across React, network and SQLite is claimed.

## Interaction flow 2: account or workspace transition

~~~mermaid
sequenceDiagram
  participant U as User
  participant L as Existing lifecycle boundary
  participant R as Read and policy owners
  participant D as Account database and commands
  participant V as Feature UI
  U->>L: Select account or scope
  L->>L: Validate target and transition identity
  L->>R: Stop outgoing scoped admission and cancel applicable reads
  L->>D: Preserve commands; detach runtime if account changes
  L->>L: Publish verified candidate identity with protected consumers gated
  L->>D: Attach matching target runtime if account changed
  L->>R: Validate scope and policy; admit matching reads
  R-->>V: Matching ready/error/denied result
  D-->>V: Matching local data and pending work
~~~

The diagram expresses the target staged ordering; implementation evidence must verify it against the retained runtime contracts. Account-owned notifications/security need not be discarded for a workspace switch. Old-account durable commands remain associated with that account. A failed transition restores a valid prior state or reports unavailable safely; old async completions cannot populate the new owner. Selection itself does not grant authorization.

## Interaction flow 3: offline attendance / another durable action

1. Form owner holds edits for an identified principal/class/period. Roster data comes from the admitted read path; query refetch must not overwrite an unsaved draft.
2. Domain submission checks input and local policy, then chooses the one existing write contract for that resource: PowerSync CRUD queue where that domain uses it, or the existing explicit command journal/receipt path. Do not add both.
3. UI can show optimistic/pending feedback; it may say locally saved only after the required persistence acknowledgement. Keep draft and submitted command identities distinct.
4. Network/auth lifecycle admits upload for the original account. The server validates authorization and returns a receipt, rejection or conflict under the established idempotency contract.
5. Confirmed settlement updates/invalidate the correct observed resource. UI renders confirmation or recovery. Restart reconstructs pending work from durable records, not from a component or service timer.

Attendance's exact existing v1/v2/receipt differences must be carried forward from current domain records; this example defines the horizontal interaction contract rather than inventing one universal queue.

## Interaction flow 4: preference and native feedback

1. Settings changes one validated preference owned by its declared device/account namespace.
2. The selected persistence owner reports actual completion/error. The subscribed setting UI reflects the documented policy for optimistic display versus persistence failure.
3. Effective sound/haptic/motion policy derives from preference plus current verified platform observations; it is not a second stored authority.
4. The owning effect lifecycle configures native resources and publishes one replaceable registration. Press/gesture completion emits a bounded event; worklets schedule an RN callback where needed.
5. Unmount, replacement, background or account transition releases resources as required, using identity-safe cleanup. Delayed callbacks cannot resurrect an old player or change another owner's setting.

D04/D05 select one backend per launch and observation at that same seam. Direct MMKV hooks apply only to the admitted MMKV instance. The requirement is one preference authority and safe effects, not “all settings must use MMKV hooks.”

## Interaction flow 5: route and task restoration

Router restores the authorized route identity. Workbench owns only the additional task model it genuinely needs: task identity, ordering/capacity, focus and dirty-state protection. A feature restores its permitted draft separately. Route params do not carry credentials, grants or full entity payloads. Returning to an already-mounted route does not force background screens to observe unrelated global params. If Activity retention is used, memory and effect cleanup remain explicit; hidden is not destroyed and not free.

## Resolved horizontal design — 2026-10-26

This section settles the shared architecture for review and implementation planning. It supersedes the earlier unresolved-choice list. It is a proposed target, not shipped behavior or human acceptance of a specific deletion. Physical qualification and domain endpoint completion remain evidence gates; they do not require choosing the ownership model again.

### Decisions and concrete consequences

| ID | Decision | Consequence / retained constraint |
| --- | --- | --- |
| D01 | Eliminate the aggregate useStore observation model; do not replace it with another aggregate | Callers observe the actual owner. Local inputs stay local; derived values are computed. Retain a narrow shared model only for a real shared lifetime. |
| D02 | Keep credential lifecycle, canonical account identity, selected scope, and resource readiness distinct | Provider subject never selects a domain database. Resource admission checks matching canonical principal, scope generation and policy where needed. No single all-app ready boolean. |
| D03 | Retain existing accountTransition and single-active database runtime as the coordination substrate | Stop old-account writers, await disconnect/quarantine, then admit the target runtime. A failed close blocks replacement; it cannot be bypassed with a second runtime. Bond/lens change is not an account database reset. |
| D04 | Select one scalar backend for a namespace once per launch | AsyncStorage remains the supported default. MMKV is an explicitly configured, physically qualified native option. No invisible per-operation fallback that creates competing authorities. Backend change is a controlled migration with acknowledgement and read-back; preserve old data until disposition is verified. |
| D05 | Extend the existing storage seam only where acknowledgement/observation is missing | Keep synchronous scalar consumers compatible; durability-sensitive writes receive actual completion/error through the appropriate existing async port/adapter. Do not pretend the current void IStorage setter acknowledges disk. On non-MMKV builds use a narrow per-key observer at that same selected seam; stable snapshots and release, no second persisted store. |
| D06 | Device preferences and account content have different namespaces | Device/install: theme including auto, world/living/veil, sensory, language, fidelity and current installation consent. Account or stable guest lease: drafts, dismissals, desk/task layout and scaffold progress. Consent remains undecided/denied/granted; no grant inferred on account switch or from missing data. A future account legal-consent contract would be separate. |
| D07 | Choose read ownership per resource; preserve restart-offline read continuity | SQL observer for the proven local/replicated contract; Query for remote lifecycle. Existing persisted useLocalFirstQuery records cannot be replaced by ephemeral Query alone. Preserve qualified, versioned, bounded durable read records where required; do not persist the whole Query client by default. |
| D08 | Choose exactly one durable command route per operation | PowerSync CRUD only for a verified supported table contract; explicit journal for qualified RPC commands. Never dual enqueue. Local draft saved, durable command pending, and server confirmed are separate user-visible outcomes. |
| D09 | Keep Router and workbench responsibilities separate | Router owns visible route/back/deep-link identity. The retained task model owns task IDs, order/capacity, dirty protection and restoration descriptors. Persist only allowlisted account/guest-scoped descriptors; restore no capability or credential from them. |
| D10 | Retain current explicit coordinators; do not introduce XState in the foundation cut | First write and verify existing transitions, cancellation and recovery. An actor is eligible only for a bounded protocol whose event/effect model retires more coordination than it adds. Installation alone is no reason to adopt it. |
| D11 | One committed owner configures each native resource | Fix registration during render and missing identity-safe unregister. Derive effective sensory policy from preference/platform; do not persist a second policy copy in a service. Exact audio listener/player teardown is verified against installed native declarations before implementation. |
| D12 | Verger owns reversible device resource policy and explicitly optional work admission | It never owns auth, permission, connectivity truth, drafts, outbox or server completion. Local durable acceptance of a user command is critical; retryable upload is a separate workload. User accessibility requirements constrain effective quality; runtime pressure never overwrites stored choices. |

The scalar IStorage interface, the asynchronous feature KV port, file-upload storage port and database transaction contract are different existing seams. Do not merge them because their names contain storage. A successful async acknowledgement proves adapter completion under its contract; crash/power-loss durability still needs the storage engine's actual guarantee and scenario evidence.

### Disposition of all 21 inventoried Zustand holders

This is the target allocation, not a new 21-store topology. Retire means a proposed removal only after callers, persisted records and working behavior have a concrete reviewed disposition. Inventory counts are the earlier snapshot; for example the current UI slice also includes scaffoldCompletions.

| Current holder | Target ownership and observation | Persistence / transition disposition |
| --- | --- | --- |
| Auth | Minimal account/guest lifecycle projection observed directly; credential provider remains credential authority | Canonical identity only after verified binding; protected credentials remain in established custody. Reset/admit through account lifecycle. |
| ScopeSession | One validated in-memory selected-scope authority and retained coordinator | Preferred lens is only a restore hint, revalidated before protected work. Generation rejects late results. |
| Tenant | Domain repository/Query or SQL projection plus selected scope | Remove duplicated school/count/entity facts after consumers migrate; do not lose workspace selection. |
| Perspective | Derive from validated selected scope | Retire compatibility mirror after writers/readers move; no independently persisted authority. |
| Cedar decisions | Scoped verified evaluator result/readiness; signed SQL snapshot remains bounded input | Principal/bond/policy/signature/expiry validated. Expiry denies protected operation without deleting drafts. |
| Entitlement | One qualified remote read lifecycle and bounded offline continuity | Key by principal and actual activeBondId/activeEntityId/activeEntityType contract; no invented perspective dimension. Failure cannot reuse another scope's grant. |
| Feature | One rollout snapshot owner; derive individual flags | Verified TTL snapshot only if continuity required; no duplicate Query-plus-store authority. Flags are not permissions. |
| Version | Manifest read owner and derived severity | Persist dismissal keyed by relevant release/install; network failure is not UP_TO_DATE. Preserve required update gate. |
| Consent | Installation preference with explicit three-state semantics | Never turn absence/error into a grant; migration must preserve current choice and scope. |
| UI | Device preference records, account/guest layout/progress records, and local UI by lifetime | Include scaffoldCompletions and dismissals as progress/content, not device settings. Retain genuinely global shell commands only where needed. |
| Sensory | Single device preference record observed by provider/effect owner | Dormant store and competing keys require stored-data disposition; one effect configuration, no new sensory store. |
| ActiveSubTabs | Narrow account/guest task registry scoped to bond context where required | Keep capacity, dirty safeguards, focus and durable descriptors; Router remains route authority. |
| Drafts | Each real feature owns typed scoped draft records; form state stays local | Dormant generic declaration is not evidence that real drafts are persisted. Inspect existing keys before retirement. |
| SelfCanvas | Mounted canvas model/reducer or scoped observer; separate preference layout and remote save protocol | Local preference may survive restart today while module-memory retry does not. Required remote continuity needs a durable command. |
| Growth | Actual growth read owner; derive labels from authoritative metrics | Previous-counter animation is local presentation, not another domain truth. Preserve offline record only where required. |
| Temporal | One shell-shared navigation owner for date/scale/focus only where cross-surface sharing exists | Derive phase/past from clock/timezone; animation local; connectivity belongs to its own observer. No blanket persistence. |
| MutationQueue | Retain original-account command journal with narrow status observation | Keep idempotency, leases, retries, pause, DLQ and bounded capacity. Unbound legacy commands never replay as the active account. |
| ProvisionalWorkspace | Retain specialized receipt workflow | A local provisional record cannot create active membership/capability before server receipt. Do not merge protocols merely to reduce store count. |
| AuditLog | Bounded command outcome history | Preserve original principal and command identity; separate history retention from preference reset. |
| Conflict | Projection of actual journal/domain conflict records | Resolution updates owning protocol; do not keep another mutable truth alongside it. |
| PendingIntent | Small TTL one-shot handoff before route admission | Allowlist/minimize payload; exclude credentials and secret URL data. Consume once; route owns subsequent navigation. |

### Exact account, scope and startup ordering

Public entry depends only on essential bootstrap and its own route requirements. Account-required reads and commands each wait for their matching readiness, rather than delaying public UI behind optional services.

1. Subscribe to credential changes and reconcile the current session through the canonical account binding. A persisted account UUID and provider subject are different domains: their raw inequality is not evidence of an account switch.
2. On account change, close outgoing protected admission, cancel/generation-invalidate applicable observers and pause original-account command replay. Await existing accountTransition preservation/quarantine and single-active runtime release. A failed release leaves an explicit blocked transition; never attach a second account database.
3. Publish the minimally verified target account identity as a candidate for database selection, with protected database consumers still gated. Serialize attachment of the matching account database. Candidate publication is not a claim that policy, database or all queries are ready.
4. Read required local scope/policy material only through that matching runtime. Validate the selected scope and signed authorization snapshot, then admit each feature's actual resource requirements. Remote refresh remains a separate lifecycle; an allowed bounded offline snapshot does not require pretending the network is healthy.
5. For a workspace/bond/lens change within the same account, invalidate scoped policy/read admission and commit the validated scope with generation checks; retain account database and account-level resources. Failure restores a valid previous scope or explicit unavailable result.
6. Preservation retains outgoing data and pauses work. Explicit discard is a distinct authorized path. Target attachment/refresh failure does not trigger data clearing, silently retag commands, or restore an old-account async result into the target.

Current-to-target gap: accountTransition currently awaits disconnect before pausing outgoing queued work. H2 must close admission in both SyncManager and mobile backgroundSync before teardown, then verify in-flight dispatch and receipt disposition. Pausing a persisted row does not cancel an already claimed handler; ambiguous results require reconciliation, not automatic replay; retaining the coordinator does not mean its current order already satisfies this target.

This defines a staged protocol across React, SQLite and network rather than claiming one atomic global commit. The retained coordinator/runtime implementations enforce the ordering; avoid a new orchestration framework.

## Offline work is a horizontal capability, not an attendance feature

Offline readiness is per operation and material: identity/policy, required read data, draft/command, bytes and eventual settlement. Connectivity hints, server reachability, credential validity, database readiness, sync backlog and download availability are separate observations. A single isOnline flag cannot represent them.

| Material / app-wide concern | Current evidence and limitation | Target contract and failure behavior |
| --- | --- | --- |
| Device settings | Mixed stores/providers/KV keys; AsyncStorage adapter reports memory acceptance before asynchronous completion | One selected backend/record; restore offline; report write failure where durability is promised. No account reset of device settings. |
| Account and guest continuity | Existing account/guest lease and account-isolated database protocols | Restore permitted account/guest material without treating cached credentials/grants as fresh authority. Offline conversion cannot fabricate a confirmed account binding. |
| Restart-safe reads | useLocalFirstQuery persists records qualified by query key, active user and view date; withResilience supplies TTL fallback | Preserve useful offline cached reads during migration, with schema/expiry/privacy and resource-specific scope. Bond/entity scope is caller-provided in this hook: verify each caller key or an explicit reject/invalidation rule on scope change. A memory-only Query replacement would be a regression. Background storage refresh is not proof of reactive notification. |
| Local relational data and replication | Client schema contains many tables; publication migration lists four (bonds, school_memberships, classrooms, classroom_students), checked-in streams select three (excluding classrooms); upload map and LOCAL_ONLY_TABLES are further boundaries | Audit each table's local schema, write producer, publication/sync rules, upload handler and server policy as one seam. Repo configuration is not proof of hosted deployment. Local SQL presence alone promises neither download nor upload. |
| Forms, journal, thought records, profile and workspace edits | Mixture of component edits, explicit journal producers and specialized provisional/layout commands | Specify autosave versus submit per feature. Preserve unsent inputs, scoped draft retention and original-account commands through restart; never label component memory as saved. |
| Explicit outbox | Account-bound serialized commands, retry/lease/pause/DLQ; replay handlers vary by family | Append acknowledged command once, retain until receipt/rejection/conflict, inspect ambiguous responses before replay. Server authorization rechecks on replay. Queue-capacity/disk failure must retain recoverable input and show actionable failure. |
| Attendance | Current V2 remote reads/write, offline error enqueue via batchRecordAttendance; PowerSync attendance table is local-only in inspected schema | Current online failure can return optimistic rows while its enqueue callback is empty. Close that false-success gap before claiming durable offline submit. Separate V1 receipt service exists; do not describe it as the wired client contract. |
| Provisional workspace and layout | Principal-bound idempotent receipt workflow; layout revision/conflict semantics | Preserve specialized protocol, interrupted-dispatch recovery and unknown-outcome reconciliation. Pending local creation cannot grant membership. |
| Self Canvas preferences | Local snapshot retained, pending remote retry/debounce in module memory | Local-only completion and server sync are distinct. Required cross-device continuity uses durable intent; process death cannot silently discard a promised remote save. |
| Authorization / entitlements | Signed bounded Cedar snapshots; entitlement continuity requires full actual scope checks | Invalid/expired snapshot denies protected operation; keep draft/journal data recoverable. Replay only with live server authorization; never extend TTL because offline. |
| Media downloads / reader assets | Inspected downloader uses cache paths and LRU eviction; resource naming alone does not establish private account isolation | Treat cached files as evictable. Guaranteed saved-offline content needs explicit retention, metadata, byte availability, quota and private/public classification. Never promise downloaded content after eviction. |
| File upload / wallpaper | Signed online upload intent, byte upload and server registration; inspected path surfaces ambiguous registration | Voice journaling also retains recording bytes in documentDirectory, but inspected submission has no proved restart-safe upload queue. If offline capture is required, retain scoped bytes+metadata and restart-safe registration intent before promising it; expired intents reacquired, unknown registration reconciled. |
| Security / external links | Some security commands registered; intent TTL/admission distinct from execution | Verify every command's actual caller/endpoint/idempotency. Token exchange, credential recovery and authoritative revoke confirmation may require online access; show pending/unavailable truthfully. No secret-bearing URL persistence. |
| Optional work and pressure | Existing governor and branch Verger can defer network/cleanup work | Resource policy can pace retryable transport; cannot discard journals, block local durable acceptance, or turn deferred into confirmed. Recovery drains under the same original-principal checks. |

No claim of complete feature wiring is made by this matrix. The exhaustive holder/caller inventory is document 1; a per-operation offline contract is a required deliverable for every real producer/read family found there. Registry entries without callers, schema declarations without transports, and commented intent are recorded as unproved, not counted as supported features.

Required interruption scenarios across the matrix: cold start in airplane mode; kill after draft save, append, dispatch and ambiguous response; credential expiry; account switch during dispatch; same-account scope change; failed database close; low/disk-full storage; cache/file eviction; expired policy; rejected/conflicting command; reconnect with duplicate delivery; guest conversion. Outcomes must identify what remains available, pending, denied or needs recovery. Attendance supplies one scenario, not the acceptance suite.

## Verger and unmerged upstream work

Remote origin is NeevSK/EdLove. Read-only ref review follows fetch on 2026-10-26; no checkout, merge, reset or application edits. Baseline HEAD: e0c32b3fbdd5e3212aa2c6f8f484cd0e3f2f050c on terrain/version-hops; working tree contains substantial unrelated changes. Branch source is compared against HEAD, not presumed integrated into those dirty files.

| Ref / source | Observed role | Architectural consequence |
| --- | --- | --- |
| Current Verger packages and mobile GurudeviVerger helper | Core runtime/recovery and React adapter exist; helper definition is not mounted by current EntryShell | Dependency presence and an adapter file are not evidence of active runtime policy. Current mobile host declares only built-in levers; no mounted mobile Verger consumer is established. |
| origin/feat/adaptive-runtime at 33600d997340cdbd1f3c3dec8d6239c8664a3e28 | Branch mounts GurudeviVerger around EntryShell's provider tree after essential startup; newer provider-less/native adapter structure, pressure/headroom, recovery and optional admission work | Use its explicit resource/workload model as design input. Do not rebuild against the older provider shape or merge its wider changes implicitly. |
| origin/claude/project-thread-x3d8lb at f24742058352 | Contains adaptive-runtime, worlds and later attendance/scene work; 101 commits on each side of divergence from HEAD, merge base 74c83f72bb8c | Review its self-contained replay payloads and guest-conversion preservation as design input; integration requires a separate conflict/capability review. |
| origin/feat/worlds-foundation at 8ab2fbd45def; origin/fix/attendance-offline-demo at 2d1f3df36c4d | Both tips are ancestors of HEAD | Already in ancestry, not new patches to import; ancestry alone does not prove current behavior after later edits. |
| origin/fix/attendance-grade-class-client at cd897ddec9f8; origin/docs/atlas-v5 at e64a96b3b77c | One-commit sibling divergences around 50fb1b9e77e3 | Inspect individual delta before reuse. Atlas attendance audit explicitly pins historical static inspection, not current runtime truth. |

The branch changes approximately 185 Verger-scoped files relative to HEAD and replaces older efficiency modules; scope depends on path filter. It is a separate workstream, not a small ready-to-apply patch.

Additional branch lessons: Claude attendance replay carries self-contained gradeClassId/legacy classroomId, school/date/student payloads; legacy resolution rejects missing or ambiguous targets instead of guessing. Its later d4be88b11/0829c6d3f replay changes are not established as current checkout behavior. Guest conversion retains original guest scope/data through upload and clears only on successful conversion. Preserve those recovery requirements independently of routing and resource policy. The atlas attendance-domain audit supplies an identity/transport seam checklist, revalidated against current source rather than copied as current defects.

Integration constraints to carry into implementation:

- Keep one effective resource-policy owner. Existing efficiency governor/manual heap reclamation/query tuning need an explicit retain/port/retire disposition; branch mounting alone does not prove equivalent behavior. Do not let old and new loops actuate the same resource independently.
- Keep canonical network observations outside adaptive policy. The branch's OnlineStatus writes useStore.isOnline from a derived Verger network limit, while deviceSignals also subscribes to NetInfo. Resolve that feedback/duplicate-source seam; Verger consumes network facts or exposes a qualified estimate, not an authoritative connectivity overwrite.
- Keep essential/public/protected route readiness distinct from optional concurrency. Branch optional startup accepts null snapshot or positive concurrency and later checks AppState; unknown is permissive there. Reconcile this deliberately with existing startup phase/pressure-recovery gates before any replacement.
- Split local command persistence from transport workloads. The branch's attendance-save declaration leaves that distinction open. Local durable append is critical; upload may be paced with persistent retry/receipt ownership intact. Apply the same rule to every domain, including backup/export/delete and security operations where present.
- Global reduced-motion/refresh effects are runtime policy, not stored preferences. Built-ins do not imply every existing animation/CSS loop obeys them. Prove consumer coverage, cleanup and phone costs before claiming adaptive quality.

## Architecture review gate before implementation sequence

The horizontal ownership and interaction choices are now explicit. Implementation is admitted only in a bounded capability whose actual source-to-target contract has no unassigned persisted fields, writers, observers or failure states. The design does not authorize unspecified deletion or assert phone quality.

Remaining evidence gates: actual artifact/backend startup and persistence behavior; installed audio cleanup signatures; each remote command's receipt/idempotency and actual hosted replication configuration; consent policy changes if scope changes; per-device cold-start, memory/thermal and interaction measurements; exact upstream capability disposition. These are verification/product decisions within the architecture, not a reason to proliferate stores or reopen the whole ownership model.

Validate the foundation through representative complete flows: preference to native feedback on both supported backends; account/scope transition with pending writes; restart-offline reads plus draft/outbox recovery in multiple domains; media absence/eviction; route/task restore; Verger pressure while durable work is pending. Re-derive the plan from these contracts. Do not construct unused generalized infrastructure first.

## Source and evidence anchors

Offline source anchors: [checked-in streams](../../../../powersync/sync-config.yaml), [publication migration](../../supabase/migrations/20260812000000_powersync_publication.sql), [client SQL schema](../../../../packages/core/src/adapters/powersync/schema.ts), [persisted read hook](../../../../packages/core/src/hooks/useLocalFirstQuery.ts), [media downloader](../../../../packages/core/src/hooks/useMediaDownloader.ts), [draft holder](../../../../packages/core/src/store/useDraftsStore.ts). These are repository source, not hosted deployment attestations.

Current source anchors include core store/scopeSession.ts and scopeSessionCoordinator.ts, hooks/useAuthLifecycle.ts, logic/managers/StorageManager.ts, logic/interfaces/storage.port.ts, logic/ports/storage.ts, adapters/powersync/database.ts, lib/sync/eventBus.ts, app EntryShell and PowerSyncProvider. Exact holder/call links and current behavior are retained in document 1; no line number is treated as permanently stable.

Design guidance: [React state structure](https://react.dev/learn/choosing-the-state-structure), [scoped Zustand with Context](https://tkdodo.eu/blog/zustand-and-react-context), [Query native lifecycle](https://tanstack.com/query/v5/docs/react/react-native), [Expo route parameters](https://docs.expo.dev/router/reference/url-parameters/). These support the choices, not a claim of implemented runtime behavior. Version/channel evidence and known source/tool limitations remain in documents 2 and 5.

G0 architecture/source inspection only. No application code changed, native build executed or physical-phone behavior verified by this design artifact.

## Feature implementation update (2026-10-26)

Feature now has one context-bound SDK observable: useFeatureStore owns bindContext/clear, subscription disposal, evaluation projection and the mounted seven-day expiry timer. createFeatureSlice/FeatureSlice and the legacy shim are retired; no flags are persisted separately from the qualified snapshot. Account/guest generation and exact UserContext matching prevent unqualified offline adoption. The old global record is retained untouched. Synchronous consumers justify the observable; a Query mirror would duplicate it. One latest context cache per account is provisional, not complete multi-perspective offline coverage. Evaluation timestamps still need control-plane provenance and SDK poll lifecycle work. See the execution log's Feature cut for evidence and limitations; this does not change full-program acceptance status.

## Feature freshness contract update (2026-10-26)

refreshedAt now records a verified network payload receipt rather than evaluation time. The active subscription owns polling and NetworkManager observation; no constructor request or SDK background poll survives without that owner. Refresh failure retains the prior payload/time, context changes do not renew time, and v2 qualified snapshot records distinguish this contract from retained untrusted v1/global timestamps. See the execution log for 29 G1/G2 assertions with installed SDK/substituted HTTP and the unchanged open physical/full-gate limits. Cold-start offline restore still keeps only the latest qualified targeting context. PowerSync local-database availability remains incorrectly dependent on rollout state in current source and is the next integration cut; remote sync policy must be separated from local data ownership.

## Local SQL versus remote synchronization (2026-10-26)

Implemented separate ownership: account lifecycle opens/closes the exact local PowerSync database; rollout state, observed online connectivity and live read policy only admit remote sync. Disabled/missing rollout, offline/unknown state or cached-only mode retain the local handle/context and pending SQL work. The connector requires a live admission callback and connection observation requires an owner AbortSignal; the runtime queue aborts first-sync observation on account release and retains the close barrier. Retired unused PowerSyncGate and implicit factory .sync construction. This does not establish data/grant availability for a never-synced offline account or native configuration correctness. Installed native source confirms encryption key forwarding, but onConfigure is ignored; supported SQLite cache/lock options and physical encryption/configuration proof are the next floor work. Evidence and exact breaking upstream contracts are recorded in the execution log.
