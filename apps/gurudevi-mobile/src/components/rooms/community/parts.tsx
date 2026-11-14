/** Small pieces the Community room and its pages share. */
import type { SquareNotice, SquarePost } from '@repo/community/port';
import { Surface, Text } from '@repo/ui/components/native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export const openCommunity = (
  pathname: '/community/feed' | '/community/notices' | '/community/groups' | '/community/messages',
) => router.push(pathname);
export const openGroup = (id: string) =>
  router.push({ pathname: '/community/group/[id]', params: { id } });

/** "3 Nov" for older days, the time for today. */
export function when(at: string, now = new Date()): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return '';
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function PostCard({ post }: { post: SquarePost }) {
  const counts = [
    post.reactions ? `${post.reactions} ${post.reactions === 1 ? 'like' : 'likes'}` : '',
    post.comments ? `${post.comments} ${post.comments === 1 ? 'reply' : 'replies'}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <Surface tone="raised" style={styles.card}>
      <View style={styles.head}>
        <Text kind="label" style={styles.grow}>
          {post.author}
        </Text>
        <Text kind="caption" tone="faint">
          {when(post.at)}
        </Text>
      </View>
      {post.group ? (
        <Text kind="caption" tone="soft">
          {`in ${post.group}`}
        </Text>
      ) : null}
      <Text kind="body" numberOfLines={6}>
        {post.body}
      </Text>
      {counts ? (
        <Text kind="caption" tone="soft">
          {counts}
        </Text>
      ) : null}
    </Surface>
  );
}

export function NoticeCard({ notice }: { notice: SquareNotice }) {
  return (
    <Surface tone="raised" style={styles.card}>
      <View style={styles.head}>
        <Text kind="label" style={styles.grow}>
          {notice.pinned ? 'Pinned notice' : (notice.author ?? 'School notice')}
        </Text>
        <Text kind="caption" tone="faint">
          {when(notice.at)}
        </Text>
      </View>
      <Text kind="body">{notice.body}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
});
