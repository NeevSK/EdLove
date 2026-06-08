---
title: "Ground Truth Audit 2"
status: "active"
created: 2026-05-27
updated: 2026-05-27
author: "Naween"
tags: [reorganized]
---

# Ground Truth Audit 2

## `packages/self/src/constants/selfRegistry.ts`
**What it does:** This file defines the self registry schema and the Sanctuary domain registry. It lists seven domains, each with an id, title, accent color, optional energy vibe colors, optional trait/capability requirements, and a feature id list.

**Quoted logic:**
```ts
export interface SelfFeature {
  id: string;
  label: string;
  discoveryInfo?: {
    whatIsIt: string;
    whereToFind: string;
  };
}

export interface SelfDomain {
  id: string;
  title: string;
  accentColor: string;
  /** Gradient colors for the 'Energy Sensing' UI (2026 Pattern) */
  energyVibe?: [string, string];
  traitRequirement?: string; // ReBAC Trait (e.g., 'role:student', 'capability:somatic')
  capabilityRequirement?: { action: string; subject: string }; // 2026 Dynamic Cedar alignment
  features: string[]; // IDs of features in this domain
}

export const SANCTUARY_DOMAINS: Record<string, SelfDomain> = {
  journey: {
    id: 'journey',
    title: 'Journey Overview',
    accentColor: '#10B981',
    energyVibe: ['#ECFDF5', '#D1FAE5'],
    features: ['journey_timeline'],
  },
  pulse: {
    id: 'pulse',
    title: 'Inner Pulse',
    accentColor: '#8B5CF6',
    energyVibe: ['#F5F3FF', '#EDE9FE'],
    features: ['daily_pulse', 'mood_lotus', 'wisdom_seeds'],
  },
  growth: {
    id: 'growth',
    title: 'Growth Sanctuary',
    accentColor: '#3B82F6',
    energyVibe: ['#EFF6FF', '#DBEAFE'],
    traitRequirement: 'role:student',
    capabilityRequirement: { action: 'read', subject: 'StudentDashboard' },
    features: ['study_rhythm', 'personal_goals', 'academic_grades'],
  },
  care: {
    id: 'care',
    title: 'Care & Rhythm',
    accentColor: '#EF4444',
    energyVibe: ['#FEF2F2', '#FEE2E2'],
    features: ['sleep_tracker', 'joy_jar', 'gratitude_glimmers'],
  },
  reflection: {
    id: 'reflection',
    title: 'Reflection Tools',
    accentColor: '#F59E0B',
    energyVibe: ['#FFFBEB', '#FEF3C7'],
    features: ['fire_journal', 'voice_journal', 'tomorrow_prep'],
  },
  working: {
    id: 'working',
    title: 'Working Rhythm',
    accentColor: '#10B981',
    energyVibe: ['#F0FDF4', '#DCFCE7'],
    traitRequirement: 'role:teacher',
    capabilityRequirement: { action: 'read', subject: 'TeacherDashboard' },
    features: ['daily_rhythm', 'tomorrow_prep', 'reminders', 'decisions', 'professional_history'],
  },
  leadership: {
    id: 'leadership',
    title: 'Leadership Focus',
    accentColor: '#F59E0B',
    energyVibe: ['#FFF7ED', '#FFEDD5'],
    traitRequirement: 'role:principal',
    capabilityRequirement: { action: 'read', subject: 'PrincipalDashboard' },
    features: [
      'decisions',
      'resonance_patterns',
      'wisdom_seeds',
      'monthly_reflection',
      'governance_history',
    ],
  },
};
```

**Exact data shapes:**  
`SelfFeature` has `id`, `label`, and optional `discoveryInfo.whatIsIt` / `discoveryInfo.whereToFind`.  
`SelfDomain` has `id`, `title`, `accentColor`, optional `energyVibe`, optional `traitRequirement`, optional `capabilityRequirement`, and `features`.  
`SANCTUARY_DOMAINS` is `Record<string, SelfDomain>`.

**Navigation calls:** None.

