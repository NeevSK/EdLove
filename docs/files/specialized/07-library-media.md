# Library & Media Module

A genuinely different domain from everything in `01-data-architecture.md` — that doc's `events` table models **user-generated, append-only activity**. The Library module is **catalog data**: pre-existing, licensed, curated content that users consume and organize, closer in shape to a product catalog than to an event log. Two different tables with two different natures, not a variant of the same pattern.

## Reference models — what's actually being drawn on, and why

**Telegram** — the stated mental model. What's structurally worth keeping: content lives in shared, joinable spaces (channels/groups), contributed by users rather than centrally curated alone, with **bots as first-class actors** — not just automation scripts, but participants with their own identity and permission scope, able to post/manage content programmatically.

**Are.na** — a closer structural fit worth knowing about, not previously considered. Where Telegram's core object is the *conversation* media happens to flow through, Are.na's core object is the **curated collection itself** — a "channel" is explicitly an assembled collection someone built, which is closer to what a library module actually is (a library, not a chat). Worth treating as the more structurally accurate reference, even where Telegram's contribution/bot *feel* is closer to the intended day-to-day experience.

**Where both fall short, and need real, separate work: neither Telegram nor Are.na deals with licensing or IP at all.** Telegram's forward-anything model has essentially no rights-enforcement built into the product; that's explicitly not acceptable here — user-curation and rights-respect have to coexist, not trade off against each other.

## Confirmed instance of a named anti-pattern — offset pagination, live in code

`useLibrary.ts`'s resource/collection queries use `useInfiniteQuery` (React Query, confirming `06-query-patterns.md`'s prediction that React Query is the right tool wherever PowerSync doesn't already own the data) — but the actual pagination is `offset: pageParam`, with `getNextPageParam` computing `allPages.length * 10`. **This is exactly the offset-pagination anti-pattern `06-query-patterns.md` named as wrong-by-default** — not hypothetical, confirmed live in the resource/collection browsing path. At current catalog size this is harmless; per that doc's own reasoning, it degrades linearly as the catalog grows and carries the same insert/delete-shifting correctness risk. **Direct, concrete fix available:** migrate to keyset pagination on `(created_at, id)` or `(map_x, map_y, id)` depending on whether resources are browsed by recency or spatially — low-risk, contained to this one file's query functions.

## Data shape

**Catalog and consumption are two different tables, not one.**

- **Catalog** (`library_items` or similar) — the book/video/audiobook/movie itself: title, format, rights/licensing metadata, source. Traditional, mostly-normalized reference data — closer to `05-storage-indexing.md`'s enum-in-lookup-table pattern than to the event-log model.
- **Consumption** — "user X watched 40% of video Y," "user X finished audiobook Z" — this *is* event-log-shaped, and fits the existing `events` table pattern directly: `type: 'media_progress'`, `owner_type`/`owner_id` exactly as already designed in `01-data-architecture.md`, `payload` holding position/progress. No new pattern needed here — the ownership model already covers it.
- **Curation** (a user or group assembling a collection) — structurally identical to a user posting into a community group, already covered by the existing `owner_type: 'group'` pattern. A curated library collection doesn't need new infrastructure — it needs recognition that "share a book into a library space" is the same shape as "post into a community group," just domain-flavored.

## Rights & licensing — the layer neither reference model provides

Must be first-class metadata on every catalog item, not an afterthought:
- **Scope of license** — available to personal-tier (second-class) users vs. licensed specifically for an institution (first-class, `owner_type: 'school_workspace'`) vs. accessible to a specific group
- **Expiry** — licensed content can have a real end date; needs enforcement, not just display
- **Geographic/regional restrictions** — a real, concrete concern for a Sri Lanka-based platform sourcing international content
- **User-curation does not bypass this** — more contributors (per the Telegram-inspired model) makes the rights layer *more* important to enforce consistently, not less; curation and licensing need to be checked together, not treated as separate concerns that happen to share a table

## Bots as actors

If "bot-able" (Telegram-style) is a real goal: a bot needs to be a legitimate participant in the ReBAC/ownership graph, not bolted-on automation. Likely its own actor type, distinct from the guest/second-class/first-class citizenship tiers (`01-data-architecture.md`), with its own scoped permissions — e.g. a "library bot" that can post curated content into one specific collection and nothing else. This is a real, open design question, not yet resolved: does a bot get its own `owner_type`, or act *as* a user/group with a special permission flag? Needs Cedar policy design, not just a schema decision.

## Is this "rich and capable, like Telegram"? — an honest answer: not yet, at the media-delivery layer

**The organizational/metadata layer earns the comparison — the actual file-delivery layer does not, and the gap is concrete, not a matter of degree.**

**Real storage provider, corrected:** `MediaManager`/`IFileStoragePort` is a clean, genuinely provider-agnostic ports/adapters design (explicitly documented as swappable between Cloudinary, Supabase Storage, S3) — good architecture. But the actual configured adapter is **Supabase Storage, not R2 or Bunny** — this corrects this doc's earlier CDN-economics section below, which was built on an unverified assumption. Supabase Storage has its own separate pricing/egress model; the zero-egress R2 advantage and Bunny's per-GB simplicity don't directly transfer to whatever Supabase Storage actually charges.

