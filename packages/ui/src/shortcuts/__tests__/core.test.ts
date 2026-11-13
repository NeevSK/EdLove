import { describe, expect, it, vi } from 'vitest';
import { createKeyboard, keysLabel } from '../core';

const press = (key: string, mods: Partial<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean; shiftKey: boolean }> = {}) => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  ...mods,
});

describe('one keyboard layer', () => {
  it('Escape closes only the top open layer', () => {
    const k = createKeyboard();
    const panel = vi.fn();
    const dialog = vi.fn();
    k.openLayer(panel);
    k.openLayer(dialog);
    expect(k.handle(press('Escape'), false)).toBe(true);
    expect(dialog).toHaveBeenCalledTimes(1);
    expect(panel).not.toHaveBeenCalled();
    k.handle(press('Escape'), false);
    expect(panel).toHaveBeenCalledTimes(1);
  });

  it('a layer that shut another way no longer takes Escape', () => {
    const k = createKeyboard();
    const close = vi.fn();
    const shut = k.openLayer(close);
    shut();
    expect(k.handle(press('Escape'), false)).toBe(false);
    expect(close).not.toHaveBeenCalled();
  });

  it('mod means Ctrl or Cmd', () => {
    const k = createKeyboard();
    const run = vi.fn();
    k.register({ keys: 'mod+k', run });
    k.handle(press('k', { ctrlKey: true }), false);
    k.handle(press('K', { metaKey: true }), false);
    expect(run).toHaveBeenCalledTimes(2);
    expect(k.handle(press('k'), false)).toBe(false);
  });

  it('plain letters stay letters while typing; modified keys still work', () => {
    const k = createKeyboard();
    const zen = vi.fn();
    const search = vi.fn();
    k.register({ keys: 'z', run: zen });
    k.register({ keys: 'mod+k', run: search });
    k.handle(press('z'), true);
    expect(zen).not.toHaveBeenCalled();
    k.handle(press('k', { ctrlKey: true }), true);
    expect(search).toHaveBeenCalled();
  });

  it('the newest shortcut for a key wins, and leaving restores the older one', () => {
    const k = createKeyboard();
    const app = vi.fn();
    const page = vi.fn();
    k.register({ keys: 'arrowright', run: app });
    const leave = k.register({ keys: 'arrowright', run: page });
    k.handle(press('ArrowRight'), false);
    expect(page).toHaveBeenCalled();
    leave();
    k.handle(press('ArrowRight'), false);
    expect(app).toHaveBeenCalled();
  });

  it('lists labelled shortcuts by where they work, and keeps the same list until something changes', () => {
    const k = createKeyboard();
    k.register({ keys: 'mod+k', label: 'Search', scope: 'app', run: () => {} });
    k.register({ keys: 'z', label: 'Focus reading', run: () => {} });
    k.register({ keys: 'pagedown', run: () => {} });
    const list = k.list();
    expect(list.map((s) => s.keys)).toEqual(['z', 'mod+k']);
    expect(k.list()).toBe(list);
  });

  it('writes keys the way each platform shows them', () => {
    expect(keysLabel('mod+k', true)).toBe('⌘ K');
    expect(keysLabel('mod+k', false)).toBe('Ctrl K');
    expect(keysLabel('arrowright', false)).toBe('→');
  });
});
