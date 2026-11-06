---
title: "Product and Journey Catalog"
status: "active"
created: 2026-10-29
updated: 2026-10-29
author: "Codex"
tags: [product, journeys, requirements, traceability, evidence]
---

# Product and Journey Catalog

PJC connects product intent, behavior, technical authorities, implementation and verification. Its canonical source is the manifest `packages/core/src/flows/pjc/catalog.v2.json` and the feature modules it names in the same directory, checked by `hierarchy.ts`. Each module contains one feature and its owned intents and journeys. The loader rejects duplicate, missing, malformed and escaping module references; the assembled catalog is validated together so shared references can cross modules. Version 1 and mixed-format inputs are rejected; there is no runtime legacy adapter. Application FlowDAGs remain separate and are not removed by the catalog cutover.

## Structure and ownership

The hierarchy is feature → actor intent → journey. A feature has multiple intents and an intent has multiple journeys. A journey owns its situation, outcome, context, preconditions, brownfield development context, steps, transitions, requirements, bindings, scenarios and evidence. Steps describe interactions; transitions describe actions and feedback. Scenario transition arrays describe ordered paths, including retry loops; the order of steps alone is not an execution path. A scenario starts at the journey entry unless it declares a different `start` step and at least one `preconditions` statement. The first transition must start there; every step still has to be reachable in the journey graph. A scenario ending at a nonterminal step must declare `completion: "checkpoint"` and explain why it stops there; otherwise it represents an outcome and must end at a terminal step.

`sharedIntents`, `sharedJourneys`, `sharedRequirements` and `sharedBindings` reference existing records without duplicating them. IDs are globally unique, namespaced by record kind, and independent of display names. Record `links` are explicit catalog IDs. Schema, API, authentication, Cedar authorization, tenancy, privacy, offline behavior and architecture belong in journey bindings to their existing authorities; a link does not replace or enforce those authorities. Record source observations, user rules, proposals and verified behavior distinctly. Feature lifecycle and priorities are independent of implementation status and evidence.

The optional journey `planning` object records maturity, implementation and verification independently, with optional priority and target date. Missing planning is reported as a gap rather than guessed. Binding categories distinguish authentication, authorization, tenancy, privacy, state, failure, offline, feature flags and entitlements in addition to platform and technical sources. Roadmap references are links, not issue-tracker replacements.

For TypeScript consumers, `@repo/core/flows/pjc` exposes the platform-neutral hierarchy schema, validation and journey projection. The manifest loader uses Node filesystem APIs and remains separate from that entry point; browser or native code should supply data through its own appropriate boundary.

Journey-owned `impacts` and `platformDifferences` give impact and platform analysis stable IDs, statements, provenance and catalog links. Platform records identify web, mobile, shared, tooling or other contexts. Use `list --kind impact` or `list --kind platform --platform web`, and trace IDs to their journey and sources. For brownfield and mixed journeys, `check` reports missing records as gaps. These declarations do not establish that the analysis is exhaustive or correct.

Journey-owned `observations` record statements with stable IDs, an origin (`user`, `source`, `proposal` or `verified`), and links to catalog authorities. `list --kind observation` and `trace` make them discoverable. `check` reports missing observations for brownfield and mixed journeys; the origin and a source link are declarations, not independent verification.

Use `list --origin source` (or `user`, `proposal`, `verified`) to filter provenance-bearing records. This filter matches declared origin; it does not assess whether a source observation or verified claim is accurate.

Requirements may be classified as `product`, `functional`, `quality` or `constraint`, independently of their origin and evidence. Use `list --kind requirement --requirement-type functional` to query them. Missing classifications are reported as gaps; classification does not replace the linked product, technical or architectural authority.

## Authoring and maintenance

The feature owner is recorded in `lifecycle.owner` and is responsible for keeping its records and decisions current. Git history versions both the records and this guide. Changing a title or moving a record in the module must not change its ID. IDs use the record kind followed by a colon and lowercase letters or digits separated by `.`, `_`, or `-`, for example `journey:pjc.query` or `scenario:school.accept`. The supported kinds are `feature`, `intent`, `journey`, `step`, `transition`, `requirement`, `binding`, `impact`, `observation`, `platform`, `scenario`, and `evidence`; IDs are unique across the assembled catalog.

To add or change a journey:

1. Query the existing feature and its intents first. Determine the actor's situation and desired outcome, existing behavior, relevant authorities and unresolved decisions. Select `greenfield`, `brownfield`, or `mixed` for the actual development context.
2. Edit the owning feature's JSON module. For a new feature, create one JSON feature object in the catalog directory and add its filename to `catalog.v2.json`. Module names are lowercase JSON filenames; do not use paths or duplicate names. Authoring is a file edit, not a CLI mutation command.
3. Add or update the intent and its journeys. For each journey, declare its entry step, interactions, terminal step, transitions with actions and feedback, and scenario paths as ordered transition IDs. Model retries as transitions; do not assume array order defines a path. Record source, user, proposal or verified origins on requirements.
4. Link journey requirements to existing contracts and implementation bindings. Use shared references when another journey owns the same authority; keep the underlying schema, policy or architecture document authoritative. Give planned or unknown bindings an honest status and note. Do not encode a claim of working behavior from a file path.
5. Run `check`, inspect the journey in both JSON and a readable format, trace the changed bindings back to intent, and run tests appropriate to the real change. Record evidence against the relevant scenario with its actual revision, environment, tier, result, substitutions and limitations. Leave unanswered questions and gaps visible.

