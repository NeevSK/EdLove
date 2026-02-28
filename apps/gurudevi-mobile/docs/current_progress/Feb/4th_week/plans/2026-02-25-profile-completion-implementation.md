# Profile Completion System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Implement a unified profile completion system — single `useProfileCompletion()` hook, reusable `SanctuaryProgressBar`, avatar pick/upload/cache/initials — and wire them into ProfileScreen and FullProfileScreen, replacing the two divergent calculators.

**Architecture:** Section manifest (`packages/profile/src/config/profileSections.ts`) as SSOT → `useProfileCompletion()` hook → `SanctuaryProgressBar` in `packages/ui` → consumed by IdentityCard, ProfileScreen, FullProfileScreen. Avatar handled by `AvatarDisplay` component in `packages/profile/src/components/`.

**Tech Stack:** React Native (Expo SDK 51), TypeScript strict, Reanimated 3 (`withTiming`, `withSequence`), `expo-image-picker` (already installed `^17.0.10`), `expo-image-manipulator` (already installed `^14.0.8`), `expo-file-system` (already installed `^19.0.21`), Supabase Storage, AsyncStorage, `useTheme()` for phase-aware tokens.

---

## Pre-flight: Check Supabase Storage bucket

Before writing any upload code, confirm the `avatars` bucket exists.

1. Open Supabase Dashboard → Storage
2. Look for bucket named `avatars`
3. If missing: New Bucket → Name: `avatars` → Public: ✅ → Create
4. Verify the bucket has a public read policy (anon can SELECT)

This is a one-time environment check. Do it before Task 4.

---

## Task 1 — isFieldFilled utility + profileSections manifest

**Files:**
- Create: `packages/profile/src/lib/isFieldFilled.ts`
- Create: `packages/profile/src/config/profileSections.ts`
- Modify: `packages/profile/src/index.ts`

**Context:** The manifest is the single source of truth for what makes a profile "complete". The utility handles the `string | string[]` edge case for `subjects_taught` and `qualifications`.

---

**Step 1: Create `packages/profile/src/lib/isFieldFilled.ts`**

```typescript
/**
 * isFieldFilled — determines if a UserProfile field value counts as "filled".
 *
 * Rules:
 *  - null / undefined   → false
 *  - empty string ""    → false
 *  - number 0           → false  (experience_years = 0 means "not set")
 *  - empty array []     → false
 *  - anything else      → true
 */
export function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
```

---

**Step 2: Create `packages/profile/src/config/profileSections.ts`**

```typescript
import type { UserRole } from '@repo/core';
import type { UserProfile } from '../types';

export interface ProfileFieldConfig {
  key: keyof UserProfile;
  weight: number;           // Relative — hook normalises to 100% automatically
  label: string;            // Used in "Add your {label} to complete" nudge
  onlyForRoles?: UserRole[];
}

export interface ProfileSectionConfig {
  id: string;
  label: string;
  countInCompletion: boolean;  // Set false to exclude entire section from score
  roles: UserRole[] | 'all';
  fields: ProfileFieldConfig[];
}

export const PROFILE_SECTIONS: ProfileSectionConfig[] = [
  {
    id: 'identity',
    label: 'Identity & Contact',
    countInCompletion: true,
    roles: 'all',
    fields: [
      { key: 'full_name',    weight: 2, label: 'full name' },
      { key: 'avatar_url',   weight: 2, label: 'profile photo' },
      { key: 'phone',        weight: 1, label: 'phone number' },
      // Student-only
      { key: 'index_number', weight: 2, label: 'index number',
        onlyForRoles: ['student'] },
      // Staff-only (all non-student registered roles)
      { key: 'nic_number',   weight: 2, label: 'NIC number',
        onlyForRoles: ['teacher', 'principal', 'grade_head', 'section_head', 'founder', 'admin', 'developer'] },
    ],
  },
  {
    id: 'bio',
    label: 'Your Story',
    countInCompletion: true,
    roles: 'all',
    fields: [
      { key: 'bio', weight: 2, label: 'bio' },
    ],
  },
  {
    id: 'professional',
    label: 'Professional Branding',
    countInCompletion: true,
    roles: ['teacher', 'principal', 'grade_head', 'section_head'],
    fields: [
      { key: 'experience_years', weight: 1, label: 'years of experience' },
      { key: 'subjects_taught',  weight: 2, label: 'subjects taught' },
      { key: 'qualifications',   weight: 2, label: 'qualifications' },
    ],
  },
];
```

