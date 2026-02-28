# Profile Completion System — Design Document

**Date:** 2026-02-25
**Status:** Approved
**Tasks covered:** 2.1.5, 2.2.2, 2.2.3 (check only)
**Branch:** main-innovate

---

## Problem

Three issues exist in the current profile system:

1. **Two divergent completion calculators** — `IdentityCard` (5 fields, equal weight) and `ProfileCompletionBar` (7 fields, hardcoded percentages). They show different numbers and neither aligns with `FullProfileScreen` sections.
2. **No avatar implementation** — `avatar_url` is in the data model but there is no picker, upload, or default fallback.
3. **FullProfileScreen is not the SSOT** — the screen defines the editable sections but completion logic lives independently in unrelated components.

---

## Goals

- `FullProfileScreen` sections are the single source of truth for what counts as "profile complete."
- One `useProfileCompletion()` hook, same number shown everywhere.
- Avatar: pick, upload, local cache, initials fallback.
- `SanctuaryProgressBar` is a reusable `packages/ui` component that works anywhere.
- Adding a new section to the profile = one place to edit.

---

## Architecture

### Layer 1 — Section Manifest (SSOT)

**File:** `packages/profile/src/config/profileSections.ts`

Defines every section and field that makes up a complete profile.

```ts
export interface ProfileFieldConfig {
  key: keyof UserProfile;
  weight: number;           // relative weight — hook normalises automatically
  label: string;            // used in "Add your {label} to complete" nudge
  onlyForRoles?: UserRole[];
}

export interface ProfileSectionConfig {
  id: string;
  label: string;
  countInCompletion: boolean;  // set false to exclude from score entirely
  roles: UserRole[] | 'all';
  fields: ProfileFieldConfig[];
}
```

**Initial manifest** (all weights are relative — no field is hardcoded to a specific %):

```
identity section (all roles):
  full_name      weight 2   — worth 2× (core identity)
  avatar_url     weight 2   — worth 2× (visual identity)
  phone          weight 1
  index_number   weight 2   — students only
  nic_number     weight 2   — staff only

bio section (all roles):
  bio            weight 2

professional section (teacher / principal / grade_head / section_head):
  experience_years  weight 1
  subjects_taught   weight 2
  qualifications    weight 2
```

**Weight normalisation rule** (handled entirely by the hook):
```
totalWeight    = Σ applicable field weights
fieldContrib   = field.weight / totalWeight × 100
score          = Σ(filledField.weight) / totalWeight × 100
```

Adding a new field or section → weights re-balance automatically.

---

### Layer 2 — useProfileCompletion Hook

**File:** `packages/profile/src/hooks/useProfileCompletion.ts`

```ts
interface ProfileCompletionResult {
  percentage: number;           // 0–100, normalised
  isComplete: boolean;
  nextHint: string;             // "Add your profile photo to complete"
  sectionBreakdown: {
    [sectionId: string]: { score: number; label: string };
  };
  hasSeenCompletionCelebration: boolean;
  markCompletionCelebrationSeen: () => Promise<void>;
}

function useProfileCompletion(
  profile: UserProfile | null,
  role: UserRole | null
): ProfileCompletionResult
```

Logic:
1. Filter `PROFILE_SECTIONS` by `countInCompletion` and role eligibility.
2. Within each section, filter fields by `onlyForRoles`.
3. Sum all applicable field weights → `totalWeight`.
4. For each field: check `profile[field.key]` is non-null, non-empty string, non-zero number.
5. `percentage = Math.round(filledWeight / totalWeight * 100)`.
6. `nextHint` = label of the first unfilled field with the highest weight.
7. `hasSeenCompletionCelebration` read from AsyncStorage key `@gurudevi/profile_completed_celebrated`.

---

### Layer 3 — SanctuaryProgressBar Component

**File:** `packages/ui/src/components/SanctuaryProgressBar.tsx`

Reusable across the whole monorepo. Uses `useTheme()` for phase-aware colours.

```ts
interface SanctuaryProgressBarProps {
  percentage: number;            // 0–100
  isComplete?: boolean;          // true → gold/reward state
  nextHint?: string;             // shown below bar
  showPercentage?: boolean;      // default true
  compact?: boolean;             // thinner bar for tight layouts
  style?: ViewStyle;
}
```

**Visual states:**
- **Incomplete:** fill = `accent.action` (phase-aware — teal at dusk, leaf green at morning, gold at night)
- **Complete:** fill = `accent.reward` (saffron/gold) + subtle glow using `glow.reward`
- **Track:** `glass.surface.bg`
- **Hint text:** `text.secondary`, below the bar

**Animation:**
- Bar fill: `Animated.timing` on `percentage` change, 600ms ease-out — naturally animates on every field save
- Completion state transition: fill crossfades to `accent.reward` + glow pulse (Reanimated `withSequence`)

**Celebration (handled by consumer, not the component):**
The component emits no events — the caller (ProfileScreen / FullProfileView) owns the celebration logic using `onFirstComplete` from `useProfileCompletion`.

