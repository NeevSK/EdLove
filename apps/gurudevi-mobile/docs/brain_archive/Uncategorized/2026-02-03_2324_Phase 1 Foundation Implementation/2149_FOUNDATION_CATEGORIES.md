# Foundation Work: Category Breakdown

> **Understanding what goes where and why**

---

## 🎯 What Makes Foundation Work "Foundation"?

**Core principle:** Used by MANY features, created ONCE

**Characteristics:**
- ✅ Reusable across entire app
- ✅ Changes propagate everywhere
- ✅ Sets patterns for future code
- ✅ High initial cost, massive long-term savings

**NOT Foundation:**
- ❌ Feature-specific code
- ❌ One-time use components
- ❌ Business logic
- ❌ Content/data

---

## 📊 The 5 Foundation Categories

### 1. **Theme Systems** 🎨

**What it is:**
Design tokens that define your app's look & feel

**Includes:**
- Colors palette
- Typography scale (font sizes)
- Spacing scale (margins/padding values)
- Border radius values
- Shadow definitions
- Motion/animation timings

**Example from Gurudevi:**
```typescript
// Theme.ts
export const Theme = {
  colors: {
    voidIndigo: '#0A0E27',      // Background
    sanctuarySaffron: '#FF9933',  // Accent
    sacredWhite: '#FFFFFF',      // Text
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  corners: {
    tight: 4,
    comfortable: 8,
    generous: 12,
  },
};
```

**Why it's foundation:**
- Used in EVERY screen
- Change `voidIndigo` once → 50+ places update
- Ensures consistency

**When to create:**
- Start of project
- Before building any UI
- Once per app (rarely changes)

**NOT Theme:**
- Component-specific styles
- Layout structures
- Animations (those go in Utils)

---

### 2. **i18n Infrastructure** 🌍

**What it is:**
Multi-language support system

**Includes:**
- Language configuration (which languages?)
- Translation file structure
- Language switching mechanism
- Fallback logic (if translation missing)
- Locale detection

**Example from Gurudevi:**
```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      si: { translation: require('./locales/si.json') },
      ta: { translation: require('./locales/ta.json') },
      en: { translation: require('./locales/en.json') },
    },
    lng: 'si', // Default language
    fallbackLng: 'en',
  });
```

```json
// locales/si.json
{
  "auth": {
    "login": "ප්‍රවේශ වන්න",
    "email": "විද්‍යුත් තැපෑල"
  }
}
```

**Why it's foundation:**
- Every text string uses it
- Add language once → entire app translated
- Ensures no hardcoded strings

**When to create:**
- Start of project
- Before writing any UI text
- Once per app

**NOT i18n:**
- Actual translations (those are content)
- Language-specific logic
- Date/number formatting (those go in Utils)

---

### 3. **Type Definitions** 📐

**What it is:**
TypeScript interfaces/types for your data models

**Includes:**
- User types
- API response types
- Database schema types
- Enum definitions (fixed values)
- Shared utility types

**Example from Gurudevi:**
```typescript
// types/User.ts
export type UserRole = 'teacher' | 'student' | 'principal';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  school_name?: string;
  created_at: string;
}

// types/Lesson.ts
export interface Lesson {
  id: string;
  title: string;
  teacher_id: string;
  student_ids: string[];
  scheduled_at: string;
}
```

**Why it's foundation:**
- Used across features (auth, profile, lessons, etc.)
- Autocomplete everywhere
- Catches bugs at compile-time

**When to create:**
- After database schema is defined
- Before building features that use data
- Updated when schema changes

**NOT Types:**
- Component prop types (those stay in component files)
- Local state types (those stay in feature files)
- One-off interfaces

---

### 4. **Utility Functions** 🔧

**What it is:**
Reusable helper functions that solve common problems

**Includes:**
- Date/time formatting
- String manipulation
- Number formatting
- Validation functions
- Data transformations
- API helpers

**Example from Gurudevi:**
```typescript
// utils/time.ts
export function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'self.goodMorning';
  if (hour < 17) return 'self.goodAfternoon';
  return 'self.goodEvening';
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale).format(date);
}

// utils/permissions.ts
export function canCreateLesson(role: UserRole): boolean {
  return role === 'teacher' || role === 'principal';
}

// utils/haptics.ts
export async function hapticLight() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
```

