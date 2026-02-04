# AI AGENT CONTEXT
## Instructions for Building Gurudevi

**Version**: 1.0  
**Created**: February 2, 2026  
**Audience**: AI agents (Antigravity, Cursor, Claude Code, etc.)  
**Purpose**: How to build features that align with Gurudevi's vision

---

## Quick Start

When you start a new session building Gurudevi:

1. **Read NORTH_STAR.md** - Understand the soul (5 min read)
2. **Read ARCHITECTURE.md** - Understand the system (15 min read)
3. **Read DESIGN_SYSTEM.md** - Understand the visuals (10 min read)
4. **Read CURRENT_SPRINT.md** - Know what to build NOW (2 min read)

**Total onboarding**: ~30 minutes

Then you're ready to build.

---

# 1. PROJECT OVERVIEW

## What You're Building

**Gurudevi** = School platform for Sri Lankan teachers with sanctuary aesthetics

**NOT**:
- Generic LMS
- Meditation app
- Wellness-only tool
- Corporate education software

**Core Users**:
1. Teachers (primary, heavy lifters)
2. Principals (supportive role, not surveillance)
3. Students (architecturally supported, minimal features v0.1)

**Core Value**: Mobile-first, data-conscious, trilingual (Sinhala/Tamil/English), works on low-end devices

---

# 2. TECHNOLOGY STACK

## Frontend

```javascript
// Core Stack
React Native: "0.76+"
Expo: "54"
React: "19"
TypeScript: "5.x"

// UI Framework
Gluestack UI: "v2"

// Navigation
React Navigation: "7"
Bottom Tabs + Stack Navigator

// State Management
Zustand: "4.x" (reactive state)
MMKV: "2.x" (persistence)

// Animation
React Native Reanimated: "3.x"
React Native Gesture Handler: "2.x"

// Internationalization
i18next: "23.x"
react-i18next: "13.x"

// Icons
lucide-react-native: "latest"

// Device APIs
Expo modules (Audio, Haptics, SecureStore, FileSystem)
```

## Backend

```javascript
// Database & API
Supabase (PostgreSQL 15+, PostgREST, GoTrue Auth, Realtime, Storage)

// Edge Functions
Deno runtime
```

## Payments & Integrations

```javascript
// Sri Lanka payments
PayHere SDK

// Monitoring
Sentry (errors)
PostHog (analytics, privacy-friendly)
```

---

# 3. PROJECT STRUCTURE

```
gurudevi/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Bottom tab screens
│   │   ├── self.tsx
│   │   ├── classroom.tsx
│   │   ├── community.tsx
│   │   ├── library.tsx
│   │   └── profile.tsx
│   ├── auth/                # Auth screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── _layout.tsx
├── components/              # Reusable components
│   ├── LotusPetalFAB.tsx   # Floating action button
│   ├── LotusButton.tsx
│   ├── SanctuaryCard.tsx
│   ├── LotusBottomNav.tsx
│   └── ...
├── constants/
│   ├── Theme.ts            # Design tokens
│   └── Navigation.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useClassrooms.ts
│   └── ...
├── i18n/
│   ├── config.ts
│   └── locales/
│       ├── si.json         # Sinhala
│       ├── ta.json         # Tamil
│       └── en.json         # English
├── lib/
│   └── supabase.ts         # Supabase client
├── stores/
│   ├── useUserStore.ts     # Zustand stores
│   └── useAppStore.ts
├── utils/
│   ├── animations.ts
│   └── helpers.ts
├── app.json
├── babel.config.js
├── eas.json
├── package.json
└── tsconfig.json
```

---

# 4. CODING RULES

## TypeScript

**Use strict mode**:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**Type everything** (no `any` except absolute necessity):
```typescript
// ✅ Good
interface Lesson {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

// ❌ Bad
const lesson: any = { ... };
```

---

## React Components

**Use functional components** (no classes):
```typescript
// ✅ Good
export function LessonCard({ lesson }: { lesson: Lesson }) {
  return <View>...</View>;
}

// ❌ Bad
class LessonCard extends React.Component { ... }
```

**Use hooks** for state and effects:
```typescript
const [lessons, setLessons] = useState<Lesson[]>([]);

useEffect(() => {
  fetchLessons();
}, []);
```

---

## Database

**Every table has `school_id`** (multi-tenant):
```typescript
interface BaseEntity {
  id: string; // UUID
  school_id: string; // Foreign key to schools
  created_at: Date;
  updated_at: Date;
}

interface Lesson extends BaseEntity {
  teacher_id: string;
  classroom_id: string;
  title: string;
  content: string;
}
```

