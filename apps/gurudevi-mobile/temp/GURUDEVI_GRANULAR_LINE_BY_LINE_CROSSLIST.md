# Gurudevi / EdLove Granular Line-by-Line Cross-List

Snapshot: 2026-09-07

## Provenance and authority

This is a reorganization and decomposition of the supplied audit material, not
a replacement for the original reports. The 120 rows are not 120 newly
discovered bugs. They split bundled observations into separately addressable
units so they can be tracked, grouped, and tested.

For the real evidence, read the original audit documents directly:

- `EDLOVE_GURUDEVI_CONTEXT.md`
- `GURUDEVI_MOBILE_FINDINGS_AND_TREATMENTS.md`
- `GURUDEVI_TEMPORAL_FLOW_AUDIT.md`
- `GURUDEVI_TWO_LAYER_AUDIT.md`
- `GURUDEVI_USABILITY_DELIGHT_A11Y_AUDIT.md`
- `GURUDEVI_USEEFFECT_ANALYSIS.md`

The original documents are authoritative for the full narrative, code excerpts,
qualifiers, positive findings, and audit reasoning. This cross-list is
authoritative only for organization, IDs, cross-links, status reconciliation,
and decomposition. When an entry is marked `audit-claim`, `lead`, or
`unverified`, do not treat it as a confirmed defect without returning to the
original text and current source.

This document is the source-level issue ledger. Each row is one granular claim
or observation extracted from the six supplied audit documents. It preserves the
source file and approximate source lines, separates issue types, and links each
item to the first- and second-abstraction documents.

Status: `confirmed` means current-source evidence was rechecked; `audit-claim`
means it is present in the supplied audit but still needs current verification;
`corrected` means the supplied claim was narrowed or contradicted.

