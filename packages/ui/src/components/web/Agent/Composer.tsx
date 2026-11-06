'use client';

import { useId } from 'react';
import type { ComposerContract } from '../../../theme/contracts';
import { AGENT_ENGLISH, remainingNote } from '../../shared/agent';
import { Button } from '../Button/Button';
import { FileCard } from '../Media/FileCard';

export type ComposerProps = ComposerContract;

/**
 * Where the person writes: a form, so Enter in a single line or the Send
 * button submit it (Shift+Enter makes a new line). Send becomes Stop while a
 * reply streams; attached files wait above; characters left show near the limit.
 */
export function Composer({
  value,
  onChange,
  onSend,
  label,
  placeholder,
  busy = false,
  onStop,
  attachments,
  onAttach,
  onRemoveAttachment,
  maxLength,
  disabled = false,
  labels,
}: ComposerProps) {
  const l = { ...AGENT_ENGLISH, ...labels };
  const countId = useId();
  const left = remainingNote(value.length, maxLength);
  const over = left !== null && left < 0;
  const empty = value.trim() === '' && (attachments?.length ?? 0) === 0;
  const canSend = !disabled && !empty && !over && !busy;
  return (
    <form
      className="gd-composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSend();
      }}
    >
      {attachments && attachments.length > 0 ? (
        <ul className="gd-composer-tray" aria-label={l.attach}>
          {attachments.map((file) => (
            <li key={file.uri}>
              <FileCard
                file={file}
                onRemove={onRemoveAttachment ? () => onRemoveAttachment(file) : undefined}
              />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="gd-composer-row">
        {onAttach ? (
          <Button
            label={l.attach}
            variant="quiet"
            size="sm"
            onClick={onAttach}
            disabled={disabled}
          />
        ) : null}
        <textarea
          className="gd-field-input gd-composer-input"
          aria-label={label}
          aria-describedby={left !== null ? countId : undefined}
          placeholder={placeholder}
          value={value}
          rows={1}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
        />
        {busy ? (
          <Button
            label={l.stop}
            variant="secondary"
            size="sm"
            onClick={onStop}
            disabled={!onStop}
          />
        ) : (
          <Button label={l.send} size="sm" type="submit" disabled={!canSend} />
        )}
      </div>
      {left !== null ? (
        <p
          id={countId}
          className="gd-composer-count"
          aria-live="polite"
          data-over={over ? '' : undefined}
        >
          {l.charactersLeft(left)}
        </p>
      ) : null}
    </form>
  );
}
