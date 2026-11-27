# Gurudevi Web — Browser Sanctuary & Explore Platform

> [!NOTE]
> **Repository Status: Stalled (2026-11-27)**  
> Active development on this repository is paused indefinitely because the primary maintainer is unavailable (bus factor).

> **Live Environments**: [sanctuary.gurudevi.app](https://sanctuary.gurudevi.app) · [explore.gurudevi.app](https://explore.gurudevi.app)
> *(Public landing, journal, and SEO live in `apps/gurudevi-public` at [gurudevi.app](https://gurudevi.app))*

Gurudevi Web is the browser application of the **Gurudevi Sanctuary**. It brings together the complete authenticated workspace for teachers, school leaders, students, and families, alongside the Explore showroom, in a fast, offline-capable client-side architecture.

---

## 🌸 What This Surface Delivers

* **The Explore Showroom (`explore.gurudevi.app`)**: Public guest showcase of the 11 Cultural Worlds, diurnal sky and weather scenes, and interactive workspace clearings running purely on local sample data (zero login, zero network dependency).
* **The Living Workspaces (`sanctuary.gurudevi.app`)**:
  * **Classroom Workspace**: Attendance, compassionate grading, lesson delivery, and timetable overviews.
  * **Inner Sanctuary (`/self`)**: Private journaling, mindful check-ins, and personal growth reflection.
  * **Institutional Stewardship (`/admin`)**: School structure, approvals, and official reporting.
  * **Open Library (`/library`)**: Curated regional learning resources and accessible readers.
* **Offline capability, delivered by verified slice**: Cached reads can remain available during an open-tab outage. Offline app-shell launch, restart-safe local replicas, and durable offline writes are separately gated per journey; see the [platform capability canon](../../docs/architecture/client-state-and-web-offline-capability-canon.md).

---

## 🎨 Craft & Accessibility Standards

* **Accessible to All**: Full compliance with APCA and WCAG contrast guidelines for effortless reading in classroom environments.
* **Browser-Native Performance**: Powered by Vite 8.3.5 SPA with `@tanstack/react-router` (`spa/`), Tailwind CSS v4, and semantic HTML without heavy native emulation wrappers.
* **Mobile-First Responsiveness**: Designed to adapt gracefully from handheld smartphones up to wide classroom smart-displays.

---

## 🚀 Running Locally

```bash
# Sanctuary mode (port 3000)
pnpm --filter gurudevi-web dev

# Explore mode (port 3001)
pnpm --filter gurudevi-web dev:explore
```

Visit `http://localhost:3000` or `http://localhost:3001` in your browser.

To configure local credentials, copy `.env.example` to `.env.local` and add your local Supabase test keys.

---

## 🤝 Guidance for Contributors

* Keep visual components calm, legible, and uncluttered.
* Ensure all navigation and interactive elements can be operated cleanly with keyboard alone and assistive screen readers.
* For design tokens and shared layout blocks, utilize `@repo/ui` and `@repo/core`.