| ID | Source audit / lines | Granular observation | Type | Current status | Pattern | Control |
|---|---|---|---|---|---|---|
| L001 | Mobile Findings 30-53 | Boot owns many providers/effects and expensive work. | performance | audit-claim; measure first | P01 | C01 |
| L002 | Mobile Findings 62-77 | `expo-sqlite`, `wa-sqlite`, and `op-sqlite` coexist. | architecture | confirmed-risk | P07 | C07 |
| L003 | Mobile Findings 79-97 | Five icon packages coexist despite an icon bridge contract. | architecture | confirmed-debt | P08 | C08 |
| L004 | Mobile Findings 99-112 | NativeWind preview plus CSS engines coexist. | dependency | confirmed-risk | P07 | C07 |
| L005 | Mobile Findings 116-145 | Tab AI route re-exports raw screen while another route applies premium guard. | security/revenue | confirmed | P02 | C02 |
| L006 | Mobile Findings 149-175 | Architecture/UI migrations create convention churn. | maintainability | confirmed-context | P09 | C09 |
| L007 | Mobile Findings 179-193 | Checked route tree patterns were valid and not a collision. | non-issue | clean finding | — | — |
| L008 | Temporal Flow 52-73 | Boot actors resolve independently; auth-dependent state can race. | lifecycle | refined/lead | P03 | C03 |
| L009 | Temporal Flow 75-110 | Auth route decisions were centralized; magic-link wiring needs live verification. | lifecycle | mixed: fixed + open | P03 | C03 |
| L010 | Temporal Flow 113-165 | QR flow is a positive example; offline sync boundaries need explicit treatment. | architecture | mixed | P04 | C04 |
| L011 | Two-Layer 148-183 | Native-capable files call unqualified `alert()`. | feedback | confirmed | P05 | C05 |
| L012 | Two-Layer 185-212 | Gradebook closes save modal in `finally` after console-only failure. | data trust | confirmed | P02 | C02 |
| L013 | Two-Layer 214-228 | ClaimInviteModal defines a local Heading wrapper. | design system | confirmed | P08 | C08 |
| L014 | Two-Layer 305-328 | Mood save rethrows; caller has no catch or visible error. | feedback | confirmed | P05 | C05 |
| L015 | Two-Layer 330-350 | Voice Journal completion/reset occur outside save try/catch. | data trust | confirmed | P02 | C02 |
| L016 | Two-Layer 424-456 | Teacher handlers log failures only; failed loads look empty. | feedback | confirmed | P05 | C05 |
| L017 | Two-Layer 532-559 | Student streak is hardcoded; profile/grades failures are hidden. | data trust/feedback | confirmed | P02/P05 | C02/C05 |
| L018 | Two-Layer 619-654 | Settings screen requires navigation, but two routes omit it. | navigation | confirmed | P06 | C06 |
| L019 | Two-Layer 752-781 | Account switching clears busy state but gives no failure feedback. | feedback | confirmed | P05 | C05 |
| L020 | Two-Layer 783-831 | Logout implementations diverge; strongest purge path is not clearly canonical. | security/state | lead | P04 | C04 |
| L021 | Two-Layer 995-1041 | FAB state is registered widely but renderer has no JSX mount found. | wiring | confirmed-static | P10 | C10 |
| L022 | Two-Layer 1230-1265 | Supplied logout ordering claim overstates remote failure risk; current sign-out is local. | correction | corrected/refined | P04 | C04 |
| L023 | Two-Layer 1425-1485 | Local-only PowerSync tables are mistaken for missing server mappings. | correction | corrected/refined | P04 | C04 |
| L024 | Two-Layer 1652-1690 | Native academic-cycle deletion bypasses confirmation. | destructive UX | confirmed | P02 | C02 |
| L025 | Two-Layer 1692-1723 | Native invite copy shows success without clipboard write. | data trust | confirmed | P02 | C02 |
| L026 | Two-Layer 1776-1809 | Falsy save result can leave admin saving state stuck. | state | confirmed | P05 | C05 |
| L027 | Two-Layer 1811-1822 | Analytics polling failure is console-only and can look current. | observability | confirmed | P05 | C05 |
| L028 | useEffect 98-106 | Current boot effect count does not match supplied snapshot. | correction | stale framing | P03 | C03 |
| L029 | useEffect 107-124 | Auth listener is registered after initial fetch begins. | lifecycle | lead | P03 | C03 |
| L030 | useEffect 125-177 | Workspace/app lifecycle utilities were called unused but have consumers. | correction | stale/disproven | P09 | C09 |
| L031 | Usability/A11y 15-25 | Auth screen has no explicit accessibility semantics. | accessibility | confirmed-static | P11 | C11 |
| L032 | Usability/A11y 27-49 | Auth BDD grace flow is specified but implementation gives generic toast. | UX/spec drift | confirmed | P12 | C12 |
| L033 | Usability/A11y 51-58 | Password guidance is reactive; no inline requirements found. | accessibility/UX | confirmed-static | P12 | C12 |
| L034 | Usability/A11y 92-102 | Delete-account modal lacks semantics/live processing announcement. | accessibility | confirmed-static | P11 | C11 |
| L035 | Usability/A11y 130-150 | Self shell has semantics, content controls largely do not. | accessibility | confirmed-static | P11 | C11 |
| L036 | Usability/A11y 168-192 | Workspace dashboards lack explicit semantics/touch-area guidance. | accessibility | confirmed-static | P11 | C11 |
| L037 | Context 84-100 | Android/build state is described as Frankenstein and snapshot identity is unclear. | context | confirm canonical snapshot | P09 | C09 |
| L038 | Context 106-123 | Multiple agent/config instruction systems contribute to convention drift. | process | confirmed-context | P09 | C09 |
| L039 | Context 177-186 | Stack baseline lists Expo/RN, state, sync, ORM, UI, flags, observability. | inventory | confirmed | — | C09 |

## Clean or positive controls found

- Submission flow uses real error feedback.
- PowerSync batch transaction/idempotency behavior is deliberately tested.
- Some admin invite and classroom components use correct shared feedback paths.
- Reduced-motion support is deliberately implemented in several components.
- Delete-account copy contains a strong reversible off-ramp and data-scope
  disclosure.
- Route-tree collision examples checked in the supplied audit are valid.

## Cross-list rules

- One granular issue may map to multiple patterns when it has both a local bug
  and a systemic cause.
- A corrected claim remains in the ledger so it cannot be accidentally revived.
- “Confirmed-static” is not a claim of runtime validation.

## Expanded decomposition — L040 through L120

The first table intentionally preserved major claims, but it still bundled
multiple independently fixable defects. The following decomposition splits the
same audit material by affected behavior, file/handler, user impact, or missing
control. It is not a claim that all items are separate root causes; related
items are linked to the same first-abstraction pattern when appropriate.

