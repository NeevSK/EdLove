# Polymath Platform Design Reference

> **Active Ecosystem Reality (2026-11).**  
> The shared design doctrine is the **World Engine** in `@repo/ui/theme` (11 concrete worlds, recipes, contracts; legacy `Theme.ts` is retired), accompanied by fixed dimensional scales in `@repo/ui/tokens`. Owned component primitives live in `@repo/ui/components/native` (Expo 58 / React Native 0.88 New Arch) and `@repo/ui/components/web` (Vite + React DOM). The web application is `apps/gurudevi-web` (SPA), while public marketing pages live in `apps/gurudevi-public` (Astro static). How to build concretely within this system: see `docs/architecture/ui-kit-guide.md` and `.agents/skills/ui-kit/SKILL.md`.

---

## 1. Monorepo Surface Map

Before proposing visual changes, confirm which surface you are shaping:

| Surface | Framework / Technology | Purpose | Design Dialect |
| :--- | :--- | :--- | :--- |
| **`apps/gurudevi-mobile`** | Expo SDK 58 (RN 0.88 New Architecture) | Flagship mobile experience | Living sanctuary, tactile vellum, sacred calm, gesture-first, safe touch targets |
| **`apps/gurudevi-web`** | Vite + React + TanStack Router (SPA) | Sanctuary desktop & mobile web | Public sanctuary, responsive breathing space, 4-gear container layouts, foveal calm |
| **`apps/gurudevi-public`** | Astro (Static pages, selective React islands) | Marketing, journal, legal, SEO | Editorial, serene typography, narrative pacing, atmospheric depth |
| **`apps/sanctuary-api`** | Node.js / Hono | Headless platform spine | N/A (Data contracts & capability provider) |

---

## 2. Doctrine vs. Dialects: The 11 Worlds Engine

Do not force all surfaces into a single identical theme, nor allow arbitrary unconstrained hex colors. The platform splits visual governance into two strict tiers:

### Tier 1: House Doctrine (The Non-Negotiables)
Owned by `@repo/ui/tokens`, `@repo/ui/theme/contracts.ts`, and `@repo/ui/components/native|web`:
- **Fixed Dimensional Scales:** 4px spacing grid (`space-0` through `space-16`), border radii (`radius-sm` through `radius-pill`), and touch targets ($\ge 48\text{px}$ for all interactive elements).
- **Mobile-First Continuum & A11y Gate:** WCAG AA/AAA contrast ratios, keyboard focus rings (`focus-visible`), reduced-motion fallbacks, zero viewport overflow, and touch ergonomics.
- **Material Logic:** Living vellum/palm-leaf surface depth, inner luminosity rather than flat grey borders, and zero-plastic aesthetics.
- **The 6 Extended UI Kit Laws:**
  1. *Inter vs. Intra Spacing:* Structural container separation must always exceed interior element spacing.
  2. *4 Discrete Degradation Gears (@container):* Components must adapt to container width, not fragile viewport media queries:
     - **Gear 3 ($\ge 520\text{px}$):** Expanded layout, rich metadata, secondary actions, horizontal metrics.
     - **Gear 2 ($380\text{--}519\text{px}$):** Balanced single/double-column, condensed chips, text truncation with foveal focus.
     - **Gear 1 ($320\text{--}379\text{px}$):** Vertical stacking, minimal metadata, tap targets $\ge 48\text{px}$, icons with compact text.
     - **Gear 0 ($< 320\text{px}$):** Ultra-narrow fallback, minimal text, stacked full-width controls.
  3. *Vector Cognition:* Use icons solely as semantic signposts with consistent optical weight, never as gratuitous ornament.
  4. *Zero-Drama Affordances:* Visual cues must indicate state clearly without jarring jumps, layout shifts, or noisy animations.
  5. *Contextual Orientation:* Foveal hierarchy ensures the user always knows where they are in a flow, what is happening, and what action comes next.
  6. *Compound Interactive Controls:* Keep actions close to their content (e.g. action rows, contextual toolbars) rather than dispersed at screen extremes.

