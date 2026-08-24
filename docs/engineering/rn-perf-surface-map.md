---
title: "RN Performance Surface Map: Lists, Native Docs, and Overlooked Jank Sources"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [docs, engineering]
---

# RN Performance Surface Map: Lists, Native Docs, and Overlooked Jank Sources

Companion to `ui-thread-discipline.md`. That doc covers animation/gesture (UI-thread discipline). This one covers everything *adjacent* to that — lists, document handling, and the categories of jank that discipline alone doesn't fix.

---

## 1. List rendering — FlatList / FlashList v2 / LegendList

**Default decision tree:**

| Dataset | Use |
|---|---|
| < 300–500 items, simple rows | `FlatList` — zero dependency, fine as-is |
| 500+ items, general case | `FlashList` v2 |
| Aggressive/fast scroll where blank-cell flash is visible (chat feeds, live-updating grids) | `LegendList` |

**Why FlashList v2 specifically (not v1):** v1 required `estimatedItemSize` and did layout correction after an initial guess. v2 is a ground-up rewrite for the New Architecture — it measures items and computes exact positions synchronously via `useLayoutEffect`-style measurement before first paint, so it no longer needs size estimates at all. It also picked up masonry-grid support (`masonry` prop) natively.

**Why LegendList as the escape hatch, not the default:** it's built directly on Fabric + Reanimated and is more aggressive about eliminating blank cells during fast scroll — relevant for chat-style or live-updating UIs specifically. It's newer and less production-hardened than FlashList (which has years inside Shopify's own apps), so don't reach for it by default — reach for it when FlashList visibly flashes blank cells under your specific scroll pattern.

**Migration note:** LegendList's API is close enough to FlashList that in most cases it's a component rename. One behavioral difference to check: LegendList does **not** recycle items by default (FlashList does) — pass `recycleItems` explicitly if you need FlashList-equivalent recycling behavior.

**Universal rules regardless of library:**
- Always benchmark **release builds**. Dev-mode render buffers are intentionally smaller and will make any of these three look artificially slow.
- Confirm New Architecture (Fabric) is actually active before evaluating v2 — FlashList v2 will not run without it.
- `keyExtractor` stability matters more than people think — an unstable key defeats recycling regardless of which library you're on.

---

## 2. Native module path — Rust + UniFFI (confirmed direction)

You've already decided Rust over C++ for perf-critical native work (see `rn-native-perf.md` for the reasoning). The concrete tool for wiring Rust into RN:

**`uniffi-bindgen-react-native`** (Mozilla + Filament, MPL-licensed)
- Generates TypeScript + JSI/C++ bindings from a Rust crate, packaged as a Turbo Module.
- One Rust implementation, targets both iOS and Android.
- You annotate the Rust once (proc macros); it handles the FFI boundary generation.
- Workflow: `create-react-native-library` to scaffold the Turbo Module shell → point `ubrn` at your Rust crate → it generates the JS↔C++↔Rust plumbing.
- Real production usage exists (cited example: a chess-solving app using it for its search algorithm while prototyping UI in RN) — this isn't a toy/experimental tool.

**Threading model — this determines how you design every Turbo Module method, including your future Rust ones.** Per the Callstack guide's breakdown of the actual thread lifecycle:

| Call type | Runs on | Consequence for your Rust module design |
|---|---|---|
| Synchronous method (returns a value directly) | **JS thread** | Blocks JS entirely until it returns. A slow synchronous call — even a "quick" Rust computation that isn't actually quick — freezes the whole app's interactivity, not just that feature. |
| Void method (no return value) | Native Modules thread (`mqt_v_native` on Android) | Already off the JS thread by default. |
| Async method (Promise-returning) | Native Modules thread — but this thread is **shared across all native modules**, so a busy async call from one module can queue behind another's | For genuinely heavy Rust work (vector search, ML inference — your flagged future case), make the binding async and consider spinning up a dedicated thread if the shared pool becomes a bottleneck. |

**The rule this implies:** any Rust function you expose synchronously must be fast, full stop — not "usually fast," because a slow synchronous call doesn't just slow its own feature, it freezes every other interaction in the app for its duration. If there's any chance a Rust call could be slow (variable input size, cold cache, first-run cost), expose it as async from the start rather than optimizing later — changing a method from sync to async later is an API-shape change, not a quick fix.

**FFI boundary cost — relevant on Android specifically.** The guide's cost breakdown for crossing into C++ (which maps directly onto crossing into Rust, since both go through the same JSI/JNI paths):
- **iOS:** Objective-C↔C++ interop is compile-time, near-zero cost. Swift↔C++ interop is also near-zero (vtable-based, like C++ itself). Neither platform-side cost should meaningfully add up for a UniFFI-generated Rust binding.
- **Android:** JNI is the expensive one — each call requires a function lookup in a method table. The mitigation Turbo Modules use is restricting JNI to *module initialization only* — at runtime, JS holds a direct JSI reference to the native function and calls it without going back through JNI each time. **Check that your UniFFI-generated Android bindings follow this same pattern** (JNI at init, JSI direct-reference at call time) rather than routing every call through JNI — that's the difference between "a few extra μs at startup" and "overhead on every single call."

### View flattening — relevant if you build custom native components with children

Separate from Rust/UniFFI, but same "native layer" territory: React Native's Fabric renderer auto-flattens "layout-only" views (ones that don't render anything themselves) to reduce view-hierarchy depth. Usually a free win — except when you're building a **custom native component that expects a specific set of children** (relevant to your tab bar/FAB work if either ever wraps native-side children rather than being pure Skia canvas content).

