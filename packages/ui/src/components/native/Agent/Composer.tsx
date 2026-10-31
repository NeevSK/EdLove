import { Text as RNText, StyleSheet, TextInput, View } from 'react-native';
import type { ComposerContract } from '../../../theme/contracts';
import { edgeStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { AGENT_ENGLISH, remainingNote } from '../../shared/agent';
import { Button } from '../Button/Button';
import { FileCard } from '../Media/FileCard';

export type ComposerProps = ComposerContract;

/**
 * Where the person writes. Send becomes Stop while a reply streams; attached
 * files wait in a tray above the field; the characters left show near the
 * limit and sending past it is not possible.
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
  const { world, language } = useWorldContext();
  const l = { ...AGENT_ENGLISH, ...labels };
  const f = world.recipes.field;
  const left = remainingNote(value.length, maxLength);
  const over = left !== null && left < 0;
  const empty = value.trim() === '' && (attachments?.length ?? 0) === 0;
  return (
    <View style={{ gap: gapFor('inside'), padding: 12 }}>
      {attachments && attachments.length > 0 ? (
        <View role="list" aria-label={l.attach} style={{ gap: gapFor('inside') }}>
          {attachments.map((file) => (
            <View key={file.uri} role="listitem">
              <FileCard
                file={file}
                onRemove={onRemoveAttachment ? () => onRemoveAttachment(file) : undefined}
              />
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.row}>
        {onAttach ? (
          <Button
            label={l.attach}
            variant="quiet"
            size="sm"
            onPress={onAttach}
            disabled={disabled}
          />
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholder={placeholder}
          placeholderTextColor={f.placeholder.color}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          multiline
          style={[
            typeStyle(f.value, language, world),
            styles.input,
            {
              backgroundColor: f.fill ?? world.tokens.raised,
              paddingHorizontal: Math.max(12, f.paddingX),
            },
            radiusStyle(f.radius),
            edgeStyle(f.states.rest.edge),
          ]}
        />
        {busy ? (
          <Button
            label={l.stop}
            variant="secondary"
            size="sm"
            onPress={onStop}
            disabled={!onStop}
          />
        ) : (
          <Button label={l.send} size="sm" onPress={onSend} disabled={disabled || empty || over} />
        )}
      </View>
      {left !== null ? (
        <RNText
          accessibilityLiveRegion="polite"
          style={[
            typeStyle(world.recipes.text.caption, language, world),
            over ? { color: world.recipes.question.result.wrong } : null,
          ]}
        >
          {l.charactersLeft(left)}
        </RNText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, minHeight: 44, maxHeight: 160, paddingVertical: 10, textAlignVertical: 'top' },
});