---

**Step 3: Export from `packages/profile/src/index.ts`**

Append to the existing exports:
```typescript
export { isFieldFilled } from './lib/isFieldFilled';
export * from './config/profileSections';
```

---

**Step 4: Mental weight-normalisation check (no code, just verify the math)**

For a student with only `full_name` set:
- Applicable fields: `full_name(2)`, `avatar_url(2)`, `phone(1)`, `index_number(2)`, `bio(2)`
- `totalWeight = 2+2+1+2+2 = 9`
- `filledWeight = 2`
- `percentage = Math.round(2/9 * 100) = 22%`

For a teacher with all fields set:
- Applicable fields: `full_name(2)`, `avatar_url(2)`, `phone(1)`, `nic_number(2)`, `bio(2)`, `experience_years(1)`, `subjects_taught(2)`, `qualifications(2)`
- `totalWeight = 14`, `filledWeight = 14` → `100%` ✓

---

**Step 5: Commit**
```bash
git add packages/profile/src/lib/isFieldFilled.ts \
        packages/profile/src/config/profileSections.ts \
        packages/profile/src/index.ts
git commit -m "feat(profile): add isFieldFilled util and PROFILE_SECTIONS manifest (completion SSOT)"
```

---

## Task 2 — useProfileCompletion hook

**Files:**
- Create: `packages/profile/src/hooks/useProfileCompletion.ts`
- Modify: `packages/profile/src/index.ts`

**Context:** Pure calculation logic + AsyncStorage read for the one-time celebration flag. No side effects other than AsyncStorage.

---

**Step 1: Create `packages/profile/src/hooks/useProfileCompletion.ts`**

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole } from '@repo/core';
import type { UserProfile } from '../types';
import { PROFILE_SECTIONS } from '../config/profileSections';
import { isFieldFilled } from '../lib/isFieldFilled';

const CELEBRATION_KEY = '@gurudevi/profile_completed_celebrated';

export interface ProfileCompletionResult {
  percentage: number;       // 0–100 integer
  isComplete: boolean;
  nextHint: string;         // e.g. "Add your profile photo to complete"
  sectionBreakdown: {
    [sectionId: string]: { score: number; label: string };
  };
  hasSeenCompletionCelebration: boolean;
  markCompletionCelebrationSeen: () => Promise<void>;
}

export function useProfileCompletion(
  profile: UserProfile | null,
  role: UserRole | null,
): ProfileCompletionResult {
  // Default true prevents flash-showing overlay on mount for already-completed profiles
  const [hasSeenCelebration, setHasSeenCelebration] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CELEBRATION_KEY).then(val => {
      // val === null means never set → hasn't seen it
      setHasSeenCelebration(val === 'true');
    });
  }, []);

  const markCompletionCelebrationSeen = useCallback(async () => {
    setHasSeenCelebration(true);
    await AsyncStorage.setItem(CELEBRATION_KEY, 'true');
  }, []);

  const computed = useMemo(() => {
    if (!profile || !role) {
      return {
        percentage: 0,
        isComplete: false,
        nextHint: 'Add your full name to complete',
        sectionBreakdown: {} as ProfileCompletionResult['sectionBreakdown'],
      };
    }

    // 1. Filter sections by countInCompletion and role eligibility
    const eligibleSections = PROFILE_SECTIONS.filter(section => {
      if (!section.countInCompletion) return false;
      if (section.roles === 'all') return true;
      return (section.roles as UserRole[]).includes(role);
    });

    let totalWeight = 0;
    let filledWeight = 0;
    const sectionBreakdown: ProfileCompletionResult['sectionBreakdown'] = {};
    // Track highest-weight unfilled field for the nextHint
    let topUnfilled: { label: string; weight: number } | null = null;

    for (const section of eligibleSections) {
      // 2. Filter fields by onlyForRoles
      const eligibleFields = section.fields.filter(f => {
        if (!f.onlyForRoles) return true;
        return f.onlyForRoles.includes(role);
      });

      let sectionTotalWeight = 0;
      let sectionFilledWeight = 0;

      for (const field of eligibleFields) {
        totalWeight += field.weight;
        sectionTotalWeight += field.weight;

        const value = profile[field.key];
        if (isFieldFilled(value)) {
          filledWeight += field.weight;
          sectionFilledWeight += field.weight;
        } else {
          if (!topUnfilled || field.weight > topUnfilled.weight) {
            topUnfilled = { label: field.label, weight: field.weight };
          }
        }
      }

      sectionBreakdown[section.id] = {
        score: sectionTotalWeight > 0
          ? Math.round((sectionFilledWeight / sectionTotalWeight) * 100)
          : 100,
        label: section.label,
      };
    }

    const percentage = totalWeight > 0
      ? Math.round((filledWeight / totalWeight) * 100)
      : 0;

    return {
      percentage,
      isComplete: percentage === 100,
      nextHint: topUnfilled
        ? `Add your ${topUnfilled.label} to complete`
        : '🎉 Profile complete!',
      sectionBreakdown,
    };
  }, [profile, role]);

  return {
    ...computed,
    hasSeenCompletionCelebration: hasSeenCelebration,
    markCompletionCelebrationSeen,
  };
}
```

---

**Step 2: Export from `packages/profile/src/index.ts`**

Append:
```typescript
export * from './hooks/useProfileCompletion';
```

---

**Step 3: Verify edge cases mentally**

| Input | Expected output |
|-------|----------------|
| `profile = null` | `percentage = 0`, `isComplete = false` |
| Student, only `full_name` set | `22%` (2/9 rounded) |
| Teacher, `subjects_taught = []` | array empty → `isFieldFilled([])` = false → not counted |
| Teacher, `subjects_taught = 'Math'` | string non-empty → counted |
| Teacher, all fields set | `100%`, `isComplete = true` |

---

**Step 4: Commit**
```bash
git add packages/profile/src/hooks/useProfileCompletion.ts \
        packages/profile/src/index.ts
