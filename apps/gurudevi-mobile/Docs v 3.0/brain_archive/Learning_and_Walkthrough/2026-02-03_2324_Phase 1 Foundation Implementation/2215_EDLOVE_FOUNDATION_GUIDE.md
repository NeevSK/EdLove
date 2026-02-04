# EdLove Foundation Implementation Guide

> **Your foundation is ready!** 🎉

---

## 🎊 What Was Created

### 1. **Theme System** ([Theme.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/edlove-web/src/constants/Theme.ts))

**Complete design system with:**
- ✅ **Colors**: Deep Indigo, Warm Gold, Soft White + full palette
- ✅ **Typography**: Cinzel (display), Libre Baskerville (headings), Inter (body)
- ✅ **Spacing**: 8px base grid (xs to 3xl)
- ✅ **Shadows**: Soft, layered shadows (sm to glow)
- ✅ **Motion**: Contemplative pacing (fast to contemplative)
- ✅ **Components**: Button, Card, Input presets
- ✅ **Accessibility**: WCAG AA compliance built-in

**Based on:** Your Docs/02_DESIGN.md (cinematic aesthetic)

---

### 2. **TypeScript Types** ([types/index.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/edlove-web/src/types/index.ts))

**Complete data models:**
- ✅ **User** & Authentication types
- ✅ **Content**: Paradigm, Thinker, Guide, Story, Framework
- ✅ **Community**: Discussion, Reply, CommunityMember
- ✅ **Domain II**: SchoolData, EducationMetric
- ✅ **Domain III**: GurudeviUser, GurudeviInsight
- ✅ **API**: APIResponse, PaginatedResponse
- ✅ **Forms**: Newsletter, Contact, ResourceSubmission
- ✅ **UI State**: Navigation, Toast, Modal
- ✅ **Utility Types**: PartialDeep, WithId, OmitTimestamps

---

### 3. **API Client** ([lib/api.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/edlove-web/src/lib/api.ts))

**Complete HTTP client with:**
- ✅ GET/POST/PUT/DELETE/PATCH methods
- ✅ Error handling (APIError, NetworkError, ValidationError)
- ✅ Timeout protection (10s default)
- ✅ Typed endpoints for all content types
- ✅ Search API
- ✅ Community API (discussions, replies)
- ✅ Forms API (newsletter, contact, resource submission)
- ✅ Analytics API

**Usage:**
```typescript
import { api } from '@/lib/api';

// Get all paradigms
const paradigms = await api.paradigms.getAll();

// Search content
const results = await api.search.search('Montessori');

// Create discussion
const discussion = await api.community.discussions.create({
  title: 'Question about...',
  content: '...',
});
```

---

### 4. **Utility Functions** ([utils/helpers.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/edlove-web/src/utils/helpers.ts))

**Helper functions:**
- ✅ **String**: slugify, truncate, capitalize, toTitleCase
- ✅ **Date**: formatDate, getRelativeTime, calculateReadingTime
- ✅ **Validation**: isValidEmail, isValidURL, isEmpty
- ✅ **Array**: uniqueArray, shuffleArray, groupBy
- ✅ **Storage**: saveToLocalStorage, loadFromLocalStorage
- ✅ **Color**: hexToRgba
- ✅ **Scroll**: scrollToElement, isInViewport
- ✅ **Clipboard**: copyToClipboard
- ✅ **Performance**: debounce, throttle
- ✅ **Random**: generateId, randomItem, randomInRange
- ✅ **CSS**: cn (className utility)

---

## 🚀 Setup Instructions

### Step 1: Update `tsconfig.json`

