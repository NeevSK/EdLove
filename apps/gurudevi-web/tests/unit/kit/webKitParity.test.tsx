import {
  Perch,
  Switch,
  WaitingSign,
  WorldLoading,
  WorldPicker,
  WorldSkeleton,
} from '@repo/ui/components/web';
import { SIGN_CYCLE_MS, type SignKind, WORLD_IDS } from '@repo/ui/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const KINDS = Object.keys(SIGN_CYCLE_MS) as SignKind[];

describe('web kit: Switch', () => {
  it('is a named switch that reports and flips its state', async () => {
    const onValueChange = vi.fn();
    render(<Switch label="Reminders" value={false} onValueChange={onValueChange} />);
    const sw = screen.getByRole('switch', { name: 'Reminders' });
    expect(sw.getAttribute('aria-checked')).toBe('false');
    await userEvent.click(sw);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('does nothing while disabled', async () => {
    const onValueChange = vi.fn();
    render(<Switch label="Reminders" value onValueChange={onValueChange} disabled />);
    await userEvent.click(screen.getByRole('switch', { name: 'Reminders' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('web kit: WaitingSign', () => {
  it('without a kind carries every sign so the stylesheet can show the active world’s', () => {
    const { container } = render(<WaitingSign />);
    const sign = container.querySelector('.gd-sign') as HTMLElement;
    expect(sign.hasAttribute('data-auto')).toBe(true);
    expect(sign.getAttribute('aria-hidden')).toBe('true');
    expect([...sign.querySelectorAll('.gd-s')].map((s) => s.getAttribute('data-sign'))).toEqual(
      KINDS,
    );
  });

  it('draws one named sign, and holds it still when asked', () => {
    const { container } = render(<WaitingSign kind="ripple" still size={64} />);
    const sign = container.querySelector('.gd-sign') as HTMLElement;
    expect([...sign.querySelectorAll('.gd-s')].map((s) => s.getAttribute('data-sign'))).toEqual([
      'ripple',
    ]);
    expect(sign.hasAttribute('data-still')).toBe(true);
    expect(sign.style.getPropertyValue('--s')).toBe('64px');
  });
});

describe('web kit: WorldLoading and WorldSkeleton', () => {
  it('announces the words, and keeps them for screen readers when quiet', () => {
    render(<WorldLoading label="Loading lessons" quiet />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-busy')).toBe('true');
    const words = screen.getByText('Loading lessons');
    expect(status.contains(words)).toBe(true);
    expect(words.className).toContain('gd-sr');
  });

  it('a skeleton is hidden from assistive technology and takes its size', () => {
    const { container } = render(<WorldSkeleton height={12} width={120} radius={4} still />);
    const bone = container.querySelector('.gd-skeleton') as HTMLElement;
    expect(bone.getAttribute('aria-hidden')).toBe('true');
    expect(bone.style.height).toBe('12px');
    expect(bone.style.width).toBe('120px');
    expect(bone.style.borderRadius).toBe('4px');
    expect(bone.hasAttribute('data-still')).toBe(true);
  });
});

describe('web kit: Perch', () => {
  it('carries every world’s perch unless one is named', () => {
    const all = render(<Perch />).container.querySelectorAll('g[data-perch]');
    expect(all).toHaveLength(WORLD_IDS.length);
    const one = render(<Perch world="kandyan" />).container.querySelectorAll('g[data-perch]');
    expect([...one].map((g) => g.getAttribute('data-perch'))).toEqual(['kandyan']);
  });

  it('paints only with world variables', () => {
    const svg = render(<Perch world="spark" />).container.querySelector('svg') as SVGElement;
    const paints = [...svg.querySelectorAll('*')]
      .flatMap((n) => [n.getAttribute('fill'), n.getAttribute('stroke')])
      .filter(Boolean);
    expect(paints.length).toBeGreaterThan(0);
    for (const p of paints) expect(p).toMatch(/^(none|var\(--w-[a-z-]+\))$/);
  });
});

describe('web kit: WorldPicker', () => {
  it('is a radio group with each choice drawn in its own world', () => {
    const { container } = render(
      <WorldPicker label="World" value="wewa" mode="dark" onChange={() => {}} />,
    );
    screen.getByRole('radiogroup', { name: 'World' });
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(WORLD_IDS.length);
    expect(radios.filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(1);
    const scopes = [...container.querySelectorAll('.gd-world')];
    expect(scopes.map((s) => s.getAttribute('data-world'))).toEqual(WORLD_IDS);
    expect(scopes.every((s) => s.getAttribute('data-mode') === 'dark')).toBe(true);
  });

  it('only the chosen world is in the tab order, and arrow keys move the choice', async () => {
    const onChange = vi.fn();
    render(<WorldPicker label="World" value="sanctuary" mode="light" onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenCalledWith(WORLD_IDS[1]);
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(WORLD_IDS[WORLD_IDS.length - 1]);
  });
});
