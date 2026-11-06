'use client';

import { type MouseEvent, type ReactNode, type SyntheticEvent, useEffect, useId, useRef } from 'react';
import type { DialogContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface DialogProps extends DialogContract {
  className?: string;
}

/** Opens and closes a native <dialog> with the `open` prop. */
export function useModalDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}

/** Escape and a click on the backdrop dismiss, unless the overlay forbids it. */
export function dismissHandlers(dismissable: boolean, onClose: () => void) {
  return {
    onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (dismissable) onClose();
    },
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      // A click on the <dialog> itself (not its panel) lands on the backdrop.
      if (dismissable && event.target === event.currentTarget) onClose();
    },
  };
}

/**
 * A short, focused question or message over the page: a native modal <dialog>,
 * so focus moves in, stays in and returns on close, and the rest of the page is
 * inert. The panel is the world's raised surface.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  dismissable = true,
  className,
}: DialogProps) {
  const ref = useModalDialog(open);
  const id = useId();
  return (
    <dialog
      ref={ref}
      className={cx('gd-dialog', className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      {...dismissHandlers(dismissable, onClose)}
    >
      {open ? (
        <DialogBody id={id} title={title} description={description} actions={actions}>
          {children}
        </DialogBody>
      ) : null}
    </dialog>
  );
}

function DialogBody({
  id,
  title,
  description,
  actions,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="gd-overlay-panel">
      <h2 id={`${id}-title`} className="gd-text" data-kind="title">
        {title}
      </h2>
      {description ? (
        <p id={`${id}-desc`} className="gd-text" data-kind="body" data-tone="soft">
          {description}
        </p>
      ) : null}
      {children}
      {actions ? <div className="gd-dialog-actions">{actions}</div> : null}
    </div>
  );
}
