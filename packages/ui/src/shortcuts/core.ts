/**
 * Keyboard: one owner for every key the app answers to.
 *
 * Pages and rooms never add their own keydown listener. They register a
 * shortcut here (keys, words for the "?" list, what it does), and the one
 * listener per platform decides who gets the key:
 *
 *   1. Escape goes to the top open layer only (the newest dialog, panel or
 *      menu), so one press closes one thing, never everything at once.
 *   2. While the person types in a field, only Escape and shortcuts with a
 *      modifier (Ctrl/Cmd/Alt) count; plain letters stay letters.
 *   3. Otherwise the newest matching shortcut wins (a page's arrow keys beat
 *      the app's), and the event is consumed.
 *
 * No platform code here: the web binds it to `window` (`./web.ts`); a phone
 * or tablet with a hardware keyboard can bind the same registry later.
 */

export type ShortcutScope = 'app' | 'room' | 'page';

export interface Shortcut {
  /** Like "mod+k", "alt+t", "escape", "?", "arrowright". `mod` is Cmd on Apple, Ctrl elsewhere. */
  keys: string;
  /** Words for the keyboard help list. Leave out to keep it off the list. */
  label?: string;
  scope?: ShortcutScope;
  run: () => void;
}

export interface KeyPress {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}

interface Entry extends Shortcut {
  id: number;
}

const NAMES: Readonly<Record<string, string>> = { esc: 'escape', space: ' ', pagedown: 'pagedown', pageup: 'pageup' };

export interface Combo {
  key: string;
  mod: boolean;
  alt: boolean;
  shift: boolean;
}

export function parseKeys(keys: string): Combo {
  const parts = keys.toLowerCase().split('+');
  const key = parts.pop() ?? '';
  return {
    key: NAMES[key] ?? key,
    mod: parts.includes('mod') || parts.includes('ctrl') || parts.includes('cmd'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
  };
}

export function matches(combo: Combo, press: KeyPress): boolean {
  const key = press.key.toLowerCase();
  if (key !== combo.key) return false;
  if (combo.mod !== (press.ctrlKey || press.metaKey)) return false;
  if (combo.alt !== press.altKey) return false;
  // "?" needs Shift on most layouts; don't make people say it twice.
  if (combo.shift && !press.shiftKey) return false;
  return true;
}

export interface Keyboard {
  register(shortcut: Shortcut): () => void;
  /** Open a layer that Escape closes; returns the closer to call when it shuts by other means. */
  openLayer(close: () => void): () => void;
  /** Decide a key press. Returns true when something took it. */
  handle(press: KeyPress, typing: boolean): boolean;
  /** What the "?" list shows, newest scope first. */
  list(): readonly Required<Pick<Shortcut, 'keys' | 'label' | 'scope'>>[];
  subscribe(listener: () => void): () => void;
}

export function createKeyboard(): Keyboard {
  let next = 1;
  let entries: Entry[] = [];
  const layers: { id: number; close: () => void }[] = [];
  const listeners = new Set<() => void>();
  let listed: ReturnType<Keyboard['list']> | null = null;
  const changed = () => {
    listed = null;
    for (const l of listeners) l();
  };

  return {
    register(shortcut) {
      const id = next++;
      entries = [...entries, { ...shortcut, id }];
      changed();
      return () => {
        entries = entries.filter((e) => e.id !== id);
        changed();
      };
    },
    openLayer(close) {
      const id = next++;
      layers.push({ id, close });
      return () => {
        const at = layers.findIndex((l) => l.id === id);
        if (at >= 0) layers.splice(at, 1);
      };
    },
    handle(press, typing) {
      if (press.key === 'Escape' && layers.length > 0) {
        const top = layers.pop();
        top?.close();
        return true;
      }
      const modified = press.ctrlKey || press.metaKey || press.altKey;
      if (typing && press.key !== 'Escape' && !modified) return false;
      for (let i = entries.length - 1; i >= 0; i--) {
        const e = entries[i];
        if (e && matches(parseKeys(e.keys), press)) {
          e.run();
          return true;
        }
      }
      return false;
    },
    list() {
      if (listed) return listed;
      const order: Record<ShortcutScope, number> = { page: 0, room: 1, app: 2 };
      const seen = new Set<string>();
      listed = [...entries]
        .reverse()
        .filter((e) => e.label && !seen.has(e.keys) && seen.add(e.keys))
        .map((e) => ({ keys: e.keys, label: e.label as string, scope: e.scope ?? 'page' }))
        .sort((a, b) => order[a.scope] - order[b.scope]);
      return listed;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** How a combo reads to a person, e.g. "Ctrl K" or "⌘ K". */
export function keysLabel(keys: string, apple: boolean): string {
  return keys
    .split('+')
    .map((k) => {
      const l = k.toLowerCase();
      if (l === 'mod') return apple ? '⌘' : 'Ctrl';
      if (l === 'alt') return apple ? '⌥' : 'Alt';
      if (l === 'shift') return '⇧';
      if (l === 'escape' || l === 'esc') return 'Esc';
      if (l === 'arrowright') return '→';
      if (l === 'arrowleft') return '←';
      if (l === 'arrowup') return '↑';
      if (l === 'arrowdown') return '↓';
      return k.length === 1 ? k.toUpperCase() : k[0]?.toUpperCase() + k.slice(1);
    })
    .join(' ');
}
