# Gurudevi Web — Unified Browser Platform

> **Live Environment**: [gurudevi.app](https://gurudevi.app)

Gurudevi Web is the browser home of the **Gurudevi Sanctuary**. It brings together public community discovery, educational stories, and the complete authenticated workspace for teachers, school leaders, students, and families in a modern, accessible web interface.

---

## 🌸 What This Surface Delivers

* **The Public Portal**: Educational philosophies, community stories, privacy charters, and guidance for schools considering adopting Gurudevi.
* **The Living Workspaces**:
  * **Classroom Workspace**: Attendance, compassionate grading, lesson delivery, and timetable overviews.
  * **Inner Sanctuary (`/self`)**: Private journaling, mindful check-ins, and personal growth reflection.
  * **Institutional Stewardship (`/admin`)**: School structure, approvals, and official reporting.
  * **Open Library (`/library`)**: Curated regional learning resources and accessible readers.
* **In-Browser Offline Sovereignty**: Built with in-browser WASM SQLite (OPFS), allowing teachers on desktop or Chromebooks to continue working even during local power or network outages.

---

## 🎨 Craft & Accessibility Standards

* **Accessible to All**: Full compliance with APCA and WCAG contrast guidelines for effortless reading in classroom environments.
* **Browser-Native Performance**: Powered by Next.js 16 with the App Router, Turbopack, and semantic HTML without heavy native emulation wrappers.
* **Mobile-First Responsiveness**: Designed to adapt gracefully from handheld smartphones up to wide classroom smart-displays.

---

## 🚀 Running Locally

```bash
# From the repository root
pnpm --filter gurudevi-web dev
```

Visit `http://localhost:3000` in your browser.

To configure local credentials, copy `.env.example` to `.env.local` and add your local Supabase test keys.

---

## 🤝 Guidance for Contributors

* Keep visual components calm, legible, and uncluttered.
* Ensure all navigation and interactive elements can be operated cleanly with keyboard alone and assistive screen readers.
* For design tokens and shared layout blocks, utilize `@repo/ui` and `@repo/core`.
