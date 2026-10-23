import { Pressable, Text as RNText, View } from 'react-native';
import { hapticImpact } from '../../utils/haptics';
import type { Radius, WorldId } from '../types';
import { WORLD_IDS, WORLDS } from '../worlds';
import { radiusStyle, typeStyle } from './style';
import { useWorldContext, WorldScope } from './WorldContext';

export interface WorldPickerProps {
  value: WorldId;
  onChange: (world: WorldId) => void;
  /** Accessible name of the group, already translated (e.g. "World"). */
  label: string;
}

/**
 * Choose the world that dresses the app. Each choice is drawn *in its own
 * world* at the current hour, so people see the paper, ink and light they are
 * choosing rather than a name and a swatch.
 */
export function WorldPicker({ value, onChange, label }: WorldPickerProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ gap: 8, paddingVertical: 6 }}
    >
      {WORLD_IDS.map((id) => (
        <WorldScope key={id} world={id}>
          <WorldChoice
            id={id}
            selected={id === value}
            onPress={() => {
              hapticImpact('light');
              onChange(id);
            }}
          />
        </WorldScope>
      ))}
    </View>
  );
}

function WorldChoice({
  id,
  selected,
  onPress,
}: {
  id: WorldId;
  selected: boolean;
  onPress: () => void;
}) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const r = world.recipes;
  const name = WORLDS[id].names[language];

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={name}
      accessibilityHint={WORLDS[id].description}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 56,
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: t.ground,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? t.focus : t.line,
          opacity: pressed ? 0.85 : 1,
        },
        radiusStyle(14),
      ]}
    >
      {/* The world's one lit thing, in its own control shape. */}
      <View
        style={[
          { width: 26, height: 18, backgroundColor: t.lamp },
          radiusStyle(capRadius(r.button.radius, 9)),
        ]}
      />
      <View style={{ flex: 1, gap: 1 }}>
        <RNText style={[typeStyle(r.text.title, language), { fontSize: 17, lineHeight: 22 }]}>
          {name}
        </RNText>
        <View
          style={{
            height: 1,
            width: 44,
            backgroundColor: r.ornament.color,
            opacity: 0.7,
            marginTop: 3,
          }}
        />
      </View>
      {selected ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.lamp }}
        />
      ) : null}
    </Pressable>
  );
}

/** The control's corner shape, scaled down to fit a small swatch. */
function capRadius(r: Radius, max: number): Radius {
  if (typeof r === 'number') return Math.min(max, r);
  return [Math.min(max, r[0]), Math.min(max, r[1]), Math.min(max, r[2]), Math.min(max, r[3])];
}
