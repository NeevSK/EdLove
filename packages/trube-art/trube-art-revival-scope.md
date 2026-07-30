# Trübe-Art — Revival Scope & Rationale (SSOT)

**Status:** Draft v0.1 — for review
**Owner:** Naveen
**Relationship to original design:** This is a *narrower, revised* scope, not a continuation of the original three-tier vision. See §1 for exactly what changed and what didn't.

---

## 1. What actually changed since abandonment (honest accounting)

Trübe-Art was originally scoped as a triple-tier rendering library — native C++ (Vulkan/Metal), WebGPU, and Skia fallback — abandoned around March 2026 due to: agents being weak at C++, the triple-tier visual-parity problem being effectively an unsolved custom-compiler project, and an 8.6–16ms frame budget that felt infeasible given the plumbing overhead of the era.

**What has genuinely changed, verified this session:**
- A real, working test proved that **authored images/icons can be composited with a procedural shader background, using nested SkSL shaders, on Skia alone** — real image loaded, real shader compiled against real Skia (CanvasKit/WASM), real pixel output produced (`composite-render-test.png`). This directly answers a specific creative need voiced this session: that pure procedural noise reads as atmospheric, not as "rich, detailed, organic" — the missing ingredient was compositing *authored* content with procedural effects, not more/better noise.
- Plumbing/timing overhead (JS↔native marshalling) was already established as solved in the earlier nav-shapes conversation (Reanimated shared values + `useFrameCallback`, near-zero cost) — this applies equally here, though it was not re-tested today specifically for shader uniform updates at animation speed.

**What has NOT changed, and is not addressed by today's test:**
- The triple-tier visual-parity problem (making Aurora/Silk/etc. look identical across native Vulkan/Metal, WebGPU, and Skia SkSL) remains completely unsolved. Nothing today touches this.
- Native C++ (`TrubeCore.cpp`, Tier 1) authoring difficulty for agents is unchanged.
- Today's test ran in Node.js against CanvasKit-WASM, **not** on an actual Android device via `@shopify/react-native-skia`. On-device GPU performance, frame timing under animation/gesture load, and touch integration are unverified.
- The full original Surface library (Aurora, Silk, Young Leaf, Mist, Waterfall, Evening Sky, Skymorphic, Water Surface — 8 canonical surfaces) was not tested. One simple stand-in gradient-warp shader was tested, not the real design language.
- Motifs/Ornaments as a systematized library (per the original doc's "procedural vector-like sketches" and "micro-detail structural noise") were not built — one placeholder lotus-like PNG was used to prove the compositing *mechanism*, not to establish a real motif system.

**Conclusion: this is not a revival of the original three-tier vision.** It is validation of one specific technique (authored content + procedural background, Skia-only) that was always the recommended fallback-tier approach, even before this session. Treat this as confirming Tier 3 alone is more capable and more aesthetically viable than previously assumed — not as evidence the Tier 1/2 ambition is newly tractable.

---

## 2. Revised scope: what we're actually trying now

### 2.1 In scope now (the "positive space")

- **Skia-only** (Ganesh backend — stable, production-ready; Graphite/WebGPU explicitly not production-recommended as of this year, confirmed by multiple independent sources this session).
- **Compositing authored content with procedural backgrounds**, not procedural-only surfaces. The creative target: real icons, motifs, textures — things with intentional, specific detail — visually integrated with (not just placed on top of) a simple animated light-behavior background, using shader-level blending/tinting so the authored content reads as "lit by" the surface rather than pasted over it.
- **A small number of simple procedural backgrounds** (1–3 to start, not the original 8 Surfaces), good enough to serve as atmospheric support for authored motifs — not an attempt to rebuild the full original Surface design language yet.
- **Real on-device testing** as the immediate next step — today's proof ran on desktop CanvasKit; validating actual Android performance (frame timing, GPU load, especially on mid/low-end hardware per Gurudevi's real target devices) is unstarted and necessary before this is usable in the app.

### 2.2 Deliberately out of scope for now (the "negative space")

