# Week 4 Tasks — gurudevi-mobile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Implement every remaining unchecked item in `apps/gurudevi-mobile/docs/current_progress/4th_week/tasks.md`.

**Architecture:** Turbo monorepo. App: `apps/gurudevi-mobile/`. Shared packages: `packages/{classroom,community,core,library,profile,self,scanner-kit,ui}/`. All design tokens in `packages/ui/src/theme/Theme.ts`. Supabase backend, React Query v5, Zustand, Reanimated 2, React Navigation v7, i18next, GlueStack UI, PostHog, Sentry. React Navigation v8 is being evaluated separately and is not the default runtime yet.

**Tech Stack:** React Native (Expo SDK 51), TypeScript strict, Supabase Realtime, React Query infinite queries, `react-native-reanimated` v3, `@gluestack-ui/themed`.

**Already done (skip):** 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.2.1, 5.2.1, 5.2.2, 5.2.3, 10.3.1, 2.1.5, 10.3.2, 2.2.2, 3, 2.2.3, 2.3, 2.4, 2.5, 2.6

> **Session 1 (P0+P1+P2) completed:**
> - **10.3.1** — PostHog already nested inside NavigationContainer in App.tsx.
> - **2.1.5** — `useProfileCompletion`, `profileSections.ts`, `AvatarDisplay`, `SanctuaryProgressBar` all implemented.
> - **2.2.2** — `UserAvatar` in @repo/ui (display-only, no circular dep). GlobalHeader uses it.
> - **10.3.2** — CommunityScreen chips migrated to `HorizontalChipRow` (FlatList-backed).
> - **3** — `SanctuaryChip`, `HorizontalChipRow`, `SanctuaryCarousel` created in @repo/ui.
> - **2.2.3** — FullProfileScreen IdentityCard already inside `<Center>` (confirmed done).
> - **2.3** — IdentityCard + AchievementGallery hardcoded colors/sizes → Theme tokens. SanctuaryStatsCard marginBottom fixed.
> - **2.4** — ProfileScreen already had all FadeInDown staggered animations (confirmed done).
> - **2.5** — Both stat cards already use `Theme.spacing.xl` padding (confirmed done).
> - **2.6** — `LogoutModal` created in @repo/ui (replaces `Alert.alert` in ProfileScreen). `DeleteAccountModal` redesigned with Theme token colors + school-data-retention message (2.6.1).

---

## Execution Order (priority → sequence)

```
P0  Bugs        → Tasks 10.3.1 ✅, 10.3.2 ✅
P1  Foundation  → Tasks 2.2.2 ✅, 2.1.5 ✅, 3 ✅
P2  Profile     → Tasks 2.2.3 ✅, 2.3 ✅, 2.4 ✅, 2.5 ✅, 2.6 ✅
P3  Header/Self → Tasks 6.1, 6.2, 8.1, 8.2, 8.3, Task 1
P4  Community   → Tasks 5.1.1, 5.2.4, 5.2.5
P5  Library     → Tasks 4.1, 4.2, 4.3, 4.4
P6  Classroom   → Tasks 9.11, 9.9, 9.1, 9.2, 9.5, 9.6, 9.8, 9.12, 9.13, 9.3, 9.4, 9.7, 9.10
P7  UX Polish   → Tasks 7.1, 10.1, 10.2, 13.1, 13.2, 13.3, 14, 15
P8  Infra       → Tasks 11, 12, 16, 17
```

---

## Phase 0 — Bug Fixes (unblocks clean console)

### Task 10.3.1 — Fix PostHog useNavigationState Error

**Root cause:** `posthog-react-native` auto-captures navigation events by calling `useNavigationState` — but `PostHogProvider` is rendered *outside* `NavigationContainer` in `App.tsx`, so it has no navigation context.

**Files:**
- Modify: `apps/gurudevi-mobile/App.tsx`

**Steps:**

1. Open `apps/gurudevi-mobile/App.tsx`. Find how `NavigationContainer` and `PostHogProvider` are nested.

2. Create a navigation ref above the component:
```typescript
import { createNavigationContainerRef } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();
```

3. Pass ref to `NavigationContainer`:
```typescript
<NavigationContainer ref={navigationRef}>
```

4. Move `PostHogProvider` so it is **inside** `NavigationContainer` (PostHog needs navigation context), OR pass `autocapture={{ navigation: false }}` if you want to disable PostHog's nav tracking entirely:
```typescript
// Option A — keep nav tracking, fix nesting:
<NavigationContainer ref={navigationRef}>
  <PostHogProvider apiKey={...} options={...}>
    <AppNavigator />
  </PostHogProvider>
</NavigationContainer>

// Option B — disable nav autocapture (simpler):
<PostHogProvider apiKey={...} options={{ autocapture: { navigation: false } }}>
  <NavigationContainer ref={navigationRef}>
    <AppNavigator />
  </NavigationContainer>
</PostHogProvider>
```
**Use Option A** (preserves screen tracking).

5. Run app in Expo Go. Confirm `useNavigationState` error no longer appears in console.

6. Commit:
```bash
git add apps/gurudevi-mobile/App.tsx
git commit -m "fix: move PostHogProvider inside NavigationContainer to resolve useNavigationState error"
```

---

### Task 10.3.2 — Fix VirtualizedList Nesting Warnings

**Root cause:** `CommunityScreen.tsx` renders a horizontal `ScrollView` of filter chips inside `FlatList`'s `ListHeaderComponent`. `LibraryScreen.tsx` has a similar pattern. React Native warns when FlatList (a VirtualizedList) is nested inside a plain ScrollView with the same axis.

**Files:**
- Modify: `packages/community/src/screens/CommunityScreen.tsx` (~lines 99–140)
- Modify: `packages/library/src/screens/LibraryScreen.tsx` (header section)

**Steps:**

1. In `CommunityScreen.tsx`, find `renderFeedFilterChips` (or equivalent). Replace the `ScrollView` wrapping the chips with a **horizontal `FlatList`**:
```typescript
// BEFORE
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {chips.map(chip => <ChipComponent key={chip.value} {...chip} />)}
</ScrollView>

// AFTER
<FlatList
  horizontal
  data={chips}
  keyExtractor={item => item.value}
  renderItem={({ item }) => <ChipComponent {...item} />}
  showsHorizontalScrollIndicator={false}
/>
```

2. Apply the same fix to `LibraryScreen.tsx` wherever a `ScrollView` wraps chips or category pills inside a `FlatList`'s header.

3. Verify no more VirtualizedList warnings in console. Test scroll behavior on both screens.

4. Commit:
```bash
git add packages/community/src/screens/CommunityScreen.tsx \
        packages/library/src/screens/LibraryScreen.tsx
git commit -m "fix: replace ScrollView with horizontal FlatList in chip headers to resolve VirtualizedList nesting warnings"
```

---

## Phase 1 — Foundation Components

### Task 2.2.2 — UserAvatar Component (default avatar everywhere)

**Context:** No `UserAvatar` component exists. `IdentityCard` shows a blank circle when `avatar_url` is null. The avatar must show: profile photo → initials → role icon fallback.

**Files:**
- Create: `packages/profile/src/components/UserAvatar.tsx`
- Modify: `apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx` (use UserAvatar)
- Modify: `packages/ui/src/components/GlobalHeader.tsx` (use UserAvatar)
- Export from: `packages/profile/src/index.ts`

**Steps:**

1. Create `packages/profile/src/components/UserAvatar.tsx`:
```typescript
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Theme } from '@repo/ui';
import type { UserRole } from '../types';

interface UserAvatarProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  role?: UserRole;
  size?: number;
  style?: object;
}

const ROLE_ICONS: Record<string, string> = {
  teacher: '🌱', student: '📚', principal: '🏛️',
  founder: '🌸', admin: '🛡️', developer: '🛡️', default: '🌿',
};

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(name?: string | null): string {
  const colors = [
    Theme.colors.gurudeviBlue, Theme.colors.gurudeviViolet,
    Theme.colors.sanctuarySaffron, Theme.colors.sageGreen,
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl, fullName, role = 'default', size = 40, style,
}) => {
  const initials = getInitials(fullName);
  const bgColor = getAvatarColor(fullName);
  const icon = ROLE_ICONS[role] ?? ROLE_ICONS.default;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {fullName ? initials : icon}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { color: Theme.colors.sacredWhite, fontWeight: '700' },
});
```

