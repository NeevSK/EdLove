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
    transition: transition ?? undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
