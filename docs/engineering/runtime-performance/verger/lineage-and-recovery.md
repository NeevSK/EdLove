---
title: "Verger: Lineage and Recovery"
status: active
created: 2026-10-21
updated: 2026-10-24
owners: [Naveen]
tags: [verger, adaptive-runtime, prior-art, recovery]
---

> **Provenance.** Exported verbatim from the Claude Doc
> [Gurudevi Adaptive Runtime: Vision, Feasibility and Plan](https://claude.ai/artifact/4yGyJ6Z6H1n4MkiVkBT6j8),
> tab "Lineage and recovery", revision 9, on 2026-10-24, so the vision and its reasoning live in the repository
> beside the code. Diagrams are redrawn as text. The decisions are recorded in
> [the ADR](../../../decisions/2026-10-21-adaptive-runtime-resource-economy.md); where the two
> differ, the ADR and the code are later. Sibling tab: see the link in the text.

# Lineage and recovery

2026-10-21 · Neev

The lieutenant is not new territory at the level of ideas: it stands in a lineage that runs from Odyssey (1997) through autonomic computing (2001–2003) and brownout (2014) to the adaptation built into Android itself. What is sparse is its particular combination: a React Native app on low-cost Android phones, CPU attributed to each thread, and a record of what shedding cannot relieve. This tab sets out that lineage, explains why large companies chose lite apps instead, and draws from mission-critical engineering the part the design still lacks: recovering from its own failures, and growing back in a healthy way.

Three findings shape what follows:

1. **Lite apps solved fixed cost, not running cost.** They cut install size, data and the oldest supported OS; a runtime governor cannot reach those. Several lite apps have since been merged back into their main apps.
2. **The record is thin under the vocabulary we searched with.** Under "application-aware adaptation", "fidelity", "self-adaptive systems" and "brownout" it is three decades deep.
3. **In every mission-critical field, recovery is the main path, exercised before it is needed.** The lieutenant must survive itself, escalate in measured steps, and earn its way back.

## Two kinds of cost: why lite apps, and why they merged back

An app costs a phone in two ways, and the two call for different instruments.

| Cost | What it is | Paid when | Instrument |
|---|---|---|---|
| Fixed | install size, first download, storage, oldest OS supported, code loaded whether used or not | before the app runs | architecture: a small binary, server-driven screens, compiled hot paths |
| Running | CPU, GPU, memory, heat, battery, network while the app runs | while it runs, varying with the phone's state | a runtime supervisor: the lieutenant |

The lite apps attacked fixed cost:

| App | What was done | Outcome |
|---|---|---|
| [Facebook Lite](https://engineering.fb.com/2016/03/09/android/how-we-built-facebook-lite-for-every-android-phone-and-network/) (2015–16) | APK under 1 MB; product logic and layout on the server; screens sent as compact UI trees; caches in the tens of MB; memory released in the background | still offered |
| [Instagram Lite](https://techcrunch.com/2021/03/10/facebook-targets-emerging-markets-with-instagram-lite-a-new-android-app-that-takes-up-just-2mb-in-170-countries) (2018, rebuilt 2021) | about 2 MB against about 30 MB; features dropped; rebuilt on Bloks, which defines screens on the server | first version pulled in 2020, reason not given |
| [YouTube Go](https://www.androidauthority.com/youtube-go-dead-3160656/) (2016–2022) | separate app for entry-level phones and costly data | shut in 2022; Google said the main app had "improved performance for entry-level devices" |
| [Messenger Lite](https://www.etvbharat.com/english/science-and-technology/meta-shuts-down-messenger-lite-app-for-android/na20230825091536017017087) (2016–2023) | stripped-down app for weaker phones | shut in 2023; users sent to Messenger or Facebook Lite; reason not given |

The pattern: a separate app when fixed cost dominates, then convergence into one main app that copes with weak phones once it can. A separate app also allows a market-by-market launch, its own size and OS targets, and a small team that does not slow the main product; these are inferences, not stated reasons.

For Gurudevi the two instruments are complementary, not rival. Fixed cost is met by a small APK, [baseline profiles](https://engineering.fb.com/2025/10/01/android/accelerating-our-android-apps-with-baseline-profiles/) (Meta measured 3% to 40% gains across start, scrolling and navigation, and warned that oversized profiles regress) and not loading code a screen does not use. Running cost is the lieutenant's.

## Lineage: what we take and where we differ

| Work | Year | Core idea | What the lieutenant takes | Where it differs |
|---|---|---|---|---|
| [Odyssey](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/sosp97.pdf), Noble et al., SOSP | 1997 | the system monitors and arbitrates; each application chooses its own fidelity; tolerance windows and upcalls | native code measures, TypeScript decides; workloads own their quality ladders; centralised arbitration (2–5× fewer dropped frames than uncoordinated) | Odyssey managed bandwidth only, in a modified OS; we manage seven resources from inside one app |
| Odyssey's lessons | 1997 | **agility**, the speed and accuracy of response to change; **joint evaluation**, since lower fidelity can fake better performance | measure agility on device; telemetry reports quality given up beside performance gained | — |
| [Energy-aware adaptation](https://cse.engin.umich.edu/stories/jason-flinn-earns-test-of-time-award-for-1999-invention-of-adaptable-battery-use-in-mobile-apps), Flinn and Satyanarayanan, SOSP | 1999 | adapt fidelity to meet a battery-lifetime goal: 36% less energy on average, about 50% with hardware power management | an energy account steered toward a goal (a school day on one charge) | ours adds heat, memory and contention |
| [Autonomic computing](https://en.wikipedia.org/wiki/Autonomic_computing), IBM; Kephart and Chess | 2001–2003 | Monitor, Analyze, Plan, Execute around shared Knowledge; self-configuring, self-healing, self-optimizing, self-protecting | the lieutenant is a MAPE-K loop; the veteran profile is its knowledge | self-healing is the part we have not yet built |
| [Brownout](https://blog.acolyer.org/2014/10/24/brownout-building-more-robust-cloud-applications/), Klein et al., ICSE | 2014 | mark optional content; a dimmer sets the probability that it runs; a control-theoretic controller steers the dimmer | ornamental and deferrable classes; a probabilistic dimmer is an option for fine control | servers under load, not phones under heat |
| [Year Class, Connection Class](https://engineering.fb.com/posts/952628711437136/classes-performance-and-network-segmentation-on-android/), Meta | 2015 | static device and network classes; network band boundaries 3.6× apart so users do not flip between classes | wide hysteresis; classes as a shared vocabulary in telemetry strata | static; the lieutenant treats class as a prior only |
| [MobileLab](https://engineering.fb.com/2018/10/19/android/mobilelab/), Meta | 2018 | controlled lab: clocks fixed, network replayed, state restored; about 1% regressions detected, 75% fewer false positives | the lab procedure for A52 and A24 comparisons | a lab, not a runtime |
| [ADPF best practices](https://developer.android.com/games/optimize/adpf/best-practices-adpf), Google | current | adapt one setting at a time, ramp changes, test sessions of 15 minutes or more, baseline with adaptation off, give users a switch | all five, as test-protocol requirements | written for games |

The nearest prior work is Odyssey and its energy successor. The lieutenant's claim to novelty is therefore narrow: application-aware adaptation inside a single cross-platform app on low-cost Android, with per-thread attribution and an explicit verdict when shedding cannot relieve the load.

## Why the public record is thin

No public account was found of a closed-loop supervisor covering a whole non-game app with per-thread attribution. Absence of articles is not absence of practice; four explanations fit the evidence, and each is an inference, not a stated fact.

1. **Platforms absorbed the idea.** Android's memory callbacks, ADPF, standby buckets and battery saver descend from this lineage, so application teams treat adaptation as the operating system's job.
2. **Large apps were bound by fixed cost.** On 2G networks and small storage, size and data dominated, so they built lite and server-driven apps rather than runtime governors.
3. **Games publish; other apps do not.** In games the frame rate is the product, so adaptation is a selling point; elsewhere a governor is internal plumbing.
4. **The vocabulary differs.** "Adaptive runtime" finds little; "application-aware adaptation", "fidelity", "self-adaptive systems", "graceful degradation" and "brownout" find decades of work.

What remains genuinely sparse is the combination this project builds. That is a defensible position for design-science research: it extends known prior work rather than claiming to come from nowhere, and its claim is small enough to test.

## Mission-critical lessons: recovery is the main path

Every field that cannot afford failure designs the way back first, and runs it often enough that it works when needed.

| Source | Case or rule | Lesson | For the lieutenant |
|---|---|---|---|
| [Crash-only software](https://www.usenix.org/legacy/events/hotos03/tech/full_papers/candea/candea_html/), Candea and Fox, 2003 | stop and start through one path; state in crash-safe stores; timeouts, leases, idempotent retries | recovery that runs on every start is recovery that is tested | the controller is stateless; its only state is a versioned profile; every launch runs the recovery path |
| [NASA software handbook](https://swehb.nasa.gov/x/eQMfBg), safe mode | after an abnormal restart, reinitialise with progressively less reliance on preserved state; once restarts keep failing, "all software states must be presumed suspect" | trust in remembered state is earned, not assumed | each abnormal restart uses less of the learned profile |
| NASA, safe state | a sustainable, commandable state that preserves vital resources and keeps a link to the ground | the floor must keep the essentials and the line home | minimal mode: critical work and telemetry only |
| [Mars Pathfinder](https://www.cs.cornell.edu/courses/cs614/1999sp/papers/pathfinder2.html), 1997 | repeated resets from priority inversion; a trace facility left in flight let JPL reproduce it in about 18 hours; fixed by one configuration change from Earth | "test what you fly and fly what you test"; keep the recorder on | an on-device flight recorder; every lever remotely configurable |
| [Spirit rover](https://www.planetary.org/articles/0126_spirit_is_in_recovery), 2004 | reboot loop, most likely flash file-system trouble; commanded to start without flash, then diagnosed | have a mode that boots without the suspect component | the runtime can start with the native module, the profile or both bypassed |
| [Erlang/OTP supervisors](https://www.erlang.org/docs/23/design_principles/sup_princ.html) | restart a failed child; more than MaxR restarts in MaxT seconds and the supervisor gives up and escalates to its parent | bound the retries, then escalate | a restart intensity for the lieutenant itself |
| [Android Rescue Party](https://source.android.com/docs/core/debug/rescue-party) | triggers at more than 5 system-server restarts in 5 minutes or 5 persistent-app crashes in 30 seconds; escalates one level at a time; last level asks the user to confirm a factory reset | escalate in steps, each verified by a reboot; the user decides anything destructive | the recovery ladder below |
| [expo-updates error recovery](https://docs.expo.dev/eas-update/error-recovery/) | an update that crashes within 10 s of first render, before content appears, is marked failed; the app returns to the last update that launched | the same pattern already runs in our stack | reuse its window and its notion of a launch that succeeded |
| [Google SRE, cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) | "the code path you never use is the code path that (often) doesn't work"; exercise degraded modes; alert when many enter them; keep a fast off switch; retries with jittered backoff and budgets; ramp load to warm caches | degraded paths rot unless exercised | a small share of sessions deliberately runs reduced quality |

## The recovery ladder

The lieutenant must survive its own failures. If the app crashes, stops responding or is killed for memory too often while the runtime runs, it steps down one rung, verifies over the following sessions, and returns only after it has proved itself.

```text
Escalate one rung after repeated failure; return one only after clean sessions
(the recovery ladder for the lieutenant itself, Rescue Party style with Erlang restart limits)

            K clean sessions ^   | N failures within T
 +---------------------------------------------------+
 | 0 · Full runtime        all levers, learned profile |
 +---------------------------------------------------+
            K clean sessions ^   | N failures within T
 | 1 · Profile reset       defaults; trust rebuilt from clean sessions |
            K clean sessions ^   | N failures within T
 | 2 · Hardware levers off no refresh cap, no CPU boost |
            K clean sessions ^   | N failures within T
 | 3 · Shadow only         senses and records; changes nothing |
       new policy version ^   | N failures within T
 | 4 · Off on this phone   until the next policy version; reported home |
```
As built (ADR D12): N = 2 failures in 24 h; K = 3 clean sessions, doubled per relapse; rung 4 is also entered on any death during native start, and left only by a new policy version or release.

Escalation is fast and returning is slow, as with quality itself. Each rung is reachable at the next launch without a release; the remote kill switch can force any rung, and the minimal mode (critical work and telemetry only) sits beneath the app whatever rung the lieutenant is on. N, T and K are to be calibrated on the device panel; Rescue Party's 5 within 5 minutes is the starting reference.

## Healing and growth

Shrinking is only half of adaptation. A healthy system returns after trouble and, when the ground allows, grows beyond where it started; both must be as disciplined as the cut.

**The model is TCP congestion control** ([Jacobson 1988](https://blog.acolyer.org/2015/05/21/congestion-avoidance-and-control/)). Cut fast when trouble appears (multiplicative decrease), climb back quickly from a low point (slow start), and near the limit probe gently, a little at a time (additive increase). Multiplicative increase is rejected because it oscillates. The governor's step-down and one-step-with-back-off return already have this shape.

Three kinds of return, with the evidence each requires:

| Return | What it restores | Evidence required | Pace |
|---|---|---|---|
| Recovery | quality lowered under pressure | calm frames drawn at the lowered level, no heat or memory pressure | one step per hold period; the hold doubles after a failed step |
| Healing | the lieutenant itself, after its own failure | sessions that complete without crash, ANR or low-memory kill at the current rung | one rung per clean-session window |
| Growth | a ceiling above the phone's starting baseline (richer effects, the full refresh rate) | several cool, calm sessions on this phone, recorded in the veteran profile | one probe at a time, withdrawn at the first strain |

Growth needs bounds as firm as shrinking: a ceiling rises only within the policy version's range, never beyond what the phone's class can plausibly sustain, and it falls back fast. A phone that earned its ceiling after an update and then lost it is relearned, not trusted.

## Design additions

New atoms, defined in the vocabulary of the main tab:

| Atom | Definition | Values |
|---|---|---|
| **Rung** | how much of the lieutenant is running on this phone | 0 full; 1 profile reset; 2 hardware levers off; 3 shadow only; 4 off until the next policy version |
| **Failure event** | an outcome the lieutenant may have caused | crash, ANR or low-memory kill while the runtime ran, read from exit reasons (API 30+) or an unclean-exit marker |
| **Restart intensity** | failures tolerated before escalating | N failures in T (to calibrate; Rescue Party uses 5 in 5 minutes) |
| **Clean-session window** | sessions at a rung without a failure event, before stepping back down | K sessions (to calibrate) |
| **Trust level** | how much of the veteran profile is used | full, partial, defaults; lowered after each abnormal restart, raised by clean sessions |
| **Flight recorder** | a ring buffer of the last decisions and signals | a fixed size, written with every snapshot, attached to crash and ANR reports |
| **Exercise share** | sessions that deliberately run reduced quality on capable phones | a small percentage, assigned like an experiment arm |
| **Ceiling** | the highest level a lever may reach on this phone | starts at the class default; raised by growth, lowered fast on strain |

Invariants added to the main tab's list:

1. The lieutenant can always be bypassed: every rung above 0 is reachable from the next launch, without a release.
2. Anything destructive to the user's data or settings is never automatic.
3. The recovery path runs on every launch.
4. Returning is slower than escalating, at every level: quality, rungs, trust and ceilings.
5. Quality given up is reported beside performance gained (Odyssey's joint evaluation).

Where they enter the plan:

| Phase in the main tab | Addition |
|---|---|
| 2. Sensing complete | failure events from exit reasons and the unclean-exit marker; the flight recorder |
| 3. Baseline | trust level; the ceiling in the veteran profile |
| 4. Allocator | ceilings and growth probes; the exercise share |
| 5. Modes and telemetry | rungs and the recovery ladder; minimal mode; agility and joint fidelity-performance metrics |
| 6. Evidence and rollout | MobileLab-style lab procedure; 15-minute thermal sessions; adaptation-off baseline; a user-visible switch |

## Implementation status

The ladder, trust, the per-build profile with growth, the flight recorder and the quality-cost metric are built and tested off-device (G2, commit 90497fa). None of it has run on a phone yet.

| Planned atom | State | Where | Evidence |
|---|---|---|---|
| Rungs 0 to 4; 2 failures in 24 h step down; 3 clean sessions step up, doubled per relapse | Done | recovery.ts | G2 |
| Failure events: ApplicationExitInfo on API 30+, session marker below | Done | DeviceFacts.kt, ExitReasons.kt | G2 mapping, G1 Android call |
| Death during native start goes straight to rung 4 | Done | verger.ts | G2 |
| Rung 4 left only by a new policy version or release | Done | verger.ts | G2 |
| Trust halves on failure, +0.1 per clean session | Done | recovery.ts | G2 |
| Profile keyed by OS build fingerprint, relearned after an update | Done | recovery.ts | G2 |
| Growth: capacity floors earned back after 3 proving sessions, given back on strain | Done | recovery.ts, governor.ts | G2 |
| Learned starting point, given back by the closed loop | Done | governor.ts | G2 |
| Flight recorder: 48 lines, sent once after a failure | Done | flightRecorder.ts | G2 |
| Exercise share | Done, default 0 % | recovery.ts | G2 |
| Quality given up, reported beside performance | Done | quality.ts | G2 |
| Agility metric (time from stress to relief) | Done (2026-10-24), per move | outcomes.ts | G2 |
| Battery-temperature and frame-drift heat fallback | Not built |  |  |
| Baseline profiles | Not built; compilation-state API unverified |  |  |
| User switch for adaptation | Not built; the fidelity preference exists in the reducer |  |  |
| Lab procedure on the A52 and A24 | Waiting for the phones |  | R0 |

Minimal and static modes need no separate code: shadow is the static mode, and the low fidelity preference is the minimal one. One accepted cost: an unrelated native crash during verger's native start also sends the device to rung 4 until the next release, which fails closed.

## Sources

Opened on 2026-10-21:

- [Noble et al., Agile application-aware adaptation for mobility, SOSP 1997](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/sosp97.pdf)
- [University of Michigan: Flinn, Test of Time award for energy-aware adaptation (SOSP 1999)](https://cse.engin.umich.edu/stories/jason-flinn-earns-test-of-time-award-for-1999-invention-of-adaptable-battery-use-in-mobile-apps)
- [Autonomic computing (overview of IBM 2001, Kephart and Chess 2003)](https://en.wikipedia.org/wiki/Autonomic_computing)
- [Brownout, Klein et al. 2014 (summary)](https://blog.acolyer.org/2014/10/24/brownout-building-more-robust-cloud-applications/)
- [Meta: Classes, performance and network segmentation on Android, 2015](https://engineering.fb.com/posts/952628711437136/classes-performance-and-network-segmentation-on-android/)
- [Meta: How we built Facebook Lite, 2016](https://engineering.fb.com/2016/03/09/android/how-we-built-facebook-lite-for-every-android-phone-and-network/)
- [Meta: MobileLab, 2018](https://engineering.fb.com/2018/10/19/android/mobilelab/)
- [Meta: Baseline Profiles, 2025](https://engineering.fb.com/2025/10/01/android/accelerating-our-android-apps-with-baseline-profiles/)
- [TechCrunch: Instagram Lite, 2021](https://techcrunch.com/2021/03/10/facebook-targets-emerging-markets-with-instagram-lite-a-new-android-app-that-takes-up-just-2mb-in-170-countries)
- [Android Authority: YouTube Go shut down, 2022](https://www.androidauthority.com/youtube-go-dead-3160656/)
- [ETV Bharat: Messenger Lite shut down, 2023](https://www.etvbharat.com/english/science-and-technology/meta-shuts-down-messenger-lite-app-for-android/na20230825091536017017087)
- [Google: ADPF best practices](https://developer.android.com/games/optimize/adpf/best-practices-adpf)
- [Candea and Fox, Crash-only software, HotOS 2003](https://www.usenix.org/legacy/events/hotos03/tech/full_papers/candea/candea_html/)
- [NASA Software Engineering Handbook: Initialization, safe mode](https://swehb.nasa.gov/x/eQMfBg)
- [Reeves: What really happened on Mars Pathfinder](https://www.cs.cornell.edu/courses/cs614/1999sp/papers/pathfinder2.html)
- [Planetary Society: Spirit is in recovery, 2004](https://www.planetary.org/articles/0126_spirit_is_in_recovery)
- [Erlang/OTP: supervisor behaviour](https://www.erlang.org/docs/23/design_principles/sup_princ.html)
- [Android: Rescue Party](https://source.android.com/docs/core/debug/rescue-party)
- [Expo: EAS Update error recovery](https://docs.expo.dev/eas-update/error-recovery/)
- [Google SRE book, chapter 22: Addressing cascading failures](https://sre.google/sre-book/addressing-cascading-failures/)
- [Jacobson, Congestion avoidance and control, 1988 (summary)](https://blog.acolyer.org/2015/05/21/congestion-avoidance-and-control/)
