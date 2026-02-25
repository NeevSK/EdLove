# Community Ecosystem: The Social Fabric

This document outlines the design of the **Community** features within the Gurudevi platform. It focuses on the "Hearth" of the school—where connection, vision, and daily interaction happen.

For the Library and Knowledge Management, see [Library Ecosystem](./library_ecosystem.md).

## 🏗️ Core Architecture

The Community helps align the school culture through vision and interaction.

```mermaid
graph TD
    School[The Sanctuary (School)] --> Manifesto[Manifestos (Vision)]
    School --> Feed[Community Feed (Pulse)]
    School --> Groups[Groups (Circles)]

    Manifesto -->|Inspires| Feed
    Groups -->|Contribute to| Feed
```

---

## 🧩 Feature Breakdown

### 1. Sacred Missions (Manifestos)
**The "Why" of the Community.**
*   **Purpose:** To align the school community around shared values and visionary goals.
*   **Entities:** `SanctuaryManifesto`, `Endorsement`
*   **User Flow:**
    *   **Principal/Admin:** Publishes a Manifesto (e.g., "Digital Proficiency 2026").
    *   **Teachers/Students:** "Endorse" the manifesto to signal commitment.
    *   **Visibility:** Appears at the top of the Community Feed as a guiding star.

### 2. The Community Feed (Your "River of News")
**The "Pulse" of Your World.**
*   **Concept:** A personalized "Social Media" style feed.
*   **Content Source:** Aggregates posts from:
    1.  **Groups you have joined** (e.g., "Grade 10 Math", "Review Club").
    2.  **School Announcements** (Official updates).
    3.  **Inter-School Groups** (e.g., "National Science Olympiad").
*   **Why it exists:** To save you from checking 10 different groups. You see what's new *everywhere* in one place.

### 3. Groups (The "Spaces")
**The "Context" for Connection.**
*   **Concept:** Focused spaces for specific topics or squads.
*   **Why it exists:** The Feed is for *now*, Groups are for *depth*. You go to a Group to see the full history, files, and specific discussions of that squad.
*   **Types & Scope:**
    *   **Class Groups:** (School-Specific) e.g., "Grade 10B".
    *   **Clubs:** (School-Specific) e.g., "Prefects Guild".
    *   **Inter-School/Global:** (Cross-School) e.g., "All-Island Coders".
*   **Permissions:** Can be Open, Invite-Only, or Closed.

---

## 🔄 Inter-School Logic
How does the system handle "Global" vs "Local"?

| Feature | Local (My School) | Global (Inter-School) |
| :--- | :--- | :--- |
| **Feed** | Shows my school events & class updates. | Shows updates from "National Science Club" (if joined). |
| **Groups** | "Grade 11" - Only my school mates. | "React Developers" - Students from any school. |
| **Privacy** | School admins moderate. | Global admins/AI moderate. |

---

## 🔄 User Flows & Interactions

### The "Vision Cycle"
How leadership goals translate to action:

1.  **Vision (Manifesto):** Principal creates *"Eco-Friendly Campus"* manifesto.
2.  **Commitment (Endorse):** Students endorse it.
3.  **Action (Group):** Students form a *"Green Warriors"* **Group**.
4.  **Activity (Feed):** Group posts photos of their recycling drive.

---

## 📱 User Visibility Map

| Role | Manifestos | Feed | Groups |
| :--- | :--- | :--- | :--- |
| **Principal** | Create, Edit, View | Full Moderation | Manage All |
| **Teacher** | Endorse, View | Post, Answer, Grade | Create, Manage |
| **Student** | Endorse, View | Post, Comment, React | Join, Create (Appr) |
| **Guest** | View Only | View Public | View Public |

## ➕ Content Creation Flows
How does a post get into the Feed?

