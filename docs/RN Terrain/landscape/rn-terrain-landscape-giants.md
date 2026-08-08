---
title: "RN Terrain - Landscape & Giants We Stand On"
status: "active"
created: 2026-08-05
updated: 2026-08-05
author: "Neev"
tags: [rn-terrain, landscape, ecosystem, existing-tools]
---

# RN Terrain — Landscape & Giants We Stand On
*Mapping the existing ecosystem and shoulders we climb upon*

---

> "If I have seen further, it is by standing on the shoulders of giants."
> — Isaac Newton

This document maps the existing React Native ecosystem tools, solutions, and platforms that RN Terrain builds upon, learns from, or complements. Understanding this landscape is crucial for:

1. **Avoiding reinvention** — Use existing solutions where they excel
2. **Strategic positioning** — Know where RN Terrain is truly unique
3. **Integration opportunities** — Build bridges instead of walls
4. **Humble recognition** — Honor the work that came before

---

# PART ONE — PACKAGE DISCOVERY & DIRECTORIES

## React Native Directory (Official)
**URL:** https://reactnative.directory
**GitHub:** https://github.com/react-native-community/directory
**Since:** 2017

**What it does:**
- Official searchable database of RN-compatible libraries
- Platform compatibility filters (iOS, Android, Web, Windows, macOS, Expo Go)
- Feature flags (hasExample, hasImage, hasTypes, hasNativeCode, config plugin)
- Quality score based on downloads, stars, maintenance status
- Public JSON API for programmatic access

**What RN Terrain learns:**
- **Data model inspiration** — Their platform/feature flags inform our Tier 2 signals
- **API as data source** — Can consume their API instead of scraping GitHub directly
- **Community baseline** — Their "maintained" flag is a useful sanity check

**What RN Terrain does differently:**
- **Temporal intelligence** — They provide snapshots; we provide rhythm and trajectory
- **Vendor intelligence** — They don't track Expo/SWM/Callstack direction
- **V1 readiness** — They don't score for New Architecture/V1 compatibility
- **Workflow integration** — They're web-based; we're CLI/MCP-first
- **5-domain scope** — They track packages; we track packages + tools + vendors + people + direction

**Integration opportunity:**
```typescript
// Use RN Directory API as baseline data source
const baseline = await fetch('https://reactnative.directory/api/libraries', {
  query: { name: 'react-native-reanimated' }
});
// Enhance with RN Terrain temporal signals
const enriched = addTemporalSignals(baseline);
```

---

## reactnative.solutions
**URL:** https://reactnative.solutions
**Focus:** Package health scores and comparisons

**What it does:**
- Health scoring based on popularity, recency, README presence, vulnerability alerts
- Side-by-side package comparisons
- Topic-based browsing (authentication, reanimated, image zoom, etc.)
- Package cards with detailed breakdowns

**What RN Terrain learns:**
- **Health score factors** — Their scoring factors inform our vitality algorithm
- **Comparison UI patterns** — Their side-by-side comparison approach for Bloom 2 web surface
- **Topic categorization** — Their topic taxonomy could inform our category system

**What RN Terrain does differently:**
- **Philosophy of orientation** — They show data; we explain "why"
- **CLI + MCP delivery** — They're web-only; we integrate into development workflow
- **Ecosystem scope** — They cover packages; we cover full terrain (tools, vendors, people)
- **Temporal depth** — They track recency; we track rhythm, Lindy effect, decay curves

**Integration opportunity:**
- Use reactnative.solutions as one of several health data sources
- Their web UI could complement our planned Bloom 2 web surface
- Cross-link from our VitalityCards to their detailed comparisons

---

# PART TWO — BUNDLE SIZE & PERFORMANCE ANALYSIS

## Bundlephobia
**URL:** https://bundlephobia.com
**GitHub:** https://github.com/pastelsky/bundlephobia
**Creator:** pastelsky

**What it does:**
- Measures npm package size impact (minified, gzipped, download time)
- Shows dependency tree and composition
- Historical size trends
- `package.json` scanning feature
- CLI tool: `bundle-phobia-cli`

**What RN Terrain learns:**
- **Bundle size as a signal** — Our Tier 6 "bundle_increment_bytes" field
- **Size anxiety is real** — Developers care about bundle cost
- **CLI pattern** — They prove CLI-first delivery works

