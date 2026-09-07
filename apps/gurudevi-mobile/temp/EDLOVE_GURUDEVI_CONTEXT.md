# EdLove / Gurudevi — Portable Project Context

**Paste this at the start of a new chat to restore context instantly.**
Last grounded against: `EdLove-expo-57-merge-ui-dev1.zip` (repo snapshot dated 2026-08-31).
Maintained by: Neev (Naveen), building solo with heavy AI-tool assistance.

---

## 0. How to use this document

This is a living brief, not a spec. When you (Claude, or any future assistant)
load this:
1. Treat it as ground truth over training-data assumptions about "typical
   startup advice" — this project deliberately does not follow the
   lean-MVP playbook and that is an informed choice, not a mistake to correct.
2. Do not propose cutting scope (dropping a stakeholder pillar) or imposing
   an external timeline framework unless explicitly asked. See §6.
3. If code is attached in the same session, ground technical claims in the
   actual files — this doc describes the architecture as of one snapshot;
   the live repo may have moved since.
4. Flag contradictions between this doc and what you observe in code/chat —
   don't silently pick one.

---

## 1. Who & Why

- **Neev (Naveen)** — university student, Decision Sciences, University of
  Moratuwa, Sri Lanka. Independent theorist working outside formal academic
  channels on educational theory and qualitative EdTech research.
- Self-describes as a **perfectionist theorist who became a hands-on
  software builder because AI made it possible**. This is not a founder
  doing a startup for its own sake — the software is an instantiation of a
  prior theoretical commitment (see §2).
- Works solo (or effectively solo) across theory, backend, UI, and
  infrastructure, using multiple AI coding tools concurrently. This is the
  single biggest structural fact about the project — see §5.

---

## 2. The Philosophy → Product Line

- Root theoretical work: **"The Science of Teaning: What Happens In
  Between?"** — proposes *teaning* as a construct for the teacher-student
  relation, modeled via object-relations psychoanalysis + coupled-oscillator
  physics (impedance matching). Neev is the originating theorist.
- Core phrase carried into the product: **"mending the teaching-learning
  impedance match."**
- Gurudevi is explicitly positioned as **"education is a living ecology
  that thrives on care, not surveillance"** — an anti-surveillance,
  teacher-centric design stance, not a generic school-management SaaS.
- Do not treat the philosophy as branding/marketing flavor layered on top
  of a generic EdTech app. It is claimed to be architecturally load-bearing
  (drives which five pillars exist and why — see §3).

---

## 3. The Five Pillars (non-negotiable scope)

From the product's own site copy, these are structural, not features:

| Pillar | Ecology | Stakeholder |
|---|---|---|
| **Self** | Inner ecology | Teacher (sanctuary, reflection, breathing/care) |
| **Classroom** | Operational ecology | Teacher (day-to-day teaching tools) |
| **Library** | Knowledge ecology | Teacher + Student (shared lessons/resources) |
| **Community** | Relational ecology | Parent + Admin + wider community |
| **Profile** | Identity & boundaries | Student (and others) |

**Neev's explicit position:** losing any one stakeholder group (admin,
teacher, student, parent) is "losing a hand." Do not suggest dropping one
for a faster MVP. This has already been raised and rejected once — don't
re-raise it.

---

## 4. Real Build State (as of this snapshot)

