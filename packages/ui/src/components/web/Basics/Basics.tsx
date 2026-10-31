import { type ReactNode, useId, useState } from 'react';
import type {
  DisclosureContract,
  NoticeContract,
  NumberStepperContract,
  SearchFieldContract,
  StepsContract,
} from '../../../theme/contracts';
import { iconSize } from '../../../tokens/sizes';
import { BASICS_ENGLISH, clampStep } from '../../shared/basics';
import { Button } from '../Button/Button';
import { cx } from '../cx';

export interface DisclosureProps extends DisclosureContract {
  className?: string;
}

/** The browser's own `<details>`: keyboard, find-in-page and readers come with it. */
export function Disclosure({
  title,
  summary,
  open,
  defaultOpen,
  onOpenChange,
  children,
  className,
}: DisclosureProps) {
  return (
    <details
      className={cx('gd-disclosure', className)}
      open={open ?? defaultOpen}
      onToggle={(e) => {
        const now = e.currentTarget.open;
        if (now !== open) onOpenChange?.(now);
      }}
    >
      <summary className="gd-disclosure-head">
        <span className="gd-disclosure-words">
          <span className="gd-disclosure-title">{title}</span>
          {summary ? <span className="gd-disclosure-summary">{summary}</span> : null}
        </span>
        <span className="gd-disclosure-chevron" aria-hidden>
          ›
        </span>
      </summary>
      <div className="gd-disclosure-body">{children}</div>
    </details>
  );
}

export interface NoticeProps extends NoticeContract {
  className?: string;
}

/** A calm message in the page's flow; danger is an alert, the rest a polite status. */
export function Notice({
  tone = 'neutral',
  title,
  message,
  action,
  onDismiss,
  dismissLabel = BASICS_ENGLISH.dismiss,
  className,
}: NoticeProps) {
  return (
    <div
      className={cx('gd-notice', className)}
      data-tone={tone}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <div className="gd-notice-words">
        {title ? <p className="gd-notice-title">{title}</p> : null}
        <p className="gd-notice-message">{message}</p>
        {action ? (
          <Button size="sm" variant="secondary" label={action.label} onClick={action.onPress} />
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="gd-notice-dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <span aria-hidden>×</span>
        </button>
      ) : null}
    </div>
  );
}

export interface SearchFieldProps extends SearchFieldContract {
  className?: string;
}

/** A search landmark: a round well, a clear control, and the result count said politely. */
export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  icon: Glyph,
  onSubmit,
  resultCount,
  labels,
  className,
}: SearchFieldProps) {
  const l = { ...BASICS_ENGLISH, ...labels };
  const id = useId();
  return (
    <div className={cx('gd-search', className)}>
      <form
        role="search"
        className="gd-search-well"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(value);
        }}
      >
        {Glyph ? <Glyph size={iconSize.sm} color="currentColor" aria-hidden /> : null}
        <input
          id={id}
          type="search"
          className="gd-search-input"
          aria-label={label}
          aria-describedby={resultCount !== undefined ? `${id}-count` : undefined}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {value ? (
          <button
            type="button"
            className="gd-search-clear"
            aria-label={l.clear}
            onClick={() => onChange('')}
          >
            <span aria-hidden>×</span>
          </button>
        ) : null}
      </form>
      {resultCount !== undefined ? (
        <p id={`${id}-count`} className="gd-search-count" aria-live="polite">
          {value ? l.results(resultCount) : ''}
        </p>
      ) : null}
    </div>
  );
}

export interface NumberStepperProps extends NumberStepperContract {
  className?: string;
}

/** A labelled number input between two step buttons; typing is kept to the bounds and step. */
export function NumberStepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  hint,
  disabled,
  labels,
  className,
}: NumberStepperProps) {
  const l = { ...BASICS_ENGLISH, ...labels };
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const set = (next: number) => {
    const kept = clampStep(next, min, max, step);
    if (kept !== value) onChange(kept);
  };
  return (
    <div className={cx('gd-number', className)}>
      <label id={`${id}-label`} className="gd-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="gd-number-well" role="group" aria-labelledby={`${id}-label`}>
        <button
          type="button"
          className="gd-number-step"
          aria-label={`${l.decrease}, ${label}`}
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={() => set(value - step)}
        >
          <span aria-hidden>−</span>
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          className="gd-number-input"
          value={draft ?? String(value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-describedby={hint || unit ? `${id}-note` : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft !== null && draft.trim() !== '' && Number.isFinite(Number(draft)))
              set(Number(draft));
            setDraft(null);
          }}
        />
        {unit ? <span className="gd-number-unit">{unit}</span> : null}
        <button
          type="button"
          className="gd-number-step"
          aria-label={`${l.increase}, ${label}`}
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => set(value + step)}
        >
          <span aria-hidden>+</span>
        </button>
      </div>
      {hint || unit ? (
        <p id={`${id}-note`} className="gd-field-hint">
          {[unit, hint].filter(Boolean).join(' · ')}
        </p>
      ) : null}
    </div>
  );
}

export interface StepsProps extends StepsContract {
  className?: string;
}

/** A list of steps with `aria-current="step"`; earlier and done steps can be gone back to. */
export function Steps({ steps, current, label, onSelect, labels, className }: StepsProps) {
  const l = { ...BASICS_ENGLISH, ...labels };
  const here = steps[current];
  return (
    <nav className={cx('gd-steps', className)} aria-label={label}>
      <p className="gd-steps-now" aria-live="polite">
        {l.step(current + 1, steps.length)}
        {here ? ` · ${here.label}` : ''}
      </p>
      <ol className="gd-steps-trail">
        {steps.map((s, i) => {
          const reachable = !!onSelect && (i <= current || s.state === 'done');
          const words: ReactNode = (
            <span className="gd-visually-hidden">
              {[
                l.step(i + 1, steps.length),
                s.label,
                s.state === 'done' ? l.done : s.state === 'error' ? l.error : null,
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          );
          return (
            <li
              key={s.key}
              className="gd-steps-step"
              data-lit={i <= current || s.state === 'done' ? '' : undefined}
              data-state={s.state}
              aria-current={i === current ? 'step' : undefined}
            >
              {reachable ? (
                <button type="button" className="gd-steps-press" onClick={() => onSelect?.(i)}>
                  {words}
                </button>
              ) : (
                words
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
