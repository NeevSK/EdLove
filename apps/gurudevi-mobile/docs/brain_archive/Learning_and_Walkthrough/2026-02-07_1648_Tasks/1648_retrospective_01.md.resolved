# Session Retrospective: QR Scanner Implementation

## The Incident
We spent several iterations implementing a QR code scanner. The process followed a linear, engineering-focused path that resulted in sub-par UX until specifically nudged by the user.

1.  **Iter 1 (The "Standard" Way)**: Tried to use `expo-barcode-scanner`.
    *   *Mindset*: "Use the standard library."
    *   *Result*: Native crash (Library deprecated/incompatible).
2.  **Iter 2 (The "Patch")**: Fixed the crash but left user with a "frame" they had to align perfectly.
    *   *Mindset*: "Make it work mechanically."
    *   *Result*: Functional but rigid. Bad UX.
3.  **Iter 3 (The "Nudge")**: User asked for "full screen scanning" and "gallery support".
    *   *Mindset*: "Fulfill specific request."
    *   *Result*: Switched to pure JS solution (`jsqr`), removed frame. Better, but reactive.
4.  **Iter 4 (The "Cropping" Fumble)**: enable cropping by default.
    *   *Mindset*: "User wants small QRs, enable tool."
    *   *Result*: Native cropper conflicted with system gestures.

## Root Cause Analysis
Why did we default to "Bad UX"?

1.  **Engineering Inertia**: I prioritized "getting it to run" (fixing types, imports, crashes) over "how it feels to use". I treated the *crash* as the problem, rather than the *scanning experience*.
2.  **Library Reliance**: I defaulted to the most common library (`expo-barcode-scanner`) without verifying its current status or UX limitations in 2024/2025.
3.  **Lack of Visual Imagination**: I didn't verify the "Scanner Frame" UI. In modern apps, people expect to just point and shoot, not align with a red box. I should have anticipated this.

## The "UX-First" Protocol (New Workflow)
To prevent this in the future, I will adopt the following checks *before* writing code:

1.  **The "Premium" Check**: Before implementing a UI, ask: "How does a top-tier app (e.g., Spotify, Airbnb, polished Expo apps) do this?"
    *   *Example*: They don't have red alignment boxes. They scan the whole screen.
2.  **Fail-Safe by Design**: Instead of adding buttons for every edge case (like cropping), build the system to handle the complexity internally first (e.g., high-res resizing) and only expose controls if necessary.
3.  **Anticipate Dependencies**: Check library maintenance status *first*. `expo-barcode-scanner` issues were predictable.

## Action Items
- [ ] **Refine Task Lists**: Future tasks must have a "UX Requirements" section, not just "Functional Requirements".
- [ ] **Proactive cleanup**: When a feature is "working", immediately review it for "clutter" (like the unused scanner frame styles I left behind initially).
