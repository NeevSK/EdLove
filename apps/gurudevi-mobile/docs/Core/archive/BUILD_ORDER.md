---
title: "GURUDEVI BUILD ORDER"
status: "active"
created: 2026-02-28
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI BUILD ORDER
## Foundation First, Features Second

**Purpose**: The correct sequence to build Gurudevi  
**Principle**: Build infrastructure before features (avoid rework)  
**Updated**: February 3, 2026

---

## Why This Order Matters

**Problem**: If you build features first, then add foundation later, you have to:
- Refactor every screen to use theme
- Retrofit translations into hardcoded text
- Add auth checks to existing features
- Restructure data models for roles
- Redo navigation when adding new sections

**Solution**: Build the **skeleton** first, then **flesh** hangs on bones cleanly.

---

# BUILD SEQUENCE

## PHASE 0: Project Setup (Day 1)
**Goal**: Working Expo project with dependencies

### Tasks:
- [ ] Initialize Expo project (SDK 54)
- [ ] Install core dependencies (see dependencies list below)
- [ ] Configure TypeScript (strict mode)
- [ ] Set up folder structure
- [ ] Configure Expo app.json
- [ ] Configure eas.json (for builds)
- [ ] Test app runs on emulator/device

**Dependencies to Install**:
```bash
# Core
npx create-expo-app gurudevi --template blank-typescript

# Navigation
npx expo install react-navigation react-navigation-stack react-navigation-bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# UI
npm install @gluestack-ui/themed

# State
npm install zustand
npx expo install react-native-mmkv

# Animation
npx expo install react-native-reanimated react-native-gesture-handler

# Supabase
npm install @supabase/supabase-js
npx expo install react-native-url-polyfill

# i18n
npm install i18next react-i18next

# Icons
npm install lucide-react-native

# Device APIs
npx expo install expo-haptics expo-secure-store expo-file-system
npx expo install expo-device expo-av

# Fonts
npx expo install expo-font

# Payments (v0.1)
npm install payhere-mobilesdk-reactnative

# Monitoring
npm install sentry-expo @sentry/react-native
npm install posthog-react-native
```

**Verification**: App launches, shows blank screen, no errors.

---

## PHASE 1: Foundation Layer (Days 2-5)
**Goal**: Core infrastructure that everything else depends on

### 1.1 Theme System (Day 2, ~4 hours)
**Why First**: Every component needs colors, spacing, typography

**Tasks**:
- [ ] Create `/constants/Theme.ts` with design tokens
  - Colors (sanctuary palette)
  - Typography (sizes, weights, line heights)
  - Spacing scale
  - Corner radius
  - Shadows
  - Motion timing
- [ ] Create ThemeProvider wrapper
- [ ] Test theme values in a simple screen

**Blockers if skipped**: Hardcoded colors everywhere, inconsistent spacing, no sanctuary feel

**Files to Create**:
```
/constants/Theme.ts
/constants/Colors.ts (extracted from Theme)
/constants/Typography.ts (extracted from Theme)
```

---

### 1.2 Translations (i18n) (Day 2, ~3 hours)
**Why Early**: Prevents hardcoded text that needs retrofitting later

**Tasks**:
- [ ] Configure i18next
- [ ] Create language files structure
  - `/i18n/locales/si.json` (Sinhala)
  - `/i18n/locales/ta.json` (Tamil)  
  - `/i18n/locales/en.json` (English)
- [ ] Add common phrases (save, cancel, delete, etc.)
- [ ] Create language switcher utility
- [ ] Set default language (Sinhala)
- [ ] Test language switching

**Blockers if skipped**: Every screen has hardcoded English, massive rework later

**Initial Translation Keys**:
```json
{
  "common": {
    "save": "...",
    "cancel": "...",
    "delete": "...",
    "edit": "...",
    "confirm": "..."
  },
  "tabs": {
    "self": "...",
    "classroom": "...",
    "community": "...",
    "library": "...",
    "profile": "..."
  }
}
```

