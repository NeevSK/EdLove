---
title: "Verger against its prior art, and the variety it still lacks"
status: active
created: 2026-10-25
owners: [Naveen]
tags: [verger, prior-art, cybernetics, requisite-variety, plan]
---

# Verger against its prior art, and the variety it still lacks

Read after [the control review](2026-10-25-control-review-and-plan.md) (P1 to P8, built). This
review asks two questions: where is verger as robust as the systems it learned from, and where
is it shallow; and, by Ashby's law of requisite variety (only variety in the regulator can absorb
variety in the disturbances), which disturbances of Gurudevi's real world it still has no
distinct response to. Sources were read on 2026-10-25; links at the end.

## 1. Prior art, side by side

| System | What it does that matters | Verger today | Verdict |
|---|---|---|---|
| **Unity Adaptive Performance** (Indexer, scalers) | Separate thermal and performance action delays; a raise is ignored while the other loop is lowering; scalers ranked by impact; bottleneck CPU, GPU or target frame rate; temperature level **and trend**; boost mode | Frames and heat loops with their own waits (750 ms, `thermalActionDelayMs`); raises blocked while heat is warm or worse; levers by declared impact and now measured gain (P7); bottleneck from frame stages; ADPF CPU boost; heat level with hysteresis (P4) | **As robust**, except **trend**: on Android 9 (battery temperature, no forecast) verger reacts to heat only once it arrives |
| **Android ADPF** | Thermal headroom with a **forecast** horizon; status listener; poll at most every 10 s; status can stay `NONE` while headroom is high; Performance Hint sessions; Android 16 adds **CPU and GPU headroom** | Forecast 10 s ahead; status by listener; worse-of status and headroom (covers the stale `NONE`); hint session with work durations | Robust for heat. **Shallow on capacity**: no CPU or GPU headroom sensing on Android 16 |
| **Unreal dynamic resolution** | A continuous actuator driven by frame time against a budget with a **targeted headroom**; the change is sized from how far over budget the frame is | A discrete ladder, one step per 750 ms of stress whatever the overshoot | **Shallow on large disturbances**: at 3× the budget verger walks the ladder for seconds while the user sees jank; it now knows each lever's gain (P6) and could size the step |
| **Android Performance Tuner** | Quality levels per device from fleet data; **annotations** (scene, loading) attached to each frame record, so loading is not judged as gameplay | Learned starting point per device; fleet telemetry; no annotation: a screen transition or a loading spinner is stress like any other | **Shallow on expected disturbances**: verger cannot tell a known, brief load from a real one, and remembers nothing per screen |
| **Apple** (thermal state, Low Power Mode, display link ranges) | Four thermal states; Low Power Mode caps 120 Hz; preferred frame-rate ranges | Power saver as a limit; refresh cap; no iOS native sensing | **Absent on iOS** beyond JavaScript signals (cannot be built here: needs Xcode) |
| **Compute Pressure** (W3C) | `PressureObserver.observe("cpu", { sampleInterval })`, states nominal, fair, serious, critical | Web: long tasks, event-loop lag, Event Timing; no pressure observer | **Shallow on the web**: the one platform-level CPU signal browsers offer is unused |
| **Kubernetes HPA** | Tolerance band (10%); scale-down stabilization window (300 s) taking the most conservative recommendation; scale-up at once | Stress and comfort bands (1.25, 0.8); raises wait 4 s with doubling back-off; lowering at once | **As robust**: asymmetric by design, bounded |
| **TCP (AIMD, BBR)** | Multiplicative decrease, additive increase; BBR probes with a model of the path | Lower fast, raise slowly; p5 probes upward on evidence | **As robust** |
| **Video bitrate adaptation (MPC)** | Plans over a horizon against a predicted future (buffer, throughput) | No horizon: energy and heat are alarms, not plans | **Shallow on energy**: nothing asks whether the battery lasts the school day |
| **Erlang supervisors, Rescue Party** | Restart intensity, escalation, recovery | The recovery ladder | Robust; two review items open (relapses never decay; a kill switch set after mount is not seen live) |

## 2. The variety of Gurudevi's world, and verger's answer to each

