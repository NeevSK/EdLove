import { useId } from 'react';
import type { SheetContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { dismissHandlers, useModalDialog } from '../Dialog/Dialog';

export interface SheetProps extends SheetContract {
  className?: string;
}

/**
 * A panel that rises from the bottom edge for a short task or a list of
 * choices: a native modal <dialog> laid out as a sheet, with only its top
 * corners round. Escape and the backdrop dismiss unless `dismissable` is false.
 */
export function Sheet({ open, onClose, title, children, dismissable = true, className }: SheetProps) {
  const ref = useModalDialog(open);
  const id = useId();
  return (
    <dialog
      ref={ref}
      className={cx('gd-dialog gd-sheet', className)}
      aria-labelledby={`${id}-title`}
      {...dismissHandlers(dismissable, onClose)}
    >
      {open ? (
        <div className="gd-overlay-panel">
          {dismissable ? <span className="gd-sheet-grabber" aria-hidden="true" /> : null}
          <h2 id={`${id}-title`} className="gd-text" data-kind="title">
            {title}
          </h2>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
