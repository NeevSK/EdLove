# Holistic Library Report: The GuruDevi Epistemic Universe

## 1. Overview & Vision
The GuruDevi Library has been refactored from a flat file repository into an **Epistemic Universe**—a graph-based knowledge system. It distinguishes between **Core Content** (AI-generated/Architected) and **Community Content** (User-contributed), interconnected via semantic relationships.

## 2. Technical Architecture

### Database Schema (Supabase)
The system now uses a graph-based model instead of a strict hierarchy:

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| `nodes` | Core knowledge items | `type`, `subjects[]`, `language[]`, `is_community`, `embedding` |
| `edges` | Semantic relationships | `from_node_id`, `to_node_id`, `relationship`, `weight` |
| `tags` | Cross-cutting categories | `name_en`, `name_si`, `name_ta`, `category` |
| `collections` | Grouped nodes (Shards) | `subjects[]`, `is_public`, `creator_id` |

### Key API: `@repo/library`
- **Location**: `packages/library/src/api/library.ts`
- **Capabilities**:
    - **Graph Traversal**: `getMapTopology` and `getResonantKnowledge` explore node connections.
    - **Localized Search**: `searchLibrary` uses `vector(1536)` for semantic matching across si/ta/en.
    - **Community Signals**: `addResource` automatically marks content as `is_community: true` and triggers growth rewards.

## 3. Growth & Reward Integration
The library is now a primary driver for the **GuruDevi Growth Model**:
- **Contribution Points**: Every user upload awards **50 points**.
- **Nature Path Signals**:
    - `resource_uploaded` advances the **River (Nourishing)** path.
    - `resource_verified` or endorsed content advances the **Lotus (Bhumi)** path.
- **Visual SSoT**:
    - **Verified (Silver)**: Curated by staff/Architect.
    - **Community (Blue)**: User-contributed, pending verification but immediately usable.

## 4. Developer Guide: Future Capabilities

### How to Seed AI Data
Follow the [Data Generation Guidance](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Library/data_generation_guidance.md).
1.  **Generate Clusters**: Use LLMs to generate 10-20 related nodes.
2.  **Assign Architect ID**: Set `is_community: false` for system-owned core knowledge.
3.  **Define Edges**: Always link new nodes to existing ones to maintain graph integrity.

### How to Add New Features
- **Validation Loop**: Future work can implement a "Peer Review" system where users earn extra points for verifying community content.
- **Graph Visualizer**: The `getMapTopology` API is ready to drive an interactive 3D/2D knowledge map in the app.

## 5. Practical Usage (SSoT)
- **Adding a Resource**: Use `libraryAPI.addResource(input)`. It handles point awarding in the background.
- **Fetching Core Content**: Use `libraryAPI.getResources({ source: 'core' })`.
- **Filtering by Subject**: Always use the `subjects` array (e.g. `subjects: ['Mindfulness']`).

---
*Created: March 2026 | SSoT for GuruDevi Library Version 2.0*
