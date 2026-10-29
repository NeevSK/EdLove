import { type KeyboardEvent, useRef } from 'react';
import type { WorldPickerContract } from '../../../theme/contracts';
import type { WorldId, WorldLanguage, WorldMode } from '../../../theme/types';
import { WorldScope, worldName } from '../../../theme/web';
import { WORLD_IDS, WORLDS } from '../../../theme/worlds';

export interface WorldPickerProps extends WorldPickerContract {
  /** The page's current mode, so each choice is drawn as it will look. */
  mode: WorldMode;
  lang?: WorldLanguage;
}

/**
 * Choose the world that dresses the app. Each choice is drawn in its own world,
 * so people see the paper, ink and light they are choosing. A radio group:
 * arrow keys move the choice, as they do for any set of radios.
 */
export function WorldPicker({ value, onChange, label, mode, lang = 'en' }: WorldPickerProps) {
  const refs = useRef<Partial<Record<WorldId, HTMLButtonElement | null>>>({});

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = WORLD_IDS[(WORLD_IDS.indexOf(value) + step + WORLD_IDS.length) % WORLD_IDS.length];
    if (!next) return;
    onChange(next);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className="gd-picker" onKeyDown={onKeyDown}>
      {WORLD_IDS.map((id) => {
        const selected = id === value;
        return (
          <WorldScope key={id} world={id} mode={mode}>
            <button
              ref={(el) => {
                refs.current[id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-description={WORLDS[id].description}
              tabIndex={selected ? 0 : -1}
              className="gd-picker-choice"
              onClick={() => onChange(id)}
            >
              <span className="gd-picker-lamp" aria-hidden="true" />
              <span className="gd-picker-name gd-text" data-kind="title">
                {worldName(id, lang)}
              </span>
              {selected ? <span className="gd-picker-mark" aria-hidden="true" /> : null}
            </button>
          </WorldScope>
        );
      })}
    </div>
  );
}
