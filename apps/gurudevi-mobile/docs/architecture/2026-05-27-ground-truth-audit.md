---
title: "Ground Truth Audit"
status: "active"
created: 2026-05-27
updated: 2026-05-27
author: "Naween"
tags: [reorganized]
---

# Ground Truth Audit

Do not implement anything in this pass.
Do not suggest changes.
Do not make assumptions about intent.
Only read the actual file contents and report exactly what is in the files.

---

## packages/core/src/store/slices/auth.slice.ts
**What it does:** Defines the auth slice for the Zustand store. It stores user identity, session state, onboarding flags, demo/explorer flags, a toast payload, and identity-lens fields like `activePerspective`, `activeBond`, and `availableBonds`.

**Exact data shapes:**  
```ts
export interface AuthSlice {
  activePerspective: Perspective | null;
  activeBond: Bond | null;
  availableBonds: Bond[];
  setPerspective: (perspective: Perspective | null) => void;
  setAvailableBonds: (bonds: Bond[]) => void;
  userName: string;
  setUserName: (name: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  authSession: Session | null;
  authSessionResolved: boolean;
  setAuthSession: (session: Session | null) => void;
  setAuthSessionResolved: (resolved: boolean) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  justFinishedOnboarding: boolean;
  setJustFinishedOnboarding: (justFinished: boolean) => void;
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;
  isExplorerMode: boolean;
  setExplorerMode: (isExplorer: boolean) => void;
  isBridging: boolean;
  setBridging: (isBridging: boolean) => void;
  dismissedSampleIds: string[];
  dismissSample: (id: string) => void;
  demoLogs: Array<{ module: string; method: string; payload: unknown; timestamp: number }>;
  addDemoLog: (log: { module: string; method: string; payload: unknown }) => void;
  clearDemoLogs: () => void;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  toast: { message: string; type: 'success' | 'error' | 'info'; duration?: number } | null;
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  hideToast: () => void;
  isStoreHydrated: boolean;
  setStoreHydrated: (hydrated: boolean) => void;
}
```

The slice initializer sets:
```ts
activePerspective: null,
activeBond: null,
availableBonds: [],
```

The update action is:
```ts
setPerspective: (perspective) =>
  set({
    activePerspective: perspective,
    activeBond: perspective?.activeBond || null,
  }),
```

`setAvailableBonds` is:
```ts
setAvailableBonds: (bonds) => set({ availableBonds: bonds }),
```

**Navigation calls:** none.

**Permission/capacity reads:** none directly in this file.

**React Navigation imports:** none.

**Unclear or surprising things:** `activePerspective` and `activeBond` are both stored; `setPerspective` also updates `activeBond` from `perspective?.activeBond`.

**Canvas/rearrangement logic:** none.

---

## packages/core/src/logic/permissions/hooks/usePermissions.ts
**What it does:** Builds a canonical `context` from auth/tenant/feature stores and exposes `can`/`cannot` against a permissions map. It does not call React Navigation.

**Exact data shapes:**  
```ts
const context: UserContext = useMemo(() => {
  const activePerspective = useAuthStore.getState().activePerspective;
  const availableBonds = useAuthStore.getState().availableBonds || [];
  const activeBond = activePerspective?.activeBond ?? null;
  const isPersonal = schoolType === 'personal_workspace';

  const rawContext: UserContext = {
    userId: user?.id || null,
    email: user?.email || null,
    bonds: availableBonds as UserContext['bonds'],
    primaryCapacity: availableBonds[0]?.capacity || null,
    activeBond: activeBond as UserContext['activeBond'],
    capacity: activeBond?.capacity || null,
    traits: activeBond?.capacity ? [`capacity:${activeBond.capacity}`] : [],
    tier: user?.tier || 'free',
    citizenship:
      user?.citizenship === 'SECOND_CLASS' || user?.citizenship === 'FIRST_CLASS'
        ? user.citizenship
        : 'WANDERER',
    pricing_tier:
      user?.pricing_tier === 'PRO' || user?.pricing_tier === 'INSTITUTIONAL'
        ? user.pricing_tier
        : 'FREE',
    features: user?.features || [],
    flags: user?.flags || {},
    schoolId: activeBond?.entity_type === 'SCHOOL' ? activeBond.entity_id : null,
    tenancyName: null,
    tenancy: {
      kind: 'customer' as TenantKind,
      isPersonal,
    },
    tenantKind: 'customer' as TenantKind,
    isAnonymous: !user,
    hasGlobalAccess: activeBond?.capacity === 'founder' || activeBond?.capacity === 'admin',
    isPersonal,
    sectionId: null,
    gradeId: null,
    classroomId: activeBond?.entity_type === 'CLASSROOM' ? activeBond.entity_id : null,
  };
  return UserContextSchema.parse(rawContext);
}, [user, schoolType]);
```

