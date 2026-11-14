import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useGurudeviView: vi.fn(),
  resolveScene: vi.fn(),
}));

vi.mock('../../../lib/runtime/useGurudeviView', () => ({
  useGurudeviView: mocks.useGurudeviView,
}));

vi.mock('@repo/ui/theme/scene', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/ui/theme/scene')>();
  mocks.resolveScene.mockImplementation(actual.resolveScene);
  return { ...actual, resolveScene: mocks.resolveScene };
});

import { experienceOf } from '@repo/core/verger';
import { WorldGroundSurface } from '../../../app/(sanctuary)/components/WorldGroundSurface';

const lastSceneInput = () => mocks.resolveScene.mock.calls.at(-1)?.[0];

describe('WorldGroundSurface reads verger', () => {
  beforeEach(() => {
    mocks.resolveScene.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('paints the scene with the experience verger publishes', () => {
    const experience = experienceOf(
      { levels: { 'ambient-motion': 2, blur: 2, particles: 2 }, capacityClass: 'low' },
      { fidelity: 'auto' },
    );
    mocks.useGurudeviView.mockReturnValue({ experience, reading: { visibility: 'active' } });

    render(<WorldGroundSurface groundMode="live" />);

    expect(lastSceneInput()).toMatchObject({ budget: experience, visible: true });
  });

  it('holds the scene still while the page is hidden', () => {
    const experience = experienceOf({ levels: {}, capacityClass: 'high' }, { fidelity: 'auto' });
    mocks.useGurudeviView.mockReturnValue({ experience, reading: { visibility: 'background' } });

    render(<WorldGroundSurface groundMode="live" />);

    expect(lastSceneInput()).toMatchObject({ visible: false });
  });

  it('sets no floor before verger is known (unknown is never a limit)', () => {
    mocks.useGurudeviView.mockReturnValue(null);

    render(<WorldGroundSurface groundMode="live" />);

    expect(lastSceneInput()).toMatchObject({
      budget: experienceOf({ levels: {}, capacityClass: 'unknown' }, { fidelity: 'auto' }),
      visible: true,
    });
  });
});
