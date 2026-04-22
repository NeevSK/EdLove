import type {
  WorkspaceLayoutDelete,
  WorkspaceLayoutRecord,
  WorkspaceLayoutUpsert,
} from '../../api/schemas/workspace-layout.schema';

export interface WorkspaceLayoutRepository {
  getLayout(
    userId: string,
    workspaceId: string,
    layoutTarget: WorkspaceLayoutRecord['layout_target'],
  ): Promise<WorkspaceLayoutRecord | null>;
  upsertLayout(input: WorkspaceLayoutUpsert): Promise<WorkspaceLayoutRecord>;
  deleteLayout(input: WorkspaceLayoutDelete): Promise<{ success: true }>;
}
