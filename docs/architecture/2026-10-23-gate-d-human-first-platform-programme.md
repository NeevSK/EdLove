---
title: "Gate D — Human-First Sanctuary Platform Programme"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [gate-d, platform, architecture, capability-ledger, human-first-erp, hostile-review]
supersedes: "docs/architecture/2026-10-23-api-v0-v1-gate-d-domain-capability-constitution.md"
---

# Gate D — Human-First Sanctuary Platform Programme

## Status correction

This programme supersedes the **scope** of the earlier API-only Gate D draft;
that draft remains preserved as a historical `draft`, not deleted. API
canonicalization is now one cross-cutting consequence of platform truth—not the
top-level organising principle.

The source-grounded companion is the
[Platform Capability and Implementation Ledger](platform-capability-and-implementation-ledger.md).
This programme turns its findings into an ordered, reviewable sequence. No gate
authorizes deleting a route, registry, legacy API, fallback, test, or data path.

## Governing outcome

Make Gurudevi intelligible and evolvable as a human-first educational Sanctuary:

```text
personhood and consent
  → relationships and institutional contexts
    → calm product places and real work
      → deterministic records and recoverable operations
        → optional channels, analytics and bounded assistance
```

“Human-first ERP” means that administration supports living educational
relationships. It does not mean treating reflection as institutional telemetry,
or treating a person as an employee/student record that happens to have a nice
interface.

## Programme map

| Gate | Outcome | Implementation status | Explicit non-goal |
| --- | --- | --- | --- |
| **D0 — Capability truth** | Machine-verifiable inventory joining UI route, package/export, contract, authority/persistence evidence and maturity | **Complete — bounded inventory boundary; see 2026-10-24 closure decision** | Replacing registries, deleting dead-looking code, or declaring functionality deployed |
| **D1 — Human and institution model** | Canonical person/account/bond/membership/delegation/organization vocabulary and lifecycle | blocked on D0 evidence | Generalising every institution type or migrating schema prematurely |
| **D2 — Authority convergence** | Per-boundary Cedar, ZenStack/RLS, handler and UI authority/parity map | blocked on D1 | Picking one engine by fiat or weakening existing checks |
| **D3 — Record and activity model** | Separate personal history, compliance audit, operational traces and consented product learning | blocked on D1/D2 | Building surveillance telemetry or a universal event lake |
| **D4 — Cross-door proof** | One complete, recoverable workflow through two clients | blocked on D0–D3 | Expanding agent/realtime/ERP labels without settlement proof |
| **D5 — API/package rationalisation** | Canonical v1 contracts and package boundaries derived from proven domains | blocked on D0–D4 | Bulk v0 deletion or package reorganisation based on names |

## D0 — capability truth implementation plan

### D0 checkpoint — 2026-10-23 (increment 1 accepted, gate remains open)

Two additive, internal static inventories now provide a bounded starting point:

