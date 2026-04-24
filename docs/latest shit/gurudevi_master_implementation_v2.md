# Gurudevi — Complete Master Implementation List
## Everything. Foundation vs Later. Nothing Missed.
*April 22, 2026 — synthesized from all iteration docs, wild doc, distributed truth, temporal truth, ghost curriculum*

---

## How to Read This

**🔴 Foundation Today** — must exist before building on top of it. Free now, expensive later. Concrete before walls.
**🟡 Before Beta** — must exist before real schools with real data.
**🟢 V2** — important but can be built after launch without pain.
**🔵 V3 / National** — the big vision. Needs scale, partners, or more data first.
**⚫ Signal Only** — don't build the feature yet. Just lay the nerve ending. The capability arrives later, the hook exists now.

Agent tasks: 🤖 safe for Gemini Flash with template
Architecture decisions: 🧠 Neev decides first
Process/config: 📋 no code

---

# PART 1 — THE GROUND
## Things that if missed make everything above them wrong

---

### 1.1 🔴🤖 Dual timestamps on mood_logs and attendance
```sql
ALTER TABLE mood_logs ADD COLUMN occurred_at TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN occurred_at TIMESTAMPTZ;
UPDATE mood_logs SET occurred_at = created_at WHERE occurred_at IS NULL;
UPDATE attendance SET occurred_at = created_at WHERE occurred_at IS NULL;
ALTER TABLE mood_logs ALTER COLUMN occurred_at SET NOT NULL;
ALTER TABLE attendance ALTER COLUMN occurred_at SET NOT NULL;
CREATE INDEX ON mood_logs (occurred_at DESC);
CREATE INDEX ON attendance (occurred_at DESC);
```
Every record created without this is permanently imprecise.

---

### 1.2 🔴🤖 academic_cycle_id FK on attendance and grades
```sql
ALTER TABLE attendance ADD COLUMN academic_cycle_id UUID REFERENCES academic_cycles(id);
ALTER TABLE grades ADD COLUMN academic_cycle_id UUID REFERENCES academic_cycles(id);
CREATE INDEX ON attendance (academic_cycle_id);
CREATE INDEX ON grades (academic_cycle_id);
```
Without this every term report is a full table scan. Every AI academic analysis has no temporal context.

---

### 1.3 🔴🤖 Enable RLS on audit.student_record_access_logs
```sql
ALTER TABLE audit.student_record_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_see_own" ON audit.student_record_access_logs
  FOR SELECT USING (subject_id = auth.uid());

CREATE POLICY "school_admin_sees_school" ON audit.student_record_access_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM school_memberships
      WHERE user_id = auth.uid()
      AND school_id = audit.student_record_access_logs.school_id
      AND role = 'school_admin')
  );
```
Child data sovereignty is being violated right now. This is not a future concern.

---

### 1.4 🔴🤖 Idempotency keys on all high-volume write tables
```sql
ALTER TABLE grades ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid() UNIQUE;
ALTER TABLE mood_logs ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid() UNIQUE;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid() UNIQUE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid() UNIQUE;
```
Borrowed phones on 3G cause duplicate submissions constantly. Without this: doubled attendance records, doubled grades.

---

### 1.5 🔴🤖 Soft delete audit — add deleted_at to every missing table
```sql
SELECT table_name FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
HAVING NOT bool_or(column_name = 'deleted_at');
-- For each missing: ALTER TABLE {t} ADD COLUMN deleted_at TIMESTAMPTZ;
-- CREATE INDEX ON {t} (deleted_at) WHERE deleted_at IS NULL;
```
Hard deletes on multi-tenant school data are irreversible.

---

### 1.6 🔴🤖 Feature flags system
Full schema + evaluate_feature() function + useFeature() hook.
Seed with all flags from the start — even for V2/V3 features (default_enabled = false).