**The concrete, decisive finding: the adapter implementation is an admitted stub, not production code.** `supabase.adapter.ts`'s own comment: *"In React Native, we would need to convert URI to Blob/File. This is a simplified version for the adapter pattern demonstration."* **The original developer is stating directly that this does not actually work correctly on React Native** — the primary target platform — because the URI→Blob/File conversion RN requires before upload was never implemented. `fileUri as any` alongside it is a second, related type-safety bypass.

**Bucket/format handling is crude, nowhere near Telegram-level richness:** exactly two buckets exist — `images` and a catch-all `files` — selected by a single ternary (`resourceType === 'image' ? 'images' : 'files'`). No dedicated audio/video bucket, no format-specific delivery strategy, despite dedicated `PDFViewerScreen`, `VideoPlayerScreen`, and `DocumentViewerScreen` components already existing elsewhere in the package. Telegram-level richness would mean per-format optimized delivery, resumable/chunked uploads, streaming-aware serving, and CDN-backed caching tiers — none of that exists yet. **What Library actually has right now is a strong metadata/organization layer (the spatial knowledge atlas, trilingual support, curation workflow, citizenship-gated surfaces) wrapped around a thin, explicitly-unfinished media pipeline.** The ambition and the architecture (ports/adapters) are sound; the concrete implementation underneath is the least mature part of the module and the clearest, most actionable gap in it.

## Delivery Infrastructure — four genuinely separate decisions, not one

What follows was previously compressed into a single "delivery" note. It isn't one decision — it's four, each with its own real tradeoffs, worth treating separately since conflating them is exactly where a naive design goes wrong.

### 1. Origin/CDN choice — where the actual media bytes live

Two real, comparable options, with a genuine tradeoff between them:

- **Cloudflare R2** — S3-compatible object storage with **zero egress fees**, meaning you pay for storage but nothing extra when users download. This is the mathematically better choice for **large, infrequently-re-served files** — the exact shape of audiobook/video downloads, where a user downloads once and plays locally. Native integration with Cloudflare Workers if any edge-side processing is ever needed (transcoding, format conversion).
- **Bunny.net (CDN + Edge Storage)** — simpler, linear, purely usage-based pricing (as low as $0.01/GB with no tier jumps), geo-replicated storage across multiple regions so files sit physically close to users before first request. Better fit for **frequent, moderate-size requests** where R2's slightly more complex ecosystem isn't needed. Cloudflare's free tier is excellent at small scale but jumps steeply (Business tier ~$200/mo, Enterprise $2,000+/mo) — worth knowing before assuming "start free, scale later" is painless.

**Working default for Gurudevi:** R2 is the better fit given the library is dominated by large files (video, audiobooks) that are downloaded once and consumed offline — that's precisely the zero-egress use case. Revisit if the catalog shifts toward frequent small-file/streaming-heavy traffic instead.

### 2. Caching strategy — reducing how often the expensive origin fetch happens at all

A separate lever from CDN choice, easy to conflate with it. **Cache Reserve** (a persistent cache layer built on R2) keeps content fresh far longer, shielding the origin from repeat egress costs. **Tiered Cache** organizes edge data centers into a hierarchy — a nearby cache miss checks a designated upper-tier data center before ever reaching the origin bucket — and **Smart Tiered Cache** automates this entirely, detecting bucket location and routing misses through the nearest upper tier with no manual config. This is the actual mechanism that determines the real storage bill over time — not the per-GB sticker price, but *how many times the expensive fetch actually has to happen* once caching is layered on.

### 3. Device-side storage and download management — the mobile half

