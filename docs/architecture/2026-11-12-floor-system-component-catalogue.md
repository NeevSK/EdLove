---
title: "Floor System: component catalogue"
status: "active"
created: 2026-11-12
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [floor, components, kit, hig, material]
source: "https://claude.ai/artifact/Qf71ycHDVzzCwFcCNx7nXp"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/Qf71ycHDVzzCwFcCNx7nXp so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. Second tab of the Floor System doc.

# Component catalogue

Every component Apple's HIG and Material 3 list, plus Fluent 2 mobile and the cross-system names from component.gallery, sorted by the job it does on a floor. For each: where it sits, when to use it, what our kit already has, and what is missing. This is about the pattern (place, context, use), not the look: the look always comes from the world.

Read the gaps column first. A dash means we have it and nothing is missing.

## Act

| Component | HIG / Material name | Where it sits | Use when | Our kit | Gap or rule |
| --- | --- | --- | --- | --- | --- |
| Button | Buttons / Buttons | Inside a piece, sheet footer | One clear action | Button | – |
| Icon button | (Buttons) / Icon buttons | Header, piece corner | A well-known action with no room for words | IconButton | Always has a spoken name |
| Floating action | – / FAB, extended FAB, FAB menu | Bottom corner on the main hand's side, above the rooms bar | The room's one main action | RoomFab, Agent Fab | – |
| Button group, split button | Pop-up and pull-down buttons / Button groups, split buttons | Piece footer, toolbar | Related actions, or one action with variants (save, save as draft) | – | **Gap:** split button |
| Toolbar | Toolbars / Toolbars | Bottom of a task screen, or above the keyboard | Frequent actions while a task is open (roll call, marking) | TypingBar (keyboard only) | **Gap:** task toolbar |
| Menu, context menu | Menus, context menus, edit menus / Menus | At the thing pressed | Secondary actions on one item | Menu, Popover | Long-press menu on pieces is not built |
| Share | Activity views / – | System sheet | Send something out | System | Use the system's |
| Shortcut from outside | Home Screen quick actions, App Shortcuts / – | Home screen icon | Jump to a frequent task | – | Later: "Take roll call" shortcut |
| Swipe actions | (Lists and tables) / – | On a row | A quick act on one row | SwipeRow | Needs a button too (WCAG 2.5.1) |

## Move around

| Component | HIG / Material name | Where it sits | Use when | Our kit | Gap or rule |
| --- | --- | --- | --- | --- | --- |
| Bottom bar | Tab bars / Navigation bar | Bottom, phones | 3 to 5 top places | WorldTabBar, NativeShellTabs | – |
| Rail | (Sidebars) / Navigation rail | Side, medium widths and landscape | The same places with more width | Rail fallback in the shell | – |
| Sidebar, drawer | Sidebars / Navigation drawer | Side, wide screens | Many places | – | Tablet 840+ only, if ever |
| Tabs in a screen | Tab views, segmented controls / Tabs | Top of the content | Peer views of one thing | Tabs, TaskTabs | – |
| Top bar | Navigation bars / App bars | Top | Title, back, a few actions | AppHeader, WorldHeader | – |
| Search | Search fields / Search | Top of a list or in the header | Finding a known thing | SearchField | – |
| Breadcrumbs | Path controls / – | Top, desktop | Where am I, many levels deep | – | Not for phones |
| Page dots | Page controls / (Carousel) | Under a carousel | Which page I am on | Carousel | A weak cue (NN/g); peeking is stronger |
| Tokens | Token fields / (Input chips) | In a field | Chosen things shown as tokens | Chip | – |
| Link | – / – | In text | Go somewhere | Link | – |

## Hold and arrange

