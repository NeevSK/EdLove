# Gurudevi visual confidence plan without physical devices

Physical-device profiling remains the final authority for FPS, frame time,
native heap, decoder behavior, and GPU cost. Before devices are available, the
repository can still provide strong confidence around correctness, regressions,
accessibility, asset governance, and capability policy.

## Test layers

### 1. Pure policy tests

Exercise every device tier, fidelity level, network condition, battery state,
and reduced-motion combination. These verify deterministic capability policy,
not rendering.

### 2. Mounted integration tests

Mount real UI components with only platform boundaries mocked. Simulate image
decode failure, source replacement, state changes, reduced motion, safe mode,
and missing providers. Assert visible fallback UI and preserved actions.

### 3. Asset contract tests

Validate that every production delivery asset exists, is registered, is within
the file-size budget, and maps to a Figma source. Validate role/state fallback
resolution separately from image bytes.

### 4. Visual regression tests

When a runnable web preview target is available, capture Playwright screenshots
for all semantic states in light/dark, reduced motion, and safe mode. Compare
against approved baselines and Figma exports. Screenshot tests are not a
replacement for device profiling.

### 5. Fault injection

Intentionally fail storage, telemetry, network, image decode, provider setup,
and remote safe-mode inputs. The test must prove that actions and semantic
meaning remain available.

### 6. Mutation testing

Periodically mutate policy branches and fallback conditions. The suite should
fail when blur is accidentally enabled in Low mode, reduced motion is ignored,
or SVG fallback is removed. Do not weaken assertions to accommodate mutants.

## Accessibility contract

Every state requires a meaningful accessible label, an actionable recovery path
when appropriate, no duplicate announcements, and no motion when reduced
motion is enabled. Web variants additionally require keyboard reachability and
contrast checks.

## Render-policy contract

- One active mascot image at a time.
- No pose-sheet crop logic in runtime.
- Low/safe mode: same artwork and actions, no blur or ambient aura.
- Reduced motion: no animation, particles, or decorative movement.
- High-capability Auto: rich treatment is allowed, not required.
- Offline/poor network: no prefetch.

## CI guardrails

CI should run asset validation, targeted integration tests, type/lint checks,
duplicate detection, and (when configured) visual snapshot tests. Asset size
and registration failures are release-blocking. Device profiling is a separate
release gate.

## Governance checklist for new mascot art

- one clear emotional intent;
- readable silhouette at 24–48 px;
- approved light and dark treatment;
- role meaning expressed through gesture/prop/situation;
- localization-safe composition;
- Figma source node and approval status;
- static fallback and failure behavior;
- delivery derivative and size budget.

## Current implementation status

Pure policy, mounted mascot/feedback integration, safe-mode, state-machine,
asset validation, accessibility labels, and duplicate detection are implemented.
Playwright screenshot baselines, mutation tooling, and physical profiling await
their respective runnable targets.
