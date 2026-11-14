/**
 * The whole shelf as a list: search by words, narrow by subject, or show one
 * collection or only official items. Reached from the Library floor's pieces.
 */
import { searchShelf, subjectsOf, useShelf, useShelfCollections } from '@repo/library/port';
import {
  Chip,
  Chips,
  EmptyState,
  Group,
  Row,
  TextField,
  WaitingSign,
} from '@repo/ui/components/native';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { RoomPage } from '@/components/shell/RoomPage';
import { itemMeta, openItem } from './LibraryRoom';

export function LibraryShelf() {
  const params = useLocalSearchParams<{
    subject?: string;
    collection?: string;
    official?: string;
    search?: string;
  }>();
  const shelf = useShelf();
  const collections = useShelfCollections();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<string | undefined>(params.subject);

  const collection = collections.data?.find((c) => c.id === params.collection);
  const scoped = useMemo(() => {
    let base = shelf.data ?? [];
    if (collection) {
      base = base.filter((i) => collection.itemIds.includes(i.id));
    }
    if (params.official === '1') {
      base = base.filter((i) => i.official);
    }
    return base;
  }, [shelf.data, collection, params.official]);
  const shown = useMemo(
    () => searchShelf(scoped, query).filter((i) => !subject || i.subjects.includes(subject)),
    [scoped, query, subject],
  );

  const title = collection?.name ?? (params.official === '1' ? 'School shelf' : 'All shelves');

  return (
    <RoomPage title={title} intro={collection?.summary}>
      <TextField
        label="Search the library"
        value={query}
        onChangeText={setQuery}
        autoFocus={params.search === '1'}
        returnKeyType="search"
        autoCorrect={false}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chips label="Subject" single>
          {subjectsOf(scoped).map((s) => (
            <Chip
              key={s}
              kind="radio"
              label={s}
              selected={subject === s}
              onPress={() => setSubject(subject === s ? undefined : s)}
            />
          ))}
        </Chips>
      </ScrollView>
      {shelf.isPending ? (
        <WaitingSign size={32} />
      ) : shown.length === 0 ? (
        <EmptyState
          title="Nothing matches"
          message="Try fewer words, or another subject."
          action={
            query || subject
              ? {
                  label: 'Clear',
                  onPress: () => {
                    setQuery('');
                    setSubject(undefined);
                  },
                }
              : undefined
          }
        />
      ) : (
        <Group label={`${shown.length} ${shown.length === 1 ? 'item' : 'items'}`}>
          {shown.map((i) => (
            <Row
              key={i.id}
              label={i.title}
              detail={itemMeta(i)}
              note={i.summary}
              chevron
              onPress={() => openItem(i.id)}
            />
          ))}
        </Group>
      )}
    </RoomPage>
  );
}