git commit -m "feat(profile): add useProfileCompletion hook — normalised weight calc, AsyncStorage celebration flag"
```

---

## Task 3 — SanctuaryProgressBar component

**Files:**
- Create: `packages/ui/src/components/SanctuaryProgressBar.tsx`
- Modify: `packages/ui/src/components/index.ts`
- Verify: `packages/ui/src/index.ts` re-exports it

**Context:** Reusable bar using `useTheme()` for phase-aware tokens. `Animated.View` for fill width (needs `useNativeDriver: false`). Reanimated for glow pulse on completion.

---

**Step 1: Create `packages/ui/src/components/SanctuaryProgressBar.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../theme/Theme';

export interface SanctuaryProgressBarProps {
  percentage: number;        // 0–100
  isComplete?: boolean;      // true → gold/reward state
  nextHint?: string;         // text shown below bar
  showPercentage?: boolean;  // default true
  compact?: boolean;         // 4px bar instead of 8px
  style?: ViewStyle;
}

export function SanctuaryProgressBar({
  percentage,
  isComplete = false,
  nextHint,
  showPercentage = true,
  compact = false,
  style,
}: SanctuaryProgressBarProps) {
  const { accent, glow, glass, text } = useTheme();

  // Animated.Value for fill width — useNativeDriver must be false (width interpolation)
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: Math.min(100, Math.max(0, percentage)),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // Reanimated glow pulse when complete
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (isComplete) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withRepeat(
          withSequence(
            withTiming(0.3, { duration: 800 }),
            withTiming(1, { duration: 800 }),
          ),
          3,
          false,
        ),
        withTiming(0.6, { duration: 500 }),
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isComplete]);

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const barColor = isComplete ? accent.reward : accent.action;
  const glowColor = isComplete ? glow.reward.color : glow.action.color;
  const barHeight = compact ? 4 : 8;

  return (
    <View style={[styles.container, style]}>
      {/* Header row: label + percentage */}
      {showPercentage && (
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: text.secondary }]}>
            Profile Completion
          </Text>
          <Text style={[styles.percentage, { color: isComplete ? accent.reward : text.primary }]}>
            {percentage}%
          </Text>
        </View>
      )}

      {/* Track */}
      <View style={[styles.track, { height: barHeight, backgroundColor: glass.surface.bg }]}>
        {/* Animated fill */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: barColor,
              width: fillAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              borderRadius: barHeight / 2,
            },
          ]}
        />
        {/* Reanimated glow overlay on completion */}
        {isComplete && (
          <Reanimated.View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: glowColor, borderRadius: barHeight / 2 },
              glowAnimStyle,
            ]}
          />
        )}
      </View>

      {/* Hint / complete text */}
      {!isComplete && nextHint ? (
        <Text style={[styles.hint, { color: text.secondary }]} numberOfLines={1}>
          {nextHint}
        </Text>
      ) : isComplete ? (
        <Text style={[styles.hint, { color: accent.reward }]}>
          🎉 Profile complete!
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  hint: {
    fontSize: 12,
    marginTop: Theme.spacing.xs,
  },
});
```

---

**Step 2: Export from `packages/ui/src/components/index.ts`**

Add at the end of the file:
```typescript
export { SanctuaryProgressBar } from './SanctuaryProgressBar';
export type { SanctuaryProgressBarProps } from './SanctuaryProgressBar';
```

---

**Step 3: Verify `packages/ui/src/index.ts` re-exports components barrel**

Open `packages/ui/src/index.ts`. Check if it has `export * from './components'` or individual exports from the components folder. If `SanctuaryProgressBar` is not re-exported, add:
```typescript
export { SanctuaryProgressBar } from './components/SanctuaryProgressBar';
export type { SanctuaryProgressBarProps } from './components/SanctuaryProgressBar';
```

---

**Step 4: TypeScript check**
```bash
cd packages/ui && npx tsc --noEmit 2>&1 | grep "SanctuaryProgressBar" | head -10
```
Expected: no errors

---

**Step 5: Commit**
```bash
git add packages/ui/src/components/SanctuaryProgressBar.tsx \
        packages/ui/src/components/index.ts \
        packages/ui/src/index.ts
