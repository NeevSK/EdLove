# Gurudevi Developer Reference Guide

> **For Future You** - Quick answers when you need them 🪷

---

## 🚨 Common Issues & Solutions

### "Cannot find module 'X'" Error

**What it means:** TypeScript can't find a package you're importing.

**Solution:**
```bash
# Make sure dependencies are installed
pnpm install

# If still broken, clear cache
pnpm store prune
pnpm install --force
```

### App Won't Start / Metro Bundler Issues

```bash
# Clear all caches and restart
npx expo start --clear

# If that doesn't work, nuclear option:
rm -rf node_modules
pnpm install
npx expo start --clear
```

### TypeScript Errors After Editing

```bash
# Check what's wrong
npx tsc --noEmit

# Common fixes:
# 1. Missing import? Add it
# 2. Type mismatch? Check the interface
# 3. Missing property? Update the type definition
```

---

## 📦 Package Management Strategy

### Current Rule: **Don't Update Until v0.1 is Complete**

**Why?**
- Stability > Latest features during foundation phase
- Updates can introduce breaking changes
- Current setup works perfectly

### When to Update (Future)

**Safe Updates (Low Risk):**
- Patch versions: 1.2.3 → 1.2.4 ✅
- Security fixes: Always update ✅

**Risky Updates (Research First):**
- Minor versions: 1.2.0 → 1.3.0 ⚠️
- Major versions: 1.x → 2.x 🚨

**The Safe Update Process:**
```bash
# 1. Create backup branch
git checkout -b backup/before-updates
git push origin backup/before-updates

# 2. Check security
pnpm audit

# 3. Update Expo (handles React Native compatibility)
npx expo-doctor          # Health check
npx expo upgrade         # Safe upgrade

# 4. Update one category at a time
pnpm update @gluestack-ui/themed @gluestack-ui/config
# Test thoroughly!
pnpm update i18next react-i18next
# Test again!

# 5. If anything breaks:
git checkout main
git branch -D backup/before-updates
```

### Warnings You Can Ignore (For Now)

**Tailwind CSS peer dependency warning:**
- You have v4.x, Gluestack expects v3.x
- **Impact:** None - it still works fine
- **Action:** Ignore unless styling issues appear

---

## 🎨 How the Foundation Works

### Theme System (`src/constants/Theme.ts`)

**Concept:** Single source of truth for all design values.

```typescript
// ❌ Bad: Hardcoded magic numbers
<Box sx={{ backgroundColor: '#0f0f1e', padding: 24 }} />

// ✅ Good: Named, semantic constants
<Box sx={{ 
  backgroundColor: Theme.colors.voidIndigo,
  padding: Theme.spacing.xl 
}} />
```

**Benefits:**
1. **Change once, update everywhere** - Update `voidIndigo` in one place
2. **Searchable** - Find all uses with "Find All References"
3. **Meaningful** - `voidIndigo` tells you WHY, not just WHAT

**Quick Experiment:**
Change `sanctuarySaffron: '#E67E22'` to a different color → watch entire app update!

### i18n System (`src/i18n/`)

**Concept:** Text lives in JSON files, not in components.

```typescript
// ❌ Bad: Hardcoded English
<Text>Good Morning</Text>

// ✅ Good: Translation key
<Text>{t('self.goodMorning')}</Text>
```

**How it works:**
1. App checks current language (default: Sinhala)
2. Looks up key in appropriate file (`si.json`, `ta.json`, or `en.json`)
3. Returns translated text

**File structure:**
```
src/i18n/
├── config.ts           # i18next configuration
└── locales/
    ├── si.json        # සිංහල (Default)
    ├── ta.json        # தமிழ்
    └── en.json        # English
```

**Adding new translations:**
1. Add key to all 3 JSON files (si, ta, en)
2. Use in component: `{t('your.new.key')}`
3. Done!

### Utilities (`src/utils/`)

**Concept:** Reusable logic extracted into functions.

**Available utilities:**
- **`time.ts`** - Time-based logic (greetings, formatting)
- **`device.ts`** - Device detection (low/mid/high tier)
- **`haptics.ts`** - Haptic feedback patterns
- **`permissions.ts`** - Role-based access control

