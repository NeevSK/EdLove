---
title: "Instruction for GitHub Cloud Agent: Library Sanctuary Scaffolding"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Instruction for GitHub Cloud Agent: Library Sanctuary Scaffolding

## Task Overview
Implement the foundational UI components for the "Library Sanctuary" (Global Library) and "Personal Desk" view in the `gurudevi-mobile` application. These changes follow a "Netflix for Learning" aesthetic.

## Technical Context
- **Packages**:
    - `@repo/ui`: Core UI components.
    - `@repo/core`: API, types, and constants.
    - `@repo/library`: Library-specific logic and types.
- **Key Designs**: Follow [library_ecosystem.md](./library_ecosystem.md).
- **Style Guide**: Use `sx` props for styling, themed colors from `useThemedColors`, and standard typography.

## Scaffolding Checklist

### 1. [NEW] CollectionCard.tsx (@repo/ui)
Create a cover-art style card for resource playlists.
- **Props**: `title`, `creator`, `resourceCount`, `subjectTag`, `thumbnailUrl`.
- **UI**: Large image background (optional), overlay with title and badge (e.g., "12 Items").
- **Badge**: Show "Verified" if verified.

### 2. [NEW] SmartShelf.tsx (@repo/ui)
A generic horizontal scroller for collections.
- **Props**: `title`, `children`, `onSeeAll`.
- **UI**: Section header with "See All" button, then a horizontal `ScrollView`.

### 3. [MODIFY] LibraryScreen.tsx (gurudevi-mobile)
Refactor the current flat list into the "Netflix" layout.
- **Sections**:
    - "Continue Learning" (Pulled to Desk).
    - "Featured Collections" (Curated).
    - "New Arrivals" (Based on Grade).
- Use `SmartShelf` and `CollectionCard`.

### 4. [MODIFY] ResourceList.tsx (@repo/library)
Align with "Telegram-Style" high-density list.
- **UI**: Compact rows with File Type Icons (PDF, Video, MP4).
- **Metadata**: Display File Size and Duration from the `media` object (type `MediaAsset`).
- **Action**: Expandable "Flash-Play" preview (mini bottom-sheet).

## Technical Requirements
- Ensure all new components are exported from `packages/ui/src/components/index.ts`.
- Use TypeScript strictly. Refer to `packages/library/src/types/Library.ts` for data models.
- **Media Abstraction**: Do NOT hardcode Cloudinary logic in UI. Use the `media` object and helper methods from `@repo/core` to resolve URLs.
- Maintain **Offline-First** capability by using local store state for the "Desk" items.

## Submission
Create a single Pull Request with the scaffolding implementation. Include screenshots/videos of the new UI layouts.
