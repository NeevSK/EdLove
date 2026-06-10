# Implementation Checklist: Oxlint + ESLint Hybrid for Monorepo

## Phase 1: Oxlint Setup (Foundation)

### 1.1 Root config
- [ ] Create `.oxlintrc.json` at monorepo root
  - Copy from: `.oxlintrc.json` (provided)
  - Enables: `react`, `import` plugins
  - Categories: correctness=error, suspicious=warn, style=off
  - This is the baseline all packages inherit

### 1.2 Per-app Oxlint configs
For each of your 6 main apps, create an `oxlint.config.ts` or `.oxlintrc.json`:

#### Expo app (`apps/expo/.oxlintrc.json`)
- [ ] Create or update
- [ ] Extends root `.oxlintrc.json`
- [ ] Plugins: `react`, `import`, `react-native` (if available)
- [ ] Rules: Add react-native specific rules (no-unused-styles, split-platform-components)

#### Hono API (`apps/hono-api/.oxlintrc.json`)
- [ ] Create or update
- [ ] Extends root `.oxlintrc.json`
- [ ] Override: `env: { browser: false, node: true }` (no browser globals)
- [ ] Plugins: `import`
- [ ] Rules: `no-console: off` (APIs need console.log sometimes)

#### Astro/Svelte websites (each app)
- [ ] Create or update `.oxlintrc.json`
- [ ] Extends root `.oxlintrc.json`
- [ ] Plugins: `react`, `import`, `astro` (if Oxlint supports it)
- [ ] Note: Oxlint handles `.astro` JS/TS, not HTML templates. ESLint handles templates.

### 1.3 Install Oxlint
```bash
pnpm install -D oxlint
```

### 1.4 Test Oxlint locally
```bash
oxlint . --deny-warnings
```
- Should run in 2–5 seconds
- If errors appear, they're the 90% of issues Oxlint catches
- Fix them or `--allow-warnings` to proceed to ESLint layer

---

## Phase 2: ESLint Integration (Depth)

### 2.1 Install eslint-plugin-oxlint
```bash
pnpm install -D eslint-plugin-oxlint
```

### 2.2 Update root ESLint config
**File:** `packages/eslint-config/base.js` (or your root `eslint.config.js`)

Key changes:
- [ ] Import `eslint-plugin-oxlint`
- [ ] Add framework-specific configs:
  - [ ] Svelte SFC linting (if using Svelte 5)
  - [ ] Astro template linting (if using Astro 6)
  - [ ] Custom rules (max-use-state, etc.)
  - [ ] @eslint-react/eslint-plugin (if you have it)
- [ ] **LAST in config array:** Add `...oxlint.configs['flat/recommended']`
  - This disables all 650 rules Oxlint already checked
  - ESLint now only runs on framework-specific + custom rules

### 2.3 Per-package ESLint configs
Update or create `eslint.config.js` in each app:

#### Expo app
- [ ] Extends base config
- [ ] Adds: React Native specific rules (if you have custom ones)
- [ ] Includes: Custom rules (max-use-state)

#### Hono API
- [ ] Extends base config
- [ ] Overrides: No browser globals, allow console.log
- [ ] No React-specific rules

