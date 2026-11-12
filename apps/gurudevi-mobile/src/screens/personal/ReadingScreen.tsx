/**
 * Reading and comfort: how the app is set for this person, from a young learner to an older
 * teacher. Presets set words and controls together in one tap; below them, control size, a
 * simpler look, contrast and the keypad's hand can each be tuned.
 *
 * Reading: how every word in the app is set for this person. Size, weight, letter spacing and line
 * spacing apply at once to the kit's text, in the world's own faces, and a sample shows the
 * result. Fonts: what is on the phone, and whether new ones may download on mobile data.
 */

import {
  Button,
  Group,
  Row,
  SegmentedControl,
  Slider,
  Surface,
  SwitchRow,
  Text,
  useShellLayout,
} from '@repo/ui/components/native';
import { updateComfort, useComfort } from '@repo/ui/context/ComfortPreferences';
import { resetReading, updateReading, useReading } from '@repo/ui/context/ReadingPreferences';
import { worldName } from '@repo/ui/theme';
import { useWorld } from '@repo/ui/theme/native';
import { View } from 'react-native';
import { useFontsOnMobileData } from '@/boot/fontDownloads';
import { ComfortPresets } from '@/components/comfort/ComfortPresets';
import { PageFrame } from '@/components/shell/PageFrame';

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function ReadingScreen() {
  const reading = useReading();
  const world = useWorld();
  const [onMobileData, setOnMobileData] = useFontsOnMobileData();
  const comfort = useComfort();
  const shell = useShellLayout();

  return (
    <PageFrame title="Reading and comfort" eyebrow="You">
      <Group
        label="How you like to see things"
        footer="Sets words and controls together. Everything below can still be tuned."
      >
        <View style={{ paddingVertical: 8 }}>
          <ComfortPresets columns={shell.width >= 600 ? 2 : 1} />
        </View>
      </Group>

      <Group label="Comfort">
        <View style={{ gap: 14, paddingVertical: 8 }}>
          <SegmentedControl
            label="Buttons and spacing"
            value={comfort.size}
            onChange={(size) => updateComfort({ size })}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'standard', label: 'Standard' },
              { value: 'large', label: 'Large' },
            ]}
          />
          <SegmentedControl
            label="Your world behind screens: how much of the ground shows"
            value={comfort.ground}
            onChange={(ground) => updateComfort({ ground })}
            options={[
              { value: 'lively', label: 'Lively' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'calm', label: 'Calm' },
            ]}
          />
          <SegmentedControl
            label="Your main hand: the action button and the keypad sit on its side"
            value={comfort.hand}
            onChange={(hand) => updateComfort({ hand })}
            options={[
              { value: 'left', label: 'Left hand' },
              { value: 'right', label: 'Right hand' },
            ]}
          />
        </View>
        <SwitchRow
          label="Simpler look"
          hint="Plain surfaces, no ornaments, clear edges and a still floor"
          value={comfort.simple}
          onChange={(simple) => updateComfort({ simple })}
        />
        <SwitchRow
          label="Always more contrast"
          hint="Stronger words and edges, even if the phone's own setting is off"
          value={comfort.contrast === 'more'}
          onChange={(on) => updateComfort({ contrast: on ? 'more' : 'system' })}
        />
        <SwitchRow
          label="Bright sunlight"
          hint="Outdoors: the strongest words on a plain light ground. Also one tap away in You"
          value={comfort.sunlight}
          onChange={(sunlight) => updateComfort({ sunlight })}
        />
      </Group>
      <Surface tone="raised" style={{ gap: 10, padding: 18 }}>
        <Text kind="label">Sample, in {worldName(world.id)}</Text>
        <Text kind="title">Good morning. Today's lesson is ready.</Text>
        <Text kind="body">
          Every word in the app follows these settings, in your world's own type. සුබ උදෑසනක්. காலை
          வணக்கம்.
        </Text>
        <Text kind="caption">Captions and small notes change too.</Text>
      </Surface>

      <Group label="Text">
        <View style={{ gap: 18, paddingVertical: 6 }}>
          <Slider
            label="Size"
            value={reading.scale}
            min={0.85}
            max={1.5}
            step={0.05}
            valueText={pct}
            onChange={(scale) => updateReading({ scale })}
          />
          <Slider
            label="Weight"
            value={reading.weight}
            min={-100}
            max={150}
            step={25}
            valueText={(v) =>
              v === 0 ? 'As designed' : v > 0 ? `Heavier by ${v}` : `Lighter by ${-v}`
            }
            onChange={(weight) => updateReading({ weight })}
          />
          <Slider
            label="Letter spacing"
            value={reading.tracking}
            min={0}
            max={0.08}
            step={0.01}
            valueText={(v) => (v === 0 ? 'As designed' : `Wider by ${Math.round(v * 100)}`)}
            onChange={(tracking) => updateReading({ tracking })}
          />
          <Slider
            label="Line spacing"
            value={reading.lines}
            min={1}
            max={1.5}
            step={0.05}
            valueText={pct}
            onChange={(lines) => updateReading({ lines })}
          />
        </View>
      </Group>
      <Button label="Back to the world's own reading" variant="quiet" onPress={resetReading} />

      <Group label="Fonts">
        <Row
          label="On this phone"
          detail="Every world"
          note="All twelve worlds' faces, in English, Sinhala and Tamil, came with the app."
        />
        <SwitchRow
          label="Download new fonts on mobile data"
          hint="New faces for future worlds download on Wi-Fi; allow this to use mobile data too."
          value={onMobileData}
          onChange={setOnMobileData}
        />
      </Group>
    </PageFrame>
  );
}
