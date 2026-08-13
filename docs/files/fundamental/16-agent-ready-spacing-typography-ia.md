# Spacing, Typography & IA — Agent-Ready Specification

**This is the third of three layers.** `17-leverage-pattern-theory.md` covers the general, domain-agnostic theory (leverage points, Pareto Principle vs. Frontier, pattern language, biomimetic leverage). `18-leverage-applied-to-ui.md` translates that theory specifically to UI as a discipline. This doc is where both become concrete, tab-specific numbers — the practical output, not a standalone set of rules invented separately.

Not a philosophy doc — a lookup table. `15-visual-design-philosophy.md` explains *why*; this is *what number to actually use*, keyed to context, so an agent building a specific screen doesn't have to derive anything from first principles. If a rule here can't be checked by an agent without judgment, it doesn't belong in this doc.

## Step 1 — classify the screen into a density tier

Every screen in the app is one of three tiers. This is the single lookup an agent does first; everything else below is keyed to the answer.

| Tier | What it means | Which tabs/screens |
|---|---|---|
| **Calm** | Few items, one clear focal point, generous room, reflective/personal | Self tab (all wellbeing screens); Profile's identity/journey views |
| **Standard** | Familiar list/feed density, several items but not tabular | Community (feed, comments, DMs, groups); Library (browsing, map view); Profile settings lists |
| **Dense** | Tabular/administrative data, many rows/columns, information-dense by necessity | Workspace tab (gradebook, attendance, admin screens) |

**If a screen doesn't obviously fit one tier, default to Standard — never default to Dense.** Density should be an earned exception for genuinely tabular data, not a default.

## Step 2 — spacing (4dp base grid, fixed scale, no in-between values)

```
xs   4dp   — icon-to-label, inline gaps within one small element
sm   8dp   — within a group (e.g. stacked label + value)
md  16dp   — between related items in a list
lg  24dp   — between subsections
xl  32dp   — between major sections
2xl 48dp   — screen-edge margins, major transitions
3xl 64dp   — hero moments, empty states
```

**Never use a value outside this list.** No 12dp, no 20dp, no 28dp. The scale's discipline *is* the mechanism — arbitrary in-between values are exactly what erodes consistency over many independent agent sessions.

**Default "between items" gap, by tier:**

| Tier | Between-item default | Never go below |
|---|---|---|
| Calm | `lg`–`xl` (24–32dp) | `md` (16dp) |
| Standard | `md`–`lg` (16–24dp) | `sm` (8dp) |
| Dense | `sm`–`md` (8–16dp) | `xs` (4dp) — but never below this, even in tables |

**Section separation rule, all tiers:** use whitespace alone by default. A divider line is only added when two adjacent sections would otherwise be genuinely ambiguous (rare) — never as a default styling choice. If you're reaching for a line, first check whether more `lg`/`xl` gap solves it instead.

## Step 3 — typography (two separate scales: Content vs. Chrome)

**Content** = anything being read at length (wellbeing entries, library text, lesson material). **Chrome** = navigation, labels, buttons, table headers, admin UI.

```
CONTENT scale — base 16px, ratio 1.25 (major third)
  body      16px
  lead      20px
  h3        25px
  h2        31px
  h1        39px
  line-height: 1.5× at every size

CHROME scale — base 14px, ratio 1.2 (minor third, tighter)
  caption   12px
  body      14px
  label     17px
  h3        20px
  h2        24px
  line-height: 1.3× at every size
```

**Which scale applies, by tier:**

| Tier | Primary scale |
|---|---|
| Calm | Content scale throughout — even labels can lean toward the content scale; this is where typography should feel most generous |
| Standard | Content scale for actual text (posts, comments, descriptions); Chrome scale for nav/UI |
| Dense | Chrome scale throughout, including table body text — Content scale's larger sizes don't fit tabular data; legibility comes from consistent alignment and whitespace, not size |

**Age/reading-level adjustment:** where a screen's audience is confirmed to include early-grade students (student-citizenship, lower grade levels), bump Content scale up one full step (body becomes 20px, not 16px) and hold line-height at 1.5× or higher. Do not apply this bump to Chrome scale or to teacher/admin-facing screens.

## Step 4 — information architecture (chunk limits, concrete per tier)

Grounded in `03-ux-interaction-design.md`'s working-memory research (~4 genuinely-cohesive chunks, not a soft suggestion).

| Tier | Max chunks visible without scrolling | Focal element rule |
|---|---|---|
| Calm | 3–4 | Exactly one primary element must visually dominate; everything else recedes |
| Standard | 4–5 | One primary + supporting items, clearly subordinate by size/weight |
| Dense (tables) | N/A row-count — instead: max ~4 logical column-groups | Group related columns (e.g. "student info" vs. "grade columns") with a `lg` gap between groups, `sm` within a group |

**A "chunk" is a genuinely cohesive unit, not one component.** A stat card with a label, number, and trend arrow is one chunk, not three — the test is whether removing the visual grouping (proximity + shared container) would make it read as separate things. If it would, it's already one chunk correctly; if it wouldn't, the grouping isn't doing its job.

## Step 5 — icon/asset consistency (mechanical, checkable)

