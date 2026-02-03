# GURUDEVI TECHNICAL ARCHITECTURE v2.0

**Document Type**: System Architecture  
**Version**: 2.0  
**Date**: February 2, 2026  
**Status**: Production Foundation  
**Purpose**: Technical blueprint for Gurudevi - how the system is structured and why

---

## Document Scope

**This Document Covers**:
- System architecture decisions and rationale
- Technology stack and components
- Data models and database design
- Security and access control
- Sync strategy and offline approach
- Scale characteristics and constraints

**This Document Does NOT Cover**:
- Product specifications (see PRODUCT_SPEC.md)
- UI/UX design patterns (see UX_DESIGN.md)
- Implementation guides (see IMPLEMENTATION.md)
- Business model or pricing (see PRODUCT_SPEC.md)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Data Architecture](#3-data-architecture)
4. [Security Model](#4-security-model)
5. [Sync Strategy](#5-sync-strategy)
6. [Scale Characteristics](#6-scale-characteristics)

---

# 1. SYSTEM OVERVIEW

## 1.1 What the System Is

**Type**: Multi-tenant educational platform  
**Deployment**: Mobile-first (iOS/Android), cloud-backed  
**Primary User**: Teachers (heavy lifters)  
**Secondary Users**: Principals (redefined role), Students (architectural support)  
**Context**: Sri Lankan schools, trilingual (Sinhala/Tamil/English)

## 1.2 Core Architecture Principles

### Principle 1: Same Reality, Different Views
All users navigate the same educational reality through the same 5-part structure:
- **Self**: Personal space (wellbeing, reflection)
- **Classroom**: Active workspace (teaching/learning)
- **Community**: Collective space (communication)
- **Library**: Knowledge repository (resources)
- **Profile**: Identity and settings

**Rationale**: This reflects how humans actually exist in educational space. Same navigation structure, role-based content depth.

### Principle 2: Teacher-Centric Hierarchy
Development priority and feature depth:
1. **Teacher** - Core user, heaviest feature development
2. **Principal** - Important but different role, redefined information flow
3. **Student** - Architecturally supported, minimal v0.1 features

**Rationale**: Teachers are the heavy lifters of both school and app. System serves them first.

### Principle 3: Cloud-First, Offline-Later
- v0.1: Cloud-only (Supabase realtime)
- v1.0: Hybrid (local SQLite + cloud sync)

**Rationale**: Ship fast, add complexity when validated. Most Sri Lankan schools have 4G coverage (95%+). Offline architecture adds significant development time and most features require connectivity anyway.

### Principle 4: Multi-Tenant from Day 1
One database serves all schools, isolated via `school_id` and Row-Level Security (RLS).

**Rationale**: Enables cross-school features, simpler infrastructure, easier migrations, cost-effective scaling.

---

# 2. TECHNOLOGY STACK

## 2.1 Stack Overview

```
┌─────────────────────────────────────────┐
│           CLIENT (Mobile App)            │
├─────────────────────────────────────────┤
│ Framework: Expo 54 + React 19           │
│ Language: TypeScript 5.x                │
│ UI Library: Gluestack UI v2             │
│ Navigation: React Navigation 7          │
│ State: Zustand + MMKV                   │
│ Animation: Reanimated 3                 │
│ i18n: i18next                           │
├─────────────────────────────────────────┤
│      LOCAL STORAGE (v1.0 only)          │
│ Database: SQLite + Drizzle ORM          │
│ (Not WatermelonDB)                      │
└─────────────────────────────────────────┘
                    ↕ HTTPS
┌─────────────────────────────────────────┐
│         BACKEND (Supabase)              │
├─────────────────────────────────────────┤
│ Database: PostgreSQL 15+                │
│ API: PostgREST (auto-generated)         │
│ Auth: GoTrue (JWT-based)                │
│ Realtime: WebSocket subscriptions       │
│ Storage: S3-compatible file storage     │
│ Functions: Deno edge functions          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│          INTEGRATIONS (v0.1+)           │
├─────────────────────────────────────────┤
│ Payments: PayHere (Sri Lanka)           │
│ OCR: Expo OCR (v0.5+)                   │
│ Monitoring: Sentry                      │
│ Analytics: PostHog                      │
└─────────────────────────────────────────┘
```

## 2.2 Stack Decisions & Rationale

### Frontend: Expo 54 + React 19

**Decision**: Use Expo (managed workflow), not bare React Native

**Why Expo**:
- Faster development (pre-configured tooling)
- OTA updates (fix bugs without app store approval)
- Better for small team (less DevOps overhead)
- Strong AI agent support (well-documented patterns)
- Can eject to bare React Native if needed later

**Why React 19**:
- Latest stable React features
- Better concurrent rendering
- Improved TypeScript support
- Proven in production (upgraded from React Native default)

**Trade-offs**:
- Slightly larger bundle size (~30MB vs ~20MB bare)
- Some native modules unavailable (acceptable for our use case)
- Expo version updates lag React Native by 2-4 weeks

### State Management: Zustand + MMKV

**Decision**: Use Zustand for reactive state, MMKV for persistence

**Why NOT WatermelonDB** (for v0.1):
- Adds 2+ days learning curve
- Unnecessary for cloud-first architecture
- Sync complexity not needed yet
- Can add SQLite + Drizzle in v1.0 when offline needed

**Why Zustand**:
- Minimal boilerplate
- Good TypeScript support
- No React Context overhead
- Simple API, easy to understand

**Why MMKV**:
- Faster than AsyncStorage (10-30x)
- Synchronous API
- Good for user preferences, auth tokens

**Trade-offs**:
- Must manually manage data persistence
- No built-in reactivity to storage changes (Zustand handles reactivity)

### Backend: Supabase

**Decision**: Use Supabase, not Firebase/AWS/custom backend

**Why Supabase**:
- **Open-source** (can self-host, no vendor lock-in)
- **PostgreSQL** (relational, powerful queries, well-known)
- **Built-in auth** (GoTrue handles JWT, sessions)
- **Built-in realtime** (WebSocket subscriptions)
- **Built-in storage** (S3-compatible file storage)
- **Row-Level Security** (database-level authorization)
- **Auto-generated API** (PostgREST, no custom endpoints needed)
- **Free tier** (500MB DB, 1GB storage, 50K MAU)

**Why NOT Firebase**:
- Vendor lock-in (Google-owned, closed source)
- NoSQL (Firestore harder for complex queries)
- Cannot self-host
- More expensive at scale

**Why NOT AWS**:
- Too complex for small team (requires DevOps expertise)
- 2-4 weeks setup time (unacceptable for 3-month timeline)

**Why NOT custom backend**:
- Would take 8-11 weeks to build (API + auth + storage + realtime)
- Not feasible for timeline

**Trade-offs**:
- Less mature than Firebase (fewer integrations)
- Smaller community
- Must handle migrations manually

### UI Framework: Gluestack UI v2

**Decision**: Use Gluestack UI instead of custom components

**Why**:
- Built for React Native + Expo
- Accessibility baked in
- Themeable (supports sanctuary color palette)
- Good TypeScript support
- Active development

**Alternative considered**: NativeWind (Tailwind for RN)
- Rejected: Harder to theme, less accessible defaults

### Payments: PayHere

**Decision**: Use PayHere for Sri Lankan payment processing

**Why**:
- **Local** (Sri Lanka-specific)
- Supports LKR directly
- Mobile money integration (eZ Cash, mCash)
- Familiar to Sri Lankan users
- Lower fees than international processors

**Alternatives considered**: Stripe
- Rejected: Poor LKR support, higher fees, unfamiliar to users

---

# 3. DATA ARCHITECTURE

## 3.1 Multi-Tenant Model

**Decision**: Single database for all schools, isolated via `school_id`

### Schema Pattern
```sql
-- Every table has school_id for tenant isolation
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  -- ... other fields
);

-- RLS policy enforces isolation
CREATE POLICY "School members only"
  ON lessons FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );
```

**Why Multi-Tenant**:
- Simpler infrastructure (one Postgres instance)
- Cross-school features possible (teacher resource sharing)
- Easier migrations (single schema update)
- Cost-effective (shared resources)
- Scales 1 → 1000 schools without architecture changes

**Why NOT Separate Databases Per School**:
- Infrastructure complexity (multiple Postgres instances)
- Migration nightmare (must update each DB)
- No cross-school features possible
- Higher costs (duplicate resources)
- Harder to debug (which DB has the issue?)

**Trade-offs**:
- Must be careful with RLS policies (data leakage risk)
- Noisy neighbor problem (one school's heavy use affects others)
- Mitigation: Connection pooling, query timeouts, monitoring

## 3.2 UUID Strategy

**Decision**: Use UUIDs for all primary keys, not integer auto-increment

### UUID Generation
```sql
-- Server-generated (default)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- Client-generated (for offline support in v1.0)
-- Client generates UUID, server accepts it
INSERT INTO lessons (id, ...) VALUES ('a1b2c3...', ...);
```

**Why UUIDs**:
- **Offline-ready** (client can generate IDs without server)
- **No collisions** (merge conflicts impossible)
- **Security** (non-sequential, harder to guess)
- **Multi-tenant safe** (no ID overlap between schools)

**Why NOT Integer Auto-Increment**:
- Server-dependent (requires online connection)
- Merge conflicts in offline sync
- Sequential = security risk (predictable IDs)
- Harder to migrate between databases

**Trade-offs**:
- Slightly larger storage (16 bytes vs 4 bytes)
- Slower index performance (acceptable for our scale)
- Less human-readable (use display IDs for user-facing)

## 3.3 Core Tables (v0.1)

### User & School Management
```sql
-- Schools (multi-tenant root)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (all roles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'principal')),
  full_name TEXT NOT NULL,
  language TEXT DEFAULT 'en' CHECK (language IN ('si', 'ta', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Classroom & Learning
```sql
-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  grade TEXT,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classroom enrollments
CREATE TABLE classroom_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id),
  student_id UUID NOT NULL REFERENCES users(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  classroom_id UUID NOT NULL REFERENCES classrooms(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('pdf', 'video', 'text', 'link')),
  content_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  lesson_id UUID REFERENCES lessons(id),
  classroom_id UUID NOT NULL REFERENCES classrooms(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  student_id UUID NOT NULL REFERENCES users(id),
  content TEXT,
  file_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  grade NUMERIC(5,2),
  feedback TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Community & Communication
```sql
-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  author_id UUID NOT NULL REFERENCES users(id), -- principal
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Read receipts
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id),
  user_id UUID NOT NULL REFERENCES users(id),
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);
```

### Library
```sql
-- Resources (curated + user-uploaded)
CREATE TABLE library_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id), -- NULL = public/curated
  uploader_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('pdf', 'video', 'link', 'text')),
  resource_url TEXT NOT NULL,
  category TEXT,
  grade_level TEXT,
  subject TEXT,
  is_curated BOOLEAN DEFAULT false, -- true = seed content
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Self (Personal Space)
```sql
-- Mood logs
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'low', 'struggling')),
  note TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reflections
CREATE TABLE self_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  reflection_type TEXT CHECK (reflection_type IN ('text', 'voice')),
  content TEXT, -- for text reflections
  voice_url TEXT, -- for voice recordings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Pricing Tiers (v0.1)
```sql
-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3.4 Indexes

**Performance-Critical Indexes**:
```sql
-- User lookups
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_email ON users(email);

-- Classroom queries
CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX idx_classroom_students_student_id ON classroom_students(student_id);

-- Lesson queries
CREATE INDEX idx_lessons_classroom_id ON lessons(classroom_id);
CREATE INDEX idx_lessons_teacher_id ON lessons(teacher_id);

-- Assignment queries
CREATE INDEX idx_assignments_classroom_id ON assignments(classroom_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
```

---

# 4. SECURITY MODEL

## 4.1 Authentication

**Provider**: Supabase Auth (GoTrue)  
**Method**: Email + password (v0.1), MFA optional (v0.5+)  
**Token**: JWT with 1-hour expiry, refresh token for renewal

```typescript
// Authentication flow
const { data, error } = await supabase.auth.signUp({
  email: 'teacher@school.lk',
  password: 'secure_password',
  options: {
    data: {
      role: 'teacher',
      school_id: 'uuid-here',
      full_name: 'Name'
    }
  }
});

// JWT contains: user_id, email, role, school_id
// Accessible in RLS policies via auth.uid()
```

## 4.2 Authorization (Row-Level Security)

**Philosophy**: Database-level authorization, not application-level

### RLS Policy Examples

**Users see only their school's data**:
```sql
CREATE POLICY "School members only"
  ON classrooms FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );
```

**Teachers manage their own classrooms**:
```sql
CREATE POLICY "Teachers manage own classrooms"
  ON classrooms FOR UPDATE
  USING (teacher_id = auth.uid());
```

**Students see only their enrolled classrooms**:
```sql
CREATE POLICY "Students see enrolled classrooms"
  ON classrooms FOR SELECT
  USING (
    auth.uid() IN (
      SELECT student_id FROM classroom_students
      WHERE classroom_id = classrooms.id
    )
  );
```

**Principals see all school data**:
```sql
CREATE POLICY "Principals see all school data"
  ON classrooms FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM users
      WHERE id = auth.uid() AND role = 'principal'
    )
  );
```

**Only principals create announcements**:
```sql
CREATE POLICY "Only principals post announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'principal'
    )
  );
