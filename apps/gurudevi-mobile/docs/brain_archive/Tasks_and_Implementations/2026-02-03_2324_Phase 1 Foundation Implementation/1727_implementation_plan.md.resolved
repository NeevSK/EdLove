# Gurudevi Foundation Completion - Implementation Plan

## Overview

Complete the missing Phase 1 foundation pieces according to BUILD_ORDER.md so the app has proper Theme constants, multilingual support, Sinhala/Tamil fonts, and role-based permissions. This will ensure all future features can be built cleanly without rework.

## Current State Assessment

### ✅ What's Complete (Phase 0-1 Partial)

**Phase 0: Project Setup**
- ✅ Expo project initialized (SDK 54)
- ✅ TypeScript strict mode configured
- ✅ Core dependencies installed:
  - `@supabase/supabase-js` for backend
  - `@gluestack-ui/themed` for UI components
  - `@react-navigation/bottom-tabs` for navigation
  - `zustand` for state management
  - `lucide-react-native` for icons
  - `moti` for animations
- ✅ Folder structure created (`src/components`, `src/screens`, `src/lib`, `src/store`, `src/hooks`)

**Phase 1: Foundation Layer (Partial)**
- ✅ Supabase client configured ([src/lib/supabase.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/lib/supabase.ts))
- ✅ Auth screens implemented ([src/screens/AuthScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/AuthScreen.tsx))
  - Email/password login
  - Sign up with full name
  - Toggle between login/signup
  - Toast notifications for errors
- ✅ Navigation structure ([App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx))
  - Bottom tab navigator with 5 tabs (Self, Classroom, Community, Library, Profile)
  - Auth guard (shows AuthScreen if no session)
  - Tab icons from lucide-react-native
- ✅ Basic state management ([src/store/useStore.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/store/useStore.ts))
  - Zustand store with persistence via AsyncStorage
- ✅ AssistivePresence FAB ([src/components/AssistivePresence.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/AssistivePresence.tsx))
  - Breathing animation with Moti
  - Positioned bottom-right

**Features Started**
- ✅ Self screen partially implemented ([src/screens/SelfScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/SelfScreen.tsx))
  - Time-based greeting
  - Sub-feature carousel (Venting, Rhythm, Shadow Assistant, Notes)
  - Venting space with text input
  - Basic UI structure

---

### ❌ What's Missing (Critical Foundation Gaps)

> [!IMPORTANT]
> According to BUILD_ORDER.md, these foundation pieces **MUST** be built before continuing with features to avoid massive refactoring later.

**Phase 1 Missing Items:**

1. **Theme System** ❌
   - No `/constants/Theme.ts` file
   - Hardcoded colors everywhere (`'#FF9933'`, `'#0f0f1e'`, etc.)
   - No consistent spacing scale
   - No typography constants
   - No sanctuary color palette defined
   - **Impact**: Current code violates "never use magic numbers" rule

2. **i18n (Internationalization)** ❌
   - No i18next configuration
   - No `/i18n/locales/` structure
   - All text is hardcoded English ("Good Morning", "Venting Space", etc.)
   - **Impact**: Violates Core Commitment #2 (trilingual from day 1)

3. **Fonts** ❌
   - No Noto Sans Sinhala fonts
   - No Noto Sans Tamil fonts
   - **Impact**: Sinhala/Tamil text will show boxes instead of characters

4. **User Roles & Permissions** ❌
   - No role types defined
   - No permission helper functions
   - Auth stores `full_name` but not `role` or `school_id`
   - **Impact**: Can't distinguish teacher/student/principal behavior

5. **Supabase Database Schema** ❌
   - No database tables created
   - No RLS policies
   - **Impact**: Can't save any data (lessons, classrooms, etc.)

6. **Core Utilities** ❌
   - Time utils exist inline but not extracted
   - No device tier detection
   - No haptic feedback helpers
   - No offline detection

