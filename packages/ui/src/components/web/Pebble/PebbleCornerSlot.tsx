import { useState, type MouseEvent, type PointerEvent } from 'react';
import { MoreHorizontal, MoreVertical } from 'lucide-react';
import type { PebbleCornerBadgeSpec } from '../../../theme/contracts';

export interface PebbleCornerSlotProps {
  badge?: PebbleCornerBadgeSpec;
  compact?: boolean;
}

export function PebbleCornerSlot({ badge, compact = false }: PebbleCornerSlotProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!badge) return null;

  const {
    mode,
    isPinned = false,
    count = 0,
    status = 'ready',
    dotOrientation = 'vertical',
    guidanceTooltip,
    menuActions,
    onAction,
  } = badge;

  const handlePointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    setIsPressing(true);
  };

  const handlePointerUp = (e: PointerEvent) => {
    e.stopPropagation();
    setIsPressing(false);
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();

    switch (mode) {
      case 'pin':
        onAction?.('toggle-pin', e);
        break;
      case 'menu':
        setIsOpenMenu((prev) => !prev);
        onAction?.('toggle-menu', e);
        break;
      case 'counter':
        onAction?.('click-counter', e);
        break;
      case 'status':
        onAction?.('cycle-status', e);
        break;
      case 'tooltip':
        setShowTooltip((prev) => !prev);
        break;
      default:
        onAction?.(mode, e);
        break;
    }
  };

  const isPermanentActive =
    (mode === 'pin' && isPinned) ||
    (mode === 'menu' && isOpenMenu) ||
    (mode === 'counter' && count > 0);

  return (
    <div
      className="gd-pebble-hitbox"
      data-pressing={isPressing || undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        setIsPressing(false);
        setShowTooltip(false);
      }}
      onPointerCancel={() => setIsPressing(false)}
      onMouseEnter={() => setShowTooltip(true)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={
        mode === 'pin'
          ? isPinned ? 'Unpin favorite' : 'Pin to favorites'
          : mode === 'menu'
          ? 'Options menu'
          : mode === 'counter'
          ? `Count: ${count}`
          : mode === 'status'
          ? `Status: ${status}`
          : 'Practice guidance'
      }
      aria-label={`${mode} option`}
    >
      {/* Quarter-Circle Visual Face */}
      <div
        className="gd-pebble-sticker"
        data-active={isPermanentActive || undefined}
      >
        {mode === 'pin' && (
          <span className="gd-pebble-glyph" aria-hidden="true">
            {isPinned ? '📍' : '📌'}
          </span>
        )}

        {mode === 'menu' && (
          <span className="gd-pebble-glyph" aria-hidden="true">
            {dotOrientation === 'vertical' ? (
              <MoreVertical size={compact ? 12 : 14} />
            ) : (
              <MoreHorizontal size={compact ? 12 : 14} />
            )}
          </span>
        )}

        {mode === 'counter' && (
          <span className="gd-pebble-counter" aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}

        {mode === 'tooltip' && (
          <span className="gd-pebble-glyph" aria-hidden="true">
            💡
          </span>
        )}

        {mode === 'status' && (
          <span
            className="gd-pebble-status"
            data-state={status}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Autonomous Dropdown Menu for 3-Dot Mode */}
      {mode === 'menu' && isOpenMenu && (
        <div
          className="gd-pebble-menu"
          onClick={(e) => e.stopPropagation()}
        >
          {menuActions && menuActions.length > 0 ? (
            menuActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="gd-pebble-menu-item"
                onClick={(e) => {
                  onAction?.(action.id, e);
                  setIsOpenMenu(false);
                }}
              >
                {action.icon && <span>{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            ))
          ) : (
            <>
              <button
                type="button"
                className="gd-pebble-menu-item"
                onClick={(e) => {
                  onAction?.('toggle-pin', e);
                  setIsOpenMenu(false);
                }}
              >
                <span>{isPinned ? '📌' : '📍'}</span>
                <span>{isPinned ? 'Unpin Favorite' : 'Pin to Top'}</span>
              </button>
              <button
                type="button"
                className="gd-pebble-menu-item"
                onClick={(e) => {
                  onAction?.('adjust-rhythm', e);
                  setIsOpenMenu(false);
                }}
              >
                <span>⏱️</span>
                <span>Adjust Rhythm</span>
              </button>
              <button
                type="button"
                className="gd-pebble-menu-item"
                onClick={(e) => {
                  onAction?.('view-history', e);
                  setIsOpenMenu(false);
                }}
              >
                <span>📖</span>
                <span>Practice History</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Floating Micro-Tooltip */}
      {mode === 'tooltip' && showTooltip && guidanceTooltip && (
        <div className="gd-pebble-tooltip" role="tooltip">
          {guidanceTooltip}
        </div>
      )}
    </div>
  );
}

