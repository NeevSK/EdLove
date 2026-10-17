---
name: tcdi-audit
description: |
  Workflow cheatsheet for the TCDI (Temporal Convolutional Dependency Intelligence)
  system in the rn-terrain workspace. Covers daily debug workflow, signal management,
  combo queries, chronology regeneration, and external tool integration.
  Activate when: debugging native crashes, auditing RN dependency versions,
  adding new package signals, or running the live check command.
---

# TCDI Audit Skill

> **NOTE**: The legacy `.mjs` engine has been promoted to the production `@intuitui-labs/rn-terrain` platform.
> For the comprehensive pre-flight agent guidance and AST guardrail rules, activate the **`rn-terrain`** skill.

## Location
The platform workspace is `c:/projects/rn-terrain/` (CLI: `rn-eval` / `rn-terrain`).

## 1. Daily Debug & Grounding Workflow
```bash
# Step 1: Pre-flight Agent Compass (ground whitelisted modern APIs)
rn-eval compass <package-name> [version]

# Step 2: Physical node_modules Affordances (.d.ts symbols on disk)
rn-eval affordance <package-name>

# Step 3: Run live project scan & React Native 1.0 readiness
rn-eval scan
rn-eval v1-check

# Step 4: Calculate migration path across breaking versions
rn-eval jump <package> <from-version> <to-version>

# Step 5: Test proposed code diff against Policy Gate & Tree-sitter
rn-eval gate <package> <version> [code-snippet]
```

## 2. CI Gate (Block PRs on Severed APIs or Broken Combos)
```bash
# Strict AST diff and New Architecture gate
rn-eval gate <package> <version> <path-to-diff>
```

## 3. Single-Package Kernel Projection

```bash
node docs/changelog-intelligence/engine/project-kernel.mjs react-native-reanimated 4.1.0
node docs/changelog-intelligence/engine/project-kernel.mjs react-native-gesture-handler 3.3.0
```

## 4. Combo Graph Queries

```bash
# CLI
node engine/project-kernel.mjs --combo Reanimated@3.5.0
node engine/project-kernel.mjs --combo react-native-reanimated@4.6.0 react-native@0.88.0

# Raw jq (today, before P4 graph DB)
jq '.combos[] | select(.status == "BROKE")' data/compat/combos.json
jq '.combos[] | select(.package_a == "Reanimated" and .status == "BROKE")' data/compat/combos.json
```

## 5. External Tool Bridge (Enrichment Sources)

```bash
# Check @rnx-kit/align-deps alignment
node docs/changelog-intelligence/scripts/tool-bridge.mjs --rnx package.json

# Query RN Directory for New Arch support
node docs/changelog-intelligence/scripts/tool-bridge.mjs --rn-directory react-native-reanimated
node docs/changelog-intelligence/scripts/tool-bridge.mjs --rn-directory react-native-gesture-handler

# Fetch Expo authoritative SDK pins live
node docs/changelog-intelligence/scripts/tool-bridge.mjs --expo-pins 57.0.24
node docs/changelog-intelligence/scripts/tool-bridge.mjs --expo-pins 56.0.22 --json

# Full enrichment (all sources merged)
node docs/changelog-intelligence/scripts/tool-bridge.mjs --enrich package.json
```

## 6. Adding a New Chronos Signal

1. Open the package shard: `data/packages/<pkg>.json`
2. Add a new feature key: `chronos_sN` (where N is next available number)
3. Required fields:
   ```json
   "chronos_sN": {
     "display": "Short human description",
     "impact_severity": "CRITICAL|HIGH|MEDIUM|LOW",
     "transition_milestones": {
       "broken": "x.y.z",       // version where it regressed
       "fixed": "x.y.z"         // null if still open
     },
     "rules": {
       "dev_dance": "What the workaround is",
       "decommission_at": "x.y.z"  // version to remove the workaround
     },
     "_chronos_meta": {
       "source_url": "https://github.com/org/repo/issues/NNNN",
       "heat_score": 72
     }
   }
   ```
4. Run ingestion to verify the shard is valid:
   ```bash
   node docs/changelog-intelligence/engine/project-kernel.mjs <pkg> <broken-version>
   # Should show the new signal in BROKEN state
   ```
5. Regenerate the chronology:
   ```bash
   node docs/changelog-intelligence/scripts/generate-chronologies.mjs --pkg <pkg> --force
   ```

## 7. Adding a New Combo Record