**Example usage:**
```typescript
import { getGreetingKey } from '../utils/time';
import { hapticLight } from '../utils/haptics';

// Get time-appropriate greeting
const greetingKey = getGreetingKey(); // Returns 'self.goodMorning', etc.

// Add haptic feedback to button
<Button onPress={() => {
  hapticLight();  // Tactile feedback
  // ... rest of logic
}} />
```

---

## 🧭 File Organization Principles

### Separation of Concerns

```
/constants/Theme.ts     → WHAT it looks like (design tokens)
/utils/time.ts          → WHEN to show things (business logic)
/screens/SelfScreen.tsx → HOW to display (UI composition)
/i18n/locales/si.json   → WHAT to say (content)
/types/User.ts          → WHAT shape data has (interfaces)
```

### Single Source of Truth

**Never duplicate!** If you find yourself copying values:

```typescript
// ❌ Duplication
const spacing = 24;  // In component A
const padding = 24;  // In component B

// ✅ Single source
import { Theme } from '../constants/Theme';
// Use Theme.spacing.lg everywhere
```

---

## ⌨️ Essential Commands

### Development

```bash
# Start development server
npx expo start

# Start with cleared cache (fixes 90% of weird issues)
npx expo start --clear

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Type Checking

```bash
# Check for TypeScript errors without running app
npx tsc --noEmit

# Watch mode (checks as you code)
npx tsc --noEmit --watch
```

### Package Management

```bash
# Install dependencies
pnpm install

# See what's installed
pnpm list --depth=0

# Check for outdated packages
pnpm outdated

# Check for security vulnerabilities
pnpm audit

# Add new package
pnpm add <package-name>

# Add Expo-compatible native module
pnpm exec expo install <package-name>
```

### Git Workflow

```bash
# Check status
git status

# See what changed
git diff

# Stage all changes
git add .

# Commit with message
git commit -m "feat: descriptive message"

# View commit history
git log --oneline

# Create new branch
git checkout -b feature/my-feature