### Tier 2: App Dialects (The 11 Worlds)
Owned by `@repo/ui/theme/worlds.ts` and resolved dynamically via `resolveWorld(id)`:
1. **`sanctuary`**: The prime devotional, calm, warm vellum baseline.
2. **`kele`**: Deep jungle foliage, canopy moss, verdant earth.
3. **`veli`**: Coastal sands, dry warmth, sunlit stone.
4. **`ganga`**: Flowing river water, fresh cool currents, dawn teal.
5. **`wewa`**: Ancient reservoir tranquility, still lotus depths, evening indigo.
6. **`colombo`**: Urban cadence, dusk graphite, maritime harbor warmth.
7. **`kandyan`**: Highland mist, sacred brass, temple wood, terracotta.
8. **`perahera`**: Festive night ceremonial procession, saffron torchlight, deep rubies, gold filigree.
9. **`tea`**: Misty mountain slopes, emerald tea leaf, morning dew.
10. **`ratna`**: Gemstone luminosity, deep sapphire, amethyst, radiant refraction.
11. **`rosa`**: Lotus dawn, gentle rose quartz, soft warmth.

---

## 3. Diurnal Circadian Rhythm (Temporal Aliveness)

The interface is not static; it breathes with astronomical time:
- The clock in `@repo/ui/theme/scene.ts` (`phaseAt(new Date())`) models dawn, morning, midday, afternoon, sunset, dusk, and night.
- Generates dynamic sky gradients and atmosphere opacities:
  - `--gd-sky-top`: Zenith hue shifting from midnight indigo $\rightarrow$ amber dawn $\rightarrow$ azure noon $\rightarrow$ crimson dusk.
  - `--gd-sky-horizon`: Atmospheric warmth near the ground plane.
  - `--gd-atmosphere-opacity`: Environmental mist density.
- Screens and shells (`sanctuary-shell.module.css`, mobile backgrounds) bind directly to these variables.

---

## 4. Tactile Materiality: Living Vellum vs. Synthetic Plastic

Commodity SaaS relies on sterile neutral grays (`#f3f4f6`, `#1f2937`) and harsh 1px borders (`#e5e7eb`). The Polymath Platform rejects synthetic plastic:

- **Surface Depth:**
  - Base cards use warm organic paper tones (`surface-canvas`, `surface-raised`, `surface-sunken`).
  - Subtle sub-surface micro-bevels: high-light top edge (`inset 0 1px 0 rgba(255,255,255,0.08)` in dark, `inset 0 1px 0 rgba(255,255,255,0.6)` in light) paired with gentle diffused drop shadows.
  - Paper pulp / vellum translucency: surfaces reflect the active world tint rather than dead monochrome opacity.
- **Foveal Contrast:**
  - High cognitive priority elements receive crisp ink contrast (`text-primary`, `gold/saffron` accents).
  - Secondary metadata (`text-secondary`, `text-tertiary`) recedes quietly, avoiding visual clutter.
  - Headers maintain clear elevation on scroll with zero layout shifts.

---

## 5. Practical Implementation Checklist

Before editing or proposing any UI:

1. **Check the Substrate:** Never invent raw CSS classes or hardcoded hex colors. Check `@repo/ui/tokens` and `@repo/ui/theme` recipes.
2. **Determine Doctrine vs. Dialect:** Is this change universal (doctrine $\rightarrow$ `@repo/ui`) or specific to an experience/world (dialect $\rightarrow$ world definition or screen composition)?
3. **Verify the 4 Gears:** Does this component degrade cleanly across G3 ($\ge 520\text{px}$), G2 ($380\text{px}$), G1 ($320\text{px}$), and G0 ($< 320\text{px}$)?
4. **Touch & Ergonomics:** Are all tap targets $\ge 48\text{px}$ with adequate padding?
5. **Cognitive Calm:** Does the screen feel like a serene sanctuary, or does it feel like a cluttered admin dashboard? If cluttered, enforce foveal grouping and strip non-essential visual noise.
