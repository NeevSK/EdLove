# Master Architectural Plan & Hostile Review: Tutti Spotlight Engine across Form Factors

**Author:** Senior Solution Architect & Hostile Pragmatic Critic  
**Scope:** Responsive Form Factors (Desktop, Tablet, Mobile), System Scaling Constraints, Unified State Machine, and Ruthless Pragmatic Review  
**Status:** Architecture Blueprint & Implementation Gate  

---

# PART 1: The Hostile Pragmatic Critic (Pre-Flight Attack & Risk Surface)

Before writing any code, we conduct a hostile review of the proposed system to expose every structural failure mode.

### Attack Vector 1: "The Mobile Viewport Catastrophe" (Real Estate Starvation)
* **The Vulnerability:** On a 375px mobile screen (e.g. iPhone SE / Android budget device), if an element takes up 180px and the virtual keyboard or bottom navigation is present, a floating popover of 280px **will overflow the viewport** or completely cover the spotlighted element it's trying to explain.
* **The Trap:** Trying to force desktop-style floating pointer balloons onto a phone screen.
* **The Senior Solution:** **Form-Factor Polymorphism**:
  - **Desktop / Wide Tablet (`≥ 1024px`)**: Floating spotlight balloon with directional arrow pointing to target element.
  - **Phone / Compact Mobile (`< 768px`)**: **Bottom Sheet Docking**. The spotlight cut-out remains anchored over the element, but Tutti's card drops to a fixed bottom drawer with safe-area insets (`env(safe-area-inset-bottom)`). This leaves the element visible without collision math gymnastics.

---

### Attack Vector 2: "The Layout Shift & Async Render Death"
* **The Vulnerability:** Next.js pages load data client-side (e.g., student lists, attendance records). If the tour tries to spotlight `.student-row-0` before React renders the list, `document.querySelector` returns `null`.
* **The Trap:** Throwing an unhandled exception or instantly abandoning the tour.
* **The Senior Solution:** **MutationObserver & Retry Polling with Fallback Timeout**:
  - The XState machine does not assume synchronous DOM presence. It enters a `measuring` state that subscribes to DOM mutations for up to 1200ms.
  - If the element still does not mount (e.g. data fetch error or empty state), it **gracefully skips that step** and advances to the next stable anchor, or falls back to an ambient non-anchored explanation card.

---

### Attack Vector 3: "The Scroll Desync & Momentum Glitch"
* **The Vulnerability:** User scrolls or flings momentum scroll on iOS/Android while the spotlight is active. If the SVG mask is recalculated on standard `scroll` events, frame drops and lag occur, causing the cutout to visually detach from the target button.
* **The Senior Solution:** **CSS Transform & `requestAnimationFrame` Throttling**:
  - The SVG mask `rect` uses direct coordinate injection during scroll with `passive: true` listeners.
  - Target auto-scrolls into view using `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` before the measurement locks.
  - Background scrolling is softly constrained (`overflow: hidden` on body or backdrop touch-action lock) during active step focus, allowing scroll only within scrollable containers if needed.

---

### Attack Vector 4: "The Accidental Hostage Situation" (Escape Velocity)
* **The Vulnerability:** Product tours that trap users behind un-dismissible backdrops generate immediate user rage and app uninstalls.
* **The Senior Solution:** **Zero Friction Escape Hatches**:
  - `Escape` key immediately closes the tour.
  - Tapping anywhere outside the target element or tapping a high-contrast `[Skip / Got it]` button immediately exits.
  - Dismissal writes to `localStorage` immediately; the engine never pesters that user session again for that journey.

---

# PART 2: Comprehensive Architecture (Desktop vs. Tablet vs. Mobile)

