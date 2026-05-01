# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/1/2026, 7:48:18 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm dlx gitleaks detect --source . --verbose
> **Duration:** 67.8s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 147 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 60 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 9 |
| packages/analytics | 21 |
| packages/community | 3 |
| packages/core | 15 |
| packages/library | 15 |
| packages/lk-edu-geo | 3 |
| packages/profile | 3 |
| packages/scanner-kit | 3 |
| packages/trube-art | 3 |
| packages/ui | 33 |

## Detailed Findings

### Category: General
- apps-intuitui-web:check-types: - 0 errors
- apps-intuitui-web:check-types: - 0 warnings
- apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
- apps-edlove-web:check-types: [96msrc/components/Footer.astro[0m:[93m52[0m:[93m24[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'currentYear'. Did you mean '_currentYear'?
- apps-edlove-web:check-types: [96msrc/components/Footer.astro[0m:[93m2[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_currentYear' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m92[0m:[93m29[0m - [91merror[0m[90m ts(7006): [0mParameter 'lang' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m92[0m:[93m14[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'languages'. Did you mean '_languages'?
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m80[0m:[93m23[0m - [91merror[0m[90m ts(7006): [0mParameter 'link' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m80[0m:[93m12[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'links'. Did you mean '_links'?
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m39[0m:[93m31[0m - [91merror[0m[90m ts(7006): [0mParameter 'lang' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m39[0m:[93m16[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'languages'. Did you mean '_languages'?
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m27[0m:[93m22[0m - [91merror[0m[90m ts(7006): [0mParameter 'link' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m27[0m:[93m12[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'links'. Did you mean '_links'?
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m11[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_languages' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m2[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_links' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/StructuredData.astro[0m:[93m10[0m:[93m18[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/components/StructuredData.astro[0m:[93m10[0m:[93m2[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'normalized'. Did you mean '_normalized'?
- apps-edlove-web:check-types: [96msrc/components/StructuredData.astro[0m:[93m7[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_normalized' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/Welcome.astro[0m:[93m9[0m:[93m16[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'astroLogo'.
- apps-edlove-web:check-types: [96msrc/components/Welcome.astro[0m:[93m5[0m:[93m28[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'background'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m121[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Footer'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m120[0m:[93m10[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ScrollToTop'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m116[0m:[93m10[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CenterModal'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m115[0m:[93m10[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'SidePanel'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m114[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Navigation'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m108[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ClientRouter'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m107[0m:[93m25[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'baseStructuredData'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m107[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'StructuredData'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m99[0m:[93m39[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ogImage'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m94[0m:[93m38[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ogImage'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m87[0m:[93m34[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'SITE_KEYWORDS'.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m86[0m:[93m32[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'robotsContent'. Did you mean '_robotsContent'?
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m35[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_baseStructuredData' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m33[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_robotsContent' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m31[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_ogImage' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m57[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m26[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'FloatingParticles'.
- apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m25[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m21[0m:[93m19[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
- apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m18[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m4[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/privacy.astro[0m:[93m26[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/privacy.astro[0m:[93m5[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/privacy.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/terms.astro[0m:[93m26[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/terms.astro[0m:[93m5[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/terms.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/vision.astro[0m:[93m55[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/vision.astro[0m:[93m5[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/vision.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m63[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m60[0m:[93m15[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m46[0m:[93m14[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m40[0m:[93m27[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m32[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m30[0m:[93m47[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m8[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m80[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m44[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CosmicParticles'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m42[0m:[93m21[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m38[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m17[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
- apps-neevsk-web:check-types: - 0 errors
- apps-neevsk-web:check-types: - 0 warnings
- apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m99[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m73[0m:[93m35[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m45[0m:[93m34[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m32[0m:[93m47[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CosmicParticles'.
- apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m8[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m139[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m60[0m:[93m27[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m52[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m50[0m:[93m47[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m8[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m115[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m107[0m:[93m35[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m103[0m:[93m34[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m101[0m:[93m55[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m100[0m:[93m45[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m100[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'stories'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m96[0m:[93m14[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'stories'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m89[0m:[93m31[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m85[0m:[93m30[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m83[0m:[93m51[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m82[0m:[93m44[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m82[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'frameworks'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m72[0m:[93m31[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m68[0m:[93m30[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m66[0m:[93m51[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m65[0m:[93m42[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m65[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'thinkers'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m41[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m39[0m:[93m21[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m36[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m17[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m13[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_stories' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m10[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_frameworks' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m7[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_thinkers' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m460[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m449[0m:[93m49[0m - [91merror[0m[90m ts(7006): [0mParameter 'item' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m449[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'specializedInnovations'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m399[0m:[93m51[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'getCardStyle'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m398[0m:[93m60[0m - [91merror[0m[90m ts(7006): [0mParameter 'i' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m398[0m:[93m54[0m - [91merror[0m[90m ts(7006): [0mParameter 'item' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m382[0m:[93m27[0m - [91merror[0m[90m ts(7006): [0mParameter 'region' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m382[0m:[93m14[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'regions'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m361[0m:[93m56[0m - [91merror[0m[90m ts(7006): [0mParameter 'item' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m361[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m357[0m:[93m80[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m356[0m:[93m124[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m355[0m:[93m172[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m337[0m:[93m35[0m - [91merror[0m[90m ts(7006): [0mParameter 'region' implicitly has an 'any' type.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m337[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'regions'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m297[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m296[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m290[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_getCardStyle' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m250[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_specializedInnovations' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m46[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_regions' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m3[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_globalOpenSource' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m117[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m106[0m:[93m27[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m87[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
- apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m84[0m:[93m43[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
- apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m31[0m:[93m21[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
- apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m27[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m8[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m39[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'FloatingParticles'.
- apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m8[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/sri-lanka/index.astro[0m:[93m366[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/sri-lanka/index.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m39[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'FloatingParticles'.
- apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m8[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
- apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
- apps-edlove-web:check-types: - 116 errors
- apps-edlove-web:check-types: - 0 warnings
- ERROR
- ERROR  run failed: command  exited (1)
- x 72 dependency violations (0 errors, 72 warnings). 1838 modules, 5922 dependencies cruised.
- x 72 dependency violations (0 errors, 72 warnings). 1838 modules, 5922 dependencies cruised.
- x 72 dependency violations (0 errors, 72 warnings). 1838 modules, 5922 dependencies cruised.
- ERR_PNPM_DLX_NO_BIN  No binaries found in gitleaks

### Category: apps/edlove-web
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs

### Category: apps/gurudevi-marketingWeb
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs

### Category: apps/gurudevi-mobile
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js

### Category: apps/intuitui-web
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs

### Category: apps/neevsk-web
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs

### Category: packages/admin
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts

### Category: packages/analytics
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx

### Category: packages/community
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts

### Category: packages/core
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts

### Category: packages/library
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts

### Category: packages/lk-edu-geo
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts

### Category: packages/profile
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts

### Category: packages/ui
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/components-native/Livin
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/card.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/components-native/Livin
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/card.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/components-native/Livin
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/card.tsx
- warn no-orphans: packages/ui/src/button.tsx

## Raw Output

```text

> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-01T02:17:13.248Z

>>> Command: pnpm turbo run check-types

--------------------------------------------------------------------------------

• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 28 packages
   • Remote caching disabled


apps-intuitui-web:check-types: cache hit, replaying logs d540fd2c46dda557

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec astro check
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: [2m07:37:46[22m [34m[types][39m Generated [2m183ms[22m
apps-intuitui-web:check-types: [2m07:37:46[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\intuitui-web...
apps-intuitui-web:check-types: Result (14 files): 
apps-intuitui-web:check-types: - 0 errors
apps-intuitui-web:check-types: - 0 warnings
apps-intuitui-web:check-types: - 0 hints
apps-intuitui-web:check-types: 
apps-neevsk-web:check-types: cache miss, executing 0fdc0cf59a1012a0

apps-edlove-web:check-types: cache miss, executing 2bb1cc43b6ac9153

@repo/core:check-types: cache miss, executing 7bec824abc1a3f97

apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec astro check
apps-neevsk-web:check-types: 

apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec astro check
apps-edlove-web:check-types: 

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 

apps-edlove-web:check-types: [2m07:47:24[22m [34m[content][39m Syncing content

apps-edlove-web:check-types: [2m07:47:24[22m [34m[content][39m Synced content

apps-neevsk-web:check-types: [2m07:47:24[22m [34m[content][39m Syncing content

apps-edlove-web:check-types: [2m07:47:24[22m [34m[types][39m Generated [2m1.39s[22m

apps-edlove-web:check-types: [2m07:47:24[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\edlove-web...

apps-neevsk-web:check-types: [2m07:47:24[22m [34m[content][39m Synced content

apps-neevsk-web:check-types: [2m07:47:24[22m [34m[types][39m Generated [2m1.37s[22m

apps-neevsk-web:check-types: [2m07:47:24[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\neevsk-web...

apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m41[0m     link: z.string().url().optional(),
apps-neevsk-web:check-types: [7m  [0m [93m                     ~~~[0m
apps-neevsk-web:check-types: 

apps-edlove-web:check-types: [96msrc/components/Footer.astro[0m:[93m52[0m:[93m24[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'currentYear'. Did you mean '_currentYear'?
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m52[0m                     © {currentYear} EdLove Platform • Colombo, Sri Lanka
apps-edlove-web:check-types: [7m  [0m [91m                       ~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Footer.astro[0m:[93m2[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_currentYear' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m2[0m const _currentYear = new Date().getFullYear();
apps-edlove-web:check-types: [7m [0m [93m      ~~~~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m92[0m:[93m29[0m - [91merror[0m[90m ts(7006): [0mParameter 'lang' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m92[0m             {languages.map((lang) => (
apps-edlove-web:check-types: [7m  [0m [91m                            ~~~~[0m

apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m92[0m:[93m14[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'languages'. Did you mean '_languages'?
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m92[0m             {languages.map((lang) => (
apps-edlove-web:check-types: [7m  [0m [91m             ~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m80[0m:[93m23[0m - [91merror[0m[90m ts(7006): [0mParameter 'link' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m80[0m           {links.map((link) => (
apps-edlove-web:check-types: [7m  [0m [91m                      ~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m80[0m:[93m12[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'links'. Did you mean '_links'?
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m80[0m           {links.map((link) => (
apps-edlove-web:check-types: [7m  [0m [91m           ~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m39[0m:[93m31[0m - [91merror[0m[90m ts(7006): [0mParameter 'lang' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m39[0m               {languages.map((lang) => (
apps-edlove-web:check-types: [7m  [0m [91m                              ~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m39[0m:[93m16[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'languages'. Did you mean '_languages'?
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m39[0m               {languages.map((lang) => (
apps-edlove-web:check-types: [7m  [0m [91m               ~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m27[0m:[93m22[0m - [91merror[0m[90m ts(7006): [0mParameter 'link' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m27[0m           {links.map(link => (
apps-edlove-web:check-types: [7m  [0m [91m                     ~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m27[0m:[93m12[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'links'. Did you mean '_links'?
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m27[0m           {links.map(link => (
apps-edlove-web:check-types: [7m  [0m [91m           ~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m11[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_languages' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m11[0m const _languages = [
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/Navigation.astro[0m:[93m2[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_links' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m2[0m const _links = [
apps-edlove-web:check-types: [7m [0m [93m      ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/components/StructuredData.astro[0m:[93m10[0m:[93m18[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m10[0m {normalized.map((entry) => (
apps-edlove-web:check-types: [7m  [0m [91m                 ~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/StructuredData.astro[0m:[93m10[0m:[93m2[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'normalized'. Did you mean '_normalized'?
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m10[0m {normalized.map((entry) => (
apps-edlove-web:check-types: [7m  [0m [91m ~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/StructuredData.astro[0m:[93m7[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_normalized' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m7[0m const _normalized = Array.isArray(data) ? data : [data];
apps-edlove-web:check-types: [7m [0m [93m      ~~~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/components/Welcome.astro[0m:[93m9[0m:[93m16[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'astroLogo'.

apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m9[0m     ><img src={astroLogo.src} width="115" height="48" alt="Astro Homepage" /></a
apps-edlove-web:check-types: [7m [0m [91m               ~~~~~~~~~[0m

apps-edlove-web:check-types: [96msrc/components/Welcome.astro[0m:[93m5[0m:[93m28[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'background'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m5[0m  <img id="background" src={background.src} alt="" fetchpriority="high" />
apps-edlove-web:check-types: [7m [0m [91m                           ~~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m121[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Footer'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m121[0m   <Footer />
apps-edlove-web:check-types: [7m   [0m [91m   ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m120[0m:[93m10[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ScrollToTop'.
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m120[0m         <ScrollToTop />
apps-edlove-web:check-types: [7m   [0m [91m         ~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m116[0m:[93m10[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CenterModal'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m116[0m         <CenterModal />
apps-edlove-web:check-types: [7m   [0m [91m         ~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m115[0m:[93m10[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'SidePanel'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m115[0m         <SidePanel />
apps-edlove-web:check-types: [7m   [0m [91m         ~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m114[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Navigation'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m114[0m   <Navigation />
apps-edlove-web:check-types: [7m   [0m [91m   ~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m108[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ClientRouter'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m108[0m   <ClientRouter />
apps-edlove-web:check-types: [7m   [0m [91m   ~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m107[0m:[93m25[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'baseStructuredData'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m107[0m   <StructuredData data={baseStructuredData} />
apps-edlove-web:check-types: [7m   [0m [91m                        ~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m107[0m:[93m4[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'StructuredData'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m107[0m   <StructuredData data={baseStructuredData} />
apps-edlove-web:check-types: [7m   [0m [91m   ~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m99[0m:[93m39[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ogImage'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m99[0m   <meta name="twitter:image" content={ogImage} />
apps-edlove-web:check-types: [7m  [0m [91m                                      ~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m94[0m:[93m38[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ogImage'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m94[0m   <meta property="og:image" content={ogImage} />
apps-edlove-web:check-types: [7m  [0m [91m                                     ~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m87[0m:[93m34[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'SITE_KEYWORDS'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m87[0m   <meta name="keywords" content={SITE_KEYWORDS.join(', ')} />
apps-edlove-web:check-types: [7m  [0m [91m                                 ~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m86[0m:[93m32[0m - [91merror[0m[90m ts(2552): [0mCannot find name 'robotsContent'. Did you mean '_robotsContent'?
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m86[0m   <meta name="robots" content={robotsContent} />
apps-edlove-web:check-types: [7m  [0m [91m                               ~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m35[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_baseStructuredData' is declared but its value is never read.

apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m35[0m const _baseStructuredData = [
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m33[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_robotsContent' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m33[0m const _robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/layouts/Layout.astro[0m:[93m31[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_ogImage' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m31[0m const _ogImage = image ?? defaultOgImage(Astro.url.pathname);

apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m57[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m57[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m26[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'FloatingParticles'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m26[0m     <FloatingParticles />

apps-edlove-web:check-types: [7m  [0m [91m     ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m25[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m25[0m     <CinematicBackground showVideo={true} />
apps-edlove-web:check-types: [7m  [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m21[0m:[93m19[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m21[0m   structuredData={structuredData}
apps-edlove-web:check-types: [7m  [0m [91m                  ~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m18[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m18[0m <Layout
apps-edlove-web:check-types: [7m  [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/index.astro[0m:[93m4[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m4[0m const _structuredData = {
apps-edlove-web:check-types: [7m [0m [93m      ~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/privacy.astro[0m:[93m26[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.

apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m26[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/privacy.astro[0m:[93m5[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m5[0m     <CinematicBackground />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/privacy.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m4[0m <Layout title="Privacy Policy | EdLove">
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/terms.astro[0m:[93m26[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m26[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/terms.astro[0m:[93m5[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m5[0m     <CinematicBackground />

apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/terms.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m4[0m <Layout title="Terms of Use | EdLove">
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/vision.astro[0m:[93m55[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.

apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m55[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/vision.astro[0m:[93m5[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m5[0m     <CinematicBackground />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/vision.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m4[0m <Layout title="Our Vision | EdLove">
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m63[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m63[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m60[0m:[93m15[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m60[0m             </ExpandableContent>
apps-edlove-web:check-types: [7m  [0m [91m              ~~~~~~~~~~~~~~~~~[0m

apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m46[0m:[93m14[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m46[0m             <ExpandableContent title="Join the Founders" subtitle="The Private Circle" icon="💬">
apps-edlove-web:check-types: [7m  [0m [91m             ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m40[0m:[93m27[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m40[0m                         </ExpandableContent>
apps-edlove-web:check-types: [7m  [0m [91m                          ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m32[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m32[0m                         <ExpandableContent
apps-edlove-web:check-types: [7m  [0m [91m                         ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m30[0m:[93m47[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m30[0m                     const { Content } = await render(entry);
apps-edlove-web:check-types: [7m  [0m [91m                                              ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.

apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m9[0m     <CinematicBackground />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/community/index.astro[0m:[93m8[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m8[0m <Layout title="The Sangha | EdLove">
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m

apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m80[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m80[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m44[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CosmicParticles'.
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m44[0m     <CosmicParticles />
apps-edlove-web:check-types: [7m  [0m [91m     ~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m42[0m:[93m21[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m42[0m     structuredData={structuredData}
apps-edlove-web:check-types: [7m  [0m [91m                    ~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m38[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m38[0m <Layout
apps-edlove-web:check-types: [7m  [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/[slug].astro[0m:[93m17[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m17[0m const _structuredData = {
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-neevsk-web:check-types: Result (44 files): 
apps-neevsk-web:check-types: - 0 errors
apps-neevsk-web:check-types: - 0 warnings
apps-neevsk-web:check-types: - 1 hint
apps-neevsk-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m99[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m99[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m73[0m:[93m35[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m73[0m                                 </ExpandableContent>
apps-edlove-web:check-types: [7m  [0m [91m                                  ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m45[0m:[93m34[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m45[0m                                 <ExpandableContent
apps-edlove-web:check-types: [7m  [0m [91m                                 ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m32[0m:[93m47[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.

apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m32[0m                     const { Content } = await render(entry);
apps-edlove-web:check-types: [7m  [0m [91m                                              ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CosmicParticles'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m9[0m     <CosmicParticles />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/cosmos/index.astro[0m:[93m8[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m8[0m <Layout title="The Paradigm Cosmos | EdLove" theme="cosmic">
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m139[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m139[0m </Layout>
apps-edlove-web:check-types: [7m   [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m60[0m:[93m27[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m60[0m                         </ExpandableContent>
apps-edlove-web:check-types: [7m  [0m [91m                          ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m52[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m52[0m                         <ExpandableContent

apps-edlove-web:check-types: [7m  [0m [91m                         ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m50[0m:[93m47[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m50[0m                     const { Content } = await render(entry);
apps-edlove-web:check-types: [7m  [0m [91m                                              ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m9[0m     <CinematicBackground />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m8[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m8[0m <Layout title="Gurudevi | The Divine Teacher">
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m115[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m115[0m </Layout>

apps-edlove-web:check-types: [7m   [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m107[0m:[93m35[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m107[0m                                 </ExpandableContent>
apps-edlove-web:check-types: [7m   [0m [91m                                  ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m103[0m:[93m34[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m103[0m                                 <ExpandableContent title={entry.data.title} subtitle={entry.data.subtitle} icon={entry.data.icon}>
apps-edlove-web:check-types: [7m   [0m [91m                                 ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m101[0m:[93m55[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m101[0m                             const { Content } = await render(entry);
apps-edlove-web:check-types: [7m   [0m [91m                                                      ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m100[0m:[93m45[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m100[0m                         {stories.map(async (entry) => {
apps-edlove-web:check-types: [7m   [0m [91m                                            ~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m100[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'stories'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m100[0m                         {stories.map(async (entry) => {
apps-edlove-web:check-types: [7m   [0m [91m                         ~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m96[0m:[93m14[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'stories'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m96[0m             {stories.length > 0 && (
apps-edlove-web:check-types: [7m  [0m [91m             ~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m89[0m:[93m31[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m89[0m                             </ExpandableContent>
apps-edlove-web:check-types: [7m  [0m [91m                              ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m85[0m:[93m30[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m85[0m                             <ExpandableContent title={entry.data.title} subtitle={entry.data.subtitle} icon={entry.data.icon}>
apps-edlove-web:check-types: [7m  [0m [91m                             ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m83[0m:[93m51[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m83[0m                         const { Content } = await render(entry);
apps-edlove-web:check-types: [7m  [0m [91m                                                  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m82[0m:[93m44[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m82[0m                     {frameworks.map(async (entry) => {
apps-edlove-web:check-types: [7m  [0m [91m                                           ~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m82[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'frameworks'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m82[0m                     {frameworks.map(async (entry) => {
apps-edlove-web:check-types: [7m  [0m [91m                     ~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m72[0m:[93m31[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m72[0m                             </ExpandableContent>
apps-edlove-web:check-types: [7m  [0m [91m                              ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m68[0m:[93m30[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m68[0m                             <ExpandableContent title={entry.data.title} subtitle={entry.data.subtitle} icon={entry.data.icon}>
apps-edlove-web:check-types: [7m  [0m [91m                             ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m66[0m:[93m51[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m66[0m                         const { Content } = await render(entry);
apps-edlove-web:check-types: [7m  [0m [91m                                                  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m65[0m:[93m42[0m - [91merror[0m[90m ts(7006): [0mParameter 'entry' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m65[0m                     {thinkers.map(async (entry) => {
apps-edlove-web:check-types: [7m  [0m [91m                                         ~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m65[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'thinkers'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m65[0m                     {thinkers.map(async (entry) => {
apps-edlove-web:check-types: [7m  [0m [91m                     ~~~~~~~~[0m

apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m41[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m41[0m     <CinematicBackground />
apps-edlove-web:check-types: [7m  [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m39[0m:[93m21[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m39[0m     structuredData={structuredData}
apps-edlove-web:check-types: [7m  [0m [91m                    ~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m36[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.

apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m36[0m <Layout
apps-edlove-web:check-types: [7m  [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m17[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m17[0m const _structuredData = {
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m13[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_stories' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m13[0m const _stories = libraryEntries
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m10[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_frameworks' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m10[0m const _frameworks = libraryEntries
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~~~~[0m

apps-edlove-web:check-types: [96msrc/pages/library/index.astro[0m:[93m7[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_thinkers' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m7[0m const _thinkers = libraryEntries
apps-edlove-web:check-types: [7m [0m [93m      ~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m460[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m460[0m </Layout>
apps-edlove-web:check-types: [7m   [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m449[0m:[93m49[0m - [91merror[0m[90m ts(7006): [0mParameter 'item' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m449[0m                     {specializedInnovations.map(item => (
apps-edlove-web:check-types: [7m   [0m [91m                                                ~~~~[0m

apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m449[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'specializedInnovations'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m449[0m                     {specializedInnovations.map(item => (
apps-edlove-web:check-types: [7m   [0m [91m                     ~~~~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m399[0m:[93m51[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'getCardStyle'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m399[0m                                 const cardStyle = getCardStyle(i);
apps-edlove-web:check-types: [7m   [0m [91m                                                  ~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m398[0m:[93m60[0m - [91merror[0m[90m ts(7006): [0mParameter 'i' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m398[0m                             {region.innovations.map((item, i) => {
apps-edlove-web:check-types: [7m   [0m [91m                                                           ~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m398[0m:[93m54[0m - [91merror[0m[90m ts(7006): [0mParameter 'item' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m398[0m                             {region.innovations.map((item, i) => {
apps-edlove-web:check-types: [7m   [0m [91m                                                     ~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m382[0m:[93m27[0m - [91merror[0m[90m ts(7006): [0mParameter 'region' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m382[0m             {regions.map((region) => {
apps-edlove-web:check-types: [7m   [0m [91m                          ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m382[0m:[93m14[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'regions'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m382[0m             {regions.map((region) => {
apps-edlove-web:check-types: [7m   [0m [91m             ~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m361[0m:[93m56[0m - [91merror[0m[90m ts(7006): [0mParameter 'item' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m361[0m                     {globalOpenSource.innovations.map((item) => (
apps-edlove-web:check-types: [7m   [0m [91m                                                       ~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m361[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m361[0m                     {globalOpenSource.innovations.map((item) => (
apps-edlove-web:check-types: [7m   [0m [91m                     ~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m357[0m:[93m80[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m357[0m                     <p class="text-slate-400 text-lg italic leading-relaxed">"{globalOpenSource.subtitle}"</p>
apps-edlove-web:check-types: [7m   [0m [91m                                                                               ~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m356[0m:[93m124[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m356[0m                     <p class="text-xs font-mono uppercase tracking-[0.4em] font-bold text-emerald-400 mb-6">Access Layer: {globalOpenSource.focus}</p>
apps-edlove-web:check-types: [7m   [0m [91m                                                                                                                           ~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m355[0m:[93m172[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'globalOpenSource'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m355[0m                     <h2 class="text-4xl font-heading font-bold text-white mb-4 tracking-tight uppercase underline decoration-emerald-500 decoration-4 underline-offset-8">{globalOpenSource.name}</h2>
apps-edlove-web:check-types: [7m   [0m [91m                                                                                                                                                                           ~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m337[0m:[93m35[0m - [91merror[0m[90m ts(7006): [0mParameter 'region' implicitly has an 'any' type.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m337[0m                     {regions.map((region) => (
apps-edlove-web:check-types: [7m   [0m [91m                                  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m337[0m:[93m22[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'regions'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m337[0m                     {regions.map((region) => (
apps-edlove-web:check-types: [7m   [0m [91m                     ~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m297[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m297[0m     <CinematicBackground />
apps-edlove-web:check-types: [7m   [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m

apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m296[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m296[0m <Layout title="Global Innovation Gallery | EdLove" theme="library">
apps-edlove-web:check-types: [7m   [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m290[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_getCardStyle' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m290[0m const _getCardStyle = (index: number) => {
apps-edlove-web:check-types: [7m   [0m [93m      ~~~~~~~~~~~~~[0m

apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m250[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_specializedInnovations' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m250[0m const _specializedInnovations = [
apps-edlove-web:check-types: [7m   [0m [93m      ~~~~~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m46[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_regions' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m46[0m const _regions = [
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/gallery.astro[0m:[93m3[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_globalOpenSource' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m3[0m const _globalOpenSource = {
apps-edlove-web:check-types: [7m [0m [93m      ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m117[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m117[0m </Layout>
apps-edlove-web:check-types: [7m   [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m106[0m:[93m27[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m106[0m                         </ExpandableContent>

apps-edlove-web:check-types: [7m   [0m [91m                          ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m87[0m:[93m26[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'ExpandableContent'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m87[0m                         <ExpandableContent
apps-edlove-web:check-types: [7m  [0m [91m                         ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m84[0m:[93m43[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'render'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m84[0m                 const { Content } = await render(entry);
apps-edlove-web:check-types: [7m  [0m [91m                                          ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m31[0m:[93m21[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'structuredData'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m31[0m     structuredData={structuredData}
apps-edlove-web:check-types: [7m  [0m [91m                    ~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m27[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m27[0m <Layout
apps-edlove-web:check-types: [7m  [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/resources/index.astro[0m:[93m8[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'_structuredData' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m8[0m const _structuredData = {
apps-edlove-web:check-types: [7m [0m [93m      ~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m39[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.

apps-edlove-web:check-types: 

apps-edlove-web:check-types: [7m39[0m </Layout>

apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'FloatingParticles'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m9[0m     <FloatingParticles />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m8[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m8[0m     <CinematicBackground showVideo={true} />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/si/index.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m4[0m <Layout>
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/sri-lanka/index.astro[0m:[93m366[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m366[0m </Layout>
apps-edlove-web:check-types: [7m   [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/sri-lanka/index.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m4[0m <Layout title="Sri Lanka: The Two Realities | EdLove" theme="diagnostic">
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m

apps-edlove-web:check-types: 

apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m39[0m:[93m3[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.

apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m39[0m </Layout>
apps-edlove-web:check-types: [7m  [0m [91m  ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m9[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'FloatingParticles'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m9[0m     <FloatingParticles />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m8[0m:[93m6[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'CinematicBackground'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m8[0m     <CinematicBackground showVideo={true} />
apps-edlove-web:check-types: [7m [0m [91m     ~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: [96msrc/pages/ta/index.astro[0m:[93m4[0m:[93m2[0m - [91merror[0m[90m ts(2304): [0mCannot find name 'Layout'.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m4[0m <Layout>
apps-edlove-web:check-types: [7m [0m [91m ~~~~~~[0m
apps-edlove-web:check-types: 

apps-edlove-web:check-types: Result (41 files): 
apps-edlove-web:check-types: - 116 errors
apps-edlove-web:check-types: - 0 warnings
apps-edlove-web:check-types: - 18 hints
apps-edlove-web:check-types: 

apps-edlove-web:check-types:  ELIFECYCLE  Command failed with exit code 1.

 ERROR 
 apps-edlove-web#check-types: command (C:\Users\Naween\projects\polymath-platform\apps\edlove-web) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (1)



 Tasks:    2 successful, 4 total
Cached:    1 cached, 4 total

  Time:    20.83s 

Failed:    apps-edlove-web#check-types



 ERROR  run failed: command  exited (1)


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 22.7s
Findings: 143
Log File: reports/check-types.txt
--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-01T02:17:38.036Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-circular
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/components-native/Livin
gCard.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts

x 72 dependency violations (0 errors, 72 warnings). 1838 modules, 5922 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.0s
Findings: 0
Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-01T02:17:50.867Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-orphans
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/components-native/Livin
gCard.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts

x 72 dependency violations (0 errors, 72 warnings). 1838 modules, 5922 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 10.6s
Findings: 66

Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-01T02:18:02.279Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/components-native/Livin
gCard.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts

x 72 dependency violations (0 errors, 72 warnings). 1838 modules, 5922 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.1s
Findings: 73
Log File: reports/architecture.txt

--------------------------------------------------------------------------------


✅ All hygiene checks passed!


> polymath-platform@1.0.0 identity:check C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"


>>> Starting Sovereign Audit: 2026-05-01T02:18:15.043Z

>>> Command: node scripts/check-identity-alignment.mjs

--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 0.82s. Found 0 potential alignment issues.



[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 1.4s
Findings: 0

Log File: reports/identity_check.txt

--------------------------------------------------------------------------------

 ERR_PNPM_DLX_NO_BIN  No binaries found in gitleaks

```
