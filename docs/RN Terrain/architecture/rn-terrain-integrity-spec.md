---
title: "RN Terrain - Data Integrity Specification"
status: "active"
created: 2026-06-02
updated: 2026-06-02
author: "Neev"
tags: [rn-terrain, architecture, validation, trust]
---
# RN Terrain â€” Data Integrity Specification
## Timestamps Â· Confidence Â· Validation Â· Trust Architecture
*The source of truth for how RN Terrain handles data quality*

> "A wrong ADOPT is worse than no tool at all.
>  A tool that knows what it doesn't know
>  is more trustworthy than one that pretends certainty."

---

# PART ONE â€” THE INTEGRITY PHILOSOPHY

## What Trust Means for RN Terrain

RN Terrain's value is entirely dependent on one thing:
developers trusting the verdicts enough to act on them.

Trust is not built by being right all the time.
Trust is built by:
- Being transparent about confidence
- Being visibly correctable when wrong
- Never claiming more certainty than the data supports
- Showing your reasoning always
- Applying your own framework to yourself

Every data point in RN Terrain carries three properties:

```
1. VALUE        â€” the signal itself (bus_factor = 3)
2. CONFIDENCE   â€” how sure we are the value is correct
3. FRESHNESS    â€” how recently the value was verified
```

No signal is shown without all three.
No verdict is shown without the full breakdown.
No breakdown is shown without source links.

The developer always has the ability to verify.
The tool is orientation, not oracle.

---

# PART TWO â€” THE COMPLETE TIMESTAMP ARCHITECTURE

## Every Timestamp That Matters

Most tools track two timestamps: first release and last update.
That's too thin. The full temporal picture requires
tracking when *each type of activity* last happened â€”
because different activity types decay at different rates.

### Per-Package Timestamp Fields

```sql
-- VERSION TIMESTAMPS
first_published_at              -- when v1.0.0 first appeared on npm
                                -- source: npm registry
                                -- changes: never (immutable)

current_stable_version_date     -- when the version most devs install
                                -- was published
                                -- source: npm registry

latest_version_released_at      -- when the absolute latest version shipped
                                -- source: npm/GitHub releases

maturity_period_days            -- days latest version has been out
                                -- computed: NOW() - latest_version_released_at
                                -- taze's key concept:
                                -- don't recommend versions < 3 days old

-- COMMIT ACTIVITY TIMESTAMPS
last_any_commit_at              -- any commit, including bots/docs/deps
                                -- source: GitHub API pushed_at

last_meaningful_commit_at       -- human commit, non-trivial change
                                -- computed: filter out bot authors,
                                -- docs-only, dep-bump-only commits
                                -- most important activity signal

last_native_code_change_at      -- last time Swift/Kotlin/C++ was touched
                                -- source: GitHub file change history
                                -- critical for native packages â€”
                                -- a package can have JS commits but
                                -- stale native code underneath

last_breaking_change_at         -- last major version release
                                -- source: GitHub releases filtered by
                                -- semver major bump
                                -- how long since last disruption

-- MAINTAINER ACTIVITY TIMESTAMPS
last_issue_response_at          -- when maintainer last replied to issue
                                -- source: GitHub Issues API
                                -- best proxy for "is anyone home"

last_pr_merged_at               -- when maintainer last merged a PR
                                -- source: GitHub PRs API

last_release_at                 -- != last commit
                                -- packages can commit without releasing
                                -- source: GitHub releases / npm

-- ARCHITECTURE TIMESTAMPS
new_arch_support_added_at       -- when New Arch support was introduced
                                -- source: GitHub release notes + RN Dir
                                -- tells you how mature the New Arch impl is

hermes_v1_confirmed_at          -- when Hermes V1 compat was verified
                                -- source: release notes / manual verification

expo_sdk_compat_last_checked    -- when Expo SDK compat was last verified
                                -- source: Expo SDK release notes

legacy_arch_removed_at          -- if/when legacy bridge code was dropped
                                -- source: release notes

-- ECOSYSTEM TIMESTAMPS  
first_rn_dir_listed_at          -- when it appeared on RN Directory
first_expo_featured_at          -- when Expo first featured/mentioned it
conference_mentioned_at         -- last conference talk reference

-- SYNC TIMESTAMPS (our internal freshness)
last_synced_github_at
last_synced_npm_at
last_synced_rn_dir_at
last_full_sync_at               -- all sources synced in same pass
last_event_triggered_sync_at    -- sync triggered by an event
manually_verified_at            -- human reviewer last checked this
```

### The Rhythm Signals â€” Computed From Timestamps

These are the most powerful temporal signals.
They evaluate a package against its *own* normal pattern,
not against an absolute threshold.

```typescript
interface RhythmSignals {
  // What is this package's normal cadence?
  release_cadence_days: number        // avg days between releases (12mo)
  commit_cadence_days: number         // avg days between meaningful commits
  issue_response_cadence_days: number // avg days to maintainer response

  // How far has it deviated from its own normal?
  days_since_normal_release: number   // current gap vs expected cadence
  days_since_normal_commit: number
  release_deviation_factor: number    // current_gap / normal_cadence
  commit_deviation_factor: number     // e.g. 3.5x = 3.5x longer than normal

  // Interpretation
  rhythm_status: 'normal' | 'slow' | 'concerning' | 'silent'
}

// Why deviation matters more than absolute recency:
//
// Package A: normally releases every 7 days, silent for 30 days
//   â†’ deviation_factor = 4.3x â†’ concerning
//
// Package B: normally releases every 180 days, silent for 30 days
//   â†’ deviation_factor = 0.17x â†’ totally normal
//
// Both silent for 30 days. Completely different health signals.
// Absolute recency would treat them the same. Deviation doesn't.

function calculateRhythmStatus(
  deviationFactor: number
): RhythmSignals['rhythm_status'] {
  if (deviationFactor <= 1.5) return 'normal'
  if (deviationFactor <= 2.5) return 'slow'
  if (deviationFactor <= 4.0) return 'concerning'
  return 'silent'
}
```

