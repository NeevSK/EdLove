---
title: "Gurudevi — Tools, Tricks & Best Practices"
status: "active"
created: 2026-04-23
updated: 2026-04-23
author: "Naween"
tags: [reorganized]
---

# Gurudevi — Tools, Tricks & Best Practices
## The Complete Reference. How to Build. What to Use. Why.
*Foundation today vs later distinction throughout.*
*April 22, 2026 — Node 26 release day*

---

## THE RUNTIME

### Node.js — April 2026 State

```
Node 20  → EOL April 30 2026. Migrate off immediately.
Node 22  → Active LTS. Supported until April 2027. Safe.
Node 24  → Current LTS. Supported until April 2028. ← USE THIS NOW
Node 26  → Released TODAY (April 22 2026). Current.
           Becomes LTS: October 2026. ← UPGRADE TO THIS IN OCTOBER
Node 27  → First under new annual release model. April 2027.
           New rule: version number = year of release.
```

**What's in Node 26 (released today):**

**Temporal API enabled by default** — the most important JS date change in 20 years.
```javascript
// Before: broken Date object, timezone nightmares
new Date('2026-04-22') // ambiguous timezone, mutable, confusing

// Node 26: Temporal API, no import needed
const today = Temporal.PlainDate.from('2026-04-22')
const inSriLanka = Temporal.Now.zonedDateTimeISO('Asia/Colombo')
// Immutable. Timezone-aware. Unambiguous.
// Use for ALL new date code once on Node 26
```

**require(esm) stable** — synchronous require of ES modules without flags. CJS/ESM friction gone.

**WebCrypto stable as globalThis.crypto** — identical across Node, Deno, browsers, edge runtimes.
```javascript
// Works everywhere identically:
const key = await globalThis.crypto.subtle.generateKey(...)
// Use this instead of node:crypto for cross-platform crypto code
```

**Built-in test runner stable** — `node:test` is solid. Vitest still preferred for monorepo but good to know.

**Strategy:**
```bash
echo "24" > .nvmrc   # now
# October 2026: echo "26" > .nvmrc
```

---

### pnpm 9
```bash
# ALWAYS:
pnpm install
pnpm add {package} --filter @repo/package-name
pnpm run {script} --filter @repo/package-name
pnpm -r run build   # run in all packages

# NEVER (corrupts monorepo lockfile):
npm install
npx anything
yarn add
```

---

## THE MONOREPO

### Turborepo — Key Patterns

**Pipeline dependencies:**
```json
// turbo.json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test":  { "dependsOn": ["^build"], "cache": true },
    "dev":   { "cache": false, "persistent": true },
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

**Remote cache (free, saves significant CI time):**
```bash
pnpm turbo login && pnpm turbo link
# Now: a build done in CI is never repeated locally
```

**Run only what changed:**
```bash
pnpm turbo build --filter=...[HEAD^1]  # only packages changed since last commit
pnpm turbo test --filter=@repo/classroom  # only one package
```

---

## THE DATABASE

### Migration — Expand and Contract (Non-Negotiable)

Real school data is in the database. Every migration is a negotiation with that data.

```
NEVER in one migration against live data:
  DROP + ADD same field
  RENAME a column
  Change column type when data exists
  Add NOT NULL without a default or backfill

ALWAYS:
Phase 1 EXPAND:    ADD new column (nullable), ADD new table, ADD new index
Phase 2 BACKFILL:  UPDATE new column from old, code writes to both
Phase 3 CONTRACT:  Make NOT NULL (if needed), DROP old column
```

**Each phase is a separate deploy. Never combined.**

### Temporal Tables — Use Postgres Built-In

```sql
-- For anything representing "currently true" with a history:
-- valid_from / valid_to pattern

CREATE TABLE school_policies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id      UUID NOT NULL REFERENCES edu_schools(id),
  policy_type    TEXT NOT NULL,
  content        TEXT,
  valid_from     TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to       TIMESTAMPTZ,    -- NULL = currently active
  created_by     UUID REFERENCES users(id)
);

