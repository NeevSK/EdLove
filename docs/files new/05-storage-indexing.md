# Storage & Indexing at Scale

Builds on `01-data-architecture.md`'s ownership model (`owner_type`/`owner_id`, not tenant-first) and the material-layer type decisions already made there. This doc covers the structures built *on top of* stored data to make it findable, and how the table itself gets physically organized as row counts grow. Sequencing note: index types are relatively fixed, learnable facts independent of Gurudevi's specific queries — learn the toolbox first, then map actual query patterns onto it (next doc).

## Index Types — the full toolbox, three families

Postgres ships seven index types (B-tree, Hash, GiST, SP-GiST, GIN, BRIN, and the bloom extension). Three matter for Gurudevi; two are worth knowing exist and nothing more.

### B-tree — the default, stays default for most of `events`

Handles equality, range, `BETWEEN`, `ORDER BY`, and prefix `LIKE`. Right choice whenever a column is compared with `=`, `<`, `>`, `BETWEEN`, or sorted — covers `occurred_at` range queries, `owner_id` equality filters, and any generated columns pulled out of `payload`.

**Postgres 18 addition worth planning around:** skip-scan on multicolumn B-tree indexes now allows efficient lookups even when the *leading* column isn't filtered — reduces the need for redundant single-column indexes. Relevant directly to a composite `(owner_type, owner_id, occurred_at)` index, which is close to what the ownership model already implies.

### GIN — for `payload jsonb` specifically

