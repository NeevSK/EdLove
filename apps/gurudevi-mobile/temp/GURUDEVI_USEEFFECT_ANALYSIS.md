# Gurudevi Mobile — useEffect Risk Analysis & Modern Alternatives
**Code-verified, not doc-pattern-matched. Snapshot 2026-08-31, stack: React 19.2.3 / Expo Router 57 / TanStack Query 5.102 / Zustand 5.0.15**

Every claim below is either (a) read directly from your source, with the
file path given, or (b) a general React mechanism, in which case it's
flagged as general knowledge, not a claim about your code specifically.
Where I checked for a pattern and it *wasn't* there, I say so — this isn't
a document that finds a problem in everything it looks at.

---

## Part 1 — Why "useEffect is a timing bomb" is a real critique, not folklore

The phrase overstates it slightly, but the underlying mechanism is real
and has a precise shape. Four separate failure modes get bundled under
that one nickname:

### 1. Effects run *after* paint, not *with* your state change
When state changes, React re-renders and paints the DOM/screen — then,
separately, runs effects. There's a real window where the user has
already seen the new UI before your effect has done whatever it does
(fetch, subscribe, sync). If anything downstream depends on the effect
having completed, and reads state during that window, it reads a version
of the world that's technically already stale relative to what's on
screen. This is the precise mechanism behind "the UI shows the wrong
thing for a moment."

### 2. Dependency arrays are manually maintained, and wrong ones don't error
A dependency array is supposed to list every reactive value the effect
body reads. Get it right and effects re-run exactly when they should. Get
it wrong — omit something — and the effect body keeps a **stale
closure**: a snapshot of a variable's value from whichever render created
the function, even after the real value has moved on. Nothing throws an
error. Nothing turns red. It just silently uses old data. This is the
single most common source of "worked in dev, broke in prod" effect bugs
industry-wide, and it's inherent to how JavaScript closures work, not a
skill-issue specific to any team.

### 3. Independent effects have no ordering contract with each other
Two `useEffect` calls in the same component are guaranteed to *run* in
the order they're declared — but if each one kicks off async work (a
fetch, a WASM load, a subscription), **when each one's async work
finishes is not ordered at all.** That's the actual "bomb": it's not that
the code is wrong, it's that its correctness quietly depends on which
network response or which promise happens to resolve first on a given
run, on a given device, on a given network. Same code, different outcome,
run to run. This is a genuine **race condition**, not a bug in the
colloquial sense — there's no single line you can point at as "the bug."

### 4. Effect chains ("waterfalls") compound all three
When effect A sets state that's in effect B's dependency array, which
sets state that's in effect C's — each hop costs a full render, and each
hop is a fresh opportunity for #1–#3 to bite. A boot sequence built from
13 independent effects (see Part 3) isn't wrong because 13 is a big
number — it's wrong because 13 independent, un-ordered async operations
racing during the highest-stakes 2 seconds of the app's life (cold start)
maximizes the odds that #3 actually manifests as a user-visible bug.

**The reframe React's own docs use (this is their words, not mine,
paraphrased):** an Effect is an escape hatch for synchronizing your
component with something *outside* React — a browser API, a subscription,
a non-React widget. It is explicitly **not** meant as a general-purpose
"run this when that changes" tool for computing values or sequencing
application logic. Every one of the four failure modes above comes from
using it as the second thing instead of the first.