---

# PART THREE â€” THE CONFIDENCE SYSTEM

## Per-Signal Confidence, Not Per-Card

One confidence score for the whole card hides too much.
Each signal carries its own confidence level.
The card's overall confidence is the weighted minimum
of its most critical signals.

### Confidence Levels

```typescript
type ConfidenceLevel =
  | 'verified'    // manually confirmed by human or 3+ source agreement
  | 'high'        // direct from authoritative API, recent, cross-validated
  | 'medium'      // single authoritative source, or computed from reliable data
  | 'low'         // estimated, inferred, single source unverified
  | 'unknown'     // not enough data to assess
```

### Per-Signal Confidence Basis

```
SIGNAL                    DEFAULT     BASIS FOR HIGHER CONFIDENCE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
stars_total               high        Direct GitHub API â€” reliable
bus_factor                medium      Computed â€” not directly measured
                                      â†’ high if 3+ source agreement
new_arch_status           variable    RN Dir = medium (self-reported)
                                      + code analysis = high
                                      + maintainer confirmed = verified
hermes_v1_compatible      medium      Unless explicitly in release notes
                                      â†’ verified if in changelog
bundle_increment_bytes    low         Estimated from package analysis
                                      â†’ high if bundle-visualizer data
wasm_binary_size_bytes    low         Rarely documented
                                      â†’ high if measured from binary
thread_safety             low         Almost never documented
                                      â†’ medium if JSI binding confirmed
category                  variable    manual = verified
                                      vendor-inferred = high
                                      automated = low
topology_layer            variable    manual = verified
                                      score-derived = medium
lindy_age_months          verified    npm first-publish date = fact
commit_rhythm             high        Direct GitHub API â€” reliable
issue_response            high        Direct GitHub API â€” reliable
download_trajectory       medium      npm counts CI noise â€” adjusted
v1_readiness              medium      Computed from multiple signals
                                      â†’ high if maintainer confirmed
```

### The Confidence Schema

```typescript
interface SignalConfidence {
  level: ConfidenceLevel
  source: string              // where this value came from
  verified_at?: string        // ISO timestamp of last verification
  verified_by?: 'api' | 'manual' | 'community' | 'computed'
  cross_validated: boolean    // agreed with 2+ other sources
  notes?: string              // why confidence is what it is
}

// Every field in VitalityCard that carries signal data
// should have a corresponding confidence entry:

interface VitalityCardWithConfidence {
  // ... all existing VitalityCard fields ...
  confidence: {
    overall: ConfidenceLevel          // weighted minimum of critical signals
    per_signal: {
      bus_factor: SignalConfidence
      new_arch_status: SignalConfidence
      hermes_v1: SignalConfidence
      bundle_size: SignalConfidence
      thread_safety: SignalConfidence
      category: SignalConfidence
      topology_layer: SignalConfidence
      v1_readiness: SignalConfidence
      // ... etc
    }
    low_confidence_signals: string[]  // list of fields with low/unknown confidence
    affects_verdict: boolean          // does low confidence change the verdict?
  }
}
```

### How Confidence Affects the Verdict

```
ADOPT requires:
  bus_factor confidence â‰¥ medium
  new_arch_status confidence â‰¥ medium
  No critical signals with confidence = unknown
  Overall freshness < 48h

TRIAL:
  One or more signals may be medium/low confidence
  But no critical signal is unknown
  Overall freshness < 72h

ASSESS:
  Multiple signals may be low confidence
  Verdict reflects uncertainty explicitly
  "ASSESS â€” limited data confidence"

HOLD:
  Can be triggered by a single critical signal
  Even if that signal is medium confidence
  Because the asymmetry rule applies:
  False HOLD is recoverable.
  False ADOPT is catastrophic.
```

### The Asymmetry Rule

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              THE ASYMMETRY RULE                      â”‚
â”‚                                                      â”‚
â”‚  ADOPT requires ALL signals green                    â”‚
â”‚         + HIGH confidence on critical signals        â”‚
â”‚         + No unresolved warnings                     â”‚
â”‚                                                      â”‚
â”‚  HOLD can be triggered by ONE critical signal        â”‚
â”‚         even at MEDIUM confidence                    â”‚
â”‚                                                      â”‚
â”‚  Reason:                                             â”‚
â”‚  A false HOLD = developer gets annoyed, checks       â”‚
â”‚  manually, ignores us on that package. Recoverable.  â”‚
â”‚                                                      â”‚
â”‚  A false ADOPT = developer builds on a decaying      â”‚
â”‚  package, it breaks in production, they blame        â”‚
â”‚  RN Terrain. Trust destroyed. Unrecoverable.         â”‚
â”‚                                                      â”‚
â”‚  We are asymmetrically conservative on ADOPT.        â”‚
â”‚  We require proof of health, not proof of decay.     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

# PART FOUR â€” THE FRESHNESS SYSTEM

## Data Freshness Is Visible Always

Never show stale data as if it were current.
The developer always sees when the data was last verified.
Freshness degrades visibly, not silently.

