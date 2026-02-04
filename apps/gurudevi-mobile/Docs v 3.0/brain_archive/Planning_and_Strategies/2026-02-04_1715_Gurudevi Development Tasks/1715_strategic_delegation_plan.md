# 📜 Gurudevi Strategic Delegation Plan
## For "Self" & "Classroom" Development

**Version**: 1.0  
**Context**: Post-Foundation (Auth, DB, & School Hierarchy Complete)  
**Purpose**: To define the "Self" and "Classroom" sections to ~70% clarity, allowing autonomous agents to execute implementation tasks with minimal context switching.

---

## 🏗️ Core Strategy: The "Sanctuary LMS"

We are building a **Learning Management System (LMS)** wrapped in a **Sanctuary Aesthetic**. 
- **Tech Stack**: React Native (Expo), Supabase, Gluestack UI.
- **Design Language**: Gentle, organic, "Lotus Metaphor" (Mud -> Water -> Bloom).
- **Architecture**: Multi-tenant, Role-based (Principal/Teacher/Student), Mobile-first.

---

## 🧘 SECTION 1: "SELF" STRATEGY (Wellbeing)

**Goal**: A personal refuge for emotional regulation and reflection. Not a productivity tool.
**Visual Style**: Calming colors (Sage, Ember), breathing animations, "Fire Journal" metaphor (burning negative thoughts).

### 1.1 MVP Scope (v0.1)
1.  **Mood Check-in**: Daily entry, simple UI (Lotus opening state), tracks emotional baseline.
2.  **Fire Journal**: Users write/record negative thoughts -> "Burn" them (visual animation) -> Thoughts are deleted or archived as "released".
3.  **Breathing**: Simple 4-7-8 breathing guide with visual pulse.

### 1.2 Data Strategy
*   **Table**: `mood_logs`
    *   `id`, `user_id`, `mood_score` (1-5), `note` (encrypted?), `created_at`.
*   **Table**: `fire_journal`
    *   `id`, `user_id`, `type` (text/audio), `content_url` (if audio), `is_burned` (boolean), `created_at`.
*   **Privacy**: STRICT RLS. `user_id = auth.uid()` ONLY. No principal access.

### 1.3 Agent Delegation Units (Tasks)

#### 🟠 Task A: Mood Check-in Component
*   **Context**: Build a standalone component for tracking mood.
*   **Input**: User ID.
*   **UI**: 5 Lotus stages (Bud -> Full Bloom). User slides/taps to select mood.
*   **Output**: Saves int (1-5) to Supabase `mood_logs`.
*   **Aesthetic**: Pure aesthetic emphasis. Smooth transitions.

#### 🟠 Task B: The Fire Journal
*   **Context**: A "venting" space.
*   **Flow**: Text Input -> User types frustration -> Hits "Burn" -> Animation of paper burning -> Text clears/saves as "released".
*   **Tech**: Reanimated for burning effect.

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
*   **Context**: The main "Classroom" tab view.
*   **Logic**:
    *   IF `student`: Query `classroom_students`.
    *   IF `teacher`: Query `classrooms` where `teacher_id = uid`.
    *   IF `principal`: Show "School Structure" (Sections -> Grades -> List).
*   **UI**: Card list with subject summaries.

#### 🔵 Task E: Lesson Feed & Creation
*   **Context**: Inside a specific classroom.
*   **Teacher Mode**: "+ Create Lesson" FAB. Form to add Title, Description, Attachments.
*   **Student Mode**: Read-only timeline of lessons. 
*   **Tech**: Supabase Storage for PDF/Image uploads.

#### 🔵 Task F: Assignment Submission Flow
*   **Context**: Student completing work.
*   **Flow**: Open Assignment -> "Submit Work" -> Camera/Gallery picker -> Upload -> "Turn In".
*   **State**: Track status (Pending -> Submitted -> Graded).

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