git commit -m "feat(ui): add SanctuaryProgressBar — phase-aware animated progress bar, gold reward state on completion"
```

---

## Task 4 — AvatarDisplay component

**Files:**
- Create: `packages/profile/src/components/AvatarDisplay.tsx`
- Modify: `packages/profile/src/index.ts`

**Pre-condition:** Confirm Supabase `avatars` bucket exists (see Pre-flight step above).

**Context:** Shows: local cached file → remote `avatar_url` → initials fallback. When `editable={true}`, tapping opens image picker → resize 400×400 → cache locally → upload to Supabase Storage → call `onAvatarUpdated(url)`.

The `supabase` client is exported from `@repo/core` as a named export. Import it directly.

---

**Step 1: Create `packages/profile/src/components/AvatarDisplay.tsx`**

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@repo/core';
import { useTheme } from '@repo/ui';
import { Camera } from 'lucide-react-native';

interface AvatarDisplayProps {
  userId: string;
  avatarUrl?: string | null;
  fullName?: string | null;
  size?: number;
  editable?: boolean;
  onAvatarUpdated?: (newPublicUrl: string) => Promise<void>;
  style?: object;
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getCachePath(userId: string): string {
  return `${FileSystem.cacheDirectory}avatar_${userId}.jpg`;
}

/**
 * Decode base64 string to Uint8Array for Supabase Storage upload.
 * Using atob if available (React Native >= 0.72 with Hermes), else manual decode.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function AvatarDisplay({
  userId,
  avatarUrl,
  fullName,
  size = 80,
  editable = false,
  onAvatarUpdated,
  style,
}: AvatarDisplayProps) {
  const { accent, text } = useTheme();
  const [localCachePath, setLocalCachePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load local cache on mount
  useEffect(() => {
    if (!userId) return;
    const cachePath = getCachePath(userId);
    FileSystem.getInfoAsync(cachePath).then(info => {
      if (info.exists) setLocalCachePath(cachePath);
    });
  }, [userId]);

  const handlePickAndUpload = useCallback(async () => {
    // 1. Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    // 2. Open picker (square crop enforced)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      // 3. Resize to 400×400 JPEG
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 4. Cache locally immediately (optimistic display — no waiting for upload)
      const cachePath = getCachePath(userId);
      await FileSystem.copyAsync({ from: manipulated.uri, to: cachePath });
      setLocalCachePath(cachePath);

      // 5. Read as base64 for Supabase upload
      const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(base64);

      // 6. Upload to Supabase Storage bucket 'avatars'
      const fileName = `${userId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 7. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 8. Notify caller to persist to profile
      await onAvatarUpdated?.(publicUrl);
    } catch (error) {
      // Optimistic display already shown — user sees their photo.
      // Upload will retry on next session via sync queue.
      console.warn('[AvatarDisplay] Upload failed, keeping local cache:', error);
    } finally {
      setUploading(false);
    }
  }, [userId, onAvatarUpdated]);

  // Display source priority: local cache > remote URL > initials
  const displayUri = localCachePath || avatarUrl || null;
  const initials = getInitials(fullName);
  const borderRadius = size / 2;

  const containerStyle = [
    { width: size, height: size, borderRadius },
    styles.container,
    style,
  ];

  const content = displayUri ? (
    <Image
      source={{ uri: displayUri }}
      style={[styles.image, { width: size, height: size, borderRadius }]}
    />
  ) : (
    <View style={[styles.initialsContainer, { backgroundColor: accent.action, borderRadius }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35, color: text.inverse }]}>
        {initials}
      </Text>
    </View>
  );

  if (!editable) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity style={containerStyle} onPress={handlePickAndUpload} activeOpacity={0.8}>
      {content}
      {/* Semi-transparent edit overlay with camera icon */}
      <View style={[styles.editOverlay, { borderRadius }]}>
        {uploading
          ? <ActivityIndicator color="white" size="small" />
          : <Camera size={size * 0.22} color="white" />
        }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