### Freshness Tiers

```typescript
type FreshnessTier =
  | 'live'      // synced < 1 hour ago
  | 'fresh'     // synced < 24 hours ago
  | 'recent'    // synced 24â€“72 hours ago
  | 'aging'     // synced 3â€“7 days ago â€” show indicator
  | 'stale'     // synced > 7 days ago â€” force resync or warn
  | 'unknown'   // never synced or sync timestamp missing

// UI representation:
// live    â†’ green dot "Live"
// fresh   â†’ "Updated 4h ago"
// recent  â†’ yellow "Updated 2 days ago"
// aging   â†’ orange "Updated 5 days ago â€” may be outdated"
// stale   â†’ red "Data from 12 days ago â€” treat with caution"
// unknown â†’ grey "Freshness unknown"
```

### Field-Level Freshness

Different fields have different acceptable staleness windows:

```
FIELD                     ACCEPTABLE STALENESS   REASON
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
stars_total               7 days                 Slow-moving signal
bus_factor                3 days                 Can change suddenly
commit_rhythm             1 day                  Active signal
open_issues_count         1 day                  Active signal
latest_version            6 hours                Releases happen fast
new_arch_status           7 days                 Rarely changes
hermes_v1_compatible      7 days                 Rarely changes
bundle_increment_bytes    30 days                Very slow-moving
category                  never (manual)         Immutable unless wrong
topology_layer            7 days                 Changes slowly
v1_readiness              3 days                 Important, changes

EVENT-TRIGGERED OVERRIDES:
  Any field â†’ immediate resync if:
  - Related ecosystem event fired
  - Key person posted about this package
  - npm published new version
  - GitHub release created
```

### The Four-Speed Sync Revisited With Freshness Logic

```typescript
// Speed 1: Immutable (seed once)
// No freshness concern. Never expires.
const IMMUTABLE_FIELDS = [
  'first_published_at',
  'category',           // unless manually corrected
  'package_name',
]

// Speed 2: Daily delta (volatile fields)
// Freshness check: if last_synced > 24h â†’ enqueue sync
async function shouldDailySync(pkg: Package): Promise<boolean> {
  const staleness = Date.now() - new Date(pkg.last_synced_github_at).getTime()
  return staleness > 24 * 60 * 60 * 1000
}

// Speed 3: Event-triggered (fires when something happens)
// Bypasses freshness check â€” always syncs immediately
async function onEcosystemEvent(event: EcosystemEvent) {
  const affectedPackages = event.affects
  for (const pkg of affectedPackages) {
    await immediateSync(pkg)      // priority queue, not daily batch
    await recalculateScore(pkg)   // score may have changed
    await triggerAlerts(pkg)      // notify subscribers
  }
}

// Speed 4: Real-time stream (social signals)
// Freshness window: 15 minutes (RSS polling interval)
// Does not trigger full sync â€” only event log append
// unless signal severity = critical
```

---

# PART FIVE â€” VALIDATION ARCHITECTURE

## The Four Validation Problems

### Problem 1 â€” Signal Noise Filtering

Raw data from APIs contains noise that must be filtered
before it enters the scoring engine.

```typescript
// BOT COMMIT FILTERING
const BOT_AUTHOR_PATTERNS = [
  /\[bot\]$/i,
  /^dependabot/i,
  /^renovate/i,
  /^github-actions/i,
  /^semantic-release/i,
  /^snyk-bot/i,
  /^greenkeeper/i,
]

function isBotCommit(authorName: string): boolean {
  return BOT_AUTHOR_PATTERNS.some(p => p.test(authorName))
}

function filterMeaningfulCommits(commits: GitCommit[]): GitCommit[] {
  return commits.filter(c => {
    if (isBotCommit(c.author.name)) return false

    // Filter docs-only commits
    const docsOnlyPatterns = [/^docs:/i, /^readme/i, /^typo/i]
    if (docsOnlyPatterns.some(p => p.test(c.message))) return false

    // Filter dependency bump commits
    const depBumpPatterns = [/^chore\(deps\)/i, /^bump /i, /^update deps/i]
    if (depBumpPatterns.some(p => p.test(c.message))) return false

    return true
  })
}

// DOWNLOAD NOISE NORMALIZATION
// npm counts every CI pipeline hit
// Weekend downloads are mostly real users
// Weekday downloads include heavy CI noise
function normalizeDownloads(
  weekdayDownloads: number,
  weekendDownloads: number
): number {
  // Weekend / 2 days * 7 = weekly real-user estimate
  const weekendDailyAvg = weekendDownloads / 2
  return Math.round(weekendDailyAvg * 7)
}

// STARS ANOMALY DETECTION
// High stars + low downloads = potential star inflation
function detectStarAnomaly(
  stars: number,
  weeklyDownloads: number
): boolean {
  if (weeklyDownloads === 0) return stars > 100
  const ratio = stars / weeklyDownloads
  // Normal ratio: 0.1x to 50x
  // > 200x stars vs weekly downloads = suspicious
  return ratio > 200
}

// NEW ARCH STATUS CROSS-VALIDATION
// RN Directory is self-reported â€” verify with code analysis
async function verifyNewArchStatus(
  rndirStatus: boolean,
  githubUrl: string
): Promise<{ status: NewArchStatus; confidence: ConfidenceLevel }> {
  const codeSignals = await analyzeRepoForNewArch(githubUrl)

  // Three signals: RN Dir flag, codegenConfig, Fabric/Turbomodule files
  const signals = [
    rndirStatus,
    codeSignals.hasCodegenConfig,
    codeSignals.hasFabricFiles || codeSignals.hasTurboModuleFiles
  ]
  const positiveCount = signals.filter(Boolean).length

  if (positiveCount === 3) return { status: 'native_jsi', confidence: 'high' }
  if (positiveCount === 2) return { status: 'native_jsi', confidence: 'medium' }
  if (positiveCount === 1) return { status: 'compatibility_layer', confidence: 'low' }
  return { status: 'unsupported', confidence: 'medium' }
}

async function analyzeRepoForNewArch(githubUrl: string): Promise<{
  hasCodegenConfig: boolean
  hasFabricFiles: boolean
  hasTurboModuleFiles: boolean
}> {
  // Check package.json for codegenConfig key
  // Check for *Fabric*.{h,mm,cpp} files
  // Check for *TurboModule*.{h,mm,cpp} files
  // Uses GitHub Search API or file tree traversal
  // Implementation: search repo file tree via GitHub API
  return {
    hasCodegenConfig: false,    // placeholder
    hasFabricFiles: false,
    hasTurboModuleFiles: false
  }
}
```

