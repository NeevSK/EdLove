import { vi } from 'vitest';

(globalThis as any).ErrorUtils = {
  setGlobalHandler: vi.fn(),
  getGlobalHandler: vi.fn(),
};

vi.mock('react-native-enriched-markdown', () => ({
  EnrichedMarkdownText: 'View',
}));

vi.mock('expo-video', () => ({
  VideoView: 'VideoView',
  useVideoPlayer: () => ({}),
}));