2. In `IdentityCard.tsx`, replace the `<Image source={{ uri: profile.avatar_url }} />` (and its null guard) with:
```typescript
import { UserAvatar } from '@repo/profile';
// ...
<UserAvatar
  avatarUrl={profile.avatar_url}
  fullName={profile.full_name}
  role={profile.role}
  size={80}
/>
```

3. In `GlobalHeader.tsx`, replace the avatar `Image` with:
```typescript
import { UserAvatar } from '@repo/profile';
// In render, replace avatar Image:
<UserAvatar avatarUrl={avatarUrl} fullName={userName} size={32} />
```

4. Export from `packages/profile/src/index.ts`:
```typescript
export { UserAvatar } from './components/UserAvatar';
```

5. Verify: open Profile screen with no avatar set → see initials or role emoji. Open with avatar set → see photo. Check GlobalHeader self view.

6. Commit:
```bash
git add packages/profile/src/components/UserAvatar.tsx \
        packages/profile/src/index.ts \
        apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx \
        packages/ui/src/components/GlobalHeader.tsx
git commit -m "feat: add UserAvatar component with initials/role fallback; use in IdentityCard and GlobalHeader"
```

---

### Task 2.1.5 — Unify Profile Completion Calculation

**Context:** Two divergent implementations exist:
- `IdentityCard.tsx`: 5 fields, equal weight → `(filled/5)*100`
- `ProfileCompletionBar.tsx`: 7 fields, weighted (email 15%, avatar 20%, bio 20%, phone 15%, full_name 15%, school_id 10%, role 5%)

Both must use one hook so the ring on the ID card and the progress bar always show the same number.

**Files:**
- Create: `packages/profile/src/hooks/useProfileCompletion.ts`
- Modify: `apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx`
- Modify: `apps/gurudevi-mobile/src/components/profile/ProfileCompletionBar.tsx` (or wherever it lives)
- Export from: `packages/profile/src/index.ts`

**Steps:**

1. Create `packages/profile/src/hooks/useProfileCompletion.ts`:
```typescript
import type { UserProfile } from '../types';

interface CompletionField {
  key: keyof UserProfile;
  label: string;
  weight: number;
}

export function getCompletionFields(role?: string): CompletionField[] {
  return [
    { key: 'full_name',  label: 'Full Name',    weight: 15 },
    { key: 'email',      label: 'Email',         weight: 10 },
    { key: 'avatar_url', label: 'Profile Photo', weight: 20 },
    { key: 'bio',        label: 'Bio',           weight: 20 },
    { key: 'phone',      label: 'Phone',         weight: 15 },
    { key: 'school_id',  label: 'School',        weight: 10 },
    { key: role === 'student' ? 'index_number' : 'nic_number',
      label: role === 'student' ? 'Index No.' : 'NIC', weight: 10 },
  ];
}

export interface ProfileCompletion {
  percentage: number;          // 0–100 integer
  missingFields: string[];     // human-readable labels of missing fields
  completedCount: number;
  totalCount: number;
}

export function useProfileCompletion(profile: Partial<UserProfile> | null): ProfileCompletion {
  if (!profile) return { percentage: 0, missingFields: [], completedCount: 0, totalCount: 0 };

  const fields = getCompletionFields(profile.role);
  let earnedWeight = 0;
  let totalWeight = 0;
  const missingFields: string[] = [];
  let completedCount = 0;

  for (const field of fields) {
    totalWeight += field.weight;
    const value = profile[field.key];
    const filled = value !== null && value !== undefined && value !== '';
    if (filled) {
      earnedWeight += field.weight;
      completedCount++;
    } else {
      missingFields.push(field.label);
    }
  }

  return {
    percentage: Math.round((earnedWeight / totalWeight) * 100),
    missingFields,
    completedCount,
    totalCount: fields.length,
  };
}
```

2. In `IdentityCard.tsx`, remove the local `calculateCompletion` function. Import and use the hook:
```typescript
import { useProfileCompletion } from '@repo/profile';
// ...
const { percentage } = useProfileCompletion(profile);
// Use `percentage` for the ring indicator
```

3. In `ProfileCompletionBar.tsx`, remove the local weighted calculation. Import and use:
```typescript
import { useProfileCompletion } from '@repo/profile';
// ...
const { percentage, missingFields } = useProfileCompletion(userProfile);
```

4. Export from `packages/profile/src/index.ts`:
```typescript
export { useProfileCompletion, getCompletionFields } from './hooks/useProfileCompletion';
```

5. Verify: fill in fields one by one → ID card ring % and progress bar % always match.

6. Commit:
```bash
git add packages/profile/src/hooks/useProfileCompletion.ts \
        packages/profile/src/index.ts \
        apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx \
        apps/gurudevi-mobile/src/components/profile/ProfileCompletionBar.tsx
git commit -m "feat: unify profile completion into useProfileCompletion hook — IdentityCard ring and ProgressBar now always agree"
```

---

### Task 3 — DRY Horizontal Chips / Carousel / Buttons

**Context:** Chips and horizontal scroll carousels are re-implemented independently in Community, Library, and Classroom. Buttons also diverge. Centralise all three in `packages/ui`.

**Files:**
- Create: `packages/ui/src/components/SanctuaryChip.tsx`
- Create: `packages/ui/src/components/HorizontalChipRow.tsx`
- Create: `packages/ui/src/components/SanctuaryCarousel.tsx`
- Modify: `packages/ui/src/components/SanctuaryButton.tsx` (audit for variants)
- Export from: `packages/ui/src/index.ts`
- Replace usages in: Community, Library, Classroom chip/carousel instances

**Steps:**

1. Create `packages/ui/src/components/SanctuaryChip.tsx`:
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';

interface SanctuaryChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filter' | 'tag' | 'category';
  size?: 'sm' | 'md';
}

export const SanctuaryChip: React.FC<SanctuaryChipProps> = ({
  label, selected = false, onPress, variant = 'filter', size = 'md',
}) => {
  const isSmall = size === 'sm';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.selected,
        isSmall && styles.small,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.selectedLabel, isSmall && styles.smallLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Theme.colors.pearlGray,
    backgroundColor: 'transparent',
    marginRight: Theme.spacing.sm,
  },
  selected: {
    backgroundColor: Theme.colors.sanctuarySaffron,
    borderColor: Theme.colors.sanctuarySaffron,
  },
  small: { paddingHorizontal: Theme.spacing.sm, paddingVertical: 2 },
  label: { color: Theme.colors.pearlGray, fontSize: 13, fontWeight: '500' },
  selectedLabel: { color: Theme.colors.sacredWhite, fontWeight: '700' },
  smallLabel: { fontSize: 11 },
});
```

2. Create `packages/ui/src/components/HorizontalChipRow.tsx`:
```typescript
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SanctuaryChip } from './SanctuaryChip';

interface ChipItem { label: string; value: string }

interface HorizontalChipRowProps {
  chips: ChipItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  size?: 'sm' | 'md';
}

export const HorizontalChipRow: React.FC<HorizontalChipRowProps> = ({
  chips, selectedValue, onSelect, size = 'md',
}) => (
  <FlatList
    horizontal
    data={chips}
    keyExtractor={item => item.value}
    renderItem={({ item }) => (
      <SanctuaryChip
        label={item.label}
        selected={item.value === selectedValue}
        onPress={() => onSelect(item.value)}
        size={size}
      />
    )}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  />
);

const styles = StyleSheet.create({ container: { paddingHorizontal: 16, paddingVertical: 8 } });
```

3. Create `packages/ui/src/components/SanctuaryCarousel.tsx` (generic horizontal card scroller):
```typescript
import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';

interface SanctuaryCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  itemWidth?: number;
  gap?: number;
}