---

### 1.3 Fonts (Day 2, ~2 hours)
**Why Early**: Text won't render correctly for Sinhala/Tamil without proper fonts

**Tasks**:
- [ ] Download Noto Sans Sinhala (Regular, Medium, Bold)
- [ ] Download Noto Sans Tamil (Regular, Medium, Bold)
- [ ] Place in `/assets/fonts/`
- [ ] Configure font loading in App.tsx
- [ ] Create font utility helpers
- [ ] Test Sinhala/Tamil text renders correctly

**Blockers if skipped**: Boxes instead of Sinhala/Tamil characters

**Font Files Needed**:
```
/assets/fonts/
  NotoSansSinhala-Regular.ttf
  NotoSansSinhala-Medium.ttf
  NotoSansSinhala-Bold.ttf
  NotoSansTamil-Regular.ttf
  NotoSansTamil-Medium.ttf
  NotoSansTamil-Bold.ttf
```

---

### 1.4 Supabase Setup (Day 3, ~6 hours)
**Why Early**: Auth and database are foundation for everything

**Tasks**:
- [ ] Create Supabase project
- [ ] Copy Supabase URL and anon key to `.env`
- [ ] Create Supabase client (`/lib/supabase.ts`)
- [ ] Create database schema (all tables - see schema section below)
- [ ] Enable RLS on all tables
- [ ] Create base RLS policies (school isolation)
- [ ] Create indexes for performance
- [ ] Test connection from app
- [ ] Test RLS policies work

**Blockers if skipped**: Can't build any features (no data storage)

**Critical Tables to Create Now**:
```sql
-- Must create in this order (foreign key dependencies)
1. schools
2. users (auth.users + public.users)
3. subscriptions (pricing tiers)
4. classrooms
5. classroom_students
6. lessons
7. assignments
8. submissions
9. grades
10. announcements
11. announcement_reads
12. library_resources
13. mood_logs
14. self_reflections
```

**See ARCHITECTURE.md Section 3.3 for full schema**

---

### 1.5 Authentication (Day 4, ~8 hours)
**Why Early**: Every screen needs to know who the user is and their role

**Tasks**:
- [ ] Create auth store (Zustand)
- [ ] Build login screen
  - Email/password inputs
  - Validation
  - Error states
  - Loading state
  - "Forgot password" link
- [ ] Build signup screen
  - Email/password inputs
  - Full name input
  - Role selection (teacher/student/principal)
  - School selection/creation
  - Terms acceptance
  - Validation
- [ ] Implement auth flow
  - Sign up → Supabase
  - Sign in → Supabase
  - Store session in MMKV
  - Auto-login on app restart
- [ ] Create auth guard (redirect to login if not authenticated)
- [ ] Test auth flow end-to-end

**Blockers if skipped**: No way to identify users, can't enforce role-based access

**Auth Store Structure**:
```typescript
interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}
```

---

### 1.6 User Roles & Permissions (Day 4, ~4 hours)
**Why Early**: Features behave differently per role

**Tasks**:
- [ ] Define role types (TypeScript)
- [ ] Create role detection utility
- [ ] Update RLS policies for role-based access
  - Students: see only enrolled classrooms
  - Teachers: manage own classrooms
  - Principals: see all school data
- [ ] Create permission helper functions
- [ ] Test each role sees correct data

**Blockers if skipped**: Everyone sees everything, or features break when roles added

**Permission Helpers**:
```typescript
// /utils/permissions.ts
export function canCreateLesson(user: User): boolean {
  return user.role === 'teacher';
}

export function canPostAnnouncement(user: User): boolean {
  return user.role === 'principal';
}

export function canViewClassroom(user: User, classroom: Classroom): boolean {
  if (user.role === 'principal' && user.school_id === classroom.school_id) {
    return true;
  }
  if (user.role === 'teacher' && classroom.teacher_id === user.id) {
    return true;
  }
  // Check if student is enrolled...
  return false;
}
```