Built for columns holding *multiple values per row* (arrays, jsonb, full-text) — an "inverted index" for searching elements within composite values. Real cost: higher write overhead, since every insert updates multiple index entries — for bulk loads, create the index after loading, or use `fastupdate`. Operator-specific: only accelerates `@>`, `?`, `?|`, `?&` — `->>'key'` extraction can silently bypass it (see `01-data-architecture.md`'s generated-columns fix for hot fields). Postgres 18 added parallel GIN builds, relevant if full-text search over notes content is ever added.

### BRIN — a strong, underused fit for `events` specifically

Block Range Index: much smaller and cheaper to maintain than B-tree, designed for very large tables where B-tree becomes impractical without partitioning. **The requirement that makes or breaks it: the indexed column must be physically correlated with insertion order** — data must already be roughly sorted on disk the way the index column is sorted. `events` is append-only, timestamped at insert time — this is exactly that case. A BRIN index on `occurred_at` is dramatically cheaper to maintain than B-tree as the table grows into millions of rows.

**BRIN and partitioning are complementary, not alternatives:** BRIN works especially well *within* range-partitioned tables — each partition's BRIN index only describes a naturally-narrow time range, making it even cheaper than BRIN on one giant unpartitioned table. Sequencing: BRIN + proper indexing first; partitioning added once BRIN alone isn't enough at measured scale.

### GiST / SP-GiST — noted, not currently relevant

GiST: geometric data, ranges, nearest-neighbor queries. SP-GiST: naturally-clustering, unbalanced data (phone numbers, IP addresses). Neither maps to anything in Gurudevi's current schema.

### Partial and covering indexes — smaller techniques, directly actionable

**Partial index** — only indexes rows matching a `WHERE` condition, shrinking size when queries consistently filter on something. Directly applicable to the coral-band recency window: an index covering only `occurred_at > now() - interval '90 days'` is far smaller and faster than indexing full history — matches the PowerSync sync window exactly.

**Covering index** (`INCLUDE` clause, Postgres 11+) — adds extra columns to an index so a query can be satisfied entirely from the index without a trip back to the table row ("index-only scan"). Worth considering for rollup-refresh queries that repeatedly pull the same small column set.

### Concrete index plan for `events`

```sql
-- Primary access pattern: recent window, per-owner, time-ordered
CREATE INDEX idx_events_recent 
  ON events (owner_type, owner_id, occurred_at) 
  WHERE occurred_at > now() - interval '90 days';  -- partial, matches coral-band window

-- Full-history time-range scans (BRIN: cheap, fits append-only + time-ordered insert pattern)
CREATE INDEX idx_events_occurred_brin 
  ON events USING BRIN (occurred_at);

-- Filtering inside payload (generated columns, not raw jsonb — see 01-data-architecture.md)
CREATE INDEX idx_events_domain_tag 
  ON events (domain_tag);  -- ordinary B-tree, since it's a real extracted column
```

**Always verify with `EXPLAIN ANALYZE`, never assumption.** An index that looks theoretically correct can sit unused if the query shape doesn't match what the planner needs — the same "index exists but query doesn't use it" trap covered for GIN applies to every index type. This is the one piece of index work that can't be fully planned in advance; it needs real queries run against it.

## Partitioning — splitting the table itself

### Why it exists — the mechanical root cause

Postgres stores all rows in a single table file; every maintenance operation (VACUUM, ANALYZE, REINDEX) operates on the entire table regardless of how much data is actually needed. As `events` grows past low hundreds of millions of rows, this becomes an operational problem independent of query speed — VACUUM drags, deletes become multi-hour locks. Partitioning stores data in independent physical tables under one logical name: a query for a specific time range only scans the relevant partition, VACUUM processes partitions independently, dropping an old month becomes `DROP TABLE` (milliseconds) instead of a multi-hour `DELETE`.

### The three strategies, and which is Gurudevi's

**Range** (ordered buckets — time, sequential IDs), **list** (discrete categorical values — institution IDs, regions), **hash** (even distribution for load-spreading, not meaningful grouping). Range partitioning on `occurred_at` is the standard, well-documented fit for event-logging workloads generally.

**Given the ownership model, composite partitioning is the actual right shape, not range-alone:** range on `occurred_at`, sub-partitioned by `owner_type` where it matters. The parallel named directly in the research — *"multi-tenant with one loud customer? RANGE + LIST (isolate the noisy one)"* — applies specifically to the `school_workspace` slice, where one large school could generate disproportionate volume. `user`/`personal_workspace`/`group` rows are inherently institution-independent and can share a partition family; `school_workspace` rows are the only slice where "which institution" is a meaningful, load-bearing partition boundary.

### Granularity

**Monthly** range partitions are the right starting granularity for Gurudevi's actual write pattern (personal wellbeing/notes entries, not high-frequency sensor data) — daily suits explosive write volume, which doesn't describe this app; monthly is "big enough to avoid thousands of tables, small enough for pruning to work."

### The critical operational trap

**Partition pruning only works if the partition key appears in the query's `WHERE` clause.** Queries that don't filter on `occurred_at` scan every partition — potentially worse than an unpartitioned table. Hard rule for anyone (including an AI agent) writing queries against `events` later: always include a time-bound filter, or partitioning actively works against the query.

### Hot/cold tiering — the formal Postgres-side name for the coral-band pattern

Tablespaces let hot (recent) partitions live on fast storage and cold (archived) partitions on cheaper storage (`CREATE TABLESPACE ts_hot LOCATION ...` / `ts_cold`), with partition *rotation* (moving data between tiers) and partition *retention* (auto-dropping expired partitions) as named, standard maintenance patterns. **This is the same principle as `01-data-architecture.md`'s PowerSync sync strategy** ("recent = full detail locally, distant = fetched on demand") — now implemented as the formal Postgres-side mechanism, giving the coral-band principle a real implementation on both sides of the sync boundary.

### The honest scale threshold

Partitioning adds real overhead for small tables — a well-indexed regular table often outperforms a poorly-partitioned one. Same "add only when a measured constraint justifies it" principle as Redis (`01-data-architecture.md`) and connection pooling. **Sequencing for Gurudevi: BRIN + proper B-tree/partial indexing first (this doc's index plan); monthly range+owner_type partitioning only once real row counts make VACUUM/maintenance measurably painful — not designed in from day one.**

## Open Questions / Not Yet Resolved

- Actual row-count thresholds that will trigger the partitioning decision — needs real usage data, not estimated
- Whether `school_workspace` list-sub-partitioning should be per-institution or grouped (e.g. only isolate institutions that cross a measured volume threshold)
- Query-pattern layer (access pattern shapes, N+1 risks in RN screens) — the next doc, indexes here are designed against inferred patterns, not yet validated ones
