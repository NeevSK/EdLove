# 🧘 MISSION 01 & 06: Self (Wellbeing) and Community Onboarding

**Role**: You are a React Native expert specializing in "Sanctuary UI" (Animations, Reanimated, Gluestack) and "Social UI & Auth Flows".
**Context**: App Name "Gurudevi". We are building the "Self" tab (personal refuge) AND completing the "Community Tab" with onboarding features.

---

## 🎯 Objective

### Part 1: Self Tab Features
Build the 3 core features of the "Self" screen:
1.  **Mood & Rhythm**: Daily lotus-slider input.
2.  **Shadow Agent**: A "Quiet Drawer" (not a chatbot) for reflection and assistant.
3.  **Fire Journal**: "Burn" negative thoughts.

### Part 2: Community & Onboarding (MISSION_06)
1.  **Community**: A place for school-wide announcements.
2.  **Onboarding**: Connect the Invite Code UI to the Signup flow.
3.  **Profile**: A visual progress bar for profile completion.

---

## 🛠️ Architectural Constraints

### Part 1: Self Tab
*   **Navigation**: You are working inside `src/screens/SelfStack/`.
*   **Database**: Use `mood_logs` and `fire_journal` tables (Schema defined below).
*   **Theme**: Strict usage of `src/constants/Theme.ts`.
    *   Primary: `Theme.colors.sanctuarySaffron`
    *   Bg: `Theme.colors.voidIndigo`
*   **Tech**: 
    *   `react-native-reanimated` (for Fire/drawer animations).
    *   `@gluestack-ui/themed` (for layout).

### Part 2: Community & Onboarding
*   **Navigation**: `src/screens/CommunityStack/`, `src/screens/AuthStack/`.
*   **Database**: `announcements`, `invite_codes`.
*   **Theme**: `Theme.ts`. Use warm community colors.

---

## 📋 Task Checklist

### PART 1: SELF TAB FEATURES

### 🔶 Task A: Mood Check-in Component
**File**: `src/components/self/MoodLotus.tsx` (Create New)
**Specs**:
- **Visual**: A slider (1-5).
    - 1 = Closed Bud (Dark)
    - 5 = Full Bloom Lotus (Glowing)
- **Action**: On change, hit Supabase `mood_logs`.
- **Privacy**: This data is strictly private. RLS handles it, but UI should feel private.

### 🔶 Task B: Shadow Agent (The Quiet Drawer)
**File**: `src/components/self/ShadowAgentDrawer.tsx` (Create New)
**Specs**:
- **Trigger**: A subtle glowing orb in the bottom-right corner of Self Screen.
- **Interaction**: Tap -> Opens a **Half-Screen Bottom Sheet**.
- **UI**: 
    - Dark, minimal text area.
    - Text appears slowly (fade-in words), not instantly.
    - "Thought Seed": Display a random question like "What is heavy today?"
- **Note**: This is NOT a chatbot connected to an API yet. Just the UI/UX.

### 🔶 Task C: Fire Journal
**File**: `src/components/self/FireJournal.tsx` (Create New)
**Specs**:
- **Input**: Large text area or "Voice" button.
- **Action**: "Burn" button.
- **Animation**: 
    - Use `Reanimated` layout transitions.
    - When burned, the text field should distort (opacity/scale) and vanish up like smoke.
- **Data**: Save to `fire_journal` with `is_burned = true`.

---

### PART 2: COMMUNITY & ONBOARDING (MISSION_06)

### 🔶 Task D: Community Announcements
**File**: `src/screens/community/AnnouncementsScreen.tsx` (Create New)
**Specs**:
- **UI**: A news feed.
    - **Pinned Posts**: At the top, distinct background color.
    - **Regular Posts**: Chronological list.
- **Author View**: If `role === 'principal'`, show "+ Create Announcement" FAB.
- **Privacy**: Only show announcements where `school_id` matches user's school.

### 🔶 Task E: Invite Code Integration
**File**: `src/screens/AuthScreen.tsx` (Modify)
**Specs**:
- **Goal**: Allow users to enter an Invite Code *before* or *during* signup.
- **Flow**:
    1.  User taps "Have an invite code?".
    2.  Opens `InviteCodeEntry` (already built).
    3.  On success, pre-fill the `school_id` and `role` in the Signup form.
    4.  Hide the "Create School" option if code is valid.

### 🔶 Task F: Profile Completion Widget
**File**: `src/components/profile/ProfileCompletionBar.tsx` (Create New)
**Specs**:
- **Placement**: Top of Profile Screen.
- **Visual**: A circular progress bar (e.g., 30%).
- **Logic**: 
    - Check if fields are null (`avatar_url`, `bio`, `phone`).
    - Calculate %.
    - If < 100%, show "Complete Profile" button.

---

## 🗄️ Database Context (Reference Only)

### Self Tab Tables
```sql
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  mood_score INTEGER,
  created_at TIMESTAMPTZ
);

CREATE TABLE fire_journal (
  id UUID PRIMARY KEY,
  content_preview TEXT,
  is_burned BOOLEAN DEFAULT false
);
```

### Community & Onboarding Tables
```sql
CREATE TABLE announcements (
  id UUID,
  school_id UUID,
  content TEXT,
  is_pinned BOOLEAN
);

CREATE TABLE invite_codes (
  id UUID,
  code TEXT UNIQUE,
  school_id UUID,
  role TEXT,
  created_by UUID,
  expires_at TIMESTAMPTZ
);
```