**Permission/capacity reads:** The file contains string requirements only:
```ts
traitRequirement: 'role:student'
capabilityRequirement: { action: 'read', subject: 'StudentDashboard' }
traitRequirement: 'role:teacher'
capabilityRequirement: { action: 'read', subject: 'TeacherDashboard' }
traitRequirement: 'role:principal'
capabilityRequirement: { action: 'read', subject: 'PrincipalDashboard' }
```

**React Navigation imports:** None.

**Unclear or surprising things:** The registry is called “Sanctuary” in the object name and comments, while the exported type is `SelfDomain`.

**Canvas/rearrangement logic:** None.

---

## `packages/self/src/screens/SelfScreen.tsx`
**What it does:** This component renders the user’s self surface by selecting exactly one role-specific view. It first runs a feature gate, then picks a view using a sequence of `can(...)` checks and `context.capacity`.

**Quoted logic:**
```ts
export default function SelfScreen() {
  const { discoverFeature } = useTracking();
  const { can, context } = usePermissions();

  useEffect(() => {
    void discoverFeature('section_self');
  }, [discoverFeature]);

  return (
    <FeatureGuard feature="isSelfWorkspaceEnabled">
      {(() => {
        const role = context.capacity;

        if (can('manage', 'FounderDashboard')) {
          return <FounderSelfView />;
        }

        if (can('manage', 'AdminDashboard')) {
          return <AdminSelfView />;
        }

        if (can('manage', 'PrincipalDashboard')) {
          return <PrincipalSelfView />;
        }

        if (can('manage', 'TeacherDashboard') || role === 'teacher') {
          return <TeacherSelfView />;
        }

        if (role === 'guardian' || role === 'parent') {
          return <GuardianSelfView />;
        }

        if (can('manage', 'StudentDashboard') || role === 'student') {
          return <StudentSelfView />;
        }

        return <StudentSelfView />;
      })()}
    </FeatureGuard>
  );
}
```

**Exact data shapes:** No local type declarations in this file.

**Navigation calls:** None.

**Permission/capacity reads:**  
```ts
const { can, context } = usePermissions();
const role = context.capacity;
if (can('manage', 'FounderDashboard')) { ... }
if (can('manage', 'AdminDashboard')) { ... }
if (can('manage', 'PrincipalDashboard')) { ... }
if (can('manage', 'TeacherDashboard') || role === 'teacher') { ... }
if (role === 'guardian' || role === 'parent') { ... }
if (can('manage', 'StudentDashboard') || role === 'student') { ... }
```

**React Navigation imports:** None.

**Unclear or surprising things:** The fallback always returns `StudentSelfView`, including when `context.capacity` is `null`. The file renders one view only; it does not stack multiple role views. There is no explicit base layer in this file.

**Canvas/rearrangement logic:** None.

---

## `packages/classroom/src/screens/ClassroomScreen.tsx`
**What it does:** This screen either renders a workspace canvas for the classroom surfaces or a classroom list / fallback flow. It fetches role data, computes workspace surfaces, resolves a layout, and renders the canvas with hide/pin/zone callbacks.

**Quoted logic:**
```ts
const workspaceSurfaces = useClassroomWorkspaceSurfaces({
  can: canForWorkspace,
  t,
  isGuest,
  classroomData,
  schoolIdToUse: classroomData?.schoolId || storeSchoolId,
  isDemoModeTriggered,
  setIsDemoModeTriggered,
  setIsCreateSchoolOpen,
  setIsCreateClassroomOpen,
  setIsClaimInviteOpen,
  setBreathingOpen,
  fetchRoleData,
  navigation,
  surfaceInsights,
  citizenship: context.citizenship || 'WANDERER',
  isPro: context.pricing_tier === 'PRO',
  userCapabilities: context.features || [],
});
const {
  surfaces: arrangedWorkspaceSurfaces,
  layout,
  setSurfaceHidden,
  setSurfacePinned,
  setSurfaceZone,
} = useClassroomWorkspaceLayout(classroomData?.userId, workspaceSurfaces);
```

