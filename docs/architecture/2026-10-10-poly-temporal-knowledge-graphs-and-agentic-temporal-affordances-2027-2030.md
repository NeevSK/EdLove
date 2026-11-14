---
title: "Poly-Temporal Knowledge Graphs & Agentic Temporal Affordances (2027-2030)"
status: "active"
created: 2026-10-10
author: "Naween & Antigravity"
tags: [architecture, temporal-graphs, bitemporal, agents, rag, civic-data, 2027-2030]
---

# Poly-Temporal Knowledge Graphs & Agentic Temporal Affordances (2027–2030)

> **EXECUTIVE SUMMARY:**  
> Static vector search and traditional relational databases assume a timeless universe. When an autonomous AI agent queries a knowledge base without strict temporal coordinates, it suffers from **catastrophic temporal contamination**—mixing facts from 1989, 2015, and 2024 into a single hallucinated present.  
> This specification codifies the mathematical, database, and agentic primitives of **Poly-Temporal Knowledge Graphs (PTKGs)**. Grounded in the intuitive breakthrough of **Temporal Sliding Convolutions**, this document details how modern engines (SQLite, DuckDB, XTDB, Dolt) model time across three non-negotiable axes ($T_{\text{valid}}$, $T_{\text{doc}}$, $T_{\text{obs}}$) and outlines the agentic memory architecture required for autonomous reasoning systems facing 2027–2030.

---

## 1. The Epistemic Breakthrough: The Temporal Convolution Analogy

### The Intuitive Insight
In convolutional neural networks (CNNs), a 1D filter (kernel) of size $k$ slides across a continuous input signal, computing localized receptive fields:

$$(f * g)(t) = \int_{-\infty}^{\infty} f(\tau) g(t - \tau) d\tau$$

When applied to civic governance, macroeconomics, and education:
* **The Input Signal $S(t)$** is the continuous stream of raw evidence: legal gazettes, ministerial circulars, news articles, exam results, and court decrees.
* **The Sliding Kernel $K(\Delta t)$** is a temporal window of width $\Delta t$ (e.g., 7 days, 1 month, 1 legislative term) sliding along the historical timeline.
* **The Receptive Field** captures all entities, state transitions, and public statements active within that specific window, without leaking future facts into the past.

```
Time Axis (t) ────────────────────────────────────────────────────────────────────────►
Events Stream: [E1]    [E2]        [E3]   [E4]      [E5]          [E6]     [E7]
                      ┌──────────────────────┐
Sliding Kernel K(t):  │ Window: [t - Δt, t]  │  ──► Shifts forward (strided or continuous)
                      └──────────────────────┘
                      Receptive Field: {E2, E3, E4}
```

### Why Timeless Vector RAG Fails for Agents
Conventional RAG (Retrieval-Augmented Generation) computes cosine similarity between a user query vector $\vec{q}$ and chunk vectors $\vec{c}_i$:

$$\text{score} = \frac{\vec{q} \cdot \vec{c}_i}{\|\vec{q}\| \|\vec{c}_i\|}$$

Because semantic embeddings encode **meaning**, not **time**, a query like *"Who regulates private degree-awarding institutions in Sri Lanka?"* retrieves:
1. A 1978 Universities Act excerpt (prior to degree-awarding orders),
2. A 2011 ruling granting approval,
3. A 2024 gazette rescinding or updating regulations.

Without a temporal filter, the agent merges these three conflicting states into a single contradictory hallucination. **Time is not a metadata tag; time is the primary coordinate axis of truth.**

---

## 2. The Tripartite Coordinate System: Modeling Time Honestly

In real-world institutional and civic history, a single timestamp `created_at` is a fatal distortion. Truth exists across **three distinct temporal axes**:

| Dimension | Formal Name | Meaning in Civic & Knowledge Systems | Example |
| :--- | :--- | :--- | :--- |
| **$T_{\text{valid}}$** | **Valid / Occurred Time** | The real-world interval $[t_{\text{start}}, t_{\text{end}}]$ during which the fact was true in the physical world. | Dr. Nimal Sanderatne chaired Bank of Ceylon from `1987-01-01` to `1992-12-31`. |
| **$T_{\text{doc}}$** | **Documented / Assertion Time** | The timestamp on the physical or legal medium claiming the fact. | Gazette Extra No. 2368/18 was printed on `2024-01-23`. |
| **$T_{\text{obs}}$** | **Observed / Transaction Time** | The immutable instant the recording system (crawler, AI agent) ingested the assertion. | Our scraper crawled the LDF storage repository on `2026-10-10 08:07:15`. |

