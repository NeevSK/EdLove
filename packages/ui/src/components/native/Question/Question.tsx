import { useEffect, useRef } from 'react';
import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { alpha } from '../../../theme/color';
import type {
  AnswerMark,
  ChoiceQuestionContract,
  PrivacyNoteContract,
  ScaleContract,
} from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle } from '../../../theme/native/motion';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import {
  ANSWER_ENGLISH,
  isAllRight,
  markOf,
  PRIVACY_ENGLISH,
  scalePoints,
  toggleChoice,
} from '../../shared/questions';
import { ChipPaint, chipFrame } from '../Chip/Chip';
import { Surface } from '../Surface/Surface';

export type ScaleProps = ScaleContract;

/**
 * A rating or agreement scale: one point from 3 to 11, its ends named. Each
 * point says its number and, where given, its words.
 */
export function Scale({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  ends,
  pointLabels,
  disabled,
}: ScaleProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const chip = world.recipes.chip;
  const points = scalePoints(min, max);
  const wordsFor = (i: number) =>
    pointLabels?.[i] ?? (i === 0 ? ends?.low : i === points.length - 1 ? ends?.high : undefined);
  return (
    <View style={{ gap: gapFor('inside') }}>
      <RNText style={typeStyle(world.recipes.field.label, language, world)}>{label}</RNText>
      <View
        role="radiogroup"
        aria-label={label}
        style={[styles.points, { gap: gapFor('inside', 'compact') }]}
      >
        {points.map((n, i) => {
          const on = value === n;
          const words = wordsFor(i);
          return (
            <Pressable
              key={n}
              role="radio"
              aria-checked={on}
              aria-disabled={disabled}
              accessibilityLabel={words ? `${n}, ${words}` : String(n)}
              disabled={disabled}
              onPress={() => {
                feedback('select');
                onChange(n);
              }}
              style={[chipFrame(chip, on ? chip.selected : chip.rest), styles.point]}
            >
              <ChipPaint recipe={chip} selected={on} />
              <RNText
                style={[
                  typeStyle(chip.label, language, world),
                  { color: (on ? chip.selected : chip.rest).ink, textAlign: 'center' },
                ]}
              >
                {n}
              </RNText>
            </Pressable>
          );
        })}
      </View>
      {ends ? (
        <View
          style={styles.ends}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <RNText style={typeStyle(world.recipes.text.caption, language, world)}>{ends.low}</RNText>
          <RNText style={typeStyle(world.recipes.text.caption, language, world)}>
            {ends.high}
          </RNText>
        </View>
      ) : null}
    </View>
  );
}

interface AnswerOptionProps {
  label: string;
  hint?: string;
  chosen: boolean;
  multiple: boolean;
  mark: AnswerMark;
  markWord?: string;
  locked: boolean;
  onPress: () => void;
}

