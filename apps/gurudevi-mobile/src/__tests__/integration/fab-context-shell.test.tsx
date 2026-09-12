import { FABProvider, useFAB } from '@repo/ui/context/FABContext';
import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('FAB shell registration', () => {
  it('does not rerender the tab shell for repeated empty cleanup', () => {
    let renders = 0;
    let fab: ReturnType<typeof useFAB> | undefined;

    function CaptureFAB() {
      fab = useFAB();
      renders += 1;
      return null;
    }

    render(
      <FABProvider>
        <CaptureFAB />
      </FABProvider>,
    );

    act(() => fab?.unregisterFAB());
    expect(renders).toBe(1);

    act(() => fab?.registerFAB({ tabType: 'community', visible: true }));
    expect(renders).toBe(2);

    act(() => fab?.unregisterFAB());
    expect(renders).toBe(3);
  });
});