```
Physical Event Occurred         Document Printed & Signed       System Discovered & Ingested
         │                                  │                                  │
         ▼                                  ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│  T_valid (Start) │ ────────────► │      T_doc       │ ────────────► │      T_obs       │
│   [1987-01-01]   │               │   [1987-11-14]   │               │   [2026-10-10]   │
└──────────────────┘               └──────────────────┘               └──────────────────┘
```

### Allen's Interval Algebra in Civic Graphs
Temporal relationships between entities and instruments are rarely single points; they are intervals. Allen (1983) established the 13 canonical relations between two intervals $A$ and $B$:

$$\text{Relations}(A, B) \in \{\text{before}, \text{meets}, \text{overlaps}, \text{starts}, \text{during}, \text{finishes}, \text{equals}, \text{and their 6 inverses}\}$$

* **Example (Institutional Succession):** Term $A$ *meets* Term $B$ (Secretary of Education transfers power without a vacancy).
* **Example (Regulatory Override):** Gazette $A$ *finishes* Gazette $B$ (A new service minute repeals an earlier regulation at the exact moment of publication).

---

## 3. Database Engines & Temporal Affordances Matrix (2026–2030)

| Database / Technology | Temporal Paradigm | Primary Affordance | Performance Profile | Fit for Zero-Cost Stack |
| :--- | :--- | :--- | :--- | :--- |
| **SQLite (Local WAL + Interval Indices)** | Composite B-Tree / `rtree` intervals | Zero-dependency, sub-10ms point-in-time filtering, embedded in every process. | Millions of rows in <50MB RAM. | **Tier 1 (Default Monorepo Spine)** |
| **DuckDB** | Columnar vector execution + Native **`ASOF JOIN`** | Blazing chronological joins between event streams and sensor/news feeds without subqueries. | Sub-millisecond scans over 100M rows; zero-copy Parquet reads. | **Tier 1 (Analytical & Batch Engine)** |
| **XTDB v2** | Native Bitemporal Datalog & Columnar Storage | Pure time-travel engine. Every record stores valid-time and tx-time intervals natively. | High throughput, Datalog reasoning, higher memory footprint (JVM/Rust). | **Tier 2 (Enterprise / Cloud Scale)** |
| **Dolt** | Relational Git Engine | Branch-level database versioning. Full cell-level diffs, merge conflict resolution, `AS OF` SQL syntax. | Slightly higher write latency due to Merkle DAG hashing; unmatched auditability. | **Tier 2 (Crowdsourced Civic Data)** |
| **LanceDB / Qdrant** | Vector Search + Temporal Payload Partitioning | Hybrid vector search constrained by strict timestamp filters ($T_{\text{valid}} \in [t_1, t_2]$). | Sub-20ms ANN search with scalar pre-filtering. | **Tier 1 (Embeddings & Semantic Search)** |

### The Power of DuckDB's `ASOF JOIN`
DuckDB provides the industry-leading mathematical implementation of As-Of matching. Instead of expensive subqueries finding the closest prior record:

```sql
-- Join every news report with the active gazette in effect at that exact moment
SELECT 
    n.article_title,
    n.published_at,
    g.gazette_number,
    g.regulation_text
FROM news_stream n
ASOF JOIN active_gazettes g
  ON n.regulatory_domain = g.domain
 AND n.published_at >= g.effective_from_date;
```
This executes via a single linear scan of sorted indices in $O(N + M)$ time instead of $O(N \times M)$.

---

## 4. The Monorepo Implementation: The 4D Knowledge Mesh Schema

The schema currently active in `data/education-atlas/atlas_staging.db` establishes this multi-temporal coordinate system:

```sql
-- 1. Entities: Persistent Identity across Time
CREATE TABLE IF NOT EXISTS entities (
    entity_id TEXT PRIMARY KEY,          -- 'person:nimal_sanderatne', 'inst:nie_lk'
    entity_type TEXT NOT NULL,           -- 'person', 'institution', 'regulatory_body', 'curriculum'
    canonical_name TEXT NOT NULL,
    canonical_name_si TEXT,
    canonical_name_ta TEXT,
    sector TEXT,                         -- 'state_education', 'civic_research', 'monetary_policy'
    aliases_json TEXT,                   -- '["MOE", "Ministry of Education"]'
    metadata_json TEXT,                  -- Unstructured institutional traits
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Temporal Connections: Interval Edges with Multi-Temporal Coordinates
CREATE TABLE IF NOT EXISTS temporal_connections (
    connection_id TEXT PRIMARY KEY,
    subject_entity_id TEXT NOT NULL REFERENCES entities(entity_id),
    predicate TEXT NOT NULL,            -- 'chaired', 'minister_of', 'mandated', 'affiliated_with'
    object_entity_id TEXT NOT NULL REFERENCES entities(entity_id),
    
    -- DIMENSION 1: OCCURRED / VALID TIME
    valid_from TEXT,                    -- ISO8601 '1987-01-01'
    valid_to TEXT,                      -- ISO8601 '1992-12-31' (NULL = Ongoing)
    
    -- DIMENSION 2: DOCUMENTED TIME
    documented_at TEXT,                 -- ISO8601 '1988-01-15'
    document_ref_id TEXT,               -- Foreign key to resources(resource_id)
    
    -- DIMENSION 3: OBSERVED TIME
    observed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    confidence REAL DEFAULT 1.0,        -- Epistemic certainty score [0.0 - 1.0]
    source_citation TEXT,               -- Human-readable provenance citation
    notes TEXT
);

-- Fast Temporal Interval Indices
CREATE INDEX IF NOT EXISTS idx_temp_conn_subject ON temporal_connections(subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_temp_conn_object ON temporal_connections(object_entity_id);
CREATE INDEX IF NOT EXISTS idx_temp_conn_timeline ON temporal_connections(valid_from, valid_to);
```

