import type {
  WorkspaceLayoutDelete,
  WorkspaceLayoutRecord,
  WorkspaceLayoutUpsert,
} from '@repo/core/logic/schemas/workspace-layout.schema';
import { workspaceLayoutServices } from '@repo/core/api/runtimes/workspaceLayout.runtime';
import { workspaceLayoutContract } from '@repo/core/api/workspaceLayout.contract';

export const workspaceLayoutAPI = {
  /**
   * @policy read WorkspaceLayout
   */
  async getWorkspaceLayout(
    userId: string,
    workspaceId: string,
    layoutTarget: WorkspaceLayoutRecord['layout_target'],
  ): Promise<WorkspaceLayoutRecord | null> {
    return workspaceLayoutServices.getLayout(userId, workspaceId, layoutTarget);
  },

  /**
   * @policy update WorkspaceLayout
   */
  async upsertWorkspaceLayout(input: WorkspaceLayoutUpsert): Promise<WorkspaceLayoutRecord> {
    return workspaceLayoutServices.upsertLayout(input);
  },

  /**
   * @policy delete WorkspaceLayout
   */
  async deleteWorkspaceLayout(input: WorkspaceLayoutDelete): Promise<{ success: true }> {
    return workspaceLayoutServices.deleteLayout(input);
  },
};

void workspaceLayoutContract;