**What changed recently, and matters for your exact version:** React
19.2 (you're on 19.2.3) **stabilized `useEffectEvent`** — this was
experimental through 19.0/19.1 and is now a real, production-safe hook.
It exists specifically to fix failure mode #2: it lets you read the
*latest* value of something inside an effect without putting it in the
dependency array and without it being a stale closure. That's a precise,
available tool for several of the exact patterns found below — not a
someday-feature.

---

## Part 2 — Modern elegant alternatives, matched to what you already have installed

You don't need new dependencies for most of this. That's the more
important finding — see Part 3.

| Instead of… | Use… | Why it's better | Status in your repo |
|---|---|---|---|
| `useEffect` + `useState` to fetch/cache server data | **TanStack Query** (`useQuery`/`useMutation`) | Handles loading/error/retry/cache/dedup for you; no hand-rolled race guards needed | **Already installed, already used in 17 files** — just not everywhere it should be (see §3.3) |
| `useEffect` + `useState` to subscribe to an external mutable source (AppState, a Supabase realtime channel, a native event emitter) | **`useSyncExternalStore`** | React's own primitive for exactly this; avoids "tearing" under concurrent rendering, no manual cancel-flag needed | **Zero usage anywhere in your codebase** — two clear candidate sites exist (see §3.2, §3.4) |
| Deriving one piece of state from another via an effect | **Compute it during render** (or `useMemo` if expensive) | No extra render, no extra state, no chance of the two falling out of sync | Not separately audited file-by-file here — worth a follow-up grep for `useEffect` bodies whose entire content is a `setX(f(y))` call |
| Reading a prop/state's *latest* value inside a subscription/interval callback without wanting it to retrigger the effect | **`useEffectEvent`** (stable in your exact React version, 19.2) | Purpose-built fix for stale closures without over-firing | Not used anywhere yet — direct candidate in `useAuthLifecycle.ts` and `useWorkspaceLayoutSync.ts` (see §3) |
| A sequence of steps that must happen in a specific, enforced order (boot, onboarding) implemented as N independent effects | **A state machine** (XState, or a hand-rolled discriminated-union reducer if you want zero new dependency surface) | Makes the sequence a first-class, inspectable, testable thing instead of an emergent property of 13 promises racing | **XState 5.32.6 is already in `package.json` — with zero imports anywhere in the codebase.** This is the single most "already paid for, not yet used" fix available to you. |

---

## Part 3 — What I actually found reading your hooks (not the docs about them)

This is the part done by opening files and grepping consumers, per your
ask — not summarizing prior AI-written audits.

### 3.1 `app/_layout.tsx` — 13 effects, no shared sequencing contract
Already covered in the temporal-flow audit; repeated here because it's
the canonical live instance of failure mode #3/#4 above. Cedar WASM
warm-up, a permission-snapshot network call, font loading, and PowerSync
bootstrap all fire independently with no declared ordering between them.
**This is the single best candidate for an actual XState machine** —
you already have the dependency, it currently has zero purpose in your
codebase, and this is exactly the class of problem it exists to solve.

### 3.2 `packages/core/src/hooks/useAuthLifecycle.ts` — live, real subscribe-after-fetch gap
`fetchAndSetUserProfile()` sets `user.id` in the store; only *after* that
does a `useEffect` (keyed on the new `user.id`) open a Supabase realtime
subscription for `UPDATE`s to that row. If a backend write (e.g. syncing
a Google display name post-signup) lands in the gap between "id is set"
and "channel finishes connecting," it's silently missed — nothing
re-fetches. This is a plausible (not proven — I can't observe runtime
timing) mechanism for the guest-banner/name-not-syncing bug logged in
your own `issues_i_saw.md`.

**Direct fix candidates:**
- `useSyncExternalStore` for the subscription itself, so "is subscribed"
  and "current value" can't drift apart the way a separate `useState` +
  `useEffect` pair can.
- Alternatively, keep the effect but add an immediate `refreshProfile()`
  call right after the channel subscription confirms open (not just after
  the initial fetch) — closes the gap without a rearchitecture.

### 3.3 `packages/core/src/native/useWorkspaceLayoutSync.ts` — well-built, and completely unused
Read in full. This is, structurally, **the best-written effect code in
the codebase** — every async effect has a real cancellation guard
(`isMounted`/`isCancelled` flags scoped per-effect, not a global
"mounted" ref), the remote sync is properly debounced (1200ms
`setTimeout` with cleanup), and there's a "last synced" ref to avoid
redundant writes. This is what "doing it right with raw `useEffect`"
looks like.

**Verified via grep: it has zero consumers anywhere in the app.**
`useWorkspaceLayoutSync` is exported from `@repo/core/native` and never
imported by any screen. Nobody uses it. Whatever actually drives
workspace layout today does something else — worth finding out what,
because either this hook is genuinely dead and should be deleted, or a
screen *should* be using it and currently isn't (meaning workspace
layout persistence may not actually be working end-to-end).

