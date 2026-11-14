import { usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useWisdom } from '@repo/self/wisdom';
import { EmptyState, Surface, Text, WaitingSign } from '@repo/ui/components/native';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { RoomPage } from '@/components/shell/RoomPage';

export default function WisdomDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { context } = usePermissions();
  const userId = useAuthStore((state) => state.user?.id) ?? context?.userId;
  const { notes, isLoading } = useWisdom(userId ?? undefined);

  const note = useMemo(() => notes.find((entry) => entry.id === id), [notes, id]);

  return (
    <RoomPage title="Wisdom" intro={id ? `Seed ${id}` : 'Wisdom seed'}>
      {isLoading ? (
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 24 }}>
          <WaitingSign size={32} />
          <Text kind="body" tone="soft">
            Settling your wisdom note…
          </Text>
        </View>
      ) : note ? (
        <Surface tone="raised" style={{ padding: 20, gap: 14 }}>
          <Text kind="body">{note.insight}</Text>
          <Text kind="caption" tone="soft">
            {new Date(note.created_at).toLocaleString()}
          </Text>
        </Surface>
      ) : (
        <EmptyState
          title="Wisdom note not found"
          message="It may have been removed, or not synced to this phone yet."
        />
      )}
    </RoomPage>
  );
}