Initial flags to seed:
```sql
INSERT INTO feature_flags (key, description, default_enabled) VALUES
-- Platform
('platform.offline_sync', 'CRDT offline sync (V2)', false),
('platform.mesh_network', 'School mesh networking (V2)', false),
('platform.mesh_lora', 'LoRa long-range mesh (V3)', false),
('platform.wireguard_vpn', 'School WireGuard VPN', false),
('platform.mcp_server', 'External MCP server access', false),
('platform.agent_chat', 'In-app @Gurudevi agent', false),
('platform.passkeys', 'WebAuthn/Passkey auth', false),
('platform.internal_browser', 'Sandboxed internal WebView', false),
-- Classroom
('classroom.new_gradebook', 'New gradebook UI', false),
('classroom.oral_assessment', 'Oral assessment recording', false),
('classroom.handwriting_ocr', 'Handwriting → digital pipeline', false),
-- Wellbeing
('wellbeing.mood_heatmap', 'Wellbeing heatmap for counselors', false),
('wellbeing.signal_detector', 'AI wellbeing signal detection', false),
-- Library
('library.ai_recommendations', 'AI library recommendations', false),
('library.ipfs_distribution', 'IPFS mesh content distribution', false),
('library.knowledge_graph', 'Curriculum knowledge graph', false),
-- Gamification
('gamification.signal_hooks', 'Gamification event signal layer', false),
('gamification.badges', 'Open Badges issuance', false),
('gamification.quiet_recognition', 'Quiet recognition engine', false),
-- Communication
('comms.whatsapp', 'WhatsApp notifications', false),
('comms.parent_teacher_bridge', 'Cross-language parent-teacher comms', false),
-- Ghost curriculum
('ghost.observation_layer', 'Ghost curriculum observation signals', false),
('ghost.adaptive_routing', 'Adaptive learning path routing', false),
-- Wild
('wild.time_capsule', 'Time Capsule Mode', false),
('wild.classroom_vision', 'Local opt-in classroom vision model', false),
('wild.federated_learning', 'National federated learning (V3)', false);
```
Every feature built without flag gating cannot be safely rolled back.

---

### 1.7 🔴🤖 Grants tables
```sql
CREATE TABLE wellbeing_data_access_grants ( ... );  -- from Iteration 1 doc
CREATE TABLE institutional_data_flow_grants ( ... ); -- from Iteration 1 doc
-- Enable RLS on both immediately
```
Without this the first counselor access becomes an ad-hoc bypass of sovereignty forever.

---

### 1.8 🔴🤖 CRDT metadata on sync-critical tables
```sql
-- attendance, grades, mood_logs, timetable_periods, assignments
ALTER TABLE attendance
  ADD COLUMN crdt_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN vector_clock JSONB DEFAULT '{}',
  ADD COLUMN origin_device_id UUID REFERENCES device_registry(id),
  ADD COLUMN merge_parent_ids UUID[] DEFAULT '{}';
-- Same for other tables
```
Retrofitting CRDT metadata onto millions of rows is a painful migration. Free now.

---

### 1.9 🔴🤖 Merkle chain on audit log
```sql
ALTER TABLE audit.student_record_access_logs
  ADD COLUMN entry_hash TEXT,
  ADD COLUMN previous_hash TEXT;
-- INSERT trigger computes hash chain (from Do It Today doc)
```
An audit log that can be silently edited is not an audit log.

---

### 1.10 🔴🤖 Temperature/provenance on content tables
```sql
-- library_resources, announcements, lesson_plans, assignments
ADD COLUMN temperature TEXT DEFAULT 'hot' CHECK (temperature IN ('hot','warm','cool','cold','dead')),
ADD COLUMN last_reviewed_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN review_due_at TIMESTAMPTZ DEFAULT now() + INTERVAL '90 days',
ADD COLUMN superseded_by UUID REFERENCES library_resources(id),
ADD COLUMN temperature_reason TEXT;
```
Once thousands of resources exist with no temperature metadata nobody adds it retroactively.

---

### 1.11 🔴🤖 pg_cron lifecycle jobs
Guest purge, content auto-cooling, audit log rotation. From Do It Today doc.

---