**Also worth noting:** even at its best, this hook hand-rolls exactly
what TanStack Query's `useQuery` (for the read) + `useMutation` (for the
debounced write, via its built-in mutation queue) would give for free —
loading/error state, retry, cache invalidation. Since Query is already a
dependency and already used elsewhere in your codebase, this file is a
good candidate to rewrite on top of it rather than maintain by hand.

### 3.4 `packages/core/src/hooks/useAppLifecycle.ts` — a whole file of correct patterns, unused, and one has a real bug
This file is the most interesting find in the whole audit. It contains:

- `useAbortController`, `useMountedRef`, `useSafeState`, `useSubscription`
  (with a proper per-effect `cancelled` flag) — **all textbook-correct
  defensive hook patterns.** Someone building this file knew exactly what
  the risks are.
- **Verified via grep: every single one of these has zero consumers
  anywhere in the app.** Only the plain, non-hook `AppLifecycle` object
  (`onAppStateChange`, `getCurrentState`) is used, once, in
  `SanctuaryProvider.tsx`.
- `useMount` and `useUnmount` — meant to run a callback once on
  mount/unmount — **both list `callback` in their dependency array.** If
  a caller passes an inline arrow function (the natural way to call a
  hook like this), a new function reference is created every render,
  which means the dependency array changes every render, which means
  **"run once" is not actually true — it re-runs on every render** unless
  the caller separately memoizes the callback with `useCallback`. This
  directly contradicts the hook's own name and docstring. It's a live
  bug — currently harmless only because, per the grep above, nothing
  calls either hook yet.

**Why this matters more than a simple bug report:** this file is proof
that the codebase has, at some point, correctly diagnosed the exact
class of problem this whole document is about — and built the right
fix — and then never adopted it anywhere. That's not a knowledge gap.
It's a wiring gap, which matches exactly what you asked me to look for
in the previous turn.

### 3.5 XState — the clearest "already paid for" fix in the entire audit
`xstate@5.32.6` sits in `apps/gurudevi-mobile/package.json`.
`grep -rln "from 'xstate'"` across the entire source tree returns
**nothing.** Someone added this dependency, presumably with the boot
sequence or onboarding state machine in mind (both are named as
candidates in your own docs), and it has never been imported once.

### 3.6 What I checked for and did *not* find (for balance)
- `useEffect(async () => {...})` — the classic "passing an async function
  directly as the effect callback" mistake. **Not present anywhere.**
- The StrictMode double-invoke workaround anti-pattern (a `hasRun`/
  `didMount` ref used to suppress React 18/19's intentional double-firing
  of effects in dev). **Not present anywhere.**

Both are good signs — whoever wrote the effect-heavy files knew enough
to avoid the two most common beginner mistakes. The problems that exist
here are more subtle (ordering, adoption, dependency-array edge cases),
which is consistent with a codebase built by capable-but-uncoordinated
sessions rather than a careless one.

---

## Part 4 — Priority order

1. **Wire `useWorkspaceLayoutSync` in, or confirm it's dead and delete
   it.** Right now nobody knows which, and that's worse than either
   answer alone.
2. **Fix `useMount`/`useUnmount`'s dependency array** in
   `useAppLifecycle.ts` before anything adopts them — 5-minute fix
   (wrap in `useRef` for the latest callback instead of putting it in
   deps), currently latent only by luck of being unused.
3. **Close the subscribe-after-fetch gap in `useAuthLifecycle.ts`** —
   this is the best current lead on the real, user-reported guest-banner
   bug.
4. **Model the boot sequence in XState** — the dependency is already
   installed, currently doing nothing. This is the highest-leverage fix
   in the document because it converts an emergent, hard-to-reason-about
   property (13 racing effects) into an explicit, inspectable one.
5. Consider `useEffectEvent` for any subscription/interval callback that
   currently needs to read "latest" state without wanting to re-fire —
   it's stable on your exact React version, not a someday-tool.
