import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UpdateSeverity = 'HARD_BLOCK' | 'SOFT_NUDGE' | 'SILENT_OTA' | 'UP_TO_DATE';

export interface RemoteVersionManifest {
  minSupportedVersion: string; // Versions strictly lower than this are HARD_BLOCKED
  latestVersion: string; // Latest published production release
  updateUrl: string; // Play Store, App Store, or MDM link
  releaseNotes?: string;
  isMaintenanceMode?: boolean;
}

export interface VersionGatingState {
  currentInstalledVersion: string;
  status: UpdateSeverity;
  minSupportedVersion: string;
  latestVersion: string;
  updateUrl: string;
  releaseNotes?: string;
  isBlocked: boolean;
  hasDismissedSoftNudge: boolean;
  evaluateVersion: (manifest: RemoteVersionManifest) => UpdateSeverity;
  dismissSoftNudge: () => void;
  setInstalledVersion: (version: string) => void;
}

/**
 * Semver comparison helper: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal.
 */
export function compareSemver(v1: string, v2: string): number {
  const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map((p) => parseInt(p, 10) || 0);
  const len = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export const useVersionGatingStore = create<VersionGatingState>()(
  persist(
    (set, get) => ({
      currentInstalledVersion: '1.0.0',
      status: 'UP_TO_DATE',
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.0',
      updateUrl: '',
      isBlocked: false,
      hasDismissedSoftNudge: false,

      setInstalledVersion: (version: string) => {
        set({ currentInstalledVersion: version });
      },

      dismissSoftNudge: () => {
        set({ hasDismissedSoftNudge: true });
      },

      evaluateVersion: (manifest: RemoteVersionManifest) => {
        const current = get().currentInstalledVersion;
        let severity: UpdateSeverity = 'UP_TO_DATE';

        if (manifest.isMaintenanceMode || compareSemver(current, manifest.minSupportedVersion) < 0) {
          severity = 'HARD_BLOCK';
        } else if (compareSemver(current, manifest.latestVersion) < 0) {
          severity = 'SOFT_NUDGE';
        }

        const isBlocked = severity === 'HARD_BLOCK';

        set({
          status: severity,
          minSupportedVersion: manifest.minSupportedVersion,
          latestVersion: manifest.latestVersion,
          updateUrl: manifest.updateUrl,
          releaseNotes: manifest.releaseNotes,
          isBlocked,
        });

        sovereignBus.emit('app:version_gated', {
          status: severity === 'HARD_BLOCK' || severity === 'SOFT_NUDGE' ? severity : 'UP_TO_DATE',
          currentVersion: current,
          minSupportedVersion: manifest.minSupportedVersion,
          latestVersion: manifest.latestVersion,
          updateUrl: manifest.updateUrl,
          releaseNotes: manifest.releaseNotes,
        });

        return severity;
      },
    }),
    {
      name: 'gurudevi-version-gating',
      storage: createJSONStorage(() => SafeZustandStorage),
    },
  ),
);
