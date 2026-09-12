# Semantic token contract

Reusable UI consumes semantic roles, not palette values. The role names below
are the stable contract; the temporal theme resolver and NativeWind mappings
remain implementation details.

## Cross-platform import boundary

Use `@repo/ui/tokens` for the stable, dependency-free value contract. It is
safe for browser and native consumers because it imports neither React, React
Native, DOM APIs, nor a styling framework. Browser and native component
implementations may share these values, but must not share component imports.

| Role | Meaning | Existing NativeWind mapping |
| --- | --- | --- |
| `surface.canvas` | app/page background | `phase-surface` |
| `surface.card` | raised or grouped content | `phase-modal-card` or component-specific surface |
| `surface.interactive` | interactive control surface | `phase-interactive` |
| `content.primary` | highest-emphasis text/icon | `phase-text-primary` |
| `content.secondary` | supporting text/icon | `phase-text-secondary` |
| `content.muted` | low-emphasis metadata | `phase-text-muted` |
| `action.primary` | primary action emphasis | `phase-accent` |
| `action.positive` | successful or rewarding action | `phase-reward` |
| `status.danger` | destructive/error state | `phase-danger` |
| `border.subtle` | low-contrast separation | `phase-interactive/*` opacity utilities |
| `focus.ring` | keyboard/focus indication | component-specific focus utilities |

## Rules

- New reusable components must use these roles or add a reviewed role here.
- Do not introduce a component-local palette for a role already listed.
- Direct hex values are allowed only for asset data, platform APIs, or a
  documented visual effect that cannot be expressed by the theme.
- Temporal or user-selected themes must resolve through `useTheme`/the theme
  provider; NativeWind classes must not bypass that source of truth.
- Native platform adapters may translate semantic roles into native color APIs,
  but the translation stays inside the adapter.

## Button state contract

`Button` accepts both `disabled` and the legacy `isDisabled` prop. They resolve
to the same disabled state; `isLoading` also disables interaction and marks the
control busy. New code should use `disabled`.
