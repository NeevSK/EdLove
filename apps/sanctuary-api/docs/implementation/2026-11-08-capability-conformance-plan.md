---
title: "Capability Conformance: Intent, Symbol, Code and Practice in Step"
status: "active"
created: 2026-11-08
updated: 2026-11-08
author: "Naveen"
scribe: "Claude"
tags: [api, conformance, capabilities, evidence, channels, agents, dependencies, tooling, legacy, plan]
---

# Capability Conformance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every API capability, however many there are, show in one generated report whether its intent, its documented symbol, its code and its practical evidence agree, and make that agreement only able to improve.

**Architecture:** Bedrock first: API dependencies move to the newest release in their own channel and are synced across workspaces, and every tool used for grounding has its recall measured before its output is trusted (Tasks 0, 0b). Then the module catalog (`apps/sanctuary-api/src/modules/catalog.ts`) grows from modules down to capabilities and becomes the one declared source. Four readers each derive one layer from what already exists (cards, contract and router, Cedar, tests and their evidence level, client call sites). A reconciler joins them per capability, names every gap with a fixed code, writes `reports/capability-conformance.{json,md}`, and a ratchet stops gap counts from rising. A channel conformance suite then runs the same scenarios for every capability on every admitted channel, and the agent action space is derived from the same catalog.

**Tech Stack:** TypeScript (tsgo), oRPC `@orpc/contract@2.0.0-beta.46`, Vitest, Cedar (`packages/policies`), tsx scripts, `scripts/run-and-report.mjs`, `scripts/ratchet.mjs`.