The hook returns:
```ts
{
  context,
  flags,
  can,
  cannot,
}
```

`can` is:
```ts
const isAllowed = permissionsMap[subject as string]?.[action as string];
return isAllowed === true;
```

`cannot` is:
```ts
return !can(action, subject);
```

**Navigation calls:** none.

**Permission/capacity reads:**  
```ts
const user = useAuthStore((state) => state.user);
const schoolType = useTenantStore((state) => state.schoolType);
const flags = useFeatureStore((state) => state.flags);
const permissionsMap = usePermissionStore((state) => state.permissionsMap);
const activePerspective = useAuthStore.getState().activePerspective;
const availableBonds = useAuthStore.getState().availableBonds || [];
```

**React Navigation imports:** none.

**Unclear or surprising things:** `activeBond` is taken from `activePerspective?.activeBond`, while `primaryCapacity` is taken from `availableBonds[0]?.capacity`.

**Canvas/rearrangement logic:** none.

---

## packages/core/src/types/navigation.ts
**What it does:** Re-exports param list types from `@repo/core/types`.

**Exact data shapes:**  
```ts
export type {
  ClassroomStackParamList,
  CommunityStackParamList,
  FounderStackParamList,
  ProfileStackParamList,
} from '@repo/core/types';
```

**Navigation calls:** none.

**Permission/capacity reads:** none.

**React Navigation imports:** none.

**Unclear or surprising things:** this file is only a re-export surface.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/src/types/navigation.ts
**What it does:** Also re-exports the same four stack param list types from `@repo/core/types`.

**Exact data shapes:**  
```ts
export type {
  ClassroomStackParamList,
  CommunityStackParamList,
  FounderStackParamList,
  ProfileStackParamList,
} from '@repo/core/types';
```

**Navigation calls:** none.

**Permission/capacity reads:** none.

**React Navigation imports:** none.

**Unclear or surprising things:** it is duplicated with the core version and does not extend the types.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/App.tsx
**What it does:** Builds the root app shell, initializes telemetry, fonts, push notifications, and renders a React Navigation `NavigationContainer` with a root native stack of welcome/auth/onboarding/main/admin/public-form/QR flows.

**Exact data shapes:** no standalone exported type definitions in this file.

**Navigation calls:**  
- `navigationRef.navigate('Auth' as never)` in `WelcomeRouteScreen` when login is pressed.
- `navigationRef.navigate('Onboarding' as never)` in `WelcomeRouteScreen` when guest flow is pressed.
- `navigation.goBack()` in `AuthRouteScreen`.
- `navigationRef.navigate('Onboarding' as never)` in `AuthRouteScreen` when auth succeeds.
- `navigationRef.navigate('QRHandler', { payload })` in `useQRDeepLink`.

**Permission/capacity reads:**  
- `const currentUser = useStore((state) => state.user);`
- `const { session, loading, isProfileLoading } = useAuth();`
- `const onboardingCompleted = useStore((state) => state.onboardingCompleted);`

**React Navigation imports:**  
- `NavigationContainer, useNavigation` from `@react-navigation/native`
- `createNativeStackNavigator` from `@react-navigation/native-stack`

**Unclear or surprising things:** `NavigationContainer` receives a `linking` object sourced from `deepLink.getNavigationConfig()`, and `useAppEntryGate` runs outside the navigator tree but still depends on `navigationRef`.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/src/navigation/useAppEntryGate.ts
**What it does:** Evaluates the current root route and decides whether to navigate or reset to Welcome, Onboarding, or Main based on session and onboarding state.

**Exact data shapes:**  
```ts
type GateIntent =
  | { type: 'idle' }
  | { type: 'navigate'; route: 'Main' | 'Onboarding' }
  | { type: 'reset'; route: 'Welcome' | 'Onboarding' };
```