```tsx
<ClassroomWorkspaceCanvas
  layout={layout}
  surfaces={arrangedWorkspaceSurfaces}
  onToggleHidden={setSurfaceHidden}
  onTogglePinned={setSurfacePinned}
  onMoveToNextZone={setSurfaceZone}
/>
```

```ts
navigation.navigate('Auth' as never);
```

```ts
nav.navigate('Classroom', {
  screen: 'ClassroomDashboard',
  params: {
    classroomId: classroom.id,
    classroomName: classroom.name,
  },
});
```

**Exact data shapes:** No local type declarations in this file.

**Navigation calls:**  
`navigation.navigate('Auth' as never)` is called from the anonymous fallback `PositiveInvitation` action.  
`nav.navigate('Classroom', { screen: 'ClassroomDashboard', params: { classroomId, classroomName } })` is called when a classroom is pressed.

**Permission/capacity reads:**  
```ts
const { can, context } = usePermissions();
citizenship: context.citizenship || 'WANDERER'
isPro: context.pricing_tier === 'PRO'
userCapabilities: context.features || []
```

**React Navigation imports:**  
```ts
import { type NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
```
Used for `useNavigation()` and the `NavigationProp<Record<string, unknown>>` type.

**Unclear or surprising things:** `context.capacity` is not read directly here. The file uses `citizenship`, `pricing_tier`, and `features` from permissions context. The workspace canvas path is clearly mixed with classroom naming.

**Canvas/rearrangement logic:**  
The screen uses a canvas plus layout state:
```ts
const {
  surfaces: arrangedWorkspaceSurfaces,
  layout,
  setSurfaceHidden,
  setSurfacePinned,
  setSurfaceZone,
} = useClassroomWorkspaceLayout(classroomData?.userId, workspaceSurfaces);
```
and passes those callbacks into `ClassroomWorkspaceCanvas`.

---

## `packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx`
**What it does:** This hook assembles an ordered list of workspace surfaces for the classroom experience. It uses feature registry checks, admin surface injection, and conditional teacher/student surface assembly.

**Quoted logic:**
```ts
type UseClassroomWorkspaceSurfacesArgs = {
  can: (action: string, subject: string, field?: string) => boolean;
  t: (key: string) => string;
  isGuest: boolean;
  classroomData: {
    userId: string;
    schoolId: string | null;
    profileCompleted: boolean;
    realClassCount: number;
  } | null;
  schoolIdToUse?: string | null;
  isDemoModeTriggered: boolean;
  setIsDemoModeTriggered: (value: boolean) => void;
  setIsCreateSchoolOpen: (value: boolean) => void;
  setIsCreateClassroomOpen: (value: boolean) => void;
  setIsClaimInviteOpen: (value: boolean) => void;
  setBreathingOpen: (value: boolean) => void;
  fetchRoleData: () => void | Promise<void>;
  navigation: { navigate: (screen: string, params?: any) => void };
  surfaceInsights?: Partial<
    Record<
      ClassroomWorkspaceSurfaceId,
      {
        summary?: string;
        temporalLabel?: string;
        metadata?: string[];
      }
    >
  >;
  citizenship: string; // 'WANDERER' | 'SECOND_CLASS' | 'FIRST_CLASS'
  isPro: boolean;
  userCapabilities: string[];
};
```

```ts
const CITIZENSHIP_MAP: Record<string, number> = {
  WANDERER: 0,
  SECOND_CLASS: 1,
  FIRST_CLASS: 2,
};
```

```ts
const classroomGated = useFeatureRegistry(CLASSROOM_REGISTRY, {
  citizenship: citizenshipLevel,
  isPro,
  capabilities: userCapabilities,
  can,
});
```

