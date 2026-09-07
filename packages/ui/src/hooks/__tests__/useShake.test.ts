import { renderHook } from '@testing-library/react-native';
import { useShake } from '../useShake';

vi.mock('@repo/ui/hooks/useAccessibility', () => ({
  useAccessibility: vi.fn(() => ({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    announce: vi.fn(),
  })),
}));

describe('useShake', () => {
  it('renders without crashing', () => {
    // useShake uses Reanimated shared values which are mocked in vitest-setup.
    // The mock returns plain objects, so we just verify the hook doesn't throw.
    expect(() => renderHook(() => useShake())).not.toThrow();
  });
});