The route sets are:
```ts
const PUBLIC_ROOT_ROUTES = new Set([
  'Welcome',
  'Auth',
  'Onboarding',
  'InvitationWelcome',
  'PublicForm',
  'QRHandler',
  'Main',
]);

const SETUP_FLOW_ROUTES = new Set(['Welcome', 'Auth', 'Onboarding']);

const APP_ROOT_ROUTES = new Set([
  'AdminDashboard',
  'AdminIncidentQueue',
  'AdminTenantDetail',
  'AdminAuthorityRepair',
  'AdminJobControl',
  'AdminAuditLog',
  'AdminReleaseControl',
  'AIAssistant',
  'ThuthimalClaim',
]);
```

**Navigation calls:**  
- `navigationRef.navigate(intent.route as never);`
- `navigationRef.reset({ index: 0, routes: [{ name: intent.route as never }] });`

**Permission/capacity reads:**  
- `session`
- `isProfileLoading`
- `onboardingCompleted`
- `currentRoute`

**React Navigation imports:**  
- `NavigationContainerRefWithCurrent` from `@react-navigation/native`

**Unclear or surprising things:** `resolveGateIntent` treats `Main` as a public root route, and a `justCompletedOnboarding` transition can force `Main`.

**Canvas/rearrangement logic:** none.

---

## packages/core/src/logic/permissions/hooks/useNavigationAuthGuard.ts
**What it does:** Uses the current route name and onboarding/session state to reset to Welcome when access is not allowed.

**Exact data shapes:** none besides the function signature.

**Navigation calls:**  
- `navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' as never }] });`
- `navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' }] });`

**Permission/capacity reads:**  
- `const { session, isProfileLoading } = useAuth();`
- `const hasValidSession = !!session;`
- `onboardingCompleted`

**React Navigation imports:**  
- `NavigationContainerRef` from `@react-navigation/native`

**Unclear or surprising things:** this guard uses hard-coded allowed root routes and onboarding routes and only checks the top-level route name.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/src/navigation/navigationRef.ts
**What it does:** Exports a shared `navigationRef` created with React Navigation.

**Exact data shapes:**  
```ts
export const navigationRef = createNavigationContainerRef<any>();
```

**Navigation calls:** none directly, but this ref is used elsewhere for `navigate()` and `reset()`.

**Permission/capacity reads:** none.

**React Navigation imports:**  
- `createNavigationContainerRef` from `@react-navigation/native`

**Unclear or surprising things:** the ref is typed as `any`.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/src/navigation/TabNavigator.tsx
**What it does:** Renders the native bottom tab shell with Profile, Classroom, Self, Community, Library, and optional Workforce tabs. It also renders achievement and breathing modals outside the tab navigator.

**Exact data shapes:**  
```ts
const [currentTab, setCurrentTab] = useState<
  'self' | 'classroom' | 'community' | 'library' | 'profile' | 'workforce'
>('self');
```

**Navigation calls:** none directly in this file.

**Permission/capacity reads:**  
- `const { context, flags } = usePermissions();`
- `const capacity = useMemo(() => context.activeBond?.capacity || context.primaryCapacity, [...])`
- `flags.isDevelopingWorkforce`

**React Navigation imports:**  
- `createBottomTabNavigator` from `@react-navigation/bottom-tabs`

**Unclear or surprising things:** the tab label for Classroom is derived from capacity, but the route names remain fixed. The Workroom equivalent is not present; this file still uses `Classroom`.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/src/navigation/TabNavigator.web.tsx
**What it does:** Renders a custom web shell around the tab navigator with a sidebar, top bar, overlay behavior, mobile bottom nav, document title changes, and lazily loaded panel screens.

**Exact data shapes:**  
```ts
const TAB_CONFIG = [
  { name: 'Self', icon: Heart, labelKey: 'tabs.self', mobileLabelKey: 'tabs.self' },
  { name: 'Community', icon: Users, labelKey: 'tabs.community', mobileLabelKey: 'tabs.community' },
  { name: 'Classroom', icon: School, labelKey: 'tabs.classroom', mobileLabelKey: 'tabs.classroom' },
  { name: 'Library', icon: Library, labelKey: 'tabs.library', mobileLabelKey: 'tabs.library' },
  { name: 'Profile', icon: User, labelKey: 'tabs.profile', mobileLabelKey: 'tabs.profile' },
];
```

