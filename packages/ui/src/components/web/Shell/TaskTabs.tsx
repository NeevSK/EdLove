import type { KeyboardEvent } from 'react';
import type { TaskTabsContract } from '../../../theme/contracts';
import { TASK_TABS_ENGLISH } from '../../shared/agent';

export type TaskTabsProps = TaskTabsContract;

/**
 * Open tasks as tabs, Home first. A tab is chosen with a click or Enter,
 * closed with its × or Delete, and moved with Alt+Left/Right (the keyboard's
 * drag). The chosen tab is lit by the world's chip paint and underline.
 */
export function TaskTabs({
  label,
  home,
  tabs,
  activeId,
  onSelect,
  onClose,
  onReorder,
  labels,
}: TaskTabsProps) {
  const l = { ...TASK_TABS_ENGLISH, ...labels };
  if (tabs.length === 0) return null;
  const order = tabs.map((t) => t.id);
  const keys = (id: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const from = order.indexOf(id);
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const to = from + (e.key === 'ArrowLeft' ? -1 : 1);
      if (to >= 0 && to < order.length) onReorder(id, to);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      onClose(id);
    }
  };
  return (
    <div className="gd-task-tabs" role="tablist" aria-label={label}>
      {home ? (
        <button
          type="button"
          role="tab"
          aria-selected={home.selected}
          className="gd-task-tab"
          data-state={home.selected ? 'selected' : 'rest'}
          onClick={home.onPress}
        >
          {home.label}
        </button>
      ) : null}
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <span key={tab.id} className="gd-task-tab-pill" data-active={active ? '' : undefined}>
            <button
              type="button"
              role="tab"
              aria-selected={active}
              aria-description={`${l.moveEarlier} / ${l.moveLater}: Alt+←/→`}
              className="gd-task-tab"
              data-state={active ? 'selected' : 'rest'}
              onClick={() => onSelect(tab.id)}
              onKeyDown={keys(tab.id)}
            >
              {tab.title}
            </button>
            <button
              type="button"
              className="gd-task-tab-close"
              aria-label={l.close(tab.title)}
              onClick={() => onClose(tab.id)}
            >
              <span aria-hidden>×</span>
            </button>
          </span>
        );
      })}
    </div>
  );
}
