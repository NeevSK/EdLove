# Guide: SQLite, Drizzle, and PowerSync — How Data Actually Moves

**Date:** 2026-06-19
**Type:** Concept guide (not a decision record)
**Companion to:** 2026-06-19-sanctuary-authorization-final-architecture.md — that document covers *who is allowed to do what* (Cedar). This document covers *how data physically gets written, stored, and synced* underneath that — independent of permissions.

**Audience:** written for a reader who knows what a database is conceptually but has not worked with SQLite, Drizzle, or PowerSync specifically. No prior assumed knowledge of these three tools.

---

## 1. The Three Layers, and the Job Each One Actually Does

A lot of confusion in this area comes from not having clean boundaries between three things that get talked about as if they're one thing. They are not. Each has exactly one job.

| Layer | What it actually is | Its one job | What it does NOT do |
|---|---|---|---|
| **SQLite** | A real, full database — just one that lives as a single file on the device instead of on a server | Store the data, physically, on the phone | Doesn't know about syncing, doesn't know about permissions, doesn't know about your app's concepts (teacher, classroom) — it only knows tables and rows |
| **Drizzle** | A TypeScript library that lets you write database queries as JavaScript-like code instead of raw SQL text | Translate your code (`db.update(classrooms)...`) into the actual SQL text SQLite understands | Doesn't store anything itself, doesn't sync anything, doesn't check permissions |
| **PowerSync** | A syncing system | Keep the on-device SQLite file in agreement with the server's copy of the data, in both directions | Doesn't know what a "classroom" is, doesn't check who's allowed to do what, doesn't generate SQL itself |

**The plain-English chain:** your app code calls Drizzle → Drizzle turns that into SQL text → SQLite executes that SQL text and stores the result on disk → PowerSync notices the change and eventually carries it to/from the server.

None of these three tools talks to Cedar, and Cedar doesn't talk to any of them directly either — which is why the *interceptor* exists as a separate fourth piece, sitting in between, deliberately. More on that in Section 3.

---

## 2. Why a File on a Phone Can Act Like a Real Database

This part can feel unintuitive, so it's worth slowing down on.

A database server (like the kind your Hono Gateway talks to) and SQLite are, conceptually, the same kind of thing — both store rows in tables, both understand the same query language (SQL) to a large degree. The difference isn't capability, it's **where it lives and who else can reach it.**

- A server database: lives on a machine somewhere else, reachable over the internet, can serve many devices/users at once.
- SQLite: lives as a literal file (something like `gurudevi.db`) sitting in your app's private storage on the phone, reachable only by that one app, on that one device.

This is *why* offline-first is even possible at all: the phone has a genuinely complete, fully-functional database sitting on it, not a cache or a stripped-down placeholder. When there's no internet, the app isn't "broken" or "limited" — it's reading and writing to a real database that just happens to be local.

**This is also exactly why a permission check is needed locally too.** If SQLite is a real, fully capable database, it will faithfully execute *any* instruction it's given — including ones it shouldn't allow. SQLite has no idea what a "teacher" is or who owns what. It will update any row it's told to update. Nothing about SQLite itself prevents misuse — which is precisely the gap the Cedar-WASM interceptor exists to close, covered in the companion ADR.

---

## 3. The Actual Sequence of a Write, Start to Finish

Let's walk one concrete action all the way through, naming every step plainly.

**Scenario:** a teacher, offline (no internet), edits a classroom's name and taps Save.

1. **App code runs.** Your React component calls something like `updateClassroom(id, newName)`.
2. **Drizzle builds the instruction.** Drizzle takes that function call and constructs the underlying SQL instruction — something equivalent to *"in the classrooms table, change the name to X, for the row where id = this one."* At this point, nothing has happened to the database yet — this is just an instruction being assembled.
3. **The interceptor steps in.** Before that instruction is allowed to actually run, a piece of code (`createSecureDrizzleProxy`, discussed in the companion ADR) catches it and asks: *who is this row's current owner, and is the current user allowed to do this to it?* This is where Cedar gets consulted.
4. **If allowed, the instruction executes against SQLite.** SQLite physically updates the row in the file on disk. The classroom's name is now actually changed, on the device, right now — no internet required for this step.
5. **PowerSync notices the change.** PowerSync watches for local changes to the SQLite file and queues them to be sent to the server *whenever a connection becomes available.* This can be seconds later, or hours later — it doesn't block step 4 from happening.
6. **Eventually, sync happens.** When the device reconnects, PowerSync sends the queued change up to the server, and the server's own database (and its own, separate, authoritative Cedar check) processes it for real, permanently, centrally.

**The important plain-language point:** steps 1–4 are "did the thing happen on this device, right now." Steps 5–6 are "does the rest of the world eventually find out about it." Those are genuinely decoupled — and that decoupling is the entire mechanism that makes offline-first work at all.

---

