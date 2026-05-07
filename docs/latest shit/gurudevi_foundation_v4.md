# Gurudevi Foundation Document v4
*Last updated: April 21, 2026*
*Merged from v2 and v3 — nothing lost, nothing compressed. Continue from here in any new chat.*

---

## Who is Neev

Neev is the visionary architect and sole builder of Gurudevi, based in Sri Lanka. Neev operates as a high-level architect and decision-maker who directs AI agents (primarily Gemini Flash for implementation, Claude for architectural reasoning) rather than writing code directly.

Neev thinks in systems, topology, and first principles. Communicates tersely and expects interlocutors to hold complexity. Pushes back when oversimplified. Values dignity, sovereignty, and building for the reality people actually live in — not the ideal reality someone with ministry money imagines.

How Neev works with Claude: Neev brings vision and Sri Lankan ground truth. Claude holds architectural structure, asks precise questions, synthesizes decisions, and tracks what's resolved and open. Claude leads the process. Neev leads the decisions. Neither replaces the other.

---

## What is Gurudevi

Gurudevi is a multi-tenant School ERP/LMS platform targeting the Sri Lankan school market. But that description undersells it.

The full vision is a **national educational operating system** — the infrastructure underneath Sri Lankan education itself. Not a school app. Not a smart classroom product. The operating system.

**Full scope of the skyscraper:**
- School ERP (admin, inventory, finance, HR)
- Classroom (attendance, grades, timetable)
- LMS (Moodle-like, then Coursera-like courses)
- Community (messaging, social feed)
- Library (holistic multi-type, digital national library vision)
- Wellbeing (longitudinal student wellbeing tracking)
- National education intelligence (MOE-level analytics, zone/province/national)
- Developer and infra tooling layer
- Regulatory and compliance layer
- Internal browser (sandboxed webkit, stays inside app, "open in default browser" always available)
- Gamification layer (quiet, Open Badges standard, student-owned recognition)
- OCR pipeline (image to PDF, handwriting digitization, local dataset creation as byproduct of real teacher work)
- Image to PDF tooling
- Any action a teacher or student can do on a phone — if it can be done on a phone, it belongs here

**Core philosophy:**
Built for the reality people actually live in. Not ideal conditions. A teacher in a rural school with a borrowed phone and patchy signal. Not one tablet per child. Topological — mirrors the actual reality of Sri Lankan school life, not a sanitized or idealized version of it.

**Quality bar:**
Business-critical software. The Stripe/Linear standard of quality, reliability, and developer experience. Not a school project. Not an MVP that embarrasses. Something that earns trust from the first interaction.

