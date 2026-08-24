---
title: "Community Domain â€” Full Exploration"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, files]
---

# Community Domain — Full Exploration

Audit of `packages/community` + the real backend (`apps/sanctuary-api` + `packages/core/src/api/handlers`) against the design intent stated directly: feed mostly chronological with some latest/important/urgent surfacing, upward scroll, comments threaded-and-chronological-latest-first, plus DMs and groups.

## Major architectural discovery — resolves several previously-open questions at once

Tracing `getPosts` through to the real backend revealed `apps/sanctuary-api/src/core/app.ts` — a mature, comprehensive, fully-registered API surface the team calls **"Sovereign Routes"** organized as **"Vertical Slices"** (contract + handler pairs per domain: self, profile, community, dailyContent, educational, grading, operations, identity, onboarding, admin, library, sync), built on `OpenAPIHono` + Zod contracts.

**This definitively resolves `06-query-patterns.md`'s "genuinely undecided" API paradigm question — it's Hono RPC (OpenAPIHono + typed contracts), fully built, not REST, and not actually undecided.** The client-side calls (`client.api.community.posts.$get(...)`) confirmed this is a real, typed, end-to-end RPC pattern, not a guess.

**Also confirmed in the same pass, several other previously-open items:**
- **PowerSync's write path is real**: `syncContract.uploadPowerSyncBatch` is a registered route — directly validates `04-network-transport.md`'s PowerSync section.
- **`pricing_tier` is genuinely live**, not a schema stub: a real PayHere webhook handler (PayHere is Sri Lanka's own payment gateway) verifies an MD5 signature and upgrades `pricing_tier` to `'PRO'` on successful payment — closes the wellbeing audit's open question about whether this field does anything real.
- **An `x-idempotency-key` header already exists in the CORS allow-list** — this may already be the fix needed for the OCR bulk-import bug found in the classroom audit (no idempotency guard on `studentsAPI.create`). Worth checking whether this header is actually *used* anywhere yet, or only allow-listed and unused — a real, concrete follow-up.
- **Cache-Control middleware exists specifically for `/api/library/*` routes** — confirms deliberate caching strategy for library, relevant to `07-library-media.md`'s delivery-infrastructure section.

## Feed ordering — confirmed against your stated intent, and it's simpler than the intent describes

**The real handler:** `db.post.findMany({ where: { group_id }, take, skip, orderBy: { created_at: 'desc' } })`. **Purely reverse-chronological — no urgency, priority, or pinning field exists anywhere in this query.** Your stated intent ("mostly chronological, but some way to give latest/important/urgent things — time dimension matters") is **not yet implemented at all**, not partially built or misconfigured. This is a clean, precisely-identified gap, not something to reverse-engineer from existing code.

**`AnnouncementsScreen.tsx` exists as a wholly separate surface** (`announcementAPI.getAnnouncements`, its own screen, its own query) — this may already be the team's chosen solution to "urgent/important" surfacing: a dedicated always-visible space for important content, rather than weaving urgency into the main feed's sort order. This is architecturally defensible and arguably cleaner than sort-order urgency weighting — worth confirming this is the intended design before adding a separate pinning/urgency mechanism to the feed itself, since the feature may already exist, just as a different surface than "the feed."

## Confirmed: the offset-pagination anti-pattern is now found in four places, not one

`skip`/`take` (Prisma/ZenStack terms for offset/limit) confirmed here too — the same pattern found in Library's `useLibrary.ts` and the client-side community hooks, now confirmed server-side as well. **This is a systemic, repeated pattern across the whole codebase** (self implicitly via flat `LIMIT`, library client-side, community client-side, community server-side) — worth fixing once, centrally, ideally via a single shared keyset-pagination utility/hook that every domain adopts, rather than four separate patches.

## Comments — real and working, but two concrete mismatches against your stated intent

**First, the good news: comments are real, not scaffolding.** `community_comments`/`community_comment_upvotes` were flagged as schema-drifted in the classroom audit's 47-table list — confirmed here as the same "legitimate but undeclared in ZenStack" pattern as `audit_logs`, not orphaned code. There's even a real-time subscription on `community_comments` (`comment.hooks.ts`), meaning comments update live without a manual refetch.

**Mismatch 1 — ordering is the opposite of "latest first":** `communityRepository.ts`'s `getComments` does `.order('created_at', { ascending: false }).limit(limit)` **then calls `.reverse()`** on the result before returning it. The final order delivered to the client is **oldest-first** — the descending fetch exists only to make sure the *most recent* N comments are the ones selected when there are more than the limit, then they're flipped to read top-to-bottom like a conversation. This is a reasonable design for "read a conversation naturally," but it's the **opposite of what you specified** ("latest first"). **See the correction directly below — this finding's live/production status is now uncertain, not confirmed.**

**Mismatch 2 — no threading exists at all.** No `parent_comment_id` or reply-to field anywhere in `schema.zmodel`, the insert, or the select. Comments are a flat, single-level list per post. Your stated "threaded" requirement is a genuine, unbuilt feature, not a bug — needs real schema work (a self-referencing `parent_comment_id` on `community_comments`) plus corresponding query/UI changes (nested rendering in `CommentSheet.tsx`), not a quick patch.

## Correction to the comments finding above, and a more serious governance issue underneath it

**The `.reverse()` ordering bug and missing-threading finding above need a precision correction: they were found in `SupabaseCommunityRepository` (`packages/core/src/adapters/supabase/communityRepository.ts`), not the path the real `CommentSheet.tsx` actually calls.** Tracing precisely: `comment.hooks.ts` calls `communityAPI.getComments`/`createComment` (`packages/core/src/api/community.ts`), which makes a Hono RPC call to `community.posts[':postId'].comments.$get`. **No backend route or handler exists anywhere for this endpoint** — zero matches for "comment" in `apps/sanctuary-api/src/core/app.ts` or any handler file. Meanwhile, `SupabaseCommunityRepository`'s own `getComments`/`getPosts` (where the `.reverse()` behavior actually lives) is wired up via `community.factory.ts`, but its only confirmed caller found in this pass is `demoProvider.ts`'s mock-data provider.

**Honest status, not resolved further in this pass:** it's genuinely unclear whether real, live comments work in production at all right now — the intended Hono path appears to have no backend implementation, and the path that *does* have working logic (with the ordering/threading issues identified) may only be reachable in demo/offline-mock mode. This needs direct verification against a running instance or deployment logs, not further static tracing — flagged precisely as uncertain rather than guessed at.

## A repo-wide architectural governance issue, surfaced concretely by the comments investigation

**This directly answers a question raised mid-audit: should everything route through one central API, no exception, because bypassing it is more vulnerable? Yes — and this investigation is itself the concrete evidence, not just the reasoning.**

The codebase already contains a self-documented admission of this exact risk: an export literally named `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__`. Someone already recognized the danger and tried to prevent it through naming alone. It didn't hold — it's imported in `comment.hooks.ts` (legitimately, scoped only to the Realtime subscription channel) **and** in `communityRepository.ts` to back a full parallel implementation of `getPosts`/`getComments`, sitting alongside the "real," Hono-routed versions of the same functions. The result: two systems for the same feature, and — as this audit's own confusion in tracing it demonstrates — it is genuinely difficult, even under careful direct inspection, to determine which one (if either) is actually serving real traffic.

**Two structural exceptions are legitimate and shouldn't be designed away:** Realtime subscriptions and PowerSync's sync-down stream are inherently persistent connections, not request/response calls — they can't go through a central API in the same shape a `GET`/`POST` can. Both are read-only *notifications* in this codebase, not data-access bypasses, and both domains' **writes** already correctly route through the central API. The governance rule that actually fits the evidence: **no direct Supabase access for reads or writes that could reasonably be a request — Realtime subscriptions and PowerSync's stream are the only legitimate exceptions, and only for that narrow purpose.**

**Concrete, actionable recommendation:**
1. **Enforce this with tooling, not naming convention** — an ESLint rule or CI grep-check that fails any import of `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__` outside an explicit, tiny allow-list (the canonical PowerSync adapter, and files that only use it for `.channel()`/`.on('postgres_changes')` subscriptions). The current naming-only approach is proven, concretely, not to be sufficient.
2. **Resolve the comments gap directly, not incrementally** — either implement the missing Hono backend route (if Hono is the intended permanent path) or confirm `SupabaseCommunityRepository` is the deliberate, sanctioned implementation and delete the dead/aspirational Hono-calling code in `communityAPI.getComments`. Two parallel, partially-working implementations is worse than either one alone.
3. **Write this down as a formal rule**, ideally in `docs/architecture/architecture-guidelines.md` (confirmed to exist earlier in this exploration) — "no domain may call Supabase directly except via the canonical adapter, and only for Realtime subscriptions or the PowerSync bridge" — specifically because this is the exact kind of rule that needs to survive being applied by an AI agent who wasn't part of the original design conversation, which is precisely the risk you named.

## Two features that render but don't actually work — confirmed, not suspected

- **Poll voting is hardcoded mock data.** `usePollLogic`: `counts: {}, // Mock/Placeholder for now`, `totalVotes: 0`, with the comment *"This should eventually come from a query."* A poll UI likely renders and accepts votes, but nothing real is computed or displayed back.
- **The "Resonate" reaction is a literal no-op.** `usePostLogic`: `handleResonate: () => {}`, `hasResonated: false`, `isResonating: false` — all hardcoded, never wired to real state. Notably, "Resonate" connects directly to `packages/self`'s `ResonancePatternCard`/`ResonanceTimeline` components found in the wellbeing audit — confirming "Resonance" is a real, intended, cross-domain concept (self *and* community), currently only partially built on the self side and entirely stubbed on the community side.

## A genuinely good piece of temporal infrastructure — real, but not the biomimicry gap-closer it first appeared to be

`applyTemporalFilter`/`getTemporalRange` (`packages/core/src/logic/utils/temporalUtils.ts`) is used here (and elsewhere) to scope a query to whatever week/month/year the UI's `viewDate`/`viewScale` currently point at. It's genuinely well-designed — a real guardrail comment restricts its use to specific `TemporalCapability` types (`event_stream`, `business_fact`, `audit_history`), explicitly excluding `snapshot`-type data when viewing the present, and there's an honest, self-aware bi-temporal stub (`getTransactionRange`) admitting full valid-time/transaction-time separation isn't implemented yet. **Precise, fair characterization: this answers "what time window should this query scope to," not "how should this data be weighted, baselined, or gated over time."** It's real, good engineering, complementary to the biomimicry temporal patterns — but doesn't close the temporal-architecture gap confirmed in the wellbeing and classroom audits. Worth citing as the actual best-in-class temporal utility found in this codebase so far, distinct from `useTemporalStore` (pure UI-navigation state, no filtering logic at all).

## Groups — real, thoughtful taxonomy

`useCommunityGroups` classifies groups into classroom, club, interest/grade — and, more interestingly, **"sanctuary" groups** (your own school's, where you're a member) vs. **"galaxy" groups** (outside your school, or not yet joined). A genuinely nice naming choice, consistent with the app's broader Sanctuary branding (Sanctuary API, `SanctuaryManifesto`) — home vs. wider world, not just "mine vs. everyone's." Delegates to the same `useCommunity`/Hono-RPC machinery already confirmed sound for posts. Minor, recurring code-quality note: `(group: any)` — the same untyped-cast pattern found repeatedly across this whole audit.

## DMs and Chat — mostly sound, two real bypass instances, correcting the initial alarm

`BaseChatScreen.tsx` is purely presentational — `fetchMessages`/`sendMessage` are passed in as props, not implemented there; its only direct Supabase usage is a legitimate Realtime-channel cleanup call. Tracing into `DirectMessageScreen.tsx`, the actual implementation: **`fetchMessages`/`sendMessage` correctly delegate to `communityAPI.getDirectMessages`/`sendDirectMessage`** — the core message flow is properly API-routed, not a bypass.

**Two real, smaller violations found, worth fixing but not alarming:**
1. **Conversation-context lookup** (`direct_conversations`, who is user1/user2) queries raw Supabase directly rather than through the API — a genuine data read, not a Realtime exception.
2. **The Realtime `fetchById` callback** fetches the specific new message via raw `supabase.from('direct_messages')` rather than a proper single-row API call — defensible in spirit (it's reacting to a Realtime event) but not defensible under the stated rule, since a fetch-by-id is an ordinary request shape that doesn't need to bypass the API just because a Realtime event triggered it.

Both are small, contained fixes — swap two raw queries for two `communityAPI` calls — not evidence of a deeper architectural problem the way comments' missing backend route was.

## Creative and structural additions — grounded in the full body of principles established across this exploration, not generic suggestions

**Extend reinforcement-within-window (Pattern 5) to group-join suggestions.** Don't suggest a group after one shared-interest signal; only after genuine, repeated overlap over time. Directly transplantable from the same working attendance pattern cited throughout this audit.

**Apply decay (Pattern 3) to stale DM threads.** An unanswered thread from weeks ago sitting with equal visual prominence as an active one is noise, not signal — the same principle already recommended for notification badges in `19-notifications-settings.md`. A thread that's gone quiet could visually soften in the DM list rather than staying permanently loud.

**Extend the sanctuary/galaxy metaphor beyond group membership — it's underused.** The distinction (your close, known circle vs. the wider world) is genuinely evocative and already named in the codebase — worth considering for DM/notification treatment too, giving messages from your "sanctuary" circle a subtly different visual weight than "galaxy" contacts, consistent with the citizenship model's own logic of additive, non-replacing context layers rather than a flat, undifferentiated contact list.

**One restrained filigree moment for empty states (per `16`'s "one signature location per screen, maximum" rule).** An empty DM inbox or an empty group's first-message state is a natural, low-risk home for exactly one organic/leaf-motif illustration — high emotional value (a first impression of the product's personality) with zero risk of the decoration competing with dense, functional content, since there's no content yet to compete with.

**Keystone-component check, not yet done.** `18-leverage-applied-to-ui.md` names the most-reused component as the highest-leverage single fix available. Chat bubbles/message rendering are rendered in at least DMs and group chat, and structurally resemble comments and posts closely enough that a shared, canonical message/content-bubble component — fixed once — would cascade correctly across all four surfaces. Worth a direct check on whether this is already unified or independently reimplemented per surface (matching the same "component drift" risk already found elsewhere in this codebase).

**Batch group-activity notifications (Pattern 8), extending `19`'s existing recommendation.** Individual "so-and-so joined the group" events, delivered one push at a time, are exactly the kind of trickling low-signal noise `19` already flagged as the target for digest-batching — group activity is a natural, concrete instance of that general recommendation, not a new idea.

## Full arc — resolving the three original design requirements together, not separately

Your original design intent (feed mostly chronological + urgent/important surfacing; scroll upward not downward; comments threaded and latest-first) was checked in this pass against real code, and it's worth resolving all three together — they're more connected than they first appear.

### Dispatching — a fourth confirmation of the universal-experience pattern

`app/(tabs)/community/index.tsx` is a plain re-export, no role branching — same pattern as Library and Profile. Only Self and Workspace needed role dispatch, because only their content genuinely varies by role; feed/library/profile content doesn't.

### Scroll direction — confirmed genuinely absent, not missed

**Zero matches for `inverted` anywhere in `packages/community`.** This isn't a UI polish gap — it's a real, structural absence. Worth being precise about what "scroll upward" actually means as a pattern: an inverted list anchors at the *newest* content (bottom) and reveals older content as you scroll up — the WhatsApp/Telegram/iMessage chat pattern, not the Twitter/Instagram top-anchored feed pattern.

**Why this is a genuinely strong choice for this app specifically, not just a stylistic preference — worth stating as a real technical argument, not just honoring the stated intent.** Community has confirmed live Realtime subscriptions (`11`). A top-anchored feed with new content constantly arriving either pushes everything down (disorienting if you're mid-read) or requires a "new posts" banner workaround. **An inverted feed anchored at "now" doesn't have this problem at all** — new content arrives at the anchor point without disturbing your reading position if you've scrolled up into history, exactly the mechanism chat apps use this pattern to solve. This is a real, structural argument for the pattern, independent of the stated preference for it.

**A genuine biomimetic reading, connecting to `00-biomimicry-principles.md`'s Pattern 1 (structure is memory):** present is the anchor you return to; history recedes upward and away as you dig into it, rather than history sitting at a fixed top position that "now" has to travel toward. Worth applying to both the main feed and comments, consistent with the original stated intent covering both.

### Urgent/important surfacing — a real product decision, now with a concrete recommendation

`11` found the feed is purely `created_at desc`, with `AnnouncementsScreen` as a separate surface that may already be the intended solution. **Given the inverted-feed decision above, there's now a cleaner answer worth proposing directly: urgent/important content doesn't need in-feed sort-order weighting at all — it can live as a pinned, non-scrolling element fixed at the anchor point** (the bottom, in an inverted feed), always visible regardless of how far someone has scrolled into history. This resolves the tension between "mostly chronological" and "some things need to surface" without ever breaking strict chronological order for the scrolling content itself — urgent items get a genuinely different treatment (fixed position) rather than competing for a place in the sort order.

### Comments — the fix, now stated precisely against your actual original requirement

`11` found comments fetch newest-first then `.reverse()`, delivering oldest-first — the opposite of "latest first." **Given the inverted-feed pattern above, this resolves cleanly and consistently: comments should use the same inverted-list pattern as the main feed** — newest comment anchored at the bottom (or wherever the compose box sits), scrolling up reveals older ones. This makes "latest first" and "threaded, chronological" both true simultaneously without contradiction, and makes the existing `.reverse()` call actually *correct* — it was arguably solving the right problem for a non-inverted list; with an inverted list, the raw descending fetch order is already what's needed, and the `.reverse()` call should be removed rather than kept.

### Technical guidance for the inverted-list implementation

Both React Native's `FlatList` and `FlashList` (the modern, performant alternative likely already in use given this codebase's general maturity) support `inverted` as a direct prop — no new library needed, and no custom scroll-math required. **The one real gotcha worth flagging in advance:** an inverted list's *data order* needs to already be newest-first for the visual result to read correctly — confirming the feed/comment queries' actual `ORDER BY` direction matches what `inverted` expects is the one thing worth testing explicitly, not assuming. Pull-to-refresh and "load more" (pagination) both need to attach to the *opposite* end of an inverted list than they would on a normal one — worth calling out directly since it's an easy, non-obvious mistake to make once inverting.

## Open Questions / Not Yet Resolved

- **Highest priority, newly surfaced:** whether comments actually work in production at all — the intended Hono path has no backend route; the working-but-buggy path may be demo-only. Needs direct verification against a live/deployed instance, not further static tracing.
- **Repo-wide governance rule needed**, not just a community-domain fix — an enforced (not naming-convention-only) restriction on direct Supabase access, scoped to Realtime subscriptions and the PowerSync bridge only. Worth checking whether `self`, `classroom`, and `library`'s various direct-Supabase patterns found throughout this audit have the same dual-path risk as community's comments.
- **Scroll direction — resolved above, not just checked.** Confirmed genuinely absent from all current code; a concrete recommendation (inverted list, matching feed and comments) and technical guidance are now in this doc. Implementation still pending.
- Whether `AnnouncementsScreen` is genuinely intended as the "urgent/important" surfacing mechanism, or whether a pinning/priority field is still wanted inside the main feed itself — a product decision, not a technical one
- Whether the comment `.reverse()` behavior (once confirmed which path is actually live) is a bug or an intentional "natural reading order" choice that conflicts with an outdated stated preference — needs your direct call, not an assumption
- Whether `x-idempotency-key` (confirmed allow-listed in CORS) is actually used anywhere yet, or only reserved
- DMs (`DirectMessageScreen`, `DirectMessagesListScreen`) and Groups (`GroupChatScreen`, `GroupDetailsScreen`, `GroupMemberManagement`) — file structure confirmed, not yet read at the same depth as the feed/comments
- `SocialShieldModal` (safety/moderation) and `sacredMissions.ts` (further Bhumi-Stack-style gamification) — named but not yet explored
- Full triage of the remaining community-related tables in the classroom audit's 47-table drift list (`communities`, `community_groups`, `community_poll_votes`, `community_posts_with_counts`, `community_profile_versions`, `community_reactions`, `group_members`) — not yet individually confirmed real-vs-orphaned the way `community_comments` was in this pass
