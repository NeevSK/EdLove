---
title: "Gluestack UI v5 and NativeWind v5 Stack Audit"
status: "active"
created: 2026-08-11
updated: 2026-08-12
author: "Naveen"
scribe: "Codex"
tags: [mobile, gluestack, nativewind, tailwind, migration, audit]
---

# Gluestack UI v5 and NativeWind v5 Stack Audit

Research snapshot: 2026-08-11. This is the current source of truth for the Gluestack/NativeWind migration state in `gurudevi-mobile` and the shared `@repo/ui` package.

## Executive answer

The governing implementation decision is recorded in [UI Facade and Styling Engine Decision](../decisions/2026-08-12-ui-facade-and-styling-engine-decision.md). That decision supersedes any wording in this audit that could be read as a commitment to official Gluestack v5 runtime components.

### Corrected source-provenance verdict (2026-08-12)

The previously inspected `gluestack-ui@5.0.3` package is **not the runtime component library in this repository**. The npm package is a CLI whose package metadata describes it as “A CLI tool for easily adding components from gluestack to your projects”; its `main` is `dist/index.js`, and it does not install `@gluestack-ui/themed`. The app’s public UI components are instead source-owned implementations under `packages/ui/src/components/ui/`.

This is the decisive audit result:

| Question | Repository evidence | Verdict |
| --- | --- | --- |
| Is the Gluestack v5 CLI installed? | It is no longer declared in the app/UI manifests and is absent from the current NativeWind dependency graph. | **No; optional tooling only.** |
| Are official Gluestack v5 runtime components imported by product code? | No runtime import of `@gluestack-ui/themed` exists in `packages/ui/src`, `apps/gurudevi-mobile/src`, or `apps/gurudevi-mobile/app`; only stale type declarations/documentation mention it. | **No.** |
| Are the components under the `@repo/ui/gluestack` facade official Gluestack v5 components? | `packages/ui/src/gluestack/index.tsx` re-exports local `@repo/ui/components/ui/*` files. Those files import React Native primitives and contain Gurudevi-specific behavior/tokens. | **No. They are Gurudevi-owned compatibility primitives.** |
| Is the styling engine fully NativeWind v5? | All current product-owned adapters use `styled()` from `react-native-css` via NativeWind v5; only the frozen legacy tree retains `cssInterop` from `react-native-css-interop`. | **Product-owned path: yes. Repository-wide legacy tree: deliberate hybrid.** |
| Does the `GluestackUIProvider` currently provide Gluestack v5 runtime behavior? | `packages/ui/src/gluestack/index.tsx` implements it as a local wrapper around the local `PortalProvider`; it does not import an official Gluestack provider. | **No. It is a compatibility/provider facade.** |

Therefore the precise product description is: **Gurudevi-owned UI primitives, exposed through a Gluestack-named facade, using a NativeWind v5-preview/Tailwind v4 compatibility bridge.** Calling the current runtime “official Gluestack UI v5” would be inaccurate. Calling the dependency migration “Gluestack v5 CLI/config migration plus a custom component-layer migration” is accurate.

This correction does not mean the work is useless. The source-owned facade is valuable because it gives us control over props, accessibility, visual tokens, and future engine replacement. It does mean we must not claim upstream Gluestack v5 component compatibility until we either import/port official v5 source components and verify them, or explicitly keep the current implementation as a fork/inspired-by layer.

The migration was genuinely started and committed. The July 14 migration commit upgraded the workspace to `gluestack-ui` 5.0.3, NativeWind v5 preview dependencies, Tailwind CSS 4, Expo 57, React Native 0.86, Reanimated 4, and RNGH 3. The July 17 follow-up recorded the remaining cleanup plan. The unused Gluestack CLI dependency was subsequently removed from the product graph during hardening.

It is not complete according to the current Gluestack v5/NativeWind v5 setup. The codebase is a deliberate compatibility hybrid:

- Historical Gluestack CLI package: `5.0.3`; it is no longer in the product dependency graph.
- NativeWind is pinned to `5.0.0-preview.4` in the product packages.
- Component sources: all current product-owned primitives use `styled()`; only the frozen legacy tree still uses `cssInterop` from `react-native-css-interop`.
- The old `tailwind.config.js` files still contain the product token source, while `global.css` now has the NativeWind v5 CSS-first imports and `nativewind/theme`; token migration is not complete.
- `postcss.config.mjs`, explicit `react-native-css`/PostCSS dependencies and `react-native-css-env.d.ts` now exist.
- Metro now uses the NativeWind v5 `withNativewind(config)` path; the obsolete `nativewind/babel` transform has been removed after renderer/build verification.
- The Gluestack config still points its CLI at `tailwind.config.js`.

Recommendation: keep the **Gurudevi-owned source facade** for the mobile product, but do not describe it as the official Gluestack v5 component set. Treat the selected NativeWind v5 preview path as a pinned migration stabilization project. Do not rerun `gluestack-ui upgrade` blindly in the monorepo; UniWind remains future research and NativeWind v4/Tailwind 3 remains rollback only.

Final recommendation from this audit: continue with the **product-owned facade and pinned NativeWind v5 compatibility path**, but do not claim “Gluestack UI v5 runtime” or “NativeWind v5 stable.” The web/style/type/test gates now pass; native CI/device verification remains the explicit release gate. If official Gluestack v5 source parity is required, treat that as a separate, reviewable porting project—not an assumption based on the historical `gluestack-ui` package version.

