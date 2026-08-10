---
title: "Institutional Administration Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, schools, grade-levels, staff-leave, school-registry, parity]
---

# Institutional Administration Batch

## Evidence

- `schools`: 4 rows, all currently `personal_workspace` tenant rows (not four
  active institutional schools). They are retained as development workspace
  data; this batch does not delete or relabel them.
- `school_registry`: 4,584 rows, but this object is a compatibility **VIEW**.
  It selects from the 4,584-row `school_registry_legacy` base table.
- `edu_schools`: 9,962 rows and the canonical current registry base table,
  consistent with the education package's 10,000+ school expectation.
- The registry view is not altered by this migration. `SchoolRegistry` is
  therefore treated as read-only until the canonical `edu_schools` projection
  is modeled and its consumers are reviewed.
- `grade_levels`: currently empty; its live columns and ZModel contract agree
  that section, school, and grade number are required for a usable grade row.
- `staff_leaves`: currently empty; active submission code supplies the modeled
  status/default and creation timestamp.

## Contract decision

- Make the verified base-table school identity field required in Postgres.
- Make grade-level ownership and number required, matching the ZModel model.
- Make staff-leave workflow status and creation timestamp required.
- Keep notifications out of this batch; they have a separate delivery/realtime
  lifecycle and will be reviewed independently.

No institutional table is removed. The old registry source is explicitly
classified as compatibility data, while `edu_schools` is the canonical
registry. A later registry batch must decide whether to model `edu_schools`
directly or keep it as an external/read-only projection.
