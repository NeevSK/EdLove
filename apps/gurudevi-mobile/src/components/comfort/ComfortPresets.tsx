/**
 * The comfort presets as big, tappable previews: each card is drawn in the preset's own look
 * (control size, simpler look, contrast) inside the person's world, with its words at the
 * preset's size, so an older teacher sees "this one is easier to read" instead of reading a
 * description of it. One tap sets text and controls together.
 */

import { Badge, Button, Surface, Text } from '@repo/ui/components/native';
import {
  applyComfortPreset,
  COMFORT_PRESETS,
  type ComfortPresetId,
  matchingPreset,
  useComfort,
} from '@repo/ui/context/ComfortPreferences';
import { useReading } from '@repo/ui/context/ReadingPreferences';
import { useFeedback, useWorld, WorldScope } from '@repo/ui/theme/native';
import { Pressable, View } from 'react-native';

export function ComfortPresets({
  onChoose,
  columns = 1,
}: {
  /** Called after a preset is applied (onboarding moves on). */
  onChoose?: (id: ComfortPresetId) => void;
  /** Two columns on a wide screen. */
  columns?: 1 | 2;
}) {
  const world = useWorld();
  const comfort = useComfort();
  const reading = useReading();
  const chosen = matchingPreset(comfort, reading);
  const feedback = useFeedback();

  return (
    <View
      role="radiogroup"
      aria-label="How you like to see things"
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
    >
      {COMFORT_PRESETS.map((p) => {
        const selected = chosen === p.id;
        return (
          <Pressable
            key={p.id}
            role="radio"
            aria-checked={selected}
            accessibilityLabel={`${p.label}. ${p.hint}`}
            onPress={() => {
              feedback('select');
              applyComfortPreset(p.id);
              onChoose?.(p.id);
            }}
            style={{ width: columns === 2 ? '48.5%' : '100%' }}
          >
            <WorldScope
              world={world.id}
              access={{
                size: p.comfort.size,
                simple: p.comfort.simple,
                ...(p.comfort.contrast === 'more' ? { contrast: 'more' as const } : null),
              }}
            >
              <Surface
                tone={selected ? 'raised' : 'inset'}
                style={{
                  padding: 16,
                  gap: 8,
                  borderWidth: selected ? 2 : 0,
                  borderColor: selected ? world.tokens.lamp : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    kind="label"
                    style={{ flexShrink: 1, fontSize: 16 * (p.reading.scale / reading.scale) }}
                  >
                    {p.label}
                  </Text>
                  {selected ? <Badge label="Chosen" tone="lamp" /> : null}
                </View>
                <Text
                  kind="caption"
                  tone="soft"
                  style={{ fontSize: 13 * (p.reading.scale / reading.scale) }}
                >
                  {p.hint}
                </Text>
                {/* A real control in the preset's size, so the difference is felt, not described. */}
                <View pointerEvents="none" accessibilityElementsHidden>
                  <Button label="Today's lesson" size="sm" variant="secondary" onPress={() => {}} />
                </View>
              </Surface>
            </WorldScope>
          </Pressable>
        );
      })}
    </View>
  );
}