**Navigation calls:**  
- `nav.navigate('Main', { screen: conf.name });`
- `nav.navigate('Main', { screen: activeTab === 'NotificationsPanel' ? 'Self' : 'NotificationsPanel' });`
- `nav.navigate('Main', { screen: activeTab === 'SettingsPanel' ? 'Self' : 'SettingsPanel' });`

**Permission/capacity reads:**  
- `const { context } = usePermissions();`
- `const bonds = context.bonds ?? [];`
- `const capacity = (bonds.find((b) => b.status === 'active')?.capacity ?? bonds[0]?.capacity) as ...`
- `const isAnonymous = context.isAnonymous;`
- `const unreadCount = useNotifications(userId);`

**React Navigation imports:**  
- `createBottomTabNavigator` from `@react-navigation/bottom-tabs`
- `useNavigation` from `@react-navigation/native`

**Unclear or surprising things:** this file is a custom web app shell, not just a style override. It includes extra panel routes (`NotificationsPanel`, `SettingsPanel`) and uses `document.title` effects.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx
**What it does:** Listens to native URL events and QR deep links, forwards URLs into `deepLink.handleURL()`, and conditionally navigates on class-room invite results.

**Exact data shapes:** none beyond the component props.

**Navigation calls:**  
- `nav.navigate('ClassroomInvite', { code: result.params.inviteCode });`
- `nav.navigate('QRHandler', { payload });`

**Permission/capacity reads:**  
- `const { session } = useAuth();`
- `if (navigationRef.isReady() && session) { ... }`

**React Navigation imports:** none directly.

**Unclear or surprising things:** it imports `session` but only uses it to gate QR navigation; it does not check permissions before navigating to `ClassroomInvite`.

**Canvas/rearrangement logic:** none.

---

## packages/core/src/logic/managers/DeepLinkManager.ts
**What it does:** Parses URLs, handles auth callback URLs, recognizes classroom invite URLs, and returns a structured deep-link result. It also exposes deep-link prefixes and a React Navigation linking config.

**Exact data shapes:**  
```ts
export enum DeepLinkType {
  AUTH_CALLBACK = 'AUTH_CALLBACK',
  CLASSROOM_INVITE = 'CLASSROOM_INVITE',
  SHARED_CONTENT = 'SHARED_CONTENT',
  UNKNOWN = 'UNKNOWN',
}

export interface DeepLinkResult {
  type: DeepLinkType;
  params: Record<string, string>;
  isHandled: boolean;
  message?: string;
}
```

**Navigation calls:** none directly.

**Permission/capacity reads:** none directly.

**React Navigation imports:** none directly.

**Unclear or surprising things:** `getNavigationConfig()` returns a React Navigation linking config with screen mappings for Welcome, Onboarding, Auth, AIAssistant, QRHandler, ThuthimalClaim, InvitationWelcome, several admin routes, `Main`, and `PublicForm`.

**Canvas/rearrangement logic:** none.

---

## packages/self/src/screens/SelfScreen.tsx
**What it does:** Chooses which self view to render based on permissions and the current `context.capacity`. It always renders one of the role-specific self views inside `FeatureGuard feature="isSelfWorkspaceEnabled"`.

**Exact data shapes:**  
```ts
const role = context.capacity;
```

The rendered order is:
```ts
if (can('manage', 'FounderDashboard')) return <FounderSelfView />;
if (can('manage', 'AdminDashboard')) return <AdminSelfView />;
if (can('manage', 'PrincipalDashboard')) return <PrincipalSelfView />;
if (can('manage', 'TeacherDashboard') || role === 'teacher') return <TeacherSelfView />;
if (role === 'guardian' || role === 'parent') return <GuardianSelfView />;
if (can('manage', 'StudentDashboard') || role === 'student') return <StudentSelfView />;
return <StudentSelfView />;
```

**Navigation calls:** none.

**Permission/capacity reads:**  
- `const { can, context } = usePermissions();`
- `const role = context.capacity;`
- `can('manage', 'FounderDashboard')`
- `can('manage', 'AdminDashboard')`
- `can('manage', 'PrincipalDashboard')`
- `can('manage', 'TeacherDashboard')`
- `can('manage', 'StudentDashboard')`

