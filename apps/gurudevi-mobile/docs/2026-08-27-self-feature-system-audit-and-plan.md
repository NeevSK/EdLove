# Self Feature System — Audit & Architectural Plan

**Status:** Active  
**Created:** 2026-08-27  
**Author:** Senior Dev Review  
**Tags:** [self, canvas, architecture, audit, refactor]

---

## Executive Summary

The current Self feature system has a sophisticated feature registry (`SELF_REGISTRY`) and dynamic sorting algorithm (`useDynamicSelfFeatures`), but the canvas integration is architecturally incoherent:

- **Mobile:** Rich feature components + algorithmic sort + carousel/tiled toggle
- **Web:** Broken — role views don't accept canvas data, missing core features
- **Canvas:** Exists but disconnected from actual feature components
- **Roles:** Single-role only, no combined roles (parent + teacher)
- **Customization:** Pin-only (binary), no multi-select or manual priority

This document captures the audit findings and proposes a unified architecture.

---

## 1. Current State Analysis

### 1.1 Feature Registry (`SELF_REGISTRY`)
**Location:** `packages/self/src/constants/selfRegistry.ts`

7 domains with capability-gated features:
| Domain | Surface ID | Order | Citizenship | Capability | Features |
|---|---|---|---|---|---|
| journey | journey | 10 | 3 | read:SelfJourney | journey_timeline |
| pulse | pulse | 20 | 3 | read:InnerPulse | daily_pulse, mood_lotus, wisdom_seeds |
| growth | growth | 30 | 3 | read:StudentDashboard | study_rhythm, personal_goals, academic_grades |
| care | care | 40 | 3 | read:SelfCare | sleep_tracker, joy_jar, gratitude_glimmers |
| reflection | reflection | 50 | 3 | read:SelfReflection | fire_journal, voice_journal, tomorrow_prep |
| working | working | 60 | 2 | read:TeacherDashboard | daily_rhythm, tomorrow_prep, reminders, decisions, professional_history |
| leadership | leadership | 70 | 1 | read:PrincipalDashboard | decisions, resonance_patterns, wisdom_seeds, monthly_reflection, governance_history |

**Strengths:** Capability-gated, citizenship levels, feature metadata, emoji mapping, discovery data
**Gaps:** No component mapping, no role affinity, no zone/category grouping

### 1.2 Role Resolution (`roleResolution.ts`)
Single-role resolution via capacity → capability → role mapping. **Cannot handle combined roles** (parent + teacher).

### 1.3 Feature Composition (`BaseSelfView.tsx`)
Hardcoded composition:
```typescript
const allFeatures = useMemo(() => [
  ...domains.flatMap(d => d.features),
  ...(sideBar ? [{ id: 'mirrors', ... }] : []),
  ...(reminders ? [{ id: 'reminders', ... }] : []),
], [domains, sideBar, reminders]);
```

### 1.4 Dynamic Sorting (`useDynamicSelfFeatures.ts`)
Weighted Resonance Algorithm:
- Pinned: 100,000 weight
- Temporal phase: 2,000 weight
- Recency (24h decay): up to 1,000 weight
- Frequency: up to 500 weight

### 1.5 Canvas Integration (Current)
- `useSelfWorkspaceSurfaces.ts` — 10 zones, metadata only
- `BaseSelfView.tsx` — converts surfaces → features with **placeholder content (null)**
- `SelfScreen.web.tsx` — **BROKEN** — passes `features` prop to role views that don't accept it

---

## 2. Critical Issues Identified

| Severity | Issue | Location | Impact |
|---|---|---|---|
| 🔴 Blocker | Web Self broken — role views don't accept `features` prop | `SelfScreen.web.tsx:54-68` | Web Self renders empty |
| 🔴 Blocker | Canvas surfaces have no real feature components | `BaseSelfView.tsx:75-130` | Canvas is metadata theater |
| 🔴 Blocker | Role views are self-contained, bypass canvas | `packages/self/src/screens/self/*.tsx` | Zero reuse, dual maintenance |
| 🔴 Blocker | `useWorkspaceLayoutSync` import path likely wrong | `SelfScreen.web.tsx:108` | Runtime error |
| 🔴 Blocker | Missing exports from `@repo/self` index | `packages/self/src/index.ts` | Won't compile |
| 🔴 Architectural | Two conflicting ordering systems | Canvas (order/hide) vs SelfNavigator (carousel/tiled + algorithm) | User confusion |
| 🔴 Architectural | Single role only | `resolveSelfViewRole()` | No parent+teacher |
| 🔴 Architectural | Pin-only customization | `useFeatureActivity.ts` | No multi-select, no priority |

