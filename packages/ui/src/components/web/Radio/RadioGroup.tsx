import { useId } from 'react';
import type { RadioGroupContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface RadioGroupProps<V extends string = string> extends RadioGroupContract<V> {
  className?: string;
}

/**
 * One choice from a short list, all visible at once: a fieldset of native
 * radios, so arrow keys and form submission work as people expect.
 */
export function RadioGroup<V extends string = string>({
  value,
  onChange,
  label,
  options,
  className,
}: RadioGroupProps<V>) {
  const name = useId();
  return (
    <fieldset className={cx('gd-radios', className)}>
      <legend className="gd-text" data-kind="label" data-tone="soft">
        {label}
      </legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <div key={option.value} className="gd-choice">
            <input
              id={id}
              type="radio"
              className="gd-radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              aria-describedby={option.hint ? `${id}-hint` : undefined}
              onChange={() => onChange(option.value)}
            />
            <span className="gd-choice-words">
              <label htmlFor={id} className="gd-text" data-kind="body">
                {option.label}
              </label>
              {option.hint ? (
                <span id={`${id}-hint`} className="gd-text" data-kind="caption" data-tone="soft">
                  {option.hint}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </fieldset>
  );
}