```

## 4.3 Data Privacy

### Encryption Layers

**Transport**: HTTPS/TLS 1.3 (all connections)  
**At Rest**: PostgreSQL encryption (platform-level)  
**Sacred Data** (v1.0): End-to-end encryption for sensitive reflections

```typescript
// Sacred data encryption (future v1.0)
// Teacher's personal reflections encrypted on device
// Supabase stores encrypted blob but cannot decrypt

const encryptReflection = async (text: string, userPassword: string) => {
  const key = await deriveKey(userPassword); // PBKDF2
  const encrypted = await encrypt(text, key); // AES-256-GCM
  return encrypted; // Upload to Supabase
};
```

### Student Data Protection

**Principle**: Students under 18 have additional protections

- Student submissions visible only to: student, teacher, principal
- Student grades visible only to: student, teacher
- Student mood logs visible only to: student (never shared)
- No cross-school student data (even for teachers)

## 4.4 Audit Logging

**What gets logged**:
- User authentication (login/logout)
- Sensitive actions (data export, account deletion)
- Principal actions (announcement posts, content approval)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: Log principal announcement
INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
VALUES (auth.uid(), 'announcement_created', 'announcement', NEW.id);
```

---

# 5. SYNC STRATEGY

## 5.1 Cloud-First (v0.1)

