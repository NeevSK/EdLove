---
title: "Gurudevi â€” Web Layout Guide"
status: "active"
created: 2026-03-04
updated: 2026-05-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi — Web Layout Guide
*Agent rules + frame architecture + top bar + sidebar + responsive*

---

## The Mental Model

Mobile and web are two separate worlds sharing the same logic.

```
Same:          hooks, state, API calls, types, business logic
Different:     everything visual — layout, components, styling
```

Only 5 files change. Everything else is untouched.

```
app/(tabs)/
  index.web.tsx          ← Self screen, web only
  community.web.tsx      ← Community screen, web only
  library.web.tsx        ← Library screen, web only
  profile.web.tsx        ← Profile screen, web only
  classroom.web.tsx      ← Classroom screen, web only
  _layout.web.tsx        ← Web shell (top bar + sidebar), web only
```

The pattern inside every `.web.tsx` screen:

```tsx
// The web screen is just a frame
// Existing RN components sit inside it unchanged
export default function CommunityScreenWeb() {
  // same hooks as mobile
  const { posts, loading } = useCommunityFeed()

  return (
    // web layout frame
    <div className="sanctuary-screen">
      <div className="screen-content">
        {/* existing components, mostly unchanged */}
        <CommunityFeed posts={posts} />
      </div>
    </div>
  )
}
```

---

## Agent Rules — Paste This Before Every Web Task

```
GURUDEVI WEB CONTEXT — READ BEFORE WRITING ANY CODE

This is a .web.tsx file in an Expo Router pnpm monorepo.

RULES:
1. Use HTML elements: div, main, aside, nav, header, button, p, h1-h6
   NOT: View, Text, ScrollView, Pressable, TouchableOpacity
2. Use className for all styling
   NOT: StyleSheet.create, style={} prop (except dynamic values)
3. Use standard React events: onClick, onMouseMove, onMouseEnter, onMouseLeave
   NOT: onPress, onLongPress
4. DO NOT import from 'react-native' in this file
5. CSS classes are defined in SanctuaryGlobalStyles.tsx
6. Existing RN components from packages can be reused inside the layout frame
7. The layout shell (top bar + sidebar) comes from _layout.web.tsx — do not rebuild it

THREE BREAKPOINTS:
- Mobile:  < 768px   → no sidebar, no top bar (mobile nav handles it)
- Tablet:  768–1023px → top bar only, no sidebar, content full width
- Desktop: 1024px+   → top bar + left sidebar + content

LAYOUT STRUCTURE (desktop):
┌─────────────────────────────────────────┐
│  TOP BAR (fixed, full width, 56px tall) │
├──────────┬──────────────────────────────┤
│          │                              │
│ SIDEBAR  │  SCREEN CONTENT              │
│ (240px)  │  (scrollable)                │
│ (sticky) │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

---

## _layout.web.tsx — The Shell

This file wraps all tab screens on web. It renders the top bar and sidebar
once, and the active screen renders in the content area.

```tsx
// app/(tabs)/_layout.web.tsx
import React, { useState } from 'react'
// This guide now assumes the classic Expo entry + React Navigation stack model.
// Use React Navigation screens/stacks and web-specific `.web.tsx` overrides instead of Expo Router.
import { useAuth } from '@repo/core/hooks/useAuth'
import { SanctuaryGlobalStyles } from '@repo/ui/src/web/SanctuaryGlobalStyles'

const NAV_ITEMS = [
  { label: 'Self',       href: '/',          icon: '♥',  id: 'index'     },
  { label: 'Classroom',  href: '/classroom', icon: '🏛',  id: 'classroom' },
  { label: 'Community',  href: '/community', icon: '🌐',  id: 'community' },
  { label: 'Library',    href: '/library',   icon: '📚',  id: 'library'   },
  { label: 'Profile',    href: '/profile',   icon: '◎',  id: 'profile'   },
]

