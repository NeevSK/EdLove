/**
 * The Library's front floor. The engine places the pieces (reading now,
 * shelves, finding, making, the school's shelf); each piece here draws the
 * port's records with the world's kit. Pieces whose desk is not built yet say
 * so instead of leading nowhere.
 */
import type { FloorNode } from '@repo/core/logic/floor';
import { roomPlanOf } from '@repo/core/logic/floor';
import {
  libraryPort,
  type ShelfItem,
  subjectsOf,
  useShelf,
  useShelfCollections,
} from '@repo/library/port';
import {
  Card,
  Chip,
  Chips,
  EmptyState,
  ErrorState,
  Rail,
  Row,
  WaitingSign,
} from '@repo/ui/components/native';
import { router } from 'expo-router';
import { View } from 'react-native';
import { RoomFloor } from '../RoomFloor';
import { SampleNote } from '../SampleNote';
import { useRoomBond } from '../useRoomBond';

const MAX_RAIL = 8;

export const openShelf = (params: Record<string, string> = {}) =>
  router.push({ pathname: '/library/shelf', params });
export const openItem = (id: string) =>
  router.push({ pathname: '/library/item/[id]', params: { id } });

export function itemMeta(it: ShelfItem): string {
  return [it.kind, it.subjects[0], it.official ? 'Official' : undefined]
    .filter(Boolean)
    .join(' · ');
}

export function LibraryRoom() {
  const bond = useRoomBond();
  const plan = roomPlanOf('library', bond.capacity);
  const shelf = useShelf();
  const collections = useShelfCollections();

  if (!plan) {
    return null;
  }
  if (shelf.isPending) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <WaitingSign size={48} />
      </View>
    );
  }
  if (shelf.isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <ErrorState
          title="The shelves did not open"
          message="Nothing was changed. Try again in a moment."
          retry={{ label: 'Try again', onPress: () => void shelf.refetch() }}
        />
      </View>
    );
  }

  const items = shelf.data ?? [];
  const cols = collections.data ?? [];
  const official = items.filter((i) => i.official);
  const first = items[0];

  const piece = (p: FloorNode) => {
    switch (p.id) {
      case 'continue':
        return first ? (
          <Card
            title={first.title}
            meta={first.summary}
            shape="wide"
            accessibilityLabel={`Open ${first.title}`}
            onPress={() => openItem(first.id)}
          />
        ) : (
          <EmptyState title="Nothing open yet" message="Pick something from a shelf to start." />
        );
      case 'new':
        return (
          <Rail
            label={p.label}
            items={items.slice(0, MAX_RAIL)}
            keyOf={(i) => i.id}
            size="md"
            renderItem={(i) => (
              <Card title={i.title} meta={itemMeta(i)} size="sm" onPress={() => openItem(i.id)} />
            )}
            seeAll={
              items.length > MAX_RAIL
                ? { label: `See all ${items.length}`, onPress: () => openShelf() }
                : undefined
            }
          />
        );
      case 'collections':
        return cols.length ? (
          <Rail
            label={p.label}
            items={cols}
            keyOf={(c) => c.id}
            renderItem={(c) => (
              <Card
                title={c.name}
                meta={`${c.itemIds.length} items${c.official ? ' · Official' : ''}`}
                size="sm"
                onPress={() => openShelf({ collection: c.id })}
              />
            )}
          />
        ) : null;
      case 'subjects':
        return (
          <Chips label={p.label}>
            {subjectsOf(items).map((s) => (
              <Chip key={s} label={s} onPress={() => openShelf({ subject: s })} />
            ))}
          </Chips>
        );
      case 'search':
        return <Row label={p.label} chevron onPress={() => openShelf({ search: '1' })} />;
      case 'map':
        return <Card title={p.label} meta="The map comes in a later pass." disabled />;
      case 'contribute':
        return <Row label={p.label} detail="Opens with library.resources" chevron={false} />;
      case 'review':
        return <Row label={p.label} detail="Nothing waiting" chevron={false} />;
      case 'school-shelf':
        return official.length ? (
          <Rail
            label={p.label}
            items={official.slice(0, MAX_RAIL)}
            keyOf={(i) => i.id}
            renderItem={(i) => (
              <Card title={i.title} meta={itemMeta(i)} size="sm" onPress={() => openItem(i.id)} />
            )}
            seeAll={{ label: 'See all', onPress: () => openShelf({ official: '1' }) }}
          />
        ) : null;
      default:
        return <Card title={p.label} />;
    }
  };

  return (
    <RoomFloor
      plan={plan}
      userId={bond.userId}
      perspectiveId={bond.perspectiveId}
      renderPiece={piece}
      onSeeAll={() => openShelf()}
      lead={libraryPort.get().source === 'sample' ? <SampleNote what="books and guides" /> : null}
    />
  );
}