- One stroke weight for the entire app: **2px at a 24px grid.** Never per-icon variation.
- One corner radius for the entire app. Pick once, apply everywhere — do not vary by screen or tab.
- When an icon is needed at a different size (16px, 32px, 48px), use a size-specific drawing with corrected stroke weight — **never naively scale one SVG.** If only one drawing exists, 24px and 48px are the two sizes to prioritize having correct versions of; avoid 16px usage until a corrected version exists.
- Before shipping a new icon next to existing ones: apply the squint hack (blur eyes, compare weight) — if one looks heavier or lighter than its neighbors, adjust stroke/size until it doesn't, even if the math says they're already equal.

## Responsive scaling — closing a real gap in the scales above

Everything above (the spacing scale, the type scale) was specified as fixed values with no cross-device adaptation — a real, honest gap, since these screens must work across genuinely different device sizes. This section closes it, using the same closed-set enforcement principle already established, applied one layer earlier.

### The mechanism: a breakpoint-keyed lookup table, never a runtime formula

**A token is a name; its value is looked up from a small, fixed table keyed by breakpoint — never computed live by whatever consumes it.** This is standard, real practice (confirmed directly against NSW Government's public design system, Carbon, and Atlassian's spacing systems) — and it's the RN-appropriate version of what CSS `clamp()`/`vw` do on web, since React Native has neither. Two breakpoints are enough for this app's likely device spread — **compact** (phones, most of the current user base) and **regular** (tablets) — determined once at app launch from actual screen width, not re-derived per component.

**Concrete table, generated once from the existing scale via a simple doubling rule at the regular breakpoint** (matching the exact pattern found in NSW's public system):
```
Token   Compact (<768dp)   Regular (≥768dp)
xs      4dp                8dp
sm      8dp                16dp
md      16dp               24dp
lg      24dp               32dp
xl      32dp               48dp
2xl     48dp               64dp
3xl     64dp               96dp
```
An agent never computes any of these — it selects `sm` (or whichever token the Step 2 spacing rules from earlier in this doc already call for), and the *value* resolves from this table based on the active breakpoint. The ratio math lives in generating this table once; consumption is always a closed-set lookup, identical in spirit to the original spacing scale's own "never an in-between value" rule.

**Type scale gets the same treatment** — the Content/Chrome scales specified earlier are the compact-breakpoint values; a parallel regular-breakpoint table (generated via the same 1.25/1.2 ratios, one or two steps larger) covers tablets. The age-based bump for young-reader audiences applies as an *additional* named variant on top of this table, not a separate system.

### Not everything should scale — a real, deliberate distinction, not an oversight

**Border radius should very likely stay constant across breakpoints** — this is confirmed standard practice specifically for maintaining consistent brand identity regardless of device. Corner rounding is a visual-identity signal, not a density concern; changing it per breakpoint would work against the "one shape language everywhere" discipline already established for icons. **Column count and grid gutters, by contrast, genuinely should shift** — a single-column layout on compact, two-to-three columns on regular, with gutter width itself drawn from the same spacing table (`md`/`lg`), never an independent, arbitrary gutter value.

### Spacing can derive from type size, not just from its own independent scale

A secondary, real refinement: vertical spacing directly related to a block of text (paragraph spacing, spacing between a label and its value) can be expressed as a multiplier of the *active* type size (a 1.5–2.0× multiplier is the standard range) rather than an independently-chosen spacing token. This means the spacing automatically stays coherent when type size changes for any reason — including the age-based bump already specified — without needing a second, manual adjustment. This applies specifically to type-adjacent spacing; general layout spacing (between sections, between cards) stays governed by the breakpoint table above, not tied to type size.

## Step 6 — organic/decorative elements (where and how much, concretely)

- **Grain/texture-as-atmosphere:** applies globally, at low opacity (5–8% suggested ceiling), uniform across a screen. This is a background-layer decision, made once per tier's base surface, not a per-screen choice.
- **Filigree/composed motifs (leaf clusters, organic dividers):** restricted to **one signature location per screen, maximum.** A card corner, a section divider — never both, never repeated across every card on a list. If a screen already has one, no second location gets one, regardless of how good it looks in isolation.
- **Where filigree is allowed at all, by tier:** Calm and Standard tiers, yes. Dense tier (tables/admin), no — decorative elements do not belong in data-dense screens; save the visual personality for where it can breathe.

## Per-tab quick reference

| Tab | Tier | Type scale | Filigree allowed |
|---|---|---|---|
| Self | Calm | Content, +1 step if student audience | Yes, one location |
| Workspace | Dense | Chrome | No |
| Community | Standard | Content (posts) + Chrome (nav) | Yes, one location |
| Library | Standard | Content, +1 step if student audience | Yes — this is the tab's signature surface, per earlier exploration |
| Profile | Calm (identity) / Standard (settings) | Mixed per screen, follow the tier split above | Yes on Calm screens only |

## Open Questions / Not Yet Resolved

- The breakpoint-keyed value tables above are a reasoned proposal grounded in real industry precedent (NSW/Carbon/Atlassian), not yet validated against Gurudevi's actual device analytics — real usage data on the phone/tablet split in the Sri Lankan school market should confirm or adjust where the compact/regular line actually falls

- These exact numbers (spacing scale values, type ratios) are proposed, grounded in the philosophy doc and general design literature — not yet validated against a real built screen; the first implementation should be treated as a test of the numbers, not an assumption they're final
- Whether Workspace's Dense tier needs its own sub-tiers (a gradebook table vs. a single attendance-taking screen may have different real density needs) — flagged, not resolved
- The exact grain/texture opacity ceiling (5–8%) is a reasoned starting point, not sourced from a specific measured example — worth adjusting after seeing it rendered
