import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePerspectiveStore, DEFAULT_PERSONAL_PERSPECTIVE } from '../usePerspectiveStore';
import { useCedarDecisionStore } from '../useCedarDecisionStore';
import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';

describe('usePerspectiveStore', () => {
  beforeEach(() => {
    usePerspectiveStore.setState({
      activePerspective: DEFAULT_PERSONAL_PERSPECTIVE,
      availablePerspectives: [DEFAULT_PERSONAL_PERSPECTIVE],
      isTransitioning: false,
    });
    vi.clearAllMocks();
  });

  it('initializes with default personal perspective', () => {
    const state = usePerspectiveStore.getState();
    expect(state.activePerspective.id).toBe('personal');
    expect(state.activePerspective.kind).toBe('personal');
    expect(state.availablePerspectives).toHaveLength(1);
  });

  it('adds and updates available perspectives', () => {
    const schoolPerspective: SanctuaryPerspective = {
      id: 'school-123',
      kind: 'institutional',
      displayName: 'Royal College',
      schoolId: 'school-123',
    };

    usePerspectiveStore.getState().addPerspective(schoolPerspective);
    expect(usePerspectiveStore.getState().availablePerspectives).toHaveLength(2);

    usePerspectiveStore.getState().updatePerspective('school-123', {
      displayName: 'Royal College Colombo',
    });
    const updated = usePerspectiveStore
      .getState()
      .availablePerspectives.find((p) => p.id === 'school-123');
    expect(updated?.displayName).toBe('Royal College Colombo');
  });

  it('switches perspective, clears cedar cache, and emits bus events', async () => {
    const busEmitSpy = vi.spyOn(sovereignBus, 'emit');
    const clearDecisionsSpy = vi.spyOn(useCedarDecisionStore.getState(), 'clearDecisions');

    const schoolPerspective: SanctuaryPerspective = {
      id: 'school-456',
      kind: 'institutional',
      displayName: 'Trinity College',
      schoolId: 'school-456',
    };

    usePerspectiveStore
      .getState()
      .setAvailablePerspectives([DEFAULT_PERSONAL_PERSPECTIVE, schoolPerspective]);

    await usePerspectiveStore.getState().switchPerspective('school-456');

    expect(usePerspectiveStore.getState().activePerspective.id).toBe('school-456');
    expect(clearDecisionsSpy).toHaveBeenCalled();
    expect(busEmitSpy).toHaveBeenCalledWith('perspective:transition_started', expect.any(Object));
    expect(busEmitSpy).toHaveBeenCalledWith('perspective:transition_completed', expect.any(Object));
    expect(usePerspectiveStore.getState().isTransitioning).toBe(false);
  });

  it('resets to personal perspective cleanly', () => {
    const schoolPerspective: SanctuaryPerspective = {
      id: 'school-789',
      kind: 'institutional',
      displayName: 'Ananda College',
      schoolId: 'school-789',
    };

    usePerspectiveStore.setState({
      activePerspective: schoolPerspective,
      availablePerspectives: [DEFAULT_PERSONAL_PERSPECTIVE, schoolPerspective],
    });

    usePerspectiveStore.getState().resetToPersonalPerspective();
    expect(usePerspectiveStore.getState().activePerspective.id).toBe('personal');
  });
});
