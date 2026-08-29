import { renderHook } from '@testing-library/react-native';
import { useShake } from '../useShake';

jest.mock('@repo/ui/hooks/useAccessibility', () => ({
  useAccessibility: jest.fn(() => ({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    announce: jest.fn(),
  })),
}));

describe('useShake', () => {
  it('renders without crashing', () => {
    // useShake uses Reanimated shared values which are mocked in jest-setup.
    // The mock returns plain objects, so we just verify the hook doesn't throw.
    expect(() => renderHook(() => useShake())).not.toThrow();
  });
});
