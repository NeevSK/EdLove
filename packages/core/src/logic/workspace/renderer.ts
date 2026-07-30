import type {
  WorkspaceRendererConfig,
  WorkspaceRendererMode,
  WorkspaceRendererPlatform,
  WorkspaceRuntimePlatform,
} from '@repo/core/types';

export type {
  WorkspaceRendererConfig,
  WorkspaceRendererMode,
  WorkspaceRendererPlatform,
  WorkspaceRuntimePlatform,
} from '@repo/core/types';

export interface ResolveWorkspaceRendererOptions {
  runtimePlatform: WorkspaceRuntimePlatform;
  width: number;
  mobileMaxWidth?: number;
  tabletMaxWidth?: number;
}

const DEFAULT_RENDERER_MODE: Record<WorkspaceRendererPlatform, WorkspaceRendererMode> = {
  mobile: 'stack',
  tablet: 'grid',
  web: 'kanban',
};

const DEFAULT_MAX_COLUMNS: Record<WorkspaceRendererPlatform, number> = {
  mobile: 1,
  tablet: 2,
  web: 4,
};

export function resolveWorkspaceRendererPlatform({
  runtimePlatform,
  width,
  mobileMaxWidth = 767,
  tabletMaxWidth = 1279,
}: ResolveWorkspaceRendererOptions): WorkspaceRendererPlatform {
  if (runtimePlatform === 'web') {
    if (width <= mobileMaxWidth) {
      return 'mobile';
    }

    if (width <= tabletMaxWidth) {
      return 'tablet';
    }

    return 'web';
  }

  if (width > mobileMaxWidth) {
    return 'tablet';
  }

  return 'mobile';
}

export function createWorkspaceRendererConfig(
  options: ResolveWorkspaceRendererOptions & {
    modeOverrides?: Partial<Record<WorkspaceRendererPlatform, WorkspaceRendererMode>>;
    maxColumnsOverrides?: Partial<Record<WorkspaceRendererPlatform, number>>;
  },
): WorkspaceRendererConfig {
  const platform = resolveWorkspaceRendererPlatform(options);

  return {
    runtimePlatform: options.runtimePlatform,
    platform,
    mode: options.modeOverrides?.[platform] ?? DEFAULT_RENDERER_MODE[platform],
    maxColumns: options.maxColumnsOverrides?.[platform] ?? DEFAULT_MAX_COLUMNS[platform],
  };
}
