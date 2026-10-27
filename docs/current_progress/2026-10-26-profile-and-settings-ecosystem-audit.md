# Profile and Settings Ecosystem Audit: Historical Trajectory, Lost Capabilities & Modernization Map

**Date:** 2026-10-26  
**Status:** Canonical Workspace Audit  
**Scope:** Mobile (`apps/gurudevi-mobile`, `packages/profile`, `packages/ui`), Web (`apps/gurudevi-web`), Core Contracts (`@repo/core`, `@repo/schema`), and Dual-Mode Alignment (Explore vs Sanctuary).

---

## 1. Executive Summary

This audit investigates the current state and git history of **Profile** and **Settings** across the Gurudevi Polymath monorepo. During historical migrations—from the monolithic mobile platform into extracted domain packages and later into the sovereign Next.js 16 web application (`apps/gurudevi-web`)—several critical user-facing capabilities were bifurcated or left as frozen stubs.

Specifically:
1. **Gurudevi Web Profile** was implemented as a read-only "Phase 1" stub (`ProfileFloor.tsx`), leaving editing, avatar uploads, dynamic calibration progress, live QR passes, and social links stranded in legacy React Native Web files (`ProfileScreen.web.tsx`).
2. **Gurudevi Mobile Profile** (`packages/profile`) still relies on deprecated `@repo/ui/primitives` (Gluestack-era Box/VStack/HStack) instead of the new `@repo/ui/world/native` tokens and primitives that Settings was recently dressed in (commit `2d3078ace`).
3. **Explore vs. Sanctuary Alignment** is inconsistent: Web has an explicit guest sandbox mode with capacity switching, while Mobile handles guest/wanderer state through a banner and navigation blocking.
4. **Settings Persistence** is currently partitioned: Web uses browser `localStorage` and PDPA cookies; Mobile uses MMKV (`StorageManager`) and Zustand stores.

---

## 2. Chronological Trajectory in Git History

### Phase 1: Monolithic Mobile Platform (`apps/teacher-platform` & `apps/gurudevi-mobile/src/components/profile/`)
- Profile started with rich, feature-complete subcomponents:
  - `EditProfileModal.tsx`: Comprehensive modal to update name, bio, phone, username, and avatar.
  - `IdentityCard.tsx`: Role and capacity presentation.
  - `ProfileCompletionBar.tsx`: Dynamic profile calibration.
  - `UserStatsCard.tsx` & `LivingJourneyPanel.tsx`: Attendance, streak, and milestone tracking.
  - `ThuthimalBadge.tsx`: Gratitude economy badge system.
  - `AddSocialLinkModal.tsx` & `SocialSanctuary.tsx`: Social linktree management.
  - `ControlScroll.tsx` & `SupportSection.tsx`: In-app support and disclosure panels.

### Phase 2: Domain Package Extraction (`packages/profile`)
- In commits preceding March 2026, profile components were lifted out of `apps/gurudevi-mobile` into `@repo/profile`.
- To support web access prior to Next.js, two parallel screens were maintained:
  - `ProfileScreen.tsx` (React Native for mobile).
  - `ProfileScreen.web.tsx` (React Native Web bridge for browser).
- `ProfileScreen.web.tsx` preserved full editing with sequential field mutation recovery (`confirmed | queued | failed`), SVG QR code generation (`QRCodeGenerator`), social links, and avatar upload.

### Phase 3: Sovereign Web App & The "Phase 1" Freeze
- When `apps/gurudevi-web` was built as a modern Next.js 16 App Router application, `ProfileFloor.tsx` and `SettingsFloor.tsx` were created browser-native.
- However, `ProfileFloor.tsx` was scoped with a temporary guard:
  > *"The first browser profile slice intentionally presents only identity facts returned by the verified Sanctuary entry contract. Editing and expanded profile fields remain out of scope until their browser contracts exist."*
- Consequently, `ProfileFloor.tsx` was deployed with hardcoded progress (`75%`), static stats (`3 Circles`, `5d streak`), no editing modal, no avatar upload, and a dummy QR button copying a static URL.

### Phase 4: World Design System Arrival (October 2026)
- In commit `78e45c6aa` and commit `2d3078ace` (*"feat(app): dress Settings, the tab bar and headers in the chosen world"*), Settings on Mobile was rebuilt from modern primitives (`Section`, `Row`, `Chip`, `Switch`, `TextField`, `Button`, `WorldPicker`) reading directly from `useWorld().tokens`.
- However, `ProfileScreen.tsx` was **not** updated and remains on legacy primitives.

---

## 3. Capability Parity Matrix: What Got Lost in Translation