---

## Proposed Changes

### Phase 1.1: Theme System

Create comprehensive theme constants to replace all hardcoded colors and magic numbers.

#### [NEW] [constants/Theme.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/constants/Theme.ts)

Define sanctuary design tokens:
- **Colors**: Sanctuary palette (cream silence, sage green, sanctuary saffron, etc.)
- **Typography**: Font sizes, line heights, weights
- **Spacing**: xs (4), sm (8), md (16), lg (24), xl (32)
- **Corners**: tight (8), comfortable (16), generous (24), full (50%)
- **Motion**: instant (100ms), quick (200ms), standard (300ms), gentle (500ms), breathing (4000ms)
- **Shadows**: Soft sanctuary shadows

#### [MODIFY] All existing files using hardcoded colors

Replace hardcoded values with Theme constants:
- [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx): Tab bar colors
- [src/screens/AuthScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/AuthScreen.tsx): Background, text, button colors
- [src/screens/SelfScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/SelfScreen.tsx): All colors and spacing
- [src/components/AssistivePresence.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/AssistivePresence.tsx): FAB color

---

### Phase 1.2: Internationalization (i18n)

Set up trilingual support for Sinhala, Tamil, and English.

#### [NEW] i18n Configuration

- [i18n/config.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/i18n/config.ts): i18next setup
- [i18n/locales/si.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/i18n/locales/si.json): Sinhala translations
- [i18n/locales/ta.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/i18n/locales/ta.json): Tamil translations
- [i18n/locales/en.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/i18n/locales/en.json): English translations

Initial translation keys:
```json
{
  "common": {
    "save": "...",
    "cancel": "...",
    "delete": "..."
  },
  "auth": {
    "login": "...",
    "signup": "...",
    "email": "...",
    "password": "..."
  },
  "tabs": {
    "self": "...",
    "classroom": "...",
    "community": "...",
    "library": "...",
    "profile": "..."
  },
  "self": {
    "goodMorning": "...",
    "goodAfternoon": "...",
    "goodEvening": "...",
    "venting": "...",
    "rhythm": "..."
  }
}
```

#### [MODIFY] All screens to use translations

- [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx): Tab labels
- [src/screens/AuthScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/AuthScreen.tsx): All text
- [src/screens/SelfScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/SelfScreen.tsx): Greetings, labels

#### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)

Wrap app with i18next provider.

---

### Phase 1.3: Fonts

Download and configure Noto Sans Sinhala and Tamil fonts.

#### [NEW] Font Files

Create `/assets/fonts/` directory with:
- `NotoSansSinhala-Regular.ttf`
- `NotoSansSinhala-Medium.ttf`
- `NotoSansSinhala-Bold.ttf`
- `NotoSansTamil-Regular.ttf`
- `NotoSansTamil-Medium.ttf`
- `NotoSansTamil-Bold.ttf`

#### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)

Add font loading with `expo-font` and `useFonts` hook.

#### [NEW] [constants/Fonts.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/constants/Fonts.ts)

Font family constants for Sinhala/Tamil/English.

---

### Phase 1.4: User Roles & Permissions

Add role-based access control.

#### [NEW] [types/User.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/types/User.ts)

TypeScript interfaces:
```typescript
type UserRole = 'teacher' | 'student' | 'principal';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  school_id: string;
  created_at: string;
}
```

#### [NEW] [utils/permissions.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/utils/permissions.ts)

Permission helper functions:
- `canCreateLesson(user)`: boolean
- `canPostAnnouncement(user)`: boolean
- `canViewClassroom(user, classroom)`: boolean

#### [MODIFY] [src/screens/AuthScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/AuthScreen.tsx)

Add role selection dropdown during signup:
- Teacher (default)
- Student
- Principal

Store role in user metadata.

#### [MODIFY] [src/store/useStore.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/store/useStore.ts)

