# Role → Feature Map: Self & Community

This document defines the **Convolutional Resonance** filters for each role. Logic should be pushed upstream to `@repo/core` hooks (e.g., `useRoleFeatures`) using these mappings.

## 1. Self Section (The Inner Sanctuary)
The default view and components shown when the user is in their personal "Self" tab.

| Role         | Default View Component | Primary Modules / Widgets                          |
|--------------|------------------------|----------------------------------------------------|
| **Student**  | `StudentSelfView`      | Timetable, MoodChecker, Assignments, Rewards        |
| **Teacher**  | `TeacherSelfView`      | Timetable, MoodChecker, Classroom Stats, Reflection |
| **Principal**| `PrincipalSelfView`    | School Health, Staff Moods, Feedback Inbox          |
| **Grade Head**| `GradeHeadSelfView`   | Grade Performance, Teacher Summary                 |
| **Sec. Head** | `SectionHeadSelfView` | Section Metrics, Attendance Overviews              |
| **Founder**  | `FounderSelfView`      | Network Growth, System Resonance Stats              |
| **Parent**   | `ParentSelfView`       | Child Progress, Shared Sanctuaries                  |

## 2. Community Section (The Shared Space)
Access controls for posting, group creation, and interaction.

| Role         | View Feed | Join Groups | Create Post | Create Group | Group Chat |
|--------------|-----------|-------------|-------------|--------------|------------|
| **Student**  | ✅        | ✅          | ✅ (w/ Tag) | ✅           | ✅         |
| **Teacher**  | ✅        | ✅          | ✅ (w/ Tag) | ✅           | ✅         |
| **Principal**| ✅        | ✅          | ✅ (w/ Tag) | ✅           | ✅         |
| **Founder**  | ✅        | ✅          | ✅ (w/ Tag) | ✅           | ✅         |
| **Guest**    | ✅        | View Only   | ❌ (Nudge)  | ❌ (Nudge)   | ❌         |

## 3. Classroom Section (The Learning Ground)
Restored "Sanctuary" accessibility for all.

| Role          | Full Access | Sample Access | Nudge Type             |
|---------------|-------------|---------------|------------------------|
| **Verified**  | ✅          | ✅            | Feature Tip            |
| **Incomplete**| ❌          | ✅            | Profile Completion (Glass) |
| **Guest**     | ❌          | ✅            | Sanctuary Entry (Glass)    |

---
*Note: Logic for this map resides in `@repo/core/src/hooks/useRoleFeatures.ts`*
