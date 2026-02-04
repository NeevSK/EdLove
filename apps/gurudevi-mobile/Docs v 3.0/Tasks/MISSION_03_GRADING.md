# 📊 MISSION 03: Grading System

**Role**: You are a React Native expert specializing in "Data Visualization & Forms".
**Context**: App Name "Gurudevi". We are building the **Grading Module** linked to Classrooms.

---

## 🎯 Objective
Build a flexible grading system that supports both traditional (Marks) and modern (GPA) systems.
1.  **Settings**: Configure grading mode (Marks/GPA/Both).
2.  **Entry**: A fast way for teachers to input marks.
3.  **View**: A clear Gradebook for teachers and Report Card for students.

---

## 🛠️ Architectural Constraints
*   **Navigation**: `src/screens/ClassroomStack/Grading/`.
*   **Database**: `classrooms` (for settings), `assignments`, `submissions` (where grade is stored).
*   **Logic**: All grades are stored as **0-100 Integers**. GPA/Grade Letters are calculated *on read*.

---

## 📋 Task Checklist

### 🔶 Task A: Grading Settings Component
**File**: `src/components/grading/GradingSettings.tsx` (Create New)
**Specs**:
- **UI**: A Modal or Bottom Sheet.
- **Options**:
    - Mode: "Marks Only" | "GPA Only" | "Both"
    - Show Ranks: Toggle
- **Output**: Save to local component state (or Database if `classrooms` table has `settings` column - mock if not).

### 🔶 Task B: Grade Entry Form
**File**: `src/components/grading/GradeEntry.tsx` (Create New)
**Specs**:
- **Input**: Numeric keypad (0-100).
- **Feedback**: Immediate preview. 
    - If user types "85", show "A (4.0)" next to it dynamically.
- **Conversion Logic** (Sri Lankan Standard):
    - 75-100: A (4.0)
    - 65-74: B (3.0)
    - 55-64: C (2.0)
    - 45-54: D (1.0)
    - 0-44: F (0.0)

### 🔶 Task C: Gradebook View
**File**: `src/screens/grading/GradebookScreen.tsx` (Create New)
**Specs**:
- **UI**: A Table or List view.
- **Columns**: Student Name | Submitted Status | Grade.
- **Sorting**: Sort by Grade (High -> Low) or Name (A -> Z).
- **Ranks**: If "Show Ranks" is on, show "#1", "#2" badges next to top scores.

---

## 🗄️ Database Context
```sql
CREATE TABLE submissions (
  id UUID,
  assignment_id UUID,
  student_id UUID,
  grade INTEGER -- Always 0-100
);
```