---

## 5. Agentic AI Era (2027–2030): Causal Safety & Episodic Memory

When autonomous agents plan, reason, and act across long horizons, temporal graphs provide the foundational guardrails against cognitive decay:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AUTONOMOUS AGENT REASONING CORE                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     CAUSAL LOOKAHEAD PREVENTION      │  │     SLIDING EPISODIC RECEPTOR     │
│  Constraint: System time must be     │  │  Kernel: slides Δt window over    │
│  pinned to query time T_query.       │  │  entity timelines to generate     │
│  P(State | Evidence <= T_query)      │  │  continuous narrative summaries.  │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

### 1. Causal Lookahead Prevention (Anti-Hindsight Bias)
In backtesting, forecasting, or legal historical inquiry, an agent must **never** be allowed to access knowledge documented after the target query date:

$$\mathcal{K}_{\text{accessible}}(t) = \{ (s, p, o) \mid t_{\text{documented}} \le t \land t_{\text{observed}} \le t \}$$

By pinning the query engine to `WHERE documented_at <= :query_date`, the agent reasons exactly as a human decision-maker would have reasoned at that historical moment.

### 2. Temporal Graph Traversal (Chrono-Pathing)
Standard BFS/DFS graph traversals find paths between nodes regardless of when the links occurred. A **Temporal Path** requires that causal arrows obey the arrow of time:

$$e_1(u, v, [t_1, t_2]) \to e_2(v, w, [t_3, t_4]) \implies t_3 \ge t_1$$

You cannot be influenced by an institutional mandate that occurred *after* you left office. Temporal path validation eliminates physically impossible causal chains from LLM reasoning.

### 3. Continuous Sliding Synthesis (Automated Epoch Summaries)
Instead of batch-summarizing millions of documents at once, agents apply the **Sliding Kernel**:
1. Advance window by stride $S$ (e.g., 30 days).
2. Query all active entities and new evidentiary resources in $[t, t + \Delta t]$.
3. Compute the **delta-entropy**: What changed? Who stepped down? What gazette was rescinded?
4. Emit an atomic chronicle card into the agent's episodic long-term memory.

---

## 6. Monorepo Integration & Forward Strategy

```
                          [Crawlers & Ingestion Stream]
                       (LDF Gazettes, Nuwan News, Telegram)
                                       │
                                       ▼
                       [Bedrock Evidence: resources]
                          (5,930+ Records, Timestamps)
                                       │
                                       ▼
                  [Entity Extraction & Resolution Pipeline]
                           (LLM / Rule-based NER)
                                       │
                                       ▼
                   [Poly-Temporal Mesh: temporal_connections]
                         (Valid, Documented, Observed)
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
      [DuckDB Analytical Engine]                 [Sanctuary API / Web UI]
       (ASOF Joins, Parquet, OLAP)              (Interactive Time Scrubbers)
```

1. **Phase 1 (Complete):** Core tables created, indexed in SQLite WAL, seeded with foundational civic and education entities, verified with `<10ms` point-in-time and slice queries.
2. **Phase 2 (Next):**
   * Connect NER (Named Entity Recognition) to auto-extract people, circular numbers, and ministerial entities from the 5,930 raw text records.
   * Expose `/api/timeline/slice` and `/api/timeline/as-of` in `apps/sanctuary-api`.
3. **Phase 3 (2027 Horizon):**
   * Expose an interactive **Time Scrubber** in `apps/gurudevi-web` using Vis.js / Cytoscape, allowing users to drag a slider across 1950–2026 and watch the Sri Lankan institutional topology morph in real time.
   * Provide an LLM agent interface equipped with temporal tools (`queryAsOf`, `queryTimelineSlice`, `traceCausalChain`).
