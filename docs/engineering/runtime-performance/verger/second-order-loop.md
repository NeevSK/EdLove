---
title: "Verger: the second-order loop"
status: active
created: 2026-10-24
updated: 2026-10-24
owners: [Naveen]
tags: [verger, adaptive-runtime, cybernetics, self-adaptation, telemetry, doctrine]
---

# Verger: the second-order loop

Adapting the app to the phone is the first loop. Verger must also watch that adapting: what it
costs, whether it works, and what it gives up, and change itself in the light of it, down to
switching itself off where it does not pay. That is the second loop, and telemetry is how it
sees. This doc names the loops, connects them to the prior art in
[lineage-and-recovery.md](lineage-and-recovery.md), and sets the implementation plan. It sits
beside the envelope in [stage-and-chairs.md](stage-and-chairs.md): the envelope says where the
first loop may move; this doc says how verger keeps that moving honest.

## The idea

Heinz von Foerster separated the cybernetics of *observed* systems from the cybernetics of
*observing* systems: the observer is part of what is observed. Verger is an observer inside the
app it regulates; it spends the same CPU, memory and battery it governs, and its decisions
change what it then measures. So it cannot only regulate the app; it must regulate its own
regulating.

W. Ross Ashby's ultrastable system gives the shape. A first feedback loop couples the system to
its environment. A second loop runs from a few **essential variables** to the **parameters** of
the first loop, and acts only when an essential variable leaves its bounds; the system has
adapted when the whole settles again within bounds. Ashby's homeostat changed its parameters by
stepping through settings; verger's recovery ladder already steps the same way.

## Three loops

Jeff Kramer and Jeff Magee's three-layer model for self-managed systems (component control,
change management, goal management) and Chris Argyris's single- and double-loop learning name the
same structure from software and from organisations. In verger:

| Loop | Layer (Kramer and Magee) | What it changes | From what | When | Where |
|---|---|---|---|---|---|
| **1. Adapt the app** | component control | lever levels: compress and expand inside the envelope | sensed accounts (frames, heat, memory, threads, energy, network) | seconds | on the phone, policy rules |
| **2. Adapt verger** | change management | verger itself: which levers it moves, how fast, which sensors run, how much of itself runs (rung) | essential variables and the outcomes of its own moves | seconds to sessions | on the phone, declared rules in the policy |
| **3. Change the rules** | goal management; double-loop learning | the policy: rules, thresholds, ladders, envelopes (a new version) | telemetry and recorded sessions, compared across versions and against verger off | releases | people, never the phone |

Loop 3 stays with people. The ADR's invariant holds: policies are deterministic and versioned,
and telemetry informs the next version, never the running one. Loop 2 does not break it: its
rules are declared in the policy and bounded by it; the evidence only decides *when* a rule
fires, exactly as the recovery ladder already works. Given the same events, loop 2 does the same
thing, and a recorded session replays it.

## Essential variables

What loop 2 protects. When one leaves its bounds, verger changes itself; inside bounds it leaves
itself alone.

