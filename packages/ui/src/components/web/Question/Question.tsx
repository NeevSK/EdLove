'use client';

import { useId } from 'react';
import type {
  AnswerMark,
  ChoiceQuestionContract,
  PrivacyNoteContract,
  ScaleContract,
} from '../../../theme/contracts';
import {
  ANSWER_ENGLISH,
  isAllRight,
  markOf,
  PRIVACY_ENGLISH,
  scalePoints,
  toggleChoice,
} from '../../shared/questions';

export type ScaleProps = ScaleContract;

/**
 * A rating or agreement scale: a fieldset of radio inputs, 3 to 11 points,
 * its ends named. Arrow keys move between points as in any radio group.
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
  const name = useId();
  const points = scalePoints(min, max);
  const wordsFor = (i: number) =>
    pointLabels?.[i] ?? (i === 0 ? ends?.low : i === points.length - 1 ? ends?.high : undefined);
  return (
    <fieldset className="gd-scale" disabled={disabled}>
      <legend className="gd-scale-label">{label}</legend>
      <div className="gd-scale-points">
        {points.map((n, i) => {
          const words = wordsFor(i);
          return (
            <label key={n} className="gd-scale-point" data-on={value === n ? '' : undefined}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                aria-label={words ? `${n}, ${words}` : String(n)}
              />
              <span aria-hidden>{n}</span>
            </label>
          );
        })}
      </div>
      {ends ? (
        <div className="gd-scale-ends" aria-hidden>
          <span>{ends.low}</span>
          <span>{ends.high}</span>
        </div>
      ) : null}
    </fieldset>
  );
}

export type ChoiceQuestionProps<V extends string = string> = ChoiceQuestionContract<V>;

/**
 * A question with choices: a fieldset of radios, or checkboxes when several
 * may be chosen. A reveal from the form engine disables it, marks each option
 * in words as well as colour, and announces the result.
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
  const name = useId();
  const l = { ...ANSWER_ENGLISH, ...labels };
  const right = reveal ? isAllRight(value, reveal.correct) : null;
  const words: Record<AnswerMark, string | undefined> = {
    correct: l.correct,
    incorrect: l.incorrect,
    missed: l.missed,
    none: undefined,
  };
  return (
    <fieldset className="gd-question" disabled={!!reveal} data-revealed={reveal ? '' : undefined}>
      <legend className="gd-question-prompt">{prompt}</legend>
      <div className="gd-question-options">
        {options.map((o) => {
          const mark = markOf(o.value, value, reveal?.correct);
          const chosen = value.includes(o.value);
          return (
            <label
              key={o.value}
              className="gd-answer"
              data-mark={mark === 'none' ? undefined : mark}
              data-chosen={chosen ? '' : undefined}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={o.value}
                checked={chosen}
                disabled={o.disabled}
                onChange={() => onChange(toggleChoice(value, o.value, multiple))}
              />
              <span className="gd-answer-words">
                <span className="gd-answer-label">{o.label}</span>
                {o.hint ? <span className="gd-answer-hint">{o.hint}</span> : null}
              </span>
              {words[mark] ? <span className="gd-answer-mark">{words[mark]}</span> : null}
            </label>
          );
        })}
      </div>
      {reveal ? (
        <div className="gd-question-result">
          <p role="alert" data-right={right ? '' : undefined}>
            {right ? l.resultRight : l.resultWrong}
          </p>
          {reveal.explanation ? (
            <div className="gd-surface gd-question-why" data-tone="inset">
              <p className="gd-text" data-kind="label">
                {l.explanationHeading}
              </p>
              <p className="gd-text" data-kind="body">
                {reveal.explanation}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}

export type PrivacyNoteProps = PrivacyNoteContract;

/** Says plainly, before the first question, who will see these answers. */
export function PrivacyNote({ identity, audience, labels }: PrivacyNoteProps) {
  const text = { ...PRIVACY_ENGLISH, ...labels }[identity];
  return (
    <div className="gd-surface gd-privacy" data-tone="inset" data-identity={identity}>
      <p className="gd-text" data-kind="body">
        {text}
      </p>
      {audience ? (
        <p className="gd-text" data-kind="caption">
          {audience}
        </p>
      ) : null}
    </div>
  );
}
