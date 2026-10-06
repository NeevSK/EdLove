---
title: "Slice Pattern — Gurudevi Web Implementation Template"
status: active
created: 2026-09-26
updated: 2026-09-26
tags: [slice, pattern, template, implementation]
---

# Slice Pattern — Implementation Template

This document captures the proven implementation pattern from the **Self Journal slice** (Phase 2). Use this as the template for all subsequent slices (Workspace, Library, Explore, Community, Profile).

---

## Slice Definition

A **slice** is a single user-facing feature vertical that:
- Has a clear entry point (route)
- Owns its data operations (API calls)
- Renders its own UI states (loading, empty, error, ready)
- Is independently testable at G2/G3 levels
- Maps 1:1 with a mobile feature (parity target)

---

## File Structure Per Slice

```
apps/gurudevi-web/
├── app/(sanctuary)/<slice>/
│   ├── page.tsx              # Server component - fetches data, renders floor
│   ├── <Slice>Floor.tsx      # Client component - interactive UI
│   └── <slice>.module.css    # Slice-specific styles
├── lib/sanctuary/
│   ├── <slice>.ts            # API functions (loadX, createX, updateX, deleteX)
│   └── <slice>ApiClient.ts   # ORPC/REST client (if new endpoints)
└── tests/
    ├── integration/
    │   ├── <slice>.test.tsx          # G2: API functions + component (jsdom)
    │   └── <slice>.component.test.tsx # G2: Component only (jsdom)
    └── e2e/
        └── <slice>.spec.ts           # G3: Real browser (Playwright)
```

---

## 1. API Layer (`lib/sanctuary/<slice>.ts`)

```typescript
// Pure functions calling selfApiClient/requestAccountSelfProcedure
// No React, no hooks, pure TypeScript

export type SliceItem = Readonly<{
  id: string;
  // ... domain fields
}>;

export function loadSliceItems(limit = 12): Promise<readonly SliceItem[]> {
  return requestAccountSelfProcedure('getSliceItems', { query: { limit } }, predicate, 'error msg');
}

export function createSliceItem(input: SliceInput): Promise<SliceItem> {
  return requestAccountSelfProcedure('createSliceItem', { body: input }, predicate, 'error msg');
}

export function updateSliceItem(id: string, input: SliceInput): Promise<SliceItem> {
  return requestAccountSelfProcedure('updateSliceItem', { body: { id, ...input } }, predicate, 'error msg');
}

export function deleteSliceItem(id: string): Promise<void> {
  return requestAccountSelfProcedure('deleteSliceItem', { body: { id } }, voidPredicate, 'error msg');
}

// Type guards for response validation
function isSliceItem(value: unknown): value is SliceItem { /* ... */ }
```

---

## 2. Feature Catalog Integration

**Mobile parity:** Each slice maps to a `FEATURE_CATALOG` entry in `@repo/self/features/featureCatalog.ts`

```typescript
// featureCatalog.ts entry (already exists for Self)
my_slice: {
  id: 'my_slice',
  label: 'My Slice',
  emoji: '🎯',
  componentId: 'MySliceComponent',
  category: 'growth',
  domain: 'my-domain',
  requiredCapabilities: ['read:MyCapability'],
  minCitizenship: 3,
  defaultZone: 'today',
  defaultOrder: 100,
  energyVibe: ['#EFF6FF', '#DBEAFE'],
  isPinnable: true,
  isHidable: true,
  delivery: { native: 'runnable', browser: 'runnable' },
}
```

**Browser registry** (`app/(sanctuary)/<slice>/browserFeatureRegistry.ts`):
```typescript
export const BROWSER_MY_SLICE_FEATURES = {
  my_slice: { renderer: 'my-slice-renderer', taskKind: 'task' },
};
```

---

## 3. Floor Component (`app/(sanctuary)/<slice>/<Slice>Floor.tsx`)