**React Navigation imports:** none.

**Unclear or surprising things:** there is no explicit separate Base Self block in this file; instead it selects a single role view component.

**Canvas/rearrangement logic:** none.

---

## packages/self/src/constants/selfRegistry.ts
**What it does:** Defines a registry of self domains and feature metadata, including some domains gated by trait or capability requirements.

**Exact data shapes:**  
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
  energyVibe?: [string, string];
  traitRequirement?: string;
  capabilityRequirement?: { action: string; subject: string };
  features: string[];
}
```

Full registry excerpt:
```ts
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

**Navigation calls:** none.

**Permission/capacity reads:** the registry itself uses:
```ts
traitRequirement?: string;
capabilityRequirement?: { action: string; subject: string };
```

**React Navigation imports:** none.

**Unclear or surprising things:** the registry mixes trait-based and capability-based gating in the same structure.

**Canvas/rearrangement logic:** none.

---

## packages/self/src/screens/self/TeacherSelfView.tsx
**What it does:** Renders the teacher self view with several domains and features such as journey, pulse, personal sanctuary, physical rhythm, and working rhythm.

**Exact data shapes:** it passes a `domains` array into `BaseSelfView`, each domain having `id`, `title`, `accentColor`, and either `content` or `features`.

**Navigation calls:** none.

**Permission/capacity reads:**  
```ts
const { context } = usePermissions();
const userId = context.userId;
```

**React Navigation imports:** none.

**Unclear or surprising things:** it imports `useStore` for `justFinishedOnboarding` and shows `WelcomeModal`, but it does not navigate.

**Canvas/rearrangement logic:** none.

---

## packages/self/src/screens/self/StudentSelfView.tsx
**What it does:** Renders the student self view with a `BaseSelfView` and domain content resolved from `useSanctuaryRegistry()`.

**Exact data shapes:** the registry-derived `domainContent` is mapped from `registeredDomains`.

**Navigation calls:** none.

**Permission/capacity reads:**  
```ts
const { context } = usePermissions();
const userId = context.userId;
```

**React Navigation imports:** none.

**Unclear or surprising things:** it uses `resolveFeatureContent(fId, userId ?? undefined)` for non-journey features.

**Canvas/rearrangement logic:** none.

---

## packages/self/src/screens/self/GuardianSelfView.tsx
**What it does:** Renders the guardian self view with a family journey section plus care/presence sections.

**Exact data shapes:** it passes a `domains` array into `BaseSelfView`.

**Navigation calls:** none.

**Permission/capacity reads:**  
```ts
const { context } = usePermissions();
const userId = context.userId;
```

**React Navigation imports:** none.

**Unclear or surprising things:** it reads `currentScale` from `useJourneyHistory()` and maps `viewScale === 'custom' ? 'day' : viewScale`.

**Canvas/rearrangement logic:** none.

---

## packages/self/src/screens/self/PrincipalSelfView.tsx
**What it does:** Renders the principal self view with journey, pulse, physical sanctuary, and working rhythm domains.

**Exact data shapes:** it passes a `domains` array into `BaseSelfView`.

**Navigation calls:** none.

**Permission/capacity reads:**  
```ts
const { context } = usePermissions();
const userId = context.userId;
```

**React Navigation imports:** none.

**Unclear or surprising things:** none beyond the domain layout.

**Canvas/rearrangement logic:** none.

---

## apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx
**What it does:** Defines the native classroom stack navigator with ClassroomList, TeacherClassroomDashboard, Attendance, Gradebook, and SchoolCreation screens.

**Exact data shapes:** no additional data shapes.

**Navigation calls:** none.

**Permission/capacity reads:** none directly.

**React Navigation imports:**  
- `createNativeStackNavigator` from `@react-navigation/native-stack`

**Unclear or surprising things:** none.

**Canvas/rearrangement logic:** none.

---

## packages/classroom/src/screens/ClassroomScreen.tsx
**What it does:** Renders the classroom root screen, fetches classroom role data, shows loading/feature-gated content, and either shows a workspace canvas or a classroom list/onboarding flow.

**Exact data shapes:**  
```ts
const [refreshTrigger, _setRefreshTrigger] = useState(0);
const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
const [isCreateClassroomOpen, setIsCreateClassroomOpen] = useState(false);
const [isClaimInviteOpen, setIsClaimInviteOpen] = useState(false);
const [isDemoModeTriggered, setIsDemoModeTriggered] = useState(false);
```

