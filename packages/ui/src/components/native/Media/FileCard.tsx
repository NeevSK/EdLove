import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import type { FileCardContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { extensionOf, FILE_CARD_ENGLISH, fileKindOf, formatBytes } from '../../shared/files';
import { Button } from '../Button/Button';
import { Progress } from '../Status/Status';
import { surfaceStyle } from '../Surface/Surface';

export { FILE_CARD_ENGLISH };

export type FileCardProps = FileCardContract;

/**
 * A file as a held thing: its type mark, name and size. Pressable when it can
 * be opened; shows progress, an announced error with retry, and remove.
 */
export function FileCard({
  file,
  onOpen,
  progress,
  error,
  onRetry,
  onRemove,
  labels,
}: FileCardProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...FILE_CARD_ENGLISH, ...labels };
  const kind = fileKindOf(file);
  const t = world.tokens;
  const raised = world.recipes.surface.raised;
  const mark = (extensionOf(file.name) || l.kinds[kind]).slice(0, 4).toUpperCase();
  const meta = [l.kinds[kind], file.size === undefined ? null : formatBytes(file.size, language)]
    .filter(Boolean)
    .join(' · ');
  const percent = progress === undefined ? null : Math.round(progress * 100);

  const summary = (
    <View style={styles.row}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.mark,
          radiusStyle(world.recipes.toggle.radius),
          { backgroundColor: t.sunken },
        ]}
      >
        <RNText
          style={[typeStyle(world.recipes.text.label, language, world), { color: t.inkSoft }]}
        >
          {mark}
        </RNText>
      </View>
      <View style={styles.words}>
        <RNText
          numberOfLines={1}
          ellipsizeMode="middle"
          style={typeStyle(world.recipes.row.label, language, world)}
        >
          {file.name}
        </RNText>
        <RNText style={typeStyle(world.recipes.row.detail, language, world)}>{meta}</RNText>
      </View>
    </View>
  );

  return (
    <View style={[surfaceStyle(raised, true), { padding: 12, gap: gapFor('inside') }]}>
      {onOpen ? (
        <Pressable
          role="button"
          accessibilityLabel={file.name}
          accessibilityHint={meta}
          onPress={() => {
            feedback('press');
            onOpen();
          }}
        >
          {summary}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={`${file.name}, ${meta}`}>
          {summary}
        </View>
      )}
      {percent !== null && !error ? (
        <Progress value={progress} label={l.progress(percent)} />
      ) : null}
      {error ? (
        <RNText
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={typeStyle(world.recipes.field.error, language, world)}
        >
          {error}
        </RNText>
      ) : null}
      {(error && onRetry) || onRemove ? (
        <View style={styles.actions}>
          {error && onRetry ? (
            <Button label={l.retry} variant="secondary" size="sm" onPress={onRetry} />
          ) : null}
          {onRemove ? (
            <Button label={l.remove} variant="quiet" size="sm" onPress={onRemove} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  words: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
});