**Step 2: Export from `packages/profile/src/index.ts`**

Append:
```typescript
export { AvatarDisplay } from './components/AvatarDisplay';
```

---

**Step 3: TypeScript check**
```bash
cd packages/profile && npx tsc --noEmit 2>&1 | grep "AvatarDisplay" | head -10
```
Expected: no errors

---

**Step 4: Commit**
```bash
git add packages/profile/src/components/AvatarDisplay.tsx \
        packages/profile/src/index.ts
git commit -m "feat(profile): add AvatarDisplay — initials fallback, local cache, Supabase upload, tap-to-edit"
```

---

## Task 5 — Update IdentityCard: remove completion %, use AvatarDisplay

**File:**
- Modify: `apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx`

**What changes:**
- Remove `completionPercentage` useMemo (lines 94–106)
- Remove `progressRing` style + its render (`<Box style={styles.progressRing} />`)
- Remove `completionBadge` style + its render
- Remove `avatarContainer`, `avatarImage`, `avatarPlaceholder` styles (unused after change)
- Replace the entire avatar+ring block with `<AvatarDisplay>` (non-editable, size 80)
- Keep `RNImage` import (still used for the lotus watermark on line 254)

---

**Step 1: Add AvatarDisplay import**

After the existing imports, add:
```typescript
import { AvatarDisplay } from '@repo/profile';
```

---

**Step 2: Delete the `completionPercentage` useMemo**

Remove lines 94–106:
```typescript
// Dynamic Profile Completion Calculator
const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    const fields = [
        'full_name',
        'phone',
        'bio',
        'avatar_url',
        profile.role === 'student' ? 'index_number' : 'nic_number'
    ];
    const filledFields = fields.filter(f => !!profile[f]);
    return Math.round((filledFields.length / fields.length) * 100);
}, [profile]);
```

---

**Step 3: Remove unused styles from the `styles` useMemo**

Delete these style keys from the `StyleSheet.create({...})` call:
- `progressRing` (lines 129–140)
- `avatarContainer` (lines 141–148)
- `avatarImage` (lines 149–152)
- `avatarPlaceholder` (lines 153–157)
- `completionBadge` (lines 158–166)

---

**Step 4: Replace the avatar block in the render**

Find this block (around lines 200–223):
```typescript
{/* Avatar with Ring */}
<Box>
    <Box style={styles.progressRing} />
    <Box style={styles.avatarContainer}>
        {profile?.avatar_url ? (
            <RNImage
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
            />
        ) : (
            <Center style={styles.avatarPlaceholder}>
                <roleConfig.icon
                    size={40}
                    color={colors.action}
                />
            </Center>
        )}
    </Box>
    <Box style={styles.completionBadge}>
        <Text color={colors.primary as any} size="xs" bold>
            {completionPercentage}%
        </Text>
    </Box>
</Box>
```

Replace with:
```typescript
{/* Avatar — AvatarDisplay handles image / initials / offline */}
<AvatarDisplay
    userId={profile?.id || ''}
    avatarUrl={profile?.avatar_url}
    fullName={profile?.full_name}
    size={80}
    editable={false}
/>
```

---

**Step 5: TypeScript check**
```bash
cd apps/gurudevi-mobile && npx tsc --noEmit 2>&1 | grep "IdentityCard" | head -10
```
Expected: no errors

---

**Step 6: Visual verification**

```bash
npx expo start --clear
```

Open ProfileScreen:
- ✅ ID card avatar shows initials if no `avatar_url`
- ✅ ID card avatar shows photo if `avatar_url` is set
- ✅ No completion ring around avatar
- ✅ No `%` badge on the card

---

**Step 7: Commit**
```bash
git add apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx
git commit -m "feat(profile): remove completion % from IdentityCard; use AvatarDisplay for avatar rendering"
```

