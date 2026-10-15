---
title: "EdLove & Gurudevi Sanctuary"
status: "active"
created: 2025-11-03
updated: 2026-10-15
author: "Naveen"
scribe: "Antigravity"
tags: [edlove, gurudevi, sanctuary, offline-first, education-commons, humane-tech]
---

# EdLove & Gurudevi Sanctuary

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-58.0.3-000020?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?logo=react)](https://reactnative.dev/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor_Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

> **"Education born from Love, built with Love."**
> 
> **Transparent Hosted — MIT Open Source.** All code is public for community audit and collaboration under the MIT License. Hosted platforms run at [edlove.org](https://edlove.org) and [gurudevi.app](https://gurudevi.app). Self-hosting is fully supported for schools, community servers, and offline local-area networks.

---

## 🌿 The Dual-Engine Ecosystem

EdLove is a civic and educational software constellation dedicated to **Education as Care Work**, non-extractive learning, and local-first institutional sovereignty:

1. **EdLove Epistemic Commons ([edlove.org](https://edlove.org))**: The public knowledge sanctuary, housing the 200 Educational Innovations archive, 6 Cosmos Paradigms, Pedagogy Canon, and the Ceylon Research Atlas. Built as an open, accessible knowledge commons with zero trackers and open AI discoverability.
2. **Gurudevi Sanctuary ([gurudevi.app](https://gurudevi.app))**: An offline-first digital haven and operational ecology for teachers, principals, students, and families. Designed for high resilience on fragile network connections, absolute privacy, and joyful, dignified classroom practice.

---

## 🏛️ Ecosystem Overview

### Applications (`apps/`)

| Application | Purpose | Real State & Environment |
| :--- | :--- | :--- |
| [**`apps/edlove-web`**](./apps/edlove-web) | **EdLove Epistemic Commons (`edlove.org`)** — Public educational philosophy, 200 Innovations Archive, 6 Cosmos Paradigms, and Ceylon Research Atlas | 223 pre-rendered static routes, high-contrast APCA typography, instant search |
| [**`apps/gurudevi-web`**](./apps/gurudevi-web) | **Gurudevi Unified Platform (`gurudevi.app`)** — Canonical browser sanctuary: public discovery + authenticated classroom, self, and school workspaces | Next.js 16 (Turbopack, Tailwind v4) with in-browser offline WASM SQLite |
| [**`apps/gurudevi-mobile`**](./apps/gurudevi-mobile) | **Gurudevi Mobile** — Daily operational mobile haven for teachers, students, and principals | Expo SDK 58 / React Native 0.88 with local SQLite offline synchronization |
| [**`apps/sanctuary-api`**](./apps/sanctuary-api) | **Sanctuary Verification Engine** — Cryptographic receipts, OpenAPI contracts, and distributed sync coordination | Lightweight, high-velocity Node.js / Hono microservice |

### Shared Domains (`packages/`)

| Domain Package | Human Role & Real State |
| :--- | :--- |
| [`@repo/core`](./packages/core) | **Ecosystem Spine**: Offline resilience, tenant boundaries, capability permissions, and cross-platform contracts |
| [`@repo/classroom`](./packages/classroom) | **Classroom Sanctuary**: Compassionate attendance, reflective gradebook, lesson plans, timetables, and student reflections |
| [`@repo/self`](./packages/self) | **Inner Sanctuary**: Private wellbeing check-ins, mindful journaling, gratitude, and personal growth |
| [`@repo/community`](./packages/community) | **Relational Commons**: Non-algorithmic teacher circles, collaborative study groups, and family announcements |
| [`@repo/library`](./packages/library) | **Open Knowledge**: Multilingual open educational resources (Sinhala, Tamil, English), clean readers, and offline collections |
| [`@repo/profile`](./packages/profile) | **Identity & Journey**: Multidimensional growth paths, living portfolios, milestone celebrations, and verified identity QR badges |
| [`@repo/admin`](./packages/admin) | **Institutional Stewardship**: Compassionate school leadership, term calendar, leave approvals, and official school reports |
| [`@repo/people`](./packages/people) | **Human Presence**: Staff directory, educator care, daily presence pulses, and guardian relationships |
| [`@repo/workforce`](./packages/workforce) | **Operational Services**: Support structures for lab assistants, maintenance teams, security, and facilities |
| [`@repo/accounting`](./packages/accounting) & [`@repo/payments`](./packages/payments) | **Ethical Stewardship**: Transparent fee management, immediate digital receipts, and non-extractive bookkeeping |
| [`@repo/scanner-kit`](./packages/scanner-kit) | **Optical Capture**: Fast, on-device QR scanning for classroom attendance and textbook resource discovery |
| [`@repo/form-builder`](./packages/form-builder) | **Community Sensing**: Flexible, multi-language surveys, field observations, and classroom climate feedback |
| [`@repo/graphics`](./packages/graphics) | **Visual Topologies**: Interactive educational knowledge trees, campus maps, and relationship diagrams |
| [`@repo/database`](./packages/database) | **Offline Storage**: Local-first SQLite persistence and cloud synchronization |
| [`@repo/editorial`](./packages/editorial) | **Editorial Publishing**: Content structures and metadata for research articles and innovations dossiers |
| [`@repo/policies`](./packages/policies) & [`@repo/schema`](./packages/schema) | **Data Governance**: Formal Cedar authorization policies and unified ZenStack schema definitions |
| [`@repo/platform-mcp`](./packages/platform-mcp) | **Sovereign Gateway**: Multi-model agentic tool gateway and codebase intelligence |
| [`@repo/ui`](./packages/ui) | **Humane Design System**: Calming, tactile NativeWind design tokens and APCA-certified accessible components |

---

## 🛡️ Guiding Invariants

* **Dignity Over Surveillance**: We believe children and teachers are living beings to be nurtured, not data points to be mined. Zero advertising trackers, zero behavioral profiling.
* **Local-First Autonomy**: A classroom never stops functioning when the internet goes down. Teaching and learning happen locally on physical devices and synchronize quietly when connections return.
* **Convivial Software**: Designed to eliminate bureaucratic paperwork and return time, energy, and joy to the human relationships that make true education possible.

---

## 🚀 Getting Started

### For Explorers & Educators
* Visit **[edlove.org](https://edlove.org)** to explore the 200 Educational Innovations and the Ceylon Research Atlas.
* Experience the web sanctuary at **[gurudevi.app](https://gurudevi.app)**.

### For Developers & Community Contributors
```bash
# 1. Clone the repository
git clone https://github.com/NeevSK/EdLove.git
cd EdLove

# 2. Install workspace dependencies
pnpm install

# 3. Start local development
pnpm dev

# Or run individual applications
pnpm --filter edlove-web dev        # EdLove Commons
pnpm --filter gurudevi-web dev      # Gurudevi Unified Web
pnpm --filter gurudevi-mobile dev   # Mobile Development Client
```

---

## 🤝 Community & Stewardship

* **Contributing**: Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) to understand our care-first contribution ethos.
* **Code of Conduct**: We hold our spaces to the [`Contributor Covenant 2.1`](./CODE_OF_CONDUCT.md).
* **Security & Vulnerabilities**: Please consult [`SECURITY.md`](./SECURITY.md) for private reporting.
* **Citation**: For academic works citing this platform, please refer to [`CITATION.cff`](./CITATION.cff).
* **License**: Released under the [MIT License](./LICENSE).

---

*"Education born from Love, built with Love."*
