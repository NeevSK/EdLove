# 🏗️ Architecture & Tech Stack Reference
**Consolidated Technical Overview**

**Date:** February 10, 2026
**Sources:** GURUDEVI_STACK_v3_1_FINAL.md, SECURITY_ARCHITECTURE_REVIEW.md, PROJECT_STATUS_REPORT.md

---

## 1. Core Technology Stack

### 1.1 Framework (Battle-Tested Configuration)
```json
{
  "expo": "~54.0.32",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "typescript": "~5.9.2"
}
```

**Critical:** This exact combination survived 4 failed builds. **Do not change without testing.**

### 1.2 UI & Styling
- **@gluestack-ui/themed**: Component library (3x faster than NativeBase)
- **lucide-react-native**: Icon system
- **react-native-reanimated 4.1.1**: Animations (NO MOTI - broken)

**Why Gluestack:**
- React 19 compatible
- Excellent Sinhala/Tamil font support
- Perfect for Sanctuary aesthetics

### 1.3 State Management Pattern
```typescript
// Global state → Zustand
const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

// Server state → TanStack Query
const { data: lessons } = useQuery({
  queryKey: ['lessons', classroomId],
  queryFn: () => classroom.lessons.getAll(teacherId)
});

// Persistence → MMKV (30x faster than AsyncStorage)
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();
storage.set('hasRegistered', true);
```

### 1.4 Storage & Cache (Hybrid Persistence)
- **Primary Engine**: `react-native-mmkv` (Synchronous, Ultra-fast).
- **Fail-safe Fallback**: `@react-native-async-storage/async-storage`.
- **Strategy**: If MMKV initialization fails (common on some iOS/Expo environments), the app automatically falls back to AsyncStorage to ensure data is **never lost**.
  - *Note*: We avoid "In-Memory" only fallbacks in production.

### 1.5 Media Storage (Cloudinary)
- **Tool**: Cloudinary (Recommended).
- **Core Assets**: Lessons, images, and videos.
  - *Why?* Auto-optimization, auto-format, and up to 25GB free storage via credit system.

---

## 2. Application Architecture (5-Tab System)

### 2.1 Navigation Structure
```
Bottom Navigation (Universal for ALL roles):

🧘 Self  |  🏫 Classroom  |  🌸 Community  |  📚 Library  |  👤 Profile
```

**Key Principle:** Same 5 tabs for everyone, different content per role.

### 2.2 Role-Based Content Pattern
```typescript
// screens/ClassroomScreen.tsx
const ClassroomScreen = () => {
  const role = useUserStore(state => state.role);
  
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

**See:** Architecture v4.0 Part 2 for detailed role specifications.

---

## 3. Security Architecture

### 3.1 Current Implementation
✅ **Implemented:**
- Supabase Auth with session management
- TypeScript type safety
- APIError class for error handling
- Basic role system (student, teacher, principal, admin, founder)

❌ **Missing (Critical):**
- Input validation on forms
- Authorization checks on API endpoints
- Rate limiting
- XSS sanitization
- Audit logging

### 3.2 Row-Level Security (RLS) Policies
```sql
-- Example: Users can only see classrooms in their school
CREATE POLICY school_isolation ON classrooms
FOR SELECT USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);
```

**Status:** RLS configured but authorization checks incomplete in client code.

---

## 4. Key Design Patterns

### 4.1 API Module Pattern
```typescript
// src/lib/api/classroom.ts
export const classroom = {
  lessons: {
    async getAll(teacherId: string) {
      // TODO: Add authorization check
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', teacherId);
      
      if (error) throw new APIError('Failed to fetch lessons', error.code);
      return data || [];
    }
  }
};
```

**14 API modules covering:**
- Teacher tasks, classroom management, attendance, grading
- Community posts, library resources, self-reflection
- Notifications, groups, rewards

### 4.2 Error Handling Pattern
```typescript
interface APIError extends Error {
  code: string;
  details?: any;
}

