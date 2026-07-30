# UI — Visual Design Reference

The visual material itself: typeface, scale, color, spacing, layout. Distinct from UX (behavior/cognition — see `03-ux-interaction-design.md`). Test for UI vs UX: a UI decision is answerable without describing behavior; a UX decision is answerable without a single pixel.

## Typography

- A type scale is a mathematical ratio (minor third 1.2, major third 1.25, perfect fourth 1.333), not favorite numbers — every step follows the same rule.
- Each zoom level of a semantic-zoom timeline (day/week/month/year label) can map to one step of the same scale — ties the visual system to the temporal structure directly.
- Choose typeface by role: grotesque/sans for data-dense/numeric, more humanist for long-form prose. Gurudevi mixes both (wellbeing stats + notes) — likely wants two families, not one doing both jobs.
- Hierarchy comes from weight, letter-spacing, alignment, and whitespace together with size — not size alone. Keep to 2–3 typefaces total; vary through weight/color instead of adding families.
- **Honest caveat:** type-scale ratios and whitespace rhythm are closer to print-history/cultural convention than biology — don't force a nature-justification here (see `00-biomimicry-principles.md`, "Where Biology Stops").

## Color

**Two separate systems, don't conflate them:**
1. Semantic tokens — named by intent (`background-surface-critical`, `text-subtle`, `action-primary`), mapping down to raw values
2. Data-viz palettes — deliberately ordered categorical hues for distinguishing data *series*, kept separate from UI semantic tokens

**Evidence-calibrated guidance (see full literature review below):**
- Hue-specific emotion claims (red=anger, blue=calm) are weak, contested, many-to-many, culturally contingent — don't design semantic tokens around folk hue-psychology
- **Brightness and saturation as valence levers are comparatively solid, cross-cultural, replicated implicitly** (Japan/Austria comparison): higher brightness → positive, lower brightness → negative; higher chroma/saturation → higher valence. Brightness has the stronger effect of the two.
- Never use color as the *only* signal — pair with shape/icon/position for colorblind users and bright-sunlight mobile viewing
- Contrast ratios (WCAG AA/AAA) are a hard constraint, not a preference — muted palettes often quietly break this

**Color history worth knowing (not just Goethe):**
- **Newton** — objective/spectral tradition, color as property of light
- **Goethe (1810)** — rejected Newton; color as observer-relational. His afterimage/opponent-pair observations were later *validated* by Hering's opponent-process theory (1878, confirmed via retinal/thalamic cell recordings — never-see-reddish-green is real neural architecture). His "moral effect of colour" chapter (yellow=cheerful, blue=melancholy) is the weaker, more contested part — his own contemporaries (Helmholtz, Schuster) flagged the slide from subjective report to universal-sounding claim within the same text. Read charitably: the plus/minus (warm-expansive/cool-receding) *polarity* survives as language; the granular hue-meanings don't hold up against modern cross-cultural data.
- **Munsell (1898–1915)** — separated hue/value/chroma as independent measurable axes, preferred notation over color names. This is the direct ancestor of modern design-token systems and the reason later research could even test which color variable (hue vs. brightness) actually carries signal.
- **Itten (Bauhaus)** — systematized color into seven contrasts: hue, light-dark, warm-cool, complementary, analogous/simultaneous, saturation, extension (proportion/area)
- **Albers (Bauhaus, Itten's successor)** — "color is the most relative medium in art" — a color has no fixed identity apart from what surrounds it (the same gray patch reads as genuinely different colors on different backgrounds — perceptual, not interpretive, involuntary)

**Most directly usable color principles for Gurudevi (Itten/Albers, not folk hue-psychology):**
- **Simultaneous contrast:** the same accent color will look/feel different depending on background — a status color on the "today" surface vs. the desaturated "archived past" surface may need deliberate compensation, not assumed consistency
- **Extension/proportion contrast:** how much *area* a color covers changes its perceptual weight independent of hue — a full-card color wash vs. a small dot indicator are different design decisions even with the same hex value

## Layout / Density

- Whitespace in data-dense interfaces is "compressed with discipline," not eliminated — actively allocated to create grouping/hierarchy
- When everything is emphasized, nothing is — one primary color/weight for what matters most, muted secondary for supporting elements

## Perceptual Biology — What's Actually Load-Bearing (not decorative)

Full detail and evidence tiers in `00-biomimicry-principles.md`. Summary of the strongest, most directly usable findings:

- **Occlusion** (depth cue) — strongest, most literal transfer found. Overriding, hardwired, present in infancy. Directly explains why modals/dropdowns/shadows work at all — not convention, exploiting a real reflex. Use elevation/shadow sparingly, reinforcing existing hierarchy, not as the sole signal.
- **Aerial perspective** — distant = lower contrast + desaturated, regardless of hue. Real justification for muting "past/archived" data visually (present = sharp/high-contrast, past = faded), not just a stylistic choice.
- **Gestalt grouping, precise hierarchy:** connectedness > proximity > similarity, in that order of strength (tested head-to-head, not equal). A literal container boundary beats spatial closeness beats color-matching for "read as one group."
- **Preattentive processing:** finite feature list (color, size, orientation, curvature, specific shape properties) triggers automatic <150ms detection. Anything outside this list must be consciously read, not seen. Visual system is much worse at detecting *absence* than *presence* — don't rely on a missing element being noticed; invert to a present, colored marker instead.
- **Subitizing:** 1-3 items perceived instantly without counting; beyond ~4 requires actual counting (converges with working-memory chunk limit, see UX doc).
- **Pareidolia:** fast (~80-100ms), automatic, present in infants/other primates — genuinely strong evidence, not soft. Any icon with two symmetric dots + a curve *will* read as a face involuntarily. Design that deliberately, don't let it happen by accident (esp. avoid an unintended "sad face" emerging from chart data or icon negative space).
- **Contrast sensitivity function:** peaks at mid spatial-frequency — very fine detail (hairlines, tiny icons) and very large flat blocks are both in real perceptual blind spots. Peripheral/edge-of-screen contrast sensitivity is measurably degraded vs. foveal — don't put important status indicators at screen edges away from primary reading focus.

## Corrections Made During This Exploration

- Initially under-rated pareidolia as "softer evidence" — corrected on closer literature review; it belongs in the strong tier.
- Color-emotion round was correctly flagged as weak going in — confirmed on review, with the brightness/saturation carve-out as the one solid finding.
