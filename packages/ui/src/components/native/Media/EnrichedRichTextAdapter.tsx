import { EnrichedMarkdownTextInput } from 'react-native-enriched-markdown';
import type { RichTextAdapterProps } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';

/**
 * Default rich text adapter on native: Software Mansion's
 * EnrichedMarkdownTextInput (installed with the kit). It edits in place and
 * reports Markdown; it starts from `value` and is not reset by it afterwards.
 */
export function EnrichedRichTextAdapter({
  value,
  onChange,
  placeholder,
  editable,
  accessibilityLabel,
}: RichTextAdapterProps) {
  const { world, language } = useWorldContext();
  const f = world.recipes.field;
  return (
    <EnrichedMarkdownTextInput
      defaultValue={value}
      onChangeMarkdown={onChange}
      placeholder={placeholder}
      editable={editable}
      accessibilityLabel={accessibilityLabel}
      style={{ ...typeStyle(f.value, language, world), minHeight: 120 }}
    />
  );
}
