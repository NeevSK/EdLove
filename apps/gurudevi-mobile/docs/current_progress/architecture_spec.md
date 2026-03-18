# Architectural Specification: Temporal Resonance Architecture (TRA) v1.1
## Status: APPROVED | Senior Developer Implementation Guide

## 1. Vision & Philosophy
The **Temporal Resonance Architecture (TRA)** shifts the platform's data paradigm from "Static State" to "Vibrational Continuity." Instead of seeing a user's data as a series of disconnected snapshots, the TRA treats every data point as a "Resonance" that exists across a temporal field (Past, Present, and Multiple Future Potentials).

### The "Woah" Principle
The UI must reflect the technical depth of the TRA. Shifting time is not a simple data fetch; it is a visual "Resonance Shift."
- **Chromatic Shift**: Past data moves toward "Twilight/Sepia" or "Cold Glass"; Future data glows with "Saffron" or "Auroral Pulse."
- **Temporal Blur**: Elements further from the "Now" focus should have a subtle backdrop-blur (Sanctuary Glass Protocol) to signify their distance in the resonance field.

---

## 2. Universal Resonance Patterns
Resonance is not uniform; it manifests differently based on the observer's role within the ecosystem.

### A. Student: The River & Crystal (Growth)
- **Metaphor**: A flowing river that deposits crystals of knowledge.
- **Resonance Signals**: Mood logs, journal entries, and path advancements (River Stage, Crystal Tier).
- **Temporal View**: Focuses on "The Journey" — a linear but rich path of personal evolution and discovery.

### B. Teacher: The Banyan & Ripple (Impact)
- **Metaphor**: The Banyan tree (Vata Vriksha) whose roots become new trunks.
- **Resonance Signals**: Student feedback loops (Ripples), peer mentorship logs (Roots), and classroom atmosphere snapshots.
- **Temporal View**: Focuses on "Influence" — seeing how their presence on Day X created a ripple effect in Student Y on Day Z.

### C. Principal: The Pulse & Vital Signs (Leadership)
- **Metaphor**: The heartbeat of the school ecosystem.
- **Resonance Signals**: Aggregated school-wide wellbeing, energy forecasts, and strategic decision logs.
- **Temporal View**: Focuses on "Continuity" — identifying rhythmic patterns in school energy and predicting future resource needs.

### D. Founder: The Flow & Alignment (Ecology)
- **Metaphor**: The planetary perspective of a flourishing educational colony.
- **Resonance Signals**: Ecosystem-wide wisdom logs, governance history, and global alignment metrics.
- **Temporal View**: Focuses on "Evolution" — the multi-decade arc of the entire platform's intentional growth.

---

## 3. Implementation Protocol: DTM & Proxy
To ensure extreme scalability (handling "Infinite Data" for even a single user over decades), we use **Decentralized Temporal Mirrors (DTM)**.

### Decentralized Temporal Mirrors (DTM)
Every active table (e.g., `mood_logs`) has a corresponding history mirror (e.g., `mood_logs_history`). 
- **Atomic Operations**: Only the "Now" table is touched for writes.
- **Mirroring**: PostgreSQL triggers automatically bridge data to history tables with `valid_from` and `valid_to` timestamps.
- **Infinite Journey**: Older data partitions are moved to cold storage without breaking the "Journey" UI.

### The Resonance Proxy
A middleware layer that wraps standard Supabase logic:
1. **Context Injection**: Automatically applies `valid_from <= resonanceDate` filters.
2. **Ghost Seeding**: Interpolates "Placeholder Resonance" if a user has gaps in their data, ensuring the timeline stays alive even during periods of inactivity.
3. **Shielding**: Prevents destructive mutations when the user's `viewMode` is set to `Past`.

---

## 4. Visual Protocol (Sanctuary Saffron)
The "Woah" factor is implemented through the `ResonanceProvider`:
- **CSS Variable Injection**: Dynamically updates `--resonance-blur`, `--resonance-tint`, and `--resonance-glow` based on the temporal state.
- **Motion Blur**: Rapidly scrolling through time triggers a `TemporalFocus` state where the UI enters a high-blur/high-motion state until the user settles on a date.

---

## 5. Journey History & Holistic Views
To prevent "Disjointed Snapshots," the TRA implements a core aggregation layer.

