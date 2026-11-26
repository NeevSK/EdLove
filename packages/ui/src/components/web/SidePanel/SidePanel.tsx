'use client';

import { useId } from 'react';
import type { SidePanelContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { dismissHandlers, useModalDialog } from '../Dialog/Dialog';
import { ScrollArea } from '../ScrollArea/ScrollArea';

export interface SidePanelProps extends SidePanelContract {
  className?: string;
}

/**
 * A panel that slides in from a side edge over the current place: a native modal <dialog> laid out
 * as a full-height panel, round only on the edge that faces the page. `end` (the default) follows
 * the writing direction, so it is the right in a left-to-right page. Escape and the backdrop dismiss
 * unless `dismissable` is false. The same contract as the native kit's `SidePanel`.
 */
export function SidePanel({
  open,
  onClose,
  title,
  children,
  side = 'end',
  dismissable = true,
  className,
}: SidePanelProps) {
  const ref = useModalDialog(open);
  const id = useId();
  return (
    <dialog
      ref={ref}
      className={cx('gd-dialog gd-side-panel', className)}
      data-side={side}
      aria-labelledby={`${id}-title`}
      {...dismissHandlers(dismissable, onClose)}
    >
      {open ? (
        <div className="gd-overlay-panel">
          <h2 id={`${id}-title`} className="gd-text" data-kind="title">
            {title}
          </h2>
          <ScrollArea orientation="vertical" variant="auto" style={{ flex: 1, width: '100%' }}>
            {children}
          </ScrollArea>
        </div>
      ) : null}
    </dialog>
  );
}