### Problem 2 â€” Score Calibration

The ground truth corpus is the regression test suite
for the scoring engine. It runs on every weight change.

```typescript
// packages/core/src/scoring/__tests__/calibration.test.ts

interface GroundTruthEntry {
  package: string
  expected_verdict: RadarStatus | RadarStatus[]
  min_score?: number
  max_score?: number
  reason: string                // why this is ground truth
}

export const GROUND_TRUTH_CORPUS: GroundTruthEntry[] = [
  // KNOWN ADOPT â€” undisputed
  {
    package: 'react-native-reanimated',
    expected_verdict: 'ADOPT',
    min_score: 80,
    reason: 'SWM-backed, New Arch native, high adoption, actively maintained'
  },
  {
    package: 'react-native-mmkv',
    expected_verdict: 'ADOPT',
    min_score: 78,
    reason: 'JSI native, fast, well-maintained, high downloads'
  },
  {
    package: 'expo-router',
    expected_verdict: 'ADOPT',
    min_score: 78,
    reason: 'Expo-backed, becomes standard for managed workflow'
  },
  {
    package: 'react-native-screens',
    expected_verdict: 'ADOPT',
    min_score: 76,
    reason: 'SWM-backed, native navigation optimization, essential'
  },
  {
    package: '@shopify/react-native-skia',
    expected_verdict: ['ADOPT', 'TRIAL'],
    min_score: 72,
    reason: 'Shopify-backed, New Arch, high quality â€” newer so TRIAL acceptable'
  },

  // KNOWN TRIAL â€” good but with noted caveats
  {
    package: 'react-native-async-storage',
    expected_verdict: ['TRIAL', 'ASSESS'],
    reason: 'Maintained but being superseded by MMKV, older architecture'
  },
  {
    package: 'react-native-maps',
    expected_verdict: ['TRIAL', 'ASSESS'],
    reason: 'Community maintained, complex, slow New Arch adoption'
  },

  // KNOWN HOLD â€” undisputed
  {
    package: 'react-native-camera',
    expected_verdict: 'HOLD',
    max_score: 40,
    reason: 'Officially deprecated, superseded by react-native-vision-camera'
  },

  // COLD START TEST â€” new packages from major vendors
  // These test the vendor prior system
  // A new Expo package should never start at HOLD
  {
    package: 'expo-video',
    expected_verdict: ['ADOPT', 'TRIAL'],
    reason: 'Expo-backed â€” vendor prior should prevent HOLD/ASSESS on launch'
  },
]

// Run this test suite after every weight change
describe('Vitality Score Calibration', () => {
  for (const entry of GROUND_TRUTH_CORPUS) {
    it(`${entry.package} should score correctly`, async () => {
      const card = await getVitalityCard(entry.package)
      expect(card).not.toBeNull()

      const verdict = card!.radar_status
      const score = card!.vitality_score

      if (Array.isArray(entry.expected_verdict)) {
        expect(entry.expected_verdict).toContain(verdict)
      } else {
        expect(verdict).toBe(entry.expected_verdict)
      }

      if (entry.min_score !== undefined) {
        expect(score).toBeGreaterThanOrEqual(entry.min_score)
      }
      if (entry.max_score !== undefined) {
        expect(score).toBeLessThanOrEqual(entry.max_score)
      }
    })
  }
})
```

### Problem 3 â€” The Cold Start Problem

New packages have no Lindy age, no rhythm baseline,
no community validation. Without special handling
they would all score HOLD, which is wrong.

