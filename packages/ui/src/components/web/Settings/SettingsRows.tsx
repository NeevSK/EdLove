'use client';

import { useState } from 'react';
import type {
  ChoiceRowContract,
  DangerRowContract,
  LinkRowContract,
} from '../../../theme/contracts';
import { SETTINGS_ENGLISH, safeLinkUrl } from '../../shared/basics';
import { Button } from '../Button/Button';
import { cx } from '../cx';
import { Dialog } from '../Dialog/Dialog';
import { RadioGroup } from '../Radio/RadioGroup';
import { Row } from '../Row/Row';
import { Sheet } from '../Sheet/Sheet';

export interface ChoiceRowProps<V extends string = string> extends ChoiceRowContract<V> {
  className?: string;
}

/** A setting with one chosen value; pressing opens the choices, choosing closes them. */
export function ChoiceRow<V extends string = string>({
  label,
  value,
  options,
  onChange,
  note,
  placeholder = SETTINGS_ENGLISH.notSet,
  className,
}: ChoiceRowProps<V>) {
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.value === value);
  return (
    <>
      <Row
        label={label}
        detail={chosen?.label ?? placeholder}
        note={note}
        onPress={() => setOpen(true)}
        className={className}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <RadioGroup
          label={label}
          value={value}
          options={options}
          onChange={(next) => {
            setOpen(false);
            onChange(next);
          }}
        />
      </Sheet>
    </>
  );
}

export interface LinkRowProps extends LinkRowContract {
  className?: string;
}

/**
 * A row that is a real link. Outside the app opens a new tab without handing
 * it this page (`noopener`), is said in words and drawn with ↗; an address
 * the kit will not open becomes a plain row.
 */
export function LinkRow({
  label,
  detail,
  note,
  href,
  onPress,
  external,
  labels,
  className,
}: LinkRowProps) {
  const l = { ...SETTINGS_ENGLISH, ...labels };
  const safe = href ? safeLinkUrl(href) : null;
  if (safe && !onPress) {
    return (
      <a
        href={safe}
        className={cx('gd-row', 'gd-link-row', className)}
        data-pressable=""
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <span className="gd-row-line">
          <span className="gd-row-label">{label}</span>
          <span className="gd-row-detail">
            {detail ? <span>{detail}</span> : null}
            <span className="gd-row-chevron" aria-hidden="true">
              {external ? '↗' : '›'}
            </span>
            {external ? <span className="gd-sr">, {l.opensOutside}</span> : null}
          </span>
        </span>
        {note ? <span className="gd-row-note">{note}</span> : null}
      </a>
    );
  }
  return <Row label={label} detail={detail} note={note} onPress={onPress} className={className} />;
}

export interface DangerRowProps extends DangerRowContract {
  className?: string;
}

/** A row that ends or deletes something, asking first in a dialog when `confirm` is given. */
export function DangerRow({
  label,
  note,
  onConfirm,
  confirm,
  busy,
  labels,
  className,
}: DangerRowProps) {
  const l = { ...SETTINGS_ENGLISH, ...labels };
  const [asking, setAsking] = useState(false);
  return (
    <>
      <Row
        label={label}
        tone="danger"
        note={busy ? l.working : note}
        chevron={false}
        onPress={busy ? undefined : () => (confirm ? setAsking(true) : onConfirm())}
        className={className}
      />
      {confirm ? (
        <Dialog
          open={asking}
          onClose={() => setAsking(false)}
          title={confirm.title}
          description={confirm.description}
          actions={
            <>
              <Button
                variant="quiet"
                label={confirm.cancelLabel ?? l.cancel}
                onClick={() => setAsking(false)}
              />
              <Button
                variant="danger"
                label={confirm.confirmLabel}
                onClick={() => {
                  setAsking(false);
                  onConfirm();
                }}
              />
            </>
          }
        />
      ) : null}
    </>
  );
}
