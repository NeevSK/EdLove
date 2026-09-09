import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PropsWithChildren } from 'react';

export interface WebDraggableCanvasSurfaceProps {
  id: string;
  disabled?: boolean;
}

export function WebDraggableCanvasSurface({
  id,
  disabled,
  children,
}: PropsWithChildren<WebDraggableCanvasSurfaceProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms ease, opacity 200ms ease, box-shadow 200ms ease',
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 20 : 0,
    cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
    touchAction: disabled ? 'auto' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'dragging-canvas-surface' : undefined}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
