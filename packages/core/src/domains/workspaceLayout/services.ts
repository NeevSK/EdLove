import type {
  WorkspaceLayoutDelete,
  WorkspaceLayoutRecord,
  WorkspaceLayoutUpsert,
} from '../../api/schemas/workspace-layout.schema';
import type { WorkspaceLayoutRepository } from './ports';

export interface WorkspaceLayoutServices {
  getLayout(
    userId: string,
    workspaceId: string,
    layoutTarget: WorkspaceLayoutRecord['layout_target'],
  ): Promise<WorkspaceLayoutRecord | null>;
  upsertLayout(input: WorkspaceLayoutUpsert): Promise<WorkspaceLayoutRecord>;
  deleteLayout(input: WorkspaceLayoutDelete): Promise<{ success: true }>;
}

export const createWorkspaceLayoutServices = (
  repository: WorkspaceLayoutRepository,
): WorkspaceLayoutServices => ({
  getLayout: (userId, workspaceId, layoutTarget) =>
    repository.getLayout(userId, workspaceId, layoutTarget),
  upsertLayout: (input) => repository.upsertLayout(input),
  deleteLayout: (input) => repository.deleteLayout(input),
});