**What RN Terrain does differently:**
- **RN-specific bundle cost** — Bundlephobia doesn't capture native code size (maps, Reanimated, Firebase)
- **Vitality context** — They measure size; we measure whether the size is worth it
- **Workflow integration** — Their CLI is standalone; ours is part of broader intelligence

**Integration opportunity:**
```typescript
// Include Bundlephobia data in Tier 6 signals
const bundleSize = await bundlephobia.check(packageName);
vitalityCard.bundle_increment_bytes = bundleSize.minified;
vitalityCard.download_time_3g = bundleSize.downloadTime['3g'];
```

---

## Expo Atlas
**URL:** https://github.com/expo/atlas
**Creator:** Expo team
**Since:** SDK 51 (built-in)

**What it does:**
- Visualize Metro bundles on module level
- Shows dependency graph per platform
- Built into Expo dev server and export workflow
- Shareable `.expo/atlas.jsonl` files
- Real-time bundle monitoring during development

**What RN Terrain learns:**
- **Bundle visibility matters** — Expo built this internally before shipping it
- **Platform-specific differences** — Bundle size varies by iOS/Android/Web
- **Developer workflow integration** — Built into `expo start` and `expo export`

**What RN Terrain does differently:**
- **Cross-tool comparison** — Atlas is Expo-specific; we track all bundle analyzers
- **Historical tracking** — Atlas shows current state; we track bundle size over time
- **Package-level attribution** — Atlas shows modules; we attribute to packages

**Integration opportunity:**
- Track Atlas as a DX tool in our Domain 2 (Developer Tools Map)
- Use Atlas data for package bundle impact scoring
- Recommend Atlas in our "bundle analysis" tool category

---

## react-native-bundle-visualizer (Callstack)
**URL:** https://github.com/callstack/react-native-bundle-visualizer
**Creator:** Callstack
**Stars:** ~2K

**What it does:**
- Visualize Metro bundler output using source-map-explorer
- Shows which packages increase bundle size
- Works with React Native 0.72+ and Expo SDK 50+
- CLI: `npx react-native-bundle-visualizer`

**What RN Terrain learns:**
- **Bundle visualization is valuable** — Multiple solutions exist for a reason
- **Open source maintenance** — Callstack maintains this as community service
- **CLI-first approach** — No web UI, just terminal output

**What RN Terrain does differently:**
- **Intelligence layer** — They show bundle size; we explain whether it's worth it
- **Tool tracking** — We track this as one of many bundle analysis tools
- **Cross-platform comparison** — We compare this against Atlas, Bundlephobia, etc.

**Integration opportunity:**
- Include in our Developer Tools Map as a bundle analysis tool
- Use their approach for our own bundle impact signals
- Recommend alongside Atlas for non-Expo projects

---

# PART THREE — DEPENDENCY MANAGEMENT TOOLS

## taze
**URL:** https://github.com/antfu-collective/taze
**Creator:** Anthony Fu
**Weekly downloads:** ~500K

**What it does:**
- Modern dependency update checker
- Monorepo support (`-r` recursive)
- Filter by major/minor/patch (`taze major`, `taze minor`, `taze patch`)
- Per-package policies via config
- Works with pnpm/npm/yarn/bun
- Interactive mode

**What RN Terrain learns:**
- **Monorepo-first design** — Modern tools must support workspaces
- **Safety by default** — Only bumps within existing semver ranges unless explicitly asked
- **Config-driven policies** — Per-package rules are powerful
- **Maturity period concept** — Don't update to packages released <X days ago

**What RN Terrain does differently:**
- **Update intelligence vs update execution** — taze updates; we advise whether to update
- **Temporal scoring** — taze shows latest versions; we score version health over time
- **Ecosystem context** — taze doesn't know about RN New Architecture or V1 readiness

**Integration opportunity:**
```typescript
// Our Tier 3 "Update Intelligence" is inspired by taze
const versionHealth = {
  current_version: packageJson.version,
  latest_version: await npm.latest(packageName),
  version_lag: semver.diff(current, latest),
  update_safety_band: taze.getSafetyBand(packageName), // safe/caution/breaking
  maturity_period_days: daysSince(latest.published_at),
  last_major_bump_date: await npm.lastMajor(packageName)
};
```

---

## npm-check-updates (ncu)
**URL:** https://github.com/raineorshine/npm-check-updates
**Weekly downloads:** ~3M

**What it does:**
- Classic dependency updater
- Upgrades package.json to latest versions
- Semver range filtering
- Extensive CLI options
- CI-friendly (non-interactive mode)
- Widely adopted standard

