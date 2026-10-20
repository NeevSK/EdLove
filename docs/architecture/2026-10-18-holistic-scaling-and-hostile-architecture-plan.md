# Holistic Scaling & Convivial Architecture Plan: Gurudevi Platform 2026–2027

> **Status:** Active Proposal & Architectural Baseline  
> **Author:** Solution Architecture & Senior Engineering Directorate  
> **Reviewer Persona:** The Ruthless Pragmatic Hostile Critic  
> **Scope:** `apps/gurudevi-web`, `apps/gurudevi-mobile`, `apps/edlove-web`, `@repo/core`, Cloudflare Edge, ZenStack RLS  

---

## 1. Executive Synthesis & Architectural Doctrine

Gurudevi is not a corporate Learning Management System (LMS). Traditional LMS platforms reduce education to transaction metrics, surveillance logs, and administrative drudgery—manifesting Martin Buber’s **I-It** dehumanization.

Gurudevi exists to protect and facilitate the **I-Thou** pedagogical encounter: the living, relational tissue between teacher, student, family, and community. Software in this ecosystem must adhere to Ivan Illich’s **Convivial Limit**: it exists to lift administrative burdens so humans can be present with each other, never to enclose or mediate every breath of human life.

However, convivial philosophy without ironclad systems engineering collapses under real-world pressure. In Sri Lanka, software runs on crowded buses along the Galle Road, on intermittent 3G connections in the Uva hills, on $80 Android devices with 2GB of RAM, and through WhatsApp group chats constrained by severe thumbnail thresholds.

This document synthesizes our **holistic feature expansion** and subjects every proposal to the **Ruthless Pragmatic Hostile Critic**: identifying failure modes, physical scaling bottlenecks, and concrete mitigation seams before a single line of exploratory bloat is written.

```
                    ┌──────────────────────────────────────────────┐
                    │               THE LIVING CORE                │
                    │        "I-Thou" Relational Encounter         │
                    │  (Relational Depth • Convivial Freedom)      │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌─────────────────────────────────┐                         ┌─────────────────────────────────┐
│     HOLISTIC CAPABILITIES       │                         │       HOSTILE SCALING CRITIC    │
│ • Subdomain School Portals      │       Tension &         │ • 7:45 AM Gate Stampede Spike   │
│ • Dual-Loop Kiosk Attendance    │   ◄───────────────►     │ • WhatsApp 300KB Hard Drop      │
│ • The Train & Bus Continuity    │      Discipline         │ • Rural 3G Packet Loss / Tunnels│
│ • Edge Badges & Micro-Cards     │                         │ • Cross-Tenant Subdomain Leaks  │
│ • Diurnal Atmospheric Rhythms   │                         │ • Cognitive Slop & Battery Kill │
└─────────────────────────────────┘                         └─────────────────────────────────┘
```

---

## 2. The 6 Holistic Capability Horizons

### Horizon 1: Institutional Multi-Tenancy & School Subdomains (`[school].gurudevi.app`)
* **Capability:** Every registered government and private school receives a dedicated institutional subdomain (e.g., `ananda.gurudevi.app`, `chundikuli.gurudevi.app`, `mahamaya.gurudevi.app`).
* **Experience:** Dynamic theme adaptation using the school’s crest, traditional colors, Sinhala/Tamil titles, and localized announcements, while retaining shared platform identity and student mobility across institutions.
* **Separation of Concerns:** 
  * Public institutional landing with admissions and history.
  * Internal sanctuary floors gated behind tenant-bound authentication.
  * Public exploratory sandbox (`explore.gurudevi.app`) completely free of institutional walls.

### Horizon 2: The Dual-Loop Kiosk & Reflective Attendance Substrate
* **Loop A (Fast Kiosk Loop):** High-speed optical QR scanner running at school gates or hall entrances. Sub-200ms audio-visual feedback ("Dhammika is present"), caching scan bursts locally during network disconnects.
* **Loop B (Reflective Classroom Loop):** The teacher's morning roll on mobile or tablet. Not a binary spreadsheet checkmark, but a qualitative pulse: noting student energy, quiet struggles, or absences that require pastoral care.
* **Bi-directional Reconciliation:** Fast gate scans automatically pre-populate the classroom register; the teacher's relational observations enrich the institutional record.

