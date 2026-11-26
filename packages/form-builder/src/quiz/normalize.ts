/**
 * Answer normalisation for Sinhala, Tamil and English input.
 *
 * Phones in Sri Lanka type the same word in different byte sequences: Helakuru,
 * Wijesekara and Gboard disagree about zero-width joiners in conjuncts (ශ්‍රී),
 * and copy-paste brings in non-breaking spaces. The engine compares strings
 * exactly, so both the answer key and the student's answer pass through here
 * before grading. Nothing here changes how text is displayed.
 */

/** Zero-width joiner, non-joiner and space, word joiner, and the byte-order mark. */
const INVISIBLE_JOINERS = /[​‌‍⁠﻿]/g;
/** Any run of whitespace, including no-break and narrow no-break spaces. */
const WHITESPACE_RUN = /[\s  ]+/g;

/** Text comparable across keyboards: NFC, no invisible joiners, single spaces, trimmed. */
export function normalizeAnswerText(value: string): string {
  return value.normalize('NFC').replace(INVISIBLE_JOINERS, '').replace(WHITESPACE_RUN, ' ').trim();
}

/** Tamil (௦-௯), Sinhala archaic (෦-෯) and Arabic-Indic digits map to 0-9. */
const DIGIT_BLOCKS: ReadonlyArray<readonly [number, number]> = [
  [0x0be6, 0x0bef],
  [0x0de6, 0x0def],
  [0x0660, 0x0669],
  [0x06f0, 0x06f9],
];

function toAsciiDigits(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    const block = DIGIT_BLOCKS.find(([start, end]) => code >= start && code <= end);
    out += block ? String(code - block[0]) : ch;
  }
  return out;
}

const NUMBER_SHAPE = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

/**
 * Reads a typed number without guessing. Returns `undefined` for an empty or
 * unreadable entry (never NaN), so a blank answer is "not answered", not wrong.
 * A comma is refused rather than read as a decimal or thousands mark: "1,5"
 * is ambiguous, and a wrong guess would mark a student wrong silently.
 */
export function parseNumberAnswer(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const text = toAsciiDigits(normalizeAnswerText(value)).replace(/\s/g, '');
  if (text === '' || !NUMBER_SHAPE.test(text)) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** True when the value counts as no answer at all. */
export function isBlankAnswer(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return normalizeAnswerText(value) === '';
  if (typeof value === 'number') return !Number.isFinite(value);
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
