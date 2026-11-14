import React from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SanctuaryPulseOverlay } from '@/somatic/SanctuaryPulseOverlay';

vi.mock('expo-haptics', () => ({
  selectionAsync: vi.fn().mockResolvedValue(undefined),
  notificationAsync: vi.fn().mockResolvedValue(undefined),
  impactAsync: vi.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));

vi.mock('@repo/ui', () => ({
  Mascot: () => null,
}));

describe('SanctuaryPulseOverlay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when visible is true with playful tone', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SanctuaryPulseOverlay visible={true} onDismiss={vi.fn()} isPlayfulMode={true} />,
      );
    });

    const root = tree.root;
    expect(
      root.findByProps({ accessibilityLabel: 'Sanctuary Somatic Breathing Space' }),
    ).toBeDefined();

    // Verify playful copy
    const textNodes = root.findAllByType('Text' as any);
    const hasPlayfulTitle = textNodes.some(
      (node: any) => node.props.children === "It's the timeee 🌿",
    );
    expect(hasPlayfulTitle).toBe(true);
  });

  it('renders serene copy when isPlayfulMode is false', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SanctuaryPulseOverlay visible={true} onDismiss={vi.fn()} isPlayfulMode={false} />,
      );
    });

    const root = tree.root;
    const textNodes = root.findAllByType('Text' as any);
    const hasSereneTitle = textNodes.some(
      (node: any) => node.props.children === 'Sanctuary Breath',
    );
    expect(hasSereneTitle).toBe(true);
  });

  it('calls onDismiss when user presses ready button', () => {
    const onDismiss = vi.fn();
    let tree: any;
    act(() => {
      tree = create(<SanctuaryPulseOverlay visible={true} onDismiss={onDismiss} />);
    });

    const root = tree.root;
    const readyButton = root.findByProps({ accessibilityLabel: 'I am ready to return' });
    act(() => {
      readyButton.props.onPress();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
