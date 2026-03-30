export type WorkspaceZoneId =
    | 'today'
    | 'work'
    | 'institution'
    | 'outlook'
    | 'private';

export type WorkspaceRendererPlatform =
    | 'mobile'
    | 'tablet'
    | 'web';

export type WorkspaceRuntimePlatform =
    | 'android'
    | 'ios'
    | 'web';

export type WorkspaceRendererMode =
    | 'stack'
    | 'grid'
    | 'kanban'
    | 'rail';

export type WorkspaceOwnerPackage =
    | 'classroom'
    | 'admin'
    | 'people'
    | 'workforce'
    | 'core'
    | 'guardian';

export interface WorkspaceSurfaceDefinition<TSurfaceId extends string = string, TCapabilityKey extends string = string> {
    surfaceId: TSurfaceId;
    workspaceId: string;
    capabilityKey: TCapabilityKey;
    ownerPackage: WorkspaceOwnerPackage;
    defaultZone: WorkspaceZoneId;
    defaultOrder: number;
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
