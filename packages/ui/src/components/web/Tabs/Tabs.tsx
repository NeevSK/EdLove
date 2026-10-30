import { useId, useRef } from 'react';
import type { TabsContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { rovingNext } from '../roving';

export interface TabsProps<V extends string = string> extends TabsContract<V> {
  className?: string;
}

/**
 * Switch between sibling views of one thing. Tabs wear the world's chip look;
 * arrow keys, Home and End move between them and select (automatic
 * activation), and only the selected tab is in the tab order (WAI-ARIA tabs).
 */
export function Tabs<V extends string = string>({ value, onChange, label, tabs, children, className }: TabsProps<V>) {
  const base = useId();
  const refs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
  const tabId = (v: string) => `${base}-tab-${v}`;
  const panelId = `${base}-panel`;

  return (
    <div className={cx('gd-tabs', className)}>
      <div
        role="tablist"
        aria-label={label}
        className="gd-tablist"
        onKeyDown={(event) => {
          const next = rovingNext(event, tabs, value);
          if (next === null) return;
          onChange(next);
          refs.current[next]?.focus();
        }}
      >
        {tabs.map((tab) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                refs.current[tab.value] = el;
              }}
              id={tabId(tab.value)}
              type="button"
              role="tab"
              className="gd-chip gd-tab"
              aria-selected={selected}
              aria-controls={children === undefined ? undefined : panelId}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {children === undefined ? null : (
        <div id={panelId} role="tabpanel" aria-labelledby={tabId(value)} tabIndex={0} className="gd-tabpanel">
          {children}
        </div>
      )}
    </div>
  );
}