```typescript
// Vendor priors prevent cold start misclassification

interface VendorPrior {
  vendor: string
  default_topology_layer: TopologyLayer
  default_radar_status: RadarStatus
  lindy_credit_months: number   // artificial lindy to avoid HOLD on launch
  confidence_boost: boolean     // vendor backing increases confidence
}

const VENDOR_PRIORS: VendorPrior[] = [
  {
    vendor: 'expo',
    default_topology_layer: 'L3',
    default_radar_status: 'TRIAL',
    lindy_credit_months: 12,      // Expo's own credibility = 12mo credit
    confidence_boost: true
  },
  {
    vendor: 'software-mansion',
    default_topology_layer: 'L3',
    default_radar_status: 'TRIAL',
    lindy_credit_months: 12,
    confidence_boost: true
  },
  {
    vendor: 'callstack',
    default_topology_layer: 'L3',
    default_radar_status: 'TRIAL',
    lindy_credit_months: 12,
    confidence_boost: true
  },
  {
    vendor: 'meta',
    default_topology_layer: 'L2',
    default_radar_status: 'ADOPT',
    lindy_credit_months: 24,
    confidence_boost: true
  },
  {
    vendor: 'independent',
    default_topology_layer: 'L4',
    default_radar_status: 'ASSESS',
    lindy_credit_months: 0,       // no credit â€” earn your Lindy
    confidence_boost: false
  },
]

function applyVendorPrior(
  rawScore: number,
  lindyMonths: number,
  vendor: string
): { adjustedScore: number; adjustedLindy: number; note: string } {
  const prior = VENDOR_PRIORS.find(p => p.vendor === vendor)
  if (!prior) return { adjustedScore: rawScore, adjustedLindy: lindyMonths, note: '' }

  const adjustedLindy = lindyMonths + prior.lindy_credit_months

  // Never boost above the vendor's default ceiling
  // Expo package still needs to earn ADOPT through its own signals
  const vendorFloor = prior.default_radar_status === 'TRIAL' ? 60 : 40
  const adjustedScore = Math.max(rawScore, vendorFloor)

  return {
    adjustedScore,
    adjustedLindy,
    note: prior.lindy_credit_months > 0
      ? `+${prior.lindy_credit_months}mo Lindy credit (${vendor} vendor)`
      : ''
  }
}
```

### Problem 4 â€” Version-Scoped Signals

Evaluate against the version actually installed,
not just latest. Critical for New Arch and conflicts.

```typescript
interface VersionScopedSignals {
  installed_version: string
  latest_version: string
  signals_for_installed: {
    new_arch_status: NewArchStatus      // may differ from latest
    hermes_v1_compatible: boolean | null
    known_issues: VersionedIssue[]
    expo_sdk_compat: ExpoSDKCompat[]
  }
  signals_for_latest: {
    new_arch_status: NewArchStatus
    hermes_v1_compatible: boolean | null
  }
  upgrade_unlocks: string[]             // what upgrading would fix
}

interface VersionedIssue {
  description: string
  affected_versions: string            // semver range e.g. ">=2.0.0 <3.0.0"
  fixed_in?: string
  severity: Severity
  source_url?: string
}

interface ExpoSDKCompat {
  sdk_version: string
  compatible: boolean
  notes?: string
  source_url?: string
}

// When scanning a project:
// For each package, compare installed_version vs signals_for_installed
// A package may be ADOPT at latest but HOLD at your installed version
// This is surfaced clearly:
//
// react-native-reanimated@2.17.0 [installed]
// âš ï¸ You are 3 major versions behind
// â€¢ New Arch: NOT SUPPORTED in v2 â€” supported in v3+
// â€¢ Hermes V1: NOT COMPATIBLE in v2 â€” confirmed in v3+
// â†’ Upgrade to v3.x unlocks: New Arch + Hermes V1 + 2 resolved issues
```

---

# PART SIX â€” COMMUNITY VALIDATION

## Humans Catch What Machines Miss

The automated systems catch signal noise.
The calibration corpus catches scoring drift.
The freshness system catches stale data.

But some things only humans catch:
- A package that has 3 active contributors
  but only 1 who actually responds to issues
- A package with good scores but known
  breaking bugs in specific RN versions
- A package where the "maintained" flag is true
  but the maintainer is clearly burned out

Community validation is the fourth layer.

### The Correction Flow

```
Every package card (web surface) has:
  "Signal incorrect? Suggest a correction â†’"

Correction form (minimal friction):
  Which field is wrong?     [dropdown of signal names]
  What is the correct value?  [text/select]
  Why do you know this?       [source URL or description]
  Your GitHub handle?         [optional â€” for weight]

Correction routing:
  From verified RN developer  â†’ fast-track review (24h)
  From unknown submitter      â†’ standard review queue (7d)
  Matches existing open issue â†’ merge + boost priority
  Critical severity field     â†’ immediate flag to Neev

Corrections that auto-apply:
  npm_deprecated = true       â†’ immediate, no review needed
                                (npm API confirms it anyway)
  package_abandoned = true    â†’ after 2 independent confirmations

All corrections logged to ecosystem_events:
  event_type: 'community_correction'
  Immutable history of what changed and why.
```

### Verified Developer Status

```typescript
// Trust levels for community corrections

type ContributorTrust =
  | 'anonymous'         // no GitHub handle provided
  | 'community'         // GitHub account < 1yr, < 100 followers
  | 'established'       // GitHub account > 2yr, > 100 followers
  | 'rn-contributor'    // has PRs merged to RN core or tracked packages
  | 'vendor'            // works at Expo/SWM/Callstack/Meta (verified)

// Correction weight by trust level:
// anonymous:      1  â€” needs 5+ to trigger review
// community:      2  â€” needs 3+ to trigger review
// established:    5  â€” triggers immediate review
// rn-contributor: 8  â€” triggers immediate review + confidence boost
// vendor:         10 â€” auto-applies with notification to Neev
```

---

# PART SEVEN â€” THE INTEGRITY DASHBOARD

## RN Terrain Applied to Itself

Published publicly on rnterrain.dev/integrity