```ts
const surfaces: ClassroomWorkspaceSurface[] = [];

appendAdminWorkspaceSurfaces(surfaces, {
  can,
  isGuest,
  isDemoModeTriggered,
  classroomData,
  schoolIdToUse,
  setIsDemoModeTriggered,
  setIsCreateSchoolOpen,
  setIsCreateClassroomOpen,
  setIsClaimInviteOpen,
  setBreathingOpen,
  fetchRoleData,
  navigation,
  surfaceInsights,
});

...

surfaces.push({
  ...teacherGate.feature,
  title: teacherGate.feature.label,
  subtitle: teacherGate.feature.description,
  summary: surfaceInsights?.teacher?.summary ?? 'Assignments, lessons, attendance, grading, and teacher-owned pedagogical signals.',
  temporalLabel: surfaceInsights?.teacher?.temporalLabel ?? 'Daily Work',
  metadata: surfaceInsights?.teacher?.metadata ?? ['Academic', 'Write owner'],
  content: teacherContent,
} as ClassroomWorkspaceSurface);

...

surfaces.push({
  ...studentGate.feature,
  title: studentGate.feature.label,
  subtitle: studentGate.feature.description,
  summary: surfaceInsights?.student?.summary ?? 'Personal learning journey, active goals, and student-owned feedback loops.',
  temporalLabel: surfaceInsights?.student?.temporalLabel ?? 'Journey',
  metadata: surfaceInsights?.student?.metadata ?? ['Academic', 'Student-owned'],
  content: studentContent,
} as ClassroomWorkspaceSurface);
```

**Exact data shapes:**  
The args object includes `classroomData` with `userId`, `schoolId`, `profileCompleted`, and `realClassCount`, plus booleans and setters for demo/create/claim/breathing state, `surfaceInsights`, `citizenship`, `isPro`, and `userCapabilities`.  
`CITIZENSHIP_MAP` maps `WANDERER`, `SECOND_CLASS`, and `FIRST_CLASS` to numeric levels.  
The hook returns `useMemo<ClassroomWorkspaceSurface[]>(...)`.

**Navigation calls:**  
```ts
navigation.navigate('Profile')
navigation.navigate('Search')
```
These are called from surface content actions. The `navigation` argument is a plain object with `navigate(screen, params?)`.

**Permission/capacity reads:**  
```ts
citizenship: string; // 'WANDERER' | 'SECOND_CLASS' | 'FIRST_CLASS'
const citizenshipLevel = CITIZENSHIP_MAP[citizenship] ?? 0;
useFeatureRegistry(CLASSROOM_REGISTRY, {
  citizenship: citizenshipLevel,
  isPro,
  capabilities: userCapabilities,
  can,
});
```
It does not read `context.capacity` or `activeBond` directly.

**React Navigation imports:** None in this file.

**Unclear or surprising things:** This file assembles workspace surfaces with classroom naming. It also injects admin workspace surfaces by calling `appendAdminWorkspaceSurfaces`.

**Canvas/rearrangement logic:** The file itself assembles surfaces, but does not persist order. It returns a surface array to be laid out by a separate layout hook.

---

## `packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx`
**What it does:** This hook manages teacher workspace shell state, including modal state, scanners, feedback, and attendance navigation. It also loads classroom data and exposes handlers for shell actions.

**Quoted logic:**
```ts
type WorkspaceClassroom = {
  id: string;
  name: string;
  student_count?: string | number | null;
};
```

```ts
const { isDemoMode } = useStore();
const { isGuest } = useFeatureAccess();
const { isPastView } = useTemporalStore();
```

```ts
const [uiState, setUiState] = useState({
  isCreateModalOpen: false,
  isFeedbackModalOpen: false,
  isAdminModalOpen: false,
  isBreathingOpen: false,
  showEchoHistory: false,
  isScannerOpen: false,
  modalMode: 'create' as 'create' | 'join',
});
```

```ts
navigation.navigate('Attendance', {
  classroomId: classrooms[0].id,
  classroomName: classrooms[0].name,
});
```

**Exact data shapes:**  
`WorkspaceClassroom` has `id`, `name`, and optional `student_count`.  
The hook returns an object containing `isDemoMode`, `isGuest`, `isPastView`, `uiState`, setters, classroom arrays, stats, and handlers.

**Navigation calls:** `navigation.navigate('Attendance', { classroomId, classroomName })`.

