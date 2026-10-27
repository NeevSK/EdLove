import { storage } from '@repo/core/lib/storage';
import type {
  MindfulSessionRecord,
  RecoverySignal,
  SovereignHealthPort,
} from '../../types/healthPort';

const HEALTH_STORAGE_KEY = 'gurudevi_health_sessions_v1';

/**
 * InMemoryHealthAdapter (Durable Local Storage Engine)
 *
 * Deterministic, offline-first adapter for web, development, mobile local storage, and unit testing.
 * Automatically persists completed mindful sessions into Sovereign StorageManager (MMKV on mobile,
 * localStorage on web) so sessions survive OS process termination.
 */
export class InMemoryHealthAdapter implements SovereignHealthPort {
  private sessions: MindfulSessionRecord[] = [];
  private permitted = true;
  private isHydrated = false;

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    if (this.isHydrated) return;
    try {
      const raw = storage.getString(HEALTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.sessions = parsed;
        }
      }
    } catch {
      // Graceful fallback to empty sessions on corrupted storage
      this.sessions = [];
    } finally {
      this.isHydrated = true;
    }
  }

  private persist(): void {
    try {
      storage.set(HEALTH_STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      console.warn('[InMemoryHealthAdapter] Failed to persist health sessions:', error);
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    this.permitted = true;
    return true;
  }

  async getMindfulMinutesToday(): Promise<number> {
    this.hydrate();
    const today = new Date().toISOString().split('T')[0];
    const totalSeconds = this.sessions
      .filter((s) => s.startedAt.startsWith(today || ''))
      .reduce((acc, s) => acc + s.durationSeconds, 0);

    return Math.round(totalSeconds / 60);
  }

  async recordMindfulSession(durationSeconds: number): Promise<void> {
    this.hydrate();
    this.sessions.push({
      startedAt: new Date().toISOString(),
      durationSeconds,
      source: 'sanctuary_pulse',
    });
    this.persist();
  }

  async getRecoverySignal(): Promise<RecoverySignal> {
    return {
      level: 'serene',
      calculatedAt: new Date().toISOString(),
    };
  }
}

export const inMemoryHealthAdapter = new InMemoryHealthAdapter();
