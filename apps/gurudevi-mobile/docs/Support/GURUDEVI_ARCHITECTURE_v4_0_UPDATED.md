---
title: "GURUDEVI ARCHITECTURE v4.0"
status: "superseded"
created: 2026-02-11
updated: 2026-05-07
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# GURUDEVI ARCHITECTURE v4.0
## *The Complete Technical Blueprint - Single Source of Truth*

---

> *"From design philosophy to database schema.*  
> *From lotus metaphor to RLS policies.*  
> *This is how sanctuary becomes software."*

---

**Document Purpose**: The definitive architecture for Gurudevi - an education ecology support system for Sri Lankan schools with sanctuary aesthetics.

**What Changed in v4.0**:
- âœ… Unified 5-tab navigation (all roles, same structure)
- âœ… UUID strategy clarified (offline-first ready)
- âœ… Multi-tenant architecture confirmed (one database, all schools)
- âœ… Role-based data windows (same reality, different views)
- âœ… Community v0.1: Announcements with posting (principals) + read receipts (aligned with STACK v3.0)
- âœ… Library v0.1: Basic upload/view (teachers upload, students view) (aligned with STACK v3.0)
- âœ… **NEW**: Rewards System added (v0.5) - points, streaks, levels, badges, leaderboards
- âœ… **NEW**: FAB implementation added (v0.5) - context-aware floating action button
- âœ… **NEW**: Maps integration added (v0.5) - school locations, field trips

**Version**: 4.0 (Production Foundation + Architectural Decisions)  
**Last Updated**: February 1, 2026  
**Status**: Ready to build

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# TABLE OF CONTENTS

**PART 1**: Core Philosophy & Product Identity  
**PART 2**: The Unified 5-Tab Architecture  
**PART 3**: Technical Stack (Battle-Tested)  
**PART 4**: Multi-Tenant Database Architecture  
**PART 5**: UUID Strategy & Offline Readiness  
**PART 6**: Role-Based Data Windows (RLS)  
**PART 7**: Feature Roadmap (v0.1 â†’ v1.0)  
**PART 8**: Security & Privacy  
**PART 9**: Implementation Patterns  
**PART 10**: Quick Start Guide  

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 1: CORE PHILOSOPHY & PRODUCT IDENTITY

## 1.1 What Gurudevi IS

**Product Definition**:  
School platform with sanctuary aesthetics - NOT a meditation/temple app

**Core Value Proposition**:
- Teachers share content â†’ Students learn â†’ Principals monitor
- All wrapped in calm, nurturing, focused environment (sanctuary feel)
- Built specifically for Sri Lankan schools (Sinhala/Tamil/English)
- Mobile-first, data-conscious, locally relevant

## 1.2 The Lotus Philosophy (Still Sacred)

**From Design Framework v1**:
```
ðŸª· Lotus as Metaphor:
- Rooted in mud â†’ Acknowledging difficult conditions
- Rising through water â†’ Journey of growth
- Hydrophobic surface â†’ Protecting dignity
- Blooming above â†’ Achieving enlightenment
```

**How It Manifests**:
- Sanctuary color palette (cream, sage, ember)
- Natural animations (breath-like, organic timing)
- Lotus petal assistant (gentle guide, not intrusive)
- Cultural respect (teachers as guru devi)

**Critical**: Sanctuary is the AESTHETIC, not the product category.

## 1.3 Market Position

**Not Competing With**:
- International LMS (Moodle, Canvas) â†’ Too complex, desktop-first
- School Management Systems (local) â†’ Admin-focused, not learning-focused
- Google Classroom â†’ No Sri Lankan context, no sanctuary feel

**Blue Ocean**:
```
Gurudevi = LMS + Sanctuary + Sri Lanka Context + Mobile-First + Wellbeing
```

**Pricing** (from v0.5):
- Free: Basic features
- Pro: LKR 1,500/month (OCR, quizzes, forms)
- Premium: LKR 3,000/month (AI assistant, advanced analytics)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 2: THE UNIFIED 5-TAB ARCHITECTURE

## 2.1 The Sacred Structure (Never Changes)

```
Bottom Navigation (WhatsApp-style):

ðŸ§˜ Self    |    ðŸ« Classroom    |    ðŸŒ¸ Community    |    ðŸ“š Library    |    ðŸ‘¤ Profile
```

**Philosophy**:
- Same structure for ALL roles (student, teacher, principal)
- Same navigation mental model
- Different CONTENT within each tab based on role
- Progressive disclosure (lock tabs not ready yet)

## 2.2 Tab Definitions (Universal)

### ðŸ§˜ **SELF** (Sanctuary)
**Essence**: Personal refuge, wellbeing, reflection  
**Available**: v0.1 (all roles)  

**For Students**:
- Daily mood check-in
- Personal goals
- Reflection journal
- Mindful moments

**For Teachers**:
- Fire journal (voice notes)
- Breathing exercises
- Weekly reflection
- Burnout prevention

**For Principals**:
- Leadership reflection
- School vision journal
- Daily priorities
- Strategic thinking space

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

### ðŸ« **CLASSROOM** (Active Space)
**Essence**: Where work happens  
**Available**: v0.1 (all roles)

**For Students**:
- View assigned lessons
- Submit homework
- Track progress
- See upcoming deadlines

**For Teachers**:
- Create lesson content
- Grade assignments
- Manage classroom roster
- Plan weekly schedule

**For Principals**:
- Overview all classrooms
- Monitor teacher activity
- View school-wide metrics
- Approve content (if policy)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

### ðŸŒ¸ **COMMUNITY** (Cathedral)
**Essence**: Gathering space, collective wisdom  
**Available**: v0.1 (minimal), v0.5 (full)

**v0.1 Minimal Feature**: School announcements
- Principal can post announcements (text + realtime)
- All users can view
- Read receipts (who has seen)
- No replies yet (v0.5)
- No forums yet (v0.5)

**v0.5 Full Features**:
- Discussion forums (threaded)
- Replies + reactions
- Teacher mentorship matching
- Study groups (students)
- Recognition wall

**For Students**:
- Study groups
- Ask questions
- Peer connections

**For Teachers**:
- Professional discussions
- Share best practices
- Mentorship network

**For Principals**:
- Post announcements
- Moderate discussions
- Staff communication

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

### ðŸ“š **LIBRARY** (Knowledge Repository)
**Essence**: Curated resources, learning materials  
**Available**: v0.1 (basic upload/view), v0.5 (full)

**v0.1 Basic Feature**: Content upload and viewing
- Teachers can upload PDF/video content
- Students can view content (in their classrooms)
- Basic categories (by grade/subject)
- 20 pre-curated public resources (seed content)
- No advanced search yet (v0.5)
- No quizzes yet (v0.5)

**v0.5 Full Features**:
- Advanced search (full-text, filters)
- Quiz creation + auto-grading
- Interactive lessons
- Teacher resource sharing (cross-school, opt-in)
- Collections and playlists

**For Students**:
- Course materials
- Practice resources
- Reference documents

**For Teachers**:
- Teaching resources
- Professional development
- Curriculum guides

**For Principals**:
- Policy documents
- Admin resources
- School guidelines

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

### ðŸ‘¤ **PROFILE** (Identity)
**Essence**: Personal journey, achievements, settings  
**Available**: v0.1 (all roles)

**For Students**:
- Learning progress
- Achievements/badges
- Account settings
- Language preferences

**For Teachers**:
- Teaching journey timeline
- Contributions
- Professional profile
- Data saver mode

**For Principals**:
- School statistics
- Leadership dashboard
- System settings
- User management

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## 2.3 Implementation Pattern

### **Navigation Component** (Role-Agnostic):
```typescript
// constants/navigation.ts
export const TABS = [
  { 
    id: 'self',
    icon: 'lotus',
    label: { si: 'à·ƒà·Šà·€à¶ºà¶‚', ta: 'à®šà¯à®¯', en: 'Self' },
    color: 'sanctuary500',
    availableFrom: 'v0.1'
  },
  { 
    id: 'classroom',
    icon: 'school',
    label: { si: 'à¶´à¶±à·Šà¶­à·’', ta: 'à®µà®•à¯à®ªà¯à®ªà¯', en: 'Classroom' },
    color: 'sage500',
    availableFrom: 'v0.1'
  },
  { 
    id: 'community',
    icon: 'users',
    label: { si: 'à¶´à·Šâ€à¶»à¶¢à·à·€', ta: 'à®šà®®à¯‚à®•à®®à¯', en: 'Community' },
    color: 'sky500',
    availableFrom: 'v0.1'  // Minimal feature
  },
  { 
    id: 'library',
    icon: 'book-open',
    label: { si: 'à¶´à·”à·ƒà·Šà¶­à¶šà·à¶½à¶º', ta: 'à®¨à¯‚à®²à®•à®®à¯', en: 'Library' },
    color: 'ember500',
    availableFrom: 'v0.1'  // Minimal feature
  },
  { 
    id: 'profile',
    icon: 'user',
    label: { si: 'à¶´à·à¶­à·’à¶šà¶©', ta: 'à®šà¯à®¯à®µà®¿à®µà®°à®®à¯', en: 'Profile' },
    color: 'sanctuary900',
    availableFrom: 'v0.1'
  }
] as const;
```

