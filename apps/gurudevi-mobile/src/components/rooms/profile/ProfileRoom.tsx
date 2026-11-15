/**
 * The Profile room: who you are across every bond. Your name and your places
 * are real (identity already answers on the new server); the story around them
 * (bio, badges, streaks) comes from the profile port, sample until the journey
 * modules open. Switching place and joining with a code use the shell's own
 * sheets, so there is one of each.
 */
import { usePerspectiveSwitch } from '@repo/core/logic';
import type { FloorNode } from '@repo/core/logic/floor';
import { roomCatalogOf } from '@repo/core/logic/floor';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { profilePort, useProfileStory } from '@repo/profile/port';
import { Avatar, Badge, Card, Group, Rail, Row, Surface, Text } from '@repo/ui/components/native';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { APP_CATALOG } from '@/boot/registerAppCatalog';
import { useShellRequests } from '@/components/shell/shellRequests';
import { RoomFront } from '../RoomFront';
import { SampleNote } from '../SampleNote';
import { useRoomBond } from '../useRoomBond';

const KIND: Record<string, string> = {
  personal: 'Just you',
  institutional: 'School',
  commercial: 'Classes',
  guardian: 'Family',
  community: 'Community',
};

export function ProfileRoom() {
  const bond = useRoomBond();
  const catalog = useMemo(
    () => roomCatalogOf(APP_CATALOG, 'profile', bond.capacity, 'mobile'),
    [bond.capacity],
  );
  const user = useAuthStore((s) => s.user);
  const { activePerspective, availablePerspectives, switchPerspective } = usePerspectiveSwitch();
  const story = useProfileStory(bond.capacity).data;
  const ask = useShellRequests((s) => s.ask);

  const name = user?.display_name || user?.email || 'You';

  const piece = (p: FloorNode) => {
    switch (p.id) {
      case 'profile-card':
        return (
          <Surface tone="raised" style={styles.card}>
            <View style={styles.who}>
              <Avatar name={name} src={user?.avatar_url ?? undefined} size="lg" />
              <View style={styles.grow}>
                <Text kind="title">{name}</Text>
                {story?.title ? (
                  <Text kind="body" tone="soft">
                    {story.title}
                  </Text>
                ) : null}
              </View>
            </View>
            {story?.bio ? <Text kind="body">{story.bio}</Text> : null}
            {story?.subjects.length ? (
              <View style={styles.badges}>
                {story.subjects.map((s) => (
                  <Badge key={s} label={s} />
                ))}
              </View>
            ) : null}
          </Surface>
        );
      case 'profile-bonds':
        return (
          <Group label={p.label}>
            {availablePerspectives.map((x) => {
              const here = x.id === activePerspective.id;
              return (
                <Row
                  key={x.id}
                  label={x.displayName}
                  detail={here ? 'Here now' : KIND[x.kind]}
                  accessory={here ? <Badge label="Here" tone="lamp" /> : undefined}
                  chevron={!here}
                  onPress={here ? undefined : () => void switchPerspective(x.id)}
                />
              );
            })}
            <Row label="See every place" chevron onPress={() => ask('perspectives')} />
          </Group>
        );
      case 'profile-invite':
        return <Row label={p.label} chevron onPress={() => ask('invite')} />;
      case 'profile-achievements':
        return story?.badges.length ? (
          <Rail
            label={p.label}
            items={story.badges}
            keyOf={(b) => b.id}
            size="sm"
            renderItem={(b) => <Card title={`${b.sign} ${b.label}`} meta={b.about} size="sm" />}
          />
        ) : (
          <Row label="No badges yet" />
        );
      case 'profile-record':
        return (
          <Card
            title={p.label}
            meta={
              story
                ? `${story.streakDays} days steady · ${story.journals} journals · ${story.circles} circles`
                : 'Your record opens with the journey modules.'
            }
          />
        );
      case 'profile-security':
        return (
          <Row
            label={p.label}
            detail="Recovery and sign-in"
            chevron
            onPress={() => router.push('/account-recovery')}
          />
        );
      case 'profile-privacy':
        return <Row label={p.label} detail="Opens with consent on the new server" />;
      case 'profile-settings':
        return <Row label={p.label} chevron onPress={() => router.push('/settings')} />;
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
        profilePort.get().source === 'sample' && story?.sample ? (
          <SampleNote what="badges and story" />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 12 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  grow: { flex: 1, minWidth: 0 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