Expand store to include user profile with role:
```typescript
interface AppState {
  user: User | null;
  setUser: (user: User) => void;
}
```

---

### Phase 1.5: Core Utilities

Extract and formalize utility functions.

#### [NEW] [utils/time.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/utils/time.ts)

Time and greeting utilities:
- `getTimeOfDay()`: 'dawn' | 'day' | 'evening' | 'night'
- `getGreeting(userName, language)`: string
- `formatDate(date, language)`: string
- `getRelativeTime(date, language)`: string

#### [NEW] [utils/device.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/utils/device.ts)

Device tier detection:
- `getDeviceTier()`: 'low' | 'mid' | 'high'
- `getDeviceConfig(tier)`: DeviceConfig (animations on/off, etc.)

#### [NEW] [utils/haptics.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/utils/haptics.ts)

Haptic feedback patterns:
- `hapticLight()`: void
- `hapticMedium()`: void
- `hapticSuccess()`: void
- `hapticError()`: void

#### [MODIFY] [src/screens/SelfScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/SelfScreen.tsx)

Use `getGreeting()` from utils instead of inline logic.

---

## Verification Plan

### Automated Tests

> [!NOTE]
> Since this is a React Native Expo project, there is currently no test framework set up. Manual verification will be primary method for v0.1.

**Future**: Set up Jest + React Native Testing Library for unit tests.

---

### Manual Verification

#### 1. Theme System Verification