```
RN TERRAIN DATA INTEGRITY STATUS
Last updated: [live timestamp]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

PACKAGES IN REGISTRY
  Total tracked:          [N]
  Synced in last 24h:     [N] ([%])
  Stale (>7 days):        [N] â€” [link to list]
  Never synced:           [N] â€” [link to list]
  Manually curated:       [N] ([%])

CONFIDENCE DISTRIBUTION
  Verified signals:       [%]
  High confidence:        [%]
  Medium confidence:      [%]
  Low/Unknown:            [%] â† we want this < 15%

GROUND TRUTH CORPUS STATUS
  All passing:            âœ“ / âœ—
  Last run:               [timestamp]
  Failures:               [N] â€” [link if any]

COMMUNITY CORRECTIONS
  Open corrections:       [N]
  Applied this month:     [N]
  Avg review time:        [N] days

RN TERRAIN OWN VITALITY
  Bus Factor:             [N] â€” honest count
  Lindy Age:              [N] months
  Radar Status:           [verdict]
  Last Bloom Shipped:     [date]
  Next Bloom Target:      [date]

DATA SOURCES STATUS
  GitHub API:             âœ“ healthy / âœ— degraded
  npm registry:           âœ“ healthy / âœ— degraded
  RN Directory API:       âœ“ healthy / âœ— degraded
  RSS feeds:              [N]/[total] healthy

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
"We apply our own framework to ourselves.
 This page is always live. Nothing is hidden."
```

---

# PART EIGHT â€” INTEGRITY IN THE CODEBASE

## Where Validation Lives

```
packages/core/src/
â”‚
â”œâ”€â”€ validation/
â”‚   â”œâ”€â”€ signal-filters.ts       # bot filtering, anomaly detection
â”‚   â”œâ”€â”€ cross-validation.ts     # multi-source signal agreement
â”‚   â”œâ”€â”€ freshness.ts            # staleness calculation + tiers
â”‚   â””â”€â”€ confidence.ts           # per-signal confidence assignment
â”‚
â”œâ”€â”€ scoring/
â”‚   â”œâ”€â”€ index.ts                # main score calculation
â”‚   â”œâ”€â”€ weights.ts              # THE weight constants â€” change carefully
â”‚   â”œâ”€â”€ vendor-priors.ts        # cold start handling
â”‚   â”œâ”€â”€ rhythm.ts               # deviation-from-cadence signals
â”‚   â””â”€â”€ __tests__/
â”‚       â”œâ”€â”€ calibration.test.ts # ground truth corpus tests
â”‚       â””â”€â”€ weights.test.ts     # weight boundary tests
â”‚
â””â”€â”€ sync/
    â”œâ”€â”€ daily-delta.ts          # Speed 2 sync
    â”œâ”€â”€ event-triggered.ts      # Speed 3 sync
    â”œâ”€â”€ rss-monitor.ts          # Speed 4 RSS pipeline
    â””â”€â”€ version-scoped.ts       # per-installed-version signals
```

## The Weights File Is Sacred

```typescript
// packages/core/src/scoring/weights.ts
// ============================================================
// THESE ARE PRODUCT DECISIONS â€” NOT IMPLEMENTATION DETAILS
// Do not change these without:
// 1. Neev's explicit approval
// 2. Running the calibration test suite
// 3. All ground truth corpus tests passing
// 4. Documenting why the change was made
// ============================================================

export const SCORE_WEIGHTS = {
  maintenance:   30,   // bus factor + rhythm + responsiveness
  architecture:  25,   // new arch + hermes + wasm + thread safety
  temporal:      20,   // lindy + version trajectory + decay
  ecosystem:     15,   // adoption + vendor + alternatives
  cost:          10,   // bundle + fan-out
} as const

// Verify weights always sum to 100
const weightSum = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)
if (weightSum !== 100) throw new Error(`Weights must sum to 100, got ${weightSum}`)

export const VERDICT_THRESHOLDS = {
  ADOPT:  80,   // requires ALL signals green + high confidence
  TRIAL:  60,
  ASSESS: 40,
  HOLD:    0,   // anything below ASSESS
} as const

export const HOLD_TRIGGERS = [
  // Any of these alone triggers HOLD regardless of score
  'npm_deprecated',
  'days_since_meaningful_commit > 365 AND bus_factor === 1',
  'legacy_arch_only AND rn_version >= 0.84',
  'maintainer_publicly_abandoned',
] as const
```

---

# SUMMARY â€” THE INTEGRITY CONTRACT

RN Terrain makes these commitments to every developer:

```
1. Every signal has a confidence level. Always shown.

2. Every signal has a timestamp. Always shown.

3. Every signal links to its source. Always.
   No source = signal not shown.

4. Stale data is labeled stale. Never silently current.

5. The scoring weights are documented and version-controlled.
   Any weight change re-runs the ground truth corpus.

6. The cold start problem is handled explicitly.
   New packages from major vendors get vendor priors.
   New packages from unknown authors start at ASSESS.

7. Version-scoped signals reflect what you actually installed.
   Not just what the latest version supports.

8. Community corrections are welcomed, tracked, and logged.
   Nothing is deleted. The event log is permanent.

9. The asymmetry rule is permanent policy.
   ADOPT requires proof of health.
   HOLD only requires one critical signal.

10. RN Terrain publishes its own VitalityCard.
    Bus Factor, Lindy, Radar Status â€” live and honest.
    We are judged by what we built.
    We have nothing to hide.
```

---

*This document lives at `INTEGRITY.md` in the root of the repository.*
*It is part of the public open source release.*
*Changes to this document require the same review as weight changes.*
*The integrity spec is itself under version control and integrity standards.*



---

# PART NINE â€” WASM SIGNAL INTEGRITY

## Two Dimensions, Not One