---

## Avatar System

### Flow
1. **Pick** — `expo-image-picker` (gallery or camera). Request permissions before opening.
2. **Crop/resize** — resize to 400×400 before upload (use `expo-image-manipulator`).
3. **Upload** — Supabase Storage bucket `avatars/{userId}.jpg`. Get public URL.
4. **Update profile** — call `useProfile().updateField('avatar_url', publicUrl)`.
5. **Local cache** — save resized image to `expo-file-system` at `{cacheDirectory}/avatar_{userId}.jpg`. Display cached version while upload is in progress (optimistic).
6. **Offline** — if local cache exists, display it. No network needed.

### Default avatar (when avatar_url is null)
Generate an initials avatar from `full_name`:
- Take first letter of first name + first letter of last name (or first two letters of single name).
- Render as a `View` with `backgroundColor: accent.action`, `Text` in `text.inverse`.
- This is a pure React Native component — no image needed, works offline, always available.

**Component:** `AvatarDisplay` in `packages/profile/src/components/`
- Shows: cached image → avatar_url (remote) → initials fallback
- Tappable when `editable={true}` to open the picker

---

## Screen Changes

### ProfileScreen layout (between IdentityCard and action button)
```
IdentityCard                          ← remove completion % from here
SanctuaryProgressBar                  ← new
  "Add your profile photo to complete"
[ View / Edit Profile ]  ← registered
[ Create Account ]       ← guest / anonymous
```

Dynamic button logic:
```ts
const isGuest = !user || user.is_anonymous;
// guest → "Create Account" → navigate to AuthScreen
// registered → "View / Edit Profile" → open FullProfileScreen
```

### FullProfileScreen layout
```
IdentityCard (centered — verify task 2.2.3, fix only if needed)
SanctuaryProgressBar     ← visible until isComplete
── Identity & Contact ──
── Professional Branding (staff only) ──
── Your Story ──
```

When `isComplete`:
- Bar transitions to gold state and fades out after 2s.
- `AchievementUnlockOverlay` triggered once (first time only, via AsyncStorage flag).

### IdentityCard
- Remove `completionPercentage` useMemo and ring indicator.
- Replace avatar display with `AvatarDisplay` component (supports tap-to-edit when on own profile, initials fallback).

---

## Celebration System

| Event | Effect |
|---|---|
| Any field saved | `hapticSuccess()` + bar animates to new value (free from Animated) |
| First time reaching 100% | `AchievementUnlockOverlay` fired once + `hapticSuccess()` heavy |
| Subsequent visits at 100% | Bar shows gold/complete state, no animation repeat |
| `@gurudevi/profile_completed_celebrated` key | Persisted in AsyncStorage — prevents repeat |

---

## Proactive Risk Flags

1. **`expo-image-manipulator`** — check it's in `apps/gurudevi-mobile/package.json`. If not, add it.
2. **Supabase Storage bucket** — bucket `avatars` must exist with public read policy. Check before implementing upload.
3. **`avatar_url` in the manifest** — if avatar_url is present but local cache path is stored instead of the Supabase URL, the completion check must look at `avatar_url` (Supabase URL), not the cache path. The hook reads from `UserProfile`, not the local file system.
4. **`AchievementUnlockOverlay` coupling** — it lives at TabNavigator level. Triggering it from ProfileScreen requires the same event bus or context prop already used for achievements. Check the existing pattern before wiring.
5. **`subjects_taught` and `qualifications`** — stored as `string | string[]` in `UserProfile`. Completion check must handle both: array with length > 0, or non-empty string. Use a shared `isFieldFilled()` util.

---

## Files Touched

| File | Change |
|---|---|
| `packages/profile/src/config/profileSections.ts` | **Create** — section manifest |
| `packages/profile/src/hooks/useProfileCompletion.ts` | **Create** — hook |
| `packages/profile/src/components/AvatarDisplay.tsx` | **Create** — avatar with initials fallback |
| `packages/ui/src/components/SanctuaryProgressBar.tsx` | **Create** — reusable bar |
| `packages/ui/src/components/index.ts` | Export SanctuaryProgressBar |
| `packages/ui/src/index.ts` | Re-export (via components barrel) |
| `apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx` | Remove completion %, use AvatarDisplay |
| `apps/gurudevi-mobile/src/screens/ProfileScreen.tsx` | Add bar + dynamic button |
| `apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx` | Add bar, center ID card (check 2.2.3), wire celebration |
| `apps/gurudevi-mobile/src/components/profile/ProfileCompletionBar.tsx` | **Delete** — replaced by SanctuaryProgressBar + useProfileCompletion |

---

## Out of Scope (deferred)

- Per-section completion breakdown UI in FullProfileView (can add later using `sectionBreakdown` from the hook)
- Avatar crop UI beyond basic resize
- Tap-on-hint to jump to the relevant field (requires field-level navigation — future enhancement)