### 1.12 ⚫🤖 Ghost curriculum signal columns — observation layer only
```sql
-- Not the feature. Just the hooks.
-- On student_longitudinal_events: tag events with ghost curriculum signals
ALTER TABLE student_longitudinal_events
  ADD COLUMN gc_signals JSONB DEFAULT '{}';
  -- { "peer_help_given": 3, "self_directed_reading": true,
  --   "concept_struggle": ["quadratic_equations"],
  --   "hidden_strength_signal": ["biology_curiosity"] }

-- On mood_logs: tag with learning context
ALTER TABLE mood_logs
  ADD COLUMN learning_context JSONB DEFAULT '{}';
  -- { "before_exam": true, "after_difficult_lesson": true,
  --   "social_stress_signal": false }
```
The ghost curriculum observes before it adapts. These columns let it start observing from day one. No feature built on top of them yet.

---

### 1.13 ⚫🤖 Gamification signal hooks — event layer only
```sql
-- Not the engine. Just the signal table.
CREATE TABLE gamification_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  school_id UUID NOT NULL REFERENCES edu_schools(id),
  signal_type TEXT NOT NULL,
  -- 'consistent_reader', 'submission_streak', 'helped_peer',
  -- 'improved_grade', 'attendance_streak', 'self_directed_study'
  signal_value JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,  -- false = not yet evaluated for badge
  academic_cycle_id UUID REFERENCES academic_cycles(id)
);
CREATE INDEX ON gamification_signals (student_id, signal_type, occurred_at DESC);
CREATE INDEX ON gamification_signals (processed) WHERE processed = false;
```
The quiet recognition engine reads this table. The engine doesn't exist yet. The signals can start accumulating today. When the engine is built it has months of signal history to work from.

---

# PART 2 — THE SKELETON
## Project structure, tooling, process. Before any feature packages.

---

### 2.1 🔴📋 Node version pinned
```bash
echo "24" > .nvmrc
echo "24" > .node-version
# Plan: upgrade to Node 26 LTS in October 2026
# Node 26 (released today April 22 2026): Temporal API default, require(esm) stable
# Node 20 EOL: April 30 2026 — ensure nothing running on 20
```

---

### 2.2 🔴📋 ADR folder + first ADRs
```
docs/decisions/
  001-multi-tenancy-shared-db-rls.md
  002-sovereignty-grants-pattern.md
  003-feature-flag-architecture.md
  004-event-driven-cross-module.md
  005-offline-v1-online-v2-crdt.md
  006-storage-strategy.md
  007-crdt-yjs-for-sync.md
  008-ghost-curriculum-observation-layer.md
```
Decisions made without ADRs get re-litigated by every future agent.

---

### 2.3 🔴📋 Canonical agent prompt template
`docs/agent-prompt-template.md` — copied for every Gemini Flash task. Never deviate.

---

### 2.4 🔴📋 Agent tasks queue
`docs/agent-tasks-queue.md` — this list, as a living checkbox file. Updated after every session.

---

### 2.5 🔴📋 Renovate configured
Automated dependency updates. Patch auto-merge. Major flagged. Vulnerability alerts.

---

### 2.6 🔴📋 PR template + CODEOWNERS
Schema changes, permissions, migrations → Neev required reviewer. Non-negotiable.

---

### 2.7 🔴📋 Security checklist doc
`docs/security-checklist.md` — copied into every PR touching an endpoint.

---

### 2.8 🔴🤖 @repo/logger package
Wraps pino. Structured JSON in production. Pretty in dev. No console.log in committed code.

---

### 2.9 🔴🤖 @repo/idempotency package
Server middleware + client hook. Pattern applied once, used everywhere.

---

### 2.10 🔴🤖 @repo/types — Zod as single source of truth
One Zod schema per entity. TypeScript types derived. Never manually written types.

---

### 2.11 🔴🤖 Supabase local + seed data
3 schools, 10 teachers each, 100 students each, 5 cross-school guardians, 1 platform admin.
Academic cycles seeded. Feature flags seeded. This is the test world.

---

