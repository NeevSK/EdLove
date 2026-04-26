import { storage } from './storage';

export type PendingGateAction =
  | { kind: 'community_open_create_group'; createdAt: number }
  | { kind: 'community_join_group'; createdAt: number; groupId: string; joinPolicy?: string }
  | { kind: 'library_open_add_resource'; createdAt: number }
  | { kind: 'classroom_open_create_join'; createdAt: number };

const STORAGE_KEY = '__pending_gate_action_v1';

export async function setPendingGateAction(action: PendingGateAction): Promise<void> {
  const payload = JSON.stringify(action);
  storage.set(STORAGE_KEY, payload);
}

export async function getPendingGateAction(): Promise<PendingGateAction | null> {
  try {
    const raw = await storage.getStringAsync(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingGateAction;
  } catch {
    return null;
  }
}

export async function clearPendingGateAction(): Promise<void> {
  storage.delete(STORAGE_KEY);
}