**Use UUIDs for all primary keys**:
```typescript
// ✅ Good
const lessonId = crypto.randomUUID();

// ❌ Bad
const lessonId = Math.random().toString();
```

**Always use RLS policies** (Row-Level Security):
```sql
-- Users can only see their school's data
CREATE POLICY "School isolation"
  ON lessons FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );
```

---

## Multilingual

**Never hardcode text**:
```typescript
// ❌ Bad
<Text>Save</Text>

// ✅ Good
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('common.save')}</Text>;
}
```

**i18n file structure**:
```json
// i18n/locales/si.json
{
  "common": {
    "save": "සුරකින්න",
    "cancel": "අවලංගු කරන්න",
    "delete": "මකන්න"
  },
  "self": {
    "moodCheckIn": "මනෝභාවය පරීක්ෂා කරන්න",
    "reflection": "ප්‍රතිබිම්බය"
  }
}
```

**Support all 3 languages from day 1** (Si/Ta/En).

---

## Styling

**Use Theme constants**:
```typescript
import { Theme } from '@/constants/Theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.creamSilence,
    padding: Theme.spacing.lg,
    borderRadius: Theme.corners.comfortable,
  },
  text: {
    fontSize: Theme.typography.body.fontSize,
    lineHeight: Theme.typography.body.lineHeight,
    color: Theme.colors.charcoalTruth,
  }
});
```

**Never use magic numbers**:
```typescript
// ❌ Bad
padding: 16,
fontSize: 18,

// ✅ Good
padding: Theme.spacing.md,
fontSize: Theme.typography.body.fontSize,
```

---

# 5. DESIGN RULES

## Colors (from DESIGN_SYSTEM.md)

