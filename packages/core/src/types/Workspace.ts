export type WorkspaceZoneId = 'today' | 'work' | 'institution' | 'outlook' | 'private';

export type WorkspaceRendererPlatform = 'mobile' | 'tablet' | 'web';

export type WorkspaceRuntimePlatform = 'android' | 'ios' | 'web';

export type WorkspaceRendererMode = 'stack' | 'grid' | 'kanban' | 'rail';

export type WorkspaceOwnerPackage =
  | 'classroom'
  | 'community'
  | 'admin'
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
}

export interface WorkspaceLayout<TSurfaceId extends string = string> {
  workspaceId: string;
  userId: string;
  order: TSurfaceId[];
  hidden: TSurfaceId[];
  pinned: TSurfaceId[];
  zoneBySurface: Partial<Record<TSurfaceId, WorkspaceZoneId>>;
  updatedAt: string;
}

export interface WorkspaceRendererConfig {
  runtimePlatform: WorkspaceRuntimePlatform;
  platform: WorkspaceRendererPlatform;
  mode: WorkspaceRendererMode;
  maxColumns?: number;
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
  content?: React.ReactNode;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: Record<string, any>;
}
