import { type SelectHTMLAttributes, useId } from 'react';
import type { SelectContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface SelectProps<V extends string = string>
  extends SelectContract<V>,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'children'> {}

/**
 * Choose one option from a list: the browser's own <select> (a native picker on
 * phones), dressed as the world's text field, with its label, hint and error
 * wired up like TextField's.
 */
export function Select<V extends string = string>({
  value,
  onChange,
  label,
  options,
  placeholder,
  hint,
  error,
  disabled,
  className,
  id: idProp,
  ...rest
}: SelectProps<V>) {
  const auto = useId();
  const id = idProp ?? `gd-select-${auto}`;
  const note = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cx('gd-field', className)} data-state={error ? 'error' : undefined}>
      <label className="gd-field-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="gd-field-input gd-select"
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={note}
        data-empty={value === null || undefined}
        onChange={(event) => {
          const next = options.find((o) => o.value === event.target.value);
          if (next) onChange(next.value);
        }}
        {...rest}
      >
        {value === null ? (
          <option value="" disabled>
            {placeholder ?? ''}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={note} className="gd-field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={note} className="gd-field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