| Artifact | Observed result | What it proves | What it does not prove |
| --- | --- | --- | --- |
| `scripts/audit-route-inventory.mjs` → `reports/atlas-route-inventory.json` | 66 browser `page.*` filesystem candidates; 14 declared registry hrefs (14 static shape matches; zero currently classified dynamic, external or unresolved); zero duplicate route shapes | The selected declared literals are classified as static shape matches, dynamic, external or unresolved; headless is explicitly unknown; selected inputs and generator contents are captured by hash | Navigation consumption, guards, authorization, runtime rendering, data wiring, computed/JSX navigation, non-registry links, deployment or user access |
| `scripts/generate-gate-d0-package-inventory.mjs` → `docs/architecture/gate-d0-package-consumer-inventory.json` | 33 tracked immediate app/package manifests (all present), 3,657 selected tracked JS/TS files present, and 5 tracked JS/TS paths recorded as absent | Manifest export keys and lexical `@repo/*`/manifest-dependency reference evidence for existing selected inputs; absent tracked source paths and manifests are listed and hashed as deletion state; packages with absent manifests contribute no source records | AST/module resolution, export-condition correctness, runtime import/use, feature maturity, authority, persistence or user reachability |
| `scripts/check-gate-d0-capability-inventory.mjs` → `docs/architecture/gate-d0-capability-inventory.json` | Ten bounded, source-traced `partial` records (a traced subset, not a census): attendance, wellbeing, library, assignment, Community, profile, leave approval, student-support draft, payment-intent creation, and classroom-note history | The declared source seams exist. The payment record separates a database-only pending intent from a separately traced PayHere callback; the note record separates lifecycle events, full-row audit snapshots, and reader access | An executed scenario, production mount, UI reachability, authority outcome, persistence outcome, effects governance/retention, queue settlement, provider settlement/reconciliation or complete capability coverage |
| `scripts/generate-gate-d0-capability-discovery.mjs` → `docs/architecture/gate-d0-capability-discovery.json` | 328 lexical candidates from 66 tracked Core contract files and 44 tracked Sanctuary handler files; 108 intersect at least one traced record’s cited evidence paths and 220 have no such source-path intersection | Deterministic selected path/content snapshot and stable signal-derived candidate IDs; the positive group indicates exact cited-path intersection only, never capability identity; the zero-intersection group makes no semantic absence claim | Behavior, maturity, exact capability equivalence, runtime reachability, authorization, persistence, or full platform census |
| `scripts/generate-gate-d0-evidence-audit.mjs` → `docs/architecture/gate-d0-evidence-audit.json` | Field/edge-rule classification for the four inventory artifacts plus a bounded raw-baseline SHA-256 manifest of in-scope untracked D0 files | Separates deterministic extraction/linkage from heuristic labels and human-authored capability judgments; lists exact source paths and limitations | This is not a Git staged/committed diff, runtime proof, semantic TypeScript analysis, or a review/approval record; the report excludes itself to avoid recursive hashing |
| `scripts/check-gate-d0-scope-drift-register.mjs` → `docs/architecture/gate-d0-scope-drift-register.json` | Exact scope linkage for the four inventories; eight explicit exclusions; ten inherited ledger observations, each now source-validated | The register's declared route/package/capability memberships and counts match the four saved snapshots; each finding retains inherited lineage, validation evidence and `autoRepair:false` | That the register is a comprehensive contradiction census, or that any historical claim has been repaired, retired, deployed or otherwise settled |

The route and package checks compare selected source-derived content/hash payloads while treating
timestamp, revision and whole-worktree dirty state as observational provenance.
That is intentional: unrelated concurrent edits must not invalidate a report,
but changes to selected inputs must. The route reviewer accepted this increment
only as a static filesystem snapshot. The package reviewer accepted the scope
only as lexical consumer evidence. Capability schema `1.3.0` allows only
bounded source-observation records, requires each record to declare a closed
effects list with local evidence-claim links, and hashes exactly its cited
source paths plus schema/checker content. Observed effects carry explicit
unknowns rather than inferred governance. The capability-discovery artifact is a
bounded lexical census over tracked immediate Core API contract and Sanctuary
handler files. Its freshness check distinguishes stale output from a selected
source file missing during capture. The scope/drift checker links its candidate
IDs and counts alongside the ten separately source-traced records; discovery
does not promote maturity. The scope/drift checker validates against the four
saved snapshot artifacts, not their dedicated freshness checks.
Neither inventory may promote a capability above `unknown` or `partial`.

**Hostile disposition:** accepted for bounded D0 closure on 2026-10-24 after
raw staged-delta review and all declared freshness checks passed. The drift
register is deliberately not a comprehensive contradiction
register: its ten entries retain inherited-ledger lineage but are now
independently source-validated and non-repairing. Ten hostile-reviewed
capability records now expose attendance,
wellbeing, library, assignment, Community, profile, leave-approval,
student-support, payment-intent and classroom-note-history seams. The
assignment record explicitly captures a receipt-backed lane and a distinct
local queue lane without declaring their runtime relationship; the Community
signal is confined to the observed hook path; profile caller fields remain
distinct from the inspected contract schema; student-support is a human-review
draft, not an automated judgment; payment intent is not provider settlement;
and classroom-note lifecycle history is distinct from full-row audit snapshots.
The D0 exit audit determined that these explicit exclusions and the coverage
decision below are adequate for the inventory boundary only; further source
traces remain required before later gates can make product decisions.

### D0 exit audit — 2026-10-24 (bounded closure accepted)

The final hostile audit accepted D0 closure after the coverage decision below,
the 14-file additive staged delta, and the declared freshness and diff checks.
The following findings remain the binding limits on what that closure means:

