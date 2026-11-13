'use client';

import { type InputHTMLAttributes, useEffect, useId, useRef } from 'react';
import type { CheckboxContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { feel } from '../feel';

export interface CheckboxProps
  extends CheckboxContract,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange' | 'children'> {}

/** One yes/no choice with its words beside it: a native checkbox, dressed by the world. */
export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  disabled,
  className,
  id: idProp,
  ...rest
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const auto = useId();
  const id = idProp ?? `gd-check-${auto}`;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === 'mixed';
  }, [checked]);

  return (
    <div className={cx('gd-choice', className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="gd-check"
        checked={checked === true}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => {
          feel('select');
          onChange(event.target.checked);
        }}
        {...rest}
      />
      <span className="gd-choice-words">
        <label htmlFor={id} className="gd-text" data-kind="body">
          {label}
        </label>
        {hint ? (
          <span id={`${id}-hint`} className="gd-text" data-kind="caption" data-tone="soft">
            {hint}
          </span>
        ) : null}
      </span>
    </div>
  );
}
