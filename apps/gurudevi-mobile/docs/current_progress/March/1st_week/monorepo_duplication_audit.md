# Monorepo Diagnostic: Duplication & Architectural Drift

Following the **"Library First"** and **"Convolutional Resonance"** principles in `TAIL_FIN.md`, I've audited the `polymath-platform` monorepo. We have significant duplication between `apps/gurudevi-mobile` and the shared `@repo/` packages.

## 1. High-Impact Duplicates (UI & Screens)

These items exist in both the mobile app and a shared package. In many cases, the app version has diverged or is an "orphan" that should be merged upstream.

| Component / Screen | App Location | Package Location | Status |
| :--- | :--- | :--- | :--- |
| **LotusPetalFAB** | `apps/gurudevi-mobile/.../shared/` | `packages/ui/.../components/` | **High Drift**: App version is complex (image, pan responder); Package version is simpler (emoji, modal). |
| **GroupsScreen** | `apps/gurudevi-mobile/.../community/` | `packages/community/.../screens/` | **Identical Name**: Likely 1:1 duplication or outdated version in app. |
| **GroupDetailsScreen** | `apps/gurudevi-mobile/.../community/` | `packages/community/.../screens/` | **Identical Name**: High risk of logic being trapped in app. |
| **CreatePostModal** | `apps/gurudevi-mobile/.../community/` | `packages/community/.../components/` | **Identical Name**. |
| **ReportPostModal** | `apps/gurudevi-mobile/.../community/` | `packages/community/.../components/` | **Identical Name**. |

## 2. Infrastructure & Logic Duplicates

| Item | App Location | Package Location | Analysis |
| :--- | :--- | :--- | :--- |
| **useTheme / useAccessibility** | `apps/gurudevi-mobile/src/hooks/` | `packages/ui/src/hooks/` | Core tokens and a11y logic should live in `@repo/ui`. |
| **useInventory** | `apps/gurudevi-mobile/src/hooks/classroom/` | `packages/classroom/src/hooks/classroom/` | Domain logic belongs in `@repo/classroom`. |
| **demo / mockData** | `apps/gurudevi-mobile/src/lib/api/` | `packages/core/src/api/` | Shared mocks ensure resonance across web and mobile. |

## 3. Imported Sources Analysis
Preliminary scan of `apps/gurudevi-mobile/src/screens` shows a mix of:
- **Resonant Imports**: `@repo/ui`, `@repo/community`, `@repo/core`.
- **Dissonant Imports**: `../../components/...` (local orphans), `../../hooks/...` (replicated logic), `../../lib/...` (shadowed APIs).

## 4. Proposed Sanitization Strategy

1.  **Extraction**: Move unique features from `apps/` orphans into their `@repo/` homes.
2.  **Harmonization**: Update `@repo/` components to support the advanced features found in the app version (e.g., enable PanResponder/Advanced animations in `LotusPetalFAB`).
3.  **Sanitization**: Delete the `apps/` orphans and point all screens to `@repo/`.
4.  **Verification**: Type check and Lint across the entire monorepo.

**Ready to start the "Reparative Extraction"?**