`wasm_compiled = true` is not a single signal.
It requires a second dimension to be meaningful:
the thread model the WASM binary runs on.

```
WASM SIGNAL INTEGRITY RULES:

Rule 1 â€” Never show wasm_compiled without wasm_thread_model
  A WASM binary on the JS thread has completely different
  performance implications than one running via worklets.
  Showing only "WASM: yes" is misleading.

Rule 2 â€” wasm_thread_model confidence basis
  'js_thread_blocking'   â€” inferred if no worklets dependency
                           + no explicit offloading documented
                           confidence: medium

  'worklet_offloaded'    â€” only HIGH confidence if:
                           a) explicit documentation confirms it
                           b) RN Worklets listed as dependency
                           c) maintainer confirmed
                           Otherwise: medium or low

  'unknown'              â€” default until verified
                           shown as "WASM thread model unverified"

Rule 3 â€” wasm_thread_model affects architecture score
  'js_thread_blocking'   â†’ architecture score penalized
                           thread_safety = 'js_thread_blocks'
  'worklet_offloaded'    â†’ architecture score boosted
                           thread_safety = 'worklet_offloaded'
  'unknown'              â†’ no penalty, but low confidence flag

Rule 4 â€” Context requirement added if worklet_offloaded
  wasm_worklets_required = true â†’
  context_requirements gains:
    "requires RN Worklets 8.0+"
  This surfaces at Gate 2 install intercept.
```

### WASM Confidence Degradation

```
Source of wasm_thread_model truth:
  Official docs + code analysis    â†’ high confidence
  Community confirmed              â†’ medium confidence
  Inferred from dependencies only  â†’ low confidence
  Not assessed                     â†’ unknown

Re-verification trigger:
  Any new release of the package   â†’ re-verify thread model
  RN Worklets major version        â†’ re-verify all wasm packages
  New SWM article on worklets API  â†’ flag all wasm packages for review
```

---

# PART TEN â€” COMPATIBILITY MATRIX INTEGRITY

## Positive Compatibility Is Verified, Not Assumed

The conflict graph catches known breakage.
The compatibility matrix captures known composition.

Neither is assumed. Both are verified.

```
COMPATIBILITY EVIDENCE TIERS:

Tier 1 â€” OFFICIAL (verified)
  Documented by either package's maintainer
  Listed in official documentation or changelog
  Source URL required
  Confidence: verified

Tier 2 â€” MAINTAINER CONFIRMED (high)
  Maintainer explicitly stated compatibility
  in GitHub issue, tweet, or Discord
  Source URL required
  Confidence: high

Tier 3 â€” COMMUNITY CONFIRMED (medium)
  3+ independent developers reported working
  No maintainer involvement
  Confidence: medium

Tier 4 â€” UNTESTED (unknown)
  No data either way
  Shown as "?" not assumed compatible
  Confidence: unknown

Tier 5 â€” INCOMPATIBLE (verified or reported)
  Documented breakage or explicit incompatibility
  Source URL required
  Shown as "âœ—" with reason
  Confidence: high if sourced

NEVER assume compatibility.
Absence of incompatibility reports â‰  compatible.
Unknown is the honest default.
```

### AI/ML Compatibility â€” Emerging Category

ExecuTorch and react-native-ai/ml compatibility
is currently largely Tier 4 (untested) across
most packages. This is honest and expected â€”
it's a new category.

The integrity rule:
Show "AI/ML compat: untested" not "AI/ML compat: âœ“"
until Tier 2+ evidence exists.
The developer is better served by honest uncertainty
than by false confidence.

---

# PART ELEVEN â€” HUMAN EDITORIAL INTEGRITY

## The Curation Layer Is a Quality Signal, Not a Bottleneck

The RSS pipeline ingests everything.
Human curation decides what's significant.
These are separate concerns with separate integrity rules.

```
INGESTION INTEGRITY:
  Every RSS entry is stored regardless of significance
  Nothing is filtered before storage
  The raw event log is complete and unedited
  Significance is a metadata tag, not a deletion

SIGNIFICANCE INTEGRITY:
  Significance is never auto-applied to ambiguous entries
  Only clear-signal entries get auto-significant:
    â†’ From key person cluster: auto-significant
    â†’ From vendor official blog: auto-significant
    â†’ Everything else: human review queue

EDITORIAL INTEGRITY:
  Article summaries in the digest are written by humans
  Not auto-generated from article content
  2-sentence maximum â€” forces actual understanding
  The summary reflects what matters, not what was said
  A summary that could have been written without
  reading the article fails the integrity check

CORRECTION INTEGRITY:
  If a significant article was wrong about something
  (e.g. announced compat that later proved false)
  â†’ Append a correction event, never delete the original
  â†’ The digest shows the correction with context
  â†’ The event log shows both entries
  History is permanent. Corrections are additive.
```



---

# PART TWELVE â€” FUNDING LINK INTEGRITY

## The Safety Rule for Appreciation Links

Funding links are high-stakes data.
A wrong link could route developers to malicious sites.
A fake sponsor link is trivially injectable via README.

The integrity rule is absolute:

```
ONLY SHOW VERIFIED FUNDING LINKS.

Verified sources:
  npm funding field     â†’ maintainer-controlled, machine-readable
  GitHub Sponsors API   â†’ GitHub verifies account ownership
  Open Collective API   â†’ OC verifies project ownership

NEVER show:
  README-scraped URLs   â†’ injection risk
  Unverified PayPal     â†’ not verifiable as maintainer-owned
  Any URL not from      â†’ wrong link = trust destroyed
  official API source

"No verified funding found" is the honest, safe default.
It is better to show nothing than to show something wrong.
```