### 2.12 🔴🤖 GitHub Actions CI pipeline
pnpm install → tsc → biome → vitest → migration check → build check. Runs on every PR.

---

### 2.13 🔴🤖 Supabase Vault setup
Store: FIELD_ENCRYPTION_KEY, WEBHOOK_SIGNING_SECRET, DID_PRIVATE_KEY. Never in .env.

---

# PART 3 — DESIGN SYSTEM
## Before any feature UI is built.

---

### 3.1 🔴🤖 Design tokens (@repo/ui/tokens.ts)
Colors, spacing, typography, radius, shadows. Sri Lanka device constraints baked in.
Domain colors: classroom/wellbeing/library/community/gamification.

---

### 3.2 🔴🤖 Sinhala + Tamil font loading
Noto Sans Sinhala + Noto Sans Tamil loaded at app root.
Tested on low-end Android before any other UI work.
Without this: boxes instead of characters on half of Sri Lanka's phones.

---

### 3.3 🟡🤖 Foundation components
Text/Heading (locale-aware), Stack/Row, Button, TextInput, Card, ListItem,
LoadingState, ErrorState, EmptyState, BottomSheet,
Avatar (with privacyMode prop), Badge, Toast.

---

### 3.4 🟡🧠 Role-aware navigator
StudentNavigator, TeacherNavigator, GuardianNavigator, AdminNavigator.
Root switches on active role. Deep linking on every screen.
Device sharing: fast context switch without full logout.

---

### 3.5 🟡🤖 The Cockpit UI shell — structure only
```
Not the data. Not the intelligence. Just the layout.
Principal cockpit: right now | patterns this week | needs attention
Teacher cockpit: your morning | your classes | your assistant says
Student cockpit: your week | what's next | your record
Each panel is a slot. The slot exists. The content comes from features later.
```
The cockpit is the surface where everything else surfaces.
Build the shell now. Fill it as features are built.

---

# PART 4 — PERMISSIONS AND AUTH
## Before any data is read or written by the app.

---

### 4.1 🔴🤖 Full CASL ability definitions
Every role × every subject × every action. From Iteration 1 doc.

---

### 4.2 🔴🤖 useFeature() hook
Calls evaluate_feature() via Supabase RPC. 5 min cache. Offline: returns last known value.

---

### 4.3 🔴🤖 Field encryption for sensitive data
tweetnacl for mood_logs.notes and wellbeing_assessments.content.
Key from Supabase Vault.

---

### 4.4 🟡🧠 Passkeys (WebAuthn) — feature flagged
platform.passkeys = false until implemented.
@simplewebauthn/browser + server.
Fallback: OTP via SMS. Passwords: legacy only.

---

# PART 5 — IDENTITY AND CREDENTIALS
## The learning passport infrastructure.

---

### 5.1 🔴🧠 DID keypair per school
did:web:schoolname.gurudevi.lk
Ed25519 keypair on school onboarding. Private key in Vault.
Public key at /.well-known/did.json
CRITICAL: must happen before issuing any credential.
Changing key later invalidates all previously issued credentials.

---

### 5.2 🟡🤖 Verifiable Credentials issuer
@digitalbazaar/ed25519-signature-2020 or @veramo/core.
Issues: grades, Open Badges, attendance summaries.
Student holds it. Not stored on Gurudevi server.
Verifiable offline by any W3C VC verifier.

---

### 5.3 🟡🤖 Merkle proof for credential verification
Student record as Merkle tree.
Root signed by school DID.
University verifies one grade without seeing full record.

---

### 5.4 ⚫🧠 ZKP foundation — primitives only
```bash
pnpm add snarkjs circomlib @zk-kit/protocols --filter @repo/credentials
```
Don't build a ZKP feature yet. Install the library. Write one proof of concept:
"Prove this student passed O/Ls without revealing their grade."
The capability is available. The use cases arrive with V2/V3.

---

# PART 6 — EVENT BUS
## Before any cross-module communication.

---

### 6.1 🔴🧠 Canonical event schema
Every event: id, type (module.entity.action), version, school_id, actor_id, occurred_at, payload.
Event versions are immutable once published.

