---
title: "Safe Exploration Delivery Program"
status: "active"
created: 2026-10-11
updated: 2026-10-11
owner: "Naveen"
scope: "web Explore, mobile Guest, account-holder Safe Try"
tags: [roadmap, safe-exploration, guest, explore, safe-try, production-hardening]
---

# Safe Exploration Delivery Program

## Purpose

This is the executable delivery ledger for the accepted product model. It
turns the architecture into ordered, reviewable work without treating web
Explore, mobile Guest, and account-holder Safe Try as one global mode.

The controlling decisions remain:

- [Sanctuary Explore access and persistence](../decisions/2026-09-14-sanctuary-explore-access-and-persistence.md)
- [Guest local-first lease](../decisions/2026-09-10-guest-local-first-lease.md)
- [Safe Exploration and Reversible Work Model](../architecture/safe-exploration-and-reversible-work-model.md)
- [Production Evidence Governance](../architecture/production-evidence-governance.md)

## Non-negotiable delivery rules

1. **Web Explore** stays public, browser-local, and separate from account data.
2. **Mobile Guest** stays an explicit anonymous-identity, fifteen-day,
   device-local journey. It is not renamed or routed as web Explore.
3. **Safe Try** is feature-scoped and account-owned. It cannot alter the
   session, PowerSync identity, global experience mode, or live command path.
4. No feature earns the label until its reads, writes, effects, reset, discard,
   and evidence are recorded. Unsupported platforms fail closed.
5. Server-backed Sandbox is deferred until a feature needs realistic
   multi-person or external-service rehearsal.

## Milestones

| Milestone | Outcome | Tasks and subtasks | Exit gate | Status |
| --- | --- | --- | --- | --- |
| M0 — Truth and enforcement | The current boundaries are mechanically protected and every first feature is traceable. | 0.1 Map live renderer, query, command, cache/outbox and reset path. 0.2 Record platform availability in the capability manifest. 0.3 Add negative tests for unsupported Safe Try. 0.4 Record a feature card before enabling a platform. | An unsupported platform cannot advertise Safe Try; the first candidate's live side effects and bypass paths are known. | **In progress** |
| M1 — Public web Explore | Anonymous web use is useful, local, honest, and cannot reach account mutations. | 1.1 Verify route/proxy/auth isolation. 1.2 Maintain local adapters and fictional fixtures. 1.3 Preserve failed local input and disclose storage limits. 1.4 Define eligible-record import only where needed. | G1 evidence proves public Explore cannot hydrate or mutate account data. | Partially delivered; inventory remains. |
| M2 — Mobile Guest and claim | Guest lease, cleanup, claim, and per-feature transfer are reliable. | 2.1 Audit Guest stores/effects. 2.2 Verify no Guest write reaches PowerSync or account outbox. 2.3 Separate identity claim from feature-record transfer. 2.4 Ship one manifest-driven transfer with retry/conflict behavior. | Lease cleanup is complete and a partial transfer cannot lose or duplicate eligible work. | Planned. |
| M3 — Account Safe Try by feature | An account holder can safely rehearse a feature on each supported platform. | 3.1 Reuse the shared runtime/controller and account-practice keyspace. 3.2 Declare a persistence policy and document schema, then bind the generic runtime before any entry affordance. 3.3 Provide simulated failure, retry, reset, and discard. 3.4 Add Keep only for a separately reviewed reversible feature. | Each declared platform has G0/G1 evidence that practice cannot reach the live command/effect path. | Browser lifecycle foundation in progress; native pending; G2 multi-tab transaction still blocked. |
| M4 — Controlled promotion | Selected new work can move to live data where the feature contract permits it. | 4.1 Review eligible records. 4.2 Freeze source writes. 4.3 Use idempotent account-authorized creation. 4.4 Retain source until a durable receipt. | Retry and collision behavior are demonstrated; fixtures never promote. | Deferred until M3 has a reversible feature. |
| M5 — Higher-consequence sandbox | Only features that truly require it obtain server/provider isolation. | 5.1 Write the feature-specific justification. 5.2 Create isolated ownership, expiry, audit, and reset. 5.3 Use provider test credentials for external effects. | Server isolation is enforced, observable, and excluded from live reporting. | Deferred by design. |

## M0 current implementation: Fire Journal native Safe Try guard

### Feature card

