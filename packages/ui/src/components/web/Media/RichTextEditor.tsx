import { useId } from 'react';
import type { RichTextEditorContract } from '../../../theme/contracts';
import { useMediaAdapters } from './adapters';

export type RichTextEditorProps = RichTextEditorContract;

/**
 * Rich text in, Markdown out. The nearest `MediaAdapters` edits it; with none
 * (no web editor chosen yet), a plain field takes Markdown as typed.
 */
export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: RichTextEditorProps) {
  const id = useId();
  const { richText: Adapter } = useMediaAdapters();
  return (
    <div className="gd-field">
      <label htmlFor={id} className="gd-field-label">
        {label}
      </label>
      {Adapter ? (
        <Adapter
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          editable={!disabled}
          accessibilityLabel={label}
        />
      ) : (
        <textarea
          id={id}
          className="gd-field-input gd-rich-fallback"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          rows={6}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