### **Bottom Tab Navigator**:
```typescript
// navigation/BottomTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.sanctuary,
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.id}
          name={tab.id}
          component={getScreenComponent(tab.id)}
          options={{
            tabBarLabel: t(`tabs.${tab.id}`),
            tabBarIcon: ({ color, size }) => (
              <Icon name={tab.icon} color={color} size={size} />
            )
          }}
        />
      ))}
    </Tab.Navigator>
  );
};
```

### **Role-Based Screen Content**:
```typescript
// screens/ClassroomScreen.tsx
const ClassroomScreen = () => {
  const role = useUserStore(state => state.role);
  
  // Same screen, different views
  switch (role) {
    case 'student':
      return <StudentClassroomView />;
    case 'teacher':
      return <TeacherClassroomView />;
    case 'principal':
      return <PrincipalClassroomView />;
  }
};
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 3: TECHNICAL STACK (BATTLE-TESTED)

## 3.1 Core Framework

```json
{
  "expo": "~54.0.32",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "typescript": "~5.9.2"
}
```

**Why This Exact Combination**:
- React 19 stable (with React Compiler)
- Expo SDK 54 latest stable (Feb 2026)
- RN 0.81.5 required for React 19
- New Architecture ENABLED (mandatory for React 19)

**Battle Scars**: 4 failed builds before success
- Build 1: Cloud rejected React 19 â†’ Added `.npmrc` with `legacy-peer-deps=true`
- Build 2: Gradle crash (New Arch vs Reanimated 3) â†’ Disabled New Arch temporarily
- Build 3: Reanimated 3 incompatible â†’ Upgraded to Reanimated 4
- Build 4: âœ… SUCCESS (all aligned)

## 3.2 Complete Dependencies

### **UI & Styling**:
```json
{
  "@gluestack-ui/themed": "^1.1.73",
  "@gluestack-ui/config": "^1.1.20",
  "@gluestack-style/react": "^1.0.57",
  "lucide-react-native": "~0.563.0",
  "react-native-svg": "15.12.1",
  "react-native-safe-area-context": "~5.6.0"
}
```

**Why Gluestack**: 3x faster than NativeBase, React 19 compatible, excellent for Sinhala/Tamil fonts

### **Animations**:
```json
{
  "react-native-reanimated": "~4.1.1",
  "react-native-worklets": "^0.5.2",
  "react-native-gesture-handler": "^2.20.0"
}
```

**CRITICAL**: NO MOTI (broken with Reanimated 4)

### **State Management**:
```json
{
  "zustand": "^5.0.10",
  "@tanstack/react-query": "^5.90.20",
  "react-native-mmkv": "^4.1.1"
}
```

**Why This Combo**:
- Zustand: Global state (user, settings)
- TanStack Query: Server state (fetching, caching)
- MMKV: Persistence (30x faster than AsyncStorage)

### **Backend (Cloud-First)**:
```json
{
  "@supabase/supabase-js": "^2.90.1",
  "react-native-url-polyfill": "^3.0.0"
}
```

**Strategy**: Supabase-only until v1.0, then add SQLite for offline

### **Internationalization**:
```json
{
  "react-i18next": "^13.5.0",
  "i18next": "^23.7.0"
}
```

**Critical for Sri Lanka**: Sinhala/Tamil/English support

### **Device APIs**:
```json
{
  "expo-av": "^14.0.7",
  "expo-image": "^1.14.0",
  "expo-image-picker": "^15.0.7",
  "expo-document-picker": "^12.0.2",
  "expo-barcode-scanner": "^13.0.1",
  "expo-print": "^13.0.1",
  "expo-sharing": "^12.0.1",
  "expo-ocr": "latest"
}
```

**expo-ocr**: Sinhala/Tamil text recognition (MLKit) - v0.5 feature

### **Navigation**:
```json
{
  "@react-navigation/native": "^7.0.0",
  "@react-navigation/bottom-tabs": "^7.0.0",
  "@react-navigation/stack": "^7.0.0"
}
```

## 3.3 Critical Configuration Files

### **.npmrc**:
```
legacy-peer-deps=true
```

### **app.json**:
```json
{
  "expo": {
    "name": "Gurudevi",
    "slug": "gurudevi",
    "version": "0.1.0",
    "newArchEnabled": true,
    "jsEngine": "hermes",
    "ios": {
      "bundleIdentifier": "lk.gurudevi.app"
    },
    "android": {
      "package": "lk.gurudevi.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#FFF8F0"
      }
    }
  }
}
```

### **babel.config.js**:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'  // MUST be last!
    ]
  };
};
```

### **eas.json**:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    },
    "production": {
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    }
  }
}
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 4: MULTI-TENANT DATABASE ARCHITECTURE

## 4.1 The Decision: One Database, All Schools

**Architecture**: Multi-tenant (shared database)

**Why NOT Separate Databases per School**:

| Aspect | Separate DBs | Multi-Tenant âœ… |
|--------|-------------|-----------------|
| Cost (10 schools) | $250/month | $25/month |
| Cost (50 schools) | $1,250/month | $25/month |
| Schema updates | 50 migrations | 1 migration |
| Backups | 50 jobs | 1 job |
| Monitoring | 50 dashboards | 1 dashboard |
| Cross-school features | Impossible | Easy |
| Operational complexity | Very high | Low |
| Scales to | 50 schools max | 1000+ schools |

**Real-World Proof**:
- Slack: One database, millions of workspaces
- Notion: One database, millions of workspaces  
- GitHub: One database, millions of repos

**Verdict**: Multi-tenant is the RIGHT choice for v0.1 through v1.0 and beyond.

## 4.2 Core Schema Pattern

**Every table has `school_id` as the tenant key**:

```sql
-- Schools (Tenant Root)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('government', 'private')),
  district TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users (Belongs to School)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'principal')) NOT NULL,
  full_name TEXT NOT NULL,
  language TEXT DEFAULT 'si' CHECK (language IN ('si', 'ta', 'en')),
  data_saver_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classrooms (Belongs to School)
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,
  subject TEXT,
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classroom Membership (Many-to-Many)
CREATE TABLE classroom_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(classroom_id, user_id)
);

-- Content Items (Belongs to Classroom + School)
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,  -- Denormalized for query speed
  created_by UUID REFERENCES users(id),
  
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('pdf', 'video', 'audio', 'quiz')) NOT NULL,
  
  file_url TEXT,
  file_size BIGINT,
  duration INTEGER,
  
  tags TEXT[],
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  access_tier TEXT CHECK (access_tier IN ('free', 'pro', 'premium')) DEFAULT 'free',
  is_public BOOLEAN DEFAULT false,  -- For cross-school sharing
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Announcements (School-wide)
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  target_roles TEXT[] DEFAULT ARRAY['student', 'teacher', 'principal'],
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student Grades
CREATE TABLE student_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  
  assignment_title TEXT NOT NULL,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 4.3 Performance Indexes

**Critical for multi-tenant performance**:

```sql
-- School-based filtering (most common query pattern)
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE INDEX idx_content_school_id ON content_items(school_id);
CREATE INDEX idx_announcements_school_id ON announcements(school_id);

-- Role-based queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_classroom_members_role ON classroom_members(role);

-- Common lookups
CREATE INDEX idx_content_classroom_id ON content_items(classroom_id);
CREATE INDEX idx_grades_student_id ON student_grades(student_id);
CREATE INDEX idx_grades_classroom_id ON student_grades(classroom_id);

-- Email login
CREATE INDEX idx_users_email ON users(email);

