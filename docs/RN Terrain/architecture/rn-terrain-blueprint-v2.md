---
title: "RN Terrain - Complete Conceptual Blueprint v2.0"
status: "active"
created: 2026-06-02
updated: 2026-06-02
author: "Neev"
tags: [rn-terrain, architecture, specification]
---
# RN Terrain
## The Complete Conceptual Blueprint v2.0
*The Live Intelligence Layer for the React Native Ecosystem*

> *"The map is permanent. The terrain changes. The shape does not."*
> â€” Conceptual Topology, Neev

---

# PART ONE â€” FOUNDATION
## Why This Exists (L0)

Every RN package is a temporary pocket of organized capability fighting entropy.
The developer who installs it inherits not just code â€” but the full systemic
pressure of that package's entire lifecycle: its human maintenance grid, its
architectural age, its native compilation constraints, its relationship to a
shifting runtime underneath it.

Traditional tools treat this as a reactive lookup. You feel friction. You break
flow. You open five browser tabs, read GitHub commit histories manually, cross-
reference changelogs, and try to mentally model whether this package will still
work after the next Expo SDK. By then you're not building anymore â€” you're
auditing. Alone. With incomplete information.

**RN Terrain shifts the paradigm:**

```
FROM                                TO
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Reactive forensics                  Proactive ambient intelligence
Isolated snapshots                  Living ecosystem topology
Generic package lists               Personally filtered guidance
Data dumps                          Powerful orientation
Silent installs                     Informed commits
Late awareness                      Event-driven signals
Package-only view                   Full terrain: packages +
                                    tools + vendors + people +
                                    domain direction
```

The developer should feel *powerfully oriented* â€” not just informed.

**The L0 equation:**
- **Flow** = ecosystem signals (package health, vendor moves, architectural
  shifts, community direction, tool releases, key person activity)
- **Organization** = the intelligence layer that compresses chaos into
  structured, actionable, personalized awareness
- **Cost** = developer attention, decision friction, wasted hours on wrong
  packages, late awareness of critical shifts, technical debt inherited blindly

---

# PART TWO â€” THE PERMANENT FRAME
## L1 Invariant Concepts (What Never Changes)

These six categories will be true regardless of what RN looks like in 2030.
Every signal we collect maps to exactly one of these. Nothing is outside this.

| Category | Permanent truth | What we track |
|---|---|---|
| **Structure** | The ecosystem has permanent categories â€” packages, tools, vendors, people, protocols | Identity, classification, topology layer, vendor, architecture binding |
| **Process** | Developers always discover â†’ evaluate â†’ install â†’ update â†’ migrate | The three temporal gates, version intelligence, migration paths |
| **Relationship** | Packages depend, conflict, compose. Vendors back packages. People maintain them | Dependency graph, conflict map, composition map, vendor backing |
| **Flow** | Releases, deprecations, announcements, social signals, conference talks never stop | Changelog feeds, event streams, key person signals, canary builds |
| **Limits** | No developer can monitor everything. Attention is finite. Signal-to-noise is always a problem | Vitality score, push layer, digest â€” compress signal for human attention |
| **Dynamics** | Packages are born, mature, decay, die. Vendors pivot. Architectures shift. Always | Decay curves, vitality trajectory, V1 readiness, ecosystem health trend |

---

# PART THREE â€” THE TERRAIN MAP
## What We Actually Track

### THE FIVE DOMAINS OF THE RN TERRAIN

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        RN TERRAIN                               â”‚
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚PACKAGES  â”‚  â”‚DEV TOOLS â”‚  â”‚ VENDORS  â”‚  â”‚   PEOPLE     â”‚  â”‚
â”‚  â”‚          â”‚  â”‚          â”‚  â”‚          â”‚  â”‚              â”‚  â”‚
â”‚  â”‚Libraries â”‚  â”‚IDEs      â”‚  â”‚Expo      â”‚  â”‚Key Person    â”‚  â”‚
â”‚  â”‚SDKs      â”‚  â”‚CLI tools â”‚  â”‚SWM       â”‚  â”‚Radar ~20     â”‚  â”‚
â”‚  â”‚Utilities â”‚  â”‚Testing   â”‚  â”‚Callstack â”‚  â”‚weighted      â”‚  â”‚
â”‚  â”‚          â”‚  â”‚Debugging â”‚  â”‚Meta core â”‚  â”‚tier-1        â”‚  â”‚
â”‚  â”‚          â”‚  â”‚Build     â”‚  â”‚          â”‚  â”‚signals       â”‚  â”‚
â”‚  â”‚          â”‚  â”‚AI tools  â”‚  â”‚          â”‚  â”‚              â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚              DOMAIN DIRECTION                           â”‚   â”‚
â”‚  â”‚  Architecture shifts Â· RFCs Â· Conference signals Â·     â”‚   â”‚
â”‚  â”‚  Canary builds Â· V1 readiness Â· Ecosystem health       â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## DOMAIN 1: PACKAGES
### Full Data Universe Per Package

**Tier 1 â€” Identity & Classification**
```
package_name              npm canonical name
display_name              human-readable
vendor                    Expo / SWM / Callstack / Independent / Meta
category                  Navigation / Storage / Media / Auth / Sensors / UI /
                          Animation / Networking / AI / etc.
use_case_tags             ["offline-first", "camera", "biometrics", ...]
topology_layer            L2 Dominant / L3 Specialized / L4 Frontier
radar_status              ADOPT / TRIAL / ASSESS / HOLD
v1_readiness              READY / ADAPTING / AT_RISK / INCOMPATIBLE
```

**Tier 2 â€” React Native Directory Signals**
*(Community baseline â€” consumed via public API)*
```
android_support           boolean
ios_support               boolean
web_support               boolean
expo_go_compatible        boolean
new_architecture          "native_jsi" | "compatibility_layer" |
                          "unsupported" | "not_applicable"
typescript_support        boolean
maintained                boolean (RNDir flag)
expo_config_plugin        boolean
windows_support           boolean
macos_support             boolean
visionos_support          boolean
```