**What RN Terrain learns:**
- **Standardization matters** — ncu is the de facto standard for a reason
- **CI integration** — Non-interactive mode is crucial for automation
- **Extensive filtering** — Power users need fine-grained control

**What RN Terrain does differently:**
- **Advisory vs execution** — ncu updates; we advise
- **RN-specific context** — ncu doesn't know about Expo SDK compatibility
- **Risk assessment** — ncu shows versions; we score update risk

**Integration opportunity:**
- Use ncu as the recommended update tool in our CLI
- Our "update safety band" signal can feed into ncu filtering
- Recommend ncu for CI pipelines, taze for local development

---

## npm-check
**URL:** https://github.com/dylang/npm-check
**Weekly downloads:** ~600K

**What it does:**
- Interactive dependency updater with TUI
- Unused dependency detection
- Color-coded output
- Global package support
- Interactive update mode

**What RN Terrain learns:**
- **Interactive UX matters** — TUI is more approachable than raw CLI
- **Unused dep detection** — Important for hygiene
- **Visual feedback** — Color coding helps quick scanning

**What RN Terrain does differently:**
- **Package health vs project hygiene** — npm-check finds unused deps; we score package vitality
- **RN-specific signals** — npm-check doesn't track native code compatibility

**Integration opportunity:**
- Recommend npm-check for project hygiene alongside our package intelligence
- Our MCP could integrate with npm-check for comprehensive dependency health

---

# PART FOUR — NEWSLETTERS & ECOSYSTEM INTELLIGENCE

## This Week In React
**URL:** https://thisweekinreact.com
**Creators:** Sébastien Lorber & Jan
**Subscribers:** 34K+
**Frequency:** Weekly

**What it does:**
- Weekly curated React and React Native news
- Deep dives into major releases (RN 0.87, React Navigation 8, etc.)
- Conference talk summaries
- Tooling updates (Metro, Worklets, etc.)
- TypeScript and JavaScript standards updates

**What RN Terrain learns:**
- **Weekly cadence works** — Developers will read one high-quality email per week
- **Human curation beats algorithms** — Seb and Jan's judgment is the value prop
- **Cross-ecosystem awareness** — RN doesn't exist in isolation from React, TS, Node.js

**What RN Terrain does differently:**
- **Personalized vs general** — They curate for everyone; we filter for your packages
- **Signal vs news** — They report what happened; we report what matters to you
- **Package-specific alerts** — They cover ecosystem news; we cover your specific dependencies

**Integration opportunity:**
- Use This Week In React as a source for our "Domain Direction" signals
- Their RN coverage could feed our vendor intelligence (Expo, Meta, SWM moves)
- Consider partnering for cross-promotion in Bloom 2

---

## Bytes
**URL:** https://bytes.dev
**Focus:** JavaScript and React ecosystem
**Frequency:** Twice weekly
**Style:** Entertaining, opinionated

**What it does:**
- JavaScript and React news with personality
- React Native coverage (new architecture, Expo SDK releases)
- Tooling updates and industry news
- "Main Thing" format for key stories

**What RN Terrain learns:**
- **Personality builds loyalty** — Bytes has a distinct voice
- **Frequency balance** — Twice weekly is frequent but not overwhelming
- **Story framing matters** — "Main Thing" focuses attention

**What RN Terrain does differently:**
- **Developer-specific vs general** — Bytes covers JS broadly; we cover your specific RN stack
- **Automated vs curated** — Their weekly digest is human-curated; ours is algorithmically personalized
- **Package-level alerts** — They cover ecosystem news; we alert on your specific packages

**Integration opportunity:**
- Monitor Bytes for RN-related news to feed our event streams
- Their RN coverage could inform our vendor direction tracking
- Learn from their email format for our weekly digest design

---

# PART FIVE — VS CODE EXTENSIONS

## React Native Tools (Microsoft)
**URL:** https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native
**Installs:** 6M+
**Creator:** Microsoft

**What it does:**
- Official RN debugging in VS Code
- Run React Native/Expo commands from Command Palette
- LogCat Monitor, Network Inspector
- Hermes debugging support
- Expo integration (Go, dev-client, web)
- iOS/Android/macOS/Windows debugging

**What RN Terrain learns:**
- **Official backing matters** — Microsoft's extension is the standard for a reason
- **Workflow integration** — Debugging + commands in one place
- **Platform breadth** — Supports all major RN platforms

