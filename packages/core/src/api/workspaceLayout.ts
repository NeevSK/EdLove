import { workspaceLayoutContract } from './workspaceLayout.contract';
import { workspaceLayoutServices } from '../domains/workspaceLayout/runtime';
import type {
  WorkspaceLayoutDelete,
  WorkspaceLayoutRecord,
  WorkspaceLayoutUpsert,
} from './schemas/workspace-layout.schema';

export const workspaceLayoutAPI = {
  /**
   * @authority read WorkspaceLayout
   */
  async getWorkspaceLayout(
    userId: string,
    workspaceId: string,
    layoutTarget: WorkspaceLayoutRecord['layout_target']
  ): Promise<WorkspaceLayoutRecord | null> {
    return workspaceLayoutServices.getLayout(userId, workspaceId, layoutTarget);
  },

  /**
   * @authority update WorkspaceLayout
   */
  async upsertWorkspaceLayout(input: WorkspaceLayoutUpsert): Promise<WorkspaceLayoutRecord> {
    return workspaceLayoutServices.upsertLayout(input);
  },

  /**
   * @authority delete WorkspaceLayout
   */
  async deleteWorkspaceLayout(input: WorkspaceLayoutDelete): Promise<{ success: true }> {
    return workspaceLayoutServices.deleteLayout(input);
  },
};

void workspaceLayoutContract;
