import { type InputHTMLAttributes, type Ref, type TextareaHTMLAttributes, useId } from 'react';
import type { FieldContract } from '../../../theme/contracts';
import { cx } from '../cx';

export type TextFieldProps = FieldContract &
  (
    | ({ multiline?: false } & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {
          ref?: Ref<HTMLInputElement>;
        })
    | ({ multiline: true } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & {
          ref?: Ref<HTMLTextAreaElement>;
        })
  );

export function TextField(props: TextFieldProps) {
  const {
    label,
    hint,
    error,
    className,
    id: idProp,
    multiline,
    ...rest
  } = props as FieldContract & {
    className?: string;
    id?: string;
    multiline?: boolean;
  } & Record<string, unknown>;
  const auto = useId();
  const id = idProp ?? `gd-field-${auto}`;
  const note = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const shared = {
    id,
    className: 'gd-field-input',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': note,
  };
  return (
    <div className={cx('gd-field', className)} data-state={error ? 'error' : undefined}>
      <label className="gd-field-label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} {...shared} />
      ) : (
        <input {...(rest as InputHTMLAttributes<HTMLInputElement>)} {...shared} />
      )}
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