**Ontological foundation (from Neev's conversation with Gemini):**
The whole app and every action is about **impedance matching of object relations from individuals** — drawn from Kleinian object relations theory. We don't relate to reality directly — we relate through internalized relational templates. Every interaction between a user and Gurudevi is a negotiation between their inner relational world and the software's representation of that world. The system should feel like it *understands* their relational world, not like a database they submit data to.

The structure is **polycentric, autopoietic holarchy** — not a hierarchy with one center, but multiple centers of equal validity. Each holon (whole that is also a part) has its own integrity. A student is a whole person, also part of a classroom, also part of a school, also part of a province — each level has its own validity, none automatically dominates another.

This is not a feature — it is the underlying reality model that Gurudevi mirrors in software. Every module, every relationship, every permission reflects this. Needs its own dedicated architectural conversation before it can be fully expressed in the data model.

**Non-negotiable values baked into architecture:**
- No surveillance. Data does not flow upward through institutional hierarchy automatically. Ever.
- Children and teachers are people with dignity, not data points to be harvested.
- Device sharing is a first-class citizen — one phone, multiple family members.
- Offline capability is planned (V2), not an afterthought.
- Gamification is subtle — recognition not extraction, no addiction mechanics, no loud competition, no leaderboards.
- Every upward data flow requires an explicit grant from the sovereign layer it originates from.

---

## Current Technical Stack (as of April 2026)

| Concern | Decision |
|---|---|
| Frontend | Expo React Native + Metro Web |
| Monorepo | pnpm + Turborepo |
| Navigation | React Navigation 7 (not Expo Router) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (live cross-module events) |
| RLS | Supabase Row Level Security |
| Server-side permissions | ZenStack v3 (Kysely-based, schema-embedded policies) |
| Client-side permissions | CASL (offline-capable) |
| Permission model | POA (Policy-Oriented Authorization) |
| Schema validation | Zod (single source of truth) |
| Transport contracts | ts-rest |
| Background jobs | Inngest (free tier — 50k executions/month, swappable to Trigger.dev) |
| Geographic hierarchy | lk-edu-geo (custom npm package, HDX COD-AB dataset) |
| Tooling discipline | pnpm-only commands — never npx, never mixing |
| Vector storage | pgvector (already in schema via `nodes.embedding`) |
| Graph storage | Custom nodes/edges tables (scoped to library domain) |
| Images & documents | ImageKit (free 20GB/mo, $9/mo Lite — no suspension risk) |
| Video content | Gumlet (when library/courses modules need it) |
| Private/internal files | Supabase Storage |
| Audit | Separate `audit` schema with `audit.logs` |
| Gamification standard | Open Badges (IMS Global) |

**Monorepo package structure:** ~20 packages under `@repo/` prefix. One unified app experience to the user. Split-ready but not split yet. `@repo/classroom`, `@repo/feature-engine`, `@repo/ui` etc.

**Key agent discipline:** pnpm-only commands in monorepo. No npx. No yarn. Mixing causes environment corruption. This must be stated explicitly in every agent prompt.

---

## The 31 Hats — Full Foundation Map

These are every domain that must be accounted for before and during building. Each hat = a dedicated architectural conversation. Named so nothing can appear later as a surprise.

### Vision & Intent
| # | Hat | Status | Description |
|---|---|---|---|
| 01 | Visionary | Defined above | Full scope of the skyscraper named |
| 02 | Product strategist | Open | Which floors get built first? What must exist at launch vs planned capacity? |

### Architecture & Engineering
| # | Hat | Status | Description |
|---|---|---|---|
| 03 | Solutions architect | **CLOSED** | Irreversible structural decisions |
| 04 | Data architect | **CLOSED** | Schema, storage, retention, time-series |
| 05 | Security architect | Open | Threat modeling, encryption, attack surface, child data protection |
| 06 | Platform engineer | Open | CI/CD, environments, secrets management, build reproducibility |
| 07 | Frontend architect | Open | Component system, design tokens, navigation, accessibility |
| 08 | API & contracts architect | Partially touched in Hat 03 | Transport layer, versioning, internal vs external contracts |

### Feature Delivery & Operations
| # | Hat | Status | Description |
|---|---|---|---|
| 09 | Feature delivery engineer | Named — **next priority** | Feature flags, feature engines, per-tenant toggles, gradual rollout, kill switches |
| 10 | Observability engineer | Open | Logging, distributed tracing, error tracking, alerting, dashboards |
| 11 | Release manager | Open | Release cadence, versioning, rollback, zero-downtime deployment |
| 12 | SRE | Open | Uptime SLAs, incident response, post-mortems, repair runbooks |

### Identity, Access & Users
| # | Hat | Status | Description |
|---|---|---|---|
| 13 | Identity architect | Partially touched in Hat 03 | All user types, SSO, session management, identity federation |
| 14 | Permissions architect | Partially touched — grants pattern named, needs full session | CASL + ZenStack + RLS + Realtime interaction, sovereignty grants |
| 15 | UX architect | Open | Information architecture across modules, navigation for different roles |

### Infrastructure & Cost
| # | Hat | Status | Description |
|---|---|---|---|
| 16 | Infrastructure architect | Open | Hosting topology, CDN, edge vs origin, Sri Lanka latency, scaling model |
| 17 | Quantity surveyor (QS) | Open | Infrastructure cost modeling, per-tenant unit economics, burn rate vs revenue |
| 18 | Storage architect | Closed within Hat 04 | ImageKit + Gumlet + Supabase Storage decided |
| 19 | Network & connectivity engineer | Partially touched in Hat 03 | Offline-first architecture, sync, conflict resolution, low-bandwidth degradation |

### Regulatory, Compliance & Institutional
| # | Hat | Status | Description |
|---|---|---|---|
| 20 | Regulatory & compliance officer | Open | Sri Lanka PDPA, child data obligations, MOE policy, audit trails |
| 21 | Institutional architect | Partially touched in Hat 03 | Mapping Sri Lankan education structure into data model |
| 22 | Localization & language architect | Open | i18n/l10n for Sinhala, Tamil, English — RTL, font support, search across scripts |

### Developer Experience & Maintainability
| # | Hat | Status | Description |
|---|---|---|---|
| 23 | Developer experience (DX) engineer | Open | Local dev setup, onboarding, code generation, agent prompt discipline, test infrastructure |
| 24 | Technical documentation lead | Open | ADRs, API docs, schema docs, runbooks — what must be written so the system outlives its builder |
| 25 | QA & testing architect | Open | Test strategy — unit, integration, E2E, multi-tenant isolation, permission boundary tests |

### Commercial & Sustainability
| # | Hat | Status | Description |
|---|---|---|---|
| 26 | Business model designer | Open | Monetization — per-school SaaS, freemium, MOE licensing, tiered modules |
| 27 | Tenant onboarding designer | Open | School provisioning, configuration, data seeding, trial-to-paid, offboarding |
| 28 | Support & feedback systems designer | Open | In-app support, bug reporting, feedback loops, school admin self-service |

### Future-proofing & Extensibility
| # | Hat | Status | Description |
|---|---|---|---|
| 29 | Integration architect | Open | MOE systems, payment gateways, SMS, external library catalogs, government ID, GDELT |
| 30 | AI & intelligence layer architect | Open | Where AI lives — personalized learning, wellbeing signals, library recommendations, model serving |
| 31 | Extensibility architect | Open | Plugin/module system, how new floors get added without shaking the foundation |

---

## Hat 03 — Solutions Architect — CLOSED

*Irreversible structural decisions. Locked April 20–21, 2026.*

### Decision 1 — Multi-tenancy model
**Locked:** Shared database, strict RLS, relationship-based cross-tenant exceptions.

Schools are isolated from each other by default. Certain entities — parents, students — can have permissioned visibility across school boundaries when a real-world relationship justifies it (e.g. child transfers school, parent has children in different schools).

The hardest edge case Neev identified himself: a parent whose child moves schools, or has children in *different* schools. That parent needs to see across tenant boundaries in a very specific, limited, permissioned way. This is a known, handled exception — not a problem.

Implemented via: Supabase RLS + `student_record_access_grants` table for explicit cross-tenant exceptions. `get_my_active_school_id()` handles contextual school switching within a single session. RLS policies check complex chains (e.g. `(student_id = auth.uid()) OR (EXISTS as guardian) OR (EXISTS as active school staff)`) not just a `school_id`.

### Decision 2 — Application architecture
**Locked:** Single unified app experience to the user. Modular packages underneath (`@repo/` prefix). Monorepo via pnpm + Turborepo. Split-ready but not split yet.

A teacher opens one thing. Everything lives inside it. Modules can be lifted out into separate apps later if needed without a full rewrite. The monorepo arrived at ~20 packages through lived experience — started as one app, went to ~5, now ~20. This is maturity, not spiral.

### Decision 3 — Offline strategy
**Locked:** V1 is fully online. Offline-first is a planned architectural upgrade for V2.

Critical constraint: The architecture must not make offline *impossible* to add later. Three existing design choices already keep the door open:
- UUID primary keys everywhere — devices can generate IDs without a server round-trip
- `idempotency_key` on high-volume tables (attendance, grades) — safe retry and sync from flaky village networks
- Dual timestamps (`occurred_at` vs `recorded_at`) on key tables — reconstructs correct event sequence even if uploaded hours after they happened

### Decision 4 — Identity and roles
**Locked:** One person, one identity, multiple roles via POA/CASL. Device sharing is a first-class citizen.

A teacher who is also a parent does not create two accounts — they switch context within one identity. `users.platform_roles` (array) and `school_memberships` (relationship table) allow a single identity to accumulate roles over time rather than being hardcoded as one type.

`device_registry` and `device_accounts` tables support the shared device scenario — multiple family members using one phone, fast context switching without full logout/login every time. This is a real Sri Lankan reality that CodeGen's one-tablet-per-child model completely ignores.

### Decision 5 — Cross-module communication
**Locked:** Event-driven architecture. Modules do not call each other directly. They emit events and listen to events. Loosely coupled by design.

Why: A classroom module firing "attendance taken" and a wellbeing module silently listening and flagging a pattern is fundamentally different from a direct API call chain. In event-driven — if the wellbeing module is down, attendance still works. Nothing blocks nothing. Modules can be deployed separately later. Each minds its own business.

Implementation:
- Supabase Realtime — live cross-module events (instant, e.g. attendance → parent notification)
- Inngest — background async jobs (reliable, retryable, e.g. weekly reports, batch SMS, wellbeing pattern analysis)

### Decision 6 — Background job tooling
**Locked:** Inngest for V1.

- Free tier: 50,000 executions/month, 1-5M events/day — more than enough for beta
- No infrastructure to manage
- Paid from $75/month when scale requires
- Swappable to Trigger.dev (open-source, Apache 2.0, self-hostable, unlimited runs) if cost becomes a problem at scale
- Both solve the same problem with similar patterns — swap is genuinely viable

### Decision 7 — Academic time as first-class entity
**Locked:** Academic time (year, term, week, period) is a first-class entity. Events hang off academic cycles, not just timestamps. `public.academic_cycles` exists and defines years and terms.

**Three precise gaps flagged for implementation agent (not yet fixed):**

| Gap | Description |
|---|---|
| Dual timestamps missing | `mood_logs` and `attendance` need `occurred_at` added alongside `created_at` |
| Cycle FK not enforced | Attendance and grades hang off dates instead of `academic_cycle_id` — makes term-based queries expensive |
| Wellbeing ↔ academic blind | `mood_logs` don't know which term they belong to — wellbeing narrative not joined to academic narrative |

Student lifecycle time is the strongest part of the temporal model. `student_longitudinal_events` is a first-class 13-year story — carries `student_id`, `grade_id`, `school_id`, dual timestamps, and is designed to survive school transfers and grade progressions.

Full temporal model Gurudevi must carry:
1. Academic time — year, term, week, period
2. Student lifecycle time — enrollment, grade progressions, school transfers, 13-year journey
3. Wellbeing time — longitudinal patterns across weeks, months, years
4. Institutional time — staff changes, policy changes, school's own history
5. Event time vs record time — when something happened vs when it was recorded (critical for low-connectivity environments)

### Decision 8 — Geographic hierarchy and the no-surveillance principle
**Locked:** lk-edu-geo provides the structural hierarchy (school → zone → province → national). Visibility up that hierarchy requires explicit permission grants — never automatic structural inheritance.

**This is a values decision, not just a technical one:**
A zonal director cannot see a student's wellbeing data just because they sit structurally above that school. Data flows upward *only* when explicitly shared by the authorized agent — teacher, student, or institution — through a deliberate permissioned act.

The geographic hierarchy answers *where does this school belong* — not *who has the right to see this child's data.* These are two completely separate concerns.

`student_record_access_grants` is not just a cross-tenant exception handler. It is the philosophy of the entire platform expressed as a schema pattern. Every upward data flow goes through a grant. Nothing leaks by default.

**No surveillance. Ever. By anyone. Through any interface.**

*Must be written as an Architecture Decision Record that every future developer reads before touching the permissions layer.*

### Decision 9 — Migration discipline
**Locked:** Every schema change is a written migration file, staged against a staging environment that mirrors production, validated, rollback-documented, before touching production data.

ZenStack v3 (generates migrations from ZModel) and Supabase CLI must work in coordination — not independently. Mixing them without discipline causes conflicts.

Pattern to follow: **expand and contract** — add new column alongside old, migrate data gradually, remove old column only after. Never a single destructive change against a live multi-tenant database.

No exceptions once real data from real schools exists.

### Decision 10 — External API boundary and agentic readiness
**Locked:** Gurudevi exposes capabilities, not implementation. Every external interface is versioned, permission-wrapped, and stable. Internal refactoring must never break external contracts.

**Four external interface types:**

| Interface | Purpose | Notes |
|---|---|---|
| Versioned REST API (ts-rest) | External systems, MOE integrations, third-party apps | Versioned, stable contracts |
| MCP server — internal tier | Gurudevi's own AI layer, developer agents | Full capability within permission system |
| MCP server — external tier | Third-party agents (e.g. Manus, teacher agents, parent AI tools) | Strictly scoped to invoking user's permission envelope — agent inherits user's permissions, never a superset |
| Webhooks receiving | External feeds into Gurudevi (library news, GDELT, government content, news APIs) | Fed into Inngest event bus |
| Webhooks emitting | Gurudevi pushes events to subscribers (MOE term results, third-party parent apps) | Part of versioned public API, guaranteed delivery with retries |

The MCP server is foundational infrastructure for the agentic world — not a future nice-to-have. Everything external touches the same permission layer as internal. No backdoors. No surveillance through the API either.

### Decision 11 — Internal browser
**Locked:** Sandboxed WebView — display surface only. Hard isolation boundary. External content cannot touch Gurudevi's internal APIs, auth tokens, or local data. No JavaScript bridge to app internals. External websites cannot tell they're running inside Gurudevi.

"Open in default browser" option always available — respects user choice, standard pattern.

For anything involving external authentication with third-party services — hand off to platform browser (SFSafariViewController on iOS, Chrome Custom Tabs on Android). OS manages isolation completely, no token exposure risk.

Three implementation options evaluated:
1. Sandboxed WebView (chosen for general browsing) — safe by default, no bridge, industry standard
2. WebView with JS bridge — powerful but every bridge function is a potential attack surface, not used by default
3. Platform browser handoff (chosen for auth flows) — maximum security, OS managed

### Decision 12 — Grants pattern as platform-wide sovereignty mechanism
**Locked:** Every upward data flow requires explicit grant from the sovereign layer it originates from. This is platform-wide, not just one table.

`student_record_access_grants` is the pattern — each sovereign domain manages its own grants table:
- `library_resource_access_grants`
- `wellbeing_data_access_grants`
- Additional per domain as modules are built

One unified philosophy, domain-specific implementations. No single monolithic grants table for everything.

---

## Hat 04 — Data Architect — CLOSED

*Agent audit via Supabase MCP, April 20, 2026. ~80% accuracy — treat as strong signal, not ground truth.*

### Original Audit Results (for reference)

| Area | Status | Key Finding |
|---|---|---|
| Domain separation | Partial | Logical prefix-based separation in `public`. `audit` schema isolated. ERP/Library/Wellbeing co-located in `public`. |
| Storage types | Handled | Postgres relational + pgvector (`nodes.embedding`) + graph (`nodes`/`edges`) + blob (Supabase Storage) + JSONB |
| RLS completeness | Handled | 98% of tables have RLS enabled. Gap: `audit.student_record_access_logs` has RLS disabled. |
| Backup & retention | Partial | Supabase infrastructure backups assumed. App-level: soft deletes, audit schema, 14-day anonymous user TTL. No formal `pg_cron` log rotation. |
| Indexing | Handled | Excellent — FK indexes, temporal DESC indexes, trigram search (`idx_edu_schools_name_trgm`), GIST spatial indexes. |
| Soft deletes | Handled | `deleted_at` pattern consistent across all core tables. |
| Naming conventions | Handled | `snake_case` throughout, `is_` boolean prefix, UUID primary keys. Industry standard. |

### Decision 1 — Schema domain separation
**Locked:** Middle path. Keep `public` for genuinely guest-accessible data (school profiles, public library content, public announcements). Create separate domain schemas for sensitive modules: `classroom`, `wellbeing`, `community`, `erp`.

Why the middle path: `public` is used intentionally for guest/anonymous users — Postgres gives guest users access to `public` by default. Moving everything to separate schemas would require explicit `GRANT USAGE` per role, which is more controlled but adds complexity. The middle path gets the best of both — guest users stay in `public`, sensitive data gets real schema walls.

Not urgent to migrate all at once — plan now, migrate before each sensitive module goes to production.

### Decision 2 — RLS on audit tables
**Locked:** Enable RLS on `audit.student_record_access_logs`. Policies follow the sovereignty principle:
- Student sees logs where `subject_id = auth.uid()`
- School admin sees logs scoped to their school only
- Zone/national — no access unless explicitly granted

The audit log protects the person, not the institution. A student should be able to see who accessed their own record. A zonal director should not see logs from schools without an explicit grant.

### Decision 3 — Data retention and lifecycle
**Locked:** Formal retention policy required. `pg_cron` for automated lifecycle management.

| Data type | Retention policy |
|---|---|
| Guest/anonymous users | 1 month maximum, then purged |
| Audit logs | 3 years minimum (legal/compliance for school data) |
| Mood logs | Student's full school life, then anonymized or deleted per student/guardian choice |
| Deleted school data | 90 day grace period then purged (allows recovery if school re-subscribes) |
| Student data generally | Student or guardian controls lifecycle where legally possible |

Sovereignty principle extends to data lifecycle — the person controls their data, not the institution.

### Decision 4 — Storage strategy
**Locked:** Postgres stores metadata and URLs only. Never files. Provider is always swappable because the database never couples to a specific provider — only to a URL pattern.

| Content type | Provider | Cost | Why |
|---|---|---|---|
| Images, documents, library assets | ImageKit | Free (20GB/mo bandwidth), $9/mo Lite | No account suspension on quota breach (unlike Cloudinary), generous free tier, AVIF support, clean API |
| Video content (library, courses) | Gumlet | When video modules needed | Purpose-built for learning platforms, adaptive streaming, DRM, engagement analytics |
| Private/internal files | Supabase Storage | Included in Supabase plan | Never needs CDN delivery |

**Why not Cloudinary:** Fixed-tier plans trigger account suspension (not overage billing) when quota is exceeded — accounts suspended for exceeding by as little as 0.01%. Assets become inaccessible until resolved. Unacceptable for a school platform mid-term.

**Swappable escape hatch:** ImageKit → any S3-compatible storage. Gumlet → Cloudflare Stream or Bunny CDN for video. Architecture never assumes the provider.

### Decision 5 — Time-series data
**Locked:** Mood logs and attendance designed with time-series query patterns in mind from the start. Standard Postgres with proper temporal indexing for V1:
- `occurred_at` as primary temporal column (not `created_at`)
- DESC indexes on temporal columns
- `academic_cycle_id` as FK on all time-series tables

Grades stay relational — milestone records not streams. A student gets a grade at end of term, low frequency, queried as records not trends.

**Upgrade path:** TimescaleDB is a Postgres extension (same database, same connection, Supabase supports it) — activates time-series optimizations without a database migration. Use when volume genuinely demands it, not before.

### Decision 6 — Graph nodes and edges
**Locked:** Graph nodes/edges explicitly scoped to library domain only — mind maps, concept relationships, knowledge graphs within library. Not a general-purpose platform-wide graph table.

Future modules requiring graph structure get their own deliberate implementation with their own tables — they don't share the library graph.

**Upgrade path:** FalkorDB (previously evaluated for other Neev projects) as the dedicated graph database if the library graph grows beyond what Postgres nodes/edges can handle.

**Why this matters:** A general-purpose graph in `public` that any module can write to is an architectural liability — it accumulates unexpected data and creates invisible dependencies between modules. Scope enforces discipline.

### Decision 7 — Gamification architecture
**Locked:** Quiet internal recognition engine. Notices genuine patterns and growth moments — not just raw activity volume. Issues Open Badges (IMS Global standard) as portable, student-owned shareable artifacts.

**What it is not:**
- Not leaderboards
- Not punishing streaks (missing a day loses progress)
- Not points races
- Not extraction mechanics
- Not addiction design
- Not loud or competitive

**What it is:**
- Calm technology applied to motivation
- The system notices good things and reflects them back gently
- A student reads consistently — the system notices, acknowledges quietly, surfaces a pattern to the teacher
- Recognition that illuminates rather than manipulates
- Connects to sovereignty — the recognition belongs to the student, not the platform

**Open Badges:** Student owns the badge permanently even if Gurudevi disappears. Gurudevi issues it but does not control it. Badges carry verifiable metadata — who issued it, what was achieved, when, what evidence supports it. Shareable with friends, parents, future institutions, employers.

---

## Current Schema Health Summary

| Area | Status | Notes |
|---|---|---|
| Multi-tenancy / RLS | Handled | Complex RLS chains, `student_record_access_grants`, context switching via `get_my_active_school_id()` |
| Modular monorepo | Handled | `@repo/` packages, clean domain separation, split-ready |
| Offline readiness | Handled/Ready | UUIDs everywhere, idempotency keys, dual timestamps on key tables |
| Identity / roles / devices | Handled | `platform_roles` array, `school_memberships`, `device_registry`, `device_accounts` |
| Student lifecycle time | Handled | `student_longitudinal_events` — robust first-class 13-year story |
| Academic time | Partial | `academic_cycles` exists, 3 gaps flagged for agent (see agent tasks) |
| Wellbeing time | Partial | Data captured, not yet joined to academic narrative |
| Institutional time | Partial | `principal_governance_events` exists, `user_profile_versions` for staff history, but no school-level policy versioning |
| Event vs record time | Partial | Dual timestamps on high-stakes tables only — missing on `mood_logs` and `attendance` |
| Domain separation | Partial | Middle path decided — prefix-based now, domain schemas migration planned per module |
| Storage strategy | Handled | ImageKit + Gumlet + Supabase Storage — metadata in Postgres, files as URLs |
| RLS completeness | Handled | 98% coverage — one gap: `audit.student_record_access_logs` |
| Indexing | Handled | Excellent — FK, temporal DESC, trigram (`idx_edu_schools_name_trgm`), GIST spatial |
| Soft deletes | Handled | Consistent `deleted_at` pattern across all core tables |
| Naming conventions | Handled | `snake_case`, `is_` boolean prefix, UUID PKs — fully consistent |

---

## Agent Tasks Queued — Implementation Priority Order

*For implementation agent — these are schema/config gaps to fix before building on top of them.*

1. Add `occurred_at` dual timestamp to `mood_logs` and `attendance` tables
2. Add `academic_cycle_id` FK to attendance and grades tables — enforce cycle awareness
3. Enable RLS on `audit.student_record_access_logs` with sovereignty-aligned policies (student sees own, school admin sees school-scoped, zone/national denied by default)
4. Join wellbeing narrative to academic narrative — `mood_logs` need cycle awareness so wellbeing trends can be queried by term
5. Set up `pg_cron` for data lifecycle management — guest user purge (1 month), audit log rotation (3 year retention)
6. Scope graph nodes/edges explicitly to library domain — add schema comments and enforce in ZenStack model

---

## Development Injection — What's Cleared to Build Now

*Based on Hat 03 and Hat 04 decisions — safe to implement without risking architectural rework.*

**Green — build now:**
- Any feature that uses existing RLS + CASL + ZenStack permission model
- Any feature that emits events to the event bus rather than calling modules directly
- Any feature that stores files as URLs (ImageKit or Supabase Storage)
- Any feature that uses `student_longitudinal_events` for longitudinal history
- Internal browser (sandboxed WebView) implementation
- Open Badges integration scaffolding

**Yellow — build but fix agent task first:**
- Anything touching academic time — fix agent task #2 first (`academic_cycle_id` FK)
- Wellbeing features — fix agent task #1 first (dual timestamps on `mood_logs`)
- Audit features — fix agent task #3 first (RLS on audit table)

**Red — do not build yet, architectural decision pending:**
- Feature flag gating — Hat 09 not yet decided, building without it risks rework
- Multi-schema domain separation — plan per module first
- MCP server — architecture decided but implementation needs dedicated session
- Any upward data aggregation — explicit grants mechanism must be in place first

---

## Seeds Named — Pending Their Own Hat Conversations

*These came up and must not be lost. Each needs a dedicated hat discussion.*

| Seed | Context | Relevant Hat |
|---|---|---|
| Feature flags / feature engine | Foundational — per-tenant toggles, gradual rollout, kill switches, subscription tier gating. Cannot build around this forever. | Hat 09 — **immediate next priority** |
| Polycentric autopoietic holarchy | Kleinian object relations as ontological foundation — needs dedicated philosophical-architectural conversation to express fully in data model and permission system | Dedicated session |
| Minimum viable relation | From Gemini conversation — what is the irreducible relational unit in Gurudevi? Connected to holarchy session. | Holarchy session |
| OCR pipeline | Image to PDF, handwriting digitization. OCR as local dataset creation — teachers digitize real student work, high-quality training data as byproduct of real pedagogical work | Hat 29 (Integration), Hat 30 (AI layer) |
| VPN | Future consideration for secure school network access | Hat 05 (Security), Hat 16 (Infra) |
| Business-critical quality bar | Stripe/Linear standard of quality and reliability — what does this mean concretely for Gurudevi's codebase and release process? | Hat 23 (DX), Hat 25 (QA) |
| Development injection session | Standalone conversation — give the implementation agent a complete picture of what's cleared, what's blocked, and what the guardrails are | **Immediate priority — before next development sprint** |
| Gamification engine implementation | Open Badges decided as standard. How does the quiet recognition engine actually work? What signals does it track? | Hat 30 (AI layer), Hat 31 (Extensibility) |
| Internal browser auth flows | Sandboxed WebView for general browsing decided. Platform browser handoff for auth decided. Need implementation details for both. | Hat 07 (Frontend) |

---

## Competitive Context

**Cloud Smart School by CodeGen International** — Sri Lankan competitor. Hardware-bundled product: XOLO smart boards + tablet computers physically installed in classrooms. Government-partnered (MOE, Deputy Minister Dr. Harsha de Silva). Deployed in ~150 schools as of 2026. Requires physical installation, tablets per child, capital-heavy rollout, teacher training.

**Why this is not a threat to Gurudevi:**

This is not the same market. Not the same philosophy. Not even the same topology.

CodeGen needs infrastructure that doesn't exist in most Sri Lankan schools — physical devices, installation teams, reliable electricity, institutional capital. Their model is hardware-bundled at ~Rs. X per classroom. Gurudevi works on a borrowed phone with patchy signal.

10,000+ schools in Sri Lanka. CodeGen's 150 is a capital-heavy deployment that requires everything to be in place. Gurudevi's target is the school where none of that exists.

The moment Neev felt threatened was real and worth sitting with — but the feeling came from comparison, not from genuine market overlap. Different reality. Different philosophy. Different people.

---

## Where We Are

**Closed:**
- Hat 03 — Solutions Architect — 12 decisions locked
- Hat 04 — Data Architect — 7 decisions locked, original audit preserved

**Partially touched:**
- Hat 08 — API & contracts (within Hat 03)
- Hat 13 — Identity architect (within Hat 03)
- Hat 14 — Permissions architect (grants pattern named, needs full session)
- Hat 18 — Storage architect (closed within Hat 04)
- Hat 19 — Network & connectivity (offline strategy within Hat 03)
- Hat 21 — Institutional architect (lk-edu-geo and hierarchy within Hat 03)

**Open:** Hats 02, 05, 06, 07, 09–12, 15–17, 20, 22–31

**Recommended next session order:**
1. Hat 09 — Feature delivery engineer (feature flags, engines, rollout — blocking development)
2. Hat 05 — Security architect
3. Hat 14 — Permissions architect (full grants system formalization)
4. Holarchy dedicated conversation (schedule separately — philosophical-architectural)
5. Development injection session (schedule separately — agent needs this now)

---

## How to Continue

Paste this document into a new conversation with Claude.

Say: *"This is the Gurudevi foundation document v4. Continue from where we left off. Next is Hat 09 — feature delivery engineer and feature flags."*

Everything is here. Nothing is lost. Nothing compressed. 🤍