---

### 1.7 Navigation Structure (Day 5, ~6 hours)
**Why Now**: Need navigation before building screens

**Tasks**:
- [ ] Create bottom tab navigator (5 tabs)
- [ ] Create stack navigators for each tab
- [ ] Configure tab icons (from lucide-react-native)
- [ ] Configure tab labels (from i18n)
- [ ] Add role-based tab visibility (if needed)
- [ ] Create navigation type definitions
- [ ] Style bottom tabs (sanctuary theme)
- [ ] Test tab switching

**Blockers if skipped**: Can't navigate between features

**Tab Configuration**:
```typescript
// /navigation/tabs.ts
export const TABS = [
  {
    id: 'self',
    icon: 'flower-2', // Lotus icon from lucide
    labelKey: 'tabs.self',
    screen: SelfScreen,
    roles: ['student', 'teacher', 'principal'],
  },
  {
    id: 'classroom',
    icon: 'school',
    labelKey: 'tabs.classroom',
    screen: ClassroomScreen,
    roles: ['student', 'teacher', 'principal'],
  },
  // ... other tabs
];
```

---

## PHASE 2: Core Utilities (Day 5-6)
**Goal**: Reusable helpers that features need

### 2.1 Time/Greeting System (Day 5, ~2 hours)
**Why**: Many screens need time-aware greetings and date formatting

**Tasks**:
- [ ] Create time utilities
  - Get current time
  - Detect time of day (dawn/day/evening/night)
  - Format dates (multilingual)
  - Relative time ("3 days ago")
- [ ] Create greeting generator
  - "සුභ උදෑසනක්" (Good morning) based on time
  - User name personalization
- [ ] Create time-based theme helper (for future v0.5)
- [ ] Test in multiple timezones

**Files**:
```typescript
// /utils/time.ts
export function getTimeOfDay(): 'dawn' | 'day' | 'evening' | 'night';
export function getGreeting(userName: string, language: string): string;
export function formatDate(date: Date, language: string): string;
export function getRelativeTime(date: Date, language: string): string;
```

---

### 2.2 Device Tier Detection (Day 5, ~2 hours)
**Why**: Need to disable heavy animations on low-end devices

**Tasks**:
- [ ] Create device detection utility
  - Get RAM
  - Get CPU cores
  - Calculate tier (low/mid/high)
- [ ] Create config based on tier
  - Animations enabled/disabled
  - Background effects enabled/disabled
- [ ] Store tier in app state
- [ ] Test on low-end emulator (2GB RAM)

**Files**:
```typescript
// /utils/device.ts
export function getDeviceTier(): 'low' | 'mid' | 'high';
export function getDeviceConfig(tier: string): DeviceConfig;
```

---

### 2.3 Haptic Feedback Helper (Day 5, ~1 hour)
**Why**: Consistent haptics across app

**Tasks**:
- [ ] Create haptic utility
- [ ] Define haptic patterns
  - Light (button press)
  - Medium (important action)
  - Heavy (destructive action)
  - Success (achievement)
  - Error (validation fail)
- [ ] Test haptics on device

**Files**:
```typescript
// /utils/haptics.ts
export function hapticLight(): void;
export function hapticMedium(): void;
export function hapticSuccess(): void;
export function hapticError(): void;
```

---

### 2.4 Offline Detection (Day 6, ~2 hours)
**Why**: Need to show offline state and queue actions

**Tasks**:
- [ ] Create network listener
- [ ] Create offline indicator component
- [ ] Store online/offline state
- [ ] Test airplane mode

**Files**:
```typescript
// /utils/network.ts
export function useNetworkStatus(): { isOnline: boolean };
export function addOfflineListener(callback: (isOnline: boolean) => void): void;
```

---

## PHASE 3: Core Components (Day 6-7)
**Goal**: Reusable UI components that all features use