## 4. Why the "Parse the SQL Text" Problem Exists at All

This connects directly to something covered in the Cedar ADR, but explained here without any code, since the *why* belongs in the mechanics layer, not the authorization layer.

In step 3 above, the interceptor needs to know "which row is this about?" — but by the time Drizzle has built the instruction, it's just SQL text and a list of values, sitting in memory for a split second before being run. There's no neat, separate "here's the row id" label attached to it — that information is *embedded inside the instruction itself*, the same way the address is embedded inside an envelope rather than written on a separate sticky note.

So the interceptor has to briefly "open the envelope" — look at the instruction's text — to find the id before letting the instruction proceed. That's the entire reason any text-parsing is needed at all: it's not a design flaw, it's a direct consequence of *where* in the process the permission check has to happen — after the instruction is built, but before it's executed.

---

## 5. Performance — What Actually Costs Time, Plainly

To directly answer the worry about performance, without jargon: there are exactly two different situations, and only one of them costs anything noticeable.

**Situation A — saving one thing (a single write).** Looking up one row, asking Cedar one question, then saving — this is a handful of milliseconds. A human tapping "Save" cannot perceive this. This is not a performance problem, full stop.

**Situation B — displaying many things at once (a list of 50 classrooms).** If you naively asked the same one-row-at-a-time question 50 times *while the screen is trying to draw*, that adds up enough to cause visible stutter. This is the situation that actually matters for performance — and it's solved not by making the check faster, but by doing all 50 checks *once, when the list is loaded*, before the screen ever tries to draw it. (This is covered fully in the Cedar ADR's Section 5 — the "Shape 1 / Shape 2" pre-computation approach.)

So: writes (saving) are cheap by nature. Reads that render many items (lists) need the pre-computation strategy. Those are the only two performance-relevant shapes in this entire system.

---

## 6. Multi-Account — What's Already True Today

Multi-account is **not** a future concern — it's a foundational decision already made and already implemented:

- **Each account has its own separate SQLite file.** Not separate rows in a shared file — an entirely separate file, per account, on the device.
- **Plain-language reason this matters:** this means one account's data physically cannot leak into another account's queries by accident, because there's no shared file for a bug to cross between. A mistake in one account's database session has no file-level path to reach another account's data.
- **What this means for everything described above:** every step in Section 3 happens *within the context of one specific account's SQLite file.* The interceptor, the Cedar check, the PowerSync sync queue — all of it operates per-account, scoped to that account's own file, not shared infrastructure with cross-account logic bolted on.

This is worth naming explicitly because it means a large category of multi-tenancy bugs (cross-account data leaks at the storage layer) is already structurally prevented by the file-per-account decision — not by a permission check catching it after the fact, but by there being no shared file for the leak to happen through in the first place.

---

## 7. Multi-Device — Door Left Open, Not Yet Designed

This is explicitly **not** designed yet, and this section exists only to name where the seams are, so that nothing built now accidentally closes a door that should stay open.

**The plain-language version of the future problem:** today, the mental model is "one account → one SQLite file → one device." Multi-device means the same account's data needs to exist correctly on *more than one device at once* — e.g. a teacher's phone and laptop both having a usable, syncing copy.

**Why this isn't solved by "just sync more" — named honestly, not solved:**
- PowerSync already syncs a device's local file *with the server.* Multi-device doesn't change that part — each device still syncs with the server, not directly with each other.
- The open question is conflict handling: if the same teacher edits the same classroom on their phone while offline, and on their laptop while offline, at the same time, which edit wins when both eventually sync? This is a real, unresolved design question — not a mechanics detail, a genuine future decision.
- The interceptor and Cedar check described in Sections 3–4 don't need to change for multi-device — they're already scoped to "this device, this account, this write." The part that *would* need new design is what happens at the sync layer when two devices' independent offline writes meet at the server.

**What "keeping the door open" means concretely, right now:** nothing in the current architecture assumes only one device will ever exist per account. The per-account file scoping (Section 6) is device-agnostic by nature — it's scoped to the account, not hardcoded to "the one device this account lives on." That's the right foundation to have already, even with the harder conflict-resolution question deliberately deferred.

---

## 8. Summary — The Mental Model to Keep

- **SQLite** = the real, complete database, just living as a file on the phone instead of a server.
- **Drizzle** = the translator from your app's code into the SQL text SQLite runs.
- **PowerSync** = the courier that eventually reconciles the phone's file with the server's copy — decoupled in time from when writes actually happen.
- **The interceptor** (covered fully in the companion ADR) = the one piece that briefly inspects an instruction before it runs, so Cedar can be asked "is this allowed" — this is why some SQL-text parsing is unavoidable, not a design mistake.
- **Multi-account** = already solved, structurally, via one-file-per-account — not a future task.
- **Multi-device** = deliberately deferred; today's foundation doesn't block it, but conflict resolution across devices is a real, undesigned problem to return to later.
