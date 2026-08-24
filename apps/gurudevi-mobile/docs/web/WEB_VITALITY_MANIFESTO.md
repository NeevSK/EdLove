---
title: "ðŸŒ¿ Web Vitality Manifesto: The Architectural Path to Resonance"
status: "active"
created: 2026-03-07
updated: 2026-03-07
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# 🌿 Web Vitality Manifesto: The Architectural Path to Resonance

*Foundational Guiding Document for the Gurudevi Web Ecosystem*

---

## 🛑 THE CORE DIRECTIVE
**"Same Reality, Different View."**
The web platform is not a mobile app on a desktop; it is the **Sanctuary's Window**. While the data (the soul) is identical across platforms, the representation must breathe the air of the browser—expansive, responsive, and premium.

---

## 🏗️ 1. ARCHITECTURAL TOPOGRAPHY (DRY & Thin)

### Mobile to web Transition
- we have developed lot of sections in web which as the sections/packages/domains. 
- now using expo router kind of tech we are making web and we only create web UI all api,hoocks,components are reusable because of tech stach.
- when developing web UI it hsould visible to user as standalone elegantly deisgn web screens whcih dont even know whether mobile screens exists or not. web should not feel like streched mobile. 
- when developing screens in web can't use any hardcoded, non functional thing. only functional UI, wired with componets,hooks and api. 
- if developing any feature for web need to create fucntionaly not just hardcode ui and functionality should be create in relevant locations and it should decoupled and sharable with both web and mobile

### The "Thin Screen" Protocol
- **Location**: All screens in `apps/gurudevi-mobile/src/screens/*.web.tsx` must be "Sensing Layers" only.
- **Rule**: NO complex business logic, NO direct API fetching inside the JSX.
- **Action**: Every section must utilize shared hooks from `@repo/[domain]`. If a hook doesn't support a requirement, upgrade the hook in the package—do not shim it in the screen.

### Dependency Boundaries
- logic: `@repo/community`, `@repo/classroom`, `@repo/library`, `@repo/self`.
- UI: `@repo/ui` (The source of truth for "Sanctuary Soul").

---

## 💎 2. THE AESTHETIC VITALITY (Premium & Breathing)

### The "Retina & Breath" Standard
- **Glassmorphism**: Use `backdrop-filter: blur(20px)` and semi-transparent backgrounds (`rgba(255,255,255,0.7)`) for all cards and sidebars.
- **Typography**: Strictly follow `Theme.fonts`. Use `h1` for sanctuary greetings, never smaller than `32px` on desktop.
- **Micro-Animations**: Staggered `FadeInDown` is mandatory for all feed items and dashboard stats.

### The "No-Brain" Prohibition
- **Static mocks are strictly forbidden.**
- If a feature is visible (e.g., "Active Classrooms" in Teacher Dashboard), it MUST be backed by a `useClassroom` hook.
- If data is unavailable, use a `SkeletonCard` or a "Coming Soon" state that resonates with the Sanctuary's hope, rather than hardcoded fake data.

---

## �️ 3. SANCTUARY NAVIGATION HIERARCHY (Top-to-Bottom)

To maintain a consistent mental model across the laptop experience, the Sidebar must follow this strict vertical order:

1.  **Self** (`Heart`): The mirror of personal growth and resonance.
2.  **Community** (`Users`): The collective sanctuary heartbeat.
3.  **Classroom** (`School`): The structured registry of learning and registry.
4.  **Library** (`Library`): The expansive curated knowledge hub.
5.  **Profile** (`User`): **Focused purely on user identity and rewards.** NO settings here.

### ⚓ The Anchor Points (Sidebar Footer)
- **Notifications**: Functional alert system above settings.
- **Settings & Role**: Located at the very bottom. This is the entry point for:
    - App Settings
    - Support & Help
    - Account Management

---

## � 4. THE AESTHETIC VITALITY (Premium & Breathing)

### I. Classroom (The Registry & Resonance)
- **Current State**: Static mocks in `TeacherDashboard.web.tsx`.
- **Vitality Path**: 
  - **Hook**: Use `useSchoolStats` for the dashboard overview (Attendance, Engagement).
  - **Hook**: Use `useClassroomRoleData` to fetch the real registry of classrooms.
  - **Real-Time**: Integrate `Presence` for active sessions via Supabase channels.
  - **Web-Native**: Use CSS Grid for the classroom registry instead of simple tables where appropriate for a "premium" card-based view.

### II. Library (The Knowledge Hub)
- **Current State**: Functional but clinical.
- **Vitality Path**:
  - **Hook**: `useLibrary` with advanced filters (search, type, subject).
  - **Interactive**: Implement "Resonant Endorsements" using `libraryAPI.endorseResource`.
  - **Web-Native**: Responsive carousels for "Trending Findings" and "Member Bookmarks."

### III. Self (The Reflection Mirror)
- **Current State**: Minimal implementation.
- **Vitality Path**:
  - **Hooks**: `useMoodLogs`, `useJournalEntries`, and `useJoyJar` for personal data wiring.
  - **Visualization**: Use CSS-based charts to visualize "Energy Forecasts" (`useEnergyForecast`).
  - **Web-Native**: Full-screen "Sanctuary Mood" overlay for deep reflection entries.

### III. Profile (Identity & Rewards)
- **Vitality Path**:
  - Remove all configuration/settings UI.
  - Implement "Rewards Resonance" (Achievements, Badges, Ecosystem gems).
  - Use expansive layouts for user bio and professional credentials.

### IV. AIAssistant (Conversational Resonance)
- **Current State**: Universal implementation.
- **Vitality Path**:
  - **UI**: Optimize spacing for large screens; implement a "Zen Mode" (minimal UI) for focused dialogue.
  - **Integration**: Link assistant insights to `Self` entries via shared `@repo/self` logic.

---

## 🛠️ 5. COMMON IMPLEMENTATION PATTERNS

### The "Horizontal Sub-Nav" Pattern (Responsiveness)
When the main sidebar is collapsed (< 1200px), use the following pattern for sub-navigation level 2:
```tsx
<div className="community-sub-nav">
   <button className={`sub-nav-item ${active ? 'active' : ''}`} ...>
      <Icon size={16} />
      <span>{t('i18n.key')}</span>
   </button>
</div>
```
- **Styles**: Defined in `SanctuaryGlobalStyles.tsx`.
- **Logic**: Use local state (`showList`) to toggle between Feed, Group Registry, and Search Index.

### The "Dynamic Card" Pattern (Performance)
- Always use `SkeletonCard` from `@repo/ui` during `loading` states.
- Ensure all cards have a `premium-card` class for consistent glassmorphism.
- Use `date-fns` for "Alive" relative timestamps (e.g., "3m ago").

---

## 📜 6. THE DEVELOPER'S OATH (Gherkin Flow)
Before implementing any web-native section:
1.  **Map the Journey**: `Given I am a [Role], When I view [Section], Then I see [Dynamic Data].`
2.  **Extract the Logic**: Move all mobile logic to shared hooks.
3.  **Breathe into the Browser**: Apply the responsive sub-nav and premium CSS.

---
*Architectural Guideline Alpha | Prepared by Antigravity* 🌿
