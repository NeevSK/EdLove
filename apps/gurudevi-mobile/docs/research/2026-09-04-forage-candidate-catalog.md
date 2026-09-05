---
title: "Forage Candidate Catalog: Rationale, Use Cases, Benefits"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, catalog, decisions]
---

# Forage Candidate Catalog: Rationale, Use Cases, Benefits

Consolidates all 8 per-theme forage docs in `apps/gurudevi-mobile/docs/research/` into one decision-ready list. Pattern throughout: **leverage as foundation/baseline, then own the abstraction** (same as `cn` over primitives + NativeWind).

Workspace baseline: Expo 57.0.19, RN 0.86.2, React 19.2.3, RNGH 3.2.1, Reanimated 4.6.0, Nitro 0.37.1, Skia 2.11.1 (repo), NativeWind 5-preview.4, TanStack Query 5.102.8, Metro, turbo+pnpm, Vitest 5, Playwright 1.62.1.

## 1. Styling / UI primitive layer

| Candidate | Use case in Gurudevi | Baseline-then-own rationale | Benefit | Cost / risk | Verdict |
|---|---|---|---|---|---|
| `cn` (shadcn engine) | Replace naive `packages/ui/src/utils/classNames.ts` join with conflict-resolving merge; 20+ consumers unchanged behind same import | Spike behind existing `cn` path; own token config for `bg-phase-*` | Deterministic conflicts, zero migration | Low (pure JS) but unverified: days-old, TWv4/RN compat unknown | **Spike first** |
| `tailwind-merge + clsx` fallback | Same as above, mature resolver | Same wrapper path | Same benefit, proven | Zero native | **Fallback if cn fails parity** |
| `react-native-plain-text` | High-volume single-style lists (grades, attendance) bypassing RN text pipeline | Branded wrapper, only where profiled bottleneck | Faster text rows | Med-High: Fabric-only, early-stage, rebuild + device test | **Watch (measure first)** |
| drawably.dev / blocks.so | Sketch-kit inspiration / copy-paste registry | Copy patterns into `@repo/ui`, never as runtime dep | Design velocity | None if copied | **Copy, don't install** |
| Needs Attention triage view | Stuck/overdue items single view (teachers, workforce) | Product pattern, own implementation | UX win | Backlog cost only | **Backlog** |

## 2. Expo / native capabilities

| Candidate | Use case | Rationale | Benefit | Cost / risk | Verdict |
|---|---|---|---|---|---|
| `expo-paste-input` | Composer paste of images/GIFs/stickers | Wrapper `TextInputWrapper`, own temp-file lifecycle + allowlist | Rich composer | New native module via dev build (standard loop; Expo Go non-criterion), PDPA temp purge | **Proceed behind flag in dev build** |
| Screenmap | PR route/screen-map screenshots in CI (EAS-backed) | CI-only, zero app change; own baselines + masking | Visual evidence, zero bundle risk | EAS minutes; mask PII | **Trial on preview channel** |
| Expo Modules v2 (SDK 58) | Future native-call perf | Wait for stable; preview is implementations-only | Perf later | Pre-release canary | **Hold SDK 57** |
| Play Feb-27 thresholds (RAM/bitmap/DEX) | Store visibility hygiene | Measure vitals × RAM bucket, bitmap lifecycle, DEX% via plugin | Avoid visibility penalty | Low if hygiene now | **Do now (measure)** |

## 3. Network / data layer

| Candidate | Use case | Rationale | Benefit | Cost / risk | Verdict |
|---|---|---|---|---|---|
| Nitro Fetch | Drop-in `fetch` + prefetch + worklet mappers in one TanStack screen | `fetchFn: nitroFetch`, own caching policy; leverages sacred Nitro 0.37.1 | Prefetch, less jank | New native module + release-APK validation | **Conditional spike (profile first)** |
| `unemail` (18-provider email API) | Unified send when server email needed | Revisit when provider chosen | One API | Early-stage (274★), premature (no server email today) | **Defer** |
| Genkit | AI flows/prompts/RAG/evals if Inngest ceiling hit | Server-side spike only | Evals + flows | New runtime, PDPA sovereign-host | **Defer** |

## 4. AI search / evidence

| Candidate | Use case | Rationale | Benefit | Cost / risk | Verdict |
|---|---|---|---|---|---|
| TinyFish Search+Fetch | `$0` web evidence for `@repo/ai` (today zero search call sites) | Server proxy, 1 key, per-school budget, Supabase cache, untrusted-marked | Cheapest fleet-safe evidence | Queries leave device; cap 3–5 fetches, allowlist | **Pilot behind flag, OFF default** |
| Firecrawl keyless | JS-heavy fallback (Interact/extract) | Keyed free workspace only, never keyless from handset | JS rendering | 1k credits, no SLA | **Fallback only** |
| Monid | Broker over TinyFish | Dev-workstation CLI only, never mobile dep | Dev convenience | Extra hop; no school PII | **Dev-only** |

## 5. Agent docs / skills / QA

| Candidate | Use case | Rationale | Benefit | Cost / risk | Verdict |
|---|---|---|---|---|---|
| Docs7 / Context7 pattern | Agent-readable docs index, `llms.txt`, unanswered-query loop | Generate locally from `docs-sop`/INDEX; don't buy platform | Agent accuracy | Hosted analytics leaks if bought | **Local index first** |
| TanStack `withSkills` shape | Fix 82-skill catalog tax (today 1 in-app ref) | 1-line catalog + on-demand load, agent-side only | Context savings | Zero runtime | **Adopt pattern (no dep)** |
| `skill-doctor` habit | Mine failed sessions → SKILL diffs | Manual quarterly, generator≠verifier | Skill quality | Convo retention, scrub PII | **Process, no dep** |
| Agent screenshot triplets | Baseline/current/diff on UI PRs | Reuse `agent-device-control` + Playwright; informational then blocking | Visual QA | Device farm, mask PII | **Contract first** |
| Detail self-healing | Background bug-fix PRs on safe surfaces | Human-merge, track revert rate, sacred pins out of scope | Toil reduction | Code exfil; exclude school data | **Constrained pilot only** |
| `sling` CLI | GHA cost/latency (`bill/usage/why`) | Read-only trial, no workflow edits | Cost visibility | Zero | **Trial read-only** |

## 6. Build / tooling (no app change)

| Candidate | Verdict |
|---|---|
| Rslib 1.0, Rolldown 1.2.7, Vite 8+Oxc, Bazel, Starlight | **Track only** — Metro mandated for RN; Turbo+pnpm stays; Starlight only if docs site created |
| Vitest 5 stable, ESLint flat-config helpers | **Close out in-stack** |
| NativeScript 9.1, vgpu.sh, `react-native-effects` shaders | **No action** — incompatible / web-only / prefer Skia |

## 7. Pedagogy (no new deps)

Grade 5→9 mismatch bridge, SRL spine via reflections, one `mastered` scorer, one coasting metric, threshold-designed rollout, Sinhala offline bundle. See `2026-09-04-education-domain-pedagogy.md`. All composition/content.

## Next step

Pick spike order from Section 1–5 verdicts marked **Spike / Trial / Pilot**; each gets a time-boxed spike + ADR (problem, options, decision, rollout, reversibility). Recommended order: cn parity → TinyFish proxy → Screenmap trial → sling read-only → Nitro Fetch conditional.