**Use Sanctuary palette**:
- Primary action: `sanctuarySaffron` (#E67E22)
- Success: `sageGreen` (#8FBC8F)
- Error: `emberRed` (#FF6347)
- Background (light): `creamSilence` (#FFF8E7)
- Background (dark): `voidIndigo` (#0f0f1e)
- Text on light: `charcoalTruth` (#2C3E50)
- Text on dark: `sacredWhite` (#FFF8F0)

**Never use**:
- Pure white (#FFFFFF)
- Pure black (#000000)
- Bright neon colors

---

## Typography

**Minimum sizes**:
- Body text: 18sp (never smaller)
- Captions: 14sp minimum
- Buttons: 16sp minimum

**Fonts**:
```typescript
const fonts = {
  sinhala: 'NotoSansSinhala-Regular',
  tamil: 'NotoSansTamil-Regular',
  english: 'System', // Use system default for English
};
```

**Line height**: 1.6x for readability

---

## Spacing

**Use Theme.spacing**:
```typescript
Theme.spacing.xs   // 4px  - Tight
Theme.spacing.sm   // 8px  - Small
Theme.spacing.md   // 16px - Standard (most common)
Theme.spacing.lg   // 24px - Large
Theme.spacing.xl   // 32px - Page margins
```

---

## Corners

**Use Theme.corners**:
```typescript
Theme.corners.tight       // 8px  - Small elements
Theme.corners.comfortable // 16px - Buttons, inputs (default)
Theme.corners.generous    // 24px - Cards, modals
Theme.corners.full        // 50%  - Circular (FAB, avatars)
```

**Never use sharp 90° corners**.

---

## Animations

**Timing**:
```typescript
Theme.motion.instant   // 100ms - Rarely used
Theme.motion.quick     // 200ms - Fast transitions
Theme.motion.standard  // 300ms - Default
Theme.motion.gentle    // 500ms - Meditative
Theme.motion.breathing // 4000ms - Lotus companion breathing
```

**Easing**: Use spring physics (feels organic):
```typescript
import { withSpring } from 'react-native-reanimated';

value.value = withSpring(1.0, {
  damping: 15,
  stiffness: 150,
});
```

**Never use linear easing** (feels robotic).

---

# 6. COMPONENT PATTERNS

## Lotus Petal FAB (Floating Action Button)

The Lotus Petal Companion is a FAB that:
- Floats bottom-right (16px from edges)
- Breathes (scale 0.95 ↔ 1.0, 4-second cycle)
- Changes action based on tab
- Hides when scrolling down, shows when scrolling up

```typescript
import { LotusPetalFAB } from '@/components/LotusPetalFAB';

<LotusPetalFAB
  currentTab="self"
  onPress={handleAction}
  position="bottomRight"
  breathingEnabled={true}
/>
```

**Tab-specific actions**:
- Self: "Record reflection"
- Classroom: "Create lesson"
- Community: "Post announcement"
- Library: "Upload resource"
- Profile: "Edit profile"

---

## Buttons

```typescript
import { LotusButton } from '@/components/LotusButton';

<LotusButton
  title={t('common.save')}
  onPress={handleSave}
  variant="primary" // or "secondary", "ghost"
  size="large"      // or "medium", "small"
  icon="save"       // optional
  loading={isLoading}
  disabled={!canSave}
/>
```

**Press animation**: Scale 0.95 → 1.0 with haptic feedback.

---

## Cards

```typescript
import { SanctuaryCard } from '@/components/SanctuaryCard';

<SanctuaryCard
  title={lesson.title}
  description={lesson.description}
  onPress={() => navigateToLesson(lesson.id)}
  footer={<Text>{formatDate(lesson.createdAt)}</Text>}
>
  {/* Card content */}
</SanctuaryCard>
```

**Hover animation**: Lift 2px with shadow increase.

---

## Bottom Navigation

```typescript
import { LotusBottomNav } from '@/components/LotusBottomNav';

<LotusBottomNav
  currentTab={currentTab}
  onTabChange={setCurrentTab}
  tabs={[
    { id: 'self', icon: 'lotus', label: { si: 'ස්වයං', ta: 'சுய', en: 'Self' } },
    // ... other tabs
  ]}
/>
```

**Tab switch animation**: Icon scales 1.0 → 1.1 → 1.0.

---

# 7. SUPABASE PATTERNS

## Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'teacher',
      school_id: schoolId,
      full_name: fullName,
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## Database Queries

```typescript
// Fetch data (with RLS automatically applied)
const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .eq('classroom_id', classroomId)
  .order('created_at', { ascending: false });

// Insert data
const { data, error } = await supabase
  .from('lessons')
  .insert({
    id: crypto.randomUUID(),
    school_id: user.user_metadata.school_id,
    teacher_id: user.id,
    classroom_id: classroomId,
    title,
    content,
  });

// Update data
const { data, error } = await supabase
  .from('lessons')
  .update({ title: newTitle })
  .eq('id', lessonId);

// Delete data
const { data, error } = await supabase
  .from('lessons')
  .delete()
  .eq('id', lessonId);
```

## Realtime Subscriptions

```typescript
const channel = supabase
  .channel('classroom_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'lessons',
    filter: `classroom_id=eq.${classroomId}`
  }, (payload) => {
    console.log('Change received!', payload);
    // Update UI
  })
  .subscribe();

// Cleanup
useEffect(() => {
  return () => {
    channel.unsubscribe();
  };
}, []);
```

## File Upload (Storage)

```typescript
const { data, error } = await supabase.storage
  .from('lesson-files')
  .upload(`${userId}/${fileName}`, fileBlob, {
    contentType: 'application/pdf',
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('lesson-files')
  .getPublicUrl(`${userId}/${fileName}`);
```

---

# 8. PERFORMANCE RULES

## Use Native Driver

**Always use when possible**:
```typescript
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // 60fps on UI thread
});
```

**Can't use native driver for**: Layout properties (width, height, padding, margin).

---

## Lazy Loading

**For lists**:
```typescript
<FlatList
  data={lessons}
  renderItem={renderLesson}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

**For images**:
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
/>
```

---

## Device Tier Detection

**Adapt features based on device**:
```typescript
import * as Device from 'expo-device';

function getDeviceTier(): 'low' | 'mid' | 'high' {
  const totalMemory = Device.totalMemory ?? 0;
  
  if (totalMemory > 4 * 1024 * 1024 * 1024) return 'high'; // >4GB
  if (totalMemory > 2 * 1024 * 1024 * 1024) return 'mid';  // 2-4GB
  return 'low'; // <2GB
}

// Use
const tier = getDeviceTier();

const shouldAnimate = tier !== 'low';
const shouldShowGradients = tier === 'high';
```

---

# 9. ERROR HANDLING

## Try/Catch All Async Operations

```typescript
async function fetchLessons() {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*');
    
    if (error) throw error;
    
    setLessons(data);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    // Show user-friendly error
    showError(t('errors.fetchFailed'));
  }
}
```

## User-Friendly Error Messages

**Never show technical errors to users**:
```typescript
// ❌ Bad
alert('Error: TypeError: Cannot read property "id" of undefined');

// ✅ Good
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
showError(t('errors.somethingWentWrong'));
```

**Error message tone**: Gentle, helpful, not blaming.

---

# 10. TESTING

## Manual Testing Checklist

**Before committing**:
- [ ] Works on low-end Android (2GB RAM emulator)
- [ ] All text is translated (no hardcoded English)
- [ ] Animations smooth (60fps)
- [ ] Haptic feedback on appropriate actions
- [ ] Loading states shown
- [ ] Error states handled gracefully
- [ ] Works offline (if feature should)
- [ ] RLS prevents unauthorized access (test with different user roles)

---

## Test Commands

```bash
# Start development server
npx expo start

# Run on Android emulator
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios

# Build for testing (Android)
eas build --platform android --profile preview

# Push OTA update
eas update --branch preview --message "Fix button size"

# Check bundle size
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output test.bundle
du -sh test.bundle
```

---

# 11. WHEN BUILDING FEATURES

## Step-by-Step Process

1. **Check CURRENT_SPRINT.md** - Is this task listed?
2. **Read NORTH_STAR.md** - Does this align with vision?
3. **Check ARCHITECTURE.md** - What database tables exist? What's the schema?
4. **Check DESIGN_SYSTEM.md** - What components can I reuse?
5. **Write code** following these rules
6. **Test manually** (checklist above)
7. **Update CURRENT_SPRINT.md** if needed

---

## Ask Before Doing These

- Adding a library not in the stack
- Creating a new database table
- Changing a core design pattern
- Adding a feature not in CURRENT_SPRINT.md
- Implementing something that violates NORTH_STAR.md principles

**When in doubt, ask.** Don't assume.

---

# 12. COMMON MISTAKES TO AVOID

## Don't

❌ Hardcode text (always use i18n)  
❌ Use `any` type (always type properly)  
❌ Forget school_id in database queries (multi-tenant!)  
❌ Use pure white/black colors (use theme colors)  
❌ Add features not in CURRENT_SPRINT.md  
❌ Skip error handling  
❌ Forget haptic feedback on important actions  
❌ Use instant animations (always 200-500ms)  
❌ Build desktop-first (always mobile-first)  
❌ Assume online (design for offline)  
❌ Use sharp corners (always rounded)  
❌ Create guilt mechanics (no streaks, no pressure)  
❌ Add complexity without justification  

---

# 13. COMMUNICATION PATTERNS

## Logging

```typescript
// Development
console.log('[Lessons] Fetching lessons for classroom:', classroomId);

// Production (Sentry)
import * as Sentry from 'sentry-expo';

try {
  // code
} catch (error) {
  Sentry.Native.captureException(error);
  console.error('Error:', error);
}
```

## Comments

**Comment WHY, not WHAT**:
```typescript
// ❌ Bad
// Increment counter
counter++;

// ✅ Good
// Lotus petal breathes faster when user is stressed (based on rapid taps)
breathingSpeed = userStressLevel > 0.7 ? 2000 : 4000;
```

---

# 14. GIT WORKFLOW

## Commit Messages

**Format**: `[component] Brief description`

Examples:
```
[auth] Add login screen with email/password
[lotus-fab] Implement breathing animation
[design] Update sanctuary color palette
[classroom] Fix lesson creation form validation
```

## Branch Names

```
feature/classroom-lesson-creation
fix/lotus-fab-breathing
design/update-color-palette
```

---

# 15. QUICK REFERENCE

## File Locations

```
Components:     /components/
Constants:      /constants/Theme.ts
Translations:   /i18n/locales/
Screens:        /app/(tabs)/
Supabase:       /lib/supabase.ts
Stores:         /stores/
```

## Import Aliases

```typescript
import { Theme } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';
import { LotusPetalFAB } from '@/components/LotusPetalFAB';
```

---

# 16. FINAL REMINDERS

## You're Not Just Building an App

You're building a **digital sanctuary** for people who give everything to children while their own lives quietly collapse.

**Every line of code must:**
- Return more energy than it consumes
- Feel warm, alive, organic
- Honor the teacher's dignity
- Work on what they actually have (low-end devices)
- Support their language (Si/Ta/En)
- Respect their privacy

**If a feature:**
- Drains energy → Reject
- Feels corporate → Reject
- Adds guilt/pressure → Reject
- Ignores cultural context → Reject
- Only works with internet (v0.1 exception) → Note for v1.0

## Trust the Process

- Read the docs before building
- Ask when uncertain
- Test on low-end devices
- Respect the vision
- Build with love

**From mud, through water, to full bloom.** 🪷

---

**END OF AI CONTEXT**

*Use this document every session. It's your guide to building Gurudevi correctly.*
