# Architecture & UI Engineering: Tutti Spotlight Journey Engine (XState v6 + Spotlight Portal)

**Status:** Approved & Engineered  
**Architecture:** XState v6 Actor Machine + Canvas/SVG Backdrop Cutout + DOM Coordinate Tracking  
**Target:** In-app Guided Tour across actual layouts (`/workspace/attendance`, `/self`, `/admin/principal`, etc.)

---

## 1. The Core Interaction Model: Living Layout with Tutti's Spotlight

Instead of an abstract slideshow or isolated popup modal:
1. **The Real Layout Remains Fully Alive:** The user is on the actual screen (e.g. Attendance Register or Principal Overview).
2. **The Spotlight Cutout (SVG Mask / Box-Shadow Hole):** 
   - A smooth dark backdrop covers the screen, but cuts a clean glowing rectangular "hole" around the active target element (`targetSelector` / DOM Rect).
   - The spotlighted element remains clickable or highlighted.
3. **Tutti Walks Alongside the Path:**
   - Tutti's glowing character avatar floats dynamically next to the spotlight hole (auto-positioned: top, bottom, left, or right with collision avoidance).
   - Explains in 1-2 everyday sentences what that exact button, card, or toggle does.
4. **Navigating the Flow:**
   - A user can click **"Next"** on Tutti's card, or **click the actual highlighted element**, which fires the transition and walks Tutti to the next coordinate on the page or even navigates to the next tab.
   - A prominent **"Skip"** or **"X"** button lets the user dismiss the journey immediately at any step, saving `dismissed` to storage.

---

## 2. State Machine Architecture (XState v6)

We leverage the monorepo's established `xstate@6.0.0-alpha.70` pattern (as in `@repo/core/logic/journey/roleJourneyMachine.v6.ts`):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TuttiJourneyMachine (XState v6)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
      [idle / unseen]     [spotlighting]               [navigating]
           │                        │                        │
     START_JOURNEY           TARGET_MEASURED            ROUTE_CHANGE
           │                        ▼                        │
           └───────────────> [guiding_beat] <────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                   NEXT_BEAT / ACTION     DISMISS / SKIP
                         │                     │
                         ▼                     ▼
                  [advance or finish]     [completed]
```

### Context & Events Contract

```typescript
export interface TuttiJourneyContext {
  role: 'teacher' | 'principal' | 'student' | 'guardian';
  journeyId: string;
  activeBeatIndex: number;
  totalBeats: number;
  activeTargetSelector: string | null;
  targetRect: { top: number; left: number; width: number; height: number } | null;
  dismissed: boolean;
}

export type TuttiJourneyEvents =
  | { type: 'START'; role: 'teacher' | 'principal' | 'student' | 'guardian' }
  | { type: 'TARGET_FOUND'; rect: { top: number; left: number; width: number; height: number } }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'NAVIGATE'; path: string }
  | { type: 'DISMISS' }
  | { type: 'FINISH' };
```

---

## 3. The UI Challenge: The Spotlight & Tutti Placement Engine

The most challenging engineering part is ensuring:
1. **The Spotlight Cutout Doesn't Break on Resize or Scroll:**
   - Use `ResizeObserver` + `window.onscroll` to update the active element's bounding client rect.
   - Render the spotlight using an SVG mask or `box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.65)` with a smooth CSS transition (`transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
2. **Tutti's Tooltip Placement (Collision Avoidance):**
   - Calculate viewport edges: If the element is near the bottom, Tutti floats above. If near the top, Tutti floats below.
   - Tutti's speech balloon has an indicator pointing directly to the cut-out hole.
3. **Smooth Path Walking:**
   - When transitioning from Target A (e.g., class selector) to Target B (e.g., mark-all button), the spotlight bounding box smoothly slides and morphs sizes across the screen.

```tsx
// Architectural Form Component: TuttiSpotlightOverlay.tsx
<div className="fixed inset-0 z-50 pointer-events-none">
  {/* The SVG Cutout Mask */}
  <svg className="w-full h-full">
    <defs>
      <mask id="tutti-spotlight-mask">
        <rect width="100%" height="100%" fill="white" />
        <rect
          x={rect.left - 6}
          y={rect.top - 6}
          width={rect.width + 12}
          height={rect.height + 12}
          rx="12"
          fill="black"
        />
      </mask>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="rgba(10, 15, 20, 0.72)"
      mask="url(#tutti-spotlight-mask)"
    />
  </svg>

  {/* Active Target Interactive Layer */}
  <div
    style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    className="absolute pointer-events-auto border-2 border-amber-400/80 rounded-xl animate-pulse"
  />

  {/* Floating Tutti Card */}
  <TuttiCard
    position={computedPosition}
    characterSrc="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
    narration={currentBeat.narration}
    onNext={() => send({ type: 'NEXT' })}
    onSkip={() => send({ type: 'DISMISS' })}
  />
</div>
```

---

## 4. Separation from `/support`

- **In-App Journey (`/intro` and In-App Live Tours):**
  - Uses the **XState v6 Spotlight Engine** to physically guide users across real app layouts and controls.
- **Support Desk (`/support`):**
  - Keeps it super simple and clean:
    1. Instant answers to common daily questions.
    2. Direct button to message support.
    3. Option to launch Tutti's interactive spotlight tour at any time.
    4. Technical device specs tucked away into a quiet bottom toggle.