**Tier 3 â€” Taze-Inspired Update Intelligence**
*(Version health â€” built on taze's MIT resolution logic)*
```
current_version           semver string
latest_version            semver string
version_lag               { major: N, minor: N, patch: N }
update_safety_band        "safe" | "caution" | "breaking"
maturity_period_days      days since latest version released
                          (taze's --maturity-period concept)
last_major_bump_date      ISO date
breaking_change_frequency avg months between major versions
changelog_url             direct link
release_notes_quality     "detailed" | "minimal" | "none"
changelog_intelligence    parsed summary of last 3 releases
```

**Tier 4 â€” GitHub Vitality Signals**
*(The temporal rhythm â€” not just last commit, the full flow)*
```
bus_factor                contributor concentration score (1â€“10)
lindy_age_months          months since first public release
stars_total               current count
stars_30d_delta           growth/decline signal
stars_trajectory          "growing" | "plateau" | "declining"
forks_total
contributors_total
contributors_active_90d   contributed in last 90 days
top_contributor_pct       % of all commits from single top contributor
commit_count_30d
commit_count_90d
avg_gap_between_commits   days â€” THE RHYTHM SIGNAL
                          (gaps reveal more than recency)
last_commit_date
last_meaningful_commit    excludes docs/bot/dep-bump commits
open_issues_count
closed_issues_ratio       closed / total (maintainer responsiveness)
open_prs_count
avg_pr_merge_days         how responsive are maintainers
last_release_date
days_since_last_release
maintainer_statements     any public announcements about project status
```

**Tier 5 â€” Architecture & Runtime Signals**
*(The physics layer â€” what RN 0.84+ makes critical)*
```
has_native_code           boolean
native_languages          ["Swift", "Kotlin", "C++", "Rust", ...]
jsi_binding_type          "fabric" | "turbomodule" | "nitro" |
                          "legacy_bridge" | "pure_js"
nitro_modules_powered     boolean (emerging new standard)
hermes_v1_compatible      boolean â€” critical post-0.84
wasm_compiled             boolean
wasm_source_language      "Rust" | "Go" | "C++" | "none"
wasm_binary_size_bytes    the hidden cost nobody tracks
prebuilt_ios_binary       boolean (impacts pod install)
bundle_increment_bytes    JS bundle addition (from bundle visualizer data)
dependency_fan_out        direct + transitive count
peer_dependency_count
known_conflicts           [{ package, reason, severity, rn_version }]
common_companions         [{ package, co_occurrence_score }]
build_time_impact         "negligible" | "minor" | "significant" | "heavy"
thread_safety             "main_thread_safe" | "js_thread_blocks" |
                          "async_native" | "unknown"
```

**Tier 6 â€” Ecosystem Position**
```
alternatives              [{ name, comparison_summary, vitality_score }]
supersedes                package this replaced
superseded_by             package that replaced this (decay signal)
adoption_rank             rank within its category
downloads_weekly_npm
download_trajectory       "growing" | "plateau" | "declining"
used_by_expo_sdk          boolean â€” Expo itself depends on this
featured_in_roadmap_sh    boolean
nitro_powered_version     if a Nitro rewrite exists
expo_atlas_tracked        boolean (Expo's own bundle analyzer)
```

**Tier 7 â€” V1 Readiness Signals** *(New â€” critical for 2026)*
```
v1_readiness_score        0â€“100
legacy_arch_code_present  boolean â€” will break post-0.84
stable_js_api_compliant   boolean â€” follows stable API initiative
breaking_change_risk_v1   "none" | "low" | "medium" | "high"
v1_migration_notes        what needs to change for V1
maintained_by_major_vendor boolean â€” safer for stable era
```

---

## DOMAIN 2: DEVELOPER TOOLS MAP

Not just packages. The full tooling terrain for RN developers.

```
IDEs & Editors
  Radon IDE (Software Mansion) â€” purpose-built RN IDE, L4â†’L2 trajectory
  VS Code + RN extensions     â€” current dominant workflow, L2
  Cursor + RN configs         â€” AI-native editor, L4 fast moving
  Zed + RN setup              â€” performance-focused, L3

CLI Tools
  Expo CLI                    â€” managed workflow backbone, L2
  React Native CLI            â€” bare workflow, L2
  taze                        â€” dependency freshness, L2
  rn-eval (this tool)         â€” ecosystem intelligence, L4â†’L2
  EAS CLI                     â€” cloud builds, L2

Testing
  Maestro                     â€” E2E, L3
  Detox                       â€” E2E, L2
  Reassure (Callstack)        â€” performance regression testing, L3
  Jest + RN preset            â€” unit testing, L2

Debugging & Profiling
  RN DevTools (official)      â€” L2
  Flipper                     â€” L2 (aging signal â€” watch)
  Reactotron                  â€” L3
  Expo Dev Tools              â€” L2 in managed workflow

Bundle Analysis
  react-native-bundle-visualizer (Callstack) â€” open source, L2
  Expo Atlas                  â€” Expo-native bundle analysis, L3
  Bundlephobia                â€” JS size, L3 (not RN-specific)

Build & CI
  EAS Build (Expo)            â€” cloud builds, L2
  RNRepo / RN Prebuilds       â€” faster builds, L4 becoming L2
  Fastlane                    â€” automation, L2

Agent Skills & AI Tools
  expo/skills                 â€” official Expo agent skills
  callstack agent skills      â€” RN best practices for agents
  Radon AI (SWM)              â€” RN-native AI coding assistant
  Expo Agent                  â€” AI-native managed workflow
  Claude Code + RN configs    â€” general agent, RN-configurable
```

Each tool gets its own vitality card â€” same signals, same radar status,
same topology layer classification. DX tools decay too.

---

## DOMAIN 3: VENDOR INTELLIGENCE

The four power centers of the RN ecosystem â€” their direction IS the terrain.

```
META / RN CORE
  Current direction:  V1 roadmap, stable JS API, Hermes V1 default
  Key signal:         "no breaking changes" era beginning
  Watch for:          V1 RC, static Hermes production, DOM APIs
  Key people:         Nicola Corti, Lorenzo Sciandra,
                      Riccardo Cipolleschi

EXPO
  Current direction:  Series B raised, Expo Agent launched,
                      AI-native managed workflow
  Key signal:         Expo Agent = agents do the work,
                      Expo handles the platform
  Watch for:          SDK 55+, new agent capabilities,
                      Expo Atlas expansion
  Key people:         Evan Bacon, Brent Vatne

SOFTWARE MANSION
  Current direction:  Radon IDE + Radon AI, RN 1.0 prediction,
                      Reanimated 4 stable with CSS animations
  Key signal:         Purpose-built IDE = they believe RN
                      needs its own toolchain
  Watch for:          Radon IDE stable release, Reanimated 5
  Key people:         Krzysztof Magiera, MichaÅ‚ PierzchaÅ‚a

CALLSTACK
  Current direction:  Bundle visualizer, Re.Pack, Reassure,
                      FastIO, agent skills, enterprise RN
  Key signal:         Bundle intelligence + performance =
                      their core thesis
  Watch for:          FastIO stable, Re.Pack v5, new agent skills
  Key people:         Mike Grabowski

INDEPENDENT / EMERGING
  Marc Rousavy        Nitro Modules â€” new native module standard
                      emerging, watch closely
  Anthony Fu          taze â€” MIT, consumable directly
```

---

## DOMAIN 4: KEY PERSON RADAR

~20 people whose public signals are weighted tier-1.
Their commit, tweet, blog post, or conference talk
is not noise â€” it's domain direction.

```
Tracked signals per person:
  GitHub activity (commits, issues, releases)
  Twitter/X posts (public)
  Blog posts / newsletters
  Conference talk announcements
  YouTube video titles + descriptions

Not surveillance â€” purely public signal aggregation.
One tweet from Evan Bacon about a deprecation is
worth more than 1000 npm download data points.
```

---

## DOMAIN 5: DOMAIN DIRECTION

The macro signals that tell you where the terrain itself is moving.

```
ARCHITECTURE SHIFT TRACKER
  New Arch adoption %         across all tracked packages
  Legacy Arch presence %      packages still at risk
  Hermes V1 compat %          readiness for 0.84+
  WASM adoption curve         emerging pattern
  Nitro Modules adoption      new module standard velocity

V1 READINESS DASHBOARD
  Ecosystem V1 readiness %    how ready is the terrain
  At-risk packages count      still carrying legacy debt
  Stable API compliance %     following stable JS API initiative
  ETA signal                  based on RN core public signals

RFC TRACKER
  Active RFCs in RN core      what's being proposed
  Each RFC â†’ which packages   affected when it lands

CONFERENCE RADAR
  App.js Conf Â· Chain React Â· React Native EU
  Talk titles + abstracts â†’ tagged to packages/topics
  Recency weighted
  Key person talks get tier-1 weight

ECOSYSTEM HEALTH TREND
  Overall vitality score      across all tracked packages
  New packages this month     ecosystem growth
  Packages entering HOLD      decay rate
  New Arch adoption velocity  are things improving?
```

---

# PART FOUR â€” THE VITALITY SCORE
## Signal as Empowerment, Not Verdict

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘                    VITALITY SCORE PHILOSOPHY                  â•‘
â•‘                                                               â•‘
â•‘  The score is a SIGNAL. The breakdown is the KNOWLEDGE.       â•‘
â•‘  The score gets you to the door.                              â•‘
â•‘  The breakdown hands you the keys.                            â•‘
â•‘  You decide what to do with them.                             â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

### The Score (0â€“100)

```
SOLID ROCK    80â€“100   L2 dominant. Safe to build on.
STABLE TRAIL  60â€“79    L3 capable. Read the specifics.
ASSESS FIRST  40â€“59    L4 or aging. Signals need review.
HOLD          0â€“39     Decay detected. Migration advised.
```

### The Breakdown (always shown â€” this is the actual intelligence)

```
VITALITY SCORE: 73 / 100  [STABLE TRAIL]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

MAINTENANCE HEALTH          22/30  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘
  Bus Factor          8/10  â—â—â—â—â—â—â—â—â—‹â—‹  3 active contributors
  Commit Rhythm       7/10  â—â—â—â—â—â—â—â—‹â—‹â—‹  avg 12 day gap (watch)
  Issue Response      7/10  â—â—â—â—â—â—â—â—‹â—‹â—‹  73% closed ratio

ARCHITECTURAL SAFETY        19/25  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘
  New Arch Status    10/10  â—â—â—â—â—â—â—â—â—â—  Native JSI (Fabric)
  Hermes V1 Compat    5/5   â—â—â—â—â—       Confirmed compatible
  WASM Binary         4/5   â—â—â—â—â—‹       Present (+340kb)
  Thread Safety       0/5   â—‹â—‹â—‹â—‹â—‹  âš ï¸  JS thread blocking detected

TEMPORAL STAMINA            14/20  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘
  Lindy Age          6/8    â—â—â—â—â—â—â—‹â—‹    31 months (solid)
  Version Trajectory  4/6   â—â—â—â—â—‹â—‹      Minor slowdown detected
  Decay Signal        4/6   â—â—â—â—â—‹â—‹      180d since last release

ECOSYSTEM POSITION          10/15  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘
  Adoption Rank      5/5    â—â—â—â—â—       #1 in category
  Vendor Backing      3/5   â—â—â—â—‹â—‹       Independent (watch)
  Alternatives        2/5   â—â—â—‹â—‹â—‹       2 strong alternatives exist

COST FACTORS                8/10   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘
  Bundle Impact       4/5   â—â—â—â—â—‹       +180kb (acceptable)
  Dependency Fan-out  4/5   â—â—â—â—â—‹       11 transitive deps

V1 READINESS               [READY]
  Legacy Arch code:  None detected  âœ“
  Stable API:        Compliant       âœ“
  Breaking risk:     Low             âœ“

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
âš ï¸  SIGNALS REQUIRING ATTENTION:
  â†’ JS thread blocking detected â€” verify async pattern in your use case
  â†’ WASM binary adds 340kb â€” significant if bundle-sensitive
  â†’ 180 days since last release â€” not critical but worth watching
  â†’ 2 strong alternatives exist â€” see comparison

ðŸ“Ž  LINKS:
  npm â†—   github â†—   rn directory â†—   changelog â†—   open issues â†—
  bundle visualizer report â†—   expo atlas data â†—
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

### The Deprecation Layer (always surfaced separately)

```
DEPRECATION RADAR
  Level 1 â€” npm explicit:       not deprecated âœ“
  Level 2 â€” API-level:          2 internal APIs deprecated (see changelog)
  Level 3 â€” Ecosystem-level:    wraps legacy bridge? No âœ“
  Level 4 â€” Platform-level:     iOS API used: UIWebView â†’ deprecated iOS 12
                                 âš ï¸ check native layer
  Level 5 â€” Silent:             vitality trajectory stable âœ“
```

---

# PART FIVE â€” THE THREE TEMPORAL GATES

### Gate 1: DISCOVERY
*"I need a package that does X"*

```
Developer asks â†’ category topology shown
  How many packages exist in this category?
  What layer are they on? (L2/L3/L4 distribution)
  Top candidates by Vitality Score Ã— CÃ— profile
  Side-by-side VitalityCard comparison
  "Commonly used together" suggestions
  Alternatives graph
  
Links surfaced:
  RN Directory category view â†—
  npm search filtered â†—
  GitHub topic â†—
  Relevant conference talks â†—
```

### Gate 2: INSTALLATION INTERCEPT
*"npx expo install react-native-reanimated"*

```
Install command detected â†’ PAUSE â†’ inject VitalityCard

  VERDICT:    ADOPT âœ“ (or HOLD âš ï¸ with alternatives)
  SCORE:      73/100
  CRITICAL:   [any HOLD-level warnings surfaced first]
  V1 READY:   âœ“

  [proceed] [see full breakdown] [see alternatives]

If HOLD â†’ alternatives shown immediately
If ADOPT â†’ proceed with acknowledgment of any âš ï¸ signals
```

### Gate 3: ROTATION SCAN
*Background health check â€” Metro start / manual audit*

```
npx rn-eval scan â†’ full project audit

  PROJECT VITALITY SUMMARY
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  23 packages tracked
   8 SOLID ROCK    â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ
  11 STABLE TRAIL  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ
   3 ASSESS FIRST  â–ˆâ–ˆâ–ˆ  â† review these
   1 HOLD          â–ˆ    â† migration needed

  CHANGED SINCE LAST SCAN (3 days ago):
  â†’ react-native-camera: bus factor dropped 1 (maintainer left)
  â†’ expo-notifications: SDK 55 beta shows incompatibility âš ï¸
  â†’ react-native-mmkv: new version released (safe update)

  ECOSYSTEM NEWS THIS WEEK:
  â†’ RN 0.85 RC dropped â€” affects 4 packages in your project
  â†’ Expo Agent 1.2 released â€” new capability
  â†’ Marc Rousavy: new Nitro Modules announcement

  MIGRATION ADVICE:
  â†’ react-native-async-storage â†’ MMKV migration: 2h effort
    [see migration guide â†—]
```

---

# PART SIX â€” THE ADAPTER LAYER
## How the Core Externalizes

```
              [ @rn-terrain/core ]
                      â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â–¼        â–¼         â–¼          â–¼          â–¼         â–¼
  [CLI]   [MCP]   [VS Code    [ESLint   [Web +    [Push /
                  Extension]  Plugin]   API]      Digest]
```

### CLI â€” `npx rn-eval`
```bash
npx rn-eval react-native-reanimated     # single package
npx rn-eval scan                        # full project audit
npx rn-eval compare reanimated skia     # side-by-side
npx rn-eval ecosystem navigation        # category map
npx rn-eval v1-check                    # V1 readiness for project
npx rn-eval digest                      # what changed this week
npx rn-eval tools                       # DX tools terrain map

flags:
  --json          pipe-friendly output
  --watch         monitor mode
  --cx            apply developer context profile
  --links         include all source links
```

Aesthetic: taze-inspired elegant TUI. Color-coded. Collapsible.
Every signal links to its source. Clickable terminal URLs.

### MCP Server
*Consumed by: Claude Code, Cursor, Radon AI, Expo Agent, Zed*

```
Tools exposed:
  audit_package(name, cx?)          â†’ VitalityCard
  compare_packages(names[])         â†’ ComparisonMatrix
  scan_project(package_json_path)   â†’ ProjectAudit
  ecosystem_map(category?)          â†’ EcosystemTopology
  get_alternatives(name)            â†’ AlternativesList
  v1_readiness_check(name)          â†’ V1ReadinessReport
  domain_direction()                â†’ DomainDirectionBrief
  tools_map(category?)              â†’ DXToolsMap
  weekly_digest()                   â†’ WeekInRN
```

100-token JSON injection instead of 20,000-token web scrape.
The invisible guardian â€” agent must clear this before installing.

### VS Code / Cursor Extension
```
  Hover on package.json dependency â†’ VitalityCard popover
  Inline vitality score badge
  Squiggly underline on HOLD packages
  Quick action: "Find alternatives"
  Side panel: full project topology map + ecosystem view
  Every signal â†’ clickable link to source
  V1 readiness badge per dependency
```

### ESLint Plugin
```
  eslint-plugin-rn-terrain
  Flags imports from HOLD packages
  Warns on known conflicts in your specific project
  CI/CD: fail build on critical decay if configured
  V1 incompatible packages flagged at lint time
```

### Web Surface
Three distinct surfaces â€” different audiences, same core:

**A) Package Card Pages** (developer discovery + SEO)
  rnterrain.dev/package/react-native-reanimated
  Full vitality card. Shareable. Updated daily.
  Each signal linked to its source.
  V1 readiness prominently shown.

**B) Ecosystem Explorer** (the macro view)
  Interactive topology â€” ThoughtWorks radar visual
  Filter: category / layer / verdict / New Arch / Expo compat / V1 ready
  Gartner-inspired quadrant: capability Ã— viability
  Roadmap.sh-inspired learning path per category
  Side-by-side comparison
  Living "best packages" = live queries, not static articles
  Vendor intelligence dashboard
  Domain direction feed

**C) API + Protocol Surface**
  GET /api/v1/eval/:packageName        â†’ VitalityCard JSON
  GET /api/v1/ecosystem                â†’ EcosystemTopology
  GET /api/v1/v1-readiness/:name       â†’ V1ReadinessReport
  GET /api/v1/tools                    â†’ DXToolsMap
  GET /api/v1/digest/weekly            â†’ WeekInRN
  /llms.txt                            â†’ AI crawler context
  /mcp                                 â†’ remote MCP endpoint

### Push / Awareness Layer
```
WEEKLY DIGEST â€” "The Week in RN Terrain"
  Personalized to your installed packages + CÃ— profile
  What actually changed that matters to YOU
  Not generic newsletter â€” filtered ecosystem intelligence
  Delivery: email subscription

EVENT ALERTS â€” real-time push on events that affect you
  "Package you use just deprecated a core API"
  "Expo SDK beta breaks your dependency X"
  "Maintainer of Y stepping down â€” bus factor dropped"
  "RN 0.85 RC â€” affects 4 of your packages"
  Delivery: email / webhook / Slack / Discord

SOURCE MONITORING
  Expo blog + changelog
  Meta RN blog + GitHub releases
  Software Mansion blog
  Callstack blog
  App.js Conf, Chain React, RN EU â€” YouTube titles + descriptions
  npm release feed
  Key person Twitter/X + GitHub activity
  Reddit r/reactnative (pain signal aggregation)

YOUTUBE SIGNAL APPROACH
  Video title + description = high signal, no transcript needed
  "Expo Agent 1.0 â€” Series B announcement" in title â†’ tier-1 event
  Key person channel uploads â†’ immediate surfacing
  Conference channel uploads â†’ tagged to domain direction
```

---

# PART SEVEN â€” THE DATABASE ARCHITECTURE
## Four-Speed Data Strategy

```
SPEED 1 â€” IMMUTABLE (seed once, human-curated)
  Identity, category, L1 classification, use case tags
  Known conflict pairs, topology layer assignment
  Key person list

SPEED 2 â€” DAILY DELTA (volatile fields only)
  GitHub vitality signals
  npm download numbers
  Version lag
  Star trajectory
  Open issues / PR counts

SPEED 3 â€” EVENT-TRIGGERED (fires when something happens)
  SDK release â†’ immediate compat recalculation
  Package deprecation â†’ immediate alert
  Key person announcement â†’ immediate surfacing
  Conference talk published â†’ tagged + surfaced
  V1 RC drop â†’ full ecosystem V1 scan
  Maintainer activity change â†’ bus factor recalculate

  THIS IS THE MOST POWERFUL SPEED.
  The tool reacts when the terrain shifts â€” not on a schedule.

SPEED 4 â€” REAL-TIME STREAM (social signals)
  Twitter/X mentions of tracked packages
  Reddit r/reactnative pain signals
  GitHub Discussions activity spikes
```

### The Event Log â€” append-only history

```sql
CREATE TABLE ecosystem_events (
  id          UUID PRIMARY KEY,
  event_type  TEXT,  -- see full taxonomy below
  entity_name TEXT,  -- package, tool, vendor, or person
  entity_type TEXT,  -- "package" | "tool" | "vendor" | "person"
  event_date  TIMESTAMPTZ,
  summary     TEXT,
  source_url  TEXT,
  severity    TEXT,  -- "info" | "warning" | "critical"
  affects     TEXT[] -- list of package names affected
);

EVENT TYPE TAXONOMY:
  -- Package events
  "new_arch_added"          "new_arch_removed"
  "maintainer_joined"       "maintainer_left"
  "major_version_released"  "package_deprecated_npm"
  "package_abandoned"       "package_revived"
  "wasm_binary_added"       "hermes_v1_confirmed"
  "nitro_powered_released"  "conflict_discovered"
  "conflict_resolved"       "expo_adopted"
  "v1_ready_confirmed"      "v1_breaking_risk_found"

  -- Ecosystem events
  "expo_sdk_released"       "expo_sdk_beta_dropped"
  "rn_version_released"     "rn_canary_notable_change"
  "rn_v1_rc_dropped"        "rn_rfc_opened"
  "hermes_update"           "architecture_shift"

  -- Vendor events
  "vendor_blog_post"        "vendor_tool_released"
  "vendor_funding"          "vendor_acquisition"

  -- Person events
  "key_person_announcement" "conference_talk_published"
  "key_person_package_update"

  -- DX Tool events
  "tool_released"           "tool_deprecated"
  "tool_major_update"       "tool_radar_change"
```

Not overwritten. Never deleted. This is the ecosystem's memory.
Powers the "what changed" view. Powers the weekly digest.
Powers the event alerts. The most valuable data we have.

---

# PART EIGHT â€” THE CONCEPTUAL TOPOLOGY APPLIED
## The RN Ecosystem Mapped Through L0â†’L4

```
L0  Why RN ecosystem exists:
    To organize the flow of mobile OS capability into
    cross-platform applications at acceptable developer cost.

L1  Invariant truths (permanent regardless of tools):
    S â€” Structure:   packages, tools, vendors, people, protocols
    P â€” Process:     discover, evaluate, install, update, migrate
    R â€” Relationship: dependency, conflict, composition, backing
    F â€” Flow:        releases, signals, announcements, code
    L â€” Limits:      attention, platform constraints, entropy
    D â€” Dynamics:    decay, adoption, architectural evolution

L2  Dominant landscape (high Lindy + high Bus Factor):
    React Navigation, Reanimated, MMKV, Expo SDK core,
    React Native CLI, Expo CLI, RN DevTools, Flipper (aging)

L3  Specialized capability (expert instruments):
    Nitro Modules (perf-critical native), Re.Pack (enterprise
    bundling), Maestro (E2E), Reassure (perf regression),
    react-native-bundle-visualizer

L4  Emerging frontier (still cooling â€” watch through L1 lens):
    Radon IDE, Radon AI, Expo Agent, Nitro Modules (rapidly
    becoming L3), WASM-powered packages, static Hermes packages,
    on-device AI (RN AI, local LLMs in RN)

CÃ—  Cost filter applied to the full terrain:
    Expo managed vs bare workflow changes what's accessible.
    New Arch only vs legacy-ok changes what's viable.
    Solo dev vs enterprise team changes what's safe.
    Bundle-sensitive app changes what's acceptable.
    Sri Lanka / emerging market context: offline-first,
    lower-spec devices, data cost sensitivity â€” these are
    real CÃ— dimensions that affect package choice.
```

---

# PART NINE â€” WHAT NOTHING ELSE DOES
## The Differentiation Map

| Capability | npm | RN Dir | Expo Docs | Snyk | Bundlephobia | RN Terrain |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| RN-specific vitality | âœ— | partial | âœ— | âœ— | âœ— | âœ“ |
| New Arch compat | âœ— | âœ“ | partial | âœ— | âœ— | âœ“ |
| Hermes V1 compat | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| WASM binary size | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| V1 readiness score | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Commit rhythm gaps | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Composite vitality | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Deprecation (5 levels) | partial | âœ— | âœ— | partial | âœ— | âœ“ |
| Conflict graph | âœ— | âœ— | âœ— | partial | âœ— | âœ“ |
| Ecosystem topology | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Vendor intelligence | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Key person radar | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| MCP / agent native | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| CÃ— developer profile | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Event changelog history | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| DX tools map | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Weekly push digest | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Living article queries | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |
| Migration path | âœ— | âœ— | âœ— | partial | âœ— | âœ“ |
| Canary/beta intel | âœ— | âœ— | partial | âœ— | âœ— | âœ“ |
| Conference radar | âœ— | âœ— | âœ— | âœ— | âœ— | âœ“ |

---

# PART TEN â€” BUILD SEQUENCE

### Phase 1 â€” The Core (Week 1â€“2)
```
@rn-terrain/core TypeScript package
Supabase schema initialized (all four speeds)
Manual seed: top 150 RN packages
VitalityCard output with full breakdown
Daily sync: GitHub API + npm + RN Directory API
Event log initialized
```

### Phase 2 â€” CLI (Week 3)
```
npx rn-eval working â€” single package + project scan
taze version logic integrated (MIT)
RN bundle visualizer data integrated (MIT)
Beautiful TUI output
v1-check command live
```

### Phase 3 â€” MCP Server (Week 4)
```
Core MCP tools live
Works inside Claude Code + Cursor
Agent install intercept functional
audit_package + scan_project + v1_readiness_check
```

### Phase 4 â€” Web + API (Week 5â€“7)
```
Package card pages (ISR â€” fresh daily)
Public API endpoint
Ecosystem explorer v1
llms.txt + remote MCP
V1 readiness dashboard
```

### Phase 5 â€” Push Layer (Week 8)
```
Weekly digest email
Event alert subscriptions
Source monitoring pipeline
Key person radar (Twitter/X + GitHub)
YouTube title/description signal ingestion
```

### Phase 6 â€” VS Code Extension (Week 9â€“10)
```
Hover cards in package.json
Inline vitality badges
V1 readiness badges
Side panel ecosystem view
```

### Phase 7 â€” Ecosystem Intelligence + ESLint (Week 11â€“12)
```
Full ecosystem topology map with visual radar
Living article infrastructure
CÃ— developer profile
ESLint plugin
DX tools map complete
Vendor intelligence dashboard
Conference radar
```

---

# IDENTITY

**Name:**     RN Terrain
**CLI:**      `rn-eval` / `npx rn-eval`
**npm org:**  `@rn-terrain`
**Web:**      `rnterrain.dev`

**One-line:**
*"RN Terrain is the live intelligence layer for the React Native
ecosystem â€” giving every developer and AI agent powerful orientation
at the exact moment a dependency decision must be made."*

**The pitch:**
Don't monitor the ecosystem. Let the ecosystem come to you.

---

**Built on the shoulders of:**
React Native Directory Â· taze (Anthony Fu, MIT) Â·
react-native-bundle-visualizer (Callstack, MIT) Â·
GitHub API Â· npm registry Â· Expo Atlas Â·
ThoughtWorks Radar Â· Gartner Magic Quadrant Â· Roadmap.sh Â·
Lindy Effect Â· Bus Factor Â· Conceptual Topology (Neev)

**Organized against entropy. Built for the V1 era.**

---
*Blueprint v2.0 â€” every signal sourced, every layer mapped,
every concept anchored to what doesn't change.*


---

# PART ELEVEN â€” RSS & SOURCE MONITORING ARCHITECTURE

## Why RSS is the Backbone of the Push Layer

Most sources you want to monitor already publish RSS/Atom feeds.
This means the source monitoring pipeline needs zero scraping â€”
just subscribe, parse, classify, route.

```
SOURCE                       RSS/ATOM FEED
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Expo blog                    blog.expo.dev/rss.xml
React Native blog            reactnative.dev/blog/rss.xml
Software Mansion blog        blog.swmansion.com/rss
Callstack blog               callstack.com/blog-feed.xml
GitHub releases (any repo)   github.com/:owner/:repo/releases.atom
GitHub discussions           github.com/:owner/:repo/discussions.atom
npm new versions             third-party feed services
Reddit r/reactnative         reddit.com/r/reactnative.rss
App.js Conf YouTube          via YouTube RSS (channel ID)
Chain React YouTube          via YouTube RSS
React Native EU YouTube      via YouTube RSS
Key person blogs             personal RSS where published
```

YouTube RSS is especially underrated:
Every YouTube channel has a machine-readable feed:
`https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`

This gives you video title + description + publish date
the moment a video goes live. No API key. No scraping.
This solves the "saw Expo Agent 2 months late" problem.

## RSS Pipeline Architecture

```
RSS FEEDS (polled every 15min)
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FEED NORMALIZER    â”‚  Parse â†’ normalize to common schema
â”‚  (per source type)  â”‚  { title, url, published, source,
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    raw_content, source_type }
           â”‚
           â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  SIGNAL CLASSIFIER  â”‚  Is this relevant to RN Terrain?
â”‚                     â”‚  Which packages does it affect?
â”‚                     â”‚  What event_type is this?
â”‚                     â”‚  What severity?
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â”‚
           â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  EVENT LOG INSERT   â”‚  Append to ecosystem_events
â”‚  + ALERT TRIGGER    â”‚  If severity â‰¥ warning â†’ trigger
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  subscriber alerts
```

Signal classification rules:
```
Title contains "deprecated"      â†’ event_type: deprecation, severity: critical
Title contains "breaking change"  â†’ event_type: breaking_change, severity: critical
Title contains "SDK 5X"          â†’ event_type: expo_sdk_released
Title contains "0.8X" + RN       â†’ event_type: rn_version_released
From key person + package name   â†’ event_type: key_person_announcement
YouTube from conf channel        â†’ event_type: conference_talk_published
GitHub release from tracked repo â†’ event_type: package_released
```

---

# PART TWELVE â€” KEY PERSON RADAR (CLUSTERED)

## The Cluster Model

People aren't tracked as individuals â€” they're tracked as clusters.
A signal from *any member* of a cluster triggers that cluster's
signal weight. New people are added by cluster, not individually.

```
CLUSTER 1 â€” RN CORE (Meta)
  Nicola Corti         @cortinico
  Lorenzo Sciandra     @Kelset
  Riccardo Cipolleschi @cipolleschi
  
  Signal type:  Architecture direction, V1 roadmap, Hermes, JSI
  Weight:       10/10 for ecosystem direction signals
  Watch for:    Anything about New Architecture, V1 RC, Hermes V1,
                stable JS API, Legacy Arch removal

CLUSTER 2 â€” EXPO
  Evan Bacon           @Baconbrix
  Brent Vatne          @notbrent
  Cedric van Putten    @cedricvanputten
  James Ide            @JI
  
  Signal type:  Managed workflow, SDK releases, Expo Agent, tooling
  Weight:       10/10 for Expo ecosystem signals
  Watch for:    SDK releases, Expo Agent updates, new expo/ packages,
                EAS changes, Series B announcements

CLUSTER 3 â€” SOFTWARE MANSION
  Krzysztof Magiera    @kzzzf
  MichaÅ‚ PierzchaÅ‚a    @thymikee
  Jakub Piasecki       @j-piasecki
  Oskar KwaÅ›niewski    @okwasniewski
  
  Signal type:  Reanimated, Gesture Handler, Radon IDE, Radon AI
  Weight:       10/10 for animation/gesture/IDE signals
  Watch for:    Reanimated major releases, Radon IDE milestones,
                New Arch adoption announcements, CSS animations

CLUSTER 4 â€” CALLSTACK
  Mike Grabowski       @grabbou
  Satya Sahoo          @satya164
  
  Signal type:  Enterprise RN, Re.Pack, bundle analysis, performance
  Weight:       10/10 for enterprise/bundle/performance signals
  Watch for:    Re.Pack releases, bundle visualizer updates,
                Reassure milestones, FastIO

CLUSTER 5 â€” INDEPENDENT INNOVATORS
  Marc Rousavy         @mrousavy
  Anthony Fu           @antfu
  Fernando Rojo        @fernandotherojo
  William Candillon    @wcandillon
  
  Signal type:  Emerging patterns, new module standards, L4 signals
  Weight:       10/10 for their specific domains:
                Marc â†’ Nitro Modules, VisionCamera, native perf
                Anthony â†’ tooling philosophy, taze, ecosystem
                Fernando â†’ Solito, cross-platform patterns
                William â†’ Skia, shader-based UI
  Watch for:    Nitro Modules adoption, new native standards,
                anything that could shift L4 â†’ L3 â†’ L2
```

## Cluster Signal Weighting

```typescript
interface ClusterSignal {
  person: string
  cluster: string
  signal_type: string
  weight: number           // 1â€“10
  packages_affected: string[]
}

// Weight multipliers
const CLUSTER_WEIGHTS = {
  'rn-core':       10,   // their signals affect the whole ecosystem
  'expo':          10,   // their signals affect all Expo users
  'swm':           10,   // their signals affect animation/gesture
  'callstack':     10,   // their signals affect enterprise users
  'independent':   8,    // highly influential but narrower scope
}

// A tweet from @cortinico about Legacy Arch removal:
// weight=10, affects=ALL packages with has_native_code=true
// â†’ trigger critical alerts for all subscribers
```

---

# PART THIRTEEN â€” RN TERRAIN'S OWN VITALITY SCORE

## Applying the Framework to Itself

This is not irony â€” it is radical transparency.
RN Terrain should publish its own VitalityCard.
Trust is built by being the first to apply your own standards.

```
RN TERRAIN â€” SELF ASSESSMENT (Launch Day)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

VITALITY SCORE:  N/A  [L4 â€” FRONTIER]
Radar Status:    ASSESS (honest â€” we just launched)

MAINTENANCE HEALTH
  Bus Factor:    1  â† Neev is the sole architect
                    Mitigation: blueprint is fully documented,
                    agent guide exists, types are the contract
  Commit Rhythm: Unknown â€” not yet established
  Issue Response: Unknown â€” no users yet

ARCHITECTURAL SAFETY
  Stack Lindy:   TypeScript (L2) + Supabase (L2) + MCP (L3)
                 All proven. No experimental dependencies.
  New Arch equiv: MCP-first = agentic era native âœ“

TEMPORAL STAMINA
  Lindy Age:     0 months â† honest
  Trajectory:    Unknown â€” prove it by shipping consistently

ECOSYSTEM POSITION
  Alternatives:  Several (see below) â€” none do what we do fully
  Vendor Backing: Independent (high risk, high integrity)

COST FACTORS
  Install cost:  npx = zero friction
  Learning cost: One command. One verdict. Transparent breakdown.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
CRITICAL SIGNAL:
  Bus Factor = 1. Single point of failure.
  The tool that warns about Bus Factor = 1 packages
  is itself a Bus Factor = 1 project. Own it.

HONEST VERDICT:
  ASSESS. Not because the tool is bad.
  Because it hasn't earned its Lindy yet.
  The only fix is time, consistency, and shipped Blooms.

HOW THE SCORE IMPROVES:
  Month 1:    Bloom 1 shipped â†’ Lindy clock starts
  Month 3:    First contributors â†’ Bus Factor rises
  Month 6:    Community using it â†’ Lindy solidifying
  Year 1:     Ecosystem references it â†’ ADOPT territory
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

Publishing this on the web surface builds trust faster
than any marketing copy. It says:
*"We apply our own framework to ourselves. We have nothing to hide."*

---

# PART FOURTEEN â€” COMPETITIVE LANDSCAPE

## Sites That Do Adjacent Things

These exist. None of them are RN Terrain. Here's the honest map.

```
NPMTRENDS.COM
  What it does:  Download comparison charts over time
  Strength:      Clean, fast, one thing done well
  Gap:           Single signal (downloads). No RN depth.
                 No vitality score. No architecture signals.
                 No agent integration.
  Lindy:         High â€” been around for years
  Our relation:  We link to it as a source. Not a competitor.

MOIVA.IO
  What it does:  Multi-signal npm package comparison
                 (stars, downloads, bundle size, issues)
  Strength:      Closest thing to us in concept
  Gap:           General npm, not RN-specific.
                 No New Arch signals. No V1 readiness.
                 No topology layer. No MCP. No push layer.
                 No event log. No key person radar.
  Lindy:         Medium â€” active but niche
  Our relation:  Conceptual predecessor. We go much deeper.

BUNDLEPHOBIA.COM
  What it does:  JS bundle size analysis
  Strength:      Excellent at one thing â€” bundle cost
  Gap:           JS bundle only. Not native binary size.
                 Not WASM binary cost. Not RN-specific.
  Lindy:         High â€” widely trusted
  Our relation:  We consume their data as one signal.

SNYK / SOCKET.DEV
  What it does:  Security vulnerability scanning
  Strength:      Deep security intelligence
  Gap:           Security only. Not maintenance health.
                 Not architecture compatibility. Not RN-specific.
  Lindy:         High â€” enterprise trusted
  Our relation:  Different problem space entirely.

REACTNATIVE.DIRECTORY
  What it does:  RN package registry with checkboxes
  Strength:      The community baseline. High trust.
  Gap:           No composite score. No temporal signals.
                 No vitality trajectory. No push layer.
                 No MCP. No ecosystem topology.
  Lindy:         High â€” community-maintained
  Our relation:  We consume their API as Tier 2 signal.
                 We are what they could become with 10x depth.

REACTSCRIPT.COM / JQUERYSCRIPT.NET
  What it does:  Package/component catalogs
  Strength:      Discovery surface, SEO
  Gap:           Pure catalog. No intelligence layer.
                 No signals. Often stale.
  Lindy:         Declining â€” catalog sites losing to search
  Our relation:  Not relevant. Different era of tooling.

AWESOME-REACT-NATIVE (GitHub lists)
  What it does:  Curated lists of RN resources
  Strength:      Human curation = quality signal
  Gap:           Static. Decays immediately after publication.
                 No signals. No scores. No agent integration.
  Lindy:         Medium â€” these lists have long tails but
                 stop being maintained
  Our relation:  Our living article engine makes these
                 permanently obsolete for package discovery.
```

## The Real Competitive Risk

Not the sites above. The real risks:

```
RISK 1 â€” EXPO BUILDS THIS INTERNALLY
  Expo Atlas already does bundle analysis.
  Expo Agent already has package intelligence.
  If Expo builds a full ecosystem intelligence tool,
  they have distribution (every Expo user) and data.

  Our defense:
  Neutrality. We surface non-Expo alternatives.
  We track SWM, Callstack, independent packages equally.
  Expo won't recommend a Callstack package over their own.
  We will. That's the trust moat.

RISK 2 â€” SOFTWARE MANSION BUILDS THIS FOR RADON IDE
  Radon IDE is purpose-built for RN.
  Adding package intelligence inside the IDE is natural.
  
  Our defense:
  We are IDE-agnostic. CLI + MCP works in every editor.
  We are also the data source Radon could consume.
  Become the API they build on, not the feature they replace.

RISK 3 â€” A WELL-FUNDED TEAM COPIES THE CONCEPT
  The blueprint is now public knowledge (from this doc).
  Anyone can read it and execute.

  Our defense:
  Speed of Bloom 1. Get to real users first.
  The event log is a compounding moat â€”
  every day we run, we accumulate ecosystem history
  that a new entrant cannot recreate.
  The Key Person Radar relationships take time.
  The community trust takes time.
  Lindy is the moat.
```

## The Trust Moat in One Sentence

RN Terrain is the only neutral, cross-vendor,
community-owned intelligence layer for the RN ecosystem.
It applies its own framework to itself.
It shows its reasoning always.
It has no vendor incentive to mislead.

That neutrality cannot be replicated by Expo,
Software Mansion, or Callstack.
It can only be built by someone with no vendor allegiance
who genuinely wants developers to make better decisions.

That is Neev.



---

# PART FIFTEEN â€” THE CAPABILITY CARD

## What the Package Can Actually Do

The Vitality Score answers: *is this package healthy?*
The Capability Card answers: *is this package right for me?*

A package can score 85/100 ADOPT and still be completely
wrong for your specific context. Health and fit are
different dimensions. Both matter equally.

```
CAPABILITY CARD â€” react-native-mmkv
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

PRIMARY PURPOSE
  Synchronous key-value storage with JSI native speed.
  Drop-in replacement for AsyncStorage â€” without the async.

KEY CAPABILITIES
  âœ“ Synchronous reads (no await â€” reads like a variable)
  âœ“ Synchronous writes (immediate, no callback)
  âœ“ Encryption at rest (AES-256)
  âœ“ Multi-process support (app + widgets + extensions)
  âœ“ TypeScript-first API
  âœ“ Supports Maps, Arrays, booleans natively
  âœ“ ~30x faster than AsyncStorage on benchmarks

KNOWN LIMITATIONS
  âœ— Not suitable for large binary data (use filesystem)
  âœ— No built-in sync/cloud â€” local only
  âœ— Encryption requires Keychain (iOS) / Keystore (Android)
    â€” adds setup complexity in bare workflow
  âœ— Not available in Expo Go (native module)
    â€” requires dev build

PERFORMANCE PROFILE
  Read latency:     ~0.1ms (synchronous, JSI direct)
  Write latency:    ~0.2ms (synchronous, JSI direct)
  vs AsyncStorage:  ~30x faster reads, ~15x faster writes
  Bundle cost:      +180kb
  Thread model:     JSI â€” runs on JS thread but non-blocking
                    (native C++ underneath, no bridge serialization)

CONTEXT REQUIREMENTS
  New Architecture:    âœ“ native JSI (works on both)
  Expo Go:             âœ— requires dev build
  Expo Managed:        âœ“ with dev build
  Bare RN:             âœ“
  Min RN version:      0.71+
  Min iOS:             13.0
  Min Android SDK:     21

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

### The Capability Card TypeScript Interface

```typescript
interface CapabilityCard {
  package_name: string

  // One line â€” no jargon, no marketing
  primary_purpose: string

  // Specific, technical, measurable where possible
  key_capabilities: string[]

  // What it explicitly cannot do
  known_limitations: string[]

  // Measured or community-reported performance
  performance_profile: {
    summary: string
    benchmarks?: Array<{
      metric: string
      value: string
      vs_alternative?: string
      source_url?: string
    }>
    thread_model: ThreadModel
    wasm_thread_model?: WASMThreadModel  // if wasm_compiled = true
  }

  // Hard requirements to use this package
  context_requirements: {
    new_arch_required: boolean
    expo_go_compatible: boolean
    expo_managed_compatible: boolean
    bare_rn_compatible: boolean
    min_rn_version?: string
    min_ios?: string
    min_android_sdk?: number
    requires_dev_build: boolean
    requires_native_build: boolean
  }

  // Source and freshness
  last_verified: string
  confidence: ConfidenceLevel
  sources: string[]
}

type ThreadModel =
  | 'js_thread_blocking'      // blocks JS thread â€” worst
  | 'js_thread_nonblocking'   // runs on JS thread but async
  | 'jsi_direct'              // JSI C++ â€” fast, non-blocking
  | 'worklet_offloaded'       // runs on separate worklet thread
  | 'native_thread'           // fully native, separate thread
  | 'unknown'

type WASMThreadModel =
  | 'js_thread_blocking'      // WASM on JS thread â€” problematic
  | 'worklet_offloaded'       // WASM via RN Worklets shareables
                              // (SWM approach â€” viable from 8.0+)
  | 'unknown'
```

---

# PART SIXTEEN â€” PROGRESSIVE DISCLOSURE

## The Right Information at the Right Depth

Information overload is as harmful as information absence.
The same package card serves five different intents â€”
from a 2-second glance to a 5-minute deep evaluation.
Progressive disclosure serves all five without flooding any.

```
LAYER 0 â€” PASSING GLANCE (2 seconds)
  Shown: package name + one-line purpose + score + verdict badge
  Context: search results, ecosystem map, comparison list
  
  react-native-mmkv
  Fast synchronous key-value storage
  89 â– â– â– â– â– â– â– â– â– â–‘  ADOPT

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

LAYER 1 â€” QUICK EVALUATION (10 seconds)
  Shown: Layer 0 + top 3 signals + V1 readiness + critical warnings
  Context: Gate 1 discovery, browsing alternatives
  
  react-native-mmkv  v2.12.0  89/100  ADOPT
  âœ“ JSI native  âœ“ V1 Ready  âœ“ SWM-backed
  âš  Requires dev build (no Expo Go)
  [See full breakdown â†“]

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

LAYER 2 â€” CONSIDERED EVALUATION (30 seconds)
  Shown: Layer 1 + score breakdown + capability summary
         + top limitation + alternatives
  Context: Gate 2 install decision, shortlist comparison
  
  [Full score breakdown bars]
  Purpose: Synchronous key-value storage â€” ~30x faster than AsyncStorage
  Key limit: Not Expo Go compatible â€” requires dev build
  Alternatives: expo-secure-store (simpler), @legendapp/state (reactive)
  [See full capability card â†“]  [See comparison â†“]

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

LAYER 3 â€” DEEP EVALUATION (2 minutes)
  Shown: Everything. Full capability card, comparison matrix,
         stack position, dependency cascade, migration path,
         full event history, all source links.
  Context: Before committing to a package in a production app

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

LAYER 4 â€” MACHINE / EXPERT CONSUMPTION
  Shown: Raw VitalityCard JSON â€” complete, sourced, typed
  Context: MCP agent consumption, API integration, CI pipeline
  npx rn-eval mmkv --json
```

### Progressive Disclosure in the CLI

```bash
# Default: Layer 1 output
npx rn-eval react-native-mmkv

# Layer 2: add breakdown
npx rn-eval react-native-mmkv --breakdown

# Layer 3: full card
npx rn-eval react-native-mmkv --full

# Layer 3 + comparison
npx rn-eval react-native-mmkv --compare async-storage legendapp-state

# Layer 4: machine-readable
npx rn-eval react-native-mmkv --json

# Capability card only
npx rn-eval react-native-mmkv --capabilities

# Stack position only
npx rn-eval react-native-mmkv --stack
```

### The Expert Thinking Principle

Progressive disclosure is not just a UX pattern.
It is the tool's answer to the gap between
junior and senior developer decision-making.

A senior developer evaluating a package asks:
- Thread model? (not just "is it fast")
- What breaks if I pair this with X?
- What's the cascade if this breaks?
- Is the maintainer track record consistent?
- What does the capability ceiling look like at scale?

RN Terrain surfaces these questions automatically
at Layer 2 and 3. A developer who has never thought
to ask "what's the thread model" gets that signal
because the tool considers it on their behalf.

That is the deepest form of empowerment:
not just answering questions, but teaching
which questions to ask â€” by asking them first.

---

# PART SEVENTEEN â€” WASM THREAD MODEL SIGNAL

## The Critical Nuance WASM Brings in 2026

WASM availability in Hermes V1 is real and significant.
But "WASM available" is not the same as "WASM performant."
The thread model changes everything.

```
THE WASM PROBLEM:

WASM on JS thread (default)
  â†’ Still blocks the UI during heavy computation
  â†’ Same problem as heavy JS â€” just compiled differently
  â†’ Not a performance win for CPU-intensive work
  â†’ Only a win for: code portability, Rust/C++ reuse,
    deterministic execution

WASM via RN Worklets (SWM approach, viable from 8.0+)
  â†’ Heavy computation moves to separate worklet thread
  â†’ JS thread stays free â€” UI stays responsive
  â†’ Shareables allow data passing between threads
  â†’ This is the genuinely performant WASM pattern
  â†’ Requires: New Architecture + RN Worklets 8.0+

IMPLICATION FOR SCORING:
  wasm_compiled = true + wasm_thread_model = "js_thread_blocking"
  â†’ Flag as âš  WASM present but JS-thread blocking
  â†’ Bundle cost without the performance benefit

  wasm_compiled = true + wasm_thread_model = "worklet_offloaded"
  â†’ âœ“ WASM with proper thread isolation
  â†’ Genuine performance win, appropriate architecture
```

### New Signal Fields Added to Package Schema

```sql
-- Add to packages table
wasm_thread_model TEXT DEFAULT 'unknown',
-- 'js_thread_blocking' | 'worklet_offloaded' | 'unknown'

wasm_worklets_required BOOLEAN DEFAULT false,
-- if true: requires RN Worklets 8.0+ for proper performance

wasm_rn_worklets_min_version TEXT,
-- minimum RN Worklets version for offloaded execution
```

### The Article That Explains This

SWM's RN Worklets 8.0 article on multithreading via shareables
is exactly the kind of content the human curation layer
should flag as significant. It changes the capability
assessment of every WASM-compiled package in the registry.

One article â†’ recalculate wasm_thread_model for all
wasm_compiled = true packages â†’ trigger review queue.

This is the event-triggered speed in action.

---

# PART EIGHTEEN â€” THE COMPATIBILITY MATRIX

## Positive Compatibility Is as Important as Conflict Detection

The conflict graph tells you what breaks together.
The compatibility matrix tells you what composes together.

Both are first-class signals. A developer's question
is not just "does this conflict with X" â€”
it's "does this work well with what I already have."

```
COMPATIBILITY MATRIX â€” @legendapp/list
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

CONFIRMED COMPATIBLE
  react-native-reanimated 3.x    âœ“  tested + documented
  @shopify/react-native-skia     âœ“  community confirmed
  expo-router                    âœ“  confirmed
  react-native-gesture-handler   âœ“  confirmed

PARTIAL COMPATIBILITY
  FlashList v2                   âš   API compatible but
                                    do not use both in same list â€”
                                    pick one per screen
  ExecuTorch                     âš   compatible but no
                                    AI-specific list features

NOT COMPATIBLE
  react-native-section-list      âœ—  different component model â€”
                                    use LegendList's own sections

UNTESTED / UNKNOWN
  react-native-vision-camera     ?  no community data yet
  react-native-maps              ?  no community data yet

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

### The AI/ML Compatibility Signal

ExecuTorch and react-native-ai/ml compatibility is a
new category of compatibility question that didn't
exist 18 months ago.

As on-device AI enters RN apps, developers will
increasingly need to know:
- Does this storage package support the tensor data types
  AI models produce?
- Does this list component handle AI-generated dynamic
  content efficiently?
- Does this camera package export frames in formats
  ExecuTorch expects?

This becomes a new compatibility_category:
```typescript
type CompatibilityCategory =
  | 'animation'        // Reanimated, Moti, Skia
  | 'navigation'       // React Navigation, Expo Router
  | 'state'            // Legend State, Zustand, Jotai
  | 'storage'          // MMKV, AsyncStorage, SQLite
  | 'ai_ml'            // ExecuTorch, react-native-ai
  | 'camera'           // VisionCamera, expo-camera
  | 'testing'          // Maestro, Detox
  | 'build'            // Re.Pack, EAS
```

Each package gets a compatibility_matrix entry
per relevant category. Populated by:
- Official documentation (highest confidence)
- Maintainer confirmation (verified)
- Community reports (medium confidence)
- Automated test results (high confidence if available)

---

# PART NINETEEN â€” HUMAN CURATION LAYER

## Editorial Quality in the Awareness Layer

RSS ingestion is automated.
Significance is a human judgment.

Not every blog post is equally important.
An SWM article explaining WASM multithreading via
RN Worklets shareables changes the capability
assessment of multiple packages in the registry.
A generic "top 10 RN tips" listicle does not.

The human curation layer ensures the weekly digest
has editorial quality â€” not just algorithmic volume.

```
CURATION PIPELINE:

AUTOMATED INGESTION
  RSS feeds â†’ normalized entries â†’ signal classifier
  Every entry gets: event_type, severity, affected_packages
  High-volume, low-friction, always running

SIGNIFICANCE THRESHOLD
  Entries scoring above threshold â†’ flagged for human review
  Threshold criteria:
    From key person cluster          â†’ auto-significant
    From vendor official blog        â†’ auto-significant
    Contains package name + keyword  â†’ review queue
    ("deprecated", "breaking",
     "multithreading", "V1", "JSI",
     "WASM", "New Arch", "worklets")

HUMAN REVIEW QUEUE
  Neev reviews flagged entries (takes 5â€“10 min/day)
  Simple interface: Title + source + auto-classification
  Actions: [Significant âœ“] [Not significant âœ—] [Tag package]

COMMUNITY REVIEW (Bloom 2+)
  Verified RN developers can mark entries as significant
  3+ verified developer votes â†’ auto-significant
  Reduces Neev's review burden over time

SIGNIFICANT ARTICLES IN DIGEST
  Each significant article gets a 2-sentence summary
  Written by Neev or community contributor
  Not auto-generated â€” editorial voice matters
  Linked to original + tagged packages

WHY HUMAN EVALUATION MATTERS:
  An LLM can classify "this article mentions WASM" â€” easy.
  An LLM cannot reliably judge "this article changes
  how developers should think about WASM packages" â€” hard.
  That judgment requires domain expertise + context.
  That's the human layer. It's not a limitation.
  It's the quality moat.
```

---

# PART TWENTY â€” REAL WORLD VALIDATION

## useHooks â€” Silent Deprecation Observed in the Wild

This is RN Terrain's thesis validated in real time.

On June 1 2026, browsing npm-trends, a developer
noticed @uidotdev/usehooks:
- Last published: 3 years ago
- 907,524 downloads last month (high inertia)
- 53 open issues
- 29 open pull requests including React 19 compatibility
- Community still sending signals, nobody receiving them

This is silent deprecation level 5 â€” no npm deprecated
flag, no announcement, just decay visible only if
you know where to look. 257 dependent packages
inherited this silently.

RN Terrain would have surfaced this as HOLD
the moment the rhythm deviation crossed 4x normal cadence.
A developer installing it today via Gate 2 intercept
would see the verdict before the package touches their disk.

This is not a hypothetical use case. It happened today.
It is happening to developers right now without warning.

**VitalityCard for @uidotdev/usehooks (live data):**
```
Vitality Score:    ~18/100   HOLD
Bus Factor:        2 (Tyler McGinnis + Ben Adam â€” neither active)
Lindy Age:         ~36 months
Days since release: ~1095 (3 years)
Rhythm deviation:  ~âˆž (no recent cadence to measure against)
Open issues:       53
Open PRs:          29 (unmerged â€” including React 19 compat)
Download inertia:  HIGH â€” 907k/month still pulling a dead package
Silent deprecation: Level 5 confirmed
Alternatives:      react-use (maintained), ahooks (maintained)
                   or just write the hooks yourself â€” they're simple
```

The high download count despite clear abandonment is
itself a signal type: **inertia decay**.
The package is dying but nobody told the download counter.
This is the most dangerous kind of dependency.

---

# PART TWENTY-ONE â€” LIST RENDERING CASE STUDY

## LegendList vs FlashList v2 â€” Capability-First Decision

This comparison demonstrates the capability-first
decision model in practice. Both packages are healthy.
The choice is entirely about capability fit.

```
DECISION MATRIX: LIST RENDERING IN RN (2026)

                    FlatList    FlashList v2   LegendList
                    â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Performance         baseline    5â€“10x faster   5â€“10x faster
                                (uniform items) (dynamic items)

Dynamic heights     âœ“ native    âš  needs        âœ“ native
                                estimatedSize   zero config

Blank flash         common      rare            very rare
prevention

New Arch required   âœ—           âœ—               âœ“ (Fabric/JSI)

Native deps         âœ— (built-in) âœ“ (native)    âœ— (100% JS)

Expo Go             âœ“           âœ—               âœ“

Chat UI (no invert) âœ—           âœ—               âœ“ built-in

Bidirectional       âœ—           âœ—               âœ“ built-in
infinite scroll

Migration from      n/a         drop-in swap    drop-in swap
FlatList                        + estimatedSize + recycleItems

Radar Status        L2/ADOPT    L2/ADOPT        L3â†’L2 (fast)

V1 Readiness        READY       READY           READY
```

**The capability-first decision tree:**

```
Are you on New Architecture?
  NO  â†’ FlashList (native deps, but works on both)
  YES â†’ continue

Do your list items have dynamic/unpredictable heights?
  NO  â†’ FlashList (uniform items = FlashList's sweet spot)
  YES â†’ LegendList (dynamic heights, zero config)

Do you need Chat UI without list inversion?
  YES â†’ LegendList (built specifically for this)
  NO  â†’ continue

Are you Expo Go dependent?
  YES â†’ LegendList (100% JS, no native deps)
  NO  â†’ either â€” pick by use case above

List under 300 items?
  YES â†’ FlatList is fine â€” don't optimize prematurely
  NO  â†’ FlashList or LegendList
```

This decision tree is exactly what the Comparison Card
surfaces automatically. The developer doesn't need to
research all of this. The tool asks the right questions
and routes them to the right answer.



---

# PART TWENTY-TWO â€” THE HUMAN SUSTAINABILITY LAYER

## The Marak Prevention Mechanism

Marak Squires built colors.js (3.3 billion downloads)
and faker.js (272 million downloads) alone. No funding.
No reciprocity. Fortune 500 companies extracted billions
in value. He got silence. Then he broke his own tools
in protest. GitHub suspended him. Nobody sent the contract.

Aaron Swartz built RSS at 14, co-founded Reddit, gave
everything to the commons, faced federal prosecution,
died at 26. Marak's README asked: "What really happened
with Aaron Swartz?" The answer was: the same thing
that was happening to Marak.

The open source sustainability crisis is the root cause
of most decay signals in the vitality score.
Bus Factor = 1 + no funding + corporate extraction
= the Marak scenario waiting to happen.

RN Terrain tracks this explicitly. And it does something
no other tool does: it closes the loop back to the human.

---

## The Appreciation & Sustainability Signal

This is a FIRST-CLASS signal. Not a footer. Not an afterthought.
On every VitalityCard. Especially prominent for unfunded solo maintainers.

```
SUSTAINABILITY MODEL â€” new first-class field

sustainability_model:
  "corporate_backed"   Expo, SWM, Callstack, Meta â€” structurally stable
  "foundation"         Apache, Linux Foundation, PSE â€” institutionally stable
  "sponsored"          Has active GitHub Sponsors / OC funding â€” good
  "unfunded_solo"      â† HIGHEST RISK â€” Marak scenario profile
  "community"          Multiple contributors, no formal funding â€” medium risk
  "unknown"            Not enough data

The unfunded_solo profile triggers:
  â†’ Prominent appreciation CTA on card
  â†’ Sustainability warning in score breakdown
  â†’ "This package needs community support" signal
  â†’ Links to all verified funding channels
```

### The Appreciation CTA â€” For Unfunded Solo Maintainers

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ’› SUPPORT THIS MAINTAINER

  This package is maintained by one person
  with no known funding.
  [N] weekly downloads. [N] dependent packages.

  If this work has value to you:
  â†’ GitHub Sponsors    github.com/sponsors/:handle
  â†’ Open Collective    opencollective.com/:project
  â†’ Say thank you      Open an issue. It matters.

  "The syntropic energy behind this package
   deserves to be seen."
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

That last line stays. Permanently. On every card
where a solo maintainer is carrying something alone.

### Verified Funding Sources Only

Safety rule â€” never scrape README links:

```
VERIFIED SOURCES (consumed via official APIs):
  GitHub Sponsors     â†’ API: api.github.com/users/:user/sponsorable
  Open Collective     â†’ API: opencollective.com/api/v1/:slug
  npm funding field   â†’ package.json "funding" key (maintainer-controlled)
                        {
                          "funding": {
                            "type": "github",
                            "url": "https://github.com/sponsors/maintainer"
                          }
                        }
  Polar.sh            â†’ emerging platform, API available

NEVER SHOW:
  README-scraped links    â†’ injection risk
  Unverified URLs         â†’ too dangerous
  PayPal direct links     â†’ not verifiable as maintainer-owned

HONEST DEFAULT:
  "No verified funding link found"
  + "Ask the maintainer how to support them"
  Never imply unfundable â€” just unverified
```

### RN Terrain's Own Appreciation Card

```
ðŸ’› SUPPORT RN TERRAIN

  Built by Neev, University of Moratuwa, Sri Lanka.
  Bus Factor: 1. Lindy: [N] months.
  We apply our own framework to ourselves.

  If this tool saved you time today:
  â†’ GitHub Sponsors    github.com/sponsors/neev
  â†’ Star the repo      It signals to others this matters
  â†’ Contribute         Even one package seed helps

  "Built because we needed it.
   Shared because others might too."
```

---

# PART TWENTY-THREE â€” THE FULL SYMBOL SYSTEM

## Universal Symbols Across All Surfaces

Symbols are not just for technical signals.
They are a *language* â€” for health, humanity, architecture,
relationships, warnings, and appreciation.

The same underlying VitalityCard compressed differently
for each surface. Same data. Different representation.

### The Complete Symbol Vocabulary

```
VERDICT SYMBOLS
  âœ“   ADOPT       Safe to build on
  â—Ž   TRIAL       Good â€” read the specifics
  âš    ASSESS      Proceed with awareness
  âœ—   HOLD        Do not install â€” see alternatives

ARCHITECTURE SYMBOLS
  ðŸ—   JSI / New Architecture native
  ðŸŒ‰   Compatibility layer (bridge fallback)
  ðŸŸ°   Pure JavaScript (no native)
  âš™ï¸   Legacy bridge only
  ðŸ¦€   Rust via UniFFI
  ðŸ¦…   Nitro Modules powered
  ðŸ“¦   WASM compiled
  ðŸ§µ   Worklet-offloaded (thread safe)

HEALTH SYMBOLS
  ðŸ’š   Healthy rhythm (commits, releases normal)
  ðŸ’›   Slowing (deviation 1.5â€“2.5x normal cadence)
  ðŸ§¡   Concerning (deviation 2.5â€“4x)
  â¤ï¸   Silent (deviation >4x â€” decay risk)
  ðŸ’€   Silent deprecation detected

HUMAN / SUSTAINABILITY SYMBOLS
  ðŸ’›   Has verified funding â€” maintainer supported
  ðŸ‘¤   Bus Factor = 1 â€” single point of failure
  ðŸ‘¥   Bus Factor 2â€“4 â€” small but resilient
  ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦   Bus Factor 5+ â€” team-backed
  ðŸ¢   Corporate backed â€” structurally stable
  ðŸ›ï¸   Foundation backed â€” institutionally stable
  ðŸ†˜   Unfunded solo â€” appreciation needed
  â¤ï¸â€ðŸ”¥  Burnout risk profile (unfunded + high downloads + slowing)

VERSION / TEMPORAL SYMBOLS
  âš¡   V1 Ready â€” stable era prepared
  ðŸ”„   Actively updating â€” healthy cadence
  ðŸ“…   Stale â€” deviation detected
  ðŸ   Approaching end of life
  ðŸŒ±   New â€” Lindy < 6 months
  ðŸŒ³   Mature â€” Lindy > 24 months

COMPATIBILITY SYMBOLS
  âœ“   Confirmed compatible
  âš    Partial / with caveats
  âœ—   Incompatible
  ?   Untested / unknown

COST SYMBOLS
  ðŸª¶   Tiny bundle (< 10kb)
  ðŸ“   Moderate bundle (10â€“200kb)
  ðŸ‹ï¸   Heavy bundle (200kbâ€“1mb)
  ðŸ˜   Very heavy (> 1mb)
  ðŸ•¸ï¸   High dependency fan-out (> 30 transitive)

SPECIAL SIGNALS
  ðŸ”’   Has encryption / security features
  ðŸŒ   Cross-platform (iOS + Android + Web)
  ðŸ“±   Mobile only
  ðŸ”Œ   Requires native build (no Expo Go)
  ðŸ§ª   Experimental / unstable API
  ðŸŽ¯   Recommended for your CÃ— profile
  ðŸ”—   Has verified funding link
  ðŸ“£   Key person recently mentioned this
  ðŸ—žï¸   In weekly digest this week
```

### Surface-Specific Compression

```
CLI DEFAULT OUTPUT
  react-native-reanimated  v3.x  âœ“ 89/100
  animation Â· SWM Â· L2 Â· ðŸ— âš¡ ðŸ’› ðŸŒ³

CLI COMPACT (--compact flag)
  âœ“89 ðŸ—âš¡ðŸ’›  reanimated

CLI SCAN OUTPUT
  âœ“  react-native-reanimated    89  ðŸ—âš¡
  âœ“  react-native-mmkv          87  ðŸ—âš¡
  âš   react-native-maps          54  ðŸŒ‰ðŸ“…
  âœ—  react-native-camera        12  ðŸ‘¤ðŸ’€  â†’ vision-camera

MCP JSON (no symbols â€” pure codes)
  {
    "verdict": "ADOPT",
    "score": 89,
    "architecture": "native_jsi",
    "v1_ready": true,
    "sustainability": "corporate_backed",
    "bus_factor_level": "team",
    "rhythm": "normal",
    "bundle_tier": "moderate"
  }

VS CODE HOVER
  ðŸŸ¢ ADOPT  89/100
  ðŸ— JSI Native  âš¡ V1 Ready  ðŸ’› Funded
  âš  Heavy bundle (+340kb)

WEB CARD
  Full visual system â€” color bands, icons, progress rings
  Progressive layer expansion
  Appreciation CTA prominent for ðŸ†˜ packages

BADGE (shields.io compatible â€” embeddable in README)
  rnterrain.dev/badge/react-native-reanimated
  â†’ [RN Terrain | ADOPT 89 | brightgreen]

  rnterrain.dev/badge/react-native-camera
  â†’ [RN Terrain | HOLD 12 | red]
```

### The Confidence Dots

Used inline next to any signal value:

```
â—   verified     â€” manually confirmed or 3+ source agreement
â—   high         â€” direct authoritative API, recent
â—‰   medium       â€” single source, or computed
â—‹   low          â€” estimated, inferred
?   unknown      â€” not enough data
```

Example in CLI:
```
New Arch:    ðŸ— native_jsi  â— verified (3-source)
Bundle:      ðŸ‹ï¸ +340kb       â—‹ low (estimated)
Bus Factor:  ðŸ‘¥ 3            â—‰ medium (computed)
Thread:      ðŸ§µ worklet      ? unknown
```

---

# PART TWENTY-FOUR â€” BADGE INFRASTRUCTURE

## Embeddable Badges as Distribution

Every package gets a shields.io compatible badge.
Maintainers add it to their README.
Developers see the score before they click.
Every badge is a backlink to RN Terrain.

```
BADGE URL PATTERNS:

Vitality score:
  rnterrain.dev/badge/:package
  â†’ [RN Terrain | ADOPT 89 | brightgreen]

V1 readiness:
  rnterrain.dev/badge/:package/v1
  â†’ [V1 Ready | âœ“ | blue]

New Arch:
  rnterrain.dev/badge/:package/arch
  â†’ [New Arch | JSI Native | brightgreen]

Sustainability:
  rnterrain.dev/badge/:package/support
  â†’ [Support | GitHub Sponsors | orange]

BADGE COLOR MAPPING:
  ADOPT  80+   â†’ brightgreen
  TRIAL  60â€“79 â†’ green
  ASSESS 40â€“59 â†’ yellow
  HOLD   0â€“39  â†’ red
  V1 Ready     â†’ blue
  Funded       â†’ orange (draws attention)
```

Markdown for maintainers to copy:
```markdown
[![RN Terrain](https://rnterrain.dev/badge/your-package)](https://rnterrain.dev/package/your-package)
```

This makes every README a distribution point.

---

# PART TWENTY-FIVE â€” RUST/UNIFFI & UNLISTED PACKAGE DISCOVERY

## The New Package Taxonomy

Mopro revealed a class of packages invisible to all
existing tooling. RN Terrain maps the full binding taxonomy.

```
binding_type â€” new first-class signal:

  "pure_js"          No native layer â€” works everywhere
  "expo_modules"     Expo Modules API â€” Swift/Kotlin
  "nitro_modules"    Nitro (Marc Rousavy) â€” emerging standard
  "jsi_cpp"          Direct C++ JSI (Reanimated, MMKV)
  "uniffi_rust"      Rust via UniFFI â† new category
  "legacy_bridge"    Old RCTBridgeModule â€” declining
```

UniFFI/Rust packages have a distinct profile:
- Native thread execution (not JS thread blocking)
- Rust memory safety guarantees
- CPU-intensive tasks handled natively
- Higher build complexity
- No Expo Go support
- Requires Rust toolchain

The WASM vs native Rust distinction matters:
```
WASM on JS thread     â†’ slow, blocking, wrong choice
WASM via worklets     â†’ acceptable, SWM pattern
Rust via UniFFI       â†’ fast, native thread, right choice
                         for CPU-heavy work
```

## Automatic Discovery Pipeline

Three mechanisms for finding unlisted packages:

```
MECHANISM 1 â€” GitHub Topic Combinations (weekly scan)
  topic:react-native + topic:zero-knowledge
  topic:react-native + topic:wasm
  topic:react-native + topic:rust
  topic:react-native + topic:ai
  topic:react-native + topic:ffi
  topic:react-native + topic:cryptography
  topic:expo + topic:rust
  topic:expo + topic:ffi
  â†’ New repos surface for human review queue

MECHANISM 2 â€” npm keyword monitoring
  keywords: ["react-native"] AND ["zk", "ai", "ml",
             "crypto", "rust", "wasm", "ffi"]
  npm registry change feed â€” real-time new publishes
  â†’ New packages surface immediately

MECHANISM 3 â€” Community submission portal
  Web form: package URL + category + why it belongs
  Structured format:
    GitHub URL
    npm URL (if exists)
    Install method: npm / github / manual_bindings
    Category
    Why should RN Terrain track this?
  Evidence tiers: official / maintainer / community
```

## The Non-npm Install Signal

```
install_method:
  "npm"              â†’ standard, drop-in
  "github"           â†’ GitHub URL install â€” mopro pattern
  "manual_bindings"  â†’ requires CLI-generated bindings
  "cli_generated"    â†’ requires separate CLI tooling

Displayed at Gate 2 install intercept:
  âš  NON-STANDARD INSTALL
  This package installs from GitHub, not npm.
  Requires Mopro CLI to generate custom bindings.
  Not a drop-in install â€” plan for setup time.
```

---

# PART TWENTY-SIX â€” THE MARAK SIGNAL

## Protestware as an Ecosystem Event

The colors/faker incident defines a new event type
that no existing tool tracks â€” and that your event log
should capture permanently.

```sql
-- New event types added to ecosystem_events taxonomy:

"maintainer_protest"         -- Marak-style intentional sabotage
"maintainer_distress_signal" -- public statement of burnout/frustration
"funding_request_public"     -- maintainer publicly asked for support
"corporate_extraction_noted" -- maintainer called out unfair use
"package_forked_community"   -- community forked abandoned package
"sustainability_crisis"      -- project at Marak risk threshold
```

The Marak threshold â€” when does a package enter
sustainability crisis territory?

```typescript
function isMajakRiskProfile(pkg: Package): boolean {
  return (
    pkg.bus_factor === 1 &&
    pkg.sustainability_model === 'unfunded_solo' &&
    pkg.downloads_weekly_npm > 100_000 &&
    pkg.days_since_maintainer_public_activity > 90 &&
    !pkg.has_verified_funding
  )
}

// When true:
// â†’ sustainability_model upgrades to "crisis_risk"
// â†’ Appreciation CTA becomes urgent
// â†’ Weekly digest surfaces this package specifically
// â†’ Event logged: "sustainability_crisis"
// â†’ Alert sent to subscribers of this package
```

This is the Marak prevention mechanism.
Not just data. Action. The tool sees the pattern
before the infinite loop ships.



---

# PART TWENTY-SEVEN â€” MAINTAINER SUCCESSION SIGNALS

## When the Maintainer Leaves, Retires, or Recommends a Successor

The hardest abandonment to detect is the one that happens
gradually. The hardest to act on is when a maintainer
explicitly says "use X instead" but nobody notices.

RN Terrain tracks three distinct succession patterns:

```
PATTERN 1 â€” EXPLICIT SUCCESSOR (highest signal)
  Maintainer explicitly names a replacement.
  tsup README: "not actively maintained â€” use tsdown"
  react-native-camera README: "use vision-camera"
  Zodios issue: silent â†’ ts-rest (community found out)
  ts-rest trajectory: heading toward â†’ oRPC

  This is the clearest migration path possible.
  The maintainer did the work. We surface it.
  recommendation_source: 'maintainer_official'
  Confidence: verified

PATTERN 2 â€” MAINTAINER HIT THE BUS
  Maintainer became unreachable, died, or explicitly left
  with no named successor.
  The Marak pattern at its most severe.
  No PR responses. No issue acknowledgment.
  No announcement. Just silence.

  Detection: rhythm deviation > 6x + no response to
  issues + no response to PRs + no social activity
  from key maintainer account for 180+ days.

  This is the most dangerous pattern because:
  â†’ No migration path given
  â†’ Community must self-organize a fork
  â†’ High inertia packages keep getting downloaded
  â†’ New developers inherit the risk unknowingly

PATTERN 3 â€” COMMUNITY FORK AFTER ABANDONMENT
  Community recognized abandonment and forked.
  The fork may be healthy even if original is HOLD.
  Original and fork tracked separately.
  Fork gets its own VitalityCard.

  Examples:
  @react-native-community/async-storage
    â† forked from react-native-community AsyncStorage
    when Facebook handed it off
```

### New Event Types

```sql
-- Add to ecosystem_events event_type taxonomy:

'maintainer_named_successor'
  -- Explicit README/npm deprecation naming replacement
  -- Highest confidence migration signal
  -- entity_name: the OLD package
  -- raw_data: { successor: 'new-package-name', source_url }

'maintainer_hit_bus'
  -- Maintainer became unreachable
  -- Detected computationally, confirmed by community
  -- severity: critical

'maintainer_retirement'
  -- Maintainer explicitly announced retirement/stepping back
  -- May or may not have named successor
  -- severity: warning

'community_fork_created'
  -- Community forked abandoned package
  -- entity_name: the NEW fork package
  -- raw_data: { forked_from: 'original-package' }

'package_entering_maintenance_mode'
  -- Maintainer announced: still fixing bugs but no new features
  -- Not HOLD yet but trajectory signal
  -- severity: info
```

### The Maintainer-Recommended Alternative

When recommendation_source is 'maintainer_official'
this gets special first-class treatment everywhere:

```
CLI OUTPUT:
  âœ—12  tsup  âš™ï¸ðŸ“…  HOLD â€” not actively maintained
  
  â­ MAINTAINER RECOMMENDS:
     tsdown  [ADOPT 84]  ðŸ”„âš¡
     "This project is not actively maintained anymore.
      Please consider using tsdown instead."
     Migration: trivial  â†’  npx tsdown-migrate
     [changelog â†—] [migration guide â†—]

MCP OUTPUT:
  {
    "verdict": "HOLD",
    "maintainer_recommended_successor": {
      "package": "tsdown",
      "source": "maintainer_official",
      "source_url": "https://github.com/egoist/tsup",
      "quote": "not actively maintained â€” use tsdown",
      "migration_effort": "trivial",
      "migration_command": "npx tsdown-migrate"
    }
  }

VS CODE:
  ðŸ”´ tsup â€” HOLD  â­ â†’ tsdown (maintainer recommended)
```

---

# PART TWENTY-EIGHT â€” THE VS CODE EXTENSION OBSERVATION

## What the RN Directory Extension Already Shows

The VS Code extension for React Native Directory
already injects inline metadata into package.json:

```
â˜… 8.4K  â–¼ 3.6M  â€¢ New Architecture
```

Three signals: stars, downloads, New Arch flag.

This proves the market. Developers want this in their editor.
It also proves what's missing â€” everything else:

```
WHAT IT SHOWS          WHAT RN TERRAIN ADDS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â˜… stars                vitality score 0â€“100
â–¼ downloads            rhythm status ðŸ’šðŸ’›ðŸ§¡â¤ï¸
New Arch flag          V1 readiness âš¡
                       bus factor ðŸ‘¤ ðŸ‘¥ ðŸ¢
                       sustainability ðŸ’› ðŸ†˜
                       version lag + safety band
                       maintainer succession â­ â†’ tsdown
                       thread model ðŸ— ðŸ¦€ ðŸ§µ
                       warnings ordered by severity
                       links to everything
                       progressive to Layer 3
```

The RN Directory extension shows 3 signals.
RN Terrain's VS Code extension shows 30+ signals
with confidence levels, progressive disclosure,
the human layer, and maintainer succession signals.

The observation from your package.json screenshot
confirms this works exactly as designed at Layer 0.
RN Terrain is what that extension becomes
when built with the full intelligence layer.

---

# PART TWENTY-NINE â€” LOCAL DATABASE CASE STUDY

## The "AI Still Recommends WatermelonDB" Problem

This is one of the most important validations
of RN Terrain's entire thesis.

AI assistants trained on historical data still
recommend WatermelonDB as "the best local database
for React Native" â€” because when their training
data was collected, it was. The ecosystem moved.
The models didn't.

The actual 2026 local database landscape for RN:

```
DECISION MATRIX: LOCAL DATABASE IN RN (2026)

                    Watermelon  expo-sqlite  op-sqlite  MMKV  Legend State
                    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”€â”€â”€â”€  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Vitality (approx)  ASSESS      ADOPT        TRIAL      ADOPT ADOPT
New Arch           âš partial    âœ“ native     âœ“ native   âœ“     âœ“
Expo Go            âœ—           âœ“            âœ—          âœ—     âœ“
Maintenance        Nozbe-backed Expo-backed community  indie indieâ†’growing
Bus Factor         team        team         2          1     1â†’growing
Complex queries    âœ“ excellent âœ“ via SQL    âœ“ via SQL  âœ—     partial
Reactive queries   âœ“ built-in  needs wrapper needs wrap âœ—    âœ“ built-in
Offline sync       âœ“ custom    needs setup  needs setup âœ—    âœ“ with cloud
Speed              fast        good         fastest    fastest fast
Bundle cost        heavy       moderate     moderate   light  moderate

AI RECOMMENDATION PROBLEM:
  LLM trained on 2023 data â†’ "Use WatermelonDB"
  RN Terrain in 2026       â†’ "ASSESS â€” see alternatives"

WHY THIS MATTERS:
  RN Terrain's verdicts are live.
  LLMs are trained on history.
  This is a core pitch point for the tool.
  "Don't let historical data make your decisions."
```

### The Maintainer-Recommended Path for WatermelonDB Users

WatermelonDB itself has not named a successor.
But the community has formed a consensus:

```
MIGRATION PATHS FROM WATERMELONDB:

If you need complex queries + offline sync:
  â†’ PowerSync or ElectricSQL
  â†’ Migration effort: significant (schema rewrite)

If you need reactive queries + state:
  â†’ Legend State (with persistence)
  â†’ Migration effort: moderate

If you need raw SQL + speed:
  â†’ op-sqlite or expo-sqlite
  â†’ Migration effort: significant (remove WM abstractions)

If you need simple key-value:
  â†’ MMKV
  â†’ Migration effort: trivial
```

---

# PART THIRTY â€” TSUP â†’ TSDOWN CASE STUDY

## The Perfect Migration Signal Example

tsup â†’ tsdown is the cleanest example of every
succession signal type working correctly together.

```
TSUP VITALITY CARD (2026):
  Verdict:     HOLD
  Score:       ~35/100
  
  Maintenance: README explicitly says "not actively maintained"
  Successor:   tsdown (maintainer_official, verified)
  Migration:   trivial (npx tsdown-migrate)
  
  â­ MAINTAINER RECOMMENDS: tsdown
  Quote: "This project is not actively maintained anymore.
          Please consider using tsdown instead."

TSDOWN VITALITY CARD (2026):
  Verdict:     ADOPT (rapidly â†’ L2)
  Score:       ~82/100

  Vendor:      void(0) â€” Vite/Vitest/Rolldown/Oxc ecosystem
  Bus Factor:  team (Kevin Deng primary + void(0) backing)
  Built on:    Rolldown (Rust-based â€” same ecosystem)
  Anthony Fu:  published official tsdown agent skill
  Migration:   npx tsdown-migrate (one command)
  
  Note: tsup's second-highest contributor IS
        tsdown's primary contributor.
        Institutional knowledge preserved.
        Migration confidence: very high.

WHAT THIS TEACHES ABOUT THE SIGNAL SYSTEM:
  The maintainer_official source is the highest possible
  recommendation confidence.
  It changes the HOLD verdict from "danger, no path"
  to "HOLD + clear path â†’ ADOPT alternative exists"
  Those are completely different developer experiences.
```

The tsup case also reveals a gap in current tooling:
People are still discovering tsup's maintenance status only after hitting breakage during TypeScript 6 upgrades â€” because npm doesn't surface the README warning prominently.

RN Terrain surfaces it at Gate 2 before install.
That's the exact intervention point the current
ecosystem is missing.



---

# PART THIRTY-ONE â€” THE FULL SOURCE LAYER

## Every Data Source RN Terrain Consumes

Building on top of existing infrastructure,
not competing with it. We are the intelligence layer
above all of these.

```
SOURCE UNIVERSE:

NPM REGISTRY API (public, no auth)
  registry.npmjs.org/:package          â€” full metadata
  registry.npmjs.org/:package/latest   â€” latest version details
  api.npmjs.org/downloads/point/       â€” download counts
  registry.npmjs.org/-/all/since       â€” new package change feed
  Gives: versions, downloads, funding field,
         keywords, dependencies, dist-tags,
         publish dates, maintainer list

BUNDLEPHOBIA API (public, encouraged)
  bundlephobia.com/api/size?package=   â€” bundle size + tree-shaking
  bundlephobia.com/api/similar-packages â€” their alternative suggestions
  Gives: minified size, gzipped size,
         dependency count, tree-shakeable flag
  Note: Bundlephobia explicitly encourages API use
        "Used it's API to build something cool? Let us know!"

REACT NATIVE DIRECTORY API (public)
  reactnative.directory/api/libraries  â€” full registry with filters
  Gives: all RN-specific signals
         platform support, New Arch, Expo Go,
         TypeScript, maintained flag, score

GITHUB API (authenticated, 5000 req/hr free)
  /repos/:owner/:repo                  â€” repo metadata
  /repos/:owner/:repo/commits          â€” commit history
  /repos/:owner/:repo/contributors     â€” contributor list
  /repos/:owner/:repo/issues           â€” issues with labels + comments
  /repos/:owner/:repo/pulls            â€” pull requests
  /repos/:owner/:repo/releases         â€” structured release notes
  /repos/:owner/:repo/contents/CHANGELOG.md â€” changelog file
  /search/repositories?q=topic:        â€” discovery queries
  Gives: all vitality signals + PR/issue intelligence

SHIELDS.IO ENDPOINT API (public)
  img.shields.io/endpoint?url=         â€” badge rendering
  We serve JSON â†’ shields.io renders SVG
  Zero SVG code on our side

OPEN COLLECTIVE API (public)
  opencollective.com/api/v1/:slug      â€” financial transparency
  Gives: total raised, expenses, backers,
         financial_transparency signal

GITHUB SPONSORS API (authenticated)
  api.github.com/users/:user/sponsoring â€” sponsors check
  Gives: verified funding existence

YOUTUBE RSS (public, no API key)
  youtube.com/feeds/videos.xml?channel_id=
  Gives: new videos with title + description
         conference talks, maintainer announcements

RSS FEEDS (public)
  Per-source blog/changelog feeds
  Gives: new posts, announcements, deprecation notices
```

---

# PART THIRTY-TWO â€” PR AND ISSUE INTELLIGENCE

## Quality Signals Beyond Raw Counts

Raw issue count means almost nothing.
Issue quality tells you everything.

29 open issues where maintainer responds to all of them
within 48 hours = healthy package.

29 open issues where the most-reacted issue
asking "is this maintained?" has been open 14 months
with zero maintainer response = WatermelonDB New Arch situation.

Same count. Completely different health signal.

### Issue Quality Signals

```typescript
interface IssueIntelligence {
  // Raw counts
  open_count: number
  closed_count: number
  closed_ratio: number

  // Response quality
  maintainer_response_rate: number    // % of issues with any maintainer reply
  avg_first_response_days: number     // avg days to first maintainer comment
  avg_resolution_days: number         // avg days to close
  oldest_open_issue_days: number      // how long the oldest sits

  // Community frustration signals
  user_self_closed_count: number      // users closing their own issues
                                      // ("giving up" signal)
  is_maintained_questions: number     // issues titled/containing
                                      // "is this maintained?" "abandoned?"
  high_reaction_unresponded: Array<{  // community demand + silence
    issue_number: number
    reactions: number
    days_open: number
    maintainer_responded: boolean
    title: string
  }>

  // Theme clustering (NLP on issue titles)
  recurring_themes: Array<{
    theme: string                      // "new architecture", "babel config"
    issue_count: number                //  "expo build", "typescript"
    is_resolved: boolean
  }>

  // Trend
  issues_opened_30d: number
  issues_closed_30d: number
  momentum: 'improving' | 'stable' | 'degrading'
}
```

### PR Quality Signals

```typescript
interface PRIntelligence {
  open_count: number
  merged_30d: number
  closed_unmerged_30d: number         // rejected or abandoned PRs

  // Maintainer engagement
  avg_first_review_days: number       // days to any maintainer comment on PR
  avg_merge_days: number              // days from open to merge
  community_prs_merged_rate: number   // % of external PRs that get merged

  // Who is contributing
  bot_pr_pct: number                  // dependabot/renovate noise
  core_team_pct: number               // maintainers writing their own PRs
  community_pct: number               // external contributors

  // Red flags
  good_prs_rotting: number            // PRs with positive reviews but no merge
  stale_prs_count: number             // PRs >90 days old with no activity
}
```

### WatermelonDB â€” The PR/Issue Intelligence Example

```
WATERMELONDB ISSUE INTELLIGENCE (2026):

Open issues:              ~29 (as of latest data)
Bridgeless (New Arch) issue: #1769
  Reactions:    28+
  Age:          14+ months
  Response:     No maintainer resolution
  Theme:        "new architecture" â€” recurring across 8+ issues

Self-closed issues:       Multiple users "giving up"
"Is this maintained?":    Present in recent issues
High-reaction unresponded: #1769 is the critical example

WHAT THIS TELLS YOU:
  The number "29 open issues" = ASSESS signal
  The quality "28-reaction New Arch issue
  unresponded for 14 months" = HOLD signal
  
  This distinction is only visible with PR/issue intelligence.
  No other tool surfaces it.
  RN Terrain does.
```

---

# PART THIRTY-THREE â€” CHANGELOG INTELLIGENCE

## Three-Tier Changelog Consumption

Every package has a history. That history tells you
where it's been, where it's going, and what's breaking.

```
TIER 1 â€” CHANGELOG.MD PARSING
  Source: GitHub API contents endpoint
  Parse semver sections (## [0.28.0], ## 0.27.x)
  Extract per version:
    Breaking changes      â†’ âš  BREAKING keyword
    Deprecations          â†’ ðŸš« DEPRECATED keyword
    New features          â†’ âœ¨ FEAT keyword
    Bug fixes             â†’ ðŸ› FIX keyword
    New Arch mentions     â†’ any "new architecture", "JSI", "Fabric"
    Architecture changes  â†’ "babel", "bridge", "native"
  
  Show: last 3 versions summarized
  Link: full changelog

TIER 2 â€” GITHUB RELEASES API
  Structured data per release tag
  More reliable than parsing markdown
  Gives: release date, author, release notes, assets
  Pre-releases visible: beta, rc, canary
  
  Pre-release presence signals:
    Has 'next' tag         â†’ active development
    Has 'beta' tag         â†’ upcoming changes to track
    Has 'canary' tag       â†’ bleeding edge
    Last release is rc     â†’ V1 or major version imminent

TIER 3 â€” NPM DIST-TAGS
  latest, next, beta, canary, legacy
  Shows what channels exist and their versions
  Example: { latest: "3.2.1", beta: "4.0.0-beta.3" }
  The gap between latest and beta = preview of what's coming
```

### Changelog Intelligence for VitalityCard

```typescript
interface ChangelogIntelligence {
  last_3_releases: Array<{
    version: string
    date: string
    summary: string               // 1-2 sentence parsed summary
    has_breaking_changes: boolean
    has_deprecations: boolean
    has_new_arch_mention: boolean
    has_babel_mention: boolean    // legacy arch signal
    full_notes_url: string
  }>

  pre_release_channels: {
    beta?: string                 // e.g. "4.0.0-beta.3"
    next?: string
    canary?: string
    rc?: string
  }

  breaking_change_frequency: number // avg versions between breaking changes
  last_breaking_change_version: string
  last_breaking_change_date: string

  key_events_from_changelog: Array<{
    version: string
    event_type: string            // 'new_arch_added' | 'babel_deprecated'
                                  // 'jsi_experimental' | 'legacy_removed'
    description: string
    date: string
  }>

  changelog_url: string           // direct link always
  releases_url: string            // GitHub releases page link
}
```

### WatermelonDB Changelog Intelligence Example

```
WATERMELONDB CHANGELOG INTELLIGENCE:

Last 3 releases:
  v0.28.x  Attempting New Arch support â€” babel plugin deprecated
           âš  has_babel_mention: true
           âš  has_new_arch_mention: true (attempt, not confirmed)
           Issues reported: JSI mode broken on RN 0.76+

  v0.27.x  Rewrite to Objective-C/Java from Swift/Kotlin
           Breaking: bridge architecture change
           Reason: "Swift doesn't play nicely with JSI/New Arch"
           has_breaking_changes: true

  v0.26.x  Transition release â€” both implementations present
           Experimental new bridge
           has_breaking_changes: true

KEY EVENTS FROM CHANGELOG:
  "Babel plugin deprecated â€” no longer necessary"
  "Rewrite to ObjC/Java â€” Swift incompatible with JSI"
  "JSI experimental flag added"

SIGNAL THIS CREATES:
  3 consecutive releases with breaking changes
  attempting New Arch but not landing cleanly
  Babel story officially deprecated but
  issues show developers still hitting it
  
  = ASSESS to HOLD trajectory
  The changelog tells the architectural struggle story
  better than any single metric.
```

---

# PART THIRTY-FOUR â€” FINANCIAL TRANSPARENCY SIGNAL

## Open Financials as a Trust Signal

Zig Language Foundation publishes their financials openly.
Some projects use Open Collective which is fully transparent.
This is a trust signal that no other package tool tracks.

```
financial_transparency:
  "open_collective_public"
    â†’ OC shows income, expenses, backers publicly
    â†’ Anyone can see if the project is financially healthy
    â†’ API: opencollective.com/api/v1/:slug

  "github_sponsors_public"
    â†’ GitHub shows sponsor count (not amounts)
    â†’ Existence of sponsors = community investment

  "foundation_audited"
    â†’ Formal nonprofit with annual financial reports
    â†’ Linux Foundation, Apache, PSE, etc.
    â†’ Highest trust signal

  "self_reported"
    â†’ Maintainer posts their own financial status
    â†’ Marak's "Fortune 500 companies" post was this

  "none"
    â†’ No public financial data
    â†’ Default for most packages

HOW IT AFFECTS THE CARD:
  Corporate backed + no financial data = fine (expected)
  Unfunded solo + no financial data = ðŸ†˜ CTA prominent
  Open Collective public = ðŸ’› link shown
  Foundation audited = ðŸ›ï¸ symbol shown
  High OC income but declining = interesting signal
    (money coming in, but is the work still happening?)
```

---

# PART THIRTY-FIVE â€” MAINTAINER PROFILE INTELLIGENCE

## Tracking the Human Behind the Package

The maintainer is not just a name in a README.
They are a signal source. Their activity across
GitHub, social media, and the ecosystem tells you
whether a package has a future.

### What We Track Per Maintainer

```typescript
interface MaintainerProfile {
  github_handle: string
  name: string
  website_url?: string
  twitter_handle?: string
  codeberg_handle?: string          // like Radek's mirror
  email?: string                    // from npm package if public

  // Activity signals
  github_last_active_at: string     // any public GitHub activity
  github_repos_active: number       // repos with recent commits
  still_in_rn_ecosystem: boolean    // any RN-related activity

  // Affiliation signals
  current_affiliation?: string      // company/org from GitHub profile
  left_original_org?: boolean       // e.g. Radek left Nozbe
  now_independent?: boolean         // went solo

  // Consistency signals
  mirrors_to_codeberg: boolean      // detaching from GitHub dependency
  has_consulting_page: boolean      // monetizing expertise externally

  // Package-specific
  packages_maintained: string[]
  is_primary_maintainer: boolean
  contribution_pct: number          // their % of all commits
}
```

### The Radek Pattern

```
RADEK PIETRUSZEWSKI â€” MAINTAINER PROFILE:

github_handle:        radex
still_in_rn:          YES â€” consulting page active, RN perf specialist
left_nozbe:           YES â€” went independent
codeberg_mirror:      YES â€” signal of GitHub dependency awareness
has_consulting_page:  YES â€” radex.io/about
current_affiliation:  Independent consultant

WHAT THIS TELLS RN TERRAIN:
  Radek didn't disappear. He left Nozbe.
  WatermelonDB is Nozbe's repo now, not primarily Radek's.
  Radek is still in the RN ecosystem but no longer
  the primary driver of WatermelonDB's roadmap.

  This is different from "maintainer hit the bus."
  This is "original author transitioned to advisor/consultant."
  The bus factor risk is now: does Nozbe still prioritize
  WatermelonDB, or is it running on inertia?

  The open issues suggest: running on inertia.
  The Nozbe GitHub shows it's "updated" (29 issues)
  but resolution rate is low.

  VERDICT: ASSESS trending toward HOLD
  Not because Radek left â€” because New Arch support
  is genuinely broken and nobody is fixing it fast enough.
```


