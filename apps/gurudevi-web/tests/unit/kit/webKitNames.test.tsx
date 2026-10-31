import * as web from '@repo/ui/components/web';
import { describe, expect, it } from 'vitest';

/** Pieces both sets must have; the native suite checks the same list. */
const SHARED = [
  'ActionFab',
  'AudioRecord',
  'AppHeader',
  'ApprovalCard',
  'ArtifactCard',
  'Button',
  'Card',
  'Carousel',
  'ChoiceQuestion',
  'ChoiceRow',
  'Citation',
  'Composer',
  'DangerRow',
  'DateField',
  'Disclosure',
  'DateTravel',
  'DocumentView',
  'FabMenu',
  'FileField',
  'FileCard',
  'Grid',
  'Group',
  'Icon',
  'ImageCapture',
  'Inline',
  'LinkRow',
  'Markdown',
  'Media',
  'MonthGrid',
  'Notice',
  'MediaAdapters',
  'MessageActions',
  'MessageBubble',
  'MessageList',
  'NotificationItem',
  'NumberStepper',
  'PrivacyNote',
  'PrivacyState',
  'Rail',
  'RichTextEditor',
  'RunStatus',
  'Scale',
  'SearchField',
  'Stack',
  'Steps',
  'SwitchRow',
  'TaskTabs',
  'ThinkingTrace',
  'TimeAgo',
  'TimeField',
  'Timeline',
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