| Field | Current fact |
| --- | --- |
| Feature | `fire_journal` |
| Native renderer | `@repo/self/components/FireJournal.tsx`, reached through `SelfFeatureRenderer` from the mobile `/self` route |
| Live write | `burnFireJournalEntry()` constructs a `burnJournal` mutation and adds it to the native outbox |
| Live effect risk | The queued mutation can reach the authenticated Sanctuary command; therefore it is not a safe simulation seam. |
| Current Safe Try declaration | Browser only; native resolves as unsupported. |
| Required before native enablement | A native manifest declaration with a `local-isolated` workspace and document schema, bound to the generic runtime with `nativeFeatureStorage`; no call to `burnFireJournalEntry`, `useMutationQueue`, or the live cache key; reset/discard UI and G0/G1 evidence. |
| Keep policy | Disabled: Fire Journal is irreversible and practice content must never promote. |

### Implemented subtask 0.3

`packages/core/src/lib/practiceBoundary.test.ts` now explicitly asserts that
native Fire Journal Safe Try is unavailable. This is an intentional negative
contract: a future manifest edit cannot accidentally expose a reassuring
affordance while the native renderer still has a live outbox path.

### FEATURE SPEC: Catalog-driven Safe Try workspace runtime

- **Blast Zone:** AMBER
- **Target files:** `packages/core/src/logic/registry/capabilityManifest.ts`,
  `packages/core/src/lib/catalogPracticeRuntime.ts`, focused core tests, and
  this delivery ledger.
- **Reuses:** the existing capability manifest, account-practice scope/key
  derivation, `createPracticeController`, `createFeatureRuntime`, and the
  `KeyValueStorage` port.
- **Does not:** create feature-specific persistence adapters, change a feature
  renderer, add a Safe Try UI affordance, alter a session, or write to
  PowerSync/Supabase.
- **Complexity budget:** one generic local-document runtime under 120 lines;
  feature state and fictional fixtures remain renderer/domain concerns.

### Catalog contract implemented in this slice

The capability catalog declares **whether** Safe Try exists on each platform,
its effect/fixture/reset/Keep rules, a `local-isolated` practice workspace,
and a document-schema ID. One core runtime consumes that declaration plus an
injected platform storage port (browser or native) to derive the account +
feature + workspace key and provide load/save/reset/discard. A feature supplies
a validating document codec and a fictional initial state, not a persistence
adapter.

This removes per-feature storage adapters. A feature supplies only its state
document and fixture to the generic runtime; it cannot choose a production
storage path. Future server drafts or isolated sandboxes will be new declared
persistence modes with their own central resolver, not bespoke feature code.

### Gate A checkpoint — 2026-10-11

- `PracticeSessionResolver` now accepts a feature identity and context, obtains
  policy from the core catalog, obtains a matching domain definition from an
  injected registry, and fails closed for unavailable platforms, missing
  definitions, and schema mismatches.
- The Self catalog now declares Fire Journal's practice document schema, while
  the Self domain registry owns its validating codec and fictional fixture.
  Neither contains storage lifecycle or live-command code.
- Native Fire Journal remains unsupported by policy. The resolver returns
  `platform-unsupported` before consulting a storage port or domain definition.
- Browser and mobile renderers have not been migrated in this gate. The next
  gate must bind the existing browser canaries to the resolver before native
  UI integration is considered.

## Evidence ledger

| Claim | Required level | Current evidence | Limitation |
| --- | --- | --- | --- |
| Native Fire Journal Safe Try fails closed | G0 | Capability-manifest unit contract | Does not prove device UI behavior. |
| Browser Fire Journal and attendance stay isolated | G0 + G1 | Existing practice-boundary and browser integration suites | Does not prove native storage or device interactions. |
| Mobile Fire Journal Safe Try works | G0 + G1 + G5 | Not yet claimed | Requires the M3 native feature slice. |

## Gate B checkpoint — browser resolver enforcement

### Implemented

- Core now distinguishes `LocalOnlyKeyValueStorage` from an undifferentiated
  storage port. Browser Safe Try bindings carry an explicit `local-only`
  capability.
- Account Safe Try uses a required browser-local binding; it does not silently
  fall back to process memory when durable browser storage is unavailable.
- Browser Fire Journal now resolves policy, domain definition, schema, and
  storage through `resolvePracticeSession`.
- Browser attendance now resolves through the same boundary. Its validating
  document definition lives in the Classroom domain package, not in the web
  feature adapter.
- Existing Explore and live paths remain separate. No PowerSync, Supabase, or
  mutation-queue path was changed.

### Gate B evidence

| Claim | Evidence | Limitation |
| --- | --- | --- |
| Browser Fire Journal Safe Try is account-isolated | G1 Vitest boundary: 1/1 passed | Does not prove browser bundling or device behavior. |
| Browser attendance Safe Try is resolver-backed and failure truthful | G1 Vitest: 9/9 passed | Does not prove UI interaction or multi-tab races. |
| Resolver/runtime contracts remain valid | G0 Vitest: core 5/5, Self 2/2 | Storage is substituted; no real browser or native bridge. |
| New definitions do not add copy-paste | jscpd on four new definition/runtime files: 0 clones | Existing attendance draft helpers still contain a pre-existing clone. |
| Web package typecheck | No Gate B diagnostics in changed files; package remains non-green because of unrelated existing diagnostics | Not a package-wide green claim. |