For a concrete example, inspect `journey:pjc.query` and `journey:pjc.validate`: they belong to different intents, have their own steps and scenarios, and refer to the common CLI binding and truthfulness requirement. These records describe coverage of the catalog system itself; they do not establish coverage of an application feature.

Update the relevant journey and evidence when behavior, a source contract, or a decision changes. Re-run checks after moving or renaming a bound source file. Keep issue and roadmap links as references, not a second issue tracker. For an incompatible record-format change, increment the supported schema version, update the manifest, modules, loader, validation, CLI, tests, guide and skill together, and explicitly decide the migration policy. Version 2 intentionally rejects version 1 input. Optional additive version 2 fields remain visible as gaps when missing rather than silently claiming analysis exists.

## CLI

From the repository root:

```powershell
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts list --kind intent
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts tree feature:pjc.catalog --format text
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts tree feature:admin.school_connection --depth paths --format markdown
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts journey journey:api.execute --format text
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts inspect feature:pjc.catalog --view expanded
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts trace binding:pjc.cli
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts check --revision <git-commit>
pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts check --journey journey:school.accept_invitation
```

The core package's typecheck excludes the root CLI. Check the CLI and its catalog imports explicitly with:

```powershell
pnpm exec tsc --ignoreConfig --noEmit --strict --noUncheckedIndexedAccess --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler --types node scripts/pjc.ts
```

The core Vitest configuration includes `src/flows/pjc/*.test.ts` in its normal suite. To run the catalog checks directly from the repository root, including CLI subprocess fixtures, use:

```powershell
pnpm --filter @repo/core exec vitest run src/flows/pjc --cache=false --testTimeout=30000
```

These are G1 catalog and CLI checks using isolated fixture catalogs where appropriate. They do not prove linked application, device or production behavior.

JSON is the default; `--format text` and `--format markdown` generate readable views. `--file` accepts an isolated version 2 JSON catalog. `list` filters with `--kind`, `--query`, `--actor` and `--status`; `trace` accepts an ID or binding path. `journey` shows the owner, all journey details, explicitly shared authorities, and each scenario's ordered transitions with their source and destination steps. These are declarations, not execution evidence. `check` validates the hierarchy, references, transitions and scenario continuity and reports gaps, file presence and evidence freshness. Static web route checks are supported; other route formats are unverifiable. No filename, route, binding status or test link proves behavior.

`tree` defaults to feature, intent and journey summaries. `--depth paths` adds each journey's entry, steps, transitions and scenario sequences beneath the owning or sharing intent. Transition sequences are declared paths, not evidence that they were executed.

Place an optional or required record ID immediately after the command, before options. Unknown, repeated, missing-value or command-inappropriate options and invalid choice values exit with code 2 and an error on stderr. Invalid catalog data exits with code 1; a valid catalog with gaps still exits successfully.

`list` also accepts `--maturity`, `--implementation`, `--verification`, `--priority` and `--context`. They can be combined: maturity and priority match journey planning or feature lifecycle, implementation and verification match journey planning, and context matches journeys. An undeclared planning field does not match a filter. The older `--status` filter applies to binding status or feature maturity; use the separate planning filters for journey status.

Use `--target-after YYYY-MM-DD` and `--target-before YYYY-MM-DD` to filter feature lifecycle or journey planning target dates, including the boundary dates. Records without a target date do not match; malformed dates and reversed ranges are errors.
List and minimal inspection results include declared feature lifecycle and journey planning values when present, so filtered results retain their maturity, priority, target date and status context.
Compact binding results include their category, declared status, reference, route, verification revision and note when present. Use `check` for separate file-presence, route and revision comparisons; the binding declaration itself does not prove functionality.

`--query` performs a case-insensitive substring match across a record's own values, including statements, feedback, references and development context. Owned child records are searched as separate records, so a child's text does not by itself make its parent a match. Use `trace` or `journey` to follow the resulting relationships.

In a journey's expanded scenario paths, requirements and bindings are resolved from explicit links on the scenario or its included transitions, reverse links to those records, and bindings linked in either direction to the scenario's requirements. Evidence is selected by its scenario ID. An empty scenario-specific list means no such relationship was declared; journey-wide authorities still appear separately. A test-file binding does not become evidence merely by being linked.

`check` reports missing scenario-specific requirement and binding links as gaps, even when the journey has authorities elsewhere. Link the scenario where that relationship is intended; do not add a link merely to suppress a gap.

