/**
 * The Community room's front floor: what is new, talk, groups, and the
 * school's notices, placed by the floor engine and filled from the community
 * port. Group chat waits for realtime on the new server, and says so.
 */
import { communityPort, useSquare } from '@repo/community/port';
import type { FloorNode } from '@repo/core/logic/floor';
import { roomPlanOf } from '@repo/core/logic/floor';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Rail,
  Row,
  Stack,
  WaitingSign,
} from '@repo/ui/components/native';
import { StyleSheet, View } from 'react-native';
import { RoomFloor } from '../RoomFloor';
import { SampleNote } from '../SampleNote';
import { useRoomBond } from '../useRoomBond';
import { NoticeCard, openCommunity, openGroup, PostCard } from './parts';

const FRONT_POSTS = 3;
const FRONT_NOTICES = 2;

export function CommunityRoom() {
  const bond = useRoomBond();
  const plan = roomPlanOf('community', bond.capacity);
  const square = useSquare();

  if (!plan) {
    return null;
  }
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

  const piece = (p: FloorNode) => {
    switch (p.id) {
      case 'feed':
        return posts.length ? (
          <Stack gap="between">
            {posts.slice(0, FRONT_POSTS).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {posts.length > FRONT_POSTS ? (
              <Button
                variant="quiet"
                size="sm"
                label={`See all ${posts.length} posts`}
                onPress={() => openCommunity('/community/feed')}
              />
            ) : null}
          </Stack>
        ) : (
          <EmptyState title="Quiet for now" message="New posts from your groups land here." />
        );
      case 'chats':
        return <Row label={p.label} detail="Opens when chat comes to the new server" />;
      case 'direct':
        return (
          <Row
            label={p.label}
            detail={unread ? `${unread} unread` : `${conversations.length} conversations`}
            signal={unread > 0}
            signalLabel={unread ? `${unread} unread` : undefined}
            chevron
            onPress={() => openCommunity('/community/messages')}
          />
        );
      case 'my-groups':
        return joined.length ? (
          <Rail
            label={p.label}
            items={joined}
            keyOf={(g) => g.id}
            renderItem={(g) => (
              <Card
                title={g.name}
                meta={`${g.members} members`}
                size="sm"
                onPress={() => openGroup(g.id)}
              />
            )}
            seeAll={{ label: 'See all', onPress: () => openCommunity('/community/groups') }}
          />
        ) : (
          <Row label="You have not joined a group yet" />
        );
      case 'explore':
        return (
          <Card
            title={p.label}
            meta={`${groups.filter((g) => !g.joined).length} groups you could join`}
            onPress={() => openCommunity('/community/groups')}
          />
        );
      case 'announcements':
        return notices.length ? (
          <Stack gap="between">
            {notices.slice(0, FRONT_NOTICES).map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
            {notices.length > FRONT_NOTICES ? (
              <Button
                variant="quiet"
                size="sm"
                label={`See all ${notices.length} notices`}
                onPress={() => openCommunity('/community/notices')}
              />
            ) : null}
          </Stack>
        ) : (
          <Row label="No notices from your school" />
        );
      case 'forest':
        return <Card title={p.label} meta="The school forest comes in a later pass." disabled />;
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
      lead={communityPort.get().source === 'sample' ? <SampleNote what="posts and groups" /> : null}
    />
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