**Test**: All hardcoded colors replaced with Theme constants
- [ ] Start app: `npx expo start`
- [ ] View each screen (Self, Classroom, Community, Library, Profile, Auth)
- [ ] Verify sanctuary colors appear correctly (orange #FF9933, dark background #0f0f1e)
- [ ] Check that colors match Theme.colors.* values
- [ ] Grep codebase for hardcoded colors: `grep -r "#" src/` (should only find Theme.ts)

**Test**: Spacing consistency
- [ ] Check all `padding`, `margin`, `gap` use `Theme.spacing.*` values
- [ ] Grep for magic numbers: `grep -r "padding: [0-9]" src/` (should return nothing)

---

#### 2. i18n Verification

**Test**: Language switching works
- [ ] Start app: `npx expo start`
- [ ] Go to Profile screen
- [ ] Find language selector (add if doesn't exist)
- [ ] Switch language to Sinhala (සිංහල)
- [ ] Verify all text changes to Sinhala
- [ ] Switch to Tamil (தமிழ்)
- [ ] Verify all text changes to Tamil
- [ ] Switch to English
- [ ] Verify all text changes to English

**Test**: No hardcoded text
- [ ] Grep codebase for hardcoded English strings
- [ ] Command: `grep -r "<Text>" src/ | grep -v "t(" ` (should return minimal results)
- [ ] All user-facing text should use `{t('key')}`

---

#### 3. Fonts Verification

**Test**: Sinhala text renders correctly
- [ ] Change app language to Sinhala
- [ ] View Auth screen
- [ ] Verify Sinhala characters render (not boxes ▯)
- [ ] Check Self screen greeting in Sinhala
- [ ] Take screenshot to confirm proper rendering

**Test**: Tamil text renders correctly
- [ ] Change app language to Tamil
- [ ] View Auth screen
- [ ] Verify Tamil characters render (not boxes ▯)
- [ ] Check Self screen greeting in Tamil
- [ ] Take screenshot to confirm proper rendering

---

#### 4. Roles & Permissions Verification

**Test**: Role selection during signup
- [ ] Start app, go to AuthScreen
- [ ] Click "Sign Up"
- [ ] Verify role dropdown appears (Teacher / Student / Principal)
- [ ] Select "Teacher", create account
- [ ] Login, verify role is stored

**Test**: Role-specific behavior (after features built)
- [ ] Login as Teacher → should see "Create Lesson" button
- [ ] Login as Student → should NOT see "Create Lesson"
- [ ] Login as Principal → should see "Post Announcement"

---

#### 5. Utilities Verification

**Test**: Time-based greeting
- [ ] Change device time to 8:00 AM
- [ ] Open app, go to Self screen
- [ ] Verify greeting shows "Good Morning" (or Sinhala/Tamil equivalent)
- [ ] Change device time to 3:00 PM
- [ ] Force refresh (pull down or restart app)
- [ ] Verify greeting shows "Good Afternoon"

**Test**: Device tier detection
- [ ] Run on low-end emulator (2GB RAM)
- [ ] Check console logs for `Device tier: low`
- [ ] Verify heavy animations are disabled
- [ ] Run on high-end emulator (8GB RAM)
- [ ] Verify animations are enabled

**Test**: Haptic feedback
- [ ] Press button with haptic feedback
- [ ] Feel/hear haptic vibration (on physical device)
- [ ] Test on Android and iOS

---

### Build Verification

**Test**: App builds and runs
```bash
# Android
npx expo run:android

# iOS (macOS only)
npx expo run:ios
```

- [ ] App launches without errors
- [ ] No TypeScript errors
- [ ] No runtime errors in console
- [ ] All screens navigable

---

### Code Quality Check

**Before committing**:
- [ ] All text translations exist for Si/Ta/En
- [ ] No hardcoded colors (all use Theme constants)
- [ ] No magic numbers (spacing uses Theme.spacing.*)
- [ ] TypeScript strict mode passes
- [ ] No `any` types used
- [ ] Proper RLS policies planned (to be implemented in Phase 1.6)

---

## User Review Required

> [!WARNING]
> **Breaking Changes**: This refactor will touch many files. All hardcoded values will be replaced with centralized constants.

**Design Decisions**:
1. **Theme Colors**: Using sanctuary palette from DESIGN_SYSTEM.md. Colors may need adjustment after visual review.
2. **Default Language**: Sinhala (සිංහල) will be the default language as per Core Commitment.
3. **Role Selection**: Added during signup. Users can't change role after account creation (v0.1 limitation).

**Trade-offs**:
- **Effort vs. Value**: This refactor is high effort but prevents 2-3x work later when retrofitting i18n and themes.
- **Feature Delay**: No new features until foundation is solid. This aligns with BUILD_ORDER.md philosophy.

---

## Next Steps After Foundation

Once Phase 1 foundation is complete:

**Phase 2: Core Utilities** (already partially in plan above)

**Phase 3: Core Components**
- LotusButton (primary, secondary, ghost variants)
- SanctuaryCard (for lessons, assignments)
- Input components (with validation states)
- Modal/Dialog
- Loading states (BreathingLoader, EmptyState)

**Phase 4-5: Build Features**
With solid foundation, features can be built cleanly:
- Self section (mood logging, reflection)
- Classroom (create lesson, upload PDF)
- Community (announcements)
- Library (resources)

---

## Timeline Estimate

| Task | Complexity | Estimated Time |
|------|-----------|----------------|
| Theme System | High | 3-4 hours |
| i18n Setup | Medium | 2-3 hours |
| Fonts | Low | 1-2 hours |
| Roles & Permissions | Medium | 2-3 hours |
| Utilities | Low | 2 hours |
| Refactor existing code | High | 3-4 hours |
| **Total** | | **13-18 hours** |

**Recommendation**: Break into 2 working sessions:
- **Session 1** (6-8 hours): Theme + i18n + Fonts
- **Session 2** (7-10 hours): Roles + Utilities + Testing

---

## Dependencies

**Required before starting**:
- ✅ Expo project running
- ✅ Supabase credentials configured
- ✅ Node modules installed

**Required packages to add**:
```bash
npm install i18next react-i18next
npx expo install expo-font
npx expo install expo-haptics
npx expo install expo-device
```

---

**Foundation first, features second!** 🪷

Once foundation is complete, features will snap into place cleanly without technical debt.