**Spec:** this plan argues from documents that already exist; read them with it:
[channel admission model](../../../../docs/architecture/channel-admission-model.md#what-to-build-in-one-seam) (capability catalog, conformance suite),
[road to v1](../../../../docs/architecture/road-to-v1.md#what-holds-it-together) (the five mechanisms),
[domain design method](../../../../docs/architecture/domain-design-method.md) (cards, capability naming),
[domain index](../../../../docs/architecture/domains/README.md),
[API engineering playbook](../architecture/api-engineering-playbook.md#horizontal-layers-the-base-every-domain-stands-on) (layers, evidence),
`AGENTS.md` §6 (G0–G5, R1).

## Why this exists

The post that started this (OpenChoreo, 2026-11) asks for one enforcement point for people
and agents, golden paths that double as the agent's action space, agents with their own
identity that start read-only, and an audit trail. The platform documents already decide all
four. What is missing is a way to *see*, for each capability, whether the decision, the
document, the code and the working practice actually line up. Today each gap is found by a
person reading. Examples found while writing this plan (2026-11-08):

| Gap | Where |
| --- | --- |
| Domain index says identity is admitted with `session`, `scopes`; router has four procedures (`entry`, `createInitialBond` too) | `docs/architecture/domains/README.md:79` vs `src/core/router.ts` |
| Module structure says only `identity` is admitted; catalog and index also admit `authority` | `docs/architecture/module-structure.md:140` vs `src/modules/catalog.ts` |
| Two admitted platform modules have no card; the fitness test only asks cards of domain modules | `src/modules/catalog.test.ts` "admits a domain module only with its card" |
| Evidence is recorded per test command (`--evidence-level G1`), never per capability | `apps/sanctuary-api/package.json` scripts |
| `createInitialBond` is a command with no declared kind, channels or assurance | channel admission "capability catalog" row: not built |
| API dependencies behind their own channel: the oRPC cohort is on `2.0.0-beta.46`, `beta.49` is out | `scripts/lib/dependency-cohorts.mjs:252-258` |
| `hono` split across majors: `5.0.0-rc.1` in the API, `^4.13.16` in `@repo/core` | `apps/sanctuary-api/package.json:27`, `packages/core/package.json:482` |
| The grounding tool itself is shallow: `rn-terrain affordance expo-router` reports 5 symbols (all colour types) where the real `.d.ts` chain exports 189 (12 files, incl. `useRouter`, `Link`, `Stack`), yet tells agents anything else "will fail at compile time" | `c:/projects/rn-terrain/packages/core/src/compass/node-modules-affordance.ts:193-229` |

## The model (decided here, used by every task)

Four layers per capability. Each is *derived*, never typed into a second ledger (the playbook
forbids a second ledger; this report is generated, the catalog is the declaration).

| Layer | Question | Derived from |
| --- | --- | --- |
| **Intent** | Did a person decide this capability should exist, with owner, authority and lifecycle? | The card's `## Commands` / `## Queries` sections |
| **Symbol** | Is it declared where code and docs can be checked against it? | Catalog `capabilities`, contract `appContract`, domain index row |
| **Code** | Does the server implement and guard it? | Router handler at the same path; a Cedar action for the module's namespace |
| **Practice** | Does it work, and is it used? | Evidence records (capability × level × result × commit); client call sites per channel; conformance scenarios per channel |

The shape holds for any number of capabilities, modules and channels: every check is a
join over the catalog, so the work for one capability or four hundred is the same code.
Nothing is written specially for identity.

### Gap codes (closed set; the report never invents prose gaps)

| Code | Layer | Meaning |
| --- | --- | --- |
| `INTENT_NO_CARD` | Intent | Admitted capability whose module has no card |
| `INTENT_UNLISTED` | Intent | Card exists but does not list the capability |
| `INTENT_ONLY` | Intent | Card lists a capability the catalog doesn't have (decided, not built: allowed while the module is `skeleton`) |
| `SYMBOL_UNDECLARED` | Symbol | Contract procedure with no catalog entry |
| `SYMBOL_NO_CONTRACT` | Symbol | Admitted catalog entry with no contract procedure |
| `DOC_DRIFT` | Symbol | A human document's table disagrees with the catalog (index, module structure, playbook layer table) |
| `CODE_NO_HANDLER` | Code | Contract procedure the router doesn't implement |
| `CODE_NO_POLICY` | Code | Domain capability with no Cedar action in its module namespace |
| `PRACTICE_NO_EVIDENCE` | Practice | No passing evidence record names the capability |
| `PRACTICE_BELOW_BAR` | Practice | Best passing evidence is below the capability's `requiredEvidence` |
| `PRACTICE_STALE` | Practice | Best evidence is older than the last commit touching its handler or contract |
| `PRACTICE_NO_CONSUMER` | Practice | Admitted, but no client on any open channel calls it |
| `CHANNEL_UNPROVEN` | Practice | Channel open in the catalog with no passing conformance run for this capability |

Order of evidence levels: `G0 < G1 < G2 < G3 < G4 < G5 < R1`.

### Bedrock first

Code comes last. Before a task writes code, everything it stands on is grounded in this order:

1. **Versions.** Every dependency the task touches is at the newest release *in the channel
   we already use* (beta, rc, preview or stable), and every workspace is synced to the highest
   version any workspace uses. `latest` on the registry is not the target when we are on a
   pre-release line (oRPC's `latest` is the older `1.16.2`; ours is `2.0.0-beta.*`).
2. **Installed surface.** Signatures come from the installed `.d.ts` and source, never memory.
3. **Real code path.** The current implementation and its callers, read, not assumed.
4. **Configuration.** Secrets (Doppler), environment, migrations the path needs.
5. **Findings recorded** in the dependencies doc or the task's commit, so the next session
   does not investigate again.

Scope is the seam the task touches, not the whole monorepo; otherwise grounding never ends.

### Tools are capabilities too

Every tool or gate this plan relies on (`rn-terrain affordance`, `audit:api-composition`, and
the readers built in Tasks 2–5) has the same four layers, and its practice can be shallow while
its intent and code look done. So each one gets the same treatment before its output is trusted:

| Step | Rule |
| --- | --- |
| Ground truth | An independent baseline on real inputs (a manual walk, a second method) |
| Recall | `found ∩ truth / truth`, recorded as evidence with the input and version |
| Honest coverage | The tool's output states what it covered ("followed 1 of 12 files") and never claims completeness it didn't measure |
| Loud failure | No silent `catch {}`; an unread file is reported, not skipped |
| Ratchet | Measured recall is a `tooling/ratchet.json` metric and may only rise |

A tool with unmeasured recall is reported as `unmeasured`, never as clean.

### Legacy is frozen, not sorted

The 2026-11-06 reset (`472b6a0ae`) removed the old API from the server but only *added*
`v1/` to `@repo/core`. Found 2026-11-08:

| Fact | Number |
| --- | --- |
| Files in `packages/core/src/api/`, all tracked | 256, of which 4 in `v1/` |
| Web files importing legacy `@repo/core/api/*` (not `v1`) | 48 (mobile: 0; `packages/ai`: 1) |
| Core files outside `api/` importing it | 123 |
| Legacy `orpcClient` target vs server | posts to `/api`; the server serves only `/api/v1/*`, so its callers typecheck and 404 at runtime |

Owner direction (2026-11-08): sorting 252 files costs more than building new, so we don't.

1. **New code is built new**, in `v1/` and the empty module folders, and never imports legacy.
   A ratchet makes legacy imports only able to fall (Task 0c), so the old API can't spread back.
2. **Deleting legacy is never the priority.** It drains away as screens move to v1 capabilities;
   removal happens later, in batches, each with owner approval (Deletion Veto). Product screens
   are never removed because their API is missing.
3. **Exceptions are named, not general.** A legacy file that blocks bedrock work (a type error
   after an upgrade, a security hole) is handled on its own, with a note. Native code in
   `@repo/core` follows its own rules and is out of this plan's scope.
4. **Known costs of freezing.** `@repo/core` typecheck stays red on legacy files (55 errors before
   Task 0, 98 after; the 43 new ones are all Hono 5's `c.req.json(): unknown` in the dead
   `api/handlers/*`, imported by nothing). The report counts them as legacy, not as regressions.

### Priority order

The order is what makes the API clean, as the post describes: one door, a declared action
space, evidence. Removing the old is last.

| # | Work | Why this position |
| --- | --- | --- |
| 1 | T0 deps synced (done, uncommitted) | Everything below codes against these versions |
| 2 | T0c freeze legacy imports | Cheapest guard; stops the old API spreading while the rest is built |
| 3 | T0b grounding-tool recall | Agents stop trusting a 5-of-189 export list |
| 4 | T1 capabilities in the catalog | The one declaration everything joins on |
| 5 | T2 cards, T3 doc tables | Intent and symbol layers |
| 6 | T4 evidence, T5 consumers | Practice layer |
| 7 | T6 report, T7 ratchet, T8 synthetic n-proof | The conformance picture, and proof it scales |
| 8 | T9 channel suite, T10 action space | The agent-ready platform; gated on layer 3 and channel admission |
| 9 | T11 codify | Docs follow the code |
| — | Legacy removal | Not scheduled. Batches proposed only when callers are gone |

## Global Constraints

- Dependency target: newest release in the channel in use, synced to the highest version in any workspace; through the Cautious Upgrade Protocol (`deps:check`, `harmonize-dependencies.mjs --write`), never `pnpm update` or `expo install --fix`.
- No tool output is used as grounding until its recall is measured (Task 0b, Task 5).
- The catalog is the only place capability metadata is declared; docs are checked against it, never the other way.
- Default for a new capability: `channels: ['app']`, read-only agents later (channel admission D5, D7).
- No new channel is admitted by this plan; `catalog.test.ts` "keeps the app channel as the only admitted channel" stays as is.
- Owner order (2026-11-06): horizontal foundation first; no product rules invented. Cards for platform modules record what the code does and mark everything undecided under `## Open questions`.
- Naming: `*.adapter.ts`, `use*`, `*Driver`; no `*Service`/`*Manager` outside `@repo/platform-mcp`.
- Scripts run through `scripts/run-and-report.mjs`; every test script declares `--evidence-level`.
- No deletion of existing tests, fitness checks or audit rules (Deletion Veto). Gates only tighten.
- Typecheck with `pnpm run check-types`; anti-slop with `pnpm run check:anti-slop`.
- Reports and evidence claims follow AGENTS.md §6 wording ("G1 boundary / Vitest … Proves … Does not prove …").

## Review Focus

1. **A capability renamed in the contract but not the catalog**: the reconciler must report both `SYMBOL_UNDECLARED` (new name) and `SYMBOL_NO_CONTRACT` (old name), not silently pair them. Test in Task 1.
2. **Evidence from a failing run**: a failed run must never count as evidence, even if an earlier run passed at a lower level. Test in Task 4.
3. **Nested namespaces** (`learning.assignments.submit`, three levels) next to two-level platform ones (`identity.session`): the walker must flatten both. Test in Task 1 with the synthetic fixture.
4. **A card heading written slightly differently** (`## Commands ` with trailing space, `## commands`): the parser must accept case and whitespace differences and report an unparseable card as `INTENT_UNLISTED` for each capability, not crash. Test in Task 2.
5. **Consumer scan false positives**: a string `"identity.entry"` in a comment or doc must not count as a call site. Test in Task 5.
6. **Re-export chains and cycles**: `export *` several levels deep, `export { a as b } from`, `export default`, and two files re-exporting each other must neither lose names nor loop. Test in Task 0b.

---

## File structure

| File | Responsibility | Task |
| --- | --- | --- |
| `scripts/lib/dependency-cohorts.mjs`, manifests, `pnpm-lock.yaml` (modify) | oRPC cohort to the newest beta; `hono` synced to the highest in use | 0 |
| `docs/architecture/dependencies.md` (modify) | What moved, why, changelog findings, re-check date | 0 |
| `c:/projects/rn-terrain/packages/core/src/compass/node-modules-affordance.ts` (modify, separate repo) | Recursive export walk, coverage report, loud failures | 0b |
| `c:/projects/rn-terrain/packages/core/src/compass/node-modules-affordance.test.ts` (create) | Recall against fixture chains and real packages | 0b |
| `apps/sanctuary-api/src/modules/catalog.ts` (modify) | Add `capabilities`, `CapabilityManifest`, `EvidenceLevel` | 1 |
| `apps/sanctuary-api/src/modules/contractPaths.ts` (create) | `procedurePaths(contract)`: flatten any contract to dotted paths | 1 |
| `apps/sanctuary-api/src/modules/catalog.test.ts` (modify) | Fitness: catalog ↔ contract ↔ router; platform cards | 1, 2 |
| `apps/sanctuary-api/src/conformance/cards.adapter.ts` (create) | Parse cards to `{ module, commands, queries, status }` | 2 |
| `docs/architecture/domains/platform/identity.md`, `.../authority.md` (create) | Platform cards, from code, owner to confirm | 2 |
| `apps/sanctuary-api/src/conformance/docTables.adapter.ts` (create) | Read status/procedure tables from the three human docs | 3 |
| `apps/sanctuary-api/src/conformance/evidence.ts` (create) | `capabilityTag()`, evidence record schema, reader | 4 |
| `scripts/run-and-report.mjs` (modify) | Write `reports/evidence/<name>.json` with per-test capability tags | 4 |
| `apps/sanctuary-api/src/conformance/consumers.adapter.ts` (create) | Find client call sites per channel via TS AST | 5 |
| `apps/sanctuary-api/src/conformance/reconcile.ts` (create) | Pure join → `ConformanceRow[]` with gap codes | 6 |
| `apps/sanctuary-api/scripts/capability-conformance.ts` (create) | Run readers, reconcile, write report, ratchet | 6, 7 |
| `apps/sanctuary-api/src/conformance/__fixtures__/synthetic.ts` (create) | Six synthetic capabilities over three modules and two channels | 8 |
| `apps/sanctuary-api/src/conformance/channelSuite.ts` (create) | Scenario set × channel driver × capability | 9 |
| `apps/sanctuary-api/src/conformance/drivers/app.driver.ts` (create) | App (oRPC over HTTP) driver | 9 |
| `apps/sanctuary-api/src/conformance/actionSpace.ts` (create) | Derive each channel's callable capability list | 10 |
| `tooling/ratchet.json`, `scripts/ratchet.mjs` (modify) | Gap counts per code; may only fall | 7 |
| Docs listed in Task 11 (modify) | Point to the report; replace hand status where it duplicates | 11 |

Everything new lives under `src/conformance/` so it is one module with one owner; the
composition audit's `admittedHostFiles` list gets no new entries because none of these
files is part of the request path.

---

### Task 0: Bedrock: API dependencies on the newest release in their channel

**Files:**
- Modify: `scripts/lib/dependency-cohorts.mjs:252-258` (the seven `@orpc/*` entries), then the manifests `harmonize-dependencies.mjs --write` changes, `pnpm-lock.yaml`
- Modify: `packages/core/package.json:482` (`hono` to the version in `apps/sanctuary-api/package.json:27`)
- Modify: `docs/architecture/dependencies.md`

**Interfaces:**
- Produces: one oRPC version across the workspace (expected `2.0.0-beta.49`, whatever is newest on the `beta` tag on the day) and one `hono` version (the highest in use, `5.0.0-rc.1` today, or newer on its `next` tag). Tasks 1–10 code against these.

- [ ] **Step 1: Read the registry and changelogs.** `npm view @orpc/contract dist-tags` and `npm view hono dist-tags`; the oRPC GitHub releases for every beta after the installed one and Hono's v5 release candidates. Write down every breaking or renamed API in the notes for Step 6.
- [ ] **Step 2: Check the peer matrix.** oRPC's peer ranges for `zod` (installed `4.6.7`) and the Hono adapter used by `apps/sanctuary-api/src/core/app.ts`; `@hono/node-server` (`^2.1.6`) against Hono 5.
- [ ] **Step 3: Check Hono's users in `@repo/core`.** `rg -n "from 'hono" packages/core/src`: today they are `api/clientRuntime.ts` and `api/handlers/*`, on the legacy surface the reset retires. If every one is on the reset list, record that and sync the version anyway; if a live one breaks on v5, stop and ask (Deletion Veto applies; do not delete it to make types pass).
- [ ] **Step 4: Upgrade.** Edit the cohort, run `pnpm run deps:harmonize`, `pnpm install --lockfile-only`, then `pnpm install`.
- [ ] **Step 5: Verify.** `pnpm run deps:check` (exit 0); `pnpm --filter @repo/sanctuary-api run check-types`; `pnpm --filter @repo/sanctuary-api test` (G1) and `test:socket` (G2); `pnpm audit:api-composition`. Compare against the same commands run *before* Step 4 and record both, so failures that already existed are not blamed on the upgrade.
- [ ] **Step 6: Record** in `dependencies.md`: versions from → to, changelog findings, held items, re-check date.
- [ ] **Step 7: Commit** `chore(deps): oRPC to newest beta, hono synced across workspaces`.

**Result (2026-11-08, uncommitted):** cohort moved to `2.0.0-beta.49` and `hono` added to the
cohort at `5.0.0-rc.1`; `deps:harmonize` changed 9 declarations in 3 manifests. No renamed oRPC
option is used in our code (`BatchLinkPlugin` keeps the default buffered mode). Before → after:
API types 0 → 0; API G1 104/104 → 104/104; API G2 sockets 15/15 → 15/15; composition audit
unchanged (249 legacy-source, 60 type-escape, 1 legacy-converter); core `src/api` tests same
failing set (11 files, 1 test); core types 55 → 98 (all new in dead legacy handlers, see
*Legacy is frozen*); web types 0 → 2, both in `proxy.ts`, which another session was editing at
the time, not from the upgrade. Peer warning: `@zenstackhq/server@3.10.1` wants `hono ^4.6.0` as
one of ten optional adapters and is imported nowhere in core.

### Task 0c: Freeze legacy API imports

**Files:**
- Modify: `scripts/ratchet.mjs`, `tooling/ratchet.json`

**Interfaces:**
- Produces: ratchet metric `legacyCoreApiImports`: import sites of `@repo/core/api/<x>` where `<x>` is not `v1/…`, in `apps/` and `packages/`, plus imports from inside `packages/core/src` (outside `api/`) of `../api/<x>` not under `v1`. Tests excluded, like the other metrics.

- [ ] **Step 1: Count by hand first** (ground truth): `rg --pcre2 -c "@repo/core/api/(?!v1/)" apps packages -g '*.{ts,tsx}' -g '!**/node_modules/**' -g '!**/*.test.*'` and the relative-import variant; write both numbers down.
- [ ] **Step 2: Add the metric** to `ratchet.mjs` following `countAnyInSrc`. `runRgCount` returns `0` when `rg` fails, which would make this metric pass silently; for this metric, a failed `rg` run must fail the gate (Tools are capabilities too).
- [ ] **Step 3: Verify** `node scripts/ratchet.mjs` reports the same number as Step 1; add one legacy import to a scratch file and confirm the gate fails; remove it.
- [ ] **Step 4: Set the baseline** with `node scripts/ratchet.mjs --update` and commit `chore(ratchet): legacy core API imports may only fall`.

### Task 0b: Ground the grounding tool (rn-terrain affordance recall)

The repo is `c:/projects/rn-terrain`, which has unrelated uncommitted changes; touch and
commit only the two files below.

**Files:**
- Modify: `c:/projects/rn-terrain/packages/core/src/compass/node-modules-affordance.ts:150-229`
- Create: `c:/projects/rn-terrain/packages/core/src/compass/node-modules-affordance.test.ts`

**Interfaces:**
- Produces: `collectExports(entry: string): { names: Set<string>; filesFollowed: string[]; unread: { file: string; reason: string }[] }`, which follows `export *` and `export { … } from` recursively (relative specifiers; `.d.ts`, `.d.mts`, `/index.d.ts`), with a visited set against cycles, and reads `const|let|function|class|type|interface|enum|namespace|default` declarations and named export lists. The card gains `coverage: { filesFollowed: number; unread: number }`, and the preflight prompt prints coverage and drops the "will fail at compile time" claim whenever `unread > 0`.

- [ ] **Step 1: Failing tests.** Fixture tree: an entry with only `export *` lines, three levels deep, one `export { a as b } from`, one `export default`, one `enum`, and a cycle (Review Focus 6): `collectExports` returns the exact expected set and terminates. Real-package recall: for `expo-router@58.0.30`, names include `useRouter`, `Link`, `Stack`, `Tabs`, `router`, `useLocalSearchParams`, and the count is at least 189 (the manual baseline from 2026-11-08); an unreadable file shows in `unread` instead of being skipped.
- [ ] **Step 2: Run, expect FAIL** (today: 5 names).
- [ ] **Step 3: Implement** `collectExports` and use it in place of the three regex passes; replace the silent `catch {}` blocks in this function with entries in `unread`.
- [ ] **Step 4: Run, expect PASS**; then from `C:\x`: `node scripts/run-rn-terrain.mjs affordance expo-router apps/gurudevi-mobile` shows ≥ 189 symbols and its coverage line. Repeat for `@orpc/contract` and `hono` from `apps/sanctuary-api` and record each count next to a manual walk.
- [ ] **Step 5: Ratchet.** Add `rnTerrainAffordanceRecall` (per package measured) to `tooling/ratchet.json` through `scripts/ratchet.mjs`.
- [ ] **Step 6: Commit** in rn-terrain `fix(affordance): follow re-export chains and report coverage`; in this repo, commit the ratchet change.

### Task 1: Capabilities in the catalog, held equal to contract and router

**Depends on:** Task 0 (the contract walk is written against the upgraded oRPC).

**Files:**
- Modify: `apps/sanctuary-api/src/modules/catalog.ts`
- Create: `apps/sanctuary-api/src/modules/contractPaths.ts`
- Test: `apps/sanctuary-api/src/modules/catalog.test.ts`, `apps/sanctuary-api/src/modules/contractPaths.test.ts`

**Interfaces:**
- Produces:
  - `type EvidenceLevel = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'R1'` and `const evidenceOrder: readonly EvidenceLevel[]`
  - `type ChannelName = (typeof channels)[number]['name']`
  - `interface CapabilityManifest { name: string; module: PlatformModule | DomainModule; kind: 'query' | 'command'; channels: readonly ChannelName[]; assurance: 'session' | 'fresh-person'; status: ModuleStatus; requiredEvidence: EvidenceLevel }`
  - `const capabilities: readonly CapabilityManifest[]`, first entries: `identity.session` (query), `identity.scopes` (query), `identity.entry` (query), `identity.createInitialBond` (command), `authority.refreshSnapshot` (query: it issues but changes no facts; confirm with owner, see Open decisions). All `channels: ['app']`, `assurance: 'session'`, `status: 'admitted'`, `requiredEvidence: 'G2'`.
  - `procedurePaths(contract: RouterContract): string[]`: sorted dotted paths of every procedure leaf.

- [ ] **Step 1: Write failing tests**

`contractPaths.test.ts`: `procedurePaths(appContract)` equals `['authority.refreshSnapshot','identity.createInitialBond','identity.entry','identity.scopes','identity.session']`; on a contract nested three deep (`{ learning: { assignments: { submit, list } } }` built with `oc`) returns `['learning.assignments.list','learning.assignments.submit']`.

`catalog.test.ts`, new cases:
- `it('declares every contract procedure as a capability')`: `procedurePaths(appContract)` equals sorted admitted `capabilities` names.
- `it('implements every admitted capability in the router')`: `procedurePaths` over `router` (same walk) equals the same list.
- `it('places each capability under its module')`: `name.startsWith(module + '.')`.
- `it('opens capabilities only on known channels')`: every `channels` entry is in `channels`.
- `it('names every capability once')`.

- [ ] **Step 2: Run, expect FAIL**: `pnpm --filter @repo/sanctuary-api exec vitest run src/modules` → `capabilities` / `procedurePaths` not exported.

- [ ] **Step 3: Implement**. `procedurePaths` walks object keys and treats a node as a procedure when `getProcedureContractOrThrow(contract, path)` succeeds and `getRouterContract` has no child keys. In `beta.46` these are declared at `dist/index.d.mts:119-120` and there is no `isContractProcedure`; re-read both declarations and `index.mjs` in the version Task 0 installed before choosing, and use one with no try/catch if the source allows. Use the same walk for the implemented router.

- [ ] **Step 4: Run, expect PASS**: same command, then `pnpm --filter @repo/sanctuary-api run check-types`.

- [ ] **Step 5: Commit** `feat(api): declare capabilities in the module catalog`.

### Task 2: Cards as the intent layer, for platform modules too

**Files:**
- Create: `apps/sanctuary-api/src/conformance/cards.adapter.ts`, `cards.adapter.test.ts`
- Create: `docs/architecture/domains/platform/identity.md`, `docs/architecture/domains/platform/authority.md`
- Modify: `apps/sanctuary-api/src/modules/catalog.test.ts`, `docs/architecture/domain-design-method.md` (one line: platform cards live in `domains/platform/<module>.md`)

**Interfaces:**
- Consumes: `capabilities`, `platformModules`, `domainModules` (Task 1).
- Produces: `interface Card { module: string; status: 'draft' | 'admitted' | 'retired'; commands: string[]; queries: string[]; path: string }`, `readCards(repoRoot: string): Card[]`, `cardPath(module: string): string` (`platform/<m>.md` for platform, `<domain>/<sub>.md` for domain).

- [ ] **Step 1: Failing tests.** `cards.adapter.test.ts` on in-memory fixtures: parses backticked names under `## Commands` and `## Queries` ignoring case and trailing spaces; a card missing both headings returns empty lists (Review Focus 4); frontmatter `status` read. `catalog.test.ts`: rename the existing case to `'admits a module only with its card'` and extend it to admitted platform modules (the old assertion for domain modules stays inside it).
- [ ] **Step 2: Run, expect FAIL** (no cards for identity, authority).
- [ ] **Step 3: Implement the parser; write the two cards** from `contract.ts`, `router.ts`, `security/security.ts` and the authority model, using the card template in the domain design method. `status: draft`, owner `Naveen`. Anything the code doesn't settle goes under `## Open questions`, not into a rule.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `docs(domains): platform cards for identity and authority`.

### Task 3: Human document tables checked against the catalog

**Files:**
- Create: `apps/sanctuary-api/src/conformance/docTables.adapter.ts`, `docTables.adapter.test.ts`
- Modify: `docs/architecture/domains/README.md:79-80`, `docs/architecture/module-structure.md:140` (fix the drift found above once the test exists)

**Interfaces:**
- Produces: `interface DocClaim { doc: string; line: number; module: string; status?: string; capabilities?: string[] }`, `readDocClaims(repoRoot: string): DocClaim[]`. Sources: the platform-modules table in the domain index (status and the backticked list in parentheses), the module-structure "Platform frame" row, and the playbook layer table's module names.

- [ ] **Step 1: Failing test.** Against the current files: `readDocClaims` reports `identity` with `capabilities: ['session','scopes']`; a pure `docDrift(claims, capabilities, catalog)` returns one `DOC_DRIFT` for identity (missing `entry`, `createInitialBond`) and one for module-structure (`authority` admitted in catalog, not in doc).
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement**, then correct the two documents so the drift test passes on the real tree, with a unit test that keeps a fixture of the drifted text to prove detection still works.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(conformance): check human doc tables against the catalog`.

### Task 4: Evidence bound to capabilities

**Files:**
- Create: `apps/sanctuary-api/src/conformance/evidence.ts`, `evidence.test.ts`
- Modify: `scripts/run-and-report.mjs` (add `--evidence-json <path>`: run Vitest with its JSON reporter, then write `reports/evidence/<name>.json`)
- Modify: tests that already exercise identity and authority, adding the tag to their `describe` titles: `src/__tests__/foundation.test.ts`, `src/__tests__/node-server.test.ts`, `src/security/__tests__/initial-bond.test.ts`, `packages/core/src/logic/permissions/__tests__/snapshotRefresh.test.ts`, the database scenario `scripts/test-foundation-database.ts`
- Modify: `apps/sanctuary-api/package.json` test scripts to pass `--evidence-json`

**Interfaces:**
- Produces:
  - `capabilityTag(...names: string[]): string` → `'[cap:identity.entry,identity.scopes]'`, appended to a `describe` title.
  - `interface EvidenceRecord { capability: string; level: EvidenceLevel; passed: boolean; test: string; run: string; commit: string; at: string }`
  - `readEvidence(dir: string): EvidenceRecord[]` and `bestPassing(records, capability): EvidenceRecord | undefined` (highest level among `passed`, latest wins on a tie).

- [ ] **Step 1: Failing tests.** `bestPassing` ignores failed records even at a higher level (Review Focus 2); returns `undefined` with no passing record; picks G2 over G1. `capabilityTag` round-trips through the parser used by the reader.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement**; one record per (test × tagged capability); `commit` from `git rev-parse HEAD` and `dirty: true` when the tree is dirty (records from a dirty tree count as evidence but are shown as such in the report).
- [ ] **Step 4: Run** `pnpm --filter @repo/sanctuary-api test` and confirm `reports/evidence/apps_sanctuary-api-foundation.json` holds G1 records for the tagged capabilities.
- [ ] **Step 5: Commit** `feat(evidence): record evidence per capability`.

### Task 5: Consumers per channel

**Files:**
- Create: `apps/sanctuary-api/src/conformance/consumers.adapter.ts`, `consumers.adapter.test.ts`

**Interfaces:**
- Produces: `interface Consumer { capability: string; channel: ChannelName; client: 'web' | 'mobile' | 'core'; file: string; line: number }`, `findConsumers(repoRoot: string, names: string[]): Consumer[]`. Scans `apps/gurudevi-web`, `apps/gurudevi-mobile`, `packages/core/src` (excluding `api/v1` itself and tests) for property-access chains on a v1 client ending in a capability path, using the TypeScript AST the composition audit already imports (`typescript/ast`, `typescript/sync`). All are channel `app` today; the channel comes from a small `clientChannel` map so a bot or MCP adapter folder can be added later.

- [ ] **Step 1: Failing test** on fixture sources: `client.identity.entry()` counts; `"identity.entry"` in a string or comment does not (Review Focus 5); a call through a destructured `const { identity } = client` counts.
- [ ] **Step 2: Run, expect FAIL.** **Step 3: Implement.** **Step 4: Run, expect PASS**, then run on the real tree and check that `v1Entry.ts`, `bootstrapRouteState.ts` and `snapshotRefresh.ts` appear.
- [ ] **Step 4b: Measure recall.** Baseline: `rg -n "\.(identity|authority)\.[a-zA-Z]+\(" apps/gurudevi-web apps/gurudevi-mobile packages/core/src`, read by hand to remove non-calls. Recall of `findConsumers` against it must be 1.0 on today's tree; record both counts in the commit message and add `consumerScanRecall` to `tooling/ratchet.json`.
- [ ] **Step 5: Commit** `feat(conformance): find v1 consumers per channel`.

### Task 6: Reconciler and report

**Files:**
- Create: `apps/sanctuary-api/src/conformance/reconcile.ts`, `reconcile.test.ts`
- Create: `apps/sanctuary-api/scripts/capability-conformance.ts`
- Modify: root `package.json`: `"audit:capability-conformance": "node scripts/run-and-report.mjs --cmd \"pnpm --filter @repo/sanctuary-api exec tsx scripts/capability-conformance.ts\" --name capability-conformance"`

**Interfaces:**
- Consumes: Tasks 1–5 outputs; `lastTouched(paths: string[]): string` (commit date via `git log -1 --format=%cI`).
- Produces: `type GapCode` (the closed set above), `interface ConformanceRow { capability: string; module: string; kind; status; channels; intent: { card?: string; listed: boolean }; symbol: { contract: boolean; docDrift: DocClaim[] }; code: { handler: boolean; policy: boolean | 'n/a' }; practice: { best?: EvidenceRecord; consumers: Consumer[]; channelRuns: Record<ChannelName, boolean> }; gaps: GapCode[] }`, `reconcile(input: ReconcileInput): ConformanceRow[]` (pure; no file system).
- Report: `reports/capability-conformance.json` (rows + counts per gap code) and `.md` (one table, rows grouped by module, then a gap summary, a **tool coverage** section listing each reader with its last measured recall or `unmeasured`, and the AGENTS.md §6 evidence wording for the report's own claims).

- [ ] **Step 1: Failing tests**, one per gap code, each with the smallest input that should raise it and one that shouldn't. Plus Review Focus 1 (rename gives both symbol codes).
- [ ] **Step 2: Run, expect FAIL.** **Step 3: Implement** `reconcile` as joins keyed by capability name; `CODE_NO_POLICY` is `'n/a'` for platform modules (their guard is `security.ts`); `CHANNEL_UNPROVEN` waits for Task 9 records and is computed from them.
- [ ] **Step 4: Run** tests, then `pnpm audit:capability-conformance` on the real tree; expected today: no `SYMBOL_*`/`CODE_*` gaps, `INTENT_*` cleared by Task 2, `PRACTICE_BELOW_BAR` or `CHANNEL_UNPROVEN` on some identity rows. Record the actual output in the commit message, not the expectation.
- [ ] **Step 5: Commit** `feat(conformance): generate the capability conformance report`.

### Task 7: Ratchet and gate

**Files:**
- Modify: `scripts/ratchet.mjs` and `tooling/ratchet.json`: add one metric per gap code, read from `reports/capability-conformance.json`. Read `scripts/ratchet.mjs` first and follow how its existing metrics are measured and updated; no separate ratchet file.
- Modify: `apps/sanctuary-api/scripts/capability-conformance.ts` only if `ratchet.mjs` needs a pure counts export

- [ ] **Step 1: Failing test**: a counts object with one code higher than stored makes `checkRatchet` return that code; lower or equal returns none; `updateRatchet` never raises a stored number.
- [ ] **Step 2–4: Fail, implement, pass**; then `pnpm run ratchet` passes on the real tree.
- [ ] **Step 5: Commit** `chore(conformance): gaps may only fall`.

### Task 8: Prove it holds for n, not one

**Files:**
- Create: `apps/sanctuary-api/src/conformance/__fixtures__/synthetic.ts`, `src/conformance/synthetic.test.ts`

This answers the owner's direction to prove common mechanisms with independent synthetic
capabilities. Nothing here is a product rule; names are `synthetic.*` and never reach the router.

- Fixture: three modules (`synthetic.alpha`, `synthetic.beta`, `synthetic.gamma.deep`, the last three levels deep), six capabilities (3 queries, 3 commands), two channels (`app`, and a fixture-only `bots` opening on two queries), cards for two of three modules, evidence at G1/G2/failed-G3, consumers for four of six.
- [ ] **Step 1: Test** that `reconcile` over the fixture gives exactly the expected gap codes per row (write the expected table in the test), that adding a seventh capability changes only its own row, and that the report for 400 generated capabilities is built in under one second (a regression bound for the morning-scale catalog, not a performance claim).
- [ ] **Step 2–4: Fail, adjust, pass.** **Step 5: Commit** `test(conformance): synthetic n-capability proof`.

### Task 9: Channel conformance suite (practice across channels)

**Depends on:** layer 3 durable operations for the command scenarios (`replayed`, `unknown outcome`); query scenarios can land first.

**Files:**
- Create: `apps/sanctuary-api/src/conformance/channelSuite.ts`, `drivers/app.driver.ts`, `src/__tests__/integration/conformance.app.test.ts`

**Interfaces:**
- Produces: `interface ChannelDriver { channel: ChannelName; call(capability: string, input: unknown, as: TestCaller): Promise<Outcome> ; revoke(as: TestCaller): Promise<void> }`, `type Scenario = 'denied' | 'committed' | 'replayed' | 'revoked' | 'unknown-outcome'`, `scenariosFor(kind): Scenario[]` (queries: `denied`, `committed`, `revoked`; commands: all five), `runConformance(driver, capabilities): EvidenceRecord[]` tagged with the capability and channel.
- The app driver uses the native v1 client over the Node loopback host the existing socket test uses, with real isolated PostgreSQL (G2). Inputs per capability come from a `fixtures` map beside each capability's tests, never from the suite.

- [ ] **Step 1: Failing test**: for every admitted capability with `app` in `channels`, every scenario in `scenariosFor(kind)` runs and passes; a capability without an input fixture fails the suite with its name (no silent skip).
- [ ] **Step 2–4.** **Step 5: Commit** `feat(conformance): one scenario set for every channel`.

### Task 10: Agent action space from the catalog

**Gated:** no channel besides `app` is admitted (owner order 2026-11-06). This task only makes the derivation exist and tests that it is empty for agents today.

**Files:**
- Create: `apps/sanctuary-api/src/conformance/actionSpace.ts`, `actionSpace.test.ts`

**Interfaces:**
- Produces: `actionSpace(channel: ChannelName, rows: ConformanceRow[]): string[]`: capabilities open on that channel, whose channel is admitted, with no `PRACTICE_*` or `CHANNEL_UNPROVEN` gap, queries before commands. Any future MCP or bot adapter lists its tools from this function and nothing else.

- [ ] **Step 1: Test**: `actionSpace('mcp', realRows)` is `[]`; on the synthetic fixture the `bots` channel gets only its proven queries; a command with `assurance: 'fresh-person'` is never returned for an agent channel.
- [ ] **Step 2–4. Step 5: Commit** `feat(conformance): derive each channel's action space`.

### Task 11: Codify

**Files:** `AGENTS.md` (Sovereign Context section, two lines), `docs/architecture/road-to-v1.md` ("Conformance suite, to be built" → link and status), `docs/architecture/channel-admission-model.md` ("Where the code stands": catalog declarations built), `apps/sanctuary-api/docs/architecture/api-engineering-playbook.md` (layer table: link the report for per-capability state; layer status stays hand-written there), `apps/sanctuary-api/docs/current_progress/2026-11-02-foundation-follow-ups.md` (new dated entry).

- [ ] Run `pnpm run check-types`, `pnpm --filter @repo/sanctuary-api test`, `pnpm audit:api-composition`, `pnpm audit:capability-conformance`, `pnpm run ratchet`, `pnpm run check:anti-slop`; record each actual result with its evidence level.
- [ ] `git diff` and the Step 5 delta review from AGENTS.md §4 before committing.
- [ ] Commit `docs: capability conformance in the platform records`.

---

## Order and parallel work

```text
Wave 0 (bedrock):      T0 deps to newest in channel (done)   T0c legacy freeze   T0b rn-terrain recall (separate repo)
Wave 1 (after T0):     T1 catalog+contract   T2 cards (needs T1 types only)   T4 evidence   T5 consumers
Wave 2:                T3 doc tables (T1)    T6 reconciler (T1–T5)
Wave 3:                T7 ratchet (T6)       T8 synthetic proof (T6)
Wave 4 (gated):        T9 channel suite (T6 + layer 3)    T10 action space (T6, T9)
Last:                  T11 codify
```

T0 and T0b share no files and can run at once. T0b gates nothing in this repo, but until it
lands, `rn-terrain affordance` output is not used as grounding; read the `.d.ts` directly.
T4 and T5 touch disjoint files from T1/T2 and can run in separate sessions; T2 waits only for
T1's exported types, which can be agreed up front from the Interfaces block.

## What this does and doesn't prove

When T1–T8 land, the report proves that, for every declared capability, the four layers were
compared mechanically at a named commit, and which gaps remain. It does not prove that a card's
intent is *right* (only a person can), that evidence is sufficient for production (R1 is out of
scope), or that any channel other than `app` behaves correctly. The report must say this in
its own header.

## Implementation record (2026-11-08)

Done: T0, T0c, T0b, T1–T8 (T7 inside the report script). Not started: T9, T10 (gated), and T11
beyond the lines below. Run: `pnpm --filter @repo/sanctuary-api audit:conformance` after the
package's test scripts (they write `reports/evidence/<level>.<run>.json`).

| Evidence | Result |
| --- | --- |
| G1 boundary / Vitest, `@repo/sanctuary-api` | 150/150 (104 before this work); 53 of them are conformance and catalog fitness |
| G2 sockets / Vitest over loopback | 15/15 |
| G1 boundary / Vitest, rn-terrain core | 21 files, 89/89 |
| G0 types | `@repo/sanctuary-api` and rn-terrain core: 0 errors |

Proves: the readers and the reconciler behave as the named tests say, and the report compares the
four layers for the 5 capabilities. Does not prove: anything about `test:database` (G2 with real
PostgreSQL), which was not run in this session because it uses the managed database.

**First report:** 0 symbol, code, document or card-listing gaps. Open: `INTENT_UNCONFIRMED` 5
(cards are drafts), `PRACTICE_NO_EVIDENCE` 3 (`session`, `scopes`, `entry` are covered only by
the database suite), `PRACTICE_BELOW_BAR` 2 (`createInitialBond`, `refreshSnapshot` at G1),
`PRACTICE_NO_CONSUMER` 2 (no client calls `session` or `scopes`; clients use `entry`),
`CHANNEL_UNPROVEN` 5 (T9). Ceilings in `tooling/ratchet.json` → `capabilityGaps`.

**Where the build differed from the plan, and why**

- `authority.refreshSnapshot` is a **command**: `issueSnapshot` upserts `permission_snapshots` and
  `policy_version`. The plan's "changes no stored facts" was wrong; the code decided.
- New gap `INTENT_UNCONFIRMED`: an admitted capability whose card is still a draft.
- Walking an implemented oRPC router returns its *contract*, so a handler check built on the walk
  always passes. `implementedPaths` looks each path up with `getRouter` and requires a `Procedure`.
- Cedar has no action convention for domain capabilities yet, so policy is `unmeasured`, not checked.
- The composition audit is a name-by-name allowlist; the 6 conformance sources and the script are
  admitted by name in `scripts/audit-api-composition.mjs`. Reversible by moving them out of `src/`.
- rn-terrain recall is pinned by its own fixture tests, not by `tooling/ratchet.json`: the ratchet
  would otherwise depend on a local repository CI does not have. Measured recall on real exports:
  `@orpc/contract`, `@orpc/server`, `hono` 1.000; `zod` 1.000 (one CommonJS `module.exports` key);
  `expo-router` 188 names over 12 files, versus 5 before.
- `rn-terrain caps-diff` (declared vs used exports) read names only from a package's main entry, so
  everything imported from a sub-path was invisible. Measured against the import statements in
  `apps/sanctuary-api`: `@orpc/server` 0.73 → 1.00, `hono` 0.56 → 1.00, `@orpc/contract` and
  `@orpc/client` 1.00 (rn-terrain `bbf05acb`). Hono's declared API went from 89 entries, 67 of them
  bare sub-path keys, to 277 names; pattern sub-paths it cannot expand (`./utils/*`) are reported
  as partial coverage. Run on itself it scored 1.00 before and after: rn-terrain imports nothing
  from sub-paths, so a self-test could not have found this.
- The ratchet's `runRgCount` read every `rg` failure as 0. A stray `apps/gurudevi-mobile/NUL`
  folder made `rg` fail under Node since 2026-11-06, so four metrics read 0 and passed. Failures
  now fail the gate, and two hidden regressions show: files over 800 lines 41 > 36, root scripts
  163 > 129. Neither ceiling was raised.
- Two channel vocabularies exist: `security.ts` `ChannelName` (`app`, `mcp`, `webmcp`, `whatsapp`,
  `telegram`, `worker`) and the catalog's channels (`app`, `workers`, `bots`, `mcp`, `partners`,
  `operators`). The catalog's type is named `CatalogChannel` so they don't collide; which one is
  canonical is an owner decision.
- Found in the code while writing the identity card: `identity.createInitialBond` inserts into
  `public.bonds`, which Authority owns, in the onboarding transaction (see the card's open questions).

## Open decisions for the owner

1. ~~`authority.refreshSnapshot`: query or command?~~ Decided by the code on 2026-11-08: command (it writes). Whether it goes through the durable command path is on the authority card.
2. `requiredEvidence` for admitted foundation capabilities: G2 (real host and database) proposed.
3. Should `PRACTICE_NO_CONSUMER` block admission, or only report? Proposed: report only.
4. Platform cards' location: `docs/architecture/domains/platform/<module>.md` proposed.
5. ~~If a live `@repo/core` Hono user breaks on v5~~: decided 2026-11-08. Legacy users are frozen, not repaired; no live user broke.
6. When do legacy removal batches start? Proposed: when `legacyCoreApiImports` from `apps/` reaches 0 for a group of files.
7. Which channel vocabulary is canonical: `security.ts` `ChannelName` or the catalog's channels?
8. Confirm the identity and authority cards (draft → admitted), and their open questions.
9. The stray `apps/gurudevi-mobile/NUL` folder: remove it (it is untracked and empty)?