export function SanctuaryCarousel<T>({
  data, renderItem, keyExtractor, gap = Theme.spacing.md,
}: SanctuaryCarouselProps<T>) {
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => (
        <View style={{ marginRight: gap }}>{renderItem(item, index)}</View>
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: Theme.spacing.lg }}
    />
  );
}
```

4. Audit `SanctuaryButton.tsx` — ensure it has at minimum: `variant: 'primary' | 'secondary' | 'ghost' | 'danger'` and `size: 'sm' | 'md' | 'lg'`. Add missing variants using `Theme` tokens only (no hardcoded hex).

5. Export all from `packages/ui/src/index.ts`:
```typescript
export { SanctuaryChip } from './components/SanctuaryChip';
export { HorizontalChipRow } from './components/HorizontalChipRow';
export { SanctuaryCarousel } from './components/SanctuaryCarousel';
```

6. Replace existing ad-hoc chip/scroll implementations in `CommunityScreen.tsx`, `LibraryScreen.tsx`, and any classroom filter bars with `HorizontalChipRow` / `SanctuaryChip` from `@repo/ui`.

7. Commit:
```bash
git add packages/ui/src/components/SanctuaryChip.tsx \
        packages/ui/src/components/HorizontalChipRow.tsx \
        packages/ui/src/components/SanctuaryCarousel.tsx \
        packages/ui/src/index.ts