**The trap:** if a child's own wrapper `View` gets flattened away, its grandchildren get hoisted up and passed to your native component directly — so a component expecting 3 children can silently receive 5. This breaks any native code that assumes JS child count matches the native children array.

**The fix:** `collapsable={false}` on any child where the count/identity passed to native code must stay stable:
```tsx
<MyNativeComponent>
  <Child1 collapsable={false} />
  <Child2 collapsable={false} />
  <Child3 collapsable={false} />
</MyNativeComponent>
```
Worth an explicit check if you ever build a native-side FAB/tab-bar variant that accepts RN children rather than drawing everything in Skia — debuggable via Xcode's View Hierarchy inspector or Android Studio's equivalent if child counts look wrong at runtime.

**This is the same pipe for any future native module** — PDF parsing, vector search, on-device ML inference. Build the Rust crate once, wire it through UniFFI once, and every future "this needs to be native" decision reuses the same integration path instead of a bespoke bridge each time.

---

## 3. Rust PDF parsing — crates worth evaluating

If/when PDF handling becomes a real feature (not hypothetical), these are current pure-Rust options to point UniFFI at:

- **`pdfsink-rs`** — pure-Rust extraction (text, word, line, table, layout, image, metadata). Claims 10–50x pdfplumber's speed on real-world PDFs. API deliberately mirrors pdfplumber's mental model (chars/lines/rects/words/tables), which matters if you or an AI assistant already has pdfplumber-shaped intuitions to port.
- **`pdf-inspector`** (Firecrawl) — lighter-weight: classifies a PDF as text-based/scanned/image-based/mixed in 10–50ms via content-stream sampling, then does position-aware text extraction without OCR for the ~54% of PDFs that don't need it. Good as a fast pre-filter before deciding whether a heavier extraction pass or OCR is needed.

Neither has RN bindings pre-built — you'd wire either through `uniffi-bindgen-react-native` yourself. Start with `pdf-inspector` if the near-term need is "detect + extract text," reach for `pdfsink-rs` if you need structured table/layout output.

---

## 4. Document viewing/editing (Word/Excel/PDF) — the honest feasibility picture

This is the one place the answer is "no clean SDK exists," worth stating plainly so it doesn't eat unplanned time later.

**What does NOT exist:** an embeddable client-side LibreOffice/OpenOffice rendering engine you drop into a mobile app. LibreOffice's mobile presence is:
- LibreOffice Viewer — Android-only, standalone app, view-focused with *experimental* editing. Not an SDK, not embeddable, no iOS build at all.
- Collabora Office — a standalone mobile app (LibreOffice-based), not an SDK either.

**What DOES exist, and is the actual embeddable path:** Collabora Online (COOL) — a **server-side** document engine. You self-host it (or use a hosted provider), and the client embeds a WebView pointing at that server, which streams a rendered/interactive view of the document. This is how Nextcloud and similar products do in-app document editing. It's a legitimate, proven path — but note what kind of cost it is:
- Infrastructure to run and maintain (a server component, not a client library)
- Network-dependent (no meaningful offline editing story)
- Categorically different tradeoff from everything else in this doc — this is an ops decision, not a perf/Rust decision

