import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
} from '@repo/ui/components/workspace/types';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: vi.fn(() => () => {}),
    fetch: vi.fn(async () => ({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: { isConnectionExpensive: false },
    })),
  },
  useNetInfo: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
}));

vi.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    useLongPressGesture: () => ({
      minDuration: vi.fn().mockReturnThis(),
      onActivate: vi.fn().mockReturnThis(),
    }),
    usePanGesture: () => ({
      onUpdate: vi.fn().mockReturnThis(),
      onEnd: vi.fn().mockReturnThis(),
      onFinalize: vi.fn().mockReturnThis(),
    }),
    useSimultaneousGestures: () => ({}),
  };
});

import {
  CanvasSurfaceCard,
  CanvasZoneColumn,
  ResponsiveWorkspaceCanvas,
} from '@repo/ui/components/workspace';
import { DEPTH_PRESETS } from '@repo/ui/components/workspace/shared';
import { EnvironmentProvider } from '@repo/ui/context/EnvironmentContext';

const mockSurface: ResolvedWorkspaceSurface = {
  surfaceId: 'journal_space',
  workspaceId: 'self',
  capabilityKey: 'read:SelfJourney',
  ownerPackage: 'core',
  defaultZone: 'today',
  defaultOrder: 10,
  title: 'Reflective Journal',
  zone: 'today',
  order: 10,
  hidden: false,
  pinned: false,
  isLocked: false,
};

const mockLayout: WorkspaceLayout = {
  workspaceId: 'self',
  userId: 'user_123',
  order: ['journal_space', 'mood_lotus'],
  hidden: [],
  pinned: [],
  zoneBySurface: { journal_space: 'today', mood_lotus: 'today' },
  updatedAt: new Date().toISOString(),
};

const mockSurfaces: WorkspaceSurfaceDefinition[] = [
  mockSurface,
  {
    surfaceId: 'mood_lotus',
    workspaceId: 'self',
    capabilityKey: 'read:InnerPulse',
    ownerPackage: 'core',
    defaultZone: 'today',
    defaultOrder: 20,
    title: 'Mood Lotus',
  },
];

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <EnvironmentProvider>{children}</EnvironmentProvider>;
}

describe('Workspace Spatial & Tactile Engine Contracts', () => {
  describe('Zero-Shadow Tactile Depth Presets', () => {
    it('defines sanctuary-calm with architectural inking and 0px blur parameters', () => {
      const preset = DEPTH_PRESETS['sanctuary-calm'];
      expect(preset).toBeDefined();
      expect(preset.showDots).toBe(true);
      expect(preset.borderWidth).toBe(1.25);
      expect(preset.borderRadius).toBe(14);
    });

    it('defines architectural-ink and flat-zen configurations with distinct dot spacing and borders', () => {
      expect(DEPTH_PRESETS['architectural-ink'].showDots).toBe(true);
      expect(DEPTH_PRESETS['flat-zen'].showDots).toBe(false);
      expect(DEPTH_PRESETS['architectural-ink'].borderWidth).toBe(1.5);
      expect(DEPTH_PRESETS['flat-zen'].borderWidth).toBe(1);
    });
  });

  describe('CanvasSurfaceCard Polymorphic Layouts', () => {
    it('renders in card layout mode with full metadata and action buttons', async () => {
      const onPin = vi.fn();
      const onHide = vi.fn();

      const { getByText, getByTestId, getByLabelText } = await render(
        <TestWrapper>
          <CanvasSurfaceCard
            surface={mockSurface}
            layoutMode="card"
            emoji="📖"
            category="WELLBEING"
            onTogglePin={onPin}
            onToggleHidden={onHide}
            content={<Text testID="surface-content">Live Content Slot</Text>}
          />
        </TestWrapper>,
      );

      expect(getByText('Reflective Journal')).toBeTruthy();
      expect(getByText('📖')).toBeTruthy();
      expect(getByText(/WELLBEING/)).toBeTruthy();
      expect(getByTestId('surface-content')).toBeTruthy();

      const pinButton = getByLabelText('Pin');
      fireEvent.press(pinButton);
      expect(onPin).toHaveBeenCalledWith(mockSurface);
    });

    it('renders in tile layout mode as a discovery matrix tile', async () => {
      const onPress = vi.fn();

      const { getByText } = await render(
        <TestWrapper>
          <CanvasSurfaceCard
            surface={mockSurface}
            layoutMode="tile"
            emoji="🧘"
            category="SANCTUARY"
            energyVibe={['#F5E6D3', '#8C7B65']}
            onPress={onPress}
          />
        </TestWrapper>,
      );

      expect(getByText('Reflective Journal')).toBeTruthy();
      expect(getByText('🧘')).toBeTruthy();
      expect(getByText('Launch ↗')).toBeTruthy();

      fireEvent.press(getByText('Reflective Journal'));
      expect(onPress).toHaveBeenCalledWith(mockSurface);
    });
  });

  describe('CanvasZoneColumn Spatial Arrangements', () => {
    const group = {
      zone: 'today' as const,
      surfaces: [
        mockSurface,
        {
          ...mockSurface,
          surfaceId: 'mood_lotus',
          title: 'Mood Lotus',
        },
      ],
    };

    it('renders catalog-grid arrangement with 2-column tiles', async () => {
      const { getByText } = await render(
        <TestWrapper>
          <CanvasZoneColumn
            group={group}
            spatialArrangement="catalog-grid"
            getSurfaceEmoji={(s) => (s.surfaceId === 'journal_space' ? '📖' : '🪷')}
          />
        </TestWrapper>,
      );

      expect(getByText('📖')).toBeTruthy();
      expect(getByText('🪷')).toBeTruthy();
      expect(getByText('Reflective Journal')).toBeTruthy();
      expect(getByText('Mood Lotus')).toBeTruthy();
    });

    it('renders carousel arrangement with horizontal snap items', async () => {
      const { getByText } = await render(
        <TestWrapper>
          <CanvasZoneColumn
            group={group}
            spatialArrangement="carousel"
            getSurfaceEmoji={() => '✨'}
          />
        </TestWrapper>,
      );

      expect(getByText('Reflective Journal')).toBeTruthy();
      expect(getByText('Mood Lotus')).toBeTruthy();
    });

    it('renders stream arrangement with reorder controls and reordering steppers', async () => {
      const onReorder = vi.fn();

      const { getByText } = await render(
        <TestWrapper>
          <CanvasZoneColumn
            group={group}
            spatialArrangement="stream"
            onReorder={onReorder}
          />
        </TestWrapper>,
      );

      expect(getByText('Reflective Journal')).toBeTruthy();
      expect(getByText('Mood Lotus')).toBeTruthy();
    });
  });

  describe('ResponsiveWorkspaceCanvas End-to-End Rendering', () => {
    it('resolves surfaces and zones into canonical tactile columns', async () => {
      const onSurfacePress = vi.fn();

      const { getByText } = await render(
        <TestWrapper>
          <ResponsiveWorkspaceCanvas
            surfaces={mockSurfaces}
            layout={mockLayout}
            depthPreset="sanctuary-calm"
            spatialArrangement="catalog-grid"
            onSurfacePress={onSurfacePress}
          />
        </TestWrapper>,
      );

      expect(getByText('Reflective Journal')).toBeTruthy();
      expect(getByText('Mood Lotus')).toBeTruthy();
    });
  });
});
