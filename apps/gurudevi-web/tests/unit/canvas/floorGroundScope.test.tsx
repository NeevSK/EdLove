import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { SanctuaryFloorCanvas } from '../../../app/(sanctuary)/components/SanctuaryFloorCanvas';
import { worldLookStore } from '../../../lib/canvas/worldLookStore';

function Room({ domain }: Readonly<{ domain: string }>) {
  return (
    <SanctuaryFloorCanvas domain={domain} titleId={`${domain}-title`}>
      <h1 id={`${domain}-title`}>{domain}</h1>
    </SanctuaryFloorCanvas>
  );
}

function floor(domain: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`article[data-domain="${domain}"]`);
  if (!el) throw new Error(`no ${domain} floor`);
  return el;
}

async function openStudio(domain: string) {
  await act(async () => {
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(`open ${domain} floor studio`, 'i') }),
    );
  });
}

async function tap(name: RegExp) {
  await act(async () => {
    fireEvent.click(
      screen.getByRole(
        name.source.startsWith('Every') || name.source.startsWith('Just') ? 'radio' : 'button',
        { name },
      ),
    );
  });
}

describe('one world look, rooms follow it, "just this room or every room?"', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    worldLookStore.reset();
  });

  it('a change for every room shows in another room', async () => {
    render(<Room domain="self" />);
    await openStudio('self');
    expect(screen.getByRole('radio', { name: /every room/i }).getAttribute('aria-checked')).toBe(
      'true',
    );
    await tap(/Quiet/);
    expect(floor('self').dataset.groundMode).toBe('quiet');
    cleanup();

    render(<Room domain="library" />);
    expect(floor('library').dataset.groundMode).toBe('quiet');
    expect(floor('library').dataset.groundSource).toBe('world');
  });

  it('just this room stays in that room, and every room later brings it back', async () => {
    render(<Room domain="self" />);
    await openStudio('self');
    await tap(/Just Self/);
    await tap(/Still sky/i);
    expect(floor('self').dataset.groundMode).toBe('still');
    expect(floor('self').dataset.groundSource).toBe('room');
    cleanup();

    render(<Room domain="library" />);
    expect(floor('library').dataset.groundMode).toBe('live');
    await openStudio('library');
    await tap(/Quiet/);
    cleanup();

    render(<Room domain="self" />);
    expect(floor('self').dataset.groundMode).toBe('quiet');
    expect(floor('self').dataset.groundSource).toBe('world');
  });

  it('Photo, Live Sky, Photo: each switch sticks', async () => {
    render(<Room domain="self" />);
    await openStudio('self');
    await tap(/Photo/);
    expect(floor('self').dataset.groundMode).toBe('image');
    await tap(/Live sky/i);
    expect(floor('self').dataset.groundMode).toBe('live');
    await tap(/Photo/);
    expect(floor('self').dataset.groundMode).toBe('image');
    cleanup();
    render(<Room domain="self" />);
    expect(floor('self').dataset.groundMode).toBe('image');
  });

  it('a room with its own look can follow the world again', async () => {
    render(<Room domain="self" />);
    await openStudio('self');
    await tap(/Just Self/);
    await tap(/Quiet/);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /use the world's look in self/i }));
    });
    expect(floor('self').dataset.groundSource).not.toBe('room');
    expect(floor('self').dataset.groundMode).toBe('live');
  });
});
