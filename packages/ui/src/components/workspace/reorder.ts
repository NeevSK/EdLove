export function clampReorderIndex(currentIndex: number, shift: number, itemCount: number) {
  if (itemCount <= 0) return 0;
  return Math.max(0, Math.min(itemCount - 1, currentIndex + shift));
}

export function resolveReorderTarget(currentIndex: number, shift: -1 | 1, itemCount: number) {
  return clampReorderIndex(currentIndex, shift, itemCount);
}

export function resolveDragTranslation(
  axis: 'vertical' | 'both',
  translation: { x: number; y: number },
) {
  return axis === 'vertical' ? { x: 0, y: translation.y } : translation;
}
