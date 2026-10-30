import {
  Avatar,
  Badge,
  Divider,
  EmptyState,
  ErrorState,
  IconButton,
  Link,
  Progress,
} from '@repo/ui/components/web';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const Dot = () => null;

describe('web kit: IconButton and Link', () => {
  it('an icon button is named by its label and described by its tooltip', async () => {
    const onClick = vi.fn();
    render(<IconButton icon={Dot} label="Close" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip', { hidden: true }).id);
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a link is a real anchor', () => {
    render(<Link label="Read the policy" href="/policy" />);
    expect(screen.getByRole('link', { name: 'Read the policy' }).getAttribute('href')).toBe('/policy');
  });
});

describe('web kit: Progress, Badge, Avatar, Divider', () => {
  it('a known progress reports its value; an unknown one is busy', () => {
    const { rerender } = render(<Progress label="Uploading" value={0.42} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
    rerender(<Progress label="Uploading" />);
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
    expect(bar.getAttribute('aria-busy')).toBe('true');
  });

  it('a badge carries its tone', () => {
    render(<Badge label="New" tone="lamp" />);
    expect(screen.getByText('New').getAttribute('data-tone')).toBe('lamp');
  });

  it('an avatar is named for the person; initials show when the photo fails', () => {
    render(<Avatar name="Nimal Perera" src="/broken.jpg" />);
    const avatar = screen.getByRole('img', { name: 'Nimal Perera' });
    const img = avatar.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('');
    fireEvent.error(img);
    expect(avatar.textContent).toBe('NP');
  });

  it('a divider is a separator', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeTruthy();
  });
});

describe('web kit: EmptyState and ErrorState', () => {
  it('an empty state has a heading and its one action', async () => {
    const onPress = vi.fn();
    render(<EmptyState title="No classes yet" message="Add your first class." action={{ label: 'Add a class', onPress }} />);
    expect(screen.getByRole('heading', { name: 'No classes yet' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Add a class' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('an error state is an alert that offers to try again', async () => {
    const onPress = vi.fn();
    render(<ErrorState title="Could not load" retry={{ label: 'Try again', onPress }} />);
    expect(screen.getByRole('alert').textContent).toContain('Could not load');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