**Permission/capacity reads:**  
```ts
const { isGuest } = useFeatureAccess();
const { isDemoMode } = useStore();
const { isPastView } = useTemporalStore();
```
No direct `context.capacity` read appears in this file.

**React Navigation imports:**  
```ts
import type { NavigationProp } from '@react-navigation/native';
```
Used as `NavigationProp<ClassroomStackParamList>` for the `navigation` parameter.

**Unclear or surprising things:** The hook is named teacher-specific, but much of its content is shell-state and navigation wiring rather than teacher-only content.

**Canvas/rearrangement logic:** None in this file.

---

## `packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts`
**What it does:** This hook synchronizes classroom workspace layout through the shared workspace layout sync layer, then rehydrates resolved surfaces by `surfaceId`.

**Quoted logic:**
```ts
export function useClassroomWorkspaceLayout(
  userId: string | null | undefined,
  surfaces: ClassroomWorkspaceSurface[],
) {
  const workspace = useWorkspaceLayoutSync<
    ClassroomWorkspaceSurfaceId,
    ClassroomWorkspaceCapabilityKey,
    ClassroomWorkspaceSurface
  >({
    workspaceId: 'classroom',
    userId,
    surfaces,
  });

  const resolvedSurfaceMap = useMemo(
    () => new Map(workspace.surfaces.map((surface) => [surface.surfaceId, surface] as const)),
    [workspace.surfaces],
  );

  const enrichedSurfaces = useMemo(
    () =>
      surfaces
        .map((surface) => {
          const resolved = resolvedSurfaceMap.get(surface.surfaceId);
          if (!resolved) return null;

          return {
            ...surface,
            ...resolved,
          } as ClassroomWorkspaceSurface & ResolvedWorkspaceSurface<ClassroomWorkspaceSurfaceId>;
        })
        .filter(Boolean) as Array<
        ClassroomWorkspaceSurface & ResolvedWorkspaceSurface<ClassroomWorkspaceSurfaceId>
      >,
    [surfaces, resolvedSurfaceMap],
  );

  return {
    ...workspace,
    surfaces: enrichedSurfaces,
  };
}
```

**Exact data shapes:** It accepts `userId` and `surfaces: ClassroomWorkspaceSurface[]`. It returns the workspace sync object with an overridden `surfaces` field containing enriched resolved surfaces.

**Navigation calls:** None.

**Permission/capacity reads:** None directly.

**React Navigation imports:** None.

**Unclear or surprising things:** The workspace id is hard-coded as `'classroom'`.

**Canvas/rearrangement logic:** It reads and returns layout state from `useWorkspaceLayoutSync`, but does not itself reorder surfaces.

---

## `packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx`
**What it does:** This component adapts resolved classroom workspace surfaces to the shared `WorkspaceCanvas` component. It renders surface content and surface action controls for pinning, moving zones, and hiding.

**Quoted logic:**
```ts
type ClassroomResolvedSurface = ClassroomWorkspaceSurface &
  ResolvedWorkspaceSurface<ClassroomWorkspaceSurfaceId, ClassroomWorkspaceCapabilityKey>;

type Props = {
  layout: {
    order: ClassroomWorkspaceSurfaceId[];
    hidden: ClassroomWorkspaceSurfaceId[];
    pinned: ClassroomWorkspaceSurfaceId[];
    zoneBySurface: Partial<Record<ClassroomWorkspaceSurfaceId, WorkspaceZoneId>>;
    workspaceId: string;
    userId: string;
    updatedAt: string;
  } | null;
  surfaces: ClassroomResolvedSurface[];
  onToggleHidden: (id: ClassroomWorkspaceSurfaceId, hidden: boolean) => void;
  onTogglePinned: (id: ClassroomWorkspaceSurfaceId, pinned: boolean) => void;
  onMoveToNextZone: (id: ClassroomWorkspaceSurfaceId, zone: WorkspaceZoneId) => void;
};
```