### Hostile critique after Gate B

Gate B closes the browser composition gap, but it does not make Safe Try
universally impossible to bypass. The generic runtime remains an exported core
function and can still be called directly by a non-conforming caller. The
resolver also accepts a domain-definition registry and storage binding from its
caller; the browser paths now use the intended boundary, but a future caller
could still inject an incompatible registry unless the public API is narrowed
further.

The document codec validates shape, not feature commands. A renderer can still
invoke a live command if it deliberately ignores the resolved practice runtime.
That is why native Fire Journal remains denied and why this gate cannot claim
outbox isolation. The next gate must provide a mode-bound feature command
surface and an integration assertion that Safe Try interactions never enter
the live mutation path.

The next bounded gate is **Gate C — browser UI/effect isolation**: wire the
resolved runtime into the visible affordance, add a mode-bound command surface,
and prove at G1/G2 that Save, Reset, Discard, malformed input, storage failure,
and live-command spies remain isolated. Native work remains deferred until that
evidence exists.

## Operating cadence

1. Pick one feature/platform cell from M1–M4.
2. Complete its feature card and caller/effect inventory.
3. Add the smallest adapter and affordance only after the card is complete.
4. Run the matching G0/G1 checks; add G5 before a mobile release claim.
5. Update this ledger and the governing model with evidence and limitations.

This keeps the program incremental: each completed cell hardens a real user
journey while the rest of the system remains unchanged.

## Hostile architecture review — 2026-10-11

### Mobile truth, not aspiration

Mobile is **not** a Safe Try client yet:

1. The mobile `/self` route mounts `SelfFeatureRenderer` with a user ID only;
   it has no practice-session resolution or local-storage injection.
2. `useFireJournal` reads a live cache and refreshes live history.
3. Native `burnFireJournalEntry` places `burnJournal` into the authenticated
   mutation outbox. That is a real live-effect path.
4. `nativeFeatureStorage` exists, but no mobile feature uses it through the
   catalog practice policy.

Therefore the manifest must continue to deny native Fire Journal Safe Try.
Changing a label, adding a route parameter, or hiding the release button would
not be sufficient isolation.

### What is still inadequate

The new generic local-document runtime is a useful foundation, but it is not
the finished architecture. It currently requires a caller to supply a policy,
storage port, codec, and initial state separately. Without a central
composition boundary, a caller could combine the wrong policy and feature, a
schema ID can become documentation-only, and the existing browser paths can
continue to bypass the generic lifecycle. None of those are acceptable as the
long-term system.

### Target composition model

```text
Core capability policy              Domain practice definition       Platform binding
----------------------              --------------------------       ----------------
feature + platform allowed   +      feature + schema + fixture  +    browser/native storage
persistence/effect/Keep             state transitions/effect map      session integration
             \                              |                              /
              \---------------- PracticeSessionResolver ---------------/
                                      |
                         one runtime: load/save/reset/discard
                                      |
                       feature renderer receives live OR practice session
                                      |
                  only the live session may reach API, outbox, or PowerSync
```

Ownership stays deliberate:

| Layer | Owns | Must not own |
| --- | --- | --- |
| `@repo/core` capability catalog | availability, platform policy, persistence class, effect/Keep rule, scope and key derivation | Self/attendance state shapes, fixtures, native APIs |
| Domain package (`@repo/self`, `@repo/classroom`) | validating state codec, fictional fixtures, domain transitions | key derivation, storage engine selection, production-write policy |
| Platform app | browser/native storage port and route/session presentation | domain policy or duplicate lifecycle logic |
| Generic resolver | validates compatible declarations and returns a single session | feature-specific persistence adapters |

### Required hardening work, in order

