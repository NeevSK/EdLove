import { type CSSProperties, type InputHTMLAttributes, useId } from 'react';
import type { SliderContract } from '../../../theme/contracts';
import { fraction, snap } from '../../shared/range';
import { cx } from '../cx';

export interface SliderProps
  extends SliderContract,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'min' | 'max' | 'step'> {}

/** Pick a number along a range: a native range input, dressed by the world. */
export function Slider({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  valueText,
  disabled,
  className,
  id: idProp,
  ...rest
}: SliderProps) {
  const auto = useId();
  const id = idProp ?? `gd-slider-${auto}`;
  const text = valueText ? valueText(value) : String(value);
  const range = { min, max, step };
  return (
    <div className={cx('gd-slider-field', className)}>
      <div className="gd-slider-head">
        <label htmlFor={id} className="gd-text" data-kind="label" data-tone="soft">
          {label}
        </label>
        <output htmlFor={id} className="gd-text" data-kind="value" aria-hidden="true">
          {text}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="gd-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={valueText ? text : undefined}
        style={{ '--gd-fill': `${fraction(value, range) * 100}%` } as CSSProperties}
        onChange={(event) => onChange(snap(Number(event.target.value), range))}
        {...rest}
      />
    </div>
  );
}