```tsx
<WorkspaceCanvas
  surfaces={surfaces}
  layout={layout as any}
  title="Classroom Work Canvas"
  subtitle="Capability-driven workspace for academic, mixed-role, and institutional surfaces."
  emptyMessage="No workspace surfaces are available for this user yet."
  renderSurfaceContent={(surface) => {
    const typedSurface = surface as ClassroomResolvedSurface;
    return <Box className="flex-1">{typedSurface.content}</Box>;
  }}
  getSurfaceSubtitle={(surface) => (surface as ClassroomResolvedSurface).subtitle}
  getSurfaceSummary={(surface) => (surface as ClassroomResolvedSurface).summary}
  getSurfaceTemporalLabel={(surface) => (surface as ClassroomResolvedSurface).temporalLabel}
  getSurfaceMetadata={(surface) => (surface as ClassroomResolvedSurface).metadata}
  renderSurfaceActions={(surface) => {
    const typedSurface = surface as ClassroomResolvedSurface;
    const nextZone = getNextZone(typedSurface.zone);
    ...
  }}
  onToggleHidden={(surface) => onToggleHidden(surface.surfaceId, !surface.hidden)}
/>;
```

**Exact data shapes:**  
`Props.layout` contains `order`, `hidden`, `pinned`, `zoneBySurface`, `workspaceId`, `userId`, and `updatedAt`.  
`surfaces` is an array of `ClassroomResolvedSurface`.  
The component itself renders `WorkspaceCanvas`.

**Navigation calls:** None.

**Permission/capacity reads:** None directly in this component.

**React Navigation imports:** None.

**Unclear or surprising things:** The title/subtitle explicitly describe this as a capability-driven workspace canvas, and the component name is classroom-specific even though the underlying shape is workspace-general.

**Canvas/rearrangement logic:**  
```ts
const getNextZone = (zone: WorkspaceZoneId): WorkspaceZoneId => {
  const currentIndex = WORKSPACE_CANVAS_ZONES.indexOf(zone);
  const nextIndex = (currentIndex + 1) % WORKSPACE_CANVAS_ZONES.length;
  return WORKSPACE_CANVAS_ZONES[nextIndex] as WorkspaceZoneId;
};
```
and the render surface actions expose pin / move-to-next-zone controls.

---

## `packages/ui/src/components/workspace/WorkspaceCanvas.tsx`
**What it does:** This is a re-export wrapper. It aliases `ResponsiveWorkspaceCanvas` as both `WorkspaceCanvas` and default export.

**Quoted logic:**
```ts
export {
  ResponsiveWorkspaceCanvas as WorkspaceCanvas,
  ResponsiveWorkspaceCanvas as default,
} from './ResponsiveWorkspaceCanvas';
export type { WorkspaceCanvasProps } from './types';
```

**Exact data shapes:** Not defined here; this file only re-exports types and components.

**Navigation calls:** None.

**Permission/capacity reads:** None.

**React Navigation imports:** None.

**Unclear or surprising things:** None beyond the aliasing.

**Canvas/rearrangement logic:** None.

---

## `packages/ui/src/screens/WorkspaceCanvasDemo.tsx`
**What it does:** This demo screen exercises the shared workspace canvas and layout system with multiple roles and default layouts. It creates layouts, updates hidden/pinned/zone state, and renders `WorkspaceCanvas`.

**Quoted logic:**
```ts
type DemoSurface = WorkspaceSurfaceDefinition<DemoSurfaceId, DemoCapabilityKey>;
```

```ts
const [layoutByRole, setLayoutByRole] = useState<
  Record<DemoRole, WorkspaceLayout<DemoSurfaceId>>
>(() => ({
  teacher: createDefaultWorkspaceLayout({
    workspaceId: 'classroom',
    userId: 'demo-teacher',
    surfaces: buildRoleSurfaces('teacher'),
  }),
  principal: createDefaultWorkspaceLayout({
    workspaceId: 'classroom',
    userId: 'demo-principal',
    surfaces: buildRoleSurfaces('principal'),
  }),
  founder: createDefaultWorkspaceLayout({
    workspaceId: 'classroom',
    userId: 'demo-founder',
    surfaces: buildRoleSurfaces('founder'),
  }),
}));
```