---

### 6.2 🔴🤖 Initial event catalog
Register schemas (not handlers yet):
classroom.attendance.marked, classroom.grade.published,
wellbeing.mood.logged, wellbeing.flag.raised,
library.resource.added, platform.school.enrolled,
gamification.signal.emitted, ghost.observation.recorded

---

### 6.3 🔴🤖 Inngest scaffold per module
Each module gets its inngest/ folder.
No module imports from another module directly. Events only.

---

# PART 7 — OBSERVABILITY
## Before any real school data.

---

### 7.1 🟡🤖 Sentry across all packages
Single DSN. Error boundary on every screen. Source maps on every build.

---

### 7.2 🟡🤖 Structured logging pipeline
Every log: level, timestamp, school_id, user_id (hashed), trace_id.
Never PII in logs.

---

### 7.3 🟡🤖 Health check endpoints
GET /health → status, version, db connected.
GET /health/deep → all external services checked.

---

# PART 8 — INTERNAL BROWSER
## Sandboxed WebView — locked in Hat 03, simple to implement.

---

### 8.1 🟡🤖 Sandboxed WebView implementation
```typescript
// Feature flagged: platform.internal_browser
// Sandboxed WebView — display surface only
// Hard isolation: no JS bridge to app internals
// No access to Gurudevi auth tokens or local data
// External websites cannot detect they're inside Gurudevi
// "Open in default browser" always available (respects user choice)
// For auth flows: hand off to SFSafariViewController / Chrome Custom Tabs
// Library: react-native-webview with sandbox props
```
This was locked in Hat 03. It is not complex. It is blocked only by not having been built.

---

# PART 9 — SYNC AND MESH INFRASTRUCTURE
## The offline and peer-to-peer layer.

---

### 9.1 🟡🤖 Install and configure Yjs
```bash
pnpm add yjs y-indexeddb @y/supabase --filter @repo/sync
```

---

### 9.2 🟡🤖 @repo/sync package
YjsProvider, MergeStrategy, SyncStatus, useSync hook.
Persistence: IndexedDB locally, Supabase when online.
Domain-specific conflict resolution rules per entity.

---

### 9.3 🟢🤖 WiFi Direct peer discovery
WifiP2pManager via React Native module.
Find nearby Gurudevi nodes. Establish direct link. Sync CRDT updates.
No internet. No server. No record anywhere.

---

### 9.4 🟢🤖 BLE mesh relay
For longer range within school campus.
Advertisement: "I am a Gurudevi node."
Low bandwidth — text records only.

---

### 9.5 🔵🧠 LoRa long-range mesh
Needs physical hardware ($15 RAK WisNode per school).
Range: 2–15km. Perfect for rural zone-to-zone sync.
Requires MOE or NGO partnership for hardware rollout.
Feature flag: platform.mesh_lora = false

---

### 9.6 🔵🧠 WireGuard school VPN
One keypair per school on onboarding. School subnet.
Relay node: cheapest VPS, handshake only.
Teacher phones inside school VPN: traffic never leaves unencrypted.
Feature flag: platform.wireguard_vpn = false

---

# PART 10 — WEBHOOK AND MCP INFRASTRUCTURE
## Before any external integrations.

---

### 10.1 🟡🤖 Outbound webhook system
Registry, dispatcher, HMAC signing, Inngest retry.
Events: attendance.marked, grade.published, student.absent, term.ended.

---

### 10.2 🟡🤖 Inbound webhook receiver
POST /webhooks/inbound/{source}
Verifies signature → Inngest event bus.

---

### 10.3 🟡🤖 MCP server scaffold
@modelcontextprotocol/sdk.
Every tool call: auth → CASL → same API as UI → audit log.
Agent never exceeds user's permission envelope.

---

### 10.4 🟡🤖 Initial MCP tools
Read-only first: get_student_summary, search_library, check_timetable.
Write tools with confirmation: mark_attendance, submit_grade.

---