export default function WebLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/index'
    return pathname.startsWith(href)
  }

  return (
    <>
      <SanctuaryGlobalStyles />

      {/* world background — fixed div, not background-attachment */}
      <div className="world-bg" />

      <div className="web-shell">

        {/* TOP BAR */}
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="brand-lotus">🪷</span>
            <span className="brand-name">Gurudevi</span>
          </div>

          {/* tabs — center on desktop, hidden on mobile (native nav handles it) */}
          <nav className="top-bar-tabs">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`top-tab ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => router.push(item.href)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="top-bar-right">
            <button className="bell-btn" aria-label="Notifications">
              🔔
              <span className="bell-dot" />
            </button>
            <div className="profile-chip">
              <div className="profile-gem">
                {user?.name?.[0] ?? 'N'}
              </div>
              <span className="profile-nm">{user?.name ?? 'Teacher'}</span>
            </div>
          </div>
        </header>

        {/* BODY — sidebar + content */}
        <div className="web-body">

          {/* SIDEBAR — desktop only */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => router.push(item.href)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* SCREEN CONTENT */}
          <main className="screen-content">
            <Slot />
          </main>

        </div>
      </div>
    </>
  )
}
```

---

## SanctuaryGlobalStyles.tsx — The Full CSS

Extend your existing file with all web layout styles.

```tsx
// packages/ui/src/web/SanctuaryGlobalStyles.tsx
import React from 'react'
import { Platform } from 'react-native'

export function SanctuaryGlobalStyles() {
  if (Platform.OS !== 'web') return null

  const css = `
    /* ── FONTS ── */
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

    /* ── TOKENS ── */
    :root {
      --water:       #3a7a9a;
      --water-glow:  rgba(90,154,186,0.25);
      --moss:        #4a7a5a;
      --moss-glow:   rgba(74,122,90,0.25);
      --lotus:       #c05878;
      --lotus-glow:  rgba(192,88,120,0.2);
      --gold:        #a07830;
      --gold-glow:   rgba(160,120,48,0.2);

      --ink:         #2a2820;
      --ink-soft:    #5a5040;
      --ink-ghost:   #9a9080;

      --surface:     rgba(255,255,255,0.88);
      --border:      rgba(200,190,170,0.45);
      --border-light:rgba(255,255,255,0.7);

      --font-display:'IM Fell English', serif;
      --font-body:   'DM Sans', sans-serif;

      --top-bar-h:   56px;
      --sidebar-w:   240px;
      --bp-tablet:   768px;
      --bp-desktop:  1024px;
    }

    /* ── RESET ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); color: var(--ink); overflow-x: hidden; }
    button { background: none; border: none; cursor: pointer; font-family: inherit; }

    /* ── WORLD BACKGROUND ── */
    /* Use a fixed div — more performant than background-attachment: fixed */
    .world-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      background-image: url('/assets/world-bg.jpg');
      background-size: cover;
      background-position: center;
      /* fallback if no image */
      background-color: #eef4f8;
    }
    /* overlay to soften image so cards contrast clearly */
    .world-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(240,246,250,0.55);
    }

    /* ── SHELL ── */
    .web-shell {
      position: relative;
      z-index: 1;
      min-height: 100vh;
    }

    /* ── TOP BAR ── */
    .top-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      height: var(--top-bar-h);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;

      background: rgba(240,248,252,0.78);
      backdrop-filter: blur(24px) saturate(1.5);
      -webkit-backdrop-filter: blur(24px) saturate(1.5);
      border-bottom: 1px solid rgba(180,200,220,0.35);
      box-shadow: 0 1px 0 rgba(255,255,255,0.7), 0 4px 20px rgba(80,90,100,0.06);
    }

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-lotus {
      font-size: 18px;
      filter: drop-shadow(0 0 4px rgba(192,88,120,0.4));
      animation: lotusBreath 5s ease-in-out infinite;
    }
    @keyframes lotusBreath {
      0%,100% { filter: drop-shadow(0 0 4px rgba(192,88,120,0.35)); }
      50%      { filter: drop-shadow(0 0 10px rgba(192,88,120,0.65)); }
    }
    .brand-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-style: italic;
      color: #3a4050;
      letter-spacing: 0.05em;
    }

    /* tabs — center of top bar */
    .top-bar-tabs {
      display: flex;
      align-items: center;
      gap: 2px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .top-tab {
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: rgba(90,100,120,0.55);
      border: 1px solid transparent;
      transition: all 0.25s;
      position: relative;
    }
    .top-tab:hover {
      color: rgba(42,48,64,0.8);
      background: rgba(255,255,255,0.55);
    }
    .top-tab.active {
      color: var(--water);
      background: rgba(255,255,255,0.82);
      border-color: rgba(180,190,210,0.5);
      box-shadow: 0 1px 4px rgba(42,90,122,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.9);
    }
    .top-tab.active::after {
      content: '';
      position: absolute;
      bottom: -7px; left: 50%;
      transform: translateX(-50%);
      width: 3px; height: 3px;
      border-radius: 50%;
      background: var(--water);
      box-shadow: 0 0 5px var(--water);
    }

    /* right side of top bar */
    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .bell-btn {
      position: relative;
      width: 34px; height: 34px;
      border-radius: 8px;
      background: rgba(255,255,255,0.55);
      border: 1px solid rgba(180,190,200,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      color: rgba(90,100,120,0.55);
      transition: all 0.25s;
    }
    .bell-btn:hover {
      background: rgba(255,255,255,0.85);
      color: var(--ink-soft);
    }
    .bell-dot {
      position: absolute;
      top: 7px; right: 7px;
      width: 5px; height: 5px;
      border-radius: 50%;
      background: var(--lotus);
      animation: bellPulse 2.5s ease-out infinite;
    }
    @keyframes bellPulse {
      0%   { box-shadow: 0 0 0 0 rgba(192,88,120,0.6); }
      70%  { box-shadow: 0 0 0 5px rgba(192,88,120,0); }
      100% { box-shadow: 0 0 0 0 rgba(192,88,120,0); }
    }
    .profile-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 12px 4px 4px;
      border-radius: 100px;
      background: rgba(255,255,255,0.55);
      border: 1px solid rgba(180,190,200,0.4);
      transition: all 0.25s;
    }
    .profile-chip:hover {
      background: rgba(255,255,255,0.85);
    }
    .profile-gem {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--water), #5a9aba);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 500; color: white;
      box-shadow: 0 1px 4px rgba(42,90,122,0.25);
    }
    .profile-nm {
      font-size: 12px;
      color: var(--ink-soft);
      font-weight: 300;
    }

    /* ── BODY LAYOUT ── */
    .web-body {
      display: flex;
      padding-top: var(--top-bar-h);
      min-height: 100vh;
    }

    /* ── SIDEBAR ── */
    .sidebar {
      width: var(--sidebar-w);
      flex-shrink: 0;
      position: sticky;
      top: var(--top-bar-h);
      height: calc(100vh - var(--top-bar-h));
      overflow-y: auto;
      padding: 20px 12px;

      background: rgba(240,248,252,0.55);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-right: 1px solid rgba(180,200,220,0.25);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      color: var(--ink-ghost);
      border: 1px solid transparent;
      transition: all 0.22s;
      text-align: left;
      width: 100%;
    }
    .sidebar-item:hover {
      color: var(--ink-soft);
      background: rgba(255,255,255,0.6);
    }
    .sidebar-item.active {
      color: var(--water);
      background: rgba(255,255,255,0.85);
      border-color: rgba(90,154,186,0.25);
      box-shadow: 0 1px 4px rgba(42,90,122,0.07),
                  inset 0 1px 0 rgba(255,255,255,0.9);
    }
    .sidebar-icon {
      font-size: 15px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    .sidebar-label {
      font-weight: 400;
      letter-spacing: 0.01em;
    }

    /* ── SCREEN CONTENT ── */
    .screen-content {
      flex: 1;
      min-width: 0; /* prevents flex overflow */
      overflow-y: auto;
      padding: 40px 36px 80px;
    }

    /* max width container inside each screen */
    .sanctuary-screen {
      max-width: 900px;
    }

    /* ── GREETING ── */
    .greeting { margin-bottom: 40px; }
    .greeting-time {
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--water);
      margin-bottom: 8px;
      font-weight: 500;
    }
    .greeting-main {
      font-family: var(--font-display);
      font-size: 42px;
      font-style: italic;
      color: var(--ink);
      line-height: 1.1;
      margin-bottom: 6px;
      text-shadow: 0 1px 0 rgba(255,255,255,0.6),
                   0 2px 12px rgba(80,60,30,0.08);
    }
    .greeting-note {
      font-family: var(--font-display);
      font-size: 16px;
      font-style: italic;
      color: var(--ink-ghost);
      font-weight: 300;
    }

    /* ── CARDS ── */
    .sanctuary-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      background: linear-gradient(
        160deg,
        rgba(255,255,255,0.94) 0%,
        rgba(252,250,244,0.91) 100%
      );
      border: 1px solid var(--border);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.9),
        0 0 20px rgba(90,154,186,0.08),
        0 0 40px rgba(90,154,186,0.04);
      transition: transform 0.4s cubic-bezier(0.16,1,0.3,1),
                  box-shadow 0.4s ease;
      backdrop-filter: none; /* off by default — performance */
      -webkit-backdrop-filter: none;
    }
    .sanctuary-card:hover {
      transform: translateY(-3px);
      backdrop-filter: blur(10px); /* only on hover */
      -webkit-backdrop-filter: blur(10px);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.95),
        0 0 28px rgba(90,154,186,0.18),
        0 0 56px rgba(90,154,186,0.08),
        0 8px 24px rgba(0,0,0,0.06);
    }

    /* grain on every card */
    .sanctuary-card::after {
      content: '';
      position: absolute; inset: 0;
      border-radius: 16px;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.022;
      pointer-events: none;
      z-index: 0;
      transition: opacity 0.3s;
    }
    .sanctuary-card:hover::after { opacity: 0.038; }

    /* card variants — inner light */
    .card-water { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 20px var(--water-glow), 0 0 40px rgba(90,154,186,0.04); }
    .card-water:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 0 32px var(--water-glow), 0 0 64px rgba(90,154,186,0.08); }
    .card-water::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 50% at 80% 10%, rgba(90,154,186,0.09) 0%, transparent 55%); pointer-events: none; z-index: 0; }

    .card-moss { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 20px var(--moss-glow), 0 0 40px rgba(74,122,90,0.04); }
    .card-moss:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 0 32px var(--moss-glow), 0 0 64px rgba(74,122,90,0.08); }
    .card-moss::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 70% at 20% 80%, rgba(74,122,90,0.09) 0%, transparent 55%); pointer-events: none; z-index: 0; }

    .card-lotus { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 20px var(--lotus-glow), 0 0 40px rgba(192,88,120,0.04); }
    .card-lotus:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 0 32px var(--lotus-glow), 0 0 64px rgba(192,88,120,0.06); }
    .card-lotus::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 50% at 75% 15%, rgba(192,88,120,0.08) 0%, transparent 55%); pointer-events: none; z-index: 0; }

    .card-gold { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 20px var(--gold-glow), 0 0 40px rgba(160,120,48,0.04); }
    .card-gold:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 0 32px var(--gold-glow), 0 0 64px rgba(160,120,48,0.08); }
    .card-gold::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 50% at 50% 10%, rgba(160,120,48,0.09) 0%, transparent 55%); pointer-events: none; z-index: 0; }

    /* card inner content sits above pseudo elements */
    .card-body-inner { position: relative; z-index: 1; padding: 26px; }

    /* card typography */
    .card-eyebrow {
      font-size: 9px; letter-spacing: 0.28em;
      text-transform: uppercase; font-weight: 500;
      margin-bottom: 10px;
    }
    .ey-water { color: var(--water); }
    .ey-moss  { color: var(--moss); }
    .ey-lotus { color: var(--lotus); }
    .ey-gold  { color: var(--gold); }
    .ey-stone { color: var(--ink-ghost); }

    .card-title {
      font-family: var(--font-display);
      font-size: 24px; font-style: italic;
      color: var(--ink); line-height: 1.2;
      margin-bottom: 10px;
    }
    .card-title-sm {
      font-family: var(--font-display);
      font-size: 19px; font-style: italic;
      color: var(--ink); line-height: 1.3;
      margin-bottom: 8px;
    }
    .card-text {
      font-size: 12.5px; color: var(--ink-soft);
      line-height: 1.7; font-weight: 300;
    }

    /* ── INSCRIPTION ── */
    .inscription {
      margin: 32px 0; padding: 24px 32px;
      background: rgba(255,255,255,0.5);
      border-radius: 10px;
      border: 1px solid rgba(200,190,170,0.35);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
      position: relative;
    }
    .inscription::before {
      content: '';
      position: absolute; top: 0; bottom: 0; left: 0;
      width: 2px; border-radius: 2px;
      background: linear-gradient(to bottom,
        transparent, rgba(90,154,186,0.4), transparent);
    }
    .inscription-text {
      font-family: var(--font-display);
      font-size: 19px; font-style: italic;
      color: var(--ink-soft); line-height: 1.7;
    }

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: rgba(160,150,130,0.25);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(160,150,130,0.45);
    }

    /* ══════════════════════════════════
       RESPONSIVE BREAKPOINTS
    ══════════════════════════════════ */

    /* ── DESKTOP (1024px+) — default above ── */
    /* sidebar visible, top bar tabs visible */

    /* ── TABLET (768–1023px) ── */
    @media (max-width: 1023px) {
      /* hide sidebar */
      .sidebar { display: none; }

      /* content takes full width */
      .screen-content { padding: 32px 24px 80px; }

      /* top bar tabs stay — they become the nav */
      .top-bar-tabs { gap: 0; }
      .top-tab { padding: 6px 12px; font-size: 12px; }

      /* hide profile name — just show gem */
      .profile-nm { display: none; }
      .profile-chip { padding: 4px; }
    }

    /* ── MOBILE (< 768px) ── */
    @media (max-width: 767px) {
      /* hide entire top bar — native mobile nav handles navigation */
      .top-bar { display: none; }
      .sidebar { display: none; }

      /* remove top padding — no top bar */
      .web-body { padding-top: 0; }
      .screen-content { padding: 20px 16px 100px; }

      /* smaller greeting */
      .greeting-main { font-size: 32px; }
    }
  `

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
```

