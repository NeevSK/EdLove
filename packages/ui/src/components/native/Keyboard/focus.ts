/**
 * What the person is typing into right now, for the parts of the app that echo it: the typing
 * bar (above the system keyboard) and the keypad (our own, for numbers). On a phone held
 * sideways the keyboard covers most of the screen, so the field itself may be out of sight; the
 * echo keeps its name and its words in view. Plain module state, no React needed to write it.
 */

import { useSyncExternalStore } from 'react';

export interface TypingFocus {
  label: string;
  value: string;
  /** Hidden fields (PINs, passwords) echo dots, never their words. */
  secret?: boolean;
}

/** The keypad's target: a field that asked for our keypad instead of the system keyboard. */
export interface KeypadTarget extends TypingFocus {
  kind: 'number' | 'decimal';
  maxLength?: number;
  onChange: (next: string) => void;
  onDone: () => void;
}

let focus: TypingFocus | null = null;
let pad: KeypadTarget | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function setTypingFocus(next: TypingFocus | null): void {
  focus = next;
  emit();
}

/** Keeps the echo's words in step with the field, if that field is the one in focus. */
export function echoTyping(label: string, value: string): void {
  if (!focus || focus.label !== label || focus.value === value) return;
  focus = { ...focus, value };
  emit();
}

export function openKeypad(target: KeypadTarget): void {
  pad = target;
  emit();
}

export function updateKeypadValue(value: string): void {
  if (!pad || pad.value === value) return;
  pad = { ...pad, value };
  emit();
}

export function closeKeypad(label?: string): void {
  if (!pad || (label !== undefined && pad.label !== label)) return;
  pad = null;
  emit();
}

const getFocus = () => focus;
const getPad = () => pad;

export function useTypingFocus(): TypingFocus | null {
  return useSyncExternalStore(subscribe, getFocus, getFocus);
}

export function useKeypadTarget(): KeypadTarget | null {
  return useSyncExternalStore(subscribe, getPad, getPad);
}

/** The next value after a key: digits append, `.` once, `back` removes one. Pure. */
export function pressKey(
  value: string,
  key: string,
  kind: 'number' | 'decimal',
  maxLength?: number,
): string {
  if (key === 'back') return value.slice(0, -1);
  if (key === '.') {
    if (kind !== 'decimal' || value.includes('.')) return value;
    return value === '' ? '0.' : `${value}.`;
  }
  if (!/^[0-9]$/.test(key)) return value;
  if (maxLength !== undefined && value.length >= maxLength) return value;
  return value + key;
}