**Navigation calls:**  
- `navigation.navigate('Auth' as never);`
- `nav.navigate('Classroom', { screen: 'ClassroomDashboard', params: { classroomId, classroomName } });`

**Permission/capacity reads:**  
- `const navigation = useNavigation<NavigationProp<Record<string, unknown>>>();`
- `const { can, context } = usePermissions();`
- `const { isGuest } = useFeatureAccess();`
- `const { schoolId: storeSchoolId, userId: storeUserId } = useStore(...);`

**React Navigation imports:**  
- `useFocusEffect`, `useNavigation` from `@react-navigation/native`
- `NavigationProp` from `@react-navigation/native`

**Unclear or surprising things:** it uses `FeatureGuard` around the classroom list fallback and a separate workspace canvas path when classroom data exists.

**Canvas/rearrangement logic:**  
- `const { surfaces: arrangedWorkspaceSurfaces, layout, setSurfaceHidden, setSurfacePinned, setSurfaceZone } = useClassroomWorkspaceLayout(...)`
- `ClassroomWorkspaceCanvas` receives `layout`, `surfaces`, `onToggleHidden`, `onTogglePinned`, and `onMoveToNextZone`

---

## packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx
**What it does:** Exposes workspace shell state and actions for the teacher classroom workspace, including modals, QR handling, refresh triggers, and admin navigation.

**Exact data shapes:**  
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

**Navigation calls:**  
- `navigation.navigate('Attendance', { classroomId: classrooms[0].id, classroomName: classrooms[0].name });`

**Permission/capacity reads:**  
- `const { isDemoMode } = useStore();`
- `const { isGuest } = useFeatureAccess();`
- `const { isPastView } = useTemporalStore();`

**React Navigation imports:**  
- `NavigationProp` from `@react-navigation/native`

**Unclear or surprising things:** it handles QR joining and admin actions but does not itself render UI.

**Canvas/rearrangement logic:** none.

---

## packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx
**What it does:** Builds the list of classroom workspace surfaces, including admin surfaces plus teacher and student surfaces, and wraps them in gating logic.