Implementation-binding gaps are distinct from absent links: test, documentation, architecture and roadmap bindings do not count as implementation-category bindings. A binding in an implementation category remains a declaration, even when its file exists.

`--actor` matches intent actor descriptions and scopes results to their features, owned or explicitly shared journeys, journey-owned records and directly resolved shared requirements and bindings. These are catalog associations, not authorization decisions. Combine it with `--kind journey` to find an actor's journeys.

`inspect` defaults to a compact projection; for a journey it includes the actor intent, situation, outcome, steps, transitions with feedback and scenario paths. Step order alone does not define a path: scenarios identify ordered transitions. `--view expanded` includes the record and its links; for a journey it also resolves shared requirements, bindings and scenario paths. `journey` provides the same journey context without the general trace. Markdown is generated from those same records and should be regenerated when needed, not maintained separately. A successful `check` exit means the catalog is structurally valid; it can still return gaps. A missing file is `missing`, an absent reference is `unknown`, a reference outside the supported checks is `unverifiable`, and a present file or static route is `present_unverified`. Evidence without a selected revision is unverifiable; evidence for another revision is stale. The report does not independently execute or verify evidence.

Binding file checks are limited to repository-relative paths whose existing ancestors resolve within the repository. URLs, absolute paths, paths escaping the repository and paths whose location cannot be resolved are `unverifiable`; the CLI does not fetch remote sources. A present path only establishes presence at check time.

`check --journey ID` validates the complete catalog first, then reports that journey's gaps, scenarios and resolved shared authorities. Unregistered-module gaps remain visible because they concern the catalog as a whole. An unknown journey returns an error rather than an empty report.

A binding may record `verifiedRevision` alongside a `verified` status. With `check --revision`, its separate `freshness` is `stale` when revisions differ, `current_declared` when they match, and `unverifiable` when either revision is absent. Other binding statuses have `not_declared` freshness. This is a comparison of declarations, not verification of the binding or evidence; file presence and route checks remain separate results.

When checking a module manifest, `check` reports a gap for an unlisted JSON file in the same directory if it parses as an object with a `feature:` ID. This discovery is deliberately limited: malformed, unrelated or nested files are not identified as feature modules. Register an intended feature in the manifest and rerun validation; the CLI does not add it automatically.

Trace `outgoing` lists direct references, `incoming` lists records that reference or are owned by the selected record, and `parent` identifies its owner. `related` is the full connected component, so it can include sibling journeys reached through a shared feature or authority. `connectionPaths` shows one shortest undirected parent/reference path to each related record; it explains the connection but does not claim every related record belongs to the selected journey. For the journey's own steps, scenarios and shared authorities, use `journey`.

## Evidence and operation

Evidence identifies the scenario, revision, environment, tier, result, substitutions and limitations. Higher tiers do not fill missing lower tiers. A declared pass is not independent proof; stale and unverifiable revisions are reported separately. Not-applicable evidence requires rationale, owner acceptance and alternate evidence. The CLI includes such a declaration in its contiguous declared levels only when its referenced alternate evidence declares a pass for the selected revision. It cannot judge whether the rationale or alternative covers the risk; the declaration still requires review. Follow [production evidence governance](production-evidence-governance.md) for promotion decisions.

Each reported tier includes its evidence record IDs, revisions, environments, results, substitutions, limitations and references. A contiguous declared level is an index of declarations at the requested revision, not a determination that evidence from different environments or substitutions is applicable together. Review the individual records and the governing promotion decision before claiming assurance.

When current-revision evidence at one tier has different results, the tier is `conflicting` and declared progression stops there. The individual records remain available for review; the CLI does not decide which environment or result should take precedence.

Recorded tiers that are stale, unverifiable, failed, blocked, conflicting or otherwise incomplete also appear in `gaps`. Missing tiers remain visible in the evidence table; their applicability requires review.

The separate `scripts/audit-flow-dag.mjs` inventories web and mobile route files and scans domain source for flow declarations. It emits route samples and counts; its empty `findings` array does not establish journey coverage, route correctness, or runtime behavior. Running it writes `reports/flow-dag-audit.json`, so inspect the existing report before running it and preserve user changes. The PJC `check` command validates catalog declarations independently and does not run that inventory.

Use the PJC and brownfield skills to discover existing behavior and authority, author the feature, intent and journey, connect each requirement and technical authority to that journey, implement the authorized scope, then record observations and remaining gaps. Validate the catalog and run the appropriate real boundary and platform checks. The catalog is not an authorization engine, issue tracker or runtime verifier.

The version 2 records include the catalog itself, the principal and teacher first-workspace pilots, school invitation, and API-foundation records. Their implementation and evidence gaps remain visible; their presence is not feature parity. Historical context remains in the [role-journey catalog plan](2026-10-26-role-journey-and-feature-catalog-master-plan.md), [journey architecture](2026-10-28-canonical-user-journey-and-screen-state-machine-architecture.md), and [principal pilot draft](../../apps/gurudevi-web/docs/current_progress/2026-10-29-principal-first-school-journey-model.md).
