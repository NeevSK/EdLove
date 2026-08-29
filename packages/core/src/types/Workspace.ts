export type WorkspaceZoneId = 'today' | 'work' | 'institution' | 'outlook' | 'private';

export type WorkspaceSwitcherTargetId =
  | 'founder'
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'guardian';

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
  defaultZone: WorkspaceZoneId;
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
  order: TSurfaceId[];
  hidden: TSurfaceId[];
  pinned: TSurfaceId[];
  zoneBySurface: Partial<Record<TSurfaceId, WorkspaceZoneId>>;
  isDefault?: boolean;
  surfaceMetadata?: Record<string, unknown>;
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

export interface ResolvedWorkspaceSurface<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> extends WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey> {
  title: string;
  pinned: boolean;
  hidden: boolean;
  zone: WorkspaceZoneId;
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