**Correction of record:** the public-facing stat blocks on `edlove.org` and
`gurudevi.edlove.org` (e.g. "500+ Teachers, 20,000+ Students, 150+
Schools") are **placeholder/aspirational marketing copy, not real traction
numbers.** Confirmed directly by Neev. Do not cite them as evidence of
adoption in any analysis.

**What's actually true:**
- Backend APIs are extensively built out.
- Currently in active UI development phase.
- Both a **web client** and an **Android client** exist.
- The **Android build/startup flow has become "Frankenstein"** from
  repeated migrations.
- The "Frankenstein" feeling is described as pervasive across the
  **whole codebase**, not just Android.
- Neev holds **two snapshots**: this uploaded zip, and a separate older
  snapshot from a few days prior. These have **not been reconciled** —
  don't assume either is canonical without asking.

**Timeline (Neev's own, not externally imposed):**
- **Alpha:** Oct 6, 2026
- **Beta:** Oct 6, 2027
- He is holding this pace and will continue at it unless something
  changes his mind — his call, not a constraint to optimize around on his
  behalf.

---

## 5. Likely Root Cause of "Frankenstein" (grounded in repo evidence)

The repo shows tooling/config for **at least seven different AI coding
agents/IDEs having touched the codebase**, each with their own directory:

- `.claude/skills/` — Claude Code
- `.agents/skills/` — generic agent skill scaffold
- `.cursorrules` — Cursor
- `.windsurf/` — Windsurf
- `.trae/` — Trae
- `.idx/` — Firebase Studio / Project IDX
- `.github/copilot-instructions.md` — GitHub Copilot
- Many docs are frontmatter-tagged `scribe: opencode`, implying another
  AI tool authored/edited documentation directly.

**This is a strong, evidence-based explanation for the Frankenstein
feeling**, independent of any single technical mistake: different agents
bring different conventions, re-solve already-solved problems, and don't
share state. When diagnosing "why does X feel inconsistent," check whether
the inconsistency lines up with a tool boundary before assuming it's a
one-off bug.

The repo also has real governance scaffolding that is **installed but
incompletely filled in** — e.g. `.github/maintainer/context.md` is still
a template with unfilled brackets. This is consistent with "lots of
tooling set up, not all of it actually operating."

---

## 6. Working-Style Constraints (how to behave with Neev)

These aren't preferences to be nice about — they're the difference between
useful help and wasted turns:

1. **Do not propose scope reduction.** No "ship teacher-only alpha," no
   "defer admin/parent to beta unless data justifies it." Already tried,
   already rejected. All four stakeholders are structural.
2. **Do not impose external timeline/startup frameworks** (lean MVP,
   90-day sprints, "validate before building"). Neev sets pace himself and
   has explicitly said generic timeline plans "won't work."
3. **Give direct, honest technical diagnosis, not reassurance.** He wants
   the real state of things (e.g. "your Android build is genuinely
   broken because X") over comfort.
4. **He is technically capable** (backend largely self-built) — explain at
   a peer-engineer level, not a non-technical-founder level.
5. **He expects rigorous first-principles reasoning** over pattern-matched
   generic advice — this carries over from his academic working style.
6. **When market/consumer EdTech benchmarks come up, they usually don't
   apply here** — Gurudevi is institutional/teacher-centric, not consumer
   freemium. Don't default to D7-retention/freemium-conversion framing
   unless he's asking about a genuinely consumer-facing surface.

---

## 7. Technical Architecture (grounded in repo, snapshot 2026-08-31)

> Verify against current code before relying on specifics — this is a
> point-in-time read, and Neev has since indicated another (older,
> unreconciled) snapshot also exists.

**Monorepo:** `polymath-platform` — pnpm workspaces + Turborepo.

**Apps:**
| App | Role |
|---|---|
| `edlove-web` | The "Main House" — edlove.org hub (Astro) |
| `gurudevi-marketingWeb` | Public marketing/info site — gurudevi.edlove.org (Astro) |
| `gurudevi-mobile` | **The real product.** Expo/React Native app (teachers, students, principals) — also built for web via RN Web, deployed to `platform.gurudevi.edlove.org` |
| `sanctuary-api` | Backend API |

**Mobile/core stack:**
- Expo SDK 57, React Native 0.86, **New Architecture enabled**, TypeScript 7
- State: Zustand + TanStack Query
- Local storage: MMKV (Nitro modules)
- Offline-first sync: **PowerSync**
- ORM: **Drizzle**
- Access control: **ZenStack v3** (`.zmodel` schema files)
- Domain/API logic: `@repo/core` ("Sovereign API", Hono-based)
- UI primitives: `@repo/ui` — **rule: always import from `@repo/ui`, never
  import gluestack directly**
- Feature flags: GrowthBook · Error tracking: Sentry · Secrets: Doppler

**Sacred pinned versions (do NOT bump without explicit approval —
new-architecture compatibility depends on these exact versions):**

| Package | Version |
|---|---|
| `react-native-gesture-handler` | 3.2.1 |
| `react-native-reanimated` | 4.6.0 |
| `react-native-worklets` | 0.12.1 |
| `react-native-mmkv` | 4.3.2 |
| `react-native-nitro-modules` | 0.37.1 |
| `@shopify/react-native-skia` | 2.11.1 |
| `typescript` | 7.0.2 |

**Hard guardrails already documented in the repo's own `AGENTS.md`
(these are not my recommendations — they're existing rules already in the
codebase, restated here so they survive context loss):**
- **Never** run `expo install --fix` (downgrades pinned packages, breaks
  the build).
- **Never** run `expo prebuild --clean` without explicit approval (wipes
  `android/`/`ios/`).
- **Never hand-edit** `android/` or `ios/` — they're gitignored, ephemeral,
  regenerated from `app.json` + `plugins/*.js`. Any manual edit is silently
  destroyed on next prebuild. **This is a strong candidate for part of the
  "Android Frankenstein" feeling if anyone (human or agent) has ever
  hand-edited native files expecting it to persist.**
- Native dependency changes go through config plugins, not native code.
- Anti-slop rules apply to all code (human or AI-authored): no restating
  comments, no dead one-off abstractions, no duplicate utilities across
  `@repo/core`/`@repo/ui`/other packages, no silently-swallowed errors.

**Branch flow (merge-forward only, no rebase on long-lived branches):**
```
feature/* → main-dev → main-QA → main-preview → main
```

**Active in-progress work per the repo's own scratch notes (as of
snapshot date):** stabilizing onboarding/identity —
1. Extracting `schema.zmodel` into its own `packages/schema` to resolve
   circular dependencies between `@repo/core` and `@repo/database`.
2. Removing `any`-typed escape hatches in repositories (e.g.
   `profileRepository.ts`) in favor of generated ZenStack types.
3. Replacing manual onboarding-column checks with a proper
   `OnboardingState` state machine, and separating "Identity Provider"
   (Supabase auth) from "User Profile" (Gurudevi domain).

---

## 8. Open Items / Things to Ask Neev Before Assuming

- Which snapshot is canonical: this zip, or the "few days older" one he
  also holds? Have they diverged in ways that matter?
- Is the Android Frankenstein primarily (a) Gradle/prebuild config drift,
  (b) fallout from the sacred-version pins above, (c) leftover hand-edits
  to `android/` that keep getting wiped, or (d) something else?
- Which AI tool(s) are currently active drivers of the code vs. legacy
  configs left over from earlier phases (of the seven tool directories
  found, which are live vs. abandoned)?
- Is UI design system consistency itself in question, or specifically the
  Android build/runtime layer?

---

## 9. Related Theoretical Work (for context, not the product itself)

- **"The Science of Teaning"** paper — the philosophical/physics grounding
  for the product (§2). Kept as a separate body of work from the software.
- A separate qualitative EdTech research study (33 tools, 17 countries,
  three-cycle co-evolutionary model) — general EdTech theory, not specific
  to Gurudevi, useful for market/sector context only.