-- Timestamp queries (recent items)
CREATE INDEX idx_content_created_at ON content_items(created_at DESC);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
```

**Performance Target**: <50ms queries even with 1M+ rows per table

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 5: UUID STRATEGY & OFFLINE READINESS

## 5.1 Why UUID (Not Integer IDs)

**Decision**: Use UUID for ALL entity IDs

### **Advantages**:

**1. Offline-First Future (v1.0)**:
```typescript
// Generate IDs on device (no server needed)
import uuid from 'react-native-uuid';

const reflection = {
  id: uuid.v4(),  // 550e8400-e29b-41d4-a716-446655440000
  user_id: currentUserId,
  content: "Today was challenging...",
  created_at: new Date().toISOString(),
  synced: false
};

// Save to local SQLite
await db.insert('reflections', reflection);

// Later, sync to Supabase (NO ID conflicts)
await supabase.from('reflections').insert(reflection);
```

**With auto-increment integers, this is IMPOSSIBLE**:
```sql
-- âŒ Collision problem
Device offline creates: id = 1, 2, 3
Server already has: id = 1, 2, 3
Sync â†’ CONFLICT! ðŸ’¥
```

**2. Security (No Enumeration)**:
```
âŒ Integer IDs: GET /api/students/1, /2, /3 (attacker guesses all IDs)
âœ… UUIDs: GET /api/students/550e8400-... (impossible to guess)
```

**3. Distributed Systems**:
```
Multiple servers/regions can generate IDs simultaneously
NO coordination needed, NO collisions (probabilistically impossible)
```

**4. Mergers & Migrations**:
```
School A database + School B database â†’ Merged
With UUIDs: Zero conflicts
With integers: Must renumber everything
```

## 5.2 Supabase UUID Pattern

**Default UUID generation**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Supabase auto-generates UUID on insert
);
```

**In React code**:
```typescript
// Supabase generates UUID automatically
const { data, error } = await supabase
  .from('users')
  .insert({ email: 'teacher@school.lk', role: 'teacher' })
  .select();

// Returns: { id: '550e8400-e29b-41d4-a716-446655440000', ... }
```

## 5.3 Offline Mode (v1.0 Preparation)

**For v1.0, when adding SQLite**:

```typescript
// Generate UUID on device
import uuid from 'react-native-uuid';
import { storage } from './mmkv';

// Check if online
const isOnline = await NetInfo.fetch().then(state => state.isConnected);

if (isOnline) {
  // Direct to Supabase (current v0.1 behavior)
  await supabase.from('reflections').insert(reflection);
} else {
  // Generate UUID locally
  const reflection = {
    id: uuid.v4(),  // Client-generated
    user_id: userId,
    content: content,
    created_at: new Date().toISOString(),
    synced: false  // Mark as pending sync
  };
  
  // Save to local SQLite
  await db.insert('reflections', reflection);
  
  // Queue for sync
  const syncQueue = JSON.parse(storage.getString('sync_queue') || '[]');
  syncQueue.push({ table: 'reflections', id: reflection.id });
  storage.set('sync_queue', JSON.stringify(syncQueue));
}

// Later, when online, background sync
const syncQueue = JSON.parse(storage.getString('sync_queue') || '[]');
for (const item of syncQueue) {
  const localData = await db.query(`SELECT * FROM ${item.table} WHERE id = ?`, [item.id]);
  await supabase.from(item.table).upsert(localData);
  // Remove from queue
}
```

**Key Point**: UUIDs make this pattern possible. Integer IDs would require complex server coordination.

## 5.4 Terminology Consistency

**Use consistently throughout codebase**:
```typescript
âœ… user_id: UUID
âœ… school_id: UUID
âœ… classroom_id: UUID
âœ… id: UUID

âŒ Avoid mixing: user_uid, school_uuid (confusing)
```

**In RLS policies**:
```sql
-- auth.uid() returns UUID of logged-in user
CREATE POLICY "Own data only"
ON reflections FOR SELECT
USING (user_id = auth.uid());  -- Both are UUIDs
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 6: ROLE-BASED DATA WINDOWS (RLS)

## 6.1 The Core Concept

**Same Reality, Different Windows**:

```
        ðŸ« REALITY (Database)
             â†“
    [Announcement: "Sports Day Feb 10"]
             â†“
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                 â”‚            â”‚
ðŸ§‘â€ðŸŽ“ Student      ðŸ‘¨â€ðŸ« Teacher    ðŸ‘” Principal
"School event"  "Coordinate   "Track attendance
                with PE dept"  & budget"
```

**Implementation**: Row-Level Security (RLS) policies in Supabase

## 6.2 RLS Policies by Feature

### **ANNOUNCEMENTS** (Same Data, All Roles See):

```sql
-- Students see announcements in their school
CREATE POLICY "Students view school announcements"
ON announcements FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND 'student' = ANY(target_roles)
);

-- Teachers see announcements in their school
CREATE POLICY "Teachers view school announcements"
ON announcements FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND 'teacher' = ANY(target_roles)
);

-- Principals can CREATE announcements
CREATE POLICY "Principals create announcements"
ON announcements FOR INSERT
TO authenticated
WITH CHECK (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);

-- Principals can UPDATE/DELETE their school's announcements
CREATE POLICY "Principals manage announcements"
ON announcements FOR ALL
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);
```

### **GRADES** (Very Different Views):

```sql
-- Students see ONLY their own grades
CREATE POLICY "Students see own grades"
ON student_grades FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
);