**Recommendation given your solo+AI setup:** full editable-office-suite embedding is likely the wrong scope to take on — it's server-ops burden more than engineering-perf work, and it's a different job than the rest of this doc. The more tractable, worth-actually-doing version is **render-only preview** for docx/xlsx (not editing) via lightweight parsing on the same Rust/UniFFI pipeline as the PDF work — i.e., extract and lay out content yourself rather than embedding someone else's rendering engine. Full editing, if ever needed, is a "go find/evaluate Collabora Online hosting" decision made separately, later, with its own cost analysis — not something to architect for now.

---

## 5. Other jank sources UI-thread discipline doesn't cover

These aren't Rust/animation problems — they're separate categories worth a pass each:

### 5.1 Image decoding/downsampling — `expo-image` (current: v57.x)

**The actual problem:** RN's core `Image` decodes on the JS thread, has no persistent disk cache on Android, and decodes to full resolution regardless of display size — a 4000×3000 photo shown in a 60×60 avatar still pays full decode + memory cost.

**Fix: `expo-image`**, wrapping SDWebImage (iOS) / Glide (Android) — both decode off the JS thread and downsample toward the rendered size automatically. Android specifically gained automatic downsampling when an asset exceeds the hardware bitmap size limit.

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: photoUrl }}
  style={{ width: 300, height: 300 }}
  contentFit="cover"                  // CSS object-fit semantics
  contentPosition="top"               // keep faces in frame when cropping portraits
  placeholder={{ blurhash }}          // or thumbhash
  placeholderContentFit="cover"       // match contentFit or placeholder will pop/shift on load
  transition={{ duration: 250, effect: 'cross-dissolve' }}
  cachePolicy="memory-disk"
  recyclingKey={item.id}              // required in recycled list rows (FlashList/LegendList) — without it, images can flash the previous row's content during recycle
  priority="high"                     // for above-the-fold / hero images
/>
```

**Specifics worth getting right:**
- `recyclingKey` matters *specifically* because you're using FlashList v2 / LegendList — recycled rows reuse the underlying view, and without a stable key tied to item identity you'll see stale images flash before the new one loads in.
- `contentFit="none"` or `"fill"` **disables** the automatic downscaling — only `cover`/`contain`/`scale-down` get the memory win. Don't reach for `none`/`fill` without knowing you're opting out of this.
- Prefetch list-adjacent detail images with the static `Image.prefetch()` method — warms both memory and disk cache so navigation into a detail screen feels instant instead of re-decoding.
- Migrating off `react-native-fast-image`: it's mostly a rename, but `resizeMode` → `contentFit`, and `source.uri` collapses to just `source` with a plain string.

---

### 5.2 Font loading flash — `expo-font` config plugin (preferred) vs `useFonts` (fallback)

**The actual problem:** `useFonts` loads font files asynchronously at runtime — even gated behind `expo-splash-screen`, that's async work blocking your time-to-interactive, and on some Android configurations a flash-of-fallback-font can still slip through before the custom font swaps in.

**Fix: embed fonts at build time via the `expo-font` config plugin**, not `useFonts`. This bakes the font files into the native binary at build/prebuild time — no runtime load, no async gate, no flash, because the font is just *there* from first paint, same as a system font.

```js
// app.config.js
export default {
  expo: {
    plugins: [
      [
        "expo-font",
        {
          fonts: ["./assets/fonts/Inter-Regular.ttf", "./assets/fonts/Inter-Bold.ttf"]
        }
      ]
    ]
  }
};
```
Requires `npx expo prebuild` (or a new build) to take effect — config plugin changes aren't picked up by Fast Refresh.

**When `useFonts` is still the right call:** dynamic font sets you can't know at build time (user-selected fonts, CMS-driven typography, variable font axes chosen at runtime). In that case, pair it with `expo-splash-screen` exactly as the API intends — keep the native splash held with `preventAutoHideAsync()`, hide it only once `useFonts` resolves:

```tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;
  return <Stack />;
}
```

**The one mistake to avoid either way:** don't hide the splash screen the instant `loaded` flips true from a bare `useEffect` — hide it from the root view's `onLayout` callback instead, so the native splash stays up until the *first real frame* is actually laid out, not just until the JS-side "ready" flag flips. That gap is exactly where a blank-screen flash sneaks in between splash and first paint.

---

### 5.3 Context provider blast radius — Zustand for anything frequent, Context only for the rare stuff

**The actual problem:** React Context has no field-level selectivity — a component reading only `A` from `{A, B}` still re-renders on every `B` change, because Context broadcasts the whole provider value to every consumer on any update. Splitting into multiple contexts helps *between* domains, but not *within* one — a single context still re-renders every consumer on any field change inside it.

**Current guidance (2026, React 19-era):** stop trying to make Context do selective updates — it structurally can't. Use it only for what it's actually good at (rare updates, dependency injection); move anything with per-field or high-frequency updates to a selector-based store.

```
Context API  → theme, locale, auth session, feature flags — read by many, changes rarely
Zustand       → anything that updates often and only some consumers care per-update
```

**Zustand pattern** (react-native-compatible, no providers needed):
```tsx
import { create } from 'zustand';