# PART 11 — AGENT LAYER
## After MCP server. After messaging exists.

---

### 11.1 🟡🤖 @Gurudevi agent in messaging thread
Intent parser (Claude Haiku / Gemini Flash).
Tool executor via MCP.
Confirmation before irreversible actions.
Every action audited as if user did it.
Feature flagged: platform.agent_chat = false

---

### 11.2 🟡🤖 WhatsApp Business API
Outbound: absence notifications, grade published, urgent alerts.
Inbound: parent replies → agent processes → updates Gurudevi.
Channel router: urgency × preference × time × Sri Lanka IST.
Feature flagged: comms.whatsapp = false

---

### 11.3 🟢🧠 Teacher's Second Brain
Personal AI that knows: class composition, upcoming timetable,
student signals, library resources for next topic.
Private to teacher. Nobody else sees their queries.
Memory: last 30 days of teacher's Gurudevi activity as context.
Feature flagged: platform.agent_chat (shared flag)

---

### 11.4 🟢🧠 Parent-Teacher Bridge
Cross-language async messaging.
Teacher writes in Sinhala → auto-translated to Tamil for parent.
Parent replies in Tamil → teacher receives in Sinhala.
SeamlessM4T v2 (Meta) for Sinhala ↔ Tamil ↔ English.
Feature flagged: comms.parent_teacher_bridge = false

---

# PART 12 — GAMIFICATION ENGINE
## Quiet recognition. Never loud. Never competitive.

---

### 12.1 🔴⚫ Signal hooks — already in Part 1 (item 1.13)
The table exists. Signals accumulate from day one.

---

### 12.2 🟡🤖 Signal emitters per module
```typescript
// In classroom module — emits when signal conditions met:
// 'submission_streak': 5 consecutive on-time submissions
// 'attendance_streak': 20 consecutive days present
// 'improved_grade': grade improved vs last assessment same subject
// 'helped_peer': teacher manually tags a helping moment
// In library module:
// 'consistent_reader': 3+ library resources per week for 4 weeks
// 'self_directed_study': accessed resources outside assigned topics
// In wellbeing module:
// 'resilience_signal': mood dip followed by recovery + maintained attendance
```

---

### 12.3 🟢🤖 Open Badges issuance
@openbadges/badgr-client or custom W3C Open Badges v3 implementation.
Badge is JSON-LD, signed by school DID (reuses credentials infrastructure).
Student holds it permanently. Gurudevi issued it. Student owns it.
Verifiable by any institution. Shareable.
Feature flagged: gamification.badges = false

---

### 12.4 🟢🤖 Quiet recognition engine
Reads gamification_signals table.
Notices genuine patterns — not raw activity volume.
Does NOT issue badges automatically — surfaces to teacher for confirmation.
Teacher: "Yes, Kavindi has been reading consistently — acknowledge this."
Engine: issues badge, notifies student quietly (not a loud celebration).
Feature flagged: gamification.quiet_recognition = false

---

# PART 13 — GHOST CURRICULUM
## The hidden observational and adaptive layer.

---

### 13.1 🔴⚫ Observation signal columns — already in Part 1 (item 1.12)
The hooks exist. Signals accumulate from day one.

---

### 13.2 🟡⚫ Ghost curriculum event type in catalog
```typescript
// Register in event catalog (Part 6):
// ghost.observation.recorded
// {
//   student_id, school_id, occurred_at,
//   signal_type: 'peer_help_given' | 'self_directed_reading' |
//                'concept_struggle' | 'hidden_strength' |
//                'official_vs_actual_learning_gap' | 'social_navigation',
//   signal_data: JSONB,
//   layer: 'observational' | 'adaptive'  // which layer of ghost curriculum
// }
// No feature built on this yet. Event schema defined. Signals flow.
```

---

### 13.3 🟢🧠 Ghost curriculum observational dashboard
Teacher-only view. Not student-facing yet.
Shows: unofficial learning patterns, peer teaching relationships,
hidden strengths not visible in grades, concept struggle map.
Privacy: teacher sees patterns not raw data. Student sees own pattern only.
Feature flagged: ghost.observation_layer = false