-- Teachers see grades for students in THEIR classrooms
CREATE POLICY "Teachers see classroom grades"
ON student_grades FOR SELECT
TO authenticated
USING (
  classroom_id IN (
    SELECT classroom_id 
    FROM classroom_members 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Teachers can CREATE/UPDATE grades for their students
CREATE POLICY "Teachers manage classroom grades"
ON student_grades FOR ALL
TO authenticated
USING (
  classroom_id IN (
    SELECT classroom_id 
    FROM classroom_members 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Principals see ALL grades in their school
CREATE POLICY "Principals see school grades"
ON student_grades FOR SELECT
TO authenticated
USING (
  classroom_id IN (
    SELECT c.id FROM classrooms c
    WHERE c.school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);
```

### **CONTENT ITEMS** (School + Public):

```sql
-- Students see content in their enrolled classrooms
CREATE POLICY "Students view classroom content"
ON content_items FOR SELECT
TO authenticated
USING (
  status = 'published'
  AND (
    -- Content in their classrooms
    classroom_id IN (
      SELECT classroom_id 
      FROM classroom_members 
      WHERE user_id = auth.uid() 
      AND role = 'student'
    )
    -- OR public content (cross-school sharing)
    OR is_public = true
  )
  -- AND matches their tier
  AND (
    access_tier = 'free'
    OR access_tier = (SELECT tier FROM users WHERE id = auth.uid())
  )
);

-- Teachers can CREATE content in their classrooms
CREATE POLICY "Teachers create content"
ON content_items FOR INSERT
TO authenticated
WITH CHECK (
  classroom_id IN (
    SELECT classroom_id 
    FROM classroom_members 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
  AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

-- Teachers can manage their own content
CREATE POLICY "Teachers manage own content"
ON content_items FOR ALL
TO authenticated
USING (created_by = auth.uid());

-- Principals see all content in their school
CREATE POLICY "Principals view school content"
ON content_items FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);
```

### **CLASSROOMS** (School Isolation):

```sql
-- Students see classrooms they're enrolled in
CREATE POLICY "Students view enrolled classrooms"
ON classrooms FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT classroom_id 
    FROM classroom_members 
    WHERE user_id = auth.uid() 
    AND role = 'student'
  )
);

-- Teachers see classrooms they teach
CREATE POLICY "Teachers view teaching classrooms"
ON classrooms FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT classroom_id 
    FROM classroom_members 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Principals see all classrooms in their school
CREATE POLICY "Principals view school classrooms"
ON classrooms FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);
```

## 6.3 The Magic in React Code

**Same query, different results based on who's logged in**:

```typescript
// GradesScreen.tsx (SAME component for all roles)
const GradesScreen = () => {
  const role = useUserStore(state => state.role);
  
  // SAME query for everyone
  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => 
      supabase
        .from('student_grades')
        .select(`
          *,
          student:users!student_id(full_name, email),
          classroom:classrooms(name, grade_level)
        `)
        .order('graded_at', { ascending: false })
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  // Different UI based on role, SAME data source
  return (
    <View>
      {role === 'student' && (
        <MyGradesView grades={grades} />
        // Shows: "My Progress" - student's own grades only
      )}
      
      {role === 'teacher' && (
        <ClassGradesTable grades={grades} />
        // Shows: Table with all students in teacher's classrooms
      )}
      
      {role === 'principal' && (
        <SchoolAnalytics grades={grades} />
        // Shows: Charts/stats for entire school
      )}
    </View>
  );
};
```

**What happens at database level**:

```typescript
// Student with ID 'student-123' runs query:
// RLS policy filters to: WHERE student_id = 'student-123'
// Returns: Only their 15 grades

// Teacher with ID 'teacher-456' runs query:
// RLS policy filters to: WHERE classroom_id IN (teacher's classrooms)
// Returns: 150 grades for all students in their 5 classrooms

// Principal with ID 'principal-789' runs query:
// RLS policy filters to: WHERE classroom_id IN (all school classrooms)
// Returns: 800 grades for entire school

// SAME QUERY CODE, DIFFERENT RESULTS
```

## 6.4 Security Guarantee

**Even if app has a bug, RLS protects**:

```typescript
// âŒ Hypothetical bug in app code
// Student's phone somehow sends principal's ID in request
const maliciousRequest = {
  user_id: 'principal-789',  // Trying to impersonate principal
  action: 'view_all_grades'
};

// But Supabase RLS uses auth.uid() from JWT token, NOT request body
// JWT token says: "This user is student-123"
// RLS policy applies: WHERE student_id = auth.uid()
// Result: Student still only sees THEIR grades

// Database-level security > Application-level security
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 7: FEATURE ROADMAP (V0.1 â†’ V1.0)

## 7.1 Version Strategy

**Philosophy**: Spiral development (grow, don't pivot)

```
v0.1 (Months 1-3): Seed
  â†“ Validate adoption
v0.5 (Months 4-6): Growth
  â†“ Validate revenue
v1.0 (Months 7-12): Power
  â†“ Compete with international platforms
```

## 7.2 v0.1 - MVP (3 Months)

**Goal**: Validate school adoption

**Success Criteria**:
- 10 teachers using daily for 2 weeks
- 100+ students enrolled
- 1-2 schools fully onboarded

**Features**:

### **ðŸ§˜ Self (Full)**:
- âœ… Daily mood check-in (lotus petals opening based on mood)
- âœ… Reflection journal (text + voice notes)
- âœ… Breathing exercises (guided with animation)
- âœ… Weekly reflection prompts

### **ðŸ« Classroom (Core)**:
- âœ… Create classrooms
- âœ… Enroll students (via join code)
- âœ… Upload content (PDF, video, audio)
- âœ… View assigned lessons (students)
- âœ… Basic progress tracking

### **ðŸŒ¸ Community (Basic)**:
- âœ… School announcements (principal can post, all can view)
- âœ… Text announcements with realtime updates
- âœ… Read receipts (track who has seen announcements)
- âŒ No replies (v0.5)
- âŒ No forums (v0.5)

### **ðŸ“š Library (Basic Upload/View)**:
- âœ… Teachers upload content (PDF, video)
- âœ… Students view content (filtered by their classrooms)
- âœ… Basic categories (grade, subject)
- âœ… 20 pre-curated public resources (seed content)
- âŒ No advanced search (v0.5)
- âŒ No quizzes (v0.5)

### **ðŸ‘¤ Profile (Basic)**:
- âœ… View profile info
- âœ… Edit name, language
- âœ… Data saver mode toggle
- âœ… Logout

**NOT in v0.1**:
- âŒ Payments (all free)
- âŒ AI assistant
- âŒ OCR (Sinhala/Tamil text recognition)
- âŒ Forms/polls in announcements
- âŒ Quizzes (auto-graded)
- âŒ Offline mode
- âŒ Video calls

**Tech Stack (v0.1)**:
- React 19 + Expo 54
- Supabase (cloud-only)
- Zustand + TanStack Query + MMKV
- Gluestack UI
- i18next (Si/Ta/En)

**Timeline**:
- Week 1-2: Setup + Self section
- Week 3-4: Classroom section
- Week 5-6: Community + Library (minimal)
- Week 7-8: Profile + Sanctuary theme polish
- Week 9-10: Testing + Bug fixes
- Week 11-12: First school deployment

## 7.3 v0.5 - Revenue (Months 4-6)

**Goal**: Generate revenue for sustainability

**Success Criteria**:
- LKR 50,000+ monthly revenue
- 50+ paying users (Pro or Premium)
- 5+ schools using

**Add**:

### **Pricing Tiers**:
```
Free:
- Basic features
- 1 classroom/teacher
- 10 content items max

Pro (LKR 1,500/month):
- Unlimited classrooms
- Unlimited content
- OCR (Sinhala/Tamil)
- Forms + Polls
- Quizzes (auto-graded)
- PDF generation (certificates)
- Rewards system access

Premium (LKR 3,000/month):
- Everything in Pro
- AI assistant (Claude API)
- Priority support
- Advanced analytics
- Custom branding (school logo)
```

### **Payment Integration**:
- âœ… PayHere (Sri Lankan gateway)
- âœ… QR gift codes (buy in-store, redeem in app)
- âœ… School-wide subscriptions (principal pays for all teachers)

### **Rewards System** (NEW):
- âœ… Points for actions (upload content, complete reflection, help students)
- âœ… Streaks (consecutive days active)
- âœ… Levels (bronze â†’ silver â†’ gold â†’ platinum)
- âœ… Badges (achievements: "First Upload", "30-Day Streak", "Mentor")
- âœ… Leaderboards (school-wide, friendly competition)
- âœ… Unlockable features (e.g., custom themes at level 5)

### **Community (Full)**:
- âœ… Discussion forums (threaded)
- âœ… Replies + reactions
- âœ… Teacher mentorship matching
- âœ… Study groups (students)

### **Library (Full)**:
- âœ… Advanced search (full-text, filters)
- âœ… Filter by grade, subject, type
- âœ… Download for offline

### **New Features**:
- âœ… OCR: Scan Sinhala/Tamil text â†’ Digital (expo-ocr)
- âœ… Forms/Polls in announcements
- âœ… Quizzes with auto-grading
- âœ… PDF certificate generation
- âœ… Teacher analytics dashboard
- âœ… FAB (Floating Action Button) - WhatsApp-style quick actions
- âœ… Maps (school locations, field trip planning)

**NOT in v0.5**:
- âŒ AI assistant (v1.0)
- âŒ Offline mode (v1.0)
- âŒ Video calls (v1.0)

## 7.4 v1.0 - Power Platform (Months 7-12)

**Goal**: Compete with international platforms

**Success Criteria**:
- LKR 200,000+ monthly revenue
- 1000+ students
- 10+ schools
- 100+ teachers

**Add**:

### **AI Assistant** (Pro/Premium only):
```typescript
// Claude API integration
const AIAssistant = () => {
  const tier = useUserStore(state => state.tier);
  
  if (tier !== 'pro' && tier !== 'premium') {
    return <UpgradePrompt feature="AI Assistant" />;
  }
  
  // Features:
  // - Generate lesson plans (Si/Ta/En)
  // - Create quiz questions from content
  // - Suggest teaching strategies
  // - Student progress insights
};
```

### **Offline Mode**:
```typescript
// Add SQLite + Drizzle ORM
// Sync when online
// Full functionality offline (Self, Classroom, Profile)
// Community/Library require online
```

### **Advanced Features**:
- âœ… Interactive lessons (H5P-like)
- âœ… Video conferencing (1-on-1 mentorship, Agora.io)
- âœ… Principal dashboard (school-wide analytics)
- âœ… API integrations (Zapier, Google Classroom import)
- âœ… Mobile app sharing (students share progress with parents)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## 7.5 Rewards System Implementation (v0.5)

### **Points Economy**

```typescript
// Points awarded for actions
const POINT_VALUES = {
  // Content creation
  upload_content: 10,
  share_lesson: 15,
  create_quiz: 20,
  
  // Teaching actions
  grade_assignment: 5,
  provide_feedback: 8,
  respond_to_question: 5,
  
  // Personal growth
  complete_reflection: 10,
  breathing_exercise: 5,
  mood_checkin: 3,
  
  // Community
  forum_post: 5,
  helpful_reply: 10,
  mentor_session: 25,
  
  // Consistency
  daily_streak: 5,  // Per consecutive day
  weekly_goal: 50,  // Completing weekly goals
};

// Award points
const awardPoints = async (userId: string, action: keyof typeof POINT_VALUES) => {
  const points = POINT_VALUES[action];
  
  await supabase.rpc('increment_user_points', {
    user_id: userId,
    points_to_add: points
  });
  
  // Check for level up
  await checkLevelUp(userId);
  
  // Check for new badges
  await checkBadges(userId);
};
```

### **Levels & Progression**

```typescript
const LEVELS = [
  { level: 1, name: 'Seed', minPoints: 0, color: '#8B4513' },
  { level: 2, name: 'Sprout', minPoints: 100, color: '#90EE90' },
  { level: 3, name: 'Sapling', minPoints: 300, color: '#32CD32' },
  { level: 4, name: 'Tree', minPoints: 700, color: '#228B22' },
  { level: 5, name: 'Grove', minPoints: 1500, color: '#006400' },
  { level: 6, name: 'Forest', minPoints: 3000, color: '#013220' },
  { level: 7, name: 'Canopy', minPoints: 5000, color: '#004225' },
  { level: 8, name: 'Rainforest', minPoints: 8000, color: '#003D1A' },
  { level: 9, name: 'Ancient', minPoints: 12000, color: '#FFD700' },
  { level: 10, name: 'Sacred', minPoints: 20000, color: '#FF6347' },
];

const checkLevelUp = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('total_points, level')
    .eq('id', userId)
    .single();
  
  const currentLevel = LEVELS.find(l => l.level === user.level);
  const nextLevel = LEVELS.find(l => l.level === user.level + 1);
  
  if (nextLevel && user.total_points >= nextLevel.minPoints) {
    // Level up!
    await supabase
      .from('users')
      .update({ level: nextLevel.level })
      .eq('id', userId);
    
    // Show celebration animation
    await showLevelUpAnimation(nextLevel);
    
    // Award badge
    await awardBadge(userId, `level_${nextLevel.level}`);
  }
};
```

### **Badges System**

```typescript
const BADGES = {
  // Milestone badges
  first_upload: {
    id: 'first_upload',
    name: 'First Steps',
    description: 'Upload your first content',
    icon: 'ðŸŒ±',
    condition: (stats) => stats.uploads >= 1
  },
  
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day activity streak',
    icon: 'ðŸ”¥',
    condition: (stats) => stats.current_streak >= 7
  },
  
  streak_30: {
    id: 'streak_30',
    name: 'Month Master',
    description: '30-day activity streak',
    icon: 'â­',
    condition: (stats) => stats.current_streak >= 30
  },
  
  helpful_teacher: {
    id: 'helpful_teacher',
    name: 'Helping Hand',
    description: 'Answer 50 student questions',
    icon: 'ðŸ¤',
    condition: (stats) => stats.questions_answered >= 50
  },
  
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Complete 10 mentorship sessions',
    icon: 'ðŸ‘¨â€ðŸ«',
    condition: (stats) => stats.mentor_sessions >= 10
  },
  
  content_creator: {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'Upload 100 pieces of content',
    icon: 'ðŸ“š',
    condition: (stats) => stats.uploads >= 100
  },
  
  // Level badges
  level_5: {
    id: 'level_5',
    name: 'Grove Guardian',
    description: 'Reach level 5',
    icon: 'ðŸŒ³',
    condition: (stats) => stats.level >= 5
  },
  
  level_10: {
    id: 'level_10',
    name: 'Sacred Teacher',
    description: 'Reach level 10',
    icon: 'ðŸª·',
    condition: (stats) => stats.level >= 10
  }
};

const checkBadges = async (userId: string) => {
  // Get user stats
  const stats = await getUserStats(userId);
  
  // Check each badge
  for (const [badgeId, badge] of Object.entries(BADGES)) {
    if (badge.condition(stats)) {
      // Check if already awarded
      const { count } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);
      
      if (count === 0) {
        // Award new badge!
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badgeId,
          awarded_at: new Date().toISOString()
        });
        
        // Show badge notification
        await showBadgeNotification(badge);
      }
    }
  }
};
```

### **Streaks**

```typescript
const updateStreak = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('last_active_date, current_streak, longest_streak')
    .eq('id', userId)
    .single();
  
  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.last_active_date;
  
  if (lastActive === today) {
    // Already active today, no change
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let newStreak = user.current_streak;
  
  if (lastActive === yesterdayStr) {
    // Consecutive day!
    newStreak += 1;
  } else {
    // Streak broken
    newStreak = 1;
  }
  
  const longestStreak = Math.max(newStreak, user.longest_streak);
  
  await supabase
    .from('users')
    .update({
      last_active_date: today,
      current_streak: newStreak,
      longest_streak: longestStreak
    })
    .eq('id', userId);
  
  // Award streak points
  await awardPoints(userId, 'daily_streak');
  
  // Check for streak badges
  await checkBadges(userId);
};
```

### **Leaderboards**

```typescript
const getSchoolLeaderboard = async (schoolId: string, period: 'weekly' | 'monthly' | 'alltime') => {
  let dateFilter = '';
  
  if (period === 'weekly') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = weekAgo.toISOString();
  } else if (period === 'monthly') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = monthAgo.toISOString();
  }
  
  const query = supabase
    .from('users')
    .select('id, full_name, level, total_points, current_streak')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')  // Only teachers on leaderboard
    .order('total_points', { ascending: false })
    .limit(50);
  
  if (dateFilter) {
    // For weekly/monthly, need to query point_history table
    // This is simplified - actual implementation would aggregate points
  }
  
  const { data } = await query;
  return data;
};

const LeaderboardScreen = () => {
  const schoolId = useUserStore(state => state.schoolId);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard', schoolId, period],
    queryFn: () => getSchoolLeaderboard(schoolId, period)
  });
  
  return (
    <ScrollView>
      <Heading>à¶´à·à·ƒà¶½à·Š à¶´à·Šâ€à¶»à¶¸à·”à¶› à¶¸à¶«à·Šà¶©à¶½à¶º</Heading>
      
      <SegmentedControl
        values={['à·ƒà¶­à·’à¶ºà·š', 'à¶¸à·à·ƒà·’à¶š', 'à·ƒà¶»à·Šà·€à¶šà·à¶½à·“à¶±']}
        selectedIndex={period === 'weekly' ? 0 : period === 'monthly' ? 1 : 2}
        onChange={(e) => {
          const periods = ['weekly', 'monthly', 'alltime'];
          setPeriod(periods[e.nativeEvent.selectedSegmentIndex]);
        }}
      />
      
      {leaderboard?.map((user, index) => (
        <LeaderboardRow
          key={user.id}
          rank={index + 1}
          name={user.full_name}
          points={user.total_points}
          level={user.level}
          streak={user.current_streak}
        />
      ))}
    </ScrollView>
  );
};
```

### **Unlockable Features**

```typescript
const UNLOCKABLES = {
  custom_theme: {
    requiredLevel: 5,
    feature: 'Custom sanctuary theme colors',
    description: 'Personalize your app colors'
  },
  
  advanced_analytics: {
    requiredLevel: 7,
    feature: 'Advanced student analytics',
    description: 'Detailed insights into class performance'
  },
  
  priority_support: {
    requiredLevel: 10,
    feature: 'Priority support',
    description: '24-hour response time from Gurudevi team'
  }
};

const checkUnlockables = (userLevel: number) => {
  return Object.entries(UNLOCKABLES)
    .filter(([_, unlock]) => userLevel >= unlock.requiredLevel)
    .map(([key, unlock]) => ({ key, ...unlock }));
};
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## 7.6 FAB Implementation (v0.5)

**Goal**: Compete with international platforms

**Success Criteria**:
- LKR 200,000+ monthly revenue
- 1000+ students
- 10+ schools
- 100+ teachers

**Add**:

### **AI Assistant** (Pro/Premium only):
```typescript
// Claude API integration
const AIAssistant = () => {
  const tier = useUserStore(state => state.tier);
  
  if (tier !== 'pro' && tier !== 'premium') {
    return <UpgradePrompt feature="AI Assistant" />;
  }
  
  // Features:
  // - Generate lesson plans (Si/Ta/En)
  // - Create quiz questions from content
  // - Suggest teaching strategies
  // - Student progress insights
};
```

### **Offline Mode**:
```typescript
// Add SQLite + Drizzle ORM
// Sync when online
// Full functionality offline (Self, Classroom, Profile)
// Community/Library require online
```

### **Advanced Features**:
- âœ… Interactive lessons (H5P-like)
- âœ… Video conferencing (1-on-1 mentorship, Agora.io)
- âœ… Principal dashboard (school-wide analytics)
- âœ… API integrations (Zapier, Google Classroom import)
- âœ… Mobile app sharing (students share progress with parents)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## 7.7 Maps Implementation (v0.5)

**Use Cases**:
1. School locations (for district admins/principals)
2. Field trip planning (teachers)
3. Student pickup zones (safety)

### **Implementation**:

```typescript
// Install: npx expo install react-native-maps
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const SchoolMapScreen = () => {
  const { data: schools } = useQuery({
    queryKey: ['schools_map'],
    queryFn: async () => {
      const { data } = await supabase
        .from('schools')
        .select('id, name, latitude, longitude, type')
        .not('latitude', 'is', null);
      return data;
    }
  });
  
  const [region, setRegion] = useState({
    latitude: 7.8731,  // Sri Lanka center
    longitude: 80.7718,
    latitudeDelta: 3,
    longitudeDelta: 3
  });
  
  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {schools?.map(school => (
          <Marker
            key={school.id}
            coordinate={{
              latitude: school.latitude,
              longitude: school.longitude
            }}
            title={school.name}
            description={school.type}
            pinColor={school.type === 'government' ? '#4CAF50' : '#2196F3'}
          />
        ))}
      </MapView>
      
      {/* School list overlay */}
      <View style={styles.schoolList}>
        <ScrollView>
          {schools?.map(school => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
```

### **Data Schema** (for school locations):

```sql
-- Add to schools table
ALTER TABLE schools 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN address TEXT,
ADD COLUMN district TEXT;

-- Index for geo queries
CREATE INDEX idx_schools_location ON schools(latitude, longitude);
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## 7.8 Migration Path

**v0.1 â†’ v0.5**:
```sql
-- Add subscription tables
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE TABLE gift_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  tier TEXT CHECK (tier IN ('pro', 'premium')),
  duration_months INTEGER,
  redeemed_by UUID REFERENCES users(id),
  redeemed_at TIMESTAMPTZ
);

-- Update users table
ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
```

**v0.5 â†’ v1.0**:
```sql
-- Add offline sync
ALTER TABLE content_items ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE content_items ADD COLUMN last_synced_at TIMESTAMPTZ;

CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  table_name TEXT,
  record_id UUID,
  action TEXT CHECK (action IN ('insert', 'update', 'delete')),
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Add AI usage tracking (for billing)
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  feature TEXT,  -- 'lesson_generation', 'quiz_creation', etc.
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 8: SECURITY & PRIVACY

## 8.1 Security Layers

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  LAYER 1: Transport Security               â”‚
â”‚  â€¢ HTTPS/TLS 1.3 (all connections)        â”‚
â”‚  â€¢ Certificate pinning (prevent MITM)      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  LAYER 2: Authentication                   â”‚
â”‚  â€¢ Supabase Auth (JWT tokens)             â”‚
â”‚  â€¢ Password requirements (min 8 char)      â”‚
â”‚  â€¢ Optional MFA (v0.5)                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  LAYER 3: Authorization                    â”‚
â”‚  â€¢ Supabase RLS (row-level security)      â”‚
â”‚  â€¢ Users can only access own school data  â”‚
â”‚  â€¢ Role-based permissions                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  LAYER 4: Data Encryption                 â”‚
â”‚  â€¢ At rest: PostgreSQL encryption          â”‚
â”‚  â€¢ In transit: TLS                         â”‚
â”‚  â€¢ Sensitive data: AES-256                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  LAYER 5: Application Security             â”‚
â”‚  â€¢ Input validation (XSS prevention)       â”‚
â”‚  â€¢ SQL injection prevention (parameterized)â”‚
â”‚  â€¢ Rate limiting (100 req/hour/user)      â”‚
â”‚  â€¢ Audit logging (sensitive actions)       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## 8.2 Child Safety (Critical)

**Principle**: Students under 18 require additional protection

### **No Public Student Profiles**:
```sql
CREATE POLICY "Student profiles hidden"
ON users FOR SELECT
TO authenticated
USING (
  -- Students can see own profile
  (id = auth.uid())
  OR
  -- Teachers can see students in THEIR classrooms only
  (
    role = 'student'
    AND id IN (
      SELECT cm.user_id 
      FROM classroom_members cm
      WHERE cm.classroom_id IN (
        SELECT classroom_id 
        FROM classroom_members 
        WHERE user_id = auth.uid() 
        AND role = 'teacher'
      )
      AND cm.role = 'student'
    )
  )
  OR
  -- Principals see students in THEIR school only
  (
    role = 'student'
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
  )
  OR
  -- Teachers and principals are visible to school
  (role IN ('teacher', 'principal') AND school_id = (SELECT school_id FROM users WHERE id = auth.uid()))
);
```

### **No Direct Student-Student Messaging** (v0.1):
```typescript
// No DMs between students
// Only:
// - Teachers â†’ Students (feedback on assignments)
// - Students â†’ Teachers (questions)
// - Principals â†’ Everyone (announcements)

// v0.5+: Study groups (teacher-supervised)
```

### **Content Moderation** (v0.5):
```sql
CREATE TABLE flagged_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT,  -- 'announcement', 'comment', 'content_item'
  content_id UUID,
  flagged_by UUID REFERENCES users(id),
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'removed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Principals can review flagged content
-- Auto-flag on keywords (optional, v1.0)
```

## 8.3 Data Privacy (GDPR-Inspired)

**User Rights**:

### **Right to Access**:
```typescript
// Export all user data
const exportUserData = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  const { data: reflections } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId);
    
  const { data: grades } = await supabase
    .from('student_grades')
    .select('*')
    .eq('student_id', userId);
    
  // ... other tables
  
  const exportData = {
    user,
    reflections,
    grades,
    exported_at: new Date().toISOString()
  };
  
  // Generate PDF or JSON download
  return exportData;
};
```

### **Right to Delete**:
```sql
-- Cascade deletes configured
CREATE TABLE users (
  id UUID PRIMARY KEY,
  -- ...
);

-- When user deleted, all their data deleted
CREATE TABLE reflections (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE student_grades (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE
);
```

### **Right to Rectify**:
```typescript
// Users can edit their own data
const ProfileScreen = () => {
  const userId = useUserStore(state => state.userId);
  
  const updateProfile = async (updates) => {
    await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
  };
};
```

## 8.4 Audit Logging (v0.5)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT,  -- 'data_export', 'data_delete', 'grade_change', etc.
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger on sensitive actions
CREATE FUNCTION log_grade_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    NEW.graded_by,
    'grade_updated',
    'student_grade',
    NEW.id,
    jsonb_build_object(
      'student_id', NEW.student_id,
      'old_grade', OLD.grade,
      'new_grade', NEW.grade
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_grade_changes
  AFTER UPDATE ON student_grades
  FOR EACH ROW
  WHEN (OLD.grade IS DISTINCT FROM NEW.grade)
  EXECUTE FUNCTION log_grade_change();
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 9: IMPLEMENTATION PATTERNS

## 9.1 State Management Pattern

### **User Store (Zustand + MMKV)**:
```typescript
// stores/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface UserState {
  // Identity (set once at login, persists)
  userId: string | null;
  role: 'student' | 'teacher' | 'principal' | null;
  schoolId: string | null;
  
  // Preferences (user-editable)
  language: 'si' | 'ta' | 'en';
  dataSaverMode: boolean;
  tier: 'free' | 'pro' | 'premium';
  
  // Actions
  setUser: (user: { id: string; role: string; schoolId: string; tier?: string }) => void;
  updateSettings: (settings: Partial<UserState>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      schoolId: null,
      language: 'si',
      dataSaverMode: false,
      tier: 'free',
      
      setUser: (user) => set({ 
        userId: user.id, 
        role: user.role as any,
        schoolId: user.schoolId,
        tier: (user.tier as any) || 'free'
      }),
      
      updateSettings: (settings) => set(settings),
      
      clearUser: () => set({ 
        userId: null, 
        role: null, 
        schoolId: null,
        tier: 'free'
      })
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key)
      }))
    }
  )
);
```

### **Server State (TanStack Query)**:
```typescript
// hooks/useGrades.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useGrades = () => {
  const role = useUserStore(state => state.role);
  
  // Fetch grades (RLS auto-filters by role)
  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_grades')
        .select(`
          *,
          student:users!student_id(full_name, email),
          classroom:classrooms(name, grade_level),
          grader:users!graded_by(full_name)
        `)
        .order('graded_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5  // Cache for 5 minutes
  });
  
  // Create/update grade (teachers only)
  const queryClient = useQueryClient();
  
  const updateGrade = useMutation({
    mutationFn: async ({ gradeId, updates }: { gradeId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('student_grades')
        .update(updates)
        .eq('id', gradeId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate cache, refetch
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    }
  });
  
  return { grades, isLoading, updateGrade };
};
```

## 9.2 Internationalization Pattern

### **i18n Setup**:
```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import si from './locales/si.json';
import ta from './locales/ta.json';
import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      si: { translation: si },
      ta: { translation: ta },
      en: { translation: en }
    },
    lng: Localization.locale.split('-')[0], // 'si' from 'si-LK'
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### **Translation Files**:
```json
// i18n/locales/si.json
{
  "common": {
    "welcome": "à¶†à¶ºà·”à¶¶à·à·€à¶±à·Š",
    "login": "à¶´à·’à·€à·’à·ƒà·™à¶±à·Šà¶±",
    "logout": "à¶´à·’à¶§à·€à·“à¶¸",
    "save": "à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
    "cancel": "à¶…à·€à¶½à¶‚à¶œà·” à¶šà¶»à¶±à·Šà¶±"
  },
  "tabs": {
    "self": "à·ƒà·Šà·€à¶ºà¶‚",
    "classroom": "à¶´à¶±à·Šà¶­à·’à¶º",
    "community": "à¶´à·Šâ€à¶»à¶¢à·à·€",
    "library": "à¶´à·”à·ƒà·Šà¶­à¶šà·à¶½à¶º",
    "profile": "à¶´à·à¶­à·’à¶šà¶©"
  },
  "roles": {
    "student": "à·à·’à·‚à·Šâ€à¶ºà·",
    "teacher": "à¶œà·”à¶»à·”à·€à¶»à¶ºà·",
    "principal": "à·€à·’à¶¯à·”à·„à¶½à·Šà¶´à¶­à·’"
  }
}
```

