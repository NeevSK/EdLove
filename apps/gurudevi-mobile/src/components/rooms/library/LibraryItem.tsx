/** One resource: what it is, its subjects, and a way to open it. */
import { useShelf } from '@repo/library/port';
import { Badge, Button, EmptyState, Surface, Text, WaitingSign } from '@repo/ui/components/native';
import { useLocalSearchParams } from 'expo-router';
import { Linking, View } from 'react-native';
import { RoomPage } from '@/components/shell/RoomPage';

export function LibraryItem() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const shelf = useShelf();
  const item = shelf.data?.find((i) => i.id === id);

  if (shelf.isPending) {
    return (
      <RoomPage title="Library">
        <WaitingSign size={32} />
      </RoomPage>
    );
  }
  if (!item) {
    return (
      <RoomPage title="Library">
        <EmptyState
          title="This item is not on the shelf"
          message="It may have moved, or not reached this phone yet."
        />
      </RoomPage>
    );
  }
  const url = item.url;
  return (
    <RoomPage
      title={item.title}
      mark={item.official ? { label: 'Official', tone: 'lamp' } : undefined}
    >
      <Surface tone="raised" style={{ padding: 20, gap: 12 }}>
        <Text kind="body">{item.summary}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Badge label={item.kind} />
          {item.subjects.map((s) => (
            <Badge key={s} label={s} />
          ))}
          {item.language ? <Badge label={item.language} /> : null}
          {item.verified ? <Badge label="Checked" tone="success" /> : null}
        </View>
      </Surface>
      {url ? (
        <Button label="Open" onPress={() => void Linking.openURL(url)} />
      ) : (
        <Text kind="caption" tone="soft">
          This one has no file to open yet.
        </Text>
      )}
    </RoomPage>
  );
}
