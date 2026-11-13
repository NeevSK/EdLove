/**
 * An area on a room's floor. There is no fixed set: each room names its own
 * areas in its furniture list (a room may call one "Today" and mark it smart).
 * Saved layouts written with the old five zones still load, because those
 * names are just strings a room may or may not use.
 */
export type AreaId = string;

export type WorkspaceAppearancePreset = 'default' | 'dawn' | 'garden' | 'night' | 'none';
export type WorkspaceAppearanceMotion = 'off' | 'subtle';

/** A registered image or custom uploaded asset that may be used as a workspace wallpaper. */
export interface WorkspaceWallpaper {
  provider: 'cloudinary' | 'custom' | 'preset';
  url: string;
  publicId: string;
  width: number;
  height: number;
  name?: string;
}

export type WallpaperPlaybackMode = 'single' | 'slideshow' | 'off';

export interface FloorWallpaperConfig {
  mode: WallpaperPlaybackMode;
  activeId?: string | null;
  items: WorkspaceWallpaper[];
  slideshowIntervalSeconds: number; // 180, 300, 600, 0 = on arrival
  customWashColor?: string | null;
  washOpacity?: number; // 0 to 1
  wallpaperOpacity?: number; // 0.1 to 0.5
}

export type SceneGroundMode = 'live' | 'still' | 'image' | 'quiet';

export interface WorkspaceAppearance {
  preset: WorkspaceAppearancePreset;
  motion: WorkspaceAppearanceMotion;
  groundMode?: SceneGroundMode;
  worldId?: string;
  wallpaper?: WorkspaceWallpaper | null;
  wallpaperConfig?: FloorWallpaperConfig | null;
}

export type WorkspaceSwitcherTargetId =
  | 'founder'
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'guardian'
  | 'personal'
  | 'commercial';

export type WorkspaceSwitcherDestination =
  | {
      kind: 'route';
      name: string;
    }
  | {
      kind: 'tab';
      name: string;
    };

export interface WorkspaceSwitcherTarget {
  id: WorkspaceSwitcherTargetId;
  title: string;
  description: string;
  destination: WorkspaceSwitcherDestination | null;
  enabled: boolean;
  status: 'current' | 'available' | 'bridge' | 'coming_soon';
  reason?: string;
  perspectiveId?: string;
  category?: 'personal' | 'commercial' | 'institutional' | 'guardian';
  badge?: string;
}

export type WorkspaceRendererPlatform = 'mobile' | 'tablet' | 'web';

export type WorkspaceRuntimePlatform = 'android' | 'ios' | 'web';

export type WorkspaceRendererMode = 'stack' | 'grid' | 'kanban' | 'rail';

export type WorkspaceOwnerPackage =
  | 'classroom'
  | 'community'
  | 'admin'
  | 'library'
  | 'people'
  | 'workforce'
  | 'core'
  | 'guardian';

export interface WorkspaceSurfaceDefinition<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> {
  surfaceId: TSurfaceId;
  workspaceId: string;
  capabilityKey: TCapabilityKey;
  ownerPackage: WorkspaceOwnerPackage;
  defaultZone: AreaId;
  defaultOrder: number;
  title?: string;
  hiddenByDefault?: boolean;
  mobileSupport?: boolean;
  webSupport?: boolean;
  kind?: 'widget' | 'section' | 'mode' | 'shortcut' | 'tool' | 'group';
  domain?: string;
  groupId?: string;
}

export interface WorkspaceLayout<TSurfaceId extends string = string> {
  workspaceId: string;
  userId: string;
  revision?: number;
  order: TSurfaceId[];
  hidden: TSurfaceId[];
  pinned: TSurfaceId[];
  zoneBySurface: Partial<Record<TSurfaceId, AreaId>>;
  groupOrder?: string[];
  isDefault?: boolean;
  surfaceMetadata?: Record<string, unknown>;
  appearance?: WorkspaceAppearance;
  updatedAt: string;
}

export interface WorkspaceRendererConfig {
  runtimePlatform: WorkspaceRuntimePlatform;
  platform: WorkspaceRendererPlatform;
  mode: WorkspaceRendererMode;
  maxColumns?: number;
}

import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';

export interface DomainFeature extends DomainEntry {
  icon?: string;
  defaultZone?: string;
}

export type WorkspaceRolePersona =
  | 'founder'
  | 'principal'
  | 'assistantPrincipal'
  | 'sectionHead'
  | 'gradeHead'
  | 'teacher'
  | 'student'
  | 'guardian'
  | 'parent'
  | 'developer';

export type FeatureLifecycleStage = 'day_0_onboarding' | 'daily_circadian' | 'mastery_governance';

export interface ScreenSequenceStep {
  step: number;
  screenId: string;
  route: string;
  title: string;
  purpose: 'on_ramp' | 'primary_action' | 'sub_detail' | 'feedback_completion';
  fallbackRoute?: string;
}

export interface SensoryFeedbackProfile {
  tutiiMode: 'guiding' | 'celebrating' | 'resting' | 'somatic_calm' | 'alert';
  tutiiRole?: 'guide' | 'companion' | 'sentinel';
  haptic: 'light' | 'medium' | 'success' | 'warning' | 'selection';
  soundChime?: 'arrival' | 'celebration' | 'pulse' | 'subtle_tap';
  scaffoldDismissalKey?: string;
  scaffoldThreshold?: number;
}

export interface FeatureJourneySpec {
  featureId: string;
  targetPersonas: WorkspaceRolePersona[];
  stage: FeatureLifecycleStage;
  entryRoute: string;
  sequence: ScreenSequenceStep[];
  feedback: SensoryFeedbackProfile;
}

export interface ResolvedWorkspaceSurface<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> extends WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey> {
  title: string;
  pinned: boolean;
  hidden: boolean;
  zone: AreaId;
  order: number;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: string[];
  isLocked?: boolean;
  lockReason?: 'citizenship' | 'capability' | 'pro';
}

export type ClassroomWorkspaceSurfaceId =
  | 'principal'
  | 'section-head'
  | 'grade-head'
  | 'teacher'
  | 'student';

export type ClassroomWorkspaceCapabilityKey =
  | 'PrincipalDashboard'
  | 'SectionHeadDashboard'
  | 'GradeHeadDashboard'
  | 'TeacherDashboard'
  | 'StudentDashboard';

export type ClassroomWorkspaceSurface = WorkspaceSurfaceDefinition<
  ClassroomWorkspaceSurfaceId,
  ClassroomWorkspaceCapabilityKey
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: string[];
};

export type PrincipalInsight = Partial<
  Record<
    ClassroomWorkspaceSurfaceId,
    {
      summary?: string;
      temporalLabel?: string;
      metadata?: string[];
    }
  >
>;
