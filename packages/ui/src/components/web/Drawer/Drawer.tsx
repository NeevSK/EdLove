'use client';

import { useId } from 'react';
import type { DrawerContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { dismissHandlers, useModalDialog } from '../Dialog/Dialog';
import { ScrollArea } from '../ScrollArea/ScrollArea';

export interface DrawerProps extends DrawerContract {
  className?: string;
}

/**
 * A panel that slides in from the right (or left) edge for complex tasks,
 * configuration, or contextual tooling: a native modal <dialog> laid out as a drawer.
 * Escape and clicking the backdrop dismiss unless `dismissable` is false.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  side = 'right',
  children,
  actions,
  footer,
  dismissable = true,
  className,
}: DrawerProps) {
  const ref = useModalDialog(open);
  const id = useId();

  return (
    <dialog
      ref={ref}
      className={cx('gd-dialog gd-drawer', className)}
      data-side={side}
      aria-labelledby={`${id}-title`}
      aria-describedby={subtitle ? `${id}-subtitle` : undefined}
      {...dismissHandlers(dismissable, onClose)}
    >
      {open ? (
        <div className="gd-overlay-panel">
          <header className="gd-drawer-header">
            <div className="gd-drawer-title-group">
              <h2 id={`${id}-title`} className="gd-text" data-kind="title">
                {title}
              </h2>
              {subtitle ? (
                <p id={`${id}-subtitle`} className="gd-drawer-subtitle">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {actions}
              {dismissable ? (
                <button
                  type="button"
                  className="gd-icon-button"
                  data-variant="quiet"
                  data-size="sm"
                  onClick={onClose}
                  aria-label="Close drawer"
                  style={{ width: '32px', height: '32px' }}
                >
                  ✕
                </button>
              ) : null}
            </div>
          </header>
          <ScrollArea orientation="vertical" variant="auto" style={{ flex: 1, width: '100%' }}>
            {children}
          </ScrollArea>
          {footer ? <footer className="gd-drawer-footer">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  );
}