**Exact data shapes:**  
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
  surfaceInsights?: Partial<Record<ClassroomWorkspaceSurfaceId, { summary?: string; temporalLabel?: string; metadata?: string[] }>>;
  citizenship: string;
  isPro: boolean;
  userCapabilities: string[];
};
```

**Navigation calls:**  
- `navigation.navigate('Profile')`
- `navigation.navigate('Search')`

**Permission/capacity reads:**  
- `can`
- `isGuest`
- `classroomData`
- `citizenship`
- `isPro`
- `userCapabilities`

**React Navigation imports:** none directly.

**Unclear or surprising things:** it calls `appendAdminWorkspaceSurfaces()` and then appends teacher/student workspace surfaces conditionally.

**Canvas/rearrangement logic:** yes. It assembles `ClassroomWorkspaceSurface[]` and returns surfaces with `summary`, `temporalLabel`, `metadata`, and `content`, but there is no drag/drop logic in this file.

---

## packages/profile/src/navigation/ProfileNavigationContext.tsx
**What it does:** Provides a navigation capability context for profile flows, with a fallback that uses React Navigation directly.

**Exact data shapes:**  
```ts
export interface ProfileNavigationCapabilities {
  openFullProfile: (profile: FullProfileParams) => void;
  openSettings?: () => void;
  openPrivacyLedger?: () => void;
  openMuteHub?: () => void;
  openPublicProfile?: (target: { id: string; type: PublicProfileTargetType }) => void;
  openAuth?: () => void;
  goBack?: () => void;
}
```

Fallback navigation map:
```ts
return {
  openFullProfile: (profile) => navigation.navigate('FullProfile', { profile }),
  openSettings: () => navigation.navigate('AppSettings'),
  openPrivacyLedger: () => navigation.navigate('PrivacyLedger'),
  openMuteHub: () => navigation.navigate('MuteHub'),
  openPublicProfile: (target) => navigation.navigate('PublicProfile', target),
  openAuth: () => navigation.navigate('Auth' as any),
  goBack: () => navigation.goBack(),
};
```

**Navigation calls:** listed above.

**Permission/capacity reads:** none.

**React Navigation imports:**  
- `NavigationProp` from `@react-navigation/native`
- `useNavigation` from `@react-navigation/native`

**Unclear or surprising things:** the context is optional; if absent, the hook falls back to direct navigation.

**Canvas/rearrangement logic:** none.

---

## packages/community/src/screens/CommunityScreen.tsx
**What it does:** Renders the community root with feed/circles/messages/announcements modes, multiple modal sheets, and a global header.

**Exact data shapes:**  
```ts
interface CommunityScreenState {
  activeMode: CommunityWorkspaceMode;
  selectedFilter: string;
  showCreatePost: boolean;
  showCreateGroup: boolean;
  comment: {
    postId: string | null;
    postAuthorId?: string;
    postType?: string;
  };
  report: {
    postId?: string;
    targetUserId?: string;
    targetUserName?: string;
    showModal: boolean;
  };
  conversations: DirectConversation[];
  loadingMessages: boolean;
}
```

**Navigation calls:**  
- `navigation.navigate('GroupDetails', { groupId, groupName: ... })`
- `navigation.navigate('PublicProfile', { id: authorId, type: 'user' })`
- `navigation.navigate('Auth' as never)`
- `navigation.navigate('GroupDetails', { groupId, groupName: mainGroup.name })`

**Permission/capacity reads:**  
- `const { can } = usePermissions();`
- `const canReadFeed = can('read', 'CommunityFeed');`
- `const canReadGroups = can('read', 'CommunityGroups');`
- `const canReadMessages = can('read', 'DirectMessages');`
- `const canCreatePost = can('create', 'Post');`
- `const canCreateGroup = can('create', 'Group');`
- `const canReadAnnouncements = Boolean(schoolId) && can('read', 'Group');`
- `const { user, flags } = useStore();`
- `const { isPastView } = useTemporalStore();`

**React Navigation imports:**  
- `useNavigation` from `@react-navigation/native`
- `NativeStackNavigationProp` from `@react-navigation/native-stack`

**Unclear or surprising things:** it uses `workspaceSlots.hearth` to label the hero text, but does not read capacity directly.

**Canvas/rearrangement logic:** none.

---

## packages/community/src/screens/GroupDetailsScreen.tsx
**What it does:** Shows a community group detail page, the group feed, admin controls, QR modal, comment sheet, and join flow.

**Exact data shapes:**  
```ts
type GroupDetailsRouteProp = {
  key: string;
  name: 'GroupDetails';
  params: {
    groupId: string;
  };
};
```

**Navigation calls:**  
- `navigation.goBack()`
- `navigation.navigate('GroupChat', { groupId, groupName: group?.name })`
- `navigation.navigate('Auth' as any)`

**Permission/capacity reads:**  
- `const { can, flags } = usePermissions();`
- `const canJoinGroup = can('create', 'Group') || can('create', 'CommunityGroup');`
- `const canManageGroup = can('manage', 'Group') || can('manage', 'CommunityGroup');`
- `const user = useStore((state) => state.user);`

**React Navigation imports:**  
- `useNavigation`, `useRoute` from `@react-navigation/native`
- `NativeStackNavigationProp` from `@react-navigation/native-stack`

**Unclear or surprising things:** route params only include `groupId`, even though `navigation.navigate('GroupDetails', { groupId, groupName })` is used elsewhere.

**Canvas/rearrangement logic:** none.

---

## packages/ui/src/components/GlobalHeader.tsx
**What it does:** Renders the shared header, with optional back/menu/search controls, a notification drawer, and role-aware title/identity presentation.

**Exact data shapes:**  
```ts
export interface GlobalHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  showSearch?: boolean;
  rightAction?: React.ReactNode;
  userName?: string;
  searchProps?: {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
  };
  isSelfView?: boolean;
  avatarUrl?: string;
}
```

**Navigation calls:**  
- `navigation.goBack()` when there is no `onBack`
- `(navigation as any).openDrawer?.()`
- `(navigation as any).navigate('Profile')`

**Permission/capacity reads:**  
- `const { can } = usePermissions();`
- `if (can('manage', 'AdminDashboard')) ...`
- `if (can('manage', 'PrincipalDashboard')) ...`
- `if (can('manage', 'SectionHeadDashboard')) ...`
- `if (can('manage', 'GradeHeadDashboard')) ...`
- `if (can('manage', 'TeacherDashboard')) ...`
- `if (can('manage', 'StudentDashboard')) ...`
- `const showFullNameAsPrimary = can('manage', 'StudentDashboard');`

**React Navigation imports:**  
- `useNavigation` from `@react-navigation/native`

**Unclear or surprising things:** title/role selection changes based on CASL capability rather than identity role fields.

**Canvas/rearrangement logic:** none.

---

## packages/ui/src/components/SanctuarySignal.tsx
**What it does:** Renders a guest invitation card that prompts the user to join the sanctuary.

**Exact data shapes:** none beyond React component props.

**Navigation calls:**  
- `navigation.navigate('Auth')`

**Permission/capacity reads:** none.

**React Navigation imports:**  
- `useNavigation` from `@react-navigation/native`

**Unclear or surprising things:** it always routes to Auth from the press action.

**Canvas/rearrangement logic:** none.

---

## Ground Truth Summary

1. **Exact shape of capacity/bond/perspective/role in the current system**
   - `AuthSlice` stores `activePerspective`, `activeBond`, and `availableBonds`.
   - `usePermissions()` derives `context.primaryCapacity` from `availableBonds[0]?.capacity`, `context.activeBond` from `activePerspective?.activeBond`, and `context.capacity` from `activeBond?.capacity`.
   - `Perspective` is `{ activeBond?: Bond; availableBonds?: Bond[]; }`.
   - `Bond` has `entity_id`, `entity_type`, `capacity`, `status`, and optional metadata.

2. **Every place `navigation.reset()` is called and why**
   - `apps/gurudevi-mobile/src/navigation/useAppEntryGate.ts`
     - `navigationRef.reset({ index: 0, routes: [{ name: intent.route as never }] });`
     - used when the entry gate resolves a reset intent.
   - `packages/core/src/logic/permissions/hooks/useNavigationAuthGuard.ts`
     - `navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' as never }] });`
     - `navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' }] });`
     - used when onboarding/session state requires a return to Welcome.

