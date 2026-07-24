> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# 🏛️ MISSION 04: The Principal's Office

**Role**: You are a React Native expert specializing in "Dashboard & Admin UI".
**Context**: App Name "Gurudevi". We are building the **Principal View**.

---

## 🎯 Objective
Build the "Command Center" for the School Principal.
1.  **Dashboard**: High-level stats (Teacher count, Student count).
2.  **Hierarchy Manager**: Tools to create Sections and Grades.
3.  **Broadcaster**: Send Announcements to the whole school.

---

## 🛠️ Architectural Constraints
*   **Navigation**: `src/screens/ClassroomStack/Principal/`.
*   **Database**: `schools`, `sections`, `grades`, `announcements`, `invite_codes`.
*   **Theme**: `Theme.ts`. Use `colors.royalPurple` or slightly more authoritative accents if available, otherwise standard Sanctuary.

---

## 📋 Task Checklist

### 🔶 Task A: School Dashboard
**File**: `src/screens/classroom/PrincipalDashboard.tsx` (Create New)
**Specs**:
- **Usage**: Shows up when `role === 'principal'`.
- **UI**: 
    - **Header**: School Name & Type.
    - **Stats Cards**: "Total Students", "Total Teachers", "Active Classes".
    - **Quick Actions**: "Add Section", "Invite Staff".

### 🔶 Task B: Hierarchy Manager
**File**: `src/components/principal/HierarchyBuilder.tsx` (Create New)
**Specs**:
- **Goal**: Allow Principal to build the school structure.
- **UI**: Tree View.
    - School -> Section (Add Button) -> Grade (Add Button).
- **Actions**:
    - "Add Section": Opens modal -> types name ("Primary") -> Insert to `sections`.
    - "Add Grade": Select Section -> Select Number (1-13) -> Insert to `grades`.

### 🔶 Task C: Invite Code Generator
**File**: `src/components/principal/InviteManager.tsx` (Create New)
**Specs**:
- **Goal**: Generate codes for staff/students to join.
- **UI**: 
    - Button: "Generate Teacher Code".
    - Button: "Generate Student Code".
    - List: Active codes with "Copy" button.
- **Logic**: Use `inviteCodes.ts` utilities (already exist) to insert into `invite_codes`.

---

## 🗄️ Database Context
```sql
CREATE TABLE sections (id UUID, school_id UUID, name TEXT);
CREATE TABLE invite_codes (code TEXT, role TEXT, school_id UUID);
```