### 3.1 Lotus Petal FAB (Day 6, ~4 hours)
**Why**: Primary action button, appears on every tab

**Tasks**:
- [ ] Create LotusPetalFAB component
- [ ] Implement breathing animation (4-second cycle)
- [ ] Implement scroll hide/show behavior
- [ ] Add role-based action switching
- [ ] Style with sanctuary theme
- [ ] Add haptic feedback
- [ ] Test on low-end device (disable breathing if needed)

**Component Props**:
```typescript
interface LotusPetalFABProps {
  currentTab: 'self' | 'classroom' | 'community' | 'library' | 'profile';
  onPress: () => void;
  scrollY?: SharedValue<number>; // For hide/show on scroll
  breathingEnabled?: boolean;
}
```

---

### 3.2 LotusButton (Day 6, ~2 hours)
**Why**: Used everywhere (save, cancel, submit, etc.)

**Tasks**:
- [ ] Create LotusButton component
- [ ] Implement variants (primary, secondary, ghost)
- [ ] Implement sizes (small, medium, large)
- [ ] Add loading state
- [ ] Add disabled state
- [ ] Add icon support
- [ ] Style with sanctuary theme
- [ ] Add press animation + haptic

**Component Props**:
```typescript
interface LotusButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string; // lucide icon name
  loading?: boolean;
  disabled?: boolean;
}
```

---

### 3.3 SanctuaryCard (Day 6, ~2 hours)
**Why**: Used for lessons, assignments, announcements, resources

**Tasks**:
- [ ] Create SanctuaryCard component
- [ ] Add hover/press animation (lift)
- [ ] Add footer support
- [ ] Style with sanctuary theme
- [ ] Add shadow
- [ ] Test responsiveness

---

### 3.4 Input Components (Day 7, ~3 hours)
**Why**: Forms everywhere (create lesson, sign up, etc.)

**Tasks**:
- [ ] Create TextInput component
  - Single line
  - Multiline
  - Validation state
  - Error message
  - Label
  - Placeholder
- [ ] Create Dropdown component
- [ ] Create Checkbox component
- [ ] Create Switch component
- [ ] Style all with sanctuary theme

---

### 3.5 Modal/Dialog (Day 7, ~2 hours)
**Why**: Confirmations, forms, alerts

**Tasks**:
- [ ] Create Modal component
- [ ] Add backdrop
- [ ] Add enter/exit animation
- [ ] Create Dialog variant (with title, content, actions)
- [ ] Test accessibility (back button closes)

---

### 3.6 Loading/Empty/Error States (Day 7, ~2 hours)
**Why**: Every screen needs these

**Tasks**:
- [ ] Create BreathingLoader component (pulsing lotus)
- [ ] Create SkeletonCard component (shimmer loading)
- [ ] Create EmptyState component (icon + message + action)
- [ ] Create ErrorMessage component (gentle/warning/severe)

---

## PHASE 4: Pricing Tiers (Day 8)
**Goal**: Subscription infrastructure before features use it

### 4.1 Pricing Data Model (Day 8, ~2 hours)
**Tasks**:
- [ ] Define pricing tiers (free/pro/premium)
- [ ] Create tier checker utility
- [ ] Add tier to user metadata
- [ ] Update RLS policies for tier-based features

**Tier Definitions**:
```typescript
// /constants/Pricing.ts
export const TIERS = {
  free: {
    name: { si: 'නොමිලේ', ta: 'இலவசம்', en: 'Free' },
    price: 0,
    features: ['basic_lessons', 'basic_announcements', 'basic_library'],
  },
  pro: {
    name: { si: 'ප්‍රෝ', ta: 'ப்ரோ', en: 'Pro' },
    price: 1500, // LKR per month
    features: ['ocr', 'quizzes', 'forms', 'advanced_analytics'],
  },
  premium: {
    name: { si: 'ප්‍රිමියම්', ta: 'பிரீமியம்', en: 'Premium' },
    price: 3000, // LKR per month
    features: ['ai_assistant', 'video_calls', 'priority_support'],
  },
};
```

