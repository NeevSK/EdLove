import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
} from '@repo/core/types';

export type { ResolvedWorkspaceSurface, WorkspaceLayout, WorkspaceSurfaceDefinition };

export type CanvasDepthPresetId = 'sanctuary-calm' | 'architectural-ink' | 'flat-zen';
export type SpatialArrangement = 'stream' | 'catalog-grid' | 'carousel';
export type SurfaceCardLayoutMode = 'card' | 'tile' | 'hero';

export interface CanvasDepthPresetConfig {
  id: CanvasDepthPresetId;
  name: string;
  showDots: boolean;
  dotColor: string;
  dotOpacity: number;
  dotSpacing: number;
  borderWidth: number;
  borderColor: string;
  rimOffset: number;
  rimColor: string;
  borderRadius: number;
}

export interface WorkspaceCanvasProps<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> {
  surfaces: WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>[];
  layout: WorkspaceLayout<TSurfaceId>;
  workspaceId?: string;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  includeHidden?: boolean;
  depthPreset?: CanvasDepthPresetId;
  spatialArrangement?: SpatialArrangement;
  renderSurfaceContent?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => React.ReactNode;
  getSurfaceTitle?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string;
  getSurfaceSubtitle?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceSummary?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceSnapshot?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceTemporalLabel?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceTemporalTone?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => 'present' | 'past' | 'future' | 'neutral' | undefined;
  getSurfaceEmoji?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceCategory?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceEnergyVibe?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => [string, string] | undefined;
  getSurfaceMetadata?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string[] | undefined;
  renderSurfaceActions?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => React.ReactNode;
  onSurfacePress?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onPressSurfaceInfo?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onToggleHidden?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onTogglePin?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onReorder?: (surfaceId: TSurfaceId, newIndex: number) => void;
}
