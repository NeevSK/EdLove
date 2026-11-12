/** The Community room's inner pages: the whole feed, notices, groups, one group, messages. */
import { useSquare } from '@repo/community/port';
import {
  Badge,
  EmptyState,
  Group,
  Row,
  Stack,
  Text,
  WaitingSign,
} from '@repo/ui/components/native';
import { useLocalSearchParams } from 'expo-router';
import { RoomPage } from '@/components/shell/RoomPage';
import { NoticeCard, openGroup, PostCard, when } from './parts';

function Waiting({ title }: { title: string }) {
  return (
    <RoomPage title={title}>
      <WaitingSign size={32} />
    </RoomPage>
  );
}

export function CommunityFeed() {
  const { data } = useSquare();
  if (!data) {
    return <Waiting title="Feed" />;
  }
  return (
    <RoomPage title="Feed" intro="Posts from your school and your groups, newest first.">
      <Stack gap="between">
        {data.posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </Stack>
    </RoomPage>
  );
}

export function CommunityNotices() {
  const { data } = useSquare();
  if (!data) {
    return <Waiting title="Notices" />;
  }
  return (
    <RoomPage title="Notices" intro="From your school. Pinned ones stay on top.">
      {data.notices.length ? (
        <Stack gap="between">
          {data.notices.map((n) => (
            <NoticeCard key={n.id} notice={n} />
          ))}
        </Stack>
      ) : (
        <EmptyState title="No notices" message="Your school has not posted any yet." />
      )}
    </RoomPage>
  );
}

export function CommunityGroups() {
  const { data } = useSquare();
  if (!data) {
    return <Waiting title="Groups" />;
  }
  const joined = data.groups.filter((g) => g.joined);
  const others = data.groups.filter((g) => !g.joined);
  const row = (g: (typeof data.groups)[number]) => (
    <Row
      key={g.id}
      label={g.name}
      detail={`${g.members} members${g.open ? '' : ' · By invite'}`}
      note={g.summary}
      chevron
      onPress={() => openGroup(g.id)}
    />
  );
  return (
    <RoomPage title="Groups">
      {joined.length ? <Group label="Yours">{joined.map(row)}</Group> : null}
      {others.length ? (
        <Group label="You could join" footer="Joining opens when groups come to the new server.">
          {others.map(row)}
        </Group>
      ) : null}
    </RoomPage>
  );
}

export function CommunityGroup() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useSquare();
  if (!data) {
    return <Waiting title="Group" />;
  }
  const group = data.groups.find((g) => g.id === id);
  if (!group) {
    return (
      <RoomPage title="Group">
        <EmptyState title="This group is not here" message="It may have closed or moved." />
      </RoomPage>
    );
  }
  const posts = data.posts.filter((p) => p.group === group.name);
  return (
    <RoomPage
      title={group.name}
      intro={group.summary}
      mark={group.joined ? { label: 'Joined', tone: 'success' } : undefined}
    >
      <Text kind="caption" tone="soft">{`${group.members} members`}</Text>
      {posts.length ? (
        <Stack gap="between">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </Stack>
      ) : (
        <EmptyState title="No posts yet" message="Posts in this group will show here." />
      )}
    </RoomPage>
  );
}

export function CommunityMessages() {
  const { data } = useSquare();
  if (!data) {
    return <Waiting title="Messages" />;
  }
  return (
    <RoomPage
      title="Messages"
      intro="Reading only for now. Replying opens when chat comes to the new server."
    >
      {data.conversations.length ? (
        <Group>
          {data.conversations.map((c) => (
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
      )}
    </RoomPage>
  );
}