### Horizon 3: The Train & Bus Invariant (Rural Offline PWA & SQLite WAL Continuity)
* **Capability:** Complete uninterrupted operation of core workflows—Fire Journal reflection, attendance taking, timetable review, and lesson notes—while completely disconnected.
* **Substrate:** 
  * Mobile: SQLite WAL mode with PowerSync delta feeds.
  * Web: Service Worker cache with an append-only IndexedDB mutation log (`gurudevi_offline_mutation_queue`).
* **Guarantee:** When a teacher boards the coastal train at Fort and loses connection through the tunnels of Kalutara, the app never shows a blocking network spinner or disables input fields.

### Horizon 4: Dynamic Edge Media & Cultural WhatsApp Dispatcher
* **Capability:** 
  * Instant, lightweight dynamic SVG school badges (`[school].gurudevi.app/badge.svg`) with dark/light diurnal adaptation.
  * Dynamic Open Graph micro-cards optimized to stay strictly under WhatsApp’s 300KB preview threshold.
  * One-tap WhatsApp status cards allowing teachers and principals to broadcast emergency notices, school events, or Thuthimal gratitude milestones.

### Horizon 5: Diurnal Ambient Atmosphere & Tutii Companion Architecture
* **Capability:** 
  * Natural diurnal rhythm tracking: Dawn (Subhasin), Day (Madhyana), Dusk (Sandhya), and Night (Nishitha) transitions.
  * Ambient soundscapes (gentle mountain breeze, temple bell, rain on clay tiles) that de-escalate anxiety and create a calm workspace.
  * Tutii (the luminous firefly guide) offering unobtrusive contextual hints, quiet affirmations, and navigation assistance without becoming an invasive chatbot.

### Horizon 6: Trilingual Knowledge Graph & Sovereign GEO Discovery
* **Capability:** 
  * Deep trilingual parity across English, Sinhala (`ගුරුදෙවි | සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම`), and Tamil (`குருதெவி | ஒருங்கிணைந்த கல்வியின் அமைதிச் சோலை`).
  * AI Content Negotiation (`Accept: text/markdown` or `/index.md`) feeding clean AST summaries to agentic crawlers (Perplexity, Claude Search, ChatGPT).
  * Direct linkage between public school profiles and the EdLove Ceylon Research Atlas (`edlove.org`).

---

## 3. The Hostile Pragmatic Reviewer's Stress-Test Matrix

Every senior architect must act as an adversarial critic of their own team's designs. Below is the brutal reality-check on each capability:

| Target Capability | The Hostile Critique & Physical Failure Mode | Senior Architect's Counter-Measure & Invariant |
| :--- | :--- | :--- |
| **School Gate QR Kiosk** | **The 7:45 AM Gate Stampede:** 1,200 students pass through 3 turnstiles in 18 minutes. If every camera scan fires a synchronous HTTP POST hitting Postgres row-level locks on the `Attendance` table, the database connection pool exhausts in 40 seconds, gate gates freeze, and angry crowds form. | **Zero-Network Critical Path:** Gate cameras decode and commit scans to local device storage (IndexedDB/MMKV) in <16ms with instant green LED/chime. A background worker drains the batch queue via oRPC batch-ingest (`attendance.batchCheckIn`) with idempotency keys. The database ingests into an unconstrained append-only staging table (`attendance_events_raw`), processing rollups asynchronously via background job. |
| **WhatsApp Preview Cards** | **The 300KB Silent Drop:** Next.js `@vercel/og` typically spits out PNG cards between 400KB and 1.2MB. WhatsApp silently drops cards $>300\text{KB}$, rendering a generic gray broken link icon. The school looks unprofessional in parent WhatsApp groups. | **Cloudflare Edge WebP/SVG Pipe:** OG cards are rendered at the edge directly as optimized WebP or SVG using sharp/resvg with a quality target of 78, strictly capped at $120\text{KB}$. Headers set `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`. Previews are verified by an automated CI smoke test checking byte sizes. |
| **Subdomain Multi-Tenancy** | **Subdomain Cookie Hijacking & Leakage:** Setting cookies on `.gurudevi.app` means `malicious-school.gurudevi.app` or an XSS vulnerability on one tenant can read parent auth tokens or inject session state across all schools. | **Scoped Subdomain Isolation:** Auth session cookies are pinned strictly to the specific host (`__Host-` cookie prefix, no `domain=.gurudevi.app` wildcards) or tokens are kept in encrypted session storage. Middleware validates tenant claims against a cryptographically signed tenant JWT. Cross-tenant reads are vetoed at the database layer via ZenStack access policies (`@@allow('read', auth().tenantId == tenantId)`). |
| **Rural Offline Continuity** | **The Zombie Sync Conflict:** A teacher edits attendance on the bus while offline. Meanwhile, the vice-principal modifies the same student record on desktop at school. When the bus connects to 3G, a naive "last write wins" sync overwrites the vice-principal's medical note with stale data. | **Event-Sourced Delta Ledger (CRDT-Inspired):** We never overwrite full records offline. Mutations are dispatched as atomic intent events: `RecordStudentAbsence`, `AddMedicalExcuse`, `UpdateRelationalNote`. The server reconciles non-overlapping field updates automatically. In true conflicts, the system creates a "Dual Record Needs Review" state instead of silently destroying human data (The Deletion Veto). |
| **Diurnal Themes & Atmosphere** | **Flash of Unstyled Theme (FOUT) & Battery Murder:** Heavy WebGL shaders or continuous JavaScript `requestAnimationFrame` loops for ambient fireflies drain 20% of an old phone's battery during an 8-period teaching day. | **Pure CSS Variables + Zero-JS Inline Script:** Theme presets (`data-appearance="dawn|day|dusk|night"`) are applied synchronously before First Contentful Paint via an inline head script. Ambient animations run purely on CSS GPU layers (`transform`, `opacity`) with `@media (prefers-reduced-motion)` fallbacks. Background soundscapes use lightweight Opus loops (<200KB total) and suspend audio contexts immediately when the tab is blurred. |
| **Tutii Mascot Guidance** | **The Clippy Irritation Trap:** An animated mascot popping up dialog balloons during busy attendance entry or report card compilation turns a sacred sanctuary into an annoying, patronizing toy. | **Passive Presence Doctrine:** Tutii is a silent, luminous anchor in the header/corner. Tutii never interrupts, never blocks navigation, and never presents modal popups. Tutii's state changes solely based on time of day and peaceful milestone acknowledgments (e.g., when a reflection is saved, Tutii glows gently for 1.2 seconds, then rests). |

---

## 4. Concrete Physical Implementation Architecture

### A. Subdomain Routing & Institutional Resolution Matrix

```
Incoming Request: https://visakha.gurudevi.app/workspace
  │
  ▼
Edge Middleware (`apps/gurudevi-web/proxy.ts` / Next Middleware)
  │
  ├─ 1. Check Host Header:
  │    • "gurudevi.app"         ➔ Root Marketing & Platform Sanctuary
  │    • "explore.gurudevi.app" ➔ Unauthenticated Public Museum Showcase
  │    • "[slug].gurudevi.app"  ➔ Multi-Tenant Institutional Portal
  │
  ├─ 2. Institutional Resolution:
  │    • Lookup `slug` in Edge KV / In-Memory LRU Cache (`tenants.cache`)
  │    • Inject Headers:
  │        x-gurudevi-tenant-id: "inst_visakha_01"
  │        x-gurudevi-tenant-slug: "visakha"
  │        x-gurudevi-theme-primary: "#7B1113"
  │
  └─ 3. Route Rewriting:
       • Rewrite internally to `app/(tenant)/[slug]/...` or inject tenant context into Sanctuary Shell
```

### B. High-Speed Attendance Ingestion Pipeline

```
[ Gate Kiosk Web / Mobile Scanner ]
  │
  ├─ (1) Optical decode QR (Raw String: "GD-STU:inst_01:2026:88412")
  ├─ (2) Immediate Visual & Audio Feedback (<16ms, UI unblocked)
  ├─ (3) Append to Local Queue: `IndexedDB.kiosk_scans`
  │
  ▼ (Background Async Drain)
POST https://api.gurudevi.app/orpc/attendance.batchIngest
Headers: { x-idempotency-key: "uuid-v4", x-tenant-id: "..." }
Body: [ { studentId: "88412", timestamp: 1776510345, method: "qr_gate" }, ... ]
  │
  ▼
[ Sanctuary API Edge Handler (Hono/Node) ]
  │
  ├─ Verify tenant authorization & idempotency key in Redis
  ├─ Write bulk rows into `attendance_events_staging` (Zero table locks)
  └─ Return `{ accepted: true, count: 25 }` in <45ms
        │
        ▼ (Worker Queue / Micro-Batcher - Every 5 Seconds)
Consolidate into `AttendanceDailySummary` + broadcast SSE/WebSocket to classroom teachers
```