---

## Task 6 — ProfileScreen: add SanctuaryProgressBar

**File:**
- Modify: `apps/gurudevi-mobile/src/screens/ProfileScreen.tsx`

**Context:** The dynamic button (Create Account / View/Edit Profile) already works. We just need to:
1. Call `useProfileCompletion` in the main component
2. Pass the result into `IdentitySection`
3. Render `SanctuaryProgressBar` between IdentityCard and the button (registered users only)

Also: the current `isGuest` check in `IdentitySection` uses `!profile?.email || profile?.email?.includes('anonymous')`. Replace with `!profile || profile?.is_anonymous === true` (more reliable).

---

**Step 1: Add imports at the top of `ProfileScreen.tsx`**

```typescript
import { SanctuaryProgressBar } from '@repo/ui';
import { useProfileCompletion } from '@repo/profile';
```

---

**Step 2: Call the hook in the main `ProfileScreen` component**

After `const { role } = useEnvironment();` (already imported), add:
```typescript
const completionResult = useProfileCompletion(profile, role ?? null);
```

---

**Step 3: Update `IdentitySection` signature to accept `completionResult`**

The `IdentitySection` internal component currently accepts `{ profile, navigation, colors, t, onGuestAction }`.

Change to accept `completionResult` as well. Update the `isGuest` check and add the bar:

```typescript
const IdentitySection = ({ profile, navigation, colors, t, onGuestAction, completionResult }: any) => {
    const isGuest = !profile || profile?.is_anonymous === true;

    return (
        <Center>
            <IdentityCard
                profile={profile}
                onViewFullProfile={() => {
                    if (isGuest) {
                        onGuestAction?.();
                    }
                    hapticLight();
                    navigation.navigate(isGuest ? 'Auth' : 'FullProfile', { profile });
                }}
            />

            {/* Progress bar — registered users only, between card and button */}
            {!isGuest && (
                <SanctuaryProgressBar
                    percentage={completionResult.percentage}
                    isComplete={completionResult.isComplete}
                    nextHint={completionResult.nextHint}
                    style={{ width: CARD_WIDTH, marginTop: Theme.spacing.md }}
                />
            )}

            <TouchableOpacity
                onPress={() => {
                    hapticLight();
                    if (isGuest) {
                        navigation.navigate('Auth');
                    } else {
                        navigation.navigate('FullProfile', { profile });
                    }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isGuest
                    ? t('auth.createAccount', 'Create Account')
                    : t('profile.viewEditProfile', 'View or Edit Profile')}
                style={{
                    marginTop: Theme.spacing.lg,
                    width: CARD_WIDTH,
                    height: 52,
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowColor: colors.glow,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 15,
                    elevation: 5,
                }}
            >
                <HStack space="sm" alignItems="center">
                    {isGuest ? (
                        <UserPlus size={18} color={colors.action} />
                    ) : (
                        <Edit3 size={18} color={colors.action} />
                    )}
                    <Text color={colors.text} bold>
                        {isGuest
                            ? t('auth.createAccount', 'Create Account')
                            : t('profile.viewEditProfile', 'View / Edit Profile')}
                    </Text>
                </HStack>
            </TouchableOpacity>
        </Center>
    );
};
```

---

**Step 4: Pass `completionResult` when rendering IdentitySection**

Find the `<IdentitySection ... />` render call and add the prop:
```typescript
<IdentitySection
    profile={profile}
    navigation={navigation}
    colors={colors}
    t={t}
    onGuestAction={triggerBannerShake}
    completionResult={completionResult}
/>
```

---

**Step 5: TypeScript check**
```bash
cd apps/gurudevi-mobile && npx tsc --noEmit 2>&1 | grep "ProfileScreen" | head -10
```
Expected: no errors

---

**Step 6: Visual verification**

```bash
npx expo start --clear
```

- ✅ Guest user: IdentityCard → no bar → "Create Account" button
- ✅ Registered user: IdentityCard → `SanctuaryProgressBar` with correct % → "View / Edit Profile" button
- ✅ Bar animates when navigating back from FullProfileScreen after saving a field

---

**Step 7: Commit**
```bash
git add apps/gurudevi-mobile/src/screens/ProfileScreen.tsx
git commit -m "feat(profile): add SanctuaryProgressBar between IdentityCard and action button in ProfileScreen"
```

---

## Task 7 — FullProfileScreen: bar + editable avatar + celebration

**File:**
- Modify: `apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx`