| Essential variable | Bound (a chair, calibrated later) | Measured by |
|---|---|---|
| Critical deadlines | touch response, attendance save, breathing timer: no misses | input-to-frame time, save duration, timer drift |
| Stability | no crash, ANR or low-memory kill that verger may have caused | exit reasons (API 30+), session markers |
| Heat | below a thermal status over a session | thermal status and headroom |
| Energy goal | a school day on one charge (Flinn and Satyanarayanan's goal-directed adaptation) | battery level over foreground time |
| **Verger's own cost** | a budget of wakeups, CPU and memory, small beside what it saves | counters on its own thread and bridge |
| Quality given up | no lever held low longer than its relief requires | the quality meter, per move |

## What loop 2 observes: the outcome of every move

The first loop acts; loop 2 asks whether each act did what it was for. Every move becomes an
**outcome record**:

| Field | Meaning |
|---|---|
| move | lever, direction (compress or expand), from and to level |
| because | account, signal and rule that caused it |
| relieved | for a compress: did the targeted account improve within the judging window |
| held | for an expand: did it hold for the hold period, or was it withdrawn on strain |
| agility | time from the strain to relief (Odyssey's agility: speed and accuracy of response) |
| cost | quality given up or gained, beside the performance it bought (Odyssey's joint evaluation) |

Beside the outcomes, loop 2 observes **itself**: wakeups per minute, CPU time of its own thread,
bridge events per minute, its own memory, measured against the same session with verger off
(the exercise share and the off arm). Measuring itself must be cheap: counters, never tracing.

## What loop 2 may change, and its rules

Each is a declared rule in the policy, an event with a reason when it fires, and replayable.

1. **Stop a move that does not help.** A lever whose compress fails to relieve its account K times
   in a session stops being moved for that account until the strain has been absent a while. This
   generalises what verger already does for thread contention ("not relieved by levers, needs a
   code fix", ADR D10) to every account.
2. **Slow a loop that flaps.** More than N reversals of a lever within T (Erlang's restart
   intensity, applied to moves) widens its hold within the policy's bounds; returning to normal
   pace is slower than leaving it.
3. **Withdraw an expansion that does not hold.** A failed expand doubles the wait before the next
   probe (already built for raises); several failed in a session lower the ceiling for the
   session.
4. **Keep verger within its own budget.** Verger is itself a workload in the demand registry
   (`verger-self`, deferrable). Over its budget, it sheds its own sensing in a declared order:
   slower thread sampling first, then frames while idle; heat and memory sensing never go below a
   floor cadence, because they guard essential variables.
5. **Step down on harm.** Unchanged: the recovery ladder (rungs 0 to 4) on crashes, ANRs and
   kills, with healing and growth back.
6. **Grow back only on evidence.** Every reduction of itself is undone one step at a time, after
   the condition has been gone for longer than it lasted (TCP's shape: cut fast, return slowly).

Rules that loop 2 never applies to itself: it never crosses the envelope's limit, never switches
off the kill switch's authority, never changes a threshold outside the policy's declared range,
and never acts on telemetry from other phones (that is loop 3).

## Telemetry: how loops 2 and 3 see

Loop 2 sees through its own outcome records and self-cost counters on the phone. Loop 3 sees
through telemetry, and the dev lab through everything:

| Report | For | Contents |
|---|---|---|
| move outcomes | loops 2 and 3 | relieved, held or withdrawn, agility, quality cost, by lever and account |
| self-cost | loops 2 and 3 | wakeups, CPU, bridge events, memory, beside the off arm |
| essential variables | loop 3 | deadline misses, exits, heat, energy per foreground hour |
| loop 2 actions | loop 3 | every self-change with its rule (which moves stopped, which sensors slowed, which rungs) |
| recordings | dev lab, loop 3 | whole sessions, replayable under any policy |

Destinations, sampling and the daily byte budget are chairs. Field telemetry keeps the shape of
reasons and drops exact values (ADR D5.3); exact values stay on the device's diagnostics.

## The prior art, connected

What the lineage already holds, where verger has it, and what each suggests.

| Pattern | Source | In verger today | Suggests |
|---|---|---|---|
| Double feedback on essential variables | Ashby, ultrastability | the ladder, for crashes only | essential variables beyond crashes: deadlines, heat, energy goal, own cost |
| Observer inside the observed | von Foerster | its cost is named in the ADR, not measured | `verger-self` as a workload under its own economy |
| Three layers | Kramer and Magee | implicit | the loops as named layers; loop 3 off the phone |
| Double-loop learning | Argyris and Schön | policy versions | loop 3 as the only place rules change; recordings as its evidence |
| Agility | Odyssey, 1997 | not built | measure time from strain to relief per move |
| Joint evaluation | Odyssey, 1997 | quality meter, per session | per move: quality given up beside relief bought |
| Goal-directed adaptation | Flinn and Satyanarayanan, 1999 | none | an energy goal as an essential variable |
| Monitor, analyse, plan, execute over knowledge | IBM autonomic computing | the profile is knowledge | outcome history as knowledge; self-healing beyond the ladder |
| A controller steering the dimmer | Brownout, 2014 | none | later: a controlled dimmer instead of steps |
| Restart intensity | Erlang/OTP | the ladder's N in T | the same intensity for flapping moves |
| Degraded paths rot unless used | Google SRE | exercise share, default 0 % | the exercise share as the off arm that measures verger's worth |
| Baseline with adaptation off | Android ADPF best practices | modes | every comparison in the lab against off |
| Cut fast, return slowly | TCP congestion control | the indexer, the ladder | the same shape for verger's reductions of itself |
| Keep the recorder on | Mars Pathfinder | flight recorder, 48 lines | outcome records and loop 2 actions in the recorder |
| Shedding stops where it does not help | ADR D10 | thread contention only | rule 1 above, for every account |

## Implementation plan

Within verger's scope only. Each phase ends working, tested at G1/G2 here, and the device panel
(A52, A24) later. Loop 1's envelope (verger-p5) is built alongside; loop 2's rules land in the
same policy so p4 stays unchanged and comparable.

| Phase | Builds | Acceptance |
|---|---|---|
| 1. Outcome ledger | outcome records for every move: relieved, held, withdrawn, agility, quality cost; on the snapshot and in the flight recorder; pure TypeScript | replayed streams give the expected outcome per move; agility measured on synthetic strain |
| 2. Self-cost meter | native counters for verger's thread CPU, wakeups and bridge events; JS bridge-event counter; `verger-self` in the registry; a budget in config | counters read on the JVM (Kotlin) and in Vitest; cost reported beside the off arm in replay |
| 3. Loop 2 rules | rules 1 to 4 and 6 above as declared policy rules, each an event with a reason; floors for heat and memory sensing | each rule fires and undoes itself on synthetic streams; replay reproduces it; p4 unchanged |
| 4. Telemetry flowing | the sink port with observe levels; a local file sink for dev builds (with session recording, task 9); reports of the table above | a dev session exports a file that replays to the same decisions; byte count per session measured |
| 5. Loop 3 tooling | replay comparison of two policies and of verger against off on the same recording; a written report format | p4 against p5 on a recorded session shows outcomes, cost and quality side by side |
| 6. On the phones | the first Gradle build; recordings from the A52 and A24 in shadow and active | essential variables measured with verger off and on; graduated-evidence statement |

Order matters once: the outcome ledger comes first, because every later rule and report reads it.

## Sources

Found by web search on 2026-10-24. **None of these pages was opened**: the session's network
policy denied them, so what this doc says of them rests on search-result summaries of secondary
sources (lecture notes, encyclopedia entries). Before any claim here is quoted as research,
open the primary texts: Ashby, *Design for a Brain* (1952, 2nd ed. 1960); von Foerster,
*Observing Systems* (1981); Kramer and Magee (below); Argyris and Schön, *Organizational
Learning* (1978).

- [Second-order cybernetics](https://en.wikipedia.org/wiki/Second-order_cybernetics): von Foerster's 1974 distinction between observed and observing systems; "the control of control".
- [Di Paolo, Adaptive Systems lecture 3, University of Sussex](https://users.sussex.ac.uk/~ezequiel/AS/lectures/AdaptiveSystems3.pdf): Ashby's double feedback, essential variables and step functions.
- [Battle, Ashby's mobile homeostat, UWE](https://uwe-repository.worktribe.com/output/808168/ashbys-mobile-homeostat): the homeostat's construction and ultrastability.
- Kramer, J. and Magee, J. "Self-Managed Systems: an Architectural Challenge." Future of Software Engineering (FOSE '07), ICSE 2007, pp. 259–268: the three-layer reference model (component control, change management, goal management), after Gat's three-layer robot architecture.
- [Double-loop learning](https://en.wikipedia.org/wiki/Double-loop_learning): Argyris and Schön, governing variables.
- The lineage sources in [lineage-and-recovery.md](lineage-and-recovery.md) (Odyssey, Flinn and Satyanarayanan, autonomic computing, brownout, Erlang/OTP, Google SRE, ADPF, TCP, Mars Pathfinder).