**What RN Terrain does differently:**
- **Package intelligence vs debugging** — They debug; we inform dependency decisions
- **Vitality at point of edit** — They help you run code; we help you choose dependencies
- **Ecosystem awareness** — They don't track package health or vendor direction

**Integration opportunity:**
- Our VS Code extension (Bloom 2) should complement, not compete with, RN Tools
- Use their extension API for package.json hover cards
- Recommend our extension alongside RN Tools for complete DX

---

## React Native Companion
**URL:** https://marketplace.visualstudio.com/items?itemName=muku534.reactnative
**Features:** Device management, memory monitor, network monitor

**What it does:**
- Run apps directly from VS Code (no terminal)
- Device manager with wireless debugging
- Memory monitor with leak detection
- Network monitor (in-editor devtools)
- Screen mirroring and interaction

**What RN Terrain learns:**
- **Device management is pain** — Anything that reduces terminal friction wins
- **Memory leaks matter** — Real-time memory monitoring is valuable
- **Network debugging in-editor** — Developers hate switching tools

**What RN Terrain does differently:**
- **Dependency intelligence vs runtime debugging** — They debug runtime; we inform dependency choices
- **Package health focus** — They don't track whether packages are healthy

**Integration opportunity:**
- Track as a DX tool in our Developer Tools Map
- Our VS Code extension could show package health alongside their device management
- Cross-promote as complementary extensions

---

## React Native Package Checker
**URL:** https://github.com/sandipshiwakoti/vscode-react-native-package-checker
**Focus:** New Architecture compatibility

**What it does:**
- Check New Architecture compatibility in package.json
- CodeLens integration for status indicators
- Package filtering and version requirements
- One-click updates

**What RN Terrain learns:**
- **New Architecture anxiety is real** — This extension exists for a reason
- **CodeLens integration** — Status directly in package.json is great UX
- **Compatibility checking is valuable** — Developers need to know what works

**What RN Terrain does differently:**
- **Broader vitality** — They check New Arch; we check full vitality (health, rhythm, vendor backing)
- **Verdict framework** — They show compatible/incompatible; we show ADOPT/TRIAL/ASSESS/HOLD
- **Ecosystem context** — They don't track vendor direction or key person signals

**Integration opportunity:**
- This is closest to our planned VS Code extension
- Could collaborate or merge efforts
- Their New Arch checks could complement our V1 readiness scoring
- Consider this as a "Bloom 0" — something to integrate with rather than rebuild

---

# PART SIX — THE GIANTS' SHOULDERS

## What We Build Upon

### Data Sources
- **React Native Directory API** — Baseline package metadata
- **npm registry** — Version information, download counts
- **GitHub API** — Stars, commits, contributors, issues
- **npm-stat.com** — Historical download trends

### Scoring Inspiration
- **taze** — Update safety bands, maturity periods
- **reactnative.solutions** — Health score factors
- **Bundlephobia** — Bundle size as a cost signal
- **React Native Directory** — Platform compatibility flags

### UX Patterns
- **This Week In React** — Weekly digest format
- **Bytes** — Personality and storytelling
- **taze** — CLI-first, monorepo-aware
- **React Native Tools** — VS Code workflow integration

### Philosophical Foundations
- **ThoughtWorks Technology Radar** — Our ADOPT/TRIAL/ASSESS/HOLD framework
- **Gartner Magic Quadrant** — Category positioning approach
- **Roadmap.sh** — Learning path concept for Bloom 3

---

# PART SEVEN — WHERE RN TERRAIN IS UNIQUE

## The Unfilled Gaps

### 1. Temporal Intelligence (Nobody does this)
- **Commit rhythm analysis** — Gaps between commits reveal more than recency
- **Lindy effect scoring** — Age as a stability signal
- **Decay curve tracking** — Packages don't just live or die; they decay
- **Event-driven alerts** — Subscribe to package-specific events

### 2. Vendor Intelligence (Nobody does this)
- **Expo/SWM/Callstack/Meta direction tracking** — Their roadmap IS the terrain
- **Key person radar** — ~20 weighted individuals whose signals matter
- **Conference signal extraction** — App.js, Chain React, RN EU talks
- **RFC and proposal monitoring** — What's being discussed signals future direction

### 3. V1 Readiness (Nobody does this)
- **New Architecture compatibility scoring** — Critical for post-0.84
- **Stable JS API compliance** — Whether packages follow the stable initiative
- **Legacy arch code detection** — What will break in V1
- **Migration path mapping** — What needs to change

