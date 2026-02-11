# Implementation Plan - Sprint "Holistic Expansion"

# Goal Description
We are expanding the Gurudevi platform to include a fully functional **Library**, **Community** spaces (with Groups), refined **User Roles**, **Pricing Tiers**, and a **Rewards System**. This plan ensures a holistic integration with the existing architecture, prioritizing scale, security, and user experience. 

**Core Design Philosophy**: soulful, alive, and amazing UX, leveraging `components/shared` and the `DESIGN_SYSTEM.md`.

## User Review Required
> [!IMPORTANT]
> **Database Schema Changes**: This plan introduces several new tables (including Group logic) and modifications to existing ones.

> [!WARNING]
> **RLS Policies**: RLS for `groups` and `group_members` will be complex. A user must be a member of a group to see its posts, unless the group is public.

> [!NOTE]
> **Component Strategy**: We will primarily use `components/shared` for consistency. If a component (e.g., `LotusButton`, `SanctuaryCard`) is missing, we will create it there first.

## Proposed Changes

### Database Extensions (Supabase)

#### [NEW] Library Schema
- `library_items`: Core table for all resources.
    - `id`, `school_id` (nullable for public), `uploader_id`, `title`, `description`, `type` (pdf, video, link, etc.), `url`, `metadata` (jsonb for extradata like video duration), `created_at`.
    - `is_public` (boolean), `is_curated` (boolean).
- `library_collections`: For "Teacher's Personal Desk".
    - `id`, `user_id`, `name` (e.g., "My Desk", "Math Favorites"), `created_at`.
- `library_collection_items`: Join table.
    - `collection_id`, `item_id`, `added_at`.
- `library_interactions`:
    - `item_id`, `user_id`, `type` (like, view, download), `created_at`.

#### [NEW] Community Schema (Enhanced for Groups)
- `community_groups`:
    - `id`, `school_id`, `name`, `description`, `type` (class, interest, staff, public), `created_by`, `created_at`.
- `community_group_members`:
    - `group_id`, `user_id`, `role` (admin, member), `joined_at`.
- `community_posts`:
    - `id`, `school_id`, `group_id` (nullable for school-wide/public), `author_id` (nullable for anonymous?), `type` (announcement, post, poll), `title`, `content`, `metadata` (jsonb), `is_anonymous` (boolean), `created_at`.
- `community_reactions`:
    - `post_id`, `user_id`, `reaction` (emoji code), `created_at`.
- `community_votes`: For polls.
    - `post_id`, `user_id`, `option_index`, `created_at`.

#### [NEW] Gamification & Growth
- `user_rewards`:
    - `user_id`, `points_balance`, `lifetime_points`, `level`.
- `gift_codes`:
    - `code`, `type`, `value`, `is_redeemed`.
- `pricing_subscriptions`: refined.

### 3. Data Flow & Caching (Updated)
- **Server State**: Managed by **TanStack Query**.
  - Automatic background refetching.
  - Optimistic updates for immediate UI feedback.
  - Deduping of network requests.
- **Client State**: specialized `useStore` (Zustand) for session/theme/UI state.
- **Offline Strategy**: Critical data (e.g., User Profile, Daily Rhythm, Community Groups) is persisted to **MMKV** on fetch and rehydrated on app launch.

### 4. Component Architecture
- **Presentational**: Pure UI components, receiving data via props. Wrapped in `React.memo` where list performance is critical (`PostCard`, `GroupCard`).
- **Container/Smart**: Screens/Hooks that handle data fetching and pass it down.
- **Design System**: Gluestack UI + Custom "Sanctuary" Theme tokens (configured in `gluestack-ui.config.ts`).


#### [MODIFY] Shared Components (`components/shared/*.tsx`)
*Ensure these exist or create them based on `DESIGN_SYSTEM.md`:*
- `LotusButton`: Primary action button.
- `SanctuaryCard`: Standard card container with "soulful" interactions.
- `LotusPetalFAB`: The living floating action button.
- `BreathingLoader`: For loading states.
- `EmptyState`: Visually appealing empty states.

#### [NEW] Library Tab (`apps/gurudevi-mobile/app/(app)/library/`)
- `index.tsx`: Main view using `SanctuaryCard`.
- `desk.tsx`: Teacher's Personal Desk.
- **UX**: Use `Reanimated` for smooth transitions. Resource cards should "lift" on touch. "Add to Desk" checks a "flying" animation to the desk tab.

#### [NEW] Community Tab (`apps/gurudevi-mobile/app/(app)/community/`)
- `index.tsx`: Group List & Feed.
- `[groupId].tsx`: Specific Group View.
- `components/PostCard.tsx`: Reusable feed item.
- `components/CreatePostFAB.tsx`: Context-aware actions (Post, Poll).
- **Package**: `react-native-gifted-chat` for chat threads.

#### [NEW] Additional Packages
- **Chat**: `react-native-gifted-chat` (compatible with modern RN).
- **Visualizations**: `react-native-gifted-charts` (beautiful, animated charts for Rewards/Progress).
- **PDF Viewer**: `react-native-pdf` (requires Dev Client) OR `rn-pdf-reader-js` (Expo Go safe).
- **Office Docs**: `react-native-file-viewer` (requires Dev Client) or fallback to `Linking.openURL`.
- **Video**: `expo-av` (already in stack).

## Verification Plan

### Manual Verification
1.  **Group Logic**:
    - Create a "Science Club" group (Teacher/Admin).
    - Add a student member.
    - Post in the group. Verify ONLY group members see it.
2.  **Shared Components**:
    - Verify `LotusButton` has the correct "Sanctuary Saffron" color and press animation.
    - Verify `LotusPetalFAB` "breathes" (scales gently) when idle.
3.  **Library Interactions**:
    - Verify the "soulful" UX (smoothness, feedback) when organizing the desk.
