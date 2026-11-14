import { describe, expect, it, vi } from 'vitest';
import { fabBelongsTo, fabMenuActions } from '../components/LotusPetalFAB';

describe('FAB belongs to the tab on screen', () => {
  it('matches the same kind, and workspace kinds under Workspace', () => {
    expect(fabBelongsTo('community', 'community')).toBe(true);
    expect(fabBelongsTo('classroom', 'principal')).toBe(true);
    expect(fabBelongsTo('classroom', 'founder')).toBe(true);
    expect(fabBelongsTo('community', 'profile')).toBe(true);
    expect(fabBelongsTo('library', 'community')).toBe(false);
    expect(fabBelongsTo('self', 'classroom')).toBe(false);
  });
});

describe('the FAB menu keeps every action it has always offered', () => {
  it('lists primary, reset, screen actions, then the AI companion with the same launches', () => {
    const open = vi.fn();
    const menu = fabMenuActions({
      tab: 'classroom',
      label: 'Add',
      onPress: () => {},
      onBreathingReset: () => {},
      actions: [{ label: 'Take attendance', onPress: () => {} }],
      onOpenAICompanion: open,
      contextSummary: 'Grade 7B',
    });
    expect(menu.map((a) => a.label)).toEqual([
      'New Add Action',
      'Breathing Reset',
      'Take attendance',
      'Ask AI Companion (Add)',
      'Commission Deep Agent Mission',
      'Quick Incognito Ask (Zero-Trace)',
    ]);
    expect(menu[0]?.tone).toBe('lamp');
    expect(menu[3]?.hint).toBe('Context ready: Grade 7B');
    for (const a of menu.filter((a) => a.group)) a.onPress();
    expect(open.mock.calls).toEqual([
      [{ mode: 'saved', tab: 'chat' }],
      [{ mode: 'saved', tab: 'agent' }],
      [{ mode: 'incognito', tab: 'chat' }],
    ]);
  });

  it('community adds the mentor DM; no handlers means no menu', () => {
    const open = vi.fn();
    const menu = fabMenuActions({ tab: 'community', label: 'Community', onOpenAICompanion: open });
    menu.find((a) => a.key === 'ai-mentor')?.onPress();
    expect(open).toHaveBeenCalledWith({ mode: 'saved', tab: 'chat', threadId: 'mentor-dm' });
    expect(fabMenuActions({ tab: 'self', label: 'Reflection' })).toEqual([]);
  });
});