---

## 3. Proposed Architecture

### 3.1 Core Principle: "Features as First-Class Citizens"

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SELF FEATURE ECOSYSTEM                       │
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐ │
│  │  FEATURE CATALOG │    │  ACCESS POLICY   │    │  USER PROFILE  │ │
│  │  (Registry)      │    │  (Capabilities)  │    │  (Preferences) │ │
│  │                  │    │                  │    │                │ │
│  │ • Feature defs   │    │ • Role → caps    │    │ • Pinned IDs   │ │
│  │ • Metadata       │    │ • Cap → features │    │ • Custom order │ │
│  │ • Components     │    │ • Min citizenship│    │ • Hidden IDs   │ │
│  │ • Cap requirements                │    │ • Role weights │ │
│  └────────┬────────┘    └────────┬────────┘    └───────┬────────┘ │
│           │                      │                      │          │
│           └──────────────────────┼──────────────────────┘          │
│                                  ▼                                 │
│                    ┌─────────────────────────┐                    │
│                    │   FEATURE RESOLVER      │                    │
│                    │   (Pure Function)       │                    │
│                    │                         │                    │
│                    │ Input: userCaps + prefs │                    │
│                    │ Output: FeatureSet[]    │                    │
│                    └───────────┬─────────────┘                    │
│                                 │                                 │
│           ┌─────────────────────┼─────────────────────┐          │
│           ▼                     ▼                     ▼          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  MOBILE CANVAS  │  │   WEB CANVAS    │  │  CANVAS STATE  │  │
│  │  (SelfCanvas)   │  │  (SelfCanvas)   │  │  (Supabase)    │  │
│  │                 │  │                 │  │                │  │
│  │ • Zones         │  │ • Zones         │  │ • order[]      │  │
│  │ • Drag-reorder  │  │ • Drag-reorder  │  │ • hidden[]     │  │
│  │ • Carousel/tiled│  │ • Carousel/tiled│  │ • pinned[]     │  │
│  │ • Zones = groups│  │ • Zones = groups│  │ • roleWeights  │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Components

#### A. Feature Catalog (`featureCatalog.ts`)
```typescript
export interface SelfFeature {
  id: string;
  label: string;
  emoji: string;
  component: React.ComponentType<SelfFeatureProps>;
  category: 'identity' | 'wellbeing' | 'growth' | 'practice' | 'professional';
  domain: string;
  requiredCapabilities: string[];
  minCitizenship?: number;
  roleWeights?: Partial<Record<SelfViewRole, number>>;
  defaultZone: 'today' | 'private' | 'shared';
  defaultOrder: number;
  energyVibe: [string, string];
  timing?: { preferredPhase: 'morning' | 'afternoon' | 'night' };
  isPinnable: boolean;
  isHidable: boolean;
}
```

#### B. Access Policy Engine (`accessPolicy.ts`)
```typescript
export function resolveAccessibleFeatures(context: UserAccessContext): AccessibleFeature[]
```
Pure function, fully testable, returns all features user has access to with role affinity scores.

#### C. Feature Resolver (`featureResolver.ts`)
```typescript
export function resolveFeatureSet(
  accessible: AccessibleFeature[],
  preferences: SelfCanvasPreferences
): ResolvedFeatureSet
```
Combines access policy + user preferences → selected + discoverable + grouped by zone/category.

#### D. User Preferences (`userPreferences.ts`)
```typescript
interface SelfCanvasPreferences {
  layout: { version: 2; surfaces: SurfaceLayout[]; isDefault: boolean };
  features: {
    selectedIds: string[];
    customOrder: string[];      // Manual priority
    hiddenIds: string[];
    roleWeights: Partial<Record<SelfViewRole, number>>; // Combined roles!
  };
  viewMode: 'carousel' | 'tiled';
}
```