3. **Every place capacity or bond affects what renders**
   - `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx`
     - `const capacity = useMemo(() => context.activeBond?.capacity || context.primaryCapacity, ...)`
     - changes the Classroom tab label.
   - `apps/gurudevi-mobile/src/navigation/TabNavigator.web.tsx`
     - `const capacity = (bonds.find((b) => b.status === 'active')?.capacity ?? bonds[0]?.capacity)`
     - changes web labels and sidebar/mobile labels.
   - `packages/core/src/logic/permissions/hooks/usePermissions.ts`
     - `context.capacity`, `context.primaryCapacity`, `context.activeBond`, `context.bonds`
     - feeds downstream renders.
   - `packages/self/src/screens/SelfScreen.tsx`
     - `const role = context.capacity;`
     - selects the self view.
   - `packages/ui/src/components/GlobalHeader.tsx`
     - `can('manage', ...)`
     - changes role label, title, and avatar interaction.

4. **Whether any canvas or rearrangement logic currently exists**
   - Yes.
   - `packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx`
     - assembles workspace surfaces and passes them to app UI.
   - `packages/classroom/src/screens/ClassroomScreen.tsx`
     - uses `useClassroomWorkspaceLayout` and `ClassroomWorkspaceCanvas`.
   - The workspace code manages surface ordering/visibility/pinning, but there is no drag/drop code in the files listed here.

5. **The three most tangled places in the codebase right now**
   - `apps/gurudevi-mobile/App.tsx`
   - `packages/core/src/logic/permissions/hooks/usePermissions.ts`
   - `packages/self/src/screens/SelfScreen.tsx`

6. **What is cleaner than expected**
   - `packages/self/src/constants/selfRegistry.ts` already expresses layered domains and capability requirements in a structured registry.
   - `packages/community/src/screens/CommunityScreen.tsx` keeps most of its mode logic in a reducer instead of scattering it.
   - `packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx` centralizes workspace surface assembly.

7. **What is messier than expected**
   - Workspace capacity is not isolated; it is entangled with auth, bonds, and permissions.
   - Self is layered, but the selector logic is still capability-driven.
   - Web navigation is still a custom shell with panels and document-title behavior, not a simple route layout.
