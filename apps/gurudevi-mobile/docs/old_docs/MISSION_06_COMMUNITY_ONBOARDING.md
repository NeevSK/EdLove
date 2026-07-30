> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# 🗣️ MISSION 06: Community & Onboarding

**Role**: You are a React Native expert specializing in "Social UI & Auth Flows".
**Context**: App Name "Gurudevi". We are building the **Community Tab** and finishing the **Onboarding**.

---

## 🎯 Objective
1.  **Community**: A place for school-wide announcements.
2.  **Onboarding**: Connect the Invite Code UI to the Signup flow.
3.  **Profile**: A visual progress bar for profile completion.

---

## 🛠️ Architectural Constraints
*   **Navigation**: `src/screens/CommunityStack/`, `src/screens/AuthStack/`.
*   **Database**: `announcements`, `invite_codes`.
*   **Theme**: `Theme.ts`. Use warm community colors.

---

## 📋 Task Checklist

### 🔶 Task A: Community Announcements
**File**: `src/screens/community/AnnouncementsScreen.tsx` (Create New)
**Specs**:
- **UI**: A news feed.
    - **Pinned Posts**: At the top, distinct background color.
    - **Regular Posts**: Chronological list.
- **Author View**: If `role === 'principal'`, show "+ Create Announcement" FAB.
- **Privacy**: Only show announcements where `school_id` matches user's school.

### 🔶 Task B: Invite Code Integration
**File**: `src/screens/AuthScreen.tsx` (Modify)
**Specs**:
- **Goal**: Allow users to enter an Invite Code *before* or *during* signup.
- **Flow**:
    1.  User taps "Have an invite code?".
    2.  Opens `InviteCodeEntry` (already built).
    3.  On success, pre-fill the `school_id` and `role` in the Signup form.
    4.  Hide the "Create School" option if code is valid.

### 🔶 Task C: Profile Completion Widget
**File**: `src/components/profile/ProfileCompletionBar.tsx` (Create New)
**Specs**:
- **Placement**: Top of Profile Screen.
- **Visual**: A circular progress bar (e.g., 30%).
- **Logic**: 
    - Check if fields are null (`avatar_url`, `bio`, `phone`).
    - Calculate %.
    - If < 100%, show "Complete Profile" button.

---

## 🗄️ Database Context
```sql
CREATE TABLE announcements (
  id UUID,
  school_id UUID,
  content TEXT,
  is_pinned BOOLEAN
);
```