### **Usage in Components**:
```typescript
// screens/SelfScreen.tsx
import { useTranslation } from 'react-i18next';

const SelfScreen = () => {
  const { t } = useTranslation();
  const language = useUserStore(state => state.language);
  
  return (
    <View>
      <Text style={styles.heading}>
        {t('self.dailyCheckIn')}
      </Text>
      
      <Button onPress={saveMood}>
        {t('common.save')}
      </Button>
    </View>
  );
};
```

## 9.3 Sanctuary Theme Pattern

### **Theme Configuration**:
```typescript
// constants/theme.ts
import { createConfig } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

export const sanctuaryTheme = createConfig({
  ...config,
  tokens: {
    ...config.tokens,
    colors: {
      // Sanctuary palette (from Design Framework)
      sanctuary50: '#FFF8F0',   // Cream (backgrounds)
      sanctuary100: '#FFF8E7',  // Light cream (cards)
      sanctuary200: '#FFE8CC',
      sanctuary500: '#E67E22',  // Warm orange (primary actions)
      sanctuary700: '#D35400',
      sanctuary900: '#0f0f1e',  // Deep navy (text/dark mode)
      
      // Supporting colors
      sage500: '#8FBC8F',       // Growth/success
      ember500: '#FF6347',      // Alerts/focus
      sky500: '#87CEEB',        // Info
      lotus500: '#FFB6C1',      // Accent (lotus pink)
    },
    fonts: {
      heading: 'NotoSansSinhala-Bold',
      body: 'NotoSansSinhala-Regular',
      mono: 'Courier'
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30
    },
    space: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    radii: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999
    }
  },
  // Custom component styles
  components: {
    Button: {
      baseStyle: {
        borderRadius: '$lg',
        // Organic, breath-like timing (from Design Framework)
        _hover: {
          transform: [{ scale: 1.02 }],
          transition: { duration: 350, type: 'timing', easing: 'ease-in-out' }
        }
      }
    },
    Card: {
      baseStyle: {
        borderRadius: '$lg',
        backgroundColor: '$sanctuary100',
        shadowColor: '$sanctuary900',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Floating appearance (from Design Framework)
        elevation: 2
      }
    }
  }
});
```