const useUIStore = create<{ activeTab: string; setActiveTab: (t: string) => void }>((set) => ({
  activeTab: 'home',
  setActiveTab: (t) => set({ activeTab: t }),
}));

// Component only re-renders when activeTab changes — not on any other store field
const activeTab = useUIStore((s) => s.activeTab);
```
For object/array selections, wrap in `useShallow` so a new-but-equal object doesn't force a re-render:
```tsx
import { useShallow } from 'zustand/react/shallow';
const { a, b } = useUIStore(useShallow((s) => ({ a: s.a, b: s.b })));
```

**Jotai is the atomic-model alternative** (bottom-up atoms instead of a top-down store) — same structural fix (bypasses React's broadcast-to-all-consumers model, built on `useSyncExternalStore` under the hood), different mental model: define small independent atoms, subscribe to only the ones a component reads. Pick whichever mental model fits your codebase; both solve the same problem Context can't.

**Caution against over-applying this:** don't migrate your *whole* app's state to Zustand/Jotai "for performance" — if you're on React 19 with the compiler enabled, it already auto-memoizes a lot of the ordinary re-render cost, so a wholesale library migration can be solving a problem the compiler already solves. Reserve the Context→store move for state that's genuinely high-frequency or has the selectivity gap described above — not as a blanket default.

**If you keep something in Context anyway** (e.g. it's genuinely low-frequency but has multiple fields), apply the **split-context pattern**: separate the value and its updater/dispatch into two contexts. Components that only need to *trigger* an update (dispatch) don't need to re-render when the *value* changes.

**React Compiler note:** if you're on React 19 with the compiler enabled, it auto-inserts `useMemo`/`useCallback` at build time — this reduces the need for manual memoization and a lot of *ordinary* re-render cost, but it does **not** fix the Context selectivity gap itself for genuinely high-frequency state (a value updating every frame or on every keystroke). The compiler optimizes render cost broadly; it doesn't stop a broadcast-to-all-consumers re-render from being triggered by that specific class of state. So: let the compiler handle the general case, and reserve the Zustand/Jotai move for the specific state that's actually hot — not a wholesale migration, per the caution above.

---

### 5.4 Hermes bytecode precompilation — verify it's on, don't assume

**Current state:** since New Architecture is your baseline (Reanimated 4.x requires it), Hermes comes as the default engine — you almost certainly have it. The risk isn't "is Hermes on," it's **confirming you're actually shipping the precompiled `.hbc` bytecode**, not JS source that happens to run on a Hermes-capable runtime.

**Verify, don't assume:**
```
android/gradle.properties     → hermesEnabled=true
ios/Podfile                   → :hermes_enabled => true (inside use_react_native!)
```
This flag has existed since RN 0.71; if it's absent your build may be silently falling back. If you're on a non-standard bundle-loading setup, the React Native docs explicitly flag that `HermesInternal` can be present at runtime **without** you actually being on the precompiled `.hbc` path — check the bundle format itself, not just engine presence:
```bash
hbcdump bundle.hbc   # confirms it's valid Hermes bytecode, not source being interpreted
```

**What precompilation actually buys you, concretely:** 25–50% TTI improvement on real devices (skips parse→AST→compile happening on-device at cold start — that work already happened at build time), and Hermes bytecode typically runs 10–30% smaller than the equivalent minified JS, which also shrinks your binary.

**One thing worth knowing about, not acting on yet:** Meta is developing **Static Hermes** — an experimental AOT compiler that emits native machine code instead of bytecode, aimed at near-native speed for compute-heavy JS. Still experimental; not something to architect around today, but worth a check-in in 6–12 months given how much of your perf story already leans on "push work as close to native as possible."

**Practical check for your build:** run a release build, confirm `hermesEnabled`/`hermes_enabled` are set on both platforms, then diff cold-start time against a JSC build once to confirm the win is landing — don't just trust the flag, verify the number moved.

---

### 5.5 Startup splash-to-first-frame gap — measure it properly, don't eyeball it

**The actual problem:** the native splash screen hides the real cost. It disappears the instant your JS-side "ready" flag flips (per §5.2's pattern), but "ready" and "the user can actually interact" aren't the same moment. Worse — **the boot state itself skews any measurement you take**: cold, warm, hot, and prewarmed starts give wildly different timings (iOS even ML-prewarms apps based on usage patterns, launching up to 40% faster). If you measure TTI without isolating cold-boot state specifically, you get numbers with no signal on whether you actually regressed or improved anything — a "faster" reading might just be a prewarmed run. Always measure cold boot only, and exclude the others.

**Instrumentation — the full pipeline, not just app-ready:** the more precise breakdown is five stages, each with its own native markers:
- Native Process Init — `nativeAppStart` / `nativeAppEnd`
- Native App Init — `appCreationStart` / `appCreationEnd`
- JS Bundle Load — `runJSBundleStart` / `runJSBundleEnd`
- Root View Render — `contentAppeared`
- React App Render (true interactive point) — `screenInteractive`

`react-native-performance` (oblador) exposes these via a native `RNPerformance` class on both platforms:
```swift
// iOS
RNPerformance.sharedInstance().mark("myCustomMark")
```
```kotlin
// Android
RNPerformance.getInstance().mark("myCustomMark")
```
This gives you which *stage* is slow — native init, bundle load, or React render — rather than one lump TTI number that tells you nothing about where to look.

`@shopify/react-native-performance` is the complementary tool for the React-tree side specifically — `PerformanceProfiler` + `useProfiledNavigation` measure render-to-interactive per screen and per navigation transition, which the native markers above don't cover on their own. Use both: native markers for the boot pipeline, Shopify's for in-app screen/navigation TTI.

**Set numeric targets, not vibes** — but hold them loosely. Reasonable 2026 bars for a New-Architecture app: cold TTI under ~2.0s on mid-tier Android / ~1.2s on recent iPhone, 58+ fps sustained scroll on your 99th-percentile device, under ~100ms tap-to-feedback. That said — don't over-invest chasing the last few hundred ms without checking your actual users' behavior data first; the gap between "good enough" and "months of engineering time for 0.6s" is a real tradeoff, not just an optimization target to hit blindly.

**What to check when the gap is real:** the usual causes are the same items already in this doc — synchronous work in your `prepare()` before `SplashScreen.hideAsync()` (auth restore, settings read, initial data fetch) that could be deferred past first paint instead of gating it, and images/fonts loading in *after* first frame instead of being ready for it (§5.1/§5.2 again — this is the item where all four earlier sections actually converge).

**One habit worth keeping:** profile on your actual worst-supported device tier, not your dev phone — the RapidNative-style "mid-tier Android, Pixel 6a class" bar is the honest target, and a flagship dev phone will hide problems your real users hit.

---

## 6. Native memory leak hunting

**iOS — Xcode Instruments, "Leaks" template:** build in release mode, `Product > Profile > Leaks`, record while reproducing the suspected leak path (a screen navigation, a button press). A confirmed leak shows the responsible library/frame plus a full stack trace down to the exact leaking function — e.g. a C++ allocation on the heap that never got `delete`d. Fast path from "something's leaking" to "this exact function is leaking."

**Android — Android Studio Profiler:** `Profile > Track Memory Consumption`, watch the live allocation graph. The classic RN-adjacent leak pattern: `MainActivity` gets recreated on every configuration change (rotation, dark-mode toggle — note RN opts out of this by default via `android:configChanges`, but native-side code you write may not), and if any singleton (an event bus, a listener registry) holds a reference to the old `Activity` instance without removing it, each recreated instance leaks. Visible in the profiler as N allocations, 0 deallocations for the same class.

**LeakCanary** (Square, debug-only Android dependency) automates JVM-heap leak detection at dev time — unreleased context references, coroutines outliving their module, listeners never removed:
```gradle
dependencies {
  debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'
}
```
**Real limitation worth knowing before you rely on it:** LeakCanary only sees the JVM heap. Leaks in the JSI/C++ layer of a Turbo Module — which is where your Rust/UniFFI modules live — are invisible to it, and it has zero visibility into the JS side. It's a solid first line of defense for the Kotlin/Java side of native modules specifically, not a general-purpose safety net. For anything in your Rust layer, you're back to Xcode Instruments/Android Studio's native profiling, not LeakCanary.

---

## 7. Bundle size — JS bundle and app bundle

**The RN-specific twist on bundle size:** most web bundle-size advice (code splitting, minimizing initial download) doesn't translate directly, because Hermes moves the "load into memory" and "parse" steps to *build time* — the JS bundle ships as precompiled bytecode already sitting in the app package, not something downloaded and parsed at runtime like a web app. What still matters: bytecode size affects app download/install size, and **more JS executing on the init path directly costs TTI** — and if that JS pulls in Turbo Modules on the way, it also defeats their lazy-loading (Turbo Modules init on first JS call, not eagerly — unnecessary imports on the init path force them to initialize early for nothing).

**Tools to actually see what's in your bundle:**
- `source-map-explorer` — bundle it yourself (`npx react-native bundle --dev false --minify true --sourcemap-output ...`), then `npx source-map-explorer output.js --no-border-checks` for a visual breakdown. The `--no-border-checks` flag is required because Metro produces invalid column/line mappings — worth knowing you can lose up to ~30% of mapping info this way, hiding some opportunities.
- **Expo Atlas** (Expo projects) — `EXPO_UNSTABLE_ATLAS=true npx expo start --no-dev` then `npx expo-atlas`. Tighter Metro integration, less mapping loss than source-map-explorer.
- If you're on Re.Pack/Rspack instead of Metro: `rspack build --analyze` (webpack-bundle-analyzer under the hood), or `bundle-stats`/Statoscope/Rsdoctor for deeper diffing between builds over time.

**Barrel exports — the thing most likely costing you silently.** An `index.ts` re-exporting a whole folder means Metro includes *everything* in that barrel file in your bundle even if you only import one thing from it — and at runtime, all of it gets evaluated before your one import resolves, which is direct TTI cost, not just download-size cost. Fix: import from the specific file (`import Button from './components/Button'`) instead of the barrel (`import { Button } from './components'`), or lean on tree shaking if your bundler supports it:
- **Expo SDK 54+**: tree shaking (including barrel-import optimization) is on by default.
- **Metro** (non-Expo): no native tree-shaking — `metro-serializer-esbuild` (rnx-kit) is the workaround, letting ESBuild take over bundling.
- **Re.Pack/Webpack/Rspack**: full tree-shaking support natively.

One more free win if you're on Metro/Expo: **platform shaking** — code gated behind `Platform.OS === 'ios'` (imported directly from `react-native`) gets stripped from the Android bundle entirely, and vice versa. Only works if `Platform` is imported directly from the `react-native` package, not re-exported through your own wrapper.

**Android app size — R8 (not ProGuard).** Since RN 0.60+, R8 replaced ProGuard as the default Android shrinker/obfuscator (faster, Kotlin-compatible). Confirm it's actually on:
```gradle
// android/app/build.gradle
def enableProguardInReleaseBuilds = true   // sets minifyEnabled true on release
```
(Expo: wire `android.enableMinifyInReleaseBuilds` via `expo-build-properties` so it survives `expo prebuild`.) Cited real-world result from the book: a 9.5MB sample app dropped to 6.3MB with default rules — a 33% reduction; expect a smaller but still real win on a larger app. Pair with `shrinkResources true` in the same release block once `minifyEnabled` is on — resource shrinking only works alongside code shrinking, not standalone. If a dependency breaks post-shrink (assumes specific class names survive), add a targeted `-keep` rule in `proguard-rules.pro` rather than disabling minification wholesale.

---

That closes the jank-source list plus the bundling/memory pass. Both docs together — `ui-thread-discipline.md` (animation/gesture) and `rn-perf-surface-map.md` (lists, native docs, jank categories, native modules, memory, and bundling) — form the full picture for now.