```tsx
<WorkspaceCanvas
  title={`${ROLE_LABELS[role]} Workspace Canvas`}
  subtitle="Responsive renderer demo with snapshot, temporal state, metadata, info, and action slots."
  surfaces={surfaces}
  ...
/>
```

**Exact data shapes:** Demo role layouts are stored in a `Record<DemoRole, WorkspaceLayout<DemoSurfaceId>>`.

**Navigation calls:** None.

**Permission/capacity reads:** Demo role state is local, not from auth/capacity.

**React Navigation imports:** None.

**Unclear or surprising things:** This is a demo screen, not a product screen, but it confirms the shared canvas/layout architecture exists in UI.

**Canvas/rearrangement logic:** Yes, it updates layout state with `setWorkspaceSurfaceHidden` and related helpers.

---

## Naming sweep: exact files found

### `WorkspaceCanvas`
- `packages/ui/src/components/workspace/WorkspaceCanvas.tsx` - export alias / component re-export
- `packages/ui/src/components/workspace/ResponsiveWorkspaceCanvas.tsx` - component implementation
- `packages/ui/src/components/workspace/types.ts` - type definitions for workspace canvas props
- `packages/ui/src/screens/WorkspaceCanvasDemo.tsx` - component usage in demo screen
- `packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx` - component definition and usage
- `packages/classroom/src/screens/ClassroomScreen.tsx` - component import and render
- `packages/admin/src/admin/useAdminWorkspaceCanvas.tsx` - component import, component definition, and render
- `packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx` - component import, component definition, and render
- `packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx` - component import, component definition, and render
- `packages/admin/src/founder/useFounderWorkspaceCanvas.tsx` - component import, component definition, and render
- `packages/admin/src/screens/AdminDashboard.tsx` - component import and render
- `packages/admin/src/screens/GuardianDashboard.tsx` - component import and render
- `packages/admin/src/screens/PrincipalDashboard.tsx` - component import and render

### `WorkspaceLayout`
- `packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts` - hook export and usage
- `packages/classroom/src/screens/ClassroomScreen.tsx` - hook import and call
- `packages/admin/src/admin/useAdminWorkspaceCanvas.tsx` - hook export and usage
- `packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx` - hook export and usage
- `packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx` - hook export and usage
- `packages/admin/src/founder/useFounderWorkspaceCanvas.tsx` - hook export and usage
- `packages/core/src/logic/schemas/workspace-layout.schema.ts` - schema/type definitions
- `packages/core/src/api/workspaceLayout.ts` - API methods
- `packages/core/src/api/workspaceLayout.contract.ts` - contract router
- `packages/core/src/logic/domains/workspaceLayout/services.ts` - service interface and factory
- `packages/core/src/logic/domains/workspaceLayout/ports.ts` - repository interface
- `packages/core/src/api/__tests__/workspace-layout-poa.test.ts` - tests

### `WorkspaceSurface`
- `packages/core/src/types/Workspace.ts` - workspace surface type definitions
- `packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx` - `ClassroomWorkspaceSurface`
- `packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx` - `ClassroomResolvedSurface`
- `packages/admin/src/hooks/useAdminWorkspaceSurfaces.tsx` - `ClassroomWorkspaceSurface` used as a shared workspace surface type
- `packages/admin/src/admin/useAdminWorkspaceCanvas.tsx` - `AdminWorkspaceSurface`
- `packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx` - `PrincipalWorkspaceSurface`
- `packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx` - `GuardianWorkspaceSurface`
- `packages/admin/src/founder/useFounderWorkspaceCanvas.tsx` - `FounderWorkspaceSurface`
- `packages/ui/src/screens/WorkspaceCanvasDemo.tsx` - `WorkspaceSurfaceDefinition`

### `WorkspaceShell`
- `packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx` - hook export
- `packages/admin/src/bridge/principalWorkspaceShell.tsx` - component and hook export
- `packages/admin/src/principal/usePrincipalWorkspaceSurfaces.tsx` - hook import and use

