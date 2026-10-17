# Changelog — EdLove Feature Atlas

## 2026-10-16 — First pass
- Cloned https://github.com/NeevSK/EdLove read-only to /workspace/edlove-src with all 18 remote branches (1,473 commits across all refs; first commit ab94d38e 2025-11-03 17:04 Asia/Colombo, HEAD 175c036e 2026-10-15 19:19 Asia/Colombo). Nothing pushed.
- Added `features.yaml` (source of truth), `atlas.py` (`enrich` fills git first-seen/last-touched for each feature's evidence paths; `render` writes FEATURE_ATLAS.md), and `RECOVERY_BACKLOG.md`.
- Inventory method: 94 ZenStack models (packages/schema/schema.zmodel), 2 root supabase migrations plus the app-level ones in apps/gurudevi-mobile/supabase/migrations, 39 oRPC routers in apps/sanctuary-api/src/core/router.ts, the client adapters in packages/core/src/api, Expo routes in apps/gurudevi-mobile/app, the Next routes in gurudevi-web and edlove-web, and every app, package and screen deleted in any branch's history.
- Review passes: advocate (what the code and commits claim), critic/style, then hostile. In the hostile pass, 41 features dropped from a LIVE claim to PARTIAL, UI-UNWIRED or BACKEND-ONLY. Each one is flagged ⚠ in the atlas.
- Context used: /workspace/edlove-plan/EDLOVE_INTEGRATED_PLAN.md and DEFLATION_PLAN (rule: keep the poetic names, but each name must match what the feature does). Also DATA_LAYERS_CASE_FOR/AGAINST.
- Known limits: nothing was run (no runtime or device tests). "real_data" is judged from code paths only. Many layers are still marked `?`.
- Caveat: first_seen is the oldest commit that touched the *current* evidence paths. Many features were moved into packages/* around 2026-02-19, so their real origin may be earlier. Following renames with `--follow` is a TODO.

## 2026-10-16 (pass 2, 10:08 Asia/Colombo): rebased "current state" per feature on newest evidence
- Naveen asked to base current state on main-innovate, choosing per feature by the most recent commit across main-innovate, main, main-dev, ui_dev1 and the three expo-57 branches.
- Added `refs.py`. It writes a `current_ref` field to each feature: the ref that holds the newest commit touching that feature's evidence paths, with ties going to main-innovate. Each field also lists the per-ref newest commit and whether main-innovate's content differs from main's.
- Finding: main-innovate (2d059d8f, 2026-08-03 12:18) is a strict ancestor of main (0 commits ahead, 211 behind). So main has the newest evidence for 55 of 59 features. The other 4 are LOST items whose evidence is identical on both refs; they resolve to main-innovate on the tie-break.
- Status changes: none. The chain trace and hostile checks from pass 1 still apply, because the current ref is main wherever the content differs.
- Notes added: TrubeLab is still alive and reachable on main-innovate but stays LOST (main extracted it deliberately on 2026-08-24). rn-terrain, neevsk-web and intuitui-web are likewise present on main-innovate. Editorial, Gurudevi Web and the Workforce screen don't exist on main-innovate. The unmerged codex branch commit f8253783 (Auth/Onboarding web revamp) is flagged.
- Added a visibility caveat: unpushed laptop work isn't visible to this atlas.

## 2026-10-16 (pass 3, ~10:15 Asia/Colombo): branch topology
- Added BRANCHES.md and branches.yaml covering all 18 remote branches. Each entry has tip, committer and author dates, merge-base, ahead/behind, containment, unique commits, last author and a verdict. Also added a mermaid diagram, a patch-id duplicate scan and a date-skew check.
- Verdict: main is the latest line. terrain/version-hops is the same sha. No branch has unmerged work worth recovering.
- Correction to pass 2: backlog item 17 (merging f8253783) is moot, because the same revamp landed on main as 522a910e on 2026-09-07.
- features.yaml: `current_ref` is unchanged, since main remains newest wherever the content differs.

## 2026-10-16 — Atlas v1 (full rigor, main @ 175c036e)
- Every layer now resolved from a static import/call-chain trace with file:line evidence (analysis/*.py). Manual adjudication is in analysis/overrides.py.
- 12 new features: auth-identity, offline-sync, app-settings, lessons-materials, classroom-notes, growth-ripples, calendar-events, edlove-public-site, gurudevi-marketing-legal, dev-labs, workspace-dispatch, pricing-manifest. Total is now 71.
- Counts: LIVE 5→18, PARTIAL 41→30, UI-UNWIRED 3→9, BACKEND-ONLY 3→7, LOST 7→7.
- Systemic: e383ef01 (2026-07-30 08:03) removed the REST mounts, so 92 hc call sites are unserved.
- Downgrades: community-feed and school-onboarding (LIVE→PARTIAL); notifications, admin-console and accounting (→UI-UNWIRED); presence and teacher-attendance (→BACKEND-ONLY).
- Promotions to LIVE: decision-journal, privacy-ledger, direct-messages, sacred-missions, announcements, student-potential, longitudinal-profile, principal-notes, staff-leave, thuthimal, rewards-energy.
- Added a `reviews:` field, REVIEWS.md, ROLE_MATRIX.md and first_seen_candidates (pass1/follow/concept, taking the minimum). Re-ranked RECOVERY_BACKLOG with effort.

## 2026-10-16 — Atlas v2 (capabilities + UI accounting, main @ 175c036e)
- New source file capabilities.yaml with 681 capabilities:
  - 242 api (one per procedure, 39 routers)
  - 202 direct-supabase (table × read/write/rpc)
  - 120 doc user tasks (section-role-gap-matrix.md, re-verified at HEAD)
  - 75 screen-only routes
  - 35 lost screens (all refs)
  - 7 unused i18n namespaces
- features.yaml now carries `capabilities:` (count, by_status, ids) per feature.
- Status counts: LIVE 274, PARTIAL 80, UI-UNWIRED 220, BACKEND-ONLY 42, LOST 35, UNVERIFIED 30.
- UI states: 2528 needed, 1124 existing, 1404 missing. 296 screen files: 132 wired, 72 with real API data.
- 31 tables are used by client code but exist in neither the zmodel nor any SQL file (e.g. guardian_identities, transactions, student_goals, voice_journals).
- New files: UI_COVERAGE.md, TODO_MASTER.md (713 items, M0–M7), REVIEWS_CAPABILITIES.md. Generators are in v2/ (run v2/run_all.sh).

## 2026-10-16 — Atlas v3: docs intent sweep (read-only)
- Read 3173 docs: 1771 on main, 4 plan files, 726 that exist only on other branches, and 672 deleted in history. Deduped to 1963 canonical docs.
- Extracted 9976 requirement lines and merged them into 3389 product intents. Verdicts: MATCHED 811, NEW→PLANNED 927, CONTRADICTED 211, CLAIM-UNVERIFIED 15, UNCLASSIFIED 1425.
- New status PLANNED (`source: doc` with provenance). Added 1067 PLANNED capabilities: the NEW intents plus 140 that docs claim are built but have no matching code. 265 existing capabilities now carry `doc_refs`.
- TODO_MASTER: new M8 (289 PLANNED items likely still wanted; low-confidence ones are flagged), and M7 now includes items to reconcile docs with code. New DOCS_INTENT.md. Generators are in v3/. run_all.sh now runs the whole pipeline (it uses the venv at /workspace/.venv-atlas for scikit-learn and rapidfuzz).

## 2026-10-16 — Atlas v4: evidence-first verification (read-only, main @ 175c036e)
- **Auth & onboarding, hand-verified:** 21 verified-task rows. See AUTH_ONBOARDING.md and v4/auth_domain.yaml.
  - LIVE: sign-up, sign-in, Google OAuth, magic link, web password reset, sign-out, role selection, complete onboarding, profile setup, invite redeem (incl. /c/[code]), QR generate, QR scan.
  - PARTIAL:
    - invite generation (ungated 'demo-school' fallback)
    - passkey (Expo web only)
    - guest onboarding (dead REST)
    - school creation and founder-school bond (dead REST `identity/school-founder-bond`)
  - UI-UNWIRED: invitation-welcome, account-recovery.
  - BACKEND-ONLY: TOTP.
  - PLANNED: mobile password reset.
- **PLANNED re-verification:**
  - Re-ran docs_match with word-boundary theme regexes ("feed" no longer matches feedback); PLANNED went 1067→1070.
  - Each item was code-searched (v4/build_index.py, v4/verify.py): main, 19 branches, deleted history. Records are in v4/verification.json.
  - Results: 201 merged into existing capabilities, 24 PARTIAL, 23 UI-UNWIRED, 15 BACKEND-ONLY, 3 LOST, 123 non-capabilities (NON_CAPABILITIES.yaml), 681 still PLANNED (each with a negative search record).
- **Hostile LIVE re-check** (v2/capabilities.py: nav excludes dev sources; import chain to the call site; method-level caller):
  - Of the 274 LIVE: 250 stay LIVE, 22 → UI-UNWIRED, 1 → PARTIAL.
  - Upgrades: /c/[code], notifications route and Supabase notifications read/write.
  - This corrects v1's "notification store never written". useNotifications → setUserId → loadNotifications → supabaseNotification.adapter does write it.
  - Manual overrides with evidence are in v4/manual_overrides.json.
- **Doc CONTRADICTED refs re-checked:** 82 confirmed, 4 resolved.
- **Feature themes:** 71 PLANNED items reassigned using the features of the files that matched.
- **Totals:** 1448 capabilities (LIVE 267, PARTIAL 108, UI-UNWIRED 265, BACKEND-ONLY 58, LOST 38, UNVERIFIED 30, PLANNED 682).
- **TODO_MASTER:** M8 289→175.
