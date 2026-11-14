import { Text as RNText, TextInput, View } from 'react-native';
import type { RichTextEditorContract } from '../../../theme/contracts';
import { edgeStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { useMediaAdapters } from './adapters';

export type RichTextEditorProps = RichTextEditorContract;

/**
 * Rich text in, Markdown out. The nearest `MediaAdapters` edits it; with none,
 * a plain multiline field takes Markdown as typed, so writing never stops.
 */
export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: RichTextEditorProps) {
  const { world, language } = useWorldContext();
  const f = world.recipes.field;
  const { richText: Adapter } = useMediaAdapters();
  return (
    <View style={{ gap: gapFor('inside') }}>
      <RNText style={typeStyle(f.label, language, world)}>{label}</RNText>
      <View
        style={[
          { backgroundColor: f.fill ?? world.tokens.raised, padding: 12 },
          radiusStyle(f.radius),
          edgeStyle(f.states.rest.edge),
        ]}
      >
        {Adapter ? (
          <Adapter
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            editable={!disabled}
            accessibilityLabel={label}
          />
        ) : (
          <TextInput
            accessibilityLabel={label}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={f.placeholder.color}
            editable={!disabled}
            multiline
            style={[
              typeStyle(f.value, language, world),
              { minHeight: 120, textAlignVertical: 'top' },
            ]}
          />
        )}
      </View>
    </View>
  );
}