---

## How Each Screen Uses the Shell

The shell handles the top bar and sidebar. Each screen just renders its content.

```tsx
// app/(tabs)/community.web.tsx
import React from 'react'
import { useCommunityFeed } from '@repo/community/hooks/useCommunityFeed'
// import existing RN components — they still work inside the web frame
import { PostCard } from '@repo/community/components/PostCard'

export default function CommunityWeb() {
  const { posts, loading } = useCommunityFeed()

  return (
    <div className="sanctuary-screen">

      {/* greeting */}
      <div className="greeting">
        <div className="greeting-time">Architect's Stream</div>
        <div className="greeting-main">The Heart</div>
        <div className="greeting-note">Ecosystem Resonance</div>
      </div>

      {/* three column layout — community specific */}
      <div className="community-grid">

        <aside className="community-sidebar">
          {/* stream navigation */}
        </aside>

        <div className="community-feed">
          {posts.map(post => (
            // existing RN component reused here
            // it renders through RN web shim but inside a proper layout
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="community-panel">
          {/* online presence, top resonator */}
        </div>

      </div>
    </div>
  )
}
```

Add community-specific CSS to SanctuaryGlobalStyles:

```css
/* community layout */
.community-grid {
  display: grid;
  grid-template-columns: 200px 1fr 240px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1023px) {
  .community-grid {
    grid-template-columns: 1fr;
  }
  .community-sidebar,
  .community-panel { display: none; }
}
```