function AnswerOption({
  label,
  hint,
  chosen,
  multiple,
  mark,
  markWord,
  locked,
  onPress,
}: AnswerOptionProps) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const toggle = world.recipes.toggle;
  const q = world.recipes.question;
  const markInk = mark === 'none' ? q.chosenEdge : q.mark[mark];
  // The edge answers the moment: choosing lights it, a reveal marks it right or wrong.
  const edge = mark === 'none' ? (chosen ? q.chosenEdge : t.line) : markInk;
  const light = useLivingStyle({ borderColor: edge });
  return (
    <Pressable
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={chosen}
      aria-disabled={locked}
      accessibilityLabel={markWord ? `${label}, ${markWord}` : label}
      accessibilityHint={hint}
      disabled={locked}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.option,
          radiusStyle(world.recipes.surface.raised.radius),
          { borderWidth: 2, backgroundColor: t.raised },
          light,
        ]}
      >
        <View
          style={[
            multiple ? radiusStyle(toggle.radius) : { borderRadius: toggle.size },
            {
              width: toggle.size,
              height: toggle.size,
              borderWidth: toggle.edge.width,
              borderColor: chosen ? toggle.on.fill : toggle.edge.color,
              backgroundColor: chosen ? toggle.on.fill : alpha(toggle.on.fill, 0),
            },
          ]}
        />
        <View style={styles.words}>
          <RNText style={typeStyle(world.recipes.text.body, language, world)}>{label}</RNText>
          {hint ? (
            <RNText style={typeStyle(world.recipes.text.caption, language, world)}>{hint}</RNText>
          ) : null}
        </View>
        {markWord ? (
          <RNText
            style={[typeStyle(world.recipes.text.label, language, world), { color: markInk }]}
          >
            {markWord}
          </RNText>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

export type ChoiceQuestionProps<V extends string = string> = ChoiceQuestionContract<V>;

/**
 * A question with choices. Before a reveal it is a radio group (or checkboxes
 * when several may be chosen). A reveal from the form engine locks it, marks
 * each option in words as well as colour, says the result aloud, and is felt once.
 */
export function ChoiceQuestion<V extends string = string>({
  prompt,
  options,
  multiple = false,
  value,
  onChange,
  reveal,
  labels,
}: ChoiceQuestionProps<V>) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...ANSWER_ENGLISH, ...labels };
  const right = reveal ? isAllRight(value, reveal.correct) : null;
  const felt = useRef(false);
  useEffect(() => {
    if (right === null) {
      felt.current = false;
      return;
    }
    if (felt.current) return;
    felt.current = true;
    feedback(right ? 'success' : 'error');
  }, [right, feedback]);
  const words: Record<AnswerMark, string | undefined> = {
    correct: l.correct,
    incorrect: l.incorrect,
    missed: l.missed,
    none: undefined,
  };
  return (
    <View style={{ gap: gapFor('between') }}>
      <RNText
        accessibilityRole="header"
        style={typeStyle(world.recipes.text.title, language, world)}
      >
        {prompt}
      </RNText>
      <View
        role={multiple ? 'list' : 'radiogroup'}
        aria-label={prompt}
        style={{ gap: gapFor('inside') }}
      >
        {options.map((o) => {
          const mark = markOf(o.value, value, reveal?.correct);
          return (
            <AnswerOption
              key={o.value}
              label={o.label}
              hint={o.hint}
              chosen={value.includes(o.value)}
              multiple={multiple}
              mark={mark}
              markWord={words[mark]}
              locked={!!reveal || !!o.disabled}
              onPress={() => {
                feedback('select');
                onChange(toggleChoice(value, o.value, multiple));
              }}
            />
          );
        })}
      </View>
      {reveal ? (
        <View style={{ gap: gapFor('inside') }}>
          <RNText
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              typeStyle(world.recipes.text.body, language, world),
              {
                color: right
                  ? world.recipes.question.result.right
                  : world.recipes.question.result.wrong,
              },
            ]}
          >
            {right ? l.resultRight : l.resultWrong}
          </RNText>
          {reveal.explanation ? (
            <Surface tone="inset">
              <RNText style={typeStyle(world.recipes.text.label, language, world)}>
                {l.explanationHeading}
              </RNText>
              <RNText style={typeStyle(world.recipes.text.body, language, world)}>
                {reveal.explanation}
              </RNText>
            </Surface>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export type PrivacyNoteProps = PrivacyNoteContract;

/** Says plainly, before the first question, who will see these answers. */
export function PrivacyNote({ identity, audience, labels }: PrivacyNoteProps) {
  const { world, language } = useWorldContext();
  const text = { ...PRIVACY_ENGLISH, ...labels }[identity];
  return (
    <Surface tone="inset">
      <RNText style={typeStyle(world.recipes.text.body, language, world)}>{text}</RNText>
      {audience ? (
        <RNText style={typeStyle(world.recipes.text.caption, language, world)}>{audience}</RNText>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  points: { flexDirection: 'row' },
  point: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, padding: 12 },
  words: { flex: 1, gap: 2 },
});
