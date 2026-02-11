# 🗺️ Gurudevi Feature Definitions & Design Strategy

**Purpose**: To untangle the complexity of 5 major feature areas and align on a clear implementation path.
**Status**: Planning Phase (Design First, Code Second)

---

## 1. 🧘 The Self Section (Wellbeing Expansion)

**Current State**: Includes Venting, Rhythm, Shadow Work (basic UI exists).
**Missing**: Sleep Tracking, AI Assistant, Richer UI.

### Design Strategy
*   **Role-Specific "Self"**:
    *   **Student (The Grower)**: Focus on **Motivation & Goals**. "What do I want to achieve?" (e.g., getting 3 As).
    *   **Teacher (The Guide)**: Focus on **Balance & Resilience**. "How is my energy?"
    *   **Principal (The Visionary)**: Focus on **School Vision**. "Where are we going?" (Strategic Notes).
    *   **Universal**: Everyone gets a **Personal Task/Note List** (Private).
*   **Sleep Tracking (Rhythm)**:
    *   **Goal**: Not just hours, but *quality* of rest.
    *   **Input**: "When did you disconnect?" (Digital Sunset) + "How did you wake up?" (Energy Level).
    *   **UI**: A moon phase slider or a "closing lotus" animation.
*   **AI Shadow Assistant**:
    *   **Goal**: A localized, empathetic guide (not a generic bot).
    *   **Persona**: "Kalyana Mitra" (Noble Friend).
    *   **Tech**: RAG (Retrieval Augmented Generation) on Sri Lankan wellness texts + User's previous journals.
*   **UI Evolution**:
    *   Move from simple cards to an **immersive dashboard**.
    *   Background changes with time of day (Morning mist -> Noon brightness -> Evening glow).

### 🌓 Clarifying the "Shadow Agent" UI
It is NOT a "Chatbot". It is a **Reflective Mirror**.
*   **Visual**: A subtle, glowing orb or lotus in the corner. It doesn't pop up over content.
*   **Interaction**:
    *   **Passive**: It shows a daily "Thought Seed" (e.g., "What was difficult today?").
    *   **Active**: When tapped, it opens a **"Quiet Chat"** drawer (half-screen).
    *   **Tone**: It asks questions, it doesn't give answers. (e.g., User: "I'm stressed." -> Shadow: "Where do you feel that stress in your body?")
*   **Aesthetic**: Dark mode default. Slow text generation (mimicking thought). No "robot" sounds.

### Action Plan
1.  **Design "Digital Sunset" UI** (Simple sleep input).
2.  **Define AI Persona** (System Prompt for "Kalyana Mitra").

---

## 2. 🎭 Role-Based Screens (Principal vs Student)

**Question**: How to show different things to different people?
**Answer**: "Same Room, Different Lens."

### Strategy by Role (The 5 Lenses)
*   **Principal (The Architect)**:
    *   **View**: "School Dashboard".
    *   **Data**: Aggregated stats (Attendance %, Content Uploads, Flagged Issues).
    *   **Action**: Approve requests, Broadcast announcements.
*   **Section Head (The Steward)**:
    *   **View**: "Section Overview".
    *   **Data**: Specific metrics for Primary/Junior/Senior.
*   **Grade Head (The Captain)**:
    *   **View**: "Grade Console".
    *   **Data**: Progress across all classes in Grade 10, etc.
*   **Teacher (The Gardener)**:
    *   **View**: "Classroom Workbench".
    *   **Goal**: Match the "Requisite Variety" of a real classroom (Complex interactions).
    *   **Features**:
        1.  **Content Engine**: Lessons (Text/Audio), Resource Library (PDFs), Syllabus Planning.
        2.  **Assessment Hub**: Assignments, Quizzes (Auto-grade), Rubrics.
        3.  **Class Dynamics**:
            *   **Attendance**: Quick swipe (Present/Absent/Late).
            *   **Grouping**: Create project groups (e.g., "Science Lab Group A").
            *   **Behavior**: Positive reinforcement points (Gamified).
    *   **Action**: Create content, Grade, Monitor wellbeing signals.
*   **Student (The Learner)**:
    *   **View**: "My Path".
    *   **Data**: Upcoming tasks, My grades, My mood.
    *   **Action**: Submit work, Reflect, Learn.

### Technical Implementation
*   **Foundation**: Uses `sri_lankan_hierarchy_schema_fixed.sql` roles.
*   **Container Component**: `ClassroomScreen.tsx` (delegated to agent) acts as the traffic controller.
*   **Sub-Components**: `PrincipalDashboard.tsx`, `SectionHeadView.tsx`, `GradeHeadView.tsx`, `TeacherWorkbench.tsx`, `StudentPath.tsx`.

---

## 3. 🛡️ Teacher Agency (Privacy & Control)

**Problem**: Teachers fear being "surveilled" by Principals.
**Solution**: **"The Garden Wall"** (Privacy Settings).

### Policy Definitions
1.  **Public to School**:
    *   Syllabus used, Attendance records, Final Grades.
    *   *Why?* Institutional accountability.
2.  **Private to Classroom**:
    *   Daily lesson chats, Draft content, Student mood signals.
    *   *Why?* Psychological safety for students/teachers.
3.  **Strictly Private (Teacher Only)**:
    *   Personal "Self" journal, Draft notes, Wellness data.
    *   *Why?* Teachers need sanctuary too.

### Database Impact
*   Add `visibility` column to `lessons` and `announcements`.
*   Values: `public_school`, `private_class`, `private_me`.

---

## 4. 📊 Grading System (Dual Mode)

**Reference**: `grading_system_design.md` (Already defined).
**Core Concept**: Supports both **Traditional (0-100)** and **Modern (GPA/Levels)**.

### Capability Map
*   **Input**: Teachers enter raw marks (0-100).
*   **Processing**: System auto-calculates GPA (4.0 scale) or Grade (A/B/C) based on school policy.
*   **Output**:
    *   **Student**: Sees "A" or "85%" (based on settings).
    *   **Principal**: Sees aggregate "Pass Rates".

### Next Step
*   Build the `GradeEntryForm` component (UI only first).

---

## 5. 🏗️ Resource Management (HR & Physical)

**Scope**: This is "ERP" territory (Enterprise Resource Planning).
**Warning**: Can easily become bloat. Keep it simple.

### MVP Scope (v0.5)
1.  **Human Resources**:
    *   **Directory**: List of teachers/staff.
    *   **Roles**: Who teaches what? (Linked via `classrooms` table).
2.  **Physical Resources** (Future):
    *   **Labs/Libraries**: Booking system.
    *   **Inventory**: Count of desks/computers.

### Strategy
*   **Don't build "Inventory" yet.**
*   **Focus on "People" first.** A directory of "Who is in my school?" is high value.

---

## 🧭 The Way Forward

**Don't Panic.** Complexity is managed by **sequencing**.

**Step 1**: Let the Agent finish the **Role Navigation** (The Skeleton).
**Step 2**: We build **Teacher Agency** controls (The Trust Layer).
**Step 3**: We add **Grading** (The Utility Layer).
**Step 4**: We expand **Self** (The Soul Layer).

**Recommendation**: Let's freeze the database schema for now. The `features_schema.sql` covers 90% of this. We can add columns later. **Focus on building the UI for what we have.**
