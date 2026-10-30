import { Card, Carousel, Grid, Icon, Rail } from '@repo/ui/components/web';
import type { KitIconProps } from '@repo/ui/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function Glyph({ size }: KitIconProps) {
  return <svg data-testid="glyph" width={size} height={size} />;
}

describe('web kit: Icon and Grid', () => {
  it('an icon is hidden unless labelled', () => {
    render(
      <>
        <Icon icon={Glyph} />
        <Icon icon={Glyph} label="Offline" size="lg" />
      </>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(
      screen.getByRole('img', { name: 'Offline' }).querySelector('svg')?.getAttribute('width'),
    ).toBe('24');
  });

  it('a grid carries its minimum column and optional cap as variables', () => {
    render(
      <>
        <Grid data-testid="g" min="sm" />
        <Grid data-testid="h" max={3} gap="group" />
      </>,
    );
    const g = screen.getByTestId('g');
    expect(g.style.getPropertyValue('--gd-grid-min')).toBe('140px');
    expect(g.hasAttribute('data-max')).toBe(false);
    const h = screen.getByTestId('h');
    expect(h.style.getPropertyValue('--gd-grid-max')).toBe('3');
    expect(h.dataset.gap).toBe('group');
  });
});

describe('web kit: Card', () => {
  it('is a link with href, a button with onClick, otherwise a plain surface', async () => {
    const onClick = vi.fn();
    render(
      <>
        <Card title="Fractions" meta="Grade 6" href="/lessons/fractions" />
        <Card title="Leaves" onClick={onClick} />
        <Card title="Note" />
      </>,
    );
    expect(screen.getByRole('link', { name: /Fractions/ }).getAttribute('href')).toBe(
      '/lessons/fractions',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Leaves' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Leaves' }).hasAttribute('aria-pressed')).toBe(false);
    expect(screen.getByText('Note').closest('.gd-card')?.tagName).toBe('DIV');
  });

  it('a chosen card is a pressed toggle; a disabled one does nothing', async () => {
    const onClick = vi.fn();
    render(
      <>
        <Card title="Wewa" selected onClick={() => {}} />
        <Card title="Locked" disabled onClick={onClick} />
        <Card title="Gone" disabled href="/gone" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Wewa' }).getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'Locked' }));
    expect(onClick).not.toHaveBeenCalled();
    const gone = screen.getByText('Gone').closest('a');
    expect(gone?.hasAttribute('href')).toBe(false);
    expect(gone?.getAttribute('aria-disabled')).toBe('true');
  });
});

describe('web kit: Rail and Carousel', () => {
  it('a rail is a list named by its label', () => {
    render(
      <Rail
        label="Recent lessons"
        items={['a', 'b']}
        keyOf={(x) => x}
        renderItem={(x) => <Card title={`Lesson ${x}`} />}
        size="sm"
      />,
    );
    const list = screen.getByRole('list', { name: 'Recent lessons' });
    expect(list.querySelectorAll('li')).toHaveLength(2);
  });

  it('a carousel pages with buttons, announces position, hides other pages, stops at the ends', async () => {
    const onPageChange = vi.fn();
    render(
      <Carousel
        label="Today"
        items={['a', 'b', 'c']}
        keyOf={(x) => x}
        renderItem={(x) => <p>Page {x}</p>}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole('region', { name: 'Today' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Previous' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(screen.getByText('1 of 3').getAttribute('aria-live')).toBe('polite');
    const page = (x: string) => screen.getByText(`Page ${x}`).closest('li');
    expect(page('b')?.getAttribute('aria-hidden')).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('3 of 3')).toBeTruthy();
    expect(page('c')?.hasAttribute('aria-hidden')).toBe(false);
    expect(page('a')?.getAttribute('aria-hidden')).toBe('true');
    expect(onPageChange.mock.calls).toEqual([[1], [2]]);
    expect((screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
