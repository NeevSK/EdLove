---
title: "Floor System"
status: "active"
created: 2026-11-12
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [floor, layout, rooms, accessibility, performance]
source: "https://claude.ai/artifact/Qf71ycHDVzzCwFcCNx7nXp"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/Qf71ycHDVzzCwFcCNx7nXp so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. Its second tab is `2026-11-12-floor-system-component-catalogue.md`. The playground is `docs/Core/design/prototypes/2026-11-12-floor-patterns.html`.

# Floor System

Nov 12, 2026 · @Neev

## Why one system

The floor is one recursive system of containers that share space by rules, and this doc is its single source. The [Floor Patterns page](https://claude.ai/artifact/EREdoSNyw8Wfd1GSgpvbKp) grew by adding a section per question, so ideas sat side by side without meeting: time never touched the space budget, depth never touched performance, patterns never touched accessibility.

Here every idea is placed once, in the part of the system it changes. The page stays as the playground for trying things; this doc is what the code will follow.

Read it top down: the map of ideas, then what the older docs in the repo already decided, then the container model, then the maths that shares space, then the rules each part must keep (hierarchy, patterns, components, accessibility, performance), then how it can be inspected and tested.

## The map

> The mind map embedded in the claude.ai page (every idea explored so far, placed in the system) is interactive and could not be exported; open the source page to see it.

The left side decides space (containers, maths, hierarchy, the person); the right side sets what every layout must keep (patterns, accessibility, performance, testing). Each box is one section below.

## Roots: what the older docs already decided

Most of this system was already reasoned in the repo, in docs that never met a layout. Each idea now has one home here. Where an older doc and this system disagree, the row says so.

| Older doc | What it decided | Where it lives now |
| --- | --- | --- |
| Biomimicry principles (`docs/files/fundamental/00`) | Read against the person's own baseline; decay is a tuned knob; promote only after repeats within a window; settle at natural boundaries; keep a disturbance local | Weight: attention is measured against the person's own rhythm, unused pieces soften, the floor re-sorts on opening or at day start and never while in use, and a change in one area never reflows another |
| Same doc, evidence tiers | Connectedness beats proximity beats similarity; occlusion and aerial perspective are hard-wired | Groups use a shared surface first, space second, colour last; overlap and paler-when-far depth are justified, not decoration |
| UI visual design (`02`) | Preattentive features; 1 to 3 seen without counting; absence goes unnoticed; contrast falls at screen edges | The lit piece uses one preattentive cue; small counts drawn as marks; state shown by a present marker; status never parked at an edge |
| UX interaction design (`03`) | Working memory about 4; split attention; gradual changes are missed more than instant ones; familiarity eases Hick; thumb zone; no whole-screen reachability mode | Chunk caps; related things share one container; floor changes appear at once on reopen, not animated in; frequent choices keep fixed places; main actions in the bottom reach |
| Visual philosophy (`15`) | Restraint: one stroke weight, one corner radius; grain as atmosphere, filigree as one composed accent | Worlds own stroke and radius; a floor allows one ornament place |
| Spacing, type and IA (`16`) | Density tiers Calm, Standard and Dense, with chunk caps of 3–4, 4–5 and at most 4 column groups; space before dividers; no ornament on Dense | Tier becomes a property of every floor: it sets gaps, type scale, chunk cap and whether an ornament may appear |
| Leverage (`17`, `18`) | Fix top-down: who the person is, then IA, then spacing; the keystone is the one wrapper every piece uses; the limiting factor moves | The piece frame around each SanctuaryFeature is the keystone; the build order starts with the tree and the hierarchy, not the look |
| Workspace canvas redesign (`specialized/22`) | Three zones: fixed, arranged by the person, and a labelled smart zone; the system never reorders what the person arranged | **Conflict:** our hierarchy re-sorts by time and attention inside every area. Proposal: the system orders only the labelled Today area and the lit piece; elsewhere weight may fold or enlarge a piece but never moves it out of the person's order |
| Screen reading method and audit skill (`27`, `SKILL`) | Count jobs, not components; cards only for separate items; text under 14 means the container carries too much; one badge per target; placement must match use | Lint rules on the floor tree |
| Design framework (`gurudevi_design_framework`) | Aliveness through water, growth and breath; foreground, midground and background layers; performance is the design language; load order: navigation, assistant, atmosphere, ornament | Background is the floor scene, midground the groups, foreground the pieces and actions; the cost budget spends in the same load order |
| UI kit rebuild plan, phase 1b | Spacing relations: inside 4–8, between 0 or 8, group 24, section 40; Group; components that know their width; kit names visible in dev tools | These are the proximity numbers the maths uses; the inspector reads the kit names |
| Pattern language of educational passage | Alexander and Fuller applied to the product's journeys | The product-level patterns; this floor system is the screen-level layer under them |

## Everything is a container

Yes: every level is a container with the same properties, so one engine lays out all of them, recursively. The screen itself is the top container; the header, perspective stripe, rooms bar, keyboard and floor are its children. That is why "who gets the screen" and "how pieces share a floor" are the same question one level apart.

| Level | Example | Its children | Arranged by |
| --- | --- | --- | --- |
| Screen | A 360×760 phone, upright | Status bar, header, stripe, floor, rooms bar, keyboard | Give-way order |
| Floor | Classroom, as a teacher at Royal College | Areas | Room on screen (stack, bands, main + side, board) |
| Area | Work | Groups | Time, then saved order |
| Group | Daily tasks | Pieces | A pattern (stream, shelf, tiles, Lamp…) |
| Piece | Take roll call (one SanctuaryFeature) | Parts | The piece's own card layout |
| Part | Title, number, action, picture | Nothing | Type and spacing scales |

Every container carries six things:

- **Footprint:** the space it is given: width, height and aspect.
- **Content:** how many children it has and what kind they are.
- **Weight:** how much it matters now (time, attention, role).
- **Limits:** the smallest and largest it can be, the aspect it keeps, the touch target and the text it must fit.
- **Pattern:** how it divides its footprint among its children.
- **Cost:** the views, pictures and motion it adds.

**Inter and intra.** Inter-footprint is decided by the parent: how much a container gets among its siblings. Intra-footprint is decided by the container: how it divides what it got among its children, which is its pattern. A container never takes space from a sibling; it asks its parent, and the parent decides by weight.

## The space maths

Space is shared in three passes, the same at every level: constraints go down, sizes come up, and the parent places its children. Flutter and React Native's Yoga both work this way, so the rule fits the tools we already use.

1. **Down:** the parent tells each child the smallest and largest it may be.
2. **Up:** each child answers with the size it wants inside those limits, after laying out its own children.
3. **Place:** the parent positions the children by its pattern.

**Sharing by weight.** A parent with space A gives every child its minimum first, then shares what is left by weight, never past a child's preferred size:

```latex
s_i = \min\Big(p_i,\; m_i + \big(A - \textstyle\sum_j m_j\big)\,\frac{w_i}{\sum_j w_j}\Big)
```

Here m is the minimum, p the preferred size and w the weight. Space a child cannot use goes back to the others. When the minimums alone do not fit, the lowest-weight child folds to one line (or moves under "More"), and the sum is run again. That fold is the give-way order from the playground, now written as one rule.

**Weight** is a product, so any factor can lift or sink a container:

```latex
w = t \times a \times r \times k
```

t is time (now 3, later today 2, anytime 1), a is attention (needs the person 2, otherwise 1), r is the role's importance of that piece in this room, and k is the person's own pin (1.5 when pinned). These numbers are starting guesses to tune on real floors, not findings.

**Ratios that keep it calm.**

- **Levels of scale:** hero, card, tile and chip step down by roughly 1.5 to 2 times each, so the eye finds the leader without reading (Alexander's "levels of scale").
- **Proximity:** the gap inside a group is at most half the gap between groups, so groups read as groups before any heading is read.
- **Shape keeps its aspect:** circles 1:1 for people, spines about 2:3 for books, tiles 4:3, pictures 16:9. A container that cannot give a piece its aspect picks a pattern that can.
- **Type and spacing** come from each world's recipes and the 4-point spacing steps already in the kit.

**Laws the maths respects.**

- **Fitts:** bigger and nearer targets are faster, so the main action sits in the thumb's reach on the main hand's side.
- **Hick:** choosing slows as options grow, so a group shows a handful and folds the rest.
- **Working memory:** people hold roughly three to six chunks at once (Miller's "seven" is an upper bound, per NN/g), so the first screen shows the lit piece and two or three groups, not ten.

## Hierarchy and reading order

One order decides what leads, what is read first and what folds first: lit, then time, then attention, then the person's saved order, then area. The same order serves the eye, the screen reader and the give-way rule, so the three can never disagree.

1. **Lit:** at most one piece on the screen holds the lamp (it matters now).
2. **Time:** now, then later today, then anytime.
3. **Attention:** pieces that need the person rise within their time band, and settle once seen.
4. **Saved order:** the person's own order and pins, kept per account and per screen size.
5. **Area:** Today, Work, Institution, Outlook, then Private last (the intimacy gradient).

**Chunking.** A group is a chunk: it shows a handful of pieces and folds the rest behind its own "See all". A floor shows a handful of groups above the fold. Headings name the chunk in the person's words, so the floor can be scanned by headings alone.

**What is never hidden.** Anything a person must do (roll call, marks due) never lives only inside a shelf, because many people never swipe past the first item. A shelf holds things to browse; a task always also has a fixed place.

## Time lens: past, present, future

School work runs in a loop: plan, do, look back. A teacher plans lessons, teaches, then reviews marks. A principal plans the term, runs the day, then reviews attendance. A student checks what is due, does it, then looks at past results. The time lens lets one feature serve the whole loop, instead of three separate screens.

The idea is from the 18 Oct doc `2026-10-18-universal-temporal-substrate-and-history-architecture.md`, and core already has it: `TemporalIntent` (current, review, plan) and a horizon per room (`DomainTemporalHorizon`: today, a date, a term or a cycle). What was missing is that no feature said how it behaves in each mode.

| Mode | The person is | Asks | Past data |
| --- | --- | --- | --- |
| Review (past) | Looking back | What was? | Sealed, append-only or editable, per feature |
| Current (present) | Acting | What is now? | Live |
| Plan (future) | Planning | What will be? | Open intentions, can be reordered |

**Each feature has a time profile** in its furniture entry:

- **Modes:** which of the three it supports, and what it does in each (plan, act, review).
- **Past rule:** `sealed` (attendance once certified; you may add a note today about that day), `append` (journal: add, never rewrite), or `editable` (a draft plan).
- **Home mode:** where it mostly lives. Lesson plans and timetable live in plan; journal, grades and reading trail in review; roll call and chat in current.
- **Timeless** features (Library catalogue, Profile settings) have no modes and ignore the lens.

**What the floor does with it.** When the room's lens moves to another day, each piece shows its record (review), its plan (plan), or steps back to a quiet "nothing for that day" if it has no such mode. A piece whose home mode matches the lens gets more weight, so on a plan day lesson plans rise and roll call folds.

**Two different time axes.** The lens is *which day you are looking at*. The engine's time band (now, later today, anytime) is *how urgent a piece is within that day*. They multiply; they are not the same dial.

**The lens control.** The kit's date-time combo already has nano, compact, medium and full forms, but only nano is wired. The control's form comes from its floor fit: nano on a crowded phone header, a 7-day ribbon where the room has space.

**Patterns this follows:** Things 3 (Today, Upcoming, Logbook over the same tasks), Linear cycles (current, upcoming, past), banking (scheduled, pending, statements), calendars (move the date, the view follows), plan-do-review cycles in teaching (PDCA, Kolb), and "as-of" data (what was true on a day, and when it was written).

## Patterns

Sixteen patterns are a container's ways of dividing its space; the rule picks one from the group's answers, and each carries its own limits and cost. Shapes (circle, spine, stack, shaped pieces) and depth cues are how a pattern's pieces look, not separate patterns.

| Pattern | Use for | Pieces | Needs width | Cost on a 2 GB phone | Note |
| --- | --- | --- | --- | --- | --- |
| Hero | The one thing that matters most | 1 | any | low |  |
| Lamp (ours) | One piece lit now, the rest resting | 1 lit + rest | any | low | The only lit piece on the screen |
| Stream | A few mixed things to act on | 2–6 | any | low | Phone default |
| Tile grid | Numbers or actions compared at a glance | 2–9 | any | low | Becomes a stream at large text |
| Mixed tiles | One big fact with small ones around it | 3–7 | 360+ | low |  |
| Shelf | Browsing things of one kind | 3–12; NN/g: end reachable in 3–4 swipes | any | medium: virtualise, lazy pictures | Next item peeks; never the only home of a task |
| Circle rail | People and companions | 3–12 | any | medium | Names under faces for screen readers |
| Chip rail | Quick actions or filters | 3–8 | any | low | Each chip at least 48 dp tall |
| Grouped list | Finding one known thing among many | 8+ | any | low when virtualised | Search above it |
| One at a time | Stepping in order: roll call, quiz | any | any | low | Step count spoken |
| Path (ours) | Progress over days or weeks | 4–20 | any | medium | Done, next and left are words, not only colour |
| Day river (ours) | Things placed in today's time | 3–10 | 360+ | medium | Read as a timed list by screen readers |
| Pinboard (ours) | The person's pins | 2–4 | any | low |  |
| List beside open piece | Drilling in with room for both | any | 720+ | medium | Phone opens full instead |
| Desk (ours) / main and side | One task with tools beside it | 1 + 2–5 | 840+ (tray below on phones) | medium |  |
| Board | Areas as columns | 3–5 areas | 1200+ | high | Reading order stays the hierarchy, not columns |

The exact form the playground shows for each lives on the [Floor Patterns page](https://claude.ai/artifact/EREdoSNyw8Wfd1GSgpvbKp). **Depth** comes from placement first (overlap, size falling off, shadow from the world's light, far things paler), and motion only confirms it, so depth costs almost nothing at any tier.

Material's four carousel layouts are already in this table: multi-browse is a shelf with mixed sizes, uncontained is the plain shelf, hero is a hero with a peek of the next, and full-screen is one at a time.

## Components: the furniture

Patterns arrange; components are what gets arranged. A component is a Piece or a Part in the container tree, and like every container it has a level where it belongs, a job, limits and a cost. Everything Apple, Google and Microsoft name, sorted by job, with our kit beside it, is in the Component catalogue tab.

| Job | Belongs at | Proven components | Our kit has | Missing |
| --- | --- | --- | --- | --- |
| Act | Inside pieces; one main action per room in the thumb's reach | Button, icon button, floating action, split button, toolbar, menus | Button, IconButton, RoomFab, Menu | Split button, task toolbar, long-press menu on pieces |
| Move around | Screen edges: bottom on phones, side when wide, top for title and back | Tab bar, rail, drawer, tabs, top bar, search | WorldTabBar, Rail, Tabs, AppHeader, SearchField | Nothing needed now |
| Hold and arrange | The floor | List, grid, card, carousel, disclosure, split view | List, Grid, Card, Carousel, Rail, Group, TwoPane | TwoPane on real screens |
| Choose | Pieces and forms | Switch, checkbox, radio, segmented, chips, pickers, slider, stepper | All of them | – |
| Type | The bottom, with the keyboard | Text field, combo box, digit entry | TextField, Composer, Keypad | Autocomplete |
| Tell | In place of content, or at the bottom above the rooms bar | Progress, skeleton, badge, toast, dialog, banner, empty state, chart | WorldLoading, WorldSkeleton, Badge, ToastHost, Dialog, Notice, EmptyState | Small charts, ring |
| Present | Over the floor: bottom on phones, side when wide | Sheet, side sheet, popover, full screen | Sheet, TwoPane, Popover, Media | – |

Three rules come out of the comparison:

- **Every component has a home level.** A toast never sits inside a piece, and only the one main action floats at the screen level. The lint can check this.
- **Drag, swipe and slide always have a tap way too** (WCAG 2.5.1 and 2.5.7). This matters most for arranging the floor itself: move up and move down sit beside drag.
- **A carousel always offers a way to see everything without swiping sideways** (Material's carousel rule). That settles our shelf: its heading is also its "See all".

### How components make the layout

Yes: every component is a container at some level, so the layout is not drawn room by room. It appears from the components upward. Each component tells its parent how small it can be, what it would like, what aspect it keeps and what it costs; the group's pattern places those; the area and the floor share space by weight; the screen gives way. Change a component's limits and every floor that holds it re-lays itself, in every room and world.

The kit already has one contract per component in `packages/ui/src/theme/contracts.ts` (what it holds and says). The integration is to add one small floor part to each contract, pure data, so the floor engine can read it without touching React Native:

```ts
interface FloorFit {
  level: 'screen' | 'floor' | 'area' | 'group' | 'piece' | 'part';
  min: { w?: number; h: number };      // at text scale 1; grows with the person's text size
  preferred?: { w?: number; h?: number };
  aspect?: number;                     // kept: 1 for faces and pebbles, 4/3 for card pictures
  cost: { views: number; pictures: number; moves: boolean };
  spoken: string;                      // its spoken form, e.g. '{n} of {total}'
}
```

The three-way comparison, world kit only (legacy `@repo/ui` left out), with real numbers from the kit's code:

| World kit component | Level | Kit today | Apple / Material | Our docs say | Verdict |
| --- | --- | --- | --- | --- | --- |
| Button | Part | min height 44 | 44 pt / 48 dp | One primary per screen (spacing doc 16) | Meets iOS; Android wants 48: raise the shared token or add space around |
| Chip | Part | visual height plus 6 slop | 48 dp target | 48 dp (pattern table) | Check the real target reaches 48 |
| SegmentedControl | Part | min height **38** | 44 pt / 48 dp | – | **Below target: fix** |
| TaskTabs | Screen chrome | min height **38** | 48 dp tabs | – | **Below target: fix** |
| Tabs, Menu items, Checkbox, Radio, SearchField, Table rows | Part | min height 44 | 44 pt / 48 dp | – | Meets iOS; same Android question as Button |
| Disclosure, DateTravel days | Part | min height 48 | 48 dp | – | Meets both |
| Row, TextField, Select | Piece / Part | world recipe min height | 44 pt rows; 56+ dp list items | Gap from the density tier | Meets; tier sets the gap |
| Card | Piece | tile, wide, square, pill; pictures 4:3 | Cards; lockups | Only for separate items (audit stage 3) | Meets; aspect goes in FloorFit |
| Launcher | Piece | tile min height 120 | Home-screen grid | – | Fits tile grid |
| Pebble, Avatar | Piece / Part | 1:1 | Fluent avatar | Circle rail for people and companions | Meets |
| Rail | Group | snaps to item start | Uncontained carousel | NN/g: end in 3–4 swipes; see all | **Add the see-all heading** |
| Carousel | Group | paged, page announced, no autoplay | Hero, multi-browse | No auto-advance | Meets |
| Group | Group | one surface, outer corners, hairlines | Inset grouped lists | Connectedness is the strongest grouping | Meets |
| Section | Area | heading over content | Sections | Whitespace before dividers | Meets |
| Grid | Group | columns from its own width | Layout grid | – | Already does "constraints down" |
| TwoPane | Floor | two panes from 840 | List-detail, supporting pane | Web two columns (canvas doc 22) | Use on real screens |
| Timeline | Group (Day river) | entries 44; past recedes, lit now line | – | Aerial perspective; temporal seam (doc 26) | Already our Day river |
| Steps | Part | "Step 2 of 5" with a trail | Page control, progress | One at a time | Meets |
| WorldSkeleton, EmptyState, ErrorState | Piece (stand-in) | world's own sign | Loading pattern | – | Must take the same footprint as the piece it stands in for |
| ToastHost | Screen | bottom | Snackbar | Instant, not gradual (change blindness) | Meets |
| Badge | Part | 20 high, not a target | Badges | One badge per target | Meets |
| WorldTabBar | Screen chrome | 56; rail items 72 | Tab bar; navigation bar 80 dp | Give-way order | Meets |
| AppHeader | Screen chrome | search 44 | Navigation bar | Gives way to the keyboard | Meets |
| Keypad, TypingBar | Screen chrome | over the keyboard | Virtual keyboards | Focus never covered | Meets |
| ActionFab, FabMenu | Screen | corner | FAB, FAB menu | Main hand's side | Meets |
| Media | Part | space reserved by aspect | Image views | – | Meets; aspect goes in FloorFit |
| WorldFloor, Scene | Screen background | baked picture on low tier | – | Background layer (design framework) | Its cost leads the budget |
| WorldMoment | Screen overlay | per world | Fluent HUD | Motion can be avoided | Meets |

So the integration is three steps: add `FloorFit` to each contract (numbers from this table), fix the two components under target and the rail's see-all, then let the floor engine read `FloorFit` instead of guessing sizes.

## Accessibility built in

WCAG 3 is our accessibility standard, and accessibility is part of each container's limits, so the engine cannot produce a layout that breaks it. These are the rules it checks; how WCAG 3 maps onto them follows the table.

| Rule | Where it lives | Source |
| --- | --- | --- |
| Touch targets at least 48 dp (Android) and 44 pt (iOS); never under 24 px with space around | Every piece's limits | [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24 by 24 minimum, 44 by 44 enhanced |
| The focused field or control is never fully hidden by the header, rooms bar or keyboard | Screen-level sharing; the give-way order | [WCAG 2.2 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) names sticky headers and footers as the usual cause |
| Reading order is the hierarchy (lit, time, attention, saved, area), not the visual columns | The tree itself | Apple HIG Layout: order content by relative importance |
| Large text reflows: tiles become a stream, boards become stacks, nothing is cut | Limits grow with the person's text size | [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout): be ready for Dynamic Type |
| State is never colour alone: done, next, locked and late carry words or shape too | Piece parts | WCAG use of colour |
| Motion is optional: depth stays without it; nothing auto-advances | Patterns | [NN/g](https://www.nngroup.com/articles/designing-effective-carousels/): do not auto-forward carousels on mobile |
| Every pattern has a spoken form: a shelf says "3 of 12", a path says "step 4 of 10, next" | Pattern | Platform screen reader conventions |
| Dragging always has a tap way: move up, move down, a field beside a slider | Arranging the floor; sliders | [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) (2.5.7) |
| Swipes and multi-finger gestures have a single-tap way | Shelves, swipe rows | [WCAG 2.2 Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) (2.5.1) |
| Nothing is lost at 320 wide or at 200% text | Every pattern's limits | WCAG 2.2 Reflow (1.4.10) and Resize Text (1.4.4) |
| Works upright and sideways | The screen | WCAG 2.2 Orientation (1.3.4) |
| Moving things can be paused; motion from touches can be turned off | Patterns and worlds | WCAG 2.2 Pause, Stop, Hide (2.2.2) and Animation from Interactions (2.3.3) |
| Help sits in the same place on every floor | The screen | WCAG 2.2 Consistent Help (3.2.6) |

These also serve kids, older teachers and people in sunlight, not only people using assistive tech.

**WCAG 3 is our standard.** We adopt the latest [WCAG 3 Working Draft](https://www.w3.org/TR/wcag-3.0/) (10 September 2026) as Gurudevi's own accessibility standard, the way any team can adopt it, and we test it during the beta. Its guidelines are the rules; the WCAG 2.2 rows above are the concrete checks we run where a WCAG 3 requirement is still being written. Each guideline has a home in this system:

| WCAG 3 draft guideline | What it asks | Where we meet it |
| --- | --- | --- |
| 2.7 Layout: recognizable layouts, user orientation, structure, no obstruction | Screens of one kind look alike; people know where they are; nothing covers what they need | One engine for every floor; area headings; the tree is the structure; the give-way rule |
| 2.8 Consistency across views | The same thing works the same way everywhere | Components keep their home level; each pattern keeps its spoken form |
| 2.3 Interactive components: focus appearance, navigating content, expected behaviour, control information | Visible focus, a meaningful focus order, controls that say what they are | Kit focus rings; reading order is the hierarchy |
| 2.4 Input and operation | No need for path gestures, pressure, speed or body movement | A tap way for every drag and swipe |
| 2.6 Animation and movement | No flashing; motion can be avoided | Depth without motion; the verger's lowest tier |
| 2.9 Process and task completion | No memory tests, enough time, information kept, no needless steps | One at a time for steps; drafts kept per account; nothing times out |
| 2.12 User control | Orientation, text and layout reflow; people are told of content changes | Text size reflows patterns; the floor changes only at boundaries |
| 2.2 Text and wording | Readable text; clear language | World type recipes; plain words; Sinhala and Tamil words from Neev |
| 2.11 Help and feedback | Help is available; feedback is given | Tutii and the assistant in one place; toasts and moments |

## Performance budget

Cost is the sixth thing every container carries, and the floor adds its children's costs up against a budget the verger sets per device tier. When a floor goes over, it picks cheaper forms of the same patterns before it drops anything.

- **What counts:** mounted views, pictures decoded, things moving, and lists that are not virtualised.
- **Cheaper forms, in order:** artwork shelves become plain rows; peeking and parallax stop; shadows become flat borders; groups below the fold mount only when scrolled near.
- **Always:** lists over about 20 items use FlashList; shelves render only what is near the screen; the floor scene is the baked picture on the lowest tier.
- **Layout itself is cheap:** the sharing maths is a pure function over a tree of a few dozen containers, run when the screen, data or person changes, never per frame.

The budget numbers per tier come from A24 and A52 measurements once we run on them; until then they are estimates.

## Inspectable, comparable, testable

Because the floor is computed by a pure function, its result is a plain tree of data that can be printed, compared, checked and drawn over the screen, the way Flutter's inspector shows its widget tree with sizes.

- **The floor tree:** for each container, its level, pattern, footprint, weight, limits, cost and why the rule chose it. The same input always gives the same tree.
- **Inspector:** a debug overlay in the app draws each container's box, size and pattern name over the real floor, and a lab screen lists the tree.
- **Lint rules:** run on any tree, in tests and in the inspector. For example: no target under 48 dp; no task only inside a shelf; at most one lit piece; the focused field never covered; gap within a group at most half the gap between groups; reading order equals hierarchy; cost within the tier's budget.
- **Snapshots:** each room, role and screen size gets a stored tree. A change that moves things shows as a readable difference before anyone looks at a phone.
- **Metrics:** share of the first screen given to the lit piece, number of groups above the fold, pieces folded, and cost against budget. Floors can then be compared across rooms, roles and worlds with numbers, not only by eye.

## Dimensions and dials

The layout is one pure function with modular inputs. Each input can change on its own without touching the others, and each comes from the place that owns it.

| Dimension | What it carries | Who owns it | What it changes |
| --- | --- | --- | --- |
| Real estate | Width class (under 600, 600, 840, 1200, 1600+), orientation, safe insets, keyboard height, chrome bars with their give-way rank | The device and the shell | Which chrome gives way, the floor's footprint, stack or board, which patterns fit |
| The person's text size | Font scale | The person (system setting and comfort preset) | Every minimum grows with it; tiles become streams; caps stay, so more scrolls |
| What is left after the hierarchy | The floor's height after chrome, shared by weight | The engine | Which groups make the first screen (always a run from the top), how tall each is, what folds behind See all |
| Motion | The least of three: the person's setting, the world's ceiling and the verger's tier | Person, world, verger | Only the lit piece may move fully; everything else is reduced or still; moving parts become still forms when motion is none |
| Depth | Cues the world asks for, cut to what the verger's tier allows | World, verger | Overlap and light on every tier; scale, haze and tilt on richer tiers; all are placement, none needs motion |
| Visual detail and cost | The verger's tier and its budget | Verger | Cheaper forms of costly patterns, lowest weight first, then fewer depth cues |
| Embedded parts | Icons, emoji, pictures, tooltips, badges and moving bits inside a piece | The component | Counted in its cost; checked by lint: emoji and pictures that mean something need a spoken name, needed words never live only in a tooltip, a badge never takes a finger |
| Room and role | The room's density tier; the role's importance of each piece | Product dials | Gaps, chunk caps, ornament, weight |
| Decisions | Every open product question as a dial with a default | Neev, any time | Nothing else has to change when a dial moves |

This is built: `@repo/core/logic/floor` (`layoutFloor`, `lintFloor`, `printFloor`), pure and tested. The same input always gives the same tree, so snapshots per room, role and screen size are next.

## Sources

| Source | What it gives the system |
| --- | --- |
| [NN/g, Carousels on mobile](https://www.nngroup.com/articles/mobile-carousels/) | Last item reachable in 3–4 swipes; peeking is a strong cue, dots weak; too many items means a list |
| [NN/g, Designing effective carousels](https://www.nngroup.com/articles/designing-effective-carousels/) | 5 or fewer frames; no auto-advance on mobile; keep key content reachable elsewhere |
| [NN/g, Chunking](https://www.nngroup.com/articles/chunking/) | Chunks as units; memory span about 3–6, Miller's 7 as an upper bound |
| [NN/g, Proximity](https://www.nngroup.com/articles/gestalt-proximity/) | Close items read as one group; whitespace unites or separates |
| [WCAG 2.2, Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | 24 by 24 minimum with spacing; 44 by 44 enhanced |
| [WCAG 2.2, Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Sticky headers and footers must not fully hide focus |
| [WCAG 3 Working Draft](https://www.w3.org/TR/wcag-3.0/) and [WCAG 3 Introduction](https://www.w3.org/WAI/WCAG3) | Our adopted accessibility standard |
| [Android window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes) | Width under 600, 600–839, 840–1199, 1200–1599, 1600+ dp; width matters more than height |
| [Material 3 canonical layouts](https://m3.material.io/foundations/layout/canonical-layouts) | List-detail, supporting pane, feed |
| [Material 3 Components](https://m3.material.io/components) and [Carousel guidelines](https://m3.material.io/components/carousel/guidelines) | The component set by job; four carousel layouts; see all without sideways swiping |
| [Apple HIG, Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | Order by importance; group related items; lay out by size class, not device; Dynamic Type |
| [HIG Components](https://developer.apple.com/design/human-interface-guidelines/components) and [HIG Patterns](https://developer.apple.com/design/human-interface-guidelines/patterns) | Eight component families and 28 interaction patterns, sorted by job in the catalogue |
| [Fluent 2 iOS](https://fluent2.microsoft.design/components/ios) and [Component Gallery](https://component.gallery/components/) | A third system, and the names many design systems share |
| [Flutter, Understanding constraints](https://docs.flutter.dev/ui/layout/constraints) | Constraints go down, sizes go up, parent sets position |
| Christopher Alexander, *A Pattern Language* (1977) and *The Nature of Order* | Nested patterns; intimacy gradient, window place, alcoves; levels of scale, strong centres |
| Repo: `docs/files/fundamental` (00, 02, 03, 15, 16, 17, 18, 27, SKILL), `docs/files/specialized/22`, `apps/gurudevi-mobile/docs/Core/gurudevi_design_framework.md`, the UI kit rebuild plan | The decisions in Roots |

All web pages above were opened on 12 November 2026. Weights, budgets and the scale step are our own starting values, to be tuned.

## Dials and build order

No decision blocks the work. Every open question is a dial in `FloorConfig` with a default taken from the older docs, so engineering goes ahead and any dial can move later without code changes. The product calls are yours whenever you want them; until then the default holds.

| Dial | Default now | Kind | Where it came from |
| --- | --- | --- | --- |
| Who may reorder (`reorder`) | Only labelled smart areas (Today) and the lit piece | Product | Workspace canvas redesign doc: never reorder what the person arranged |
| Hierarchy order (`hierarchy`) | Lit, time, attention, saved order | Product | This doc |
| Area order (`areaOrder`) | Today, Work, Institution, Outlook, Private | Product | The existing floor model in core |
| Density tier per room (`tierByRoom`) | Work room Dense, Self and Profile Calm, others Standard | Product | Spacing doc 16 |
| Our own patterns (`ownPatterns`) | Lamp, Path, Day river, Pinboard, Desk all on | Product | This doc |
| Shapes and depth per world (`WorldFloorBias`) | Each world names its depth cues and shelf shape; the tier cuts them | Product, per world | Floor Patterns page |
| Weights (`weights`) | Now 3, later today 2, anytime 1; attention 2; pin 1.5 | Tune | Starting guesses |
| Groups on the first screen, pieces per group | Calm 3 and 4, Standard 4 and 5, Dense 5 and 8 | Tune | Chunking (NN/g), spacing doc 16 |
| Gaps | Between 8, group 24, section 40 | Tune | Kit spacing relations |
| Floor's least share before chrome gives way | Half the window | Tune | This doc |
| Cost budget per tier | Rich 400, balanced 250, essential 150 views | Tune | Estimates until A24 and A52 numbers |
| Touch minimum | 48 Android, 44 iOS and web | Platform | Material, HIG; now in the kit |

Build order:

- [x] Kit: touch targets reach the platform minimum (SegmentedControl, TaskTabs, small buttons, chips; Android 48); Rail gets See all.
- [x] The floor engine in core: FloorFit, sharing maths, give-way, hierarchy with the reorder dial, pattern choice, cheaper forms, lint, print. 18 tests.
- [ ] `FloorFit` on each kit contract, numbers from the component table above.
- [ ] Snapshot trees for each room, role and screen size.
- [ ] The inspector overlay and a lab screen that prints the tree.
- [ ] The work room's floor for each role on the engine, then Self and Library.
- [ ] Kit gaps: task toolbar and autocomplete first, then small charts.
- [ ] Our own patterns drawn in the kit (Path, Day river, Desk, Pinboard), then shapes and depth per world.