**Architecture**: Direct Supabase connection, no local database

```typescript
// All operations go directly to Supabase
const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .eq('classroom_id', classroomId);

// Realtime subscriptions for live updates
supabase
  .channel('classroom_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'lessons',
    filter: `classroom_id=eq.${classroomId}`
  }, (payload) => {
    updateUI(payload.new);
  })
  .subscribe();
```

**Advantages**:
- Simple architecture (no sync complexity)
- Faster development (skip sync engine)
- Always up-to-date (realtime changes)
- No merge conflicts

**Limitations**:
- Requires internet connection
- Slower on poor networks
- No offline editing

## 5.2 Hybrid Model (v1.0)

**Architecture**: SQLite local database + Supabase cloud sync

```
┌─────────────────────────────────────┐
│     LOCAL (Device)                  │
│  SQLite + Drizzle ORM               │
│  - All data cached locally          │
│  - Optimistic updates               │
│  - Queue for offline changes        │
└─────────────────────────────────────┘
            ↕ Sync Engine
┌─────────────────────────────────────┐
│     CLOUD (Supabase)                │
│  PostgreSQL                         │
│  - Source of truth                  │
│  - Conflict resolution              │
│  - Cross-device sync                │
└─────────────────────────────────────┘
```

### Sync Strategy