Add path aliases for clean imports:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/types": ["./src/types"],
      "@/constants/*": ["./src/constants/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

**Why?** Import like this:
```typescript
// Instead of:
import { Theme } from '../../../constants/Theme';

// Do this:
import { Theme } from '@/constants/Theme';
```

---

### Step 2: Load Fonts

Add to `src/styles/global.css`:

```css
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Libre+Baskerville:wght@400;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');

/* CSS Variables from Theme */
:root {
  /* Colors - Primary */
  --color-indigo: #2D3561;
  --color-gold: #D4A574;
  --color-white: #F5F1E8;

  /* Colors - Secondary */
  --color-green: #4A6357;
  --color-rose: #E8B4B8;
  --color-blue: #A8C5D6;

  /* Colors - Accents */
  --color-purple: #9B7EBD;
  --color-ember: #E07A5F;
  --color-silver: #E8F4F8;

  /* Colors - Dark Mode */
  --color-night: #1A1C2E;
  --color-cream: #E8E4DB;

  /* Typography */
  --font-display: 'Cinzel', serif;
  --font-heading: 'Libre Baskerville', serif;
  --font-body: 'Inter', sans-serif;
  --font-code: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;
  --space-2xl: 128px;
  --space-3xl: 192px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(45,53,97,0.08);
  --shadow-md: 0 4px 12px rgba(45,53,97,0.10);
  --shadow-lg: 0 8px 32px rgba(45,53,97,0.12);
  --shadow-glow: 0 0 24px rgba(212,165,116,0.25);

  /* Transitions */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 200ms;
  --duration-default: 300ms;
  --duration-slow: 500ms;
  --duration-contemplative: 800ms;
}

/* Base styles */
body {
  font-family: var(--font-body);
  color: var(--color-indigo);
  background-color: var(--color-white);
  line-height: 1.7;
  font-size: 16px;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  color: var(--color-indigo);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
```

---

### Step 3: Set Environment Variable

Create `.env` file:

```env
PUBLIC_API_URL=http://localhost:3000/api
```

Or for production:
```env
PUBLIC_API_URL=https://api.edlove.org
```

---

## 💡 Usage Examples

### Using Theme in Astro Components

```astro
---
// MyComponent.astro
import { Theme } from '@/constants/Theme';
---

<div class="card">
  <h2>Beautiful Design</h2>
  <p>Using EdLove theme system!</p>
  <button class="primary-btn">Click Me</button>
</div>

<style>
  .card {
    background: var(--color-white);
    border-radius: ${Theme.corners.md}px;
    padding: ${Theme.spacing.lg}px;
    box-shadow: var(--shadow-sm);
  }

  h2 {
    font-family: var(--font-heading);
    color: var(--color-indigo);
    font-size: ${Theme.typography.fontSize.h2}px;
  }

  .primary-btn {
    background: var(--color-gold);
    color: var(--color-indigo);
    border-radius: var(--radius-sm);
    padding: 12px 28px;
    font-weight: 500;
    transition: all var(--duration-default) var(--ease-default);
  }

  .primary-btn:hover {
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }
</style>
```

---

### Using Types

```typescript
// In any .ts or .astro file
import type { Paradigm, Thinker, Guide } from '@/types';

function displayParadigm(paradigm: Paradigm) {
  // TypeScript knows all fields! Autocomplete works!
  console.log(paradigm.title);
  console.log(paradigm.color);
  console.log(paradigm.key_principles);
}
```

---

### Using API Client

```typescript
---
// pages/paradigms/index.astro
import { api } from '@/lib/api';
import type { Paradigm } from '@/types';

// Fetch data at build time
let paradigms: Paradigm[] = [];
let error: string | null = null;

try {
  paradigms = await api.paradigms.getAll();
} catch (err) {
  error = err instanceof Error ? err.message : 'Failed to load paradigms';
}
---

{error ? (
  <p>Error: {error}</p>
) : (
  <div class="paradigms-grid">
    {paradigms.map(paradigm => (
      <div class="paradigm-card">
        <h3>{paradigm.title}</h3>
        <p>{paradigm.tagline}</p>
      </div>
    ))}
  </div>
)}
```

---

### Using Utilities

```typescript
import { 
  slugify, 
  formatDate, 
  truncate,
  calculateReadingTime,
  isValidEmail,
} from '@/utils/helpers';

// Create slug from title
const slug = slugify('Maria Montessori'); // → 'maria-montessori'

// Format date
const date = formatDate('2026-02-03'); // → 'February 3, 2026'

// Truncate text
const excerpt = truncate(longText, 150); // → '...'

// Calculate reading time
const readTime = calculateReadingTime(article); // → 5 (minutes)

// Validate email
const valid = isValidEmail('user@example.com'); // → true
```

---

## 🎨 Component Examples

### Button Component

```astro
---
// components/ui/Button.astro
import { Theme } from '@/constants/Theme';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  href?: string;
}

const { variant = 'primary', href } = Astro.props;
const Tag = href ? 'a' : 'button';
---

<Tag 
  class={`btn btn-${variant}`} 
  href={href}
>
  <slot />
</Tag>

<style>
  .btn {
    border-radius: var(--radius-sm);
    padding: 12px 28px;
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 15px;
    transition: all var(--duration-default) var(--ease-default);
    cursor: pointer;
    border: none;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary {
    background: var(--color-gold);
    color: var(--color-indigo);
  }

  .btn-primary:hover {
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: transparent;
    color: var(--color-indigo);
    border: 1.5px solid rgba(45, 53, 97, 0.4);
  }

  .btn-secondary:hover {
    background: var(--color-silver);
  }

  .btn-ghost {
    background: transparent;
    color: var(--color-indigo);
  }

  .btn-ghost:hover {
    color: var(--color-blue);
  }
</style>
```

**Usage:**
```astro
<Button variant="primary">Get Started</Button>
<Button variant="secondary" href="/about">Learn More</Button>
<Button variant="ghost">Cancel</Button>
```

---

### Card Component

```astro
---
// components/ui/Card.astro
import { Theme } from '@/constants/Theme';

interface Props {
  elevated?: boolean;
}

const { elevated = false } = Astro.props;
---

<div class={`card ${elevated ? 'card-elevated' : ''}`}>
  <slot />
</div>

<style>
  .card {
    background: var(--color-white);
    border: 1px solid rgba(45, 53, 97, 0.08);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-default) var(--ease-default);
  }

  .card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .card-elevated {
    box-shadow: var(--shadow-md);
  }
</style>
```

---

## ✅ Best Practices

### 1. **Always Use Theme Constants**

❌ **Bad:**
```css
.my-button {
  background: #D4A574;
  padding: 28px;
  border-radius: 4px;
}
```

✅ **Good:**
```css
.my-button {
  background: var(--color-gold);
  padding: var(--space-lg);
  border-radius: var(--radius-sm);
}
```

---

### 2. **Use TypeScript Types**

❌ **Bad:**
```typescript
async function getParadigms() {
  const response = await fetch('/api/paradigms');
  const data = await response.json();
  return data; // No type safety!
}
```

✅ **Good:**
```typescript
import { api } from '@/lib/api';
import type { Paradigm } from '@/types';

async function getParadigms(): Promise<Paradigm[]> {
  return api.paradigms.getAll(); // Typed & error handled!
}
```

---

### 3. **Use Path Aliases**

❌ **Bad:**
```typescript
import { Theme } from '../../../constants/Theme';
import type { User } from '../../../types';
import { api } from '../../../lib/api';
```

✅ **Good:**
```typescript
import { Theme } from '@/constants/Theme';
import type { User } from '@/types';
import { api } from '@/lib/api';
```

---

### 4. **Use Utility Functions**

❌ **Bad:**
```typescript
const slug = title.toLowerCase().replace(/ /g, '-');
const date = new Date(dateString).toLocaleDateString();
const isValid = /^\S+@\S+\.\S+$/.test(email);
```

✅ **Good:**
```typescript
import { slugify, formatDate, isValidEmail } from '@/utils/helpers';

const slug = slugify(title);
const date = formatDate(dateString);
const isValid = isValidEmail(email);
```

---

## 🚀 Next Steps

### Phase 1: Test Foundation ✅

1. Update `tsconfig.json` with path aliases
2. Add fonts to `global.css`
3. Create `.env` with API URL
4. Test importing Theme/Types/API in a component

---

### Phase 2: Build First Feature

**Recommended:** Build Paradigm Cosmos (Domain I)

1. Create `/src/pages/paradigms/index.astro`
2. Use `api.paradigms.getAll()` to fetch data
3. Display paradigm cards using Theme
4. Add TypeScript types for type safety

**Example starter:**
```astro
---
import { api } from '@/lib/api';
import { Theme } from '@/constants/Theme';
import type { Paradigm } from '@/types';

const paradigms = await api.paradigms.getAll();
---

<div class="paradigms-page">
  <h1>Paradigm Cosmos</h1>
  <div class="paradigms-grid">
    {paradigms.map(paradigm => (
      <div class="paradigm-card" style={`border-left: 4px solid ${paradigm.color}`}>
        <h3>{paradigm.title}</h3>
        <p>{paradigm.tagline}</p>
      </div>
    ))}
  </div>
</div>

<style>
  .paradigms-page {
    padding: var(--space-2xl) var(--space-xl);
  }

  h1 {
    font-family: var(--font-heading);
    font-size: var(--22px);
    color: var(--color-indigo);
    margin-bottom: var(--space-xl);
  }

  .paradigms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-lg);
  }

  .paradigm-card {
    background: var(--color-white);
    padding: var(--space-lg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-default) var(--ease-default);
  }

  .paradigm-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  h3 {
    font-family: var(--font-heading);
    color: var(--color-indigo);
    margin-bottom: var(--space-sm);
  }

  p {
    color: rgba(45, 53, 97, 0.7);
    line-height: 1.7;
  }
</style>
```

---

## 🎉 You're Ready!

**Foundation Complete:**
- ✅ Theme system (colors, typography, spacing, components)
- ✅ TypeScript types (all data models)
- ✅ API client (typed endpoints, error handling)
- ✅ Utility functions (helpers for common tasks)

**Next:**
1. Test imports
2. Build first feature (Paradigm Cosmos)
3. Follow EdLove's cinematic aesthetic!

**Remember:**
- Use Theme constants (never hardcode!)
- Use TypeScript types (autocomplete & safety!)
- Use API client (clean, typed requests!)
- Use utils (DRY principle!)

---

**Your EdLove foundation is solid!** 🪷 Now build something beautiful!