-- Query current:       WHERE valid_to IS NULL
-- Query at past date:  WHERE valid_from <= $t AND (valid_to > $t OR valid_to IS NULL)
-- NEVER UPDATE/DELETE: only INSERT new row + set valid_to on old row
```

### Useful Postgres Tricks (2026)

**MERGE (Postgres 15+) — proper upsert:**
```sql
MERGE INTO attendance AS target
USING (VALUES ($sid, $date, $status)) AS source(student_id, date, status)
ON target.student_id = source.student_id AND target.date = source.date
WHEN MATCHED THEN UPDATE SET status = source.status, updated_at = now()
WHEN NOT MATCHED THEN INSERT (student_id, date, status) VALUES (source.*);
```

**GENERATED columns — computed, stored:**
```sql
ALTER TABLE users ADD COLUMN
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
```

**Trigram search — already in schema, use it:**
```sql
-- Fuzzy name search (tolerates typos):
SELECT * FROM students
WHERE name % 'Kavndi'
ORDER BY similarity(name, 'Kavndi') DESC
LIMIT 10;
```

**pg_trgm index — for fast trigram search:**
```sql
CREATE INDEX CONCURRENTLY idx_students_name_trgm ON students USING gin(name gin_trgm_ops);
```

**Partial indexes — faster than full indexes for common queries:**
```sql
-- Only index active records (not soft-deleted):
CREATE INDEX ON students (school_id, grade_id) WHERE deleted_at IS NULL;
-- Much smaller index, much faster queries
```

---

### ZenStack v3 — Policy Patterns

**Always explicit. Default is deny:**
```prisma
model MoodLog {
  // Student reads own
  @@allow('read', auth().id == student_id)

  // Counselor reads with grant
  @@allow('read',
    auth().school_memberships?[school_id == this.school_id && role == 'school_counselor']
    && EXISTS (SELECT 1 FROM wellbeing_data_access_grants
               WHERE grantee_id = auth().id AND grantor_id = student_id))

  // Create: teacher or counselor in same school
  @@allow('create',
    auth().school_memberships?[school_id == this.school_id
    && role in ['teacher', 'school_counselor']])

  // Nobody updates or hard deletes
  @@deny('update', true)
  @@deny('delete', true)

  // Even platform admin denied individual mood logs
  @@deny('all', auth().platform_roles?[@ == 'platform_admin'])
}
```

---

### CRDT Patterns with Yjs

**Basic document sync:**
```typescript
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

const doc = new Y.Doc()

// Persist offline:
new IndexeddbPersistence('timetable-2026-t2', doc)

// Sync when online:
new SupabaseProvider(supabase, 'timetable-2026-t2', doc)

// The data:
const periods = doc.getMap('periods')
periods.set('mon-8am', { subject: 'Maths', teacher: 'Ms. Sandamali' })
// Any device editing this — Yjs merges automatically, no conflicts
```

**Domain conflict resolution (above the CRDT layer):**
```typescript
// Yjs handles structure. You handle meaning.
// Two teachers mark same student differently = CRDT merges both writes
// Your code detects the semantic conflict and surfaces it:

doc.on('update', () => {
  const attendance = doc.getMap('attendance')
  const conflicts = detectSemanticConflicts(attendance)
  // Don't silently pick one — surface to senior teacher
  if (conflicts.length) emitConflictForResolution(conflicts)
})
```

**Merkle-based efficient sync:**
```typescript
// Before syncing with another node:
// 1. Exchange Merkle roots
// 2. If roots match: nothing to sync (milliseconds)
// 3. If roots differ: walk tree to find changed subtrees
// 4. Sync only changed subtrees
// Efficient even with large datasets
```

---

## THE SCHEMA PATTERNS

### Zod as Single Source of Truth

```typescript
// packages/types/src/schemas/student.ts