| Gate | Required work | Reject the change if… |
| --- | --- | --- |
| A — Catalog completeness | Add a central `PracticeDefinition` registry keyed by feature ID and validate it against the capability catalog: feature ID, policy platform, persistence mode, and schema ID must agree. | A feature is declared as Safe Try but lacks a definition, or a definition exists without policy authority. |
| B — Session resolver | Replace manual construction with one `resolvePracticeSession()` that receives account, feature, platform, selected scope, platform storage, and the domain definition. It returns unavailable or one local runtime. | A caller can pass attendance policy to Fire Journal, choose a production store, or skip scope/capacity validation. |
| C — Command/effect split | Give feature renderers a small live/practice command port. Practice ports have no API, outbox, PowerSync, analytics side effect, notification, or external-provider implementation. | A practice renderer imports a live repository/hook, or a live command can be reached from the practice port. |
| D — Browser migration | Migrate the existing Fire Journal and attendance Safe Try paths onto the resolver before declaring the abstraction proven. Preserve their G1 tests. | Old bespoke adapters remain the default after the new resolver ships. |
| E — Native canary | Bind the resolver to `nativeFeatureStorage`, replace the live Fire Journal hook only for a resolved practice session, add reset/discard UI, and then allow `native` in the policy. | The route still constructs `useFireJournal` or `burnFireJournalEntry` for practice. |
| F — Guest and transfer | Audit Guest stores independently; use the same declarative vocabulary only where it fits, but do not merge Guest identity/lease/migration with account Safe Try. | Guest work enters the account-practice namespace or account outbox. |
| G — Evidence and rollout | Add catalog contract tests, resolver negative tests, browser component tests, mobile component tests, physical-device tests, and a feature matrix. | A feature is listed as supported without matching G0/G1/G3/G5 evidence. |

### FEATURE SPEC: Gate A — PracticeSessionResolver and Self definition registry

#### Blast Zone: RED (core policy) + AMBER (core runtime and Self catalog)

#### Target files

- `packages/core/src/lib/practiceSessionResolver.ts`
- `packages/core/src/lib/catalogPracticeRuntime.ts`
- `packages/self/src/features/featureCatalog.ts`
- `packages/self/src/features/practiceDefinitions.ts`
- focused unit tests and this ledger

#### Reuses

`resolvePracticeAvailability`, `declaredPracticeCapability`, the generic
catalog practice runtime, account-practice key derivation, and the existing
Self catalog. The resolver receives an injected storage port; it does not
select MMKV, AsyncStorage, localStorage, or a cloud client itself.

#### Does not

Does not enable native practice, modify mobile routes/providers, modify the
live Fire Journal hook, change browser canaries, add a cloud table, or allow a
feature to provide a policy object directly to a practice session.

#### Complexity budget

Resolver functions remain below cognitive complexity 15. Domain definitions
contain data schema/fixture declarations only; no storage lifecycle or API
calls. The patch is rejected if it introduces a per-feature adapter.

### Non-negotiable invariants for the resolver

1. The caller supplies a **feature ID**, not an arbitrary policy object.
2. The resolver reads the policy and domain definition by that ID and rejects
   mismatches before storage is opened.
3. `local-isolated` maps to an injected platform-local storage port only;
   there is no production fallback.
4. A document schema ID must resolve to a validating codec and fictional
   fixture; the identifier alone is not evidence of validation.
5. A practice session is selected once at entry. A renderer cannot swap its
   storage target while mounted.
6. Live command ports and practice command ports are separate values, not a
   conditional branch inside a live repository.
7. Guest, Explore, Safe Try, account draft, server sandbox, and provider-test
   remain distinct persistence/effect classes even when their UI copy is
   similar.

### Definition of complete

This program is not complete when a few screens say “Try safely.” It is
complete only when every declared feature/platform cell has a catalog policy,
validated definition, composed session, isolated command/effect path, reset
and discard behavior, and the required evidence tier. Unsupported cells remain
explicitly unavailable rather than silently falling back to live behavior.

## B.1 correction — catalog-owned Safe Try document identity

“Practice key” is an implementation detail, not a feature contract. A feature
now requests Safe Try by its feature identity; core derives an opaque physical
storage identity from the catalog-owned `documentId`. No feature caller passes
a workspace identifier or constructs a record key.

For backward compatibility, a catalog entry can declare historic browser
document locations. The generic runtime reads a declared legacy value only
when the catalog-owned document is absent, copies it to the new location, and
does not delete the old value. Fire Journal declares the sole historical
location used by the actual web route: `self` plus `self:fire_journal`.

### B.1 evidence

- G0 core: 15 focused boundary/runtime/resolver tests passed, including the
  non-destructive legacy-document copy.
- G1 browser: Fire Journal Safe Try boundary test passed after removal of the
  caller-supplied workspace argument.
- Biome passed on B.1 files; jscpd found no duplicates in its three core
  boundary/runtime files.
- Core and web package-wide typechecks remain non-green because of unrelated
  existing diagnostics. The initially new core test diagnostic was corrected;
  no B.1 source diagnostic remained in filtered output.

### Hostile limitation after B.1

This migration can preserve only locations that are known and declared. A
historical caller could have supplied any arbitrary workspace string, so data
written under an unknown arbitrary string cannot be safely enumerated or
migrated without scanning browser storage. We will not scan or delete user
browser storage. The actual product route used `self`, which is covered.