| Feature / Capability | Legacy RN-Web (`ProfileScreen.web.tsx`) | Mobile Live (`packages/profile`) | Web Live (`apps/gurudevi-web`) | Status & Gap |
| :--- | :--- | :--- | :--- | :--- |
| **Identity Presentation** | Yes (avatar, name, role) | Yes (`IdentityCard`) | Yes (`ProfileFloor`) | **Parity** across all surfaces. |
| **Field Editing** (Bio, Phone, Display Name, Username) | Yes (inline editor + partial-save recovery) | Yes (in `FullProfileScreen` push route) | **NO** (Read-only) | **Lost in Web migration**. Web needs native dialog/form. |
| **Avatar Upload** | Yes (Supabase Storage upload) | Yes (Expo ImagePicker + Storage) | **NO** (Static Unicode emoji 👤) | **Lost in Web migration**. Needs browser file upload. |
| **Profile Calibration Progress** | Live (`useProfileCompletion`) | Live (`useProfileCompletion`) | **NO** (Hardcoded 75% & static steps) | **Faked on Web**. Needs live hook integration. |
| **Living Journey / Stats** | Live (`LivingJourneyPanel`) | Live (`LivingJourneyPanel`) | **NO** (Static 3 circles / 5d streak) | **Faked on Web**. Needs live domain query. |
| **Social Links (Linktree)** | Yes (`useSocialLinks`, `ContactLinktree`) | Yes (`useSocialLinks`, `AddSocialLinkModal`) | **NO** (Absent) | **Lost in Web migration**. Model `UserSocialLink` exists. |
| **Living Pass / QR Code** | Live SVG QR (`QRCodeGenerator`) | In full profile | **NO** (Clipboard link copy button) | **Lost in Web migration**. Needs live QR generator. |
| **Gratitude Economy (Thuthimal)** | Yes (`ThuthimalBadge`) | Yes (`ThuthimalBadge`) | Modal only (`ThuthimalClaimModal`) | Incomplete on web. |
| **Design System Tokens** | Legacy Tailwind / RN Web | Legacy `@repo/ui/primitives` (Gluestack) | Modern CSS Modules + Sanctuary tokens | **Mobile Profile lags** behind mobile Settings. |
| **Explore vs Sanctuary** | None (Single mode) | Banner + Auth CTA | Explore Sandbox + Capacity Switcher | Inconsistent UX patterns across mobile and web. |

---

## 4. Architectural Dual-Mode Alignment (Explore vs. Sanctuary)

### Current Discrepancies
1. **Web (`apps/gurudevi-web`)**:
   - Explicit host classification (`explore.gurudevi.app` vs `sanctuary.gurudevi.app`).
   - In Explore mode:
     - Profile shows `Guest Explorer Sandbox` notice and provides `CapacityPerspectiveSwitcher` (`Educator`, `Student`, `Parent`).
     - Settings offers a "Purge Local Guest Storage" button and PDPA compliance disclosures.
   - In Sanctuary mode:
     - Verifies account via `resolveAuthorizedEntry()`.
     - Links to account sign-out and account deletion flows.
2. **Mobile (`apps/gurudevi-mobile`)**:
   - Relies on `context.isAnonymous` / `isLocalOnlyIdentity(user)`.
   - In Wanderer/Guest mode:
     - Profile renders an animated banner: *"You are exploring Gurudevi as a Guest"* with a Create Account button.
     - Tapping Edit Profile shakes the banner with haptic error and prompts auth.
   - Disconnect: Mobile Wanderer mode does not offer the rich pedagogical capacity switching (Educator vs Student vs Parent sample lenses) that Web Explore provides.

---

## 5. Modernization Recommendations

1. **Modernize Web Profile (`apps/gurudevi-web/app/(sanctuary)/profile/ProfileFloor.tsx`)**:
   - Replace the static 75% progress with `useProfileCompletion` calculation.
   - Implement a clean, browser-native Edit Profile dialog (saving `display_name`, `bio`, `phone`, `username`).
   - Implement real avatar upload using `@repo/core/supabase` browser client.
   - Bring back `QRCodeGenerator` for the personal sanctuary exploration pass.
   - Wire `useSocialLinks` for reading and adding user linktrees.
2. **Modernize Mobile Profile (`packages/profile/src/screens/ProfileScreen.tsx`)**:
   - Refactor UI from `@repo/ui/primitives` (`Box`, `Center`, `HStack`, `VStack`) to `@repo/ui/world/native` (`Section`, `Row`, `Chip`, `Button`, `WText`).
   - Adopt `useWorld().tokens` (`wt.canvas`, `wt.ink`, `wt.line`, etc.) to match diurnal themes.
   - Streamline the transition between overview and editing so users can edit inline or in a cohesive modal sheet.
3. **Retire RN Web Aliases**:
   - Remove `Platform.OS === 'web' ? ProfileScreenWeb : ProfileScreen` from `apps/gurudevi-mobile/app/(tabs)/profile/index.tsx` and `full/[id].tsx`.
4. **Settings & Preferences Synchronization**:
   - Store active appearance preset, diurnal motion, and language in user metadata (`User.metadata` in `schema.zmodel`), while keeping local storage/MMKV as an optimistic zero-latency cache.