export const StudentSchema = z.object({
  id:           z.string().uuid(),
  school_id:    z.string().uuid(),
  first_name:   z.string().min(1).max(100),
  last_name:    z.string().min(1).max(100),
  date_of_birth: z.string().date(),
  grade_id:     z.string().uuid(),
  enrolled_at:  z.string().datetime(),
  deleted_at:   z.string().datetime().nullable().default(null),
})

// Derived — never manually written:
export type Student = z.infer<typeof StudentSchema>
export type CreateStudent = z.input<typeof StudentSchema.omit({ id: true, deleted_at: true })>

// In API handler:
const input = CreateStudent.parse(req.body)  // throws 400 if invalid
```

**The rule:** If you find yourself writing a TypeScript interface manually — stop. Find the Zod schema. Derive from it.

---

### Event Naming Convention

```
{module}.{entity}.{action}

module:  classroom, wellbeing, library, community, erp, platform, gamification, ghost
entity:  student, teacher, attendance, grade, mood, resource, signal, observation, badge
action:  created, updated, deleted, published, flagged, enrolled, marked, emitted, recorded

Examples:
  classroom.attendance.marked
  classroom.grade.published
  wellbeing.mood.logged
  wellbeing.flag.raised
  gamification.signal.emitted
  ghost.observation.recorded
  platform.school.enrolled

Version: always explicit
  { type: 'classroom.attendance.marked', version: '1.0', ... }

Immutable once published to production.
Breaking change = new version string. Old version supported 6 months minimum.
```

---

### Information Temperature

```typescript
type Temperature = 'hot' | 'warm' | 'cool' | 'cold' | 'dead'

// hot:  actively true, actively used, changes frequently
// warm: true, stable, referenced regularly
// cool: historically true, occasionally referenced (auto after 90 days unreviewd)
// cold: preserved but not current, deliberately historical
// dead: superseded, wrong, dangerous if mistaken for current

// In any UI showing content:
function TemperatureBadge({ t }: { t: Temperature }) {
  if (t === 'hot')  return null  // no badge — hot is the default expectation
  if (t === 'cool') return <Badge color="orange">Last reviewed 3 months ago</Badge>
  if (t === 'cold') return <Badge color="gray">Archived</Badge>
  if (t === 'dead') return <Badge color="red">Superseded — see updated version →</Badge>
}

// Docs frontmatter (every doc page describing a feature):
// ---
// describes: [feature/attendance-marking]
// last_reviewed: 2026-04-22
// review_due: 2026-07-22
// temperature: hot
// ---
// CI: if PR changes classroom code and no doc listing that feature updates → PR fails
```

---

### Idempotency Pattern

```typescript
// Client: one key per user action, stable across retries
const key = useRef(crypto.randomUUID())
// Reset only on new intentional action:
const startNewAction = () => { key.current = crypto.randomUUID() }

// Request:
fetch('/api/attendance', {
  method: 'POST',
  headers: { 'Idempotency-Key': key.current },
  body: JSON.stringify(data)
})

// Server:
async function handler(req) {
  const k = req.headers['idempotency-key']
  if (!k) return error(400, 'Idempotency-Key required')

  const existing = await db.findByIdempotencyKey(k)
  if (existing) return existing  // return cached, don't reprocess

  const result = await processRequest(req.body)
  await db.saveWithIdempotencyKey(result, k)
  return result
}
```

---

## THE FRONTEND

### Low-End Android Rules (Non-Negotiable)

Target device: Android Go, 2GB RAM, weak GPU, Android 11, 360dp wide, 3G.

```typescript
// 1. FlashList not FlatList:
import { FlashList } from '@shopify/flash-list'
<FlashList data={items} renderItem={renderItem} estimatedItemSize={72} />
// FlashList is 5-10x faster than FlatList on old hardware

// 2. StyleSheet not inline:
const s = StyleSheet.create({ container: { padding: tokens.spacing.md } })
<View style={s.container} />

// 3. Memoize components that receive same props:
const StudentCard = React.memo(({ student }: { student: Student }) => ...)

