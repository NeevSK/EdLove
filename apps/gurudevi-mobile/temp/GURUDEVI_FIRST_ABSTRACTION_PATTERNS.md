# Gurudevi First Abstraction — Recurring Issue Patterns

This document groups the granular ledger into recurring engineering patterns.
It is intentionally separate from the line-by-line ledger and from the
prevention/control layer.

| Pattern | Name | Granular IDs | What repeats | Systemic interpretation |
|---|---|---|---|---|
| P01 | Unmeasured boot cost | L001, L008, L028 | Expensive startup work is inferred from structure or stale snapshots. | Performance decisions are being made without a current baseline. |
| P02 | False success / destructive trust failure | L005, L012, L015, L017, L024, L025 | UI reports success, closes, resets, deletes, or grants access before durable success/confirmation. | Success is treated as a visual branch instead of an acknowledged domain result. |
| P03 | Implicit temporal coupling | L008, L009, L028, L029 | Independent effects/listeners/redirects depend on timing or registration order. | Lifecycle phases lack one explicit owner and contract. |
| P04 | Boundary contract drift | L010, L020, L022, L023 | Client/server, local/remote, logout/sync, and account boundaries are interpreted inconsistently. | Boundary ownership and invariants are not encoded in shared contracts. |
| P05 | Console-only or ambiguous failure | L011, L014, L016, L019, L026, L027 | Errors are logged, hidden as empty, or leave state stuck without recovery. | Async failure UX is not a mandatory part of feature completion. |
| P06 | Implicit route dependency | L018 | Shared screen assumes navigation/runtime props that routes do not provide. | Route contracts are not type-enforced. |
| P07 | Parallel infrastructure ownership | L002, L004 | Multiple persistence/style engines coexist without a visibly enforced owner. | Dependency decisions are additive and historical rather than capability-owned. |
| P08 | Shared contract bypass | L003, L013 | Local icon/Heading implementations bypass existing UI contracts. | Reuse is a convention, not an enforceable boundary. |
| P09 | Snapshot/convention drift | L006, L030, L037, L038, L039 | Audits and utilities become stale; multiple instruction/migration eras coexist. | There is no single continuously refreshed architecture source. |
| P10 | Registered-but-unmounted capability | L021 | Features register state/actions but no visible consumer is mounted. | Wiring is not tested end to end from registration to rendered capability. |
| P11 | Shell/content accessibility split | L031, L034, L035, L036 | Navigation chrome has semantics while high-value content controls do not. | Accessibility review scope stops at shell boundaries. |
| P12 | Spec-to-implementation drift | L032, L033 | Written behavior promises are more humane than shipped behavior. | BDD/design contracts are not enforced in implementation tests. |

## Pattern priority

1. P02 and P05 — user trust and data integrity.
2. P03 and P04 — lifecycle and boundary correctness.
3. P06 and P10 — route/wiring correctness.
4. P11 and P12 — accessibility and humane behavior.
5. P01, P07, P08, and P09 — measurable performance and maintainability.