Edit `data/compat/combos.json`, add to `.combos[]`:
```json
{
  "title": "Descriptive title of the incompatibility",
  "package_a": "PackageNameA",
  "range_a": "4.6.x",
  "package_b": "PackageNameB",
  "range_b": "0.88.x",
  "status": "BROKE",
  "what_broke": "What happens at runtime",
  "forces_or_breaks": "Upgrading X forces Y; installing Z breaks W",
  "fixed_in": "version where fixed, or null",
  "source_url": "https://github.com/...",
  "chronos_note": "Optional additional context"
}
```

## 8. Regenerating Chronologies

```bash
# All packages (will skip already-generated unless --force)
node docs/changelog-intelligence/scripts/generate-chronologies.mjs

# Force regenerate all (after shard updates)
node docs/changelog-intelligence/scripts/generate-chronologies.mjs --force

# Single package only
node docs/changelog-intelligence/scripts/generate-chronologies.mjs --pkg react-native-reanimated --force

# Check staleness (exits 1 if any shard is newer than its chronology)
node docs/changelog-intelligence/scripts/generate-chronologies.mjs --check-stale
```

## 9. Ingesting New Chronos Archive Data

```bash
# Dry-run first
node docs/changelog-intelligence/scripts/ingest-chronos-signals.mjs --dry-run

# Ingest one package
node docs/changelog-intelligence/scripts/ingest-chronos-signals.mjs --pkg react-native-worklets

# Full ingest
node docs/changelog-intelligence/scripts/ingest-chronos-signals.mjs
```

## 10. Key File Locations

| File | Purpose |
|---|---|
| `data/packages/<pkg>.json` | Ground truth shard (EDIT THIS, not chronology) |
| `data/compat/combos.json` | Cross-dep collision graph (32 records) |
| `engine/project-kernel.mjs` | O(1) kernel + --check --combo --exit-code |
| `scripts/tool-bridge.mjs` | External tool integration (rnx-kit, RN Dir, Expo) |
| `scripts/ingest-chronos-signals.mjs` | Chronos archive ingester |
| `scripts/generate-chronologies.mjs` | Reverse-chrono ledger generator |
| `chronology/<pkg>.md` | Derived views (DO NOT edit directly) |
| `schemas/package-features.schema.json` | JSON Schema for shard validation |

## 11. Signal Severity Guide

| Severity | Meaning | Example |
|---|---|---|
| CRITICAL | Fatal crash or total feature loss | SIGABRT, NativeModule not found |
| HIGH | Severe behavior regression, data loss risk | FPS drop to 5fps, animation broken |
| MEDIUM | Visible bug with workaround | Wrong color, wrong layout in edge case |
| LOW | Minor aesthetic or warning | Console warning, deprecated no-op |

## 12. AST Continuum Scanner (@intuitui-labs/rn-terrain-scanner)

Runs path-dependent AST analysis across the continuous historical interval $[v_{\text{start}}, v_{\text{current}}]$.

### CLI Recipes

```bash
# 1. Full scan (Legacy Fence + Capabilities Radar)
node packages/scanner/dry-run.mjs --all

# 2. Legacy Fence only (flags lethal, defective, and deprecated code)
node packages/scanner/dry-run.mjs --fence

# 3. Capabilities Radar only (flags unadopted modern APIs)
node packages/scanner/dry-run.mjs --radar

# 4. User-configured version boundaries (override git history and package.json)
node packages/scanner/dry-run.mjs --from 2.14.0 --to 3.3.0

# 5. Configurable Adoption Horizon
node packages/scanner/dry-run.mjs --horizon current-major       # default
node packages/scanner/dry-run.mjs --horizon from-project-start  # lifetime history
node packages/scanner/dry-run.mjs --horizon last-n-minors:2     # recent releases
node packages/scanner/dry-run.mjs --horizon explicit:3.1.0     # custom baseline

# 6. Monorepo targets & explicit directories
node packages/scanner/dry-run.mjs --cwd c:/x/apps/gurudevi-mobile
node packages/scanner/dry-run.mjs --dirs packages/ui/src,apps/gurudevi-mobile/src
```

### 5 API Lifecycle States & Adoption Quadrants
- **`UNSUPPORTED_REMOVED`**: Existed historically, severed in or before current version. Lethal at runtime.
- **`BROKEN_DEFECTIVE`**: Present in current version, but exhibits active regressions or event drops.
- **`DEPRECATED`**: Scheduled for removal; emits warnings or triggers legacy fallback paths.
- **`FUNCTIONAL_STABLE`**: Canonical production baseline; clean pass.
- **`NEW_CAPABILITY`**: Modern API introduced in horizon; surfaced in Capabilities Radar if unadopted.