| Component | HIG / Material name | Where it sits | Use when | Our kit | Gap or rule |
| --- | --- | --- | --- | --- | --- |
| List, table | Lists and tables / Lists | Floor, sheets | Many items of one kind | List, Row, Table, Group | – |
| Grid | Collections / – | Floor | Visual items side by side | Grid | – |
| Card | (Boxes, lockups) / Cards | Floor | One subject among separate subjects | Card, Surface | Cards only for separate items, never for a sequence (screen audit, stage 3) |
| Carousel | – / Carousel: multi-browse, uncontained, hero, full-screen | Inside a group | Browsing visual things of one kind | Carousel, Rail | **Rule:** a way to see all without swiping sideways (Material) |
| Disclosure, accordion | Disclosure controls / – | Inside a piece, settings | Detail on request | Disclosure, Section | – |
| Split view | Split views, column views / List-detail, supporting pane | Whole screen, 840+ | A list beside the open item | TwoPane | Not yet on real screens |
| Box, group | Boxes / – | Settings, forms | Related controls together | Group, Section | – |
| Divider | – / Divider | Inside lists | Only when space alone is unclear | Divider, Group hairlines | Space first (spacing doc 16) |
| Label | Labels / – | Everywhere | Static words | Text | – |
| Tree | Outline views / – | Desktop | Deep hierarchy | – | Maybe for a syllabus, later |

## Choose

| Component | HIG / Material name | Where it sits | Use when | Our kit | Gap or rule |
| --- | --- | --- | --- | --- | --- |
| Switch | Toggles / Switch | Settings rows | On or off, at once | Switch, SwitchRow | – |
| Checkbox | (Toggles) / Checkbox | Lists, forms | Several of many | Checkbox | – |
| Radio | – / Radio button | Forms | One of a few | RadioGroup | – |
| Segmented | Segmented controls / Segmented buttons | Top of content | 2 to 5 views, one at a time | SegmentedControl | – |
| Chips | – / Chips (assist, filter, input, suggestion) | Above a list | Filter or quick pick | Chip | – |
| Picker, select | Pickers, pop-up buttons / Menus | Forms | One of many | Select, LanguagePicker | – |
| Date and time | Pickers / Date pickers, time pickers | Forms, sheets | Dates and times | Date, MonthGrid, TimeDial, DateTravel | – |
| Slider | Sliders / Sliders | Settings | A value in a range | Slider | Needs steps or a field too (WCAG 2.5.7) |
| Stepper | Steppers / – | Forms | Small number changes | NumberStepper | – |
| Colour, picture | Color wells, image wells / – | Settings | Pick a colour or picture | WorldPicker, Capture | – |
| Rating | Rating indicators / – | Feedback | A score | Question | – |

## Type and enter