| ID | Source / subject | Individually actionable granular item | Status | Pattern |
|---|---|---|---|---|
| L040 | Mobile Findings 32 | Root layout size makes boot ownership hard to review. | audit-claim | P09 |
| L041 | Mobile Findings 33 | Provider nesting is not represented as explicit startup phases. | audit-claim | P03 |
| L042 | Mobile Findings 43 | Cedar WASM warm-up is on the boot path. | audit-claim | P01 |
| L043 | Mobile Findings 44 | Permission snapshot performs network work at cold start. | audit-claim | P01 |
| L044 | Mobile Findings 45 | Font loading blocks initial readiness. | audit-claim | P01 |
| L045 | Mobile Findings 46 | PowerSync bootstrap is part of initial startup work. | audit-claim | P01 |
| L046 | Mobile Findings 46 | SyncManager mount is coupled to initial startup. | audit-claim | P03 |
| L047 | Mobile Findings 49 | No current cold-start TTI baseline is recorded. | confirmed | P01 |
| L048 | Mobile Findings 50 | Permission work lacks an explicitly provisional UI contract. | audit-claim | P03 |
| L049 | Mobile Findings 51 | Font loading strategy lacks a documented suspense/readiness boundary. | audit-claim | P01 |
| L050 | Mobile Findings 64 | WASM SQLite path is retained. | confirmed-risk | P07 |
| L051 | Mobile Findings 65 | Native op-sqlite path is retained. | confirmed-risk | P07 |
| L052 | Mobile Findings 66 | Expo SQLite is separately available. | confirmed-risk | P07 |
| L053 | Mobile Findings 70 | Standalone Expo SQLite could bypass offline sync ownership. | audit-claim | P04 |
| L054 | Mobile Findings 81 | Vector-icons Lucide package remains installed. | confirmed-debt | P08 |
| L055 | Mobile Findings 82 | lucide-react-native remains installed. | confirmed-debt | P08 |
| L056 | Mobile Findings 83 | lucide-react web package remains installed. | confirmed-debt | P08 |
| L057 | Mobile Findings 84 | phosphor-react-native remains installed. | confirmed-debt | P08 |
| L058 | Mobile Findings 85 | nano-icons remains installed/used outside the bridge. | confirmed-debt | P08 |
| L059 | Mobile Findings 94 | Direct icon imports can bypass the UI bridge. | confirmed-debt | P08 |
| L060 | Mobile Findings 101 | NativeWind preview package is production-facing. | confirmed-risk | P07 |
| L061 | Mobile Findings 102 | react-native-css is a second styling engine. | confirmed-risk | P07 |
| L062 | Mobile Findings 103 | CSS interop is a third styling layer. | confirmed-risk | P07 |
| L063 | Mobile Findings 110 | Existing style-stack audit has not established a winner. | unverified | P01 |
| L064 | Mobile Findings 121 | Hyphenated AI route is a duplicate route surface. | confirmed | P02 |
| L065 | Mobile Findings 124 | Tab AI route bypasses the premium wrapper. | confirmed | P02 |
| L066 | Mobile Findings 130 | Deep-link route choice can affect entitlement enforcement. | confirmed-risk | P02 |
| L067 | Mobile Findings 134 | Canonical gated route has not been established. | confirmed | P02 |
| L068 | Mobile Findings 139 | Route naming workaround hides the duplicate ownership problem. | audit-claim | P09 |
| L069 | Mobile Findings 154 | Multiple core architecture versions coexist in documentation. | confirmed-context | P09 |
| L070 | Mobile Findings 157 | Multiple UI-kit migration eras coexist in documentation. | confirmed-context | P09 |
| L071 | Mobile Findings 160 | Native animation/runtime migration history is fragmented. | confirmed-context | P09 |
| L072 | Temporal Flow 54 | Sentry/PostHog initialization is deferred separately. | confirmed-context | P03 |
| L073 | Temporal Flow 55 | Cedar warm-up has no shared startup barrier. | audit-claim | P03 |
| L074 | Temporal Flow 55 | Permission snapshot has no shared startup barrier. | audit-claim | P03 |
| L075 | Temporal Flow 56 | Font readiness has no shared startup barrier. | audit-claim | P03 |
| L076 | Temporal Flow 56 | PowerSync readiness has no shared startup barrier. | audit-claim | P03 |
| L077 | Temporal Flow 56 | Auth hydration has no shared startup barrier. | audit-claim | P03 |
| L078 | Temporal Flow 59 | Auth-before-permission ordering is not encoded as an invariant. | audit-claim | P03 |
| L079 | Temporal Flow 66 | Profile synchronization can lag successful Google auth. | audit-claim | P03 |
| L080 | Temporal Flow 72 | Guest banner can persist after auth catches up. | audit-claim | P03 |
| L081 | Temporal Flow 92 | Central route decision ownership is a positive control to preserve. | clean-control | — |
| L082 | Temporal Flow 99 | Native magic-link callback consumption was previously uncertain. | unverified | P03 |
| L083 | Temporal Flow 103 | Deep-link fix requires end-to-end validation, not commit inspection. | confirmed-control-gap | P03 |
| L084 | Temporal Flow 136 | Multiple data highways can write/read the same conceptual state. | audit-claim | P04 |
| L085 | Temporal Flow 153 | Offline sync behavior needs explicit failure semantics. | audit-claim | P04 |
| L086 | Two-Layer 150 | Claim invite failure uses raw global alert. | confirmed | P05 |
| L087 | Two-Layer 156 | Analysis export success uses raw global alert. | confirmed | P05 |
| L088 | Two-Layer 157 | Analysis export failure uses raw global alert. | confirmed | P05 |
| L089 | Two-Layer 158 | Document scanner success uses raw global alert. | confirmed | P05 |
| L090 | Two-Layer 159 | Demo payment success uses raw global alert. | confirmed | P05 |
| L091 | Two-Layer 159 | Workforce assignment success uses raw global alert. | confirmed | P05 |
| L092 | Two-Layer 174 | Existing code comment admits unfinished mobile feedback. | confirmed | P09 |
| L093 | Two-Layer 193 | Gradebook submit failure is console-only. | confirmed | P05 |
| L094 | Two-Layer 197 | Grade modal closes on failure. | confirmed | P02 |
| L095 | Two-Layer 207 | Grade settings failure shares the same silent-failure shape. | audit-claim | P05 |
| L096 | Two-Layer 220 | Local Heading accepts `any` props. | confirmed | P08 |
| L097 | Two-Layer 225 | Local Heading can diverge from shared typography. | confirmed-risk | P08 |
| L098 | Two-Layer 323 | Mood save rejection becomes an unhandled rejection. | confirmed | P05 |
| L099 | Two-Layer 325 | Mood picker remains open after failure without explanation. | confirmed | P05 |
| L100 | Two-Layer 340 | Voice save failure is logged only. | confirmed | P05 |
| L101 | Two-Layer 344 | Voice completion callback runs after failed save. | confirmed | P02 |
| L102 | Two-Layer 345 | Voice reset runs after failed save. | confirmed | P02 |
| L103 | Two-Layer 435 | Teacher curriculum add failure is silent. | confirmed | P05 |
| L104 | Two-Layer 436 | Teacher content add failure is silent. | confirmed | P05 |
| L105 | Two-Layer 437 | Observation load failure is silent. | confirmed | P05 |
| L106 | Two-Layer 438 | Observation create failure is silent. | confirmed | P05 |
| L107 | Two-Layer 439 | Observation delete failure is silent. | confirmed | P05 |
| L108 | Two-Layer 440 | Assignment load failure is silent. | confirmed | P05 |
| L109 | Two-Layer 441 | Assignment create failure is silent. | confirmed | P05 |
| L110 | Two-Layer 454 | Failed observation loads look like empty history. | confirmed | P05 |
| L111 | Two-Layer 455 | Failed assignment loads look like empty lists. | confirmed | P05 |
| L112 | Two-Layer 538 | Student streak is always set to five. | confirmed | P02 |
| L113 | Two-Layer 543 | Real 20-day streak and zero-day streak appear identical. | confirmed-risk | P02 |
| L114 | Two-Layer 558 | Student profile load failure is console-only. | confirmed | P05 |
| L115 | Two-Layer 559 | Student grades failure becomes an empty list. | confirmed | P05 |
| L116 | Two-Layer 630 | Settings navigation prop has no default or null guard. | confirmed | P06 |
| L117 | Two-Layer 643 | Primary tab settings route omits navigation. | confirmed | P06 |
| L118 | Two-Layer 644 | Profile settings route omits navigation. | confirmed | P06 |
| L119 | Two-Layer 651 | Broken settings action can be reached from the majority path. | confirmed-risk | P06 |
| L120 | Two-Layer 770 | Account switch failure is not shown to the user. | confirmed | P05 |

The original L001-L039 rows remain as cross-document claims and controls; L040-
L120 are their decomposed implementation-level units. This brings the granular
ledger to 120 separately addressable entries without inventing findings outside
the supplied audit material and current-source corrections.