### 1. The Global "+" (The "Tweet" Button)
*   **Where:** Needs to be on the main Feed screen.
*   **Flow:** Tap "+" -> Write Content -> **Select Audience (Dropdown)**.
*   **Audience Options:**
    *   *My Profile (Public/Followers)*
    *   *Grade 10 Math Group*
    *   *Debate Club*
*   **Why:** Fast. You have a thought, you capture it, *then* you decide where it belongs.

### 2. The Contextual "+" (The "Group" Button)
*   **Where:** Inside a specific Group (e.g., inside "Grade 10 Math").
*   **Flow:** Tap "+" -> Write Content -> **Post**.
*   **Why:** Focused. You are already in the "Math Mindset". No need to select audience; it's auto-tagged to "Grade 10 Math".

---

## 📸 Media Types & "Reels" logic
Should we have Reels/Photos?

### 1. Photos (Essential)
*   **Use Case:** Homework evidence, whiteboard snapshots, project updates.
*   **Presentation:** Carousel style (swipe left/right) within the post.

### 2. "Shorts" / Reels (Educational Only)
*   **Concept:** "Micro-Learning" moments.
*   **Limit:** 60 seconds max.
*   **Use Case:**
    *   *Teacher:* "Quick tip for tomorrow's exam."
    *   *Student:* "Here's how I solved this physics problem."
*   **Difference from Social Media:** No algorithmic "doomscrolling". You only see shorts from *groups you follow*. It's knowledge, not entertainment.

---

## 🎨 UI/UX Enhancements
Proposed improvements to make the ecosystem intuitive.

### 1. 🧬 Feed Context Filters (The "Instagram Stories" Row)
*   **Visual:** Horizontal scroll of "Chips" at the top of the Feed.
*   **Function:**
    *   `[All Updates]` (Default)
    *   `[Grade 10]`
    *   `[Math Club]`
    *   `[School Admin]`
*   **User Value:** Instantly filter the noise. "I only want to see Math stuff right now."

### 2. 🌍 Explicit "Inter-School" Indicators
*   **Visual:** Add a small **Globe Icon 🌍** next to the group name on Post Cards.
*   **Example:** `👤 John Doe • 🌍 National Science Club`
*   **User Value:** Distinguishes "Local" (Safe, Known) vs "Global" (Public) contexts at a glance.

### 3. 🔍 "My Circles" vs "Galaxy" (Split Groups Tab)
*   **Visual:** Split the "Groups" tab into two sub-tabs:
    1.  **My Sanctuary:** Groups I am a member of (Clean list).
    2.  **Galaxy (Discover):** Marketplace for finding new Inter-school groups, clubs, or public circles.
*   **User Value:** Keeps the daily workspace clean while encouraging exploration.

### 4. 📌 "Pinned Resources" Shelf
*   **Visual:** A horizontal section at the top of a Group View, linking to 1-3 key **Library Assets**.
*   **Example:** In "Grade 10 Math", the top shelf links to "Syllabus 2026", "Formula Sheet", "Exam Schedule".
*   **User Value:** Bridges the gap between the ephemeral Feed and the permanent Library.

---

## 🔍 Search & Notifications
Critical tools for navigating the growing ecosystem.

### 1. Universal Search (Context Aware)
*   **Where:** The Magnifying Glass in the Global Header.
*   **Behavior (Context Aware):**
    *   **In Feed:** Searches people, groups, and post content.
    *   **In Group:** Searches *only* within that specific group's history.
*   **Results UI:** Sectioned results (e.g., "Groups", "Posts", "People") to avoid confusion.

### 2. Notification Center (The Signal)
*   **Where:** The Bell Icon in the Global Header.
*   **Categories:**
    *   **Mentions & Replies:** "John replied to your comment." (High Priority)
    *   **Assignments:** "Math Homework due tomorrow." (High Priority)
    *   **Group Activity:** "New post in Science Club." (Low Priority, batched).
*   **Drawer UI:** A slide-out panel (already partially implemented in `NotificationDrawer.tsx`) allows checking updates without leaving the current flow.
