'use client';

import { useId } from 'react';
import type { SwitchRowContract } from '../../../theme/contracts';

export type SwitchRowProps = SwitchRowContract;

/** A settings row that is itself the switch: the whole row toggles, one named control. */
export function SwitchRow({ label, hint, value, onChange, disabled }: SwitchRowProps) {
  const hintId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-labelledby={`${hintId}-label`}
      aria-describedby={hint ? hintId : undefined}
      disabled={disabled}
      className="gd-switch-row"
      onClick={() => onChange(!value)}
    >
      <span className="gd-switch-row-words">
        <span id={`${hintId}-label`} className="gd-row-label">
          {label}
        </span>
        {hint ? (
          <span id={hintId} className="gd-row-note">
            {hint}
          </span>
        ) : null}
      </span>
      <span className="gd-switch-row-track" aria-hidden>
        <span className="gd-switch-row-thumb" />
      </span>
    </button>
  );
}
