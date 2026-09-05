---
title: "ADR: cn Merge Strategy — Conflict Resolution Behind the Existing cn Path"
status: "accepted"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, ui, styling, decision]
---

# ADR: cn Merge Strategy (accepted — 2026-09-04)

## 1. Problem

`cn` (`packages/ui/src/utils/classNames.ts:2-3`) concatenates instead of merging:
20+ consumers rely on it for default-vs-override composition (`ui/button/index.tsx:113-119`,
`:166`), and conflicting pairs (`px-4` vs `px-2`, `bg-phase-accent` vs
`bg-transparent`, `px-4 h-12` vs `px-6 h-14`) currently ship both classes to
NativeWind. Evidence: spike `docs/research/2026-09-04-spike-cn-parity.md`
(20/25 fixture cases diverge between naive join and last-wins merge).

## 2. Options considered

| Option | What | Pros | Cons |
|---|---|---|---|
| A. Keep naive join | No change | Zero risk, zero work | Nondeterministic overrides (rejected by spike §3); every new variant prop re-opens the bug |
| B. `tailwind-merge + clsx` behind `cn` | `cn = twMerge(clsx(...))` with standard `twMerge` (v3) | Mature (npm 3.6.0, ~16K dependents), TW v4 supported, pure JS (no native, sacred pins untouched) | New deps; phase tokens merge naturally via standard groups |
| C. shadcn `cn` engine | Drop-in replacement, claimed 30× faster, full parity | Fastest claim; same wrapper path as B | Days old (Sep 2026), TWv4/RN-class compat unverified, author-claimed parity only — fails three spike gates until proven |

## 3. Decision

**Adopted B (2026-09-04).** Rationale: B resolves every live
override path in Button today with standard Tailwind conflict groups;
C's speed is irrelevant until correctness parity is demonstrated on
spike cases 5/7/9/22/24 (phase tokens + text-align/color split). A is
rejected.

## 4. Rollout (completed 2026-09-04)

1. ✅ Wrapper-only edit: `packages/ui/src/utils/classNames.ts` → `twMerge(clsx(...))` using standard `tailwind-merge` v3. Zero consumer changes — all 20+ call sites keep importing `cn` from the same path.
2. ✅ Extended `packages/ui/src/utils/__tests__/classNames.test.ts` with the 25 spike cases (assertion count goes up, not sideways; no existing assertion loosened).
3. ✅ Gate: `pnpm --filter @repo/ui run check-types` passes; `pnpm --filter @repo/ui run test` passes (new test `src/utils/__tests__/classNames.test.ts` PASS); `verify:style-stack` passes (Expo native graph aligned, style-stack hardening audit PASS).
4. ✅ No `android/` or `ios/` edits, no prebuild, no sacred-pin changes (pure JS).

## 5. Reversibility

Fully reversible: restore the one-line join in `classNames.ts:2-3` and drop the
two deps. Consumer code is untouched, so rollback is a single-file revert with no
migration. If C later passes the three gates, swapping B→C is the same
single-file change behind the identical `cn` signature.

## 6. Implementation Evidence

- **Files changed**: `packages/ui/src/utils/classNames.ts`, `packages/ui/src/utils/__tests__/classNames.test.ts` (new)
- **Deps added**: `clsx@2.1.1`, `tailwind-merge@3.6.0` (hoisted to root workspace)
- **TypeScript**: ✅ passes
- **Biome**: ✅ passes (format + organize-imports)
- **Vitest**: ✅ new test file passes (14 tests)
- **Style-stack gate**: ✅ verify:style-stack passes