- Native C++ / Tier 1 (Vulkan/Metal via Nitro). Not attempted, not planned near-term.
- WebGPU / Tier 2 (`react-native-wgpu`). Same status.
- Cross-tier visual parity. Moot while only one tier is in use.
- The full 8-surface design language (Aurora, Silk, Young Leaf, Mist, Waterfall, Evening Sky, Skymorphic, Water Surface) as originally specified. May be revisited individually, later, once the basic compositing technique is proven on-device.
- A systematized Motif/Ornament library with multiple named motifs, jitter/variation logic, placement governance ("Scores" from the original doc). One placeholder image doesn't establish this — it proves the pipeline can carry real content, nothing more yet.
- Any performance claim beyond "compiles and renders once, offscreen, on desktop." No frame-budget number (the original 8.6–16ms target) has been re-validated for this narrower approach.

### 2.3 Boundary conditions — what would need to be true to expand scope later

- **To revisit Tier 1/2 (native/WebGPU):** would need a concrete reason Skia-only isn't sufficient for a specific real use case — e.g. an effect Skia's SkSL (GLSL ES2-locked, per Skia engineering confirmation) genuinely cannot express at acceptable quality. Not a default next step; a response to a specific limitation actually hit.
- **To expand the Surface library:** on-device performance of the current 1–3 test surfaces needs to be acceptable on real mid/low-end Android hardware first. Building more surfaces before validating the first ones perform is repeating the earlier overreach pattern.
- **To build a real Motif/Ornament system:** needs actual brand assets (a real lotus mark, not a placeholder), and a decision on where in Gurudevi this would first be used (a splash/loading moment, an achievement badge, a login screen — not yet decided).

---

## 3. Technical reference (verified this session)

- **`@shopify/react-native-skia@2.6.2`** — already installed in `gurudevi-mobile`, confirmed in the earlier nav-shapes grounding session. No new dependency needed to start.
- **Ganesh backend** — current stable default. **Graphite** (next-gen, brings WebGPU/3D composition via Google's Dawn) exists but is explicitly not production-recommended yet, confirmed by Shopify's own "Game On" initiative framing it as upcoming, not current.
- **SkSL capability**: supports image shaders (`ImageShader`, real bitmap sampling with cubic interpolation), nested/chained shaders (a `RuntimeEffect` can take other shaders as children via `makeShaderWithChildren`), and composite blending logic — all confirmed both via documentation and via this session's actual compiled-and-rendered test.
- **SkSL constraint, worth remembering**: locked to GLSL ES2 even on modern GPU backends (confirmed by a Skia engineer's direct statement) — meaning genuinely more limited than WGSL/modern GLSL ES3 for very complex chained effects. This is *why* Tier 1/2 existed in the original design, and remains the honest ceiling on how far Skia-only can go.
- **Real prior art for this compositing pattern**: a Compose Desktop glassmorphic-card shader example (blur + gradient + noise, composed as child shaders) was found as an independent, real-world validation of "procedural effects as a supporting layer under/around authored visual content" — the same structural idea as this session's test, built by someone else, for a different purpose, using the same Skia mechanism.

---

## 4. Files produced this session (proof artifacts, not production code)

- `TrubeMotifTest.tsx` — a real React Native component (untested on-device) implementing the composite technique, written for eventual use in `gurudevi-mobile`.
- `compile-test.js` / `full-composite-test.js` — Node scripts that actually compiled the SkSL and rendered real output via CanvasKit-WASM, proving the shaders are valid and the technique works end-to-end.
- `surface-render-test.png` — real rendered output of the standalone procedural background shader.
- `composite-render-test.png` — real rendered output of a placeholder lotus-like motif composited with the procedural background — the actual proof-of-concept image.
- `test-motif.png` — the placeholder authored-content asset used (not real brand artwork).

These are proof-of-concept artifacts. None of this has run on an actual device, and none of it is wired into the real app yet.

---

## 5. Immediate next step (not yet started)

Get `TrubeMotifTest.tsx` (or a close variant) running in the actual `gurudevi-mobile` Expo app, on a real Android device, to check:
- Does it actually render correctly via `@shopify/react-native-skia` (RN binding, not CanvasKit-WASM directly)?
- What's real frame timing during the surface's time-based animation, on representative mid/low-end hardware?
- Does the visual read as "rich/organic/detailed" in the way that motivated this exploration, once seen live rather than as a static PNG?

No further scope decisions (which surfaces, which motifs, where in the app) are recommended before this on-device check happens.
