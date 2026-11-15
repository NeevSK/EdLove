/**
 * Companions: your own pets and friends, living on your world's floor. There is no list of
 * allowed animals: give it a name, say what it is in your own words, add a photo if you like,
 * pick its tone and how it likes to be. Keep as many as you want; one comes out at a time.
 */

import {
  Button,
  ChoiceRow,
  DangerRow,
  Group,
  Row,
  SegmentedControl,
  Surface,
  Text,
  TextField,
} from '@repo/ui/components/native';
import {
  addCompanion,
  type Companion,
  type CompanionTone,
  type CompanionWay,
  letOut,
  removeCompanion,
  updateCompanion,
  useCompanions,
} from '@repo/ui/context/Companions';
import { clearestOn } from '@repo/ui/theme';
import { useWorld } from '@repo/ui/theme/native';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { PageFrame } from '@/components/shell/PageFrame';

const TONES: readonly { value: CompanionTone; label: string }[] = [
  { value: 'lamp', label: 'Lamp' },
  { value: 'glow', label: 'Glow' },
  { value: 'ornament', label: 'Leaf' },
  { value: 'ink', label: 'Ink' },
];

const WAYS: readonly { value: CompanionWay; label: string; hint: string }[] = [
  { value: 'rest', label: 'Resting', hint: 'Sits on the ground and breathes slowly' },
  { value: 'wander', label: 'Wandering', hint: 'Strolls along the ground' },
  { value: 'perch', label: 'Perching', hint: 'Sits up high and sways' },
];

/** Keep a picked photo inside the app, so it outlives the picker's temporary copy. */
function keepPhoto(uri: string): string {
  try {
    const dir = new Directory(Paths.document, 'companions');
    if (!dir.exists) dir.create();
    const target = new File(dir, `${Date.now().toString(36)}.jpg`);
    new File(uri).copy(target);
    return target.uri;
  } catch {
    return uri;
  }
}

async function pickPhoto(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  return asset ? keepPhoto(asset.uri) : undefined;
}

function Face({
  companion,
  size = 44,
}: {
  companion: Pick<Companion, 'name' | 'photo' | 'tone'>;
  size?: number;
}) {
  const t = useWorld().tokens;
  return (
    <View
      style={[
        styles.face,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: t[companion.tone] },
      ]}
    >
      {companion.photo ? (
        <Image source={{ uri: companion.photo }} style={{ width: size, height: size }} />
      ) : (
        <Text
          kind="title"
          style={{ color: clearestOn(t[companion.tone], [t.onLamp, t.ink, t.ground]) }}
        >
          {(companion.name || '?').slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

function NewCompanion({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [tone, setTone] = useState<CompanionTone>('lamp');
  const [way, setWay] = useState<CompanionWay>('rest');
  const ready = name.trim().length > 0 && kind.trim().length > 0;
  return (
    <Surface tone="raised" style={{ gap: 16, padding: 18 }}>
      <View style={styles.row}>
        <Pressable
          role="button"
          accessibilityLabel={photo ? 'Change photo' : 'Add a photo'}
          onPress={async () => setPhoto((await pickPhoto()) ?? photo)}
        >
          <Face companion={{ name, photo, tone }} size={64} />
        </Pressable>
        <Text kind="caption" tone="soft" style={{ flex: 1 }}>
          Tap the circle to add a photo. Without one, the first letter of the name shows.
        </Text>
      </View>
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Kiri"
        maxLength={40}
      />
      <TextField
        label="What is it?"
        hint="In your own words: a cat, our parrot, a tortoise, a little dragon."
        value={kind}
        onChangeText={setKind}
        maxLength={60}
      />
      <SegmentedControl label="Tone" value={tone} options={TONES} onChange={setTone} />
      <SegmentedControl label="How it likes to be" value={way} options={WAYS} onChange={setWay} />
      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" onPress={onDone} />
        <Button
          label="Bring to my world"
          variant="primary"
          disabled={!ready}
          onPress={() => {
            addCompanion({ name, kind, photo, tone, way });
            onDone();
          }}
        />
      </View>
    </Surface>
  );
}

export function CompanionsScreen() {
  const { companions, out } = useCompanions();
  const [adding, setAdding] = useState(companions.length === 0);
  return (
    <PageFrame title="Companions" eyebrow="You">
      <Text kind="body" tone="soft">
        Your own pets and friends, living on your world's floor. One comes out at a time, on each
        room's front screen.
      </Text>

      {companions.length > 0 ? (
        <Group label="Out on the floor">
          <ChoiceRow
            label="Who is out"
            value={out ?? 'none'}
            options={[
              ...companions.map((c) => ({ value: c.id, label: c.name })),
              { value: 'none', label: 'Nobody for now' },
            ]}
            onChange={(v) => letOut(v === 'none' ? null : v)}
          />
        </Group>
      ) : null}

      {companions.map((c) => (
        <Group key={c.id} label={c.name}>
          <View style={[styles.row, { paddingVertical: 8 }]}>
            <Pressable
              role="button"
              accessibilityLabel={`Change ${c.name}'s photo`}
              onPress={async () => {
                const photo = await pickPhoto();
                if (photo) updateCompanion(c.id, { photo });
              }}
            >
              <Face companion={c} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text kind="label">{c.name}</Text>
              <Text kind="caption" tone="soft">
                {c.kind}
              </Text>
            </View>
          </View>
          <ChoiceRow
            label="How it likes to be"
            value={c.way}
            options={WAYS}
            onChange={(way) => updateCompanion(c.id, { way })}
          />
          <ChoiceRow
            label="Tone"
            value={c.tone}
            options={TONES}
            onChange={(tone) => updateCompanion(c.id, { tone })}
          />
          {out !== c.id ? <Row label={`Let ${c.name} out`} onPress={() => letOut(c.id)} /> : null}
          <DangerRow
            label={`Say goodbye to ${c.name}`}
            confirm={{
              title: `Remove ${c.name}?`,
              description: 'Their name and photo leave this phone.',
              confirmLabel: 'Remove',
            }}
            onConfirm={() => removeCompanion(c.id)}
          />
        </Group>
      ))}

      {adding ? (
        <NewCompanion onDone={() => setAdding(false)} />
      ) : (
        <Button label="Add a companion" variant="primary" onPress={() => setAdding(true)} />
      )}
    </PageFrame>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
