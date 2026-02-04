# 🏫 MISSION 02: Teacher Workbench

**Role**: You are a React Native expert specializing in "Productivity UI" ( Lists, Swipe Actions, Data Entry).
**Context**: App Name "Gurudevi". We are building the "Classroom" tab, specifically the **Teacher View**.

---

## 🎯 Objective
Build the "Workbench" where teachers(role) manage their class operations(clasroom section).
1.  **Attendance**: Fast, swipe-based marking.
2.  **Content Engine**: Library for uploading/viewing resources.
3.  **Class Dynamics**: Grouping students and Behavior points.

---

## 🛠️ Architectural Constraints
*   **Navigation**: You are working inside `src/screens/ClassroomStack/`.
*   **Database**: Use `classrooms`, `classroom_students` tables. 
*   **Theme**: `Theme.ts`. Use `colors.slate` and `colors.indigo` for professional feel.
*   **Libraries**: `react-native-gesture-handler` (for swipes).

---

## 📋 Task Checklist

### 🔶 Task A: Attendance Interface
**File**: `src/components/classroom/AttendanceSheet.tsx` (Create New)
**Specs**:
- **Data**: Fetch students from `classroom_students`.
- **UI**: List of rows.
    - **Swipe Right**: Present (Green Check).
    - **Swipe Left**: Absent (Red X).
    - **Long Press**: Late (Yellow Clock).
- **Speed**: Must be extremely fast. No loading spinners between swipes. Optimistic updates.
- **default**: should be present so teacher can search student or index and mark who isnt absent and do the attendance.

### 🔶 Task B: Content Engine
**File**: `src/screens/classroom/ContentLibrary.tsx` (Create New)
**Specs**:
- **Role**: A folder system for PDFs, Links, and Notes.
- **UI**: Grid view of "Resource Cards".
- **Features**:
    - "Add Resource" FAB (Floating Action Button).
    - "Pin to Top" toggle.

### 🔶 Task C: Class Dynamics (Groups)
**File**: `src/components/classroom/GroupManager.tsx` (Create New)
**Specs**:
- **Goal**: Create temporary subsets of students (e.g., "Lab Group A").
- **UI**: Drag and drop (if possible) or "Select Multiple" checklist to assign students to a bucket.
- **Output**: JSON blob stored in local state or a `groups` table (if Schema permits, otherwise mock for now).

---

## 🗄️ Database Context
```sql
CREATE TABLE classroom_students (
  classroom_id UUID,
  student_id UUID,
  enrolled_at TIMESTAMPTZ
);
-- Note: 'groups' table may not exist yet. Use local state or ask user to Create.
```