| Component | HIG / Material name | Where it sits | Use when | Our kit | Gap or rule |
| --- | --- | --- | --- | --- | --- |
| Text field | Text fields, text views / Text fields | Forms | Words | TextField, Composer, RichTextEditor | – |
| Combo box | Combo boxes / – | Forms | Type or pick (a student's name) | – | **Gap:** autocomplete |
| Digit entry | Digit entry views / – | Sign-in | Codes | Keypad | – |
| Keyboard | Virtual keyboards / – | Bottom | Typing | Keypad, TypingBar | Our own keypad for marks |
| File | – / – | Forms | Attach a file or photo | Capture, FileCard | – |

## Tell

| Component | HIG / Material name | Where it sits | Use when | Our kit | Gap or rule |
| --- | --- | --- | --- | --- | --- |
| Progress | Progress indicators / Progress indicators, loading indicator | In place of content, or on the action | How long a wait is | WorldLoading, WaitingSign, Progress, Steps | – |
| Skeleton | – / – (Fluent: Shimmer) | In place of content | The shape of what is coming | WorldSkeleton | – |
| Badge | – / Badges | On a tab or icon | A count or state | Badge | One badge per target (screen audit) |
| Toast | – / Snackbar | Bottom, above the rooms bar | A brief result, maybe with undo | ToastHost | – |
| Alert, dialog | Alerts / Dialogs | Centre | A decision that must block | Dialog | Rare |
| Banner | – / – | Top of the floor | A lasting condition (offline) | Notice, connection status | – |
| Empty and error | – / – | In place of content | Nothing yet, or it failed, and what to do | EmptyState, ErrorState | – |
| Gauge, ring | Gauges, activity rings / – | Inside a piece | A value toward a goal | Progress | Ring shape not built |
| Chart | Charts / – | Inside a piece | A trend over time | – | **Gap:** small charts, trend against one's own past (biomimicry pattern 2) |
| Tooltip | (Help tags) / Tooltips | At a control | A short name for an icon | Tooltip | Never the only home of needed words |
| Confirmation | – / – (Fluent: HUD) | Centre, brief | Something finished | WorldMoment | – |
| Outside the app | Notifications, Live Activities, widgets / – | Lock and home screen | Ongoing state | NotificationItem | Later: a home-screen widget for today |

## Present over the floor

| Component | HIG / Material name | Where it sits | Use when | Our kit | Gap or rule |
| --- | --- | --- | --- | --- | --- |
| Sheet | Sheets / Bottom sheets | Bottom | A small task without leaving | Sheet, YouSheet, AssistantSheet | – |
| Side sheet | Panels / Side sheets | Side, wide screens | Supporting content | TwoPane | – |
| Action sheet | Action sheets / – | Bottom | Choices about one action | Menu in a Sheet | – |
| Popover | Popovers / – | Anchored to a control | Small content near what opened it | Popover | Becomes a sheet on phones |
| Scroll | Scroll views / – | Everywhere | More than fits | ScrollArea | – |
| Full screen | Windows / (Full-screen carousel) | Whole screen | Reading, video, roll call | Media | – |

## Show content

| Component | HIG / Material name | Our kit |
| --- | --- | --- |
| Picture | Image views | Media |
| Text | Text views | Text, Markdown |
| Web page | Web views | DocumentView |
| Video and audio | (Playing video, playing audio) | Media |
| Person | – (Fluent: Avatar, avatar group) | Avatar, HeaderAvatar |
| Quote | – | – |

## Only ours

The world under every screen (Scene, LivingGround, WorldFloor), Tutii's perch (Perch), focus tools as pebbles (Pebble), rooms and tools as lit wells (Launcher), the day's timeline with a lit now line (Timeline), celebrations per world (WorldMoment) and agent cards. No guide has these; they are where the app's character lives, so they follow the same container limits as everything else.

## HIG patterns the floor must answer

Apple lists 28 interaction patterns. These are moments the floor has to handle, not components. In the order they touch our rooms:

| Pattern | What the floor does |
| --- | --- |
| Launching, Onboarding | The first floor shows the lit piece and one next step, nothing else |
| Loading | Skeleton in each piece's own footprint, so nothing jumps when it arrives |
| Feedback | Toast or WorldMoment; never only colour |
| Entering data | The typing bar and keypad take the bottom; focus is never covered |
| Searching | Search sits above the grouped list it searches |
| Modality | Sheets for small tasks, full screen for steps, dialogs only to block |
| Undo and redo | Toasts carry undo for anything that removes or moves |
| Drag and drop | Arranging the floor; always with a button alternative |
| Managing notifications | Badges stay calm; notices settle once seen |
| Offering help | Tutii and the assistant sheet, in the same place on every floor |
| Settings | Grouped rows, never mixed into a floor |
| Multitasking, Going full screen | Split screen uses the tight shell; immersive views hide the chrome |
| Charting data | Small charts read against the person's own past |
| Collaboration and sharing, File management | Share uses the system sheet; files open as file cards |
| Playing audio, video, haptics | Media in place; haptics only on pick-up and drop |
| Accessing private data, Managing accounts | Asked at the moment of need, per account |
| Ratings and reviews, Printing | Rare; not on the floor |
| Live-viewing apps, Workouts | Not for us |

## Sources

All opened on 12 November 2026: [HIG Components](https://developer.apple.com/design/human-interface-guidelines/components) and its eight category pages, [HIG Patterns](https://developer.apple.com/design/human-interface-guidelines/patterns), [Material 3 Components](https://m3.material.io/components), [Material 3 Carousel guidelines](https://m3.material.io/components/carousel/guidelines), [Fluent 2 iOS components](https://fluent2.microsoft.design/components/ios) and the [Component Gallery](https://component.gallery/components/). Our kit column is from `packages/ui/src/components/native` on this branch.
