---
title: "ðŸª· GURUDEVI: GETTING STARTED GUIDE"
status: "active"
created: 2026-02-11
updated: 2026-02-13
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# 🪷 GURUDEVI: GETTING STARTED GUIDE
## Your Complete Onboarding Path

**Purpose**: A structured path for developers and AI agents to start building Gurudevi  
**Reading Time**: ~45 minutes for complete onboarding  
**Last Updated**: February 3, 2026

---

## 📖 Table of Contents

1. [Start Here: Quick Orientation](#start-here-quick-orientation)
2. [30-Minute Onboarding (Required Reading)](#30-minute-onboarding-required-reading)
3. [Understanding the Vision](#understanding-the-vision)
4. [Build Order - The Right Sequence](#build-order---the-right-sequence)
5. [Development Practices](#development-practices)
6. [Quick Reference Checklists](#quick-reference-checklists)
7. [Common Questions](#common-questions)

---

## Start Here: Quick Orientation

### What is Gurudevi?

**Gurudevi** (ගුරු දෙවි - "Divine Teacher") is a mobile-first school platform for Sri Lankan educators that embodies sanctuary aesthetics.

- **Primary Users**: Teachers (heavy lifters)
- **Supporting Users**: Principals (supportive role), Students (minimal features in v0.1)
- **Core Value**: Mobile-first, data-conscious, trilingual (Sinhala/Tamil/English)
- **Platform**: React Native with Expo, Supabase backend

### The Lotus Philosophy

The lotus metaphor guides every design decision:

| Stage | Meaning | Design Implication |
|-------|---------|-------------------|
| 🌱 Rooted in mud | Difficult conditions | Build for low-end devices, work offline |
| 🌊 Rising through water | Gradual growth | Support organic progress, celebrate small wins |
| 💧 Hydrophobic surface | Protecting dignity | Privacy-first, teacher controls information |
| 🌸 Blooming above | Achieving purpose | Moments of awe, sanctuary feeling |

### Three Sacred Laws (Immutable)

1. **Same Reality, Different Views**: All roles use same 5-tab structure with role-specific content
2. **Teacher-Centric Hierarchy**: Teachers get priority in development, features, and polish
3. **Energy Return on Interaction (EROI)**: Every feature must return more energy than it consumes

---

## 30-Minute Onboarding (Required Reading)

> [!IMPORTANT]
> When you start a new session building Gurudevi, read these documents **IN THIS ORDER**:

### Session Startup Checklist

1. **[NORTH_STAR.md](./NORTH_STAR.md)** (5 min)
   - The unchanging vision and soul of Gurudevi
   - What Gurudevi IS and will NEVER BE
   - Decision framework for when you're uncertain

2. **[GURUDEVI_ARCHITECTURE_v5_0.md](./GURUDEVI_ARCHITECTURE_v5_0.md)** (15 min)
   - System architecture and database schema
   - Data models and relationships
   - Technical decisions and rationale

3. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** (10 min)
   - Sanctuary color palette
   - Typography, spacing, animations
   - Component design patterns

4. **[CURRENT_SPRINT.md](./CURRENT_SPRINT.md)** (2 min)
   - What to build RIGHT NOW
   - Current priorities and tasks

**Total**: ~30 minutes → Then you're ready to build!

---

## Understanding the Vision

### What Gurudevi IS

✅ A school platform for Sri Lankan teachers with sanctuary aesthetics  
✅ Mobile-first, data-conscious, trilingual from day 1  
✅ Teacher-centric (they're the heavy lifters)  
✅ Energy-restoring technology (not extractive)  

### What Gurudevi Will NEVER BE

❌ Surveillance tool (no tracking for punishment)  
❌ Gamification-first (no points, leaderboards, streak shaming)  
❌ Generic corporate app (no corporate speak or sterile design)  
❌ Data extractive (no selling data, no tracking for ads)  
❌ English-first (Sinhala/Tamil are equal citizens)  

### The 5-Tab Sacred Structure

All users see these 5 tabs (content depth varies by role):

1. 🧘 **Self** - Personal sanctuary, mood tracking, reflection
2. 🏫 **Classroom** - Teaching space, lessons, assignments
3. 🌸 **Community** - Announcements, teacher collaboration
4. 📚 **Library** - Resource repository, file sharing
5. 👤 **Profile** - Settings, subscription tier, preferences

### Core Product Principles

**Sanctuary Aesthetics**: 
- Warm earth tones (cream silence, sage green, sanctuary saffron)
- Organic shapes and soft shadows
- Breath-like animations (never linear)
- Living, responsive interface

**Accessibility**:
- Works on low-end Android (2GB RAM)
- Intermittent internet support
- App size < 30MB
- Fast load times < 3s

**Cultural Respect**:
- Trilingual: Sinhala/Tamil/English (equal treatment)
- Sri Lankan school system context
- Buddhist educational philosophy influence
- Teacher as ගුරු දෙවි (divine knowledge holder)

---

## Build Order - The Right Sequence

> [!WARNING]
> **Foundation first, features second!** Building features before infrastructure requires massive refactoring later.

### Why Build Order Matters

**Problem if you build features first**:
- Refactor every screen to use theme
- Retrofit translations into hardcoded text
- Add auth checks to existing features
- Restructure data models for roles
- Redo navigation when adding new sections

**Solution**: Build the **skeleton** first, then **flesh** hangs on bones cleanly.

---

### Phase 0: Project Setup (Day 1)
**Goal**: Working Expo project with dependencies

#### Key Tasks
- [ ] Initialize Expo project (SDK 54, TypeScript)
- [ ] Install all core dependencies (see [BUILD_ORDER.md](./BUILD_ORDER.md) lines 38-79)
- [ ] Set up folder structure
- [ ] Configure TypeScript strict mode
- [ ] Test app runs on emulator

**Verification**: App launches, shows blank screen, no errors

---

### Phase 1: Foundation Layer (Days 2-5)
**Goal**: Core infrastructure that everything depends on

#### 1.1 Theme System (Day 2, ~4 hours)
**Why First**: Every component needs colors, spacing, typography

- [ ] Create `/constants/Theme.ts` with design tokens
- [ ] Define sanctuary color palette
- [ ] Set up typography scales
- [ ] Configure spacing, corners, shadows
- [ ] Define motion timing values

**Blocker if skipped**: Hardcoded colors everywhere, no sanctuary feel

#### 1.2 Translations (i18n) (Day 2, ~3 hours)
**Why Early**: Prevents hardcoded text

- [ ] Configure i18next
- [ ] Create `/i18n/locales/` for si.json, ta.json, en.json
- [ ] Add common phrases (save, cancel, delete, etc.)
- [ ] Set default language to Sinhala
- [ ] Test language switching

**Blocker if skipped**: Massive rework to add translations later

#### 1.3 Fonts (Day 2, ~2 hours)
**Why Early**: Sinhala/Tamil won't render without proper fonts

- [ ] Download Noto Sans Sinhala (Regular, Medium, Bold)
- [ ] Download Noto Sans Tamil (Regular, Medium, Bold)
- [ ] Place in `/assets/fonts/`
- [ ] Configure font loading
- [ ] Test rendering

**Blocker if skipped**: Boxes instead of Sinhala/Tamil characters

#### 1.4 Supabase Setup (Day 3, ~6 hours)
**Why Early**: Auth and database are foundation for everything

- [ ] Create Supabase project
- [ ] Set up `.env` with credentials
- [ ] Create `/lib/supabase.ts` client
- [ ] Create ALL database tables (see schema in ARCHITECTURE.md)
- [ ] Enable Row-Level Security (RLS) on all tables
- [ ] Create base RLS policies for school isolation
- [ ] Test connection and RLS

**Blocker if skipped**: Can't build ANY features (no data storage)

> [!TIP]
> **Critical Tables Order** (foreign key dependencies):
> 1. schools → 2. users → 3. subscriptions → 4. classrooms → 5. classroom_students → 6. lessons → 7. assignments → 8. submissions → 9. grades → 10. announcements → 11. library_resources → 12. mood_logs → 13. self_reflections

#### 1.5 Authentication (Day 4, ~8 hours)
**Why Early**: Every screen needs to know user identity and role

- [ ] Create auth store (Zustand)
- [ ] Build login screen with validation
- [ ] Build signup screen with role selection
- [ ] Implement sign up/in flow with Supabase
- [ ] Store session in MMKV for persistence
- [ ] Create auth guard for protected routes
- [ ] Test end-to-end auth flow

**Blocker if skipped**: No user identity, can't enforce role-based access

#### 1.6 User Roles & Permissions (Day 4, ~4 hours)
**Why Early**: Features behave differently per role

- [ ] Define role types in TypeScript
- [ ] Create role detection utility
- [ ] Update RLS policies for role-based access
- [ ] Create permission helper functions
- [ ] Test each role sees correct data

**Blocker if skipped**: Everyone sees everything, or features break when roles added

#### 1.7 Navigation Structure (Day 5, ~6 hours)
**Why Now**: Need navigation before building screens

- [ ] Create bottom tab navigator (5 tabs)
- [ ] Create stack navigators per tab
- [ ] Configure tab icons (lucide-react-native)
- [ ] Configure tab labels from i18n
- [ ] Style with sanctuary theme
- [ ] Test tab switching

**Blocker if skipped**: Can't navigate between features

---

### Phase 2: Core Utilities (Days 5-6)
**Goal**: Reusable helpers that features need

#### Key Utilities to Build

**Time/Greeting System** (~2 hours)
- Time of day detection (dawn/day/evening/night)
- Multilingual greetings
- Date formatting for all languages
- Relative time ("3 days ago")

**Device Tier Detection** (~2 hours)
- RAM and CPU detection
- Calculate tier (low/mid/high)
- Config based on tier (animations on/off)

**Haptic Feedback** (~1 hour)
- Consistent haptic patterns
- Light, medium, heavy, success, error

**Offline Detection** (~2 hours)
- Network status listener
- Offline indicator component
- Online/offline state management

---

### Phase 3: Core Components (Days 6-7)
**Goal**: Reusable UI components for all features

#### Essential Components

1. **LotusPetalFAB** (~4 hours)
   - Primary floating action button
   - Breathing animation (4-second cycle)
   - Scroll hide/show behavior
   - Role-based action switching

2. **LotusButton** (~2 hours)
   - Variants: primary, secondary, ghost
   - Sizes: small, medium, large
   - Loading and disabled states
   - Icon support

3. **SanctuaryCard** (~2 hours)
   - For lessons, assignments, resources
   - Hover/press lift animation
   - Footer support

4. **Input Components** (~3 hours)
   - TextInput (single/multiline)
   - Validation states
   - Dropdown, Checkbox, Switch

5. **Modal/Dialog** (~2 hours)
   - Backdrop with animation
   - Confirmation dialogs

6. **Loading States** (~2 hours)
   - BreathingLoader (pulsing lotus)
   - SkeletonCard (shimmer)
   - EmptyState
   - ErrorMessage

---

### Phase 4: Pricing Tiers (Day 8)
**Goal**: Subscription infrastructure before features use it

- [ ] Define pricing tiers (free/pro/premium)
- [ ] Create tier checker utility
- [ ] Update RLS policies for tier-based features
- [ ] Set up PayHere SDK
- [ ] Create payment flow skeleton
- [ ] Test sandbox mode

---

### Phase 5: Build Features! (Day 9+)

After Phase 4 is complete, you have a solid foundation. Now build features cleanly:

✅ **You now have**:
- Theme system (colors, spacing, fonts)
- Translations (Si/Ta/En ready)
- Auth (users can sign in, roles work)
- Navigation (tabs work)
- Database (tables exist, RLS works)
- Components (buttons, cards, inputs ready)
- Utilities (time, device tier, haptics, offline)
- Pricing infrastructure

🎯 **Build features** (in this order by priority):

1. **Self Section**
   - Mood check-in
   - Voice/text reflection
   - Breathing exercises

2. **Classroom**
   - Create lesson
   - Upload PDF resources
   - View student roster

3. **Community**
   - View announcements
   - Post announcements (principals/teachers)

4. **Library**
   - Browse resources
   - Upload files
   - Search and filter

5. **Profile**
   - View settings
   - Display subscription tier
   - Language preferences

**Each feature automatically**:
- Uses existing theme (no hardcoded colors)
- Uses i18n (no hardcoded text)
- Uses auth (knows user role)
- Uses components (buttons, cards work)
- Uses utilities (greetings, time, haptics)
- Checks tier (if premium feature)

**No rework needed!** 🎉

---

## Development Practices

### Technology Stack

```typescript
// Core Stack
React Native: "0.76+"
Expo: "54"
React: "19"
TypeScript: "5.x"

// UI & Styling
Gluestack UI: "v2"
Theme tokens in /constants/Theme.ts

// Navigation
React Navigation: "7"
Bottom Tabs + Stack Navigator

// State Management
Zustand: "4.x" (reactive state)
MMKV: "2.x" (persistence)

// Backend
Supabase (PostgreSQL 15+, Auth, Realtime, Storage)

// Internationalization
i18next: "23.x"
react-i18next: "13.x"

// Icons
lucide-react-native: "latest"
```

For complete dependencies list, see [BUILD_ORDER.md](./BUILD_ORDER.md)

---

### Coding Rules

#### TypeScript
✅ **Always strict mode**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

✅ **Type everything** (no `any`)
```typescript
// Good
interface Lesson {
  id: string;
  title: string;
  content: string;
}

// Bad
const lesson: any = { ... };
```

---

#### React Components

✅ **Functional components only** (no classes)
```typescript
export function LessonCard({ lesson }: { lesson: Lesson }) {
  return <View>...</View>;
}
```

✅ **Use hooks** for state and effects
```typescript
const [lessons, setLessons] = useState<Lesson[]>([]);

useEffect(() => {
  fetchLessons();
}, []);
```

---

#### Multilingual Support

❌ **Never hardcode text**
```typescript
// Bad
<Text>Save</Text>

// Good
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('common.save')}</Text>;
}
```

**i18n File Structure**:
```json
// i18n/locales/si.json
{
  "common": {
    "save": "සුරකින්න",
    "cancel": "අවලංගු කරන්න"
  },
  "self": {
    "moodCheckIn": "මනෝභාවය පරීක්ෂා කරන්න"
  }
}
```

---

#### Styling

✅ **Always use Theme constants**
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
    color: Theme.colors.charcoalTruth,
  }
});
```

❌ **Never use magic numbers**
```typescript
// Bad
padding: 16,
fontSize: 18,

// Good
padding: Theme.spacing.md,
fontSize: Theme.typography.body.fontSize,
```

---

#### Sanctuary Design Palette

**Colors** (from Theme.colors):
- Primary action: `sanctuarySaffron` (#E67E22)
- Success: `sageGreen` (#8FBC8F)
- Error: `emberRed` (#FF6347)
- Background (light): `creamSilence` (#FFF8E7)
- Background (dark): `voidIndigo` (#0f0f1e)
- Text on light: `charcoalTruth` (#2C3E50)
- Text on dark: `sacredWhite` (#FFF8F0)

**Never use**: Pure white, pure black, bright neon colors

**Typography Minimums**:
- Body text: 18sp (never smaller)
- Captions: 14sp minimum
- Buttons: 16sp minimum
- Line height: 1.6x for readability

**Spacing** (Theme.spacing):
```typescript
xs   // 4px  - Tight
sm   // 8px  - Small
md   // 16px - Standard (most common)
lg   // 24px - Large
xl   // 32px - Page margins
```

**Corners** (Theme.corners):
```typescript
tight       // 8px  - Small elements
comfortable // 16px - Buttons, inputs (default)
generous    // 24px - Cards, modals
full        // 50%  - Circular (FAB, avatars)
```

**Never use sharp 90° corners!**

**Animations** (Theme.motion):
```typescript
instant   // 100ms - Rarely used
quick     // 200ms - Fast transitions
standard  // 300ms - Default
gentle    // 500ms - Meditative
breathing // 4000ms - Lotus companion breathing
```

✅ **Use spring physics** (feels organic)
```typescript
import { withSpring } from 'react-native-reanimated';

value.value = withSpring(1.0, {
  damping: 15,
  stiffness: 150,
});
```

❌ **Never use linear easing** (feels robotic)

---

#### Database Rules

**Every table has `school_id`** (multi-tenant):
```typescript
interface BaseEntity {
  id: string; // UUID
  school_id: string; // Foreign key to schools
  created_at: Date;
  updated_at: Date;
}
```

**Always use UUIDs for primary keys**:
```typescript
// Good
const lessonId = crypto.randomUUID();

// Bad
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

#### Error Handling

✅ **Try/catch all async operations**
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
    showError(t('errors.fetchFailed'));
  }
}
```

✅ **User-friendly error messages**
```typescript
// Bad
alert('TypeError: Cannot read property "id"');

// Good
showError(t('errors.somethingWentWrong'));
```

**Error tone**: Gentle, helpful, not blaming

---

### Performance Rules

#### Use Native Driver
```typescript
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // 60fps on UI thread
});
```

**Can't use native driver for**: Layout properties (width, height, padding, margin)

#### Lazy Loading

**For lists**:
```typescript
<FlatList
  data={lessons}
  renderItem={renderLesson}
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

#### Device Tier Detection

Adapt features based on device capability:
```typescript
import * as Device from 'expo-device';

function getDeviceTier(): 'low' | 'mid' | 'high' {
  const totalMemory = Device.totalMemory ?? 0;
  
  if (totalMemory > 4 * 1024 * 1024 * 1024) return 'high'; // >4GB
  if (totalMemory > 2 * 1024 * 1024 * 1024) return 'mid';  // 2-4GB
  return 'low'; // <2GB
}

const tier = getDeviceTier();
const shouldAnimate = tier !== 'low';
```

---

## Quick Reference Checklists

### Before Building ANY Feature

> [!IMPORTANT]
> Verify foundation is complete:

- [ ] App launches without errors
- [ ] Theme values accessible (`Theme.colors.sanctuarySaffron` works)
- [ ] Translations work (can switch Si/Ta/En)
- [ ] Fonts load (Sinhala/Tamil text renders)
- [ ] Auth works (can sign up, log in, log out)
- [ ] Database connected (can query Supabase)
- [ ] Navigation works (can switch tabs)
- [ ] User role detected (can check teacher/student/principal)
- [ ] Time utilities work (greeting shows correct message)
- [ ] Device tier detected (knows low/mid/high-end)

**If any checkbox is unchecked, go back and fix it before proceeding!**

---

### Before Committing Code

- [ ] Works on low-end Android (2GB RAM emulator)
- [ ] All text is translated (no hardcoded English)
- [ ] Animations smooth (60fps)
- [ ] Haptic feedback on appropriate actions
- [ ] Loading states shown
- [ ] Error states handled gracefully
- [ ] Works offline (if feature should)
- [ ] RLS prevents unauthorized access (test with different user roles)

---

### When Building Features - Step by Step

1. **Check CURRENT_SPRINT.md** - Is this task listed?
2. **Read NORTH_STAR.md** - Does this align with vision?
3. **Check ARCHITECTURE.md** - What database tables exist? What's the schema?
4. **Check DESIGN_SYSTEM.md** - What components can I reuse?
5. **Write code** following the rules in this guide
6. **Test manually** (use checklist above)
7. **Update CURRENT_SPRINT.md** if needed

---

### Ask Before Doing These

⚠️ **Requires discussion**:
- Adding a library not in the stack
- Creating a new database table
- Changing a core design pattern
- Adding a feature not in CURRENT_SPRINT.md
- Implementing something that violates NORTH_STAR.md principles

**When in doubt, ask. Don't assume.**

---

## Common Questions

### Q: Why build foundation first instead of features?

**A**: Building features first creates technical debt. You'll spend 2-3x the time refactoring:
- Every screen to use theme
- Hardcoded text to use i18n
- Adding auth checks everywhere
- Restructuring for roles
- Redoing navigation

Build the skeleton first → flesh hangs on bones cleanly.

---

### Q: Can I skip translations for the prototype?

**A**: No. Sinhala/Tamil support is a **Core Commitment**. It's much harder to retrofit translations later. Set up i18n on Day 2, add translations as you build features.

---

### Q: Why TypeScript strict mode?

**A**: Catches bugs before runtime. Sri Lankan teachers on low-end devices can't afford app crashes. Strict typing = reliability.

---

### Q: Should I use Tailwind or styled-components?

**A**: Neither. Use **Theme constants** with StyleSheet. This ensures:
- Consistent sanctuary aesthetics
- No magic numbers
- Easy theme updates
- Better performance (no CSS-in-JS overhead)

---

### Q: How do I know if a feature aligns with the vision?

**A**: Ask these questions (from NORTH_STAR.md):

1. **Does this serve teachers?** (heavy lifters)
2. **Does this align with lotus philosophy?** (sanctuary feeling)
3. **What's the EROI?** (Energy Return on Interaction)
4. **Is this MVP or cathedral?** (defer nice-to-haves)

If any answer is "no" or unclear, read NORTH_STAR.md section 6.

---

### Q: What if I want to add gamification?

**A**: **Don't.** Gurudevi will NEVER have:
- Points for everything
- Leaderboards
- Streak shaming
- Badges as primary motivation

Why? Gamification **extracts energy** (pressure, competition, guilt). Sanctuary **restores energy**.

Gentle acknowledgment of growth is OK (like a tree growing), but never comparative or pressure-inducing.

---

### Q: Can I use English as default language?

**A**: No. **Sinhala is the default**. This is a Core Commitment. Sri Lankan teachers should see their language first, not English.

---

### Q: Where do I find the database schema?

**A**: See [GURUDEVI_ARCHITECTURE_v5_0.md](./GURUDEVI_ARCHITECTURE_v5_0.md) Section 3.3 for complete schema with tables, columns, relationships, and RLS policies.

---

### Q: How do I test RLS policies?

**A**: 
1. Create test users with different roles (student, teacher, principal)
2. Sign in as each user
3. Try to access data from different schools
4. Verify you can ONLY see your school's data
5. Try to modify data (should fail if not authorized)

---

### Q: What's the Lotus Petal FAB?

**A**: The primary floating action button that:
- Floats bottom-right (16px from edges)
- Breathes (scale 0.95 ↔ 1.0, 4-second cycle)
- Changes action based on current tab
- Hides when scrolling down, shows when scrolling up

**Tab-specific actions**:
- Self: "Record reflection"
- Classroom: "Create lesson"
- Community: "Post announcement"
- Library: "Upload resource"
- Profile: "Edit profile"

---

### Q: What's the payment system?

**A**: PayHere (Sri Lankan payment gateway), not Stripe. Three tiers:
- **Free**: LKR 0 (basic features)
- **Pro**: LKR 1,500/month (OCR, quizzes, forms)
- **Premium**: LKR 3,000/month (AI assistant, priority support)

Pricing in LKR honors Sri Lankan context.

---

## Resources Index

### Primary Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [NORTH_STAR.md](./NORTH_STAR.md) | Unchanging vision & philosophy | Start of every session |
| [BUILD_ORDER.md](./BUILD_ORDER.md) | Correct build sequence | Before starting development |
| [AI_CONTEXT.md](./AI_CONTEXT.md) | Coding rules & patterns | While building features |
| [GURUDEVI_ARCHITECTURE_v5_0.md](./GURUDEVI_ARCHITECTURE_v5_0.md) | System architecture & database | When designing features |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Visual design & components | When building UI |
| [CURRENT_SPRINT.md](./CURRENT_SPRINT.md) | Current priorities | Daily |
| [GURUDEVI_MASTER_DOCUMENT.md](./GURUDEVI_MASTER_DOCUMENT.md) | Quick project overview | First time only |

### Additional Resources

| Document | Purpose |
|----------|---------|
| [GURUDEVI_SECURITY_FOUNDATION_v2_0.md](./GURUDEVI_SECURITY_FOUNDATION_v2_0.md) | Security & privacy implementation |
| [GURUDEVI_STACK_v3_1_FINAL.md](./GURUDEVI_STACK_v3_1_FINAL.md) | Complete tech stack decisions |
| [GURUDEVI_BUSINESS_MODEL_v1_0.md](./GURUDEVI_BUSINESS_MODEL_v1_0.md) | Business model & pricing |

---

## Test Commands Quick Reference

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

## Final Words

### To Developers

You're building a **digital sanctuary** for people who give everything to children while their own lives quietly collapse.

**Every line of code must honor this.**

### The Lotus Teaching

The lotus doesn't rush. It grows:
- 🌱 From mud (v0.1 - the seed)
- 🌊 Through water (iteration and growth)
- 🌸 To full bloom (v1.0+)

**Trust the spiral. Trust the seed. Trust the teachers.**

---

**From mud, through water, to full bloom.** 🪷

**ජයවේවා** (Jayawewa - May you be victorious!)

---

**END OF GETTING STARTED GUIDE**

*For questions or clarifications, refer to the [primary documentation](#primary-documentation) or consult NORTH_STAR.md for alignment with vision.*