git commit -m "feat: add DRY SanctuaryChip, HorizontalChipRow, SanctuaryCarousel to @repo/ui; replace ad-hoc implementations"
```

---

## Phase 2 — Profile Polish

### Task 2.2.3 — Center-Align ID Card in FullProfileScreen

**Files:**
- Modify: `apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx`

**Steps:**

1. Find where `IdentityCard` is rendered in `FullProfileScreen.tsx`. Wrap it in a centering container:
```typescript
<View style={{ alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
  <IdentityCard profile={profile} />
</View>
```

2. Ensure the card's own `CARD_WIDTH` (= `SCREEN_WIDTH - Theme.spacing.xl * 2`) naturally centres inside the screen. No fixed left margin.

3. Verify on device: card is horizontally centred.

4. Commit:
```bash
git add apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx
git commit -m "fix: center-align IdentityCard in FullProfileScreen"
```

---

### Task 2.3 — Light Background in Profile Components

**Files:**
- Modify: `apps/gurudevi-mobile/src/screens/ProfileScreen.tsx`
- Modify: `apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx`
- Modify: `apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx`

**Steps:**

1. `2.0 rule`: Search all three files for hardcoded color strings (`'#`, `rgb`, `rgba`) using grep. List each one.

2. For each hardcoded color, replace with the nearest `Theme.colors.*` equivalent. Reference:
   - Background light → `Theme.colors.midnightBlue` or `Theme.colors.deepIndigo`
   - Card background → `Theme.colors.deepIndigo`
   - Light surface → `Theme.colors.midnightBlue`
   - Text → `Theme.colors.sacredWhite` / `Theme.colors.pearlGray`

3. For any hardcoded `padding`, `margin`, `fontSize` — replace with `Theme.spacing.*` / `Theme.typography.*`.

4. Run app, check Profile screen looks consistent with the rest of the app (no jarring light-on-dark or dark-on-light conflicts).

5. Commit:
```bash
git add apps/gurudevi-mobile/src/screens/ProfileScreen.tsx \
        apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx \
        apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx
git commit -m "fix: remove all hardcoded colors/sizes from Profile components; use Theme tokens only"
```

---

### Task 2.4 — Layout Entry Animations

**Files:**
- Modify: `apps/gurudevi-mobile/src/screens/ProfileScreen.tsx`

**Steps:**

1. Import from Reanimated:
```typescript
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
```

2. Wrap the main sections in `Animated.View` with staggered `FadeInDown` (already has delays — verify they use `Theme.motion` values):
```typescript
// IdentitySection
<Animated.View entering={FadeInDown.delay(100).duration(Theme.motion.standard)}>
  ...
</Animated.View>

// StatsSection
<Animated.View entering={FadeInDown.delay(200).duration(Theme.motion.standard)}>
  ...
</Animated.View>

// SupportSection
<Animated.View entering={FadeInDown.delay(300).duration(Theme.motion.gentle)}>
  ...
</Animated.View>
```

3. Ensure no hardcoded `100`, `200`, `300` delay ms — use `Theme.motion.instant * 1`, `* 2`, `* 3` etc., or keep as-is if already via Theme.

4. Verify animation plays on first mount and on tab switch.

5. Commit:
```bash
git add apps/gurudevi-mobile/src/screens/ProfileScreen.tsx
git commit -m "feat: add Reanimated FadeInDown entry animations to Profile screen sections"
```

---

### Task 2.5 — Stat & Achievement Card Padding

**Files:**
- Modify: `packages/ui/src/components/SanctuaryStatsCard.tsx`
- Find and modify: Achievement card component (search `packages/profile/src/components/` for AchievementGallery or AchievementCard)

**Steps:**

1. Open `SanctuaryStatsCard.tsx`. Check `paddingVertical` and `paddingHorizontal`. If less than `Theme.spacing.lg` (24px), update:
```typescript
// In card container style:
paddingVertical: Theme.spacing.lg,
paddingHorizontal: Theme.spacing.lg,
```

2. Find `AchievementGallery` or `AchievementCard` component. Apply same padding fix.

3. Ensure text inside cards has adequate `lineHeight` — minimum `1.4 × fontSize`.

4. Verify cards don't feel cramped on profile screen.

5. Commit:
```bash
git add packages/ui/src/components/SanctuaryStatsCard.tsx
git commit -m "fix: increase vertical/horizontal padding in stat and achievement cards to Theme.spacing.lg"
```

---

### Task 2.6 — Logout & Delete Account Modal

**Files:**
- Modify: `packages/ui/src/components/DeleteAccountModal.tsx`
- Create/Modify: logout confirmation modal in `apps/gurudevi-mobile/src/screens/ProfileScreen.tsx` (or extract to `packages/profile/src/components/LogoutModal.tsx`)

**Steps:**

1. Open `packages/ui/src/components/DeleteAccountModal.tsx`. Audit its styling:
   - Must use `Theme` tokens throughout (no hardcoded hex/px)
   - Background: `Theme.colors.deepIndigo` with blur overlay
   - Warning icon in `Theme.colors.emberRed`
   - Buttons: Use `SanctuaryButton` with `variant="danger"` for delete, `variant="ghost"` for cancel
   - Body text must explain what school-level data is preserved vs. deleted (task 2.6.1)

2. Add deletion scope messaging per task 2.6.1:
```typescript
// Inside DeleteAccountModal body:
<Text style={styles.warning}>
  Your personal data will be deleted. School records (attendance, grades, posts)
  are retained for institutional integrity and cannot be removed.
</Text>
```

3. For logout: check if `ProfileScreen.tsx` has a logout confirmation or calls `logout()` directly. If direct — create a `LogoutModal` pattern:
```typescript
// packages/profile/src/components/LogoutModal.tsx
// Simple confirmation modal matching DeleteAccountModal style
// Uses SanctuaryButton variant="secondary" for logout, variant="ghost" for cancel
```

4. Both modals must use `SanctuaryCard` as the modal container with `Theme.shadows.lg`.

5. Verify: Logout → modal appears → confirm → session ends. Delete → modal explains data scope → confirm → account deleted → navigates to Welcome.

6. Commit:
```bash
git add packages/ui/src/components/DeleteAccountModal.tsx \
        packages/profile/src/components/LogoutModal.tsx
git commit -m "feat: redesign logout and delete-account modals to match app design system; add data-scope explanation"
```

---

## Phase 3 — Global Header

### Task 6.1 — Avatar Spacing in Self Section Header

**Files:**
- Modify: `packages/ui/src/components/GlobalHeader.tsx`

**Steps:**

1. In `GlobalHeader.tsx`, find the `isSelfView` branch. Check spacing between avatar and the heading text. Add/fix gap:
```typescript
// In self-view header row:
<UserAvatar avatarUrl={avatarUrl} fullName={userName} size={32} style={{ marginRight: Theme.spacing.md }} />
<View>
  <Text style={styles.greeting}>{greetingText} {greetingEmoji}</Text>
  <Text style={styles.name}>{userName}</Text>
</View>
```

2. Ensure `marginRight` uses `Theme.spacing.md` (not hardcoded).

3. Commit:
```bash
git add packages/ui/src/components/GlobalHeader.tsx
git commit -m "fix: correct avatar-to-text spacing in GlobalHeader self view using Theme.spacing.md"
```

---

### Task 6.2 — Header Subtext Decision

**Decision:** Keep `subtitle` prop but make it **optional and contextual**:
- Self view: show role + school name as subtitle
- Classroom views: show class/section name
- Other tabs: omit subtitle (null/undefined → render nothing)

**Files:**
- Modify: `packages/ui/src/components/GlobalHeader.tsx`
- Modify: callers that pass hardcoded subtitle strings (grep `subtitle=` across app)

**Steps:**

1. In `GlobalHeader.tsx`, change subtitle render to:
```typescript
{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
```
(It may already do this — verify and confirm no empty string is being rendered as blank line.)

2. Audit all `<GlobalHeader subtitle="...">` calls. Remove any that pass a static string not meaningful to the user. Update dynamic ones to pull from context.

3. Commit:
```bash
git add packages/ui/src/components/GlobalHeader.tsx
git commit -m "fix: GlobalHeader subtitle is now fully optional; remove static/meaningless subtitle strings"
```

---

## Phase 4 — Self Section + Task 1 Mapping

### Task 1 — Role-Feature Mapping Document

**Files:**
- Create: `apps/gurudevi-mobile/docs/role-feature-map.md`

**Steps:**

1. Create the document with a table mapping each role to its Self section views and Community section access:

```markdown
# Role → Feature Map: Self & Community

## Self Section
| Role         | Default View        | Components shown                                          |
|--------------|---------------------|-----------------------------------------------------------|
| student      | StudentSelfView     | Timetable, MoodChecker, Assignments, Rewards              |
| teacher      | TeacherSelfView     | Timetable, MoodChecker, Classroom stats, Reflections      |
| principal    | PrincipalSelfView   | School overview, Staff moods, Feedback inbox              |
| grade_head   | GradeHeadSelfView   | Grade stats, Teacher summary                              |
| section_head | SectionHeadSelfView | Section stats, Timetable                                  |
| founder      | FounderSelfView     | Network overview, School health metrics                   |

## Community Section
| Role         | Feed | Groups | Create Post | Create Group | Chat |
|--------------|------|--------|-------------|--------------|------|
| student      | ✅   | ✅     | ✅ (w/ tag) | ✅           | ✅   |
| teacher      | ✅   | ✅     | ✅ (w/ tag) | ✅           | ✅   |
| principal    | ✅   | ✅     | ✅ (w/ tag) | ✅           | ✅   |
| founder      | ✅   | ✅     | ✅ (w/ tag) | ✅           | ✅   |
| guest        | ✅   | view   | ❌ (nudge)  | ❌ (nudge)   | ❌   |
```

2. Commit:
```bash
git add apps/gurudevi-mobile/docs/role-feature-map.md
git commit -m "docs: add role-feature map for Self and Community sections"
```

---

### Tasks 8.1, 8.2, 8.3 — Self Section Reorganisation

**Context:** `SelfScreen.tsx` routes to role-specific views. Currently mood checker dominates. Need: (8.1) change default view, (8.2) update mood checker, (8.3) reorganise layout.

**Files:**
- Modify: `apps/gurudevi-mobile/src/screens/SelfScreen.tsx`
- Find and modify: role-specific self views in `packages/self/src/` (StudentSelfView, TeacherSelfView, etc. — check `packages/self/src/screens/` or inline in the screen)

**Steps:**

1. **8.1 Default view change:** In each role view, make the first visible section (after header) a **daily summary card** — not mood checker. Mood checker moves below the summary:
   - Student: "Today's classes → Assignments due → Mood"
   - Teacher: "Classes today → Student updates → Mood"
   - Principal: "School pulse → Staff updates → Mood"

2. **8.2 Mood checker change:** Replace the current mood checker with an emoji-grid approach (5 options: 😔 😕 😐 🙂 😊). Current implementation unknown — find it and replace the UI with:
```typescript
const MOODS = [
  { emoji: '😊', label: 'Great',   value: 5 },
  { emoji: '🙂', label: 'Good',    value: 4 },
  { emoji: '😐', label: 'Okay',    value: 3 },
  { emoji: '😕', label: 'Low',     value: 2 },
  { emoji: '😔', label: 'Rough',   value: 1 },
];
// Horizontal row of large (40px) tappable emoji buttons
// Selected state: scale up + saffron border ring
```

3. **8.3 Reorganise:** In each role-specific view, the section order should be:
   1. Daily summary / stats
   2. Timetable (today's schedule)
   3. Action items (assignments, tasks)
   4. Mood checker
   5. Community presence (`CommunityPresence` component from `packages/self/src/components/CommunityPresence.tsx`)

4. Verify each role view on device (or Expo Go).

5. Commit:
```bash
git add apps/gurudevi-mobile/src/screens/SelfScreen.tsx
git commit -m "feat(self): reorganise Self section — daily summary first, emoji mood checker, timetable above actions"
```

---

## Phase 5 — Community

### Task 5.1.1 — Education Tags on Post Creation

**Context:** `CreatePostModal.tsx` has content, image picker, and group selection, but no tags. Need: taxonomy of education tags, minimum 1 tag required, tag must be added before posting.

**Files:**
- Create: `packages/community/src/constants/educationTags.ts`
- Modify: `packages/community/src/components/CreatePostModal.tsx`
- Modify: `packages/core/src/api/groups.ts` or equivalent post API (add `tags` field)

**Steps:**

1. Create `packages/community/src/constants/educationTags.ts`:
```typescript
export const EDUCATION_TAGS = [
  { value: 'lesson',       label: '📖 Lesson',       color: '#3B82F6' },
  { value: 'resource',     label: '📚 Resource',      color: '#8B5CF6' },
  { value: 'announcement', label: '📢 Announcement',  color: '#E67E22' },
  { value: 'homework',     label: '📝 Homework',      color: '#10B981' },
  { value: 'event',        label: '🎉 Event',         color: '#F59E0B' },
  { value: 'question',     label: '❓ Question',      color: '#EF4444' },
  { value: 'celebration',  label: '🌟 Celebration',   color: '#8FBC8F' },
  { value: 'reminder',     label: '⏰ Reminder',      color: '#6366F1' },
  { value: 'tip',          label: '💡 Tip',           color: '#14B8A6' },
  { value: 'discussion',   label: '💬 Discussion',    color: '#F97316' },
] as const;

export type EducationTagValue = typeof EDUCATION_TAGS[number]['value'];
```

2. In `CreatePostModal.tsx`:
   - Add `selectedTags: string[]` state, init `[]`
   - Render `HorizontalChipRow` from `@repo/ui` with `EDUCATION_TAGS` as chips (multi-select)
   - Block submit if `selectedTags.length === 0`:
```typescript
const canSubmit = content.trim().length > 0 && selectedTags.length > 0 && selectedGroup != null;
```
   - Show nudge text when 0 tags: `"Add at least one tag to share your post 🏷️"`
   - Pass `tags: selectedTags` in the post creation payload

3. Ensure `group` is required too (post must relate to a group). If no group selected, show: `"Choose a group for your post 👥"`.

4. Update post creation API call to include `tags` array.

5. Verify: cannot tap Post until ≥1 tag and a group are selected. Tags appear on rendered posts in feed.

6. Commit:
```bash
git add packages/community/src/constants/educationTags.ts \
        packages/community/src/components/CreatePostModal.tsx
git commit -m "feat(community): require education tag + group for post creation; add tag taxonomy"
```

---

### Task 5.2.4 — Group Chat (WhatsApp-style)

**Context:** No chat screen exists. Infra scaffold was marked done (5.2.2) but chat UI is not implemented. Need full real-time chat within a group using Supabase Realtime.

**Files:**
- Create: `packages/core/src/api/groupMessages.ts` (Supabase CRUD)
- Create: `packages/community/src/hooks/useGroupChat.ts` (Realtime subscription)
- Create: `packages/community/src/screens/GroupChatScreen.tsx` (UI)
- Create: `packages/community/src/components/chat/ChatBubble.tsx`
- Create: `packages/community/src/components/chat/ChatInput.tsx`
- Modify: `packages/community/src/screens/GroupDetailsScreen.tsx` (add chat tab/button)
- Modify: navigation (add GroupChatScreen route)

**Steps:**

1. **Supabase table** (if not exists — check with dev): `group_messages` table:
```sql
-- Confirm or create in Supabase dashboard:
group_messages (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid references groups(id) on delete cascade,
  user_id     uuid references auth.users(id),
  content     text not null,
  media_url   text,
  media_type  text, -- 'image' | 'audio' | null
  created_at  timestamptz default now(),
  is_deleted  boolean default false
)
-- Enable RLS: users can read messages for groups they're members of
-- Enable Realtime on this table
```

2. Create `packages/core/src/api/groupMessages.ts`:
```typescript
import { supabase } from '../lib/supabase';

export const groupMessagesAPI = {
  async fetchMessages(groupId: string, page = 0, limit = 50) {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*, profiles:user_id(full_name, avatar_url, role)')
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (error) throw error;
    return data ?? [];
  },

  async sendMessage(groupId: string, userId: string, content: string, mediaUrl?: string, mediaType?: string) {
    const { data, error } = await supabase
      .from('group_messages')
      .insert({ group_id: groupId, user_id: userId, content, media_url: mediaUrl, media_type: mediaType })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToMessages(groupId: string, callback: (msg: any) => void) {
    return supabase
      .channel(`group_chat:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`,
      }, payload => callback(payload.new))
      .subscribe();
  },
};
```

3. Create `packages/community/src/hooks/useGroupChat.ts`:
```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import { groupMessagesAPI } from '@repo/core/api';
import { useAuth } from '@repo/core/hooks'; // or wherever auth hook lives

export function useGroupChat(groupId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  // Load initial messages
  useEffect(() => {
    groupMessagesAPI.fetchMessages(groupId)
      .then(msgs => setMessages(msgs.reverse()))
      .finally(() => setLoading(false));
  }, [groupId]);

  // Realtime subscription
  useEffect(() => {
    const channel = groupMessagesAPI.subscribeToMessages(groupId, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });
    return () => { channel.unsubscribe(); };
  }, [groupId]);

  const sendMessage = useCallback(async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!user || !content.trim()) return;
    setSending(true);
    try {
      // Optimistic insert
      const optimistic = { id: `temp_${Date.now()}`, content, user_id: user.id, created_at: new Date().toISOString(), _optimistic: true };
      setMessages(prev => [...prev, optimistic]);
      await groupMessagesAPI.sendMessage(groupId, user.id, content, mediaUrl, mediaType);
    } finally {
      setSending(false);
    }
  }, [groupId, user]);

  return { messages, loading, sending, sendMessage, currentUserId: user?.id };
}
```

4. Create `packages/community/src/components/chat/ChatBubble.tsx`:
```typescript
// WhatsApp-style bubble:
// - My messages: right-aligned, saffron/gold background
// - Others: left-aligned, deepIndigo background with avatar
// - Show sender name (others only), timestamp
// - Media support: image thumbnail, audio player placeholder
```

5. Create `packages/community/src/components/chat/ChatInput.tsx`:
```typescript
// Fixed bottom input bar:
// - TextInput (multiline, max 4 lines)
// - Image picker button (left)
// - Send button (right, disabled if empty)
// - Keyboard-aware (KeyboardAvoidingView)
```

6. Create `packages/community/src/screens/GroupChatScreen.tsx`:
```typescript
// Layout:
// - GlobalHeader with group name + member count
// - FlatList (inverted) of ChatBubble components
// - ChatInput pinned at bottom
// - Loading skeleton while fetching
```

7. Add route in the navigation stack. In `GroupDetailsScreen.tsx`, add a "Chat 💬" button/tab that navigates to `GroupChatScreen` with `groupId` param.

8. Test: two devices (or Expo Go + simulator) in same group → send message → appears in real-time on both.

9. Commit (multiple small commits as you build each file):
```bash
git commit -m "feat(community): add group_messages API and useGroupChat hook with Supabase Realtime"
git commit -m "feat(community): add ChatBubble and ChatInput components"
git commit -m "feat(community): add GroupChatScreen (WhatsApp-style real-time group chat)"
```

---

### Task 5.2.5 — Feedback Loop Repairs

**Context:** Feedback loops between parents, students, teachers, and principal need repair/implementation. "Principal Echo" (teacher → principal feedback) already exists in TeacherDashboard. Gaps: parent visibility, student progress nudges.

**Steps:**

1. Audit existing feedback paths:
   - `TeacherFeedbackModal` in TeacherDashboard → principal (exists)
   - Parent → school (none)
   - Student progress → parent (none)

2. Add a **parent feedback** route if parent role exists in `UserRole` type. If not, document as future work.

3. In community posts/groups, ensure teachers can @mention or tag groups that include parents. Verify group membership logic in `GroupsScreen`.

4. Add a **nudge** in TeacherDashboard: if a student has ≥3 missed attendance days, show a prompt: "📢 3 students need attention — share an update with parents in Community."

5. Commit improvements with descriptive message.

---

## Phase 6 — Library

### Task 4.1 — New Content Types

**Context:** Current library type: `lesson | worksheet | guide | reading | pedagogy | video | link | pdf | doc | note | other`. Need to add: `movie | circular | story | shortnote | mindmap`.

**Files:**
- Modify: `packages/library/src/types/Library.ts`
- Modify: `packages/library/src/constants/categories.ts`
- Modify: `packages/library/src/components/AddResourceModal.tsx` (type picker)
- Modify: `packages/library/src/screens/LibraryScreen.tsx` (filter chips)

**Steps:**

1. In `Library.ts`, extend the `ResourceType` union:
```typescript
export type ResourceType =
  | 'lesson' | 'worksheet' | 'guide' | 'reading' | 'pedagogy'
  | 'video' | 'link' | 'pdf' | 'doc' | 'note'
  | 'movie' | 'circular' | 'story' | 'shortnote' | 'mindmap'
  | 'other';
```

2. In `categories.ts`, add entries for each new type with icon + label:
```typescript
{ value: 'movie',     label: '🎬 Movie',      icon: 'film' },
{ value: 'circular',  label: '📜 Circular',   icon: 'file-text' },
{ value: 'story',     label: '📖 Story',      icon: 'book-open' },
{ value: 'shortnote', label: '📌 Short Note', icon: 'sticky-note' },
{ value: 'mindmap',   label: '🗺️ Mind Map',  icon: 'git-branch' },
```

3. Update `AddResourceModal.tsx` type selector to include new types.

4. Update `LibraryScreen.tsx` filter chips to show new categories.

5. Commit:
```bash
git add packages/library/src/types/Library.ts \
        packages/library/src/constants/categories.ts \
        packages/library/src/components/AddResourceModal.tsx
git commit -m "feat(library): add movie, circular, story, shortnote, mindmap content types"
```

---

### Task 4.2 — Upload, Download, Share, Save

**Files:**
- Modify: `packages/library/src/components/AddResourceModal.tsx` (file upload)
- Modify: `packages/library/src/screens/LibraryScreen.tsx` / `ResourceList.tsx` (download/share/save actions)
- Modify: `packages/core/src/api/resources.ts` (if needed for download tracking)

**Steps:**

1. **Upload**: `AddResourceModal` currently takes a URL. Add a file picker option:
```typescript
import * as DocumentPicker from 'expo-document-picker';
// Add "Pick File" button alongside URL input
// On pick: upload to Supabase Storage → get public URL → set as resource URL
```

2. **Download**: In `ResourceList` item actions, add a download button for `pdf`, `doc`, `mindmap` types:
```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// Download: FileSystem.downloadAsync(url, localPath) → show progress
```

3. **Share**: Add share button using `expo-sharing` or React Native `Share`:
```typescript
import { Share } from 'react-native';
Share.share({ title: resource.title, url: resource.url });
```

4. **Save to Personal Library**: Add bookmark/save action. Toggle `is_bookmarked` field via API. Show saved resources in a "My Shelf" filter.

5. Commit:
```bash
git commit -m "feat(library): add file upload via Expo DocumentPicker, download, share, and save-to-shelf actions"
```

---

### Task 4.3 — Reactions & Upvotes

**Files:**
- Modify: `packages/library/src/components/ResourceList.tsx` (reaction UI)
- Create/Modify: `packages/core/src/api/resources.ts` (reaction endpoint)

**Steps:**

1. Add a reaction row below each resource card. Reactions: 👍 Helpful | ❤️ Love | 🔥 Must-use | 🤔 Unsure.

2. Track `user_reactions` in a Supabase table (or JSON column on resource). Toggle on tap.

3. Show aggregate counts next to each emoji. Highlight the user's own reaction.

4. Commit:
```bash
git commit -m "feat(library): add emoji reactions and upvotes to resource cards"
```

---

### Task 4.4 — Classroom ↔ Library Sync

**Files:**
- Modify: `packages/classroom/src/screens/ContentLibrary.tsx`
- Modify: `packages/library/src/hooks/useLibrary.ts`
- Modify: `packages/library/src/api/library.ts`

**Steps:**

1. When a teacher adds a resource to a classroom (`ContentLibrary.tsx`), offer: "Also add to your personal library?" → sets `visibility: 'class'` and links `classroom_id`.

2. In `LibraryScreen.tsx`, add a "Classroom" filter tab that shows resources shared in the user's classrooms.

3. When a user saves a classroom resource to personal library → creates a copy with `visibility: 'private'`.

4. Bidirectional: from Library, sharing a resource to a classroom should set `visibility: 'class'` and assign `classroom_id`.

5. Commit:
```bash
git commit -m "feat(library): bidirectional classroom ↔ library sync with permission-aware visibility"
```

---

## Phase 7 — Classroom

### Task 9.11 — Remove Blocking in ClassroomScreen

**Context:** Current blocking paths:
1. `!profileCompleted` → `NoSchoolOnboarding`
2. `isGuest` → `PositiveInvitation type="guest"` (but only a small banner, screen is accessible)
3. Teacher with no classes → TeacherDashboard (OK — not truly blocked)
4. Student with no classes → empty state

**Required behaviour:**
- **Guest user**: Don't block. Show demo/sample school. Nudge "Join or create a school to get started 🏫" at top.
- **Registered, no NIC/index**: Don't hard-block. Show nudge banner: "Complete your profile to unlock all features →" which navigates to FullProfileScreen. Let them see demo content.
- **Student with no classes**: Show "You're not in any classroom yet" card + "Join a classroom" button.

**Files:**
- Modify: `packages/classroom/src/screens/ClassroomScreen.tsx`
- Create: `packages/classroom/src/components/ClassroomNudgeBanner.tsx`
- Create or find: demo/sample data for guest view (search for `demo.ts` in `packages/core/src/api/`)

**Steps:**

1. In `ClassroomScreen.tsx`, remove hard-block for `!profileCompleted`. Replace with a dismissible `ClassroomNudgeBanner`:
```typescript
{!profileCompleted && (
  <ClassroomNudgeBanner
    message="Complete your profile to unlock all classroom features"
    actionLabel="Update Profile"
    onAction={() => navigation.navigate('FullProfile')}
  />
)}
```

2. For guest users: show `PositiveInvitation` as a top banner (not full-screen block). Load demo classroom data from `packages/core/src/api/demo.ts`:
```typescript
// In ClassroomScreen, if isGuest:
// Load demo school/classroom data
// Show it with a "DEMO" badge
// Show "Create account to join a real school" CTA
```

3. For student with no classes: render:
```typescript
<EmptyStateCard
  icon="🏫"
  title="No classrooms yet"
  message="Ask your teacher for a QR code or class code to join"
  actionLabel="Scan QR Code"
  onAction={() => openScanner()}
/>
```

4. Verify all 4 user paths work without crashing.

5. Commit:
```bash
git add packages/classroom/src/screens/ClassroomScreen.tsx \
        packages/classroom/src/components/ClassroomNudgeBanner.tsx
git commit -m "fix(classroom): remove hard blocks; replace with nudge banners and demo content for guest/incomplete profiles"
```

---

### Task 9.9 — TeacherDashboard Default Content

**Files:**
- Modify: `packages/classroom/src/components/TeacherDashboard.tsx`

**Steps:**

1. When teacher has 0 classrooms, replace the empty `ClassroomList` with an onboarding prompt:
```typescript
// If classCount === 0:
<View style={styles.emptyState}>
  <Text>🌱 Start your first classroom</Text>
  <Text>Create a class or get your school code from your principal</Text>
  <SanctuaryButton label="Create Classroom" onPress={openCreateModal} />
  <SanctuaryButton label="Join with Code" variant="secondary" onPress={openJoinModal} />
</View>
```

2. Commit:
```bash
git add packages/classroom/src/components/TeacherDashboard.tsx
git commit -m "feat(classroom): show onboarding CTA in TeacherDashboard when no classrooms exist"
```

---

### Task 9.1 — Timetable

**Files:**
- Create: `packages/classroom/src/screens/TimetableScreen.tsx`
- Create: `packages/core/src/api/timetable.ts`
- Modify: `packages/classroom/src/screens/ClassroomDetailsScreen.tsx` (add timetable tab)
- Modify: Self section views (link to timetable)

**Steps:**

1. Create `packages/core/src/api/timetable.ts` with CRUD for timetable periods (school_id, class_id, day_of_week, period_number, subject, teacher_id, room, start_time, end_time).

2. Create `TimetableScreen.tsx`:
   - Grid layout: rows = periods (1–8), columns = days (Mon–Sat)
   - Each cell shows subject + teacher name
   - Teachers can edit their own entries
   - Students see read-only view

3. Add "Timetable" tab to `ClassroomDetailsScreen.tsx` (alongside students, lessons, resources).

4. In Self section (StudentSelfView, TeacherSelfView), show "today's timetable" as a horizontal scroll of today's periods.

5. Commit with multiple commits as you build each layer.

---

### Task 9.2 — Classroom Notes & Official Journals

**Files:**
- Create: `packages/classroom/src/screens/NotesScreen.tsx`
- Create: `packages/core/src/api/classroomNotes.ts`

**Steps:**

1. Notes per classroom for teachers. Data model: `classroom_notes (id, classroom_id, teacher_id, title, content, type: 'note'|'journal'|'official', created_at, updated_at)`.

2. `NotesScreen` UI: list of notes with date + title. FAB to create new note. Tap to edit inline (re-use EditableItem pattern from profile).

3. Official journals: `type='official'` notes are visible to principal/grade_head.

4. Add "Notes" tab to `ClassroomDetailsScreen.tsx`.

---

### Task 9.5 — Grading System

**Context:** `GradebookScreen.tsx` and `GradebookTable.tsx` already exist. Audit and improve.

**Files:**
- Modify: `packages/classroom/src/screens/GradebookScreen.tsx`
- Modify: `packages/classroom/src/components/GradebookTable.tsx`

**Steps:**

1. Verify grading CRUD works (create assessment, enter marks, calculate grade).
2. Add grade aggregation: term average, subject average.
3. Ensure student can view their own grades (read-only).
4. Principal can view school-wide grade distribution.

---

### Task 9.6 — Attendance Generalisation to Principal

**Context:** `AttendanceScreen.tsx` exists for class level. Principal needs school-wide view.

**Files:**
- Modify: `packages/classroom/src/screens/AttendanceScreen.tsx`
- Modify: `packages/classroom/src/screens/PrincipalSchoolView.tsx`

**Steps:**

1. Add school-wide attendance summary to `PrincipalSchoolView`: today's attendance % per class, absentee list.
2. `AttendanceScreen` should work for any class the user has permission to view (not just their own).

---

### Task 9.8 — Link Feedback Loop ↔ Community

**Steps:**

1. In `ClassroomDetailsScreen.tsx` (lessons tab), add "Share to Community" button on lesson posts — opens `CreatePostModal` pre-filled with the lesson as resource link, `type='lesson'` tag pre-selected, group pre-selected to classroom's linked community group.

2. In `TeacherDashboard.tsx`, "Principal Echo" feedback modal → show preview of recent community announcements from principal.

---

### Task 9.12 — School/Classroom Creation + QR Generation

**Context:** `CreateClassroomModal` exists. QR scanner exists via `@repo/scanner-kit`. Need QR *generation* for classrooms.

**Files:**
- Modify: `packages/classroom/src/components/TeacherDashboard.tsx` (show QR after creation)
- Create: `packages/classroom/src/components/ClassroomQRCode.tsx`

**Steps:**

1. Install `react-native-qrcode-svg` if not present.
2. After classroom creation, show `ClassroomQRCode` modal displaying QR for the classroom code.
3. QR encodes `classroomId` or `inviteCode`. Scanner reads it and auto-joins.
4. School creation flow: if user is a principal with no school, offer school creation wizard (name, address, type) → generates school invite QR.

---

### Task 9.13 — Personal Library vs Classroom Library

**Steps:**

1. In `ClassroomDetailsScreen.tsx` resources tab (`ContentLibrary.tsx`), differentiate:
   - **Classroom library**: resources shared by teacher for this class (`classroom_id` set, `visibility: 'class'`)
   - **Personal library**: resources the user saved privately (`visibility: 'private'`)

2. Add toggle/tab: "Class Resources" | "My Saved" within the resources view.

3. Teacher: adding a resource from personal library to classroom → duplicates with `visibility: 'class'` and `classroom_id`.

---

### Tasks 9.3, 9.4, 9.7, 9.10 — Additional Classroom Features

- **9.3 Multi-year student data**: Add `academic_year` field to `classroom_students` and `grades` tables. UI filter by year in GradebookScreen and StudentList.
- **9.4 OCR and file functionality**: Integrate `expo-camera` for OCR scan of handwritten marks/attendance. Use `react-native-vision-camera` + MLKit if available, else manual entry fallback.
- **9.7 Resources per role**: Ensure `ContentLibrary.tsx` filters resources by the viewer's role permissions (students see class-level only; teachers see everything in their classes).
- **9.10 Admin letters/reports**: Create `packages/classroom/src/screens/ReportsScreen.tsx` — generate PDF report (attendance summary, grade report) using `expo-print`. Admin can send as PDF attachment via community message.

---

## Phase 8 — Notifications

### Task 7.1 — Real Notifications (remove hardcoded)

**Context:** `NotificationDrawer.tsx` exists in `packages/ui/src/components/`. No dedicated screen. All notifications are currently toasts/modals.

**Files:**
- Create: `packages/core/src/api/notifications.ts`
- Create: `packages/core/src/hooks/useNotifications.ts`
- Modify: `packages/ui/src/components/NotificationDrawer.tsx` (connect to real data)
- Create or modify: notification bell in `GlobalHeader.tsx`

**Steps:**

1. Supabase table `notifications (id, user_id, type, title, body, data jsonb, read_at, created_at)`. Enable Realtime.

2. Create `packages/core/src/api/notifications.ts`:
```typescript
export const notificationsAPI = {
  async fetchUnread(userId: string) { ... },
  async markRead(notificationId: string) { ... },
  async markAllRead(userId: string) { ... },
  subscribeToNotifications(userId: string, callback: (n: any) => void) { ... },
};
```

3. Create `packages/core/src/hooks/useNotifications.ts` — returns `{ notifications, unreadCount, markRead, markAllRead }`.

4. In `GlobalHeader.tsx`, the notification bell dot (currently static 8×8 red dot) should show `unreadCount > 0`. Tap → open `NotificationDrawer`.

5. `NotificationDrawer.tsx` — replace hardcoded items with real data from `useNotifications`. Show type icons: 📢 announcement, 📝 assignment, ✅ attendance, 🏆 reward.

6. Create notification triggers in the app:
   - New community post in a group → notify members
   - Attendance marked → notify student
   - Grade posted → notify student
   - Principal Echo reply → notify teacher

7. Commit:
```bash
git commit -m "feat(notifications): real-time notification system via Supabase Realtime; connect NotificationDrawer to live data"
```

---

## Phase 9 — Error Handling

### Tasks 10.1 & 10.2 — Graceful + Informative Errors

**Files:**
- Modify: `apps/gurudevi-mobile/src/components/shared/ErrorBoundary.tsx`
- Audit: all API call sites in packages/classroom, community, library, profile

**Steps:**

1. Upgrade `ErrorBoundary.tsx` to show an **actionable** fallback instead of generic "Something went wrong":
```typescript
// Determine error type and show specific message:
// Network → "Check your connection and try again 🌐"
// Auth expired → "Session expired — please log in again 🔐"
// Not found → "This content isn't available 🔍"
// Generic → "Something went wrong — we're looking into it 🛠️"
```

2. Audit all `try/catch` blocks in API hooks. Ensure every `catch` either:
   - Shows a `SanctuaryToast` with an actionable message (not just logs to console)
   - Navigates to a recovery screen if critical (e.g. auth failure → Welcome)

3. Create a shared `handleAPIError(error, context)` utility in `packages/core/src/lib/errors.ts` if it doesn't already exist — maps Supabase error codes to user-readable messages.

4. Commit:
```bash
git commit -m "feat(errors): upgrade ErrorBoundary with actionable messages; audit and fix all silent catch blocks"
```

---

## Phase 10 — Welcome / Auth

### Task 13.1 — Welcome & Auth UI Design

**Files:**
- Modify: `apps/gurudevi-mobile/src/screens/WelcomeScreen.tsx`
- Modify: `apps/gurudevi-mobile/src/screens/AuthScreen.tsx`

**Steps:**

1. `WelcomeScreen`:
   - Ensure all padding/sizes use `Theme` tokens (audit for hardcoded values)
   - Add gentle Reanimated entrance animation to logo (ZoomIn) and buttons (FadeInUp)
   - Language selector should use `SanctuaryChip` components from `@repo/ui`

2. `AuthScreen`:
   - Tabs (Sign Up / Login) should use `SanctuaryChip` or styled tab bar
   - Input fields should use `SanctuaryInput` from `@repo/ui`
   - All buttons via `SanctuaryButton`
   - No hardcoded colours

3. Commit:
```bash
git commit -m "feat(auth): apply design system tokens to WelcomeScreen and AuthScreen; add entry animations"
```

---

### Task 13.2 — Phone Number Auth & Magic Link

**Files:**
- Modify: `apps/gurudevi-mobile/src/screens/AuthScreen.tsx`
- Modify: `packages/core/src/api/auth.ts`

**Steps:**

1. Supabase supports phone OTP natively. Add a "Phone" auth option in `AuthScreen`:
   - Toggle: Email | Phone
   - Phone: `+94` prefix (Sri Lanka) + 9-digit input
   - OTP sent via SMS → 6-digit code input → verify

2. Add "Magic Link" option for email (passwordless):
   - Tap "Send Magic Link" → Supabase sends email link → user taps → logs in
   - Use `supabase.auth.signInWithOtp({ email })`

3. Commit:
```bash
git commit -m "feat(auth): add phone OTP and magic link authentication options"
```

---

### Task 13.3 — GMS vs HuaweiMS

**Files:**
- Modify: `apps/gurudevi-mobile/app.json` or `app.config.ts`
- Create: `apps/gurudevi-mobile/src/lib/pushNotifications.ts`

**Steps:**

1. Use `expo-notifications` which handles FCM (GMS) automatically for Android.
2. For Huawei HMS: check if `expo-notifications` supports HMS bridge. If not, use conditional import with `@hmscore/react-native-hms-push` for Huawei builds.
3. Create `pushNotifications.ts` that detects device vendor and initialises the correct push service.
4. Register push token on login → store in `profiles` table → use for server-side notifications.
5. Commit:
```bash
git commit -m "feat(push): add GMS/HMS push notification support with device vendor detection"
```

---

## Phase 11 — FAB Decision

### Task 14 — FAB Strategy (DECIDED 2026-02-24)

**Decision:** Keep the per-section **emoji FABs** (`packages/ui/src/components/LotusPetalFAB.tsx`, 56px).

**Do NOT** enable `apps/gurudevi-mobile/src/components/shared/LotusPetalFAB.tsx` (72px lotus image, draggable) — remains `disabled=true`. Kept in code as a future option but not active.

**Rationale:** Emoji FABs are per-tab/section-aligned, less cluttered, and already working. The lotus image FAB approach felt screen-cluttered. Community and Library FABs may occasionally be shadowed by the bottom navbar — acceptable for now.

**Two implementations that exist:**
- `apps/gurudevi-mobile/src/components/shared/LotusPetalFAB.tsx` — 72px lotus image, draggable, **disabled=true** (keep disabled, keep in code)
- `packages/ui/src/components/LotusPetalFAB.tsx` — 56px emoji, active, section-aligned ← **THIS IS THE ONE TO USE**

**Steps:**

1. Keep emoji FABs in LibraryScreen, CommunityScreen, TeacherDashboard, PrincipalSchoolView as-is.

2. Apply `useTheme()` phase-aware glow tokens to the emoji FAB (`packages/ui/src/components/LotusPetalFAB.tsx`) so it visually adapts with the Living Theme System.

3. Do NOT touch the lotus image FAB. Leave `disabled=true`.

4. Commit:
```bash
git commit -m "feat(theme): apply phase-aware glow tokens to emoji FABs; lotus image FAB remains disabled (future option)"
```

---

## Phase 12 — Theme / UX Polish

### Task 15 — Global Theme Audit

**Files:**
- All screens and components across `apps/gurudevi-mobile/src/` and `packages/*/src/`

**Steps:**

1. Run a grep across all files for hardcoded hex strings:
```bash
grep -rn "'#[0-9a-fA-F]\{3,6\}'" apps/gurudevi-mobile/src packages/*/src --include="*.tsx" --include="*.ts"
```

2. For each match, replace with the nearest `Theme.colors.*` token.

3. Run grep for hardcoded spacing values not using Theme:
```bash
grep -rn "padding: [0-9]" apps/gurudevi-mobile/src packages/*/src --include="*.tsx"
```
Replace with `Theme.spacing.*`.

4. Audit font sizes — ensure nothing below 12px (Theme minimum).

5. Test on small screen (iPhone SE equivalent) and large screen (iPad or large Android).

6. Commit after each file group:
```bash
git commit -m "fix(theme): replace hardcoded colors/spacing in [section] with Theme tokens"
```

---

## Phase 13 — Infrastructure

### Task 11 — QA and Testing

**Files:**
- Create: `apps/gurudevi-mobile/__tests__/` directory structure
- Setup: jest config in `apps/gurudevi-mobile/package.json`

**Steps:**

1. **Unit tests** — critical hooks first:
   - `useProfileCompletion` → test all field combinations, role variants
   - `useGroupChat` → mock Supabase, test optimistic insert
   - `useProfileCompletion` edge cases: null profile, empty strings, partial data

2. **BDD tests** — use `jest-cucumber` or plain describe/it with Given/When/Then naming:
   ```
   Given a guest user opens ClassroomScreen
   When they see the screen
   Then they see demo content and a nudge banner (not a hard block)
   ```

3. **E2E** — use `maestro` (recommended for Expo):
   - Flow 1: Welcome → Guest → Classroom (see demo, nudge visible)
   - Flow 2: Login → Profile completion → complete all fields → 100% shown
   - Flow 3: Create post → must add tag → submit → post visible in feed

4. **Accessibility**: use `@testing-library/react-native` `getByRole` assertions.

5. **Performance**: use `react-native-performance` to assert profile screen FPS > 55.

---

### Task 12 — CI/CD and Production

**Steps:**

1. **12.1 Expo Dev Build:**
```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```
Add `eas.json` profiles if not present.

2. **12.2 App Bundle:**
```bash
eas build --profile production --platform android  # .aab
eas build --profile production --platform ios       # .ipa
```

3. **12.3 App Store / App Gallery Submission (closed testing):**
```bash
eas submit --platform android  # Google Play internal testing
eas submit --platform ios       # TestFlight
```
For Huawei App Gallery: manual APK upload to AppGallery Connect → closed beta track.

---

### Task 16 — User Feedback

**Steps:**

1. Use `PostHog Surveys` (already have PostHog) for in-app feedback prompts.
2. Trigger survey after: 3rd session, completing first classroom, sending first community post.
3. Use `posthog:surveys` skill to set up surveys.

---

### Task 17 — Sentry + PostHog Full Activation

**Files:**
- Modify: `packages/core/src/lib/monitoring/sentry.ts`
- Modify: `packages/core/src/lib/monitoring/posthog.ts`
- Modify: `apps/gurudevi-mobile/App.tsx`

**Steps:**

1. **Sentry**: Enable in dev builds too (currently skipped in `__DEV__`). Add to `.env`:
```
EXPO_PUBLIC_SENTRY_DSN=your_dsn_here
```
Add source map upload to `eas.json` build hooks.

2. **PostHog**: Add event tracking to all major user actions:
```typescript
// Key events to track:
trackEvent('post_created', { tags, groupId, hasMedia });
trackEvent('classroom_joined', { method: 'qr' | 'code' });
trackEvent('profile_completed', { percentage: 100 });
trackEvent('resource_uploaded', { type, visibility });
trackEvent('chat_message_sent', { groupId });
```

3. Use `posthog:posthog-instrumentation` skill for systematic instrumentation.

4. Use `sentry:sentry-setup-tracing` skill for performance tracing.

5. Commit:
```bash
git commit -m "feat(monitoring): activate Sentry in all builds; add PostHog event tracking for key user flows"
```

---

## Verification

Run after each phase completes:

```bash
# TypeScript compile check
cd apps/gurudevi-mobile && npx tsc --noEmit

# Unit tests
cd apps/gurudevi-mobile && npm test

# Start Expo dev server
npx expo start --clear

# E2E (Maestro)
maestro test .maestro/
```

**Manual smoke test checklist:**
- [ ] No `useNavigationState` errors in Metro console
- [ ] No VirtualizedList nesting warnings
- [ ] Profile screen: avatar shows initials when no photo
- [ ] Profile screen: ring % matches progress bar %
- [ ] Create post: blocked without tag + group
- [ ] Group chat: messages appear in real-time
- [ ] ClassroomScreen: guest sees demo (not blank/blocked)
- [ ] Notification bell: shows unread count
- [ ] FAB: lotus FAB visible, opens correct actions per tab

---

## Critical File Reference

| Area | File |
|------|------|
| App root | `apps/gurudevi-mobile/App.tsx` |
| Tab navigation | `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx` |
| Profile screen | `apps/gurudevi-mobile/src/screens/ProfileScreen.tsx` |
| Identity card | `apps/gurudevi-mobile/src/components/profile/IdentityCard.tsx` |
| Full profile | `apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx` |
| useProfile hook | `packages/profile/src/hooks/useProfile.ts` |
| Profile types | `packages/profile/src/types/index.ts` |
| Global header | `packages/ui/src/components/GlobalHeader.tsx` |
| Theme tokens | `packages/ui/src/theme/Theme.ts` |
| Community screen | `packages/community/src/screens/CommunityScreen.tsx` |
| Create post modal | `packages/community/src/components/CreatePostModal.tsx` |
| Group details | `packages/community/src/screens/GroupDetailsScreen.tsx` |
| Library screen | `packages/library/src/screens/LibraryScreen.tsx` |
| Library types | `packages/library/src/types/Library.ts` |
| Classroom router | `packages/classroom/src/screens/ClassroomScreen.tsx` |
| Teacher dashboard | `packages/classroom/src/components/TeacherDashboard.tsx` |
| Self screen | `apps/gurudevi-mobile/src/screens/SelfScreen.tsx` |
| Welcome screen | `apps/gurudevi-mobile/src/screens/WelcomeScreen.tsx` |
| Auth screen | `apps/gurudevi-mobile/src/screens/AuthScreen.tsx` |
| PostHog | `packages/core/src/lib/monitoring/posthog.ts` |
| Sentry | `packages/core/src/lib/monitoring/sentry.ts` |
| App-level FAB (disabled, future option) | `apps/gurudevi-mobile/src/components/shared/LotusPetalFAB.tsx` |
| UI FAB (active, emoji, keep) | `packages/ui/src/components/LotusPetalFAB.tsx` |
| Error boundary | `apps/gurudevi-mobile/src/components/shared/ErrorBoundary.tsx` |
