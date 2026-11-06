---
title: "Road to a Hardened v1"
status: "active"
created: 2026-11-06
updated: 2026-11-06
author: "Naveen"
scribe: "Claude"
tags: [architecture, api, roadmap, production, security, gates]
---

# Road to a Hardened v1

How the pieces come together into a secure, production-grade `/api/v1`. This document defines
the gates and their evidence. It doesn't track status: layer status lives in the
[playbook](../../apps/sanctuary-api/docs/architecture/api-engineering-playbook.md#horizontal-layers-the-base-every-domain-stands-on)
and daily tasks in the [handoff](../../apps/sanctuary-api/docs/current_progress/2026-11-02-foundation-follow-ups.md).

## What v1 means

v1 isn't every feature. It is **a contract and a bar**: one API, where every capability and
every channel goes through the same identity, authority, durable command and audit path, and
where each claim below has evidence. Features then arrive without lowering it.

## What holds it together

Five things, each enforced by something other than memory:

| Mechanism | What it stops | Enforced by |
| --- | --- | --- |
| Every fact has one owner | Parallel versions of the truth | [Platform map](platform-map.md), module catalog tests |
| One path for every change | Back doors for bots and agents | Handlers get no database pool, `audit:api-composition` |
| Everything closed until declared | Exposure by accident | Capability catalog, Cedar default deny |
| The same scenarios on every channel | Channels drifting apart | [Conformance suite](channel-admission-model.md#what-to-build-in-one-seam), to be built |
| Evidence named by level | "Tests passed" meaning nothing | G0–G5 and R1 in `AGENTS.md`, the gates below |

## Where we stand (2026-11-06)

- **Not landed.** The reset and Arrive are uncommitted. The hosted API is pre-reset, with no
  `/api/v1`.
- **Evidence so far:** G4 Metro Android bundle; API 99/99, policies 88/88 at G1. Nothing on a
  device, and the migrations have run nowhere hosted.
- **Known failures:** 79 mobile type errors; 11 mobile entry tests and 3 suites, including a QR
  link test where an invalid action passes through.
- **Not yet safe in production:** an old database policy lets any signed-in person give
  themselves an admin or principal bond. The fix is in unrun migration `20261106010000`, so
  this gets more urgent, not less.

## The gates

Each gate needs the one before it, except where noted.

**Owner's order (2026-11-06):** the horizontal foundation first: audit, admin safety and web,
then the rest of the base, with the API working. Onboarding, authentication journeys and Self
come after that, on a finished base. Guardian rules and outside channels are deferred;
Telegram, WhatsApp or both may be tried later. So Arrive on a phone moved after the base.

### Gate 1: land it

Get the real thing running, and the old API gone.

1. Check the QR test failure. It is a security path.
2. Add provenance columns to `api_command_audit` before its migration runs; adding them is
   cheapest now.
3. Review deletions, then commit the reset and Arrive separately.
4. Check what still depends on the old API: the PayHere webhook and sync upload. Web stops
   working at the switch, with 44 files importing the retired client.
5. Run migrations `20261030020000`, `021000`, `022000`, `20261104010000`, `20261106010000` on a
   copy first. **Owner's yes needed.**
6. Set Render's environment and snapshot keys in Doppler, deploy, and remove the old code path.

**Evidence:** `/health/live` reports `generation: v1`; old paths return 404; a client can no
longer insert its own bond, shown on the real database.

### Gate 2: the caller seam

[The small shared piece](channel-admission-model.md#what-to-build-in-one-seam): `Caller`,
catalog declarations, `Platform::Agent` with a live grant, step-up declaration, the run
contract and cost budgets. Only the contract and default deny; no channel behind them.

**Evidence:** G1 decisions tests covering agent ∩ person, revoked grant, wrong channel and
command refused for an ephemeral run. G2 on the real database for revoke-under-lock.

### Gate 3: finish the base (layers 0–7)

Audit trail with chaining and sensitive reads, records lifecycle, sharing grants and consent,
budgets and durable effects, with failure handling for every outside call.

**Evidence:** The [horizontal acceptance matrix](../../apps/sanctuary-api/docs/architecture/api-engineering-playbook.md)
green with named levels, proven with synthetic capabilities and no product policies.

### Gate 4: prove the channel promise

The conformance suite, run against the app and one synthetic second channel. The audit gate
extended so an adapter can't import a domain or a database pool, and a capability can't open a
channel without declaring it. Tokens tested against the wrong audience.

**Evidence:** Same denial, commit, replay, revocation and unknown-outcome behaviour on both.
This proves shared semantics, not a real provider.

### Gate 5: web on v1

The gate itself is moved: the API allows configured origins with bearer tokens only, and web's
sign-in gate, device account list and workspace switcher read `identity.entry`. The active bond
is a browser cookie, only ever a choice among bonds the server lists. Still to do: password and
credential screens (`securityClient`), which need v1 capabilities; onboarding, with Arrive.
Domain screens (library, community, attendance and others) move when their domain does, and keep
their routes until then.

**Evidence:** G4 in a real browser, with cross-origin requests refused and no legacy imports.

### Gate 6: Arrive works on a phone

Guest, sign in, first bond, signed snapshot, the right tabs, offline restart. Self and onboarding
on web and mobile.

**Evidence:** G5 on a physical Android device; type errors at zero.

### Gate 7: production bar

[Ready for production](../../apps/sanctuary-api/docs/architecture/api-foundations/scale-and-production-operation.md#ready-for-production-means)
already lists hosting, the morning load test, a restored backup, migrations on a copy, tested
alerts, and incident and revocation drills. Add:

- **Dependencies:** oRPC is `2.0.0-beta.46` and Hono is `5.0.0-rc.1`. Accept these with a named
  owner and a pin, or wait for stable. A conscious decision, not drift.
- **Keys:** rotation drilled for snapshot signing, the `service_role` key and webhook secrets.
  Rotate the Stitch keys that were pasted in chat.
- **Independent review:** an outside penetration test, focused on bonds, minors and offline
  snapshots. Our own tests can't stand in for it.
- **Law:** review under Sri Lanka's data-protection law, including children's data and
  processors abroad. Region decided with this.
- **Service objectives:** agreed numbers for the morning burst, which are still open.

**Evidence:** R1 canary with a first pilot school. This doesn't prove national scale: that needs
measurement at that size, which the [scale guide](../../apps/sanctuary-api/docs/architecture/api-foundations/scale-and-production-operation.md) treats separately.

### After the gates: open things one at a time

1. **First domain** through the [design method](domain-design-method.md). Picking it is an owner
   decision. Gate 7's pilot needs at least one, so this and Gate 7 meet at the pilot.
2. **Outbound notices** on WhatsApp or Telegram.
3. **Remote MCP**, read-only, after the [token spike](channel-admission-model.md#d3-an-mcp-token-must-not-open-the-database).
4. **The AI companion and first ephemeral worker**, after the [one real spike](agent-infrastructure-layer.md#at-stage-e-when-the-first-agent-feature-is-chosen).
5. **Inbound chat commands**, then **WebMCP** if people need it.

Each passes the [admission checklist](channel-admission-model.md#admitting-a-channel).

## What not to do

- Don't build a channel or an agent feature before Gate 4. It would invent its own path.
- Don't call a gate done from a green source scan. Each gate names its evidence.
- Don't deploy to prove progress before the bond policy fix runs with it.

## Build order after the foundation (owner direction, 2026-11-06)

Each step ends with a person using it on a phone.

1. **Commit the work.** The reset, Arrive and upgrades are uncommitted.
2. **Signed-in authority on the phone.** `authority.refreshSnapshot` returns the signed snapshot,
   so permissions work without sync.
3. **Deploy the API** so the app works without a laptop. Set browser origins and snapshot keys.
4. **Finish Self.** Wellbeing subdomain cards, then `wellbeing.*` commands, then the sync connector
   for person-owned data: journals across devices and guest conversion upload.
5. **Workspace.** Cards first for Learning, Institution operations and Family, settling who owns
   attendance and the ownership map. Then classroom and attendance as the first institutional slice.
6. **Community, Library, Profile and settings.** A card for each, then build one at a time. Minors
   and moderation are part of Community's design from its first card.
