# Spatial Ergonomics: Viewport Surface Ratio (VSR) & Component Self-Measurement

## 1. The Core Spatial Formulas & Technical Metrics

When evaluating whether a UI element feels "too huge", "bloated", or "visually out of scale", subjective intuition translates to three mathematical formulas:

### A. Viewport Surface Ratio (VSR) / Screen Real-Estate Footprint
$$\text{Area}_{\text{vp}} = W_{\text{vp}} \times H_{\text{vp}}$$
$$\text{Area}_{\text{comp}} = W_{\text{comp}} \times H_{\text{comp}}$$
$$\text{VSR} = \left( \frac{\text{Area}_{\text{comp}}}{\text{Area}_{\text{vp}}} \right) \times 100\%$$

* **Guideline Thresholds for Secondary Status Instruments (Clock, Date, Status)**:
  * **Optimal / Elegant**: $\text{VSR} \le 1.2\%$
  * **Warning (Bulky)**: $1.5\% < \text{VSR} \le 3.0\%$
  * **Violation (Appliance Bloat / Island Syndrome)**: $\text{VSR} > 3.0\%$ (The previous temporal card occupied $\sim 6.2\%$).

### B. Aspect Ratio Distortion (ARD)
$$\text{AR}_{\text{comp}} = \frac{W_{\text{comp}}}{H_{\text{comp}}}$$

* **Cognitive mismatch**:
  * **Time** is a point/scalar measurement ($t \in \mathbb{R}$). Representing it with an extreme horizontal aspect ratio ($W:H \ge 4:1$) misleads human perception into treating it like an interactive progress timeline or scrub bar.
  * Scalar instruments must target balanced aspect ratios: $1:1$ (circle/square icon) or $1.8:1 \text{ to } 2.5:1$ (compact capsule).

### C. Salience Mismatch (Visual Hierarchy Inversion)
$$\text{Salience Index} = \text{VSR} \times \text{Contrast Delta} \times \text{Border Complexity}$$
When a utility control (e.g. date stepper) achieves a higher Salience Index than the primary subject (the floor content, user identity, or active workspace tasks), the UI suffers from **Salience Inversion**.

---

## 2. The Spatial Self-Measuring Observer Pattern (`useSpatialFootprint`)

A truly intelligent component is aware of:
1. Its own bounding rect (`width`, `height`, `area`, `aspectRatio`).
2. Its container's inline size (`container-type: inline-size`).
3. Its ratio relative to the active viewport (`window.innerWidth`, `window.innerHeight`).
4. Its active degradation gear (**G3 Full**, **G2 Medium**, **G1 Compact**, **G0 Nano**) automatically triggered by geometry, not manual prop drilling.

---

## 3. Dissolution Rules for Temporal Controls

1. **Decouple Scalar Time from Grounding Date**:
   - The clock is a glanceable companion: place it in the top navigation chrome or dock it cleanly alongside the date with zero nested sub-toggles.
2. **Dissolve Nested Borders**:
   - Never nest borders inside borders (`card > bar > button > pill`). Use background contrast washes (`var(--w-time-today-wash)`).
3. **Canonical Kit Legos Only**:
   - Re-use `@repo/ui/components/web` (`DateTravel`, `Surface`, `Button`, `Chip`, `TimeAgo`).