| Disturbance in the host and app | Verger's distinct response | Gap |
|---|---|---|
| A heavy screen opens (workspace, a reflection with images) | Lowers after 750 ms of stress, one step at a time | **No memory per screen** and **no step sized to the overshoot** |
| A navigation transition or loading spinner (brief, expected) | Treated as stress; may lower and later raise back | **No annotation**: expected load is acted on |
| Sync or a decode burst (work no lever reduces) | Relief check stops lowering (P8) | Low phone: its two steps are the costliest (`P7_PENDING`) |
| Classroom heat on an Android 9 phone | Battery-temperature level with hysteresis (P4) | **No trend**: acts only after the threshold is crossed |
| Heat on Android 11+ | Forecast headroom, hysteresis | none in the model |
| A long school day on battery, power cuts | Low battery (20%) and power saver as limits | **No energy setpoint**: nothing acts early enough to finish the day |
| CPU contention from other apps (Android 16) | Thread load of our own threads only | **No system CPU or GPU headroom** |
| CPU pressure in a browser | Long tasks, lag | **No Compute Pressure** |
| Prepaid data | Data budget limit (B3.2) | **No accounting** (B3.1, TrafficStats) |
| A lever that is cheap on paper but useless | P7 passes it over once measured | **Gains forgotten every launch** |
| A crash-prone device that later stabilises | Recovery ladder | **Relapses never decay**: recovery stays slow forever |
| Remote kill switch flipped while the app runs | Read at launch | **Not seen until relaunch** |
| CPU boost requested with the frames sensor off | Hint session opened | **No work durations reported**, so the session has nothing to act on |
| Web user who wants less motion or detail | `auto` fidelity only | **No fidelity setting on the web** |

## 3. What we build now (R1 to R12), all testable here

Each is shown in the closed-loop simulator where it touches decisions
([P-control.md](playbook/P-control.md) rules), gated, and committed on its own.

| # | Build | Done when |
|---|---|---|
| R1 | **Heat trend** for every source: a rising slope projects the level `thermalTrendHorizonMs` ahead; a projected rise acts as the rise (tightening early), never relaxes | the low phone's heat soak peaks lower in the simulator; unit tests on slope, projection, noise |
| R2 | **Proportional lowering** (p5): when frames are far over budget, take as many steps at once as measured gains say are needed (bounded by `maxStepsPerAction`), single steps otherwise | the identify and heat soak sessions show less jank for no more quality given up; P3 holds |
| R3 | **Work annotations**: the app announces a transition (`expect` event with a duration); stress inside it is not acted on and is not a gain sample | unit tests; Gurudevi's navigation announces it |
| R4 | **Screen memory** (p5): the app names the screen; verger remembers the pressure it settled on per screen and applies it on entry (feedforward from memory), giving it back as usual | in a simulated return to a heavy screen, jank on entry falls |
| R5 | **Energy setpoint**: estimate battery drain while unplugged; if the hours left fall below `energyReserveHours`, energy is a limit (levers' `whenBatteryLow` apply) before 20% | unit tests; simulator battery model |
| R6 | **Gains kept across launches**, in the learned profile, decayed toward unknown with age | a relaunch starts with last session's gains |
| R7 | **Low phone burst** (`P7_PENDING`): the relief check judges a step by its cost, so a costly step that did not relieve ends the episode at once | the exemption is removed |
| R8 | **Recovery review items**: relapses decay after a run of clean sessions at rung 0; a kill switch set while running is observed live | tests on the ladder model |
| R9 | **CPU boost without frames**: the boost's work durations come from the frame estimator even when the frames sensor is deaf, or the boost is refused | Kotlin JUnit |
| R10 | **Compute Pressure** on the web: `cpu` pressure `serious` and `critical` as contention evidence | verger-web tests |
| R11 | **Android sensing**: CPU and GPU headroom (API 36) as contention evidence; TrafficStats data accounting (B3.1) | Kotlin compiled against android.jar, JUnit |
| R12 | **Web fidelity setting**; retention metrics read the metered flag from verger | tests |

## 4. Progress

**R1 built (heat trend).** A least-squares slope over `thermalTrendWindowMs` (120 s, at least 3
readings) of headroom, or battery temperature, projects heat `thermalTrendHorizonMs` (30 s) ahead;
`snapshot.thermalProjected`. Lowering, raises, warm floors, admission and the CPU boost act on the
worse of the held and projected levels; the thermal account reads it too; a falling trend relaxes
nothing. In the model it changed nothing until heat led: every reference session drove frames
first. A new session, **sun** (a calm screen while the room heats to 38 °C), is the disturbance
where heat leads: peak heat 45.5 → 43.8 °C (mid), time hot 296 → 139 s (high), before P5.

**The sun session also exposed a thermal limit cycle** (period about 200 s: warm, lower, cool,
lift everything, warm again), so **P5 was built**, not left a guard. See
[the control plan](2026-10-25-control-review-and-plan.md), P5 status.

**Found by the deep property runs on the way, and fixed** (all existed before this work; only
3000-case runs reach them):
- a lowering proposed while a lever was shadowed was published when the switch to apply also
  deafened the sensor that caused it: pressure now records its cause (`pressureCause`), and a
  sensor switched off takes its lowering with it;
- a shadowed lowering applied after its strain had passed, or pressure republished when the
  decide mode went static and back, was judged a blind pressure move: the outcome ledger now
  counts moves that appear with an activation or decide switch as the switch's (with the floors);
- heat pacing (P5, this work) held closed-loop decisions after a switch to static: pacing applies
  only while the closed loop decides.

**R2, R3, R4 built.**
- *R3, screen annotations*: a `screen` event (`name`, optional `transitionMs`). A new screen is a
  new regime: frame smoothing, the stress episode and the gain probe start over; frames inside an
  announced transition are neither stress nor comfort. Gurudevi announces every route on mobile
  (expo-router `usePathname`) and on the web (Next `usePathname`) through `useScreenAnnouncement`
  (verger-react), with record ids folded into `:id` (`screenNameOf`).
- *R4, screen memory (p5)*: leaving a screen, p5 remembers the frames-caused pressure it held there;
  returning, it applies the part measured to help (confident, useful gains) before the first frame.
  Unmeasured levers are left to the loop, so memory never freezes a first visit's guesses.
- *R2, proportional lowering (p5)*: when the measured gains of the levers taken say one step leaves
  frames over budget, one action takes up to `maxStepsPerAction` (3) steps; a step onto an
  unmeasured lever is never taken this way.
On the screen the user keeps returning to (identify, mid phone): jank 10% → 1% for p5 (quality
given up 34 → 40%), 10% → 4% for p4.

**Found and fixed on the way:**
- *Lowering spent steps on levers already asleep.* `lower()` chose from static floors only, so an
  untouched phone "lowered" an ambient lever its idle floor already held at its cheapest: a step
  with no effect, counted by the relief check (P8). It now chooses from what is published. This
  alone cut p4's jank on identify from 10% to 4%.
- *Gains were biased by selection.* A step down follows the windows that were high enough to
  trigger it, so measured against them, regression to the mean read as gain (a lever of true gain
  0.01 measured 0.06). Steps given back are now measured too (they follow seconds of comfort, so
  their baseline is ordinary windows), and a step down counts only when the load was over the
  stress line on average. Noise-free, the estimate was exact (0.0104 against 0.01).
- *The ledger credited pressure on a shadowed lever* (from the P8 gesture-hold fix): a lever not
  applied publishes its baseline, so none of its moves are pressure's. Found at 3000 runs, pinned.

**R5 built (energy setpoint).** While unplugged, a least-squares drain over 30 minutes (needing
10 minutes of readings and a 2-point drop, so a jittery reading is never a drain) gives
`snapshot.batteryHoursLeft`. Fewer hours than `energyReserveHours` (3, provisional: the sense is a
school day) is `energyShort`: levers' `whenBatteryLow` apply, the energy account reads tight,
energy-spending optional work waits, all before the battery reaches 20%. Plugged in or not
measurably draining, never a limit. The deaf-sensor invariant now covers `batteryHoursLeft`,
`energyShort` and R1's `thermalProjected`. G1 only: a ten-minute simulator session cannot show a
school day's drain; phase F measures real drains.

**R6 built (gains across launches).** The session report carries the gains the session ended
with; the record folds them into the device's profile on every counted session (a gain is a
measurement of the lever, whatever the outcome), and a lever not measured again keeps its gain
with half its samples, so old measurements fade back to unconfident. Every running rung launches
with them, each at most `gainMinSamples` strong; off, shadow and an exercise launch do not. A new
device build starts over. Persisted gains are parsed strictly; records written before R6 still
read. Writing the tests found that aging ran only in sessions that reported gains: fixed.

