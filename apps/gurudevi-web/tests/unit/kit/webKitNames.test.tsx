import * as web from '@repo/ui/components/web';
import { describe, expect, it } from 'vitest';

/** Pieces both sets must have; the native suite checks the same list. */
const SHARED = [
  'ActionFab',
  'ApprovalCard',
  'ArtifactCard',
  'Button',
  'Card',
  'Carousel',
  'ChoiceQuestion',
  'Citation',
  'Composer',
  'DocumentView',
  'FabMenu',
  'FileCard',
  'Grid',
  'Group',
  'Icon',
  'Inline',
  'Markdown',
  'MediaAdapters',
  'MessageActions',
  'MessageBubble',
  'MessageList',
  'PrivacyNote',
  'PrivacyState',
  'Rail',
  'RichTextEditor',
  'RunStatus',
  'Scale',
  'Stack',
  'ThinkingTrace',
  'ToolCallCard',
];

const components = Object.entries(web).flatMap(([name, value]) =>
  /^[A-Z]/.test(name) && typeof value === 'function' ? [{ name, fn: value }] : [],
);

describe('web kit pieces are named in the component tree', () => {
  it('every component shows under its own name in React DevTools', () => {
    expect(components.length).toBeGreaterThan(30);
    for (const { name, fn } of components) expect(fn.name, name).toBe(name);
  });

  it('has the pieces the native set has, under the same names', () => {
    const names = new Set(components.map(({ name }) => name));
    for (const name of SHARED) expect(names.has(name), name).toBe(true);
  });
});