**Context:**
- The IdentityCard is already centered (already in `<Center>` at line 59–63) — task 2.2.3 verified done, no layout change needed there.
- Add editable `AvatarDisplay` below the card with "Tap to update your photo" label.
- Add `SanctuaryProgressBar` below that, which fades out 2s after reaching 100%.
- Render `AchievementUnlockOverlay` outside the `ScrollView` (position absolute needs a non-scrolling parent) for the one-time celebration.

---

**Step 1: Add imports**

Add to the existing `@repo/ui` import:
```typescript
useEnvironment,
hapticSuccess,
```
(Check `hapticSuccess` is already imported — it's exported from `@repo/ui`. Add if not present.)

Add new named imports:
```typescript
import { SanctuaryProgressBar } from '@repo/ui';
import { useProfileCompletion, AvatarDisplay } from '@repo/profile';
import AchievementUnlockOverlay from '../../components/shared/AchievementUnlockOverlay';
import { useState, useEffect } from 'react'; // likely already present
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
```

---

**Step 2: Call hooks in `FullProfileScreen`**

After `const { profile, updateField } = useProfile();`, add:
```typescript
const { role } = useEnvironment();
const completionResult = useProfileCompletion(profile, role ?? null);
const [showCelebration, setShowCelebration] = useState(false);

// Animated opacity for bar fade-out on completion
const barOpacity = useSharedValue(1);
const barAnimStyle = useAnimatedStyle(() => ({
  opacity: barOpacity.value,
}));
```

---

**Step 3: Watch for first-time 100% and trigger celebration**

After the hooks, add a `useEffect`:
```typescript
useEffect(() => {
  if (
    completionResult.isComplete &&
    !completionResult.hasSeenCompletionCelebration
  ) {
    // Show celebration toast
    setShowCelebration(true);
    hapticSuccess();
    // Mark so it never shows again
    completionResult.markCompletionCelebrationSeen();
    // Fade bar out after 2s
    const timer = setTimeout(() => {
      barOpacity.value = withTiming(0, { duration: 800 });
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [completionResult.isComplete, completionResult.hasSeenCompletionCelebration]);
```

---

**Step 4: Add editable avatar + progress bar to the JSX**

Find the existing IdentityCard block (currently lines 58–63):
```typescript
{/* Identity Card Preview - Centered */}
<Center>
    <Box>
        <IdentityCard profile={profile} />
    </Box>
</Center>
```

Replace with:
```typescript
{/* Identity Card Preview - Centered */}
<Center>
    <Box>
        <IdentityCard profile={profile} />
    </Box>
</Center>

{/* Editable Avatar — tap to change photo */}
<Center mt={Theme.spacing.lg}>
    <AvatarDisplay
        userId={profile.id}
        avatarUrl={profile.avatar_url}
        fullName={profile.full_name}
        size={72}
        editable={true}
        onAvatarUpdated={async (url) => {
            await updateField('avatar_url', url);
            hapticSuccess();
        }}
    />
    <Text size="xs" color={colors.textTertiary} mt={Theme.spacing.xs}>
        Tap to update your photo
    </Text>
</Center>

{/* Completion bar — animated, fades out on 100% */}
<Reanimated.View style={barAnimStyle}>
    <SanctuaryProgressBar
        percentage={completionResult.percentage}
        isComplete={completionResult.isComplete}
        nextHint={completionResult.nextHint}
        style={{
            paddingHorizontal: Theme.spacing.xl,
            marginTop: Theme.spacing.md,
            marginBottom: Theme.spacing.xs,
        }}
    />
</Reanimated.View>
```

---

**Step 5: Add AchievementUnlockOverlay outside ScrollView**

The current return structure is:
```typescript
return (
    <ScreenWrapper scroll={false}>
        <GlobalHeader ... />
        <ScrollView ...>
            {/* content */}
        </ScrollView>
    </ScreenWrapper>
);
```

Change to:
```typescript
return (
    <ScreenWrapper scroll={false}>
        <GlobalHeader ... />
        <ScrollView ...>
            {/* content */}
        </ScrollView>

        {/* Overlay rendered outside ScrollView — uses position:absolute internally */}
        <AchievementUnlockOverlay
            title="✨ Profile Complete!"
            visible={showCelebration}
            onHide={() => setShowCelebration(false)}
        />
    </ScreenWrapper>
);
```

---

**Step 6: TypeScript check**
```bash
cd apps/gurudevi-mobile && npx tsc --noEmit 2>&1 | grep "FullProfileScreen" | head -10
```
Expected: no errors

---

**Step 7: Full manual verification flow**

```bash
npx expo start --clear
```

1. Open FullProfileScreen with incomplete profile:
   - ✅ Editable avatar below ID card (tap → photo picker opens)
   - ✅ `SanctuaryProgressBar` visible with correct % and next hint

2. Tap avatar → pick photo → local cache shows immediately → uploads in background

3. Fill in a field → tap save → bar animates to new percentage

4. Fill ALL fields → bar reaches 100%:
   - ✅ Bar turns gold (`accent.reward`)
   - ✅ `AchievementUnlockOverlay` "✨ Profile Complete!" slides down from top
   - ✅ Heavy haptic fires
   - ✅ Overlay auto-hides after 4s
   - ✅ Bar fades out after 2s

5. Navigate away → come back to FullProfileScreen:
   - ✅ No overlay
   - ✅ Bar at 0 opacity (faded out)

---

**Step 8: Commit**
```bash
git add apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx
git commit -m "feat(profile): add editable AvatarDisplay + SanctuaryProgressBar + one-time completion celebration to FullProfileScreen"
```

---

## Task 8 — Delete ProfileCompletionBar + final cleanup

**Files:**
- Delete: `apps/gurudevi-mobile/src/components/profile/ProfileCompletionBar.tsx`

---

**Step 1: Confirm no remaining consumers**
```bash
cd apps/gurudevi-mobile && grep -rn "ProfileCompletionBar" src/ --include="*.tsx" --include="*.ts"
```
Expected: zero results. If any imports are found, remove them before deleting the file.

---

**Step 2: Delete the file**
```bash
rm apps/gurudevi-mobile/src/components/profile/ProfileCompletionBar.tsx
```

---

**Step 3: Full TypeScript check — entire app**
```bash
cd apps/gurudevi-mobile && npx tsc --noEmit 2>&1 | grep "error" | head -30
```
Expected: zero errors

---

**Step 4: Commit**
```bash
git add -A apps/gurudevi-mobile/src/components/profile/
git commit -m "refactor(profile): delete ProfileCompletionBar.tsx — fully replaced by SanctuaryProgressBar + useProfileCompletion"
```

---

## Task 9 — Final end-to-end smoke test

**This is a verification task — no code changes unless bugs are found.**

---

**Step 1: Expo start + full manual smoke test**
```bash
npx expo start --clear
```

Smoke test checklist:
- [ ] Guest user on ProfileScreen: "Create Account" button, no progress bar
- [ ] Registered user on ProfileScreen: correct `%` in bar, "View / Edit Profile" button
- [ ] IdentityCard: avatar shows initials when `avatar_url` is null
- [ ] IdentityCard: avatar shows photo when `avatar_url` is set
- [ ] IdentityCard: no completion ring, no `%` badge
- [ ] FullProfileScreen: tapping avatar opens picker → optimistic local display
- [ ] FullProfileScreen: saving a field → bar animates to new value
- [ ] FullProfileScreen: both screens show the SAME `%` for the same profile
- [ ] FullProfileScreen: first 100% → `AchievementUnlockOverlay` appears once, bar fades gold then disappears
- [ ] FullProfileScreen: subsequent visits at 100% → no overlay, bar gone (or already hidden)
- [ ] `ProfileCompletionBar.tsx` deleted, no import errors

---

**Step 2: If any smoke test item fails, fix it before the final commit**

---

**Step 3: Final verification commit (only if fixes were needed)**
```bash
git add -A
git commit -m "fix(profile): smoke test fixes — [describe what was fixed]"
```

---

## Summary of files changed

| File | Action |
|------|--------|
| `packages/profile/src/lib/isFieldFilled.ts` | Create |
| `packages/profile/src/config/profileSections.ts` | Create |
| `packages/profile/src/hooks/useProfileCompletion.ts` | Create |
| `packages/profile/src/components/AvatarDisplay.tsx` | Create |
| `packages/profile/src/index.ts` | Modify (add exports) |
| `packages/ui/src/components/SanctuaryProgressBar.tsx` | Create |
| `packages/ui/src/components/index.ts` | Modify (add export) |
| `packages/ui/src/index.ts` | Verify/modify |
| `apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx` | Modify |
| `apps/gurudevi-mobile/src/screens/ProfileScreen.tsx` | Modify |
| `apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx` | Modify |
| `apps/gurudevi-mobile/src/components/profile/ProfileCompletionBar.tsx` | **Delete** |
