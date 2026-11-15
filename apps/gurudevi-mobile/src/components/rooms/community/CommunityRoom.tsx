/**
 * The Community room's one main screen. Feed, Groups and Messages are its
 * three main tabs; the chosen one is on the floor (Feed first), the same as on
 * the web. Each tab shows its catalog features, placed by the floor engine and
 * filled from the community port. Group chat waits for realtime on the new
 * server, and says so.
 */
import { communityPort, useSquare } from '@repo/community/port';
import type { FloorNode } from '@repo/core/logic/floor';
import { roomCatalogOf } from '@repo/core/logic/floor';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Group,
  Row,
  SegmentedControl,
  Stack,
  WaitingSign,
} from '@repo/ui/components/native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { APP_CATALOG } from '@/boot/registerAppCatalog';
import { RoomFront } from '../RoomFront';
import { SampleNote } from '../SampleNote';
import { useRoomBond } from '../useRoomBond';
import { NoticeCard, openGroup, PostCard, when } from './parts';

type CommunityTab = 'feed' | 'groups' | 'messages';

/** Which main tab each Community feature sits under (anything else: Feed). */
const TAB_OF: Readonly<Record<string, CommunityTab>> = {
  hearth: 'feed',
  'community-notices': 'feed',
  circles: 'groups',
  'community-explore': 'groups',
  messages: 'messages',
};

const TABS = [
  { value: 'feed', label: 'Feed' },
  { value: 'groups', label: 'Groups' },
  { value: 'messages', label: 'Messages' },
] as const;

export function CommunityRoom() {
  const bond = useRoomBond();
  const [tab, setTab] = useState<CommunityTab>('feed');
  const roomCatalog = useMemo(
    () => roomCatalogOf(APP_CATALOG, 'community', bond.capacity, 'mobile'),
    [bond.capacity],
  );
  // The chosen tab's features, on the same floor.
  const catalog = useMemo(() => {
    const features = roomCatalog.features.filter((f) => (TAB_OF[f.id] ?? 'feed') === tab);
    const used = new Set(features.map((f) => f.floor?.group));
    return { ...roomCatalog, features, groups: roomCatalog.groups.filter((g) => used.has(g.id)) };
  }, [roomCatalog, tab]);
  const square = useSquare();

  if (square.isPending) {
    return (
      <View style={styles.centre}>
        <WaitingSign size={48} />
      </View>
    );
  }
  if (square.isError) {
    return (
      <View style={styles.centre}>
        <ErrorState
          title="The square did not open"
          message="Nothing was changed. Try again in a moment."
          retry={{ label: 'Try again', onPress: () => square.refetch() }}
        />
      </View>
    );
  }

  const { posts, groups, notices, conversations } = square.data;
  const joined = groups.filter((g) => g.joined);
  const unread = conversations.reduce((n, c) => n + c.unread, 0);

  const groupRow = (g: (typeof groups)[number]) => (
    <Row
      key={g.id}
      label={g.name}
      detail={`${g.members} members${g.open ? '' : ' · By invite'}`}
      note={g.summary}
      chevron
      onPress={() => openGroup(g.id)}
    />
  );

  const piece = (p: FloorNode) => {
    switch (p.id) {
      case 'hearth':
        return posts.length ? (
          <Stack gap="between">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Stack>
        ) : (
          <EmptyState title="Quiet for now" message="New posts from your groups land here." />
        );
      case 'messages':
        return conversations.length ? (
          <Group
            label={p.label}
            footer="Reading only for now. Replying opens when chat comes to the new server."
          >
            {conversations.map((c) => (
              <Row
                key={c.id}
                label={c.with}
                detail={[c.role, when(c.at)].filter(Boolean).join(' · ')}
                note={c.last}
                signal={c.unread > 0}
                signalLabel={c.unread ? `${c.unread} unread` : undefined}
                accessory={c.unread ? <Badge label={String(c.unread)} tone="lamp" /> : undefined}
              />
            ))}
          </Group>
        ) : (
          <EmptyState title="No messages" message="Conversations will show here." />
        );
      case 'circles':
        return joined.length ? (
          <Group label={p.label}>{joined.map(groupRow)}</Group>
        ) : (
          <Row label="You have not joined a group yet" />
        );
      case 'community-explore': {
        const others = groups.filter((g) => !g.joined);
        return others.length ? (
          <Group label={p.label} footer="Joining opens when groups come to the new server.">
            {others.map(groupRow)}
          </Group>
        ) : (
          <Row label="No other groups to join yet" />
        );
      }
      case 'community-notices':
        return notices.length ? (
          <Stack gap="between">
            {notices.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </Stack>
        ) : (
          <Row label="No notices from your school" />
        );
      default:
        return <Card title={p.label} />;
    }
  };

  return (
    <RoomFront
      catalog={catalog}
      userId={bond.userId}
      perspectiveId={bond.perspectiveId}
      renderPiece={piece}
      lead={
        <Stack gap="inside">
          <SegmentedControl
            label={`Community: ${unread ? `${unread} unread messages` : 'choose what to see'}`}
            value={tab}
            onChange={setTab}
            options={TABS}
          />
          {communityPort.get().source === 'sample' ? <SampleNote what="posts and groups" /> : null}
        </Stack>
      }
    />
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