1. **Package capture now represents deletion state explicitly.** The generator
   inventories existing selected inputs while hashing sorted tracked manifests
   and source paths absent from the working tree. At this checkpoint it records
   five absent source paths, including the legacy notification hook, without
   asserting that any deletion is approved or semantically safe. A whole missing
   package manifest is likewise represented rather than silently omitted.
   **User decision (2026-10-24):** removal of
   `packages/core/src/api/hooks/notification.hooks.ts` is intentional because
   `packages/core/src/hooks/useScopedNotifications.ts` is the scoped
   replacement. This is migration context for the inventory, not authorization
   to infer approval or equivalence for the other absent paths.
2. **Capability scope remains deliberately bounded.** Ten records cover
   representative, hostile-reviewed seams; a separate 328-signal lexical
   discovery artifact now makes the selected census boundary visible. Neither
   cited-path intersection nor its absence establishes capability identity,
   maturity or complete coverage. The coverage/reconciliation policy is the
   explicit D0 exit decision below.
3. **Drift reconciliation is bounded, not exhaustive.** All ten inherited
   ledger findings now have independently source-validated classifications and
   `autoRepair:false`. This is not yet a comprehensive claim-to-source
   contradiction/reconciliation census.
4. **Static navigation is not product reachability.** The route report only
   covers selected page files and declared literal registry hrefs. Computed/JSX
   navigation, other apps, handlers, middleware, rewrites and headless surfaces
   remain explicit exclusions.
5. **Freshness and provenance are asymmetric.** Route, package, discovery and
   capability artifacts have input-derived freshness checks; the capability
   snapshot hashes its exact cited sources plus its schema/checker. The scope
   check validates saved-artifact linkage, not every dedicated source-freshness
   check.
6. **A reviewable delivery delta was required and inspected.** The staged D0
   delivery contains 14 additive documentation, report and script files with
   no staged product-code changes or deletions. `git diff --cached --check`
   passed. Scoped checkers still do not replace this raw-delta review.

The deletion-aware package snapshot is an inventory fact, not a reason to
restore or delete concurrent changes. Any semantic decision about those paths
remains outside D0 and requires its owning change to be reviewed separately.

### D0 coverage decision — 2026-10-24

D0 closes an **inventory boundary**, not a claim that every source signal is a
finished product capability. The closure standard is therefore:

- Every item inside each declared scanner selection is represented by a
  reproducible inventory or explicit absence state: browser route files and
  declared registry literals; immediate app/package manifests and selected
  source files; and immediate Core API-contract/Sanctuary-handler lexical
  procedure signals.
- Ten intentionally selected cross-domain seams have deeper, source-fresh
  capability cards. They span personal wellbeing, community, library,
  classroom, institutional operations, payments, agentic work and activity/
  audit history. Each remains `partial`; none is a delivery or maturity claim.
- The remaining lexical signals are **candidate-only**. Exact evidence-path
  intersection with a traced card is neither an identity match nor a coverage
  verdict. Later gates must trace a candidate before using it to justify an
  authority, persistence, API, deletion or package-boundary decision.
- Native, API-handler, EdLove and marketing navigation beyond the declared web
  route scan remain explicit route exclusions. They are known scope limits, not
  missing/invalid routes or permission to delete them.

This policy satisfies D0's purpose—making the evidence boundary reviewable—
while preserving the backlog for D1–D5. It does not weaken their authority,
activity, cross-door or rationalisation evidence requirements.

### Deliverables

1. An additive, versioned inventory schema/artifact with stable capability IDs.
2. Deterministic checks for:
   - package directory → package manifest → public export → lexical consumer;
   - declared UI registry href → filesystem route or explicit headless/external
     marker;
   - documented capability → evidence classification and observation date.
3. A contradiction register where claims differ from source; records have owner,
   review date, and disposition. Historical documents remain accessible.
4. A generated or checkable report that distinguishes exact fact from heuristic:
   lexical import discovery is not runtime reachability; route-file existence is
   not authorization or data correctness.
5. A hostile-review checklist and evidence report before D0 can close.

### Required inventory fields

