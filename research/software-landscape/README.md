---
title: "Software Landscape Research Catalog"
status: "active"
created: 2026-11-08
updated: 2026-11-08
author: "Codex"
tags: [research, software-landscape, github, provenance, open-source]
---

# Software Landscape Research Catalog

This directory is the tracked, structured working set for the GitHub-first
software discovery. The broader report in `docs/research/` is currently ignored
by the repository; it is useful narrative context, not the durable source of
catalog data.

## Source-of-truth and generated files

- `catalog/*.csv` are the reviewable source records. Keep them normalized so
  repositories, claims, search runs and dated observations can be checked and
  diffed independently.
- `schema.sql` defines the generated SQLite query/index layer.
- `scripts/build_catalog.py` validates and loads the source records into
  `build/catalog.sqlite`, enables WAL, and provides full-text search.
- `scripts/generate_atlas.py` renders a static, filterable HTML view and simple
  category/lane/license-scope summaries and context comparisons at
  `atlas.html` from that database. The generated view is tracked with its source
  records so reviewers can open it without running the catalog build.
- `build/` is disposable local output. The SQLite database is not committed.
- Markdown remains for method, interpretation and decisions. Candidate rows,
  citations and charts will be generated from the structured records as the
  atlas grows.

DuckDB is not a runtime dependency in this first slice. The official
[release calendar](https://duckdb.org/release_calendar) lists 2.0.0 LTS and
plans 2.1 for 2027 H1. DuckDB's [2.0 concurrency model](https://duckdb.org/docs/2.0/connect/concurrency.html)
allows concurrent writer threads in one process; multiple processes reading a
native DuckDB file are read-only unless writes go through the Quack remote
protocol. [SQLite WAL](https://www.sqlite.org/wal.html) allows readers and one
writer to overlap on one host, and does not work over a network filesystem.
This catalog has curated CSV edits and a local generated index, so SQLite WAL
is a simpler fit. Revisit DuckDB if measured analysis expands to large Parquet
snapshots or event histories; do not make catalog writes depend on 2.1.

## Record semantics

The initial import carries claims from an exploratory report. Each is labeled
`report_lead_not_independently_verified`; a GitHub URL is a place to verify the
claim, not itself proof that the claim is correct. Licenses stay scoped to an
upstream repository signal until the exact release, component, bundled assets,
content, model/data terms and dependency notices are reviewed.

Observed stars, forks, archive state, releases and push dates belong in dated
repository observations; never overwrite a historical snapshot with a “current”
number. Search query URLs, timestamps, sort/filter details and missing metadata
belong in `search_queries.csv` and `search_runs.csv`. The initial topic sweep
did not record every per-query sort/count, so the catalog marks those as
unrecorded rather than reconstructing them from memory.

The source files separate discovery leads (`candidates.csv`), their originating
lists/snapshots (`candidate_discovery_sources.csv`), upstream code repositories
(`repositories.csv`), dated discovery-ranking observations
(`discovery_observations.csv`), inspected components (`components.csv`),
source documents (`sources.csv`), claims and confidence (`claims.csv`), and
license attributions by artifact scope (`license_scopes.csv`). Interoperability,
offline/deployment behavior, repository observations, maturity signals and fit
judgments have separate files as well. `context_comparisons.csv` keeps the
independent GitHub baseline distinct from workspace architecture and the
external `E:\edtech` research corpus. Empty files with headers mean that lane
has not yet been assessed; they do not mean the project lacks that capability.
Maturity records describe evidence dimensions such as repository activity, not
a single popularity score. Fit assessments are dated judgments with cited
rationales, not adoption or legal-clearance decisions.

## Build the local catalog

From the repository root:

```powershell
py research/software-landscape/scripts/build_catalog.py
py research/software-landscape/scripts/build_catalog.py --search "Kolibri offline"
py research/software-landscape/scripts/generate_atlas.py
```

The builder uses Python's standard library and SQLite. It validates required
columns and foreign-key relationships before replacing the generated tables.
It does not fetch network data or update the curated CSVs.

## Current record coverage

The baseline import has 45 GitHub-first repository leads and 46 topic queries.
Primary-source review has covered Moodle, Kolibri, Open edX, Frappe Learning,
Oppia Web and its separate Android client, Gibbon, RosarioSIS, OpenEduCat, Frappe
Education, Koha, TutorLoom, WordLink and SchoolOS Backend. The current catalog
has 59 candidates, 61 repositories, 84 sources, 151 claims,
28 components, 67 license-scope rows,
10 deployment claims, 12 fit assessments, 71 search queries,
9 search runs, 82 captured GitHub search-result rows,
36 candidate-to-source mentions, 10 repository observations,
6 dated chart observations and 12 context comparisons.
It has 7 curated-list sources with 29 project mentions, including
cross-list and existing-register overlaps. Mentions and search rank are discovery
provenance, not independent verification.
Eighty baseline
claims remain explicitly unverified; superseded lead rows are retained as
provenance. Verified rows are scoped to the inspected sources and do not imply
release-level legal clearance. These include explicit separate rows for code,
content terms, deployment/offline behavior, interoperability, maturity evidence
and fit judgments; empty assessment files remain honest unknowns.

Moodle's core is PHP with a GPL-3.0-or-later manifest signal. Its official
mobile app is a separate Angular/Ionic/Cordova client with an Apache-2.0 signal.
Kolibri's upstream repository has an MIT signal, while its educational content
has per-resource terms. Kolibri is software with two documented offline modes:
standalone Android for personal use, and a local facility server with LAN
clients for group learning. The facility path has server, content-storage,
network-setup and ongoing operator requirements; an inexpensive Raspberry Pi
option does not make those costs disappear. Both projects' code license signals
still need release-specific, dependency and asset review.

The E-drive comparison flags Moodle's `Conn=Off` coding against both the
project's partial-cache documentation and the E rubric's own `Mix` definition.
For Kolibri, `Conn=Off` can fit no-internet learning after provisioning, with
local LAN still required for facility sync and separate provisioning/update
work. These are comparison notes, not edits to the E-drive dataset.

Only seven topic result counts were recorded in the initial exploration report;
all other counts and sort settings remain explicitly unknown. Repository
observations are dated GitHub snapshots, not adoption or quality evidence.

The first direct GitHub REST search round ran seven capability queries restricted
to TypeScript repositories. It captured each API total separately from up to 12
star-sorted rows per query: 82 repository results in all. The query/result split
is stored in `search_queries.csv` and `search_results.csv`; the result rows keep
GitHub metadata, license field, push date, query rank and source date. Repository
search is metadata-based and first-page-only, so this is a shortlist generator,
not a census or quality ranking.

Primary-source triage produced concrete integration distinctions. TutorLoom is
an API-first LMS with Django/Celery, a React 19 web app and Flutter student app;
its Docker Compose topology includes PostgreSQL and Redis. Its general code
license signal is Apache-2.0, while REUSE marks logo assets as a separate
trademark scope and Flutter-generated files as BSD-3-Clause. WordLink shares
Next.js 16, React 19 and Supabase Auth with the web stack, but is coupled to its
own Prisma/PostgreSQL schema. Its code is MIT; lexical data and model weights
have separate terms. Its short description says the 1.5B model runs offline in
the browser, while the detailed README says the app does not run it yet and
calls an OpenAI-compatible API. SchoolOS Backend documents broad school MIS
endpoints in TypeScript/Node, but its Express/Mongo/custom-JWT architecture does
not match Gurudevi's Hono/oRPC/Supabase/Postgres seams. These are workflow or code
study leads, not direct adoption decisions.

The first file-level reuse review inspected WordLink's learner-memory transition,
FSRS-labelled scheduler, graph types and graph panel, and TutorLoom's Button,
Input, learning-content viewer and frontend manifest. WordLink's memory and
scheduler files are plausible selective algorithm extraction leads because they
have no imports, while its graph panel is tied to Next.js, translations, product
contexts and graph libraries. The FSRS implementation has not been checked
against reference vectors, so its label is not evidence of conformance. WordLink
is a private app without a package boundary. TutorLoom's Apache-marked Button
and Input are source-level separable but hardcode its Tailwind brand and use
`forwardRef`, which Gurudevi's React 19 rules prohibit; its learning viewer
depends on the app Modal and palette. These findings identify code worth
reviewing, not drop-in integrations or completed dependency/license audits.

The school-operations pass found that several products can inform workflows but
are not drop-in React/Next.js modules: Gibbon is a PHP platform whose core is
extended by modules and themes; RosarioSIS is a PHP SIS with a GitHub mirror and
recent v13.0.2 GitLab tag observed on 2026-10-23; OpenEduCat is a set of
Python/Odoo-style modules with LGPL-3.0 manifests; Frappe Education is a
Frappe/ERPNext application with a Vue frontend and GPL V3 notice; Koha is a GPL
library system whose GitHub repository identifies itself as a mirror. License
and stack claims are limited to the inspected README, manifests, or license
files; they are not a complete dependency, edition, or release audit.

The LMS pass reinforces that a React-facing surface does not make an entire
platform reusable in Gurudevi: Open edX is a Python/Django platform with React
micro-frontends and a non-trivial production setup; Frappe Learning is a
Frappe/Python application with a Vue 3 frontend and an AGPL-3.0-or-later
manifest signal. Oppia Web and Oppia Android are distinct codebases with
separate Apache-2.0 repository signals; the Android README makes an offline
learning claim, but this pass did not verify download, update, storage or sync
behavior. These products are useful workflow and architecture references; fit
and integration remain capability-specific assessments.

## Discovery rounds and signal handling

Use repeated funnel rounds instead of treating one giant search as complete:

1. **Broad recall:** GitHub topics and repository search, school/education
   curated lists, ecosystem indexes, and dated GitHub Trending archives. Store
   exact queries, source, date, filters, sort and result-count limitations.
2. **Candidate normalization:** resolve each name to its canonical upstream
   repository, split products from companion clients and libraries, deduplicate
   forks/mirrors, and preserve the originating discovery sources.
3. **Triage:** verify project identity, license signals, stack, activity and
   documentation from the project-maintained repository. Add reasons to defer
   or exclude; popularity alone cannot qualify a project.
4. **Deep review:** prioritize the strongest capability matches for component
   boundaries, mobile/offline behavior, deployment burden, interoperability,
   accessibility, maintainer continuity, and integration fit. Record unknowns
   rather than infer them from marketing language.

“Repo of the day” is not a single official GitHub dataset. GitHub Trending has
no official retrospective API; community archives capture different periods,
timezones, fields and collection schedules. The current sources include a
short-window structured archive and older community archives. Repocharts is a
useful daily historical chart source: it says it stores snapshots and derives
rank history, but it tracks a limited set and ranks by stars/topics. The current
snapshot surfaced freeCodeCamp and Free Programming Books, now candidate leads
rather than approved integrations. Their chart pages report daily tracking
since Nov 5, 2026; the catalog stores the Nov 8 chart values and provenance but
has not audited archive depth. It now stores exact Nov. 6–8 daily star-gain
labels for those two repositories, plus the Nov. 8 chart snapshots. The pages
show a Nov. 5 baseline and inline daily-gain bars; exact earlier total-star
counts and ranks were not imported. This is a very short attention series, not
a quality or fit trend. Trending recurrence or star growth
is an **attention signal** that can help discover
projects, never evidence of quality, educational effectiveness, maintenance,
or fit. Curated “awesome” lists are a complementary **relevance signal**, but
can be stale or mix commercial and open projects. Every lead must be verified
against its own upstream project before it receives product facts or fit claims.

Most license fields are leads only. Verified rows still need release-specific
review and do not cover packages, bundled assets, documentation/content,
datasets, model weights, or dependencies unless explicitly scoped. Fit
decisions should cite verified evidence and explain the target capability and
integration mode; an open license alone does not make a whole product
integratable into the Gurudevi stack.



## Iterative research plan

Run this as successive passes, saving each pass and its query limits so the
catalog can be corrected and extended without treating one search as exhaustive:

1. **Recall pass:** query GitHub topics, repository search, ecosystem indexes,
   awesome lists, and dated Trending/history archives across explicit capability
   lanes (LMS, SIS/ERP, library, community, messaging, wellbeing, mobile/offline,
   AI/workflows). Import list and archive mentions as leads with source/date.
2. **Signal and normalization pass:** deduplicate products, forks and mirrors;
   identify canonical upstreams; capture available dated rank/star histories;
   note missing days and each archive's collection window. Use independent list
   recurrence, sustained activity, release evidence, documentation and stack
   transparency to prioritize review, never as a single quality score.
3. **Verification pass:** check primary repository/docs for identity, license
   scope, architecture, runtime, deployment and project status. Correct or
   supersede leads with citations, keeping uncertainty visible.
4. **Capability deep dives:** review the strongest candidates per lane for
   mobile/low-end and offline behavior, data portability, interoperability,
   accessibility, operations burden, governance and maintainer continuity.
   Compare evidence against Gurudevi's actual Next.js, React Native, Supabase,
   Node/Bun and optional Python seams.
5. **Integration assessment:** classify each item as reusable code/library,
   deployable subsystem, protocol/content source, workflow reference, or
   unsuitable; audit exact component/dependency/content licenses before any
   code is adopted. Revisit priorities as evidence and requirements change.

Seven curated list sources, seven direct GitHub API queries and two short
Repocharts daily series now seed passes 1–2, not an exhaustive GitHub inventory. Longer historical chart ingestion and
coverage audit, more capability-specific lists, and deep reviews for the
community, library, wellbeing, mobile and AI lanes remain open work.
