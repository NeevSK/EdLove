'use client';

import { useMemo, useState } from 'react';
import { keysLabel } from '../../../shortcuts/core';
import { useShortcut, useShortcutList } from '../../../shortcuts/web';
import { Dialog } from '../Dialog/Dialog';

const SCOPE_TITLE = { floor: 'This floor', room: 'This room', app: 'Everywhere' } as const;

/**
 * The "?" list: every key the app answers to right now, grouped by where it
 * works. Built from the shared shortcut registry, so it never goes stale.
 * Place once in the app shell.
 */
export function KeyboardHelp() {
  const [open, setOpen] = useState(false);
  useShortcut('?', () => setOpen((o) => !o), { label: 'Show keyboard shortcuts', scope: 'app' });
  const list = useShortcutList();
  const apple = useMemo(
    () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    [],
  );
  const groups = (['floor', 'room', 'app'] as const)
    .map((scope) => ({ scope, items: list.filter((s) => s.scope === scope) }))
    .filter((g) => g.items.length > 0);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Keyboard shortcuts">
      {groups.map((g) => (
        <section key={g.scope} className="gd-keys">
          <h3 className="gd-text" data-kind="label">
            {SCOPE_TITLE[g.scope]}
          </h3>
          <dl>
            {g.items.map((s) => (
              <div key={s.keys} className="gd-keys-row">
                <dt>
                  <kbd className="gd-kbd">{keysLabel(s.keys, apple)}</kbd>
                </dt>
                <dd className="gd-text" data-kind="body">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </Dialog>
  );
}
