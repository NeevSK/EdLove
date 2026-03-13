# Library Seed SOP — Completion Notes

## 2026-03-13 Batch Completion
- Added generated migrations:
  - `20260313000004_library_seed_batch_a.sql`
  - `20260313000005_library_seed_batch_b.sql`
  - `20260313000006_library_seed_batch_c.sql`
  - `20260313000007_library_seed_batch_d.sql`
- These migrations add rows `0011..0025` for all 17 library node types (15 each, 255 new nodes).
- Total seeded graph now expands from 170 nodes to **425 nodes**.

## Architecture Reminder
- **List/Search** operate primarily on `public.nodes` (type, title, tags, subjects, visibility, verification).
- **Collections** are curated bundles referencing node IDs; list/search can filter within or across collections.
- **Map view** combines `public.nodes` with semantic `public.edges` to render relationship pathways and cluster exploration.