We ground breakpoints strictly against `@repo/ui/tokens` (`phone: 0`, `tablet: 768`, `desktop: 1024`):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VIEWPORT REAL ESTATE ADAPTER                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│ DESKTOP / TABLET (>= 768px)         │   │ MOBILE PHONE (< 768px)              │
│ • Floating Speech Bubble Card       │   │ • Bottom Sheet Docked Card          │
│ • Dynamic directional beak/arrow    │   │ • No beak; target halo highlight    │
│ • 4-quadrant collision flip         │   │ • Compact 1-line copy + touch target│
│ • Max width: 340px                  │   │ • 100% width with safe-area padding │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
```

---

# PART 3: The Holistic Module Plan & Implementation Seams

### Step 1: Types & Contract Definition
- **File:** `apps/gurudevi-web/lib/tutti/schema.ts`
- **Responsibilities:**
  - Define `UserRolePerspective` (`teacher`, `principal`, `student`, `guardian`).
  - Define `TuttiStepSpec`: Target selector, fallback selector, title, narration, preferred placement, actions.
  - Define `TuttiJourneySpec`: Unique versioned ID, role constraints, steps list.

### Step 2: The Resilient XState v6 Machine
- **File:** `apps/gurudevi-web/lib/tutti/tuttiMachine.ts`
- **States:**
  1. `idle`: Waiting for start trigger or checking `localStorage` seen status.
  2. `locating_target`: Measuring DOM rect with `MutationObserver` retry loop (max 1.2s).
  3. `spotlighting`: Displaying active step, listening to `NEXT`, `PREV`, `SKIP`, and DOM resize.
  4. `transitioning`: Animating spotlight rect to next coordinate.
  5. `dismissed`: Writing to storage and cleaning up listeners.

### Step 3: Viewport & Geometry Calculator (Headless Math)
- **File:** `apps/gurudevi-web/lib/tutti/geometry.ts`
- **Functions:**
  - `measureTarget(selector)`: Resolves element and returns sanitized bounding box.
  - `computePlacement({ targetRect, popoverSize, viewport, isMobile })`:
    - On mobile: Forces `{ mode: 'bottom-sheet' }`.
    - On desktop: Computes `{ mode: 'floating', top, left, arrowSide: 'top'|'bottom'|'left'|'right' }`.

### Step 4: The Presentation Form (`TuttiSpotlightOverlay.tsx`)
- **File:** `apps/gurudevi-web/lib/tutti/TuttiSpotlightOverlay.tsx`
- **UI Sub-components:**
  - `SpotlightBackdrop`: SVG mask with morphing cut-out rect (`transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
  - `DesktopPopover`: Floating card with speech arrow and Tutti character.
  - `MobileSheet`: Bottom-docked card with large tap targets (min 44px APCA compliant).

### Step 5: Plain-Talk Role Journey Specs
- **File:** `apps/gurudevi-web/lib/tutti/journeys/roleJourneys.ts`
- **Journeys:**
  - `teacherAttendanceJourney`: Fast 3-step walkthrough on taking roll call offline.
  - `principalSyncJourney`: 3-step walkthrough on monitoring teacher sync and school status.
  - `studentGoalJourney`: 2-step walkthrough on setting daily study intentions.

### Step 6: Simplified `/support` Integration
- **File:** `apps/gurudevi-web/app/(marketing)/(support)/support/page.tsx`
- **Changes:**
  - Replace confusing multi-tab diagnostics with 3 clean pillars:
    1. Instant FAQ Cards (Plain text answers).
    2. Direct human contact button.
    3. "Launch Interactive App Tour" button (starts the Tutti machine on demand).
  - Move technical hardware/browser diagnostics to a collapsed bottom drawer.

---

# PART 4: Verification & Anti-Slop Gate

Before declaring complete:
1. **Viewport Verification:** Test at 375px (Mobile), 768px (Tablet), 1280px (Desktop).
2. **Missing Node Verification:** Ensure deliberate removal of a target element does NOT crash the app; machine must gracefully advance or dismiss.
3. **Storage Persistence:** Verify `localStorage` writes and that dismissing once prevents nagging.
4. **Bundle & Boundary Check:** Ensure zero native/Expo leakage into browser web packages.
