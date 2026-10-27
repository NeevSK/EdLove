---
title: "Universal Sensory & Wellbeing Hardware Integration: Hexagonal Ports, OS Adapters & Holistic Scaling Master Plan"
status: "active"
created: 2026-10-24
updated: 2026-10-24
author: "Naveen"
scribe: "Antigravity"
tags: [wellbeing, coremotion, healthkit, health-connect, ports-and-adapters, hexagonal-architecture, somatic, background-sensors, plan]
---

# Universal Sensory & Wellbeing Hardware Architecture: Ports & Adapters Master Plan

> **Role**: Principal Solution Architect & Systems Engineer  
> **Ecosystem**: `packages/self` (Wellbeing), `apps/gurudevi-mobile`, `@repo/core`, `@repo/ui`  
> **Philosophy**: Convivial, non-coercive somatic accompaniment. Software lifts administrative drudgery and protects human vitality.

---

## 1. The Hostile Critic's Architectural Triage: Realities & Illusions

Before designing abstractions, the hostile systems reviewer must identify the physics and platform invariants:

1. **The Battery & Thermal Reality**:
   - Polling a raw 3-axis accelerometer continuously on the main CPU in the background consumes 300–500mW, draining a smartphone battery in 3–4 hours.
   - Operating systems (iOS, Android 14+) kill unapproved background loops immediately.
2. **The Hexagonal Solution (Ports & Adapters)**:
   - Our wellbeing domain (`@repo/self`, `@repo/core`) must **never bind directly to raw native hardware APIs** like `HealthKit`, `CoreMotion`, or `SensorManager`.
   - Doing so creates fragile platform lock-in and breaks unit testing.
   - Instead, we define a pure domain **Port** (`SomaticSensoryPort`, `WellbeingSyncPort`) and plug in platform-specific **Adapters** (Apple HealthKit Adapter, Android Health Connect Adapter, Local Accelerometer Adapter, Web Audio Adapter).
3. **The Multi-Door Access Reality**:
   - Hardware detection must be **layered**:
     - *Layer 1 (Direct Physical)*: App Shortcuts / OS Back Tap / Action Button (`gurudevi://pulse`).
     - *Layer 2 (In-App Kinetic)*: In-app 10Hz accelerometer listener (`useSomaticShake`).
     - *Layer 3 (Ambient Health Ingestion)*: Batch HealthKit / Health Connect sync (reading mindful minutes, sleep recovery, high-exertion cadence without background CPU drain).
     - *Layer 4 (Dedicated Sanctuary Session)*: Foreground Service / Live Activity with continuous audio-kinetic accompaniment during active class or reflection.

---

## 2. Hexagonal Architecture Map: Ports & Adapters

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE WELLBEING DOMAIN                           │
│              (@repo/self: BreathGuide, WarmMirror, Ripples)            │
│                                                                        │
│   [ SomaticSensoryPort ]                   [ BiometricHistoryPort ]    │
│   - onKineticSpike()                       - getMindfulMinutes()       │
│   - triggerDecompression()                 - getRestingCadence()       │
│   - emitAcousticChime()                    - recordMindfulSession()    │
└───────────────────▲────────────────────────────────────▲───────────────┘
                    │                                    │
       ┌────────────┴────────────┐          ┌────────────┴────────────┐
       ▼                         ▼          ▼                         ▼
 [ Native Mobile Adapter ] [ Web Audio ]  [ HealthKit Adapter ] [ Health Connect ]
 (expo-sensors +           (Visuo-Acoustic (iOS CoreMotion +     (Android Sensor
  expo-haptics JSI)         Web Audio API)  HKObserverQuery)      Manager + Sync)
```

---

## 3. The 4-Layer Holistic Implementation Blueprint

### Layer 1: The Sovereign Universal Shortcut Gate (Instant Outside-App Ingress)
- **Problem**: When the phone is locked or the app is closed, teachers need 1-tap/1-gesture entry without fumbling through screens.
- **Implementation**:
  - Register universal deep link: `gurudevi://pulse?mode=decompression&source=hardware`.
  - Provide iOS App Shortcuts / Android Quick Tiles integration.
  - Native instruction in `@repo/self` Settings to guide the teacher on configuring **iOS Back Tap (Double-tap back of phone) $\rightarrow$ Open Gurudevi Pulse**.

