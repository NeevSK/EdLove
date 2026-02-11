# Universal Components Implementation

## Goal
Create a set of standardized, reusable components to ensure UI consistency and reduce "reinventing the wheel" for future feature development.

## Components

### 1. `LotusLoader`
**Path:** `src/components/shared/LotusLoader.tsx`
- **Purpose:** Replace generic spinners with a "breathing" lotus animation.
- **Props:** `size` (sm, md, lg), `text` (optional loading message).
- **Animation:** Reanimated pulse effect on the Lotus icon.

### 2. `EmptyState`
**Path:** `src/components/shared/EmptyState.tsx`
- **Purpose:** Consistent "No Data" screens.
- **Props:** `icon` (Lucide icon), `title`, `description`, `actionLabel`, `onAction`.
- **Style:** Centered, muted colors, using Sanctuary aesthetic.

### 3. `SanctuaryToast`
**Path:** `src/components/shared/SanctuaryToast.tsx`
- **Purpose:** Non-intrusive success/error feedback.
- **Props:** `message`, `type` (success, error, info), `visible`, `onHide`.
- **Animation:** Slide up/down from bottom, distinct coloring (Sage Green, Ember Red).

### 4. `ErrorBoundary`
**Path:** `src/components/shared/ErrorBoundary.tsx`
- **Purpose:** Catch JS crashes and show a friendly "Something went wrong" screen instead of a white screen/crash.
- **Features:** "Reload App" button.