**Pull**: On app open, sync latest changes from server
**Push**: When online, upload queued local changes
**Conflict Resolution**: Last-write-wins (server timestamp authoritative)

```typescript
// Sync engine (pseudo-code for v1.0)
class SyncEngine {
  async pull() {
    const lastSync = await getLastSyncTime();
    const changes = await supabase
      .from('lessons')
      .select('*')
      .gte('updated_at', lastSync);
    
    await localDB.upsert(changes);
    await setLastSyncTime(Date.now());
  }
  
  async push() {
    const pending = await localDB.getPendingChanges();
    
    for (const change of pending) {
      await supabase.from(change.table).upsert(change.data);
      await localDB.markSynced(change.id);
    }
  }
}
```

**Why UUIDs Enable This**:
- Client generates IDs offline (no server needed)
- No ID conflicts when syncing
- Same ID locally and remotely

**Why NOT WatermelonDB**:
- We'll use Drizzle ORM instead (better TypeScript, simpler API)
- SQLite underneath (same performance)
- More flexible for our use case

## 5.3 Offline Capabilities (v1.0)

**What works offline**:
- View cached lessons, assignments
- Create new lessons (saved locally, synced later)
- Edit existing content (queued for sync)
- Record mood logs, reflections

**What requires online**:
- Real-time announcements
- Cross-device sync
- File uploads (PDF, video)
- Grade submissions (student → teacher flow)

