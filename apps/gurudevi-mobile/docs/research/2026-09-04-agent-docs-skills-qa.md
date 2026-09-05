---
title: "Agent Docs, Skills & QA Patterns — Research (2026-09-04)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, agents, docs, qa]
---

# Agent Docs, Skills & QA Patterns — Research

## 1. Executive Summary

Six field signals (X screenshots, `C:\x\temp\`) converge on one theme: **the agent loop is growing a docs → skills → QA spine**. Docs are being re-served for agents (Docs7), skills are being lazy-loaded instead of pasted (TanStack `withSkills`), skills themselves are being linted by other skills (`skill-doctor`), agents are expected to prove UI work with screenshots/recordings and visual diffs (`agent_device`), background agents fix bugs while humans ship (Detail), and the counter-signal warns that agent-written tests decay into tautologies (Pocock / De Silva).

**Baseline verdict for Gurudevi Mobile:** we are well-instrumented for unit + web-shell e2e (vitest 5, Playwright 1.62.1, 84 vitest files, 2 e2e specs) but have **zero visual-regression assertions**, **no lazy skill-loading pattern**, and **no agent-QA screenshot contract** on PRs. The `.agents/skills` library (82 skill dirs) already contains the building blocks (`playwright`, `screenshot`, `agent-device-control`, `expo-rn-expert`, `ui-screen-audit`, `gurudevi-quality-gate`) — they are simply not wired into a QA gate.

**Recommendation in one line:** adopt the cheap halves now (skill catalog discipline + agent screenshot/visual-diff evidence on UI PRs + tautology-test lint), pilot the expensive halves later (Docs7-style agent docs, Detail-style background healing).

## 2. Sources (C:\x\temp\)

| # | File | Signal | Key claim |
|---|---|---|---|
| 1 | `Screenshot_20260904_114640_X.jpg` | Context7 **Docs7** launch | "Best way to serve documentation to agents": clean agent-readable docs, native WebMCP + skills support, AI traffic/search insights; docs reach "100,000+ active developers using Context7"; 404 smart-suggestions anti-hallucination, granular control over what agents see |
| 2 | `Screenshot_20260829_005534_X.jpg` | Ben Holmes — `/skill-doctor` v1 (`warp.dev/skill-doctor`) | "A skill that improves your skills": crawls past CC/Codex/Warp convos, scores efficiency + code quality, proposes mergeable skill diffs ("STE-100 approved"); screenshot shows suggested edits with evidence IDs (e.g. debug-port scoping, failure-signature stop-rules) |
| 3 | `Screenshot_20260829_010554_X.jpg` | TanStack `withSkills()` | "Pasting every skill into the system prompt is a tax you pay on every request." One-line catalog + `load_skill` tool; model pulls full instructions only when the task needs them; works with any provider; code sample shows `inlineSkill` + `middleware: [withSkills(pptx)]` |
| 4 | `Screenshot_20260904_114849_X.jpg` | Michał Pierzchała + @parbez — agents + `agent_device` | "Soon gonna be a commodity to have agents send screenshots and recordings of your app alongside PRs." Reply shows the artifact: visual-diff report (`auth-login`, `auth-login-home` on android) with **baseline / current / diff** triplets, "6 screen(s) changed, 12 new — informational, does not affect pass/fail" |
| 5 | `Screenshot_20260902_225304_X.jpg` | Detail — Self-Healing Software (`detail.dev`) | Evolution from monthly bug-finder to continuous self-healing: "Autonomous qualitymaxxing for your codebase"; first week free, <5 min setup; "finding bugs is easy, picking bugs that matter is hard"; PR-or-ticket delivery |
| 6 | `Screenshot_20260829_012207_X.jpg` | Matt Pocock on Emma De Silva's tautology example | Joke-fix: `echo "Tautological tests considered harmful." >> CODING_STANDARDS.md` so `/code-review` picks it up. Quoted test asserts compiled CSS contains `@media (prefers-color-scheme: dark)` + `.bg-gray-200` strings — i.e. a test that re-states the implementation instead of specifying behavior |

## 3. Baseline — Gurudevi Mobile (file:line proof)

### 3.1 Skills library (`.agents/skills`)

- 82 skill directories at repo root (counted 2026-09-04 via `Get-ChildItem`).
- Directly relevant skills, each with a `SKILL.md` entry point (verified):
  - `.agents/skills/agent-device-control/` — guided workflow for agent-device (Callstack) + Argent (SWM) controls.
  - `.agents/skills/playwright/` — browser automation skill.
  - `.agents/skills/screenshot/` — OS-level capture skill.
  - `.agents/skills/expo-rn-expert/` — Expo/React Native guidance.
  - `.agents/skills/ui-screen-audit/`, `.agents/skills/gurudevi-quality-gate/`, `.agents/skills/playwright-interactive/` — adjacent QA gates.
- Skill-usage grep (`withSkills|load_skill|skill-doctor|Docs7|agent-device|agent_device` over `apps/gurudevi-mobile`): exactly **1 hit** — `apps/gurudevi-mobile/src/boot/startupCoordinator.ts:42`, a comment noting the 10 s bootstrap deadline is "generous enough for Argent / agent-device connected-mode bridge handshake". No `withSkills`/`load_skill` pattern exists in-app; skills live at repo-root/agent level, not in the mobile runtime.

### 3.2 Docs-SOP compliance

- SOP: `apps/gurudevi-mobile/docs/docs-sop.md:1-106`.
- Mandatory frontmatter template at `docs-sop.md:80-93` (`title`, `status`, `created`, `updated`, `author`, `scribe`, `tags`); this doc follows it.
- Historical-tier naming (`YYYY-MM-DD-` prefix) per `docs-sop.md:68-74`; this file complies (`2026-09-04-agent-docs-skills-qa.md`) and sits under `apps/gurudevi-mobile/docs/research/` as a point-in-time record.
- Prior art in the same folder family uses the same convention (e.g. `docs/2026-07-17-rngh-v3-migration-analysis.md:1-7`).

### 3.3 Test stack — vitest 5 + Playwright 1.62.1, no visual regression

- Versions pinned in `apps/gurudevi-mobile/package.json:259` (`@playwright/test ^1.62.1`), `:283` (`playwright 1.62.1`), `:291` (`vitest ^5.0.0`).
- Scale: **84 vitest files** under `src/__tests__`, **2 e2e specs** (`tests/e2e/navigation.spec.ts`, `tests/e2e/web-shell.spec.ts`).
- Playwright config `apps/gurudevi-mobile/playwright.config.ts:49-94`: two Chromium projects (Pixel 5, Desktop Chrome), `screenshot: 'only-on-failure'` at `:60`, `video: 'retain-on-failure'` at `:61`, `trace: 'on-first-retry'` at `:59`. Failure forensics exist; **comparison assertions do not**.
- Visual-regression grep (`toMatchScreenshot|toHaveScreenshot|visual.*regression|screenshot.*test|expect.*screenshot`) over the app: **0 hits**.
- E2E assertions are DOM/behavioral only: `tests/e2e/web-shell.spec.ts:11-12` (`toBeVisible`, `toHaveTitle(/Gurudevi/i)`), `tests/e2e/navigation.spec.ts:19` (`toBeVisible`), `:30` / `:51` (locale `toHaveAttribute`), `:61` / `:66` (`toHaveURL`), `:79-80` (validation text `toBeVisible`).
- The only "visual" hit in unit tests is a false friend: `src/__tests__/architecture/efficiency-policy-boundaries.test.ts:20-25` asserts Skia/celebration components do **not** import `PixelRatio|PerformanceTier|DeviceUtils` — a boundary test, not a screenshot test.
- Consequence: the exact artifact in source #4 (baseline/current/diff triplets per screen) has **no counterpart** in this repo today.

## 4. Web Verification (2026-09-04)

### 4.1 Docs7 (Context7) — VERIFIED

- Product page `https://context7.com/docs7`: hosted agent-ready docs, Mintlify-compatible (`docs.json`/MDX/OpenAPI preserved), Context7 library auto-refresh on deploy, agent analytics (who read what, what was never found), autonomous docs agent (unanswered queries become reviewable PRs), WebMCP search + API playground. Team behind Context7 (Upstash) positions it as "content serving and analytics for an internet of agents".
- MCP/CLI story confirmed via `https://github.com/upstash/context7`: two modes — **CLI + Skills** (`ctx7` commands, no MCP required, `--opencode` supported) and **MCP** (`https://mcp.context7.com/mcp`, `resolve-library-id` + `query-docs` tools).
- Maps 1:1 to screenshot #1's bullets (agent-readable serving, WebMCP + skills, traffic insights). The "100,000+ developers" figure is a vendor claim in the post, not independently audited.

### 4.2 TanStack `withSkills` — VERIFIED

- Docs at `https://tanstack.com/ai/latest/docs/skills/agent-skills` + `skill-sources`: `withSkills(sources, opts)` from `@tanstack/ai-skills` renders a **one-line-per-skill catalog** in the system prompt and exposes a **`load_skill`** tool whose `name` is constrained to catalog names (model cannot invent skills). Full body (frontmatter stripped) + bundled resources load on demand; repeat loads return an "already loaded" marker.
- Details corroborating the screenshot: `maxCatalogTokens: 4000` default with reducer escape hatch; per-family catalog rendering (Anthropic `<available_skills>` XML vs Markdown); `createResourceTool` → `read_skill_resource`; scripts listed but **not executed** (host app supplies the runner); portable (any tool-calling model, no sandbox) vs Provider Skills (Anthropic container / OpenAI Responses shell, max 8, provider sandbox).
- This is the strongest directly-adoptable pattern: our 82-dir skill library is exactly the "big skill library" the token cap is designed for.

### 4.3 Detail (self-healing) — VERIFIED with caveats

- `https://detail.dev/`: "fix bugs in the background while you ship features" — clone to sandbox, exercise code with thousands of checks, "pick the top 1% you're most likely to care about", deliver PR or Linear/Jira/Asana ticket; "250+ fixed and counting".
- `https://detail.dev/about`: the "picking bugs that matter is hard" thesis verbatim (matches screenshot #5's reply); "nocturnal engineering" framing — long (hours, Runloop snapshots, hundreds of env copies per the HN post) compute-for-quality trades.
- `https://docs.detail.dev/integrations/github`: GitHub App model — read code/commits/PRs, write fix PRs (Dead Code, Doc Fixes, Pass-CI agents), auto-update on CI failure, never pushes to default branch.
- Caveats: young product, vendor-supplied fix counts, "which bugs get fixed fast" training signal is unpublished. The HN launch (`Show HN: Detail, a Bug Finder`) confirms the pivot narrative (tests → bug-finding → self-healing) but is founder-authored.

### 4.4 Not web-verified (recorded as screenshots only)

- `skill-doctor` v1 (`warp.dev/skill-doctor`) and the Pocock/Dan-Robinson replies are taken at face value from the images; no independent lookup performed per scope. Both are treated as **anecdotal signals**, not evaluated claims.

## 5. Analysis — What Each Signal Means for Gurudevi

### 5.1 Agent-readable docs (Docs7)

Our docs corpus (`docs-sop.md`, INDEX, architecture/, agent/ briefings like `MASTER_PROTOCOL.md`, `gurudevi-session-starter.md`) is human-organized and agent-*consumed* but not agent-*served*: no `llms.txt`, no version-pinned snippet endpoints, no query analytics telling us what agents fail to find. Docs7's real insight is the **feedback loop** (unanswered query → PR), not hosting per se. We can approximate 80% of the value with a generated index + snippet discipline without buying a platform.

### 5.2 Lazy skill loading (`withSkills`)

Directly applicable to agent-side work (opencode sessions), not to the mobile runtime. Our risk is the opposite of TanStack's gallery demo: 82 skills with no catalog discipline means every session either under-loads (agent misses `gurudevi-quality-gate`) or over-loads (paste everything, pay the per-request tax). The `load_skill`-on-demand shape — catalog line + constrained tool call + already-loaded marker — is worth mirroring in how we write agent briefings (short catalog up front, full protocol behind an explicit load).

### 5.3 Skill-doctor (skills that review skills)

The screenshot's evidence-linked diffs (conversation ID → observed waste → skill edit) are the mechanism our AGENTS.md anti-slop rules lack: we *declare* quality ("Generator ≠ verifier", "read deletions first") but have no automated pass that mines past sessions for skill gaps. A lightweight version — monthly review of failed/long sessions against `gurudevi-quality-gate` with proposed SKILL.md diffs — is feasible without Warp's product.

### 5.4 Agent screenshots + visual diffs (agent_device)

Highest leverage for a mobile app. The @parbez artifact (baseline/current/diff per route per platform, informational-not-blocking) is precisely the PR evidence our Playwright setup cannot produce today (§3.3). `agent-device-control` skill + Maestro dir + Playwright failure screenshots are starting points, but nothing asserts pixels. Even non-blocking informational diffs would catch the class of regressions unit tests structurally miss (themed surfaces, login sheets, feed cards).

### 5.5 Detail (background healing)

Philosophically aligned with our anti-slop stance but tensioned against it: an autonomous fixer optimizes for merged PRs, while our gate optimizes for *refused* slop. Detail's "top 1%" picker is the load-bearing component — unverifiable from outside. Interesting as a future pilot on low-risk surfaces (dead code, doc drift, Pass-CI fixes — the exact GitHub App scopes they request), not as a core QA strategy while sacred-version pins (AGENTS.md) require human judgment.

### 5.6 Tautological tests (Pocock joke, serious point)

The quoted CSS-grep test is funny because it is familiar: string-contains assertions on build output verify the compiler, not the product. Our suite has the inverse strength — behavioral DOM assertions (`toBeVisible`, `toHaveURL`, validation copy) — but shares the blind spot: **no test in §3.3 would fail if a screen rendered correctly-structured garbage**. The joke's prescription (a standards line + a review gate that enforces it) maps directly onto our `check:anti-slop` gate: add an explicit "assertion must be able to fail for a product reason" rule.

## 6. Recommendations (ordered, smallest first)

1. **Screenshot-evidence contract on UI PRs (adopt).** Require baseline/current/diff or recording for any PR touching `app/`, `features/`, `packages/ui` — mirroring source #4. Start informational (comment-only, like "does not affect pass/fail"), promote to blocking per-route once baselines stabilize. Reuses `agent-device-control` + `screenshot` + `playwright` skills.
2. **Tautology-test lint rule (adopt).** Extend the anti-slop gate: flag tests whose assertions cannot fail independently of the implementation (build-output greps, re-stated class strings, `toContain` on own output). Suggested heuristic starter set in §5.6; human review decides, tooling only flags.
3. **Skill catalog discipline (adopt).** Add a one-line catalog (name + when-to-load) atop `.agents/skills` and the `docs/agent/` briefings, mirroring `withSkills` catalog shape; keep full protocols behind explicit loads. Caps per-session context tax as the library grows past 82.
4. **Session-mining skill review, quarterly (pilot).** Manual `skill-doctor` analogue: sample longest/failed sessions, propose SKILL.md diffs with evidence links, route through the existing generator-≠-verifier review. No new vendor.
5. **Agent-readable docs index (pilot).** Generate `llms.txt`-style index + version-pinned snippet exports from the docs corpus; log unanswered agent queries (even manually at first) and convert misses into doc PRs — the Docs7 loop without the platform.
6. **Background-healing pilot on safe surfaces only (defer).** If ever: dead code + doc drift + Pass-CI fixes on non-sacred paths, human-merged, metrics on fix-revert rate. Keep sacred pins (`react-native-gesture-handler 3.2.1`, `reanimated 4.6.0`, etc. per AGENTS.md) out of autonomous scope permanently.

## 7. Risks & Open Questions

- **Visual-diff flakiness on RN surfaces** (fonts, Skia, shimmer, timestamps like the `auth-login-home` date diff in the screenshot) — needs masking/maturity before blocking.
- **Catalog drift**: a one-line catalog rots faster than full docs; needs a generator or CI check, not hand maintenance.
- **Detail's picker is unverifiable externally** — any pilot must define its own "bugs that matter" metric (revert rate, time-to-fix, engineer rating) rather than trusting vendor counts.
- **`skill-doctor`-style mining needs conversation retention** we may not have; check what opencode/Warp history is actually available before committing to cadence.
- **Docs7 analytics require traffic we route through them** — the feedback loop only works if agents actually read via the served path.

## 8. References

- Screenshots: `C:\x\temp\Screenshot_20260904_114640_X.jpg`, `C:\x\temp\Screenshot_20260829_005534_X.jpg`, `C:\x\temp\Screenshot_20260829_010554_X.jpg`, `C:\x\temp\Screenshot_20260904_114849_X.jpg`, `C:\x\temp\Screenshot_20260902_225304_X.jpg`, `C:\x\temp\Screenshot_20260829_012207_X.jpg`.
- Repo: `.agents/skills/` (82 dirs), `apps/gurudevi-mobile/docs/docs-sop.md:80-93` (frontmatter), `apps/gurudevi-mobile/package.json:259,283,291` (playwright 1.62.1, vitest 5), `apps/gurudevi-mobile/playwright.config.ts:56-62` (failure forensics), `apps/gurudevi-mobile/src/boot/startupCoordinator.ts:42` (agent-device mention), `apps/gurudevi-mobile/src/__tests__/architecture/efficiency-policy-boundaries.test.ts:20-25` (visual-boundary test).
- Web (fetched 2026-09-04): `https://context7.com/docs7`, `https://github.com/upstash/context7`, `https://tanstack.com/ai/latest/docs/skills/agent-skills`, `https://tanstack.com/ai/latest/docs/skills/skill-sources`, `https://detail.dev/`, `https://detail.dev/about`, `https://docs.detail.dev/integrations/github`.
