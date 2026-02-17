
/**
 * Persistence Types for Offline Synchronization
 */

export type MutationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM';

export interface QueuedMutation {
    id: string;
    type: MutationType;
    scope: string; // e.g., 'community', 'classroom', 'self'
    name: string; // e.g., 'createPost', 'updateAttendance'
    variables: any;
    timestamp: number;
    retryCount: number;
}

export interface MutationQueueState {
    queue: QueuedMutation[];
    isSyncing: boolean;
    addToQueue: (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => void;
    removeFromQueue: (id: string) => void;
    updateMutation: (id: string, updates: Partial<QueuedMutation>) => void;
    clearQueue: () => void;
    setSyncing: (isSyncing: boolean) => void;
}
