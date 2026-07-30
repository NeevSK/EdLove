> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# 📜 Gurudevi Strategic Delegation Plan
## For "Self" & "Classroom" Development

**Version**: 2.0 (Master Mission Control)
**Context**: Post-Foundation (Auth, DB, & School Hierarchy Complete)  
**Purpose**: To define the "Self" and "Classroom" sections to ~90% clarity, allowing autonomous agents to execute implementation tasks with minimal context switching.

---

## 🏗️ Core Strategy: The "Sanctuary LMS"

We are building a **Learning Management System (LMS)** wrapped in a **Sanctuary Aesthetic**. 
- **Tech Stack**: React Native (Expo), Supabase, Gluestack UI.
- **Design Language**: Gentle, organic, "Lotus Metaphor" (Mud -> Water -> Bloom).
- **Architecture**: Multi-tenant, Role-based (Principal/Teacher/Student), Mobile-first.

---

## 🧘 SECTION 1: "SELF" STRATEGY (Wellbeing)

**Goal**: A personal refuge for emotional regulation and reflection.
**Visual Style**: Calming colors (Sage, Ember), "Fire Journal" metaphor.

### 1.1 MVP Scope (v0.5)
1.  **Mood & Rhythm**: Track emotion + sleep quality ("Digital Sunset").
2.  **Shadow Agent**: A "Quiet Drawer" (not a chatbot) for reflection.
3.  **Fire Journal**: Burn negative thoughts.

### 1.2 Data Strategy
*   **Table**: `mood_logs` (Strict Privacy).
*   **Table**: `fire_journal` (Strict Privacy).

### 1.3 Agent Delegation Units (Tasks)

#### 🟠 Task A: Mood & Rhythm
*   **Context**: Daily check-in.
*   **UI**: Lotus slider for Mood (1-5). Moon phase slider for Sleep Quality.
*   **Output**: Saves to `mood_logs`.

#### 🟠 Task B: The Fire Journal
*   **Context**: A "venting" space.
*   **Flow**: Type frustration -> Hit "Burn" -> Animation -> Clears.

#### 🟠 Task G: The Shadow Agent (NEW)
*   **Context**: A reflective mirror, not a bot.
*   **UI**: A subtle glowing orb in the corner.
*   **Interaction**: Tapping opens a **half-screen "Quiet Drawer"**.
*   **Behavior**: Asks questions ("Where do you feel stress?"). Slow, calming text generation.


#### 🟠 Task C: Breathing Circle
*   **Context**: Panic button / stabilization tool.
*   **UI**: Circle expands (4s) -> Holds (7s) -> Contracts (8s).
*   **Tech**: `react-native-reanimated`. No DB storage needed initially.

---

## 🏫 SECTION 2: "CLASSROOM" STRATEGY (Active Learning)

**Goal**: The "Work" space. Organized, high-clarity, hierarchy-aware.
**Structure**: Defined by the `sections` -> `grades` -> `classrooms` hierarchy we just built.

### 2.1 MVP Scope (v0.1)
1.  **Classroom List**: See enrolled/teaching classes.
2.  **Lesson Feed**: Chronological list of lessons/assignments in a class.
3.  **Content View**: PDF viewer, Video player (YouTube/Upload), Rich text.
4.  **Assignment Submission**: Photo upload / Text entry for homework.

### 2.2 Data Strategy
*   **Hierarchy Integration**:
    *   `classrooms` table links to `grades` table (foreign key).
    *   `classroom_students` linking table for enrollment.
*   **Content Model**:
    *   `lessons` (parent container).
    *   `lesson_items` (files, text chunks, videos).
*   **Permissions**: 
    *   Teacher: CRUD own class.
    *   Student: Read own class, Create submissions.
    *   Principal: Read ALL classes.

### 2.3 Agent Delegation Units (Tasks)

#### 🔵 Task D: Role-Based Classroom List
*   **Context**: The main traffic controller.
*   **Logic**:
    *   IF `student`: Query `classroom_students`.
    *   IF `teacher`: Query `classrooms`.
    *   IF `principal`: Show Hierarchy View.

#### 🔵 Task E: The Teacher Workbench (Expanded)
*   **Context**: Inside a specific classroom (Teacher View).
*   **Features**:
    1.  **Attendance**: Simple list/swipe.
    2.  **Assessment**: Create Assignment / Quiz.
    3.  **Behavior**: Award points / gaming.
    4.  **Grouping**: Create sub-groups.

#### 🔵 Task H: Grading System (NEW)
*   **Context**: Entering marks.
*   **UI**: A spreadsheet-like view or student list.
*   **Logic**: **Dual Mode** (School setting decides).
    *   Mode A: Raw Marks (0-100).
    *   Mode B: GPA (A/B/C) auto-calculated from marks.


---

## 🔄 Integration Strategy

### Role Propagation
Agents must use the **`user_role`** from our existing Auth Store to toggle UI.
*   *Snippet*: `const role = useAuthResult().user.role;`

### Navigation Hooks
All screens must respect the **5-Tab layout**.
*   Self -> `SelfStack`
*   Classroom -> `ClassroomStack`

### Theme Usage
Strict adherence to `constants/Theme.ts`.
*   `colors.sanctuarySaffron` (Primary)
*   `colors.voidIndigo` (Background)

---

## 🚀 Execution Order for Agents

1.  **Agent 1**: Build **Task A (Mood)** & **Task B (Fire Journal)**. *Why? Low dependency, pure UI.*
2.  **Agent 2**: Build **Task D (Classroom List)**. *Why? Needs the DB hierarchy we just built.*
3.  **Agent 3**: Build **Task E (Lesson Feed)**. *Why? Core value prop.*
