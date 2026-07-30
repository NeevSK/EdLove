> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# 🎒 MISSION 05: The Student Path

**Role**: You are a React Native expert specializing in "Mobile Learning UI".
**Context**: App Name "Gurudevi". We are building the **Student View**.

---

## 🎯 Objective
Build the learning interface for students.
1.  **My Path**: Use the "Classroom" tab to show a chronological feed of lessons.
2.  **Work Submission**: A flow to submit assignments.
3.  **My Goals**: The student-specific version of the "Self" tab.

---

## 🛠️ Architectural Constraints
*   **Navigation**: `src/screens/ClassroomStack/Student/`, `src/screens/SelfStack/Student/`.
*   **Database**: `classrooms`, `lessons`, `assignments`, `submissions`.
*   **Theme**: `Theme.ts`. Use clear typography and "Sanctus" aesthetic.

---

## 📋 Task Checklist

### 🔶 Task A: Lesson Feed (Timeline)
**File**: `src/screens/classroom/LessonFeed.tsx` (Create New)
**Specs**:
- **Design**: A vertical timeline or card list.
- **Content**:
    - **Lesson Card**: Title, posted date, "Read" button.
    - **Assignment Card**: Title, Due Date, "Submit" button (change color if late).
- **Logic**: Fetch from `lessons` and `assignments` tables, sort by `created_at` DESC.

### 🔶 Task B: Submission Flow
**File**: `src/components/classroom/SubmissionModal.tsx` (Create New)
**Specs**:
- **Trigger**: Tapping "Submit" on an assignment.
- **UI**: 
    - Full screen modal.
    - "Type Answer" (Text Input).
    - "Attach Photo" (Camera/Gallery picker).
    - "Turn In" Button.
- **State**: Show "Turning in..." spinner -> "Success! Sent to teacher." animation.

### 🔶 Task C: Student "Self" (Goals)
**File**: `src/components/self/StudentGoals.tsx` (Create New)
**Specs**:
- **Context**: Integrates into the main Self Screen (Mission 01) but only visible to students.
- **Features**:
    - **Goal Setter**: "I want to get an A in Math."
    - **Motivation Bar**: "Current Streak: 5 Days."
- **Data**: Use local storage or a `student_goals` table (mock if needed).

---

## 🗄️ Database Context
```sql
CREATE TABLE submissions (
  id UUID,
  assignment_id UUID, 
  student_id UUID, 
  content TEXT
);
```