**Preloading vs. on-demand is a real, named tension, not a settled default.** Preloading (fetching assets before they're needed) is necessary for genuine offline-first behavior — you can't rely on fetching on the fly once a user is offline — but over-aggressive preloading bloats the app's storage footprint, while under-preloading compromises the actual offline experience. This is the direct, concrete version of "my storage bill vs. user's device storage" — for a library specifically, this is a real per-item decision: does a user explicitly choose what to download (Telegram/podcast-app style "download this episode"), or does the app preload based on inferred usage?

**Video/audio need purpose-built download lifecycle handling, not ad-hoc file fetches** — progress events, completion events, and playback directly from local storage once downloaded, distinct from a simple one-shot `fetch`.

**Expo's default file storage is sandboxed and invisible to the OS's normal file manager or media library** — a real, concrete UX question follows directly from this: does Gurudevi want downloaded library content to be a private, app-managed cache (simpler, but user can't manage it via their phone's normal storage/downloads UI), or does it need to write to publicly-accessible device storage (more visible and manageable by the user, but more implementation work, different permissions model on iOS vs. Android)? **Not yet decided — flagged as a genuine, user-facing product decision, not just a technical detail.**

### 4. Metadata sync vs. media-byte delivery — corrected against real code

**The real implementation does not use PowerSync for library metadata at all** — this corrects the doc's earlier assumption. `packages/library/src/api/sync.ts` implements a custom, hand-rolled, unidirectional delta-sync the code itself names **"Radio Broadcast" sync**: Supabase → local SQLite, one-way, via a simple `updated_at` cursor (`sync_state` table tracking `last_sync_timestamp`), never client → server for the catalog itself. **This is a genuinely sound, deliberate deviation, not an oversight** — library metadata is read-mostly, centrally-curated, and never personalized per-user the way PowerSync's bucket model assumes; a simple one-way cursor sync is a better fit for this specific access pattern than PowerSync's bidirectional, per-user-bucket machinery. Media bytes themselves are separate again — not yet traced to a specific CDN in code, but the architectural separation (metadata sync ≠ media delivery) this doc argued for is confirmed correct in spirit, just implemented differently than assumed.

### A genuinely novel organizing model this doc never anticipated — the knowledge atlas

The real schema (`nodes` table, synced via the above) organizes library resources **spatially**: `map_x`, `map_y` (abstract 2D map coordinates), `latitude`/`longitude` (real geographic coordinates), `island_id` (a grouping concept), `parent_node_id` (hierarchy). This is not the Telegram/Are.na channel-and-collection model this doc was built around — it's closer to a **knowledge atlas/archipelago metaphor**, with a real `MapScreen.tsx`, `useTopologyPulse.ts`, and `usePerspectiveLayout.ts` confirming a genuine spatial browsing UI exists. **This should be absorbed as the primary organizing metaphor for this doc, with Telegram/Are.na kept as a secondary reference for the contribution/curation *behavior*, not the spatial layout.**

**Trilingual, not bilingual — a correction to the wellbeing audit too:** the sync layer carries `title_si`/`title_ta`/`title_en` (Sinhala, Tamil, English) as first-class fields. The wellbeing audit's "bilingual en/si" framing undersells this — at least the library domain is genuinely trilingual, matching Sri Lanka's actual multi-ethnic context more fully than two languages would.

**Real UI confirming parts of this doc's speculation, now verified:** `CuratorReviewScreen.tsx` confirms a real curation/moderation workflow exists (relevant to the "curated collection" and rights-checking sections above). `ResourceShareQRModal.tsx` — QR-code-based resource sharing — is a real, concrete sharing mechanism this doc never anticipated. Dedicated `PDFViewerScreen.tsx`, `VideoPlayerScreen.tsx`, and `DocumentViewerScreen.tsx` confirm per-format delivery is real, not just a design concern.

### A subtler kind of drift than found elsewhere — declared-but-incomplete, not simply missing

`LibraryResource` (mapped to `nodes`) **is** declared in `schema.zmodel` — unlike most of classroom's drift, this table isn't missing. But its declared field list (title, description, type, format, url, file_path, subjects, topics, grades, difficulty, language, visibility, creator_id, creator_role, verified, is_community, views, uses_count, endorsements, bookmarks) **never includes** `map_x`, `map_y`, `latitude`, `longitude`, `tags`, `parent_node_id`, or `island_id` — all fields the real sync code actively reads from the same table. **This is a different failure mode from anything found in self or classroom: the ZenStack-generated types for `LibraryResource` are silently incomplete**, missing exactly the fields that make the spatial knowledge-atlas model work. Anyone generating code against the ZenStack types alone would have no idea the spatial fields exist. `map_layers` (the separate table backing the map's overlay layers) is missing from `schema.zmodel` entirely, following the more familiar drift pattern seen elsewhere.

## Open Questions / Not Yet Resolved

- **`schema.zmodel`'s `@@map("map_layers")` fix, and completing `LibraryResource`'s declared field list** — highest-priority fix from this pass; `map_x`/`map_y`/`latitude`/`longitude`/`tags`/`parent_node_id`/`island_id` are real, actively-used fields absent from the ZenStack declaration
- Exact `owner_type` value(s) for library/curated content — reuse `group`, or add a dedicated `library_collection` type
- Bot identity model — new actor type vs. specially-permissioned user/group, and how Cedar should reason about it
- DRM specifics for licensed audio/video (encryption-at-rest on device, licensed playback restrictions) — not yet explored at all
- R2 vs. Bunny — still not confirmed against real code; no CDN/media-byte delivery mechanism was found in this pass, only the metadata sync layer
- Preload-vs-on-demand download policy, and whether downloaded content lives in sandboxed or user-visible device storage — genuine open product decision, not just technical
- Whether this module is a candidate for the "external exposure" scenario flagged in `06-query-patterns.md` (a public or partner-facing catalog API) — plausible, not decided
- Full rights-metadata schema — flagged as necessary here, not yet designed in detail; no licensing/rights enforcement code found yet in this pass, only cataloging and spatial organization
- **Coverage gap, logged rather than closed:** `useLibrary.ts`, `useMapPresence.ts`, `useMappingSync.ts`, `CuratorReviewScreen.tsx`, `ResourceEngagement`'s real usage, and the actual media-file delivery mechanism (CDN/streaming) — not yet read
