import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, create } from 'react-test-renderer';

// Mock core imports
vi.mock('@repo/core/api/auth', () => ({
  authAPI: { signInAnonymously: vi.fn() },
}));
vi.mock('@repo/core/logic', () => ({
  LanguageUtils: { setLanguage: vi.fn() },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue || key,
    i18n: { language: 'en' },
  }),
}));
vi.mock('@repo/ui/providers/ToastProvider', () => ({
  useSanctuaryToast: () => ({ showToast: vi.fn() }),
}));
vi.mock('@repo/ui/utils/haptics', () => ({
  hapticLight: vi.fn(),
  hapticSuccess: vi.fn(),
  hapticError: vi.fn(),
}));
vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  selectionAsync: vi.fn(),
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
}));
vi.mock('@repo/ui/hooks/useAccessibility', () => ({
  useAccessibility: () => ({ isReduceMotionEnabled: true }),
}));
vi.mock('@repo/ui/hooks/useTheme', () => ({
  useTheme: () => ({
    accent: { action: '#D4843A', reward: '#FDD925' },
    animationsEnabled: false,
    blurEnabled: false,
    scene: { surface: { bg: '#F5EDD6' } },
  }),
}));

vi.mock('@repo/ui/primitives', () => ({
  Box: 'Box',
  Heading: 'Heading',
  HStack: 'HStack',
  VStack: 'VStack',
  Text: 'Text',
  Link: 'Link',
  LinkText: 'LinkText',
  Pressable: 'Pressable',
  Spinner: 'Spinner',
}));

// Mock Skia and Mascot to inspect high-level layout without native C++
vi.mock('@repo/ui/components/SkiaGlowAura', () => ({
  SkiaGlowAura: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@repo/ui/components/Mascot', () => ({
  Mascot: (props: any) => React.createElement('Mascot', props),
}));
vi.mock('@repo/ui/components/ScreenWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => React.createElement('ScreenWrapper', null, children),
}));

import { SanctuaryWelcomeScreen } from '@repo/ui/screens/SanctuaryWelcomeScreen';

describe('Screen Snapshotting: SanctuaryWelcomeScreen', () => {
  it('mounts and generates full rendered AST tree without Metro or Browser', async () => {
    let tree: any;
    act(() => {
      tree = create(
        <SanctuaryWelcomeScreen
          onLogin={() => {}}
          onGuest={() => {}}
        />
      );
    });

    const json = tree.toJSON();
    expect(json).toBeDefined();

    // Inspect the generated hierarchy
    const stringified = JSON.stringify(json, null, 2);
    expect(stringified).toContain('SANCTUARY');
    expect(stringified).toContain('Explore as Guest');
    expect(stringified).toContain('I have an account. Log In');

    // Write the raw AST dump to artifacts
    const fs = await import('fs');
    const path = await import('path');
    const artifactPath = 'C:/Users/Naween/.gemini/antigravity-ide/brain/fef6783e-909c-43e1-ae73-5d5317c7999a/screen_snapshot_ast.json';
    fs.writeFileSync(artifactPath, JSON.stringify(json, null, 2));

    // Recursive visual tree printer that visualizes exact mobile layout
    function renderVisualTree(node: any, depth = 0): string {
      if (!node) return '';
      if (typeof node === 'string') return `${'  '.repeat(depth)}"${node}"\n`;
      const indent = '  '.repeat(depth);
      let out = `${indent}┌─ <${node.type}`;
      if (node.props?.className) out += ` class="${node.props.className}"`;
      if (node.props?.style?.backgroundColor) out += ` bg="${node.props.style.backgroundColor}"`;
      out += '>\n';
      
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          out += renderVisualTree(child, depth + 1);
        }
      }
      out += `${indent}└─ </${node.type}>\n`;
      return out;
    }

    const visualTree = renderVisualTree(json);
    const visualArtifactPath = 'C:/Users/Naween/.gemini/antigravity-ide/brain/fef6783e-909c-43e1-ae73-5d5317c7999a/screen_snapshot_visual.txt';
    fs.writeFileSync(visualArtifactPath, visualTree);

    console.log('\n' + visualTree);
  });
});