### 4. Workflow Integration (Partial overlap)
- **MCP server for AI agents** — Claude Code, Cursor can call our tools
- **CLI-first delivery** — `rn-eval` in terminal during development
- **Package.json hover cards** — Intelligence at point of edit (planned Bloom 2)

### 5. Five-Domain Scope (Nobody does this)
- **Packages + Dev Tools + Vendors + People + Domain Direction**
- Full ecosystem topology, not just package directory
- Tools decay too — IDEs, CLIs, testing frameworks have vitality

### 6. Philosophy of Orientation (Unique approach)
- **Score is signal, breakdown is knowledge** — Always show the "why"
- **Not information, orientation** — Help developers decide, not just know
- **Personalized filtering** — Your packages, your terrain

---

# PART EIGHT — INTEGRATION STRATEGY

## Data Source Integration

```typescript
// Our data pipeline with existing sources
const sources = {
  baseline: reactNativeDirectoryAPI,     // Platform flags, quality score
  versions: npmRegistry,                  // Current, latest, versions
  downloads: npmStat,                    // Historical trends
  vitality: githubAPI,                   // Stars, commits, contributors
  bundle: bundlephobiaAPI,               // Size impact
  newArch: reactNativePackageChecker,    // Compatibility
  direction: thisWeekInReactRSS,         // Vendor moves
  community: bytesNewsletter,            // Ecosystem signals
};

// RN Terrain adds the intelligence layer
const intelligence = {
  temporal: analyzeRhythm(vitality),     // Commit gaps, Lindy effect
  vendor: trackDirection(sources),       // Expo/SWM/Meta roadmap
  v1: scoreReadiness(newArch),            // V1 compatibility
  scoring: weightedVitality(allSignals), // Our secret sauce
  verdict: generateVerdict(score),        // ADOPT/TRIAL/ASSESS/HOLD
};
```

## CLI Integration

```bash
# Recommend existing tools alongside our intelligence
npx rn-eval react-native-reanimated
# → Shows VitalityCard
# → Recommends: "Check bundle size with: npx react-native-bundle-visualizer"
# → Recommends: "Update with: npx taze minor" (if safe)
# → Recommends: "Monitor with: React Native Tools VS Code extension"
```

## Newsletter Integration

```typescript
// Our weekly digest could include:
const weeklyDigest = {
  yourPackages: [
    {
      package: 'react-native-reanimated',
      thisWeek: 'v4.5.0 released with New Arch improvements',
      source: 'This Week In React #289',
      action: 'Consider updating after 7-day maturity period'
    }
  ],
  ecosystem: [
    {
      event: 'Expo SDK 55 announced',
      impact: 'Your packages expo-screen-orientation, expo-av are affected',
      source: 'Bytes #467'
    }
  ]
};
```

---

# PART NINE — ACTION ITEMS

## Immediate (Research Phase)
- [ ] Interview React Native Directory maintainers about API usage
- [ ] Test taze's maturity period concept for our Tier 3 signals
- [ ] Evaluate reactnative.solutions health score algorithm
- [ ] Reach out to React Native Package Checker author about collaboration

## Short-term (Bloom 1)
- [ ] Consume React Native Directory API instead of scraping GitHub
- [ ] Integrate Bundlephobia data for bundle size signals
- [ ] Add CLI recommendations for existing tools (taze, ncu, bundle visualizers)
- [ ] Map This Week In React RSS to our vendor direction signals

## Medium-term (Bloom 2)
- [ ] VS Code extension that complements React Native Tools
- [ ] Web surface that cross-links with reactnative.solutions
- [ ] Weekly digest format inspired by This Week In React + Bytes
- [ ] Partner with existing newsletters for cross-promotion

## Long-term (Bloom 3)
- [ ] Become the intelligence layer that all these tools consume
- [ ] API that React Native Directory, reactnative.solutions, and others can use
- [ ] Community flywheel: we use their data, they use our intelligence

---

# CLOSING THOUGHT

The goal isn't to replace these tools. The goal is to be the intelligence layer that makes them all more powerful. When a developer uses:

- **React Native Directory** → We add temporal intelligence and V1 readiness
- **taze** → We add RN-specific context and risk assessment  
- **Bundlephobia** → We add whether the bundle cost is worth the vitality
- **This Week In React** → We add personalized filtering for their packages

We stand on their shoulders. They can stand on ours.

That's how ecosystems grow.