### C. The WhatsApp Ultra-Lightweight Preview Generator

```
Request: GET https://gurudevi.app/api/og/school?slug=mahamaya&lang=si
  │
  ▼
Edge Function (Cloudflare Workers / Vercel Edge)
  │
  ├─ Inspect Cache (Cloudflare Cache API):
  │    If HIT ➔ Return cached WebP immediately (<15ms, 65KB)
  │
  ├─ If MISS:
  │    1. Fetch minimal school metadata from Edge KV (Name, Crest SVG, Colors)
  │    2. Assemble SVG template:
  │       - Clean typography (Noto Sans Sinhala / Inter)
  │       - School Crest + Tutii Firefly Accent
  │       - Canonical Tagline: "සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම"
  │    3. Convert SVG ➔ WebP (Quality: 80, 1200x630px)
  │    4. Assert buffer size: `assert(buf.length < 250_000)` (WhatsApp safety limit)
  │    5. Store in Edge Cache with `Cache-Control: public, s-maxage=604800`
  │
  └─ Return `Content-Type: image/webp`
```

---

## 5. Phased Execution Roadmap

### Phase 1: Institutional Edge Identity & Media (Immediate Horizon)
1. **Dynamic SVG Badge Route (`/badge.svg`)**:
   - Create edge endpoint taking `?school=[slug]&theme=[diurnal]` returning crisp, resolution-independent vector emblems for embeds.
2. **WhatsApp Safe OG Pipeline (`/api/og`)**:
   - Build edge WebP generator strictly budget-capped at <250KB, asserting Sinhala (`ගුරුදෙවි`) and Tamil (`குருதெவி`) orthography.
3. **Subdomain Header Injection Verification**:
   - Audit `classifyGurudeviHost` to ensure `[school].gurudevi.app` passes tenant boundaries without cookie pollution.

### Phase 2: Commute Continuity & Offline Service Worker (Next Milestone)
1. **PWA Manifest & Serwist Integration in `gurudevi-web`**:
   - Cache fonts (Playfair, Noto Sans Sinhala, Inter), diurnal tokens, and sanctuary shells for zero-network instant launch.
2. **Offline Mutation Queue**:
   - Implement `IndexedDB` transaction buffer for teacher reflections and journal entries with optimistic local commit.
3. **Sync Replay Sentinel**:
   - Background re-sync with exponential backoff and jitter upon online reconnection.

### Phase 3: Dual-Loop Attendance Scalability
1. **Idempotent Batch Ingest Contract**:
   - Define oRPC batch ingest contract with UUID v4 deduplication.
2. **Gate Staging Isolation**:
   - Decouple gate check-in ingestion from relational classroom rollups.
3. **Low-Bandwidth Sound & Visual Feedback**:
   - Pre-bundle Web Audio API synthesized tones (zero network asset fetch) for kiosk confirmation.

---

## 6. Zero-Tolerance Invariants & Verification Checklist

Before any phase is merged or deployed:

* [ ] **The 300KB Gate**: All Open Graph images must test `< 250KB` on raw file inspection.
* [ ] **The Orthography Gate**: Zero forbidden long vowels (`ගුරුදේවි`, `குருதேவி`) or military jargon (`සුරක්ෂිත කෙම්බිම`). Must pass `node scripts/i18n/check-orthography.mjs`.
* [ ] **The Offline Gate**: Disconnecting network in Chrome DevTools must permit drafting a complete reflection in Fire Journal and taking class attendance with zero error popups.
* [ ] **The Subdomain Gate**: A cookie set on `ananda.gurudevi.app` must never be sent or accessible by `nalanda.gurudevi.app`.
* [ ] **Typecheck Cleanliness**: Monorepo packages must pass `pnpm --filter <pkg> check-types` with exit code `0`.
* [ ] **The Deletion Veto**: No working handlers, fallback modes, or tests shall be deleted.
