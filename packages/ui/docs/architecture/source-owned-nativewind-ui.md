# Source-owned NativeWind UI

## Decision

`@repo/ui` is the platform-owned UI system for the workspace. New reusable UI is
implemented in this package, uses the primitives exported from
`@repo/ui/primitives`, accepts `className`, and consumes the canonical theme
tokens. The system follows shadcn's source-ownership model without importing the
web shadcn implementation or creating a second component library.

## Layers

```text
primitives        platform and accessibility foundations
components/ui     neutral, reusable NativeWind-first components
components/brand  Gurudevi visual language and branded feedback
components        product/domain components
adapters          compatibility boundaries for legacy or third-party code
```

`components/ui` is the preferred home for components such as Button, Dialog,
Sheet, Tabs, Select, Form, Command, and DataTable. `components/brand` is where
the Sanctuary identity belongs. Product components must not become accidental
foundations for other packages.

## Component contract

Reusable components should:

- build on owned primitives rather than importing a competing UI library;
- expose semantic variants and sizes instead of requiring consumers to know
  implementation colors;
- accept `className` and compose it with defaults using `cn` from
  `@repo/ui/utils/classNames`;
- expose slot-specific class names when a component has independently styled
  parts, such as `textClassName` or `iconClassName`;
- preserve native interaction, accessibility, keyboard, focus, portal, and
  safe-area behavior;
- use the canonical theme resolver for dynamic/temporal colors;
- provide platform-specific implementations only when native and web behavior
  genuinely differ.

Example:

```tsx
<Button variant="primary" size="md" className="rounded-2xl">
  Continue
</Button>
```

For form controls, prefer `FormField` when the field has a label, helper text,
or validation message. It owns the relationship between those states and the
underlying `FormControl` context:

```tsx
<FormField label="Display name" helperText="Shown on your profile.">
  <Input>
    <InputField accessibilityLabel="Display name" />
  </Input>
</FormField>
```

Use `errorText` for the invalid state. It intentionally takes precedence over
`helperText`, keeping validation messaging deterministic across consumers.

The development-only `/ui-showcase` route in the mobile app is the reference
surface for reviewing these contracts together. It is not a product screen and
is excluded automatically from production rendering.

### Popover boundary

`Popover` is an inline anchored surface composed from a relative container,
trigger, content, and close parts. It intentionally does not create a portal or
measure the trigger across the window. Use it for local menus and contextual
actions where the anchor owns the available space. Use `Dialog` or `Sheet` when
content must escape clipping, span the viewport, trap focus, or provide a
mobile bottom-sheet interaction.

## Third-party intake

Use external libraries as behavior or implementation references, not as a new
public styling layer.

1. Check whether the behavior already exists in `@repo/ui`.
2. Prefer a source-owned implementation on the existing primitives.
3. Wrap a third-party component only when it provides difficult native behavior
   such as virtualization, gestures, charts, or platform integration.
4. Keep the wrapper in `adapters/` and translate its props, theme, and failure
   states at that boundary.
5. Do not use web shadcn/Radix components directly in React Native.

React Native Reusables is a useful reference for NativeWind-compatible,
shadcn-inspired component structure, but copied code must be adapted to the
Sanctuary primitives and tokens.

## Theming

The semantic theme in `src/theme/Theme.ts` remains the source of truth. NativeWind
classes are the authoring surface for static and state styles. CSS variables and
NativeWind's runtime theme context may be adopted where they reduce duplication,
but must map back to the canonical semantic token names rather than introduce a
parallel palette.

## Migration sequence

1. Stabilize the primitive and `components/ui` contracts.
2. Add missing high-leverage interaction components: Sheet, Tabs,
   Popover/Command, Form, Combobox, and DatePicker.
3. Migrate existing gluestack consumers through the `@repo/ui` façade.
4. Move branded behavior into `components/brand` as components are touched.
5. Keep legacy adapters until all consumers have migrated; do not delete them
   as part of unrelated component work.

## Quality gate

Every new reusable component needs focused tests for its public variants,
disabled/loading/error behavior, accessibility semantics, and web/native
resolution where applicable. Run the touched package's typecheck, lint, and
tests. Never weaken an existing assertion to accommodate a port.
