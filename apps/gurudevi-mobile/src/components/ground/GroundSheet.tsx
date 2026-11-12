/**
 * Change the room's ground on the phone: the world's live sky, a still sky, one
 * of the world's photos, or the world's plain paper. Every change then asks the
 * one question Neev set: every room, or just this room? A room with its own look
 * can go back to the world's. All choices stay inside the world (its photos, its
 * paper, its readability limit), and verger can still pause photos on this phone.
 */
import {
  followWorldGround,
  groundModePatch,
  wallpaperPatch,
  writeGround,
} from '@repo/core/logic/workspace/ground';
import {
  GROUND_NOTE_TEXT,
  GROUND_OPTIONS,
  type GroundPlan,
} from '@repo/core/logic/workspace/groundPlan';
import { getBackdropsForWorld, photoUrlFor } from '@repo/core/logic/workspace/worldBackdrops';
import type { WorkspaceAppearance } from '@repo/core/types';
import { Button, Group, Row, Sheet, Stack, Text } from '@repo/ui/components/native';
import { useWorld } from '@repo/ui/theme/native';
import { GURUDEVI_APP } from '@repo/ui/utils/urls';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { useRoomGround } from './useRoomGround';
import { worldGroundDefaults } from './useRoomGround';

type RoomGround = ReturnType<typeof useRoomGround>;

export interface GroundSheetProps {
  open: boolean;
  onClose: () => void;
  roomName: string;
  ground: RoomGround;
}

export function GroundSheet({ open, onClose, roomName, ground }: GroundSheetProps) {
  const current = ground.current;
  const world = useWorld();
  const photos = getBackdropsForWorld(world.id);
  const [pending, setPending] = useState<Partial<WorkspaceAppearance> | null>(null);
  const plan: GroundPlan = ground.plan;
  const asked = current.groundMode ?? (current.wallpaper ? 'image' : 'live');

  const apply = (scope: 'world' | 'room') => {
    if (!pending) return;
    const write = writeGround(current, pending, scope);
    if (write.world) ground.worldLook.setAppearance(write.world);
    if (write.room) ground.roomLook.setAppearance(write.room);
    setPending(null);
  };

  const close = () => {
    setPending(null);
    onClose();
  };

  return (
    <Sheet open={open} onClose={close} title={`Ground for ${roomName}`}>
      <ScrollView style={styles.body}>
        <Stack gap="group">
          <Text kind="caption" tone="soft">
            {ground.source === 'room'
              ? `${roomName} has its own look.`
              : `${roomName} follows your world's look, like every room.`}
          </Text>

          <Group label="Ground">
            {GROUND_OPTIONS.ground.map((o) => (
              <Row
                key={o.id}
                label={o.label}
                detail={o.hint}
                accessory={asked === o.id ? <Text kind="label">Now</Text> : undefined}
                onPress={() => setPending(groundModePatch(current, o.id, photos))}
              />
            ))}
          </Group>

          {photos.length ? (
            <Stack gap="inside">
              <Text kind="label" accessibilityRole="header">
                {"Your world's photos"}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photos}>
                  {photos.map((p) => (
                    <Pressable
                      key={p.publicId}
                      accessibilityRole="button"
                      accessibilityLabel={`Use the photo ${p.name ?? ''}`}
                      onPress={() => setPending(wallpaperPatch(current, p))}
                      style={[
                        styles.photo,
                        current.wallpaper?.publicId === p.publicId && asked === 'image'
                          ? { borderColor: world.tokens.lamp }
                          : { borderColor: 'transparent' },
                      ]}
                    >
                      <Image
                        source={{ uri: photoUrlFor(p, GURUDEVI_APP) }}
                        style={styles.thumb}
                        contentFit="cover"
                        cachePolicy="disk"
                      />
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </Stack>
          ) : null}

          {plan.notes.map((n) => (
            <Text key={n} kind="caption" tone="soft">
              {GROUND_NOTE_TEXT[n]}
            </Text>
          ))}

          {pending ? (
            <Stack gap="inside">
              <Text kind="label">Change every room, or just {roomName}?</Text>
              <Button label="Every room" onPress={() => apply('world')} />
              <Button label={`Just ${roomName}`} variant="secondary" onPress={() => apply('room')} />
              <Button label="Cancel" variant="quiet" onPress={() => setPending(null)} />
            </Stack>
          ) : null}

          {ground.source === 'room' && !pending ? (
            <Button
              label="Use the world's look here"
              variant="quiet"
              onPress={() =>
                ground.roomLook.setAppearance(
                  followWorldGround(
                    ground.roomLook.layout?.appearance,
                    worldGroundDefaults(world.id),
                  ),
                )
              }
            />
          ) : null}
        </Stack>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { flexShrink: 1 },
  photos: { flexDirection: 'row', gap: 10, paddingRight: 16 },
  photo: { borderWidth: 2, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: 112, height: 72 },
});