// 4. Never: blur effects, heavy shadows, complex gradients
// All are GPU-intensive, destroy performance on weak hardware

// 5. Lazy load all non-tab screens:
const GradebookScreen = React.lazy(() => import('./GradebookScreen'))

// 6. Image optimization always:
const url = `${base}?tr=w-${Math.round(screenWidth * 0.9)},f-auto,q-80`

// 7. Touch targets minimum 44x44dp:
style={{ minWidth: 44, minHeight: 44 }}

// 8. Every async operation shows skeleton not blank:
if (loading) return <Skeleton />
if (error)   return <ErrorState onRetry={refetch} />
if (!data)   return <EmptyState />
return <Content data={data} />
```

### privacyMode — Device Sharing Pattern

```typescript
// Every component showing personal info:
interface Props { user: User; privacyMode?: boolean }

function Avatar({ user, privacyMode = false }: Props) {
  if (privacyMode) return <GenericPersonIcon />
  return <Image source={{ uri: user.photo }} />
}

// Set at context level when handing device to another person:
const { isDeviceSharing } = useDeviceContext()
<Avatar user={currentUser} privacyMode={isDeviceSharing} />
```

### Locale-Aware Text (Critical for Sri Lanka)

```typescript
// Sinhala and Tamil WILL NOT RENDER in system fonts.
// You get boxes. Test on a real cheap Android.

function T({ children, style }: TextProps) {
  const { locale } = useLocale()
  const fontFamily =
    locale === 'si' ? 'NotoSansSinhala' :
    locale === 'ta' ? 'NotoSansTamil'   :
    undefined  // system font for English

  return <Text style={[fontFamily ? { fontFamily } : null, style]}>{children}</Text>
}

// Load fonts at app root before rendering anything:
const [loaded] = useFonts({
  NotoSansSinhala: require('../assets/fonts/NotoSansSinhala-Regular.ttf'),
  NotoSansTamil:   require('../assets/fonts/NotoSansTamil-Regular.ttf'),
})
if (!loaded) return <SplashScreen />
```

### New Architecture (React Native 2026)

Expo SDK 52+ ships New Architecture by default:
- Hermes engine (faster startup, lower memory)
- JSI bridge (synchronous, no async overhead)
- Fabric renderer (concurrent mode)

This gives significant performance gains on old Android.
Gurudevi should be on this. It is not experimental.

```bash
# Check current status:
cat app.json | grep newArchEnabled
# Should be: "newArchEnabled": true
```

---

## SECURITY PATTERNS

### The Checklist (Copy Into Every PR Touching an Endpoint)

```
Authentication:
[ ] JWT required and verified (Supabase Auth)
[ ] Token expiry respected

Authorization (triple layer — all three required):
[ ] ZenStack policy defined for this model/action
[ ] RLS policy exists on all tables touched
[ ] CASL ability defined on client