### **Gluestack Provider Setup**:
```typescript
// App.tsx
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { sanctuaryTheme } from './constants/theme';

export default function App() {
  return (
    <GluestackUIProvider config={sanctuaryTheme}>
      {/* App content */}
    </GluestackUIProvider>
  );
}
```

## 9.4 Animation Patterns (Sanctuary Feel)

### **Lotus Petal Assistant** (from Design Framework):
```typescript
// components/LotusPetal.tsx
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';

const LotusPetal = ({ visible }: { visible: boolean }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  // Floating animation (breath-like, from Design Framework)
  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.bezier(0.4, 0.0, 0.6, 1.0) }),
        withTiming(0, { duration: 2000, easing: Easing.bezier(0.4, 0.0, 0.6, 1.0) })
      ),
      -1,  // Infinite
      false
    );
    
    opacity.value = withTiming(visible ? 1 : 0, { duration: 400 });
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      <Svg width={40} height={40} viewBox="0 0 100 100">
        {/* Lotus petal SVG path */}
        <Path
          d="M50,10 Q70,30 50,50 Q30,30 50,10 Z"
          fill="#FFB6C1"
          opacity={0.8}
        />
      </Svg>
    </Animated.View>
  );
};
```

### **Natural Transitions** (Organic Easing):
```typescript
// utils/animations.ts

// From Design Framework: Natural, breath-like timing
export const SANCTUARY_TIMING = {
  quick: 200,       // Immediate feedback
  natural: 350,     // Most UI transitions
  thoughtful: 500,  // Important state changes
  meditative: 800   // Major scene transitions
};

export const SANCTUARY_EASING = {
  // Breath-like (inhale/exhale rhythm)
  natural: Easing.bezier(0.4, 0.0, 0.6, 1.0),
  
  // Organic spring (lotus floating on water)
  spring: {
    damping: 15,
    stiffness: 100,
    mass: 1
  }
};

// Helper function
export const naturalTransition = (value: number, duration = SANCTUARY_TIMING.natural) => {
  'worklet';
  return withTiming(value, {
    duration,
    easing: SANCTUARY_EASING.natural
  });
};
```

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# PART 10: QUICK START GUIDE