**Why it's foundation:**
- Used in multiple features
- DRY (Don't Repeat Yourself)
- Single source of truth for logic

**When to create:**
- When you write same logic 2nd time
- Before building features that need them
- Add as needed (more incremental than Theme/i18n)

**NOT Utils:**
- Feature-specific calculations
- One-time transformations
- Business logic (those stay in features)

---

### 5. **Boilerplate Code** 🏗️

**What it is:**
Repetitive setup code that follows patterns

**Includes:**
- API route templates
- CRUD operation templates
- Form handling patterns
- Error handling wrappers
- Navigation setup

**Example from Gurudevi:**
```typescript
// lib/supabase.ts (Boilerplate setup)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Navigation setup (Boilerplate)
const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Self" component={SelfScreen} />
      <Tab.Screen name="Classroom" component={ClassroomScreen} />
      {/* ... more tabs */}
    </Tab.Navigator>
  );
}
```

**Why it's foundation:**
- Sets up infrastructure
- Establishes patterns
- Future features copy-paste and modify

**When to create:**
- At project start
- When adding new infrastructure (database, auth, etc.)
- Once, then rarely changed

**NOT Boilerplate:**
- Actual features
- Unique business logic
- Custom implementations

---

## 🔍 Key Differentiators

### Theme vs Utils

| Theme | Utils |
|-------|-------|
| **Static values** (colors, sizes) | **Functions** (compute, transform) |
| Design tokens | Logic helpers |
| `Theme.colors.voidIndigo` | `formatDate(date)` |
| Imported, values used | Imported, functions called |
| Changed by designers | Changed by developers |

---

### i18n vs Types

| i18n | Types |
|------|-------|
| **Text content** (translations) | **Data shapes** (structure) |
| User-facing strings | Developer-facing contracts |
| `t('auth.login')` → "ප්‍රවේශ වන්න" | `user: User` → autocomplete |
| Multiple versions (si/ta/en) | Single version (code) |
| Changed by translators | Changed by developers |

---

### Utils vs Boilerplate

| Utils | Boilerplate |
|-------|-------------|
| **Reusable functions** | **Setup code** |
| Called in many places | Configured once |
| `getGreetingKey()` | `createClient()` |
| Pure logic | Infrastructure |
| Many small files | Few large files |

---

### Types vs Boilerplate

| Types | Boilerplate |
|-------|-------------|
| **What data looks like** | **How to connect to data** |
| Interface definitions | API/DB setup |
| `interface User { ... }` | `const supabase = createClient(...)` |
| Compile-time safety | Runtime setup |
| No execution | Executes on app start |

---

## 🎯 Decision Matrix

**Ask yourself:** "Where does this belong?"

```
Is it a VALUE (color, size, text)?
├─ Visual (color, spacing, font)? → **Theme**
└─ Text content? → **i18n**

Is it a FUNCTION (logic)?
├─ Reusable across features? → **Utils**
└─ Feature-specific? → Keep in feature file

Is it a STRUCTURE (data shape)?
├─ Shared across features? → **Types**
└─ Component-only? → Keep in component

Is it SETUP (configuration)?
├─ Infrastructure (DB, Auth, API)? → **Boilerplate**
└─ Feature config? → Keep in feature
```

---

## 📋 Real Examples from Gurudevi

### ✅ Correctly Categorized:

**Theme:**
```typescript
// ✅ Color used in many places
Theme.colors.sanctuarySaffron
```

**i18n:**
```typescript
// ✅ Translation used in multiple screens
t('auth.login')
```

**Types:**
```typescript
// ✅ User type used in auth, profile, classroom
interface User { ... }
```

**Utils:**
```typescript
// ✅ Greeting used in Self screen, could be used elsewhere
getGreetingKey()
```

**Boilerplate:**
```typescript
// ✅ Supabase setup used by all API calls
export const supabase = createClient(...)
```

---

### ❌ Common Mistakes:

**Mistake 1: Feature logic in Utils**
```typescript
// ❌ BAD - Too specific to venting feature
// utils/venting.ts
export function processVentingEntry(text: string) {
  // This is feature logic, not a util!
}

// ✅ GOOD - Keep in feature file
// features/venting/logic.ts
export function processVentingEntry(text: string) {
  // Feature-specific, stays here
}
```

**Mistake 2: Component-specific styles in Theme**
```typescript
// ❌ BAD - Too specific
Theme.components.ventingCardShadow = '0 2px 4px rgba(0,0,0,0.1)';

// ✅ GOOD - Generic shadow
Theme.shadows.small = '0 2px 4px rgba(0,0,0,0.1)';
```

**Mistake 3: Hardcoded text in Types**
```typescript
// ❌ BAD
interface AuthScreen {
  buttonText: 'Login'; // Hardcoded English
}

// ✅ GOOD
// Use i18n key instead
<Button>{t('auth.login')}</Button>
```

---

## 🚀 When to Create Each

### Project Start (Week 1):
1. ✅ **Theme** - Define colors, spacing
2. ✅ **i18n** - Setup config, create 3 translation files
3. ✅ **Types** - Define User, core data models
4. ✅ **Boilerplate** - Setup Supabase, Navigation

### As You Build (Ongoing):
5. ✅ **Utils** - Add when you repeat logic 2nd time

---

## 💡 Summary

**Foundation Work = Shared Infrastructure**

**The 5 Categories:**

| Category | What | When | Example |
|----------|------|------|---------|
| **Theme** | Design tokens | Start | `Theme.colors.voidIndigo` |
| **i18n** | Translation system | Start | `t('auth.login')` |
| **Types** | Data shapes | Start | `interface User` |
| **Utils** | Helper functions | Ongoing | `getGreetingKey()` |
| **Boilerplate** | Setup code | Start | `createClient()` |

**Key Insight:**
- Theme/i18n/Types/Boilerplate = **Create once, rarely change**
- Utils = **Add incrementally as needed**

**Remember:**
Not everything belongs in foundation!
- Feature logic → stays in features
- Component styles → stays in components
- One-off code → stays inline
