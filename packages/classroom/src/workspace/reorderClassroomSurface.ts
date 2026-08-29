export function reorderClassroomSurface<TSurfaceId extends string>(
  order: TSurfaceId[],
  surfaceId: TSurfaceId,
  targetId: TSurfaceId,
): TSurfaceId[] {
  const sourceIndex = order.indexOf(surfaceId);
  const targetIndex = order.indexOf(targetId);
  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return order;

  const nextOrder = [...order];
  nextOrder.splice(sourceIndex, 1);
  nextOrder.splice(targetIndex, 0, surfaceId);
  return nextOrder;
}