---

## Coherence — Why Top Bar and Sidebar Feel Like One Thing

The problem before: top bar and sidebar were designed separately, with different
backgrounds, different spacing, different logic. They felt like two pieces
put next to each other.

The fix is simple — **they share the same visual material**:

```css
/* both use the same backdrop */
.top-bar,
.sidebar {
  background: rgba(240,248,252,0.78);
  backdrop-filter: blur(24px) saturate(1.5);
}

/* sidebar continues the top bar's border */
.top-bar    { border-bottom: 1px solid rgba(180,200,220,0.35); }
.sidebar    { border-right:  1px solid rgba(180,200,220,0.25); }

/* active state is the same colour in both */
.top-tab.active,
.sidebar-item.active {
  color: var(--water);
  background: rgba(255,255,255,0.82);
}
```

They read as one continuous chrome — the frame of the sanctuary.
The content area is the world. The frame is what holds you in it.

---

## Quick Implementation Order

Do these in order — each one builds on the last.

```
1. SanctuaryGlobalStyles.tsx    ← extend with all CSS above
2. _layout.web.tsx              ← the shell with top bar + sidebar
3. index.web.tsx                ← Self screen (simplest)
4. community.web.tsx            ← Community (most complex, do second)
5. library.web.tsx              ← Library
6. profile.web.tsx              ← Profile
7. classroom.web.tsx            ← Classroom (mostly empty state)
```

Test after each one. The shell (step 2) is the most important —
once that works correctly, every screen just slots into it.

---

## The Single Rule

> The shell (top bar + sidebar) is the frame.
> The screen is the world inside the frame.
> Existing components live in the world unchanged.
> Only the frame is new.
```