### Funding Data Freshness

```
Funding links change rarely but matter enormously when wrong.
Freshness rules:
  npm funding field:     check on every version sync
  GitHub Sponsors:       check weekly
  Open Collective:       check weekly
  If any link returns    â†’ immediately null the field
  404 or error           â†’ log ecosystem_event: 'funding_link_broken'
                         â†’ show "No verified funding" until re-verified
```

---

# PART THIRTEEN â€” SUSTAINABILITY MODEL INTEGRITY

## Computing the Sustainability Model Honestly

The sustainability_model is a computed field.
Its integrity depends on the signals it's computed from.

```
COMPUTATION RULES:

'corporate_backed'
  Requires: vendor IN known_corporate_vendors list
  Confidence: high â€” vendor classification is manual + verified
  Never auto-assigned from unknown vendor names

'foundation'
  Requires: verified foundation backing (PSE, Apache, Linux Foundation, OC)
  Confidence: verified â€” only from official sources

'sponsored'
  Requires: has_verified_funding = true
  Confidence: high â€” from verified funding APIs only

'unfunded_solo'
  Requires: bus_factor = 1 AND has_verified_funding = false
  Confidence: medium â€” bus_factor is computed, not measured
  Note: "unfunded" means no VERIFIED funding found
         not necessarily that no funding exists

'crisis_risk'
  Requires: isMarakRiskProfile() = true
  Confidence: medium â€” computed from multiple signals
  This is a serious label â€” only applies when threshold crossed
  Always accompanied by appreciation CTA

'unknown'
  Default until enough signals available
  Never show confidence > low for 'unknown'
```

### The Marak Threshold Integrity

```
The isMarakRiskProfile() function makes a serious claim.
It should be conservative â€” false negatives are OK.
False positives (calling a healthy package crisis_risk)
destroy trust.

Before flagging crisis_risk:
  âœ“ bus_factor confirmed = 1 (not just computed = 1)
  âœ“ downloads_weekly confirmed > 100k (from npm API)
  âœ“ has_verified_funding confirmed false (checked all sources)
  âœ“ rhythm_status confirmed concerning or silent
     (not just stale data â€” fresh sync required)
  âœ“ All four signals from fresh data (< 48h)

If any signal is stale â†’ do not apply crisis_risk
Wait for fresh sync first.
This label has consequences. Use it carefully.
```



---

# PART FOURTEEN â€” PR/ISSUE INTELLIGENCE INTEGRITY

## Quality Signals Require Quality Sources

Raw counts are high confidence â€” direct from GitHub API.
Quality signals are computed â€” require careful integrity rules.

```
SIGNAL                        CONFIDENCE    INTEGRITY RULE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
open_issues_count             high          Direct API count
closed_ratio                  high          Direct API calculation
maintainer_response_rate      medium        Requires comment analysis
                                            Collaborator list needed
                                            May miss some maintainers
avg_first_response_days       medium        Computed from comment timestamps
                                            Bot comments filtered out
user_self_closed_count        low           Heuristic â€” may misclassify
is_maintained_questions       medium        Title pattern match
                                            May miss creative phrasing
high_reaction_unresponded     medium        Reaction counts direct from API
                                            "unresponded" is computed
recurring_themes              low           NLP heuristic â€” keyword matching
                                            False positives expected
issue_momentum                medium        30d comparison â€” trend signal
```

### The Theme Clustering Integrity Rule

```
Theme clustering is LOW confidence by design.
It is directional, not factual.

"new_architecture: 5 issues" means:
  5 issue titles contain related keywords
  NOT: 5 confirmed New Arch bugs exist

Always surface with:
  "5 issues mention New Architecture"
  NOT: "5 New Architecture bugs confirmed"

The distinction matters for developer trust.
We show the signal, not the conclusion.
The developer reads the issues and concludes.
```

### The Self-Closed Issue Integrity Rule

```
self_closed_count is a heuristic.
A user closing their own issue could mean:
  â†’ They solved it themselves (healthy â€” false positive)
  â†’ They gave up (decay signal â€” true positive)
  â†’ They filed it incorrectly (noise)

Never show as "X users gave up."
Show as "X issues closed by original reporter"
with link to issues list.
Let the developer interpret.
```

---

# PART FIFTEEN â€” CHANGELOG INTEGRITY

## Parsing Is Interpretation â€” Label It As Such

```
CHANGELOG DATA INTEGRITY RULES:

Parsed summaries are LOW confidence
  We extract text from unstructured markdown
  Our "summary" may miss important context
  Always link to full release notes
  Never show parsed summary as authoritative
  Show: "Parsed summary â€” read full notes â†—"

Breaking change detection is MEDIUM confidence
  We keyword-match "BREAKING" in release notes
  A release can have breaking changes without the keyword
  A release can have "BREAKING" in a non-breaking context
  Cross-validate: major semver bump = likely breaking
  Show confidence level with breaking change signal

New Arch mentions â‰  New Arch support
  A changelog can mention New Arch without supporting it
  "Added experimental New Arch support" â‰  "New Arch: ADOPT"
  Tag as: "New Arch mentioned in changelog"
  Cross-validate with RN Directory + code analysis
  before updating new_architecture_status

Pre-release channels signal active development
  Presence of 'beta' or 'next' dist-tag = high confidence
  Someone is actively cutting releases
  But: automated releases (semantic-release) may create
  these without active maintainer involvement
  Cross-validate with commit activity
```


