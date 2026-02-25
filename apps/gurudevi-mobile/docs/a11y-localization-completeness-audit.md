# Audit: Accessibility (a11y) and Localization Completeness (`si`, `ta`)

## Scope
- Audited `apps/gurudevi-mobile/src` for:
  1. Accessibility implementation signals in UI code.
  2. Localization completeness for Sinhala (`si`) and Tamil (`ta`) against English (`en`).

## Method
### Accessibility checks (static heuristics)
- Scanned `.tsx` files for interactive controls: `Pressable`, `TouchableOpacity`, `TouchableWithoutFeedback`, `Button`, `IconButton`, `TextInput`, `Switch`.
- For each control, checked whether accessibility metadata exists on the element (`accessibilityLabel`, `accessibilityHint`, `accessibilityRole`, etc.).
- Scanned `Image`/`AvatarImage` tags for explicit accessibility metadata.

> Note: This is a static code audit; runtime screen-reader behavior and keyboard focus order still require manual QA on device.

### Localization checks (static heuristics)
- Flattened `en.json`, `si.json`, `ta.json` locale trees to compare leaf-key coverage.
- Measured missing keys in `si` and `ta` relative to `en`.
- Counted files with no `t(...)` usage and detected likely hardcoded strings in `.tsx` as a localization debt signal.

## Results

## 1) Accessibility (a11y)
### Raw metrics
- Interactive elements found: **175**
- Interactive elements with explicit accessibility props: **4**
- **A11y control-metadata coverage: 2.3%**

- Images found: **6**
- Images with explicit accessibility props: **1**
- **Image accessibility coverage: 16.7%**

### A11y completeness score
- Scoring formula (weighted):
  - 80% weight: interactive control metadata coverage
  - 20% weight: image accessibility coverage
- Score = `0.8 * 2.3 + 0.2 * 16.7 = 5.2 / 100`

**A11y Completeness Score: 5/100 (critical gap)**

### Largest visible gaps
- Many high-traffic files have controls without explicit accessibility props (e.g., `ProfileScreen`, `AuthScreen`, `OnboardingScreen`, principal/self components).
- Large amount of icon/action controls likely need explicit labels/hints for screen readers.

## 2) Localization (`si`, `ta`)
### Locale key coverage against English
- `en` leaf keys: **763** (baseline)
- `si` leaf keys present: **587**
  - Missing from `en`: **176**
  - Coverage: **76.9%**
- `ta` leaf keys present: **567**
  - Missing from `en`: **200**
  - Coverage: **74.3%**

### UI string externalization signals
- `.tsx` files audited: **85**
- Files with no `t(...)` usage: **38** (**44.7%**)
- Potential hardcoded UI literals detected (heuristic): **272**

### Localization completeness score
- Scoring formula (weighted):
  - 70% weight: average locale key coverage (`si`, `ta`)
  - 30% weight: i18n instrumentation coverage across `.tsx` files (`1 - files_without_t / total_files`)
- Average key coverage = `(76.9 + 74.3) / 2 = 75.6%`
- i18n instrumentation coverage = `55.3%`
- Score = `0.7 * 75.6 + 0.3 * 55.3 = 69.5 / 100`

**Localization Completeness Score: 70/100 (moderate, but not production-complete for trilingual UX)**

## Overall score and effort estimate
### Combined score
- Weighted overall = 50% a11y + 50% localization
- `0.5 * 5.2 + 0.5 * 69.5 = 37.4 / 100`

**Overall Completeness Score: 37/100**

### “How much is needed?” (practical estimate)
1. **A11y:** very high effort needed
   - Add accessibility labels/roles/hints to ~171 interactive elements currently missing explicit metadata.
   - Add alt/accessibility labels to ~5 image usages missing metadata.
   - Run screen-reader QA pass on primary flows (Auth, Onboarding, Profile, Self, Classroom).

2. **Localization (`si`, `ta`):** medium-high effort needed
   - Add ~176 missing Sinhala keys and ~200 missing Tamil keys.
   - Externalize hardcoded UI text in top-priority screens/components, then connect to `t(...)`.
   - Priority files are those with many literals and low/no translation usage.

## Recommended priority order
1. **A11y foundations first** on Auth + Onboarding + Profile + navigation tabs.
2. **Close locale key gaps** (`si`, `ta`) to reach parity with `en`.
3. **Externalize remaining hardcoded strings** in high-traffic components.
4. **Regression checks** (screen-reader smoke tests + locale snapshot checks).