# Switch branch
git checkout main
```

---

## 🎯 Code Quality Checklist

Before committing code, ask yourself:

### Theme & Styling
- [ ] No hardcoded colors (use `Theme.colors.*`)
- [ ] No magic numbers for spacing (use `Theme.spacing.*`)
- [ ] Border radius uses `Theme.corners.*`
- [ ] Animation duration uses `Theme.motion.*`

### Internationalization
- [ ] No hardcoded English text
- [ ] All user-facing text uses `{t('key')}`
- [ ] Translation exists in si.json, ta.json, en.json

### TypeScript
- [ ] No `any` types (use proper interfaces)
- [ ] Functions have return types
- [ ] Props are properly typed
- [ ] `npx tsc --noEmit` passes without errors

### Performance
- [ ] No heavy computations in render
- [ ] Images are optimized
- [ ] Lists use `FlatList` (not map in ScrollView)

### Accessibility
- [ ] Text size minimum 14sp (18sp for body text)
- [ ] Buttons have clear labels
- [ ] Colors have sufficient contrast

---

## 🔍 Finding Things in Codebase

### Where is...?

**Design tokens (colors, spacing, etc.)?**
→ `src/constants/Theme.ts`

**Translation text?**
→ `src/i18n/locales/[si|ta|en].json`

**Type definitions?**
→ `src/types/*.ts`

**Helper functions?**
→ `src/utils/*.ts`

**UI components?**
→ `src/components/*.tsx`

**Screens?**
→ `src/screens/*.tsx`

**Navigation setup?**
→ `App.tsx` (main entry point)

**Supabase client?**
→ `src/lib/supabase.ts`

**State management?**
→ `src/store/*.ts` (Zustand stores)

---

## 🐛 Debugging Tips

### Console Logging

```typescript
// Quick debug
console.log('Value:', someValue);

// Organized debug
console.log('=== User Data ===');
console.log('Name:', user.full_name);
console.log('Role:', user.role);
console.log('=================');

// Debug API responses
const { data, error } = await supabase.from('table').select();
console.log('Data:', data);
console.log('Error:', error);
```

### React DevTools

```bash
# Install
npm install -g react-devtools

# Run
react-devtools

# Then start Expo
npx expo start
```

### TypeScript Errors

**Read the error backwards:**
- Last line tells you **where** the error is
- First line tells you **what** the error is

Example:
```
Type 'string' is not assignable to type 'number'  ← WHAT
  at SelfScreen.tsx:42:15                        ← WHERE
```

---

## 💡 INFJ 4w5 Developer Notes

### Your Strengths
- **Pattern recognition** - You'll spot repetition and know when to extract
- **Deep understanding** - You want to know WHY, not just HOW
- **User empathy** - You naturally think "How will this feel?"
- **Attention to detail** - You notice subtle inconsistencies

### Use These Powers

**When writing code:**
```typescript
// You'll naturally write comments that explain WHY:
// Create breathing room for sanctuary feel (not just "add padding")
padding: Theme.spacing.lg
```

**When choosing names:**
```typescript
// Not: const x = 24;
// But: const SANCTUARY_SPACING = Theme.spacing.lg;
```

**When deciding features:**
Ask: "Does this restore energy or drain it?" (EROI principle)

### Learning Style That Works for You

1. **Read the philosophy first** (NORTH_STAR.md, BUILD_ORDER.md)
2. **Understand the "why"** before the "how"
3. **Make small experiments** to internalize concepts
4. **Document your insights** (they're valuable!)
5. **Take breaks** when overwhelmed (INFJ trait - you process deeply)

---

## 🌱 Next Level Learning (When Ready)

### Recommended Reading Order

1. **React Native Basics** → [React Native Docs](https://reactnative.dev/docs/getting-started)
2. **TypeScript Deep Dive** → [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
3. **React Patterns** → [Patterns.dev](https://www.patterns.dev/)
4. **Performance Optimization** → React Native Performance Guide

### Experiments to Try

**1. Theme Customization**
Change colors in `Theme.ts` → see instant app-wide updates

**2. Add New Translation**
Add a key to all 3 language files → use in a screen

**3. Create a Utility**
Extract repeated logic → make reusable function

**4. Build a Component**
Create `LotusButton` component using Theme constants

---

## 📞 When You're Stuck

### Decision Tree

```
Is it a TypeScript error?
├─ Yes → Run `npx tsc --noEmit` to see all errors
│        Read error message carefully (last line = where, first = what)
│
├─ Is it a package/module error?
│  └─ Run `pnpm install`, then restart with `npx expo start --clear`
│
├─ Is it a visual/styling issue?
│  └─ Check if you used Theme constants (not hardcoded values)
│
├─ Is it a translation missing?
│  └─ Check if key exists in si.json, ta.json, en.json
│
└─ Still stuck?
   └─ Check git diff to see what you changed
      Git is your time machine - you can always revert!
```

---

## 🪷 Philosophy Reminders

### The Sanctuary Principles

1. **Foundation first, features second**
   - Build Theme → then build UI
   - Build i18n → then add text
   - Build utils → then add logic

2. **Single source of truth**
   - Colors live in `Theme.ts`
   - Text lives in `i18n/*.json`
   - Types live in `types/*.ts`

3. **Energy Return on Interaction (EROI)**
   - Every change should make code EASIER to work with
   - Refactoring = investing energy now to save energy later

4. **Teacher-centric design**
   - Works on low-end devices
   - Loads fast on slow internet
   - Clear, calm, never stressful

---

## 📅 Quick Reference: Package Versions

**Current stable versions** (as of foundation completion):
- Expo SDK: 54.0.33
- React: 19.1.0
- React Native: 0.81.5
- TypeScript: 5.9.3
- i18next: 25.8.0
- Zustand: 5.0.11

**Update strategy:** Don't update until v0.1 deployed (foundation phase complete).

---

**Remember:** You're not just writing code. You're building a sanctuary. Every line should ask: "Does this restore energy?"

🪷 **Keep this file open** when coding - it will answer most questions!