#### Astro/Svelte websites
- [ ] Extends base config
- [ ] Adds: Svelte SFC parser + eslint-plugin-svelte
- [ ] Adds: Astro parser + @astrojs/eslint-plugin
- [ ] These handle template linting (Oxlint can't do this yet)

### 2.4 Verify ESLint runs correctly
```bash
pnpm eslint . --max-warnings 0
```
- Should be 5–10x faster than before (because Oxlint disabled overlap)
- If it's not faster, the plugin-oxlint config might not be working
- Check: Are the rules actually disabled? Run `pnpm eslint --debug` and look for "oxlint" in the output

---

## Phase 3: Biome Migration (Format-Only)

### 3.1 Update biome.json
**File:** `biome.json` (at root)

Changes:
- [ ] Set `"linter": { "enabled": false }`
- [ ] Keep `"formatter": { "enabled": true, ... }`
- [ ] Verify formatting options match your team's preference
  - Indentation, line width, semicolons, quotes, etc.

### 3.2 Remove Biome linting from CI/local scripts
- [ ] Update root `package.json` `lint` script to remove `biome lint`
- [ ] Update any app-level `lint` scripts to remove `biome lint`
- [ ] Keep only `biome format --check` / `biome format --write`

### 3.3 Verify Biome format works
```bash
pnpm biome format --write .
```
- Should be ~500ms (30x faster than Prettier)
- No linting errors should appear (linter disabled)

---

## Phase 4: Root Scripts & Orchestration

### 4.1 Update root `package.json` scripts
```json
{
  "scripts": {
    "lint": "npm run lint:oxlint && npm run lint:eslint && npm run format:check",
    "lint:fix": "npm run lint:oxlint:fix && npm run lint:eslint:fix && npm run format:fix",
    "lint:oxlint": "oxlint . --deny-warnings",
    "lint:oxlint:fix": "oxlint . --fix",
    "lint:eslint": "eslint . --max-warnings 0",
    "lint:eslint:fix": "eslint . --fix",
    "format": "biome format --write .",
    "format:check": "biome format --check .",
    "format:fix": "biome format --write ."
  }
}
```

### 4.2 CI/CD Integration
If using Turbo:
```json
{
  "scripts": {
    "lint": "turbo run lint"
  }
}
```

Each app runs its own `lint:oxlint` and `lint:eslint` tasks. Root `lint` orchestrates.

---

## Phase 5: Testing & Validation

### 5.1 Verify the pipeline timing
```bash
time pnpm lint
```

Expected:
- Oxlint: 2–5 seconds
- ESLint: 10–30 seconds (reduced from previous 60–120s)
- Biome format: 5–10 seconds
- **Total: 30–50 seconds** (vs. 120–180s before)

### 5.2 Verify rule coverage
- [ ] Oxlint catches: JS/TS correctness, imports, best practices
- [ ] ESLint catches: Svelte templates, Astro templates, custom rules (max-use-state)
- [ ] Biome formats: Everything consistently

### 5.3 Verify no duplicates
```bash
pnpm eslint . --debug | grep "oxlint"
```

Should see output confirming `eslint-plugin-oxlint` is active and disabling rules.

### 5.4 Test per-package linting
```bash
cd apps/expo && pnpm lint
cd apps/hono-api && pnpm lint
cd apps/website-astro && pnpm lint
```

Each should run Oxlint → ESLint → Biome without errors.

---

## Phase 6: Developer & CI Integration

### 6.1 Update pre-commit hooks
If using Husky/lint-staged:
```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx,svelte,astro}": [
      "oxlint --fix",
      "eslint --fix",
      "biome format --write"
    ]
  }
}
```

### 6.2 Update CI/CD
In your GitHub Actions / GitLab CI:
```yaml
- name: Lint (Oxlint)
  run: pnpm lint:oxlint

- name: Lint (ESLint)
  run: pnpm lint:eslint

- name: Format check (Biome)
  run: pnpm format:check
```

---

## Phase 7: Rollout & Monitoring

### 7.1 Soft launch
- [ ] Merge to `develop` branch first
- [ ] Run `pnpm lint` locally — does it work?
- [ ] Run in CI — does it pass?
- [ ] Measure times: Is it faster?

### 7.2 Fix any failing rules
If Oxlint or ESLint fails on existing code:
- [ ] Review each error
- [ ] Fix legit issues (most will be legit)
- [ ] Disable false positives with `// oxlint-disable-next-line rule-name`
- [ ] Document why you disabled it

### 7.3 Team communication
- [ ] Share timing improvements: "Linting dropped from 120s to 45s"
- [ ] Explain the pipeline: "Oxlint first (fast), ESLint second (depth), Biome last (format)"
- [ ] Link to docs: Oxlint rules, ESLint rules, custom rule logic

### 7.4 Monitor for regressions
- [ ] Run `pnpm lint` weekly to ensure configs stay sane
- [ ] If new frameworks added (e.g., Remix), add Oxlint config for them
- [ ] Periodically review disabled rules — remove if no longer needed

---

## Common Pitfalls & Fixes

### "Oxlint doesn't recognize my custom rule"
✓ Expected. Oxlint can't run custom JS rules (yet). ESLint handles them.

### "ESLint is as slow as before"
✗ Check: Is `eslint-plugin-oxlint` actually disabling rules?
```bash
pnpm eslint --debug 2>&1 | grep -i oxlint
```
Should show rule disabling. If not, check import in `eslint.config.js`.

### "Biome format conflicts with ESLint"
✓ Expected if you have style rules in ESLint. Solution: Move all style rules to Biome, keep only logic rules in ESLint.

### "Oxlint doesn't lint Svelte/Astro templates"
✓ By design. Oxlint only handles JS/TS blocks. ESLint handles templates via parsers.

### "I get 'Config file not found' in VSCode"
This is VSCode's oxlint extension falling back to default. It's cosmetic — CLI works fine. Restart VSCode to refresh.

---

## Success Criteria

You'll know the implementation is complete when:

- [ ] Oxlint runs and catches basic errors in 2–5s
- [ ] ESLint runs and catches framework-specific issues in 10–30s
- [ ] Biome formats code in 5–10s
- [ ] Total lint time: <50 seconds for entire monorepo
- [ ] All 6 apps pass: Expo, Hono, Astro/Svelte websites
- [ ] CI/CD passes
- [ ] Team can run `pnpm lint` locally without waiting
- [ ] Custom rules (max-use-state) still work
- [ ] Svelte/Astro templates still lint correctly

---

## Files Modified/Created

| File | Action | Why |
|------|--------|-----|
| `.oxlintrc.json` (root) | **Create** | Baseline Oxlint config for entire monorepo |
| `apps/expo/.oxlintrc.json` | **Create/Update** | Expo-specific (React Native rules) |
| `apps/hono-api/.oxlintrc.json` | **Create/Update** | Hono-specific (Node.js only, no browser) |
| `apps/website-astro/.oxlintrc.json` | **Create/Update** | Astro-specific (Astro plugin) |
| `packages/eslint-config/base.js` | **Update** | Add Svelte/Astro configs, add plugin-oxlint |
| `biome.json` | **Update** | Disable linting, keep formatting |
| `package.json` (root) | **Update** | Add lint scripts, install Oxlint/plugin |
| `.eslintrc.js` (per app) | **Update** | Extend base, no major changes needed |

---

## Next Steps

1. **This week:** Implement Phase 1 (Oxlint root + per-app configs)
2. **Next week:** Implement Phases 2–3 (ESLint + Biome)
3. **Before merge:** Run Phase 5 validation tests
4. **On merge:** Update CI/CD (Phase 6)
5. **Post-launch:** Monitor for regressions (Phase 7)

Questions? The agent can now execute each phase with full visibility into your monorepo structure.