```tsx
'use client';

import { resolveSelfFeatureManifest } from '@repo/self/features/featureManifest';
import { FeatureStateBoundary } from '@repo/ui/components/FeatureStateBoundary.web';
import { BrandPulse, BrandedEmptyState, ErrorState } from '@repo/ui/components';
import { useDomainWorkbench } from '@/lib/workbench';
import { loadSliceItems, createSliceItem, deleteSliceItem } from '@/lib/sanctuary/<slice>';

const SLICE_FEATURE_MANIFEST = resolveSelfFeatureManifest(
  null,
  { customOrder: [], hiddenIds: [], selectedIds: [] },
  'browser',
  { deliveredFeatureIds: Object.keys(BROWSER_MY_SLICE_FEATURES) },
);

const mySliceFeature = requiredFeature('my_slice');

type ScreenState = Readonly<{
  draft: string;
  items: readonly SliceItem[];
  error: string | null;
  status: 'loading' | 'ready' | 'error';
  isCreating: boolean;
}>;

export function SliceFloor({ displayName }: Readonly<{ displayName: string }>) {
  const [screen, setScreen] = useState<ScreenState>(initialScreen);
  const workbench = useDomainWorkbench('my-slice');

  const loadItems = useCallback(async () => {
    setScreen(c => ({ ...c, error: null, status: 'loading' }));
    try {
      const items = await loadSliceItems();
      setScreen(c => ({ ...c, items, status: 'ready' }));
    } catch (error) {
      setScreen(c => ({ ...c, error: error.message, status: 'error' }));
    }
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!screen.draft.trim() || screen.isCreating) return;
    setScreen(c => ({ ...c, error: null, isCreating: true }));
    try {
      const item = await createSliceItem({ content: screen.draft.trim() });
      setScreen(c => ({ ...c, draft: '', items: [item, ...c.items], isCreating: false }));
    } catch (error) {
      setScreen(c => ({ ...c, error: error.message, isCreating: false }));
    }
  }

  // Render with FeatureStateBoundary for branded states
  return (
    <article aria-labelledby="slice-title" data-domain="my-slice">
      <header>
        <h1 id="slice-title">{mySliceFeature.label}</h1>
      </header>
      <FeatureStateBoundary
        snapshot={{
          state: screen.status,
          canRetry: screen.status === 'error',
          safeMessage: screen.status === 'loading' ? 'Loading...' : screen.error ?? 'Ready.',
        }}
        onRetry={loadItems}
        emptyTitle="No items yet"
      >
        <form onSubmit={handleCreate}>
          <textarea value={screen.draft} onChange={e => setScreen(c => ({ ...c, draft: e.target.value }))} />
          <button disabled={screen.isCreating}>
            {screen.isCreating ? 'Creating…' : 'Create'}
          </button>
        </form>
        <ul>
          {screen.items.map(item => (
            <li key={item.id}>{item.content_preview}</li>
          ))}
        </ul>
      </FeatureStateBoundary>
    </article>
  );
}
```

---

## 4. Route Page (`app/(sanctuary)/<slice>/page.tsx`)

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveAuthorizedEntry } from '@/lib/sanctuary/authorizedEntry';
import { SliceFloor } from './SliceFloor';

export default async function SlicePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <Unavailable />;

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind !== 'active') return <SignInPrompt />;

  return <SliceFloor displayName={entry.displayName} />;
}
```

---

## 5. G2 Tests (`tests/integration/<slice>.test.tsx`)

```typescript
// API function tests (node environment)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSliceItems, createSliceItem } from '@/lib/sanctuary/<slice>';

vi.mock('@/lib/sanctuary/selfApiClient', () => ({
  requestAccountSelfProcedure: vi.fn(),
}));

import { requestAccountSelfProcedure } from '@/lib/sanctuary/selfApiClient';

describe('<Slice> API Functions (G2)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads items successfully', async () => {
    const mockItems = [{ id: '1', content_preview: 'Test' }];
    vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockItems);
    const items = await loadSliceItems(5);
    expect(requestAccountSelfProcedure).toHaveBeenCalledWith(
      'getSliceItems', { query: { limit: 5 } }, expect.any(Function), expect.any(String)
    );
    expect(items).toEqual(mockItems);
  });

  it('creates item successfully', async () => {
    const mockItem = { id: 'new-1', content_preview: 'New item' };
    vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockItem);
    const item = await createSliceItem({ content: 'New item' });
    expect(item).toEqual(mockItem);
  });

  it('handles errors gracefully', async () => {
    vi.mocked(requestAccountSelfProcedure).mockRejectedValue(new Error('Service down'));
    await expect(loadSliceItems()).rejects.toThrow('Service down');
  });
});
```

---

## 6. G2 Component Tests (`tests/integration/<slice>.component.test.tsx`)

```typescript
// Component tests (jsdom environment)
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SliceFloor } from '@/app/(sanctuary)/<slice>/SliceFloor';