## 10.1 Day 1: Project Setup

```bash
# Create Expo project
npx create-expo-app@latest gurudevi --template blank-typescript
cd gurudevi

# Install exact framework versions
npm install expo@~54.0.32 --save-exact
npm install react@19.1.0 react-native@0.81.5 --save-exact
npm install typescript@~5.9.2 --save-dev

# Create .npmrc (CRITICAL for React 19)
echo "legacy-peer-deps=true" > .npmrc

# Install core dependencies
npm install @gluestack-ui/themed@^1.1.73
npm install react-native-reanimated@~4.1.1
npm install react-native-gesture-handler@^2.20.0
npm install zustand@^5.0.10
npm install @tanstack/react-query@^5.90.20
npm install react-native-mmkv@^4.1.1
npm install @supabase/supabase-js@^2.90.1
npm install react-native-url-polyfill@^3.0.0
npm install react-i18next@^13.5.0 i18next@^23.7.0
npm install @react-navigation/native@^7.0.0
npm install @react-navigation/bottom-tabs@^7.0.0
npm install @react-navigation/stack@^7.0.0
npm install lucide-react-native@~0.563.0
npm install react-native-svg@15.12.1

# Expo modules
npx expo install expo-av expo-image expo-image-picker expo-document-picker
```

## 10.2 Day 2: Configuration

### **app.json**:
```json
{
  "expo": {
    "name": "Gurudevi",
    "slug": "gurudevi",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "jsEngine": "hermes",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFF8F0"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "lk.gurudevi.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFF8F0"
      },
      "package": "lk.gurudevi.app"
    }
  }
}
```

### **babel.config.js**:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'  // MUST be last!
    ]
  };
};
```

### **eas.json**:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    },
    "production": {
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### **.env**:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

## 10.3 Day 3: Supabase Setup

1. **Create Supabase project** at https://supabase.com
2. **Run SQL schema** (from Part 4.2 - all CREATE TABLE statements)
3. **Enable RLS** on all tables
4. **Create RLS policies** (from Part 6.2)
5. **Create indexes** (from Part 4.3)
6. **Test connection**:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
```

## 10.4 Day 4: Fonts & Theme