Historical checkpoint: the first browser smoke used a static server without `EXPO_PUBLIC_SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and hit the app bootstrap guard. The current Expo public-runtime bridge supplies those values; fresh credentialed production smoke renders without page errors.

## Screenshot and version-status verdict

Both attached screenshots are still valid as of this audit date, not merely historical screenshots:

| Screenshot | Current verification | Meaning |
| --- | --- | --- |
| NativeWind v5 migration announcement, dated July 1, 2025 | The live page still says v5 is available in preview and is installable as `nativewind@preview` | The announcement is a preview migration guide, not a stable-release notice. |
| NativeWind v5 overview, last updated January 10, 2026 | The live page still labels v5 “pre-release” and “not intended for production use” | NativeWind itself has not changed the public stability label. |

The screenshots therefore support the user’s concern, with one correction to the earlier audit: NativeWind v6 does have an official early RFC. It is not a release plan. The RFC says v5 must reach `latest` first, v6 will upstream roughly five or six focused changes into Yoga and React Native, migration impact is still to be determined, and there are no firm dates. We should track v6 as a long-term direction, but not wait for it or migrate toward it today.

## Discussion-thread timeline

The following timeline reads the relevant announcement, migration, interop, monorepo, and Gluestack discussions rather than treating a repository counter as a health score.

| Date | Thread and state | What the thread actually says | Gurudevi implication |
| --- | --- | --- | --- |
| Jan 30, 2025 → Sep 29, 2025 | NativeWind Tailwind v4 support question; closed, unanswered | The original question asked when Tailwind v4 would be supported. The maintainer later pointed only to the v5 installation guide. | Tailwind v4 support arrived through the preview track, not a mature v4-compatible NativeWind release. ([thread](https://github.com/nativewind/nativewind/discussions/1394)) |
| Jul 25 → Nov 28, 2025 | NativeWind Reanimated v4 support; closed | Community members worried Expo SDK 54/Reanimated v4 would block NativeWind. The maintainer later said v4 and v5 support Reanimated v4, while a later user still found Expo guidance contradictory. | Compatibility claims existed before the documentation and ecosystem experience were fully aligned. Pin exact Expo/RN/Reanimated combinations and test the real app. ([thread](https://github.com/nativewind/nativewind/discussions/1529)) |
| Aug 5–6, 2025 | NativeWind CSS interop race condition; four comments/six replies | A user reported misleading “navigation context” failures in Expo Router. They attributed the race to runtime interop parsing of `shadow-*`, opacity, and color/opacity shorthand. Another developer said they removed Tailwind shadows and used React Native styles instead. | Keep a native-style escape hatch for shadows and other high-risk utilities. This is a practical reason not to force every visual detail through the styling engine. ([thread](https://github.com/nativewind/nativewind/discussions/1537)) |
| Sep 25, 2025 → Jan 28, 2026 | Gluestack “Support for NativeWind v5”; unanswered | Gluestack initially said NativeWind v5 and UniWind support would be added once stable because both still had issues. | Gluestack’s v5 direction was waiting on the styling engines; the later stable release should not be read as proof that all engine issues disappeared. ([thread](https://github.com/gluestack/gluestack-ui/discussions/3222)) |
| Oct 2–24, 2025 | NativeWind v4→v5 migration; unanswered, eight comments/eighteen replies | Users reported unclear Babel/Metro instructions, `lightningcss` deserialization errors, missing theme/dark-mode behavior, and confusion over the active v5 branch. The maintainer said the situation was challenging due to SDK 54 compatibility and communication/coordination issues, and planned a roadmap. | This closely resembles Gurudevi’s current hybrid state. The migration requires a controlled baseline and exact lockfile, not a casual package bump. ([thread](https://github.com/nativewind/nativewind/discussions/1617)) |
| Mar 16–Apr 14, 2026 | Gluestack v5 alpha; seven comments/four replies | The alpha announcement explicitly said NativeWind v5 was still evolving and web support was not settled. A maintainer said the core was mostly stable, but NativeWind v5 and web remained the main moving parts. A user specifically asked whether UniWind would receive first-class long-term support. | Gluestack v5 was an alpha around the styling-engine decision before becoming stable. UniWind is a legitimate supported path to test, not an unofficial escape hatch. ([thread](https://github.com/gluestack/gluestack-ui/discussions/3366)) |
| Jun 16, 2026 | NativeWind v5 monorepo/worklets question; unanswered | Adding worklets in a pnpm monorepo produced a Babel config resolution failure. The example included `lightningcss: 1.30.1`, symlink settings, custom Metro roots, and Expo SDK 56. | Monorepo/Babel/worklets behavior is an independent migration axis. Gurudevi must test its workspace layout, not just a clean Expo sample. ([thread](https://github.com/nativewind/nativewind/discussions/1816)) |
| Jun 17, 2026 | NativeWind v5 release plan; four comments/two replies | The plan was to move v5 from `preview` to `latest`, audit/label blockers, cut an RC, bake it for about two weeks, then promote it. Migration-guide clarity and an LLM-assisted upgrade skill were explicitly still TODO. | The screenshot’s concern about v5 being unfinished was accurate at that point. The release process itself recognized that “stable” required a bake and blocker triage. ([thread](https://github.com/nativewind/nativewind/discussions/1818)) |
| Jul 14–27, 2026 | Follow-up comments on the v5 release plan | The maintainer said many PRs were addressed, `react-native-css` stability work had merged, and remaining v5 issues/PRs were being reviewed. The update still listed remaining issue/PR work and said the RC, migration guide, and upgrade skill were blocked by that work. | The release moved forward, but this is evidence of a compressed/active stabilization period—not a long period of production maturity. |
| Jun 17, 2026 | NativeWind v6 roadmap/RFC; zero comments | The v6 direction is performance and upstreaming: fewer NativeWind-specific mechanisms, approximately five or six focused Yoga/RN core changes, incremental RFCs, and no firm dates. The post explicitly says migration impact is TBD and v6 comes after v5 is stable. | Do not jump to v6. Design Gurudevi’s facade so the styling engine can change without changing feature code, and keep v6 out of today’s dependency plan. ([RFC](https://github.com/nativewind/nativewind/discussions/1819)) |
| Jun 25, 2026 | Gluestack v5 stable release; zero comments | Gluestack called v5 production-ready, centered it on NativeWind v5, made Expo Router first-class, revamped the CLI, and dropped Next.js/universal templates because NativeWind v5 did not support Next.js. | Gluestack v5 is viable for Gurudevi’s Expo-native direction, but its “stable” label is coupled to a styling engine that still has upstream migration risk. ([release discussion](https://github.com/gluestack/gluestack-ui/discussions/3425)) |
| Jul 15, 2026 | Gluestack large-scale-project discussion; zero comments | A user said controlled-only overlay APIs create repetitive state-management code and that they had migrated away from several Gluestack overlays. | Gluestack’s component architecture may still require Gurudevi-owned wrappers for large-product ergonomics. This strengthens the case for the existing facade. ([thread](https://github.com/gluestack/gluestack-ui/discussions/3432)) |
| Jul 17 → Jul 23, 2026 | Gluestack Modal question; answered | A Modal failed on native and web because `GluestackUIProvider` was imported but never mounted at the router root. The answer prescribed mounting the provider, keeping `global.css`, and restarting Metro. | Not every support report is a core-library defect; provider/root wiring is a major diagnostic category. Our harness must validate provider placement before opening upstream tickets. ([thread](https://github.com/gluestack/gluestack-ui/discussions/3435)) |

This timeline explains the apparent contradiction: NativeWind is active, but v5 has been a moving release train; Gluestack is stable as a component release, but its v5 architecture depends on that moving train. The right response is not panic migration. It is an owned compatibility boundary plus a measured engine choice.

## Commercial boundaries: UniWind Pro and gluestack-ui Pro

The paid products are different and should not be conflated with the open-source migration path.

| Product | Free/open-source baseline | Paid boundary | Gurudevi decision impact |
| --- | --- | --- | --- |
| UniWind | The published pricing page lists Tailwind CSS v4 bindings, Expo Go support, theming, dark mode, breakpoints, and `className` support for React Native components as Free. | UniWind Pro is advertised from $99/seat/year and adds the C++ engine, ShadowTree updates, zero re-renders, native theme transitions, Reanimated 4 through `className`, native safe-area insets, CI/CD licensing, and priority support. | Do not assume “UniWind supports Reanimated 4” means the free tier provides all Reanimated-4-powered utility behavior. Direct Reanimated v4 code may be used separately, but the Pro-only row is specifically Reanimated 4 via `className` and the native engine. Validate the free tier first; do not make Pro a hidden runtime requirement. ([UniWind pricing](https://uniwind.dev/pricing)) |
| gluestack-ui core | The core copy-paste component library, CLI, documentation, and generated source components are open-source/MIT-oriented. | gluestack-ui Pro is marketed as a premium collection of 50+ ready-to-use screens/templates, with a separate purchase/license and update window. | We do not need Pro for Gluestack v5 primitives or migration. We should not treat Pro screens as a support contract or assume they solve NativeWind/UniWind compatibility. ([gluestack-ui Pro docs](https://pro.gluestack.io/docs), [terms](https://pro.gluestack.io/terms-of-service)) |

This makes the user’s fairness concern technically reasonable: a vendor can fairly monetize a faster native engine and support, but Gurudevi should not accept a styling dependency where basic product correctness requires a recurring license. The acceptance harness must run on UniWind Free. If a required capability only works with Pro, record the recurring cost and reject or explicitly approve that dependency before adoption.

## What the upstream project says now

Gluestack UI v5 became a stable release on June 25, 2026. The release is native-first, Expo Router-oriented, and intentionally drops Next.js/universal adapters. It describes itself as copy-pasteable components rather than a conventional monolithic runtime library. See the [official v5 stable announcement](https://gluestack.io/blogs/gluestack-ui-v5-stable-release) and the [v5 installation guide](https://v5.gluestack.io/ui/docs/home/getting-started/installation).

The current [Gluestack v5 upgrade guide](https://v5.gluestack.io/ui/docs/guides/more/upgrade-to-v5) offers two styling engines:

| Engine | Scope | Configuration model | Gurudevi implication |
| --- | --- | --- | --- |
| NativeWind v5 | Expo and React Native CLI | Tailwind CSS v4, PostCSS, `react-native-css`, CSS-first theme | Closest to the path already attempted; NativeWind v5 is still documented as pre-release by NativeWind itself. |
| UniWind | Expo-only | Tailwind CSS v4, Metro plugin, no PostCSS build step | Worth a bounded spike because Gurudevi is Expo-based, but web/native behavior and monorepo integration must be proven before choosing it. |

The Gluestack project’s v5 stable announcement and current docs call the Gluestack release production-ready, but that should not be conflated with NativeWind v5 being stable. NativeWind’s own [v5 overview](https://www.nativewind.dev/v5) still labels v5 “pre-release” and “not intended for production use”; the page itself says it was last updated January 10, 2026. This is the main ecosystem risk in our current choice.

There is an additional repository-specific warning in the current Gluestack CLI documentation: in monorepo mode, the CLI notes that NativeWind v5 is not yet web-compatible and may fall back to NativeWind v4; it also notes that UniWind is not supported for monorepo Next.js setups. Gurudevi is an Expo monorepo that includes a web target, so this warning must be treated as a first-class acceptance test rather than ignored as a generic CLI note. It also reinforces the rule that the CLI’s clean-project output cannot be assumed to represent our workspace behavior. ([Gluestack CLI monorepo guidance](https://gluestack.io/ui/docs/home/getting-started/cli))

## Upstream issue and PR health

Reading only the release announcements would give an incomplete baseline. The current GitHub snapshots show active maintenance and active instability at the same time:

| Project | Current repository snapshot | Relevant open work | Interpretation |
| --- | --- | --- | --- |
| NativeWind | 42 issues, 22 open PRs, 391 closed PRs | v5 `styled()` crashing with `react-native-svg` primitives ([#1820](https://github.com/nativewind/nativewind/issues/1820)); RN 0.86/`nativewind/babel` LogBox breakage ([#1834](https://github.com/nativewind/nativewind/issues/1834)); RTL, tint, TextInput, font and CSS mapping issues; monorepo resolution work ([#1776](https://github.com/nativewind/nativewind/pull/1776), [#1842](https://github.com/nativewind/nativewind/pull/1842)) | The project is active, but v5 still has compatibility work in exactly the areas Gurudevi exercises: RN 0.86, SVG, monorepos, CSS interop and web. |
| Gluestack UI | 10 issues, 3 open PRs, 2,636 closed PRs | RN 0.86 CLI/Babel corruption ([#3421](https://github.com/gluestack/gluestack-ui/issues/3421)); v5 TypeScript server hangs in generated Toast/Modal ([#3438](https://github.com/gluestack/gluestack-ui/issues/3438)); v5 documentation still describing the old Tailwind config model ([#3444](https://github.com/gluestack/gluestack-ui/issues/3444)); web style-array crash ([#3442](https://github.com/gluestack/gluestack-ui/issues/3442)) | v5 is a real stable release with a much larger historical PR footprint, but “stable” means released/supported as a channel, not issue-free or fully documented. |

Closed items also need careful interpretation. For example, NativeWind’s closed dark-mode report was locked for lack of a reproducible case rather than proving the general class of problem impossible, and older Gluestack style-loading reports were resolved through exact version/provider/config combinations. A closed ticket is evidence about a specific reproduction and version, not a blanket compatibility guarantee.

The practical baseline is therefore: use upstream issues and PRs to build a compatibility matrix, but do not wait for every issue to close. Track the specific versions, reproductions and workarounds that affect Gurudevi, and upstream a minimal reproduction when our case is missing.

## Repository ground truth

### Migration history

The relevant history is:

| Commit | Evidence |
| --- | --- |
| `70aa905a` | Earlier Gluestack v3 migration. |
| `c0cb5c57` | Expo 57, Gluestack v5, NativeWind v5 preview, Tailwind 4, RN 0.86, Reanimated 4, and RNGH 3 dependency/config migration. |
| `02e32888` | Added the July 17 Gluestack comprehensive plan and completed associated migration files. |
| `a7a6ba1f` | Merge of the Expo 57/Gluestack v5/RNGH v3 line into the current branch history. |

The historical [July 14 migration report](./2026-07-14-gluestack-v5-migration-report.md) accurately records that a migration attempt happened, but it overstates completion and contains an incorrect description of `react-native-css-interop`. It is retained for chronology and superseded by this audit.

### Dependency and configuration matrix

| Area | Current repository state | v5 expectation | Assessment |
| --- | --- | --- | --- |
| Gluestack CLI | No longer a product dependency; the source-owned facade is the runtime | Optional `5.x` CLI for one-off component generation/migration work | Deliberately removed from the runtime graph on 2026-08-12; no product code or script imported it. |
| NativeWind | `5.0.0-preview.4` is pinned in the app, UI facade, and library package; lockfile resolves one v5 preview | NativeWind v5 preview in the official migration docs | Technically on the preview track, not a stable NativeWind release; pinning prevents preview drift. |
| React Native CSS | `react-native-css: 3.0.7` explicitly declared in app and `@repo/ui` | Required peer package for NativeWind v5 | Aligned; legacy `react-native-css-interop` remains for source compatibility. |
| Legacy CSS interop | `react-native-css-interop: 0.1.22` in app and `@repo/ui`; workspace patch; Metro runtime shims; Jest mock | NativeWind v5 says the package was renamed to `react-native-css` | Legacy bridge remains a first-class dependency. |
| Tailwind | Tailwind 4.3.0 is the only app/UI declaration after removing the unused app Tailwind 3 declaration | Tailwind CSS 4.1+ | Aligned at the package-major level; CSS token migration remains incomplete. |
| PostCSS | `@tailwindcss/postcss: 4.3.0`, `postcss: ^8.5.3`, and `postcss.config.mjs` now exist | `@tailwindcss/postcss` and a PostCSS config for NativeWind v5 | Aligned for the current v5 wiring. |
| Lightning CSS | Root `pnpm-workspace.yaml` now overrides the graph to `1.30.1` | Gluestack docs require `1.30.1` for NativeWind v5 | Aligned; clean install and native build still need confirmation. |
| Theme tokens | App and package `tailwind.config.js` still contain custom palette, spacing, radii, fonts, and phase variables; `global.css` now has CSS-first imports but not all custom tokens | Move theme tokens into `global.css` using Tailwind v4 theme layers | Partially aligned; token migration remains. |
| Type declarations | `nativewind-env.d.ts` remains and app now has `react-native-css-env.d.ts` | `react-native-css-env.d.ts` reference | App declaration aligned; shared-package declaration still needs review. |
| Babel | App includes the Expo preset and worklets plugin; `nativewind/babel` has been removed | NativeWind v5 applies its Metro runtime path without the v4 Babel transform | Aligned; verified by fixture export and production web export. |
| Metro | App uses `withNativewind(config)` and still resolves legacy CSS interop runtime files | v5 docs show `withNativewind(config)` and `react-native-css` | v5 CSS pipeline aligned; legacy runtime shims remain as an explicit bridge. |
| Gluestack CLI config | `packages/ui/gluestack-ui.json` sets `engine: nativewind` and points to `./tailwind.config.js` | v5 CLI should understand the selected engine and CSS-first setup | Needs explicit review before using CLI add/upgrade commands. |
| Component source | All product-owned adapters use `styled()`; the frozen legacy tree retains 17 registrations | `styled()` is the replacement API for reviewed custom/third-party interop | Product-owned path migrated; legacy tree intentionally frozen. |
| Library screen boundary | `packages/library/src/screens/MapScreen.tsx` uses a v5 `styled(BlurView)` boundary; the package declares NativeWind v5 and Tailwind 4 | Product packages must not carry NativeWind 4/Tailwind 3 runtime declarations | Aligned; the previous direct `cssInterop`/NativeWind 4 residue was removed on 2026-08-12. |
| Legacy surfaces | `components-legacy/` and `src/gluestack-legacy/` still exist and are referenced by legacy code/config | v5 source-owned components should be the canonical path | Cleanup remains incomplete. |

The source audit is intentionally based on tracked source and configuration, excluding archives and documentation. The exact files are [apps/gurudevi-mobile/package.json](../../package.json), [packages/ui/package.json](../../../../packages/ui/package.json), [apps/gurudevi-mobile/metro.config.js](../../metro.config.js), [apps/gurudevi-mobile/babel.config.js](../../babel.config.js), [apps/gurudevi-mobile/tailwind.config.js](../../tailwind.config.js), [packages/ui/tailwind.config.js](../../../../packages/ui/tailwind.config.js), [packages/ui/src/global.css](../../../../packages/ui/src/global.css), and [packages/ui/gluestack-ui.json](../../../../packages/ui/gluestack-ui.json).

## What was actually implemented in July

The July change was a dependency and compatibility migration, not a complete NativeWind v5 source migration. The hardening pass has since migrated the current product-owned facade path to `styled()`; old `cssInterop` registrations now remain only in the frozen legacy tree. The historical migration commit changed component imports from `nativewind` to `react-native-css-interop` as a short-term compile recovery, which explains the legacy residue.

That was a reasonable short-term recovery tactic for a moving preview ecosystem, but it should be described accurately:

1. It preserved the existing component API and avoided a broad source rewrite.
2. It left the code dependent on the legacy interop package and a local patch.
3. It did not establish the CSS-first theme source of truth.
4. It did not prove native runtime behavior on a physical device.
5. It did not remove the legacy compatibility directories.

The current [Gluestack provider facade](../../../../packages/ui/src/gluestack/index.tsx) is Gurudevi-owned and useful: product code imports from `@repo/ui/gluestack`, while the underlying primitives remain replaceable. Preserve that boundary during any next migration.

## Codemod and automation findings

### What exists

The official automated path is:

```powershell
npx gluestack-ui@latest upgrade
```

The v5 guide says this path updates dependencies, pins `lightningcss`, adds `react-native-css`, upgrades Tailwind/PostCSS, rewrites `global.css`, updates Metro, prompts about `tailwind.config.js`, and creates `react-native-css-env.d.ts`. The CLI guide documents the same sequence and warns that component files should be re-added afterward.

The `gluestack-ui@5.0.3` CLI was inspected during the audit. It includes `jscodeshift`, but its v5 upgrade function is not a general application codemod: it performs package-manager commands and targeted text/config edits, and warns that existing `components/ui` files remain on the old NativeWind version until re-added. It is therefore kept as an optional tool rather than a product dependency; the product runtime must not inherit its NativeWind 4 dependency.

### What does not exist

Neither the official Gluestack v5 guide nor the NativeWind v5 migration guide advertises a general codemod that safely converts a customized source tree from `cssInterop` to `styled()`, rewrites all Tailwind tokens, preserves product behavior, and handles monorepo aliases. No such repository-local codemod was found. The existing [gluestack-v3-migrator](../../../../scripts/refactor/gluestack-v3-migrator.mjs) is a historical v3 refactor tool, not a v5 migrator.

### Operational conclusion

Do not run the CLI upgrade from the repo root or from `apps/gurudevi-mobile` until the workspace package ownership and the generated-file overwrite boundary are understood. The CLI is designed around a conventional single project directory; Gurudevi has an app plus a source-owned shared package, custom Metro resolution, custom theme/config files, and product modifications inside the generated component paths.

If we use the CLI at all, use it only in a disposable copy or a dedicated migration branch, capture the diff, and manually port the useful output into the canonical files. Never let it delete or overwrite `packages/ui/src/components/ui` without a reviewed backup.

## Guidance, skills, and automation status

### NativeWind guidance and migration skill

NativeWind announced an LLM-support direction on February 20, 2026. The maintainer added `llm.txt` and `llm-full.txt` for the v4 docs, promised equivalent v5 support after the v5 test suite passed, and said more skills were planned. ([LLM support announcement](https://github.com/nativewind/nativewind/discussions/1703))

The June 17 v5 release-plan thread then listed an “LLM-assisted upgrade prompt/skill” as migration-guide work. The screenshot’s reply is therefore real evidence of planned automation, not evidence that a completed official migration skill already exists.

The closest concrete artifact found is [Expo Skills PR #101](https://github.com/expo/skills/pull/101), opened by the NativeWind maintainer. It updates the `expo-tailwind-setup` skill to the v5 installation docs and covers:

- `nativewind@preview` plus `react-native-css@latest` rather than stale nightly builds;
- runtime versus dev dependency separation;
- `global.css` and `nativewind/theme` setup;
- plain `withNativewind(config)`;
- Lightning CSS pinning and deserialization troubleshooting;
- `nativewind-env.d.ts`;
- optional `useCssElement` setup rather than presenting it as mandatory.

However, the PR remained open with requested changes in the current snapshot. Review feedback required plugin-version updates and splitting the skill into references because of a 500-line limit; a July 30 comment described a rebased branch with those changes, but that is still not the same as a merged, versioned, official Gurudevi-ready skill. We should use the PR as a reference checklist, not install or depend on it as an authoritative tool. ([PR timeline](https://github.com/expo/skills/pull/101))

### Gluestack guidance and automation

Gluestack’s current v5 docs are more operationally complete than the NativeWind v5 material:

- `npx gluestack-ui@latest upgrade` prompts for NativeWind v5, UniWind, or staying on the current engine;
- it edits dependencies, CSS/theme configuration, Metro/Babel/type declarations, and Lightning CSS policy;
- it explicitly tells users to re-add components after upgrading, which can overwrite customized source files;
- its CLI documentation includes a monorepo mode and engine flags, but also warns that NativeWind v5/web support is not ready for monorepos.

That is a configuration migrator, not a safe source codemod for Gurudevi’s customized components. Gluestack does have a historical v1→v2 codemod (`@gluestack-ui/v2-codemod`), but the v5 guide does not provide an equivalent general codemod for `cssInterop`→`styled()`, token conversion, custom wrappers, or monorepo aliases. ([v5 upgrade guide](https://gluestack.io/ui/docs/guides/more/upgrade-to-v5), [CLI guide](https://gluestack.io/ui/docs/home/getting-started/cli), [historical v2 codemod](https://gluestack.io/ui/docs/guides/more/upgrade-to-v2))

Gluestack also publishes a VS Code extension with component snippets, recipes, and automatic imports. That improves authoring but is not migration automation and should not be treated as a replacement for a codemod or acceptance tests. ([VS Code extension](https://gluestack.io/ui/docs/home/getting-started/vscode-extensions))

### Practical automation rule

Use upstream guidance as a checklist, not as authority to mutate the canonical workspace:

1. Copy the relevant setup steps into a disposable branch.
2. Run the CLI only against a disposable project or a reviewed migration branch.
3. Preserve a diff of every generated file and every overwritten component.
4. Manually port configuration and source changes into `@repo/ui`.
5. Keep a repo-local migration note with exact package versions, engine choice, and known workarounds.
6. Do not claim “codemod complete” unless the transformed source and all behavior gates pass.

## NativeWind v5 changes that matter to Gurudevi

The official [NativeWind v5 migration guide](https://www.nativewind.dev/blog/v5-migration-guide) and [v4-to-v5 guide](https://www.nativewind.dev/v5/guides/migrate-from-v4) identify these behavior changes:

- `react-native-css-interop` becomes `react-native-css` and is a peer dependency.
- The old JSX transform is replaced by import rewrites, including rewrites toward `react-native-css/react-native`.
- `cssInterop` and `remapProps` are deprecated and replaced by `styled()` for the cases that need explicit interop.
- Tailwind v4 moves configuration toward CSS-first theme definitions.
- `nativewind/theme` functions are removed in the CSS-first path and replaced by CSS functions/custom CSS.
- `shadow-*`, line-height parsing, `rem`, dynamic mapping modifiers, animations, and some utility names change behavior.
- NativeWind v5 requires Tailwind CSS 4.1+, React Native 0.81+, the New Architecture, and Reanimated 4+ according to its migration guide.

Gurudevi’s Expo 57/RN 0.86/Reanimated 4 baseline is directionally compatible with those prerequisites. That does not prove that the current Metro/Babel/monorepo setup is compatible; the legacy interop bridge and dual Tailwind versions are the unresolved risks.

### What `cssInterop` means for this repository

`cssInterop` is not an unused or invented Gurudevi dependency. It is a public NativeWind v4 API used by existing Gluestack components and still present in NativeWind’s v5 documentation for complex third-party components. NativeWind v5 deprecates it in favor of `styled()`, but the upstream repository still has active compatibility work involving the old `react-native-css-interop` package and `cssInterop` behavior. That explains why a July migration could retain it as a bridge while the rest of the v5 architecture was unsettled.

The correct interpretation is:

- Native primitives that receive the normal `className` mapping should follow the selected engine’s default import-rewrite path.
- New explicit third-party mappings should prefer `styled()` once the v5 path is proven.
- Existing `cssInterop` wrappers should be migrated one primitive at a time, with ref, event, style-array, SVG prop, dark-mode and web checks.
- A global search-and-replace from `cssInterop` to `styled()` is unsafe. The option shape may look similar, but prop flow and global registration behavior can change.

So yes, other developers and upstream code still depend on it; no, that is not a reason to keep it as Gurudevi’s long-term public API. Treat it as a compatibility surface with an explicit exception list and a removal plan.

## Adoption and developer-experience evidence

Gluestack is used, but v5 is young and its usage signal is not the same as mature-library adoption:

| Signal | Snapshot | Interpretation |
| --- | --- | --- |
| GitHub repository | About 5.2k stars and 230 forks on the current repository page | Meaningful ecosystem interest, but not a production-user count. |
| npm `gluestack-ui` | About 3,925 weekly downloads; v5.0.3 showed 1,738 downloads in the last 7 days on the npm page | Real usage, but small relative to mainstream React Native styling packages and still concentrated around a recently published release. |
| NativeWind npm | About 1.2M weekly downloads, but the public `latest` package page still reports v4.2.6 | NativeWind v4 is broadly used; this does not establish that NativeWind v5 preview is broadly production-proven. |
| Gluestack GitHub discussions | A “support for NativeWind v5” discussion was visible and unanswered in the community snapshot | Evidence of active migration uncertainty during the preview period. |
| Issue reports | Users have reported styles not loading after Gluestack/Expo upgrades, and fixes commonly involve exact NativeWind/CSS interop versions and root CSS/provider imports | Version alignment and bootstrap order are recurring failure modes. |
| Practitioner reports | Reddit and Stack Overflow reports include documentation/version confusion, styling conflicts, and some teams removing NativeWind or preferring owned primitives | Useful qualitative warning, not statistically representative evidence. |

The [Gluestack GitHub repository](https://github.com/gluestack/gluestack-ui) confirms the source-owned/copy-paste model and the approximate star/fork counts. The [npm package page](https://www.npmjs.com/package/gluestack-ui?activeTab=versions) provides the download snapshot. For experience reports, see the [style-loading issue](https://github.com/gluestack/gluestack-ui/issues/3239), the [NativeWind v5 migration discussion](https://github.com/nativewind/nativewind/discussions/1617), and the [Stack Overflow provider/style-loading question](https://stackoverflow.com/questions/79664766/classname-stylings-are-not-getting-applied-in-react-native-using-gluestack-and-n).

There is also a historical supply-chain lesson: the 2025 compromise of Gluestack-associated React Native accessibility packages was reported by [CERT-EU](https://cert.europa.eu/publications/threat-intelligence/cb25-07/pdf). That incident is not evidence that the current `gluestack-ui` 5.0.3 CLI is malicious, and it does not decide the UI architecture. It does mean Gurudevi should continue to use the committed pnpm lockfile, review package provenance/patches, avoid unnecessary transitive packages, and treat generated CLI output as source code requiring review.

## Stack decision for Gurudevi

### The three decisions that are being confused

Gurudevi does not need to choose one vendor for every UI concern. These are separate layers:

| Layer | What it decides | Recommended Gurudevi boundary |
| --- | --- | --- |
| Component/accessibility primitives | Modal, Input, Select, Toast, Button behavior and semantics | Gluestack source-owned primitives, wrapped behind `@repo/ui/gluestack` |
| Styling engine/compiler | How classes, themes, variants and CSS are translated to native/web styles | Exactly one: NativeWind, UniWind, Tamagui, or direct styles per package boundary |
| Motion and native behavior | Reanimated transitions, gestures, measurement and device APIs | Direct Reanimated 4/RNGH code; do not make the styling engine own animation architecture |
| Escape hatch | Shadows, SVG, platform quirks, high-risk styles | React Native `StyleSheet`/inline styles inside the primitive implementation |
| Web target | Bundler, routing and SSR model | Currently Expo Router + `react-native-web` through Expo Metro; Next.js is not in this repository |

The safe combination is therefore “Gluestack components + one styling engine + direct native escape hatches.” The unsafe combination is putting NativeWind, UniWind and Unistyles/Tamagui on the same component path and hoping their compilers agree. A component may use direct Reanimated or `StyleSheet` for a special case, but it should not receive competing utility-style transforms from multiple engines.

### What “web support” means here

There are two different claims hidden behind the word “web”:

1. **Expo Web:** Expo Router and `react-native-web` bundle the React Native component tree for a browser. This is Gurudevi’s current model; the repository has `expo-router`, `react-native-web`, `.web` files and no Next.js dependency in the app/workspace manifests.
2. **Next.js/universal web:** Next.js owns routing/building and may require SSR, App Router or RSC-specific integration. This is a different target and is not currently required by Gurudevi.

Gluestack v5 dropping Next.js/universal templates does not mean that every Expo Web path is unavailable. It means the v5 release no longer promises the previous Next/universal template path. The more specific risk for this workspace is the Gluestack CLI warning that NativeWind v5 is not yet web-compatible in monorepo mode. UniWind advertises Expo Web, but its own supported path is Expo/Metro rather than Next.js; that is acceptable for the current app, not a universal-web guarantee. ([Gluestack v5 release](https://gluestack.io/blogs/gluestack-ui-v5-stable-release), [Gluestack CLI monorepo guidance](https://gluestack.io/ui/docs/home/getting-started/cli), [UniWind documentation](https://docs.uniwind.dev/))

This resolves the apparent contradiction: “Gluestack v5 has no Next.js support” and “UniWind has no Next.js support” are both compatible with “Gurudevi can still evaluate Expo Web.” They become blockers only if the product actually needs Next.js SSR/universal rendering. It currently does not.

### Keep Gluestack as a source-owned primitive layer

This remains a reasonable choice for Gurudevi because:

- the app already owns and customizes the primitive source;
- `@repo/ui/gluestack` gives screens a stable abstraction boundary;
- copy-paste components avoid a large opaque runtime dependency;
- accessibility and common interaction primitives are useful for a large product surface;
- the team has already invested in a design-token and branded-component layer around the primitives.

This is not a recommendation to trust every generated Gluestack component or to expose Gluestack directly to feature packages. Continue treating the shared facade as the contract and product-owned components as the place for Sanctuary-specific behavior.

### Do not promise “v5 complete” yet

The current state should be called “Gluestack v5 dependency migration with NativeWind v5 compatibility bridge,” not “fully migrated to Gluestack UI v5 CSS-first architecture.” That naming matters because it tells future agents not to delete the bridge casually and not to assume the CSS token migration has already happened.

### NativeWind v5 versus UniWind

Run a small decision spike before the next broad rewrite. This is a decision gate, not permission to rewrite both engines in the product branch:

1. NativeWind v5 path: install the documented `react-native-css` peer, pin the documented Lightning CSS version if still required by the selected release, migrate CSS tokens, remove legacy runtime shims, and convert only the primitives that need explicit `styled()` interop.
2. UniWind path: create a disposable Expo 57 branch using the documented `withUniwindConfig`/`global.css` model, remove the NativeWind Babel path, and test web, Android, dark mode, overlays, inputs, lists, animations, and the monorepo package boundary.
3. Compare bundle/build stability, developer ergonomics, visual parity, test mocks, web output, and physical-device behavior before choosing one.

Given NativeWind v5 is still labeled pre-release by its own maintainers, the selected path is intentionally conservative: keep NativeWind v5 preview.4 behind the stable facade, pin it exactly, and monitor upstream issues. UniWind remains a disposable future spike, not an automatic replacement. The final decision is: “Gurudevi-owned Gluestack-named facade + NativeWind v5 preview.4/Tailwind 4 compatibility path,” with NativeWind v4/Tailwind v3 documented as rollback.

### Tamagui: credible alternative, wrong rescue operation for this moment

Tamagui is not a dead end. Its current v2 documentation requires React Native 0.81+, React 19+, TypeScript 5+ and the New Architecture, and it documents both Expo/Expo Router web and Next.js integration. That makes the earlier Expo/New Architecture concern worth retesting against the exact Expo 57/RN 0.86 matrix, rather than treating Tamagui as categorically incompatible. ([Tamagui installation](https://tamagui.dev/docs/intro/installation), [Expo guide](https://tamagui.dev/docs/guides/expo), [Next.js guide](https://tamagui.dev/docs/guides/next-js))

But adopting Tamagui would not be a small styling-engine swap. It brings its own component primitives, theme/provider model, compiler and configuration. It would mean replacing or substantially re-authoring the Gluestack primitive layer, not simply changing `withNativeWind` to another Metro plugin. Tamagui Pro is also not a runtime support/SLA purchase: the official license describes one project, Takeout/Bento/Theme AI and one year of updates, with $100/year update enrollment after the first year. Core Tamagui remains usable without Pro, but the paid product does not remove the migration cost. ([Tamagui Pro license](https://tamagui.dev/pro-license), [Tamagui introduction](https://tamagui.dev/docs/intro/introduction))

Decision: do not add Tamagui to the current migration spike. Revisit it only if one of these becomes a real product requirement: Next.js SSR/universal web, a deliberate replacement of Gluestack primitives, or measured performance problems that the current one-engine design cannot solve. Do not bring Tamagui in as a third styling compiler beside Gluestack/NativeWind/UniWind.

### The recommended “mix”

The useful mix is architectural, not a compiler pile-up:

- Gluestack source-owned primitives for accessibility and interaction behavior.
- One selected styling engine, with UniWind Free as the first bounded candidate because Gurudevi is Expo-based and should not require a recurring license for correctness.
- Direct Reanimated 4 for motion and direct `StyleSheet` for exceptional native/platform styling.
- Gurudevi-owned wrappers and tokens exposed through `@repo/ui/gluestack`.
- No Unistyles/Tamagui/NativeWind utility transforms in the same primitive implementation.

This preserves the option to replace the engine later without rewriting feature screens. If UniWind Free fails the Expo Web monorepo harness, the next move is to finish or freeze the current NativeWind bridge—not to buy UniWind Pro or add another compiler before we understand the failure.

### Should Gurudevi jump to something else?

There are four realistic choices. The comparison is about Gurudevi’s actual Expo 57/RN 0.86/web/monorepo constraints, not a generic popularity contest.

| Option | Immediate upside | Main risk/cost | Decision |
| --- | --- | --- | --- |
| Keep the current NativeWind v5 compatibility bridge | Lowest short-term source churn; preserves current class names and Gluestack work | Retains dual Tailwind configuration, legacy CSS interop, preview dependencies, and unresolved Metro/Babel risk | Keep temporarily as the freeze point, not as the final architecture. |
| Finish NativeWind v5 | Closest to the current Gluestack v5 documentation and broadest Expo/bare-RN direction | NativeWind v5 was still preview during its release process; `styled()`/SVG, RN 0.86, CSS mapping, monorepo, dark mode, and web issues remain relevant | Accept only if the harness passes and product accepts the maintenance burden. |
| Gluestack v5 + UniWind Free | Expo-only fit matches Gurudevi; Tailwind v4/CSS-first; Gluestack documents the path; removes NativeWind Babel/PostCSS/`react-native-css` complexity without an immediate license | A separate, younger engine; Pro-only native engine/Reanimated-through-`className` features may become a hidden requirement; migration still requires CSS/theme rewrites and re-adding components; third-party interop and web behavior must be tested | Preferred candidate for a no-paid-runtime spike. It is not approved until the Free tier passes this repo’s real harness. ([Gluestack engine guide](https://v5.gluestack.io/ui/docs/guides/more/upgrade-to-v5), [UniWind pricing](https://uniwind.dev/pricing)) |
| Abandon Tailwind/utility styling and use React Native `StyleSheet` behind the facade | Lowest styling-engine and compiler risk; official React Native path; explicit style behavior | Largest product rewrite, loss of class-based tokens/pseudo-classes, and more manual responsive/theme work | Keep as a strategic fallback for critical primitives, not a whole-app pivot today. ([React Native Style docs](https://reactnative.dev/docs/style)) |

Tamagui and Shopify Restyle are credible libraries, but they are not small escape hatches. Tamagui changes the styling/component model and introduces its own compiler/configuration; Restyle is a typed theme/style-system API rather than a Tailwind-compatible engine. Moving from Gluestack/NativeWind to either would turn an engine migration into a component-system migration. That is not justified by the current evidence. ([Tamagui](https://tamagui.dev/docs/intro/introduction), [Shopify Restyle](https://github.com/Shopify/restyle))

### Stop conditions for the spike

Stop and reassess rather than expanding scope if:

- the same primitive needs two utility compilers or two competing theme providers;
- UniWind Free lacks a correctness feature and Pro becomes a hidden runtime requirement;
- Expo Web fails specifically because the monorepo package boundary is unsupported;
- the migration requires screen-wide rewrites before primitive behavior is proven;
- a proposed fix is “upgrade everything” without an exact lockfile and reproducible test case.

UniWind’s own project currently advertises Tailwind v4, Expo, web, monorepos, and a NativeWind-like `className` API; its public repository shows active releases through v1.7.0 in May 2026. Those are positive signals, but performance claims on the project’s own site/benchmark repository are not independent production evidence. Treat UniWind as a serious candidate to validate, not an automatic “stable means solved” answer.

The exit strategy should be explicit: feature code imports `@repo/ui/gluestack`; only the implementation package knows whether the engine is NativeWind, UniWind, or direct styles. If the selected engine fails the harness, we can change that implementation layer without rewriting every screen.

## Controlled completion plan

## One-week execution plan

### Week objective

By the end of seven calendar days, Gurudevi will have one documented styling-engine decision, a reproducible acceptance harness, a known-good fallback, and no unreviewed app-wide migration. “Done” for this week is a safe decision and a validated slice—not converting every screen.

### Day 1 — Freeze the baseline

- Create a migration branch from the current working state; preserve all existing user changes.
- Record the exact `pnpm-lock.yaml`, app/package manifests, Metro/Babel/CSS files and current Gluestack facade.
- Run the existing scoped checks individually: `@repo/ui` typecheck/tests, `gurudevi-mobile` typecheck/tests, web dependency audit and `expo-doctor` as diagnostics.
- Capture baseline behavior for Button, Input, Modal, Toast, Select, dark mode and one web route.
- Do not run `expo install --fix`, `expo install --check`, `expo prebuild --clean`, or a canonical Gluestack CLI upgrade.

**Exit gate:** baseline is captured, failures are classified as pre-existing or migration-related, and rollback is possible.

### Day 2 — Build the acceptance harness

Create a small disposable route/package boundary—not a second app architecture—with these cases:

- `View`, `Text`, `Pressable`, `TextInput`, `FlatList` and `react-native-svg`;
- Button/Input/Modal/Toast from the current Gluestack facade;
- light/dark theme, variants, disabled/focus/pressed states;
- a Reanimated 4 motion example and a StyleSheet escape-hatch example;
- Expo Web rendering from the pnpm monorepo boundary.

Keep the harness implementation behind the existing `@repo/ui/gluestack` boundary. Do not import `packages/ui/src/...` across package boundaries.

**Exit gate:** the harness can be run against the current bridge and can expose native, web, type, and visual failures separately.

### Day 3 — Validate the current NativeWind path

- Test the exact current NativeWind v5 preview/legacy-interop combination first.
- Test the documented v5 direction only in the disposable branch: `react-native-css`, CSS-first tokens, Metro/Babel changes, Lightning CSS policy and selected `styled()` wrappers.
- Do not mass-convert the 27 `cssInterop` component files.
- Record every failure with package versions, platform, reproduction and workaround.

**Decision gate:** if NativeWind cannot pass the core harness on native and Expo Web, freeze it as the fallback and stop spending the week on broad v5 conversion.

### Day 4 — Validate UniWind Free

- Test UniWind Free against the same harness and the same Expo 57/RN 0.86/New Architecture baseline.
- Verify Expo Web specifically from the monorepo package boundary.
- Verify dark mode, variants, overlays, inputs, SVG, lists, Reanimated 4 usage and direct StyleSheet escape hatches.
- Do not buy Pro during the spike. If correctness depends on a Pro-only feature, record that as a rejection or explicit commercial decision.

**Decision gate:** UniWind becomes the candidate only if the Free tier passes core behavior and does not require architecture-breaking workarounds.

### Day 5 — Compare and choose

Score both paths against the same criteria: native build, web build, typecheck, tests, visual parity, monorepo behavior, theme behavior, third-party interop, debugging cost and license requirements.

Use this rule:

- **UniWind Free passes:** choose Gluestack v5 + UniWind Free for the next controlled migration.
- **NativeWind passes and UniWind fails:** finish NativeWind v5 only within a narrow, documented migration boundary.
- **Both fail:** keep the current bridge, use direct styles for high-risk primitives, and defer the engine migration. This is a successful safety decision, not a failed week.
- **Tamagui:** do not enter the week’s implementation race. It is a future component-system replacement decision, not a third engine benchmark.

### Day 6 — Migrate one representative slice

Migrate only the smallest useful slice: one primitive family such as Button + Input, plus one overlay if the chosen engine passes the harness. Preserve the public `@repo/ui/gluestack` API. Add a short ADR containing the selected engine, exact versions, known exceptions and rollback procedure.

If the selected engine requires broad generated-file replacement, stop and keep the harness-only result. Do not trade a one-week deadline for uncontrolled source churn.

### Day 7 — Verify and hand off

- Run scoped UI typecheck, tests, lint and cycle checks.
- Run Expo Web and the representative native/dev-client build available in the environment.
- Review visual states and document known failures.
- Run `git diff --check` and inspect the dependency/configuration diff.
- Update this audit and the migration plan with the final decision.

**Week-end deliverable:** one reviewed decision/ADR, one acceptance harness, one representative migrated slice only if it passed, and an explicit fallback. No full-screen migration is required or authorized by this plan.

### Scope guardrails

- No Tamagui, Unistyles or second utility compiler added to the production component path.
- No paid UniWind or Gluestack Pro purchase during evaluation.
- No changes to `android/` or `ios/` directly.
- Any dependency change requires the repository stack-map bootstrap/review/regeneration flow.
- Any RED-zone change requires proposal and approval under the Gurudevi quality gate.

### Phase 0 — Freeze and inventory

- Keep the current branch clean and create a dedicated migration branch.
- Record the current visual baseline for onboarding, auth, settings, overlays, forms, lists, dark mode, and web.
- Capture the current lockfile, package manifests, Metro config, Babel config, CSS output, and native build state.
- Do not run `expo install --fix`, `expo install --check`, or `expo prebuild --clean`; these violate repository guardrails.

### Phase 1 — Choose the styling engine

- Complete the NativeWind v5 versus UniWind spike described above.
- Decide whether the product accepts a preview styling engine for the next release.
- Record the choice as an ADR before changing the shared primitives.

### Phase 2 — Make configuration internally consistent

For the selected engine, establish one source of truth:

- one Tailwind major version per app/package boundary;
- one CSS entry file and one theme-token owner;
- declared peer/runtime packages matching the selected engine;
- no stale `react-native-css-interop` patch/shim unless a reviewed compatibility exception remains;
- generated type declarations matching the selected engine;
- Metro and Babel configuration matching the selected engine’s current docs;
- a reviewed Lightning CSS policy, either the upstream pin or a tested exception.

### Phase 3 — Migrate primitives deliberately

- Keep `@repo/ui/gluestack` stable while migrating implementation files.
- Convert `cssInterop` only where explicit interop is needed; do not mechanically wrap every native component in `styled()` without checking prop flow and refs.
- Re-add upstream components only into a disposable copy, then port differences into product-owned components by review.
- Delete `components-legacy` and `gluestack-legacy` only after a source/import/test audit proves they are unreachable.
- Remove mocks and Metro aliases only after the new runtime and Jest paths are verified.

### Phase 4 — Verify

Required gates:

- `pnpm exec tsc --build --noEmit`;
- scoped `@repo/ui` tests and app tests;
- lint and formatting checks;
- `expo-doctor` as a diagnostic only;
- `expo export` for the web path;
- Android and iOS development builds on physical devices;
- screenshot/visual comparison for representative primitive states;
- smoke tests for theme switching, modals, actionsheets, Toast, Select, Input, Textarea, Slider, Checkbox, Radio, lists, animations, and web CSS output.

The first audit attempt on 2026-08-11 ran the repository typecheck/doctor commands through the workspace wrappers, but the combined command timed out after roughly two minutes without a usable pass/fail result. The result is therefore recorded as “not validated,” not as a successful migration gate. Rerun these checks individually after the configuration decision.

## Current status checklist

- [x] UI test infrastructure resolves the React Native Worklets Babel peer at the pnpm package boundary.
- [x] `@repo/ui` baseline passes 15 suites / 149 tests and TypeScript verification.

- [x] Gluestack v5 dependency was introduced in the July migration line.
- [x] Expo 57/RN 0.86/Reanimated 4 baseline exists in the current branch.
- [x] A stable `@repo/ui/gluestack` facade exists.
- [x] NativeWind v5 preview policy decided: exact preview.4 pin, monitored upstream risk.
- [x] NativeWind v5 selected behind the stable facade; UniWind remains future research and v4/Tailwind 3 is rollback only.
- [x] `react-native-css`/selected-engine dependency graph made canonical; the legacy bridge is explicitly isolated.
- [x] Tailwind v3 duplicate removed from the app graph.
- [x] Theme/token CSS source and package-local PostCSS ownership documented and verified by the renderer fixture.
- [x] PostCSS/Metro/Babel/type declarations aligned with the selected engine.
- [x] `cssInterop` usage explicitly justified per primitive; 17 registrations remain only in the frozen legacy tree.
- [x] Legacy component reachability audit proves zero current product consumers; physical removal is deferred for rollback safety.
- [ ] Native device, web, visual, and test gates passed.

## Immediate next actions

1. Preserve the pinned dependency/configuration state and the `@repo/ui/gluestack` facade.
2. Run the fast local gate with `pnpm --filter gurudevi-mobile verify:style-stack`.
3. Run the native Android CI/device build and verify representative primitives on a real device or approved emulator.
4. Keep UniWind as a separate disposable research branch only if the selected NativeWind path fails a release gate.
5. Open upstream issues only with a minimal reproduction and exact lockfile/config; link the issue/PR back to this audit when a workaround affects Gurudevi.

## Sources

- [Gluestack UI v5 stable release](https://gluestack.io/blogs/gluestack-ui-v5-stable-release)
- [Gluestack UI v5 installation guide](https://v5.gluestack.io/ui/docs/home/getting-started/installation)
- [Gluestack UI v5 upgrade guide](https://v5.gluestack.io/ui/docs/guides/more/upgrade-to-v5)
- [Gluestack UI CLI guide](https://gluestack.io/ui/docs/home/getting-started/cli)
- [Gluestack UI GitHub repository](https://github.com/gluestack/gluestack-ui)
- [NativeWind v5 overview](https://www.nativewind.dev/v5)
- [NativeWind v5 migration announcement](https://www.nativewind.dev/blog/v5-migration-guide)
- [NativeWind v4-to-v5 migration guide](https://www.nativewind.dev/v5/guides/migrate-from-v4)
- [NativeWind v5 overview/status](https://www.nativewind.dev/v5)
- [NativeWind v5 release plan and checklist](https://github.com/nativewind/nativewind/discussions/1818)
- [NativeWind v6 upstreaming RFC](https://github.com/nativewind/nativewind/discussions/1819)
- [NativeWind LLM support announcement](https://github.com/nativewind/nativewind/discussions/1703)
- [Expo Skills NativeWind v5 setup PR](https://github.com/expo/skills/pull/101)
- [NativeWind v4-to-v5 migration discussion](https://github.com/nativewind/nativewind/discussions/1617)
- [NativeWind CSS interop race-condition discussion](https://github.com/nativewind/nativewind/discussions/1537)
- [NativeWind monorepo/worklets discussion](https://github.com/nativewind/nativewind/discussions/1816)
- [NativeWind Reanimated v4 discussion](https://github.com/nativewind/nativewind/discussions/1529)
- [NativeWind Tailwind v4 discussion](https://github.com/nativewind/nativewind/discussions/1394)
- [NativeWind open issues](https://github.com/nativewind/nativewind/issues)
- [NativeWind open pull requests](https://github.com/nativewind/nativewind/pulls)
- [NativeWind v5 `styled()`/SVG issue](https://github.com/nativewind/nativewind/issues/1820)
- [NativeWind RN 0.86/Babel issue](https://github.com/nativewind/nativewind/issues/1834)
- [NativeWind v4 color-scheme maintenance PR](https://github.com/nativewind/nativewind/pull/1776)
- [Gluestack UI open issues](https://github.com/gluestack/gluestack-ui/issues)
- [Gluestack UI open pull requests](https://github.com/gluestack/gluestack-ui/pulls)
- [Gluestack UI v5 alpha discussion](https://github.com/gluestack/gluestack-ui/discussions/3366)
- [Gluestack UI v5 stable-release discussion](https://github.com/gluestack/gluestack-ui/discussions/3425)
- [Gluestack UI NativeWind v5 support discussion](https://github.com/gluestack/gluestack-ui/discussions/3222)
- [Gluestack UI large-project overlay discussion](https://github.com/gluestack/gluestack-ui/discussions/3432)
- [Gluestack UI Modal/provider discussion](https://github.com/gluestack/gluestack-ui/discussions/3435)
- [Gluestack UI discussions index](https://github.com/gluestack/gluestack-ui/discussions)
- [Gluestack UI RN 0.86 CLI/Babel issue](https://github.com/gluestack/gluestack-ui/issues/3421)
- [Gluestack UI v5 TypeScript issue](https://github.com/gluestack/gluestack-ui/issues/3438)
- [Gluestack UI v5 documentation issue](https://github.com/gluestack/gluestack-ui/issues/3444)
- [Gluestack UI CLI guide](https://gluestack.io/ui/docs/home/getting-started/cli)
- [Gluestack UI v5 upgrade guide](https://gluestack.io/ui/docs/guides/more/upgrade-to-v5)
- [Gluestack UI historical v2 codemod guide](https://gluestack.io/ui/docs/guides/more/upgrade-to-v2)
- [Gluestack UI VS Code extension](https://gluestack.io/ui/docs/home/getting-started/vscode-extensions)
- [UniWind pricing and free/Pro boundary](https://uniwind.dev/pricing)
- [gluestack-ui Pro documentation](https://pro.gluestack.io/docs)
- [gluestack-ui Pro terms](https://pro.gluestack.io/terms-of-service)
- [UniWind documentation](https://docs.uniwind.dev/)
- [UniWind GitHub repository](https://github.com/Unistyles-OSS/uniwind)
- [Tamagui introduction](https://tamagui.dev/docs/intro/introduction)
- [Shopify Restyle repository](https://github.com/Shopify/restyle)
- [React Native Style documentation](https://reactnative.dev/docs/style)
- [Gluestack npm package/version/download page](https://www.npmjs.com/package/gluestack-ui?activeTab=versions)
- [Gluestack styles-not-loading issue](https://github.com/gluestack/gluestack-ui/issues/3239)
- [NativeWind v5 migration discussion](https://github.com/nativewind/nativewind/discussions/1617)
- [Stack Overflow style-loading/provider report](https://stackoverflow.com/questions/79664766/classname-stylings-are-not-getting-applied-in-react-native-using-gluestack-and-n)
- [CERT-EU report on the 2025 React Native accessibility package supply-chain compromise](https://cert.europa.eu/publications/threat-intelligence/cb25-07/pdf)