| Field | Why it is necessary |
| --- | --- |
| `id`, `name`, `owner`, `reviewedAt` | A stable join key and accountable review point |
| `kind` and `maturity` | Prevents a package/screen/mock from masquerading as a completed capability |
| `packages`, `exports`, `consumers` | Separates implementation location from actual use |
| `surfaces`, `routes`, `headlessReason` | Verifies product reachability without forcing every capability into UI |
| `actor`, `scope`, `sensitivity` | Keeps people, tenant context and privacy visible |
| `contract`, `authorization`, `persistence`, `sync` | Names the authoritative effect path rather than a generic API label |
| `fallback`, `recovery`, `evidence` | Makes failure and confidence first-class |
| `documentClaims`, `driftDisposition` | Preserves history and exposes contradictions |

### D0 constraints and edge cases

| Edge case | Required treatment |
| --- | --- |
| A route exists but no data/authority is wired | Route is `resolved`; capability stays partial/scaffold. |
| An exported package API has no known consumer | Record as headless/unconsumed/unknown; never delete it from inventory evidence. |
| Dynamic route or external URL | Require an explicit route pattern or `external/headless` marker—do not call it missing. |
| Native-only versus browser-only source | Inventory platform conditions separately; no artificial shared-UI conclusion. |
| Generated source, aliases, barrels and deep imports | Report discovery method and ambiguity; a lexical scan is a lower-confidence edge. |
| Feature flag/citizenship/role filter | Report as navigation/declaration policy until server authority evidence is attached. |
| Mock, local storage, in-memory Map or canned response | Mark simulation/local-only; do not count as durable cross-device capability. |
| Offline queue | Record accepted local draft, authoritative settlement, conflict/revocation, and lost-response behaviour separately. |
| Agent/worker/event path | Require trigger → durable acceptance → dispatch → execution → outcome/retry → human review, not merely an endpoint. |
| Private Self data | Default to personal context; a school/analytics projection requires explicit consent and policy evidence. |
| Financial record | Require tenant ownership, balanced transaction semantics, correction/reconciliation, and audit/export evidence before an ERP claim. |
| Existing document says `active` | Treat as a dated claim; source and evidence determine present status. |

### D0 engineering boundaries

- Additive scripts and artifacts may read repository metadata. They must not
  mutate source, manifests, route registries, lockfiles, schemas, or data.
- Do not parse TypeScript by fragile string rewriting when an existing AST or
  repository inventory mechanism already provides a suitable source. If a
  lexical fallback is used, label it as such.
- Inventory checks must fail only on deterministic integrity violations that are
  in scope; do not convert uninspected history into CI failure without review.
- No secrets, production IDs, personal data, prompts, message bodies, or raw
  audit records belong in generated inventories.
- A generated report must be reproducible from the checkout and must not use
  network access.
- A check may detect drift; it does not itself authorize an automated repair.

## D1 — human and institution model

The first architectural decision after D0 is not “school vs university schema.”
It is the distinction between person-owned continuity and institutional context.

Required concepts to reconcile:

| Concept | Required distinction |
| --- | --- |
| Person/account | Stable human identity and account lifecycle; not a role or tenant record. |
| Bond | A relationship/capacity context that can be activated, delegated, revoked or expire. |
| Membership | Institutional affiliation; not automatically authority over every personal datum. |
| Organization/provider | School today, tuition institution today, university/general organization only when source-backed requirements justify it. |
| Guardian/family | A bounded relationship to a learner and permitted information/actions, not an account-sharing shortcut. |
| Workforce | Future employment/assignment/payroll reality; not retroactively inferred from teacher/staff UI utilities. |
| Scope | The smallest actor/entity/classroom/resource context needed for a decision. |

Hostile questions: Can someone leave a school without losing personal history?
Can a guardian relationship expire? Can one person hold roles in several
institutions? Can private wellbeing remain private? Can an institution export
its custody records without capturing the person’s whole life?

## D2 — authority convergence

Build a capability-by-capability map rather than selecting a winner between
Cedar and ZenStack:

```text
identity resolution → active context → request contract → handler/domain rule
→ Cedar decision? → ZenStack/RLS data filter? → transaction → receipt/projection
```

For every link, state the source of truth, failure mode, deny/default behaviour,
parity test, and what forged client state cannot influence. A UI role filter is
never sufficient authorization. A database read filter does not replace domain
validation. A handler check does not substitute for data isolation.

## D3 — humane activity, audit, and learning records

