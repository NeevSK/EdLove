/**
 * Moving furniture. The person moves a piece among the pieces they can see
 * (its neighbours in the same group); the saved order keeps every other id,
 * hidden ones included, where it was. Drag, move up/down buttons and a
 * keyboard all end in the same call, so all three save the same way.
 */

export type MoveBy = -1 | 1 | 'first' | 'last';

/**
 * New saved order after moving `id` within `visible` (the ids drawn next to
 * it, in the order shown). Ids not in `visible` keep their slots.
 * Returns the same array when nothing moves.
 */
export function moveAmong<T extends string>(
  order: readonly T[],
  visible: readonly T[],
  id: T,
  by: MoveBy,
): readonly T[] {
  const from = visible.indexOf(id);
  if (from < 0) return order;
  const to =
    by === 'first'
      ? 0
      : by === 'last'
        ? visible.length - 1
        : Math.max(0, Math.min(visible.length - 1, from + by));
  if (to === from) return order;
  const nextVisible = [...visible];
  nextVisible.splice(from, 1);
  nextVisible.splice(to, 0, id);
  return placeVisible(order, visible, nextVisible);
}

/** New saved order after a drag drops `id` at `index` among `visible`. */
export function dropAt<T extends string>(
  order: readonly T[],
  visible: readonly T[],
  id: T,
  index: number,
): readonly T[] {
  const from = visible.indexOf(id);
  if (from < 0) return order;
  const to = Math.max(0, Math.min(visible.length - 1, index));
  if (to === from) return order;
  const nextVisible = [...visible];
  nextVisible.splice(from, 1);
  nextVisible.splice(to, 0, id);
  return placeVisible(order, visible, nextVisible);
}

/** What a move control may offer for `id`: hides "up" on the first, "down" on the last. */
export function moveChoices(
  visible: readonly string[],
  id: string,
): { up: boolean; down: boolean } {
  const at = visible.indexOf(id);
  return { up: at > 0, down: at >= 0 && at < visible.length - 1 };
}

/** Words a screen reader says after a move, e.g. "Notes, 2 of 5". */
export function movedAnnouncement(label: string, visible: readonly string[], id: string): string {
  return `${label}, ${visible.indexOf(id) + 1} of ${visible.length}`;
}

/**
 * Puts `nextVisible` into the slots the visible ids held in `order`, and adds
 * any visible id the saved order did not know yet at the end.
 */
function placeVisible<T extends string>(
  order: readonly T[],
  visible: readonly T[],
  nextVisible: readonly T[],
): readonly T[] {
  const seen = new Set(visible);
  const full = [...order, ...visible.filter((v) => !order.includes(v))];
  let k = 0;
  return full.map((existing) => (seen.has(existing) ? (nextVisible[k++] as T) : existing));
}
