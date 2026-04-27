# Sovereign Surgical Error Analysis: classroom
> **Mode:** Local Only Filtering

> **Timestamp:** 2026-04-26 22:00:42
> **Target:** C:\Users\Naween\projects\polymath-platform\packages\classroom
> **Filtered:** 10 external errors hidden
> **Total Errors:** 31

## Executive Summary

| File Path | Errors | Common Codes |
| :--- | :---: | :--- |
| src/screens/GradebookScreen.web.tsx | 9 | TS2322 |
| src/screens/NoSchoolView.web.tsx | 8 | TS2322 |
| src/components/grading/GradingSettings.tsx | 3 | TS2322, TS2305 |
| src/components/GradebookView.tsx | 2 | TS2304 |
| src/hooks/useTeacherDashboardHooks.ts | 2 | TS2305 |
| src/screens/TeacherDashboard.web.tsx | 1 | TS2322 |
| src/workspace/useStudentWorkspaceData.ts | 1 | TS7006 |
| src/screens/LessonFeed.tsx | 1 | TS2307 |
| src/components/GroupManager.tsx | 1 | TS2322 |
| src/components/CreateSchoolModal.tsx | 1 | TS2578 |
| src/hooks/useStudentDashboardHooks.ts | 1 | TS2724 |
| src/screens/StudentProfileScreen.tsx | 1 | TS2305 |

## Error Distribution

| Code | Count | Description (Heuristic) |
| :--- | :---: | :--- |
| TS2322 | 21 | Type '{ children: Element; value: string; isChecked: bool... |
| TS2305 | 4 | Module '"@repo/core"' has no exported member 'StudentLong... |
| TS2304 | 2 | Cannot find name 'Pressable'. |
| TS2578 | 1 | Unused '@ts-expect-error' directive. |
| TS7006 | 1 | Parameter 'assignment' implicitly has an 'any' type. |
| TS2307 | 1 | Cannot find module 'lucide-native' or its corresponding t... |
| TS2724 | 1 | '"@repo/core"' has no exported member named 'useStudentAs... |

## Detailed Findings

### File: src/screens/GradebookScreen.web.tsx
Total errors in file: 9

- [ ] **Line 134, Col 28** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 139, Col 13** | TS2322
  > Type '{ children: Element; onPress: () => Promise<void>; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & SanctuaryButtonProps'.
  > * Property 'disabled' does not exist on type 'IntrinsicAttributes & SanctuaryButtonProps'. Did you mean 'isDisabled'?
- [ ] **Line 229, Col 28** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 234, Col 13** | TS2322
  > Type '{ children: Element; onPress: () => Promise<void>; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & SanctuaryButtonProps'.
  > * Property 'disabled' does not exist on type 'IntrinsicAttributes & SanctuaryButtonProps'. Did you mean 'isDisabled'?
- [ ] **Line 310, Col 13** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 325, Col 13** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 396, Col 21** | TS2322
  > Type '"primary" | "secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
  > * Type '"primary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 469, Col 27** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 479, Col 29** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.

---
### File: src/screens/NoSchoolView.web.tsx
Total errors in file: 8

- [ ] **Line 72, Col 24** | TS2322
  > Type '"primary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 167, Col 13** | TS2322
  > Type '{ children: Element; onPress: () => void; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & SanctuaryButtonProps'.
  > * Property 'disabled' does not exist on type 'IntrinsicAttributes & SanctuaryButtonProps'. Did you mean 'isDisabled'?
- [ ] **Line 209, Col 15** | TS2322
  > Type '{ children: Element; onPress: () => Promise<void>; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & SanctuaryButtonProps'.
  > * Property 'disabled' does not exist on type 'IntrinsicAttributes & SanctuaryButtonProps'. Did you mean 'isDisabled'?
- [ ] **Line 362, Col 13** | TS2322
  > Type '{ children: Element; onPress: () => Promise<void>; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & SanctuaryButtonProps'.
  > * Property 'disabled' does not exist on type 'IntrinsicAttributes & SanctuaryButtonProps'. Did you mean 'isDisabled'?
- [ ] **Line 391, Col 15** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 414, Col 21** | TS2322
  > Type '"secondary"' is not assignable to type '"link" | "solid" | "outline" | "ghost" | undefined'.
