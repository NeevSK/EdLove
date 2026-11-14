import { Checkbox, Surface, SwipeRow, Text } from '@repo/ui/components/native';
import { StyleSheet, View } from 'react-native';

export interface TodoRowLabels {
  done: string;
  undo: string;
  delete: string;
}

const ENGLISH: TodoRowLabels = { done: 'Done', undo: 'Undo', delete: 'Delete' };

export interface SwipeableTodoRowProps {
  id: string;
  title: string;
  notes?: string | null;
  isCompleted: boolean;
  onToggle: (id: string, currentCompleted: boolean) => void;
  onDelete: (id: string) => void;
  /** Translated action words; English until the caller passes them. */
  labels?: TodoRowLabels;
}

/** One to-do: swipe right to finish (or undo), left to delete, or use its checkbox. */
export function SwipeableTodoRow({
  id,
  title,
  notes,
  isCompleted,
  onToggle,
  onDelete,
  labels = ENGLISH,
}: SwipeableTodoRowProps) {
  return (
    <SwipeRow
      label={title}
      start={{
        label: isCompleted ? labels.undo : labels.done,
        tone: isCompleted ? 'lamp' : 'success',
        onAction: () => onToggle(id, isCompleted),
      }}
      end={{ label: labels.delete, tone: 'danger', onAction: () => onDelete(id) }}
    >
      <Surface tone="raised" style={styles.row}>
        <Checkbox label={title} checked={isCompleted} onChange={() => onToggle(id, isCompleted)} />
        {notes ? (
          <View style={styles.notes}>
            <Text kind="caption" tone="soft" numberOfLines={1}>
              {notes}
            </Text>
          </View>
        ) : null}
      </Surface>
    </SwipeRow>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 4 },
  notes: { paddingLeft: 34, paddingBottom: 8 },
});
