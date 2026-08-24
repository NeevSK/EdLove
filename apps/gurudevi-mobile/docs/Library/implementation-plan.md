---
title: "ETL Pipeline: Automated Content Ingestion"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# ETL Pipeline: Automated Content Ingestion

Implementing the "epistemic universe" infrastructure to allow knowledge to flow into Gurudevi from official sources, YouTube, and AI-driven discovery.

## User Review Required

> [!IMPORTANT]
> This pipeline requires **GitHub Actions** secrets (Supabase keys, Anthropic key, YouTube key) and **Cloudinary** for file storage. I will set up the code/SQL, but you will need to eventually add these secrets to your repo.

## Proposed Changes

### 1. Database Layer [NEW]
- **Table**: `staging` - To hold all discovered items before human review.
- **RPC**: `match_nodes` - For semantic similarity check and deduplication.

### 2. ETL Scripts [NEW]
Located in `scripts/etl/`:
- `discovery/`: High-quality scrapers/fetchers (Ministry, YouTube, AI Search).
- `utils/`: Shared Supabase and logging utilities.

### 3. Edge Functions [NEW]
- `enrich-staging`: Automatic tagging and map positioning using AI.
- `publish-resource`: Migrating approved items from staging to production.

## 4. Versatile Library Search [NEW]

Implementing a multi-layered search strategy to make knowledge accessible:

- **Layer 1: Semantic (Vector) Search**: Using Supabase Vector and the `match_nodes` RPC to find resources by "meaning" rather than just keywords.
- **Layer 2: Lexical (FTS) Search**: Implementing PostgreSQL Full-Text Search on `title` and `description` for precise keyword matching.
- **Layer 3: Taxonomy Filters**: Faceted search by `content_type` (book, video, documentary, etc.), `language`, and `target_roles`.

### Types of Resources Planned
- `book`: Digital books, PDFs, EPUBs.
- `video`: YouTube embeds, educational films.
- `documentary`: Long-form thought-provoking films.
- `article`: Research papers, pedagogical blogs.
- `research`: Formal academic studies.
- `guide`: Handbooks, ministry circulars.

## 5. Curator UI (Founder Only) [NEW]

Adding a management layer for the "Librarian" to review staged items:

- **Entry Point**: Visible only to the `founder` role in the Library section.
- **Features**: List all items in `public.staging`, allow editing metadata, and one-tap "Publish" calls the `publish-resource` Edge Function.

## 6. Versatile Map Topology [REVISED]

The Map is a unified spatial discovery interface supporting two primary modes:

- **Mode: Geographic (The Island/World)**: Uses real-world GPS coordinates (`latitude`, `longitude`). Maps schools, charities, and physical entities in Sri Lanka and globally.
- **Mode: Abstract (The Cosmos/Islands)**: Uses Cartesian coordinates (`x`, `y`). Maps knowledge nodes, "Kinnu-like" islands of thought, mind maps, and pathways.

**Technical Changes**:
- **Coordinate Unification**: Resources will have an `is_geographic` flag.
- **Topological Metadata**: Each node can store `parent_id` (for mind maps/pathways) and `island_id` (for grouping knowledge clusters).
- **View Controller**: The `MapScreen` will toggle between a MapBox/GoogleMaps provider (Geographic) and a Skia/SVG canvas (Abstract).

## 7. Unified Map Search [NEW]

Search will now span across both **Resources** and **Map Layers**:

- **Layer Search**: Searching for "Sri Lanka" or "Schools" results in suggesting the "Lankan Schools" layer as a primary result.
- **Node Search**: Results within the current view (geographic or abstract) are highlighted.
- **RPC Update**: The `search_library` function will be extended or a new `search_map_universe` function will be created to perform a UNION or multi-stage search across `library_resources` and `map_layers`.

## 8. Link Reliability & Preservation [NEW]

To defend against "Link Rot" and expiring external resources:

- **Database**: Add `link_status` (working, broken, unknown), `last_checked_at`, and `fail_count` to `library_resources`.
- **UI Reporting**: Add a "Broken Link?" report button to resource previews and details.
- **Status Badges**: Resources with failing links will be flagged for curators in the dashboard.
- **The Gurudevi Vault**: For high-value PDFs and documents (e.g., Freire's book), recommend moving from external URLs to **Supabase Storage** to ensure permanent availability.
- **Health Check**: A lightweight Node.js script to periodically HEAD-request URLs and update status.
