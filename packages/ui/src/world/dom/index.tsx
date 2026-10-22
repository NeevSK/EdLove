/**
 * @repo/ui/world/dom — the same generic components for the web, as plain DOM.
 *
 *   import { Button, Row, Section, Text, WorldStyles } from '@repo/ui/world/dom';
 *
 * Every look-related value comes from CSS variables that `WorldStyles` puts in
 * the document head (see `../css.ts`), built from the same recipes the native
 * components read. Switching worlds is an attribute on <html>; there is no
 * runtime styling cost and nothing to hydrate.
 *
 * The props match `@repo/ui/world/native` so a screen reads the same on both.
 */

import {
  type ButtonHTMLAttributes,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useId,
} from 'react';
import { worldStylesheet } from '../css';
import type {
  ButtonSize,
  ButtonVariant,
  SectionDensity,
  SurfaceTone,
  TextRole,
  TextTone,
  WorldId,
  WorldMode,
  WorldPhase,
} from '../types';
import { WORLDS } from '../worlds';

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Inline every world's variables and component rules. Render once, in <head>. */
export function WorldStyles({ nonce }: { nonce?: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: generated from typed world data, no user input.
  return (
    <style id="gd-worlds" nonce={nonce} dangerouslySetInnerHTML={{ __html: worldStylesheet() }} />
  );
}

export interface WorldScopeProps extends HTMLAttributes<HTMLDivElement> {
  world: WorldId;
  mode: WorldMode;
  phase?: WorldPhase;
  children: ReactNode;
}

/** Render a subtree in another world (previews, the world picker). */
export function WorldScope({ world, mode, phase, className, children, ...rest }: WorldScopeProps) {
  return (
    <div
      {...rest}
      className={cx('gd-world', 'gd-page', className)}
      data-world={world}
      data-mode={mode}
      data-phase={phase}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- Text

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'label';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  kind?: TextRole;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
  /** The element to render. Defaults to `h1` for display, `p` otherwise. */
  as?: TextElement;
  ref?: Ref<HTMLElement>;
}

export function Text({
  kind = 'body',
  tone,
  align,
  as,
  className,
  style,
  ref,
  ...rest
}: TextProps) {
  const Tag = (as ?? (kind === 'display' ? 'h1' : 'p')) as 'p';
  return (
    <Tag
      ref={ref as Ref<HTMLParagraphElement>}
      {...rest}
      className={cx('gd-text', className)}
      data-kind={kind}
      data-tone={tone}
      style={align ? { textAlign: align, ...style } : style}
    />
  );
}

// ---------------------------------------------------------------- Button

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<{ size?: number; color?: string; 'aria-hidden'?: boolean }>;
  loading?: boolean;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={cx('gd-button', className)}
      data-variant={variant}
      data-size={size}
      data-full={fullWidth || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {Icon && !loading ? <Icon size={18} aria-hidden /> : null}
      {loading ? <span className="gd-button-pulse" aria-hidden="true" /> : null}
      <span>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------- Surface

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  ref?: Ref<HTMLDivElement>;
}

export function Surface({ tone = 'raised', className, ref, ...rest }: SurfaceProps) {
  return <div ref={ref} {...rest} className={cx('gd-surface', className)} data-tone={tone} />;
}

// ---------------------------------------------------------------- TextField

interface FieldBase {
  label: string;
  hint?: string;
  error?: string;
}

export type TextFieldProps = FieldBase &
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
  } = props as FieldBase & {
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

// ---------------------------------------------------------------- Chip

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  selected?: boolean;
  kind?: 'button' | 'radio' | 'checkbox';
  lang?: 'en' | 'si' | 'ta';
  ref?: Ref<HTMLButtonElement>;
}

export function Chip({
  label,
  selected = false,
  kind = 'button',
  className,
  ref,
  ...rest
}: ChipProps) {
  const state =
    kind === 'button' ? { 'aria-pressed': selected } : { role: kind, 'aria-checked': selected };
  return (
    <button ref={ref} type="button" {...rest} {...state} className={cx('gd-chip', className)}>
      {label}
    </button>
  );
}

export interface ChipsProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  single?: boolean;
}

export function Chips({ label, single = false, className, ...rest }: ChipsProps) {
  return (
    <div
      {...rest}
      role={single ? 'radiogroup' : 'group'}
      aria-label={label}
      className={cx('gd-chips', className)}
    />
  );
}

// ---------------------------------------------------------------- Row

export interface RowProps {
  label: string;
  detail?: string;
  note?: string;
  accessory?: ReactNode;
  onPress?: () => void;
  /** Link rows render as <a>. */
  href?: string;
  signal?: boolean;
  signalLabel?: string;
  chevron?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Row({
  label,
  detail,
  note,
  accessory,
  onPress,
  href,
  signal = false,
  signalLabel,
  chevron,
  className,
  style,
}: RowProps) {
  const pressable = !!onPress || !!href;
  const showChevron = chevron ?? (pressable && !accessory);
  const body = (
    <>
      <span className="gd-row-line">
        <span className="gd-row-label">{label}</span>
        {accessory ??
          (detail || showChevron || signal ? (
            <span className="gd-row-detail">
              {signal ? <span className="gd-row-signal" aria-hidden="true" /> : null}
              {detail ? <span>{detail}</span> : null}
              {signal && signalLabel ? <span className="gd-sr">{signalLabel}</span> : null}
              {showChevron ? (
                <span className="gd-row-chevron" aria-hidden="true">
                  ›
                </span>
              ) : null}
            </span>
          ) : null)}
      </span>
      {note ? <span className="gd-row-note">{note}</span> : null}
    </>
  );
  const common = {
    className: cx('gd-row', className),
    style,
    'data-signal': signal || undefined,
  };
  if (href) {
    return (
      <a href={href} {...common} data-pressable="">
        {body}
      </a>
    );
  }
  if (onPress) {
    return (
      <button type="button" onClick={onPress} {...common} data-pressable="">
        {body}
      </button>
    );
  }
  return <div {...common}>{body}</div>;
}

// ---------------------------------------------------------------- Section

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  voice?: string;
  density?: SectionDensity;
  signal?: boolean;
  /** Heading level for the title. */
  level?: 2 | 3 | 4;
  children: ReactNode;
}

/**
 * Holds a group of rows. Which boundary (margin, thread, leaves, light, box)
 * is decided per world by the stylesheet; the markup is the same everywhere.
 */
export function Section({
  title,
  voice,
  density = 'dense',
  signal = false,
  level = 2,
  className,
  children,
  ...rest
}: SectionProps) {
  const H = `h${level}` as 'h2';
  const auto = useId();
  const headingId = `gd-section-${auto}`;
  return (
    <section
      {...rest}
      aria-labelledby={headingId}
      className={cx('gd-section', className)}
      data-density={density}
      data-signal={signal || undefined}
    >
      <H id={headingId} className="gd-section-title">
        {title}
      </H>
      <div className="gd-section-body">
        {voice ? <p className="gd-section-voice">{voice}</p> : null}
        {children}
      </div>
    </section>
  );
}

/** Display names of the worlds, for pickers. */
export function worldName(id: WorldId, lang: 'en' | 'si' | 'ta' = 'en'): string {
  return WORLDS[id].names[lang];
}
