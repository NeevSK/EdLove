# Library & Media Module

A genuinely different domain from everything in `01-data-architecture.md` — that doc's `events` table models **user-generated, append-only activity**. The Library module is **catalog data**: pre-existing, licensed, curated content that users consume and organize, closer in shape to a product catalog than to an event log. Two different tables with two different natures, not a variant of the same pattern.

## Reference models — what's actually being drawn on, and why

**Telegram** — the stated mental model. What's structurally worth keeping: content lives in shared, joinable spaces (channels/groups), contributed by users rather than centrally curated alone, with **bots as first-class actors** — not just automation scripts, but participants with their own identity and permission scope, able to post/manage content programmatically.

**Are.na** — a closer structural fit worth knowing about, not previously considered. Where Telegram's core object is the *conversation* media happens to flow through, Are.na's core object is the **curated collection itself** — a "channel" is explicitly an assembled collection someone built, which is closer to what a library module actually is (a library, not a chat). Worth treating as the more structurally accurate reference, even where Telegram's contribution/bot *feel* is closer to the intended day-to-day experience.

**Where both fall short, and need real, separate work: neither Telegram nor Are.na deals with licensing or IP at all.** Telegram's forward-anything model has essentially no rights-enforcement built into the product; that's explicitly not acceptable here — user-curation and rights-respect have to coexist, not trade off against each other.

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

### 4. Metadata sync vs. media-byte delivery — these are different sync problems

**PowerSync is the right fit for library *metadata*** (catalog entries, licensing status, a user's progress/position) — small, structured, frequently-changing data that fits the existing `owner_type`/`events` pattern directly. **PowerSync is the wrong fit for the media files themselves** — too large, too infrequently-changing, and architecturally mismatched to the bucket-sync model (`04-network-transport.md`). Media bytes belong behind the CDN/download-manager pattern above entirely, fetched directly from R2/Bunny, never routed through a PowerSync bucket. This is the precise, corrected version of the earlier "probably shouldn't route through PowerSync" note — now stated as two clearly separated systems rather than one vague caveat.

## Open Questions / Not Yet Resolved

- Exact `owner_type` value(s) for library/curated content — reuse `group`, or add a dedicated `library_collection` type
- Bot identity model — new actor type vs. specially-permissioned user/group, and how Cedar should reason about it
- DRM specifics for licensed audio/video (encryption-at-rest on device, licensed playback restrictions) — not yet explored at all
- R2 vs. Bunny — working default is R2, not yet confirmed against real catalog composition (file-size/frequency mix)
- Preload-vs-on-demand download policy, and whether downloaded content lives in sandboxed or user-visible device storage — genuine open product decision, not just technical
- Whether this module is a candidate for the "external exposure" scenario flagged in `06-query-patterns.md` (a public or partner-facing catalog API) — plausible, not decided
- Full rights-metadata schema — flagged as necessary here, not yet designed in detail
