import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import type { WorkspaceLayout, WorkspaceZoneId } from '@repo/core/types';
import type { FloorFit, GroupInput, PieceInput, TimeBand } from './types';

/**
 * One feature as the floor sees it: what SanctuaryFeature decided about it,
 * where it belongs by default, and what its component declares.
 */
export interface FloorSurface {
  id: string;
  label: string;
  group: string;
  /** The area it lives in unless the person moved it. */
  defaultArea: WorkspaceZoneId;
  /** SanctuaryFeature's decision, through resolveFeaturePresentation. */
  presentation: FeaturePresentationMode;
  fit: FloorFit;
  time?: TimeBand;
  needsAttention?: boolean;
  task?: boolean;
  lit?: boolean;
  roleImportance?: number;
}

/** Presentations that keep a place on the floor; the rest are not drawn at all. */
const PRESENT: ReadonlySet<FeaturePresentationMode> = new Set([
  'available',
  'loading',
  'locked',
  'upgrade_required',
  'coming_soon',
  'disabled',
]);

/** Present but not usable now: it rests (half weight) and can never be a task or the lamp. */
const RESTING: ReadonlySet<FeaturePresentationMode> = new Set([
  'locked',
  'upgrade_required',
  'coming_soon',
  'disabled',
]);

/**
 * The saved layout key for one floor: per room AND per perspective (bond), so
 * a teacher at two schools keeps two arrangements. Account and screen target
 * are added by the existing layout sync key.
 */
export function floorLayoutId(room: string, perspectiveId: string): string {
  return `${room}@${perspectiveId}`;
}

/**
 * Turns SanctuaryFeature's decisions and the person's saved layout (per
 * account, per perspective, per screen target, synced across devices by the
 * workspace layout protocol) into floor pieces. The engine only reads this;
 * only the person's own moves write the layout.
 */
export function piecesFromLayout(
  surfaces: readonly FloorSurface[],
  layout: Pick<WorkspaceLayout, 'order' | 'hidden' | 'pinned' | 'zoneBySurface'> | null,
): { pieces: PieceInput[]; areaOf: Record<string, WorkspaceZoneId> } {
  const hidden = new Set(layout?.hidden ?? []);
  const pinned = new Set(layout?.pinned ?? []);
  const order = layout?.order ?? [];
  const areaOf: Record<string, WorkspaceZoneId> = {};
  const pieces: PieceInput[] = [];
  for (const s of surfaces) {
    if (!PRESENT.has(s.presentation) || hidden.has(s.id)) continue;
    const resting = RESTING.has(s.presentation);
    const saved = order.indexOf(s.id);
    areaOf[s.id] =
      (layout?.zoneBySurface as Record<string, WorkspaceZoneId> | undefined)?.[s.id] ??
      s.defaultArea;
    pieces.push({
      id: s.id,
      label: s.label,
      group: s.group,
      fit: s.fit,
      time: s.time,
      needsAttention: resting ? false : s.needsAttention,
      task: resting ? false : s.task,
      lit: resting ? false : s.lit,
      roleImportance: (s.roleImportance ?? 1) * (resting ? 0.5 : 1),
      pinned: pinned.has(s.id),
      savedIndex: saved < 0 ? undefined : saved,
    });
  }
  return { pieces, areaOf };
}

/** Group order saved by the person becomes each group's saved index. */
export function groupsWithSavedOrder(
  groups: readonly GroupInput[],
  groupOrder: readonly string[] | undefined,
): GroupInput[] {
  return groups.map((g) => {
    const i = groupOrder?.indexOf(g.id) ?? -1;
    return i < 0 ? g : { ...g, savedIndex: i };
  });
}
