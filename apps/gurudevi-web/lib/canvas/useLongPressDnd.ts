import { useCallback, useEffect, useRef, useState } from 'react';

export type InsertionSide = 'before' | 'after';

export interface UseLongPressDndOptions {
  /** Ordered list of item IDs */
  items: readonly string[];
  /** Callback fired when an item is dropped into a new position */
  onReorder: (sourceId: string, destinationIndex: number) => void;
  /** Hold duration in milliseconds before drag mode activates. Defaults to 400ms. */
  holdDelayMs?: number;
  /** Distance in pixels beyond which a pending hold is cancelled (e.g. user is scrolling). Defaults to 6px. */
  movementTolerancePx?: number;
  /** Custom check to ignore events from inner interactive children */
  isInteractiveElement?: (element: HTMLElement) => boolean;
}

export interface LongPressDragItemProps {
  'data-dnd-id': string;
  'data-dnd-lifted': boolean;
  'data-dnd-over'?: InsertionSide;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  tabIndex?: number;
}

export interface UseLongPressDndReturn {
  activeId: string | null;
  overId: string | null;
  insertionSide: InsertionSide | null;
  isDragging: boolean;
  announcement: string;
  getDragItemProps: (id: string, index: number) => LongPressDragItemProps;
  cancelDrag: () => void;
}

function defaultIsInteractive(el: HTMLElement): boolean {
  return Boolean(
    el.closest(
      'button, a, input, textarea, select, option, [role="button"], [role="link"], [data-no-dnd="true"]',
    ),
  );
}

export function useLongPressDnd({
  items,
  onReorder,
  holdDelayMs = 400,
  movementTolerancePx = 6,
  isInteractiveElement = defaultIsInteractive,
}: UseLongPressDndOptions): UseLongPressDndReturn {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [insertionSide, setInsertionSide] = useState<InsertionSide | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Refs to track drag state across pointer move/up without stale closures
  const activeIdRef = useRef<string | null>(null);
  const overIdRef = useRef<string | null>(null);
  const sideRef = useRef<InsertionSide | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const cancelDrag = useCallback(() => {
    clearHoldTimer();
    isDraggingRef.current = false;
    activeIdRef.current = null;
    overIdRef.current = null;
    sideRef.current = null;
    pointerIdRef.current = null;
    startPosRef.current = null;
    setActiveId(null);
    setOverId(null);
    setInsertionSide(null);
  }, [clearHoldTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearHoldTimer();
    };
  }, [clearHoldTimer]);

  const handlePointerDown = useCallback(
    (id: string, event: React.PointerEvent<HTMLElement>) => {
      // Only react to primary pointer (left mouse button or first touch)
      if (event.button !== 0 && event.pointerType === 'mouse') return;

      const target = event.target as HTMLElement | null;
      if (target && isInteractiveElement(target)) {
        return;
      }

      clearHoldTimer();
      const clientX = event.clientX;
      const clientY = event.clientY;
      startPosRef.current = { x: clientX, y: clientY };
      pointerIdRef.current = event.pointerId;

      holdTimerRef.current = setTimeout(() => {
        // Trigger drag mode
        isDraggingRef.current = true;
        activeIdRef.current = id;
        setActiveId(id);

        try {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(25);
          }
        } catch {}

        setAnnouncement(`Grabbed ${id}. Move to reposition or press Escape to cancel.`);
      }, holdDelayMs);
    },
    [clearHoldTimer, holdDelayMs, isInteractiveElement],
  );

  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      // If still waiting for long-press timer, check if moved beyond tolerance
      if (holdTimerRef.current !== null && startPosRef.current) {
        const dx = Math.abs(event.clientX - startPosRef.current.x);
        const dy = Math.abs(event.clientY - startPosRef.current.y);
        if (dx > movementTolerancePx || dy > movementTolerancePx) {
          clearHoldTimer();
        }
        return;
      }

      // If actively dragging
      if (isDraggingRef.current && activeIdRef.current) {
        // Prevent default touch scrolling while dragging
        if (event.cancelable) {
          event.preventDefault();
        }

        const hoveredEl = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest<HTMLElement>('[data-dnd-id]');

        const targetId = hoveredEl?.dataset.dndId;
        if (targetId && targetId !== activeIdRef.current && items.includes(targetId)) {
          const rect = hoveredEl.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const side: InsertionSide = event.clientY < midY ? 'before' : 'after';

          if (overIdRef.current !== targetId || sideRef.current !== side) {
            overIdRef.current = targetId;
            sideRef.current = side;
            setOverId(targetId);
            setInsertionSide(side);
          }
        } else if (!targetId && overIdRef.current) {
          overIdRef.current = null;
          sideRef.current = null;
          setOverId(null);
          setInsertionSide(null);
        }
      }
    };

    const onWindowPointerUp = () => {
      clearHoldTimer();

      if (isDraggingRef.current && activeIdRef.current) {
        const source = activeIdRef.current;
        const target = overIdRef.current;
        const side = sideRef.current;

        if (target && source && source !== target) {
          const sourceIdx = items.indexOf(source);
          const targetIdx = items.indexOf(target);

          if (sourceIdx !== -1 && targetIdx !== -1) {
            let destIdx = targetIdx;
            if (side === 'after') {
              destIdx = targetIdx + 1;
            }
            if (sourceIdx < destIdx) {
              destIdx -= 1;
            }
            destIdx = Math.max(0, Math.min(items.length - 1, destIdx));

            if (destIdx !== sourceIdx) {
              onReorder(source, destIdx);
              setAnnouncement(`Moved ${source} to position ${destIdx + 1} of ${items.length}.`);
            }
          }
        }
      }

      cancelDrag();
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [cancelDrag, clearHoldTimer, items, movementTolerancePx, onReorder]);

  const handleKeyDown = useCallback(
    (id: string, index: number, event: React.KeyboardEvent<HTMLElement>) => {
      if (!event.altKey) return;

      if (event.key === 'ArrowUp' && index > 0) {
        event.preventDefault();
        onReorder(id, index - 1);
        setAnnouncement(`Moved ${id} up to position ${index} of ${items.length}.`);
      } else if (event.key === 'ArrowDown' && index < items.length - 1) {
        event.preventDefault();
        onReorder(id, index + 1);
        setAnnouncement(`Moved ${id} down to position ${index + 2} of ${items.length}.`);
      }
    },
    [items.length, onReorder],
  );

  const getDragItemProps = useCallback(
    (id: string, index: number): LongPressDragItemProps => {
      const isLifted = activeId === id;
      const isTarget = overId === id;

      return {
        'data-dnd-id': id,
        'data-dnd-lifted': isLifted,
        'data-dnd-over': isTarget && insertionSide ? insertionSide : undefined,
        onPointerDown: (event) => handlePointerDown(id, event),
        onKeyDown: (event) => handleKeyDown(id, index, event),
        tabIndex: 0,
      };
    },
    [activeId, handleKeyDown, handlePointerDown, insertionSide, overId],
  );

  return {
    activeId,
    overId,
    insertionSide,
    isDragging: activeId !== null,
    announcement,
    getDragItemProps,
    cancelDrag,
  };
}