### A. Role-Based Aggregation
History is not just a chronological list; it's a filtered stream based on the active role context:
- **Teacher**: Personal (Mood/Journal) + Impact (Ripples) + Professional (Mentorship).
- **Principal**: Strategic (School Pulse) + Decision History + Resource Flux.
- **Founder**: Global (Ecology Flow) + Governance Ledger + Wisdom Logs.

### B. Holistic Scales
The `useJourneyHistory` hook provides data at four distinct resolutions, allowing users to shift perspectives:
1. **Daily**: Spotlight on specific events and precise timestamps.
2. **Weekly**: Identify rhythmic patterns and "Flow" states.
3. **Monthly**: Milestone tracking and long-term trend analysis.
4. **Yearly**: High-level narrative of growth and evolution.

### C. Manual Mirroring (Snapshots)
Beyond automatic mirroring, users can explicitly "Snapshot" a moment. 
- **Trigger**: A "Snapshot This Moment" action in the UI.
- **Persistence**: Saved to `snapshot_moments` with a custom label and temporal deep-link.
- **Benefit**: Creates a user-curated "Signature Journey" that persists even if underlying data is archived.

### D. Implementation Guideline
- Always use `useJourneyHistory` for multi-feature aggregation.
- Use `useManualSnapshot` for explicit mirroring events.
- The UI should use `JourneyHistoryCard` to maintain visual consistency (Sanctuary Glass/Saffron).
- All historical interactions must be "Read-Only" (shielded by `ResonanceShield`).

## 6. Scalability & Performance (Temporal Data)

As the system scales to millions of users and years of daily data, the following strategies ensure architectural integrity and high performance:

### 6.1. Data Tiering
- **Active Layer**: Raw event data (moods, journals, growth) for the current year. Accessible for full CRUD.
- **Resonance Layer (Summaries)**: Pre-computed daily, weekly, and monthly aggregations stored in a `temporal_summaries` table. This prevents expensive runtime joins.
- **Snapshot Layer**: User-curated `snapshot_moments`. These are permanent landmarks and should never be archived.

### 6.2. Query Optimization
- **Materialized Views**: Use Postgres Materialized Views for yearly trend analysis.
- **Partitioning**: Feature tables (e.g., `mood_logs`) should be natively partitioned by `created_at` (yearly ranges).
- **Index Strategy**: Every temporal table must index on `(user_id, resonance_date)` to support the TRA "Zoom" capability.

### 6.3. Holistic Aggregation Logic
Instead of fetching all raw records for a "Yearly" view:
1. Query `temporal_summaries` for high-level patterns.
2. Only fetch raw `snapshot_moments` for specific localized detail.
3. This reduces payload size from megabytes to kilobytes for long-term views.

## 7. User Delight & Future Intersections

To move from "Feature History" to a "Journey of Growth", the following "Delighters" bridge the gap between technical data and human experience:

### 7.1. The Resonant Pulse (Discovery)
In the `TemporalNavigator`, dates that contain a **Manual Snapshot** should have a visual "Pulse" (glow or saffron dot). 
- **User Value**: Instead of sliding through empty days, the user is pulled towards their "Landmarks".
- **Implementation**: Fetch `snapshot_moments` counts for the current view range and overlay on the navigator.

### 7.2. Cross-Role Pulse Correlation (Principal Focus)
For roles like the **Principal**, personal history should correlate with **School Pulse**.
- **The Delighter**: A "Dual Timeline" view where a Principal can see their personal energy (`useJourneyHistory`) alongside the collective school resonance.
- **Insight**: "When my energy was low on Tuesday, why did the school's impact ripple increase?"

### 7.3. The Resonant Heatmap (The Zoom Arc)
The "Yearly" scale transitions from a list to a **Heatmap**.
- **Visuals**: A 52-week grid (GitHub style but using Sanctuary Saffron intensity).
- **Interactivity**: Tapping a "hot" cell zooms the user into that specific "Week" view.

### 7.4. Future Resonance (Predictive Continuity)
History shouldn't just look back. It should project forward.
- **Pattern Matching**: "You typically have a resonance peak every Thurs morning (based on 3 months of history). Shall we schedule your 'Future Focus' then?"