### `Canvas`
- `packages/ui/src/components-native/TemporalGlass.tsx` - Skia `Canvas` import and render
- `packages/ui/src/components-native/NoiseOverlay.tsx` - Skia `Canvas` import and render
- `packages/ui/src/components-native/LivingCard.tsx` - Skia `Canvas` import and render
- `packages/ui/src/components/workspace/WorkspaceCanvas.tsx` - component export
- `packages/ui/src/components/workspace/ResponsiveWorkspaceCanvas.tsx` - implementation
- `packages/ui/src/screens/WorkspaceCanvasDemo.tsx` - demo usage
- `packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx` - component definition and usage
- `packages/admin/src/admin/useAdminWorkspaceCanvas.tsx` - component import, definition, and usage
- `packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx` - component import, definition, and usage
- `packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx` - component import, definition, and usage
- `packages/admin/src/founder/useFounderWorkspaceCanvas.tsx` - component import, definition, and usage

### `CanvasLayout`
- No exact `CanvasLayout` symbol was found in the sweep.

---

## Canvas and Naming Summary

1. **Full shape of a workspace surface as it exists today:** A workspace surface is a typed object with `surfaceId`, `workspaceId`, `capabilityKey`, ownership fields, presentation fields like `title`, `subtitle`, `summary`, `temporalLabel`, `metadata`, and `content`, plus layout fields like `zone`, `hidden`, and `pinned`. This is visible in `ClassroomWorkspaceCanvas.tsx`, `useClassroomWorkspaceSurfaces.tsx`, the admin workspace canvas files, and the shared `WorkspaceSurfaceDefinition` / `ResolvedWorkspaceSurface` types.

2. **How surfaces are selected and ordered today:** Surfaces are assembled by domain-specific hooks into arrays, then passed to `useWorkspaceLayoutSync` or equivalent layout hooks. Selection is conditional on capability / registry checks; ordering is then resolved by the layout layer, which returns `order`, `hidden`, `pinned`, and `zoneBySurface`.

3. **Whether `useTeacherWorkspaceShell` is teacher-specific in logic or just in name:** The file name is teacher-specific, but the body is mostly shell state, modal state, QR / attendance navigation, and data loading. The naming is teacher-specific; the logic contains general shell behaviors.

4. **Whether `ClassroomWorkspaceCanvas` could be renamed `WorkspaceCanvas` without conflicts:** The repository already contains `packages/ui/src/components/workspace/WorkspaceCanvas.tsx` and a shared `WorkspaceCanvas` export, so the name already exists elsewhere.

5. **Whether `useClassroomWorkspaceLayout` could be renamed `useWorkspaceLayout` without conflicts:** The repository already contains `WorkspaceLayout` as a type and layout schema / API / contract names in `packages/core`. The exact hook name `useWorkspaceLayout` was not found in the sweep, but the generic term `WorkspaceLayout` is already in use across core, admin, and UI.

6. **Full list of selfRegistry domains — base and role-specific:** Base / shared: `journey`, `pulse`, `care`, `reflection`. Role-specific: `growth` (student), `working` (teacher), `leadership` (principal).

7. **Whether `SelfScreen` renders one role view or stacks multiple:** It renders exactly one role view.

8. **What happens in `SelfScreen` when the user holds multiple roles:** The file checks in order: founder, admin, principal, teacher, guardian/parent, student. The first matching branch returns and the rest are skipped.

9. **Any naming conflicts that would block using `Workspace`, `Canvas`, `WorkspaceLayout`, `WorkspaceSurface` as canonical names going forward:** The names `Canvas`, `WorkspaceLayout`, and `WorkspaceSurface` are already present in the codebase in multiple places. `WorkspaceCanvas` is already exported from `packages/ui/src/components/workspace/WorkspaceCanvas.tsx`. `WorkspaceLayout` appears in core schemas, APIs, tests, and domain services. `WorkspaceSurface` appears in core types and multiple workspace packages. `CanvasLayout` was not found.