vi.mock('@/lib/sanctuary/selfApiClient', () => ({
  requestAccountSelfProcedure: vi.fn(),
}));

describe('<Slice>Floor Component (G2 — jsdom)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders overview with branded empty state', () => {
    render(<SliceFloor displayName="Test User" />);
    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('creates item and shows in list', async () => {
    const mockItem = { id: '1', content_preview: 'Test item' };
    const { requestAccountSelfProcedure } = await import('@/lib/sanctuary/selfApiClient');
    vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockItem);

    const user = userEvent.setup();
    render(<SliceFloor displayName="Test User" />);
    await user.type(screen.getByRole('textbox'), 'Test item');
    await user.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(screen.getByText('Test item')).toBeInTheDocument());
  });

  it('shows error state on failure', async () => {
    const { requestAccountSelfProcedure } = await import('@/lib/sanctuary/selfApiClient');
    vi.mocked(requestAccountSelfProcedure).mockRejectedValueOnce(new Error('Failed'));

    const user = userEvent.setup();
    render(<SliceFloor displayName="Test User" />);
    await user.type(screen.getByRole('textbox'), 'Fail');
    await user.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
```

---

## 7. G3 E2E Tests (`tests/e2e/<slice>.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('<Slice> G3 E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in
    await page.goto('/sign-in?returnTo=/%2Fmy-slice');
    await page.fill('#email', 'e2e-test@gurudevi.app');
    await page.fill('#password', 'TestPassword123!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/my-slice/);
  });

  test('loads slice and shows items', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /my slice/i })).toBeVisible();
    await expect(page.getByText(/no items yet/i)).toBeVisible();
  });

  test('creates new item', async ({ page }) => {
    await page.getByRole('textbox').fill('E2E test item');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText('E2E test item')).toBeVisible({ timeout: 10000 });
  });

  test('shows error on failure', async ({ page }) => {
    await page.route('**/api/sanctuary/**', route => route.fulfill({ status: 500 }));
    await page.getByRole('textbox').fill('Fail');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });
});
```

---

## 8. Branded UI Components (Required)

| State | Component | Import |
|-------|-----------|--------|
| Loading | `BrandPulse` | `@repo/ui/components/BrandPulse` |
| Empty | `BrandedEmptyState` | `@repo/ui/components/BrandedEmptyState` |
| Error | `ErrorState` | `@repo/ui/components/ErrorState` |
| Boundary | `FeatureStateBoundary` | `@repo/ui/components/FeatureStateBoundary.web` |

Usage:
```tsx
<FeatureStateBoundary
  snapshot={{ state: 'loading', safeMessage: 'Loading...' }}
  onRetry={loadItems}
  emptyTitle="Nothing here yet"
/>
```

---

## 9. Quality Gates (Per Slice)

| Gate | Command | Evidence |
|------|---------|----------|
| Types | `pnpm check-types` | G0 |
| Lint | `pnpm lint` | G0 |
| G1 Unit | `pnpm test:g1:*` | G1 |
| G2 API | `pnpm test:g2:<slice>` | G2 |
| G2 Component | `pnpm test:g2:<slice> --project=component` | G2 |
| G3 E2E | `pnpm test:e2e <slice>` | G3 |
| Build | `pnpm build` | G0 |

---

## 10. Slice Checklist

- [ ] API functions in `lib/sanctuary/<slice>.ts`
- [ ] Feature catalog entry exists
- [ ] Browser feature registry entry
- [ ] Floor component with branded states
- [ ] Route page with server-side auth
- [ ] G2 API tests (node) passing
- [ ] G2 Component tests (jsdom) passing
- [ ] G3 E2E tests (Playwright) passing
- [ ] Desktop responsive styles (`@media (min-width: 768px)`)
- [ ] Accessibility: skip links, focus rings, ARIA labels
- [ ] Added to `vitest.config.ts` projects
- [ ] Added to package.json scripts

---

## Next Slices Priority Order

1. **Workspace** — Attendance, classroom management (high value, exercises real-time)
2. **Library** — Content consumption, document viewing
3. **Explore** — Self reflection, profile, notifications, settings
4. **Community** — Groups, messages, announcements
5. **Profile** — Account settings, privacy, deletion

Each slice follows this exact pattern. The Self Journal slice is the reference implementation.