throw new APIError('Lesson not found', 'NOT_FOUND');
```

---

## 5. Internationalization (i18n)

### 5.1 Configuration
```typescript
// i18n/config.ts
i18n.use(initReactI18next).init({
  resources: {
    si: { translation: require('./locales/si.json') },
    ta: { translation: require('./locales/ta.json') },
    en: { translation: require('./locales/en.json') }
  },
  lng: 'si',  // Default: Sinhala
  fallbackLng: 'en'
});
```

### 5.2 Usage
```typescript
const { t } = useTranslation();
return <Text>{t('tabs.classroom')}</Text>;
```

**Translation Files:**
- `i18n/locales/si.json` (Sinhala)
- `i18n/locales/ta.json` (Tamil)
- `i18n/locales/en.json` (English)

---

## 6. Performance Optimizations

### 6.1 Critical Configurations
```javascript
// babel.config.js
plugins: [
  'react-native-reanimated/plugin'  // MUST be last!
]

// app.json
{
  "newArchEnabled": true,  // React 19 requirement
  "jsEngine": "hermes"     // Better performance
}
```

### 6.2 Data Saver Mode (Sri Lanka-Specific)
```typescript
const dataSaverEnabled = storage.getBoolean('dataSaverMode');

if (dataSaverEnabled) {
  // Load low-res images
  // Limit video auto-play
  // Reduce analytics events
}
```

---

## 7. Critical Build Gotchas

### 7.1 The .npmrc File (REQUIRED)
```
legacy-peer-deps=true
```
**Why:** React 19 peer dependency conflicts without this.

### 7.2 Battle Scars (Learn from Failures)
| Build # | Failure | Solution |
|---------|---------|----------|
| 1 | Install crash | Added `legacy-peer-deps=true` |
| 2 | Gradle crash | Disabled New Arch temporarily |
| 3 | Gradle crash | Upgraded to Reanimated 4 |
| 4 | ✅ SUCCESS | Exact config in v3.1 |

**Lesson:** Never upgrade dependencies without testing the entire build.

---

## 8. Deployment Configuration

### 8.1 EAS Build
```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    }
  }
}
```

### 8.2 App Identifiers
- **iOS:** `lk.gurudevi.app`
- **Android:** `lk.gurudevi.app`

---

## 9. Feature Roadmap Alignment

### v0.1 (Weeks 1-14) - MVP
- ✅ 5-tab navigation
- ✅ Authentication
- ✅ Self section (mood, journal, breathing)
- ✅ Classroom (basic content upload/view)
- ✅ Community (announcements)
- ✅ Library (teacher upload, student view)
- ✅ i18n (si/ta/en)

### v0.5 (Weeks 15-26) - Revenue
- Forms & polls
- Rewards system (points, badges, levels)
- PayHere integration (Sri Lankan payment)
- Pricing tiers (Free, Pro, Premium)
- OCR (Sinhala/Tamil text recognition)

### v1.0 (Weeks 27-40) - Power
- AI Assistant (Claude integration)
- Offline mode (SQLite + Drizzle ORM)
- Advanced analytics

**Total Timeline:** 10 months (realistic) | 12 months (with buffer)

---

## 10. Key External Resources

### Official Documentation
- **Architecture:** `Docs v 3.0/Core/GURUDEVI_ARCHITECTURE_v2_0.md`
- **Security:** `Docs v 3.0/Core/GURUDEVI_SECURITY_FOUNDATION_v2_0.md`
- **Tech Stack:** `Docs v 3.0/Core/GURUDEVI_STACK_v3_1_FINAL.md`

### Locked Alpha Specs
- **Master Spec:** `Docs v 3.0/Tasks/GURUDEVI_ALPHA_COMPLETE_FINAL.md`
- **Auth System:** `Docs v 3.0/Tasks/gurudevi_final_invitation_auth_system.md`
- **Onboarding:** `Docs v 3.0/Tasks/onboarding_design.md`

---

**Status:** This document consolidates the definitive technical stack
**Last Sync:** February 10, 2026