#### E. Unified Canvas (`SelfCanvas.tsx`)
Single component for mobile + web, renders zones with drag-reorder, hide, pin.

#### F. Unified Screen (`SelfScreen.tsx` + `SelfScreen.web.tsx`)
Single screen logic, web is thin wrapper.

---

## 4. Migration Phases

### Phase 1: Foundation (Week 1-2)
| Task | Files | Deliverable |
|---|---|---|
| Feature Catalog from SELF_REGISTRY | `featureCatalog.ts` | 46+ features with metadata |
| Access Policy Engine | `accessPolicy.ts` | Pure function, 100% testable |
| Feature Resolver | `featureResolver.ts` | Pure function, testable |
| SelfCanvasPreferences + sync hook | `userPreferences.ts`, `useSelfCanvasPreferences.ts` | Cross-device sync |

### Phase 2: Canvas Integration (Week 2-3)
| Task | Files | Deliverable |
|---|---|---|
| SelfCanvas component | `SelfCanvas.tsx` | Zone-based, drag-reorder, hide/pin |
| WorkspaceRenderer integration | `SelfCanvas.tsx` | Platform-aware |
| View mode (carousel/tiled) as canvas property | `useSelfCanvasViewMode.ts` | Synced across devices |

### Phase 3: Unified Screen (Week 3-4)
| Task | Files | Deliverable |
|---|---|---|
| Unified SelfScreen | `SelfScreen.tsx` | Replaces BaseSelfView + 6 role views |
| SelfScreen.web.tsx thin wrapper | `SelfScreen.web.tsx` | 50 lines, same logic |
| Migrate SelfNavigator → SelfCanvas | Remove old components | Zero duplicate code |

### Phase 4: Polish (Week 4)
| Task | Files | Deliverable |
|---|---|---|
| Role weight UI | `RoleWeightEditor.tsx` | Combined roles support |
| Feature picker (multi-select) | `FeaturePicker.tsx` | Select/prioritize |
| Migration for existing users | `migrateSelfPreferences.ts` | Preserve pins/order |

---

## 5. Before vs After

| Aspect | Before | After |
|---|---|---|
| Roles | Single role → single view | Multiple roles → unified feature set |
| Features | Hardcoded composition | Declarative catalog + access policy |
| Customization | Pin only (binary) | Select + priority order + hide |
| Ordering | Algorithm only | Manual (canvas) + algorithm (discoverable) |
| Canvas | Separate from navigator | Unified — canvas IS the navigator |
| Web | Reimplemented (6 views) | Same `SelfScreen` + wrapper |
| Combined roles | ❌ Impossible | ✅ Native (role weights) |
| Sync | LocalStorage only | Supabase cross-device |
| Testing | Hard (React hooks) | Easy (pure functions) |

---

## 6. Verification Checklist

```bash
# 1. Type safety
pnpm --filter @repo/self exec tcs --noEmit

# 2. Unit tests (pure functions)
pnpm --filter @repo/self test:features

# 3. Mobile Self - combined roles
# Manual: Login as teacher+guardian → verify both feature sets

# 4. Web Self - full parity
# Manual: Open web → verify same features, same order, same view mode

# 5. Canvas operations
# Manual: Drag reorder → refresh → persists
# Manual: Hide feature → refresh → hidden
# Manual: Pin → cross-device sync

# 6. Role weights
# Manual: Set 70% teacher / 30% guardian → verify feature ranking

# 7. Migration
# Manual: Existing user → pins/order preserved
```

---

## 7. Next Steps

**Ready to implement Phase 1 (Foundation):**
1. `packages/self/src/features/featureCatalog.ts` — Feature catalog from registry
2. `packages/self/src/features/accessPolicy.ts` — Access policy engine
3. `packages/self/src/features/featureResolver.ts` — Feature resolver
4. `packages/self/src/features/userPreferences.ts` — Preferences types + sync hook
5. Export from `@repo/self` index

**Shall I proceed with Phase 1 implementation?**