### Layer 2: In-App Kinetic Decompression (Global Route Shell Integration)
- **Problem**: The existing `useSomaticShake.ts` and `SanctuaryPulseOverlay.tsx` are unmounted and dead in `apps/gurudevi-mobile`.
- **Implementation**:
  - Connect `useSomaticShake` into `EntryShell.tsx`.
  - Bind trigger to our persistent store: `useUIStore.getState().setBreathingOpen(true)` and `sensoryFeedback.emit('milestone')`.
  - Mount `<SanctuaryPulseOverlay />` in the root `<PortalProvider>`.

### Layer 3: Biometric Health Ports & Adapters (`@repo/self/lib/health/`)
- **Problem**: Teachers experience stress peaks and fatigue that could inform their daily reflection rhythm and class pacing without surveillance.
- **Implementation**:
  - Create `HealthSyncPort` in `@repo/self`:
    ```typescript
    export interface HealthSyncPort {
      getMindfulMinutes(since: Date): Promise<number>;
      recordMindfulSession(durationSeconds: number): Promise<void>;
      subscribeToHighCadenceSpikes?(onSpike: () => void): () => void;
    }
    ```
  - **Apple HealthKit Adapter** (`AppleHealthKitAdapter.ts`):
    - Reads/writes `HKCategoryTypeIdentifier.mindfulSession`.
    - Wakes app via `HKObserverQuery` if available to deliver gentle reminders.
  - **Android Health Connect Adapter** (`AndroidHealthConnectAdapter.ts`):
    - Binds to Google Health Connect permissions.
  - **Simulated / Offline Adapter** (`InMemoryHealthAdapter.ts`):
    - Clean test harness for CI with zero hardware dependencies.

### Layer 4: Contemplative Sanctuary Session (Live Activity & Foreground Presence)
- **Problem**: During a 45-minute lesson or personal meditation, the teacher wants continuous active accompaniment.
- **Implementation**:
  - Launch an active **Sanctuary Session**:
    - On iOS: Renders a Live Activity on the Dynamic Island and Lock Screen with a rhythmic breathing lotus animation.
    - On Android: Launches a gentle Foreground Service with an ambient status indicator.
  - While this session is active, the app holds legitimate background rights to respond to immediate kinetic touch or gentle time interval bells.

---

## 4. Scaling Constraints & Threat Mitigation

| Risk / Constraint | Severity | Hostile Critic Mitigation Strategy |
| :--- | :--- | :--- |
| **Privacy & Surveillance Creep** | CRITICAL | **Zero Telemetry to School Servers**: HealthKit / sensor data is stored **100% on-device** in local MMKV / SQLite WAL. School administrators and principals have ZERO access to teacher heart rate, steps, or breath counts. |
| **App Review Rejection (iOS 2.5.4)** | HIGH | Do not request continuous background accelerometer entitlements. Use App Shortcuts, CoreMotion pedometer batching, and legitimate HealthKit mindfulness categories. |
| **Battery Drain & Thermal Throttling** | HIGH | Accelerometer polling strictly capped at 10Hz (100ms) with a 4000ms debounce cooldown. Hardware chips (DSP/pedometer) used for step and cadence tracking. |
| **Interface Fragmentation** | MEDIUM | All triggers converge on a single visual surface: `<SanctuaryPulseOverlay />`, powered by our unified `useUIStore` and `SensoryFeedbackService`. |

---

## 5. Phased Operational Plan

1. **Step 1 (Immediate In-App Fix)**: Wire `useSomaticShake` and `<SanctuaryPulseOverlay />` into [`apps/gurudevi-mobile/src/entry/EntryShell.tsx`](file:///c:/x/apps/gurudevi-mobile/src/entry/EntryShell.tsx).
2. **Step 2 (Universal Deep Link)**: Expose and verify `gurudevi://pulse` route in `apps/gurudevi-mobile/app/` with instant presentation.
3. **Step 3 (Hexagonal Health Port)**: Author `HealthSyncPort` and adapters in `packages/self/src/lib/health/`.
4. **Step 4 (Verification & Typecheck Gate)**: Run `tsc --noEmit` and Vitest component-real scenarios across `@repo/self` and `apps/gurudevi-mobile`.