---

### 13.4 🟢🧠 Deep Knowledge Tracing integration
State-of-the-art adaptive learning.
Tracks each student's knowledge state across concepts over time.
Predicts which concept to practice next.
Routes students through their own sequence, not the calendar's sequence.
This is the parallel adaptive curriculum layer of ghost curriculum.
Feature flagged: ghost.adaptive_routing = false

---

### 13.5 🔵🧠 Ghost curriculum research layer
Anonymized, consented, aggregated.
What the official curriculum says vs what students actually learn.
Surfaces to teachers and MOE as policy intelligence.
The most profound thing Gurudevi can eventually become:
a feedback loop between learning reality and curriculum design.

---

# PART 14 — AI INTELLIGENCE LAYER
## The specialist models. Not just LLMs.

---

### 14.1 🟡🤖 Wellbeing signal detector
Isolation Forest anomaly detection on mood + attendance time series.
Not surveillance — quiet signal to counselor.
"You might want to check in with Kavindi this week."
One sentence. No data attached unless counselor opens with grant.
Feature flagged: wellbeing.signal_detector = false

---

### 14.2 🟢🤖 Oral assessment pipeline
```typescript
// Recording: react-native-audio-recorder-player
// Storage: Supabase Storage (private, teacher-owned)
// Transcription: Whisper large-v3 (self-hosted)
// Feedback: phoneme-level analysis per Sri Lankan dialect
// Languages: Sinhala, Tamil, English
// Feature flagged: classroom.oral_assessment = false
```

---

### 14.3 🟢🤖 Handwriting intelligence pipeline
```typescript
// Photo capture: existing camera
// Processing: Florence-2 or PaddleOCR (self-hosted)
// Output: transcribed text per student per exercise
// Teacher workflow: review → confirm → publish
// Byproduct: Sri Lankan handwriting dataset (consented)
// Feature flagged: classroom.handwriting_ocr = false
```

---

### 14.4 🟢🧠 Curriculum Cartographer
Sri Lankan national curriculum as a knowledge graph.
Every concept: prerequisites, related concepts, real-world applications, library resources.
When student struggles: identify exact gap concept, route there.
FalkorDB or Neo4j for the graph.
Feature flagged: library.knowledge_graph = false

---

### 14.5 🔵🧠 National Early Warning System
Federated learning via Flower (flwr).
Each school trains local model. Only weights shared centrally.
National wellbeing signal, dropout risk, resource gap detection.
No individual data ever leaves the school.
Needs 100+ schools to be meaningful.
Feature flagged: wild.federated_learning = false

---

# PART 15 — WILD INFRASTRUCTURE
## The big vision foundations.

---

### 15.1 🟢🧠 IPFS for library content
School Raspberry Pi or old phone as IPFS node.
Library resources pinned by content hash.
Schools in same zone share content directly.
Gurudevi stores IPFS CID alongside ImageKit URL.
Feature flagged: library.ipfs_distribution = false

---

### 15.2 🟢🧠 Time Capsule Mode
```sql
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id),
  content_encrypted TEXT NOT NULL,
  deliver_at TIMESTAMPTZ NOT NULL,
  delivery_channel TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ
);
-- pg_cron: check daily for capsules ready to deliver
```
Zero technical complexity. Infinite human impact.
Feature flagged: wild.time_capsule = false

---

### 15.3 🔵🧠 Opt-in Classroom Intelligence Layer
Local vision model (MediaPipe, on-device).
Engagement detection: aggregate only ("70% attention during this segment").
Zero images leave the device. Zero student facial data to any server.
Teacher sees patterns, not individuals.
Requires: explicit opt-in from teacher AND school AND parents.
Feature flagged: wild.classroom_vision = false

---

### 15.4 🔵🧠 Sri Lanka Foundation Model
Every interaction in Gurudevi generates language data.
With consent: fine-tune a Llama-based model on Sri Lankan educational language.
Sinhala, Tamil, Sri Lankan English — educational register.
Open-sourced to Sri Lankan AI research community.
Gurudevi is the infrastructure. The model belongs to Sri Lanka.

