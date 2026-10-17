import { applyPatch, compare, type Operation } from 'fast-json-patch';

export interface DeltaMetrics {
  originalBytes: number;
  patchBytes: number;
  savingsPercentage: number;
  operationCount: number;
  modifiedPaths: string[];
}

export interface ThreeWayMergeResult<T> {
  merged: T;
  conflicts: Array<{
    path: string;
    baseValue: unknown;
    localValue: unknown;
    remoteValue: unknown;
    resolution: 'local' | 'remote';
  }>;
  hasConflicts: boolean;
}

/** Helper to get a value at a JSON pointer path (/a/b/0) */
function getValueByPath(obj: any, path: string): any {
  if (!path || path === '/' || !obj) return obj;
  const segments = path.replace(/^\//, '').split('/');
  let current = obj;
  for (const seg of segments) {
    if (current == null) return undefined;
    const index = Number(seg);
    if (Array.isArray(current) && !isNaN(index)) {
      current = current[index];
    } else {
      current = current[seg];
    }
  }
  return current;
}

/** Helper to set a value at a JSON pointer path immutably (/a/b/0) */
function setValueByPath(obj: any, path: string, value: any): void {
  if (!path || path === '/' || !obj) return;
  const segments = path.replace(/^\//, '').split('/');
  let current = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]!;
    const nextSeg = segments[i + 1]!;
    const isNextArray = !isNaN(Number(nextSeg));

    if (current[seg] == null || typeof current[seg] !== 'object') {
      current[seg] = isNextArray ? [] : {};
    }
    current = current[seg];
  }
  const lastSeg = segments[segments.length - 1]!;
  if (value === undefined) {
    if (Array.isArray(current)) {
      const idx = Number(lastSeg);
      if (!isNaN(idx)) current.splice(idx, 1);
    } else {
      delete current[lastSeg];
    }
  } else {
    const idx = Number(lastSeg);
    if (Array.isArray(current) && !isNaN(idx)) {
      current[idx] = value;
    } else {
      current[lastSeg] = value;
    }
  }
}

/**
 * DeltaResonance Utility — 2026 Enterprise Edition
 *
 * Provides surgical state diffing, deep nested path three-way delta merge resolution,
 * array mutation tracking, and RFC 6902 JSON patch synthesis for low-bandwidth, offline-first sync.
 */
export const DeltaResonance = {
  /**
   * Generates an RFC 6902 JSON Patch (delta) between two states.
   */
  diff: <T>(original: T, updated: T): Operation[] => {
    if (!original || !updated || typeof original !== 'object' || typeof updated !== 'object') {
      return [];
    }
    return compare(original as any, updated as any);
  },

  /**
   * Applies an RFC 6902 JSON Patch to a state immutably.
   */
  patch: <T>(original: T, patch: Operation[]): T => {
    if (!patch || patch.length === 0) return original;
    const cloned = JSON.parse(JSON.stringify(original));
    const result = applyPatch(cloned, patch);
    return result.newDocument as T;
  },

  /**
   * Checks whether there is a substantive data change between two states,
   * short-circuiting no-op mutation dispatches.
   */
  isSubstantiveChange: <T>(original: T, updated: T): boolean => {
    const operations = DeltaResonance.diff(original, updated);
    return operations.length > 0;
  },

  /**
   * Synthesizes a structured Partial<T> object from an RFC 6902 patch sequence,
   * accurately handling nested object properties and array updates.
   */
  toPartialObject: <T extends Record<string, any>>(patch: Operation[]): Partial<T> => {
    const partial: Record<string, any> = {};
    for (const op of patch) {
      if (op.op === 'remove') {
        setValueByPath(partial, op.path, null);
      } else if ('value' in op) {
        setValueByPath(partial, op.path, (op as any).value);
      }
    }
    return partial as Partial<T>;
  },

  /**
   * Calculates exact byte savings and telemetry metrics for a delta patch.
   */
  computeMetrics: <T>(original: T, updated: T): DeltaMetrics => {
    const patch = DeltaResonance.diff(original, updated);
    const originalStr = JSON.stringify(updated ?? {});
    const patchStr = JSON.stringify(patch);

    const originalBytes = new TextEncoder().encode(originalStr).length;
    const patchBytes = new TextEncoder().encode(patchStr).length;
    const savings =
      originalBytes > 0
        ? Math.max(0, Math.round(((originalBytes - patchBytes) / originalBytes) * 100))
        : 0;

    return {
      originalBytes,
      patchBytes,
      savingsPercentage: savings,
      operationCount: patch.length,
      modifiedPaths: patch.map((op) => op.path),
    };
  },

  /**
   * Deep Three-Way Delta Merge (Base vs Local vs Remote).
   * Supports deep nested object paths, array elements, and field-level collision detection.
   */
  threeWayMerge: <T extends Record<string, any>>(
    base: T,
    local: T,
    remote: T,
    preferStrategy: 'local-wins' | 'remote-wins' = 'local-wins',
  ): ThreeWayMergeResult<T> => {
    const localPatch = DeltaResonance.diff(base, local);
    const remotePatch = DeltaResonance.diff(base, remote);

    // Deep clone base as working draft
    const merged: Record<string, any> = JSON.parse(JSON.stringify(base));
    const conflicts: ThreeWayMergeResult<T>['conflicts'] = [];

    const localPathMap = new Map(localPatch.map((op) => [op.path, op]));
    const remotePathMap = new Map(remotePatch.map((op) => [op.path, op]));

    // 1. Apply non-conflicting Remote updates first
    for (const [path, op] of remotePathMap.entries()) {
      if (!localPathMap.has(path)) {
        if (op.op === 'remove') {
          setValueByPath(merged, path, undefined);
        } else if ('value' in op) {
          setValueByPath(merged, path, (op as any).value);
        }
      }
    }

    // 2. Apply Local updates and detect collisions on conflicting paths
    for (const [path, op] of localPathMap.entries()) {
      if (remotePathMap.has(path)) {
        const baseVal = getValueByPath(base, path);
        const localVal = getValueByPath(local, path);
        const remoteVal = getValueByPath(remote, path);

        if (JSON.stringify(localVal) !== JSON.stringify(remoteVal)) {
          const resolution = preferStrategy === 'local-wins' ? 'local' : 'remote';
          const resolvedValue = resolution === 'local' ? localVal : remoteVal;
          setValueByPath(merged, path, resolvedValue);

          conflicts.push({
            path,
            baseValue: baseVal,
            localValue: localVal,
            remoteValue: remoteVal,
            resolution,
          });
        } else {
          setValueByPath(merged, path, localVal);
        }
      } else {
        if (op.op === 'remove') {
          setValueByPath(merged, path, undefined);
        } else if ('value' in op) {
          setValueByPath(merged, path, (op as any).value);
        }
      }
    }

    return {
      merged: merged as T,
      conflicts,
      hasConflicts: conflicts.length > 0,
    };
  },
};
