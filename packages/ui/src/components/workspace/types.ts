import type { ResolvedWorkspaceSurface, WorkspaceLayout, WorkspaceSurfaceDefinition } from '@repo/core/workspace/canvas';

export interface WorkspaceCanvasProps<
    TSurfaceId extends string = string,
    TCapabilityKey extends string = string,
> {
    surfaces: WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>[];
    layout: WorkspaceLayout<TSurfaceId>;
    title?: string;
    subtitle?: string;
    emptyMessage?: string;
    includeHidden?: boolean;
    renderSurfaceContent?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => React.ReactNode;
    getSurfaceSubtitle?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceSummary?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceSnapshot?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceTemporalLabel?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceTemporalTone?: (
        surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>
    ) => 'present' | 'past' | 'future' | 'neutral' | undefined;
    getSurfaceMetadata?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string[] | undefined;
    renderSurfaceActions?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => React.ReactNode;
    onSurfacePress?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
    onPressSurfaceInfo?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
    onToggleHidden?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
}