**Cannot be done here:** iOS native sensing (needs Xcode and a Mac), anything on a real phone
(phase F), the Expo Modules 2.0 port of the binding (needs the Expo Android build), and the
chairs that are Naveen's (release preset, budgets, GrowthBook and PostHog wiring).

## Sources

- [ADPF thermal API](https://developer.android.com/games/optimize/adpf/thermal)
- [SystemHealthManager (API 36 CPU and GPU headroom)](https://developer.android.com/sdk/api_diff/36/changes/android.os.health.SystemHealthManager)
- [Unity Adaptive Performance provider settings (action delays)](https://docs.unity3d.com/Manual/adaptive-performance/provider-settings-reference.html), [Indexer API](https://docs.unity3d.com/ScriptReference/AdaptivePerformance.AdaptivePerformanceIndexer.html), [simulator (bottlenecks)](https://docs.unity3d.com/Packages/com.unity.adaptiveperformance@2.2/manual/simulator.html)
- [Unreal dynamic resolution](https://dev.epicgames.com/documentation/en-us/unreal-engine/dynamic-resolution-in-unreal-engine)
- [Android Performance Tuner: annotations, fidelity, quality levels](https://developer.android.com/games/sdk/performance-tuner/unity/define-parameters)
- [Compute Pressure spec source](https://github.com/w3c/compute-pressure) (IDL read from `index.html`), [W3C TR](https://www.w3.org/TR/compute-pressure/)
- [Kubernetes HPA scaling behaviour, KEP-853](https://www.kubernetes.dev/resources/keps/853/)
- [CADisplayLink](https://developer.apple.com/documentation/quartzcore/cadisplaylink) (Apple thermal mapping not verified against Apple's own pages)