1. **Download Noto Sans Sinhala/Tamil** from Google Fonts
2. **Place in** `/assets/fonts/`
3. **Load fonts**:

```typescript
// App.tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'NotoSansSinhala-Regular': require('./assets/fonts/NotoSansSinhala-Regular.ttf'),
    'NotoSansSinhala-Bold': require('./assets/fonts/NotoSansSinhala-Bold.ttf'),
    'NotoSansTamil-Regular': require('./assets/fonts/NotoSansTamil-Regular.ttf'),
    'NotoSansTamil-Bold': require('./assets/fonts/NotoSansTamil-Bold.ttf'),
  });
  
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  
  if (!fontsLoaded) return null;
  
  return (
    <GluestackUIProvider config={sanctuaryTheme}>
      {/* App */}
    </GluestackUIProvider>
  );
}
```

## 10.5 Day 5-7: Core Structure

**Project structure**:
```
gurudevi/
â”œâ”€â”€ app/                    # Expo Router (or screens/)
â”‚   â”œâ”€â”€ (tabs)/            # Bottom tab screens
â”‚   â”‚   â”œâ”€â”€ self.tsx
â”‚   â”‚   â”œâ”€â”€ classroom.tsx
â”‚   â”‚   â”œâ”€â”€ community.tsx
â”‚   â”‚   â”œâ”€â”€ library.tsx
â”‚   â”‚   â””â”€â”€ profile.tsx
â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ login.tsx
â”‚   â”‚   â””â”€â”€ signup.tsx
â”‚   â””â”€â”€ _layout.tsx
â”œâ”€â”€ components/            # Reusable components
â”‚   â”œâ”€â”€ LotusPetal.tsx
â”‚   â”œâ”€â”€ SanctuaryCard.tsx
â”‚   â””â”€â”€ ...
â”œâ”€â”€ constants/
â”‚   â”œâ”€â”€ theme.ts
â”‚   â””â”€â”€ navigation.ts
â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ useGrades.ts
â”‚   â”œâ”€â”€ useClassrooms.ts
â”‚   â””â”€â”€ ...
â”œâ”€â”€ i18n/
â”‚   â”œâ”€â”€ config.ts
â”‚   â””â”€â”€ locales/
â”‚       â”œâ”€â”€ si.json
â”‚       â”œâ”€â”€ ta.json
â”‚       â””â”€â”€ en.json
â”œâ”€â”€ lib/
â”‚   â””â”€â”€ supabase.ts
â”œâ”€â”€ stores/
â”‚   â””â”€â”€ useUserStore.ts
â”œâ”€â”€ utils/
â”‚   â””â”€â”€ animations.ts
â”œâ”€â”€ app.json
â”œâ”€â”€ babel.config.js
â”œâ”€â”€ eas.json
â”œâ”€â”€ package.json
â””â”€â”€ tsconfig.json
```

## 10.6 Testing Checklist

**Before v0.1 launch**:
- [ ] Authentication (email/password) works
- [ ] Role-based navigation (student/teacher/principal see correct tabs)
- [ ] Self section: Mood check-in saves
- [ ] Classroom: Teacher can create classroom, upload PDF
- [ ] Classroom: Student can view assigned content
- [ ] Community: Principal can post announcement
- [ ] Library: 20 resources display correctly
- [ ] Profile: User can edit name, change language
- [ ] Sinhala/Tamil text displays correctly (no boxes)
- [ ] Data saver mode reduces image quality
- [ ] App works on low-end Android (2GB RAM)
- [ ] RLS policies prevent unauthorized access

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

# CONCLUSION

## What This Architecture Enables

**For v0.1** (3 months):
- âœ… Build quickly (proven stack, good docs, battle-tested)
- âœ… Works cloud-first (faster to ship than offline-first)
- âœ… Scales to 10 schools without changes
- âœ… Multi-tenant from day 1 (one database, all schools)
- âœ… Secure foundation (RLS, UUID, audit logging)
- âœ… Sri Lanka-optimized (Si/Ta/En, data saver, PayHere-ready)

**For v0.5** (6 months):
- âœ… Add revenue (pricing tiers, PayHere integration)
- âœ… Unlock Community + Library (full features)
- âœ… OCR for Sinhala/Tamil (expo-ocr)
- âœ… Advanced features (quizzes, forms, analytics)
- âœ… Same database, same architecture (no rearchitecture)

**For v1.0** (12 months):
- âœ… Add offline mode (SQLite + sync, UUIDs enable this)
- âœ… AI assistant (Claude API, Pro/Premium only)
- âœ… Advanced features (video calls, interactive lessons)
- âœ… Scales to 1000+ students, 50+ schools
- âœ… Platform agnostic (Supabase self-hostable if needed)

**For the Cathedral** (years):
- âœ… Extensible (spiral development, grow without breaking)
- âœ… Debuggable (Sentry, audit logs, clear patterns)
- âœ… Evolvable (migrations documented, versioned)
- âœ… Ownable (no vendor lock-in, multi-tenant flexible)
- âœ… Sanctuary (aesthetics preserved through all versions)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## Critical Decisions Documented

**1. Navigation**: 5-tab structure (Self, Classroom, Community, Library, Profile) - NEVER changes

**2. Database**: Multi-tenant (one database, school_id in every table) - NOT separate databases per school

**3. IDs**: UUID everywhere - NOT integer auto-increment

**4. Offline**: Cloud-first v0.1, offline v1.0 - NOT offline-first from start

**5. Roles**: Same structure for all roles, different content - NOT separate apps per role

**6. Security**: RLS at database level - NOT application-level only

**7. Stack**: React 19 + Expo 54 + Supabase - Battle-tested through 4 builds

**8. Languages**: Sinhala/Tamil/English from day 1 - NOT English-first

**9. Revenue**: Freemium v0.5 (PayHere) - NOT all-free forever

**10. AI**: v1.0 only, Pro/Premium tier - NOT v0.1, NOT free tier

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## Next Steps

**Week 1-2** (With buddy/solo):
1. Set up Expo project (follow Day 1-4 guide)
2. Implement Supabase schema (all tables, RLS, indexes)
3. Build auth flow (login, signup, role assignment)
4. Create user store (Zustand + MMKV)
5. Test RLS policies (ensure student can't see other student's data)

**Week 3-4**:
1. Build Self section (mood check-in, reflection journal)
2. Implement Classroom basics (create classroom, upload content)
3. Add bottom tab navigation
4. Test on real devices (low-end Android)

**Week 5-6**:
1. Complete Community minimal (announcements)
2. Complete Library minimal (20 curated resources)
3. Build Profile section
4. Apply sanctuary theme (colors, fonts, animations)

**Week 7-8**:
1. Polish lotus petal assistant
2. Add natural animations (breath-like timing)
3. Implement data saver mode
4. Multilingual testing (Si/Ta/En)

**Week 9-10**:
1. Bug fixes
2. Performance optimization
3. First school pilot (3-5 teachers)
4. Iterate based on feedback

**Week 11-12**:
1. Final polish
2. Deploy to App Store / Play Store (TestFlight / Internal Testing)
3. Onboard first paying school
4. Plan v0.5 features

---

**The seed contains the cathedral's DNA.** ðŸŒ±

**This architecture will grow with you.** ðŸŒ³

**From 1 teacher to 1,000 schools.** ðŸª·

---

*à¶¢à¶ºà·€à·šà·€* (Jayawewa - May you be victorious!)

**END OF GURUDEVI ARCHITECTURE v4.0**

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current — see apps/gurudevi-mobile/README.md for the live stack.

## Document Metadata

- **Version**: 4.0
- **Last Updated**: February 1, 2026
- **Total Length**: ~2,800 lines
- **Completeness**: Production-ready
- **Validation**: Battle-tested stack + Architectural decisions clarified
- **Audience**: You + Buddy + Future developers + AI agents

**Use This As**:
- Single source of truth
- Technical reference
- Onboarding document
- Decision framework
- Strategic guide

**Update When**:
- New architectural decisions made
- Major features added/changed
- Ecosystem updates (SDK versions)
- Lessons learned from production

**Changelog**:
- v4.0 (Feb 1, 2026): Added unified 5-tab navigation, UUID strategy, multi-tenant architecture, role-based windows, v0.1 feature scope
- v3.0 (Feb 1, 2026): Battle-tested stack (React 19 + Expo 54), PayHere, Sri Lanka context
- v1.0 (Jan 27, 2026): Initial architecture (WatermelonDB, offline-first, teacher-focused)
