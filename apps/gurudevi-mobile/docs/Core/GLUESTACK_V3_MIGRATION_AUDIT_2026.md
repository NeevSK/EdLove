---
title: "Gluestack v3 Migration Audit: Phase 1 (Core & Workspace)"
status: "active"
created: 2026-04-18
updated: 2026-04-18
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gluestack v3 Migration Audit: Phase 1 (Core & Workspace)

## 📊 1. Monorepo Migration Status (April 2026)

| Package | Status | Total Errors | Primary Issue |
| :--- | :--- | :--- | :--- |
| **@repo/core** | ✅ Clean | 0 | Fully migrated or framework-neutral. |
| **@repo/ui** | ✅ Clean | 0 | Primitives updated to v3 specifications. |
| **gurudevi-mobile** | ⚠️ At Risk | 466 | Legacy `sx` props and Toast API mismatches. |
| **@repo/classroom** | ⚠️ At Risk | 550 | 100+ instances of legacy `sx` and style violations. |
| **@repo/self** | ⚠️ At Risk | 350 | Legacy Text props and layout prop leakage. |

---

## 🏗️ 2. Core Blockers & Error Patterns

### A. The `sx` Prop Legacy (TS2322 / TS2353)
The largest source of errors is the persistence of the v2 `sx` prop which is no longer supported in v3 components (replaced by NativeWind `className`).
- **Example Diagnosis**: `Type '{ sx: { flex: 1; ... } }' is not assignable to type 'BoxProps'`.
- **Target Files**: `FormBuilder.tsx`, `TeacherAdminWidget.tsx`, `ClassroomScreen.web.tsx`.

### B. The Toast API Shift (TS2339)
The `useToast` hook or `ToastContext` has changed significantly.
- **Pattern**: `Property 'show' does not exist on type 'ToastContextType'`.
- **Affected Files**: `BulkStudentCreation.tsx`, `AddStudentModal.tsx`, `OCRStudentImport.tsx`.

### C. Text Primitive Hardening (TS2322)
Attributes like `color`, `size`, and `fontWeight` are being passed directly to `Text` components, but the v3 primitives expect them via `className` or restricted string unions.
- **Pattern**: `Type '{ children: string; color: "#FCF9F2"; size: string; }' is not assignable`.

### D. Missing Exports & Global Icons (TS2305 / TS2304)
- `Theme` has been purged from `@repo/core`.
- `Icon` and `ArrowLeftIcon` references are broken due to move to `lucide-react-native`.

---

## 🛠️ 3. Execution Strategy: "Healing Pipeline"

### Phase 1: Fundamental Hardening (In Progress)
- [x] Verify `@repo/core` integrity.
- [x] Verify `@repo/ui` primitive compliance.

### Phase 2: Automated "V3-Heal" Sweep
We will use `packages/self/scripts/v3-heal.js` to target `classroom` and `self` packages. The script handles:
- `sx` -> `className` conversion.
- `chevronRightIcon` -> `ChevronRight` lucide migration.
- Color token mapping (e.g., `Theme.colors.sanctuarySaffron` -> `templeGold`).

### Phase 3: Surgical Remediation
For errors not covered by the script, we must perform manual updates:
1.  **Toast API**: Update `toast.show()` calls to the new Sanctuary Toast patterns.
2.  **Theme Clean-up**: Purge any remaining `import { Theme } from '@repo/core'`.
3.  **Boundary Check**: Ensure `classroom` and `self` are not importing mobile-specific logic that breaks in Web.

---

## 📝 4. Immediate Action Items
1.  **Run `v3-heal.js`** on `packages/classroom/src` and `packages/self/src`.
2.  **Audit the "Healed" state** and identify the remaining ~20% of manual errors.
3.  **Standardize Toast usage** across the monorepo to remove the remaining `TS2339` errors.