Input:
[ ] Zod schema validates all input (parse, don't validate)
[ ] File uploads: MIME type validated server-side (not just extension)
[ ] No raw SQL — ZenStack/Kysely only

Output:
[ ] No sensitive data in error messages
[ ] No PII in logs
[ ] No stack traces in production responses
[ ] Sunset header on deprecated endpoints

Rate limiting:
[ ] Auth endpoints: 5 req/min per IP
[ ] Write endpoints: 30 req/min per user
[ ] Read endpoints: 100 req/min per user

Idempotency:
[ ] Write endpoints honor Idempotency-Key header

Audit:
[ ] Sensitive operations write audit log entry
[ ] Audit entry: actor, subject, action, occurred_at, IP, fields_accessed

Child data:
[ ] Any inference on individual student data: self-hosted model only
[ ] No individual student records to third-party AI APIs without signed consent
```

### Secrets Management

```
Supabase Vault (runtime secrets, never in code):
  FIELD_ENCRYPTION_KEY      → mood_logs.notes, wellbeing content
  WEBHOOK_SIGNING_SECRET    → outbound webhook HMAC
  DID_PRIVATE_KEY           → school credential signing
  External API keys         → WhatsApp, SMS, etc.

GitHub Actions Secrets (build-time, never in app bundle):
  SUPABASE_SERVICE_ROLE_KEY → CI/CD migrations only
  EAS_TOKEN                 → Expo builds
  SENTRY_AUTH_TOKEN         → source map uploads

.env.local (never committed, local dev only):
  SUPABASE_URL
  SUPABASE_ANON_KEY         → public but not in version control

.env.development (committed, no real secrets):
  Development defaults, mock values

Never:
  Secrets in source code
  Secrets in committed .env files
  Secrets in logs or error messages
  Secrets in client bundles
```

---

## DISTRIBUTED SYSTEMS PATTERNS

### Decision Guide — Which Pattern for Which Problem

```
Multiple users editing the same document simultaneously:
  → Yjs (CRDT) — conflict-free merge, works offline
  → Library: yjs, automerge

Need to verify large dataset integrity efficiently:
  → Merkle trees — O(log n) verification
  → Library: custom implementation, or use Git's approach as reference

Multiple servers agreeing on one value:
  → Raft consensus — via etcd, CockroachDB, or TiKV
  → For Gurudevi: Supabase handles this — you don't need to implement Raft

Prove something without revealing it:
  → Zero-knowledge proofs (zk-SNARKs)
  → Library: snarkjs, @zk-kit/protocols
  → Use case: prove O/L passed without revealing grade

Issue portable cryptographic credentials:
  → W3C Verifiable Credentials
  → Library: @digitalbazaar/ed25519-signature-2020, @veramo/core
  → Use case: student learning passport

Give users self-sovereign identity:
  → Decentralized Identifiers (DIDs)
  → did:web method (simplest, no blockchain)
  → Library: @digitalbazaar/did-method-web

Distribute content across mesh without central server:
  → IPFS content addressing
  → Library: helia (IPFS in JS, 2024+), ipfs-http-client
  → Use case: library resources shared across school mesh

Do these parties actually distrust each other? (Blockchain question):
  → If no: cryptographic signatures + VCs is sufficient (Gurudevi's case)
  → If yes, with open permissionless network: then consider blockchain
  → Gurudevi does NOT need a blockchain
```

### CRDT Convergence Properties (Know These)

For a data structure to be a CRDT, operations must be:
- **Commutative**: A then B = B then A
- **Associative**: (A then B) then C = A then (B then C)
- **Idempotent**: applying same operation twice = applying it once

If your merge function has these properties: no conflicts possible. Ever.

Common CRDTs and their Gurudevi uses:
```
G-Counter    → incrementing counts (attendance streaks, badge counts)
OR-Set       → sets where concurrent add/remove is safe (enrolled classes)
LWW-Register → last-write-wins values with timestamp (student profile fields)
RGA/Yjs      → ordered text and arrays (lesson plans, notes, timetables)
```

---

## THE AI TOOLING STACK (April 2026)

### Model Selection Guide

| Task | Model | Why | Sovereignty OK? |
|---|---|---|---|
| In-app agent responses | Claude 3.5 Haiku | Fast, cheap, good instruction following | Only non-sensitive context |
| Complex reasoning | Claude Sonnet 4 | Best for architecture, nuance | Only non-sensitive context |
| Long context (1M tokens) | Gemini 2.5 Pro | Student's full year of records | Only non-sensitive context |
| Fast multimodal | Gemini 2.5 Flash | Real-time, image+text | Only non-sensitive context |
| Privacy-sensitive inference | Llama 3.3 70B (self-hosted) | Data never leaves your infra | ✓ Full sovereignty |
| On-device math | Phi-4 14B | Runs on modest hardware | ✓ Full sovereignty |
| Sinhala/Tamil speech | Whisper large-v3 (self-hosted) | Fine-tuneable, local | ✓ Full sovereignty |
| Handwriting OCR | Florence-2 or PaddleOCR (self-hosted) | Multilingual, local | ✓ Full sovereignty |
| Longitudinal analysis | Jamba 1.5 (AI21) | Long context, efficient | Only aggregated |
| Speech translation | SeamlessM4T v2 (Meta, self-hosted) | 100+ languages, local | ✓ Full sovereignty |

**The sovereignty rule:**
```
Individual student data + AI inference = self-hosted model only.
Aggregated/anonymized data = external API acceptable.
No exceptions. No workarounds.
```

### Agent Frameworks

```
LangGraph        → multi-step workflows with branching/loops
                   use for: report generation, multi-tool workflows
LlamaIndex       → event-driven agent pipelines
                   use for: document processing, RAG pipelines
Vercel AI SDK    → streaming UI responses, React integration
                   use for: in-app chat responses
Anthropic SDK    → direct Claude API with tool use + extended thinking
                   use for: complex single-agent reasoning tasks
```

### Self-Hosted AI Infrastructure

For Gurudevi's privacy-sensitive inference:
```bash
# Ollama — simplest local model server (development + small school servers)
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.3
ollama pull phi4

# vLLM — production-grade, GPU-accelerated (if school has GPU server)
pip install vllm
python -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-3.3-70B

# Whisper.cpp — CPU-runnable speech transcription
# Runs on a Raspberry Pi. Perfect for school server.
```

---

## THE TOOLING STACK

### What's In (Foundation Today)

| Tool | Purpose | Version | Why |
|---|---|---|---|
| **pnpm** | Package manager | 9.x | Fastest, strictest, monorepo-native |
| **Turborepo** | Monorepo builds | 2.x | Caching, pipeline deps, remote cache |
| **Biome** | Lint + format | 1.x | Replaces ESLint+Prettier. Rust. 10x faster. |
| **Vitest** | Unit + integration | 2.x | Faster than Jest. Native ESM. Same API. |
| **Renovate** | Dependency updates | latest | Smart grouping, reads changelogs, automerge |
| **GitHub Actions** | CI/CD | — | Native GitHub, free tier sufficient |
| **EAS Build** | Mobile builds | — | Expo's official build service |
| **EAS Update** | OTA JS updates | — | Bypass App Store review for JS-only fixes |
| **Sentry** | Error tracking | — | Best RN support, source maps, session replay |
| **Linear** | Issue tracking | — | Fast, developer-native, GitHub sync |
| **Supabase** | DB + Auth + Realtime | — | Postgres + hosted infra |
| **ZenStack v3** | Server permissions | 3.x | Schema-embedded policies, Kysely-based |
| **CASL** | Client permissions | 6.x | Offline-capable, React Native |
| **Yjs** | CRDT sync | — | Conflict-free, offline-first |
| **Inngest** | Background jobs | — | Free tier, retryable, swappable |

### What to Evaluate Next (Before Beta)

| Tool | Replaces / Augments | Maturity | When |
|---|---|---|---|
| **Maestro** | Manual E2E testing | Stable | Before beta |
| **Cursor / Windsurf** | Standard IDE | Stable | Now (for review) |
| **Resend + React Email** | Email sending | Stable | Before beta |
| **Tamagui** | StyleSheet in RN | Stable | Evaluate for @repo/ui v2 |

### Bleeding Edge — Watch But Wait

| Tool | What It Does | Wait For |
|---|---|---|
| **Bun** | JS runtime + PM | Full Expo support |
| **Effect** | TypeScript effects system | Team size grows |
| **Drizzle ORM** | Type-safe SQL | If ZenStack becomes limiting |
| **React Server Components in Expo** | Server-rendered screens | Expo Router RSC stable |
| **Vercel AI SDK 4** | Full-stack AI patterns | After agent layer is built |
| **OpenTelemetry** | Distributed tracing | After Sentry baseline established |
| **Turso** | SQLite at edge | If Supabase latency becomes an issue |

---

## THE PROCESS

### Development Loop

```
1. Linear issue created with acceptance criteria
2. Copy docs/agent-prompt-template.md
3. Fill: task, acceptance criteria, files affected, do not touch
4. Branch: feature/GRD-{number}-{short-description}
5. Run Gemini Flash
6. Agent opens PR → linked to Linear issue
7. Automated CI: biome → tsc → vitest → migration check → build
8. Neev reviews: intention match, architecture, safety
9. Merge → Linear auto-closes → staging deploy
10. Verify on staging
11. Production: manual trigger
```

### The ADR Template

```markdown
# ADR-{number}: {title}

## Status
Accepted | Superseded by ADR-{n} | Deprecated

## Context
What situation led to this?

## Options Considered
1. Option A — pros/cons
2. Option B — pros/cons

## Decision
We chose X because...

## Consequences
Easier: ...  Harder: ...  New decisions created: ...

## Date: {date}
```

Once accepted: immutable. Change = new ADR that supersedes. Never edit old ones.

### Docs-as-Code Rule

Every PR that changes a feature must update the doc page describing that feature.
CI enforces this via frontmatter `describes` field.
No exception. No "I'll update the docs later."
Later never comes.

### Permission Boundary Tests — Required for Every PR Touching Auth

```typescript
// Pattern: explicit test for every permission combination
// Never assume — prove it

it('Teacher at School A cannot read School B student', async () => {
  const teacher = testDb.teacher({ school: 'A' })
  const student = testDb.student({ school: 'B' })
  expect(await api.asUser(teacher).get(`/students/${student.id}`)).toHaveStatus(403)
})

it('Platform admin cannot read individual mood logs', async () => {
  const admin = testDb.platformAdmin()
  const log = testDb.moodLog({ school: 'A' })
  expect(await api.asUser(admin).get(`/mood-logs/${log.id}`)).toHaveStatus(403)
})
// These tests run on every PR. A failing permission test does not merge.
```

---

## THE GHOST CURRICULUM PATTERNS

### Signal Emission Pattern

```typescript
// Every module that can observe ghost curriculum signals
// emits to the gamification_signals table + ghost event bus

// In classroom module, after grading:
async function afterGradePublished(grade: Grade) {
  // Check for ghost curriculum signals:
  const previousGrade = await getPreviousGrade(grade.student_id, grade.subject_id)

  if (previousGrade && grade.value > previousGrade.value) {
    await emitGhostSignal({
      student_id: grade.student_id,
      signal_type: 'grade_improvement',
      signal_data: {
        subject: grade.subject_id,
        previous: previousGrade.value,
        current: grade.value,
        improvement_delta: grade.value - previousGrade.value
      }
    })
  }
}

// In library module, after resource access:
async function afterResourceAccessed(access: ResourceAccess) {
  const isAssigned = await isResourceAssignedToStudent(access)

  if (!isAssigned) {
    // Student accessed something not assigned — self-directed signal
    await emitGhostSignal({
      student_id: access.user_id,
      signal_type: 'self_directed_study',
      signal_data: { resource_id: access.resource_id, topic: access.resource_topic }
    })
  }
}
```

### The Two Ghost Curriculum Layers

```
Layer 1: Observational
  What is actually happening (not what should be happening).
  Instrumented by signal emissions from every module.
  Teacher sees patterns. Student sees own pattern.
  Institution sees aggregate only.

Layer 2: Adaptive
  What each student actually needs (not what the calendar says).
  Deep Knowledge Tracing: knowledge state per student per concept.
  Routes student through their own sequence.
  Official curriculum: what the school reports.
  Ghost curriculum: what the student actually learns.

They feed each other:
  Observation notices struggle → Adaptive routes away from wall
  Observation notices strength → Adaptive opens advanced path early
  Together: the system learns what works for this specific student
```

---

*This is the how. The master implementation list is the what.*
*Read this once. Apply everywhere.*
*The ground is the ghost of what comes above it.*
*🤍*