---

### 4.2 PayHere Integration Skeleton (Day 8, ~4 hours)
**Why**: Need payment infrastructure before features check tier

**Tasks**:
- [ ] Set up PayHere SDK
- [ ] Create payment initiation flow
- [ ] Create webhook handler (Supabase edge function)
- [ ] Test sandbox mode
- [ ] Create subscription status checker
- [ ] Add "Upgrade" flow (UI only, no features yet)

**Note**: Don't build tier-gated features yet, just the infrastructure

---

## PHASE 5: Now Build Features! (Day 9+)

After Phase 4, you have:
✅ Theme system (colors, spacing, fonts work)
✅ Translations (Si/Ta/En ready)
✅ Auth (users can sign in, roles work)
✅ Navigation (tabs work)
✅ Database (tables exist, RLS works)
✅ Components (buttons, cards, inputs ready)
✅ Utilities (time, device tier, haptics, offline)
✅ Pricing infrastructure (tiers defined, payment ready)

**Now you can build features cleanly**:
- Self section (mood logging, reflection)
- Classroom (create lesson, upload PDF)
- Community (announcements)
- Library (view/upload resources)
- Profile (settings, tier display)

Each feature:
- Uses existing theme (no hardcoded colors)
- Uses i18n (no hardcoded text)
- Uses auth (knows user role)
- Uses components (buttons, cards work)
- Uses utilities (greetings, time, haptics)
- Checks tier (if premium feature)

**No rework needed.** Everything sits on solid foundation.

---

# CRITICAL DEPENDENCIES

## Can't Build Features Without These:
1. ✅ Theme (or colors are hardcoded)
2. ✅ i18n (or text is hardcoded English)
3. ✅ Auth (or no user identity)
4. ✅ Database (or nowhere to save data)
5. ✅ Navigation (or can't switch tabs)

## Should Build Before Features (avoid pain):
6. ✅ Fonts (or Sinhala/Tamil show boxes)
7. ✅ Roles (or everyone sees everything)
8. ✅ Components (or duplicate code everywhere)
9. ✅ Utilities (or reinvent time formatting 10 times)
10. ✅ Pricing (or retrofit tier checks later)

## Can Build Anytime:
- Specific feature screens
- Advanced animations
- Optimizations
- Nice-to-haves

---

# SUGGESTED SPRINT 1 (Week 1)

**Goal**: Complete Foundation (Phases 0-2)

**Monday**: 
- Project setup
- Theme system
- Translations

**Tuesday**:
- Fonts
- Supabase setup (schema)

**Wednesday**:
- Auth screens (login/signup)
- Auth flow

**Thursday**:
- User roles
- Navigation structure

**Friday**:
- Time/greeting utilities
- Device detection
- Offline detection

**Saturday/Sunday**:
- Review, test, polish foundation
- Prepare for Sprint 2 (components + features)

---

# VERIFICATION CHECKLIST

**Before building ANY feature, verify**:
- [ ] App launches without errors
- [ ] Theme values accessible (Theme.colors.sanctuarySaffron works)
- [ ] Translations work (can switch Si/Ta/En)
- [ ] Fonts load (Sinhala/Tamil text renders)
- [ ] Auth works (can sign up, log in, log out)
- [ ] Database connected (can query Supabase)
- [ ] Navigation works (can switch tabs)
- [ ] User role detected (can check if teacher/student/principal)
- [ ] Time utilities work (greeting shows correct message)
- [ ] Device tier detected (knows if low/mid/high-end)

**If any checkbox is unchecked, go back and fix it before proceeding.**

---

**The foundation is not glamorous, but it prevents chaos later.** 🪷

**Build the skeleton first. Flesh hangs on bones.** 🌳