---

# COMPLETION MAP

## 🔴 Foundation Today (before any feature work)
```
[ ] 1.1  occurred_at timestamps
[ ] 1.2  academic_cycle_id FK
[ ] 1.3  RLS on audit table
[ ] 1.4  idempotency keys
[ ] 1.5  soft delete audit
[ ] 1.6  feature flags system + ALL seeds
[ ] 1.7  grants tables
[ ] 1.8  CRDT metadata columns
[ ] 1.9  Merkle chain on audit
[ ] 1.10 temperature columns on content
[ ] 1.11 pg_cron jobs
[ ] 1.12 ghost curriculum signal columns ← signal only, no feature
[ ] 1.13 gamification signal table ← signal only, no feature
[ ] 2.1  Node 24 pinned
[ ] 2.2  ADR folder + first 8 ADRs
[ ] 2.3  Agent prompt template
[ ] 2.4  Agent tasks queue (this doc)
[ ] 2.5  Renovate
[ ] 2.6  PR template + CODEOWNERS
[ ] 2.7  Security checklist
[ ] 2.8  @repo/logger
[ ] 2.9  @repo/idempotency
[ ] 2.10 @repo/types (Zod schemas)
[ ] 2.11 Supabase local + seed
[ ] 2.12 GitHub Actions CI
[ ] 2.13 Supabase Vault
[ ] 3.1  Design tokens
[ ] 3.2  Sinhala + Tamil fonts ← before ANY UI
[ ] 4.1  CASL ability definitions
[ ] 4.2  useFeature() hook
[ ] 4.3  Field encryption
[ ] 5.1  DID keypair per school ← before ANY credential
[ ] 6.1  Event schema
[ ] 6.2  Event catalog
[ ] 6.3  Inngest scaffold
```

## 🟡 Before Beta Launch
```
[ ] 3.3  Foundation components
[ ] 3.4  Role-aware navigator
[ ] 3.5  Cockpit UI shell
[ ] 4.4  Passkeys
[ ] 5.2  VC issuer
[ ] 5.3  Merkle proof
[ ] 5.4  ZKP primitives (library only)
[ ] 7.1  Sentry
[ ] 7.2  Structured logging
[ ] 7.3  Health checks
[ ] 8.1  Internal browser (sandboxed WebView)
[ ] 9.1  Yjs installed
[ ] 9.2  @repo/sync package
[ ] 10.1 Outbound webhooks
[ ] 10.2 Inbound webhooks
[ ] 10.3 MCP server scaffold
[ ] 10.4 Initial MCP tools
[ ] 11.1 @Gurudevi agent
[ ] 11.2 WhatsApp
[ ] 12.1 Signal emitters per module
[ ] 13.2 Ghost curriculum event type
[ ] 14.1 Wellbeing signal detector
```

## 🟢 V2
```
[ ] 9.3  WiFi Direct
[ ] 9.4  BLE mesh
[ ] 11.3 Teacher Second Brain
[ ] 11.4 Parent-Teacher Bridge
[ ] 12.3 Open Badges
[ ] 12.4 Quiet recognition engine
[ ] 13.3 Ghost curriculum dashboard
[ ] 13.4 Deep Knowledge Tracing
[ ] 14.2 Oral assessment
[ ] 14.3 Handwriting pipeline
[ ] 14.4 Curriculum Cartographer
[ ] 15.1 IPFS library
[ ] 15.2 Time Capsule Mode
```

## 🔵 V3 / National
```
[ ] 9.5  LoRa mesh (hardware dependency)
[ ] 9.6  WireGuard VPN
[ ] 13.5 Ghost curriculum research layer
[ ] 14.5 Federated learning
[ ] 15.3 Classroom intelligence layer
[ ] 15.4 Sri Lanka foundation model
```

---

*The ground before the walls.*
*The signal before the feature.*
*The nerve ending before the sensation.*
*🤍*