---

# 6. SCALE CHARACTERISTICS

## 6.1 Version Targets

### v0.1 (3 months)
- **Schools**: 5-10 pilot schools
- **Users**: 100-500 total (50-100 per school)
- **Data**: <1GB database, <5GB files
- **Infrastructure**: Supabase free tier

### v0.5 (6 months)
- **Schools**: 20-50 schools
- **Users**: 1,000-5,000 total
- **Data**: 5-10GB database, 50GB files
- **Infrastructure**: Supabase Pro ($25/month)

### v1.0 (12 months)
- **Schools**: 50-100 schools
- **Users**: 5,000-10,000 total
- **Data**: 20-50GB database, 200GB files
- **Infrastructure**: Supabase Pro + potential self-hosting evaluation

## 6.2 Performance Characteristics

### Database Queries
- Simple queries (single table): <50ms
- Complex joins (3+ tables): <200ms
- Realtime subscriptions: <100ms latency

### File Operations
- PDF upload (5MB): ~5-10 seconds on 4G
- Video streaming: 480p minimum, 720p preferred
- Image optimization: Auto-compress to <500KB

### Mobile Performance
- Cold start: <3 seconds
- Navigation transitions: 60fps (Reanimated)
- Memory usage: <150MB RAM (works on 2GB devices)

## 6.3 Infrastructure Scaling

### Vertical Scaling (Supabase)
```
Free Tier → Pro → Team → Enterprise

Free:     500MB DB, 1GB storage, 50K MAU
Pro:      8GB DB, 100GB storage, 100K MAU ($25/month)
Team:     Unlimited, dedicated resources ($599/month)
```

### Horizontal Scaling (Self-Hosting)
When Supabase limits reached (v2.0+):
- Deploy Supabase stack to own infrastructure
- PostgreSQL replication for read scaling
- CDN for file storage (CloudFlare R2)
- Load balancing for API servers

## 6.4 Cost Projections

### v0.1 (500 users)
- Supabase: $0 (free tier)
- Expo: $0 (free tier)
- **Total**: ~$0/month

### v0.5 (5,000 users)
- Supabase Pro: $25/month
- Expo (EAS builds): $20/month
- Sentry: $26/month
- **Total**: ~$71/month (~$0.014 per user)

