import type {
  WorkspaceLayoutDelete,
  WorkspaceLayoutRecord,
  WorkspaceLayoutUpsert,
} from '../logic/schemas/workspace-layout.schema';
import { workspaceLayoutServices } from './runtimes/workspaceLayout.runtime';
import { workspaceLayoutContract } from './workspaceLayout.contract';

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
