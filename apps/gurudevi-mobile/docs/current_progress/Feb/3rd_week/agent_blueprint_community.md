# Instruction for GitHub Cloud Agent: Community Ecosystem Scaffolding

## Task Overview
Implement the foundational UI components for the "Community Ecosystem" in the `gurudevi-mobile` application. These changes follow the vision of an "Educational Ecology".

## Technical Context
- **Packages**:
    - `@repo/ui`: Core UI components.
    - `@repo/core`: API, types, and constants.
    - `@repo/community`: Community-specific logic and types.
- **Key Designs**: Follow [community_ecosystem.md](./community_ecosystem.md).
- **Style Guide**: Use `sx` props for styling, themed colors from `useThemedColors`, and standard typography.

## Scaffolding Checklist

### 1. [MODIFY] CommunityFeed.tsx (gurudevi-mobile)
- **Context Filters**: Add a horizontal scroll of "Chips" at the top (e.g., [All Updates], [Grade 10], [Math Club]).
- **Global + Button**: Implement a prominent floating "+" button with audience selection (My Profile, Grade Group, Club).

### 2. [MODIFY] CommunityPostCard.tsx (@repo/community)
- **Inter-School Indicator**: Add a globe icon 🌍 next to group names for inter-school contexts.
- **Media Carousel**: Support multiple images (MediaAsset array) with a swipe-able carousel.

### 3. [MODIFY] GroupsScreen.tsx (gurudevi-mobile)
Refactor the Groups tab into two sub-tabs:
- **My Sanctuary**: Joined school-specific groups.
- **Galaxy**: Discoverable inter-school groups and marketplace.

### 4. [NEW] PinnedResourcesShelf.tsx (@repo/community)
A horizontal shelf to be displayed at the top of a Group View, linking to key Library assets.

## Technical Requirements
- Ensure all new components are exported from `packages/ui/src/components/index.ts`.
- Use TypeScript strictly.
- **Media Neutrality**: Use the generic `MediaAsset` type for all posts. Avoid provider-specific logic in the view layer.
- Ensure consistent styling using the themed design system.

## Submission
Create a single Pull Request with the scaffolding implementation. Include screenshots of the new UI layouts.
