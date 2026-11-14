# Frontier Discovery & Convivial Experience Architecture (2026+)

> **Author**: Polymath Platform Solution Architecture & Senior Engineering  
> **Status**: APPROVED ARCHITECTURAL SPECIFICATION & OPERATIONAL ROADMAP  
> **Invariants Enforced**: Linguistic Orthographic Integrity (Zero Long-Vowel Slop), WhatsApp 300KB Boundary, AI-Native Content Negotiation, Rural Offline Continuity.  
> **Date**: October 2026

---

## 1. Executive Summary

This specification articulates the frontier architectural roadmap for the **Gurudevi + EdLove Constellation**, translating high-velocity AI agentic discovery and Sri Lankan ground realities into hardened production mechanics.

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                     THE 5 FRONTIER CONVIVIAL PILLARS                     │
 ├────────────────────────────────┬─────────────────────────────────────────┤
 │ 1. AI Content Negotiation      │ Accept: text/markdown edge streaming    │
 │ 2. Dynamic WhatsApp Edge OG    │ Sub-50KB Satori cards (defeats 300KB cap│
 │ 3. Dynamic Institutional SVGs  │ Embeddable [school].gurudevi.app shields│
 │ 4. Trilingual Micro-Dispatcher │ One-tap cultural WhatsApp link sharing  │
 │ 5. Rural Offline PWA Engine    │ Train & bus continuity without cellular │
 └────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. Pillar 1: AI-Native Content Negotiation (`Accept: text/markdown`)

### The Problem
When an AI agent (Cursor, Claude Code, ChatGPT Search, Perplexity) crawls `https://gurudevi.app/about` or `/journal/[slug]`, it downloads over 200KB of HTML, Tailwind classes, and React hydration bundles. Over 85% of its LLM context window tokens are consumed by layout noise rather than educational substance.

### The Specification
In `apps/gurudevi-web/proxy.ts` and Next.js App Router handlers:
1. Inspect the incoming HTTP `Accept` header.
2. If `Accept` includes `text/markdown` or `text/x-markdown` (or query param `?format=md`):
   - Bypass HTML hydration.
   - Respond immediately with pure, clean, token-dense Markdown with `Content-Type: text/markdown; charset=utf-8`.
3. If `Accept` includes standard `text/html`:
   - Serve the full interactive web application.

```typescript
// Architectural Pattern for Content Negotiation in Edge Proxy
if (request.headers.get('accept')?.includes('text/markdown')) {
  const markdownUrl = request.nextUrl.clone();
  markdownUrl.searchParams.set('format', 'markdown');
  return NextResponse.rewrite(markdownUrl);
}
```

---

## 3. Pillar 2: Dynamic Edge OpenGraph (`@vercel/og`) & The WhatsApp 300KB Rule

### The Ground Reality in Sri Lanka
Over 90% of school-parent circles, teacher staff rooms, and alumni groups communicate via **WhatsApp and Telegram**. 

### The 300KB Hard Limit
WhatsApp’s mobile crawler strictly drops any OpenGraph preview image larger than **300 KB**. Our original static PNGs (`og-image.png`, `hero-teacher-editorial.png`) weighed **1.68 MB**, causing WhatsApp to silently drop preview cards and render plain blue links on slow 3G/4G connections.

### The Solution: Edge Satori Generators
Implement dynamic Edge OpenGraph routes in `apps/gurudevi-web`:
- `app/opengraph-image.tsx` (Root & Explore)
- `app/journal/[slug]/opengraph-image.tsx` (Per-article dynamic cards)

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  // Dynamically renders title, reading time, and author in < 45KB payload
  return new ImageResponse(
    (
      <div style={{ display: 'flex', background: '#faf7f2', width: '100%', height: '100%', padding: '60px' }}>
        <h1 style={{ fontSize: 64, color: '#1a1714', fontFamily: 'serif' }}>{title}</h1>
        <p style={{ color: '#c99436' }}>Gurudevi Journal · {readingTime} min read</p>
      </div>
    ),
    { ...size }
  );
}
```

---

## 4. Pillar 3: Dynamic Institutional SVG Shields (`/badge.svg`)

Each institutional subdomain (`https://[school].gurudevi.app`) provides a dynamic, cacheable SVG shield that schools can embed on their official websites, GitHub repositories, or circulars:

```
[ 🕊️ Gurudevi | Verified Sanctuary · Ananda College Colombo · 2026 ]
```

- **Route**: `app/school/[handle]/badge.svg/route.ts`
- **Output**: Pure SVG vector (`image/svg+xml`), zero client JavaScript, 2KB size.
- **Cache-Control**: `public, max-age=86400, s-maxage=604800, stale-while-revalidate`.

---

## 5. Pillar 4: Trilingual Cultural WhatsApp Micro-Card Dispatcher

Every public article and school profile includes an intentional **"Share to WhatsApp"** and **"Share to Telegram"** button that pre-populates trilingual cultural metadata:

```text
🕊️ Why Gurudevi Begins with Care
"The people around learning deserve support that gives energy back rather than asking them to carry more."

📖 3 min read · ගුරුදෙවි අධ්‍යාපන කෙම්බිම
🔗 https://gurudevi.app/journal/why-gurudevi-begins-with-care
```

---

## 6. Pillar 5: Rural Offline PWA Continuity ("The Train & Bus Invariant")

Teachers in Sri Lanka frequently commute between rural provinces without reliable cellular data (e.g. Upcountry railway lines, remote agricultural valleys).

### The Architecture
1. **Service Worker Cache Target**:
   - Pre-caches the user's active floor state (`/self`, `/workspace`).
   - Caches instructional timetable and student roster in IndexedDB / local MMKV proxy.
2. **Offline Reflection Queue**:
   - Teachers write **FireJournal** entries or record somatic check-ins while completely offline.
   - Mutations are queued locally with synthetic timestamps.
   - Upon network reconnection at the next railway station, the background sync queue drains seamlessly. Zero lost thoughts.

---

## 7. The Sacred Orthographic Invariant (Sinhala & Tamil)

### The Linguistic Truth
The name **Gurudevi** represents the reverent concept of the *Divine Teacher* (Guru-Devi):
- **Sinhala**: MUST ALWAYS be written as **`ගුරුදෙවි`** (short-vowel `දෙ`, representing divine teacher / spiritual guide).
  - ❌ **STRICTLY FORBIDDEN**: Long-vowel **`ගුරුදේවි`** or **`ගුරුදේවී`** (which alters the meaning to female goddess / queen or misrepresents the philosophical intent).
- **Tamil**: MUST ALWAYS be written as **`குருதெவி`** (short-vowel `தெ`).
  - ❌ **STRICTLY FORBIDDEN**: Long-vowel **`குருதேவி`** or **`குருதேவீ`**.

### The Automated Zero-Tolerance Quality Gate
Any occurrence of the forbidden long-vowel forms in `apps/gurudevi-web`, `apps/edlove-web`, `packages/*`, or documentation triggers an immediate test failure in:
`apps/gurudevi-web/tests/unit/seo/i18nOrthographyEnforcement.test.ts`