- [ ] **Line 511, Col 9** | TS2322
  > Type '{ children: Element; onPress: () => Promise<void>; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & SanctuaryButtonProps'.
  > * Property 'disabled' does not exist on type 'IntrinsicAttributes & SanctuaryButtonProps'. Did you mean 'isDisabled'?
- [ ] **Line 645, Col 9** | TS2322
  > Type '{ children: Element; onPress: () => Promise<void>; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & SanctuaryButtonProps'.
  > * Property 'disabled' does not exist on type 'IntrinsicAttributes & SanctuaryButtonProps'. Did you mean 'isDisabled'?

---
### File: src/components/grading/GradingSettings.tsx
Total errors in file: 3

- [ ] **Line 15, Col 3** | TS2305
  > Module '"@repo/ui"' has no exported member 'RadioIcon'.
- [ ] **Line 70, Col 13** | TS2322
  > Type '{ children: Element; value: "grade" | "marks" | "gpa" | "both"; onValueChange: (value: string) => void; }' is not assignable to type 'IntrinsicAttributes & { children: ReactNode; value?: string | undefined; onChange?: ((value: string) => void) | undefined; isDisabled?: boolean | undefined; className?: string | undefined; } & ViewProps'.
  > * Property 'onValueChange' does not exist on type 'IntrinsicAttributes & { children: ReactNode; value?: string | undefined; onChange?: ((value: string) => void) | undefined; isDisabled?: boolean | undefined; className?: string | undefined; } & ViewProps'.
- [ ] **Line 99, Col 45** | TS2322
  > Type '{ children: Element[]; value: string; size: string; }' is not assignable to type 'IntrinsicAttributes & IRadioProps'.
  > * Property 'size' does not exist on type 'IntrinsicAttributes & IRadioProps'.

---
### File: src/components/GradebookView.tsx
Total errors in file: 2

- [ ] **Line 104, Col 18** | TS2304
  > Cannot find name 'Pressable'.
- [ ] **Line 129, Col 19** | TS2304
  > Cannot find name 'Pressable'.

---
### File: src/hooks/useTeacherDashboardHooks.ts
Total errors in file: 2

- [ ] **Line 5, Col 8** | TS2305
  > Module '"@repo/core"' has no exported member 'Echo'.
- [ ] **Line 6, Col 8** | TS2305
  > Module '"@repo/core"' has no exported member 'TeacherStats'.

---
### File: src/screens/TeacherDashboard.web.tsx
Total errors in file: 1

- [ ] **Line 185, Col 81** | TS2322
  > Type '{ children: Element[]; isOpen: boolean; onClose: () => void; size: string; }' is not assignable to type 'IntrinsicAttributes & { isOpen: boolean; onClose: () => void; children: ReactNode; } & ViewProps'.
  > * Property 'size' does not exist on type 'IntrinsicAttributes & { isOpen: boolean; onClose: () => void; children: ReactNode; } & ViewProps'.

---
### File: src/workspace/useStudentWorkspaceData.ts
Total errors in file: 1

- [ ] **Line 25, Col 50** | TS7006
  > Parameter 'assignment' implicitly has an 'any' type.

---
### File: src/screens/LessonFeed.tsx
Total errors in file: 1

- [ ] **Line 27, Col 8** | TS2307
  > Cannot find module 'lucide-native' or its corresponding type declarations.

---
### File: src/components/GroupManager.tsx
Total errors in file: 1

- [ ] **Line 389, Col 27** | TS2322
  > Type '{ children: Element; value: string; isChecked: boolean; onChange: () => void; "aria-label": string; size: string; }' is not assignable to type 'IntrinsicAttributes & ICheckboxProps'.
  > * Property 'size' does not exist on type 'IntrinsicAttributes & ICheckboxProps'.

---
### File: src/components/CreateSchoolModal.tsx
Total errors in file: 1

- [ ] **Line 149, Col 7** | TS2578
  > Unused '@ts-expect-error' directive.

---
### File: src/hooks/useStudentDashboardHooks.ts
Total errors in file: 1

- [ ] **Line 6, Col 3** | TS2724
  > '"@repo/core"' has no exported member named 'useStudentAssignmentsQuery'. Did you mean 'useStudentStatsQuery'?

---
### File: src/screens/StudentProfileScreen.tsx
Total errors in file: 1

- [ ] **Line 6, Col 8** | TS2305
  > Module '"@repo/core"' has no exported member 'StudentLongitudinalEvent'.

---