### v1.0 (10,000 users)
- Supabase Team: $599/month
- Expo: $20/month
- Sentry: $89/month
- PayHere fees: ~2% of revenue
- **Total**: ~$708/month + transaction fees (~$0.07 per user)

**Revenue requirement** (break even at v1.0):
- 24 schools at LKR 3,000/month (~$10 USD)
- Or 48 schools at LKR 1,500/month (~$5 USD)
- Target: 100 schools (4x break-even margin)

---

# APPENDIX A: ARCHITECTURAL DECISIONS LOG

## ADR-001: Cloud-First Strategy
**Date**: February 2, 2026  
**Status**: Accepted  
**Context**: Need to ship v0.1 in 3 months. Offline-first adds 3-4 weeks complexity.  
**Decision**: Cloud-first v0.1, hybrid v1.0  
**Consequences**: Faster shipping, internet dependency, delayed offline features

## ADR-002: UUID Primary Keys
**Date**: February 2, 2026  
**Status**: Accepted  
**Context**: Need offline-readiness for v1.0  
**Decision**: Use UUIDs, client-generated  
**Consequences**: Larger storage, slower indexes, but offline-ready

## ADR-003: Multi-Tenant Architecture
**Date**: February 2, 2026  
**Status**: Accepted  
**Context**: Plan to serve 50+ schools  
**Decision**: Single database, school_id isolation  
**Consequences**: Simpler infrastructure, cross-school features possible, careful RLS needed

## ADR-004: Supabase Backend
**Date**: February 2, 2026  
**Status**: Accepted  
**Context**: Need full backend in <1 week setup time  
**Decision**: Supabase (open-source, self-hostable)  
**Consequences**: Fast development, slight vendor risk (mitigated by self-hosting option)

## ADR-005: No WatermelonDB (v0.1)
**Date**: February 2, 2026  
**Status**: Accepted  
**Context**: Cloud-first makes WatermelonDB unnecessary for v0.1  
**Decision**: Skip WatermelonDB, use SQLite + Drizzle in v1.0  
**Consequences**: Simpler v0.1, must add local DB layer later

---

# APPENDIX B: MIGRATION PATH

## v0.1 → v0.5
- Add pricing tier checks to RLS policies
- Add PayHere webhook handlers
- Schema additions (no breaking changes):
  - `subscriptions` table
  - `payment_transactions` table

## v0.5 → v1.0
- Add SQLite local database layer
- Implement sync engine
- Schema additions (no breaking changes):
  - `sync_state` table (track last sync)
  - `pending_changes` table (offline queue)

**Key principle**: No breaking schema changes. Always additive migrations.

---

# APPENDIX C: TECHNOLOGY ALTERNATIVES CONSIDERED

## Local Database
- ❌ WatermelonDB: Too complex for v0.1 cloud-first
- ❌ Realm: Vendor lock-in, requires Realm Sync
- ❌ AsyncStorage: Not a real database
- ✅ SQLite + Drizzle: Simple, flexible, good TypeScript

## Backend
- ❌ Firebase: Vendor lock-in, NoSQL limitations
- ❌ AWS: Too complex, slow setup
- ❌ Custom (Node.js): Too slow to build
- ✅ Supabase: Open-source, fast setup, powerful

## State Management
- ❌ Redux: Too much boilerplate
- ❌ MobX: Harder to debug
- ❌ React Context: Performance issues at scale
- ✅ Zustand: Simple, performant, good DX

---

**END OF ARCHITECTURE DOCUMENT**

---

## Document Metadata

**Version**: 2.0  
**Lines**: ~850  
**Focus**: Technical architecture only  
**Audience**: Developers building the system  
**Maintenance**: Update when architectural decisions change

**Related Documents**:
- PRODUCT_SPEC.md (what we're building)
- UX_DESIGN.md (how it looks/feels)
- IMPLEMENTATION.md (how to build it)
- PHILOSOPHY.md (why sanctuary matters)
