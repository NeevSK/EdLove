import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PendingGateAction =
  | { kind: 'community_open_create_group'; createdAt: number }
  | { kind: 'community_join_group'; createdAt: number; groupId: string; joinPolicy?: string }
  | { kind: 'library_open_add_resource'; createdAt: number }
  | { kind: 'classroom_open_create_join'; createdAt: number };

const STORAGE_KEY = '__pending_gate_action_v1';

function canUseSessionStorage(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && !!window.sessionStorage;
}

export async function setPendingGateAction(action: PendingGateAction): Promise<void> {
  const payload = JSON.stringify(action);
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, payload);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, payload);
}

export async function getPendingGateAction(): Promise<PendingGateAction | null> {
  try {
    const raw = canUseSessionStorage()
      ? window.sessionStorage.getItem(STORAGE_KEY)
      : await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingGateAction;
  } catch {
    return null;
  }
}

export async function clearPendingGateAction(): Promise<void> {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  await AsyncStorage.removeItem(STORAGE_KEY);
}