Create four explicitly separate models:

| Record class | Purpose | Access/retention principle |
| --- | --- | --- |
| Personal activity history | Helps a person understand, undo, resume or correct their own work | Visible to the person; scoped sharing and correction |
| Compliance/security audit | Accountability for consequential, privileged or regulated effects | Minimum necessary immutable/controlled record; limited stewards |
| Operational trace | Diagnose delivery, latency, worker and integration failure | Privacy-minimised, short retention, no product-behaviour profiling by default |
| Consented product learning | Improve UX/accessibility/reliability from aggregate product signals | Explicit purpose, minimisation, aggregation and opt-out/consent as appropriate |

Never use a private reflection, message content, wellbeing datum, or child
record as an analytics shortcut. “Record every click” is rejected as an
architecture principle.

## D4 — cross-door workflow proof

Candidate proof slices are attendance and an approved family notice. Selection
must be based on real user value, manageable risk, and testability—not on which
has the most existing APIs.

The selected slice needs two independent clients (for example mobile + browser)
and explicit evidence for:

```text
draft/local capture → actor/scope → review/confirmation → deterministic commit
→ idempotent receipt → retry/lost response → correction → user-visible history
→ permitted notice/projection
```

For attendance specifically, teacher roll, QR/kiosk capture, classroom
reconciliation and pastoral observation must not be flattened into one boolean.
Kiosk throughput, offline burst, duplicate scan, revocation, conflict and data
minimisation are separate acceptance cases.

## D5 — derived API and package rationalisation

Only after the preceding gates establish capability ownership:

1. Define canonical domain contracts at the smallest stable seam.
2. Provide v1/oRPC adapters where a proven command/query needs them.
3. Keep v0/BFF compatibility until replacement behaviour, callers and recovery
   are evidenced.
4. Mark deprecation candidates in the ledger, with owner and migration proof.
5. Request explicit human approval before actual removal.

No per-feature repository is automatically wrong. A package/API boundary is
meaningful when it owns a coherent domain rule, contract, data authority and
change cadence. It is ceremony when it only forwards calls, duplicates policy,
or creates a second source of truth.

## Hostile architectural and engineering review seat

The reviewer is an active role in every gate, not a retrospective sign-off.

### Mandatory objections

1. **False completeness:** What does this inventory claim that source or tests
   do not prove?
2. **Authority bypass:** Can route params, headers, role filters, stale cache,
   local state or an agent forge scope or privilege?
3. **Failure truth:** After timeout, crash, queue loss, duplicate input,
   cancellation, provider failure or 503, what does the person believe and what
   actually happened?
4. **Privacy extraction:** Does the design accidentally convert care,
   reflection, messages or child data into institutional surveillance?
5. **Tenant leakage:** Are organization identity and row ownership explicit,
   especially in accounting/payments and cross-school queries?
6. **Ceremony:** Does a new registry, package, event, abstraction or endpoint
   create a genuine authority boundary—or merely another list to maintain?
7. **Deletion veto:** Did a proposed cleanup silently remove a fallback, test,
   route or recovery path?

### Gate evidence format

Every completed work item reports:

```text
Evidence level / engine — command or artifact result.
Proves: exact named facts.
Does not prove: untested authority, runtime, device, database, or production facts.
Hostile review: objections raised, disposition, and unresolved risks.
```

## D0 exit criteria

D0 is complete only when all are true:

- Inventory schema/artifact and generator/check are additive, reproducible and
  source-only.
- App route and declared registry inventory distinguishes resolved, dynamic,
  external, headless and unresolved paths.
- All package directories are represented with manifest/export/consumer evidence
  or an explicit exclusion reason.
- Every generated assertion is classified deterministic or heuristic.
- No private/personal content is emitted.
- Existing catalogues and historical documents remain unchanged unless an
  explicitly scoped documentation correction is accepted.
- Hostile reviewer has inspected raw changes and accepted limitations.
- `git diff --check`, relevant scoped verification, and raw diff review pass.

## Immediate work order

**Begin D0 only.** First inspect existing `docs/atlas/capabilities.yaml`,
registry/wiring audit scripts, manifests, and route conventions. Reuse them if
they provide a trustworthy seam; do not create a parallel catalogue because a
new name feels cleaner. The first report must say exactly what the inventory can
and cannot prove.
