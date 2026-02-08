# EdLove Ecosystem

The digital sanctuary for educational transformation.

> **📚 NEW: Complete Product Requirements Document integrated!**  
> See [PRD_INTEGRATION_SUMMARY.md](PRD_INTEGRATION_SUMMARY.md) for details on Thuthimal (gratitude economy), Five-Section Architecture, and Alpha requirements.

---

## 🌟 The Structure
This monorepo houses the two lungs of the ecosystem:

### 1. [EdLove Web](apps/edlove-web) (`apps/edlove-web`)
> **"The Paradigm Cosmos"**
- **Stack**: Astro, Svelte, Tailwind
- **Purpose**: The public portal, design philosophy, and "What Could Be".
- **Run**: `cd apps/edlove-web && pnpm dev`
- **Docs**: See `apps/edlove-web/Docs/` for philosophy, design, and domain documentation

### 2. [Gurudevi Mobile](apps/gurudevi-mobile) (`apps/gurudevi-mobile`)
> **"The Operational Engine"**
- **Stack**: Expo SDK 54, React Native 0.81, Gluestack, Supabase
- **Purpose**: The mobile app for teachers, students, and principals.
- **Run**: `cd apps/gurudevi-mobile && pnpm start`
- **Status**: 73% Alpha-ready (see [FEATURE_MAPPING.md](FEATURE_MAPPING.md))

---

## 📖 Documentation Quick Links

### For Developers Starting Now
1. **[PRD_INTEGRATION_SUMMARY.md](PRD_INTEGRATION_SUMMARY.md)** - Start here! (15 min read)
2. **[ALPHA_REQUIREMENTS.md](apps/gurudevi-mobile/ALPHA_REQUIREMENTS.md)** - Implementation checklist with code examples
3. **[NEXT_ACTIONS.md](NEXT_ACTIONS.md)** - 2-week task list for Alpha launch

### For Understanding the Vision
- **[11_COMPLETE_PRD.md](apps/edlove-web/Docs/11_COMPLETE_PRD.md)** - Comprehensive product specification (45 min read)
- **[01_PHILOSOPHY.md](apps/edlove-web/Docs/01_PHILOSOPHY.md)** - "Education as Care Work" foundation
- **[06_Domain_III.md](apps/edlove-web/Docs/06_Domain_III.md)** - Gurudevi portal (with Thuthimal & Five-Section Architecture)

### For Project Management
- **[FEATURE_MAPPING.md](FEATURE_MAPPING.md)** - Gap analysis (what exists vs. what's needed)
- **[NEXT_ACTIONS.md](NEXT_ACTIONS.md)** - Prioritized tasks with effort estimates
- **[MISSION_COMPLETE_PRD_INTEGRATION.md](MISSION_COMPLETE_PRD_INTEGRATION.md)** - Executive summary

---

## 🎨 Key Innovations

### Thuthimal (තුතිමල්) - The Gratitude Economy
Anyone can gift Pro subscriptions to teachers as an act of gratitude. Past students and alumni can honor their teachers across time. Not just a payment model—a gratitude economy.

### Five-Section Architecture
- **Self** - Inner ecology (reflection, mood, wellbeing)
- **Classroom** - Operational ecology (adapts by role: teacher → class, principal → school)
- **Community** - Relational ecology (peer connections)
- **Library** - Knowledge ecology (shared resources)
- **Profile** - Identity & boundaries (settings, Thuthimal badge)

### Educational Ecology Philosophy
Polycentric, autopoietic, emergent. No surveillance. Privacy by default. Support, not control.

---

## 🛠 Setup
1. **Install Dependencies**: `pnpm install`
2. **Start Development**:
   - Web: `pnpm --filter edlove-web dev`
   - Mobile: `pnpm --filter gurudevi-mobile start`

---

## 🚀 Alpha Launch Timeline

**Current Status:** Documentation complete, ready for implementation  
**Alpha Launch:** February 22, 2026 (2 weeks)

**Week 1 (Feb 9-15):** Critical features
- Bulk student creation
- Thuthimal database + badge
- Daily motivation & "did you know?"
- Profile completion progress
- Onboarding philosophy screens

**Week 2 (Feb 16-22):** Important features
- Invitation limits (principals max 3)
- Photo upload + principal sharing
- Principal attendance dashboard
- In-app notifications
- Auto-generated QR context text

See [NEXT_ACTIONS.md](NEXT_ACTIONS.md) for detailed task breakdown.

---

## 📂 Archives
- `apps/_archive-web`: Previous Next.js iteration
- `apps/_archive-api`: Previous Fastify iteration

---

**"Education born from Love, built with Love."** 🙏
